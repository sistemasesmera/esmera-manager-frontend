import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../../icons";
import Select from "../../form/Select";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";

type Props = {
  onAlumnCreated: (alumnData: any) => void;
};

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  birthDate: "",
  documentType: "",
  documentNumber: "",
  address: "",
  postalCode: "",
  population: "",
  province: "",
  phone: "",
};

const DOC_OPTIONS = [
  { value: "DNI", label: "DNI" },
  { value: "NIE", label: "NIE" },
  { value: "PASAPORTE", label: "Pasaporte" },
];

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
  </svg>
);

function CreateAlumnModal({ onAlumnCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();
  const isCommercial = user?.role === "COMMERCIAL";

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    closeModal();
  };

  const set = (field: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    (Object.keys(EMPTY) as (keyof typeof EMPTY)[]).forEach((k) => {
      if (!form[k]) errs[k] = "Obligatorio";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Correo no válido";
    if (form.phone && !/^\d{1,15}$/.test(form.phone))
      errs.phone = "Solo dígitos (máx. 15)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/alumns", form);
      onAlumnCreated(data);
      showNotification("success", "Crear Alumno", "Alumno creado correctamente");
      handleClose();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      showNotification("error", "Crear Alumno", msg ?? "Error al crear el alumno");
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
        + Nuevo alumno
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton={false}
        className="max-w-[95%] lg:max-w-[600px] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 to-cyan-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-200 mb-0.5">Nuevo</p>
              <h4 className="text-lg font-bold text-white">Crear alumno</h4>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <form id="create-alumn-form" onSubmit={handleSubmit}>
          <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <Label>Nombre</Label>
                <Input type="text" value={form.firstName} onChange={set("firstName")} placeholder="Nicolás" error={!!errors.firstName} hint={errors.firstName} />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input type="text" value={form.lastName} onChange={set("lastName")} placeholder="García" error={!!errors.lastName} hint={errors.lastName} />
              </div>
              <div>
                <Label>Correo</Label>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="nicolas@ejemplo.com" error={!!errors.email} hint={errors.email} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input type="text" value={form.phone} onChange={set("phone")} placeholder="600123456" error={!!errors.phone} hint={errors.phone} />
              </div>
              <div>
                <Label>Fecha de nacimiento</Label>
                <div className="relative">
                  <Flatpickr
                    value={form.birthDate}
                    onChange={(dates: Date[]) =>
                      setForm((prev) => ({ ...prev, birthDate: dates[0] ? dates[0].toISOString().split("T")[0] : "" }))
                    }
                    options={{ dateFormat: "Y-m-d" }}
                    placeholder="Seleccionar fecha"
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${errors.birthDate ? "border-red-500" : "border-gray-300 dark:border-gray-700 focus:border-brand-300 focus:ring-brand-500/10"}`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400 pointer-events-none">
                    <CalenderIcon className="size-5" />
                  </span>
                </div>
                {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate}</p>}
              </div>
              <div>
                <Label>Tipo de documento</Label>
                <Select
                  options={DOC_OPTIONS}
                  onChange={(v) => setForm((prev) => ({ ...prev, documentType: v }))}
                  placeholder="Seleccionar"
                  className={`border ${errors.documentType ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                />
                {errors.documentType && <p className="mt-1 text-xs text-red-500">{errors.documentType}</p>}
              </div>
              <div>
                <Label>Número de documento</Label>
                <Input type="text" value={form.documentNumber} onChange={set("documentNumber")} placeholder="Y1234567X" error={!!errors.documentNumber} hint={errors.documentNumber} />
              </div>
              <div className="sm:col-span-2">
                <Label>Dirección</Label>
                <Input type="text" value={form.address} onChange={set("address")} placeholder="Av. Reforma 100, Apt. 3B" error={!!errors.address} hint={errors.address} />
              </div>
              <div>
                <Label>Código postal</Label>
                <Input type="text" value={form.postalCode} onChange={set("postalCode")} placeholder="28045" error={!!errors.postalCode} hint={errors.postalCode} />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input type="text" value={form.population} onChange={set("population")} placeholder="Madrid" error={!!errors.population} hint={errors.population} />
              </div>
              <div>
                <Label>Provincia</Label>
                <Input type="text" value={form.province} onChange={set("province")} placeholder="Madrid" error={!!errors.province} hint={errors.province} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
            <Button size="sm" variant="outline" type="button" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button size="sm" variant="primary" type="submit" form="create-alumn-form" disabled={loading}>
              {loading ? "Guardando..." : "Crear alumno"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default CreateAlumnModal;
