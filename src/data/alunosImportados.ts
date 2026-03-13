// Parser for imported students CSV (25,710 students from the school system)
import type { Aluno } from "@/types/assessment";
import csvData from "./alunos-importados.csv?raw";

function parseCSV(csv: string): Aluno[] {
  const lines = csv.trim().split("\n");
  // Skip header: UNIDADE DE ENSINO,MATRICULA,ALUNO(A),SÉRIE
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    // Handle names with commas by joining middle parts
    const escola = parts[0]?.trim() || "";
    const matricula = parts[1]?.trim() || "";
    const serie = parts[parts.length - 1]?.trim() || "";
    // Name is everything between matricula and série
    const nome = parts.slice(2, parts.length - 1).join(",").trim();
    return {
      id_aluno: matricula,
      nome,
      escola,
      turma: serie,
      idade: 0,
      sexo: "",
    };
  }).filter(a => a.id_aluno && a.nome);
}

export const alunosImportados: Aluno[] = parseCSV(csvData);

export function getEscolasImportadas(): string[] {
  return [...new Set(alunosImportados.map(a => a.escola))].filter(Boolean).sort();
}

export function getTurmasByEscolaImportada(escola: string): string[] {
  return [...new Set(alunosImportados.filter(a => a.escola === escola).map(a => a.turma))].filter(Boolean).sort();
}

export function getAlunosByTurmaImportada(escola: string, turma: string): Aluno[] {
  return alunosImportados.filter(a => a.escola === escola && a.turma === turma);
}
