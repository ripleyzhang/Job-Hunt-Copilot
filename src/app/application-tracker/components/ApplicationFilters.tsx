import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type ApplicationStatusFilter,
} from "../types";

export function ApplicationFilters({
  applicationCount,
  filteredCount,
  onStatusFilterChange,
  onTechFilterChange,
  statusFilter,
  techFilter,
  techOptions,
}: {
  applicationCount: number;
  filteredCount: number;
  onStatusFilterChange: (value: ApplicationStatusFilter) => void;
  onTechFilterChange: (value: string) => void;
  statusFilter: ApplicationStatusFilter;
  techFilter: string;
  techOptions: string[];
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Applications</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {filteredCount} of {applicationCount} shown
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Filter by Status"
            onChange={(value) =>
              onStatusFilterChange(value as "All" | ApplicationStatus)
            }
            options={["All", ...APPLICATION_STATUSES]}
            value={statusFilter}
          />
          <Select
            emptyLabel="All Tech"
            label="Filter by Tech"
            onChange={onTechFilterChange}
            options={["", ...techOptions]}
            value={techFilter}
          />
        </div>
      </div>
    </div>
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
