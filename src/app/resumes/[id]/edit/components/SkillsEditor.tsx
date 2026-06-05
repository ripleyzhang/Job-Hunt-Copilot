import type { SkillTag } from "../../../types";
import { SectionHeader } from "./FormControls";
import { TagInput } from "./TagInput";

export function SkillsEditor({
  addSkill,
  newSkill,
  removeSkill,
  setNewSkill,
  skills,
}: {
  addSkill: () => void;
  newSkill: string;
  removeSkill: (id: string) => void;
  setNewSkill: (skill: string) => void;
  skills: SkillTag[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <SectionHeader title="Skills" />
      <TagInput
        inputValue={newSkill}
        onAdd={addSkill}
        onInputChange={setNewSkill}
        onRemove={removeSkill}
        skills={skills}
      />
    </section>
  );
}
