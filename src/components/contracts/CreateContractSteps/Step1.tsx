import React, { useState } from "react";
import Button from "../../ui/button/Button";
import { FaPlus, FaSearch } from "react-icons/fa";
import CreateAlumnModal from "./Step1/CreateAlumnModal";
import axiosInstance from "../../../axios/axiosConfig";
import CreateAlumnData from "../../../types/frontend/createAlumnData";
import ContractData from "../../../types/frontend/contractData";
import SearchAlumnModal from "./Step1/SearchAlumnModal";
import Alumn from "../../../types/frontend/alumn-temp";
interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
  step: number;
  updateAlumn: (alumn: Alumn | null) => void;
  contractData: ContractData;
}

const Step1: React.FC<StepProps> = ({
  nextStep,
  prevStep,
  step,
  updateAlumn,
  contractData,
}) => {
  const [modalSearchIsOpen, setModalSearchIsOpen] = useState(false);
  const [modalCreateIsOpen, setModalCreateIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // Funcion para crear un alumno.
  const handleCreateAlumn = async (alumnData: CreateAlumnData) => {
    try {
      setLoading(true);

      const { id, isVerified, code, createdAt, updatedAt, ...cleanAlumnData } =
        alumnData;
      const response = await axiosInstance.post<Alumn>(
        "/alumns",
        cleanAlumnData
      );
      updateAlumn(response.data);
      setLoading(false);

      setModalCreateIsOpen(false);
    } catch (error) {
      // Maneja el error (puedes usar un manejo de errores más específico si lo deseas)
      console.error("Error al crear alumno:", error);
      // Podrías mostrar un mensaje de error al usuario si lo deseas
      setLoading(false);
    }
  };

  // Funcion para crear un alumno.
  const handleSearchAlumn = async (alumn: Alumn) => {
    updateAlumn(alumn);
    setModalSearchIsOpen(false);
  };

  return (
    <div className="p-6 rounded-lg bg-white dark:bg-gray-800 ">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Datos del Alumno
      </h2>
      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button
          size="sm"
          variant="primary"
          startIcon={<FaSearch className="size-5" />}
          onClick={() => {
            setModalSearchIsOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 shadow-theme-xs 
               dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Buscar Alumno
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setModalCreateIsOpen(true);
          }}
          startIcon={<FaPlus className="size-5" />}
          className="bg-green-500 hover:bg-green-600 shadow-theme-xs 
               dark:bg-green-600 dark:hover:bg-green-700"
        >
          Crear Alumno Nuevo
        </Button>
      </div>

      {/* Tarjeta de información del alumno */}

      <div
        className={`border rounded-lg p-4 mt-4 transition-all duration-300 ${
          contractData.alumn
            ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-300"
            : "bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-400 dark:text-red-300"
        }`}
      >
        {contractData.alumn ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {contractData.alumn.firstName} {contractData.alumn.lastName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📄 <strong>Documento:</strong> {contractData.alumn.documentType}{" "}
              {contractData.alumn.documentNumber}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📧 <strong>Correo:</strong> {contractData.alumn.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📞 <strong>Teléfono:</strong> {contractData.alumn.phone}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📍 <strong>Dirección:</strong> {contractData.alumn.address},{" "}
              {contractData.alumn.population}, {contractData.alumn.province}
            </p>

            <button
              onClick={() => {
                updateAlumn(null);
              }}
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
            >
              Cambiar Alumno
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-lg font-medium">No hay alumno seleccionado</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Usa el botón "Buscar Alumno" o "Crear Alumno Nuevo"
            </p>
          </div>
        )}
      </div>

      {/* Botón de navegación */}
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
          disabled={!contractData.alumn} // Se activará solo cuando haya un alumno seleccionado
        >
          Siguiente
        </button>
      </div>
      <CreateAlumnModal
        isOpen={modalCreateIsOpen}
        closeModal={() => {
          setModalCreateIsOpen(false);
        }}
        onCreateAlumn={handleCreateAlumn}
        loading={loading}
      />
      <SearchAlumnModal
        isOpen={modalSearchIsOpen}
        closeModal={() => {
          setModalSearchIsOpen(false);
        }}
        onSearchAlumn={handleSearchAlumn}
      />
    </div>
  );
};

export default Step1;
