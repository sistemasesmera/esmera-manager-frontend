import { useState, useEffect, ChangeEvent } from "react";
import axiosInstance from "../../axios/axiosConfig"; // ajusta la ruta según tu proyecto
import { useLocation } from "react-router-dom";

type CursoApi = {
  id: number;
  name: string;
  description: string;
  duration: string;
};

type Curso = {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
};

export default function Cursos() {
  const location = useLocation();

  const [filters, setFilters] = useState({
    nombre: "",
  });

  const [rowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [data, setData] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar cursos solo si la ruta es la correcta
  useEffect(() => {
    if (location.pathname !== "/informes-de-cursos") return;

    setLoading(true);
    setError(null);

    axiosInstance
      .get("/courses", { params: { limit: 1000 } })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setData(
            res.data.data.map((c: CursoApi) => ({
              id: c.id,
              nombre: c.name || "",
              descripcion: c.description || "",
              duracion: c.duration || "",
            }))
          );
        } else {
          setData([]);
        }
      })
      .catch(() => {
        setError("Error cargando los cursos");
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location.pathname]);

  function handleFilterChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }

  const filteredData = data.filter((curso) =>
    curso.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
  );

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const rowsToShow = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (location.pathname !== "/informes-de-cursos") {
    // Opcional: mostrar mensaje o null si no estamos en la ruta de cursos
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Informe de Cursos
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">
          Buscar curso:
        </label>
        <input
          type="text"
          name="nombre"
          value={filters.nombre}
          onChange={handleFilterChange}
          className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Nombre del curso"
          autoComplete="off"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-700 dark:text-gray-300">
          Cargando cursos...
        </p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-auto rounded shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Descripción
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Duración
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowsToShow.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      No se encontraron cursos.
                    </td>
                  </tr>
                ) : (
                  rowsToShow.map((curso) => (
                    <tr
                      key={curso.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-3">{curso.nombre}</td>
                      <td className="px-4 py-3">{curso.descripcion}</td>
                      <td className="px-4 py-3">{curso.duracion}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <nav className="flex items-center justify-center space-x-4 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-400 text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Anterior
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages || 1, p + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages || totalPages === 0
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-400 text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Siguiente
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
