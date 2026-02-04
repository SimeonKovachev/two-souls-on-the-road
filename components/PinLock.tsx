"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Delete, Star } from "lucide-react";

interface PinLockProps {
  children: React.ReactNode;
}

// Hash function for PIN (simple but effective for our use case)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "two-souls-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const STORAGE_KEY = "two-souls-pin-hash";
const SESSION_KEY = "two-souls-unlocked";
const LOCKOUT_KEY = "two-souls-lockout";
const ATTEMPTS_KEY = "two-souls-attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export function PinLock({ children }: PinLockProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check lockout status
  const checkLockout = useCallback(() => {
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntil) {
      const remaining = parseInt(lockoutUntil) - Date.now();
      if (remaining > 0) {
        setIsLockedOut(true);
        setLockoutRemaining(Math.ceil(remaining / 1000));
        return true;
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
    }
    setIsLockedOut(false);
    return false;
  }, []);

  useEffect(() => {
    // Check if already unlocked this session
    const sessionUnlocked = sessionStorage.getItem(SESSION_KEY);
    if (sessionUnlocked === "true") {
      setIsUnlocked(true);
      setIsLoading(false);
      return;
    }

    // Check if PIN exists
    const storedHash = localStorage.getItem(STORAGE_KEY);
    if (storedHash) {
      setHasPin(true);
      checkLockout();
    } else {
      // No PIN set - show setup
      setIsSettingPin(true);
    }

    setIsLoading(false);
  }, [checkLockout]);

  // Lockout countdown
  useEffect(() => {
    if (isLockedOut && lockoutRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutRemaining(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            localStorage.removeItem(LOCKOUT_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLockedOut, lockoutRemaining]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError("");

      // Auto-submit when 4+ digits
      if (newPin.length >= 4 && !isSettingPin) {
        // Small delay for UX
        setTimeout(() => verifyPin(newPin), 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError("");
  };

  const verifyPin = async (inputPin: string) => {
    if (checkLockout()) return;

    const storedHash = localStorage.getItem(STORAGE_KEY);
    const inputHash = await hashPin(inputPin);

    if (inputHash === storedHash) {
      // Success!
      sessionStorage.setItem(SESSION_KEY, "true");
      localStorage.removeItem(ATTEMPTS_KEY);
      setIsUnlocked(true);
    } else {
      // Failed attempt
      const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0") + 1;
      localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

      if (attempts >= MAX_ATTEMPTS) {
        // Lock out
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
        setIsLockedOut(true);
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION / 1000));
        setError("");
      } else {
        setError(`Wrong PIN. ${MAX_ATTEMPTS - attempts} attempts remaining.`);
      }
      setPin("");
    }
  };

  const setupPin = async () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    if (!confirmPin) {
      setConfirmPin(pin);
      setPin("");
      setError("");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs don't match. Try again.");
      setConfirmPin("");
      setPin("");
      return;
    }

    // Save hashed PIN
    const hash = await hashPin(pin);
    localStorage.setItem(STORAGE_KEY, hash);
    sessionStorage.setItem(SESSION_KEY, "true");
    setIsUnlocked(true);
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-parchment">
        <div className="text-center">
          <Lock className="w-12 h-12 text-plum mx-auto mb-4 animate-pulse" />
          <p className="text-midnight-soft">Loading...</p>
        </div>
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-parchment">
      <div className="text-center px-6 max-w-sm w-full">
        {/* Logo */}
        <div className="mb-8">
          <Lock className="w-14 h-14 text-plum mx-auto mb-3" />
          <h1 className="font-display text-2xl text-plum mb-1">
            Two Souls on the Road
          </h1>
          <p className="text-midnight-soft text-sm italic">
            {isSettingPin
              ? (confirmPin ? "Confirm your PIN" : "Create a PIN to protect your memories")
              : "Enter your PIN to continue"
            }
          </p>
        </div>

        {/* Lockout message */}
        {isLockedOut && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Too many failed attempts.
            </p>
            <p className="text-red-600 text-lg font-display mt-1">
              Try again in {formatLockoutTime(lockoutRemaining)}
            </p>
          </div>
        )}

        {/* PIN dots */}
        {!isLockedOut && (
          <>
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`
                    w-4 h-4 rounded-full transition-all
                    ${i < pin.length
                      ? "bg-plum scale-110"
                      : "bg-silver-light"
                    }
                  `}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm mb-4 animate-fade-in">
                {error}
              </p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  className="btn-icon w-16 h-16 text-xl font-display mx-auto"
                >
                  {num}
                </button>
              ))}
              <div /> {/* Empty space */}
              <button
                onClick={() => handlePinInput("0")}
                className="btn-icon w-16 h-16 text-xl font-display mx-auto"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="btn-icon w-16 h-16 text-lg mx-auto flex items-center justify-center"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>

            {/* Submit button for setup */}
            {isSettingPin && pin.length >= 4 && (
              <button
                onClick={setupPin}
                className="btn-primary mt-6 w-full"
              >
                {confirmPin ? "Confirm PIN" : "Set PIN"}
              </button>
            )}

            {/* Skip setup option (for demo/testing) */}
            {isSettingPin && !confirmPin && (
              <button
                onClick={() => {
                  sessionStorage.setItem(SESSION_KEY, "true");
                  setIsUnlocked(true);
                }}
                className="mt-6 text-sm text-midnight-soft hover:text-plum transition-colors"
              >
                Skip for now
              </button>
            )}
          </>
        )}

        {/* Footer */}
        <p className="mt-8 text-xs text-midnight-soft flex items-center justify-center gap-2">
          <Star className="w-3 h-3" /> Ива & Мео <Star className="w-3 h-3" />
        </p>
      </div>
    </div>
  );
}

// Hook to reset PIN (for settings page)
export function useResetPin() {
  const resetPin = () => {
    if (confirm("Are you sure you want to reset your PIN? You'll need to set a new one.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    }
  };

  return { resetPin };
}
