import { useEffect, useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../../icons";
import SpinnerFour from "../../ui/spinner/SpinnerFour";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Lead from "../../../types/frontend/lead";

interface Props {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onConverted: (updatedLead: Lead) => void;
}

const documentTypeOptions = [
  { value: "DNI", label: "DNI" },
  { value: "NIE", label: "NIE" },
  { value: "PASAPORTE", label: "PASAPORTE" },
];

const emptyConvertData = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthDate: "",
  documentType: "",
  documentNumber: "",
  address: "",
  postalCode: "",
  population: "",
  province: "",
};

export default function ConvertLeadModal({
  lead,
  isOpen,
  onClose,
  onConverted,
}: Props) {
  const { showNotification } = useNotification();

  const [convertData, setConvertData] = useState(emptyConvertData);
  const [convertErrors, setConvertErrors] = useState<{
    [key: string]: string;
  }>({});
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const parts = lead.name.trim().split(/\s+/);
    setConvertData({
      ...emptyConvertData,
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
      phone: lead.phone ?? "",
      email: lead.email ?? "",
    });
    setConvertErrors({});
  }, [isOpen, lead]);

  const handleConvertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConvertData((prev) => ({ ...prev, [name]: value }));
    setConvertErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleConvertDateChange = (selectedDates: Date[]) => {
    const value = selectedDates[0]
      ? selectedDates[0].toISOString().split("T")[0]
      : "";
    setConvertData((prev) => ({ ...prev, birthDate: value }));
    setConvertErrors((prev) => ({ ...prev, birthDate: "" }));
  };

  const validateConvertForm = () => {
    const newErrors: { [key: string]: string } = {};
    (Object.keys(convertData) as (keyof typeof convertData)[]).forEach(
      (key) => {
        if (!convertData[key]) {
          newErrors[key] = "Este campo es obligatorio";
        }
      }
    );
    setConvertErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateConvertForm()) return;

    try {
      setConverting(true);
      const { data } = await axiosInstance.post(
        `/leads/${lead.id}/convert`,
        convertData
      );
      onConverted(data.lead);
      showNotification(
        "success",
        "Lead",
        "Lead convertido a alumno correctamente"
      );
      onClose();
    } catch (error: any) {
      console.error(
        "Error al convertir el lead:",
        error.response?.data || error.message
      );
      const backendMessage = error.response?.data?.message;
      showNotification(
        "error",
        "Lead",
        Array.isArray(backendMessage)
          ? backendMessage.join(", ")
          : backendMessage || "Error al convertir el lead"
      );
    } finally {
      setConverting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[95%] lg:max-w-[700px] p-5 lg:p-8 overflow-auto"
    >
      <form onSubmit={handleConvert}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Convertir a Alumno
        </h4>

        {converting ? (
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
                value={convertData.firstName}
                onChange={handleConvertChange}
                error={!!convertErrors.firstName}
                hint={convertErrors.firstName}
              />
            </div>
            <div className="col-span-1">
              <Label>Apellidos</Label>
              <Input
                type="text"
                name="lastName"
                value={convertData.lastName}
                onChange={handleConvertChange}
                error={!!convertErrors.lastName}
                hint={convertErrors.lastName}
              />
            </div>
            <div className="col-span-1">
              <Label>Teléfono</Label>
              <Input
                type="text"
                name="phone"
                value={convertData.phone}
                onChange={handleConvertChange}
                error={!!convertErrors.phone}
                hint={convertErrors.phone}
              />
            </div>
            <div className="col-span-1">
              <Label>Correo</Label>
              <Input
                type="text"
                name="email"
                value={convertData.email}
                onChange={handleConvertChange}
                error={!!convertErrors.email}
                hint={convertErrors.email}
              />
            </div>
            <div className="col-span-1">
              <Label>Fecha de Nacimiento</Label>
              <div className="relative w-full">
                <Flatpickr
                  value={convertData.birthDate}
                  onChange={handleConvertDateChange}
                  options={{ dateFormat: "Y-m-d" }}
                  placeholder="Seleccionar fecha"
                  className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300
                    ${
                      convertErrors.birthDate
                        ? "border-red-500 focus:border-red-500"
                        : "focus:border-brand-300 focus:ring-brand-500/20"
                    }
                    dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
              {convertErrors.birthDate && (
                <p className="text-red-500 text-xs mt-1">
                  {convertErrors.birthDate}
                </p>
              )}
            </div>
            <div className="col-span-1">
              <Label>Tipo de Documento</Label>
              <Select
                options={documentTypeOptions}
                defaultValue={convertData.documentType}
                onChange={(value) =>
                  setConvertData((prev) => ({
                    ...prev,
                    documentType: value,
                  }))
                }
                placeholder="Selecciona el tipo de documento"
                className={`dark:bg-dark-900 border ${
                  convertErrors.documentType
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
                }`}
              />
              {convertErrors.documentType && (
                <p className="text-red-500 text-xs mt-1">
                  {convertErrors.documentType}
                </p>
              )}
            </div>
            <div className="col-span-1">
              <Label>Número de Documento</Label>
              <Input
                type="text"
                name="documentNumber"
                value={convertData.documentNumber}
                onChange={handleConvertChange}
                error={!!convertErrors.documentNumber}
                hint={convertErrors.documentNumber}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label>Dirección</Label>
              <Input
                type="text"
                name="address"
                value={convertData.address}
                onChange={handleConvertChange}
                error={!!convertErrors.address}
                hint={convertErrors.address}
              />
            </div>
            <div className="col-span-1">
              <Label>Código Postal</Label>
              <Input
                type="text"
                name="postalCode"
                value={convertData.postalCode}
                onChange={handleConvertChange}
                error={!!convertErrors.postalCode}
                hint={convertErrors.postalCode}
              />
            </div>
            <div className="col-span-1">
              <Label>Ciudad</Label>
              <Input
                type="text"
                name="population"
                value={convertData.population}
                onChange={handleConvertChange}
                error={!!convertErrors.population}
                hint={convertErrors.population}
              />
            </div>
            <div className="col-span-1">
              <Label>Provincia</Label>
              <Input
                type="text"
                name="province"
                value={convertData.province}
                onChange={handleConvertChange}
                error={!!convertErrors.province}
                hint={convertErrors.province}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={converting}
            type="button"
          >
            Cancelar
          </Button>
          <Button size="sm" variant="primary" disabled={converting}>
            {converting ? "Guardando..." : "Convertir"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
