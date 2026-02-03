"use client";

import { useState, useRef } from "react";
import { downloadExport, importData, getStorageInfo } from "@/lib/storage";

interface BackupManagerProps {
  onImportSuccess?: () => void;
}

export function BackupManager({ onImportSuccess }: BackupManagerProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageInfo = getStorageInfo();

  const handleExport = async () => {
    setIsLoading(true);
    try {
      await downloadExport();
      setMessage({ type: "success", text: "Backup downloaded successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to export backup" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const result = await importData(content);
        setMessage({
          type: result.success ? "success" : "error",
          text: result.message,
        });

        if (result.success && onImportSuccess) {
          onImportSuccess();
        }
      } catch {
        setMessage({ type: "error", text: "Failed to import backup" });
      } finally {
        setIsLoading(false);
        setTimeout(() => setMessage(null), 4000);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Storage info */}
      <div className="text-center">
        <p className="text-xs text-midnight-soft">
          Storage used: <span className={storageInfo.warning ? "text-red-700 font-semibold" : ""}>{storageInfo.used}</span>
        </p>
        {storageInfo.warning && (
          <p className="text-xs text-red-700 mt-1">
            Consider exporting and removing old chapters
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {isLoading ? "..." : "📤 Export backup"}
        </button>

        <label className={`btn-secondary text-sm text-center cursor-pointer ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
          📥 Import backup
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            ref={fileInputRef}
            className="hidden"
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`text-center text-sm animate-fade-in ${
            message.type === "success" ? "text-green-700" : "text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
