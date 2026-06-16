import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";
import { FolderIcon, DownloadIcon } from "../../../icons";
import Contract from "../../../types/backend/backendContract";
import generateContractPDF from "../../../utils/generateContractPDF";

interface ContractModalProps {
  contract: Contract;
}

type Tab = "contrato" | "alumno" | "avalista" | "curso";

const Field = ({
  label,
  value,
  accent,
}: {
  label: string;
  value?: string | number | null;
  accent?: boolean;
}) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
      {label}
    </p>
    <p
      className={`text-sm font-medium ${
        accent
          ? "text-emerald-600 dark:text-emerald-400 text-base font-semibold"
          : "text-gray-800 dark:text-white/90"
      }`}
    >
      {value ?? <span className="text-gray-300 dark:text-gray-600 font-normal italic">—</span>}
    </p>
  </div>
);

const Divider = () => (
  <div className="col-span-full border-t border-gray-100 dark:border-white/[0.06]" />
);

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-base font-bold shrink-0">
      {letters}
    </div>
  );
}

export default function ContractModal({ contract }: ContractModalProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [tab, setTab] = useState<Tab>("contrato");
  const { alumn, course } = contract;

  const tabs: { id: Tab; label: string }[] = [
    { id: "contrato", label: "Contrato" },
    { id: "alumno", label: "Alumno" },
    ...(contract.hasGuarantor ? [{ id: "avalista" as Tab, label: "Avalista" }] : []),
    { id: "curso", label: "Curso" },
  ];

  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("es-ES") : null;

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat("es-ES").format(n) + " €";

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        startIcon={<FolderIcon className="size-4" />}
        onClick={() => { setTab("contrato"); openModal(); }}
      >
        Detalles
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-[95%] lg:max-w-[860px] p-0 overflow-hidden"
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-5 lg:px-8 lg:py-6">
          {/* Fila superior: precio + X */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-2xl font-bold text-white">
                {fmtPrice(contract.coursePrice)}
              </p>
              {!contract.hasGuarantor && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                  <svg className="w-3 h-3 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  Sin avalista
                </span>
              )}
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
          {/* Fila inferior: nombre + alumno + fecha */}
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-200 mb-0.5">
                Contrato
              </p>
              <h4 className="text-lg font-bold text-white truncate">
                {contract.name}
              </h4>
              <p className="text-sm text-brand-100 mt-0.5">
                {alumn.firstName} {alumn.lastName}
                {contract.branch?.name ? ` · ${contract.branch.name}` : ""}
              </p>
            </div>
            <p className="text-xs text-brand-200 shrink-0">
              {fmtDate(contract.contractDate)}
            </p>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-gray-900 px-6 lg:px-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors duration-150 ${
                tab === t.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="bg-gray-50 dark:bg-gray-950 px-6 py-6 lg:px-8 lg:py-7 max-h-[60vh] overflow-y-auto">

          {/* TAB: Contrato */}
          {tab === "contrato" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <Field label="Precio del curso" value={fmtPrice(contract.coursePrice)} accent />
              <Field label="Acuerdo de pago" value={contract.paymentAgreement} />
              <Field label="Fecha del contrato" value={fmtDate(contract.contractDate)} />
              <Divider />
              <Field label="Inicio del curso" value={fmtDate(contract.courseStartDate)} />
              <Field label="Fin del curso" value={fmtDate(contract.courseEndDate)} />
              <Field label="Horario de clases" value={contract.classSchedule} />
              <Divider />
              <Field label="Talla de uniforme" value={contract.uniformSize} />
              <Field label="Últimos estudios" value={contract.latestStudies} />
              <Field label="Curso adicional" value={contract.additionalCourse} />
              <Divider />
              {contract.missingDocumentation && (
                <div className="col-span-full">
                  <Field label="Documentación pendiente" value={contract.missingDocumentation} />
                </div>
              )}
              {contract.observations && (
                <div className="col-span-full">
                  <Field label="Observaciones" value={contract.observations} />
                </div>
              )}
            </div>
          )}

          {/* TAB: Alumno */}
          {tab === "alumno" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.06]">
                <Initials name={`${alumn.firstName} ${alumn.lastName}`} />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white/90">
                    {alumn.firstName} {alumn.lastName}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      alumn.isVerified
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        alumn.isVerified ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    {alumn.isVerified ? "Verificado" : "No verificado"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <Field label="Email" value={alumn.email} />
                <Field label="Teléfono" value={alumn.phone} />
                <Field label="Fecha de nacimiento" value={fmtDate(alumn.birthDate)} />
                <Divider />
                <Field label="Tipo de documento" value={alumn.documentType} />
                <Field label="Número de documento" value={alumn.documentNumber} />
                <div />
                <Divider />
                <div className="col-span-full">
                  <Field
                    label="Dirección"
                    value={[alumn.address, alumn.postalCode, alumn.population, alumn.province]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Avalista */}
          {tab === "avalista" && contract.hasGuarantor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.06]">
                <Initials
                  name={`${contract.guarantorFirstName ?? ""} ${contract.guarantorLastName ?? ""}`}
                />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white/90">
                    {contract.guarantorFirstName} {contract.guarantorLastName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Avalista del contrato</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                <Field label="Email" value={contract.guarantorEmail} />
                <Field label="Teléfono" value={contract.guarantorPhone} />
                <Field label="Fecha de nacimiento" value={fmtDate(contract.guarantorBirthDate)} />
                <Divider />
                <Field label="Tipo de documento" value={contract.guarantorDocumentType} />
                <Field label="Número de documento" value={contract.guarantorDocumentNumber} />
                <div />
                <Divider />
                <div className="col-span-full">
                  <Field
                    label="Dirección"
                    value={[
                      contract.guarantorAddress,
                      contract.guarantorPostalCode,
                      contract.guarantorPopulation,
                      contract.guarantorProvince,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Curso */}
          {tab === "curso" && (
            <div className="p-4 bg-white dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">Curso contratado</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{course.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-2 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                <Field label="Precio acordado" value={fmtPrice(contract.coursePrice)} accent />
                <Field label="Horario" value={contract.classSchedule} />
                <Field label="Inicio" value={fmtDate(contract.courseStartDate)} />
                <Field label="Fin" value={fmtDate(contract.courseEndDate)} />
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/[0.06]">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Creado el {fmtDate(contract.contractDate)}
            {contract.user ? ` · ${contract.user.firstName} ${contract.user.lastName}` : ""}
          </p>
          <Button
            size="sm"
            variant="primary"
            startIcon={<DownloadIcon className="size-4" />}
            onClick={() => generateContractPDF(contract)}
          >
            Descargar PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
}
