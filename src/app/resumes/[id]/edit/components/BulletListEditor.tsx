import type { BulletPoint } from "../../../types";

export function BulletListEditor({
  bullets,
  onAdd,
  onRemove,
  onUpdate,
}: {
  bullets: BulletPoint[];
  onAdd: () => void;
  onRemove: (bulletId: string) => void;
  onUpdate: (bulletId: string, text: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-700">Bullet Points</h3>
        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onAdd}
          type="button"
        >
          Add Bullet
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {bullets.map((bullet) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]" key={bullet.id}>
            <textarea
              className="min-h-20 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              onChange={(event) => onUpdate(bullet.id, event.target.value)}
              placeholder="Describe impact, scope, and result..."
              value={bullet.text}
            />
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              onClick={() => onRemove(bullet.id)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
