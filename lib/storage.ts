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

const DRAWING_ID_KEY = "amigo-secreto-drawing-id";

/**
 * Save secret santa data to the server
 * Returns the drawing ID
 */
export async function saveSecretSantaData(
  data: SecretSantaData
): Promise<string> {
  try {
    const response = await fetch("/api/drawings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to save drawing");
    }

    const result = await response.json();
    const drawingId = result.drawingId;

    // Store drawingId in localStorage for persistence across page reloads
    if (typeof window !== "undefined" && drawingId) {
      localStorage.setItem(DRAWING_ID_KEY, drawingId);
    }

    return drawingId;
  } catch (error) {
    console.error("Error saving secret santa data:", error);
    throw error;
  }
}

/**
 * Get secret santa data from the server
 * Uses stored drawingId or accepts one as parameter
 */
export async function getSecretSantaData(
  providedDrawingId?: string
): Promise<SecretSantaData | null> {
  try {
    // Get drawingId from parameter, localStorage, or return null
    const id =
      providedDrawingId ||
      (typeof window !== "undefined"
        ? localStorage.getItem(DRAWING_ID_KEY)
        : null);

    if (!id) {
      return null;
    }

    const response = await fetch(`/api/drawings/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        // Drawing not found, clear stored ID
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAWING_ID_KEY);
        }
        return null;
      }
      throw new Error("Failed to retrieve drawing");
    }

    const result = await response.json();
    // Remove drawingId from the response to match SecretSantaData interface
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { drawingId: _drawingId, ...data } = result;
    return data as SecretSantaData;
  } catch (error) {
    console.error("Error getting secret santa data:", error);
    return null;
  }
}

/**
 * Clear stored drawing ID
 */
export function clearSecretSantaData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DRAWING_ID_KEY);
  }
}

/**
 * Get result by participant slug from the server
 */
export async function getResultBySlug(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/drawings/slug/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to retrieve result");
    }

    const result = await response.json();
    return result.result || null;
  } catch (error) {
    console.error("Error getting result by slug:", error);
    return null;
  }
}

