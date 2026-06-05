export function ResumeEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="no-print rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
      <p className="text-sm text-zinc-600">
        No resume selected or this resume has been deleted.
      </p>
      <button
        className="mt-4 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        onClick={onCreate}
        type="button"
      >
        Create New Resume
      </button>
    </div>
  );
}
