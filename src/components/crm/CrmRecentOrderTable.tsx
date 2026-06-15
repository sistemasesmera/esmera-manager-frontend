import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import AvatarText from "../ui/avatar/AvatarText";
import axiosInstance from "../../axios/axiosConfig";
import SpinnerThree from "../ui/spinner/SpinnerThree";
import Lead, { LEAD_SOURCE_LABELS } from "../../types/frontend/lead";
import { LeadStatusBadge } from "../leads/Modals/LeadDetailModal";

export default function CrmRecentOrderTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await axiosInstance.get("/leads", {
          params: { page: 1, limit: 5 },
        });
        setLeads(data.data);
      } catch (err) {
        console.error("Error al cargar los leads recientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Leads recientes
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <SpinnerThree />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-600 dark:text-gray-400">
            No hay leads para mostrar...
          </p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[617px] 2xl:min-w-[808px]">
            <Table>
              <TableHeader className="px-6 py-3 border-t border-gray-100 border-y bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <TableRow>
                  <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                    Lead
                  </TableCell>
                  <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                    Curso de interés
                  </TableCell>
                  <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                    Origen
                  </TableCell>
                  <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                    Fecha
                  </TableCell>
                  <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                    Estado
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarText name={lead.name} className="w-10 h-10" />
                        <div>
                          <span className="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                            {lead.name}
                          </span>
                          <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                            {lead.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {lead.nameCourse || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {LEAD_SOURCE_LABELS[lead.source]}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 py-3.5">
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
