import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import axiosInstance from "../../axios/axiosConfig";
import {
  LeadStatus,
  LEAD_STATUS_LABELS,
} from "../../types/frontend/lead";
import SpinnerThree from "../ui/spinner/SpinnerThree";

interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

const STATUS_ORDER = [
  LeadStatus.SIN_ASIGNAR,
  LeadStatus.CONTACTADO,
  LeadStatus.EN_SEGUIMIENTO,
  LeadStatus.MATRICULADO,
  LeadStatus.DESCARTADO,
];

const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.SIN_ASIGNAR]: "#3b82f6",
  [LeadStatus.CONTACTADO]: "#eab308",
  [LeadStatus.EN_SEGUIMIENTO]: "#a855f7",
  [LeadStatus.MATRICULADO]: "#22c55e",
  [LeadStatus.DESCARTADO]: "#ef4444",
};

export default function SalePieChart() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get("/leads/stats");
        setStats(data);
      } catch (err) {
        console.error("Error al cargar las estadísticas de leads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex justify-center items-center py-10">
          <SpinnerThree />
        </div>
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const series = STATUS_ORDER.map((status) => stats?.byStatus?.[status] ?? 0);

  const options: ApexOptions = {
    colors: STATUS_ORDER.map((status) => STATUS_COLORS[status]),
    labels: STATUS_ORDER.map((status) => LEAD_STATUS_LABELS[status]),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      width: 280,
      height: 280,
    },
    stroke: {
      show: false,
      width: 4,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              offsetY: 0,
              color: "#1D2939",
              fontSize: "12px",
              fontWeight: "normal",
            },
            value: {
              show: true,
              offsetY: 10,
              color: "#667085",
              fontSize: "14px",
            },
            total: {
              show: true,
              label: "Total",
              color: "#000000",
              fontSize: "20px",
              fontWeight: "bold",
              formatter: () => `${total}`,
            },
          },
        },
      },
    },
    states: {
      hover: {
        filter: { type: "none" },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: "darken" },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 640,
        options: { chart: { width: 280, height: 280 } },
      },
      {
        breakpoint: 2600,
        options: { chart: { width: 240, height: 240 } },
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Leads por estado
        </h3>
      </div>
      <div className="flex flex-col items-center gap-8 xl:flex-row">
        <div id="chartDarkStyle">
          {total > 0 ? (
            <Chart
              options={options}
              series={series}
              type="donut"
              height={280}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-10">
              No hay leads para mostrar.
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row xl:flex-col">
          {STATUS_ORDER.map((status) => {
            const count = stats?.byStatus?.[status] ?? 0;
            const percentage =
              total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} className="flex items-start gap-2.5">
                <div
                  className="mt-1.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                ></div>
                <div>
                  <h5 className="mb-1 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {LEAD_STATUS_LABELS[status]}
                  </h5>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                      {percentage}%
                    </p>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {count} leads
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
