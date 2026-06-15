import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import Select from "../../form/Select";
import axiosInstance from "../../../axios/axiosConfig";
import SpinnerThree from "../../ui/spinner/SpinnerThree";
import Lead, {
  LeadStatus,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
} from "../../../types/frontend/lead";
import CreateLeadModal from "../Modals/CreateLeadModal";
import LeadDetailModal, { LeadStatusBadge } from "../Modals/LeadDetailModal";

const statusFilterOptions = Object.values(LeadStatus).map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
}));

export default function TableLeads() {
  const { user } = useSelector((state: RootState) => state.auth);
  const canFilterByBranchOrCommercial =
    user?.role === "ADMIN" || user?.role === "COMMERCIAL_PLUS";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [assignedFilter, setAssignedFilter] = useState<string>("");

  const [branches, setBranches] = useState<{ id: string; name: string }[]>(
    []
  );
  const [commercials, setCommercials] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  // Cargar sedes y comerciales para los filtros (solo admin/comercial plus)
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
    const delayDebounce = setTimeout(() => {
      const fetchLeads = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get("/leads", {
            params: {
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm.trim() || undefined,
              status: statusFilter || undefined,
              branchId: canFilterByBranchOrCommercial
                ? branchFilter || undefined
                : undefined,
              assignedToId: canFilterByBranchOrCommercial
                ? assignedFilter || undefined
                : undefined,
            },
          });
          setTotalPages(response.data.totalPages);
          setLeads(response.data.data);
          setError(null);
        } catch {
          setError("Ha ocurrido un error, por favor intente nuevamente.");
        } finally {
          setLoading(false);
        }
      };

      fetchLeads();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    branchFilter,
    assignedFilter,
    canFilterByBranchOrCommercial,
  ]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Controls */}
      <div className="gap-2 px-5 mb-4 space-y-4">
        <div className="flex w-full justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Leads
          </h3>
          <CreateLeadModal
            onLeadCreated={(newLead) => {
              setLeads((prev) => {
                const updated = [newLead, ...prev];
                return updated.slice(0, itemsPerPage);
              });
            }}
          />
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <div className="w-[180px]">
            <Select
              options={[{ value: "", label: "Todos los estados" }, ...statusFilterOptions]}
              defaultValue=""
              onChange={(value) => {
                setCurrentPage(1);
                setStatusFilter(value);
              }}
              placeholder="Estado"
              className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
            />
          </div>

          {canFilterByBranchOrCommercial && (
            <>
              <div className="w-[180px]">
                <Select
                  options={[
                    { value: "", label: "Todas las sedes" },
                    ...branches.map((b) => ({ value: b.id, label: b.name })),
                  ]}
                  defaultValue=""
                  onChange={(value) => {
                    setCurrentPage(1);
                    setBranchFilter(value);
                  }}
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
                  onChange={(value) => {
                    setCurrentPage(1);
                    setAssignedFilter(value);
                  }}
                  placeholder="Asignado a"
                  className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-hidden">
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <SpinnerThree />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Cargando leads...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay leads para mostrar...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Nombre
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Contacto
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Curso de interés
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Origen
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Sede
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Estado
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Asignado a
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-4 py-4">
                        <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                          {lead.name}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                        <div>{lead.phone}</div>
                        {lead.email && (
                          <div className="text-gray-400">{lead.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                        <div>{lead.nameCourse || "-"}</div>
                        {lead.categoryCourse && (
                          <div className="text-gray-400">
                            {lead.categoryCourse}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                        {LEAD_SOURCE_LABELS[lead.source]}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                        {lead.branch?.name || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                        {lead.assignedTo
                          ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                          : "Sin asignar"}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <LeadDetailModal
                          lead={lead}
                          onUpdate={(updatedLead) => {
                            setLeads((prev) =>
                              prev.map((l) =>
                                l.id === updatedLead.id ? updatedLead : l
                              )
                            );
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 ">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => goToPage(currentPage + 1)}
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Siguiente</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
