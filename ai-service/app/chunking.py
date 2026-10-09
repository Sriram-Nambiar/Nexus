
import re
from typing import Any


def normalize_text(text: str) -> str:
    """Clean unnecessary whitespace without removing meaningful text."""
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(
    text: str,
    resource_id: str,
    course_id: str,
    resource_title: str,
    page: int,
    chunk_size: int = 800,
    overlap: int = 120,
) -> list[dict[str, Any]]:
    """Split one page of text into overlapping, traceable chunks."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and smaller than chunk_size")

    text = normalize_text(text)

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # Prefer ending at a word boundary.
        if end < len(text):
            boundary = text.rfind(" ", start, end)
            if boundary > start:
                end = boundary

        content = text[start:end].strip()

        if content:
            chunks.append({
                "resource_id": resource_id,
                "course_id": course_id,
                "resource_title": resource_title,
                "page": page,
                "chunk_index": len(chunks),
                "text": content,
            })

        if end >= len(text):
            break

        # Move forward while retaining some context from the previous chunk.
        start = max(start + 1, end - overlap)

    return chunks
