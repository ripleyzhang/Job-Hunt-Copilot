import type { Resume } from "../types";
import { ResumeCard } from "./ResumeCard";

export function ResumeList({
  isLoading,
  onCreate,
  onSelect,
  resumes,
  selectedResumeId,
}: {
  isLoading: boolean;
  onCreate: () => void;
  onSelect: (resume: Resume) => void;
  resumes: Resume[];
  selectedResumeId: string | null;
}) {
  return (
    <aside className="no-print self-start rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Resumes</h2>
        <button
          className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          onClick={onCreate}
          type="button"
        >
          New
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {isLoading ? (
          <p className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-500">
            Loading resumes...
          </p>
        ) : resumes.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500">
            No resumes yet.
          </p>
        ) : (
          resumes.map((resume) => (
            <ResumeCard
              isSelected={resume.id === selectedResumeId}
              key={resume.id}
              onSelect={onSelect}
              resume={resume}
            />
          ))
        )}
      </div>
    </aside>
  );
}
