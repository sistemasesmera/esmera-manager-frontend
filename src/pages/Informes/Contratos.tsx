import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../axios/axiosConfig";

const routeToTitle: Record<string, string> = {
  "/informes-de-contratos": "Contratos",
  "/informes-de-cursos": "Cursos",
  "/informes-de-alumnos": "Alumnos",
  "/informes-de-comerciales": "Comerciales",
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(label: string) {
  const today = new Date();
  let start: Date | null = null,
    end: Date | null = null;

  switch (label) {
    case "Hoy":
      start = new Date(today);
      end = new Date(today);
      break;
    case "Esta Semana": {
      const day = today.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      start = new Date(today);
      start.setDate(today.getDate() - diffToMonday);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }
    case "Mes Pasado":
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case "Este Mes":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "Este Año":
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
  }

  return {
    fechaInicio: start ? formatDate(start) : "",
    fechaFin: end ? formatDate(end) : "",
  };
}

type DataRow = {
  alumno: string;
  contrato: string;
  curso: string;
  acuerdoPago: string;
  precio: number;
  fecha: string;
  comercial: string;
};

export default function Informes() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    comercial: "Todos",
    curso: "Todos",
  });

  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [comercialesActivos, setComercialesActivos] = useState<string[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [data, setData] = useState<DataRow[]>([]);

  useEffect(() => {
    function fetchComerciales() {
      axiosInstance
        .get("users/commercials", { params: { active: "1" } })
        .then((res) => {
          const comercialesArray = res.data.data;
          if (!Array.isArray(comercialesArray)) {
            setComercialesActivos([]);
            return;
          }
          const nombres = comercialesArray.map(
            (c: { firstName?: string; lastName?: string }) => {
              const first = c.firstName || "";
              const last = c.lastName || "";
              const fullName = `${first} ${last}`.trim();
              return fullName || "Sin Nombre";
            }
          );
          setComercialesActivos(nombres);
        })
        .catch(() => {
          setComercialesActivos([]);
        });
    }
  

    function fetchCursos() {
      axiosInstance
        .get("courses", { params: { limit: 1000 } })
        .then((res) => {
          const cursosArray = res.data.data;
          if (!Array.isArray(cursosArray)) {
            setCursos([]);
            return;
          }
          const nombresCursos = cursosArray
            .map((c: { name?: string }) => c.name || "Sin Nombre")
            .sort((a, b) => a.localeCompare(b));
          setCursos(nombresCursos);
        })
        .catch(() => {
          setCursos([]);
        });
    }

    setCurrentPage(1);

    let endpoint = "";
    switch (currentPath) {
      case "/informes-de-contratos":
        endpoint = "contratos";
        break;
      case "/informes-de-cursos":
        endpoint = "cursos";
        break;
      case "/informes-de-alumnos":
        endpoint = "alumnos";
        break;
      case "/informes-de-comerciales":
        endpoint = "comerciales";
        break;
      default:
        endpoint = "";
        break;
    }

    if (!endpoint) {
      setData([]);
      setFilteredData([]);
      return;
    }

    axiosInstance
      .get(endpoint, { params: { limit: 1000 } })
      .then((res) => {
        const dataResponse = res.data.data;
        if (!Array.isArray(dataResponse)) {
          setData([]);
          setFilteredData([]);
          return;
        }

        setData(dataResponse);
        setFilteredData(dataResponse);
      })
      .catch(() => {
        setData([]);
        setFilteredData([]);
      });

    fetchComerciales();
    fetchCursos();
    
  }, [currentPath]);

  function handleFilterChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function handleQuickFilter(label: string) {
    const { fechaInicio, fechaFin } = getDateRange(label);
    setFilters((prev) => ({
      ...prev,
      fechaInicio,
      fechaFin,
    }));
  }

  function buscarDatosFiltrados() {
    let filtered = data;

    if (filters.fechaInicio)
      filtered = filtered.filter((d) => d.fecha >= filters.fechaInicio);
    if (filters.fechaFin)
      filtered = filtered.filter((d) => d.fecha <= filters.fechaFin);

    if (filters.comercial !== "Todos")
      filtered = filtered.filter((d) => d.comercial === filters.comercial);

    if (filters.curso !== "Todos")
      filtered = filtered.filter((d) => d.curso === filters.curso);

    setFilteredData(filtered);
    setCurrentPage(1);
  }

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const rowsToShow = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalMonto = filteredData.reduce((acc, cur) => acc + cur.precio, 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">
        {routeToTitle[currentPath] || "Informes"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Fecha inicio:
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={filters.fechaInicio}
            onChange={handleFilterChange}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Fecha fin:
          </label>
          <input
            type="date"
            name="fechaFin"
            value={filters.fechaFin}
            onChange={handleFilterChange}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Comercial:
          </label>
          <select
            name="comercial"
            value={filters.comercial}
            onChange={handleFilterChange}
            onFocus={() => {
              // Opcional, puedes volver a traerlos si quieres
            }}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos</option>
            {comercialesActivos.map((comercial, idx) => (
              <option key={`${comercial}-${idx}`} value={comercial}>
                {comercial}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Curso:
          </label>
          <select
            name="curso"
            value={filters.curso}
            onChange={handleFilterChange}
            onFocus={() => {
              // Opcional, puedes volver a traerlos si quieres
            }}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="Todos">Todos</option>
            {cursos.map((curso, idx) => (
              <option key={`${curso}-${idx}`} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={buscarDatosFiltrados}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setFilters({
                fechaInicio: "",
                fechaFin: "",
                comercial: "Todos",
                curso: "Todos",
              });
              setFilteredData(data);
              setCurrentPage(1);
            }}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Filtros Rápidos:
        </p>
        {["Hoy", "Esta Semana", "Mes Pasado", "Este Mes", "Este Año"].map(
          (label) => (
            <button
              key={label}
              onClick={() => {
                handleQuickFilter(label);
              }}
              className="mr-2 mb-2 rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition"
            >
              {label}
            </button>
          )
        )}
      </div>

      <div className="mb-6 space-y-1">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Total {routeToTitle[currentPath]}:{" "}
          <span className="font-normal">{totalRows}</span>
        </p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Total Monto:{" "}
          <span className="font-normal">€{totalMonto.toFixed(2)}</span>
        </p>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <th className="border px-4 py-2">Alumno</th>
              <th className="border px-4 py-2">Contrato</th>
              <th className="border px-4 py-2">Curso</th>
              <th className="border px-4 py-2">Acuerdo Pago</th>
              <th className="border px-4 py-2">Precio</th>
              <th className="border px-4 py-2">Fecha</th>
              <th className="border px-4 py-2">Comercial</th>
            </tr>
          </thead>
          <tbody>
            {rowsToShow.length > 0 ? (
              rowsToShow.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : ""}
                >
                  <td className="border px-4 py-2">{row.alumno}</td>
                  <td className="border px-4 py-2">{row.contrato}</td>
                  <td className="border px-4 py-2">{row.curso}</td>
                  <td className="border px-4 py-2">{row.acuerdoPago}</td>
                  <td className="border px-4 py-2">€{row.precio.toFixed(2)}</td>
                  <td className="border px-4 py-2">{row.fecha}</td>
                  <td className="border px-4 py-2">{row.comercial}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  colSpan={7}
                >
                  No hay datos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div>
          <label className="text-gray-700 dark:text-gray-300 mr-2">
            Filas por página:
          </label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="rounded border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {[5, 10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="space-x-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className={`px-3 py-1 rounded ${
              currentPage <= 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Anterior
          </button>
          <span className="text-gray-700 dark:text-gray-300">
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className={`px-3 py-1 rounded ${
              currentPage >= totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
