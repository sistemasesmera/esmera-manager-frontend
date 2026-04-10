import { useState } from "react";
import { Modal } from "../../../ui/modal";
import Button from "../../../ui/button/Button";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../../../icons";
import Select from "../../../form/Select";
import SpinnerFour from "../../../ui/spinner/SpinnerFour";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  onCreateAlumn: (alumnData: any) => void;
  loading: boolean;
};

function CreateAlumnModal({
  isOpen,
  closeModal,
  onCreateAlumn,
  loading,
}: Props) {
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

    validateField("documentType", value); // Validar selección en tiempo real
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    validateField(name, value); // Validar este campo en tiempo real
  };

  const handleDateChange = (selectedDates: Date[]) => {
    if (!selectedDates[0]) {
      setFormData({ ...formData, birthDate: "" });
      validateField("birthDate", "");
      return;
    }

    const d = selectedDates[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // meses van de 0-11
    const day = String(d.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`; // YYYY-MM-DD en hora local (Madrid)

    setFormData({
      ...formData,
      birthDate: localDate,
    });

    validateField("birthDate", localDate);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    // Validar campo obligatorio
    if (!value) {
      error = "Este campo es obligatorio";
    }

    // Validar email
    if (
      name === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error = "Ingrese un correo válido";
    }

    // Validar teléfono (solo números y longitud entre 1 y 15)
    if (name === "phone" && value && !/^\d{1,15}$/.test(value)) {
      error = "Ingrese un número válido (máx. 15 dígitos)";
    }

    // Validar nombre y apellido (1 a 100 caracteres)
    if (
      (name === "firstName" || name === "lastName") &&
      (value.length < 1 || value.length > 100)
    ) {
      error = "Debe tener entre 1 y 100 caracteres";
    }

    // Actualizar el estado de errores
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCreateAlumn({
        ...formData,
        id: "", // O un valor temporal
        isVerified: false, // O el valor que tenga por defecto
        code: "", // Si es opcional, puedes omitirlo
        createdAt: new Date().toISOString(), // O dejarlo vacío
        updatedAt: new Date().toISOString(),
      });

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
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof typeof formData];

      // Todos los campos son obligatorios
      if (!value) {
        newErrors[key] = "Este campo es obligatorio";
        return;
      }

      // Validar email
      if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[key] = "Ingrese un correo válido";
      }

      // Validar teléfono (solo números y longitud entre 1 y 15)
      if (key === "phone" && !/^\d{1,15}$/.test(value)) {
        newErrors[key] = "Ingrese un número válido (máx. 15 dígitos)";
      }

      // Validar nombre y apellido (1 a 100 caracteres)
      if (
        (key === "firstName" || key === "lastName") &&
        (value.length < 1 || value.length > 100)
      ) {
        newErrors[key] = "Debe tener entre 1 y 100 caracteres";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
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
                hint={errors.firstName ? errors.firstName : ""}
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
                hint={errors.lastName ? errors.lastName : ""}
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
                hint={errors.email ? errors.email : ""}
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
                  className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 
        ${
          errors.birthDate
            ? "border-red-500 focus:border-red-500"
            : "focus:border-brand-300 focus:ring-brand-500/20"
        } 
        dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
              {errors.birthDate && (
                <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
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
                hint={errors.documentNumber ? errors.documentNumber : ""}
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
                hint={errors.address ? errors.address : ""}
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
                hint={errors.postalCode ? errors.postalCode : ""}
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
                hint={errors.population ? errors.population : ""}
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
                hint={errors.province ? errors.province : ""}
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
                hint={errors.phone ? errors.phone : ""}
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
            {loading ? "Cargando..." : "Crear y seleccionar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateAlumnModal;
