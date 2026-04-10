type AlertProps = {
  message: string;
  color?: "red" | "yellow" | "blue";
};

const AlertContractMonday = ({ message, color = "red" }: AlertProps) => {
  const colorStyles = {
    red: {
      text: "text-red-700",
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-300 dark:border-red-700",
      icon: "🔴",
    },
    yellow: {
      text: "text-yellow-700",
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      border: "border-yellow-300 dark:border-yellow-700",
      icon: "⚠️",
    },
    blue: {
      text: "text-blue-700",
      bg: "bg-blue-50 dark:bg-blue-900/30",
      border: "border-blue-300 dark:border-blue-700",
      icon: "ℹ️",
    },
  }[color];

  return (
    <div
      className={`${colorStyles.bg} ${colorStyles.border} ${colorStyles.text} border-l-4 p-4 rounded-lg shadow-md flex items-start gap-3`}
    >
      <span className="text-2xl mt-1">{colorStyles.icon}</span>
      <p className="text-base font-medium leading-relaxed">{message}</p>
    </div>
  );
};

export default AlertContractMonday;
