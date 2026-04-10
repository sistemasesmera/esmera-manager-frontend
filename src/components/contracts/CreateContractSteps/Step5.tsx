import React from "react";
import ContractData from "../../../types/frontend/contractData";

interface StepProps {
  prevStep: () => void;
  step: number;
  contractData: ContractData;
  onSubmit: (contractData: ContractData) => void;
}

const Step5: React.FC<StepProps> = ({
  prevStep,
  step,
  contractData,
  onSubmit,
}) => {
  const { alumn, guarantor, course, contract } = contractData;

  const handleSubmit = () => {
    onSubmit(contractData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Confirmacion de Datos
      </h2>

      <div className="space-y-6">
        {/* Información del Alumno */}
        {alumn && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Datos del Alumno
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Nombre:</strong> {alumn.firstName} {alumn.lastName}
              </p>
              <p>
                <strong>Teléfono:</strong> {alumn.phone}
              </p>
              <p>
                <strong>Email:</strong> {alumn.email}
              </p>
              <p>
                <strong>Fecha de nacimiento:</strong> {alumn.birthDate}
              </p>
              <p>
                <strong>Documento:</strong> {alumn.documentType} -{" "}
                {alumn.documentNumber}
              </p>
              <p>
                <strong>Dirección:</strong> {alumn.address}, {alumn.population},{" "}
                {alumn.province} - {alumn.postalCode}
              </p>
            </div>
          </div>
        )}

        {/* Información del Fiador */}
        {guarantor && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Datos del Avalista
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Nombre:</strong> {guarantor.guarantorFirstName}{" "}
                {guarantor.guarantorLastName}
              </p>
              <p>
                <strong>Teléfono:</strong> {guarantor.guarantorPhone}
              </p>
              <p>
                <strong>Email:</strong> {guarantor.guarantorEmail}
              </p>
              <p>
                <strong>Fecha de nacimiento:</strong>{" "}
                {guarantor.guarantorBirthDate}
              </p>
              <p>
                <strong>Documento:</strong> {guarantor.guarantorDocumentType} -{" "}
                {guarantor.guarantorDocumentNumber}
              </p>

              <p>
                <strong>Dirección:</strong> {guarantor.guarantorAddress},{" "}
                {guarantor.guarantorPopulation}, {guarantor.guarantorProvince} -{" "}
                {guarantor.guarantorPostalCode}
              </p>
            </div>
          </div>
        )}

        {/* Información del Contrato */}
        {contract && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Detalles del Contrato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Fecha de Contrato:</strong>{" "}
                {contract.contractDate ?? "Sin fecha asignada"}
              </p>
              <p>
                <strong>Horario de clases:</strong>{" "}
                {contract.classSchedule ?? "No disponible"}
              </p>
              <p>
                <strong>Últimos estudios:</strong>{" "}
                {contract.latestStudies ?? "No disponible"}
              </p>
              <p>
                <strong>Documentacion faltante:</strong>{" "}
                {contract.missingDocumentation ?? "No disponible"}
              </p>
              <p>
                <strong>Talla de Uniforme:</strong>{" "}
                {contract.uniformSize?.toUpperCase() ?? "No disponible"}
              </p>
              <p>
                <strong>Fecha de Presentacion:</strong>{" "}
                {contract.presentationDate ?? "Sin fecha asignada"}
              </p>{" "}
              <p>
                <strong>Acuerdo de Pago:</strong>{" "}
                {contract.paymentAgreement ?? "No disponible"}
              </p>
              <p>
                <strong>Observaciones:</strong>{" "}
                {contract.observations ?? "No disponible"}
              </p>
            </div>
          </div>
        )}
        {/* Información del Curso */}
        {course && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Datos del Curso
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Nombre:</strong> {course.name ?? "No disponible"}{" "}
                {course.additionalCourse ? `- ${course.additionalCourse}` : ""}
              </p>
              <p>
                <strong>Precio:</strong> {course.price ?? "No disponible"}
              </p>
              <p>
                <strong>Fecha de inicio:</strong>{" "}
                {course.startDate ?? "Sin fecha asignada"}
              </p>
              <p>
                <strong>Fecha de fin:</strong>{" "}
                {course.courseEndDate ?? "Sin fecha asignada"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg shadow-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          disabled={step === 1}
        >
          Anterior
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Crear Contrato
        </button>
      </div>
    </div>
  );
};

export default Step5;
