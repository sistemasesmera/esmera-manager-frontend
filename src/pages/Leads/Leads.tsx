import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TableLeads from "../../components/leads/Tables/TableLeads";
import LeadsKanbanBoard from "../../components/leads/kanban/LeadsKanbanBoard";

type View = "list" | "kanban";
export type LeadScope = "unassigned" | "assigned";

export default function Leads() {
  const { user } = useSelector((state: RootState) => state.auth);
  const canAssign = user?.role === "ADMIN" || user?.role === "COMMERCIAL_PLUS";

  const [view, setView] = useState<View>("list");
  const [scope, setScope] = useState<LeadScope>(
    canAssign ? "unassigned" : "assigned"
  );

  return (
    <div>
      <PageMeta
        title="Leads - Esmera School"
        description="Gestión de leads en Esmera School."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <PageBreadcrumb pageTitle="Leads" />

        {canAssign && (
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0.5">
            <button
              onClick={() => setScope("unassigned")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                scope === "unassigned"
                  ? "bg-rose-500 text-white"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Sin asignar
            </button>
            <button
              onClick={() => setScope("assigned")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                scope === "assigned"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Asignados
            </button>
          </div>
        )}
        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0.5">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
              view === "list"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Lista
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
              view === "kanban"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="11" rx="1" />
            </svg>
            Kanban
          </button>
        </div>
      </div>

      {view === "list" ? (
        <TableLeads scope={scope} />
      ) : (
        <LeadsKanbanBoard scope={scope} />
      )}
    </div>
  );
}
