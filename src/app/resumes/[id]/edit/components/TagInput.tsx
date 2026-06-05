import type { SkillTag } from "../../../types";

export function TagInput({
  addLabel = "Add Skill",
  inputValue,
  onAdd,
  onInputChange,
  onRemove,
  placeholder = "Add a skill tag",
  skills,
}: {
  addLabel?: string;
  inputValue: string;
  onAdd: () => void;
  onInputChange: (value: string) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
  skills: SkillTag[];
}) {
  return (
    <>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={placeholder}
          value={inputValue}
        />
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          {addLabel}
        </button>
      </div>
      <SkillList skills={skills} onRemove={onRemove} />
    </>
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
