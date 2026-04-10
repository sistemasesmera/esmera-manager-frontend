import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import Contract from "../../../types/backend/backendContract";
import axiosInstance from "../../../axios/axiosConfig";
import SpinnerThree from "../../ui/spinner/SpinnerThree";
import ContractModal from "../Modals/ContractModal";

export default function TableMyContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("contracts/my-contracts", {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        setTotalPages(response.data.totalPages);
        setContracts(response.data.data);
      } catch (err) {
        setError("Ha ocurrido un error, por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    setSearchTerm("");

    fetchContracts();
  }, [currentPage]);

  // Filtrar los contratos según searchTerm (buscando en nombre, alumno y curso)
  const filteredContracts = contracts.filter((contract) => {
    const term = searchTerm.toLowerCase();
    return (
      contract.name.toLowerCase().includes(term) ||
      contract.alumn.firstName.toLowerCase().includes(term) ||
      contract.alumn.lastName.toLowerCase().includes(term) ||
      contract.course.name.toLowerCase().includes(term)
    );
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Mis contratos
          </h3>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="max-w-full px-5 overflow-x-auto sm:px-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <SpinnerThree />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Cargando contratos...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay contratos para mostrar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Contrato
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Alumno
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Fecha
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Curso
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Precio
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Sede
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredContracts.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                      {item.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                      {item.alumn.lastName} {item.alumn.firstName}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {new Date(item.contractDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      {item.course.name}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-green-700 text-theme-sm dark:text-green-400">
                      {item.coursePrice}€
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400 ">
                      {item.branch?.name ? item.branch?.name : "NO SEDE"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      <ContractModal contract={item} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
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
