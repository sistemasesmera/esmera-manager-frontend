import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import Alumn from "../../../types/frontend/alumn-temp";
import axiosInstance from "../../../axios/axiosConfig";
import { useNotification } from "../../../context/NotificationContext";

interface AlumnModalProps {
  alumn: Alumn;
  onUpdate: (updatedAlumn: Alumn) => void;
}

type Tab = "info" | "edit";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-white text-xl font-bold shrink-0 border-2 border-white/30">
      {letters}
    </div>
  );
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value || <span className="text-gray-300 dark:text-gray-600 italic font-normal">—</span>}
    </p>
  </div>
);

const Divider = () => (
  <div className="col-span-full border-t border-gray-100 dark:border-white/[0.06]" />
);

export default function InformationModal({ alumn, onUpdate }: AlumnModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [tab, setTab] = useState<Tab>("info");
  const [changes, setChanges] = useState<Partial<Alumn>>({});
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const openModalWithReset = () => {
    setChanges({});
    setTab("info");
    openModal();
  };

  const handleChange = (field: keyof Alumn, value: string) => {
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
      const { data } = await axiosInstance.patch(`/alumns/${alumn.id}`, changes);
      onUpdate(data);
      showNotification("success", "Editar Alumno", "Alumno actualizado correctamente");
      closeModal();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      showNotification(
        "error",
        "Editar Alumno",
        msg === "Ya existe un alumno con este número de documento"
          ? msg
          : "Error al editar el alumno"
      );
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("es-ES") : null;

  const fullAddress = [
    alumn.address,
    alumn.postalCode,
    alumn.population,
    alumn.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <Button size="sm" variant="outline" onClick={openModalWithReset}>
        Ver / Editar
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-[95%] lg:max-w-[700px] p-0 overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-5 lg:px-8 lg:py-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Initials name={`${alumn.firstName} ${alumn.lastName}`} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-0.5">
                  Alumno
                </p>
                <h4 className="text-lg font-bold text-white truncate">
                  {alumn.firstName} {alumn.lastName}
                </h4>
                <p className="text-sm text-slate-300 truncate">{alumn.email}</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Badges de estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                alumn.isVerified
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                  : "bg-red-500/20 text-red-200 border border-red-400/30"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${alumn.isVerified ? "bg-emerald-400" : "bg-red-400"}`} />
              {alumn.isVerified ? "Verificado" : "Sin verificar"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/10 text-slate-200 border border-white/20">
              {alumn.documentType} · {alumn.documentNumber}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/10 text-slate-200 border border-white/20">
              {alumn.phone}
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900 px-6 lg:px-8">
          {(["info", "edit"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors duration-150 ${
                tab === t
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {t === "info" ? "Información" : "Editar datos"}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6 lg:px-8 max-h-[55vh] overflow-y-auto">

          {/* TAB: Información */}
          {tab === "info" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <InfoRow label="Nombre" value={alumn.firstName} />
              <InfoRow label="Apellido" value={alumn.lastName} />
              <InfoRow label="Teléfono" value={alumn.phone} />
              <Divider />
              <InfoRow label="Email" value={alumn.email} />
              <InfoRow label="Fecha de nacimiento" value={fmtDate(alumn.birthDate)} />
              <InfoRow label="Código" value={alumn.code} />
              <Divider />
              <InfoRow label="Tipo de documento" value={alumn.documentType} />
              <InfoRow label="Número de documento" value={alumn.documentNumber} />
              <div />
              <Divider />
              <div className="col-span-full">
                <InfoRow label="Dirección completa" value={fullAddress || undefined} />
              </div>
              <Divider />
              <InfoRow
                label="Alta en el sistema"
                value={new Date(alumn.createdAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              />
              <InfoRow
                label="Última actualización"
                value={new Date(alumn.updatedAt).toLocaleString("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              />
            </div>
          )}

          {/* TAB: Editar */}
          {tab === "edit" && (
            <form id="alumn-edit-form" onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    value={changes.firstName ?? alumn.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <Label>Apellido</Label>
                  <Input
                    type="text"
                    value={changes.lastName ?? alumn.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Pérez"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    type="text"
                    value={changes.phone ?? alumn.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={changes.email ?? alumn.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <Label>Tipo de documento</Label>
                  <select
                    value={changes.documentType ?? alumn.documentType}
                    onChange={(e) => handleChange("documentType", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  >
                    <option value="DNI">DNI</option>
                    <option value="NIE">NIE</option>
                    <option value="PASAPORTE">PASAPORTE</option>
                  </select>
                </div>
                <div>
                  <Label>Número de documento</Label>
                  <Input
                    type="text"
                    value={changes.documentNumber ?? alumn.documentNumber}
                    onChange={(e) => handleChange("documentNumber", e.target.value)}
                    placeholder="12345678X"
                  />
                </div>
                <div>
                  <Label>Fecha de nacimiento</Label>
                  <Input
                    type="date"
                    value={changes.birthDate ?? alumn.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </div>
                <div className="col-span-full">
                  <Label>Dirección</Label>
                  <Input
                    type="text"
                    value={changes.address ?? alumn.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Calle Ejemplo, 123"
                  />
                </div>
                <div>
                  <Label>Código postal</Label>
                  <Input
                    type="text"
                    value={changes.postalCode ?? alumn.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    placeholder="28001"
                  />
                </div>
                <div>
                  <Label>Población</Label>
                  <Input
                    type="text"
                    value={changes.population ?? alumn.population}
                    onChange={(e) => handleChange("population", e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input
                    type="text"
                    value={changes.province ?? alumn.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    placeholder="Madrid"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              closeModal();
              navigate(`/alumns/${alumn.id}`);
            }}
            className="text-sm text-brand-500 hover:underline dark:text-brand-400 font-medium"
          >
            Ver ficha completa →
          </button>

          <div className="flex items-center gap-2">
            {tab === "info" ? (
              <>
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Cerrar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    closeModal();
                    navigate("/contract-create", { state: { alumn } });
                  }}
                >
                  Nuevo contrato
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setTab("info")}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  form="alumn-edit-form"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
