import React, { useState, useEffect } from "react";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import Flatpickr from "react-flatpickr";
import { CalenderIcon } from "../../../icons";
import ContractData from "../../../types/frontend/contractData";

interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
  step: number;
  onDateChange: (name: string, selectedDates: Date[]) => void;
  onContractDataChange: (name: string, value: string) => void;
  contractData: ContractData;
}

const Step3: React.FC<StepProps> = ({
  nextStep,
  prevStep,
  step,
  onDateChange,
  onContractDataChange,
  contractData,
}) => {
  // Estado para manejar la validación
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Opciones para los campos select
  const optionsClassSchedule = [
    { value: "MAÑANA - 10AM - 2PM", label: "Mañana - 10:00 - 14:00" },
    { value: "TARDE - 03PM - 07:00PM", label: "Tarde - 15:00 - 19:00" },
    { value: "NOCHE - 07:00PM - 10:00PM", label: "Noche - 19:00 - 22:00" },
    { value: "FIN DE SEMANA", label: "Fin de Semana" },
    { value: "POR DEFINIR", label: "Por Definir" },
  ];

  const optionsLastestStudies = [
    { value: "UNIVERSITARIOS", label: "Universitarios" },
    { value: "BACHILLER", label: "Bachiller" },
    { value: "ESO", label: "ESO" },
    { value: "PRIMARIA", label: "Primaria" },
    { value: "FP BASICO", label: "FP Básico" },
    { value: "FP GRADO SUPERIOR", label: "FP Grado Superior" },
    { value: "FP GRADO MEDIO", label: "FP Grado Medio" },
    { value: "NINGUNO", label: "Ningún Estudio" },
  ];

  const optionsUniformSize = [
    { value: "XS", label: "Talla XS" },
    { value: "S", label: "Talla S" },
    { value: "M", label: "Talla M" },
    { value: "L", label: "Talla L" },
    { value: "XL", label: "Talla XL" },
    { value: "XXL", label: "Talla XXL" },
    { value: "NO", label: "No Necesita Uniforme" },
  ];

  const optionsMissingDocumentation = [
    { value: "NINGUNO", label: "Ninguno" },
    { value: "FOTOGRAFIAS", label: "Fotografías" },
    { value: "DOCUMENTO", label: "Documento" },
  ];

  const optionsPaymentAgreement = [
    { value: "Financiado por sequra", label: "Financiado por Sequra" },
    { value: "Financiado por Esmera", label: "Financiado por Esmera" },
    { value: "Pago al contado", label: "Pago al Contado" },
    { value: "Otros", label: "Otros" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onContractDataChange(name, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    onContractDataChange(name, value);
  };

  // Handle date inputs.
  const handleDateChangeDateContract = (selectedDates: Date[]) => {
    console.log(selectedDates);
    onDateChange("contractDate", selectedDates);
  };
  const handleDateChangeDatePresentation = (selectedDates: Date[]) => {
    console.log(selectedDates);
    onDateChange("presentationDate", selectedDates);
  };

  // Validar los campos obligatorios
  const validateFields = () => {
    const errors: { [key: string]: string } = {};

    // Validación de los campos obligatorios, sin incluir "observations" y "presentationDate"
    if (!contractData.contract?.classSchedule) {
      errors.classSchedule = "Este campo es obligatorio";
    }
    if (!contractData.contract?.latestStudies) {
      errors.latestStudies = "Este campo es obligatorio";
    }
    if (!contractData.contract?.missingDocumentation) {
      errors.missingDocumentation = "Este campo es obligatorio";
    }
    if (!contractData.contract?.uniformSize) {
      errors.uniformSize = "Este campo es obligatorio";
    }
    if (!contractData.contract?.paymentAgreement) {
      errors.paymentAgreement = "Este campo es obligatorio";
    }
    if (!contractData.contract?.contractDate) {
      errors.contractDate = "Fecha de contrato es obligatoria";
    }

    setValidationErrors(errors);
  };

  // Llamar a la validación al cargar el componente o cuando cambien los datos
  useEffect(() => {
    validateFields();
  }, [contractData]);

  // Deshabilitar el botócn "Siguiente" si hay errores de validación
  const isNextDisabled = () => {
    return Object.keys(validationErrors).length > 0;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Datos Contrato
      </h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="col-span-1">
          <Label>Fecha de Contrato</Label>
          <div className="relative w-full">
            <Flatpickr
              disabled={true}
              value={contractData.contract?.contractDate}
              onChange={handleDateChangeDateContract}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Seleccionar fecha de contrato"
              className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 
        dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-6" />
            </span>
          </div>
        </div>

        <div className="col-span-1">
          <Label>Horario de Clases</Label>
          <Select
            options={optionsClassSchedule}
            defaultValue={contractData.contract?.classSchedule || ""}
            onChange={(value) => {
              handleSelectChange("classSchedule", value);
            }}
            placeholder="Seleccionar horario de clase"
            className={`dark:bg-dark-900 border `}
          />
        </div>

        <div className="col-span-1">
          <Label>Ultimos Estudios</Label>
          <Select
            options={optionsLastestStudies}
            defaultValue={contractData.contract?.latestStudies || ""}
            onChange={(value) => {
              handleSelectChange("latestStudies", value);
            }}
            placeholder="Seleccionar ultimos estudios"
            className={`dark:bg-dark-900 border `}
          />
        </div>

        <div className="col-span-1">
          <Label>Documentacion Faltante</Label>
          <Select
            options={optionsMissingDocumentation}
            defaultValue={contractData.contract?.missingDocumentation || ""}
            onChange={(value) => {
              handleSelectChange("missingDocumentation", value);
            }}
            placeholder="Seleccionar documentacion faltante"
            className={`dark:bg-dark-900 border `}
          />
        </div>

        <div className="col-span-1">
          <Label>Tamaño de Uniforme</Label>
          <Select
            options={optionsUniformSize}
            defaultValue={contractData.contract?.uniformSize || ""}
            onChange={(value) => {
              handleSelectChange("uniformSize", value);
            }}
            placeholder="Seleccionar tamaño del uniforme"
            className={`dark:bg-dark-900 border `}
          />
        </div>

        <div className="col-span-1">
          <Label>Fecha de Presentación</Label>
          <div className="relative w-full">
            <Flatpickr
              value={contractData.contract?.presentationDate}
              onChange={handleDateChangeDatePresentation}
              options={{ dateFormat: "Y-m-d" }}
              placeholder="Seleccionar fecha de presentación"
              className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring bg-transparent text-gray-800 border-gray-300 
        dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700`}
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <CalenderIcon className="size-6" />
            </span>
          </div>
        </div>

        <div className="col-span-1">
          <Label>Acuerdo de Pago</Label>
          <Select
            options={optionsPaymentAgreement}
            defaultValue={contractData.contract?.paymentAgreement || ""}
            onChange={(value) => {
              handleSelectChange("paymentAgreement", value);
            }}
            placeholder="Seleccionar acuerdo de pago"
            className={`dark:bg-dark-900 border `}
          />
        </div>

        <div className="col-span-1">
          <Label>Observaciones</Label>
          <Input
            type="text"
            name="observations"
            placeholder="3 Cuotas de 100.."
            value={contractData.contract?.observations || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md disabled:opacity-50"
          disabled={step === 1} // En el primer paso, "Anterior" estará deshabilitado
        >
          Anterior
        </button>

        <button
          onClick={nextStep}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          disabled={isNextDisabled()} // Se desactiva si hay algún campo vacío
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Step3;
