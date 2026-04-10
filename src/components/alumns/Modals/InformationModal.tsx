import { useState } from "react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Alumn from "../../../types/frontend/alumn-temp";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";

interface AlumnModalProps {
  alumn: Alumn;
  onUpdate: (updatedAlumn: Alumn) => void;
}

export default function InformationModal({ alumn, onUpdate }: AlumnModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [changes, setChanges] = useState<Partial<Alumn>>({});
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const isReadOnly = false;

  const openModalWithReset = () => {
    setChanges({});
    openModal();
  };

  const handleChange = (field: keyof Alumn, value: any) => {
    setChanges((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(changes).length === 0) {
      closeModal();
      return;
    }

    try {
      setSaving(true);
      const { data } = await axiosInstance.patch(
        `/alumns/${alumn.id}`,
        changes
      );

      // Actualiza la lista en el padre
      onUpdate(data);

      // Notificación de éxito
      showNotification(
        "success",
        "Editar Alumno",
        "Alumno actualizado correctamente"
      );
      closeModal();
    } catch (error: any) {
      console.error(
        "Error al actualizar el alumno:",
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;

      if (
        backendMessage === "Ya existe un alumno con este número de documento"
      ) {
        // Notificación específica
        showNotification("error", "Editar Alumno", backendMessage);
      } else {
        // Notificación genérica
        showNotification("error", "Editar Alumno", "Error al editar el alumno");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button
        size="sm"
        onClick={openModalWithReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
             bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
             hover:bg-gray-100 dark:hover:bg-gray-700 
             transition-colors duration-200 shadow-sm"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5zm0 3a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5zm0 9.75a5.25 5.25 0 00-4.331-2.25h8.662A5.25 5.25 0 0012 17.25z"
          />
        </svg>
        <span className="font-medium text-gray-600 dark:text-gray-300">
          Ver / Editar
        </span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[95%] lg:max-w-[700px] p-5 lg:p-8 overflow-auto"
      >
        <form onSubmit={handleSave}>
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Editar Alumno
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <Label>Nombre</Label>
              <Input
                type="text"
                value={changes.firstName ?? alumn.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Ej. Juan"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input
                type="text"
                value={changes.lastName ?? alumn.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Ej. Pérez"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                type="text"
                value={changes.phone ?? alumn.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+34 600 123 456"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={changes.email ?? alumn.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="juan.perez@email.com"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <Label>Tipo de Documento</Label>
              <select
                value={changes.documentType ?? alumn.documentType}
                onChange={(e) => handleChange("documentType", e.target.value)}
                disabled={isReadOnly}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5"
              >
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="PASAPORTE">PASAPORTE</option>
              </select>
            </div>
            <div>
              <Label>Número de Documento</Label>
              <Input
                type="text"
                value={changes.documentNumber ?? alumn.documentNumber}
                onChange={(e) => handleChange("documentNumber", e.target.value)}
                disabled={isReadOnly}
                placeholder="12345678X"
              />
            </div>
            <div>
              <Label>Fecha de Nacimiento</Label>
              <Input
                type="date"
                value={changes.birthDate ?? alumn.birthDate}
                disabled={isReadOnly}
                onChange={(e) => handleChange("birthDate", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label>Dirección</Label>
              <Input
                type="text"
                value={changes.address ?? alumn.address}
                disabled={isReadOnly}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Calle Ejemplo, 123"
              />
            </div>
            <div>
              <Label>Código Postal</Label>
              <Input
                type="text"
                value={changes.postalCode ?? alumn.postalCode}
                disabled={isReadOnly}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="28001"
              />
            </div>
            <div>
              <Label>Población</Label>
              <Input
                type="text"
                value={changes.population ?? alumn.population}
                disabled={isReadOnly}
                onChange={(e) => handleChange("population", e.target.value)}
                placeholder="Madrid"
              />
            </div>
            <div>
              <Label>Provincia</Label>
              <Input
                type="text"
                value={changes.province ?? alumn.province}
                disabled={isReadOnly}
                onChange={(e) => handleChange("province", e.target.value)}
                placeholder="Madrid"
              />
            </div>

            <div className="pt-5 col-span-2">
              <Label className="text-gray-500 underline">
                Creado:{" "}
                {new Date(alumn.createdAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "medium",
                })}
              </Label>
              <Label className="text-gray-500 underline">
                Actualizado:{" "}
                {new Date(alumn.updatedAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "medium",
                })}
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={closeModal}
              disabled={isReadOnly}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={isReadOnly || saving}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                    ></path>
                  </svg>
                  Guardando...
                </div>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
