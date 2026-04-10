import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import axiosInstance from "../../axios/axiosConfig";

type Comercial = {
  amountTotal: number;
  commonGoalPersonalAmount: number;
  commonGoalPersonalContracts: number;
  commonGoalRemainingAmount: number;
  commonGoalRemainingContracts: number;
  nameComercial: string;
  branch: {
    name: string;
  };
};
type dataGeneral = {
  commonGoalAmount: number;
  commonGoalContracts: number;
  commonGoalRemainingAmountTotal: number;
  commonGoalRemainingContractsTotal: number;
  totalAmountSold: number;
  today: number;
};

export default function RendimientoComerciales() {
  const [data, setData] = useState<Comercial[]>([]);
  const [dataGeneral, setDataGeneral] = useState<dataGeneral>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(20 * 60); // 20 minutos

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("dashboard");
      console.log(res.data);
      setDataGeneral(res.data);
      setData(res.data.metrics);
      setCountdown(20 * 60);
    } catch {
      setError("Error simulando la carga de datos");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const refreshDataWithReset = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (countdown === 0) {
      refreshDataWithReset();
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, refreshDataWithReset]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "";
    return num.toLocaleString("es-ES");
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Rendimiento" />
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md dark:bg-gray-900 dark:border dark:border-gray-700 min-h-screen">
        {/* Encabezado */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white flex items-center">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              className="text-blue-600 mr-2"
              height="1.4em"
              width="1.4em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path>
            </svg>
            {new Date(dataGeneral?.today || "").toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-400 font-mono tabular-nums">
              {formatTime(countdown)}
            </span>
            <button
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition flex items-center"
              title="Recargar datos"
              onClick={refreshData}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Estado de carga o error */}
        {loading && (
          <p className="text-center text-gray-700 dark:text-gray-300">
            Cargando datos...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 dark:text-red-500">
            Error: {error}
          </p>
        )}

        {/* Resumen */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-center">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Objetivo Total
                </h2>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(dataGeneral?.commonGoalAmount)}
                </p>
              </div>
              <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-center">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Restante Total
                </h2>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatNumber(dataGeneral?.commonGoalRemainingAmountTotal)}
                </p>
              </div>
              <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-center">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Objetivo Total Contratos
                </h2>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(dataGeneral?.commonGoalContracts)}
                </p>
              </div>
              <div className="bg-white rounded-md p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-center">
                <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Restante Total Contratos
                </h2>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatNumber(dataGeneral?.commonGoalRemainingContractsTotal)}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Tabla de comerciales */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <table className="min-w-full border-collapse divide-y divide-gray-200 dark:divide-gray-700">
            {/* Encabezado */}
            <thead className="bg-gradient-to-r from-blue-600 to-blue-500">
              <tr>
                {[
                  "Comercial",
                  "Monto Total (€)",
                  "Objetivo (€)",
                  "Restante (€)",
                  "Objetivo Contratos",
                  "Restante Contratos",
                ].map((header, idx) => (
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

            {/* Cuerpo */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((comercial, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900 ${
                    idx % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-800"
                      : "bg-white dark:bg-gray-900"
                  }`}
                >
                  {/* Comercial + Sucursal + Emoji */}
                  <td className="py-4 px-6 text-gray-900 dark:text-gray-100 text-left font-medium flex items-center space-x-2">
                    <span>{comercial.nameComercial}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      - {comercial.branch.name}
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
                      {idx < 3 ? "👍" : idx === 3 ? "🤝" : "👎"}
                    </span>
                  </td>

                  {/* Monto Total */}
                  <td className="py-4 px-6 text-center text-blue-600 dark:text-blue-400 font-semibold">
                    {comercial.amountTotal.toLocaleString()}
                  </td>

                  {/* Objetivo */}
                  <td className="py-4 px-6 text-center text-blue-600 dark:text-blue-400 font-semibold">
                    {comercial.commonGoalPersonalAmount.toLocaleString()}
                  </td>

                  {/* Restante */}
                  <td className="py-4 px-6 text-center text-red-600 dark:text-red-400 font-semibold">
                    {comercial.commonGoalRemainingAmount.toLocaleString()}
                  </td>

                  {/* Objetivo Contratos */}
                  <td className="py-4 px-6 text-center text-gray-800 dark:text-gray-300">
                    {comercial.commonGoalPersonalContracts}
                  </td>

                  {/* Restante Contratos */}
                  <td className="py-4 px-6 text-center text-red-600 dark:text-red-400 font-semibold">
                    {comercial.commonGoalRemainingContracts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <p className="text-blue-600 text-xl font-bold">
            Total Monto (€):{" "}
            {data.reduce((sum, c) => sum + c.amountTotal, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
}
