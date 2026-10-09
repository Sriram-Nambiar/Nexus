import io
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import index_chunks


@pytest.fixture
def client():
    return TestClient(app)


def test_root_endpoint(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["service"] == "NEXUS AI"


def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "nexus-ai"


def test_ask_empty_question(client):
    res = client.post("/ask", json={"question": "   "})
    assert res.status_code == 400


def test_ask_unindexed_topic(client):
    res = client.post("/ask", json={"question": "NonExistentTopicRandomString12345"})
    assert res.status_code == 200
    data = res.json()
    assert data["grounded"] is False
    assert len(data["sources"]) == 0
    assert "couldn't find" in data["answer"].lower()


def test_ingest_and_grounded_ask(client):
    text_content = (
        "Mutual Exclusion: at least one resource must be held in a non-shareable mode.\n"
        "Hold and Wait: a process must be holding at least one resource and waiting to acquire additional resources.\n"
        "No Preemption: resources cannot be preempted; a resource can be released only voluntarily.\n"
        "Circular Wait: a closed chain of processes exists such that each process holds at least one resource needed by the next."
    )

    file_bytes = io.BytesIO(text_content.encode("utf-8"))
    upload_res = client.post(
        "/ingest",
        data={
            "course_id": "cs-301",
            "resource_id": "res-deadlock-test",
            "resource_title": "Deadlock Conditions Notes",
        },
        files={"file": ("deadlocks.txt", file_bytes, "text/plain")},
    )
    assert upload_res.status_code == 200
    assert upload_res.json()["chunks_indexed"] > 0

    # Ask question that matches indexed content
    ask_res = client.post("/ask", json={"question": "What is Mutual Exclusion and Circular Wait?", "course_id": "cs-301"})
    assert ask_res.status_code == 200
    ask_data = ask_res.json()
    assert ask_data["grounded"] is True
    assert len(ask_data["sources"]) > 0
    assert ask_data["sources"][0]["resource_id"] == "res-deadlock-test"
    assert "Mutual Exclusion" in ask_data["answer"]


def test_study_plan_generation(client):
    res = client.post(
        "/study-plan",
        json={
            "goal": "Master Deadlocks and Concurrency",
            "days_count": 5,
            "hours_per_day": 2,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_days"] == 5
    assert data["total_hours"] == 10
    assert len(data["days"]) == 5
    assert len(data["days"][0]["tasks"]) >= 2
    assert "plan" in data
    assert "weeks" in data["plan"]
