import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ShieldAlert, Mail } from "lucide-react";

export default function LoginPage() {
  const { loginWithEmail, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await loginWithEmail(email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="card-surface max-w-md w-full p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <ShieldAlert className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Avaliação Diagnóstica</h1>
          <p className="text-sm text-muted-foreground">
            Educação Física — Rede Municipal de Uberaba
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail institucional
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu.nome@edu.uberabadigital.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoFocus
                autoComplete="email"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full gap-2"
            size="lg"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          Acesso restrito aos professores cadastrados na rede municipal.
        </p>
      </div>
    </div>
  );
}
