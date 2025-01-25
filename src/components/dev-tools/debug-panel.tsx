"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { useState } from "react";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { logs, clearLogs } = useDebugLogs();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 right-4 w-96 max-h-[60vh] bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-semibold">Debug Logs</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white"
                onClick={clearLogs}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="p-4 max-h-[calc(60vh-4rem)]">
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      "text-sm font-mono",
                      log.type === "error" && "text-red-400",
                      log.type === "warning" && "text-yellow-400",
                      log.type === "info" && "text-white/70"
                    )}
                  >
                    <span className="opacity-50">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>{" "}
                    {log.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 bg-black/50 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bug className="w-5 h-5" />
      </Button>
    </>
  );
}
