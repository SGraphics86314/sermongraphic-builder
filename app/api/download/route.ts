import { NextRequest, NextResponse } from "next/server";
import { dataPng, friendlyOpenAIError, generateBaseImage, makeFinalExport, pickSize } from "../../../lib/generation";
import { styles } from "../../../lib/presets";

export const runtime = "nodejs";
export const maxDuration = 60;

function isPaidOrDemoUnlocked(req: NextRequest) {
  // Temporary launch-mode gate.
  // Later, replace this with Stripe/Supabase credits:
  // verify user -> verify credits/subscription -> generate -> deduct one credit.
  if (process.env.DOWNLOADS_REQUIRE_PAYMENT !== "true") return true;
  return req.headers.get("x-sermongraphic-paid") === "true";
}

export async function POST(req: NextRequest) {
  try {
    if (!isPaidOrDemoUnlocked(req)) {
      return NextResponse.json({
        error: "Payment or credits required before downloading the clean high-res file.",
        paymentRequired: true
      }, { status: 402 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const scripture = String(body.scripture || "").trim();
    const theme = String(body.theme || "").trim();
    const style = String(body.style || styles[0]).trim();
    const ratioId = String(body.ratioId || "hd");
    const size = pickSize(ratioId, body.customWidth, body.customHeight);

    const base = await generateBaseImage({ title, scripture, theme, style, size, mode: "download" });
    const finalPng = await makeFinalExport(base.buffer, size, { title, scripture });

    return NextResponse.json({
      image: dataPng(finalPng),
      requestedSize: size,
      generatedSize: base.generatedSize,
      watermarked: false,
      charged: process.env.DOWNLOADS_REQUIRE_PAYMENT === "true",
      mode: "download"
    });
  } catch (error: any) {
    const raw = error?.message || "High-res download generation failed.";
    return NextResponse.json({ error: friendlyOpenAIError(raw) }, { status: error?.status || 500 });
  }
}
