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


def test_crud_resumes() -> None:
    payload = {
        "title": "Software Resume",
        "templateId": "US",
        "contacts": {
            "website": "https://example.com",
            "phone": "555-0100",
            "email": "student@example.com",
        },
        "skills": [{"id": "skill-1", "label": "Python"}],
        "education": [
            {
                "id": "edu-1",
                "schoolName": "Duke University",
                "startDate": "2024-08",
                "endDate": "2026-05",
                "degree": "MS",
                "diploma": "Computer Science",
            }
        ],
        "workExperiences": [
            {
                "id": "work-1",
                "company": "OpenAI",
                "role": "Engineering Intern",
                "startDate": "2026-06",
                "endDate": "2026-08",
                "skills": [{"id": "skill-2", "label": "FastAPI"}],
                "bullets": [{"id": "bullet-1", "text": "Built internal tools."}],
            }
        ],
        "projects": [
            {
                "id": "project-1",
                "projectName": "Internship Copilot",
                "startDate": "2026-01",
                "endDate": "2026-05",
                "skills": [{"id": "skill-3", "label": "React"}],
                "bullets": [{"id": "bullet-2", "text": "Designed tracker UI."}],
            }
        ],
    }

    create_response = client.post("/api/resumes", json=payload)

    assert create_response.status_code == 201

    created_resume = create_response.json()

    assert created_resume["id"]
    assert created_resume["createdAt"]
    assert created_resume["updatedAt"]
    assert created_resume | {
        "id": created_resume["id"],
        "createdAt": created_resume["createdAt"],
        "updatedAt": created_resume["updatedAt"],
    } == {
        **payload,
        "id": created_resume["id"],
        "createdAt": created_resume["createdAt"],
        "updatedAt": created_resume["updatedAt"],
    }

    resume_id = created_resume["id"]

    list_response = client.get("/api/resumes")

    assert list_response.status_code == 200
    assert list_response.json() == [created_resume]

    update_payload = {
        **payload,
        "title": "Backend Resume",
        "templateId": "China",
        "projects": [
            {
                "id": "project-1",
                "projectName": "Internship Copilot",
                "startDate": "2026-01",
                "endDate": "2026-05",
                "skills": [{"id": "skill-3", "label": "React"}],
                "bullets": [
                    {"id": "bullet-2", "text": "Designed tracker UI."},
                    {"id": "bullet-3", "text": "Added resume builder."},
                ],
            }
        ],
    }

    update_response = client.put(f"/api/resumes/{resume_id}", json=update_payload)

    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Backend Resume"
    assert update_response.json()["templateId"] == "China"
    assert update_response.json()["projects"][0]["bullets"][1] == {
        "id": "bullet-3",
        "text": "Added resume builder.",
    }

    delete_response = client.delete(f"/api/resumes/{resume_id}")

    assert delete_response.status_code == 204
    assert client.get(f"/api/resumes/{resume_id}").status_code == 404


def test_missing_resume_returns_404() -> None:
    response = client.get("/api/resumes/missing-id")

    assert response.status_code == 404
