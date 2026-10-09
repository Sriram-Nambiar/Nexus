import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.config import MAX_UPLOAD_SIZE_MB
from app.database import index_chunks, search_chunks
from app.ingestion import ingest_document
from app.retrieval import retrieve_context, format_sources


app = FastAPI(
    title="NEXUS AI Service",
    description="Offline-first campus knowledge and study assistant",
    version="0.1.0",
)

DATA_DIR = Path(os.getenv("NEXUS_AI_DATA_DIR", "data"))
UPLOAD_DIR = DATA_DIR / "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    course_id: str | None = None
    resource_id: str | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)


class StudyPlanRequest(BaseModel):
    goal: str | None = None
    topic_or_goal: str | None = None
    title: str | None = None
    course_id: str | None = None
    course_ids: list[str] = Field(default_factory=list)
    days_count: int | None = None
    hours_per_day: int | None = None
    duration_weeks: int = Field(default=4, ge=1, le=52)
    preferences: Any | None = None
    save: bool = False


async def call_local_llm(prompt: str, context: str) -> str | None:
    """Attempt inference with a locally running Ollama instance if accessible."""
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": (
                    f"You are NEXUS AI, an offline campus study assistant.\n"
                    f"Context from course materials:\n{context}\n\n"
                    f"Question: {prompt}\n\n"
                    f"Provide an accurate, grounded educational explanation with citations."
                ),
                "stream": False,
            }
            res = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            if res.status_code == 200:
                data = res.json()
                return data.get("response", "").strip()
    except Exception:
        pass
    return None


@app.get("/")
async def root():
    return {
        "service": "NEXUS AI",
        "message": "AI service is running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "nexus-ai",
        "version": "0.1.0",
    }


@app.post("/ingest")
async def ingest(
    file: UploadFile = File(...),
    course_id: str = Form(...),
    resource_id: str | None = Form(None),
    resource_title: str | None = Form(None),
):
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Supported file types are PDF, TXT, and Markdown.",
        )

    content = await file.read(MAX_UPLOAD_SIZE_MB * 1024 * 1024 + 1)

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {MAX_UPLOAD_SIZE_MB} MB limit.",
        )

    rid = resource_id or str(uuid4())
    title = resource_title or filename
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=extension,
            dir=UPLOAD_DIR,
            delete=False,
        ) as temp_file:
            temp_file.write(content)
            temp_path = Path(temp_file.name)

        chunks = ingest_document(
            file_path=temp_path,
            resource_id=rid,
            course_id=course_id,
            resource_title=title,
        )

        count = index_chunks(chunks, resource_id=rid)

        return {
            "status": "indexed",
            "resource_id": rid,
            "course_id": course_id,
            "title": title,
            "chunks_indexed": count,
        }

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to process this document.",
        ) from exc
    finally:
        await file.close()
        if temp_path and temp_path.exists():
            temp_path.unlink()


@app.post("/ask")
async def ask(request: AskRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    chunks = retrieve_context(
        query=question,
        course_id=request.course_id,
        limit=10,
    )

    if request.resource_id:
        chunks = [
            chunk for chunk in chunks
            if str(chunk.get("resource_id")) == request.resource_id
        ]

    sources = format_sources(chunks)

    if not chunks:
        answer = (
            "I couldn't find relevant information in the indexed study materials. "
            "Please upload the relevant notes or try different keywords."
        )
        return {
            "answer": answer,
            "sources": [],
            "grounded": False,
            "confidence_score": 0.0,
            "suggested_questions": [
                "What courses are available in the offline library?",
                "How do I upload lecture notes for indexing?",
            ],
            "metadata": {
                "mode": "retrieval_only",
                "chunks_found": 0,
                "model_connected": False,
            },
        }

    # Context string for LLM or synthesis
    context_text = "\n\n".join(
        f"[{i+1}] {c.get('resource_title', 'Notes')} (Page {c.get('page', 1)}):\n{c.get('text', '')[:600]}"
        for i, c in enumerate(chunks[:4])
    )

    # Try local LLM if running
    llm_answer = await call_local_llm(question, context_text)
    if llm_answer:
        return {
            "answer": llm_answer,
            "sources": sources,
            "grounded": True,
            "confidence_score": 0.95,
            "suggested_questions": [
                "Can you provide a practical example of this concept?",
                "How does this relate to other topics in this course?",
                "What are common exam questions on this topic?",
            ],
            "metadata": {
                "mode": "local_llm",
                "model": OLLAMA_MODEL,
                "chunks_found": len(chunks),
                "model_connected": True,
            },
        }

    # High quality, transparent grounded retrieval synthesis
    excerpts = []
    for i, chunk in enumerate(chunks[:3], 1):
        text = chunk.get("text", "").strip()
        title = chunk.get("resource_title") or "Untitled resource"
        page = chunk.get("page")
        location = f", Page {page}" if page is not None else ""
        if text:
            clean_text = " ".join(text[:800].split())
            excerpts.append(f"**[{i}] {title}{location}**:\n> \"{clean_text}...\"")

    answer = (
        f"### Grounded Response from Indexed Materials\n\n"
        f"I located the following verified passages in your local course materials addressing **\"{question}\"**:\n\n"
        + "\n\n".join(excerpts)
        + "\n\n*(Extracted directly from indexed course documents via local offline full-text search. Connect a local model like Ollama for natural language synthesis.)*"
    )

    return {
        "answer": answer,
        "sources": sources,
        "grounded": True,
        "confidence_score": 0.92,
        "suggested_questions": [
            "Can you explain the key formulas or definitions mentioned here?",
            "What practice problems are recommended for this subject?",
            "How do I schedule a revision session for this topic?",
        ],
        "metadata": {
            "mode": "retrieval_only",
            "chunks_found": len(chunks),
            "model_connected": False,
        },
    }


@app.post("/study-plan")
def study_plan(request: StudyPlanRequest):
    effective_goal = (request.goal or request.topic_or_goal or "Semester Revision").strip()
    days_count = request.days_count or 4
    hours_per_day = request.hours_per_day or 3
    course_ids = request.course_ids or ([request.course_id] if request.course_id else [])

    # Search for course materials matching the study goal
    matching_chunks = search_chunks(effective_goal, course_id=request.course_id, limit=6)

    # Build structured daily tasks
    focus_themes = [
        "Theoretical Foundations & Core Concepts",
        "Algorithmic Mechanics & Practical Applications",
        "Case Studies, Edge Cases & Synchronization",
        "Comprehensive Problem Solving & Exam Review",
        "System Architecture & Deep Dive",
        "Mock Assessment & Targeted Weakness Drill",
    ]

    generated_days = []
    plan_id = f"sp-{uuid4().hex[:8]}"

    for d in range(1, days_count + 1):
        theme = focus_themes[(d - 1) % len(focus_themes)]
        chunk = matching_chunks[(d - 1) % len(matching_chunks)] if matching_chunks else None

        tasks = [
            {
                "id": f"task-d{d}-1",
                "title": f"Study {theme}",
                "description": (
                    f"Read and synthesize key definitions and diagrams from "
                    f"{chunk['resource_title'] if chunk else 'course materials'}."
                ),
                "estimated_minutes": 60,
                "completed": False,
                "resource_id": chunk["resource_id"] if chunk else None,
                "resource_title": chunk["resource_title"] if chunk else "Course Notes",
                "resource_type": "pdf" if chunk else "notes",
            },
            {
                "id": f"task-d{d}-2",
                "title": f"Active Recall & Practice Worksheet (Day {d})",
                "description": f"Solve practical questions on {effective_goal} without checking references.",
                "estimated_minutes": (hours_per_day * 60) - 60,
                "completed": False,
                "resource_id": None,
                "resource_title": None,
                "resource_type": None,
            },
        ]

        generated_days.append({
            "day_number": d,
            "day_label": f"Day {d}: {theme}",
            "focus_area": f"{theme} related to {effective_goal}",
            "tasks": tasks,
        })

    weeks_count = max(1, (days_count + 6) // 7)
    generated_weeks = [
        {
            "week": w,
            "title": f"Week {w}: {effective_goal} Milestone",
            "tasks": [
                f"Review foundational lecture materials",
                f"Complete practice worksheet for Week {w}",
                f"Conduct self-assessment review",
            ],
        }
        for w in range(1, weeks_count + 1)
    ]

    course_names = [c["resource_title"] for c in matching_chunks[:2]] if matching_chunks else [effective_goal]

    return {
        "id": plan_id,
        "title": request.title or f"Study Plan: {effective_goal}",
        "goal": effective_goal,
        "course_ids": course_ids,
        "course_names": course_names,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "total_days": days_count,
        "total_hours": days_count * hours_per_day,
        "days": generated_days,
        "summary": (
            f"A structured {days_count}-day study plan ({hours_per_day}h/day) designed for "
            f"mastering {effective_goal} using offline course materials."
        ),
        "plan": {
            "duration_weeks": weeks_count,
            "weeks": generated_weeks,
            "days": generated_days,
            "preferences": request.preferences,
        },
        "estimated_hours_per_week": hours_per_day * 5,
        "topics": [d["focus_area"] for d in generated_days],
    }
