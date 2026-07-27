import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LeadsKanbanBoard from "../../components/leads/kanban/LeadsKanbanBoard";

export default function LeadsPipeline() {
  return (
    <div>
      <PageMeta
        title="Pipeline de Leads - Esmera School "
        description="Tablero del pipeline de leads en Esmera School."
      />
      <PageBreadcrumb pageTitle="Pipeline de Leads" />

      <LeadsKanbanBoard scope="assigned" />
    </div>
  );
}
