export type AspectRatio = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: "Displays" | "Social" | "Web";
};

export const aspectRatios: AspectRatio[] = [
  { id: "hd", label: "Displays: HD Widescreen (1920x1080)", width: 1920, height: 1080, group: "Displays" },
  { id: "4k", label: "Displays: 4K UHD (3840x2160)", width: 3840, height: 2160, group: "Displays" },
  { id: "stage4096", label: "Displays: Ultra-Wide Stage (4096x1152)", width: 4096, height: 1152, group: "Displays" },
  { id: "dual", label: "Displays: Dual Screen (3840x1080)", width: 3840, height: 1080, group: "Displays" },
  { id: "triple", label: "Displays: Triple Projector (5760x1080)", width: 5760, height: 1080, group: "Displays" },
  { id: "triple4k", label: "Displays: Triple LED Wall 4K (7680x2160)", width: 7680, height: 2160, group: "Displays" },
  { id: "square", label: "Social: Square (1080x1080)", width: 1080, height: 1080, group: "Social" },
  { id: "portrait", label: "Social: Portrait (1080x1350)", width: 1080, height: 1350, group: "Social" },
  { id: "story", label: "Social: Story / Reel (1080x1920)", width: 1080, height: 1920, group: "Social" },
  { id: "youtube", label: "Social: YouTube Thumbnail (1280x720)", width: 1280, height: 720, group: "Social" },
  { id: "hero", label: "Web: Website Hero (1920x800)", width: 1920, height: 800, group: "Web" },
  { id: "facebook", label: "Web: Facebook Cover (1640x624)", width: 1640, height: 624, group: "Web" }
];

export const styles = [
  { id: "cinematic", label: "Cinematic", prompt: "cinematic, epic but tasteful, dramatic lighting, premium conference graphic, modern color grading" },
  { id: "modern", label: "Modern Church", prompt: "modern church design, clean, polished, abstract depth, premium worship visual" },
  { id: "bold", label: "Bold Typography", prompt: "high contrast background, strong negative space, bold modern poster design" },
  { id: "revival", label: "Revival", prompt: "warm atmosphere, light breaking through darkness, energetic but not cheesy" },
  { id: "youth", label: "Youth", prompt: "energetic modern youth conference style, vibrant lighting, urban texture, clean composition" },
  { id: "evangelism", label: "Evangelism", prompt: "hopeful outreach atmosphere, city light, people-free, modern campaign design" },
  { id: "conference", label: "Conference", prompt: "large event visual, premium stage design, sophisticated, clean negative space" }
];

export function getAspect(id: string) {
  return aspectRatios.find((item) => item.id === id) || aspectRatios[0];
}

export function getStyle(id: string) {
  return styles.find((item) => item.id === id) || styles[0];
}
