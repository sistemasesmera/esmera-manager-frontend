import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";

type Props = {
  onCourseCreated: (courseData: any) => void;
};

export default function CreateCourseModal({ onCourseCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();
  const isCommercial = user?.role === "COMMERCIAL";

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setName("");
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/courses", { name });
      showNotification("success", "Crear Curso", "Curso creado correctamente");
      onCourseCreated(data);
      handleClose();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      showNotification("error", "Crear Curso", msg ?? "Error al crear el curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="primary"
        onClick={openModal}
        disabled={isCommercial}
        title={isCommercial ? "Sin permisos" : undefined}
      >
        + Nuevo curso
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton={false}
        className="max-w-[95%] lg:max-w-[440px] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-0.5">
                Nuevo
              </p>
              <h4 className="text-lg font-bold text-white">Crear curso</h4>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="create-course-form" onSubmit={handleSubmit}>
          <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6">
            <Label>Nombre del curso</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Máster en Barbería"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
            <Button size="sm" variant="outline" type="button" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" type="submit" form="create-course-form" disabled={loading}>
              {loading ? "Guardando..." : "Crear curso"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
