import { Modal } from "../../ui/modal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Button from "../../ui/button/Button";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/NotificationContext";
import { useEffect, useState } from "react";
import { BackendUser } from "../../../types/backend/backendUser";
import { updateUser } from "../../../store/authSlice";
import { useDispatch } from "react-redux";

interface EditProfileModalProps {
  user: BackendUser | null;
}

function EditProfileModal({ user }: EditProfileModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const dispatch = useDispatch<any>();

  // Solo guardamos en el form lo que vamos a enviar al backend
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.name || "",
        lastName: user.lastname || "",
        email: user.email || "",
      });
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      await dispatch(
        updateUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        })
      ).unwrap(); // unwrap para manejar errores como try/catch

      showNotification(
        "success",
        "Perfil actualizado",
        "Tus datos fueron guardados correctamente"
      );

      closeModal();
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error);

      showNotification(
        "error",
        "Error al actualizar",
        error.response?.data?.message ||
          error.message ||
          "Ocurrió un error al guardar los cambios"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal} // Aquí tu función para editar perfil
        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 transition-colors"
      >
        Editar
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <form
          onSubmit={handleSave}
          className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        >
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Editar Información personal
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Actualiza tus datos para mantener tu perfil al día.
          </p>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default EditProfileModal;
