"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import { Author } from "./types";

const DEVICE_ID_KEY = "two-souls-device-id";
const SESSION_KEY = "two-souls-session";

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "two-souls-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: Author | null;
  isPasswordSet: boolean;
}

export async function checkAuthState(): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { isAuthenticated: true, currentUser: "мео", isPasswordSet: false };
  }

  try {
    const { data: authData } = await supabase.from("app_auth").select("*").limit(1).single();
    const isPasswordSet = !!authData;

    const deviceId = getDeviceId();
    const { data: session } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    if (session) {
      await supabase
        .from("user_sessions")
        .update({ last_active: new Date().toISOString() })
        .eq("device_id", deviceId);
    }

    return {
      isAuthenticated: !!session,
      currentUser: session?.user_name as Author | null,
      isPasswordSet,
    };
  } catch {
    return { isAuthenticated: false, currentUser: null, isPasswordSet: false };
  }
}

export async function setupPassword(password: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const hash = await hashPassword(password);

    const { data: existing } = await supabase.from("app_auth").select("id").limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("app_auth").update({ password_hash: hash, updated_at: new Date().toISOString() }).eq("id", existing[0].id);
    } else {
      await supabase.from("app_auth").insert({ password_hash: hash });
    }

    return true;
  } catch (error) {
    console.error("Error setting password:", error);
    return false;
  }
}

export async function login(password: string, userName: Author): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const hash = await hashPassword(password);

    const { data: authData } = await supabase
      .from("app_auth")
      .select("password_hash")
      .limit(1)
      .single();

    if (!authData || authData.password_hash !== hash) {
      return false;
    }

    const deviceId = getDeviceId();

    await supabase
      .from("user_sessions")
      .upsert({
        device_id: deviceId,
        user_name: userName,
        last_active: new Date().toISOString(),
      }, { onConflict: "device_id" });

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: userName, time: Date.now() }));

    return true;
  } catch (error) {
    console.error("Error logging in:", error);
    return false;
  }
}

export async function logout(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const deviceId = getDeviceId();
    await supabase.from("user_sessions").delete().eq("device_id", deviceId);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Error logging out:", error);
  }
}

export async function getCurrentUser(): Promise<Author | null> {
  if (!isSupabaseConfigured()) return "мео";

  try {
    const deviceId = getDeviceId();
    const { data: session } = await supabase
      .from("user_sessions")
      .select("user_name")
      .eq("device_id", deviceId)
      .single();

    return session?.user_name as Author | null;
  } catch {
    return null;
  }
}

export async function resetPassword(newPassword: string): Promise<boolean> {
  return setupPassword(newPassword);
}
