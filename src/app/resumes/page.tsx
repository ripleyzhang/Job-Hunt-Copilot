"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, ReactNode } from "react";

import {
  createResume,
  deleteResume,
  listResumes,
  updateResume,
  type BulletPoint,
  type EducationItem,
  type ProjectItem,
  type Resume,
  type ResumeContacts,
  type ResumePayload,
  type ResumeTemplateId,
  type SkillTag,
  type WorkExperienceItem,
} from "@/lib/resumes-api";

type ResumeForm = ResumePayload;
type ResumeMode = "edit" | "preview" | "empty";
type ValidationResult = {
  errors: string[];
  payload?: ResumePayload;
};

const DATE_PATTERN = /^\d{4}\.(0[1-9]|1[0-2])$/;

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
        const loadedResumes = await listResumes();

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

  function updateField(field: keyof Pick<ResumeForm, "title" | "templateId">, value: string) {
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
          <aside className="no-print self-start rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Resumes</h2>
              <button
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={isSaving}
                onClick={handleCreateResume}
                type="button"
              >
                New
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {isLoading ? (
                <p className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-500">
                  Loading resumes...
                </p>
              ) : resumes.length === 0 ? (
                <p className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
                  No resumes yet.
                </p>
              ) : (
                resumes.map((resume) => (
                  <button
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      resume.id === selectedResumeId
                        ? "border-teal-700 bg-teal-50 text-teal-900"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                    }`}
                    key={resume.id}
                    onClick={() => handleSelectResume(resume)}
                    type="button"
                  >
                    <span className="block font-medium">{resume.title}</span>
                    <span className="text-xs text-zinc-500">{resume.templateId}</span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="grid gap-5">
            {error && (
              <div className="no-print rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {mode === "empty" && (
              <EmptyState onCreate={handleCreateResume} />
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
              <ResumePreviewShell
                isDeleting={isSaving}
                onDelete={handleDelete}
                onEdit={handleEdit}
                resume={selectedResume}
              />
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="no-print rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
      <p className="text-sm text-zinc-600">
        No resume selected or this resume has been deleted.
      </p>
      <button
        className="mt-4 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        onClick={onCreate}
        type="button"
      >
        Create New Resume
      </button>
    </div>
  );
}

function ResumeEditor({
  addBullet,
  addEducation,
  addProject,
  addSkill,
  addWorkExperience,
  draggedProjectId,
  form,
  moveProject,
  newSkill,
  removeBullet,
  removeEducation,
  removeProject,
  removeSkill,
  removeWorkExperience,
  setDraggedProjectId,
  setNewSkill,
  updateBullet,
  updateContacts,
  updateEducation,
  updateField,
  updateProject,
  updateProjectSkills,
  updateWorkExperience,
  updateWorkExperienceSkills,
}: {
  addBullet: (section: "workExperiences" | "projects", itemId: string) => void;
  addEducation: () => void;
  addProject: () => void;
  addSkill: () => void;
  addWorkExperience: () => void;
  draggedProjectId: string | null;
  form: ResumeForm;
  moveProject: (targetProjectId: string) => void;
  newSkill: string;
  removeBullet: (
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
  ) => void;
  removeEducation: (id: string) => void;
  removeProject: (id: string) => void;
  removeSkill: (id: string) => void;
  removeWorkExperience: (id: string) => void;
  setDraggedProjectId: (id: string | null) => void;
  setNewSkill: (skill: string) => void;
  updateBullet: (
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
    text: string,
  ) => void;
  updateContacts: (field: keyof ResumeContacts, value: string) => void;
  updateEducation: (id: string, field: keyof EducationItem, value: string) => void;
  updateField: (
    field: keyof Pick<ResumeForm, "title" | "templateId">,
    value: string,
  ) => void;
  updateProject: (
    id: string,
    field: keyof Omit<ProjectItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  updateProjectSkills: (id: string, value: string) => void;
  updateWorkExperience: (
    id: string,
    field: keyof Omit<WorkExperienceItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  updateWorkExperienceSkills: (id: string, value: string) => void;
}) {
  return (
    <>
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <Input
            label="Resume Title"
            onChange={(value) => updateField("title", value)}
            value={form.title}
          />
          <Select
            label="Template"
            onChange={(value) => updateField("templateId", value)}
            options={["US", "China"]}
            value={form.templateId}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Contacts" />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input
            label="Personal Website"
            onChange={(value) => updateContacts("website", value)}
            value={form.contacts.website}
          />
          <Input
            label="Phone"
            onChange={(value) => updateContacts("phone", value)}
            value={form.contacts.phone}
          />
          <Input
            label="Email"
            onChange={(value) => updateContacts("email", value)}
            type="email"
            value={form.contacts.email}
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Skills" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setNewSkill(event.target.value)}
            placeholder="Add a skill tag"
            value={newSkill}
          />
          <button
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            onClick={addSkill}
            type="button"
          >
            Add Skill
          </button>
        </div>
        <SkillList skills={form.skills} onRemove={removeSkill} />
      </section>

      <EditorSection isEmpty={form.education.length === 0} onAdd={addEducation} title="Education">
        {form.education.map((item) => (
          <div className="rounded-lg border border-zinc-200 p-4" key={item.id}>
            <EntryHeader onRemove={() => removeEducation(item.id)} />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="School Name"
                onChange={(value) => updateEducation(item.id, "schoolName", value)}
                value={item.schoolName}
              />
              <Input
                label="Degree"
                onChange={(value) => updateEducation(item.id, "degree", value)}
                value={item.degree}
              />
              <Input
                label="Start Date"
                onChange={(value) => updateEducation(item.id, "startDate", value)}
                placeholder="YYYY.MM"
                value={item.startDate}
              />
              <Input
                label="End Date"
                onChange={(value) => updateEducation(item.id, "endDate", value)}
                placeholder="YYYY.MM"
                value={item.endDate}
              />
              <Input
                label="Diploma"
                onChange={(value) => updateEducation(item.id, "diploma", value)}
                value={item.diploma}
              />
            </div>
          </div>
        ))}
      </EditorSection>

      <EditorSection
        isEmpty={form.workExperiences.length === 0}
        onAdd={addWorkExperience}
        title="Work Experiences"
      >
        {form.workExperiences.map((item) => (
          <ExperienceEditor
            item={item}
            key={item.id}
            onAddBullet={() => addBullet("workExperiences", item.id)}
            onRemove={() => removeWorkExperience(item.id)}
            onRemoveBullet={(bulletId) =>
              removeBullet("workExperiences", item.id, bulletId)
            }
            onUpdate={(field, value) => updateWorkExperience(item.id, field, value)}
            onUpdateBullet={(bulletId, text) =>
              updateBullet("workExperiences", item.id, bulletId, text)
            }
            onUpdateSkills={(value) => updateWorkExperienceSkills(item.id, value)}
          />
        ))}
      </EditorSection>

      <EditorSection isEmpty={form.projects.length === 0} onAdd={addProject} title="Projects">
        {form.projects.map((item) => (
          <ProjectEditor
            draggedProjectId={draggedProjectId}
            item={item}
            key={item.id}
            moveProject={moveProject}
            onAddBullet={() => addBullet("projects", item.id)}
            onDragStart={() => setDraggedProjectId(item.id)}
            onDragStop={() => setDraggedProjectId(null)}
            onRemove={() => removeProject(item.id)}
            onRemoveBullet={(bulletId) => removeBullet("projects", item.id, bulletId)}
            onUpdate={(field, value) => updateProject(item.id, field, value)}
            onUpdateBullet={(bulletId, text) =>
              updateBullet("projects", item.id, bulletId, text)
            }
            onUpdateSkills={(value) => updateProjectSkills(item.id, value)}
          />
        ))}
      </EditorSection>
    </>
  );
}

function ResumePreviewShell({
  isDeleting,
  onDelete,
  onEdit,
  resume,
}: {
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  resume: Resume;
}) {
  return (
    <div className="grid gap-5">
      <div className="no-print flex flex-wrap justify-end gap-2">
        <button
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onEdit}
          type="button"
        >
          Edit
        </button>
        <button
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-zinc-100"
          disabled={isDeleting}
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          onClick={() => window.print()}
          type="button"
        >
          Export PDF
        </button>
      </div>

      <ResumePreview resume={resume} />
    </div>
  );
}

function ResumePreview({ resume }: { resume: Resume }) {
  const hasWorkExperience = resume.workExperiences.length > 0;
  const hasProjects = resume.projects.length > 0;

  return (
    <article
      className={`resume-preview mx-auto bg-white text-zinc-950 shadow-xl ${
        resume.templateId === "China" ? "resume-template-china" : "resume-template-us"
      }`}
    >
      <div className="resume-page">
        <header className="border-b border-zinc-300 pb-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{resume.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {resume.contacts.website} | {resume.contacts.phone} |{" "}
            {resume.contacts.email}
          </p>
        </header>

        <PreviewSection title="Skills">
          <p className="text-sm leading-6">
            {resume.skills.map((skill) => skill.label).join(", ")}
          </p>
        </PreviewSection>

        <PreviewSection title="Education">
          {resume.education.map((item) => (
            <PreviewItem key={item.id}>
              <div className="flex justify-between gap-4">
                <div>
                  <h4 className="font-semibold">{item.schoolName}</h4>
                  <p className="text-sm text-zinc-700">
                    {item.degree}, {item.diploma}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-zinc-600">
                  {item.startDate} - {item.endDate}
                </p>
              </div>
            </PreviewItem>
          ))}
        </PreviewSection>

        {hasWorkExperience && (
          <PreviewSection title="Work Experience">
            {resume.workExperiences.map((item) => (
              <PreviewItem key={item.id}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">{item.company}</h4>
                    <p className="text-sm text-zinc-700">{item.role}</p>
                    {item.skills.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        {item.skills.map((skill) => skill.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm text-zinc-600">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>
                <BulletList bullets={item.bullets} />
              </PreviewItem>
            ))}
          </PreviewSection>
        )}

        {hasProjects && (
          <PreviewSection title="Projects">
            {resume.projects.map((item) => (
              <PreviewItem key={item.id}>
                <div className="flex justify-between gap-4">
                  <div>
                    <h4 className="font-semibold">{item.projectName}</h4>
                    {item.skills.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        {item.skills.map((skill) => skill.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm text-zinc-600">
                    {item.startDate} - {item.endDate}
                  </p>
                </div>
                <BulletList bullets={item.bullets} />
              </PreviewItem>
            ))}
          </PreviewSection>
        )}
      </div>
    </article>
  );
}

function PreviewSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="resume-section mt-4">
      <h3 className="border-b border-zinc-300 pb-1 text-sm font-bold uppercase tracking-wide text-zinc-800">
        {title}
      </h3>
      <div className="mt-2 grid gap-3">{children}</div>
    </section>
  );
}

function PreviewItem({ children }: { children: ReactNode }) {
  return <div className="resume-item break-inside-avoid">{children}</div>;
}

function BulletList({ bullets }: { bullets: BulletPoint[] }) {
  const visibleBullets = bullets.filter((bullet) => bullet.text.trim());

  if (visibleBullets.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
      {visibleBullets.map((bullet) => (
        <li className="break-inside-avoid" key={bullet.id}>
          {bullet.text}
        </li>
      ))}
    </ul>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold">{title}</h2>;
}

function EditorSection({
  children,
  isEmpty,
  onAdd,
  title,
}: {
  children: ReactNode;
  isEmpty: boolean;
  onAdd: () => void;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title={title} />
        <button
          aria-label={`Add ${title}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          Add
        </button>
      </div>
      <div className="mt-4 grid gap-4">
        {isEmpty ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            No entries yet.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function EntryHeader({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
        onClick={onRemove}
        type="button"
      >
        Remove
      </button>
    </div>
  );
}

function ExperienceEditor({
  item,
  onAddBullet,
  onRemove,
  onRemoveBullet,
  onUpdate,
  onUpdateBullet,
  onUpdateSkills,
}: {
  item: WorkExperienceItem;
  onAddBullet: () => void;
  onRemove: () => void;
  onRemoveBullet: (bulletId: string) => void;
  onUpdate: (
    field: keyof Omit<WorkExperienceItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  onUpdateBullet: (bulletId: string, text: string) => void;
  onUpdateSkills: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <EntryHeader onRemove={onRemove} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input label="Company" onChange={(value) => onUpdate("company", value)} value={item.company} />
        <Input label="Role" onChange={(value) => onUpdate("role", value)} value={item.role} />
        <Input label="Start Date" onChange={(value) => onUpdate("startDate", value)} placeholder="YYYY.MM" value={item.startDate} />
        <Input label="End Date" onChange={(value) => onUpdate("endDate", value)} placeholder="YYYY.MM" value={item.endDate} />
        <Input label="Skills" onChange={onUpdateSkills} value={item.skills.map((skill) => skill.label).join(", ")} />
      </div>
      <BulletEditor
        bullets={item.bullets}
        onAdd={onAddBullet}
        onRemove={onRemoveBullet}
        onUpdate={onUpdateBullet}
      />
    </div>
  );
}

function ProjectEditor({
  draggedProjectId,
  item,
  moveProject,
  onAddBullet,
  onDragStart,
  onDragStop,
  onRemove,
  onRemoveBullet,
  onUpdate,
  onUpdateBullet,
  onUpdateSkills,
}: {
  draggedProjectId: string | null;
  item: ProjectItem;
  moveProject: (targetProjectId: string) => void;
  onAddBullet: () => void;
  onDragStart: () => void;
  onDragStop: () => void;
  onRemove: () => void;
  onRemoveBullet: (bulletId: string) => void;
  onUpdate: (
    field: keyof Omit<ProjectItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  onUpdateBullet: (bulletId: string, text: string) => void;
  onUpdateSkills: (value: string) => void;
}) {
  return (
    <div
      className={`rounded-lg border p-4 transition ${
        draggedProjectId === item.id
          ? "border-teal-700 bg-teal-50"
          : "border-zinc-200 bg-white"
      }`}
      draggable
      onDragEnd={onDragStop}
      onDragOver={(event) => {
        event.preventDefault();
        moveProject(item.id);
      }}
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
        }
        onDragStart();
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="cursor-grab rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
          Drag
        </span>
        <EntryHeader onRemove={onRemove} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input label="Project Name" onChange={(value) => onUpdate("projectName", value)} value={item.projectName} />
        <Input label="Start Date" onChange={(value) => onUpdate("startDate", value)} placeholder="YYYY.MM" value={item.startDate} />
        <Input label="End Date" onChange={(value) => onUpdate("endDate", value)} placeholder="YYYY.MM" value={item.endDate} />
        <Input label="Skills" onChange={onUpdateSkills} value={item.skills.map((skill) => skill.label).join(", ")} />
      </div>
      <BulletEditor
        bullets={item.bullets}
        onAdd={onAddBullet}
        onRemove={onRemoveBullet}
        onUpdate={onUpdateBullet}
      />
    </div>
  );
}

function BulletEditor({
  bullets,
  onAdd,
  onRemove,
  onUpdate,
}: {
  bullets: BulletPoint[];
  onAdd: () => void;
  onRemove: (bulletId: string) => void;
  onUpdate: (bulletId: string, text: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-700">Bullet Points</h3>
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          Add Bullet
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {bullets.map((bullet) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={bullet.id}>
            <textarea
              className="min-h-20 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              onChange={(event) => onUpdate(bullet.id, event.target.value)}
              placeholder="Describe impact, scope, and result..."
              value={bullet.text}
            />
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              onClick={() => onRemove(bullet.id)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillList({
  onRemove,
  skills,
}: {
  onRemove: (id: string) => void;
  skills: SkillTag[];
}) {
  if (skills.length === 0) {
    return (
      <p className="mt-4 rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
        No skills yet.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {skills.map((skill) => (
        <button
          className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-red-50 hover:text-red-700"
          key={skill.id}
          onClick={() => onRemove(skill.id)}
          type="button"
        >
          {skill.label}
        </button>
      ))}
    </div>
  );
}

function Input({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function Select({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: ResumeTemplateId) => void;
  options: ResumeTemplateId[];
  value: ResumeTemplateId;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <select
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value as ResumeTemplateId)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function validateResume(form: ResumeForm): ValidationResult {
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
    validateDate(`${label}: start date`, item.startDate, errors);
    validateDate(`${label}: end date`, item.endDate, errors);
  });

  payload.workExperiences.forEach((item, index) => {
    const label = `Work Experience ${index + 1}`;

    validateDate(`${label}: start date`, item.startDate, errors);
    validateDate(`${label}: end date`, item.endDate, errors);
  });

  payload.projects.forEach((item, index) => {
    const label = `Project ${index + 1}`;

    validateDate(`${label}: start date`, item.startDate, errors);
    validateDate(`${label}: end date`, item.endDate, errors);
  });

  return errors.length > 0 ? { errors } : { errors, payload };
}

function validateDate(label: string, value: string, errors: string[]) {
  if (!DATE_PATTERN.test(value)) {
    errors.push(`${label} must use YYYY.MM format.`);
  }
}

function toForm(resume: Resume): ResumeForm {
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

function cleanResume(form: ResumeForm): ResumePayload {
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

function nextResumeTitle(count: number) {
  return `Resume ${count}`;
}

function newId() {
  return crypto.randomUUID();
}

function newSkillTag(label: string): SkillTag {
  return {
    id: newId(),
    label,
  };
}

function reconcileSkillTags(existingSkills: SkillTag[], value: string): SkillTag[] {
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => {
      const existingSkill = existingSkills.find((skill) => skill.label === label);

      return existingSkill || newSkillTag(label);
    });
}

function moveItem<T extends { id: string }>(items: T[], fromId: string, toId: string) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);

  if (fromIndex < 0 || toIndex < 0) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}

function newEducation(): EducationItem {
  return {
    id: newId(),
    schoolName: "",
    startDate: "",
    endDate: "",
    degree: "",
    diploma: "",
  };
}

function newWorkExperience(): WorkExperienceItem {
  return {
    id: newId(),
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    skills: [],
    bullets: [newBullet()],
  };
}

function newProject(): ProjectItem {
  return {
    id: newId(),
    projectName: "",
    startDate: "",
    endDate: "",
    skills: [],
    bullets: [newBullet()],
  };
}

function newBullet(): BulletPoint {
  return {
    id: newId(),
    text: "",
  };
}
