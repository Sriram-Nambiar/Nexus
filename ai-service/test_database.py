
import tempfile
from pathlib import Path

import pytest

from app.database import index_chunks, search_chunks, delete_resource


def make_chunk(resource_id, course_id, title, text, page=1):
    return {
        "resource_id": resource_id,
        "course_id": course_id,
        "resource_title": title,
        "page": page,
        "chunk_index": 0,
        "text": text,
    }


@pytest.fixture
def db_path():
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir) / "test.db"


def test_index_search_and_page_metadata(db_path):
    chunk = make_chunk(
        "r1", "os", "Operating Systems",
        "A process is a program in execution.", 3
    )

    assert index_chunks([chunk], "r1", db_path) == 1

    results = search_chunks("process execution", db_path=db_path)

    assert len(results) == 1
    assert results[0]["resource_id"] == "r1"
    assert results[0]["course_id"] == "os"
    assert results[0]["page"] == 3


def test_reindexing_does_not_duplicate_chunks(db_path):
    first = make_chunk("r1", "os", "OS", "Processes and threads.")
    updated = make_chunk("r1", "os", "OS", "Processes and memory.")

    index_chunks([first], "r1", db_path)
    index_chunks([updated], "r1", db_path)

    assert search_chunks("threads", db_path=db_path) == []
    assert len(search_chunks("memory", db_path=db_path)) == 1


def test_course_filter(db_path):
    os_chunk = make_chunk("r1", "os", "OS", "Processes and execution.")
    java_chunk = make_chunk("r2", "java", "Java", "Classes and objects.")

    index_chunks([os_chunk], "r1", db_path)
    index_chunks([java_chunk], "r2", db_path)

    assert search_chunks("classes objects", course_id="os", db_path=db_path) == []
    assert len(search_chunks("classes objects", course_id="java", db_path=db_path)) == 1


def test_delete_resource(db_path):
    chunk = make_chunk("r1", "os", "OS", "Processes and execution.")
    index_chunks([chunk], "r1", db_path)

    assert delete_resource("r1", db_path) == 1
    assert search_chunks("processes execution", db_path=db_path) == []


def test_invalid_search_limit_is_rejected(db_path):
    with pytest.raises(ValueError):
        search_chunks("processes", limit=0, db_path=db_path)
