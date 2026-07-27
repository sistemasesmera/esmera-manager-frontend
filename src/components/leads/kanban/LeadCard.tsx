import { useRef } from "react";
import { useDrag } from "react-dnd";
import { useNavigate } from "react-router-dom";
import Lead, { LEAD_SOURCE_LABELS } from "../../../types/frontend/lead";
import Button from "../../ui/button/Button";

interface LeadCardProps {
  lead: Lead;
  commercials?: { id: string; firstName: string; lastName: string }[];
  onAssign?: (leadId: string, assignedToId: string) => void;
}

export default function LeadCard({ lead, commercials, onAssign }: LeadCardProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "lead",
    item: { lead },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  const initials = lead.assignedTo
    ? `${lead.assignedTo.firstName[0] ?? ""}${
        lead.assignedTo.lastName[0] ?? ""
      }`.toUpperCase()
    : null;

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="relative p-4 bg-white border border-gray-200 rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5 cursor-move"
    >
      <h4 className="mb-1 mr-8 text-sm font-medium text-gray-800 dark:text-white/90">
        {lead.name}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">{lead.phone}</p>
      {lead.nameCourse && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {lead.nameCourse}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80">
          {LEAD_SOURCE_LABELS[lead.source]}
        </span>
        {initials && (
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-medium dark:bg-brand-500/15 dark:text-brand-400">
            {initials}
          </span>
        )}
      </div>

      {lead.branch?.name && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {lead.branch.name}
        </p>
      )}

      {onAssign && commercials && (
        <select
          value=""
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => e.target.value && onAssign(lead.id, e.target.value)}
          className="mt-3 w-full rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10 text-xs text-rose-600 dark:text-rose-400 px-2 py-1.5 focus:outline-none focus:ring focus:border-rose-300 focus:ring-rose-500/10"
        >
          <option value="">Asignar a...</option>
          {commercials.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      )}

      <div className="mt-3">
        <Button
          size="sm"
          onClick={() => navigate(`/leads/${lead.id}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
               bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition-colors duration-200 shadow-sm"
        >
          <span className="font-medium text-gray-600 dark:text-gray-300">
            Ver ficha
          </span>
        </Button>
      </div>
    </div>
  );
}
