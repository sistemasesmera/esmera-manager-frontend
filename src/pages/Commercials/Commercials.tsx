import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import axiosInstance from "../../axios/axiosConfig";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Switch from "../../components/form/switch/Switch";
import Select from "../../components/form/Select";
import CreateCommercialModal from "../../components/commercials/Modals/CreateCommercialModal";
import EditCommercialModal from "../../components/commercials/Modals/EditCommercialModal";
import ChangePasswordModal from "../../components/commercials/Modals/ChangePasswordModal";
import { useNotification } from "../../context/NotificationContext";

export interface Commercial {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  branchId?: string;
  branch: { id: string; name: string; address: string; city: string };
}

function Initials({ name }: { name: string }) {
  const [a, b] = name.trim().split(" ");
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold shrink-0">
      {(a?.[0] ?? "").toUpperCase()}{(b?.[0] ?? "").toUpperCase()}
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = {
  COMMERCIAL: "Comercial",
  COMMERCIAL_PLUS: "Plus",
};

export default function Commercials() {
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showNotification } = useNotification();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { page: currentPage, limit: itemsPerPage };
        if (statusFilter !== "") params.active = statusFilter;
        if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
        const { data } = await axiosInstance.get("/users/commercials", { params });
        setCommercials(data.data);
        setTotalPages(data.totalPages || 1);
      } catch {
        setError("Ha ocurrido un error al cargar los comerciales.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, statusFilter, searchTerm]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const newStatus = currentActive ? 0 : 1;
    try {
      await axiosInstance.put(`/users/commercials/${id}/activate`, { active: newStatus });
      setCommercials((prev) => prev.map((c) => c.id === id ? { ...c, active: !currentActive } : c));
      showNotification("success", newStatus ? "Activar Comercial" : "Desactivar Comercial",
        newStatus ? "Comercial activado correctamente" : "Comercial desactivado correctamente");
    } catch (err: any) {
      showNotification("error", "Error", err.response?.data?.message ?? "No se pudo actualizar el estado");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Comerciales" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Comerciales</h3>
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtro estado */}
              <div className="w-36">
                <Select
                  options={[
                    { value: "", label: "Todos" },
                    { value: "1", label: "Activos" },
                    { value: "0", label: "Inactivos" },
                  ]}
                  defaultValue={statusFilter}
                  onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                  className="border border-gray-300 dark:border-gray-700"
                />
              </div>
              {/* Buscador */}
              <div className="relative flex-1 min-w-[200px] sm:flex-none sm:w-60">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 fill-gray-400" width="16" height="16" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar comercial..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
              <CreateCommercialModal
                onCommercialCreated={(c) => setCommercials((prev) => [c, ...prev].slice(0, itemsPerPage))}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <SpinnerThree />
              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando comerciales...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center py-14">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          ) : commercials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay comerciales para mostrar</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left md:px-6">Comercial</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden sm:table-cell">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden lg:table-cell">Sede</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden lg:table-cell">Alta</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-right md:px-6">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {commercials.map((c) => (
                  <TableRow key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Comercial: avatar + nombre + rol */}
                    <TableCell className="px-5 py-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <Initials name={`${c.firstName} ${c.lastName}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                            {c.firstName} {c.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-400 dark:text-gray-500">@{c.username}</span>
                            {c.role === "COMMERCIAL_PLUS" && (
                              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                Plus
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {c.email}
                    </TableCell>

                    {/* Sede */}
                    <TableCell className="px-5 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3 text-gray-400">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                        </svg>
                        {c.branch.name}
                      </span>
                    </TableCell>

                    {/* Fecha alta */}
                    <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          label=""
                          defaultChecked={c.active}
                          color="blue"
                          onChange={() => handleToggleActive(c.id, c.active)}
                        />
                        <span className={`text-xs font-medium ${c.active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
                          {c.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="px-5 py-4 md:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditCommercialModal
                          commercial={c}
                          onUpdate={(updated) =>
                            setCommercials((prev) => prev.map((x) => x.id === updated.id ? updated : x))
                          }
                        />
                        <ChangePasswordModal commercial={c} onUpdate={() => {}} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && commercials.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] md:px-6">
            <div className="flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Anterior
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Página <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> de{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
              </span>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
