import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface ContractSignedEvent {
  alumnName: string;
  amount: number;
  commercialName: string;
}

const BACKEND_URL = "https://esmera-manager-backend.onrender.com";

export function useContractEvents(
  onContractSigned: (event: ContractSignedEvent) => void
) {
  const callbackRef = useRef(onContractSigned);
  callbackRef.current = onContractSigned;

  useEffect(() => {
    const socket: Socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("contract_signed", (data: ContractSignedEvent) => {
      callbackRef.current(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
