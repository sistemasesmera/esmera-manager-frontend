import { useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import axiosInstance from "../../axios/axiosConfig";
import {
  DollarLineIcon,
  BoxIconLine,
  GroupIcon,
  ShootingStarIcon,
} from "../../icons";

type Comercial = {
  nameComercial: string;
  amountTotal: number;
  numberContracts: number;
  branch?: { name: string };
};

type VentasSede = {
  totalAmount: number;
  totalContracts: number;
  metrics: Comercial[];
};

type DashboardData = {
  today: string;
  ventas: {
    general: {
      totalAmount: number;
      totalContracts: number;
    };
    madrid: VentasSede;
    logroño: VentasSede;
  };
};

const formatNumber = (num?: number) =>
  num !== undefined && num !== null ? num.toLocaleString("es-ES") : "--";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// Tarjeta de métrica resumen
const StatCard = ({
  icon,
  label,
  value,
  subValue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      {icon}
    </div>
    <div className="mt-5">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
        {value}
      </h4>
      {subValue && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {subValue}
        </span>
      )}
    </div>
  </div>
);

// Tabla de ventas por sede
const TablaSede = ({
  titulo,
  data,
  accentFrom,
  accentTo,
}: {
  titulo: string;
  data: VentasSede;
  accentFrom: string;
  accentTo: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
      {titulo} — Total: €{formatNumber(data.totalAmount)} / Contratos:{" "}
      {data.totalContracts}
    </h2>

    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full border-collapse divide-y divide-gray-200 dark:divide-gray-800">
        <thead className={`bg-gradient-to-r ${accentFrom} ${accentTo}`}>
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
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.metrics.map((comercial, idx) => (
            <tr
              key={idx}
              className={`transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                idx % 2 === 0
                  ? "bg-gray-50/50 dark:bg-white/[0.01]"
                  : "bg-white dark:bg-transparent"
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

  // Top comerciales del mes (ambas sedes combinadas)
  const topComerciales = useMemo(() => {
    if (!data) return [];
    return [...data.ventas.madrid.metrics, ...data.ventas.logroño.metrics]
      .sort((a, b) => b.amountTotal - a.amountTotal)
      .slice(0, 6);
  }, [data]);

  const topComercialesOptions: ApexOptions = {
    colors: ["#465fff", "#7592ff", "#0ba5ec", "#12b76a", "#f79009", "#9333ea"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        borderRadiusApplication: "end",
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    xaxis: {
      categories: topComerciales.map((c) => c.nameComercial),
    },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number) => `€${val.toLocaleString("es-ES")}` },
    },
  };

  const topComercialesSeries = [
    {
      name: "Ventas (€)",
      data: topComerciales.map((c) => c.amountTotal),
    },
  ];

  const branchDonutOptions: ApexOptions = {
    colors: ["#465fff", "#12b76a"],
    labels: ["Madrid", "La Rioja"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: (w) =>
                `€${w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toLocaleString("es-ES")}`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: true },
    stroke: { show: false },
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    tooltip: {
      y: { formatter: (val: number) => `€${val.toLocaleString("es-ES")}` },
    },
  };

  const branchDonutSeries = data
    ? [data.ventas.madrid.totalAmount, data.ventas.logroño.totalAmount]
    : [];

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard Comerciales" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              📅{" "}
              {data?.today
                ? new Date(data.today).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "--"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Resumen de ventas del mes en curso
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-sm tabular-nums text-gray-500 dark:text-gray-400">
              Próxima actualización: {formatTime(countdown)}
            </span>
            <button
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
              title="Recargar datos"
              onClick={fetchData}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && !data && (
          <p className="text-center text-gray-700 dark:text-gray-300">
            Cargando datos...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 dark:text-red-500">{error}</p>
        )}

        {/* Contenido */}
        {data && (
          <>
            {/* Resumen general */}
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <StatCard
                  icon={
                    <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
                  }
                  label="Total Vendido"
                  value={`€${formatNumber(data.ventas.general.totalAmount)}`}
                />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <StatCard
                  icon={
                    <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
                  }
                  label="Contratos Totales"
                  value={formatNumber(data.ventas.general.totalContracts)}
                />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <StatCard
                  icon={
                    <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
                  }
                  label="Madrid"
                  value={`€${formatNumber(data.ventas.madrid.totalAmount)}`}
                  subValue={`${data.ventas.madrid.totalContracts} contratos`}
                />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-3">
                <StatCard
                  icon={
                    <ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />
                  }
                  label="La Rioja"
                  value={`€${formatNumber(data.ventas.logroño.totalAmount)}`}
                  subValue={`${data.ventas.logroño.totalContracts} contratos`}
                />
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-12 xl:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Top comerciales del mes
                </h3>
                {topComerciales.length > 0 ? (
                  <Chart
                    options={topComercialesOptions}
                    series={topComercialesSeries}
                    type="bar"
                    height={300}
                  />
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Sin datos disponibles
                  </p>
                )}
              </div>

              <div className="col-span-12 xl:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Reparto de ventas por sede
                </h3>
                <Chart
                  options={branchDonutOptions}
                  series={branchDonutSeries}
                  type="donut"
                  height={300}
                />
              </div>
            </div>

            {/* Tablas por sede */}
            <TablaSede
              titulo="Madrid"
              data={data.ventas.madrid}
              accentFrom="from-blue-600"
              accentTo="to-blue-500"
            />
            <TablaSede
              titulo="La Rioja"
              data={data.ventas.logroño}
              accentFrom="from-emerald-600"
              accentTo="to-emerald-500"
            />
          </>
        )}
      </div>
    </>
  );
}
