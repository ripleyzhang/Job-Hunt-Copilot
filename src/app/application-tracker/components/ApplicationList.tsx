import type { Application } from "../types";
import { ApplicationCard } from "./ApplicationCard";

export function ApplicationList({
  applications,
  isLoading,
  isSaving,
  onDelete,
  onEdit,
}: {
  applications: Application[];
  isLoading: boolean;
  isSaving: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (application: Application) => void;
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
        Loading applications...
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
        No applications match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {applications.map((application) => (
        <ApplicationCard
          application={application}
          isSaving={isSaving}
          key={application.id}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
