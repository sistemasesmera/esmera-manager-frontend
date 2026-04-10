import { useState, useEffect } from "react";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";
import Select from "../../form/Select";
import { Commercial } from "../../../pages/Commercials/Commercials";
import Tooltip from "../../ui/tooltip/Tooltip";

interface EditModalProps {
  commercial: Commercial;
  onUpdate: (updatedCommercial: Commercial) => void;
}

export default function EditCommercialModal({
  commercial,
  onUpdate,
}: EditModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [changes, setChanges] = useState<Partial<Commercial>>({});
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [saving, setSaving] = useState(false);

  const openModalWithReset = () => {
    setChanges({});
    openModal();
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const { data } = await axiosInstance.get("/branchs");
        setBranches(data);
      } catch (error) {
        console.error("Error al cargar sedes:", error);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [isOpen]);

  const handleChange = (field: keyof Commercial, value: any) => {
    setChanges((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(changes).length === 0) {
      closeModal();
      return;
    }

    try {
      setSaving(true); // Empieza el loader

      const { data } = await axiosInstance.patch(
        `/users/commercials/${commercial.id}`,
        changes
      );

      onUpdate(data);

      showNotification(
        "success",
        "Editar Comercial",
        "Comercial actualizado correctamente"
      );

      closeModal();
    } catch (error: any) {
      console.error(
        "Error al actualizar comercial:",
        error.response?.data || error.message
      );

      const backendMessage = error.response?.data?.message;

      showNotification(
        "error",
        "Editar Comercial",
        backendMessage || "Error al editar el comercial"
      );
    } finally {
      setSaving(false); // Termina el loader
    }
  };

  return (
    <div>
      {/* Botón de abrir modal */}
      <Tooltip content="Editar" position="top">
        <div
          onClick={openModalWithReset}
          className="flex items-center gap-2 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"></path>
          </svg>
        </div>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[95%] lg:max-w-[700px] p-5 lg:p-8 overflow-auto"
      >
        <form onSubmit={handleSave}>
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
            Editar Comercial
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <Label>Nombre</Label>
              <Input
                type="text"
                value={changes.firstName ?? commercial.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Ej. Juan"
              />
            </div>

            <div>
              <Label>Apellido</Label>
              <Input
                type="text"
                value={changes.lastName ?? commercial.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Ej. Pérez"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={changes.email ?? commercial.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="juan.perez@email.com"
              />
            </div>

            <div>
              <Label>Nombre de usuario</Label>
              <Input
                type="text"
                value={changes.username ?? commercial.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="nicolasgarcia"
                disabled
              />
            </div>

            <div>
              <Label>Rol</Label>
              <select
                value={changes.role ?? commercial.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5"
              >
                <option value="COMMERCIAL">Comercial</option>
                <option value="COMMERCIAL_PLUS">Comercial Plus</option>
              </select>
            </div>

            <div>
              <Label>Sede</Label>
              <Select
                options={branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                }))}
                defaultValue={changes.branchId ?? commercial.branch?.id ?? ""}
                onChange={(e) => handleChange("branchId", e)}
                placeholder={
                  loadingBranches ? "Cargando sedes..." : "Selecciona una sede"
                }
                className="dark:bg-dark-900 border"
              />
            </div>

            <div className="pt-5 col-span-2">
              <Label className="text-gray-500 underline">
                Creado:{" "}
                {new Date(commercial.createdAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "medium",
                })}
              </Label>
              <Label className="text-gray-500 underline">
                Actualizado:{" "}
                {new Date(commercial.updatedAt).toLocaleString("es-ES", {
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
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={saving}>
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
