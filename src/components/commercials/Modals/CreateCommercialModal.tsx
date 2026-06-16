import { useState, useEffect } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Select from "../../form/Select";

type Props = {
  onCommercialCreated: (commercialData: any) => void;
};

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "COMMERCIAL",
  branchId: "",
};

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
  </svg>
);

export default function CreateCommercialModal({ onCommercialCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [form, setForm] = useState(EMPTY);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingBranches(true);
    axiosInstance.get("/branchs")
      .then(({ data }) => setBranches(data))
      .catch(() => showNotification("error", "Sedes", "No se pudieron cargar las sedes"))
      .finally(() => setLoadingBranches(false));
  }, [isOpen, showNotification]);

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    closeModal();
  };

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Obligatorio";
    if (!form.lastName.trim()) errs.lastName = "Obligatorio";
    if (!form.email.trim()) errs.email = "Obligatorio";
    if (!form.username.trim()) errs.username = "Obligatorio";
    if (!form.password.trim()) errs.password = "Obligatorio";
    if (!form.confirmPassword.trim()) errs.confirmPassword = "Obligatorio";
    if (!form.branchId) errs.branchId = "Selecciona una sede";
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      errs.password = "No coinciden";
      errs.confirmPassword = "No coinciden";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const { confirmPassword, ...payload } = form;
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/users/commercials", payload);
      showNotification("success", "Crear Comercial", "Comercial creado correctamente");
      onCommercialCreated(data);
      handleClose();
    } catch (error: any) {
      showNotification("error", "Crear Comercial", error.response?.data?.message ?? "Error al crear el comercial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="primary" onClick={openModal}>
        + Nuevo comercial
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={false} className="max-w-[95%] lg:max-w-[560px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-0.5">Nuevo</p>
              <h4 className="text-lg font-bold text-white">Crear comercial</h4>
            </div>
            <button type="button" onClick={handleClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="create-commercial-form" onSubmit={handleSubmit}>
          <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <Label>Nombre</Label>
                <Input type="text" value={form.firstName} onChange={set("firstName")} placeholder="Ej. Nicolás" error={!!errors.firstName} hint={errors.firstName} />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Ej. García" error={!!errors.lastName} hint={errors.lastName} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="ejemplo@correo.com" error={!!errors.email} hint={errors.email} />
              </div>
              <div>
                <Label>Nombre de usuario</Label>
                <Input type="text" value={form.username} onChange={set("username")} placeholder="nicolasgarcia" error={!!errors.username} hint={errors.username} />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" error={!!errors.password} hint={errors.password} />
              </div>
              <div>
                <Label>Confirmar contraseña</Label>
                <Input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" error={!!errors.confirmPassword} hint={errors.confirmPassword} />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  options={[
                    { value: "COMMERCIAL", label: "Comercial" },
                    { value: "COMMERCIAL_PLUS", label: "Comercial Plus" },
                  ]}
                  defaultValue={form.role}
                  onChange={(v) => setForm((prev) => ({ ...prev, role: v }))}
                  className="border border-gray-300 dark:border-gray-700"
                />
              </div>
              <div>
                <Label>Sede</Label>
                <Select
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                  defaultValue={form.branchId}
                  onChange={(v) => setForm((prev) => ({ ...prev, branchId: v }))}
                  placeholder={loadingBranches ? "Cargando..." : "Selecciona una sede"}
                  className={`border ${errors.branchId ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                />
                {errors.branchId && <p className="mt-1 text-xs text-red-500">{errors.branchId}</p>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
            <Button size="sm" variant="outline" type="button" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button size="sm" variant="primary" type="submit" form="create-commercial-form" disabled={loading}>
              {loading ? "Guardando..." : "Crear comercial"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
