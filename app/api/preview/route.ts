import { NextRequest, NextResponse } from "next/server";
import { checkSafety } from "../../../lib/safety";
import { composeGraphic, generateBaseImage, type BuildInput } from "../../../lib/graphics";

export const runtime = "nodejs";
export const maxDuration = 60;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: BuildInput = {
      title: clean(body.title),
      scripture: clean(body.scripture),
      theme: clean(body.theme),
      style: clean(body.style) || "cinematic",
      size: clean(body.size) || "hd"
    };

    if (!input.title) return NextResponse.json({ error: "Add a sermon or event title." }, { status: 400 });
    if (!input.theme) return NextResponse.json({ error: "Add a theme or direction." }, { status: 400 });

    const safety = checkSafety(`${input.title} ${input.scripture} ${input.theme}`);
    if (!safety.ok) return NextResponse.json({ error: safety.message }, { status: 400 });

    const base = await generateBaseImage(input, "preview");
    const image = composeGraphic(input, base.base64, "preview");

    return NextResponse.json({ image, mode: "preview" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Preview generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
