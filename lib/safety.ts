const blockedPatterns = [
  /\b(sex|sexual|nude|nudity|naked|porn|erotic|fetish|lingerie|stripper|seductive|onlyfans)\b/i,
  /\b(gore|gory|bloodbath|dismember|decapitat|entrails|mutilat|corpse|rotting body)\b/i,
  /\b(vomit|feces|poop|urine|gross|disgusting|viscera)\b/i,
  /\b(suicide|self-harm|self harm|cutting|hang myself|kill myself)\b/i,
  /\b(child sexual|sexualized minor|underage sexual|minor nude)\b/i,
  /\b(graphic violence|torture|execution|massacre)\b/i
];

export function checkSafety(input: string) {
  const text = input || "";
  const hit = blockedPatterns.find((pattern) => pattern.test(text));
  if (hit) {
    return {
      ok: false,
      message: "This request was blocked by the safety rules. Sexual content, nudity, gore, gross imagery, graphic violence, self-harm imagery, and sexualized minors are not allowed."
    };
  }
  return { ok: true, message: "" };
}
