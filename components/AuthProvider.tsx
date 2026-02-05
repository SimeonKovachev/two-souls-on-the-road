"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Author } from "@/lib/types";
import { checkAuthState, login, logout, setupPassword, AuthState } from "@/lib/auth";
import { notificationChecker } from "@/lib/notifications";
import { Button, Lock, Flower2, Moon, Eye, EyeOff } from "./ui";

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: Author | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState().then((state) => {
      setAuthState(state);
      setIsLoading(false);
    });
  }, []);

  // Start notification checker when authenticated
  useEffect(() => {
    if (authState?.isAuthenticated && authState.currentUser) {
      notificationChecker.init().then((initialized) => {
        if (initialized) {
          notificationChecker.startChecking(authState.currentUser!, 60000); // Check every minute
        }
      });
    }

    return () => {
      notificationChecker.stopChecking();
    };
  }, [authState?.isAuthenticated, authState?.currentUser]);

  const handleLogin = async (password: string, user: Author) => {
    const success = await login(password, user);
    if (success) {
      setAuthState({ isAuthenticated: true, currentUser: user, isPasswordSet: true });
    }
    return success;
  };

  const handleSetup = async (password: string, user: Author) => {
    const success = await setupPassword(password);
    if (success) {
      await login(password, user);
      setAuthState({ isAuthenticated: true, currentUser: user, isPasswordSet: true });
    }
    return success;
  };

  const handleLogout = async () => {
    await logout();
    setAuthState((prev) => prev ? { ...prev, isAuthenticated: false, currentUser: null } : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-midnight-soft">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authState?.isAuthenticated) {
    return (
      <LoginScreen
        isPasswordSet={authState?.isPasswordSet ?? false}
        onLogin={handleLogin}
        onSetup={handleSetup}
      />
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: true,
        currentUser: authState.currentUser,
        isLoading: false,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

interface LoginScreenProps {
  isPasswordSet: boolean;
  onLogin: (password: string, user: Author) => Promise<boolean>;
  onSetup: (password: string, user: Author) => Promise<boolean>;
}

function LoginScreen({ isPasswordSet, onLogin, onSetup }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<Author | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !password) return;

    setError("");
    setIsSubmitting(true);

    if (!isPasswordSet) {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsSubmitting(false);
        return;
      }
      const success = await onSetup(password, selectedUser);
      if (!success) setError("Failed to setup password");
    } else {
      const success = await onLogin(password, selectedUser);
      if (!success) setError("Wrong password");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment p-4">
      <div className="book-card p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-plum" />
          </div>
          <h1 className="font-display text-2xl text-plum mb-2">Two Souls on the Road</h1>
          <p className="text-sm text-midnight-soft">
            {isPasswordSet ? "Welcome back" : "Set up your journal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-midnight-soft mb-3 text-center">Who are you?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedUser("ива")}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedUser === "ива"
                    ? "border-lavender bg-lavender/20"
                    : "border-silver-light hover:border-lavender/50"
                }`}
              >
                <Flower2 className="w-8 h-8 text-pink-400" />
                <span className="font-medium text-midnight">Ива</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser("мео")}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  selectedUser === "мео"
                    ? "border-lavender bg-lavender/20"
                    : "border-silver-light hover:border-lavender/50"
                }`}
              >
                <Moon className="w-8 h-8 text-indigo-400" />
                <span className="font-medium text-midnight">Мео</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-midnight-soft mb-2 block">
              {isPasswordSet ? "Password" : "Create password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field w-full pr-10"
                autoComplete={isPasswordSet ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight-soft hover:text-midnight"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isPasswordSet && (
            <div>
              <label className="text-sm text-midnight-soft mb-2 block">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="input-field w-full"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={!selectedUser || !password || isSubmitting}
            loading={isSubmitting}
          >
            {isPasswordSet ? "Enter" : "Create Journal"}
          </Button>
        </form>
      </div>
    </div>
  );
}
