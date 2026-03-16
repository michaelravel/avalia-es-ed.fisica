import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Professor } from "@/types/assessment";
import { ArrowLeft, Plus, Search, Users, Trash2 } from "lucide-react";

export default function UsuariosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoEmail, setNovoEmail] = useState("");
  const [novoNome, setNovoNome] = useState("");

  const { data: professores = [], isLoading } = useQuery({
    queryKey: ["professores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("professores").select("*").order("nome");
      if (error) throw error;
      return data as Professor[];
    },
  });

  const filtered = useMemo(() => {
    if (!search) return professores;
    const q = search.toLowerCase();
    return professores.filter(p => p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [professores, search]);

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("professores").insert({ email: novoEmail.trim(), nome: novoNome.trim() } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professores"] });
      setNovoEmail("");
      setNovoNome("");
      setDialogOpen(false);
      toast({ title: "Usuário cadastrado com sucesso!" });
    },
    onError: (err: any) => {
      toast({ title: err.message?.includes("unique") ? "E-mail já cadastrado" : "Erro ao cadastrar", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("professores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professores"] });
      toast({ title: "Usuário removido." });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Cadastro de Usuários</h1>
              <p className="text-xs text-muted-foreground">Professores de Educação Física</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{professores.length} usuários</span>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Novo Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cadastrar Novo Usuário</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: JOÃO DA SILVA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail institucional</Label>
                  <Input id="email" type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} placeholder="Ex: joao.silva@edu.uberabadigital.com.br" />
                </div>
                <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !novoEmail || !novoNome} className="w-full">
                  {addMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Usuários Cadastrados</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="font-medium">{p.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{p.email}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} title="Remover">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {isLoading ? "Carregando..." : "Nenhum usuário encontrado."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
