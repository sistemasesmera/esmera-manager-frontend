import { useState } from "react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axiosInstance from "../../../axios/axiosConfig";
import { Commercial } from "../../../pages/Commercials/Commercials";
import { useNotification } from "../../../context/NotificationContext";
import Tooltip from "../../ui/tooltip/Tooltip";

interface ChangePasswordModalProps {
  commercial: Commercial;
  onUpdate: (updatedCommercial: any) => void;
}

export default function ChangePasswordModal({
  commercial,
  onUpdate,
}: ChangePasswordModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const openModalWithReset = () => {
    setPasswordData({ password: "", confirmPassword: "" });
    setErrors({});
    openModal();
  };

  const handleChange = (
    field: "password" | "confirmPassword",
    value: string
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validaciones
    if (!passwordData.password || !passwordData.confirmPassword) {
      setErrors({
        password: !passwordData.password ? "Requerido" : "",
        confirmPassword: !passwordData.confirmPassword ? "Requerido" : "",
      });
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setErrors({
        password: "Las contraseñas no coinciden",
        confirmPassword: "Las contraseñas no coinciden",
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await axiosInstance.patch(
        `/users/commercials/${commercial.id}/password`,
        { newPassword: passwordData.password }
      );

      // Llamamos al callback para actualizar datos si es necesario
      onUpdate(data);

      showNotification(
        "success",
        "Cambio de Contraseña",
        "Contraseña actualizada correctamente"
      );

      closeModal();
    } catch (error: any) {
      console.error(
        "Error al actualizar contraseña:",
        error.response?.data || error.message
      );

      showNotification(
        "error",
        "Cambio de Contraseña",
        error.response?.data?.message || "Error al actualizar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Tooltip content="Cambiar Contraseña" position="top">
        <div
          onClick={openModalWithReset}
          className="flex items-center gap-2 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[500px] p-5 lg:p-8"
      >
        <form onSubmit={handleSave}>
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Cambiar Contraseña a {commercial.firstName} {commercial.lastName}
          </h4>

          <div className="grid grid-cols-1 gap-y-4">
            <div>
              <Label>Nueva Contraseña</Label>
              <Input
                type="password"
                value={passwordData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="********"
                error={!!errors.password}
                hint={errors.password}
              />
            </div>

            <div>
              <Label>Confirmar Contraseña</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                placeholder="********"
                error={!!errors.confirmPassword}
                hint={errors.confirmPassword}
              />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-2 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={closeModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
