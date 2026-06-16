import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import TextArea from "../../form/input/TextArea";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Lead, { LeadCourseCategory } from "../../../types/frontend/lead";

type Props = {
  onLeadCreated: (lead: Lead) => void;
};

const CATEGORY_OPTIONS = Object.values(LeadCourseCategory).map((v) => ({ value: v, label: v }));

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
  </svg>
);

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  nameCourse: "",
  categoryCourse: "",
  branchId: "",
  assignedToId: "",
  notes: "",
};

export default function CreateLeadModal({ onLeadCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();
  const isCommercial = user?.role === "COMMERCIAL";

  const [form, setForm] = useState(EMPTY);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [commercials, setCommercials] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || isCommercial) return;
    Promise.all([
      axiosInstance.get("/branchs"),
      axiosInstance.get("/users/commercials-select"),
    ]).then(([branchRes, comRes]) => {
      setBranches(branchRes.data);
      setCommercials(comRes.data);
    }).catch(() => {});
  }, [isOpen, isCommercial]);

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    closeModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (!form.phone.trim()) errs.phone = "El teléfono es obligatorio";
    else if (!/^\d{1,15}$/.test(form.phone)) errs.phone = "Solo dígitos (máx. 15)";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Correo no válido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const payload: Record<string, unknown> = {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        nameCourse: form.nameCourse || undefined,
        categoryCourse: form.categoryCourse || undefined,
        notes: form.notes || undefined,
      };
      if (!isCommercial) {
        payload.branchId = form.branchId || undefined;
        payload.assignedToId = form.assignedToId || undefined;
      }
      const { data } = await axiosInstance.post("/leads/manual", payload);
      onLeadCreated(data);
      showNotification("success", "Crear lead", "Lead creado correctamente");
      handleClose();
    } catch (error: any) {
      showNotification("error", "Crear lead", error.response?.data?.message ?? "Error al crear el lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="primary" onClick={openModal}>
        + Nuevo lead
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton={false}
        className="max-w-[95%] lg:max-w-[580px] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-200 mb-0.5">Nuevo</p>
              <h4 className="text-lg font-bold text-white">Crear lead</h4>
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
        <form id="create-lead-form" onSubmit={handleSubmit}>
          <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nombre completo <span className="text-red-500">*</span></Label>
                <Input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nombre completo" error={!!errors.name} hint={errors.name} />
              </div>
              <div>
                <Label>Teléfono <span className="text-red-500">*</span></Label>
                <Input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="600123456" error={!!errors.phone} hint={errors.phone} />
              </div>
              <div>
                <Label>Correo</Label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" error={!!errors.email} hint={errors.email} />
              </div>
              <div>
                <Label>Curso de interés</Label>
                <Input type="text" name="nameCourse" value={form.nameCourse} onChange={handleChange} placeholder="Ej. Maquillaje profesional" />
              </div>
              <div>
                <Label>Categoría del curso</Label>
                <Select
                  options={CATEGORY_OPTIONS}
                  onChange={(v) => setForm((prev) => ({ ...prev, categoryCourse: v }))}
                  placeholder="Selecciona una categoría"
                  className="border border-gray-300 dark:border-gray-700"
                />
              </div>

              {!isCommercial && (
                <>
                  <div>
                    <Label>Sede</Label>
                    <Select
                      options={branches.map((b) => ({ value: b.id, label: b.name }))}
                      onChange={(v) => setForm((prev) => ({ ...prev, branchId: v }))}
                      placeholder="Selecciona una sede"
                      className="border border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Asignar a</Label>
                    <Select
                      options={commercials.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                      onChange={(v) => setForm((prev) => ({ ...prev, assignedToId: v }))}
                      placeholder="Sin asignar"
                      className="border border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <Label>Notas</Label>
                <TextArea
                  value={form.notes}
                  onChange={(v) => setForm((prev) => ({ ...prev, notes: v }))}
                  placeholder="Observaciones sobre el lead..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
            <Button size="sm" variant="outline" type="button" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button size="sm" variant="primary" type="submit" form="create-lead-form" disabled={loading}>
              {loading ? "Guardando..." : "Crear lead"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
