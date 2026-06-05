import type { ResumeTemplateId } from "../../../types";

export function Input({
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

export function Select({
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

export function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold">{title}</h2>;
}

export function EntryHeader({ onRemove }: { onRemove: () => void }) {
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
