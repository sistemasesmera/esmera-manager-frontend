import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TableLeads from "../../components/leads/Tables/TableLeads";
import LeadsKanbanBoard from "../../components/leads/kanban/LeadsKanbanBoard";

type View = "list" | "kanban";

export default function Leads() {
  const [view, setView] = useState<View>("list");

  return (
    <div>
      <PageMeta
        title="Leads - Esmera School"
        description="Gestión de leads en Esmera School."
      />
      <div className="flex items-center justify-between mb-5">
        <PageBreadcrumb pageTitle="Leads" />
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

      {view === "list" ? <TableLeads /> : <LeadsKanbanBoard />}
    </div>
  );
}
