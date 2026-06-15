import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FaqOne from "../../components/faqs/FaqOne";

const sections = [
  {
    title: "1. Dashboard / Resumen",
    content:
      "Es la pantalla principal al entrar. Muestra un resumen del mes: objetivo de ventas, objetivo de contratos, contratos realizados y progreso hacia la meta mensual.\n\nLos administradores ven datos de todas las sedes; los comerciales ven principalmente su propio rendimiento.",
  },
  {
    title: "2. Alumnos",
    content:
      "En esta sección se gestionan los datos de cada alumno: nombre, contacto, DNI/NIE/pasaporte, dirección y los contratos que tiene asociados.\n\nUn alumno puede tener varios contratos (por ejemplo, si se matricula en más de un curso). Desde el listado se puede buscar por nombre o email, y abrir la ficha de un alumno para ver/editar sus datos.\n\nDesde la ficha de un alumno también puedes pulsar 'Crear otro contrato para este alumno' para empezar un contrato nuevo con ese alumno ya seleccionado.",
  },
  {
    title: "3. Contratos",
    content:
      "Aquí se crean y consultan los contratos de matrícula. Crear un contrato es un proceso de 5 pasos:\n\n1. Datos del alumno (nuevo o existente).\n2. Datos del avalista, si lo hay.\n3. Datos del contrato (fechas, forma de pago, observaciones).\n4. Datos del curso (precio, horario, fechas de inicio/fin).\n5. Confirmación y descarga del contrato en PDF.\n\n'Mis Contratos' muestra solo los contratos creados por el comercial conectado; 'Contratos' (solo admin/comercial plus) muestra los de todas las sedes.",
  },
  {
    title: "4. Cursos",
    content:
      "Catálogo de cursos que ofrece la academia. Cada curso tiene un nombre y un estado activo/inactivo.\n\nLos cursos inactivos no aparecen como opción al crear un contrato nuevo, pero los contratos ya existentes que los referencian no se ven afectados.",
  },
  {
    title: "5. Comerciales (solo Admin)",
    content:
      "Gestión de los usuarios del sistema: nombre, email, rol (Comercial, Comercial Plus o Admin), sede asignada y si está activo.\n\nEl rol determina qué puede ver y hacer cada usuario; la sede determina con qué leads/contratos/alumnos trabaja por defecto.",
  },
  {
    title: "6. CRM / Leads",
    content:
      "Aquí llegan los 'posibles clientes' (leads) que rellenan el formulario de la web pidiendo información sobre un curso, o que se dan de alta manualmente desde el botón '+ Nuevo Lead'.\n\nCada lead pasa por un pipeline de estados: Nuevo → Contactado → En seguimiento → Matriculado (o Descartado si no sigue adelante, indicando el motivo).\n\nUn Admin o Comercial Plus asigna cada lead a un comercial de la sede correspondiente desde la ficha del lead. El comercial trabaja sus leads asignados desde dos vistas:\n\n- Listado (/leads/listado): tabla con filtros por estado, sede y comercial asignado, con buscador.\n- Pipeline (/leads/pipeline): tablero tipo Kanban con una columna por estado. Se arrastran las tarjetas entre columnas para cambiar el estado.\n\nAl arrastrar un lead a 'Descartado' se pide indicar el motivo (no responde, sin presupuesto, no interesado, ya matriculado en otro centro, datos incorrectos u otro).\n\nAl arrastrar un lead a 'Matriculado' (o pulsar 'Convertir a Alumno' en su ficha) se abre un formulario para completar los datos que faltan (DNI/NIE, fecha de nacimiento, dirección, etc.) y se crea automáticamente la ficha de Alumno, enlazada al lead para no perder el histórico. Desde ahí se puede pulsar 'Crear contrato para este alumno' para continuar directamente con la matrícula.\n\nLa pestaña 'Resumen' (/crm) muestra un panel con el total de leads, los nuevos del mes, la tasa de conversión y la distribución de leads por estado.\n\nNota: los leads que llegan desde la web también se siguen recibiendo en el tablero de Monday como hasta ahora — el CRM es un sistema adicional, no sustituye ese flujo.",
  },
  {
    title: "7. Informes (Admin / Comercial Plus)",
    content:
      "Vistas agregadas de rendimiento: contratos por sede, por comercial y evolución mensual frente a los objetivos configurados.",
  },
];

export default function ManualUsuario() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div>
      <PageMeta
        title="Manual de Usuario - Esmera School"
        description="Guía de uso de la aplicación de gestión de Esmera School."
      />
      <PageBreadcrumb pageTitle="Manual de Usuario" />

      <div className="mb-5">
        <p className="text-gray-600 dark:text-gray-400">
          Esta guía explica cómo funciona cada sección de la aplicación.
          Pulsa sobre un apartado para ver su explicación.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <FaqOne
            key={section.title}
            title={section.title}
            content={section.content}
            isOpen={openIndexes.includes(index)}
            toggleAccordion={() => toggleSection(index)}
          />
        ))}
      </div>
    </div>
  );
}
