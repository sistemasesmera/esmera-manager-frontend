import { useModal } from "../../../hooks/useModal";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { FolderIcon, DownloadIcon } from "../../../icons";
import Contract from "../../../types/backend/backendContract";
import Badge from "../../ui/badge/Badge";
import { useState } from "react";
import generateContractPDF from "../../../utils/generateContractPDF";

interface ContractModalProps {
  contract: Contract;
}

export default function ContractModal({ contract }: ContractModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { alumn, course } = contract; // Extraemos los datos para mayor claridad

  const [showAlumnDetails, setShowAlumnDetails] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showGuarantorDetails, setShowGuarantorDetails] = useState(false);

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        startIcon={<FolderIcon className="size-4" />}
        onClick={openModal}
      >
        Detalles
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[95%] lg:max-w-[900px] p-5 lg:p-10 overflow-auto"
      >
        <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
          Detalles del contrato
        </h4>

        {/* 🔹 Sección: Datos del contrato */}
        <div className="border p-4 rounded-lg shadow-sm mb-5">
          <h5 className="font-semibold text-gray-700 dark:text-white">
            Datos del Contrato - {contract.name}
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Nombre:</strong> {contract.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Observaciones:</strong> {contract.observations}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Acuerdo de Pago:</strong> {contract.paymentAgreement}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Precio del curso:</strong> {contract.coursePrice}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Horario de Clases:</strong> {contract.classSchedule}
          </p>
        </div>

        {/* 🔹 Botón para ver los Datos del Alumno */}
        <Button
          size="sm"
          variant="outline"
          className="mb-3"
          onClick={() => setShowAlumnDetails(!showAlumnDetails)}
        >
          {showAlumnDetails ? "Ocultar" : "Ver"} Datos del Alumno
        </Button>
        {showAlumnDetails && (
          <div className="border p-4 rounded-lg shadow-sm mb-5">
            <div className="flex space-x-2">
              <h5 className="font-semibold text-gray-700 dark:text-white">
                Datos del Alumno
              </h5>
              <Badge
                variant="light"
                color={alumn.isVerified ? "success" : "error"}
                size="sm"
              >
                {alumn.isVerified ? "Verificado" : "No Verificado"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Nombre:</strong> {alumn.firstName} {alumn.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Teléfono:</strong> {alumn.phone}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Email:</strong> {alumn.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Fecha de Nacimiento:</strong> {alumn.birthDate}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Documento:</strong> {alumn.documentType} -{" "}
                  {alumn.documentNumber}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Dirección:</strong> {alumn.address},{" "}
                  {alumn.postalCode}, {alumn.population}, {alumn.province}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 🔹 Botón para ver los Datos del Curso */}
        <Button
          size="sm"
          variant="outline"
          className="mb-3"
          onClick={() => setShowCourseDetails(!showCourseDetails)}
        >
          {showCourseDetails ? "Ocultar" : "Ver"} Datos del Curso
        </Button>
        {showCourseDetails && (
          <div className="border p-4 rounded-lg shadow-sm mb-5">
            <h5 className="font-semibold text-gray-700 dark:text-white">
              Datos del Curso
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {course.name}
            </p>
          </div>
        )}

        {/* 🔹 Botón para ver los Datos del Avalista */}
        {contract.hasGuarantor && (
          <Button
            size="sm"
            variant="outline"
            className="mb-3"
            onClick={() => setShowGuarantorDetails(!showGuarantorDetails)}
          >
            {showGuarantorDetails ? "Ocultar" : "Ver"} Datos del Avalista
          </Button>
        )}
        {showGuarantorDetails && contract.hasGuarantor && (
          <div className="border p-4 rounded-lg shadow-sm mb-5">
            <h5 className="font-semibold text-gray-700 dark:text-white">
              Datos del Avalista
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Nombre del Avalista:</strong>{" "}
                  {contract.guarantorFirstName} {contract.guarantorLastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Teléfono:</strong> {contract.guarantorPhone}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Email:</strong> {contract.guarantorEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Dirección:</strong> {contract.guarantorAddress},{" "}
                  {contract.guarantorPostalCode}, {contract.guarantorPopulation}
                  , {contract.guarantorProvince}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>Documento:</strong> {contract.guarantorDocumentType} -{" "}
                  {contract.guarantorDocumentNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón centrado para descargar el PDF */}
        <div className="flex justify-center mt-5">
          <Button
            size="sm"
            variant="primary"
            startIcon={<DownloadIcon className="size-4" />}
            onClick={() => generateContractPDF(contract)}
          >
            Descargar en PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
}
