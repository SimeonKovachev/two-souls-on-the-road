"use client";

import { useState, useEffect, useCallback } from "react";
import { Smartphone, Share, X } from "lucide-react";
import { Button } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "two-souls-install-dismissed";
const SESSION_SHOWN_KEY = "two-souls-install-shown-session";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const shouldShow = useCallback(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneDayMs) {
        return false;
      }
    }

    const shownThisSession = sessionStorage.getItem(SESSION_SHOWN_KEY);
    if (shownThisSession) {
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;
    if (!shouldShow()) return;

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const showTimer = setTimeout(() => {
      if (iOS && shouldShow()) {
        setShowPrompt(true);
        sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
      }
    }, 10000);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (shouldShow()) {
        setTimeout(() => {
          setShowPrompt(true);
          sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
        }, 8000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [shouldShow]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.removeItem(DISMISSED_KEY);
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 px-4 animate-fade-in-up">
      <div className="max-w-md mx-auto book-card p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-plum flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-parchment" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display text-plum text-lg mb-1">
              Install Our App
            </h3>

            {isIOS ? (
              <p className="text-midnight-soft text-sm mb-3">
                Tap <span className="inline-flex items-center px-1.5 py-0.5 bg-moonlight rounded gap-1">
                  <Share className="w-4 h-4" />
                </span> then <strong>&quot;Add to Home Screen&quot;</strong>
              </p>
            ) : (
              <p className="text-midnight-soft text-sm mb-3">
                Add to your home screen for the best experience with notifications!
              </p>
            )}

            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <Button size="sm" onClick={handleInstall}>
                  Install
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                {isIOS ? "Got it" : "Later"}
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-midnight-soft hover:text-plum transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
