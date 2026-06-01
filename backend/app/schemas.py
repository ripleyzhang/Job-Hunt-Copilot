from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .models import ApplicationStatus


class ApplicationBase(BaseModel):
    company: str
    role_title: str = Field(alias="roleTitle")
    job_description: str = Field(default="", alias="jobDescription")
    application_date: Optional[date] = Field(default=None, alias="applicationDate")
    status: ApplicationStatus = ApplicationStatus.SAVED
    resume_version: str = Field(default="", alias="resumeVersion")
    required_tech_stack: list[str] = Field(
        default_factory=list, alias="requiredTechStack"
    )
    notes: str = ""

    model_config = ConfigDict(populate_by_name=True)


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    id: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
