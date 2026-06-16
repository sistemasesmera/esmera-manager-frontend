import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { ContractSignedEvent } from "../../hooks/useContractEvents";

interface Props {
  event: ContractSignedEvent | null;
  onDismiss: () => void;
}

function playCelebrationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch {
    // No interrumpir si el navegador bloquea AudioContext
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { minimumFractionDigits: 0 }).format(n);

export default function ContractCelebration({ event, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!event) return;

    setVisible(true);
    playCelebrationSound();

    // Salva de confeti en tres ráfagas
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.45 } });
    setTimeout(
      () => confetti({ particleCount: 60, spread: 100, origin: { x: 0.15, y: 0.5 } }),
      200
    );
    setTimeout(
      () => confetti({ particleCount: 60, spread: 100, origin: { x: 0.85, y: 0.5 } }),
      380
    );

    timerRef.current = setTimeout(() => dismiss(), 7000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [event]);

  function dismiss() {
    setVisible(false);
    setTimeout(onDismiss, 350);
  }

  if (!event) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 z-[9999] -translate-x-1/2 transition-all duration-350 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-2xl dark:border-white/10 dark:bg-gray-900 min-w-[300px] max-w-[460px]">
        {/* Icono */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-900/30">
          🎉
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            ¡Nuevo contrato!
          </p>
          <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-white/90 truncate">
            {event.alumnName}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            Firmado por{" "}
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {event.commercialName}
            </span>
          </p>
          <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">
            {fmt(event.amount)} €
          </p>
        </div>

        {/* Cerrar */}
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/[0.06] dark:hover:text-gray-200 transition-colors"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04 16.54a1 1 0 1 0 1.42 1.42L12 13.41l4.54 4.55a1 1 0 0 0 1.42-1.42L13.41 12l4.55-4.54a1 1 0 0 0-1.42-1.42L12 10.59 7.46 6.04A1 1 0 0 0 6.04 7.46L10.59 12l-4.55 4.54Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
