import { useState } from "react";
import { Modal } from "../../ui/modal";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import Select from "../../form/Select";
import Input from "../../form/input/InputField";
import {
  LeadDiscardReason,
  LEAD_DISCARD_REASON_LABELS,
} from "../../../types/frontend/lead";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    discardReason: LeadDiscardReason,
    discardReasonOther?: string
  ) => void;
}

const discardReasonOptions = Object.values(LeadDiscardReason).map(
  (value) => ({
    value,
    label: LEAD_DISCARD_REASON_LABELS[value],
  })
);

export default function DiscardReasonModal({
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  const [discardReason, setDiscardReason] = useState<LeadDiscardReason | "">(
    ""
  );
  const [discardReasonOther, setDiscardReasonOther] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!discardReason) {
      setError("Selecciona un motivo de descarte");
      return;
    }
    onConfirm(discardReason, discardReasonOther || undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[95%] lg:max-w-[500px] p-5 lg:p-8"
    >
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        Descartar lead
      </h4>

      <div className="space-y-3">
        <div>
          <Label>Motivo de descarte</Label>
          <Select
            options={discardReasonOptions}
            defaultValue={discardReason}
            onChange={(value) => {
              setDiscardReason(value as LeadDiscardReason);
              setError("");
            }}
            placeholder="Selecciona un motivo"
            className="dark:bg-dark-900 border border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        {discardReason === LeadDiscardReason.OTRO && (
          <div>
            <Label>Detalle del motivo</Label>
            <Input
              type="text"
              value={discardReasonOther}
              onChange={(e) => setDiscardReasonOther(e.target.value)}
              placeholder="Especifica el motivo"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <Button size="sm" variant="outline" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleConfirm}
          type="button"
        >
          Descartar
        </Button>
      </div>
    </Modal>
  );
}
