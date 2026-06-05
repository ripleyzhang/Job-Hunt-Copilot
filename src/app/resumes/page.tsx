"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  createResume,
  deleteResume,
  fetchResumes,
  updateResume,
} from "./api";
import { ResumeEmptyState } from "./components/ResumeEmptyState";
import { ResumeList } from "./components/ResumeList";
import {
  moveItem,
  newBullet,
  newEducation,
  newProject,
  newSkillTag,
  newWorkExperience,
  reconcileSkillTags,
  ResumeEditor,
} from "./[id]/edit/components/ResumeEditor";
import { ResumePreview } from "./[id]/edit/components/ResumePreview";
import { ResumeActions } from "./[id]/edit/components/ResumeActions";
import { toForm, validateResume } from "./[id]/edit/validation";
import type {
  EducationItem,
  ProjectItem,
  Resume,
  ResumeContacts,
  ResumeForm,
  ResumeMode,
  WorkExperienceItem,
} from "./types";

const EMPTY_FORM: ResumeForm = {
  title: "Untitled Resume",
  templateId: "US",
  contacts: {
    website: "",
    phone: "",
    email: "",
  },
  skills: [],
  education: [],
  workExperiences: [],
  projects: [],
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [mode, setMode] = useState<ResumeMode>("empty");
  const [form, setForm] = useState<ResumeForm>(EMPTY_FORM);
  const [newSkill, setNewSkill] = useState("");
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const draggedProjectIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadResumes() {
      try {
        const loadedResumes = await fetchResumes();

        if (isCurrent) {
          setResumes(loadedResumes);

          if (loadedResumes[0]) {
            setSelectedResumeId(loadedResumes[0].id);
            setForm(toForm(loadedResumes[0]));
            setMode("preview");
          } else {
            setMode("empty");
          }
        }
      } catch {
        if (isCurrent) {
          setError("Could not load resumes from the backend.");
          setMode("empty");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadResumes();

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === selectedResumeId),
    [resumes, selectedResumeId],
  );

  function handleSelectResume(resume: Resume) {
    setSelectedResumeId(resume.id);
    setForm(toForm(resume));
    setMode("preview");
    setError("");
  }

  function handleCreateResume() {
    setSelectedResumeId(null);
    setForm({
      ...EMPTY_FORM,
      title: nextResumeTitle(resumes.length + 1),
    });
    setNewSkill("");
    setError("");
    setMode("edit");
  }

  function handleEdit() {
    if (selectedResume) {
      setForm(toForm(selectedResume));
    }

    setError("");
    setMode("edit");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateResume(form);

    if (!validation.payload) {
      setError(validation.errors.join(" "));
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedResume = selectedResumeId
        ? await updateResume(selectedResumeId, validation.payload)
        : await createResume(validation.payload);

      setResumes((currentResumes) => {
        const exists = currentResumes.some((resume) => resume.id === savedResume.id);

        if (!exists) {
          return [savedResume, ...currentResumes];
        }

        return currentResumes.map((resume) =>
          resume.id === savedResume.id ? savedResume : resume,
        );
      });
      setSelectedResumeId(savedResume.id);
      setForm(toForm(savedResume));
      setMode("preview");
    } catch {
      setError("Could not save resume.");
      setMode("edit");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedResumeId) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await deleteResume(selectedResumeId);
      setResumes((currentResumes) =>
        currentResumes.filter((resume) => resume.id !== selectedResumeId),
      );
      setSelectedResumeId(null);
      setForm(EMPTY_FORM);
      setNewSkill("");
      setMode("empty");
    } catch {
      setError("Could not delete resume.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(
    field: keyof Pick<ResumeForm, "title" | "templateId">,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function updateContacts(field: keyof ResumeContacts, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      contacts: {
        ...currentForm.contacts,
        [field]: value,
      },
    }));
  }

  function addSkill() {
    const label = newSkill.trim();

    if (!label) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      skills: [...currentForm.skills, newSkillTag(label)],
    }));
    setNewSkill("");
  }

  function removeSkill(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      skills: currentForm.skills.filter((skill) => skill.id !== id),
    }));
  }

  function addEducation() {
    setForm((currentForm) => ({
      ...currentForm,
      education: [...currentForm.education, newEducation()],
    }));
  }

  function updateEducation(id: string, field: keyof EducationItem, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      education: currentForm.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeEducation(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      education: currentForm.education.filter((item) => item.id !== id),
    }));
  }

  function addWorkExperience() {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: [...currentForm.workExperiences, newWorkExperience()],
    }));
  }

  function updateWorkExperience(
    id: string,
    field: keyof Omit<WorkExperienceItem, "id" | "skills" | "bullets">,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: currentForm.workExperiences.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function updateWorkExperienceSkills(id: string, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: currentForm.workExperiences.map((item) =>
        item.id === id
          ? { ...item, skills: reconcileSkillTags(item.skills, value) }
          : item,
      ),
    }));
  }

  function removeWorkExperience(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      workExperiences: currentForm.workExperiences.filter((item) => item.id !== id),
    }));
  }

  function addProject() {
    setForm((currentForm) => ({
      ...currentForm,
      projects: [...currentForm.projects, newProject()],
    }));
  }

  function updateProject(
    id: string,
    field: keyof Omit<ProjectItem, "id" | "skills" | "bullets">,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      projects: currentForm.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function updateProjectSkills(id: string, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      projects: currentForm.projects.map((item) =>
        item.id === id
          ? { ...item, skills: reconcileSkillTags(item.skills, value) }
          : item,
      ),
    }));
  }

  function removeProject(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      projects: currentForm.projects.filter((item) => item.id !== id),
    }));
  }

  function moveProject(targetProjectId: string) {
    const activeProjectId = draggedProjectIdRef.current || draggedProjectId;

    if (!activeProjectId || activeProjectId === targetProjectId) {
      return;
    }

    setForm((currentForm) => ({
      ...currentForm,
      projects: moveItem(
        currentForm.projects,
        activeProjectId,
        targetProjectId,
      ),
    }));
  }

  function addBullet(section: "workExperiences" | "projects", itemId: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [section]: currentForm[section].map((item) =>
        item.id === itemId
          ? { ...item, bullets: [...item.bullets, newBullet()] }
          : item,
      ),
    }));
  }

  function updateBullet(
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
    text: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [section]: currentForm[section].map((item) =>
        item.id === itemId
          ? {
              ...item,
              bullets: item.bullets.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet,
              ),
            }
          : item,
      ),
    }));
  }

  function removeBullet(
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [section]: currentForm[section].map((item) =>
        item.id === itemId
          ? {
              ...item,
              bullets: item.bullets.filter((bullet) => bullet.id !== bulletId),
            }
          : item,
      ),
    }));
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-8">
        <header className="no-print flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-widest text-teal-700">
            Internship Copilot
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Resume Builder
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Validate, save, preview, edit, delete, and export manual resume
            content.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <ResumeList
            isLoading={isLoading}
            onCreate={handleCreateResume}
            onSelect={handleSelectResume}
            resumes={resumes}
            selectedResumeId={selectedResumeId}
          />

          <section className="grid gap-5">
            {error && (
              <div className="no-print rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {mode === "empty" && (
              <ResumeEmptyState onCreate={handleCreateResume} />
            )}

            {mode === "edit" && (
              <form className="grid gap-5" onSubmit={handleSave}>
                <ResumeEditor
                  addBullet={addBullet}
                  addEducation={addEducation}
                  addProject={addProject}
                  addSkill={addSkill}
                  addWorkExperience={addWorkExperience}
                  draggedProjectId={draggedProjectId}
                  form={form}
                  moveProject={moveProject}
                  newSkill={newSkill}
                  removeBullet={removeBullet}
                  removeEducation={removeEducation}
                  removeProject={removeProject}
                  removeSkill={removeSkill}
                  removeWorkExperience={removeWorkExperience}
                  setDraggedProjectId={(id) => {
                    draggedProjectIdRef.current = id;
                    setDraggedProjectId(id);
                  }}
                  setNewSkill={setNewSkill}
                  updateBullet={updateBullet}
                  updateContacts={updateContacts}
                  updateEducation={updateEducation}
                  updateField={updateField}
                  updateProject={updateProject}
                  updateProjectSkills={updateProjectSkills}
                  updateWorkExperience={updateWorkExperience}
                  updateWorkExperienceSkills={updateWorkExperienceSkills}
                />

                <div className="sticky bottom-4 flex justify-end">
                  <button
                    className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    disabled={isSaving}
                    type="submit"
                  >
                    {isSaving ? "Saving..." : "Save Resume"}
                  </button>
                </div>
              </form>
            )}

            {mode === "preview" && selectedResume && (
              <div className="grid gap-5">
                <ResumeActions
                  isDeleting={isSaving}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
                <ResumePreview resume={selectedResume} />
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function nextResumeTitle(count: number) {
  return `Resume ${count}`;
}
