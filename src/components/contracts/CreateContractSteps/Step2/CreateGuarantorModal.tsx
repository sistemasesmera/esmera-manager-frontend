import { useState } from "react";
import Button from "../../../ui/button/Button";
import { Modal } from "../../../ui/modal";
import Label from "../../../form/Label";
import Input from "../../../form/input/InputField";
import Select from "../../../form/Select";
import { CalenderIcon } from "../../../../icons";
import Flatpickr from "react-flatpickr";
import Guarantor from "../../../../types/frontend/guarantor";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  onSave: (guarantorData: Guarantor) => void;
};

function CreateGuarantorModal({ isOpen, closeModal, onSave }: Props) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [guarantor, setGuarantor] = useState<Guarantor>({
    guarantorAddress: "",
    guarantorBirthDate: "",
    guarantorDocumentNumber: "",
    guarantorDocumentType: "",
    guarantorEmail: "",
    guarantorFirstName: "",
    guarantorLastName: "",
    guarantorPhone: "",
    guarantorPopulation: "",
    guarantorPostalCode: "",
    guarantorProvince: "",
  });

  const handleCloseModal = () => {
    setGuarantor({
      guarantorAddress: "",
      guarantorBirthDate: "",
      guarantorDocumentNumber: "",
      guarantorDocumentType: "",
      guarantorEmail: "",
      guarantorFirstName: "",
      guarantorLastName: "",
      guarantorPhone: "",
      guarantorPopulation: "",
      guarantorPostalCode: "",
      guarantorProvince: "",
    });
    setErrors({});

    closeModal();
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGuarantor((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value); // Validar este campo en tiempo real
  };

  const handleSelectChange = (value: string) => {
    setGuarantor({ ...guarantor, guarantorDocumentType: value });
  };

  const handleDateChange = (selectedDates: Date[]) => {
    if (!selectedDates[0]) {
      setGuarantor({
        ...guarantor,
        guarantorBirthDate: "",
      });
      validateField("birthDate", "");
      return;
    }

    const d = selectedDates[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const localDate = `${year}-${month}-${day}`; // siempre YYYY-MM-DD en horario local (Madrid)

    setGuarantor({
      ...guarantor,
      guarantorBirthDate: localDate,
    });

    validateField("birthDate", localDate);
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(guarantor);
      setGuarantor({
        guarantorAddress: "",
        guarantorBirthDate: "",
        guarantorDocumentNumber: "",
        guarantorDocumentType: "",
        guarantorEmail: "",
        guarantorFirstName: "",
        guarantorLastName: "",
        guarantorPhone: "",
        guarantorPopulation: "",
        guarantorPostalCode: "",
        guarantorProvince: "",
      });
      setErrors({});
    }
  };

  const options = [
    { value: "DNI", label: "DNI" },
    { value: "NIE", label: "NIE" },
    { value: "PASAPORTE", label: "PASAPORTE" },
  ];

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    Object.keys(guarantor).forEach((key) => {
      const value = guarantor[key as keyof typeof guarantor];

      // Todos los campos son obligatorios
      if (!value) {
        newErrors[key] = "Este campo es obligatorio";
        return;
      }

      // Validar email
      if (
        key === "guarantorEmail" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        newErrors[key] = "Ingrese un correo válido";
      }

      // Validar teléfono (solo números y longitud entre 1 y 15)
      if (key === "guarantorPhone" && !/^\d{1,15}$/.test(value)) {
        newErrors[key] = "Ingrese un número válido (máx. 15 dígitos)";
      }

      // Validar nombre y apellido (1 a 100 caracteres)
      if (
        (key === "guarantorFirstName" || key === "guarantorLastName") &&
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
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        Cargar datos avalista
      </h4>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="col-span-1">
          <Label>Nombre</Label>
          <Input
            type="text"
            name="guarantorFirstName"
            placeholder="Nicolas"
            value={guarantor.guarantorFirstName}
            onChange={handleChange}
            error={!!errors.guarantorFirstName}
            hint={errors.guarantorFirstName ? errors.guarantorFirstName : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Apellidos</Label>
          <Input
            type="text"
            name="guarantorLastName"
            placeholder="Garcia"
            value={guarantor.guarantorLastName}
            onChange={handleChange}
            error={!!errors.guarantorLastName}
            hint={errors.guarantorLastName ? errors.guarantorLastName : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Correo</Label>
          <Input
            type="text"
            name="guarantorEmail"
            placeholder="nicolas@esmeraschool.com"
            value={guarantor.guarantorEmail}
            onChange={handleChange}
            error={!!errors.guarantorEmail}
            hint={errors.guarantorEmail ? errors.guarantorEmail : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Teléfono</Label>
          <Input
            type="text"
            name="guarantorPhone"
            placeholder="123456789"
            value={guarantor.guarantorPhone}
            onChange={handleChange}
            error={!!errors.guarantorPhone}
            hint={errors.guarantorPhone ? errors.guarantorPhone : ""}
          />
        </div>

        <div className="col-span-1">
          <Label>Tipo de Documento</Label>
          <Select
            options={options}
            onChange={handleSelectChange}
            placeholder="Seleccionar tipo de documento"
            className={`dark:bg-dark-900 border ${
              errors.guarantorDocumentType
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
            }`}
          />{" "}
          {errors.guarantorDocumentType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.guarantorDocumentType}
            </p>
          )}
        </div>

        <div className="col-span-1">
          <Label>Numero de Documento</Label>
          <Input
            type="text"
            name="guarantorDocumentNumber"
            placeholder="Y12356..."
            value={guarantor.guarantorDocumentNumber}
            onChange={handleChange}
            error={!!errors.guarantorDocumentNumber}
            hint={
              errors.guarantorDocumentNumber
                ? errors.guarantorDocumentNumber
                : ""
            }
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Label>Dirección</Label>
          <Input
            type="text"
            name="guarantorAddress"
            placeholder="Av. Reforma 100, Apt. 3B"
            value={guarantor.guarantorAddress}
            onChange={handleChange}
            error={!!errors.guarantorAddress}
            hint={errors.guarantorAddress ? errors.guarantorAddress : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Código Postal</Label>
          <Input
            type="text"
            name="guarantorPostalCode"
            placeholder="28045"
            value={guarantor.guarantorPostalCode}
            onChange={handleChange}
            error={!!errors.guarantorPostalCode}
            hint={errors.guarantorPostalCode ? errors.guarantorPostalCode : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Ciudad</Label>
          <Input
            type="text"
            name="guarantorPopulation"
            placeholder="Madrid"
            value={guarantor.guarantorPopulation}
            onChange={handleChange}
            error={!!errors.guarantorPopulation}
            hint={errors.guarantorPopulation ? errors.guarantorPopulation : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Provincia</Label>
          <Input
            type="text"
            name="guarantorProvince"
            placeholder="Madrid"
            value={guarantor.guarantorProvince}
            onChange={handleChange}
            error={!!errors.guarantorProvince}
            hint={errors.guarantorProvince ? errors.guarantorProvince : ""}
          />
        </div>
        <div className="col-span-1">
          <Label>Fecha de Nacimiento</Label>
          <div className="relative w-full">
            <Flatpickr
              value={guarantor.guarantorBirthDate}
              onChange={handleDateChange}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Seleccionar fecha"
              className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 
                ${
                  errors.guarantorBirthDate
                    ? "border-red-500 focus:border-red-500"
                    : "focus:border-brand-300 focus:ring-brand-500/20"
                } 
                dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-6" />
            </span>
          </div>{" "}
          {errors.guarantorBirthDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.guarantorBirthDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button size="sm" variant="outline" onClick={handleCloseModal}>
          Cerrar
        </Button>
        <Button size="sm" variant="primary" onClick={handleSave}>
          Guardar Datos
        </Button>
      </div>
    </Modal>
  );
}

export default CreateGuarantorModal;
