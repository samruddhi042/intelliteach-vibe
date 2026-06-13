import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/api";
import type { User, UserRole } from "@/types";
import { toast } from "sonner";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("access_token")
  );
  const [isLoading, setIsLoading] = useState(false);

  // On mount, revalidate token against /auth/me
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    authApi.getMe()
      .then((me) => {
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      })
      .catch(() => {
        // Token expired or invalid
        setToken(null);
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokenData = await authApi.login({ email, password });
      localStorage.setItem("access_token", tokenData.access_token);
      setToken(tokenData.access_token);

      const me = await authApi.getMe();
      setUser(me);
      localStorage.setItem("user", JSON.stringify(me));
      toast.success(`Welcome back, ${me.name}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole) => {
      setIsLoading(true);
      try {
        await authApi.register({ name, email, password, role });
        toast.success("Account created! Please log in.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        toast.error(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    toast("Logged out successfully");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
