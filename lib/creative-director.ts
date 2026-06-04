import OpenAI from "openai";
import { getStyle } from "./config";

export type CreativeConcept = {
  theme: string;
  emotion: string;
  visualMetaphor: string;
  focalPoint: string;
  composition: string;
  lighting: string;
  palette: string;
  typographyDirection: string;
  avoid: string[];
};

export type CreativeInput = {
  title: string;
  scripture: string;
  speaker: string;
  theme: string;
  style: string;
};

const fallbackConcepts: Record<string, Partial<CreativeConcept>> = {
  burn: {
    theme: "radical commitment and no turning back",
    emotion: "decisive, sacrificial, sober",
    visualMetaphor: "a lone figure at dusk watching old tools burn in a field, symbolizing destroyed retreat options",
    focalPoint: "small silhouetted figure and a massive fire glow",
    composition: "wide cinematic landscape with strong negative space for typography",
    lighting: "blue twilight shadows contrasted with orange firelight",
    palette: "deep navy, black, ember orange, warm gold"
  },
  vision: {
    theme: "clarity after confusion",
    emotion: "focused, awakening, refined",
    visualMetaphor: "a camera lens or glass prism revealing a clear mountain horizon while the outside world is blurred",
    focalPoint: "sharp image visible through lens",
    composition: "center object with shallow depth of field and open typographic space",
    lighting: "warm sunset highlights and cool blue shadows",
    palette: "amber, cobalt blue, charcoal, white"
  },
  hope: {
    theme: "hope breaking through despair",
    emotion: "triumphant, restorative, luminous",
    visualMetaphor: "a distant doorway of light opening inside a dark storm landscape",
    focalPoint: "single human silhouette facing overwhelming light",
    composition: "deep perspective with central light source and strong negative space",
    lighting: "volumetric beams, dark clouds, radiant center",
    palette: "black, storm blue, white light, soft cyan"
  },
  peace: {
    theme: "supernatural calm under pressure",
    emotion: "quiet, stable, protected",
    visualMetaphor: "a person standing still inside a translucent protective sphere while chaos swirls outside",
    focalPoint: "calm central figure with glowing shield atmosphere",
    composition: "centered portrait with dramatic surrounding abstraction",
    lighting: "soft golden rim light, moody teal shadows",
    palette: "teal, gold, black, cream"
  },
  blood: {
    theme: "redemption and sacrifice",
    emotion: "urgent, reverent, powerful",
    visualMetaphor: "red translucent liquid and crown-of-thorns texture layered in dramatic editorial panels",
    focalPoint: "strong red symbolic texture across the middle",
    composition: "split-panel editorial collage with dark shadows and bright title space",
    lighting: "hard contrast, red wash, black shadows",
    palette: "crimson, black, white, muted blue"
  },
  victory: {
    theme: "the danger hidden inside triumph",
    emotion: "warning, sober, intense",
    visualMetaphor: "a honeycomb dripping in a hand under a black studio background, beauty mixed with danger",
    focalPoint: "object held in hand with rich amber liquid",
    composition: "tight cinematic object study with dark negative space",
    lighting: "single warm key light, glossy highlights, black falloff",
    palette: "black, honey gold, white, warm skin tones"
  }
};

function fallbackCreative(input: CreativeInput): CreativeConcept {
  const text = `${input.title} ${input.theme}`.toLowerCase();
  const key = Object.keys(fallbackConcepts).find((item) => text.includes(item));
  const picked = key ? fallbackConcepts[key] : {};
  const style = getStyle(input.style);
  return {
    theme: picked.theme || input.theme || "spiritual transformation",
    emotion: picked.emotion || "dramatic, thoughtful, worshipful, high-impact",
    visualMetaphor:
      picked.visualMetaphor ||
      "one powerful symbolic object or lone human silhouette representing the sermon theme, not a literal church stock scene",
    focalPoint: picked.focalPoint || "one dominant visual subject with clear hierarchy",
    composition: picked.composition || "cinematic wide composition, large negative space for typography, uncluttered frame",
    lighting: picked.lighting || "volumetric light, dark edges, bright focal point, atmospheric haze",
    palette: picked.palette || "deep blacks, warm gold, cool blue, soft white highlights",
    typographyDirection: `${style.layout} layout, premium church media poster treatment`,
    avoid: [
      "church building unless specifically requested",
      "cross on a hill",
      "open Bible stock photo",
      "praying hands stock image",
      "dove",
      "generic glowing Jesus figure",
      "busy collage",
      "cheap flyer look",
      "AI-generated text"
    ]
  };
}

export async function createConcept(input: CreativeInput): Promise<CreativeConcept> {
  if (!process.env.OPENAI_API_KEY) return fallbackCreative(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a senior church media creative director. Convert sermon titles into one strong visual metaphor. Avoid generic Christian stock imagery. Return JSON only."
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction:
              "Create a premium SermonGraphic.com-style creative concept. Use one dominant metaphor, cinematic lighting, strong depth, clean typography space. No text should be generated in the image.",
            title: input.title,
            scripture: input.scripture,
            speaker: input.speaker,
            theme: input.theme,
            style: getStyle(input.style).label,
            requiredKeys: [
              "theme",
              "emotion",
              "visualMetaphor",
              "focalPoint",
              "composition",
              "lighting",
              "palette",
              "typographyDirection",
              "avoid"
            ]
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return { ...fallbackCreative(input), ...parsed };
  } catch {
    return fallbackCreative(input);
  }
}
