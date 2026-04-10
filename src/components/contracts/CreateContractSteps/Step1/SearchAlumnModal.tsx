import { useState } from "react";
import { Modal } from "../../../ui/modal";
import Button from "../../../ui/button/Button";
import axiosInstance from "../../../../axios/axiosConfig";
import Alumn from "../../../../types/frontend/alumn-temp";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  onSearchAlumn: (alumn: Alumn) => void;
};

function SearchAlumnModal({ isOpen, closeModal, onSearchAlumn }: Props) {
  const [documentNumber, setDocumentNumber] = useState(""); // Estado para el input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alumn, setAlumn] = useState<Alumn | null>(null); // Estado para el alumno encontrado

  // Función para manejar la búsqueda
  const handleSearch = async () => {
    if (!documentNumber.trim()) return; // Evitar búsquedas vacías

    setLoading(true);
    setError(null);
    setAlumn(null);

    try {
      const response = await axiosInstance.get<Alumn>(
        `/alumns/${documentNumber}`
      );
      setAlumn(response.data); // Guardamos el alumno encontrado
    } catch (err) {
      console.log(err);
      setError("No se encontró ningún alumno con ese documento.");
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar la búsqueda
  const handleNewSearch = () => {
    setDocumentNumber("");
    setAlumn(null);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setError(null);
        setAlumn(null);
        setDocumentNumber("");
        closeModal();
      }}
      className="max-w-[600px] p-5 lg:p-10"
    >
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        Buscar Alumno
      </h4>

      {/* Input para ingresar el documento */}
      {!alumn && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Número de Documento:
          </label>
          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el número de documento"
            disabled={loading}
          />
        </div>
      )}

      {/* Mostrar mensaje de error si no se encuentra el alumno */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Si hay un alumno encontrado, mostramos su información */}
      {alumn && (
        <div className="p-4 border rounded-lg bg-green-100 dark:bg-green-900">
          <h5 className="text-lg font-semibold">
            {alumn.firstName} {alumn.lastName}
          </h5>
          <p className="text-sm">
            📄 {alumn.documentType}: {alumn.documentNumber}
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setError(null);
            setAlumn(null);
            setDocumentNumber("");
            closeModal();
          }}
        >
          Cerrar
        </Button>

        {alumn ? (
          <>
            <Button size="sm" variant="outline" onClick={handleNewSearch}>
              Nueva Búsqueda
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setError(null);
                setAlumn(null);
                setDocumentNumber("");
                onSearchAlumn(alumn);
              }}
            >
              Seleccionar
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default SearchAlumnModal;
