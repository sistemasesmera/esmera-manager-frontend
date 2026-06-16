import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import axiosInstance from "../../axios/axiosConfig";
import { useNotification } from "../../context/NotificationContext";
import Alumn from "../../types/frontend/alumn-temp";
import ActivityLog from "../../types/frontend/activityLog";

interface AlumnContract {
  id: string;
  name: string;
  coursePrice: number;
  createdAt: string;
  course: { id: string; name: string };
  user: { id: string; firstName: string; lastName: string };
  branch: { id: string; name: string };
}

const ACTION_LABEL: Record<string, string> = {
  ALUMNO_CREADO: "Alumno creado",
  ALUMNO_ACTUALIZADO: "Alumno actualizado",
  CONTRATO_CREADO: "Contrato creado",
  LEAD_CONVERTIDO_A_ALUMNO: "Convertido desde lead",
};

export default function AlumnDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [alumn, setAlumn] = useState<Alumn | null>(null);
  const [contracts, setContracts] = useState<AlumnContract[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [alumnRes, contractsRes, logsRes] = await Promise.all([
          axiosInstance.get(`/alumns/by-id/${id}`),
          axiosInstance.get(`/contracts/by-alumn/${id}`),
          axiosInstance.get("/audit-logs", {
            params: { entityType: "Alumn", entityId: id, limit: 20 },
          }),
        ]);
        setAlumn(alumnRes.data);
        setContracts(contractsRes.data);
        setActivityLogs(logsRes.data.data ?? []);
      } catch {
        setError("No se ha podido cargar la ficha del alumno.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleCreateContract = () => {
    if (!alumn) return;
    navigate("/contract-create", { state: { alumn } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center">
          <SpinnerThree />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando ficha del alumno...
          </p>
        </div>
      </div>
    );
  }

  if (error || !alumn) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error || "Alumno no encontrado."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`${alumn.firstName} ${alumn.lastName} | Esmera School`}
        description="Ficha de alumno"
      />
      <PageBreadcrumb pageTitle={`${alumn.firstName} ${alumn.lastName}`} />

      <div className="mb-4">
        <Link
          to="/alumns"
          className="text-sm text-brand-500 hover:underline dark:text-brand-400"
        >
          ← Volver a alumnos
        </Link>
      </div>

      {/* Datos del alumno */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] lg:p-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
            {alumn.firstName} {alumn.lastName}
          </h4>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              alumn.isVerified
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {alumn.isVerified ? "Verificado" : "No verificado"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {[
            { label: "Email", value: alumn.email },
            { label: "Teléfono", value: alumn.phone },
            {
              label: "Documento",
              value: `${alumn.documentType} · ${alumn.documentNumber}`,
            },
            {
              label: "Fecha de nacimiento",
              value: alumn.birthDate
                ? new Date(alumn.birthDate).toLocaleDateString("es-ES")
                : "—",
            },
            { label: "Dirección", value: alumn.address || "—" },
            {
              label: "Localidad",
              value: alumn.population
                ? `${alumn.population}, ${alumn.province} ${alumn.postalCode}`
                : "—",
            },
            {
              label: "Alta",
              value: new Date(alumn.createdAt).toLocaleDateString("es-ES"),
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <Label className="text-gray-500">{label}</Label>
              <p className="text-gray-800 dark:text-white/90 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-white/[0.05] pt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleCreateContract}>
            Crear nuevo contrato
          </Button>
        </div>
      </div>

      {/* Contratos */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] lg:p-8">
        <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
          Contratos ({contracts.length})
        </h5>

        {contracts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Este alumno no tiene contratos aún.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {contracts.map((c) => (
              <div
                key={c.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {c.course?.name ?? c.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {c.user?.firstName} {c.user?.lastName} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-700 dark:text-white/80">
                  {new Intl.NumberFormat("es-ES").format(c.coursePrice)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline de actividad */}
      {activityLogs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] lg:p-8">
          <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Historial de actividad
          </h5>
          <ol className="relative border-l border-gray-200 dark:border-white/[0.08] space-y-6 ml-3">
            {activityLogs.map((log) => (
              <li key={log.id} className="ml-4">
                <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {ACTION_LABEL[log.action] ?? log.action}
                  </p>
                  <time className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                {log.userEmail && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {log.userEmail}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
