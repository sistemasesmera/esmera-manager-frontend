import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TableContracts from "../../components/contracts/Tables/TableContracts";

export default function Contracts() {
  return (
    <div>
      <PageMeta
        title="Contratos - Esmera School"
        description="Visualiza el historial de contratos en Esmera School. Consulta el estado, fechas y detalles de cada acuerdo."
      />
      <PageBreadcrumb pageTitle="Contratos" />

      <div className="space-y-5 sm:space-y-6">
        <TableContracts />
      </div>
    </div>
  );
}
