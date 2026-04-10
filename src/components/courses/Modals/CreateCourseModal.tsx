import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import SpinnerFour from "../../ui/spinner/SpinnerFour";
import Tooltip from "../../ui/tooltip/Tooltip";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";

type Props = {
  onCourseCreated: (courseData: any) => void;
};

function CreateCourseModal({ onCourseCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);

  const { showNotification } = useNotification();

  const isCommercial = user?.role === "COMMERCIAL";

  const [formData, setFormData] = useState({
    name: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    setFormData({ name: "" });
    setErrors({});
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data: newCourse } = await axiosInstance.post(
        "/courses",
        formData
      );

      // Notificación de éxito
      showNotification("success", "Crear Curso", "Curso creado correctamente");

      // Avisar al padre para actualizar lista
      onCourseCreated(newCourse);

      handleCloseModal();
    } catch (error: any) {
      console.error(
        "Error al crear curso:",
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;

      if (backendMessage === "Ya existe un curso con este nombre") {
        // Notificación específica
        showNotification("error", "Crear Curso", backendMessage);
      } else {
        // Notificación genérica
        showNotification("error", "Crear Curso", "Error al crear el curso");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Botón de abrir modal con tooltip */}
      <Tooltip
        content={
          isCommercial
            ? "No tienes permisos para hacer esta acción"
            : "Crear Curso Nuevo"
        }
        position="left"
      >
        <button
          disabled={isCommercial}
          onClick={openModal}
          className={`
            flex items-center justify-center gap-2 p-2 rounded-full
            text-sm font-medium text-white transition-colors shadow-md
            ${
              isCommercial
                ? "bg-gray-400 cursor-not-allowed opacity-80"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            }
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </Tooltip>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <form onSubmit={handleSubmit}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Crear Curso
          </h4>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <SpinnerFour />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-1">
              <div className="col-span-1">
                <Label>Nombre</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="MASTER EN BARBERIA"
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cerrar
            </Button>
            <Button size="sm" variant="primary" disabled={loading}>
              {loading ? "Cargando..." : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CreateCourseModal;
