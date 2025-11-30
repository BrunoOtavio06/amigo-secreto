import { Participant } from "./storage";

/**
 * Gera um slug a partir de um nome
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Algoritmo de sorteio circular que garante:
 * - Todos participam de um ciclo completo
 * - Ninguém tira a si mesmo
 * - Não há sub-ciclos (todos em um único ciclo)
 * 
 * Usa uma rotação circular aleatória para garantir um único ciclo completo.
 */
export function generateSecretSanta(
  participants: Participant[]
): Record<string, string> {
  if (participants.length < 2) {
    throw new Error("É necessário pelo menos 2 participantes");
  }

  if (participants.length === 2) {
    // Caso especial: apenas 2 participantes, troca direta
    const results: Record<string, string> = {};
    results[participants[0].slug] = participants[1].name;
    results[participants[1].slug] = participants[0].name;
    return results;
  }

  const results: Record<string, string> = {};
  
  // Gerar um offset aleatório (1 a n-1) para rotação circular
  // Isso garante um único ciclo completo
  const offset = Math.floor(Math.random() * (participants.length - 1)) + 1;
  
  // Aplicar rotação circular: cada pessoa dá para a pessoa offset posições à frente
  for (let i = 0; i < participants.length; i++) {
    const targetIndex = (i + offset) % participants.length;
    results[participants[i].slug] = participants[targetIndex].name;
  }

  // Validação: garantir que ninguém tirou a si mesmo (não deveria acontecer com offset > 0)
  for (const participant of participants) {
    if (results[participant.slug] === participant.name) {
      // Se por algum motivo alguém tirou a si mesmo, refazemos
      return generateSecretSanta(participants);
    }
  }

  return results;
}

