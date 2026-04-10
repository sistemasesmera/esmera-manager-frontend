import { useState, useEffect } from "react";
import { LogoMonday } from "../icons";

const LeadInfoPanel = ({ item }: { item: any }) => {
  const lead = item.item;
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada al montar el componente
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  if (!lead) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <>
      {/* Panel completo */}
      <div
        className={`fixed top-36 right-0 w-80 bg-white dark:bg-gray-800 shadow-xl p-5 space-y-3 rounded-l-lg z-50 transform transition-transform duration-500 ease-in-out
        ${isVisible ? "translate-x-0" : "translate-x-full"}
        ${isMinimized ? "hidden" : "block"}
      `}
      >
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            Lead de Monday
          </h2>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition text-xl"
            title="Minimizar panel"
          >
            ✕
          </button>
        </div>

        <div className="border-t pt-3 space-y-2 text-gray-700 dark:text-gray-300">
          <p>
            <span className="font-semibold">Nombre:</span> {lead.name}
          </p>
          <p>
            <span className="font-semibold">ID Item:</span> {lead.id}
          </p>
          <p>
            <span className="font-semibold">Fecha de Creación:</span>{" "}
            {formatDate(lead.created_at)}
          </p>
          <p>
            <span className="font-semibold">Última Actualización:</span>{" "}
            {formatDate(lead.updated_at)}
          </p>
          <p>
            <span className="font-semibold">Tablero:</span>{" "}
            {lead.board?.name || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Tablero ID:</span>{" "}
            {lead.board?.id || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-xs">Columna Estado ID:</span>{" "}
            {item.statusColumnId || "N/A"}
          </p>
        </div>
      </div>

      {/* Botón flotante para restaurar panel */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="
          fixed top-28 md:top-44 right-4
          w-12 h-12 rounded-full shadow-lg
          flex items-center justify-center
          bg-white text-gray-700
          dark:bg-gray-800 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-300
          z-50
        "
          title="Mostrar Lead"
        >
          <LogoMonday className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default LeadInfoPanel;
