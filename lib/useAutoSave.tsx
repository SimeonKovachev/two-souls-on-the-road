"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * SMART AUTO-SAVE STRATEGY:
 *
 * 1. Save to localStorage INSTANTLY (free, unlimited, no network)
 * 2. Show "Saved locally" indicator immediately
 * 3. Only sync to cloud (Supabase) when:
 *    - User clicks "Sync to cloud" button
 *    - User is about to leave the page (beforeunload)
 *    - User seals the chapter
 *
 * This minimizes Supabase requests while ensuring NO data is ever lost!
 */

interface UseLocalAutoSaveOptions {
  key: string; // localStorage key
  delay?: number; // Debounce delay in ms (default 500ms - faster since it's local)
}

// Save to localStorage with debounce
export function useLocalAutoSave({ key, delay = 500 }: UseLocalAutoSaveOptions) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const save = useCallback((value: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus("saving");

    // Debounce the save (much shorter since it's local)
    timeoutRef.current = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(key, value);
        }
        if (isMountedRef.current) {
          setStatus("saved");
          // Reset status after 1.5 seconds
          setTimeout(() => {
            if (isMountedRef.current) {
              setStatus("idle");
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Local save failed:", error);
        if (isMountedRef.current) {
          setStatus("idle");
        }
      }
    }, delay);
  }, [key, delay]);

  const load = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }, [key]);

  return { status, save, load, clear };
}

// Hook for syncing local changes to cloud (Supabase)
export function useCloudSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const sync = useCallback(async (syncFn: () => Promise<void>) => {
    setIsSyncing(true);
    try {
      await syncFn();
      setLastSynced(new Date());
    } catch (error) {
      console.error("Cloud sync failed:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isSyncing, lastSynced, sync };
}

// Original useAutoSave - kept for backwards compatibility but with longer delay
interface UseAutoSaveOptions {
  delay?: number;
  onSave: () => Promise<void> | void;
}

export function useAutoSave({ delay = 3000, onSave }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus("saving");

    // Longer delay (3 seconds) to batch multiple changes
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave();
        if (isMountedRef.current) {
          setStatus("saved");
          setTimeout(() => {
            if (isMountedRef.current) {
              setStatus("idle");
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        if (isMountedRef.current) {
          setStatus("idle");
        }
      }
    }, delay);
  }, [delay, onSave]);

  return { status, triggerSave };
}

// Auto-save indicator component
export function AutoSaveIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  if (status === "idle") return null;

  return (
    <span className={`auto-save-indicator ${status}`}>
      {status === "saving" && (
        <>
          <span className="animate-pulse">●</span>
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <span>✓</span>
          <span>Saved</span>
        </>
      )}
    </span>
  );
}

// Cloud sync indicator
export function CloudSyncIndicator({
  isSyncing,
  lastSynced,
  onSync
}: {
  isSyncing: boolean;
  lastSynced: Date | null;
  onSync: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="px-2 py-1 rounded bg-lavender/20 text-plum hover:bg-lavender/40 transition-colors disabled:opacity-50"
      >
        {isSyncing ? "Syncing..." : "☁️ Sync to cloud"}
      </button>
      {lastSynced && (
        <span className="text-midnight-soft">
          Last synced: {lastSynced.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
