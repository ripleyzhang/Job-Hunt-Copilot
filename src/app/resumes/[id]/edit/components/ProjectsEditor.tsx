import type { DragEvent } from "react";

import type { ProjectItem } from "../../../types";
import { BulletListEditor } from "./BulletListEditor";
import { EditorSection } from "./EditorSection";
import { EntryHeader, Input } from "./FormControls";

export function ProjectsEditor({
  addBullet,
  addProject,
  draggedProjectId,
  moveProject,
  projects,
  removeBullet,
  removeProject,
  setDraggedProjectId,
  updateBullet,
  updateProject,
  updateProjectSkills,
}: {
  addBullet: (section: "workExperiences" | "projects", itemId: string) => void;
  addProject: () => void;
  draggedProjectId: string | null;
  moveProject: (targetProjectId: string) => void;
  projects: ProjectItem[];
  removeBullet: (
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
  ) => void;
  removeProject: (id: string) => void;
  setDraggedProjectId: (id: string | null) => void;
  updateBullet: (
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
    text: string,
  ) => void;
  updateProject: (
    id: string,
    field: keyof Omit<ProjectItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  updateProjectSkills: (id: string, value: string) => void;
}) {
  return (
    <EditorSection isEmpty={projects.length === 0} onAdd={addProject} title="Projects">
      {projects.map((item) => (
        <ProjectCard
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
  );
}

function ProjectCard({
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
        <Input
          label="Project Name"
          onChange={(value) => onUpdate("projectName", value)}
          value={item.projectName}
        />
        <Input
          label="Start Date"
          onChange={(value) => onUpdate("startDate", value)}
          placeholder="YYYY.MM"
          value={item.startDate}
        />
        <Input
          label="End Date"
          onChange={(value) => onUpdate("endDate", value)}
          placeholder="YYYY.MM"
          value={item.endDate}
        />
        <Input
          label="Skills"
          onChange={onUpdateSkills}
          value={item.skills.map((skill) => skill.label).join(", ")}
        />
      </div>
      <BulletListEditor
        bullets={item.bullets}
        onAdd={onAddBullet}
        onRemove={onRemoveBullet}
        onUpdate={onUpdateBullet}
      />
    </div>
  );
}
