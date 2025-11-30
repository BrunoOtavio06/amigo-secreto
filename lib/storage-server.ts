import { SecretSantaData } from "./storage";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DRAWINGS_DIR = path.join(DATA_DIR, "drawings");
const SLUG_MAP_FILE = path.join(DATA_DIR, "slug-map.json");

/**
 * Ensure data directories exist
 */
async function ensureDirectories(): Promise<void> {
  try {
    await fs.mkdir(DRAWINGS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
    throw new Error("Failed to create data directories");
  }
}

/**
 * Generate a unique drawing ID
 */
export function generateDrawingId(): string {
  return `drawing-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Save a drawing to the file system
 */
export async function saveDrawing(
  drawingId: string,
  data: SecretSantaData
): Promise<void> {
  await ensureDirectories();

  const filePath = path.join(DRAWINGS_DIR, `${drawingId}.json`);

  try {
    // Save the drawing data
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    // Update slug mapping
    const slugMap = await getSlugMap();
    for (const participant of data.participants) {
      slugMap[participant.slug] = drawingId;
    }
    await fs.writeFile(
      SLUG_MAP_FILE,
      JSON.stringify(slugMap, null, 2),
      "utf-8"
    );
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
  const filePath = path.join(DRAWINGS_DIR, `${drawingId}.json`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent) as SecretSantaData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    console.error("Error reading drawing:", error);
    throw new Error("Failed to read drawing");
  }
}

/**
 * Get slug-to-drawingId mapping
 */
async function getSlugMap(): Promise<Record<string, string>> {
  try {
    const fileContent = await fs.readFile(SLUG_MAP_FILE, "utf-8");
    return JSON.parse(fileContent) as Record<string, string>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    console.error("Error reading slug map:", error);
    return {};
  }
}

/**
 * Get a drawing by participant slug
 */
export async function getDrawingBySlug(
  slug: string
): Promise<SecretSantaData | null> {
  try {
    const slugMap = await getSlugMap();
    const drawingId = slugMap[slug];

    if (!drawingId) {
      return null;
    }

    return await getDrawing(drawingId);
  } catch (error) {
    console.error("Error getting drawing by slug:", error);
    return null;
  }
}

