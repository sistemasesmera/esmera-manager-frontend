import { useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import SpinnerFour from "../../ui/spinner/SpinnerFour";
import Tooltip from "../../ui/tooltip/Tooltip";
import { useModal } from "../../../hooks/useModal";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import { TabButton } from "./TabButton";
import Select from "../../form/Select";

interface TabContentProps {
  id: string;
  title: string;
  isActive: boolean;
}
type Props = {
  contract: any;
  onUpdate: (contractData: any) => void;
};

const tabs = [
  { id: "contrato", label: "Contrato" },
  { id: "avalista", label: "Avalista" },
];

function EditContractModal({ contract, onUpdate }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState("contrato");

  console.log(contract.courseEndDate);

  const [formData, setFormData] = useState({
    name: contract?.name || "",
    classSchedule: contract?.classSchedule || "",
    contractDate: contract?.contractDate || "",
    courseEndDate: contract?.courseEndDate || "",
    coursePrice: contract?.coursePrice || "",
    courseStartDate: contract?.courseStartDate || "",
    latestStudies: contract?.latestStudies || "",
    missingDocumentation: contract?.missingDocumentation || "",
    observations: contract?.observations || "",
    paymentAgreement: contract?.paymentAgreement || "",
    presentationDate: contract?.presentationDate || "",
    uniformSize: contract?.uniformSize || "",
    hasGuarantor: contract?.hasGuarantor || false,
    guarantorFirstName: contract?.guarantorFirstName || "",
    guarantorLastName: contract?.guarantorLastName || "",
    guarantorEmail: contract?.guarantorEmail || "",
    guarantorPhone: contract?.guarantorPhone || "",
    guarantorAddress: contract?.guarantorAddress || "",
    guarantorPopulation: contract?.guarantorPopulation || "",
    guarantorProvince: contract?.guarantorProvince || "",
    guarantorPostalCode: contract?.guarantorPostalCode || "",
    guarantorBirthdate: contract?.guarantorBirthdate || "",
    guarantorDocumentType: contract?.guarantorDocumentType || "",
    guarantorDocumentNumber: contract?.guarantorDocumentNumber || "",
  });

  console.log(formData.courseEndDate);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);
  const optionsClassSchedule = [
    { value: "MAÑANA - 10AM - 2PM", label: "Mañana - 10:00 - 14:00" },
    { value: "TARDE - 03PM - 07:00PM", label: "Tarde - 15:00 - 19:00" },
    { value: "NOCHE - 07:00PM - 10:00PM", label: "Noche - 19:00 - 22:00" },
    { value: "FIN DE SEMANA", label: "Fin de Semana" },
    { value: "POR DEFINIR", label: "Por Definir" },
  ];
  const handleCloseModal = () => {
    setFormData({
      ...contract,
    });
    setErrors({});
    console.log(errors);
    closeModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value) error = "Este campo es obligatorio";

    if (
      name.includes("Email") &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error = "Ingrese un correo válido";
    }

    if (name.includes("Phone") && value && !/^\d{1,15}$/.test(value)) {
      error = "Ingrese un número válido (máx. 15 dígitos)";
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
      const { data: updatedContract } = await axiosInstance.put(
        `/contracts/${contract.id}`,
        formData
      );

      onUpdate(updatedContract);
      showNotification(
        "success",
        "Editar Contrato",
        "Contrato actualizado correctamente"
      );
      handleCloseModal();
    } catch (error: any) {
      console.error(
        "Error al actualizar contrato:",
        error.response?.data || error.message
      );
      showNotification(
        "error",
        "Editar Contrato",
        "Error al actualizar el contrato"
      );
    } finally {
      setLoading(false);
    }
  };

  const TabContent: React.FC<TabContentProps> = ({ isActive }) => {
    if (!isActive) return null;

    return (
      <div className="pt-4 dark:border-gray-800">
        {activeTab === "contrato" && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>Nombre</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del contrato"
                disabled
              />
            </div>
            <div className="col-span-1">
              <Label>Fecha de Contrato</Label>
              <Input
                type="text"
                name="classSchedule"
                value={formData.contractDate}
                onChange={handleChange}
                placeholder=""
                disabled
              />
            </div>
            <div className="col-span-1">
              <Label>Horario de Clases</Label>
              <Select
                options={optionsClassSchedule}
                defaultValue={formData.classSchedule || ""}
                onChange={() => {
                  //
                }}
                placeholder="Seleccionar horario de clase"
                className={`dark:bg-dark-900 border `}
              />
            </div>
            <div className="col-span-1">
              <Label>Ultimos Estudios</Label>
              <Input
                type="text"
                name="latestStudies"
                value={formData.latestStudies}
                onChange={handleChange}
                placeholder="Ultimos Estudios"
              />
            </div>
            <div className="col-span-1">
              <Label>Ultimos Estudios Realizados</Label>
              <Input
                type="text"
                name="latesStudies"
                value={formData.latestStudies}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Acuerdo de Pago</Label>
              <Input
                type="text"
                name="paymentAgreemenet"
                value={formData.paymentAgreement}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Documentacion Faltante</Label>
              <Input
                type="text"
                name="missingDocumentation"
                value={formData.missingDocumentation}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Inicio de Curso</Label>
              <Input
                type="text"
                name="courseStartDate"
                value={formData.courseStartDate}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Fin de Curso</Label>
              <Input
                type="text"
                name="courseEndDate"
                value={formData.courseEndDate}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Precio </Label>
              <Input
                type="text"
                name="coursePrice"
                value={formData.coursePrice}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Observaciones </Label>
              <Input
                type="text"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder=""
              />
            </div>
            <div className="col-span-1">
              <Label>Talla del Uniforme </Label>
              <Input
                type="text"
                name="uniformSize"
                value={formData.uniformSize}
                onChange={handleChange}
                placeholder=""
              />
            </div>
          </div>
        )}

        {activeTab === "avalista" && (
          <>
            {!formData.hasGuarantor ? (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Este contrato no tiene avalista
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="col-span-1">
                  <Label>Nombre Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorFirstName"
                    value={formData.guarantorFirstName}
                    onChange={handleChange}
                    placeholder="Nombre"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Apellido Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorLastName"
                    value={formData.guarantorLastName}
                    onChange={handleChange}
                    placeholder="Apellido"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Email Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorEmail"
                    value={formData.guarantorEmail}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Phone Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorPhone"
                    value={formData.guarantorPhone}
                    onChange={handleChange}
                    placeholder="Teléfono"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Dirección Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorAddress"
                    value={formData.guarantorAddress}
                    onChange={handleChange}
                    placeholder="Dirección"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Población Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorPopulation"
                    value={formData.guarantorPopulation}
                    onChange={handleChange}
                    placeholder="Población"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Provincia Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorProvince"
                    value={formData.guarantorProvince}
                    onChange={handleChange}
                    placeholder="Provincia"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Código Postal Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorPostalCode"
                    value={formData.guarantorPostalCode}
                    onChange={handleChange}
                    placeholder="28045"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Fecha de Nacimiento Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorBirthdate"
                    value={formData.guarantorBirthdate}
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Tipo de Documento Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorDocumentType"
                    value={formData.guarantorDocumentType}
                    onChange={handleChange}
                    placeholder="DNI/NIE/PASAPORTE"
                  />
                </div>

                <div className="col-span-1">
                  <Label>Número de Documento Avalista</Label>
                  <Input
                    type="text"
                    name="guarantorDocumentNumber"
                    value={formData.guarantorDocumentNumber}
                    onChange={handleChange}
                    placeholder="Número de documento"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <Tooltip content="Editar Contrato" position="left">
        <button onClick={openModal}>
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
              d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
            />
          </svg>
        </button>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] p-5 lg:p-10"
      >
        <form onSubmit={handleSubmit}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Editar Contrato
          </h4>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <SpinnerFour />
            </div>
          ) : (
            <div className="">
              <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-2 overflow-x-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
                  {tabs.map((tab) => (
                    <TabButton
                      key={tab.id}
                      id={tab.id}
                      label={tab.label}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}
                </nav>
              </div>

              <div className="pt-4 dark:border-gray-800">
                {tabs.map((tab) => (
                  <TabContent
                    key={tab.id}
                    id={tab.id}
                    title={tab.label}
                    isActive={activeTab === tab.id}
                  />
                ))}
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
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EditContractModal;
