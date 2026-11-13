"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { registerUnauthorizedHandler } from "@/services/api";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import type { User } from "@/types/user";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (p: LoginPayload) => Promise<User>;
  register: (p: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the *frontend* view of the session. Real authorisation is always enforced by the backend.
 * The session is restored on load via GET /api/auth/me (cookie or bearer, per the agreed contract).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus(u ? "authenticated" : "unauthenticated");
      })
      .catch(() => !cancelled && setStatus("unauthenticated"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from the API client means the session expired.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
      router.replace("/login?reason=expired");
    });
    return () => registerUnauthorizedHandler(null);
  }, [router]);

  const login = useCallback(async (p: LoginPayload) => {
    const res = await authService.login(p);
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }, []);

  const register = useCallback(async (p: RegisterPayload) => {
    const res = await authService.register(p);
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
  }, [router]);

  const updateUser = useCallback((patch: Partial<User>) => setUser((u) => (u ? { ...u, ...patch } : u)), []);

  const value = useMemo(() => ({ user, status, login, register, logout, updateUser }), [user, status, login, register, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
