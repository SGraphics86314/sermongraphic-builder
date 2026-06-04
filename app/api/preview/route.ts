import { NextRequest, NextResponse } from "next/server";
import { generateGraphicBackground } from "../../../lib/graphics";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateGraphicBackground({ ...body, mode: "preview" });
    return NextResponse.json({ ...result, mode: "preview" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed." }, { status: 400 });
  }
}
