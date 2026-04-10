import React, { useState } from "react";
import ContractData from "../../../types/frontend/contractData";
import Button from "../../ui/button/Button";
import CreateGuarantorModal from "./Step2/CreateGuarantorModal";
import Guarantor from "../../../types/frontend/guarantor";

interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
  step: number;
  updateGuarantor: (guarantor: Guarantor | null) => void;
  contractData: ContractData;
}

const Step2: React.FC<StepProps> = ({
  nextStep,
  prevStep,
  step,
  updateGuarantor,
  contractData,
}) => {
  const [modalCreateGuarantorIsOpen, setModalCreateGuarantorIsOpen] =
    useState(false);

  const handleSaveGuarantor = (guarantor: Guarantor) => {
    updateGuarantor(guarantor);
    setModalCreateGuarantorIsOpen(false);
  };

  return (
    <div className="p-6 rounded-lg bg-white dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Datos Avalista
      </h2>

      {/* Pregunta con botones tipo toggle */}
      <div className="mb-6 flex flex-col justify-center items-center">
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
          ¿El contrato tiene avalista?
        </p>
        <div className="flex gap-4 mt-3">
          <Button
            size="sm"
            variant={contractData.guarantor ? "primary" : "outline"}
            onClick={() => setModalCreateGuarantorIsOpen(true)}
          >
            Sí
          </Button>
          <Button
            size="sm"
            variant={!contractData.guarantor ? "primary" : "outline"}
            onClick={() => updateGuarantor(null)}
          >
            No
          </Button>
        </div>
      </div>

      {/* Si "No" está seleccionado, mostramos el mensaje */}
      {!contractData.guarantor && (
        <div className="p-4 rounded-lg border border-gray-400 bg-gray-100 dark:bg-gray-900 dark:border-gray-600">
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            ❌ No aplica avalista para este contrato.
          </p>
        </div>
      )}
      {contractData.guarantor && (
        <div
          className={`border rounded-lg p-4 mt-4 transition-all duration-300 ${
            contractData.guarantor
              ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-300"
              : "bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-400 dark:text-red-300"
          }`}
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {contractData.guarantor.guarantorFirstName}{" "}
              {contractData.guarantor.guarantorLastName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📄 <strong>Documento:</strong>{" "}
              {contractData.guarantor?.guarantorDocumentType}{" "}
              {contractData.guarantor?.guarantorDocumentNumber}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📧 <strong>Correo:</strong>{" "}
              {contractData.guarantor?.guarantorEmail}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📞 <strong>Teléfono:</strong>{" "}
              {contractData.guarantor?.guarantorPhone}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📍 <strong>Dirección:</strong>{" "}
              {contractData.guarantor?.guarantorAddress},{" "}
              {contractData.guarantor?.guarantorPopulation},{" "}
              {contractData.guarantor?.guarantorProvince}
            </p>

            <button
              onClick={() => {
                updateGuarantor(null);
              }}
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
            >
              Cambiar Avalista
            </button>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md disabled:opacity-50"
          disabled={step === 1}
        >
          Anterior
        </button>

        <button
          onClick={nextStep}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <CreateGuarantorModal
        isOpen={modalCreateGuarantorIsOpen}
        closeModal={() => {
          setModalCreateGuarantorIsOpen(false);
        }}
        onSave={handleSaveGuarantor}
      />
    </div>
  );
};

export default Step2;
