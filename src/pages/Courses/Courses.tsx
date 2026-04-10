import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TableCourses from "../../components/courses/Tables/TableCourses";

export default function Courses() {
  return (
    <div>
      <PageMeta
        title="Cursos - Esmera School"
        description="Gestión de cursos en Esmera School. Consulta, administra y actualiza la información de los programas académicos."
      />
      <PageBreadcrumb pageTitle="Cursos" />

      <div className="space-y-5 sm:space-y-6">
        <TableCourses />
      </div>
    </div>
  );
}
