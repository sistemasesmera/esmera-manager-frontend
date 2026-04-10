import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import axiosInstance from "../../axios/axiosConfig";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Switch from "../../components/form/switch/Switch";
import Select from "../../components/form/Select";
import CreateCommercialModal from "../../components/commercials/Modals/CreateCommercialModal";
import { useNotification } from "../../context/NotificationContext";
import EditCommercialModal from "../../components/commercials/Modals/EditCommercialModal";
import ChangePasswordModal from "../../components/commercials/Modals/ChangePasswordModal";
import Badge from "../../components/ui/badge/Badge";

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
  branch: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
}

export default function Commercials() {
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchCommercials = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: any = { page: currentPage, limit: itemsPerPage };

        if (statusFilter !== "") params.active = statusFilter;
        if (searchTerm.trim() !== "") params.searchTerm = searchTerm.trim();

        const response = await axiosInstance.get("/users/commercials", {
          params,
        });

        setCommercials(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError("Ha ocurrido un error, por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommercials();
  }, [currentPage, statusFilter, searchTerm]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const newStatus = currentActive ? 0 : 1; // si está activo → desactivar (0), si está inactivo → activar (1)

      await axiosInstance.put(`/users/commercials/${id}/activate`, {
        active: newStatus,
      });

      setCommercials((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, active: !currentActive } : it
        )
      );

      showNotification(
        "success",
        newStatus ? "Activar Comercial" : "Desactivar Comercial",
        newStatus
          ? "Comercial activado correctamente"
          : "Comercial desactivado correctamente"
      );
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);

      const backendMessage = error.response?.data?.message;

      showNotification(
        "error",
        "Error al cambiar estado",
        backendMessage || "No se pudo actualizar el estado del comercial"
      );
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Comerciales" />
      <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="gap-2 px-5 mb-4 space-y-8">
          <div className="flex w-full justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Comerciales
            </h3>{" "}
            <CreateCommercialModal
              onCommercialCreated={(newCommercial) => {
                setCommercials((prev) => {
                  const updated = [newCommercial, ...prev];
                  return updated.slice(0, 8);
                });
              }}
            />
          </div>
          <div className="flex w-full justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-gray-700">Estado:</span>

              <Select
                options={[
                  {
                    value: "",
                    label: "Todos",
                  },
                  {
                    value: "1",
                    label: "Activo",
                  },
                  {
                    value: "0",
                    label: "Inactivo",
                  },
                ]}
                defaultValue={statusFilter}
                onChange={(e) => {
                  console.log(e);
                  setStatusFilter(e);
                  setCurrentPage(1);
                }}
                className={`dark:bg-dark-900 border `}
              />
            </div>
            <form>
              <div className="relative">
                <button className="absolute -translate-y-1/2 left-4 top-1/2">
                  <svg
                    className="fill-gray-500 dark:fill-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                      fill=""
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                />
              </div>
            </form>
          </div>
        </div>
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <SpinnerThree />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Cargando comerciales...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          ) : commercials.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay comerciales para mostrar...
              </p>
            </div>
          ) : (
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
                    Apellido
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Email
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Nombre de usuario
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Fecha de alta
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Activo
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
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {commercials.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                          {item.firstName}
                        </span>

                        {item.role === "COMMERCIAL_PLUS" && (
                          <Badge variant="light" color="info">
                            Plus
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                            {item.lastName}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {item.email}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {item.username}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 dark:text-white/80">
                      <TableCell className="px-4 py-3 text-gray-700 dark:text-white/80">
                        <Switch
                          label=""
                          defaultChecked={item.active}
                          color="blue"
                          onChange={() =>
                            handleToggleActive(item.id, item.active)
                          }
                        />
                      </TableCell>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                            {item.branch.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      <div className="flex space-x-2">
                        <EditCommercialModal
                          commercial={item}
                          onUpdate={(updatedCommercial) => {
                            setCommercials((prev) =>
                              prev.map((a) =>
                                a.id === updatedCommercial.id
                                  ? updatedCommercial
                                  : a
                              )
                            );
                          }}
                        />

                        <ChangePasswordModal
                          commercial={item}
                          onUpdate={() => {}}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Paginación */}
        <nav
          className="flex items-center justify-center space-x-2 py-5"
          aria-label="Pagination"
        >
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-gray-600 dark:text-gray-400">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </nav>
      </div>
    </div>
  );
}
