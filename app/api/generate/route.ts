import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { aspectRatios } from "../../../lib/presets";
import { safetyInstruction, validateImageRequest } from "../../../lib/safety";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function pickSize(ratioId: string, customWidth?: string, customHeight?: string) {
  if (ratioId === "custom") {
    const width = Number(customWidth);
    const height = Number(customHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 512 || height < 512 || width > 8192 || height > 8192) {
      throw new Error("Custom size must be between 512 and 8192 pixels for both width and height.");
    }
    return { width, height, label: `Custom ${width}x${height}` };
  }
  const preset = aspectRatios.find((item) => item.id === ratioId) || aspectRatios.find((item) => item.id === "hd")!;
  return preset;
}

function mapToSupportedOpenAIImageSize(width: number, height: number): "1024x1024" | "1536x1024" | "1024x1536" {
  if (width === height) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY environment variable." }, { status: 500 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const scripture = String(body.scripture || "").trim();
    const theme = String(body.theme || "").trim();
    const style = String(body.style || "Modern Church").trim();
    const ratioId = String(body.ratioId || "hd");
    const size = pickSize(ratioId, body.customWidth, body.customHeight);

    if (!title) {
      return NextResponse.json({ error: "Please enter a sermon or event title." }, { status: 400 });
    }

    const combinedUserInput = [title, scripture, theme, style].join(" ");
    const safety = validateImageRequest(combinedUserInput);
    if (!safety.ok) {
      return NextResponse.json({ error: `This request was blocked because it appears to request ${safety.reason}. Please revise it for clean, church-appropriate imagery.` }, { status: 400 });
    }

    const prompt = `
${safetyInstruction}
Create a polished church sermon graphic suitable for public church use.

Title text: ${title}
Scripture text: ${scripture || "none provided"}
Theme: ${theme || "none provided"}
Visual style: ${style}
Target output format: ${size.label}, ${size.width}x${size.height} pixels.

Design requirements:
- Make it clean, premium, inspirational, and church appropriate.
- Include strong visual hierarchy for the title.
- Avoid misspelled text. If exact text rendering is difficult, leave space for title overlay and focus on the background art.
- No sexual content, nudity, gore, gross imagery, horror, occult symbols, or graphic violence.
- Use composition that can be cropped or exported to ${size.width}x${size.height}.
`;

    const imageSize = mapToSupportedOpenAIImageSize(size.width, size.height);

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: imageSize,
      n: 1
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image was returned.");

    return NextResponse.json({ image: `data:image/png;base64,${b64}`, requestedSize: size, generatedSize: imageSize });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image generation failed." }, { status: 500 });
  }
}
