import TableAlumns from "../../components/alumns/Tables/TableAlumns";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Alumns() {
  return (
    <div>
      <PageMeta
        title="Alumnos - Esmera School "
        description="Gestión de alumnos en Esmera School. Consulta, administra y actualiza la información de los estudiantes."
      />
      <PageBreadcrumb pageTitle="Alumnos" />

      <div className="space-y-5 sm:space-y-6">
        <TableAlumns />
      </div>
    </div>
  );
}
