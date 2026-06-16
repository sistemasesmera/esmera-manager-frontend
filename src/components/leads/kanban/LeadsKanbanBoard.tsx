import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RootState } from "../../../store";
import axiosInstance from "../../../axios/axiosConfig";
import SpinnerThree from "../../ui/spinner/SpinnerThree";
import Select from "../../form/Select";
import Lead, {
  LeadStatus,
  LeadDiscardReason,
  LEAD_STATUS_LABELS,
} from "../../../types/frontend/lead";
import { useNotification } from "../../../context/NotificationContext";
import LeadColumn from "./LeadColumn";
import DiscardReasonModal from "./DiscardReasonModal";
import ConvertLeadModal from "../Modals/ConvertLeadModal";

const PIPELINE_STATUSES = [
  LeadStatus.NUEVO,
  LeadStatus.CONTACTADO,
  LeadStatus.EN_SEGUIMIENTO,
  LeadStatus.MATRICULADO,
  LeadStatus.DESCARTADO,
];

export default function LeadsKanbanBoard() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();
  const canFilterByBranchOrCommercial =
    user?.role === "ADMIN" || user?.role === "COMMERCIAL_PLUS";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [branchFilter, setBranchFilter] = useState<string>("");
  const [assignedFilter, setAssignedFilter] = useState<string>("");
  const [branches, setBranches] = useState<{ id: string; name: string }[]>(
    []
  );
  const [commercials, setCommercials] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  const [discardingLead, setDiscardingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!canFilterByBranchOrCommercial) return;

    const fetchOptions = async () => {
      try {
        const [branchesRes, commercialsRes] = await Promise.all([
          axiosInstance.get("/branchs"),
          axiosInstance.get("/users/commercials-select"),
        ]);
        setBranches(branchesRes.data);
        setCommercials(commercialsRes.data);
      } catch (err) {
        console.error("Error al cargar sedes/comerciales:", err);
      }
    };

    fetchOptions();
  }, [canFilterByBranchOrCommercial]);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/leads", {
          params: {
            page: 1,
            limit: 1000,
            branchId: canFilterByBranchOrCommercial
              ? branchFilter || undefined
              : undefined,
            assignedToId: canFilterByBranchOrCommercial
              ? assignedFilter || undefined
              : undefined,
          },
        });
        setLeads(response.data.data);
        setError(null);
      } catch {
        setError("Ha ocurrido un error, por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [branchFilter, assignedFilter, canFilterByBranchOrCommercial]);

  const updateLead = (updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
  };

  const changeStatus = async (
    lead: Lead,
    status: LeadStatus,
    extra?: Record<string, unknown>
  ) => {
    try {
      const { data } = await axiosInstance.patch(`/leads/${lead.id}/status`, {
        status,
        ...extra,
      });
      updateLead(data);
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
    }
  };

  const handleDropLead = (lead: Lead, newStatus: LeadStatus) => {
    if (newStatus === LeadStatus.DESCARTADO) {
      setDiscardingLead(lead);
      return;
    }

    if (newStatus === LeadStatus.MATRICULADO) {
      setConvertingLead(lead);
      return;
    }

    changeStatus(lead, newStatus);
  };

  const handleConfirmDiscard = (
    discardReason: LeadDiscardReason,
    discardReasonOther?: string
  ) => {
    if (!discardingLead) return;
    changeStatus(discardingLead, LeadStatus.DESCARTADO, {
      discardReason,
      discardReasonOther,
    });
    setDiscardingLead(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center">
          <SpinnerThree />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Cargando leads...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {canFilterByBranchOrCommercial && (
        <div className="flex flex-wrap gap-3 items-end p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="w-[180px]">
            <Select
              options={[
                { value: "", label: "Todas las sedes" },
                ...branches.map((b) => ({ value: b.id, label: b.name })),
              ]}
              defaultValue=""
              onChange={(value) => setBranchFilter(value)}
              placeholder="Sede"
              className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
            />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { value: "", label: "Todos los comerciales" },
                ...commercials.map((c) => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName}`,
                })),
              ]}
              defaultValue=""
              onChange={(value) => setAssignedFilter(value)}
              placeholder="Asignado a"
              className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
            />
          </div>
        </div>
      )}

      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 divide-x divide-gray-200 dark:divide-white/[0.05] sm:grid-cols-2 xl:grid-cols-5">
          {PIPELINE_STATUSES.map((status) => (
            <LeadColumn
              key={status}
              title={LEAD_STATUS_LABELS[status]}
              status={status}
              leads={leads.filter((lead) => lead.status === status)}
              onDropLead={handleDropLead}
            />
          ))}
        </div>
      </DndProvider>

      <DiscardReasonModal
        isOpen={!!discardingLead}
        onClose={() => setDiscardingLead(null)}
        onConfirm={handleConfirmDiscard}
      />

      {convertingLead && (
        <ConvertLeadModal
          lead={convertingLead}
          isOpen={!!convertingLead}
          onClose={() => setConvertingLead(null)}
          onConverted={(updated, alumn) => {
            updateLead(updated);
            setConvertingLead(null);
            navigate("/contract-create", { state: { alumn } });
          }}
        />
      )}
    </div>
  );
}
