
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from app.chunking import chunk_text, normalize_text


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


def extract_pages(file_path: str | Path) -> list[dict[str, Any]]:
    """
    Extract text while preserving page numbers.

    PDFs return one entry per page.
    TXT and Markdown files are treated as a single page.
    """
    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path.name}")

    if path.stat().st_size > MAX_FILE_SIZE_BYTES:
        raise ValueError("File exceeds the 25 MB size limit")

    extension = path.suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {extension}")

    if extension == ".pdf":
        reader = PdfReader(str(path))

        if reader.is_encrypted:
            raise ValueError("Encrypted PDFs are not supported")

        pages = []

        for page_number, page in enumerate(reader.pages, start=1):
            extracted = normalize_text(page.extract_text() or "")
            pages.append({
                "page": page_number,
                "text": extracted,
            })

        if not any(page["text"] for page in pages):
            raise ValueError(
                "This PDF contains no extractable text. "
                "It may be scanned and require OCR."
            )

        return pages

    text = path.read_text(encoding="utf-8-sig")
    text = normalize_text(text)

    if not text:
        raise ValueError("The document contains no readable text")

    return [{"page": 1, "text": text}]


def ingest_document(
    file_path: str | Path,
    resource_id: str,
    course_id: str,
    resource_title: str,
    chunk_size: int = 800,
    overlap: int = 120,
) -> list[dict[str, Any]]:
    """Extract a document and create page-aware searchable chunks."""
    pages = extract_pages(file_path)
    all_chunks = []

    for page_data in pages:
        page_chunks = chunk_text(
            text=page_data["text"],
            resource_id=resource_id,
            course_id=course_id,
            resource_title=resource_title,
            page=page_data["page"],
            chunk_size=chunk_size,
            overlap=overlap,
        )

        all_chunks.extend(page_chunks)

    return all_chunks
