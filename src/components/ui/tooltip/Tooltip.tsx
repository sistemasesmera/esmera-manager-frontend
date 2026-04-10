import { ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
}

export default function Tooltip({
  content,
  position = "top",
  children,
}: TooltipProps) {
  // posiciones dinámicas
  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 mb-2.5 -translate-x-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
    bottom: "top-full left-1/2 mt-2.5 -translate-x-1/2",
    left: "right-full top-1/2 mr-2 -translate-y-1/2",
  };

  const arrowClasses: Record<string, string> = {
    top: "absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45",
    right: "absolute left-[-6px] top-1/2 -translate-y-1/2 rotate-45",
    bottom: "absolute -top-1 left-1/2 -translate-x-1/2 rotate-45",
    left: "absolute -right-1 top-1/2 -translate-y-1/2 rotate-45",
  };

  return (
    <div className="relative inline-block group">
      {children}
      <div
        className={`invisible absolute ${positionClasses[position]} 
        opacity-0 transition-opacity duration-300 
        group-hover:visible group-hover:opacity-100`}
      >
        <div className="relative">
          <div className="drop-shadow-4xl whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-700 dark:bg-[#1E2634] dark:text-white">
            {content}
          </div>
          <div
            className={`h-3 w-3 bg-white dark:bg-[#1E2634] ${arrowClasses[position]}`}
          />
        </div>
      </div>
    </div>
  );
}
