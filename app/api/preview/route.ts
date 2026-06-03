import { NextRequest, NextResponse } from "next/server";
import { dataPng, friendlyOpenAIError, generateBaseImage, makePreviewExport, pickSize } from "../../../lib/generation";
import { styles } from "../../../lib/presets";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const scripture = String(body.scripture || "").trim();
    const theme = String(body.theme || "").trim();
    const style = String(body.style || styles[0]).trim();
    const ratioId = String(body.ratioId || "hd");
    const size = pickSize(ratioId, body.customWidth, body.customHeight);

    const base = await generateBaseImage({ title, scripture, theme, style, size, mode: "preview" });
    const preview = await makePreviewExport(base.buffer, size, { title, scripture });

    return NextResponse.json({
      image: dataPng(preview),
      requestedSize: size,
      generatedSize: base.generatedSize,
      watermarked: true,
      mode: "preview"
    });
  } catch (error: any) {
    const raw = error?.message || "Preview generation failed.";
    return NextResponse.json({ error: friendlyOpenAIError(raw) }, { status: error?.status || 500 });
  }
}
