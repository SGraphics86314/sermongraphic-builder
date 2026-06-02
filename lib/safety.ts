const blockedPatterns: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(nude|nudity|naked|topless|bottomless|porn|pornographic|explicit|xxx|erotic|fetish|bdsm|orgy|sex|sexual|seductive|stripper|lingerie|onlyfans)\b/i, reason: "sexual or nude content" },
  { pattern: /\b(gore|gory|bloodbath|dismembered|dismemberment|decapitated|decapitation|intestines|entrails|mutilated|mutilation|corpse|rotting body|body horror)\b/i, reason: "graphic gore or gross imagery" },
  { pattern: /\b(vomit|feces|poop|excrement|urine|pus|maggots|infestation|open wound|infected wound)\b/i, reason: "gross or disturbing imagery" },
  { pattern: /\b(torture|lynching|execution|suicide|self[- ]harm|cutting wrists|hanging body)\b/i, reason: "graphic violence or self-harm imagery" },
  { pattern: /\b(child bride|sexualized child|minor in lingerie|teen nude|underage sexual)\b/i, reason: "sexual content involving minors" }
];

export function validateImageRequest(input: string): { ok: true } | { ok: false; reason: string } {
  const normalized = input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  for (const item of blockedPatterns) {
    if (item.pattern.test(normalized)) {
      return { ok: false, reason: item.reason };
    }
  }
  return { ok: true };
}

export const safetyInstruction = `
Safety rules for all generated images:
- Do not create nudity, sexual content, fetishized content, erotic imagery, or suggestive sexualized poses.
- Do not create gore, mutilation, dismemberment, corpses, body horror, gross bodily fluids, vomit, feces, pus, maggots, or disturbing medical imagery.
- Do not create graphic violence, torture, executions, self-harm imagery, or suicide imagery.
- Keep all people modestly dressed and appropriate for a church audience.
- Keep imagery inspirational, clean, professional, and suitable for public church projection and social media.
`;
