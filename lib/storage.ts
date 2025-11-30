export interface Participant {
  name: string;
  phone: string;
  slug: string;
}

export interface SecretSantaData {
  participants: Participant[];
  results: Record<string, string>; // slug -> secret santa name
  drawDate: number;
}

const STORAGE_KEY = "amigo-secreto-data";

export function saveSecretSantaData(data: SecretSantaData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function getSecretSantaData(): SecretSantaData | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as SecretSantaData;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearSecretSantaData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getResultBySlug(slug: string): string | null {
  const data = getSecretSantaData();
  if (data && data.results[slug]) {
    return data.results[slug];
  }
  return null;
}

