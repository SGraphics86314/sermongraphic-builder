import OpenAI from "openai";
import { aspectRatios, bannedVisualCliches, metaphorHints, styles } from "./config";
import { safetyInstruction, validateImageRequest } from "./safety";

export type GeneratePayload = {
  title: string;
  scripture: string;
  theme: string;
  style: string;
  size: string;
};

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function pickAspect(id: string) {
  return aspectRatios.find((item) => item.id === id) || aspectRatios[0];
}

export function pickStyle(id: string) {
  return styles.find((item) => item.id === id) || styles[0];
}

function openAIImageSize(width: number, height: number): "1024x1024" | "1536x1024" | "1024x1536" {
  if (width === height) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

function metaphorDirection(title: string, theme: string) {
  const lower = `${title} ${theme}`.toLowerCase();
  if (lower.includes("vision") || lower.includes("see") || lower.includes("focus")) return "lens, focus, glass, refraction, blurred and clear contrast";
  if (lower.includes("mind") || lower.includes("thought") || lower.includes("mental")) return "brain, neural network, glowing connections, dark negative space";
  if (lower.includes("past") || lower.includes("time")) return "hourglass, sand, memory, long shadows, time passing";
  if (lower.includes("blood")) return "red fabric, crimson light, sacrifice symbolism, abstract red texture, no gore";
  if (lower.includes("victory")) return "honeycomb, crown, battlefield aftermath, trophy-like object, dangerous sweetness";
  if (lower.includes("heart")) return "desert path, lone traveler, warm dunes, single journey";
  if (lower.includes("light") || lower.includes("dark")) return "dark cavern, strong beam of light, atmospheric dust, high contrast";
  if (lower.includes("hope") || lower.includes("grave")) return "dark storm clouds opening to radiant light, lone silhouette, resurrection hope without literal tomb cliché";
  if (lower.includes("journey") || lower.includes("invitation")) return "long road, desert highway, mountains, horizon, warm cinematic travel mood";
  if (lower.includes("peace")) return "silhouette inside glowing protective sphere, calm center inside chaotic atmosphere";
  if (lower.includes("hard question") || lower.includes("prison")) return "prison bars, shadowed figure, shafts of light, gritty wall texture";
  if (lower.includes("shock") || lower.includes("proof")) return "storm, lightning, lone figure, reflective ground, dramatic impact";
  if (lower.includes("revolution")) return "city crowd silhouettes, bursting light, smoke, movement, spiritual awakening mood";
  if (lower.includes("flour") || lower.includes("bread")) return "flour sack, flour dust particles, dark studio light, tactile texture";
  return "one powerful symbolic object or cinematic environment that visually represents the sermon theme without being obvious or cheesy";
}

export function buildBackgroundPrompt(payload: GeneratePayload) {
  const style = pickStyle(payload.style);
  const aspect = pickAspect(payload.size);
  const metaphor = metaphorDirection(payload.title, payload.theme);

  return `
${safetyInstruction}

Create a text-free background image for a premium sermon graphic.

Sermon title: ${payload.title}
Scripture: ${payload.scripture}
Theme/direction: ${payload.theme}

Visual metaphor direction:
${metaphor}

Style DNA based on SermonGraphic.com examples:
- ${style.prompt}
- ${style.palette}
- ${metaphorHints.join("\n- ")}
- one dominant concept only
- cinematic lighting, volumetric haze, atmospheric depth
- dark edges with a strong focal point
- modern editorial sermon poster design
- visual storytelling, not generic religious stock art
- premium church media, conference-quality, clean composition
- leave negative space where typography can be overlaid later

Avoid:
- ${bannedVisualCliches.join("\n- ")}
- cluttered collage layouts
- literal cheesy Christian clichés unless explicitly requested
- generated text, letters, words, numbers, logos, watermarks, captions, signatures

Output should fit ${aspect.width}x${aspect.height} composition, but do not include typography. Background only.
`;
}

export async function generateBackground(payload: GeneratePayload) {
  const combined = `${payload.title} ${payload.scripture} ${payload.theme}`;
  const safe = validateImageRequest(combined);
  if (!safe.ok) throw new Error(safe.message);

  const client = getOpenAI();
  const aspect = pickAspect(payload.size);
  const prompt = buildBackgroundPrompt(payload);

  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: openAIImageSize(aspect.width, aspect.height) as any,
    n: 1
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI did not return image data.");
  return `data:image/png;base64,${b64}`;
}
