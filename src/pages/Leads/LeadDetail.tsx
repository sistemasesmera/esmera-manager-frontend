import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../icons";
import axiosInstance from "../../axios/axiosConfig";
import { useNotification } from "../../context/NotificationContext";
import Lead, {
  LeadStatus,
  LeadDiscardReason,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_DISCARD_REASON_LABELS,
} from "../../types/frontend/lead";
import { LeadStatusBadge } from "../../components/leads/LeadStatusBadge";
import ConvertLeadModal from "../../components/leads/Modals/ConvertLeadModal";
import ActivityLog from "../../types/frontend/activityLog";

const ACTION_LABEL: Record<string, string> = {
  LEAD_CREADO: "Lead creado",
  LEAD_ESTADO_CAMBIADO: "Estado cambiado",
  LEAD_ASIGNADO: "Lead asignado",
  LEAD_NOTAS_ACTUALIZADAS: "Notas actualizadas",
  LEAD_CONVERTIDO_A_ALUMNO: "Convertido a alumno",
};

const SOURCE_CHIP: Record<string, string> = {
  WEB:        "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
  WEB_ONLINE: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
  MANUAL:     "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  META_ADS:   "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
};

function timelineDetail(log: ActivityLog): string {
  const d = log.details;
  if (!d) return "";
  switch (log.action) {
    case "LEAD_ESTADO_CAMBIADO":
      return `${d.fromStatus} → ${d.toStatus}`;
    case "LEAD_ASIGNADO":
      return `Asignado a: ${d.assignedToEmail ?? d.assignedToId}`;
    case "LEAD_CONVERTIDO_A_ALUMNO":
      return "Alumno creado";
    default:
      return "";
  }
}

const statusOptions = Object.values(LeadStatus).map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
}));

const discardReasonOptions = Object.values(LeadDiscardReason).map((value) => ({
  value,
  label: LEAD_DISCARD_REASON_LABELS[value],
}));

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 dark:text-white/90">{value || "—"}</span>
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);
  const canAssign = user?.role === "ADMIN" || user?.role === "COMMERCIAL_PLUS";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<LeadStatus>(LeadStatus.SIN_ASIGNAR);
  const [discardReason, setDiscardReason] = useState<LeadDiscardReason | "">("");
  const [discardReasonOther, setDiscardReasonOther] = useState("");

  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNextContact, setSavingNextContact] = useState(false);
  const [nextContactDate, setNextContactDate] = useState("");

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showConvertForm, setShowConvertForm] = useState(false);

  const [commercials, setCommercials] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [assigning, setAssigning] = useState(false);

  const isManageable = !!lead?.assignedTo;

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/leads/${id}`);
        setLead(data);
        setNotes(data.notes ?? "");
        setStatus(data.status);
        setDiscardReason(data.discardReason ?? "");
        setDiscardReasonOther(data.discardReasonOther ?? "");
        setNextContactDate(data.nextContactDate ? data.nextContactDate.slice(0, 10) : "");
        setError(null);
      } catch {
        setError("Ha ocurrido un error, por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    axiosInstance
      .get("/audit-logs", { params: { entityType: "Lead", entityId: id, limit: 20 } })
      .then(({ data }) => setActivityLogs(data.data ?? []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!canAssign) return;
    axiosInstance
      .get("/users/commercials-select")
      .then(({ data }) => setCommercials(data))
      .catch(() => {});
  }, [canAssign]);

  const handleAssign = async (assignedToId: string) => {
    if (!lead || !assignedToId) return;
    setAssigning(true);
    try {
      const { data } = await axiosInstance.patch(`/leads/${lead.id}/assign`, { assignedToId });
      setLead(data);
      showNotification("success", "Lead", "Lead asignado correctamente");
    } catch {
      showNotification("error", "Lead", "Error al asignar el lead");
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setSavingNotes(true);
    try {
      const { data } = await axiosInstance.patch(`/leads/${lead.id}`, { notes });
      setLead(data);
      showNotification("success", "Lead", "Notas guardadas");
    } catch {
      showNotification("error", "Lead", "Error al guardar las notas");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!lead) return;
    if (status === LeadStatus.DESCARTADO && !discardReason) {
      showNotification("error", "Lead", "Selecciona un motivo de descarte");
      return;
    }
    setSavingStatus(true);
    try {
      const payload: Record<string, unknown> = { status };
      if (status === LeadStatus.DESCARTADO) {
        payload.discardReason = discardReason;
        payload.discardReasonOther = discardReasonOther || undefined;
      }
      const { data } = await axiosInstance.patch(`/leads/${lead.id}/status`, payload);
      setLead(data);
      showNotification("success", "Lead", "Estado actualizado");
    } catch (err: any) {
      showNotification("error", "Lead", err.response?.data?.message || "Error al actualizar");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNextContact = async (dateOverride?: string) => {
    if (!lead) return;
    const date = dateOverride !== undefined ? dateOverride : nextContactDate;
    setSavingNextContact(true);
    try {
      const { data } = await axiosInstance.patch(`/leads/${lead.id}`, {
        nextContactDate: date || null,
      });
      setLead(data);
      showNotification("success", "Lead", date ? "Próximo contacto guardado" : "Próximo contacto eliminado");
    } catch {
      showNotification("error", "Lead", "Error al guardar");
    } finally {
      setSavingNextContact(false);
    }
  };

  const handleCreateContract = () => {
    if (!lead?.convertedAlumn) return;
    navigate("/contract-create", { state: { alumn: lead.convertedAlumn } });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <SpinnerThree />
        <p className="text-sm text-gray-400">Cargando ficha del lead...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-sm font-medium text-red-500">{error || "No se ha encontrado el lead."}</p>
      </div>
    );
  }

  const initials = lead.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">
      <PageMeta title={`${lead.name} · Lead | Esmera`} description="Ficha del lead" />

      {/* Back */}
      <div>
        <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:underline dark:text-brand-400">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Volver al listado
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-gray-800 dark:text-white/90">{lead.name}</h1>
              <LeadStatusBadge status={lead.status} />
              {lead.source && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_CHIP[lead.source] ?? "bg-gray-100 text-gray-500"}`}>
                  {LEAD_SOURCE_LABELS[lead.source]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-brand-500">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                {lead.phone}
              </a>
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-brand-500 truncate">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  {lead.email}
                </a>
              )}
              {lead.branch?.name && (
                <span className="flex items-center gap-1">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  {lead.branch.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 sm:text-right shrink-0">
            <p>Creado</p>
            <p className="font-medium text-gray-600 dark:text-gray-400">
              {new Date(lead.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Banner: lead sin asignar */}
      {!isManageable && (
        <div className="rounded-2xl border border-dashed border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
            Este lead está sin asignar. No se puede gestionar (estado, notas, próximo contacto o matrícula) hasta asignarlo a un comercial.
            {assigning && " Asignando..."}
          </p>
          {canAssign && (
            <div className="w-full sm:w-[220px]">
              <Select
                options={[
                  { value: "", label: "Asignar a..." },
                  ...commercials.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })),
                ]}
                defaultValue=""
                onChange={handleAssign}
                className="border border-rose-200 dark:border-rose-800"
              />
            </div>
          )}
        </div>
      )}

      {/* Body: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT — Info (read-only) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              Información
            </h3>
            <div className="space-y-3">
              <InfoRow label="Curso de interés" value={lead.nameCourse} />
              <InfoRow label="Categoría" value={lead.categoryCourse} />
              {canAssign && isManageable ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Asignado a</span>
                  <Select
                    options={commercials.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                    defaultValue={lead.assignedTo?.id ?? ""}
                    onChange={handleAssign}
                    className="border border-gray-200 dark:border-gray-700"
                  />
                </div>
              ) : (
                <InfoRow label="Asignado a" value={
                  lead.assignedTo
                    ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                    : <span className="text-gray-300 dark:text-gray-600">Sin asignar</span>
                } />
              )}
              {lead.status === LeadStatus.DESCARTADO && lead.discardReason && (
                <InfoRow
                  label="Motivo de descarte"
                  value={`${LEAD_DISCARD_REASON_LABELS[lead.discardReason]}${lead.discardReasonOther ? ` · ${lead.discardReasonOther}` : ""}`}
                />
              )}
            </div>
          </div>

          {/* Conversión */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342m-7.482 0c-.359.201-.718.405-1.076.61m7.26-1.282c.359.2.719.404 1.076.61" />
              </svg>
              Matrícula
            </h3>
            {lead.convertedAlumn ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                    {lead.convertedAlumn.firstName[0]}
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Alumno creado</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {lead.convertedAlumn.firstName} {lead.convertedAlumn.lastName}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={handleCreateContract} className="w-full justify-center">
                  Crear contrato
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  {isManageable
                    ? "Aún no se ha matriculado. Cuando esté listo, conviértelo en alumno."
                    : "Asigna este lead a un comercial antes de poder matricularlo."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConvertForm(true)}
                  disabled={!isManageable}
                  className="w-full justify-center"
                >
                  Hacer matrícula
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Acciones */}
        <div className="lg:col-span-3 space-y-4">

          {/* Estado */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              Estado del lead
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Select
                  options={statusOptions}
                  defaultValue={status}
                  onChange={(v) => setStatus(v as LeadStatus)}
                  className="border border-gray-200 dark:border-gray-700"
                />
              </div>
              <Button size="sm" variant="primary" onClick={handleSaveStatus} disabled={savingStatus || !isManageable}>
                {savingStatus ? "Guardando..." : "Guardar"}
              </Button>
            </div>
            {status === LeadStatus.DESCARTADO && (
              <div className="mt-3 space-y-3 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
                <div>
                  <Label>Motivo de descarte</Label>
                  <Select
                    options={discardReasonOptions}
                    defaultValue={discardReason}
                    onChange={(v) => setDiscardReason(v as LeadDiscardReason)}
                    placeholder="Selecciona un motivo"
                    className="border border-gray-200 dark:border-gray-700"
                  />
                </div>
                {discardReason === LeadDiscardReason.OTRO && (
                  <div>
                    <Label>Detalle</Label>
                    <Input
                      type="text"
                      value={discardReasonOther}
                      onChange={(e) => setDiscardReasonOther(e.target.value)}
                      placeholder="Especifica el motivo"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Próximo contacto */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Próximo contacto
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1">
                <Flatpickr
                  value={nextContactDate}
                  onChange={(dates: Date[]) =>
                    setNextContactDate(dates[0]?.toISOString().split("T")[0] ?? "")
                  }
                  options={{ dateFormat: "Y-m-d" }}
                  placeholder="Seleccionar fecha"
                  className="h-10 w-full rounded-lg border px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                />
                <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                  <CalenderIcon className="size-4" />
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => handleSaveNextContact()} disabled={savingNextContact || !isManageable}>
                  {savingNextContact ? "..." : "Guardar"}
                </Button>
                {nextContactDate && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingNextContact || !isManageable}
                    onClick={() => { setNextContactDate(""); handleSaveNextContact(""); }}
                  >
                    Quitar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 1.687-.733c-.226.043-.426.194-.56.4L1 2.98l4.25 4.25-4.25 2.12v1.42l4.27-2.13.002 4.27h1.42l2.12-4.25 4.25 4.25 1.283-.127c.206-.134.357-.334.4-.56l-4.22-15.175ZM6 9.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
              Notas internas
            </h3>
            <TextArea
              value={notes}
              onChange={setNotes}
              placeholder="Observaciones sobre este lead..."
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={savingNotes || !isManageable}>
                {savingNotes ? "Guardando..." : "Guardar notas"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ConvertLeadModal */}
      <ConvertLeadModal
        lead={lead}
        isOpen={showConvertForm}
        onClose={() => setShowConvertForm(false)}
        onConverted={(updatedLead, alumn) => {
          setLead(updatedLead);
          setShowConvertForm(false);
          navigate("/contract-create", { state: { alumn } });
        }}
      />

      {/* Timeline */}
      {activityLogs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 md:p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-5 flex items-center gap-2">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Historial de actividad
          </h3>
          <ol className="relative border-l border-gray-200 dark:border-white/[0.08] space-y-5 ml-3">
            {activityLogs.map((log) => {
              const detail = timelineDetail(log);
              return (
                <li key={log.id} className="ml-5">
                  <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 ring-4 ring-white dark:ring-gray-900" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {ACTION_LABEL[log.action] ?? log.action}
                      {detail && (
                        <span className="ml-2 font-normal text-gray-400 dark:text-gray-500">· {detail}</span>
                      )}
                    </p>
                    <time className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-ES", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {log.userEmail && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{log.userEmail}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
