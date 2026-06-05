import type {
  Resume,
  ResumeForm,
  ResumePayload,
  ValidationResult,
} from "../../types";

const DATE_PATTERN = /^\d{4}\.(0[1-9]|1[0-2])$/;

export function validateResume(form: ResumeForm): ValidationResult {
  const errors: string[] = [];
  const payload = cleanResume(form);

  if (!payload.contacts.website) {
    errors.push("Personal website is required.");
  }

  if (!payload.contacts.phone) {
    errors.push("Phone is required.");
  }

  if (!payload.contacts.email) {
    errors.push("Email is required.");
  }

  if (payload.skills.length === 0) {
    errors.push("At least one skill is required.");
  }

  if (payload.education.length === 0) {
    errors.push("At least one education entry is required.");
  }

  payload.education.forEach((item, index) => {
    const label = `Education ${index + 1}`;

    if (!item.schoolName) errors.push(`${label}: school name is required.`);
    if (!item.startDate) errors.push(`${label}: start date is required.`);
    if (!item.endDate) errors.push(`${label}: end date is required.`);
    if (!item.degree) errors.push(`${label}: degree is required.`);
    if (!item.diploma) errors.push(`${label}: diploma is required.`);
    validateDateYYYYMM(`${label}: start date`, item.startDate, errors);
    validateDateYYYYMM(`${label}: end date`, item.endDate, errors);
  });

  payload.workExperiences.forEach((item, index) => {
    const label = `Work Experience ${index + 1}`;

    validateDateYYYYMM(`${label}: start date`, item.startDate, errors);
    validateDateYYYYMM(`${label}: end date`, item.endDate, errors);
  });

  payload.projects.forEach((item, index) => {
    const label = `Project ${index + 1}`;

    validateDateYYYYMM(`${label}: start date`, item.startDate, errors);
    validateDateYYYYMM(`${label}: end date`, item.endDate, errors);
  });

  return errors.length > 0 ? { errors } : { errors, payload };
}

export function validateDateYYYYMM(
  label: string,
  value: string,
  errors: string[],
) {
  if (!DATE_PATTERN.test(value)) {
    errors.push(`${label} must use YYYY.MM format.`);
  }
}

export function toForm(resume: Resume): ResumeForm {
  return {
    title: resume.title,
    templateId: resume.templateId,
    contacts: resume.contacts,
    skills: resume.skills,
    education: resume.education,
    workExperiences: resume.workExperiences,
    projects: resume.projects,
  };
}

export function cleanResume(form: ResumeForm): ResumePayload {
  return {
    ...form,
    title: form.title.trim() || "Untitled Resume",
    contacts: {
      website: form.contacts.website.trim(),
      phone: form.contacts.phone.trim(),
      email: form.contacts.email.trim(),
    },
    skills: form.skills
      .map((skill) => ({ ...skill, label: skill.label.trim() }))
      .filter((skill) => skill.label),
    education: form.education.map((item) => ({
      ...item,
      schoolName: item.schoolName.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
      degree: item.degree.trim(),
      diploma: item.diploma.trim(),
    })),
    workExperiences: form.workExperiences.map((item) => ({
      ...item,
      company: item.company.trim(),
      role: item.role.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
      skills: item.skills
        .map((skill) => ({ ...skill, label: skill.label.trim() }))
        .filter((skill) => skill.label),
      bullets: item.bullets
        .map((bullet) => ({ ...bullet, text: bullet.text.trim() }))
        .filter((bullet) => bullet.text),
    })),
    projects: form.projects.map((item) => ({
      ...item,
      projectName: item.projectName.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
      skills: item.skills
        .map((skill) => ({ ...skill, label: skill.label.trim() }))
        .filter((skill) => skill.label),
      bullets: item.bullets
        .map((bullet) => ({ ...bullet, text: bullet.text.trim() }))
        .filter((bullet) => bullet.text),
    })),
  };
}
