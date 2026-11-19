"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

type GroupStats = Record<string, { count: number; percentage: number }>;

type AnalysisResult = {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  invalid_by_rule: Record<string, number>;
  categories: GroupStats;
  statuses: GroupStats;
  countries: GroupStats;
  satisfaction: {
    closed_cases: number;
    scored_cases: number;
    average_score: number | null;
    score_distribution: Record<string, number>;
  };
};

type Row = { label: string; count: number; percentage: number };

const formatNumber = new Intl.NumberFormat("es-ES");
const formatPercent = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const RULE_LABELS: Record<string, string> = {
  missing_clinic_id: "clinic_id faltante o inválido",
  country_mismatch: "País no coincide con la clínica",
  missing_category: "Categoría faltante o inválida",
  empty_description: "Descripción vacía o demasiado corta",
  missing_patient_id: "Falta patient_id o formato incorrecto",
  closed_without_score: "Caso cerrado sin puntaje de satisfacción",
  score_out_of_range: "Puntaje fuera del rango 1–5",
  unknown_status: "Estado vacío o no válido",
  malformed_row: "Fila con columnas adicionales",
};
const REQUIRED_RULES = Object.keys(RULE_LABELS).slice(0, 7);

const CATEGORY_LABELS: Record<string, string> = {
  APPOINTMENT: "Citas",
  BILLING: "Facturación",
  CLINICAL_CARE: "Atención clínica",
  ACCESSIBILITY: "Accesibilidad",
  ADMINISTRATIVE: "Administrativo",
};
const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierto",
  CLOSED: "Cerrado",
  DISCARDED: "Descartado",
};
const COUNTRY_LABELS: Record<string, string> = {
  US: "Estados Unidos",
  UK: "Reino Unido",
};
const SCORE_LABELS: Record<string, string> = {
  "1": "Puntaje 1 · muy insatisfecho",
  "2": "Puntaje 2 · insatisfecho",
  "3": "Puntaje 3 · neutral",
  "4": "Puntaje 4 · satisfecho",
  "5": "Puntaje 5 · muy satisfecho",
};

function groupRows(values: GroupStats, labels: Record<string, string>): Row[] {
  return Object.entries(values).map(([key, stat]) => ({
    label: labels[key] ? `${labels[key]} (${key})` : key,
    count: stat.count,
    percentage: stat.percentage,
  }));
}

function scoreRows(distribution: Record<string, number>, scored: number): Row[] {
  return Object.entries(distribution).map(([score, count]) => ({
    label: SCORE_LABELS[score] ?? `Puntaje ${score}`,
    count,
    percentage: scored > 0 ? Math.round((count * 1000) / scored) / 10 : 0,
  }));
}

function visibleRules(byRule: Record<string, number>): [string, number][] {
  const ordered = Object.keys(RULE_LABELS);
  const extras = Object.keys(byRule).filter((rule) => !ordered.includes(rule));
  return [...ordered, ...extras]
    .filter((rule) => REQUIRED_RULES.includes(rule) || (byRule[rule] ?? 0) > 0)
    .map((rule) => [rule, byRule[rule] ?? 0]);
}

function BreakdownTable({
  title,
  rows,
  emptyLabel,
  countHeader,
  percentHeader,
}: {
  title: string;
  rows: Row[];
  emptyLabel: string;
  countHeader: string;
  percentHeader: string;
}) {
  return (
    <section className="breakdown-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{formatNumber.format(rows.length)} grupos</span>
      </div>
      {rows.length === 0 ? (
        <p className="empty-breakdown">{emptyLabel}</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">{countHeader}</th>
                <th scope="col">{percentHeader}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{formatNumber.format(row.count)}</td>
                  <td>{formatPercent.format(row.percentage)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function IncidentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState("");

  // Recupera la sesión guardada; si no hay token, muestra la página de acceso.
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
    } else {
      router.replace("/login");
    }
  }, [router]);

  async function handleExport() {
    setError("");
    try {
      const response = await apiRequest("/api/incidents/results/export");
      if (!response.ok) {
        setError("No se pudo exportar el resultado.");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "resultados_healthcore.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo conectar con el servicio de análisis.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selecciona un fichero CSV para continuar.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiRequest("/api/incidents/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof payload.detail === "string" ? payload.detail : "No se pudo analizar el fichero.",
        );
      }
      setResult(payload as AnalysisResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo conectar con el servicio de análisis.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) return null;

  const satisfaction = result?.satisfaction;

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="/" aria-label="HealthCore, inicio">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span>HealthCore<span className="brand-divider">/</span>Digital</span>
        </a>
        <div className="topbar-context">
          <span className="status-dot" aria-hidden="true" />
          OPERACIONES INTERNAS
          <button type="button" onClick={() => {
            removeToken();
            setToken("");
            setResult(null);
            router.replace("/login");
          }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="page-heading" aria-labelledby="page-title">
        <p className="eyebrow">DATOS Y CALIDAD <span>/</span> HEALTHCORE</p>
        <div className="heading-row">
          <div>
            <h1 id="page-title">Análisis de incidencias</h1>
            <p className="page-description">
              Validación y resumen de reportes de pacientes, procesados dentro de HealthCore.
            </p>
          </div>
          <span className="privacy-tag"><span aria-hidden="true">●</span> Procesamiento interno</span>
        </div>
      </section>

      <div className="content-grid">
        <aside className="upload-panel" aria-labelledby="upload-title">
          <div className="panel-kicker"><span>01</span> NUEVO ANÁLISIS</div>
          <h2 id="upload-title">Cargar fichero</h2>
          <p className="upload-copy">
            El CSV se analiza en el servicio interno. Los resultados exportables contienen solo métricas agregadas, sin identificadores de pacientes.
          </p>
          <form onSubmit={handleSubmit}>
            <label className="file-picker" htmlFor="incident-file">
              <span className="file-glyph" aria-hidden="true">＋</span>
              <span className="file-picker-copy">
                <strong>{file ? file.name : "Seleccionar fichero CSV"}</strong>
                <small>{file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV · UTF-8"}</small>
              </span>
              <span className="browse-label">Examinar</span>
            </label>
            <input
              id="incident-file"
              className="file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setError("");
              }}
            />
            <button className="primary-button" type="submit" disabled={isSubmitting || !file}>
              {isSubmitting ? "Analizando…" : "Analizar fichero"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="privacy-note">
            <span className="privacy-icon" aria-hidden="true">i</span>
            <p>Los registros inválidos se contabilizan y se excluyen de los agregados.</p>
          </div>
        </aside>

        <section className="results" aria-live="polite" aria-busy={isSubmitting}>
          {result && satisfaction ? (
            <>
              <div className="results-header">
                <div>
                  <div className="panel-kicker"><span>02</span> RESUMEN DEL ANÁLISIS</div>
                  <h2>Resultados</h2>
                </div>
                <button className="export-link" type="button" onClick={handleExport}>
                  <span aria-hidden="true">↓</span> Exportar CSV
                </button>
              </div>

              <div className="metric-grid">
                <article className="metric metric-dark">
                  <span>PROCESADOS</span>
                  <strong>{formatNumber.format(result.total_records)}</strong>
                  <small>Registros leídos</small>
                </article>
                <article className="metric">
                  <span>VÁLIDOS</span>
                  <strong>{formatNumber.format(result.valid_records)}</strong>
                  <small>Incluidos en métricas</small>
                </article>
                <article className={`metric ${result.invalid_records > 0 ? "metric-alert" : ""}`}>
                  <span>INVÁLIDOS</span>
                  <strong>{formatNumber.format(result.invalid_records)}</strong>
                  <small>Excluidos del análisis</small>
                </article>
                <article className="metric">
                  <span>SATISFACCIÓN</span>
                  <strong>
                    {satisfaction.average_score === null ? "—" : satisfaction.average_score.toFixed(2)}
                  </strong>
                  <small>
                    Media / 5 · {formatNumber.format(satisfaction.scored_cases)} de{" "}
                    {formatNumber.format(satisfaction.closed_cases)} cerrados con puntaje
                  </small>
                </article>
              </div>

              {result.invalid_records > 0 && (
                <section className="validation-report" aria-labelledby="invalid-title">
                  <div className="validation-header">
                    <div>
                      <p className="panel-kicker">VALIDACIÓN</p>
                      <h3 id="invalid-title">
                        El fichero contiene registros inválidos: requieren revisión
                      </h3>
                    </div>
                    <strong>{formatNumber.format(result.invalid_records)}</strong>
                  </div>
                  <ul className="reason-list">
                    {visibleRules(result.invalid_by_rule).map(([rule, count]) => (
                      <li key={rule}>
                        <span>{RULE_LABELS[rule] ?? rule}</span>
                        <strong>{formatNumber.format(count)}</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="row-list-label">
                    Por privacidad no se muestran identificadores de pacientes ni datos de las filas.
                    Un registro que incumple varias reglas se cuenta en cada una.
                  </p>
                </section>
              )}

              <div className="breakdown-grid">
                <BreakdownTable
                  title="Por categoría"
                  rows={groupRows(result.categories, CATEGORY_LABELS)}
                  emptyLabel="Sin categorías válidas."
                  countHeader="Incidencias"
                  percentHeader="% sobre válidos"
                />
                <BreakdownTable
                  title="Por estado"
                  rows={groupRows(result.statuses, STATUS_LABELS)}
                  emptyLabel="Sin estados válidos."
                  countHeader="Incidencias"
                  percentHeader="% sobre válidos"
                />
                <BreakdownTable
                  title="Por país"
                  rows={groupRows(result.countries, COUNTRY_LABELS)}
                  emptyLabel="Sin países válidos."
                  countHeader="Incidencias"
                  percentHeader="% sobre válidos"
                />
                <BreakdownTable
                  title="Satisfacción (casos cerrados)"
                  rows={scoreRows(satisfaction.score_distribution, satisfaction.scored_cases)}
                  emptyLabel="Sin puntajes registrados."
                  countHeader="Casos"
                  percentHeader="% sobre puntuados"
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-mark" aria-hidden="true">∑</div>
              <p className="panel-kicker">ESPERANDO DATOS</p>
              <h2>El resumen aparecerá aquí</h2>
              <p>Selecciona un CSV de incidencias y ejecuta el análisis para ver sus métricas.</p>
            </div>
          )}
        </section>
      </div>
      <footer className="page-footer">
        <span>HEALTHCORE DIGITAL</span>
        <span>Acceso restringido · Datos operativos</span>
      </footer>
    </main>
  );
}