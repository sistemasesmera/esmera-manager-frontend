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
    </div>
  );
}
