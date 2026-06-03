import OpenAI from "openai";
import sharp from "sharp";
import { aspectRatios, styles } from "./presets";
import { safetyInstruction, validateImageRequest } from "./safety";

export type PickedSize = { width: number; height: number; label: string; group?: string };
export type OpenAIImageSize = "1024x1024" | "1536x1024" | "1024x1536" | "auto";
export type GenerationMode = "preview" | "download";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function assertApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable in Vercel.");
  }
}

export function pickSize(ratioId: string, customWidth?: string, customHeight?: string): PickedSize {
  if (ratioId === "custom") {
    const width = Number(customWidth);
    const height = Number(customHeight);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 512 || height < 512 || width > 8192 || height > 8192) {
      throw new Error("Custom size must be whole pixels between 512 and 8192 for both width and height.");
    }
    return { width, height, label: `Custom ${width}x${height}`, group: "Custom" };
  }

  const preset = aspectRatios.find((item) => item.id === ratioId) || aspectRatios.find((item) => item.id === "hd");
  if (!preset) throw new Error("No valid size preset was found.");
  return preset;
}

export function mapToSupportedOpenAIImageSize(width: number, height: number): OpenAIImageSize {
  if (width === height) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function smartTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toUpperCase();
}

function splitTitle(title: string) {
  const clean = smartTitle(title);
  const words = clean.split(" ").filter(Boolean);
  if (words.length <= 2) return [clean];
  if (words.length <= 4) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function textAnchorForSize(size: PickedSize) {
  const isUltraWide = size.width / size.height > 2.2;
  const isPortrait = size.height > size.width;
  if (isUltraWide) return { x: Math.round(size.width * 0.08), y: Math.round(size.height * 0.34), align: "start" as const };
  if (isPortrait) return { x: Math.round(size.width * 0.5), y: Math.round(size.height * 0.3), align: "middle" as const };
  return { x: Math.round(size.width * 0.08), y: Math.round(size.height * 0.34), align: "start" as const };
}

function backgroundPrompt(args: { title: string; scripture: string; theme: string; style: string; size: PickedSize; mode: GenerationMode }) {
  const { title, scripture, theme, style, size, mode } = args;
  const isWide = size.width / size.height > 1.7;
  const isUltraWide = size.width / size.height > 2.2;
  const detailLevel = mode === "preview" ? "premium preview background" : "premium high-resolution background";

  return `${safetyInstruction}
Create ONLY the background artwork for a high-end church sermon graphic. Do not add any text.

USER INPUT TO INTERPRET, NOT LITERALLY TYPE:
- Sermon title: ${title}
- Scripture reference: ${scripture || "none provided"}
- Theme/direction: ${theme || "hope, faith, restoration, God's presence"}
- Requested style: ${style || styles[0]}
- Final intended output: ${size.label}, ${size.width}x${size.height}

Creative-director rules:
- NO WORDS, NO LETTERS, NO TYPOGRAPHY, NO CAPTIONS, NO VERSE TEXT, NO LOGOS, NO WATERMARKS.
- Do NOT make cheesy church stock art.
- Avoid literal default images like a church building, a giant cross, a glowing Bible, doves, hands reaching to heaven, or a Jesus-like figure unless the user specifically asks.
- Create a ${detailLevel} with cinematic composition, modern color grading, premium atmosphere, depth, and strong negative space for text overlay.
- Translate the theme visually through atmosphere, light, landscape, architecture, texture, or abstract realism.
- Make it suitable for a modern church conference, sermon series, livestream slide, social graphic, or stage screen.
- Leave a clean ${isWide ? "left or center-left" : "upper or center"} area for large title text. Keep that area visually interesting but not cluttered.
- For ultra-wide/stage formats, create a panoramic scene that still works when cropped from a 1536x1024 generated base.
- Keep people modest and non-distracting if any people appear; silhouettes are preferred.
- No gore, gross imagery, nudity, sexual content, horror, occult symbols, graphic violence, self-harm, disturbing medical imagery, or anything inappropriate for church use.
- Image should feel designed by a professional creative director, not generic AI religious clip art.

Style translation:
- Cinematic: dramatic light, atmospheric depth, movie-poster color grade, premium realism.
- Modern Church: clean, polished, warm, contemporary, non-cheesy.
- Bold Typography: background with strong contrast and simple negative space because typography will be added later.
- Youth: energetic, modern, urban, vibrant, not childish.
- Revival: intense light, movement, expectancy, atmosphere, not cliché.
- Evangelism: hope, streets, journey, open doors, light in darkness, human scale.
- Conference: premium stage visual, elegant, large-scale, high production value.
- Minimal: restrained composition, subtle texture, beautiful negative space.
- Dark Dramatic: shadows, contrast, moody light, serious tone.
- Bright Hopeful: dawn, warmth, open space, optimism, restoration.
- Luxury Gold: black/gold atmosphere, elegant light, premium feel.
- Clean Editorial: refined, spacious, magazine-cover composition.
- Gritty Outreach: urban texture, raw but clean, hope in hard places.

Generate the background only.`;
}

export function validateInputs(args: { title: string; scripture: string; theme: string; style: string }) {
  if (!args.title.trim()) throw new Error("Please enter a sermon or event title.");

  const combinedUserInput = [args.title, args.scripture, args.theme, args.style].join(" ");
  const safety = validateImageRequest(combinedUserInput);
  if (!safety.ok) {
    const err = new Error(`Blocked: this request appears to ask for ${safety.reason}. Please revise it for clean, church-appropriate imagery.`);
    (err as any).status = 400;
    throw err;
  }
}

export async function generateBaseImage(args: { title: string; scripture: string; theme: string; style: string; size: PickedSize; mode: GenerationMode }) {
  assertApiKey();
  validateInputs(args);

  const prompt = backgroundPrompt(args);
  const imageSize = mapToSupportedOpenAIImageSize(args.size.width, args.size.height);

  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: imageSize as any,
    n: 1
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image was returned from OpenAI.");

  return {
    buffer: Buffer.from(b64, "base64"),
    generatedSize: imageSize,
    prompt
  };
}

export function makeTextOverlaySvg(args: { title: string; scripture: string; size: PickedSize; preview?: boolean }) {
  const { title, scripture, size, preview } = args;
  const lines = splitTitle(title);
  const anchor = textAnchorForSize(size);
  const isPortrait = size.height > size.width;
  const isUltraWide = size.width / size.height > 2.2;
  const baseTitleSize = isUltraWide ? Math.round(size.height * 0.15) : isPortrait ? Math.round(size.width * 0.105) : Math.round(size.width * 0.07);
  const titleSize = Math.max(56, Math.min(baseTitleSize, 220));
  const lineHeight = Math.round(titleSize * 0.94);
  const scriptureSize = Math.max(26, Math.round(titleSize * 0.28));
  const align = anchor.align;
  const x = anchor.x;
  const y = anchor.y;
  const titleLines = lines.map((line, index) => {
    const dy = index * lineHeight;
    return `<text x="${x}" y="${y + dy}" text-anchor="${align}" class="title">${escapeXml(line)}</text>`;
  }).join("\n");
  const scriptureY = y + (lines.length * lineHeight) + Math.round(scriptureSize * 1.1);
  const scriptureMarkup = scripture.trim()
    ? `<text x="${x}" y="${scriptureY}" text-anchor="${align}" class="scripture">${escapeXml(scripture.trim())}</text>`
    : "";

  const gradientWidth = isPortrait ? size.width : Math.round(size.width * 0.62);
  const gradientHeight = size.height;
  const gradientX = align === "middle" ? 0 : 0;
  const dimOpacity = preview ? 0.58 : 0.52;

  return Buffer.from(`
  <svg width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="rgba(0,0,0,${dimOpacity})"/>
        <stop offset="0.58" stop-color="rgba(0,0,0,0.24)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="black" flood-opacity="0.52"/>
      </filter>
      <style>
        .title { font-family: Arial, Helvetica, sans-serif; font-weight: 900; font-size: ${titleSize}px; letter-spacing: -0.055em; fill: #fff7e6; filter: url(#softShadow); }
        .scripture { font-family: Arial, Helvetica, sans-serif; font-weight: 800; font-size: ${scriptureSize}px; letter-spacing: 0.18em; fill: rgba(255,255,255,0.88); filter: url(#softShadow); }
      </style>
    </defs>
    <rect x="${gradientX}" y="0" width="${gradientWidth}" height="${gradientHeight}" fill="url(#shade)" />
    <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.08)" />
    ${titleLines}
    ${scriptureMarkup}
  </svg>`);
}

export async function makeComposedGraphic(source: Buffer, size: PickedSize, text: { title: string; scripture: string }, preview = false) {
  const base = await sharp(source)
    .resize(size.width, size.height, { fit: "cover", position: "center" })
    .modulate({ saturation: 0.94, brightness: 0.88 })
    .png()
    .toBuffer();

  return sharp(base)
    .composite([{ input: makeTextOverlaySvg({ ...text, size, preview }), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function makeWatermarkedPreview(source: Buffer) {
  const metadata = await sharp(source).metadata();
  const sourceWidth = metadata.width || 1024;
  const sourceHeight = metadata.height || 1024;
  const maxPreviewWidth = 1000;
  const previewWidth = Math.min(sourceWidth, maxPreviewWidth);
  const previewHeight = Math.round((sourceHeight / sourceWidth) * previewWidth);

  const fontSize = Math.max(24, Math.round(previewWidth / 22));
  const watermark = Buffer.from(`
    <svg width="${previewWidth}" height="${previewHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" patternUnits="userSpaceOnUse" width="390" height="160" patternTransform="rotate(-24)">
          <text x="0" y="80" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="900" fill="rgba(255,255,255,0.24)">SermonGraphic.com Preview</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
      <rect x="0" y="${previewHeight - 58}" width="100%" height="58" fill="rgba(0,0,0,0.58)" />
      <text x="24" y="${previewHeight - 22}" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="white">Preview only - purchase/download for clean high-res file</text>
    </svg>
  `);

  return sharp(source)
    .resize({ width: previewWidth, withoutEnlargement: true })
    .composite([{ input: watermark, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function makePreviewExport(source: Buffer, size: PickedSize, text: { title: string; scripture: string }) {
  const composed = await makeComposedGraphic(source, size, text, true);
  return makeWatermarkedPreview(composed);
}

export async function makeFinalExport(source: Buffer, size: PickedSize, text: { title: string; scripture: string }) {
  return makeComposedGraphic(source, size, text, false);
}

export function friendlyOpenAIError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("billing") || lower.includes("hard limit") || lower.includes("quota")) {
    return "OpenAI billing/quota issue: your API project has no available image-generation credit or has reached its hard limit. Add billing or raise the usage limit in OpenAI Platform.";
  }
  if (lower.includes("invalid size")) {
    return "OpenAI rejected the image size. The app now maps presets to supported OpenAI sizes first, then exports to the requested final dimensions.";
  }
  return message;
}

export function dataPng(buffer: Buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
