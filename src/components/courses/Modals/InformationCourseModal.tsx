import { useState } from "react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useNotification } from "../../../context/NotificationContext";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import axiosInstance from "../../../axios/axiosConfig";
import Course from "../../../types/backend/backendCourse";

interface InformationCoursesModal {
  course: Course;
  onUpdate: (updatedCourse: Course) => void;
}

export default function InformationCourseModal({
  course,
  onUpdate,
}: InformationCoursesModal) {
  const { isOpen, openModal, closeModal } = useModal();
  const [changes, setChanges] = useState<Partial<Course>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const { showNotification } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);

  const isReadOnly = user?.role === "COMMERCIAL";

  const openModalWithReset = () => {
    setChanges({});
    openModal();
  };

  const handleChange = (field: keyof Course, value: any) => {
    setChanges((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!changes.name) {
      closeModal();
      return;
    }

    try {
      setSaving(true);

      const { data } = await axiosInstance.put(`/courses/${course.id}`, {
        name: changes.name,
      });

      showNotification("success", "Editar Curso", "Curso editado exitosamente");

      onUpdate(data);

      closeModal();
    } catch (error: any) {
      console.error(
        "Error al actualizar el curso:",
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;

      if (backendMessage) {
        showNotification("error", "Editar Curso", backendMessage);
      } else {
        showNotification("error", "Editar Curso", "Error al editar el curso");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button
        size="sm"
        onClick={openModalWithReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
             bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
             hover:bg-gray-100 dark:hover:bg-gray-700 
             transition-colors duration-200 shadow-sm"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"></path>
        </svg>
        <span className="font-medium text-gray-600 dark:text-gray-300">
          Editar
        </span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[95%] lg:max-w-[700px] p-5 lg:p-8 overflow-auto"
      >
        <form onSubmit={handleSave}>
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Editar Curso
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-x-4 gap-y-2 text-sm">
            <div>
              <Label>Nombre</Label>
              <Input
                type="text"
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ej. Peluqueria Internacional"
                disabled={isReadOnly}
                value={changes.name ?? course.name}
              />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={closeModal}
              disabled={isReadOnly || saving}
            >
              Cancelar
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={saving}>
              {saving ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                    ></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
