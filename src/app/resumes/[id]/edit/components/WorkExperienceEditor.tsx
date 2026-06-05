import type { WorkExperienceItem } from "../../../types";
import { BulletListEditor } from "./BulletListEditor";
import { EditorSection } from "./EditorSection";
import { EntryHeader, Input } from "./FormControls";

export function WorkExperienceEditor({
  addBullet,
  addWorkExperience,
  removeBullet,
  removeWorkExperience,
  updateBullet,
  updateWorkExperience,
  updateWorkExperienceSkills,
  workExperiences,
}: {
  addBullet: (section: "workExperiences" | "projects", itemId: string) => void;
  addWorkExperience: () => void;
  removeBullet: (
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
  ) => void;
  removeWorkExperience: (id: string) => void;
  updateBullet: (
    section: "workExperiences" | "projects",
    itemId: string,
    bulletId: string,
    text: string,
  ) => void;
  updateWorkExperience: (
    id: string,
    field: keyof Omit<WorkExperienceItem, "id" | "skills" | "bullets">,
    value: string,
  ) => void;
  updateWorkExperienceSkills: (id: string, value: string) => void;
  workExperiences: WorkExperienceItem[];
}) {
  return (
    <EditorSection
      isEmpty={workExperiences.length === 0}
      onAdd={addWorkExperience}
      title="Work Experiences"
    >
      {workExperiences.map((item) => (
        <div className="rounded-lg border border-zinc-200 p-4" key={item.id}>
          <EntryHeader onRemove={() => removeWorkExperience(item.id)} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Company"
              onChange={(value) => updateWorkExperience(item.id, "company", value)}
              value={item.company}
            />
            <Input
              label="Role"
              onChange={(value) => updateWorkExperience(item.id, "role", value)}
              value={item.role}
            />
            <Input
              label="Start Date"
              onChange={(value) => updateWorkExperience(item.id, "startDate", value)}
              placeholder="YYYY.MM"
              value={item.startDate}
            />
            <Input
              label="End Date"
              onChange={(value) => updateWorkExperience(item.id, "endDate", value)}
              placeholder="YYYY.MM"
              value={item.endDate}
            />
            <Input
              label="Skills"
              onChange={(value) => updateWorkExperienceSkills(item.id, value)}
              value={item.skills.map((skill) => skill.label).join(", ")}
            />
          </div>
          <BulletListEditor
            bullets={item.bullets}
            onAdd={() => addBullet("workExperiences", item.id)}
            onRemove={(bulletId) =>
              removeBullet("workExperiences", item.id, bulletId)
            }
            onUpdate={(bulletId, text) =>
              updateBullet("workExperiences", item.id, bulletId, text)
            }
          />
        </div>
      ))}
    </EditorSection>
  );
}
