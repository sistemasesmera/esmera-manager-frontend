import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
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

function timelineDetail(log: ActivityLog): string {
  const d = log.details;
  if (!d) return "";
  switch (log.action) {
    case "LEAD_ESTADO_CAMBIADO":
      return `${d.fromStatus} → ${d.toStatus}`;
    case "LEAD_ASIGNADO":
      return `Asignado a: ${d.assignedToEmail ?? d.assignedToId}`;
    case "LEAD_CONVERTIDO_A_ALUMNO":
      return `Alumno creado`;
    default:
      return "";
  }
}

const statusOptions = Object.values(LeadStatus).map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
}));

const discardReasonOptions = Object.values(LeadDiscardReason).map(
  (value) => ({
    value,
    label: LEAD_DISCARD_REASON_LABELS[value],
  })
);

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();

  const canAssign = user?.role === "ADMIN" || user?.role === "COMMERCIAL_PLUS";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<LeadStatus>(LeadStatus.NUEVO);
  const [discardReason, setDiscardReason] = useState<LeadDiscardReason | "">(
    ""
  );
  const [discardReasonOther, setDiscardReasonOther] = useState("");

  const [assignedToId, setAssignedToId] = useState("");
  const [commercials, setCommercials] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [savingNextContact, setSavingNextContact] = useState(false);

  const [nextContactDate, setNextContactDate] = useState("");

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [showConvertForm, setShowConvertForm] = useState(false);

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
        setAssignedToId(data.assignedTo?.id ?? "");
        setNextContactDate(
          data.nextContactDate ? data.nextContactDate.slice(0, 10) : ""
        );
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
    if (!canAssign) return;

    const fetchCommercials = async () => {
      try {
        const { data } = await axiosInstance.get("/users/commercials-select");
        setCommercials(data);
      } catch (err) {
        console.error("Error al cargar comerciales:", err);
      }
    };

    fetchCommercials();
  }, [canAssign]);

  useEffect(() => {
    if (!id) return;
    axiosInstance
      .get("/audit-logs", {
        params: { entityType: "Lead", entityId: id, limit: 20 },
      })
      .then(({ data }) => setActivityLogs(data.data ?? []))
      .catch(() => {});
  }, [id]);

  const handleSaveNotes = async () => {
    if (!lead) return;
    try {
      setSavingNotes(true);
      const { data } = await axiosInstance.patch(`/leads/${lead.id}`, {
        notes,
      });
      setLead(data);
      showNotification("success", "Lead", "Notas actualizadas correctamente");
    } catch (error: any) {
      console.error(
        "Error al actualizar las notas:",
        error.response?.data || error.message
      );
      showNotification("error", "Lead", "Error al actualizar las notas");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!lead) return;
    if (status === LeadStatus.DESCARTADO && !discardReason) {
      showNotification(
        "error",
        "Lead",
        "Selecciona un motivo de descarte para pasar el lead a Descartado"
      );
      return;
    }

    try {
      setSavingStatus(true);
      const payload: Record<string, unknown> = { status };
      if (status === LeadStatus.DESCARTADO) {
        payload.discardReason = discardReason;
        payload.discardReasonOther = discardReasonOther || undefined;
      }
      const { data } = await axiosInstance.patch(
        `/leads/${lead.id}/status`,
        payload
      );
      setLead(data);
      showNotification("success", "Lead", "Estado actualizado correctamente");
    } catch (error: any) {
      console.error(
        "Error al actualizar el estado:",
        error.response?.data || error.message
      );
      showNotification(
        "error",
        "Lead",
        error.response?.data?.message || "Error al actualizar el estado"
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssign = async () => {
    if (!lead || !assignedToId) return;

    try {
      setSavingAssign(true);
      const { data } = await axiosInstance.patch(`/leads/${lead.id}/assign`, {
        assignedToId,
      });
      setLead(data);
      showNotification("success", "Lead", "Lead asignado correctamente");
    } catch (error: any) {
      console.error(
        "Error al asignar el lead:",
        error.response?.data || error.message
      );
      showNotification("error", "Lead", "Error al asignar el lead");
    } finally {
      setSavingAssign(false);
    }
  };

  const handleSaveNextContact = async () => {
    if (!lead) return;
    try {
      setSavingNextContact(true);
      const { data } = await axiosInstance.patch(`/leads/${lead.id}`, {
        nextContactDate: nextContactDate || null,
      });
      setLead(data);
      showNotification(
        "success",
        "Lead",
        nextContactDate
          ? "Próximo contacto guardado"
          : "Próximo contacto eliminado"
      );
    } catch {
      showNotification("error", "Lead", "Error al guardar el próximo contacto");
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
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center">
          <SpinnerThree />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando ficha del lead...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error || "No se ha encontrado el lead."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`${lead.name} - Ficha de Lead | Esmera School`}
        description="Ficha de detalle del lead."
      />
      <PageBreadcrumb pageTitle={lead.name} />

      <div className="mb-4">
        <Link
          to="/leads"
          className="text-sm text-brand-500 hover:underline dark:text-brand-400"
        >
          ← Volver al listado
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] lg:p-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
            {lead.name}
          </h4>
          <LeadStatusBadge status={lead.status} />
        </div>

        {/* Datos del lead */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
          <div>
            <Label className="text-gray-500">Teléfono</Label>
            <p className="text-gray-800 dark:text-white/90">{lead.phone}</p>
          </div>
          <div>
            <Label className="text-gray-500">Correo</Label>
            <p className="text-gray-800 dark:text-white/90">
              {lead.email || "-"}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">Curso de interés</Label>
            <p className="text-gray-800 dark:text-white/90">
              {lead.nameCourse || "-"}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">Categoría</Label>
            <p className="text-gray-800 dark:text-white/90">
              {lead.categoryCourse || "-"}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">Origen</Label>
            <p className="text-gray-800 dark:text-white/90">
              {LEAD_SOURCE_LABELS[lead.source]}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">Sede</Label>
            <p className="text-gray-800 dark:text-white/90">
              {lead.branch?.name || "-"}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">Asignado a</Label>
            <p className="text-gray-800 dark:text-white/90">
              {lead.assignedTo
                ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                : "Sin asignar"}
            </p>
          </div>
          <div>
            <Label className="text-gray-500">Creado</Label>
            <p className="text-gray-800 dark:text-white/90">
              {new Date(lead.createdAt).toLocaleString("es-ES", {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </p>
          </div>
          {lead.status === LeadStatus.DESCARTADO && lead.discardReason && (
            <div className="col-span-2">
              <Label className="text-gray-500">Motivo de descarte</Label>
              <p className="text-gray-800 dark:text-white/90">
                {LEAD_DISCARD_REASON_LABELS[lead.discardReason]}
                {lead.discardReasonOther
                  ? ` - ${lead.discardReasonOther}`
                  : ""}
              </p>
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="mb-6">
          <Label>Notas</Label>
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="Observaciones sobre el lead..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNotes}
              disabled={savingNotes}
            >
              {savingNotes ? "Guardando..." : "Guardar notas"}
            </Button>
          </div>
        </div>

        {/* Cambio de estado */}
        <div className="mb-6 border-t border-gray-200 dark:border-white/[0.05] pt-4">
          <Label>Estado del lead</Label>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Select
                options={statusOptions}
                defaultValue={status}
                onChange={(value) => setStatus(value as LeadStatus)}
                className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
              />
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveStatus}
              disabled={savingStatus}
            >
              {savingStatus ? "Guardando..." : "Guardar estado"}
            </Button>
          </div>

          {status === LeadStatus.DESCARTADO && (
            <div className="mt-3 space-y-3">
              <div>
                <Label>Motivo de descarte</Label>
                <Select
                  options={discardReasonOptions}
                  defaultValue={discardReason}
                  onChange={(value) =>
                    setDiscardReason(value as LeadDiscardReason)
                  }
                  placeholder="Selecciona un motivo"
                  className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                />
              </div>
              {discardReason === LeadDiscardReason.OTRO && (
                <div>
                  <Label>Detalle del motivo</Label>
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

        {/* Asignación */}
        {canAssign && (
          <div className="mb-6 border-t border-gray-200 dark:border-white/[0.05] pt-4">
            <Label>Asignar a comercial</Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Select
                  options={commercials.map((c) => ({
                    value: c.id,
                    label: `${c.firstName} ${c.lastName}`,
                  }))}
                  defaultValue={assignedToId}
                  onChange={(value) => setAssignedToId(value)}
                  placeholder="Selecciona un comercial"
                  className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                />
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAssign}
                disabled={savingAssign || !assignedToId}
              >
                {savingAssign ? "Guardando..." : "Asignar"}
              </Button>
            </div>
          </div>
        )}

        {/* Próximo contacto */}
        <div className="mb-6 border-t border-gray-200 dark:border-white/[0.05] pt-4">
          <Label>Próximo contacto</Label>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="relative flex-1">
              <Flatpickr
                value={nextContactDate}
                onChange={(dates: Date[]) =>
                  setNextContactDate(
                    dates[0]?.toISOString().split("T")[0] ?? ""
                  )
                }
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Seleccionar fecha"
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <CalenderIcon className="size-5" />
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveNextContact}
                disabled={savingNextContact}
              >
                {savingNextContact ? "Guardando..." : "Guardar"}
              </Button>
              {nextContactDate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNextContactDate("");
                    handleSaveNextContact();
                  }}
                  disabled={savingNextContact}
                >
                  Quitar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Conversión a alumno / contrato */}
        <div className="border-t border-gray-200 dark:border-white/[0.05] pt-4">
          {lead.convertedAlumn ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm">
                <Label className="text-gray-500">Alumno convertido</Label>
                <p className="text-gray-800 dark:text-white/90">
                  {lead.convertedAlumn.firstName}{" "}
                  {lead.convertedAlumn.lastName}
                </p>
              </div>
              <Button size="sm" variant="primary" onClick={handleCreateContract}>
                Crear contrato para este alumno
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowConvertForm(true)}
            >
              Hacer matrícula
            </Button>
          )}
        </div>
      </div>

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

      {/* Timeline de actividad */}
      {activityLogs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] lg:p-8">
          <h5 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Historial de actividad
          </h5>
          <ol className="relative border-l border-gray-200 dark:border-white/[0.08] space-y-6 ml-3">
            {activityLogs.map((log) => {
              const detail = timelineDetail(log);
              return (
                <li key={log.id} className="ml-4">
                  <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {ACTION_LABEL[log.action] ?? log.action}
                      {detail && (
                        <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                          · {detail}
                        </span>
                      )}
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
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
