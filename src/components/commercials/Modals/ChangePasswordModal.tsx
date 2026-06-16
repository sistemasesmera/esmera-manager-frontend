import { useState } from "react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axiosInstance from "../../../axios/axiosConfig";
import { Commercial } from "../../../pages/Commercials/Commercials";
import { useNotification } from "../../../context/NotificationContext";

interface Props {
  commercial: Commercial;
  onUpdate: (updated: any) => void;
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
  </svg>
);

export default function ChangePasswordModal({ commercial, onUpdate }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const openWithReset = () => {
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    openModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!password) errs.password = "Obligatorio";
    if (!confirmPassword) errs.confirmPassword = "Obligatorio";
    if (password && confirmPassword && password !== confirmPassword) {
      errs.password = "No coinciden";
      errs.confirmPassword = "No coinciden";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      const { data } = await axiosInstance.patch(`/users/commercials/${commercial.id}/password`, { newPassword: password });
      onUpdate(data);
      showNotification("success", "Cambio de contraseña", "Contraseña actualizada correctamente");
      closeModal();
    } catch (error: any) {
      showNotification("error", "Cambio de contraseña", error.response?.data?.message ?? "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger: key icon button */}
      <button
        type="button"
        onClick={openWithReset}
        title="Cambiar contraseña"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} showCloseButton={false} className="max-w-[95%] lg:max-w-[440px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 text-white shrink-0">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-rose-200 mb-0.5">Seguridad</p>
                <h4 className="text-base font-bold text-white leading-tight">
                  Cambiar contraseña
                </h4>
                <p className="text-xs text-rose-200 mt-0.5">{commercial.firstName} {commercial.lastName}</p>
              </div>
            </div>
            <button type="button" onClick={closeModal} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="change-password-form" onSubmit={handleSave}>
          <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6 space-y-4">
            <div>
              <Label>Nueva contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={!!errors.password} hint={errors.password} />
            </div>
            <div>
              <Label>Confirmar contraseña</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" error={!!errors.confirmPassword} hint={errors.confirmPassword} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
            <Button size="sm" variant="outline" type="button" onClick={closeModal} disabled={loading}>Cancelar</Button>
            <Button size="sm" variant="primary" type="submit" form="change-password-form" disabled={loading}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
