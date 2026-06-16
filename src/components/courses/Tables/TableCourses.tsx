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
import Course from "../../../types/backend/backendCourse";
import InformationCourseModal from "../Modals/InformationCourseModal";
import CreateCourseModal from "../Modals/CreateCourseModal";
import Switch from "../../form/switch/Switch";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

export default function TableCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { page: currentPage, limit: itemsPerPage };
        if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
        const { data } = await axiosInstance.get("courses", { params });
        setCourses(data.data);
        setTotalPages(data.total || 1);
      } catch {
        setError("Ha ocurrido un error al cargar los cursos.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

  const toggleStatus = async (courseId: string, newStatus: boolean) => {
    if (updatingId === courseId) return;
    setUpdatingId(courseId);
    try {
      await axiosInstance.patch(`courses/${courseId}/status`, { isActive: newStatus });
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, isActive: newStatus } : c))
      );
    } catch {
      alert("Error al actualizar el estado del curso");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Cursos
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[200px] sm:flex-none sm:w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 fill-gray-400 dark:fill-gray-500"
                width="16" height="16" viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar curso..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
            <CreateCourseModal
              onCourseCreated={(newCourse) => {
                setCourses((prev) => [newCourse, ...prev].slice(0, itemsPerPage));
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <SpinnerThree />
            <p className="text-sm text-gray-500 dark:text-gray-400">Cargando cursos...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center py-14">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay cursos para mostrar</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="border-y border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left md:px-6">
                  Nombre
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">
                  Estado
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden sm:table-cell">
                  Creado
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden md:table-cell">
                  Actualizado
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-right md:px-6">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Nombre */}
                  <TableCell className="px-5 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold shrink-0">
                        {course.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {course.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Estado (badge + switch) */}
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        label=""
                        defaultChecked={course.isActive}
                        color="blue"
                        disabled={updatingId === course.id}
                        onChange={() => toggleStatus(course.id, !course.isActive)}
                      />
                      <span
                        className={`text-xs font-medium ${
                          course.isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {course.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Fechas */}
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {fmtDate(course.createdAt)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {fmtDate(course.updatedAt)}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="px-5 py-4 md:px-6 text-right">
                    <InformationCourseModal
                      course={course}
                      onUpdate={(updated) =>
                        setCourses((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && courses.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] md:px-6">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Página <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> de{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
