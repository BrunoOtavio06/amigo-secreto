import { NextRequest, NextResponse } from "next/server";
import { getDrawingBySlug } from "@/lib/storage-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "slug parameter required" },
        { status: 400 }
      );
    }

    const drawing = await getDrawingBySlug(slug);

    if (!drawing) {
      return NextResponse.json(
        { error: "Drawing not found for this slug" },
        { status: 404 }
      );
    }

    // Find the result for this specific slug
    const result = drawing.results[slug] || null;

    return NextResponse.json({ result, drawing });
  } catch (error) {
    console.error("Error retrieving drawing by slug:", error);
    return NextResponse.json(
      { error: "Failed to retrieve drawing" },
      { status: 500 }
    );
  }
}

