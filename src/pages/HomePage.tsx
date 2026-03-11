import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, BarChart3, FileText, LogOut, User, Users } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      to: "/aplicar",
      icon: ClipboardList,
      title: "Aplicar Avaliação",
      description: "Selecione escola, turma e inicie a avaliação diagnóstica",
    },
    {
      to: "/resultados",
      icon: FileText,
      title: "Ver Resultados",
      description: "Consulte resultados individuais dos alunos",
    },
    {
      to: "/dashboard",
      icon: BarChart3,
      title: "Dashboard",
      description: "Análise de desempenho por turma e escola",
    },
    {
      to: "/usuarios",
      icon: Users,
      title: "Cadastro de Usuários",
      description: "Gerencie os professores cadastrados no sistema",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Avaliação Diagnóstica</h1>
            <p className="text-xs text-muted-foreground">Educação Física</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.nome}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Olá, {user?.nome?.split(" ")[0]}</h2>
          <p className="text-muted-foreground">O que deseja fazer?</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} className="group">
              <div className="card-surface p-6 transition-all hover:shadow-md hover:border-primary/30 h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <item.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
