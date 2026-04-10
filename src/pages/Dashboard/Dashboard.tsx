import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import axiosInstance from "../../axios/axiosConfig";

type Comercial = {
  nameComercial: string;
  amountTotal: number;
  numberContracts: number;
  branch?: { name: string };
};

type VentasSede = {
  totalAmount: number;
  totalContracts: number;
  totalOnlineSales: number;
  metrics: Comercial[];
};

type OnlineSale = {
  id: number;
  name?: string | null;
  lastName?: string | null;
  nameCourse?: string | null;
  amount?: number | null;
  ref_code?: string | null;
  practiceMode?: string | null;
  createdAt?: string | Date | null;
  commercial?: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    role?: string;
    branch: {
      id: string;
      name?: string;
    };
  } | null;
};

type DashboardData = {
  today: string;
  ventas: {
    general: {
      totalAmount: number;
      totalContracts: number;
      totalOnlineSales: number;
    };
    madrid: VentasSede;
    logroño: VentasSede;
    online?: {
      data: OnlineSale[];
      total: number;
      count: number;
      metrics: any;
    };
  };
};

export default function DashboardComerciales() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20 * 60); // 20 minutos

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("dashboard/data");
      console.log("📊 Dashboard data:", res.data);
      setData(res.data);
      setCountdown(20 * 60);
    } catch (err) {
      console.error(err);
      setError("Error cargando los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (countdown === 0) {
      fetchData();
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, fetchData]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatNumber = (num?: number) =>
    num !== undefined && num !== null ? num.toLocaleString("es-ES") : "--";

  // Componente tabla por sede (ya existente)
  const TablaSede = ({
    titulo,
    data,
  }: {
    titulo: string;
    data: VentasSede;
  }) => (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        {titulo} — Total: €{formatNumber(data.totalAmount)} / Contratos:{" "}
        {data.totalContracts}
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <table className="min-w-full border-collapse divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500">
            <tr>
              {["Comercial", "Monto Total (€)", "Contratos"].map(
                (header, idx) => (
                  <th
                    key={idx}
                    className={`py-3 px-6 text-sm font-semibold text-white uppercase tracking-wide ${
                      idx === 0 ? "text-left" : "text-center"
                    }`}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.metrics.map((comercial, idx) => (
              <tr
                key={idx}
                className={`transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900 ${
                  idx % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                }`}
              >
                <td className="py-4 px-6 text-gray-900 dark:text-gray-100 text-left font-medium flex items-center space-x-2">
                  <span>{comercial.nameComercial}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    - {comercial.branch?.name ?? titulo}
                  </span>
                  <span
                    title={
                      idx < 3
                        ? "¡Excelente trabajo!"
                        : idx === 3
                        ? "¡Casi estás en el podio!"
                        : "¡Ánimo, tú puedes!"
                    }
                    className="ml-2"
                  >
                    {idx < 3 ? "👍" : idx === 3 ? "🤝" : "👊"}
                  </span>
                </td>
                <td className="py-4 px-6 text-center text-blue-600 dark:text-blue-400 font-semibold">
                  {formatNumber(comercial.amountTotal)}
                </td>
                <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-300">
                  {comercial.numberContracts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TablaOnlineMetrics = ({
    titulo,
    metrics,
    total,
    count,
  }: {
    titulo: string;
    metrics: Comercial[];
    total: number;
    count: number;
  }) => (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        {titulo} — Total: €{formatNumber(total)} / Ventas: {count}
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <table className="min-w-full border-collapse divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-500">
            <tr>
              {["Comercial", "Monto Total (€)", "Ventas"].map((header, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-6 text-sm font-semibold text-white uppercase tracking-wide ${
                    idx === 0 ? "text-left" : "text-center"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {metrics.map((comercial, idx) => (
              <tr
                key={idx}
                className={`transition-colors duration-200 hover:bg-purple-50 dark:hover:bg-purple-900 ${
                  idx % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                }`}
              >
                <td className="py-4 px-6 text-gray-900 dark:text-gray-100 text-left font-medium flex items-center space-x-2">
                  <span>
                    {comercial.nameComercial === null
                      ? "Sin Comercial"
                      : comercial.nameComercial}
                  </span>
                  {comercial.branch?.name && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      - {comercial.branch.name}
                    </span>
                  )}
                </td>

                <td className="py-4 px-6 text-center text-blue-600 dark:text-blue-400 font-semibold">
                  {formatNumber(comercial.amountTotal)}
                </td>

                <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-300">
                  {formatNumber(comercial.numberContracts)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Rendimiento" />
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md dark:bg-gray-900 dark:border dark:border-gray-700 min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center">
            📅{" "}
            {data?.today
              ? new Date(data.today).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "--"}
          </h1>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-400 font-mono tabular-nums">
              {formatTime(countdown)}
            </span>
            <button
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition flex items-center"
              title="Recargar datos"
              onClick={fetchData}
              disabled={loading}
            >
              🔄
            </button>
          </div>
        </header>

        {/* Loading / Error */}
        {loading && (
          <p className="text-center text-gray-700 dark:text-gray-300">
            Cargando datos...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 dark:text-red-500">{error}</p>
        )}

        {/* Contenido */}
        {!loading && !error && data && (
          <>
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6 text-center shadow-sm">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Total Vendido
                </h2>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  €{formatNumber(data.ventas.general.totalAmount)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6 text-center shadow-sm">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contratos Totales
                </h2>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(data.ventas.general.totalContracts)}
                </p>
              </div>
              <div className=""></div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6 text-center shadow-sm">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ventas Totales
                </h2>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(data.ventas.general.totalOnlineSales)}
                </p>
              </div>
            </div>

            {/* Tablas por sede */}
            <TablaSede titulo="Madrid" data={data.ventas.madrid} />
            <TablaSede titulo="La Rioja" data={data.ventas.logroño} />
            <TablaOnlineMetrics
              titulo="Online"
              metrics={data.ventas.online!.metrics}
              total={data.ventas.online!.total}
              count={data.ventas.online!.count}
            />
          </>
        )}
      </div>
      me
    </>
  );
}
