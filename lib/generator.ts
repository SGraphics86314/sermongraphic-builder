import OpenAI from "openai";
import { bannedVisualCliches, getAspect, getStyle, metaphorHints } from "./config";
import { safetyInstruction, validateImageRequest } from "./safety";

export type GeneratePayload = {
  title: string;
  scripture: string;
  speaker?: string;
  theme: string;
  style: string;
  size: string;
  mode?: "preview" | "download";
};

export type GenerateResult = {
  image: string;
  concept: string;
  prompt: string;
  width: number;
  height: number;
};

type OpenAIImageSize = "1024x1024" | "1536x1024" | "1024x1536" | "auto";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function imageSizeFor(width: number, height: number): OpenAIImageSize {
  if (Math.abs(width - height) < 50) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

function buildCreativeConcept(payload: GeneratePayload): string {
  const title = payload.title.toLowerCase();
  const theme = payload.theme.toLowerCase();
  const combined = `${title} ${theme}`;

  if (combined.includes("plow") || combined.includes("commit") || combined.includes("surrender")) {
    return "a decisive no-turning-back moment, a lone figure at dusk watching the old life burn behind him, sacrifice and commitment visualized through fire and smoke";
  }
  if (combined.includes("hope") || combined.includes("grave") || combined.includes("resurrection")) {
    return "a dark landscape split by a blinding doorway of light, one small silhouette moving toward restoration, hope breaking through death-like darkness";
  }
  if (combined.includes("mind") || combined.includes("thought") || combined.includes("anxiety")) {
    return "a single glowing brain-like neural form suspended in darkness, broken fragments becoming ordered, healing and clarity visualized through light";
  }
  if (combined.includes("vision") || combined.includes("see") || combined.includes("blur")) {
    return "a cinematic lens held in the foreground revealing a sharp world inside it while the outside world remains blurred and warm";
  }
  if (combined.includes("blood")) {
    return "a dramatic red and black abstract composition built around liquid crimson, sacrifice, and power, intense but not graphic or gory";
  }
  if (combined.includes("peace")) {
    return "a calm figure enclosed in a glowing sphere of peace while chaos swirls outside, warm gold and deep teal cinematic contrast";
  }
  if (combined.includes("light") || combined.includes("dark")) {
    return "a cavernous dark space pierced by powerful shafts of blue-white light, dust and atmosphere visible, one small figure near the light";
  }
  if (combined.includes("journey") || combined.includes("walk") || combined.includes("path")) {
    return "a distant path through a vast landscape with tiny travelers, warm orange foreground, cool misty distance, the feeling of a long spiritual journey";
  }
  if (combined.includes("victory")) {
    return "a single symbolic trophy-like honeycomb or crown-like object in dramatic light, victory shown as dangerous sweetness, bold dark background";
  }

  return `a single cinematic visual metaphor for ${payload.theme || payload.title}, emotional, symbolic, premium sermon artwork with one clear subject`;
}

function buildPrompt(payload: GeneratePayload): { prompt: string; concept: string; width: number; height: number } {
  const aspect = getAspect(payload.size);
  const style = getStyle(payload.style);
  const concept = buildCreativeConcept(payload);

  const prompt = `
${safetyInstruction}

Create a TEXT-FREE background image for a premium sermon graphic.

Sermon title for context only: ${payload.title}
Scripture for context only: ${payload.scripture}
Theme/direction: ${payload.theme}

Creative director concept:
${concept}

Style DNA based on SermonGraphic.com examples:
- ${style.mood}
- ${style.backgroundDirection}
- ${metaphorHints.join("\n- ")}
- one dominant concept only
- cinematic lighting, volumetric haze, atmospheric depth
- dark edges with a strong focal point
- modern editorial sermon poster design
- visual storytelling, not generic religious stock art
- premium church media, conference-quality, clean composition
- leave negative space where typography can be overlaid later

Avoid these visual cliches:
- ${bannedVisualCliches.join("\n- ")}

Hard requirements:
- absolutely no text, no letters, no numbers, no scripture references, no logos, no watermark
- do not place typography in the image
- no cheesy church flyer look
- no random cross unless it is essential to the specific concept
- no generic worship stock photo
- no clutter
- no cartoon style
- no low-quality AI artifact look

Aspect target: ${aspect.width}x${aspect.height}. Compose for that crop.
`.trim();

  return { prompt, concept, width: aspect.width, height: aspect.height };
}

export async function generateBackground(payloadRaw: Partial<GeneratePayload>): Promise<GenerateResult> {
  const payload: GeneratePayload = {
    title: clean(payloadRaw.title) || "Untitled Sermon",
    scripture: clean(payloadRaw.scripture),
    speaker: clean(payloadRaw.speaker),
    theme: clean(payloadRaw.theme) || "cinematic sermon visual metaphor",
    style: clean(payloadRaw.style) || "sg-premium",
    size: clean(payloadRaw.size) || "hd",
    mode: payloadRaw.mode === "download" ? "download" : "preview"
  };

  const safety = validateImageRequest(`${payload.title} ${payload.scripture} ${payload.theme}`);
  if (!safety.ok) throw new Error(safety.message);
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY environment variable.");

  const { prompt, concept, width, height } = buildPrompt(payload);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: imageSizeFor(width, height) as any,
    n: 1
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI did not return an image.");

  return {
    image: `data:image/png;base64,${b64}`,
    concept,
    prompt,
    width,
    height
  };
}
