import type {
  EducationItem,
  ProjectItem,
  ResumeContacts,
  ResumeForm,
  SkillTag,
  WorkExperienceItem,
} from "../../../types";
import { ContactsEditor } from "./ContactsEditor";
import { EducationEditor } from "./EducationEditor";
import { ProjectsEditor } from "./ProjectsEditor";
import { SkillsEditor } from "./SkillsEditor";
import { TemplateSelector } from "./TemplateSelector";
import { WorkExperienceEditor } from "./WorkExperienceEditor";

export function ResumeEditor({
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
      <TemplateSelector form={form} updateField={updateField} />
      <ContactsEditor contacts={form.contacts} updateContacts={updateContacts} />
      <SkillsEditor
        addSkill={addSkill}
        newSkill={newSkill}
        removeSkill={removeSkill}
        setNewSkill={setNewSkill}
        skills={form.skills}
      />
      <EducationEditor
        addEducation={addEducation}
        education={form.education}
        removeEducation={removeEducation}
        updateEducation={updateEducation}
      />
      <WorkExperienceEditor
        addBullet={addBullet}
        addWorkExperience={addWorkExperience}
        removeBullet={removeBullet}
        removeWorkExperience={removeWorkExperience}
        updateBullet={updateBullet}
        updateWorkExperience={updateWorkExperience}
        updateWorkExperienceSkills={updateWorkExperienceSkills}
        workExperiences={form.workExperiences}
      />
      <ProjectsEditor
        addBullet={addBullet}
        addProject={addProject}
        draggedProjectId={draggedProjectId}
        moveProject={moveProject}
        projects={form.projects}
        removeBullet={removeBullet}
        removeProject={removeProject}
        setDraggedProjectId={setDraggedProjectId}
        updateBullet={updateBullet}
        updateProject={updateProject}
        updateProjectSkills={updateProjectSkills}
      />
    </>
  );
}

export function reconcileSkillTags(
  existingSkills: SkillTag[],
  value: string,
): SkillTag[] {
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => {
      const existingSkill = existingSkills.find((skill) => skill.label === label);

      return existingSkill || newSkillTag(label);
    });
}

export function moveItem<T extends { id: string }>(
  items: T[],
  fromId: string,
  toId: string,
) {
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

export function newSkillTag(label: string): SkillTag {
  return {
    id: newId(),
    label,
  };
}

export function newEducation(): EducationItem {
  return {
    id: newId(),
    schoolName: "",
    startDate: "",
    endDate: "",
    degree: "",
    diploma: "",
  };
}

export function newWorkExperience(): WorkExperienceItem {
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

export function newProject(): ProjectItem {
  return {
    id: newId(),
    projectName: "",
    startDate: "",
    endDate: "",
    skills: [],
    bullets: [newBullet()],
  };
}

export function newBullet() {
  return {
    id: newId(),
    text: "",
  };
}

function newId() {
  return crypto.randomUUID();
}
