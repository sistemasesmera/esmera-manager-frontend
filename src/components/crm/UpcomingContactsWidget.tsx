import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios/axiosConfig";
import Lead from "../../types/frontend/lead";

export default function UpcomingContactsWidget() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/leads/upcoming-contacts")
      .then(({ data }) => setLeads(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || leads.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-500/20 dark:bg-orange-500/5">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        <h5 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
          Leads pendientes de contactar ({leads.length})
        </h5>
      </div>
      <ul className="space-y-2">
        {leads.map((lead) => {
          const isOverdue =
            lead.nextContactDate && lead.nextContactDate.slice(0, 10) < today;
          return (
            <li
              key={lead.id}
              className="flex items-center justify-between gap-3 cursor-pointer rounded-lg px-3 py-2 hover:bg-orange-100 dark:hover:bg-orange-500/10 transition-colors"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                  {lead.name}
                </p>
                {lead.assignedTo && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                  isOverdue
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                }`}
              >
                {lead.nextContactDate
                  ? new Date(lead.nextContactDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
