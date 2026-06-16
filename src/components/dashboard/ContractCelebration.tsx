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
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch {
    // silencio si el navegador bloquea AudioContext
  }
}

function fireConfetti() {
  // Ráfaga central grande
  confetti({ particleCount: 200, spread: 80, origin: { x: 0.5, y: 0.4 }, gravity: 0.9 });
  // Cañones laterales
  setTimeout(() => confetti({ particleCount: 120, spread: 120, angle: 60,  origin: { x: 0, y: 0.5 } }), 180);
  setTimeout(() => confetti({ particleCount: 120, spread: 120, angle: 120, origin: { x: 1, y: 0.5 } }), 180);
  // Segunda ráfaga central
  setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { x: 0.5, y: 0.35 }, gravity: 1.1 }), 420);
  // Lluvia final
  setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.3, y: 0.3 }, ticks: 200 }), 700);
  setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.7, y: 0.3 }, ticks: 200 }), 850);
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
    fireConfetti();

    timerRef.current = setTimeout(() => dismiss(), 8000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [event]);

  function dismiss() {
    setVisible(false);
    setTimeout(onDismiss, 400);
  }

  if (!event) return null;

  return (
    <div
      className={`fixed top-32 left-1/2 z-[9999] -translate-x-1/2 transition-all duration-400 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-5 rounded-3xl border border-emerald-100 bg-white px-8 py-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] dark:border-emerald-900/40 dark:bg-gray-900 min-w-[380px] max-w-[560px]">

        {/* Icono */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-4xl">
          🎉
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mb-1">
            ¡Nuevo contrato firmado!
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white truncate leading-tight">
            {event.alumnName}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            Firmado por{" "}
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {event.commercialName}
            </span>
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 leading-none">
            {fmt(event.amount)} €
          </p>
        </div>

        {/* Cerrar */}
        <button
          onClick={dismiss}
          className="self-start shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-white/[0.06] dark:hover:text-gray-200 transition-colors"
          aria-label="Cerrar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M6.04 16.54a1 1 0 1 0 1.42 1.42L12 13.41l4.54 4.55a1 1 0 0 0 1.42-1.42L13.41 12l4.55-4.54a1 1 0 0 0-1.42-1.42L12 10.59 7.46 6.04A1 1 0 0 0 6.04 7.46L10.59 12l-4.55 4.54Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
