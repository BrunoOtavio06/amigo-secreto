import { SecretSantaData } from "./storage";
import { Redis } from "@upstash/redis";

/**
 * Initialize Upstash Redis client
 * Uses environment variables set by Vercel Marketplace integration
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL!,
  token: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN!,
});

/**
 * Generate a unique drawing ID
 */
export function generateDrawingId(): string {
  return `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Save a drawing to Upstash Redis
 */
export async function saveDrawing(
  drawingId: string,
  data: SecretSantaData
): Promise<void> {
  try {
    // Save the drawing data
    await redis.set(`drawing:${drawingId}`, data);

    // Update slug mappings - store each slug -> drawingId mapping
    for (const participant of data.participants) {
      await redis.set(`slug:${participant.slug}`, drawingId);
    }
  } catch (error) {
    console.error("Error saving drawing:", error);
    throw new Error("Failed to save drawing");
  }
}

/**
 * Get a drawing by ID
 */
export async function getDrawing(
  drawingId: string
): Promise<SecretSantaData | null> {
  try {
    const data = await redis.get<SecretSantaData>(`drawing:${drawingId}`);
    // redis.get returns null if key doesn't exist, which is the expected behavior
    return data ?? null;
  } catch (error) {
    console.error("Error reading drawing:", error);
    throw new Error("Failed to read drawing");
  }
}

/**
 * Get a drawing by participant slug
 */
export async function getDrawingBySlug(
  slug: string
): Promise<SecretSantaData | null> {
  try {
    const drawingId = await redis.get<string>(`slug:${slug}`);

    if (!drawingId) {
      return null;
    }

    return await getDrawing(drawingId);
  } catch (error) {
    console.error("Error getting drawing by slug:", error);
    return null;
  }
}
