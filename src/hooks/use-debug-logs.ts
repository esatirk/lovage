import { create } from "zustand";

interface LogEntry {
  timestamp: Date;
  message: string;
  type: "info" | "error" | "warning";
}

interface DebugStore {
  logs: LogEntry[];
  addLog: (message: string, type?: LogEntry["type"]) => void;
  clearLogs: () => void;
}

const useDebugStore = create<DebugStore>((set) => ({
  logs: [],
  addLog: (message, type = "info") =>
    set((state) => ({
      logs: [...state.logs, { timestamp: new Date(), message, type }],
    })),
  clearLogs: () => set({ logs: [] }),
}));

export function useDebugLogs() {
  const { logs, addLog, clearLogs } = useDebugStore();
  return { logs, addLog, clearLogs };
}
