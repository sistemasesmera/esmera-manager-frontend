import { useEffect, useState } from "react";
import axiosInstance from "../../axios/axiosConfig";
import { LeadStatus } from "../../types/frontend/lead";
import SpinnerThree from "../ui/spinner/SpinnerThree";

interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: number;
  newThisMonth: number;
}

export default function CrmMetrics() {
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
      <div className="flex justify-center items-center py-10">
        <SpinnerThree />
      </div>
    );
  }

  const items = [
    {
      id: 1,
      title: "Leads totales",
      value: stats?.total ?? 0,
    },
    {
      id: 2,
      title: "Nuevos este mes",
      value: stats?.newThisMonth ?? 0,
    },
    {
      id: 3,
      title: "Tasa de conversión",
      value: `${(stats?.conversionRate ?? 0).toFixed(1)}%`,
      hint: `${stats?.byStatus?.[LeadStatus.MATRICULADO] ?? 0} matriculados`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
            {item.value}
          </h4>

          <div className="flex items-end justify-between mt-4 sm:mt-5">
            <div>
              <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                {item.title}
              </p>
            </div>
            {item.hint && (
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                {item.hint}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
