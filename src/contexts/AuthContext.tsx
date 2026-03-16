import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserProfile } from "@/types/assessment";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string) => Promise<boolean>;
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

  const loginWithEmail = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data: professor, error: dbError } = await supabase
        .from("professores")
        .select("*")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!professor) {
        setError("E-mail não encontrado. Verifique se o e-mail está cadastrado no sistema.");
        setIsLoading(false);
        return false;
      }

      const profile: UserProfile = {
        email: professor.email,
        nome: professor.nome,
        isAuthenticated: true,
        isAdmin: professor.is_admin || false,
      };

      localStorage.setItem("avdiag_user", JSON.stringify(profile));
      setUser(profile);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
      setIsLoading(false);
      return false;
    }
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
