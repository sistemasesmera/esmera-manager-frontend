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
import SpinnerFour from "../../ui/spinner/SpinnerFour";
import Tooltip from "../../ui/tooltip/Tooltip";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";

type Props = {
  onAlumnCreated: (alumnData: any) => void;
};

function CreateAlumnModal({ onAlumnCreated }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useSelector((state: RootState) => state.auth);

  const { showNotification } = useNotification();

  const isCommercial = user?.role === "COMMERCIAL";

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    documentType: "",
    documentNumber: "",
    address: "",
    postalCode: "",
    population: "",
    province: "",
    phone: "",
    email: "",
    birthDate: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);

  const handleCloseModal = () => {
    setFormData({
      lastName: "",
      firstName: "",
      documentType: "",
      documentNumber: "",
      address: "",
      postalCode: "",
      population: "",
      province: "",
      phone: "",
      email: "",
      birthDate: "",
    });
    setErrors({});
    closeModal();
  };

  const options = [
    { value: "DNI", label: "DNI" },
    { value: "NIE", label: "NIE" },
    { value: "PASAPORTE", label: "PASAPORTE" },
  ];

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, documentType: value });
    validateField("documentType", value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleDateChange = (selectedDates: Date[]) => {
    setFormData({
      ...formData,
      birthDate: selectedDates[0]
        ? selectedDates[0].toISOString().split("T")[0]
        : "",
    });
    if (selectedDates[0]) {
      validateField("birthDate", selectedDates[0].toISOString().split("T")[0]);
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value) {
      error = "Este campo es obligatorio";
    }
    if (
      name === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error = "Ingrese un correo válido";
    }
    if (name === "phone" && value && !/^\d{1,15}$/.test(value)) {
      error = "Ingrese un número válido (máx. 15 dígitos)";
    }
    if (
      (name === "firstName" || name === "lastName") &&
      (value.length < 1 || value.length > 100)
    ) {
      error = "Debe tener entre 1 y 100 caracteres";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof typeof formData];
      if (!value) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { data: newAlumn } = await axiosInstance.post("/alumns", formData);

      onAlumnCreated(newAlumn);
      showNotification(
        "success",
        "Crear Alumno",
        "Alumno creado correctamente"
      );
      handleCloseModal();
    } catch (error: any) {
      console.error(
        "Error al crear alumno:",
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;

      if (
        backendMessage === "Ya existe un alumno con este número de documento"
      ) {
        // Notificación específica
        showNotification("error", "Crear Alumno", backendMessage);
      } else {
        // Notificación genérica
        showNotification("error", "Crear Alumno", "Error al crear el alumno");
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
            : "Crear Alumno Nuevo"
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
            Crear Alumno
          </h4>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <SpinnerFour />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div className="col-span-1">
                <Label>Nombre</Label>
                <Input
                  type="text"
                  name="firstName"
                  placeholder="Nicolas"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  hint={errors.firstName}
                />
              </div>
              <div className="col-span-1">
                <Label>Apellidos</Label>
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Garcia"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  hint={errors.lastName}
                />
              </div>
              <div className="col-span-1">
                <Label>Correo</Label>
                <Input
                  type="text"
                  name="email"
                  placeholder="nicolas@esmeraschool.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  hint={errors.email}
                />
              </div>
              <div className="col-span-1">
                <Label>Fecha de Nacimiento</Label>
                <div className="relative w-full">
                  <Flatpickr
                    value={formData.birthDate}
                    onChange={handleDateChange}
                    options={{ dateFormat: "Y-m-d" }}
                    placeholder="Seleccionar fecha"
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 
                      ${
                        errors.birthDate
                          ? "border-red-500 focus:border-red-500"
                          : "focus:border-brand-300 focus:ring-brand-500/20"
                      } 
                      dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400">
                    <CalenderIcon className="size-6" />
                  </span>
                </div>
                {errors.birthDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.birthDate}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <Label>Tipo de Documento</Label>
                <Select
                  options={options}
                  onChange={handleSelectChange}
                  placeholder="Seleccionar tipo de documento"
                  className={`dark:bg-dark-900 border ${
                    errors.documentType
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                  }`}
                />
                {errors.documentType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.documentType}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <Label>Numero de Documento</Label>
                <Input
                  type="text"
                  name="documentNumber"
                  placeholder="Y12356..."
                  value={formData.documentNumber}
                  onChange={handleChange}
                  error={!!errors.documentNumber}
                  hint={errors.documentNumber}
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Dirección</Label>
                <Input
                  type="text"
                  name="address"
                  placeholder="Av. Reforma 100, Apt. 3B"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  hint={errors.address}
                />
              </div>
              <div className="col-span-1">
                <Label>Código Postal</Label>
                <Input
                  type="text"
                  name="postalCode"
                  placeholder="28045"
                  value={formData.postalCode}
                  onChange={handleChange}
                  error={!!errors.postalCode}
                  hint={errors.postalCode}
                />
              </div>
              <div className="col-span-1">
                <Label>Ciudad</Label>
                <Input
                  type="text"
                  name="population"
                  placeholder="Madrid"
                  value={formData.population}
                  onChange={handleChange}
                  error={!!errors.population}
                  hint={errors.population}
                />
              </div>
              <div className="col-span-1">
                <Label>Provincia</Label>
                <Input
                  type="text"
                  name="province"
                  placeholder="Madrid"
                  value={formData.province}
                  onChange={handleChange}
                  error={!!errors.province}
                  hint={errors.province}
                />
              </div>
              <div className="col-span-1">
                <Label>Teléfono</Label>
                <Input
                  type="text"
                  name="phone"
                  placeholder="123456789"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  hint={errors.phone}
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

export default CreateAlumnModal;
