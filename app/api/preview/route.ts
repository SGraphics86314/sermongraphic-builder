import { NextRequest, NextResponse } from "next/server";
import { generateBackground } from "../../../lib/generator";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const image = await generateBackground(payload);
    return NextResponse.json({ image, mode: "preview", watermark: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to create preview." }, { status: 400 });
  }
}
