export type AspectRatio = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: string;
};

export const aspectRatios: AspectRatio[] = [
  { id: "hd", label: "HD Widescreen (1920x1080)", width: 1920, height: 1080, group: "Displays" },
  { id: "4k", label: "4K UHD (3840x2160)", width: 3840, height: 2160, group: "Displays" },
  { id: "ultra-stage", label: "Ultra-Wide Stage (4096x1152)", width: 4096, height: 1152, group: "Displays" },
  { id: "dual", label: "Dual Screen (3840x1080)", width: 3840, height: 1080, group: "Displays" },
  { id: "triple", label: "Triple Projector (5760x1080)", width: 5760, height: 1080, group: "Displays" },
  { id: "triple-led", label: "Triple LED Wall 4K (7680x2160)", width: 7680, height: 2160, group: "Displays" },
  { id: "square", label: "Square (1080x1080)", width: 1080, height: 1080, group: "Social" },
  { id: "portrait", label: "Portrait (1080x1350)", width: 1080, height: 1350, group: "Social" },
  { id: "story", label: "Story/Reel (1080x1920)", width: 1080, height: 1920, group: "Social" },
  { id: "youtube", label: "YouTube Thumbnail (1280x720)", width: 1280, height: 720, group: "Social" },
  { id: "hero", label: "Website Hero (1920x800)", width: 1920, height: 800, group: "Web" },
  { id: "facebook", label: "Facebook Cover (1640x624)", width: 1640, height: 624, group: "Web" }
];

export type StyleProfile = {
  id: string;
  label: string;
  layout: "serifHero" | "impactSans" | "scriptHybrid" | "editorial" | "splitEditorial";
  backgroundBrief: string;
  titleClass: string;
  accentClass: string;
};

export const styles: StyleProfile[] = [
  {
    id: "sg-premium",
    label: "SermonGraphic Premium",
    layout: "impactSans",
    backgroundBrief: "conceptual cinematic sermon artwork with one dominant metaphor, premium ministry design, dark edges, strong focal point, high contrast lighting",
    titleClass: "title-impact",
    accentClass: "accent-gold"
  },
  {
    id: "cinematic-serif",
    label: "Cinematic Serif",
    layout: "serifHero",
    backgroundBrief: "luxury editorial sermon artwork, dramatic side lighting, tactile object, dark negative space, warm cream and gold palette",
    titleClass: "title-serif",
    accentClass: "accent-cream"
  },
  {
    id: "brush-hybrid",
    label: "Brush + Bold Hybrid",
    layout: "scriptHybrid",
    backgroundBrief: "modern worship graphic style, bold headline space, energetic brush-script accent feel, blue and orange cinematic color grade",
    titleClass: "title-hybrid",
    accentClass: "accent-blue"
  },
  {
    id: "editorial-minimal",
    label: "Editorial Minimal",
    layout: "editorial",
    backgroundBrief: "minimal cinematic editorial composition, single symbolic object, clean negative space, refined restrained typography zone",
    titleClass: "title-editorial",
    accentClass: "accent-coral"
  },
  {
    id: "split-concept",
    label: "Split Concept",
    layout: "splitEditorial",
    backgroundBrief: "layered conceptual ministry artwork, editorial split composition, contrasting color fields, symbolic image treatment, dramatic depth",
    titleClass: "title-impact",
    accentClass: "accent-red"
  }
];

export function getAspect(id: string) {
  return aspectRatios.find((item) => item.id === id) || aspectRatios[0];
}

export function getStyle(id: string) {
  return styles.find((item) => item.id === id) || styles[0];
}
export const bannedVisualCliches = [
  "generic church building",
  "cross on a hill",
  "open bible on a table",
  "praying hands",
  "dove",
  "heaven clouds",
  "glowing Jesus figure",
  "cheap Christian stock photo",
  "random worship crowd",
  "clip art symbols"
];

export const metaphorHints = [
  "single dominant visual metaphor",
  "cinematic lighting",
  "dark edges with bright focal point",
  "atmospheric haze",
  "strong depth",
  "premium sermon artwork",
  "editorial composition",
  "one clear subject",
  "negative space for typography"
];
