import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Select from "../../components/form/Select";
import Flatpickr from "react-flatpickr";
import Label from "../../components/form/Label";
import { CalenderIcon } from "../../icons";
import axiosInstance from "../../axios/axiosConfig";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtros
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [courses, setCourses] = useState<{ value: string; label: string }[]>(
    []
  );
  const [commercials, setCommercials] = useState<
    { value: string; label: string }[]
  >([]);

  const [summary, setSummary] = useState<any>({
    totalAmount: 0,
    totalContracts: 0,
  });

  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);
  const [loadingCommercials, setLoadingCommercials] = useState<boolean>(false);

  const limit = 10;

  // Traer cursos al cargar la página
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const { data } = await axiosInstance.get("courses/selects");

        // Ajustamos al formato que espera el <Select />
        const formatted = data.map((c: any) => ({
          value: c.id,
          label: c.name,
        }));

        setCourses([{ value: "", label: "Todos" }, ...formatted]);
      } catch (err) {
        console.error("Error cargando cursos:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Traer comerciales al cargar la página
  useEffect(() => {
    const fetchCommercials = async () => {
      try {
        setLoadingCourses(true);
        const { data } = await axiosInstance.get("users/commercials-select");

        // Ajustamos al formato que espera el <Select />
        const formatted = data.map((c: any) => ({
          value: c.id,
          label: c.active
            ? `${c.firstName} ${c.lastName}`
            : `${c.firstName} ${c.lastName} (Inactivo)`, // 👈 añadimos el sufijo
        }));

        setCommercials([{ value: "", label: "Todos" }, ...formatted]);
      } catch (err) {
        console.error("Error cargando los comerciales:", err);
      } finally {
        setLoadingCommercials(false);
      }
    };

    fetchCommercials();
  }, []);

  const fetchContracts = async () => {
    if (!startDate || !endDate) {
      setError("Debes seleccionar una fecha de inicio y fin");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await axiosInstance.get("contracts/reports", {
        params: {
          startDate,
          endDate,
          courseId: courseId || undefined,
          userId: userId || undefined,
          page: currentPage,
          limit,
        },
      });

      setContracts(data.contracts);
      setTotalPages(data.pagination.total);
      setSummary(data.summary);
    } catch (err: any) {
      setError("Error al cargar contratos");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Si quieres que busque automáticamente al cambiar página:
  useEffect(() => {
    if (startDate && endDate) {
      fetchContracts();
    }
  }, [currentPage]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 porque getMonth() es 0-index
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyQuickFilter = (filter: string) => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (filter) {
      case "Hoy":
        start = today;
        end = today;
        break;

      case "Esta semana": {
        const firstDayOfWeek = new Date(today);
        const dayOfWeek = today.getDay() || 7; // domingo = 0 → 7
        firstDayOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
        start = firstDayOfWeek;
        end = today;
        break;
      }

      case "Este mes":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;

      case "Mes pasado":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;

      default:
        break;
    }

    if (start && end) {
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Informes" />
      <div className="rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="gap-2 px-5 mb-4 space-y-8">
          <div className="flex w-full justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Contratos
            </h3>{" "}
          </div>
          <div className="w-full space-y-4">
            {/* Grid de filtros */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Fecha de Inicio */}
              <div className="flex flex-col">
                <Label>Fecha de Inicio</Label>
                <div className="relative w-full">
                  <Flatpickr
                    value={startDate}
                    onChange={(dates: Date[]) =>
                      setStartDate(dates[0]?.toISOString().split("T")[0] || "")
                    }
                    options={{ dateFormat: "Y-m-d" }}
                    placeholder="Seleccionar fecha de inicio"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <CalenderIcon className="size-6" />
                  </span>
                </div>
              </div>

              {/* Fecha de Fin */}
              <div className="flex flex-col">
                <Label>Fecha de Fin</Label>
                <div className="relative w-full">
                  <Flatpickr
                    value={endDate}
                    onChange={(dates: Date[]) =>
                      setEndDate(dates[0]?.toISOString().split("T")[0] || "")
                    }
                    options={{ dateFormat: "Y-m-d" }}
                    placeholder="Seleccionar fecha de fin"
                    className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <CalenderIcon className="size-6" />
                  </span>
                </div>
              </div>

              {/* Comercial */}
              <div className="flex flex-col">
                <Label>Comercial</Label>
                <Select
                  options={commercials}
                  defaultValue={""}
                  onChange={(e) => setUserId(e || "")}
                  placeholder={
                    loadingCommercials
                      ? "Cargando comerciales..."
                      : "Selecciona una opción"
                  }
                  className="dark:bg-dark-900 border"
                />
              </div>

              {/* Curso */}
              <div className="flex flex-col">
                <Label>Curso</Label>
                <Select
                  options={courses}
                  defaultValue={""}
                  onChange={(e) => setCourseId(e || "")}
                  placeholder={
                    loadingCourses
                      ? "Cargando cursos..."
                      : "Selecciona una opción"
                  }
                  className="dark:bg-dark-900 border"
                />
              </div>
            </div>

            {/* Botones de accesos rápidos */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {["Hoy", "Esta semana", "Este mes", "Mes pasado"].map(
                  (label) => (
                    <button
                      key={label}
                      onClick={() => applyQuickFilter(label)}
                      className="rounded-full border px-4 py-2 text-sm font-medium text-gray-700 bg-white shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:dark:bg-gray-700"
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              {/* Botón principal Filtrar */}
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentPage(1);
                  fetchContracts();
                }}
              >
                Filtrar
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
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
          ) : contracts.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-600 dark:text-gray-400">
                No hay contratos disponibles
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
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Comercial
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {contracts.map((item, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <TableCell className="px-4 py-4">
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {item.name}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {item.alumn.firstName} {item.alumn.lastName}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {item.course.name}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-gray-700 dark:text-gray-400">
                      {new Intl.NumberFormat("es-ES", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(item.coursePrice)}{" "}
                      €
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {item.branch.name}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {item.user.firstName} {item.user.lastName}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {/* 👇 Fila de totales */}
                <TableRow className="bg-gray-50 dark:bg-gray-800 font-semibold">
                  <TableCell className="px-4 py-4 text-gray-900 dark:text-white text-theme-xl">
                    Total
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span></span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span></span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span></span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-900 text-xl dark:text-white">
                    {new Intl.NumberFormat("es-ES", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(summary.totalAmount)}{" "}
                    €
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-900 text-xl dark:text-white">
                    {summary.totalContracts} contratos
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span></span>
                  </TableCell>
                </TableRow>
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
