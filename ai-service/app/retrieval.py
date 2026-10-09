
from typing import Any

from app.database import search_chunks


def retrieve_context(
    query: str,
    course_id: str | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Retrieve relevant indexed chunks for a question."""
    query = query.strip()

    if not query:
        return []

    return search_chunks(
        query=query,
        course_id=course_id,
        limit=limit,
    )


def build_context(
    chunks: list[dict[str, Any]],
) -> str:
    """Format retrieved chunks into readable, attributed context."""
    if not chunks:
        return ""

    sections = []

    for chunk in chunks:
        title = chunk.get("resource_title") or "Untitled resource"
        resource_id = chunk.get("resource_id", "unknown")
        page = chunk.get("page")
        text = chunk.get("text", "").strip()

        if not text:
            continue

        location = f", page {page}" if page is not None else ""

        sections.append(
            f"Source: {title}{location}\n"
            f"Resource ID: {resource_id}\n"
            f"Content:\n{text}"
        )

    return "\n\n---\n\n".join(sections)


def format_sources(
    chunks: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Convert database results into the API's source format."""
    sources = []
    seen = set()

    for chunk in chunks:
        resource_id = str(chunk.get("resource_id", ""))
        course_id = str(chunk.get("course_id", ""))
        title = chunk.get("resource_title") or "Untitled resource"
        snippet = chunk.get("snippet") or chunk.get("text", "")[:240]

        key = (resource_id, chunk.get("page"))

        if key in seen:
            continue

        seen.add(key)

        sources.append(
            {
                "course_id": course_id,
                "resource_id": resource_id,
                "title": title,
                "snippet": snippet,
            }
        )

    return sources
