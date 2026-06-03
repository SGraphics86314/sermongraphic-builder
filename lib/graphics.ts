import OpenAI from "openai";
import { getAspect, getStyle } from "./config";

export type BuildInput = {
  title: string;
  scripture: string;
  theme: string;
  style: string;
  size: string;
};

export type GeneratedBase = {
  base64: string;
  mimeType: string;
};

function openAIImageSize(width: number, height: number): "1024x1024" | "1536x1024" | "1024x1536" {
  if (Math.abs(width - height) < Math.min(width, height) * 0.12) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function buildBackgroundPrompt(input: BuildInput, mode: "preview" | "download") {
  const style = getStyle(input.style);
  const aspect = getAspect(input.size);
  const detail = mode === "download" ? "high detail, crisp, premium, polished" : "clean composition, polished preview quality";
  return `Create a professional sermon graphic BACKGROUND ONLY. No text. No words. No letters. No typography. No logos.

Purpose: church sermon graphic background for later title overlay.
Title that will be added later by software: ${input.title}
Scripture that will be added later by software: ${input.scripture}
Theme/direction: ${input.theme}
Style: ${style.prompt}
Canvas use: ${aspect.label}, ${aspect.width} by ${aspect.height}.

Creative direction:
- Sophisticated modern church conference design.
- Strong negative space where title can sit cleanly.
- Abstract or cinematic visual metaphor, not literal cheesy church stock art.
- Avoid obvious stock imagery unless specifically requested.
- Avoid fake text, misspelled words, church bulletin clip art, cartoonish composition, random crosses, random church buildings, and Jesus-looking figures unless explicitly requested.
- Use atmospheric light, depth, texture, contrast, and premium visual hierarchy.
- ${detail}.

Return only the background artwork. Absolutely no text in the image.`;
}

export async function generateBaseImage(input: BuildInput, mode: "preview" | "download"): Promise<GeneratedBase> {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY environment variable.");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const aspect = getAspect(input.size);
  const size = openAIImageSize(aspect.width, aspect.height);
  const prompt = buildBackgroundPrompt(input, mode);
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
    n: 1
  } as any);
  const first = response.data?.[0];
  const b64 = (first as any)?.b64_json;
  if (!b64) throw new Error("OpenAI did not return image data.");
  return { base64: b64, mimeType: "image/png" };
}

function titleLines(title: string) {
  const words = title.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [words.join(" ")];
  if (words.length <= 4) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
  const third = Math.ceil(words.length / 3);
  return [words.slice(0, third).join(" "), words.slice(third, third * 2).join(" "), words.slice(third * 2).join(" ")];
}

export function composeGraphic(input: BuildInput, base64: string, mode: "preview" | "download") {
  const aspect = getAspect(input.size);
  const previewScale = mode === "preview" ? 0.45 : 1;
  const width = Math.max(512, Math.round(aspect.width * previewScale));
  const height = Math.max(512, Math.round(aspect.height * previewScale));
  const lines = titleLines(input.title || "SERMON TITLE");
  const titleSize = Math.max(46, Math.min(138, Math.round(width / (lines.length > 1 ? 9.4 : 7.2))));
  const scriptureSize = Math.max(22, Math.round(titleSize * 0.34));
  const startY = Math.round(height * 0.38 - ((lines.length - 1) * titleSize * 0.48));
  const lineGap = Math.round(titleSize * 0.9);
  const left = Math.round(width * 0.075);
  const watermark = mode === "preview";

  const titleSvg = lines.map((line, index) => `<text x="${left}" y="${startY + index * lineGap}" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="900" letter-spacing="-${Math.round(titleSize * 0.055)}" fill="white">${escapeXml(line)}</text>`).join("");
  const scriptureY = startY + lines.length * lineGap + Math.round(titleSize * 0.25);
  const scriptureSvg = input.scripture ? `<rect x="${left}" y="${scriptureY - Math.round(scriptureSize * .45)}" width="${Math.round(width * .065)}" height="3" fill="#ffcf42"/><text x="${left + Math.round(width * .085)}" y="${scriptureY}" font-family="Inter, Arial, sans-serif" font-size="${scriptureSize}" font-weight="800" letter-spacing="${Math.round(scriptureSize * 0.16)}" fill="#fff4c4">${escapeXml(input.scripture.toUpperCase())}</text>` : "";
  const watermarkSvg = watermark ? `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#wm)" opacity="0.25"/><rect x="${width - Math.round(width * .34)}" y="${height - 62}" width="${Math.round(width * .32)}" height="40" rx="10" fill="rgba(0,0,0,.62)" stroke="rgba(255,255,255,.25)"/><text x="${width - Math.round(width * .325)}" y="${height - 36}" font-family="Arial, sans-serif" font-size="${Math.max(16, Math.round(width / 70))}" font-weight="900" letter-spacing="2" fill="rgba(255,255,255,.9)">SERMONGRAPHIC.COM PREVIEW</text>` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(0,0,0,.68)"/><stop offset="0.50" stop-color="rgba(0,0,0,.18)"/><stop offset="1" stop-color="rgba(0,0,0,.40)"/></linearGradient>
    <pattern id="wm" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="90" height="90" fill="transparent"/><rect width="2" height="90" fill="white" opacity=".18"/></pattern>
    <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="black" flood-opacity="0.65"/></filter>
  </defs>
  <image href="data:image/png;base64,${base64}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#shade)"/>
  <g filter="url(#shadow)">${titleSvg}${scriptureSvg}</g>
  ${watermarkSvg}
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
