from datetime import date
from enum import Enum
from typing import Optional
from uuid import uuid4

from sqlalchemy import Date, Enum as SqlEnum, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class ApplicationStatus(str, Enum):
    SAVED = "Saved"
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    application_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        SqlEnum(
            ApplicationStatus,
            values_callable=lambda statuses: [status.value for status in statuses],
        ),
        default=ApplicationStatus.SAVED,
        nullable=False,
    )
    resume_version: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    required_tech_stack: Mapped[list[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
