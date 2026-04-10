import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TableMyContracts from "../../components/contracts/Tables/TableMyContracts";

export default function MyContracts() {
  return (
    <div>
      <PageMeta
        title="Mis Contratos - Esmera School"
        description="Visualiza el historial de tus contratos en Esmera School. Consulta el estado, fechas y detalles de cada acuerdo."
      />
      <PageBreadcrumb pageTitle="Contratos" />

      <div className="space-y-5 sm:space-y-6">
        <TableMyContracts />
      </div>
    </div>
  );
}
