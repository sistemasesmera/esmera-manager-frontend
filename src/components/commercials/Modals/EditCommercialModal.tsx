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

interface Props {
  commercial: Commercial;
  onUpdate: (updated: Commercial) => void;
}

type Tab = "info" | "edit";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
      {value || <span className="italic font-normal text-gray-300 dark:text-gray-600">—</span>}
    </p>
  </div>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z" fill="currentColor" />
  </svg>
);

export default function EditCommercialModal({ commercial, onUpdate }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const { showNotification } = useNotification();

  const [tab, setTab] = useState<Tab>("info");
  const [changes, setChanges] = useState<Partial<Commercial>>({});
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [saving, setSaving] = useState(false);

  const openWithReset = () => {
    setTab("info");
    setChanges({});
    openModal();
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoadingBranches(true);
    axiosInstance.get("/branchs")
      .then(({ data }) => setBranches(data))
      .catch(() => {})
      .finally(() => setLoadingBranches(false));
  }, [isOpen]);

  const handleChange = (field: keyof Commercial, value: any) =>
    setChanges((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(changes).length === 0) { closeModal(); return; }
    try {
      setSaving(true);
      const { data } = await axiosInstance.patch(`/users/commercials/${commercial.id}`, changes);
      onUpdate(data);
      showNotification("success", "Editar Comercial", "Comercial actualizado correctamente");
      closeModal();
    } catch (error: any) {
      showNotification("error", "Editar Comercial", error.response?.data?.message ?? "Error al editar el comercial");
    } finally {
      setSaving(false);
    }
  };

  const initials = `${commercial.firstName.charAt(0)}${commercial.lastName.charAt(0)}`.toUpperCase();

  return (
    <>
      {/* Trigger: pencil icon button */}
      <button
        type="button"
        onClick={openWithReset}
        title="Editar"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} showCloseButton={false} className="max-w-[95%] lg:max-w-[560px] p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-5 lg:px-8 lg:py-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 text-white text-lg font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-0.5">Comercial</p>
                <h4 className="text-lg font-bold text-white leading-tight truncate">
                  {commercial.firstName} {commercial.lastName}
                </h4>
              </div>
            </div>
            <button type="button" onClick={closeModal} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0">
              <CloseIcon />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/15 text-white border border-white/20">
              {commercial.role === "COMMERCIAL_PLUS" ? "Comercial Plus" : "Comercial"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/15 text-white border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
              {commercial.branch.name}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900 px-6 lg:px-8">
          {(["info", "edit"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors duration-150 ${
                tab === t
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {t === "info" ? "Información" : "Editar"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6 lg:px-8">
          {tab === "info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="Nombre" value={commercial.firstName} />
              <InfoRow label="Apellido" value={commercial.lastName} />
              <InfoRow label="Email" value={commercial.email} />
              <InfoRow label="Usuario" value={`@${commercial.username}`} />
              <InfoRow label="Sede" value={commercial.branch.name} />
              <InfoRow label="Rol" value={commercial.role === "COMMERCIAL_PLUS" ? "Comercial Plus" : "Comercial"} />
              <InfoRow label="Alta" value={fmtDate(commercial.createdAt)} />
              <InfoRow label="Actualizado" value={fmtDate(commercial.updatedAt)} />
            </div>
          )}

          {tab === "edit" && (
            <form id="edit-commercial-form" onSubmit={handleSave}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input type="text" value={changes.firstName ?? commercial.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="Ej. Juan" />
                </div>
                <div>
                  <Label>Apellido</Label>
                  <Input type="text" value={changes.lastName ?? commercial.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Ej. Pérez" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={changes.email ?? commercial.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="juan@email.com" />
                </div>
                <div>
                  <Label>Usuario</Label>
                  <Input type="text" value={commercial.username} disabled />
                </div>
                <div>
                  <Label>Rol</Label>
                  <Select
                    options={[
                      { value: "COMMERCIAL", label: "Comercial" },
                      { value: "COMMERCIAL_PLUS", label: "Comercial Plus" },
                    ]}
                    defaultValue={changes.role ?? commercial.role}
                    onChange={(v) => handleChange("role", v)}
                    className="border border-gray-300 dark:border-gray-700"
                  />
                </div>
                <div>
                  <Label>Sede</Label>
                  <Select
                    options={branches.map((b) => ({ value: b.id, label: b.name }))}
                    defaultValue={changes.branchId ?? commercial.branch?.id ?? ""}
                    onChange={(v) => handleChange("branchId", v)}
                    placeholder={loadingBranches ? "Cargando..." : "Selecciona una sede"}
                    className="border border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
          {tab === "info" ? (
            <>
              <Button size="sm" variant="outline" onClick={closeModal}>Cerrar</Button>
              <Button size="sm" variant="primary" onClick={() => setTab("edit")}>Editar</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" type="button" onClick={() => setTab("info")}>Cancelar</Button>
              <Button size="sm" variant="primary" type="submit" form="edit-commercial-form" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
