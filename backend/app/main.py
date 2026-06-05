from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Union

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Application, Resume
from .schemas import ApplicationCreate, ApplicationRead, ApplicationUpdate
from .schemas import ResumeCreate, ResumeRead, ResumeUpdate


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Internship Copilot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/applications", response_model=list[ApplicationRead])
def list_applications(db: Session = Depends(get_db)) -> list[Application]:
    return list(db.scalars(select(Application).order_by(Application.company)).all())


@app.get("/applications/{application_id}", response_model=ApplicationRead)
def get_application(application_id: str, db: Session = Depends(get_db)) -> Application:
    application = db.get(Application, application_id)

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    return application


@app.post(
    "/applications",
    response_model=ApplicationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    payload: ApplicationCreate, db: Session = Depends(get_db)
) -> Application:
    application = Application(**payload.model_dump())

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@app.put("/applications/{application_id}", response_model=ApplicationRead)
def update_application(
    application_id: str, payload: ApplicationUpdate, db: Session = Depends(get_db)
) -> Application:
    application = db.get(Application, application_id)

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in payload.model_dump().items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return application


@app.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: str, db: Session = Depends(get_db)) -> Response:
    application = db.get(Application, application_id)

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/resumes", response_model=list[ResumeRead])
def list_resumes(db: Session = Depends(get_db)) -> list[dict]:
    resumes = db.scalars(select(Resume).order_by(Resume.updated_at.desc())).all()

    return [serialize_resume(resume) for resume in resumes]


@app.get("/resumes/{resume_id}", response_model=ResumeRead)
def get_resume(resume_id: str, db: Session = Depends(get_db)) -> dict:
    resume = db.get(Resume, resume_id)

    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    return serialize_resume(resume)


@app.post("/resumes", response_model=ResumeRead, status_code=status.HTTP_201_CREATED)
def create_resume(payload: ResumeCreate, db: Session = Depends(get_db)) -> dict:
    resume = Resume(
        title=payload.title,
        template_id=payload.template_id,
        content=resume_content(payload),
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return serialize_resume(resume)


@app.put("/resumes/{resume_id}", response_model=ResumeRead)
def update_resume(
    resume_id: str, payload: ResumeUpdate, db: Session = Depends(get_db)
) -> dict:
    resume = db.get(Resume, resume_id)

    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.title = payload.title
    resume.template_id = payload.template_id
    resume.content = resume_content(payload)

    db.commit()
    db.refresh(resume)

    return serialize_resume(resume)


def resume_content(payload: Union[ResumeCreate, ResumeUpdate]) -> dict:
    return payload.model_dump(
        by_alias=True,
        exclude={"title", "template_id"},
    )


def serialize_resume(resume: Resume) -> dict:
    return {
        "id": resume.id,
        "title": resume.title,
        "templateId": resume.template_id.value,
        **resume.content,
        "createdAt": resume.created_at,
        "updatedAt": resume.updated_at,
    }
