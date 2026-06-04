import { NextRequest, NextResponse } from "next/server";
import { generateBackground } from "../../../lib/generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await generateBackground({ ...body, mode: "preview" });
    return NextResponse.json({ ...result, mode: "preview", watermark: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation failed." }, { status: 400 });
  }
}
