"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/50 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Dark Mode</Label>
              <p className="text-sm text-white/60">
                Toggle between light and dark theme
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-white/60" />
              <Switch />
              <Moon className="w-4 h-4 text-white/60" />
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Volume</Label>
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-white/60" />
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="w-[120px]"
                />
                <Volume2 className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>

          {/* Autoplay */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Autoplay Next Episode</Label>
              <p className="text-sm text-white/60">
                Automatically play the next episode
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Video Quality */}
          <div className="space-y-4">
            <Label>Video Quality</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/10 hover:bg-white/20"
              >
                Auto
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/10 hover:bg-white/20"
              >
                1080p
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/10 hover:bg-white/20"
              >
                720p
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
