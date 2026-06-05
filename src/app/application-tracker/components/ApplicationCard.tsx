import type { Application } from "../types";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

export function ApplicationCard({
  application,
  onDelete,
  onEdit,
  isSaving,
}: {
  application: Application;
  onDelete: (id: string) => Promise<void>;
  onEdit: (application: Application) => void;
  isSaving: boolean;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight">
              {application.roleTitle}
            </h3>
            <ApplicationStatusBadge status={application.status} />
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
            disabled={isSaving}
            onClick={() => onEdit(application)}
            type="button"
          >
            Edit
          </button>
          <button
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            disabled={isSaving}
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
