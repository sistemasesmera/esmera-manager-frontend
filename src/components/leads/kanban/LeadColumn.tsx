import { useRef } from "react";
import { useDrop } from "react-dnd";
import Lead, { LeadStatus } from "../../../types/frontend/lead";
import LeadCard from "./LeadCard";

interface LeadColumnProps {
  title: string;
  status: LeadStatus;
  leads: Lead[];
  onDropLead: (lead: Lead, newStatus: LeadStatus) => void;
}

export default function LeadColumn({
  title,
  status,
  leads,
  onDropLead,
}: LeadColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<
    { lead: Lead },
    void,
    { isOver: boolean }
  >({
    accept: "lead",
    drop: (item) => {
      if (item.lead.status !== status) {
        onDropLead(item.lead, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-4 p-4 swim-lane xl:p-6 min-h-[200px] transition-colors duration-150 ${
        isOver ? "bg-brand-50 dark:bg-white/[0.03]" : ""
      }`}
    >
      <h3 className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-white/90">
        {title}
        <span className="inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80">
          {leads.length}
        </span>
      </h3>
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
