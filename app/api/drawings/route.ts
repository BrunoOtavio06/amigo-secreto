import { NextRequest, NextResponse } from "next/server";
import {
  saveDrawing,
  generateDrawingId,
  getDrawing,
} from "@/lib/storage-server";
import { SecretSantaData } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const data: SecretSantaData = await request.json();

    // Validate data
    if (!data.participants || !Array.isArray(data.participants)) {
      return NextResponse.json(
        { error: "Invalid data: participants required" },
        { status: 400 }
      );
    }

    if (!data.results || typeof data.results !== "object") {
      return NextResponse.json(
        { error: "Invalid data: results required" },
        { status: 400 }
      );
    }

    // Generate unique drawing ID
    const drawingId = generateDrawingId();

    // Save drawing
    await saveDrawing(drawingId, data);

    return NextResponse.json({ drawingId, ...data }, { status: 201 });
  } catch (error) {
    console.error("Error creating drawing:", error);
    return NextResponse.json(
      { error: "Failed to create drawing" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const drawingId = searchParams.get("drawingId");

    if (!drawingId) {
      return NextResponse.json(
        { error: "drawingId parameter required" },
        { status: 400 }
      );
    }

    const drawing = await getDrawing(drawingId);

    if (!drawing) {
      return NextResponse.json(
        { error: "Drawing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ drawingId, ...drawing });
  } catch (error) {
    console.error("Error retrieving drawing:", error);
    return NextResponse.json(
      { error: "Failed to retrieve drawing" },
      { status: 500 }
    );
  }
}

