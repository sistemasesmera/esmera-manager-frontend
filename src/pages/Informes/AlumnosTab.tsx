import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = ["Contratos", "Cursos", "Alumnos", "Comerciales"] as const;

const routeToTabIndex: Record<string, number> = {
  "/informes-de-contratos": 0,
  "/informes-de-cursos": 1,
  "/informes-de-alumnos": 2,
  "/informes-de-comerciales": 3,
};

const tabIndexToRoute: Record<number, string> = {
  0: "/informes-de-contratos",
  1: "/informes-de-cursos",
  2: "/informes-de-alumnos",
  3: "/informes-de-comerciales",
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
  nombre: string;
  apellido: string;
  nif: string;
  fechaRegistro: string;
  email: string;
  telefono: string;
};

type Filters = {
  fechaInicio: string;
  fechaFin: string;
  searchText: string;
};

export default function Alumnos() {
  const location = useLocation();
  const navigate = useNavigate();

  // Estado del tab activo (por defecto en "Alumnos")
  const [tab, setTab] = useState<number>(2);

  // Paginación
  const [rowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros para fecha y búsqueda
  const [filters, setFilters] = useState<Filters>({
    fechaInicio: "",
    fechaFin: "",
    searchText: "",
  });

  // Datos y datos filtrados localmente
  const [data, setData] = useState<DataRow[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);

  // Sincroniza el tab con la ruta URL
  useEffect(() => {
    const tabIndex = routeToTabIndex[location.pathname];
    if (tabIndex !== undefined) {
      setTab(tabIndex);
      setFilters({ fechaInicio: "", fechaFin: "", searchText: "" });
      setData([]);
      setFilteredData([]);
      setCurrentPage(1);
    }
  }, [location.pathname]);

  // Filtra los datos localmente por texto
  useEffect(() => {
    if (!filters.searchText.trim()) {
      setFilteredData(data);
    } else {
      const search = filters.searchText.toLowerCase();
      setFilteredData(
        data.filter(
          (d) =>
            d.nombre.toLowerCase().includes(search) ||
            d.apellido.toLowerCase().includes(search) ||
            d.nif.toLowerCase().includes(search)
        )
      );
    }
    setCurrentPage(1);
  }, [filters.searchText, data]);

  // Maneja click en tabs para cambiar ruta y resetear filtros
  function handleTabClick(index: number) {
    if (index === tab) return;
    setTab(index);
    const ruta = tabIndexToRoute[index];
    if (ruta && ruta !== location.pathname) {
      navigate(ruta);
    }
    setFilters({ fechaInicio: "", fechaFin: "", searchText: "" });
    setData([]);
    setFilteredData([]);
    setCurrentPage(1);
  }

  // Actualiza filtros (fecha o texto)
  function handleFilterChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  // Aplica filtro rápido según label de fecha
  function handleQuickFilter(label: string) {
    const { fechaInicio, fechaFin } = getDateRange(label);
    setFilters({ fechaInicio, fechaFin, searchText: "" });
  }

  // Busca datos en API según filtro y tab actual
  async function handleBuscar() {
    if (tab === 2) {
      // Si hay texto en búsqueda, navegamos directo al alumno con ese documento
      if (filters.searchText.trim()) {
        const documentNumber = filters.searchText.trim();
        const queryParams = new URLSearchParams({
          fechaInicio: filters.fechaInicio,
          fechaFin: filters.fechaFin,
        }).toString();

        navigate(`/alumns/${documentNumber}?${queryParams}`);
        return;
      }

      // Si no hay texto, hacer fetch normal
      const url = `/api/alumnos?fechaInicio=${filters.fechaInicio || ""}&fechaFin=${
        filters.fechaFin || ""
      }`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error en la petición: ${res.status} - ${text}`);
        }
        const dataApi: DataRow[] = await res.json();
        setData(dataApi);
      } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Error al buscar:", err.message);
  } else {
    console.error("Error al buscar:", err);
  }
  setData([]);
}

    } else {
      // Otros tabs (contratos, cursos, comerciales)
      const rutaAPI = tabIndexToRoute[tab];
      if (!rutaAPI) return;

      let url = `${rutaAPI}?fechaInicio=${filters.fechaInicio || ""}&fechaFin=${
        filters.fechaFin || ""
      }`;
      if (filters.searchText) {
        url += `&search=${encodeURIComponent(filters.searchText)}`;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error en la petición: ${res.status} - ${text}`);
        }
        const dataApi: DataRow[] = await res.json();
        setData(dataApi);
      } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Error al buscar:", err.message);
  } else {
    console.error("Error al buscar:", err);
  }
  setData([]);
}

    }
  }

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const rowsToShow = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Cuando cambia tab o filtros, resetea página
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, filters.fechaInicio, filters.fechaFin]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Informe de {TABS[tab]}
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 dark:border-gray-700 mb-4">
        {TABS.map((label, i) => (
          <button
            key={label}
            onClick={() => handleTabClick(i)}
            className={`px-4 py-2 -mb-px font-medium border-b-2 ${
              tab === i
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtros */}
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
            Documento
          </label>
          <input
            type="text"
            name="searchText"
            value={filters.searchText}
            onChange={handleFilterChange}
            placeholder="Nombre, Apellido o NIF"
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleBuscar}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="mb-6">
        <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Filtros Rápidos:
        </p>
        {["Hoy", "Esta Semana", "Mes Pasado", "Este Mes", "Este Año"].map(
          (label) => (
            <button
              key={label}
              onClick={() => handleQuickFilter(label)}
              className="mr-2 mb-2 rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition"
            >
              {label}
            </button>
          )
        )}
      </div>

      {/* Totales */}
      <div className="mb-6 space-y-1">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Total {TABS[tab]}: <span className="font-normal">{totalRows}</span>
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-auto rounded shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {[
                "Nombre",
                "Apellido",
                "NIF",
                "Fecha Registro",
                "Email",
                "Teléfono",
              ].map((headCell) => (
                <th
                  key={headCell}
                  className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400"
                >
                  {headCell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsToShow.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                >
                  No se encontraron {TABS[tab].toLowerCase()}.
                </td>
              </tr>
            ) : (
              rowsToShow.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-t border-gray-200 dark:border-gray-700 ${
                    idx % 2 === 0 ? "bg-white dark:bg-gray-900" : ""
                  }`}
                >
                  <td className="px-4 py-2">{row.nombre}</td>
                  <td className="px-4 py-2">{row.apellido}</td>
                  <td className="px-4 py-2">{row.nif}</td>
                  <td className="px-4 py-2">{row.fechaRegistro}</td>
                  <td className="px-4 py-2">{row.email}</td>
                  <td className="px-4 py-2">{row.telefono}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border border-gray-300 dark:border-gray-700 ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
