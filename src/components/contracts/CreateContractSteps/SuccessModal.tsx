import Button from "../../ui/button/Button";
import { Modal } from "../../ui/modal";

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  onDownload: () => void;
};

function SuccessModal({ isOpen, closeModal, onDownload }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="max-w-[600px] p-5 lg:p-10 text-center"
    >
      <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
        🎉 ¡Contrato Creado con Éxito!
      </h4>
      <p className="text-gray-600 dark:text-gray-300">
        Tu contrato ha sido generado correctamente. Puedes descargarlo en PDF o
        crear un nuevo contrato.
      </p>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-3 mt-6">
        <Button size="sm" variant="primary" onClick={onDownload}>
          📄 Descargar PDF
        </Button>
        <Button size="sm" variant="outline" onClick={closeModal}>
          ➕ Crear otro contrato
        </Button>
      </div>
    </Modal>
  );
}

export default SuccessModal;
