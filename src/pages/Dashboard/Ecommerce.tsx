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

interface ComercialMetric {
  amountTotal: number;
  commonGoalPersonalAmount: number;
  commonGoalPersonalContracts: number;
  commonGoalRemainingAmount: number;
  commonGoalRemainingContracts: number;
  nameComercial: string;
  branch: { name: string };
}

interface DashboardData {
  metrics: ComercialMetric[];
  commonGoalAmount: number;
  commonGoalContracts: number;
  commonGoalRemainingAmountTotal: number;
  commonGoalRemainingContractsTotal: number;
  totalAmountSold: number;
}

const fmt = (n: number) => new Intl.NumberFormat("es-ES").format(n);

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
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [statsRes, contractsRes, dashRes] = await Promise.allSettled([
        axiosInstance.get("/dashboard/home-stats"),
        axiosInstance.get("/contracts", { params: { page: 1, limit: 5 } }),
        axiosInstance.get("/dashboard"),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (contractsRes.status === "fulfilled") setContracts(contractsRes.value.data.data ?? []);
      if (dashRes.status === "fulfilled") setDashData(dashRes.value.data);
      setLoading(false);
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

      {!loading && (
        <div className="space-y-6">
          {/* KPIs */}
          {stats && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
              <StatCard
                icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
                label="Alumnos totales"
                value={fmt(stats.totalAlumns)}
              />
              <StatCard
                icon={<ShootingStarIcon className="text-gray-800 size-6 dark:text-white/90" />}
                label="Clientes potenciales activos"
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
          )}

          {/* Próximos contactos */}
          <UpcomingContactsWidget />

          {/* Tabla de ventas por comercial */}
          {dashData && dashData.metrics?.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 md:px-6">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Ventas por comercial
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Objetivo total:{" "}
                    <span className="font-semibold text-gray-700 dark:text-white/80">
                      {fmt(dashData.commonGoalAmount)} €
                    </span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Vendido:{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {fmt(dashData.totalAmountSold)} €
                    </span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-y border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
                      {["Comercial", "Sede", "Vendido (€)", "Objetivo (€)", "Restante (€)", "Obj. contratos", "Rest. contratos"].map((h, i) => (
                        <th
                          key={i}
                          className={`py-3 px-4 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 ${i === 0 ? "text-left" : "text-center"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {dashData.metrics.map((c, idx) => {
                      const pct = c.commonGoalPersonalAmount > 0
                        ? Math.min(100, Math.round((c.amountTotal / c.commonGoalPersonalAmount) * 100))
                        : 0;
                      return (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold shrink-0">
                                {c.nameComercial.charAt(0).toUpperCase()}
                              </div>
                              {c.nameComercial}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            {c.branch.name}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                {fmt(c.amountTotal)}
                              </span>
                              <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06]">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">
                            {fmt(c.commonGoalPersonalAmount)}
                          </td>
                          <td className="py-3 px-4 text-center text-sm font-medium text-red-600 dark:text-red-400">
                            {fmt(c.commonGoalRemainingAmount)}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600 dark:text-gray-300">
                            {c.commonGoalPersonalContracts}
                          </td>
                          <td className="py-3 px-4 text-center text-sm font-medium text-red-600 dark:text-red-400">
                            {c.commonGoalRemainingContracts}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
                      <td colSpan={2} className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Total
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {fmt(dashData.metrics.reduce((s, c) => s + c.amountTotal, 0))}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-bold text-gray-700 dark:text-white/80">
                        {fmt(dashData.commonGoalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-bold text-red-600 dark:text-red-400">
                        {fmt(dashData.commonGoalRemainingAmountTotal)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-bold text-gray-700 dark:text-white/80">
                        {fmt(dashData.commonGoalContracts)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-bold text-red-600 dark:text-red-400">
                        {fmt(dashData.commonGoalRemainingContractsTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

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
