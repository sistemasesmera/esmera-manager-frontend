import { useState, useEffect, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axiosConfig"; // Ajusta la ruta

type Comercial = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
};

const TABS = ["Contratos", "Cursos", "Alumnos", "Comerciales"];

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

export default function ComercialesTab() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState<number>(3); // Por defecto Comerciales

  const [filters, setFilters] = useState({
    nombre: "",
  });

  const [rowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [data, setData] = useState<Comercial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar tab con ruta
  useEffect(() => {
    const tabIndex = routeToTabIndex[location.pathname];
    if (tabIndex !== undefined && tabIndex !== tab) {
      setTab(tabIndex);
      setCurrentPage(1);
      setFilters({ nombre: "" });
    }
  }, [location.pathname, tab]); // <-- aquí añadí tab

  // Navegar al cambiar tab
  function handleTabClick(index: number) {
    setTab(index);
    setCurrentPage(1);
    setFilters({ nombre: "" });
    const ruta = tabIndexToRoute[index];
    if (ruta && ruta !== location.pathname) {
      navigate(ruta);
    }
  }

  type ComercialAPI = {
    id: number;
    name: string;
    phone: string;
    email: string;
  };

  useEffect(() => {
    if (tab !== 3) return; // Solo cargar si estamos en Comerciales

    setLoading(true);
    setError(null);

    axiosInstance
      .get("/commercials", { params: { limit: 1000 } }) // Ajusta endpoint
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setData(
            res.data.data.map((c: ComercialAPI) => ({
              id: c.id,
              nombre: c.name || "",
              telefono: c.phone || "",
              email: c.email || "",
            }))
          );
        } else {
          setData([]);
        }
      })
      .catch(() => {
        setError("Error cargando los comerciales");
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tab]);

  function handleFilterChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  }

  const filteredData = data.filter((comercial) =>
    comercial.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
  );

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const rowsToShow = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
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

      {tab === 3 && (
        <>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-1">
              Buscar comercial:
            </label>
            <input
              type="text"
              name="nombre"
              value={filters.nombre}
              onChange={handleFilterChange}
              className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Nombre del comercial"
              autoComplete="off"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-700 dark:text-gray-300">
              Cargando comerciales...
            </p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              <div className="overflow-auto rounded shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      {["Nombre", "Teléfono", "Email"].map((headCell) => (
                        <th
                          key={headCell}
                          className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300"
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
                          colSpan={3}
                          className="text-center py-6 text-gray-500 dark:text-gray-400"
                        >
                          No se encontraron comerciales.
                        </td>
                      </tr>
                    ) : (
                      rowsToShow.map((comercial) => (
                        <tr
                          key={comercial.id}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-4 py-3">{comercial.nombre}</td>
                          <td className="px-4 py-3">{comercial.telefono}</td>
                          <td className="px-4 py-3">{comercial.email}</td>
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
        </>
      )}

      {tab !== 3 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Contenido para el tab <strong>{TABS[tab]}</strong> no implementado.
        </div>
      )}
    </div>
  );
}
