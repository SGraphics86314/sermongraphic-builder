export type AspectRatio = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: string;
};

export const aspectRatios: AspectRatio[] = [
  { id: "hd", label: "Displays: HD Widescreen 1920x1080", width: 1920, height: 1080, group: "Displays" },
  { id: "uhd", label: "Displays: 4K UHD 3840x2160", width: 3840, height: 2160, group: "Displays" },
  { id: "ultrawide", label: "Displays: Ultra-Wide Stage 4096x1152", width: 4096, height: 1152, group: "Displays" },
  { id: "dual", label: "Displays: Dual Screen 3840x1080", width: 3840, height: 1080, group: "Displays" },
  { id: "triple", label: "Displays: Triple Projector 5760x1080", width: 5760, height: 1080, group: "Displays" },
  { id: "triple4k", label: "Displays: Triple LED Wall 7680x2160", width: 7680, height: 2160, group: "Displays" },
  { id: "square", label: "Social: Square 1080x1080", width: 1080, height: 1080, group: "Social" },
  { id: "portrait", label: "Social: Portrait 1080x1350", width: 1080, height: 1350, group: "Social" },
  { id: "story", label: "Social: Story/Reel 1080x1920", width: 1080, height: 1920, group: "Social" },
  { id: "youtube", label: "Social: YouTube Thumbnail 1280x720", width: 1280, height: 720, group: "Social" },
  { id: "hero", label: "Web: Website Hero 1920x800", width: 1920, height: 800, group: "Web" },
  { id: "facebook", label: "Web: Facebook Cover 1640x624", width: 1640, height: 624, group: "Web" }
];

export type LayoutStyle = {
  id: string;
  label: string;
  typography: "serif" | "bold" | "script" | "condensed" | "split";
  prompt: string;
  palette: string;
};

export const styles: LayoutStyle[] = [
  {
    id: "premium-metaphor",
    label: "SermonGraphic Premium",
    typography: "script",
    prompt: "premium sermon graphic style, one strong visual metaphor, cinematic object photography or cinematic environment, dramatic key light, dark edges, atmospheric haze, editorial poster composition",
    palette: "deep blacks, cream whites, warm gold, cyan accents, controlled contrast"
  },
  {
    id: "bold-conference",
    label: "Bold Conference",
    typography: "bold",
    prompt: "bold church conference graphic, huge negative space, dramatic lighting, modern worship media design, energetic contrast, premium stage visual",
    palette: "white type, cool blue shadows, orange highlights, deep black"
  },
  {
    id: "editorial-serif",
    label: "Editorial Serif",
    typography: "serif",
    prompt: "luxury editorial sermon poster, cinematic still life, single symbolic object, elegant shadows, film grain, premium magazine cover mood",
    palette: "cream, antique gold, black, muted earth tones"
  },
  {
    id: "modern-minimal",
    label: "Modern Minimal",
    typography: "condensed",
    prompt: "minimal modern sermon graphic, clean composition, one symbolic subject, lots of negative space, subtle gradient atmosphere, premium design",
    palette: "muted teal, coral, off-white, charcoal"
  },
  {
    id: "cinematic-dark",
    label: "Cinematic Dark",
    typography: "bold",
    prompt: "dark cinematic sermon visual, intense volumetric light, dramatic silhouette, high contrast shadows, atmospheric fog, movie poster composition",
    palette: "black, steel blue, white, warm amber flare"
  },
  {
    id: "youth-event",
    label: "Youth/Event Energy",
    typography: "split",
    prompt: "modern youth event church graphic, punchy color, dynamic lighting, cinematic crowd energy but not generic stock, premium concert promo design",
    palette: "electric blue, magenta, orange, white, black"
  }
];

export const bannedVisualCliches = [
  "generic church building",
  "cross on a hill",
  "open Bible on table",
  "praying hands",
  "dove in clouds",
  "glowing Jesus figure",
  "cheap stock worship background",
  "random collage of Christian symbols",
  "AI text or fake words"
];

export const metaphorHints = [
  "Use one primary visual metaphor only.",
  "Make the image feel like a designed sermon series graphic, not generic Christian stock art.",
  "Prefer cinematic objects, environments, silhouettes, light, weather, dust, glass, water, fire, roads, deserts, cities, storms, caves, lenses, hourglasses, honey, crowns, thorns, gates, prisons, or abstract atmosphere when conceptually fitting.",
  "Leave clean space for typography overlay. Do not put any words, letters, captions, numbers, logos, handwriting, or Bible verse text inside the generated image."
];
