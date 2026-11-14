import type { CandidateFilters } from "@/lib/filters";
import {
  STAGE_LABELS,
  STAGE_VALUES,
  STATUS_LABELS,
  STATUS_VALUES,
} from "@/lib/labels";

interface FilterBarProps {
  filters: CandidateFilters;
  onStatusChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onClear: () => void;
}

const FIELD =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";

export function FilterBar({
  filters,
  onStatusChange,
  onStageChange,
  onQueryChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
      <div className="sm:col-span-2">
        <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
          Buscar por nombre o correo
        </label>
        <input
          id="search"
          type="search"
          value={filters.query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ej.: Víctor o victor@correo.com"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          id="status"
          value={filters.status}
          onChange={(event) => onStatusChange(event.target.value)}
          className={FIELD}
        >
          <option value="">Todos los estados</option>
          {STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="stage" className="mb-1 block text-sm font-medium text-slate-700">
          Etapa
        </label>
        <select
          id="stage"
          value={filters.stage}
          onChange={(event) => onStageChange(event.target.value)}
          className={FIELD}
        >
          <option value="">Todas las etapas</option>
          {STAGE_VALUES.map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-4">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}