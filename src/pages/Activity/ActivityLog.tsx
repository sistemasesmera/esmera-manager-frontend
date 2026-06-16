import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Flatpickr from "react-flatpickr";
import Label from "../../components/form/Label";
import { CalenderIcon } from "../../icons";
import axiosInstance from "../../axios/axiosConfig";
import ActivityLog from "../../types/frontend/activityLog";

const ENTITY_TYPE_OPTIONS = [
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

function formatDetails(action: string, details: Record<string, unknown> | null): string {
  if (!details) return "—";
  switch (action) {
    case "LEAD_ESTADO_CAMBIADO":
      return `${details.fromStatus} → ${details.toStatus}`;
    case "LEAD_ASIGNADO":
      return `Asignado a: ${details.assignedToEmail ?? details.assignedToId}`;
    case "LEAD_CONVERTIDO_A_ALUMNO":
      return `Alumno ID: ${details.alumnId}`;
    case "CONTRATO_CREADO":
      return `${details.alumnName} · ${details.courseName}`;
    case "ALUMNO_CREADO":
      return `${details.firstName} ${details.lastName} (${details.email})`;
    case "ALUMNO_ACTUALIZADO":
      return `${details.firstName} ${details.lastName}`;
    case "COMERCIAL_CREADO":
      return `${details.email} · ${details.role}`;
    case "COMERCIAL_ACTUALIZADO":
      return `${details.email}`;
    case "CURSO_CREADO":
    case "CURSO_ACTUALIZADO":
      return `${details.name}`;
    default:
      return Object.entries(details)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
  }
}

const ACTION_LABEL: Record<string, string> = Object.fromEntries(
  ACTION_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label])
);

const ENTITY_BADGE: Record<string, string> = {
  Lead: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Contract: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Alumn: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  User: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Course: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

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
      const formatted = data.map((c: any) => ({
        value: c.id,
        label: c.active
          ? `${c.firstName} ${c.lastName}`
          : `${c.firstName} ${c.lastName} (Inactivo)`,
      }));
      setCommercials([{ value: "", label: "Todos los usuarios" }, ...formatted]);
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
        setError("Error al cargar el registro de actividad");
      } finally {
        setLoading(false);
      }
    },
    [entityType, action, userId, startDate, endDate, currentPage]
  );

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    fetchLogs(1);
  };

  const handleClear = () => {
    setEntityType("");
    setAction("");
    setUserId("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchLogs(page);
  };

  return (
    <>
      <PageMeta title="Actividad | Esmera Manager" description="Registro de actividad" />
      <PageBreadcrumb pageTitle="Actividad" />
      <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="gap-2 px-5 mb-4 space-y-6">
          <div className="flex w-full justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Registro de actividad
            </h3>
            {total > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {total} registros
              </span>
            )}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="flex flex-col">
              <Label>Entidad</Label>
              <Select
                options={ENTITY_TYPE_OPTIONS}
                defaultValue={entityType}
                onChange={(v) => setEntityType(v || "")}
                className="dark:bg-dark-900 border"
              />
            </div>

            <div className="flex flex-col">
              <Label>Acción</Label>
              <Select
                options={ACTION_OPTIONS}
                defaultValue={action}
                onChange={(v) => setAction(v || "")}
                className="dark:bg-dark-900 border"
              />
            </div>

            <div className="flex flex-col">
              <Label>Usuario</Label>
              <Select
                options={commercials}
                defaultValue={userId}
                onChange={(v) => setUserId(v || "")}
                placeholder="Todos los usuarios"
                className="dark:bg-dark-900 border"
              />
            </div>

            <div className="flex flex-col">
              <Label>Fecha inicio</Label>
              <div className="relative w-full">
                <Flatpickr
                  value={startDate}
                  onChange={(dates: Date[]) =>
                    setStartDate(dates[0]?.toISOString().split("T")[0] || "")
                  }
                  options={{ dateFormat: "Y-m-d" }}
                  placeholder="Fecha inicio"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <Label>Fecha fin</Label>
              <div className="relative w-full">
                <Flatpickr
                  value={endDate}
                  onChange={(dates: Date[]) =>
                    setEndDate(dates[0]?.toISOString().split("T")[0] || "")
                  }
                  options={{ dateFormat: "Y-m-d" }}
                  placeholder="Fecha fin"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleFilter}>
              Filtrar
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Limpiar filtros
            </Button>
          </div>
        </div>

        <div className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <SpinnerThree />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Cargando actividad...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay registros de actividad
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Fecha
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Usuario
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Acción
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Entidad
                  </TableCell>
                  <TableCell isHeader className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    Detalles
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                      {log.userEmail ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-400">
                      {ACTION_LABEL[log.action] ?? log.action}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {log.entityType ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            ENTITY_BADGE[log.entityType] ??
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {log.entityType}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDetails(log.action, log.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Paginación */}
        <nav
          className="flex items-center justify-center space-x-2 py-5"
          aria-label="Pagination"
        >
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </nav>
      </div>
    </>
  );
}
