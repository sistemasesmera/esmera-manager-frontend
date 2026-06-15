import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import SpinnerFour from "../../ui/spinner/SpinnerFour";
import TextArea from "../../form/input/TextArea";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Lead, { LeadCourseCategory } from "../../../types/frontend/lead";

type Props = {
  onLeadCreated: (lead: Lead) => void;
};

const categoryOptions = Object.values(LeadCourseCategory).map((value) => ({
  value,
  label: value,
}));

export default function CreateLeadModal({ onLeadCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showNotification } = useNotification();

  const isCommercial = user?.role === "COMMERCIAL";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    nameCourse: "",
    categoryCourse: "",
    branchId: "",
    assignedToId: "",
    notes: "",
  });

  const [branches, setBranches] = useState<{ id: string; name: string }[]>(
    []
  );
  const [commercials, setCommercials] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || isCommercial) return;

    const fetchOptions = async () => {
      try {
        const [branchesRes, commercialsRes] = await Promise.all([
          axiosInstance.get("/branchs"),
          axiosInstance.get("/users/commercials-select"),
        ]);
        setBranches(branchesRes.data);
        setCommercials(commercialsRes.data);
      } catch (err) {
        console.error("Error al cargar sedes/comerciales:", err);
      }
    };

    fetchOptions();
  }, [isOpen, isCommercial]);

  const handleCloseModal = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      nameCourse: "",
      categoryCourse: "",
      branchId: "",
      assignedToId: "",
      notes: "",
    });
    setErrors({});
    closeModal();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^\d{1,15}$/.test(formData.phone)) {
      newErrors.phone = "Ingrese un número válido (máx. 15 dígitos)";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingrese un correo válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload: Record<string, unknown> = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        nameCourse: formData.nameCourse || undefined,
        categoryCourse: formData.categoryCourse || undefined,
        notes: formData.notes || undefined,
      };

      if (!isCommercial) {
        payload.branchId = formData.branchId || undefined;
        payload.assignedToId = formData.assignedToId || undefined;
      }

      const { data: newLead } = await axiosInstance.post(
        "/leads/manual",
        payload
      );

      onLeadCreated(newLead);
      showNotification("success", "Crear Lead", "Lead creado correctamente");
      handleCloseModal();
    } catch (error: any) {
      console.error(
        "Error al crear lead:",
        error.response?.data || error.message
      );
      showNotification(
        "error",
        "Crear Lead",
        error.response?.data?.message || "Error al crear el lead"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button size="sm" variant="primary" onClick={openModal}>
        + Nuevo Lead
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <form onSubmit={handleSubmit}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Crear Lead
          </h4>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <SpinnerFour />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2">
                <Label>Nombre</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>
              <div className="col-span-1">
                <Label>Teléfono</Label>
                <Input
                  type="text"
                  name="phone"
                  placeholder="600123456"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  hint={errors.phone}
                />
              </div>
              <div className="col-span-1">
                <Label>Correo</Label>
                <Input
                  type="text"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  hint={errors.email}
                />
              </div>
              <div className="col-span-1">
                <Label>Curso de interés</Label>
                <Input
                  type="text"
                  name="nameCourse"
                  placeholder="Ej. Maquillaje profesional"
                  value={formData.nameCourse}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <Label>Categoría del curso</Label>
                <Select
                  options={categoryOptions}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryCourse: value }))
                  }
                  placeholder="Selecciona una categoría"
                  className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                />
              </div>

              {!isCommercial && (
                <>
                  <div className="col-span-1">
                    <Label>Sede</Label>
                    <Select
                      options={branches.map((b) => ({
                        value: b.id,
                        label: b.name,
                      }))}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, branchId: value }))
                      }
                      placeholder="Selecciona una sede"
                      className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Asignar a</Label>
                    <Select
                      options={commercials.map((c) => ({
                        value: c.id,
                        label: `${c.firstName} ${c.lastName}`,
                      }))}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          assignedToId: value,
                        }))
                      }
                      placeholder="Sin asignar"
                      className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                    />
                  </div>
                </>
              )}

              <div className="col-span-1 sm:col-span-2">
                <Label>Notas</Label>
                <TextArea
                  value={formData.notes}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, notes: value }))
                  }
                  placeholder="Observaciones sobre el lead..."
                  rows={3}
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
