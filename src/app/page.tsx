"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

type Application = {
  id: string;
  company: string;
  roleTitle: string;
  jobDescription: string;
  applicationDate: string;
  status: ApplicationStatus;
  resumeVersion: string;
  requiredTechStack: string[];
  notes: string;
};

type ApplicationForm = Omit<Application, "id" | "requiredTechStack"> & {
  requiredTechStack: string;
};

type StoredApplication = Partial<Application> & {
  title?: string;
  jd?: string;
  appliedDate?: string;
  techStack?: string[];
};

const STORAGE_KEY = "internship-applications-v1";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const EMPTY_FORM: ApplicationForm = {
  company: "",
  roleTitle: "",
  jobDescription: "",
  applicationDate: new Date().toISOString().slice(0, 10),
  status: "Saved",
  resumeVersion: "",
  requiredTechStack: "",
  notes: "",
};

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [hasLoadedApplications, setHasLoadedApplications] = useState(false);
  const [form, setForm] = useState<ApplicationForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | ApplicationStatus>(
    "All",
  );
  const [techFilter, setTechFilter] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setApplications(loadApplications());
      setHasLoadedApplications(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (hasLoadedApplications) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }
  }, [applications, hasLoadedApplications]);

  const techOptions = useMemo(() => {
    const tech = applications.flatMap((app) => app.requiredTechStack);
    return Array.from(new Set(tech)).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;
      const matchesTech =
        techFilter === "" ||
        application.requiredTechStack.some(
          (tech) => tech.toLowerCase() === techFilter.toLowerCase(),
        );

      return matchesStatus && matchesTech;
    });
  }, [applications, statusFilter, techFilter]);

  function handleChange(field: keyof ApplicationForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.company.trim() || !form.roleTitle.trim()) {
      return;
    }

    const application = {
      company: form.company.trim(),
      roleTitle: form.roleTitle.trim(),
      jobDescription: form.jobDescription.trim(),
      applicationDate: form.applicationDate,
      status: form.status,
      resumeVersion: form.resumeVersion.trim(),
      requiredTechStack: parseTechStack(form.requiredTechStack),
      notes: form.notes.trim(),
    };

    if (editingId) {
      setApplications((currentApplications) =>
        currentApplications.map((currentApplication) =>
          currentApplication.id === editingId
            ? { ...application, id: editingId }
            : currentApplication,
        ),
      );
    } else {
      setApplications((currentApplications) => [
        { ...application, id: crypto.randomUUID() },
        ...currentApplications,
      ]);
    }

    resetForm();
  }

  function handleEdit(application: Application) {
    setEditingId(application.id);
    setForm({
      company: application.company,
      roleTitle: application.roleTitle,
      jobDescription: application.jobDescription,
      applicationDate: application.applicationDate,
      status: application.status,
      resumeVersion: application.resumeVersion,
      requiredTechStack: application.requiredTechStack.join(", "),
      notes: application.notes,
    });
  }

  function handleDelete(id: string) {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );

    if (editingId === id) {
      resetForm();
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-widest text-teal-700">
            Internship Copilot
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Application Tracker
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            A local-only MVP for tracking applications, resume versions,
            required tech, and follow-up notes.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <form
            className="self-start rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Application" : "Add Application"}
              </h2>
              {editingId && (
                <button
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              <Input
                label="Company"
                value={form.company}
                onChange={(value) => handleChange("company", value)}
                placeholder="e.g. Stripe"
                required
              />
              <Input
                label="Role Title"
                value={form.roleTitle}
                onChange={(value) => handleChange("roleTitle", value)}
                placeholder="e.g. Software Engineering Intern"
                required
              />
              <TextArea
                label="Job Description"
                value={form.jobDescription}
                onChange={(value) => handleChange("jobDescription", value)}
                placeholder="Paste the job description..."
              />
              <Input
                label="Application Date"
                value={form.applicationDate}
                onChange={(value) => handleChange("applicationDate", value)}
                type="date"
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(value) =>
                  handleChange("status", value as ApplicationStatus)
                }
                options={STATUS_OPTIONS}
              />
              <Input
                label="Resume Version"
                value={form.resumeVersion}
                onChange={(value) => handleChange("resumeVersion", value)}
                placeholder="e.g. backend-v3"
              />
              <Input
                label="Required Tech Stack"
                value={form.requiredTechStack}
                onChange={(value) => handleChange("requiredTechStack", value)}
                placeholder="React, TypeScript, Python"
              />
              <TextArea
                label="Notes"
                value={form.notes}
                onChange={(value) => handleChange("notes", value)}
                placeholder="Referral, recruiter, deadlines, interview notes..."
              />
            </div>

            <button
              className="mt-5 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              type="submit"
            >
              {editingId ? "Save Changes" : "Create Application"}
            </button>
          </form>

          <section className="flex flex-col gap-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Applications</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    {filteredApplications.length} of {applications.length}{" "}
                    shown
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Filter by Status"
                    value={statusFilter}
                    onChange={(value) =>
                      setStatusFilter(value as "All" | ApplicationStatus)
                    }
                    options={["All", ...STATUS_OPTIONS]}
                  />
                  <Select
                    label="Filter by Tech"
                    value={techFilter}
                    onChange={setTechFilter}
                    options={["", ...techOptions]}
                    emptyLabel="All Tech"
                  />
                </div>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
                No applications match the current filters.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function parseTechStack(value: string) {
  return value
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean);
}

function loadApplications(): Application[] {
  const storedApplications = window.localStorage.getItem(STORAGE_KEY);

  if (!storedApplications) {
    return [];
  }

  try {
    const parsedApplications = JSON.parse(storedApplications);

    if (!Array.isArray(parsedApplications)) {
      return [];
    }

    return parsedApplications.map((application: StoredApplication) => ({
      id: application.id || crypto.randomUUID(),
      company: application.company || "",
      roleTitle: application.roleTitle || application.title || "",
      jobDescription: application.jobDescription || application.jd || "",
      applicationDate:
        application.applicationDate || application.appliedDate || "",
      status: isApplicationStatus(application.status)
        ? application.status
        : "Saved",
      resumeVersion: application.resumeVersion || "",
      requiredTechStack: Array.isArray(application.requiredTechStack)
        ? application.requiredTechStack
        : application.techStack || [],
      notes: application.notes || "",
    }));
  } catch {
    return [];
  }
}

function isApplicationStatus(
  status: Application["status"] | undefined,
): status is ApplicationStatus {
  return STATUS_OPTIONS.includes(status as ApplicationStatus);
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
  emptyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  emptyLabel?: string;
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
          <option key={option || "all"} value={option}>
            {option || emptyLabel}
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

function ApplicationCard({
  application,
  onDelete,
  onEdit,
}: {
  application: Application;
  onDelete: (id: string) => void;
  onEdit: (application: Application) => void;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight">
              {application.roleTitle}
            </h3>
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
              {application.status}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-700">
            {application.company}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Applied {application.applicationDate || "date not set"} with{" "}
            {application.resumeVersion || "no resume version listed"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            onClick={() => onEdit(application)}
            type="button"
          >
            Edit
          </button>
          <button
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            onClick={() => onDelete(application.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>

      {application.requiredTechStack.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {application.requiredTechStack.map((tech) => (
            <span
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
              key={tech}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {application.notes && <InfoBlock title="Notes" content={application.notes} />}

      {application.jobDescription && (
        <details className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
            Job Description
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
            {application.jobDescription}
          </p>
        </details>
      )}
    </article>
  );
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <section className="mt-4">
      <h4 className="text-sm font-semibold text-zinc-700">{title}</h4>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
        {content}
      </p>
    </section>
  );
}
