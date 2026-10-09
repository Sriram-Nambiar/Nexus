
import os
import tempfile
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.config import MAX_UPLOAD_SIZE_MB
from app.database import index_chunks
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


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    course_id: str | None = None
    resource_id: str | None = None
    history: list[dict] = Field(default_factory=list)


class StudyPlanRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=1000)
    title: str | None = None
    course_id: str | None = None
    duration_weeks: int = Field(default=4, ge=1, le=52)
    preferences: str | None = None
    save: bool = False


@app.get("/")
def root():
    return {
        "service": "NEXUS AI",
        "message": "AI service is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
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
def ask(request: AskRequest):
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
    else:
        excerpts = []
        for chunk in chunks[:3]:
            text = chunk.get("text", "").strip()
            title = chunk.get("resource_title") or "Untitled resource"
            page = chunk.get("page")
            location = f", page {page}" if page is not None else ""
            if text:
                excerpts.append(f"{title}{location}:\n{text[:1200]}")

        answer = (
            "I found the following relevant material in your indexed notes. "
            "This is a retrieval-based response, not a generated explanation:\n\n"
            + "\n\n".join(excerpts)
        )

    return {
        "answer": answer,
        "sources": sources,
        "suggested_questions": [],
        "metadata": {
            "mode": "retrieval_only",
            "chunks_found": len(chunks),
            "model_connected": False,
        },
    }


@app.post("/study-plan")
def study_plan(request: StudyPlanRequest):
    topics = [
        {
            "week": week,
            "title": f"Week {week}: Learn and practise",
            "tasks": [
                "Review relevant course notes",
                "Write a short summary of key concepts",
                "Solve practice questions",
                "Review mistakes and revise",
            ],
        }
        for week in range(1, request.duration_weeks + 1)
    ]

    return {
        "title": request.title or "Personalised Study Plan",
        "goal": request.goal,
        "plan": {
            "duration_weeks": request.duration_weeks,
            "weeks": topics,
            "preferences": request.preferences,
        },
        "estimated_hours_per_week": 5,
        "topics": [
            f"Week {week}: Learn and practise"
            for week in range(1, request.duration_weeks + 1)
        ],
    }
