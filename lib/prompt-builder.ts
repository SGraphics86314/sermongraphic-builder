import { CreativeConcept } from "./creative-director";
import { getAspect, getStyle } from "./config";
import { safetyInstruction } from "./safety";

export function mapToOpenAIImageSize(width: number, height: number): "1024x1024" | "1536x1024" | "1024x1536" {
  if (Math.abs(width - height) < Math.max(width, height) * 0.1) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

export function buildImagePrompt(concept: CreativeConcept, styleId: string, aspectId: string, mode: "preview" | "download") {
  const style = getStyle(styleId);
  const aspect = getAspect(aspectId);
  const prompt = `
Create a premium cinematic sermon graphic BACKGROUND ONLY.

This image must feel like high-end church media design, not cheap AI art.

Creative concept:
Theme: ${concept.theme}
Emotion: ${concept.emotion}
Primary visual metaphor: ${concept.visualMetaphor}
Focal point: ${concept.focalPoint}
Composition: ${concept.composition}
Lighting: ${concept.lighting}
Color palette: ${concept.palette}
Style profile: ${style.backgroundBrief}
Canvas intent: ${aspect.label}

Design rules:
- ONE dominant visual metaphor only.
- Strong focal hierarchy.
- Cinematic depth and atmospheric haze.
- Dark edges with a bright focal area.
- Negative space where typography can sit.
- Premium ministry/conference artwork aesthetic.
- Use symbolic storytelling rather than literal title illustration.
- No cheap stock church imagery.
- No clutter.
- No text, no letters, no typography, no logos, no watermark.
- Do not spell the sermon title inside the image.

Avoid specifically:
${concept.avoid.map((item) => `- ${item}`).join("\n")}

${safetyInstruction}

Output should be ${mode === "preview" ? "a clean preview background" : "a clean final background"} suitable for overlaying title text in code.
`;

  return prompt.trim();
}
