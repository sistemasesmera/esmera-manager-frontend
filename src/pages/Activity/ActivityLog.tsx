import { useCallback, useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../icons";
import axiosInstance from "../../axios/axiosConfig";
import ActivityLog from "../../types/frontend/activityLog";

const ENTITY_OPTIONS = [
  { value: "", label: "Todas las entidades" },
  { value: "Lead", label: "Lead" },
  { value: "Contract", label: "Contrato" },
  { value: "Alumn", label: "Alumno" },
  { value: "User", label: "Comercial" },
  { value: "Course", label: "Curso" },
];

const ACTION_OPTIONS = [
  { value: "", label: "Todas las acciones" },
  { value: "LEAD_CREADO", label: "Lead creado" },
  { value: "LEAD_ESTADO_CAMBIADO", label: "Estado de lead cambiado" },
  { value: "LEAD_ASIGNADO", label: "Lead asignado" },
  { value: "LEAD_NOTAS_ACTUALIZADAS", label: "Notas de lead actualizadas" },
  { value: "LEAD_CONVERTIDO_A_ALUMNO", label: "Lead convertido a alumno" },
  { value: "CONTRATO_CREADO", label: "Contrato creado" },
  { value: "ALUMNO_CREADO", label: "Alumno creado" },
  { value: "ALUMNO_ACTUALIZADO", label: "Alumno actualizado" },
  { value: "COMERCIAL_CREADO", label: "Comercial creado" },
  { value: "COMERCIAL_ACTUALIZADO", label: "Comercial actualizado" },
  { value: "CURSO_CREADO", label: "Curso creado" },
  { value: "CURSO_ACTUALIZADO", label: "Curso actualizado" },
];

const ACTION_LABEL: Record<string, string> = Object.fromEntries(
  ACTION_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label])
);

// Color por grupo de acción
const ACTION_COLOR: Record<string, string> = {
  LEAD_CREADO:                "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  LEAD_ESTADO_CAMBIADO:       "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  LEAD_ASIGNADO:              "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  LEAD_NOTAS_ACTUALIZADAS:    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  LEAD_CONVERTIDO_A_ALUMNO:   "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  CONTRATO_CREADO:            "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  ALUMNO_CREADO:              "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  ALUMNO_ACTUALIZADO:         "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  COMERCIAL_CREADO:           "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  COMERCIAL_ACTUALIZADO:      "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  CURSO_CREADO:               "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  CURSO_ACTUALIZADO:          "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
};

const ENTITY_BADGE: Record<string, string> = {
  Lead:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Contract: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Alumn:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  User:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Course:   "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const ENTITY_LABEL: Record<string, string> = {
  Lead: "Lead", Contract: "Contrato", Alumn: "Alumno", User: "Comercial", Course: "Curso",
};

function formatDetails(action: string, details: Record<string, unknown> | null): string {
  if (!details) return "—";
  switch (action) {
    case "LEAD_ESTADO_CAMBIADO":
      return `${details.fromStatus} → ${details.toStatus}`;
    case "LEAD_ASIGNADO":
      return `→ ${details.assignedToEmail ?? details.assignedToId}`;
    case "LEAD_CONVERTIDO_A_ALUMNO":
      return `Alumno: ${details.alumnId}`;
    case "CONTRATO_CREADO":
      return `${details.alumnName} · ${details.courseName}`;
    case "ALUMNO_CREADO":
    case "ALUMNO_ACTUALIZADO":
      return `${details.firstName} ${details.lastName}`;
    case "COMERCIAL_CREADO":
    case "COMERCIAL_ACTUALIZADO":
      return `${details.email}`;
    case "CURSO_CREADO":
    case "CURSO_ACTUALIZADO":
      return `${details.name}`;
    default:
      return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(" · ");
  }
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
}

function quickRange(label: string): { start: string; end: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  switch (label) {
    case "Hoy": return { start: fmt(today), end: fmt(today) };
    case "Esta semana": {
      const d = new Date(today);
      const day = d.getDay() || 7;
      d.setDate(d.getDate() - (day - 1));
      return { start: fmt(d), end: fmt(today) };
    }
    case "Este mes": {
      return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end: fmt(today) };
    }
    default: return { start: "", end: "" };
  }
}

const LIMIT = 25;

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [commercials, setCommercials] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    axiosInstance.get("users/commercials-select").then(({ data }) => {
      setCommercials([
        { value: "", label: "Todos los usuarios" },
        ...data.map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })),
      ]);
    });
  }, []);

  const fetchLogs = useCallback(
    async (page = currentPage) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axiosInstance.get("audit-logs", {
          params: {
            entityType: entityType || undefined,
            action: action || undefined,
            userId: userId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            limit: LIMIT,
          },
        });
        setLogs(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      } catch {
        setError("Error al cargar los logs");
      } finally {
        setLoading(false);
      }
    },
    [entityType, action, userId, startDate, endDate, currentPage]
  );

  useEffect(() => { fetchLogs(1); /* eslint-disable-next-line */ }, []);

  const handleClear = () => {
    setEntityType(""); setAction(""); setUserId(""); setStartDate(""); setEndDate("");
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta title="Logs | Esmera Manager" description="Registro de actividad" />
      <PageBreadcrumb pageTitle="Logs" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header + filtros */}
        <div className="px-5 pt-5 pb-4 md:px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Logs de actividad</h3>
              {total > 0 && (
                <span className="rounded-full bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {total}
                </span>
              )}
            </div>
            {/* Quick filters */}
            <div className="hidden sm:flex items-center gap-1.5">
              {["Hoy", "Esta semana", "Este mes"].map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    const { start, end } = quickRange(label);
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  className="rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Select
                options={ENTITY_OPTIONS}
                defaultValue={entityType}
                onChange={(v) => setEntityType(v || "")}
                className="border border-gray-300 dark:border-gray-700"
              />
            </div>
            <div>
              <Select
                options={ACTION_OPTIONS}
                defaultValue={action}
                onChange={(v) => setAction(v || "")}
                className="border border-gray-300 dark:border-gray-700"
              />
            </div>
            <div>
              <Select
                options={commercials}
                defaultValue={userId}
                onChange={(v) => setUserId(v || "")}
                placeholder="Todos los usuarios"
                className="border border-gray-300 dark:border-gray-700"
              />
            </div>
            <div className="relative">
              <Flatpickr
                value={startDate}
                onChange={(dates: Date[]) => setStartDate(dates[0]?.toISOString().split("T")[0] || "")}
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Fecha inicio"
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring focus:border-brand-300 focus:ring-brand-500/10 bg-transparent text-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
              />
              <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                <CalenderIcon className="size-5" />
              </span>
            </div>
            <div className="relative">
              <Flatpickr
                value={endDate}
                onChange={(dates: Date[]) => setEndDate(dates[0]?.toISOString().split("T")[0] || "")}
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Fecha fin"
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring focus:border-brand-300 focus:ring-brand-500/10 bg-transparent text-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
              />
              <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                <CalenderIcon className="size-5" />
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => fetchLogs(1)}>Filtrar</Button>
            <Button size="sm" variant="outline" onClick={handleClear}>Limpiar</Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <SpinnerThree />
              <p className="text-sm text-gray-400 dark:text-gray-500">Cargando logs...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center py-14">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500">No hay registros para mostrar</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Fecha</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden sm:table-cell">Usuario</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Acción</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden md:table-cell">Entidad</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden lg:table-cell">Detalles</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {logs.map((log) => {
                  const { date, time } = fmtDate(log.createdAt);
                  const actionColor = ACTION_COLOR[log.action] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
                  const entityBadge = log.entityType ? (ENTITY_BADGE[log.entityType] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400") : null;
                  return (
                    <TableRow key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{date}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{time}</p>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 hidden sm:table-cell">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                          {log.userEmail ?? <span className="italic text-gray-300 dark:text-gray-600">—</span>}
                        </p>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColor}`}>
                          {ACTION_LABEL[log.action] ?? log.action}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 hidden md:table-cell">
                        {entityBadge ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entityBadge}`}>
                            {ENTITY_LABEL[log.entityType!] ?? log.entityType}
                          </span>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 hidden lg:table-cell">
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[260px] truncate" title={formatDetails(log.action, log.details)}>
                          {formatDetails(log.action, log.details)}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Paginación */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] md:px-6">
            <Button size="sm" variant="outline" onClick={() => fetchLogs(currentPage - 1)} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Página <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> de{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
            </span>
            <Button size="sm" variant="outline" onClick={() => fetchLogs(currentPage + 1)} disabled={currentPage === totalPages}>
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
