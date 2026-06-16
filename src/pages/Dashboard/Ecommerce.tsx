import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import axiosInstance from "../../axios/axiosConfig";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import UpcomingContactsWidget from "../../components/crm/UpcomingContactsWidget";
import {
  GroupIcon,
  BoxIconLine,
  DollarLineIcon,
  ShootingStarIcon,
} from "../../icons";

interface HomeStats {
  totalAlumns: number;
  activeLeads: number;
  monthContracts: number;
  monthAmount: number;
  periodLabel: string;
}

interface RecentContract {
  id: string;
  name: string;
  coursePrice: number;
  createdAt: string;
  alumn: { id: string; firstName: string; lastName: string } | null;
  course: { id: string; name: string } | null;
  user: { id: string; firstName: string; lastName: string } | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES").format(n);

const StatCard = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      {icon}
    </div>
    <div className="mt-5">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
        {value}
      </h4>
      {sub && (
        <span className="text-xs text-gray-400 dark:text-gray-500">{sub}</span>
      )}
    </div>
  </div>
);

export default function Ecommerce() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [contracts, setContracts] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, contractsRes] = await Promise.all([
          axiosInstance.get("/dashboard/home-stats"),
          axiosInstance.get("/contracts", { params: { page: 1, limit: 5 } }),
        ]);
        setStats(statsRes.data);
        setContracts(contractsRes.data.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <>
      <PageMeta
        title="Inicio | Esmera School"
        description="Panel de inicio de Esmera School"
      />

      {loading && (
        <div className="flex justify-center items-center py-16">
          <SpinnerThree />
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
            <StatCard
              icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
              label="Alumnos totales"
              value={fmt(stats.totalAlumns)}
            />
            <StatCard
              icon={<ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />}
              label="Leads activos"
              value={fmt(stats.activeLeads)}
              sub="En seguimiento o pendientes"
            />
            <StatCard
              icon={<BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />}
              label="Contratos este mes"
              value={fmt(stats.monthContracts)}
              sub={stats.periodLabel}
            />
            <StatCard
              icon={<DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />}
              label="Importe este mes"
              value={`${fmt(stats.monthAmount)} €`}
              sub={stats.periodLabel}
            />
          </div>

          {/* Próximos contactos */}
          <UpcomingContactsWidget />

          {/* Últimos contratos */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 md:px-6">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Últimos contratos
              </h3>
              <button
                onClick={() => navigate("/contracts")}
                className="text-sm text-brand-500 hover:underline dark:text-brand-400"
              >
                Ver todos
              </button>
            </div>

            {contracts.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-gray-400 dark:text-gray-500">
                No hay contratos aún.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 md:px-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                        {c.alumn
                          ? `${c.alumn.firstName} ${c.alumn.lastName}`
                          : c.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {c.course?.name ?? "—"}
                        {c.user
                          ? ` · ${c.user.firstName} ${c.user.lastName}`
                          : ""}
                        {" · "}
                        {new Date(c.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-gray-700 dark:text-white/80">
                      {fmt(c.coursePrice)} €
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
