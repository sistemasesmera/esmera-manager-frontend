import { useRef } from "react";
import { useDrag } from "react-dnd";
import Lead, { LEAD_SOURCE_LABELS } from "../../../types/frontend/lead";
import LeadDetailModal from "../Modals/LeadDetailModal";

interface LeadCardProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
}

export default function LeadCard({ lead, onUpdate }: LeadCardProps) {
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

      <div className="mt-3">
        <LeadDetailModal lead={lead} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
