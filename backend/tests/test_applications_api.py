from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def setup_function() -> None:
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_crud_applications() -> None:
    payload = {
        "company": "OpenAI",
        "roleTitle": "Software Engineering Intern",
        "jobDescription": "Build product features.",
        "applicationDate": "2026-06-01",
        "status": "Applied",
        "resumeVersion": "software-v1",
        "requiredTechStack": ["Python", "React"],
        "notes": "Applied through company website.",
    }

    create_response = client.post("/applications", json=payload)

    assert create_response.status_code == 201

    created_application = create_response.json()

    assert created_application["id"]
    assert created_application == {
        **payload,
        "id": created_application["id"],
    }

    application_id = created_application["id"]

    list_response = client.get("/applications")

    assert list_response.status_code == 200
    assert list_response.json() == [created_application]

    get_response = client.get(f"/applications/{application_id}")

    assert get_response.status_code == 200
    assert get_response.json() == created_application

    update_payload = {
        **payload,
        "company": "Anthropic",
        "roleTitle": "Backend Intern",
        "status": "Interview",
        "requiredTechStack": ["Python", "FastAPI", "PostgreSQL"],
    }

    update_response = client.put(f"/applications/{application_id}", json=update_payload)

    assert update_response.status_code == 200
    assert update_response.json()["company"] == "Anthropic"
    assert update_response.json()["roleTitle"] == "Backend Intern"
    assert update_response.json()["requiredTechStack"] == [
        "Python",
        "FastAPI",
        "PostgreSQL",
    ]

    delete_response = client.delete(f"/applications/{application_id}")

    assert delete_response.status_code == 204
    assert client.get(f"/applications/{application_id}").status_code == 404


def test_missing_application_returns_404() -> None:
    response = client.get("/applications/missing-id")

    assert response.status_code == 404
