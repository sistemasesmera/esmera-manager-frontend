import { useState, useEffect } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import SpinnerFour from "../../ui/spinner/SpinnerFour";
import Tooltip from "../../ui/tooltip/Tooltip";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Select from "../../form/Select";

type Props = {
  onCommercialCreated: (commercialData: any) => void;
};

function CreateCommercialModal({ onCommercialCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "COMMERCIAL",
    branchId: "",
    username: "",
  });

  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // 🔹 Cargar sedes al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await axiosInstance.get("/branchs");
        setBranches(response.data);
      } catch (err) {
        console.error("Error al cargar sedes:", err);
        showNotification("error", "Sedes", "No se pudieron cargar las sedes");
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [isOpen, showNotification]);

  const handleCloseModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "COMMERCIAL",
      branchId: "",
      username: "",
    });
    setErrors({});
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validación de campos obligatorios
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "El nombre es obligatorio";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es obligatoria";
    if (!formData.username.trim())
      newErrors.password = "La nombre de usuario es obligatoria";
    if (!formData.confirmPassword?.trim())
      newErrors.confirmPassword =
        "La confirmación de contraseña es obligatoria";
    if (!formData.role) newErrors.role = "El rol es obligatorio";
    if (!formData.branchId) newErrors.branchId = "La sede es obligatoria";

    // Si hay errores, no continuar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validación de contraseña
    if (formData.password !== formData.confirmPassword) {
      setErrors({
        password: "Las contraseñas no coinciden",
        confirmPassword: "Las contraseñas no coinciden",
      });
      return;
    }

    const { confirmPassword, ...payload } = formData;

    try {
      setLoading(true);

      const { data: newCommercial } = await axiosInstance.post(
        "/users/commercials",
        payload
      );

      showNotification(
        "success",
        "Crear Comercial",
        "Comercial creado correctamente"
      );

      onCommercialCreated(newCommercial);
      handleCloseModal();
    } catch (error: any) {
      console.error(
        "Error al crear comercial:",
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;

      showNotification(
        "error",
        "Crear Comercial",
        backendMessage || "Error al crear el comercial"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Botón abrir modal */}
      <Tooltip content="Crear Comercial Nuevo" position="left">
        <button
          onClick={openModal}
          className={`
            flex items-center justify-center gap-2 p-2 rounded-full
            text-sm font-medium text-white transition-colors shadow-md
            bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
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
            Crear Comercial
          </h4>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <SpinnerFour />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <Label>Nombre</Label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Nicolas"
                  error={!!errors.firstName}
                  hint={errors.firstName}
                />
              </div>

              <div>
                <Label>Apellido</Label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Garcia"
                  error={!!errors.lastName}
                  hint={errors.lastName}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="ejemplo@correo.com"
                  error={!!errors.email}
                  hint={errors.email}
                />
              </div>

              <div>
              <Label>Nombre de usuario</Label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="nicolasgarcia"
                  error={!!errors.username}
                  hint={errors.username}
                />
              </div>

              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="********"
                  error={!!errors.password}
                  hint={errors.password}
                />
              </div>

              <div>
                <Label>Confirmar Contraseña</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="********"
                  error={!!errors.confirmPassword}
                  hint={errors.confirmPassword}
                />
              </div>

              <div>
                <Label>Rol</Label>
                <Select
                  options={[
                    { value: "COMMERCIAL", label: "Comercial" },
                    { value: "COMMERCIAL_PLUS", label: "Comercial Plus" },
                  ]}
                  defaultValue={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e })}
                  className="dark:bg-dark-900 border"
                />
              </div>

              <div>
                <Label>Sede</Label>
                <Select
                  options={branches.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                  defaultValue={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e })}
                  placeholder={
                    loadingBranches
                      ? "Cargando sedes..."
                      : "Selecciona una sede"
                  }
                  className={`dark:bg-dark-900 border ${
                    errors.branchId
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                  }`}
                />
                {errors.branchId && (
                  <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>
                )}
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

export default CreateCommercialModal;
