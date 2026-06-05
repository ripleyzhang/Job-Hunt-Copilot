export function ResumeActions({
  isDeleting,
  onDelete,
  onEdit,
}: {
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="no-print flex flex-wrap justify-end gap-2">
      <button
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        onClick={onEdit}
        type="button"
      >
        Edit
      </button>
      <button
        className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-zinc-100"
        disabled={isDeleting}
        onClick={onDelete}
        type="button"
      >
        Delete
      </button>
      <button
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        onClick={() => window.print()}
        type="button"
      >
        Export PDF
      </button>
    </div>
  );
}
