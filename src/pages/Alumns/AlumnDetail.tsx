import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import axiosInstance from "../../axios/axiosConfig";
import Alumn from "../../types/frontend/alumn-temp";
import ActivityLog from "../../types/frontend/activityLog";

interface AlumnContract {
  id: string;
  name: string;
  coursePrice: number;
  createdAt: string;
  course: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string } | null;
  branch: { id: string; name: string } | null;
}

const ACTION_LABEL: Record<string, string> = {
  ALUMNO_CREADO: "Alumno creado",
  ALUMNO_ACTUALIZADO: "Alumno actualizado",
  CONTRATO_CREADO: "Contrato creado",
  LEAD_CONVERTIDO_A_ALUMNO: "Convertido desde lead",
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-2xl font-bold shrink-0">
      {letters}
    </div>
  );
}

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value || <span className="text-gray-300 dark:text-gray-600 italic font-normal">—</span>}
    </p>
  </div>
);

export default function AlumnDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [alumn, setAlumn] = useState<Alumn | null>(null);
  const [contracts, setContracts] = useState<AlumnContract[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      const [alumnRes, contractsRes, logsRes] = await Promise.allSettled([
        axiosInstance.get(`/alumns/by-id/${id}`),
        axiosInstance.get(`/contracts/by-alumn/${id}`),
        axiosInstance.get("/audit-logs", {
          params: { entityType: "Alumn", entityId: id, limit: 20 },
        }),
      ]);

      if (alumnRes.status === "fulfilled") {
        setAlumn(alumnRes.value.data);
      } else {
        setError("Alumno no encontrado.");
      }
      if (contractsRes.status === "fulfilled") {
        setContracts(contractsRes.value.data ?? []);
      }
      if (logsRes.status === "fulfilled") {
        setActivityLogs(logsRes.value.data?.data ?? []);
      }
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);
  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("es-ES") : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <SpinnerThree />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando ficha del alumno...</p>
        </div>
      </div>
    );
  }

  if (error || !alumn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error || "Alumno no encontrado."}
        </p>
        <Button size="sm" variant="outline" onClick={() => navigate("/alumns")}>
          ← Volver a alumnos
        </Button>
      </div>
    );
  }

  const totalGastado = contracts.reduce((s, c) => s + (c.coursePrice ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageMeta
        title={`${alumn.firstName} ${alumn.lastName} | Esmera School`}
        description="Ficha de alumno"
      />
      <PageBreadcrumb pageTitle={`${alumn.firstName} ${alumn.lastName}`} />

      {/* ── Cabecera ── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Initials name={`${alumn.firstName} ${alumn.lastName}`} />
            <div>
              <h2 className="text-xl font-bold text-white">
                {alumn.firstName} {alumn.lastName}
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">{alumn.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    alumn.isVerified
                      ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                      : "bg-red-500/20 text-red-200 border-red-400/30"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${alumn.isVerified ? "bg-emerald-400" : "bg-red-400"}`} />
                  {alumn.isVerified ? "Verificado" : "Sin verificar"}
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/10 text-slate-200 border border-white/20">
                  {alumn.documentType} · {alumn.documentNumber}
                </span>
              </div>
            </div>
          </div>

          {/* KPIs rápidos */}
          <div className="flex gap-4 sm:gap-6 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{contracts.length}</p>
              <p className="text-xs text-slate-300 mt-0.5">Contratos</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{fmt(totalGastado)} €</p>
              <p className="text-xs text-slate-300 mt-0.5">Total invertido</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Datos personales ── */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 lg:p-7">
        <h5 className="text-sm font-semibold text-gray-700 dark:text-white/80 uppercase tracking-wide mb-5">
          Datos personales
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
          <Field label="Nombre" value={alumn.firstName} />
          <Field label="Apellido" value={alumn.lastName} />
          <Field label="Teléfono" value={alumn.phone} />
          <Field label="Email" value={alumn.email} />
          <Field label="Fecha de nacimiento" value={fmtDate(alumn.birthDate)} />
          <Field label="Código alumno" value={alumn.code} />
          <div className="col-span-full border-t border-gray-100 dark:border-white/[0.06]" />
          <Field label="Tipo de documento" value={alumn.documentType} />
          <Field label="Número de documento" value={alumn.documentNumber} />
          <div />
          <div className="col-span-full border-t border-gray-100 dark:border-white/[0.06]" />
          <Field label="Dirección" value={alumn.address} />
          <Field label="Código postal" value={alumn.postalCode} />
          <Field label="Población" value={alumn.population} />
          <Field label="Provincia" value={alumn.province} />
          <div className="col-span-full border-t border-gray-100 dark:border-white/[0.06]" />
          <Field
            label="Alta en el sistema"
            value={new Date(alumn.createdAt).toLocaleDateString("es-ES")}
          />
          <Field
            label="Última actualización"
            value={new Date(alumn.updatedAt).toLocaleDateString("es-ES")}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.06] flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/contract-create", { state: { alumn } })}
          >
            Crear nuevo contrato
          </Button>
        </div>
      </div>

      {/* ── Contratos ── */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 lg:p-7">
        <h5 className="text-sm font-semibold text-gray-700 dark:text-white/80 uppercase tracking-wide mb-4">
          Contratos ({contracts.length})
        </h5>

        {contracts.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
            Este alumno no tiene contratos aún.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {contracts.map((c) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {c.course?.name ?? c.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {c.user ? `${c.user.firstName} ${c.user.lastName}` : "—"}
                    {" · "}
                    {fmtDate(c.createdAt)}
                    {c.branch?.name ? ` · ${c.branch.name}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {fmt(c.coursePrice)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Timeline de actividad (solo si hay acceso) ── */}
      {activityLogs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 lg:p-7">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-white/80 uppercase tracking-wide mb-5">
            Historial de actividad
          </h5>
          <ol className="relative border-l border-gray-200 dark:border-white/[0.08] space-y-5 ml-3">
            {activityLogs.map((log) => (
              <li key={log.id} className="ml-5">
                <span className="absolute -left-1.5 flex h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900" />
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
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{log.userEmail}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div>
        <button
          onClick={() => navigate("/alumns")}
          className="text-sm text-brand-500 hover:underline dark:text-brand-400"
        >
          ← Volver a alumnos
        </button>
      </div>
    </div>
  );
}
