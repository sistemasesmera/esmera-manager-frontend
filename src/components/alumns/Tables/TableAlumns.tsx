import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import axiosInstance from "../../../axios/axiosConfig";
import SpinnerThree from "../../ui/spinner/SpinnerThree";
import Alumn from "../../../types/frontend/alumn-temp";
import InformationModal from "../Modals/InformationModal";
import CreateAlumnModal from "../Modals/CreateAlumnModal";

export default function TableAlumns() {
  const [alumns, setAlumns] = useState<Alumn[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [filteredAlumns, setFilteredAlumns] = useState<Alumn[]>([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchAlumns = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get("alumns", {
            params: {
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm.trim() || undefined,
            },
          });
          setTotalPages(response.data.totalPages);
          setAlumns(response.data.data);
        } catch {
          setError("Ha ocurrido un error, por favor intente nuevamente.");
        } finally {
          setLoading(false);
        }
      };

      fetchAlumns();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAlumns(alumns);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredAlumns(
        alumns.filter(
          (alumn) =>
            alumn.firstName.toLowerCase().includes(term) ||
            alumn.lastName.toLowerCase().includes(term) ||
            alumn.email.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, alumns]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Controls */}
      <div className="gap-2 px-5 mb-4 space-y-8">
        <div className="flex w-full justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Alumnos
          </h3>{" "}
          <CreateAlumnModal
            onAlumnCreated={(newAlumn) => {
              setAlumns((prev) => {
                const updated = [newAlumn, ...prev];
                return updated.slice(0, 8); // mantiene máximo 8
              });
            }}
          />
        </div>
        <div className="flex w-full justify-between">
          <div className="flex items-center"></div>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              />
            </div>
          </form>
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
                  Cargando alumnos...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          ) : alumns.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay alumnos para mostrar...
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
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Telefono
                  </TableCell>{" "}
                  <TableCell
                    isHeader
                    className="py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Sede
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Estado
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredAlumns.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className=" text-gray-700  dark:text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-10"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                            {item.firstName} {item.lastName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {item.email}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {item.phone}
                    </TableCell>{" "}
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                            MADRID
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 dark:text-white/80">
                      {item.isVerified ? (
                        <span className="rounded-full bg-green-100 text-green-600 dark:bg-green-700 dark:text-white px-3 py-1.5 text-xs font-medium transition-colors duration-200">
                          Verificado
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 text-red-600 dark:bg-red-700 dark:text-white px-3 py-1.5 text-xs font-medium transition-colors duration-200">
                          No Verificado
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      <InformationModal
                        alumn={item}
                        onUpdate={(updatedAlumn) => {
                          setAlumns((prev) =>
                            prev.map((a) =>
                              a.id === updatedAlumn.id ? updatedAlumn : a
                            )
                          );
                        }}
                      />
                    </TableCell>
                    {/* Actions */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 9.99715C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 9.99715C2.58301 9.99766 2.58301 9.99817 2.58301 9.99868Z"
                fill=""
              />
            </svg>
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          {/* Page Info */}
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 ">
            Página {currentPage} de {totalPages}
          </span>

          {/* Next Button */}
          <Button
            onClick={() => goToPage(currentPage + 1)}
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z"
                fill=""
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
