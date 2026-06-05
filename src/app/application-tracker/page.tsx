"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "./api";
import { ApplicationFilters } from "./components/ApplicationFilters";
import { ApplicationForm } from "./components/ApplicationForm";
import { ApplicationList } from "./components/ApplicationList";
import type {
  Application,
  ApplicationFormData,
  ApplicationPayload,
  ApplicationStatusFilter,
} from "./types";

const EMPTY_FORM: ApplicationFormData = {
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
  const [form, setForm] = useState<ApplicationFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ApplicationStatusFilter>("All");
  const [techFilter, setTechFilter] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadApplicationList() {
      try {
        const loadedApplications = await listApplications();

        if (isCurrent) {
          setApplications(loadedApplications);
          setError("");
        }
      } catch {
        if (isCurrent) {
          setError("Could not load applications from the backend.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadApplicationList();

    return () => {
      isCurrent = false;
    };
  }, []);

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

  function handleChange(field: keyof ApplicationFormData, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.company.trim() || !form.roleTitle.trim()) {
      return;
    }

    const application: ApplicationPayload = {
      company: form.company.trim(),
      roleTitle: form.roleTitle.trim(),
      jobDescription: form.jobDescription.trim(),
      applicationDate: form.applicationDate,
      status: form.status,
      resumeVersion: form.resumeVersion.trim(),
      requiredTechStack: parseTechStack(form.requiredTechStack),
      notes: form.notes.trim(),
    };

    setIsSaving(true);
    setError("");

    try {
      if (editingId) {
        const updatedApplication = await updateApplication(
          editingId,
          application,
        );

        setApplications((currentApplications) =>
          currentApplications.map((currentApplication) =>
            currentApplication.id === editingId
              ? updatedApplication
              : currentApplication,
          ),
        );
      } else {
        const createdApplication = await createApplication(application);

        setApplications((currentApplications) => [
          createdApplication,
          ...currentApplications,
        ]);
      }

      resetForm();
    } catch {
      setError(
        editingId
          ? "Could not save application changes."
          : "Could not create application.",
      );
    } finally {
      setIsSaving(false);
    }
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

  async function handleDelete(id: string) {
    setIsSaving(true);
    setError("");

    try {
      await deleteApplication(id);

      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== id),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch {
      setError("Could not delete application.");
    } finally {
      setIsSaving(false);
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
          <Link
            className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
            href="/"
          >
            ← Back to Home
          </Link>
          <p className="text-sm font-medium uppercase tracking-widest text-teal-700">
            Internship Copilot
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Application Tracker
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            Track applications, resume versions, required tech, and follow-up
            notes.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[400px_1fr]">
          <ApplicationForm
            editingId={editingId}
            form={form}
            isSaving={isSaving}
            onCancel={resetForm}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          <section className="flex flex-col gap-4">
            <ApplicationFilters
              applicationCount={applications.length}
              filteredCount={filteredApplications.length}
              onStatusFilterChange={setStatusFilter}
              onTechFilterChange={setTechFilter}
              statusFilter={statusFilter}
              techFilter={techFilter}
              techOptions={techOptions}
            />

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <ApplicationList
              applications={filteredApplications}
              isLoading={isLoading}
              isSaving={isSaving}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
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
