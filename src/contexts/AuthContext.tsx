import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserProfile } from "@/types/assessment";
import { mockProfessores } from "@/data/mockProfessores";

const ADMIN_EMAIL = "michael.ravel@edu.uberabadigital.com.br";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string) => boolean;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const loginWithEmail = useCallback((email: string): boolean => {
    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const professor = mockProfessores.find(
      (p) => p.email.toLowerCase() === normalizedEmail
    );

    if (!professor) {
      setError("E-mail não encontrado. Verifique se o e-mail está cadastrado no sistema.");
      setIsLoading(false);
      return false;
    }

    const profile: UserProfile = {
      email: professor.email,
      nome: professor.nome,
      isAuthenticated: true,
      isAdmin: normalizedEmail === ADMIN_EMAIL,
    };

    localStorage.setItem("avdiag_user", JSON.stringify(profile));
    setUser(profile);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("avdiag_user");
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithEmail, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
