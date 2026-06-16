import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import SpinnerThree from "../../components/ui/spinner/SpinnerThree";
import axiosInstance from "../../axios/axiosConfig";
import {
  LeadStatus, LeadSource,
  LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS,
} from "../../types/frontend/lead";
import type Lead from "../../types/frontend/lead";

interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
}

const STATUS_CONFIG: Record<LeadStatus, { color: string; bg: string; dot: string }> = {
  [LeadStatus.NUEVO]:           { color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20",   dot: "bg-blue-500" },
  [LeadStatus.CONTACTADO]:      { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", dot: "bg-amber-500" },
  [LeadStatus.EN_SEGUIMIENTO]:  { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20", dot: "bg-violet-500" },
  [LeadStatus.MATRICULADO]:     { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", dot: "bg-emerald-500" },
  [LeadStatus.DESCARTADO]:      { color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20",     dot: "bg-red-500" },
};

const SOURCE_CONFIG: Record<LeadSource, { label: string; color: string; bg: string }> = {
  [LeadSource.WEB]:        { label: "Web", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  [LeadSource.WEB_ONLINE]: { label: "Web Online", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  [LeadSource.META_ADS]:   { label: "Meta Ads", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  [LeadSource.MANUAL]:     { label: "Manual", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
};

const STATUS_ORDER = [
  LeadStatus.NUEVO,
  LeadStatus.CONTACTADO,
  LeadStatus.EN_SEGUIMIENTO,
  LeadStatus.MATRICULADO,
  LeadStatus.DESCARTADO,
];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-gray-800 dark:text-white/90"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function LeadsConversionTab() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const itemsPerPage = 15;

  useEffect(() => {
    axiosInstance.get("/leads/stats")
      .then(({ data }) => setStats(data))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingLeads(true);
    axiosInstance.get("/leads", {
      params: {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter || undefined,
      },
    })
      .then(({ data }) => {
        setLeads(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .finally(() => setLoadingLeads(false));
  }, [currentPage, statusFilter]);

  const total = stats?.total ?? 0;
  const matriculados = stats?.byStatus?.[LeadStatus.MATRICULADO] ?? 0;
  const descartados = stats?.byStatus?.[LeadStatus.DESCARTADO] ?? 0;
  const enPipeline =
    (stats?.byStatus?.[LeadStatus.NUEVO] ?? 0) +
    (stats?.byStatus?.[LeadStatus.CONTACTADO] ?? 0) +
    (stats?.byStatus?.[LeadStatus.EN_SEGUIMIENTO] ?? 0);
  const tasaConversion = total > 0 ? ((matriculados / total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      {loadingStats ? (
        <div className="flex justify-center py-8"><SpinnerThree /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total leads" value={String(total)} />
          <KpiCard label="Matriculados" value={String(matriculados)} accent />
          <KpiCard label="Tasa de conversión" value={`${tasaConversion}%`} sub="Matriculados / Total" accent />
          <KpiCard label="En pipeline" value={String(enPipeline)} sub="Nuevo · Contactado · Seguimiento" />
        </div>
      )}

      {/* Embudo por estado */}
      {!loadingStats && stats && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-white/80 mb-4">Distribución por estado</h4>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = stats.byStatus?.[status] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`w-28 shrink-0 text-xs font-medium ${cfg.color}`}>
                    {LEAD_STATUS_LABELS[status]}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cfg.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
                    {count} <span className="text-gray-300 dark:text-gray-600">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla de leads */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Cabecera tabla */}
        <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-white/80">Listado de leads</h4>
          <div className="flex items-center gap-2 flex-wrap">
            {["", ...STATUS_ORDER].map((s) => (
              <button
                key={s || "all"}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  statusFilter === s
                    ? "bg-brand-500 text-white border-brand-500"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {s ? LEAD_STATUS_LABELS[s as LeadStatus] : "Todos"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingLeads ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <SpinnerThree />
              <p className="text-sm text-gray-400">Cargando leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <svg className="w-9 h-9 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p className="text-sm text-gray-400">No hay leads para mostrar</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Nombre</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden sm:table-cell">Fuente</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left">Estado</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden md:table-cell">Comercial</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden lg:table-cell">Sede</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-left hidden lg:table-cell">Alta</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {leads.map((lead) => {
                  const statusCfg = STATUS_CONFIG[lead.status];
                  const sourceCfg = SOURCE_CONFIG[lead.source] ?? SOURCE_CONFIG[LeadSource.MANUAL];
                  return (
                    <TableRow key={lead.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{lead.name}</p>
                          {lead.phone && <p className="text-xs text-gray-400 dark:text-gray-500">{lead.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sourceCfg.bg} ${sourceCfg.color}`}>
                          {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {LEAD_STATUS_LABELS[lead.status]}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {lead.assignedTo
                          ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                          : <span className="italic text-gray-300 dark:text-gray-600">Sin asignar</span>}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 hidden lg:table-cell">
                        {lead.branch ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                            {lead.branch.name}
                          </span>
                        ) : <span className="text-gray-300 dark:text-gray-600 italic text-xs">—</span>}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-sm text-gray-400 dark:text-gray-500 hidden lg:table-cell">
                        {fmtDate(lead.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {!loadingLeads && leads.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] md:px-6">
            <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Página <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> de{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
            </span>
            <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
          </div>
        )}
      </div>
    </div>
  );
}
