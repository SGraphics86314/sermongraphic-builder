export type AspectRatio = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: string;
};

export type StyleProfile = {
  id: string;
  label: string;
  layout: "impact" | "serif" | "script" | "editorial" | "minimal";
  mood: string;
  backgroundDirection: string;
  titleClass: string;
  accentClass: string;
};

export const aspectRatios: AspectRatio[] = [
  { id: "hd", label: "Displays: HD Widescreen (1920x1080)", width: 1920, height: 1080, group: "Displays" },
  { id: "4k", label: "Displays: 4K UHD (3840x2160)", width: 3840, height: 2160, group: "Displays" },
  { id: "ultrawide", label: "Displays: Ultra-Wide Stage (4096x1152)", width: 4096, height: 1152, group: "Displays" },
  { id: "dual", label: "Displays: Dual Screen (3840x1080)", width: 3840, height: 1080, group: "Displays" },
  { id: "triple", label: "Displays: Triple Projector (5760x1080)", width: 5760, height: 1080, group: "Displays" },
  { id: "triple4k", label: "Displays: Triple LED 4K (7680x2160)", width: 7680, height: 2160, group: "Displays" },
  { id: "square", label: "Social: Square (1080x1080)", width: 1080, height: 1080, group: "Social" },
  { id: "portrait", label: "Social: Portrait (1080x1350)", width: 1080, height: 1350, group: "Social" },
  { id: "story", label: "Social: Story/Reel (1080x1920)", width: 1080, height: 1920, group: "Social" },
  { id: "youtube", label: "Social: YouTube Thumbnail (1280x720)", width: 1280, height: 720, group: "Social" },
  { id: "hero", label: "Web: Website Hero (1920x800)", width: 1920, height: 800, group: "Web" },
  { id: "fbcover", label: "Web: Facebook Cover (1640x624)", width: 1640, height: 624, group: "Web" }
];

export const styles: StyleProfile[] = [
  {
    id: "sg-premium",
    label: "SermonGraphic Premium",
    layout: "impact",
    mood: "cinematic, concept-driven, dramatic, premium ministry artwork",
    backgroundDirection: "single dominant visual metaphor, dark edges, bright focal point, volumetric light, cinematic atmosphere",
    titleClass: "titleImpact",
    accentClass: "accentGold"
  },
  {
    id: "bold-impact",
    label: "Bold Impact",
    layout: "impact",
    mood: "large bold modern conference title treatment, high contrast, energetic",
    backgroundDirection: "wide cinematic subject with dramatic lighting and strong negative space",
    titleClass: "titleImpact",
    accentClass: "accentWhite"
  },
  {
    id: "serif-cinematic",
    label: "Cinematic Serif",
    layout: "serif",
    mood: "luxury editorial serif typography, warm gold, solemn cinematic lighting",
    backgroundDirection: "single object or scene, warm side light, dust, smoke, deep shadows, premium editorial poster",
    titleClass: "titleSerif",
    accentClass: "accentCream"
  },
  {
    id: "script-hybrid",
    label: "Script Hybrid",
    layout: "script",
    mood: "bold sans plus expressive brush accent, worship/conference energy",
    backgroundDirection: "cinematic environment with strong center light, blue/orange color contrast, atmospheric depth",
    titleClass: "titleScriptHybrid",
    accentClass: "accentBlue"
  },
  {
    id: "editorial-minimal",
    label: "Editorial Minimal",
    layout: "editorial",
    mood: "clean magazine-style layout, refined, spacious, mature",
    backgroundDirection: "minimal single object or symbolic landscape, restrained palette, clean negative space",
    titleClass: "titleEditorial",
    accentClass: "accentMuted"
  }
];

export const metaphorHints = [
  "use one primary visual metaphor only",
  "avoid collage layouts and random religious symbols",
  "make the image feel designed by a creative director, not like stock art",
  "strong focal point with clean negative space for text overlay",
  "cinematic lighting, atmospheric haze, depth, and tasteful contrast",
  "symbolic and emotional rather than literal and cheesy"
];

export const bannedVisualCliches = [
  "generic church building",
  "cross on a hill",
  "open Bible on a table",
  "praying hands",
  "dove",
  "heaven clouds",
  "glowing Jesus figure",
  "cheap Christian stock photo",
  "random worship crowd",
  "clip art symbols",
  "AI generated typography",
  "words or letters in the artwork"
];

export function getAspect(id: string): AspectRatio {
  return aspectRatios.find((item) => item.id === id) || aspectRatios[0];
}

export function getStyle(id: string): StyleProfile {
  return styles.find((item) => item.id === id) || styles[0];
}
