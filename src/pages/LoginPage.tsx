import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card-surface max-w-sm w-full p-8 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <ShieldAlert className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Avaliação Diagnóstica</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Educação Física — Rede Municipal de Uberaba
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button onClick={login} disabled={isLoading} className="w-full gap-2" size="lg">
          <LogIn className="h-4 w-4" />
          {isLoading ? "Entrando..." : "Entrar com Google"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Acesso restrito a e-mails @edu.uberabadigital.com.br e @uberabadigital.com.br
        </p>
      </div>
    </div>
  );
}
