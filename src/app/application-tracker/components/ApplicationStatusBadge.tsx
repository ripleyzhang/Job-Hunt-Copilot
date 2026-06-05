import type { ApplicationStatus } from "../types";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
      {status}
    </span>
  );
}
