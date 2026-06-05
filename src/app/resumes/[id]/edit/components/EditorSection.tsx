import type { ReactNode } from "react";

import { SectionHeader } from "./FormControls";

export function EditorSection({
  children,
  isEmpty,
  onAdd,
  title,
}: {
  children: ReactNode;
  isEmpty: boolean;
  onAdd: () => void;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title={title} />
        <button
          aria-label={`Add ${title}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          Add
        </button>
      </div>
      <div className="mt-4 grid gap-4">
        {isEmpty ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            No entries yet.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
