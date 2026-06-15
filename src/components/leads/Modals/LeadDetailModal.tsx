import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import TextArea from "../../form/input/TextArea";
import Select from "../../form/Select";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Lead, {
  LeadStatus,
  LeadDiscardReason,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_DISCARD_REASON_LABELS,
} from "../../../types/frontend/lead";
import ConvertLeadModal from "./ConvertLeadModal";

interface Props {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
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

export const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  [LeadStatus.NUEVO]:
    "bg-blue-100 text-blue-600 dark:bg-blue-700 dark:text-white",
  [LeadStatus.CONTACTADO]:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-700 dark:text-white",
  [LeadStatus.EN_SEGUIMIENTO]:
    "bg-purple-100 text-purple-600 dark:bg-purple-700 dark:text-white",
  [LeadStatus.MATRICULADO]:
    "bg-green-100 text-green-600 dark:bg-green-700 dark:text-white",
  [LeadStatus.DESCARTADO]:
    "bg-red-100 text-red-600 dark:bg-red-700 dark:text-white",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${STATUS_BADGE_CLASSES[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}

export default function LeadDetailModal({ lead, onUpdate }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const canAssign = user?.role === "ADMIN" || user?.role === "COMMERCIAL_PLUS";

  const [notes, setNotes] = useState(lead.notes ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [discardReason, setDiscardReason] = useState<LeadDiscardReason | "">(
    lead.discardReason ?? ""
  );
  const [discardReasonOther, setDiscardReasonOther] = useState(
    lead.discardReasonOther ?? ""
  );

  const [assignedToId, setAssignedToId] = useState(lead.assignedTo?.id ?? "");
  const [commercials, setCommercials] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);

  const [showConvertForm, setShowConvertForm] = useState(false);

  useEffect(() => {
    if (!isOpen || !canAssign) return;

    const fetchCommercials = async () => {
      try {
        const { data } = await axiosInstance.get("/users/commercials-select");
        setCommercials(data);
      } catch (err) {
        console.error("Error al cargar comerciales:", err);
      }
    };

    fetchCommercials();
  }, [isOpen, canAssign]);

  const openModalWithReset = () => {
    setNotes(lead.notes ?? "");
    setStatus(lead.status);
    setDiscardReason(lead.discardReason ?? "");
    setDiscardReasonOther(lead.discardReasonOther ?? "");
    setAssignedToId(lead.assignedTo?.id ?? "");
    setShowConvertForm(false);
    openModal();
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const { data } = await axiosInstance.patch(`/leads/${lead.id}`, {
        notes,
      });
      onUpdate(data);
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
      onUpdate(data);
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
    if (!assignedToId) return;

    try {
      setSavingAssign(true);
      const { data } = await axiosInstance.patch(`/leads/${lead.id}/assign`, {
        assignedToId,
      });
      onUpdate(data);
      showNotification(
        "success",
        "Lead",
        "Lead asignado correctamente"
      );
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
    if (!lead.convertedAlumn) return;
    closeModal();
    navigate("/contract-create", { state: { alumn: lead.convertedAlumn } });
  };

  return (
    <div>
      <Button
        size="sm"
        onClick={openModalWithReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
             bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
             hover:bg-gray-100 dark:hover:bg-gray-700
             transition-colors duration-200 shadow-sm"
      >
        <span className="font-medium text-gray-600 dark:text-gray-300">
          Ver / Gestionar
        </span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[95%] lg:max-w-[700px] p-5 lg:p-8 overflow-auto"
      >
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
            <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={savingNotes}>
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
            <Button size="sm" variant="primary" onClick={handleSaveStatus} disabled={savingStatus}>
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
              Convertir a Alumno
            </Button>
          )}
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Cerrar
          </Button>
        </div>
      </Modal>

      <ConvertLeadModal
        lead={lead}
        isOpen={showConvertForm}
        onClose={() => setShowConvertForm(false)}
        onConverted={(updated) => {
          onUpdate(updated);
          setShowConvertForm(false);
        }}
      />
    </div>
  );
}
