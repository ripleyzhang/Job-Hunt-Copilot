from datetime import date
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .models import ApplicationStatus, ResumeTemplate


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


class ResumeContacts(BaseModel):
    website: str = ""
    phone: str = ""
    email: str = ""


class SkillTag(BaseModel):
    id: str
    label: str


class BulletPoint(BaseModel):
    id: str
    text: str


class EducationItem(BaseModel):
    id: str
    school_name: str = Field(default="", alias="schoolName")
    start_date: str = Field(default="", alias="startDate")
    end_date: str = Field(default="", alias="endDate")
    degree: str = ""
    diploma: str = ""

    model_config = ConfigDict(populate_by_name=True)


class WorkExperienceItem(BaseModel):
    id: str
    company: str = ""
    role: str = ""
    start_date: str = Field(default="", alias="startDate")
    end_date: str = Field(default="", alias="endDate")
    skills: list[SkillTag] = Field(default_factory=list)
    bullets: list[BulletPoint] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class ProjectItem(BaseModel):
    id: str
    project_name: str = Field(default="", alias="projectName")
    start_date: str = Field(default="", alias="startDate")
    end_date: str = Field(default="", alias="endDate")
    skills: list[SkillTag] = Field(default_factory=list)
    bullets: list[BulletPoint] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class ResumeBase(BaseModel):
    title: str
    template_id: ResumeTemplate = Field(default=ResumeTemplate.US, alias="templateId")
    contacts: ResumeContacts = Field(default_factory=ResumeContacts)
    skills: list[SkillTag] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    work_experiences: list[WorkExperienceItem] = Field(
        default_factory=list, alias="workExperiences"
    )
    projects: list[ProjectItem] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(ResumeBase):
    pass


class ResumeRead(ResumeBase):
    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)
