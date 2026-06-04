import OpenAI from "openai";
import { createConcept } from "./creative-director";
import { buildImagePrompt, mapToOpenAIImageSize } from "./prompt-builder";
import { getAspect } from "./config";
import { checkSafety } from "./safety";

export type BuildInput = {
  title: string;
  scripture: string;
  speaker: string;
  theme: string;
  style: string;
  size: string;
  mode: "preview" | "download";
};

function dataPng(base64: string) {
  return `data:image/png;base64,${base64}`;
}

export async function generateGraphicBackground(input: BuildInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const safety = checkSafety(`${input.title} ${input.scripture} ${input.speaker} ${input.theme}`);
  if (!safety.ok) throw new Error(safety.message);

  const aspect = getAspect(input.size);
  const imageSize = mapToOpenAIImageSize(aspect.width, aspect.height);
  const concept = await createConcept(input);
  const prompt = buildImagePrompt(concept, input.style, input.size, input.mode);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: imageSize as any,
    n: 1
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI did not return an image.");

  return {
    background: dataPng(b64),
    concept,
    prompt,
    aspect
  };
}
