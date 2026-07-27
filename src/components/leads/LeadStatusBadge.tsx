import { LeadStatus, LEAD_STATUS_LABELS } from "../../types/frontend/lead";

export const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  [LeadStatus.SIN_ASIGNAR]:
    "bg-rose-100 text-rose-600 dark:bg-rose-700 dark:text-white",
  [LeadStatus.CONTACTADO]:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-700 dark:text-white",
  [LeadStatus.EN_SEGUIMIENTO]:
    "bg-purple-100 text-purple-600 dark:bg-purple-700 dark:text-white",
  [LeadStatus.MATRICULADO]:
    "bg-green-100 text-green-600 dark:bg-green-700 dark:text-white",
  [LeadStatus.DESCARTADO]:
    "bg-red-100 text-red-600 dark:bg-red-700 dark:text-white",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${STATUS_BADGE_CLASSES[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
