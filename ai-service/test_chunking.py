
import pytest

from app.chunking import chunk_text, normalize_text


def test_normalize_text():
    assert normalize_text("  hello   world \n\n\n test ") == (
        "hello world \n\n test"
    )


def test_chunking_preserves_metadata():
    text = " ".join(f"word{i}" for i in range(300))

    chunks = chunk_text(
        text=text,
        resource_id="resource-1",
        course_id="course-1",
        resource_title="Operating Systems Notes",
        page=3,
        chunk_size=200,
        overlap=30,
    )

    assert len(chunks) > 1
    assert all(chunk["page"] == 3 for chunk in chunks)
    assert all(chunk["resource_id"] == "resource-1" for chunk in chunks)
    assert all(chunk["course_id"] == "course-1" for chunk in chunks)
    assert all(chunk["resource_title"] == "Operating Systems Notes" for chunk in chunks)
    assert all(chunk["text"] for chunk in chunks)


def test_empty_text_returns_no_chunks():
    assert chunk_text("", "r1", "c1", "Notes", 1) == []
    assert chunk_text("   ", "r1", "c1", "Notes", 1) == []


def test_invalid_chunk_settings_are_rejected():
    with pytest.raises(ValueError):
        chunk_text("hello", "r1", "c1", "Notes", 1, chunk_size=0)

    with pytest.raises(ValueError):
        chunk_text("hello", "r1", "c1", "Notes", 1, chunk_size=10, overlap=10)
