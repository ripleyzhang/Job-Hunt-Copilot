import type { Resume } from "../types";

export function ResumeCard({
  isSelected,
  onSelect,
  resume,
}: {
  isSelected: boolean;
  onSelect: (resume: Resume) => void;
  resume: Resume;
}) {
  return (
    <button
      className={`rounded-md border px-3 py-2 text-left text-sm transition ${
        isSelected
          ? "border-teal-700 bg-teal-50 text-teal-900"
          : "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
      }`}
      onClick={() => onSelect(resume)}
      type="button"
    >
      <span className="block font-medium">{resume.title}</span>
      <span className="text-xs text-zinc-500">{resume.templateId}</span>
    </button>
  );
}
