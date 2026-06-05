import type { FormEvent } from "react";

import {
  APPLICATION_STATUSES,
  type ApplicationFormData,
  type ApplicationStatus,
} from "../types";

export function ApplicationForm({
  editingId,
  form,
  isSaving,
  onCancel,
  onChange,
  onSubmit,
}: {
  editingId: string | null;
  form: ApplicationFormData;
  isSaving: boolean;
  onCancel: () => void;
  onChange: (field: keyof ApplicationFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="self-start rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Application" : "Add Application"}
        </h2>
        {editingId && (
          <button
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4">
        <Input
          label="Company"
          onChange={(value) => onChange("company", value)}
          placeholder="e.g. Stripe"
          required
          value={form.company}
        />
        <Input
          label="Role Title"
          onChange={(value) => onChange("roleTitle", value)}
          placeholder="e.g. Software Engineering Intern"
          required
          value={form.roleTitle}
        />
        <TextArea
          label="Job Description"
          onChange={(value) => onChange("jobDescription", value)}
          placeholder="Paste the job description..."
          value={form.jobDescription}
        />
        <Input
          label="Application Date"
          onChange={(value) => onChange("applicationDate", value)}
          type="date"
          value={form.applicationDate}
        />
        <Select
          label="Status"
          onChange={(value) => onChange("status", value as ApplicationStatus)}
          options={APPLICATION_STATUSES}
          value={form.status}
        />
        <Input
          label="Resume Version"
          onChange={(value) => onChange("resumeVersion", value)}
          placeholder="e.g. backend-v3"
          value={form.resumeVersion}
        />
        <Input
          label="Required Tech Stack"
          onChange={(value) => onChange("requiredTechStack", value)}
          placeholder="React, TypeScript, Python"
          value={form.requiredTechStack}
        />
        <TextArea
          label="Notes"
          onChange={(value) => onChange("notes", value)}
          placeholder="Referral, recruiter, deadlines, interview notes..."
          value={form.notes}
        />
      </div>

      <button
        className="mt-5 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        disabled={isSaving}
        type="submit"
      >
        {isSaving
          ? "Saving..."
          : editingId
            ? "Save Changes"
            : "Create Application"}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <select
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
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

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <textarea
        className="min-h-28 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
