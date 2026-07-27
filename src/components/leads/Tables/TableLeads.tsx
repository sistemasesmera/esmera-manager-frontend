import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import Select from "../../form/Select";
import axiosInstance from "../../../axios/axiosConfig";
import SpinnerThree from "../../ui/spinner/SpinnerThree";
import Lead, {
  LeadStatus,
  LEAD_SOURCE_LABELS,
} from "../../../types/frontend/lead";
import CreateLeadModal from "../Modals/CreateLeadModal";
import { LeadStatusBadge } from "../LeadStatusBadge";
import { useNotification } from "../../../context/NotificationContext";

const STATUS_PILLS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: LeadStatus.SIN_ASIGNAR, label: "Sin asignar" },
  { value: LeadStatus.CONTACTADO, label: "Contactado" },
  { value: LeadStatus.EN_SEGUIMIENTO, label: "En seguimiento" },
  { value: LeadStatus.MATRICULADO, label: "Matriculado" },
  { value: LeadStatus.DESCARTADO, label: "Descartado" },
];

const SOURCE_BADGE: Record<string, string> = {
  WEB:        "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
  WEB_ONLINE: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
  MANUAL:     "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  META_ADS:   "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}

interface TableLeadsProps {
  scope: "unassigned" | "assigned";
}

export default function TableLeads({ scope }: TableLeadsProps) {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();
  const isAdmin = user?.role === "ADMIN";
  const canAssign = isAdmin || user?.role === "COMMERCIAL_PLUS";
  const isUnassignedScope = scope === "unassigned";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [branchFilter, setBranchFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [commercials, setCommercials] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!canAssign) return;
    Promise.all([
      axiosInstance.get("/branchs"),
      axiosInstance.get("/users/commercials-select"),
    ]).then(([b, c]) => {
      setBranches(b.data);
      setCommercials(c.data);
    }).catch(() => {});
  }, [canAssign]);

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/leads", {
        params: {
          page,
          limit: LIMIT,
          search: searchTerm.trim() || undefined,
          status: isUnassignedScope ? undefined : statusFilter || undefined,
          branchId: canAssign ? branchFilter || undefined : undefined,
          assignedToId:
            canAssign && !isUnassignedScope ? assignedFilter || undefined : undefined,
          unassigned: isUnassignedScope ? true : undefined,
          assigned: isUnassignedScope ? undefined : true,
        },
      });
      setLeads(data.data);
      setTotal(data.count);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
      setError(null);
    } catch {
      setError("Error al cargar los leads.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, branchFilter, assignedFilter, isUnassignedScope, canAssign]);

  useEffect(() => {
    const t = setTimeout(() => fetchLeads(1), 350);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleAssignFromList = async (leadId: string, assignedToId: string) => {
    if (!assignedToId) return;
    setAssigningId(leadId);
    try {
      const { data } = await axiosInstance.patch(`/leads/${leadId}/assign`, { assignedToId });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? data : l)));
      showNotification("success", "Lead", "Asignado correctamente");
    } catch {
      showNotification("error", "Lead", "Error al asignar el lead");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 md:px-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Clientes Potenciales
          </h3>
          {total > 0 && (
            <span className="rounded-full bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              {total}
            </span>
          )}
        </div>
        <CreateLeadModal
          onLeadCreated={(newLead) => {
            setLeads((prev) => [newLead, ...prev].slice(0, LIMIT));
            setTotal((t) => t + 1);
          }}
        />
      </div>

      {/* Filtros */}
      <div className="px-5 pb-4 md:px-6 space-y-3">
        {isUnassignedScope ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
            </svg>
            Estos leads no se pueden gestionar hasta asignarlos a un comercial.
          </p>
        ) : (
          /* Status pills */
          <div className="flex flex-wrap gap-1.5">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => { setStatusFilter(pill.value as LeadStatus | ""); setCurrentPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === pill.value
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.10]"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

        {/* Search + selects */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-4 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none focus:ring focus:border-brand-300 focus:ring-brand-500/10"
            />
          </div>
          {canAssign && (
            <>
              <Select
                options={[{ value: "", label: "Todas las sedes" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
                defaultValue=""
                onChange={(v) => { setBranchFilter(v); setCurrentPage(1); }}
                className="border border-gray-200 dark:border-gray-700 w-[160px]"
              />
              {!isUnassignedScope && (
                <Select
                  options={[{ value: "", label: "Todos los comerciales" }, ...commercials.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))]}
                  defaultValue=""
                  onChange={(v) => { setAssignedFilter(v); setCurrentPage(1); }}
                  className="border border-gray-200 dark:border-gray-700 w-[180px]"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <SpinnerThree />
            <p className="text-sm text-gray-400">Cargando leads...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center py-12">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <svg className="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {isUnassignedScope ? "No hay leads sin asignar" : "No hay leads para mostrar"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-y border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Contacto</TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden md:table-cell">Curso</TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden lg:table-cell">Fuente</TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Estado</TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden sm:table-cell">Asignado a</TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden xl:table-cell">Próx. contacto</TableCell>
                <TableCell isHeader className="px-5 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  {/* Contacto */}
                  <TableCell className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate max-w-[160px]">{lead.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
                          {lead.phone}{lead.email ? ` · ${lead.email}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Curso */}
                  <TableCell className="px-5 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{lead.nameCourse || "—"}</p>
                    {lead.categoryCourse && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{lead.categoryCourse}</p>
                    )}
                  </TableCell>

                  {/* Fuente */}
                  <TableCell className="px-5 py-3 hidden lg:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_BADGE[lead.source] ?? "bg-gray-100 text-gray-500"}`}>
                      {LEAD_SOURCE_LABELS[lead.source]}
                    </span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="px-5 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>

                  {/* Asignado a — dropdown inline para admin/plus */}
                  <TableCell
                    className="px-5 py-3 hidden sm:table-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canAssign ? (
                      <select
                        value={lead.assignedTo?.id ?? ""}
                        onChange={(e) => handleAssignFromList(lead.id, e.target.value)}
                        disabled={assigningId === lead.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring focus:border-brand-300 focus:ring-brand-500/10 max-w-[160px] disabled:opacity-50"
                      >
                        <option value="">Sin asignar</option>
                        {commercials.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lead.assignedTo
                          ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                          : <span className="text-gray-300 dark:text-gray-600">Sin asignar</span>}
                      </span>
                    )}
                  </TableCell>

                  {/* Próximo contacto */}
                  <TableCell className="px-5 py-3 hidden xl:table-cell">
                    {lead.nextContactDate ? (
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {fmtDate(lead.nextContactDate)}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </TableCell>

                  {/* Chevron */}
                  <TableCell className="px-4 py-3">
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Paginación */}
      {!loading && leads.length > 0 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] md:px-6">
          <Button size="sm" variant="outline" onClick={() => fetchLeads(currentPage - 1)} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Página <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> de{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
          </span>
          <Button size="sm" variant="outline" onClick={() => fetchLeads(currentPage + 1)} disabled={currentPage === totalPages}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
