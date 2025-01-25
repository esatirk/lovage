"use client";

import { useDebugLogs } from "@/hooks/use-debug-logs";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { useState } from "react";

export function DebugPanel() {
  const { logs, clearLogs } = useDebugLogs();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "bg-black/30 backdrop-blur-xl border border-white/10",
          "text-white/70 hover:text-white transition-colors",
          "shadow-lg hover:shadow-xl transition-shadow"
        )}
      >
        <Terminal className="w-4 h-4" />
        <span className="text-sm font-medium">Debug Logs</span>
      </button>

      {/* Logs Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bottom-full right-0 mb-2 w-[500px] max-h-[500px]",
              "bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg",
              "flex flex-col overflow-hidden shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-medium">Debug Logs</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearLogs}
                  className="text-xs text-white/50 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono">
              {logs.length === 0 ? (
                <div className="text-sm text-white/50 text-center py-4">
                  No logs yet
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-sm",
                      log.type === "error" && "text-red-400",
                      log.type === "warning" && "text-yellow-400",
                      log.type === "info" && "text-white/70"
                    )}
                  >
                    <span className="opacity-50">
                      [
                      {log.timestamp.toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        fractionalSecondDigits: 3,
                      })}
                      ]
                    </span>{" "}
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
