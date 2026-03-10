import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserProfile } from "@/types/assessment";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAINS = ["edu.uberabadigital.com.br", "uberabadigital.com.br"];

function isAllowedDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.some(d => domain === d);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("avdiag_user");
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(() => {
    // In production, this triggers Google OAuth.
    // For demo, we simulate with a prompt.
    setIsLoading(true);
    setError(null);

    // Simulate Google OAuth - in production replace with actual gapi flow
    const email = window.prompt("Digite seu e-mail institucional para login:");
    if (!email) {
      setIsLoading(false);
      return;
    }

    if (!isAllowedDomain(email)) {
      setError("Acesso restrito à rede educacional.");
      setIsLoading(false);
      return;
    }

    const profile: UserProfile = {
      email,
      nome: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      isAuthenticated: true,
    };
    
    localStorage.setItem("avdiag_user", JSON.stringify(profile));
    setUser(profile);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("avdiag_user");
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
