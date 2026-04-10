import { Modal } from "../../ui/modal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Button from "../../ui/button/Button";
import { useModal } from "../../../hooks/useModal";
import { useNotification } from "../../../context/NotificationContext";
import { useState } from "react";
import axiosInstance from "../../../axios/axiosConfig";

function ChangePasswordModal() {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es obligatoria";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es obligatoria";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma la nueva contraseña";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await axiosInstance.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      showNotification(
        "success",
        "Cambiar contraseña",
        "Tu contraseña ha sido cambiada correctamente"
      );

      closeModal();
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);

      showNotification(
        "error",
        "Cambiar contraseña",
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
        onClick={openModal}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500 bg-red-50 px-5 py-2 text-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-100 dark:border-red-400 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/30 transition-colors"
      >
        Cambiar Contraseña
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <form
          onSubmit={handleSave}
          className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8"
        >
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Cambiar contraseña
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Ingresa tu contraseña actual y define una nueva.
          </p>

          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <Label>Contraseña actual</Label>
              <Input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={!!errors.currentPassword}
                hint={errors.currentPassword}
              />
            </div>
            <div>
              <Label>Nueva contraseña</Label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={!!errors.newPassword}
                hint={errors.newPassword}
              />
            </div>
            <div>
              <Label>Confirmar nueva contraseña</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                hint={errors.confirmPassword}
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
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default ChangePasswordModal;
