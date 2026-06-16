import { useState } from "react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useNotification } from "../../../context/NotificationContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import axiosInstance from "../../../axios/axiosConfig";
import Course from "../../../types/backend/backendCourse";

interface Props {
  course: Course;
  onUpdate: (updatedCourse: Course) => void;
}

type Tab = "info" | "edit";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value || <span className="text-gray-300 dark:text-gray-600 italic font-normal">—</span>}
    </p>
  </div>
);

export default function InformationCourseModal({ course, onUpdate }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const [tab, setTab] = useState<Tab>("info");
  const [name, setName] = useState(course.name);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);
  const isReadOnly = user?.role === "COMMERCIAL";

  const openWithReset = () => {
    setTab("info");
    setName(course.name);
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === course.name) { closeModal(); return; }
    try {
      setSaving(true);
      const { data } = await axiosInstance.put(`/courses/${course.id}`, { name });
      showNotification("success", "Editar Curso", "Curso actualizado correctamente");
      onUpdate(data);
      closeModal();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      showNotification("error", "Editar Curso", msg ?? "Error al editar el curso");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={openWithReset}>
        Ver / Editar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-[95%] lg:max-w-[540px] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-5 lg:px-8 lg:py-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 text-white text-lg font-bold shrink-0">
                {course.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-0.5">
                  Curso
                </p>
                <h4 className="text-lg font-bold text-white leading-tight truncate">
                  {course.name}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Badge estado */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              course.isActive
                ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30"
                : "bg-red-500/20 text-red-200 border-red-400/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${course.isActive ? "bg-emerald-300" : "bg-red-400"}`} />
            {course.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900 px-6 lg:px-8">
          {(["info", "edit"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors duration-150 ${
                tab === t
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {t === "info" ? "Información" : "Editar"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6 lg:px-8">
          {tab === "info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <InfoRow label="Nombre del curso" value={course.name} />
              </div>
              <InfoRow label="Fecha de creación" value={fmtDate(course.createdAt)} />
              <InfoRow label="Última actualización" value={fmtDate(course.updatedAt)} />
            </div>
          )}

          {tab === "edit" && (
            <form id="course-edit-form" onSubmit={handleSave}>
              <Label>Nombre del curso</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Máster en Barbería"
                disabled={isReadOnly}
              />
              {isReadOnly && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  No tienes permisos para editar cursos.
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
          {tab === "info" ? (
            <>
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cerrar
              </Button>
              {!isReadOnly && (
                <Button size="sm" variant="primary" onClick={() => setTab("edit")}>
                  Editar curso
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" type="button" onClick={() => setTab("info")}>
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="primary"
                type="submit"
                form="course-edit-form"
                disabled={saving || isReadOnly}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
