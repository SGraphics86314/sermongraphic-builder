export type AspectRatioPreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: "Displays" | "Social Media" | "Web" | "Custom";
};

export const aspectRatios: AspectRatioPreset[] = [
  { id: "hd", label: "HD Widescreen", width: 1920, height: 1080, group: "Displays" },
  { id: "4k", label: "4K UHD", width: 3840, height: 2160, group: "Displays" },
  { id: "dual", label: "Dual Screen", width: 3840, height: 1080, group: "Displays" },
  { id: "ultrawide", label: "Ultra-Wide Stage", width: 4096, height: 1152, group: "Displays" },
  { id: "triple-projector", label: "Triple Projector", width: 5760, height: 1080, group: "Displays" },
  { id: "triple-led", label: "Triple LED Wall 4K", width: 7680, height: 2160, group: "Displays" },
  { id: "square", label: "Square", width: 1080, height: 1080, group: "Social Media" },
  { id: "portrait", label: "Instagram Portrait", width: 1080, height: 1350, group: "Social Media" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, group: "Social Media" },
  { id: "youtube", label: "YouTube Thumbnail", width: 1280, height: 720, group: "Social Media" },
  { id: "facebook-cover", label: "Facebook Cover", width: 1640, height: 624, group: "Web" },
  { id: "hero", label: "Website Hero", width: 1920, height: 800, group: "Web" }
];

export const styles = [
  "Cinematic",
  "Modern Church",
  "Bold Typography",
  "Youth",
  "Revival",
  "Evangelism",
  "Conference",
  "Minimal",
  "Dark Dramatic",
  "Bright Hopeful",
  "Luxury Gold",
  "Clean Editorial",
  "Gritty Outreach"
];
