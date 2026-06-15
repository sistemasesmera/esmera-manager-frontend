import TableLeads from "../../components/leads/Tables/TableLeads";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Leads() {
  return (
    <div>
      <PageMeta
        title="Leads - Esmera School "
        description="Gestión del pipeline de leads en Esmera School. Consulta, asigna y da seguimiento a los posibles alumnos."
      />
      <PageBreadcrumb pageTitle="Leads" />

      <div className="space-y-5 sm:space-y-6">
        <TableLeads />
      </div>
    </div>
  );
}
