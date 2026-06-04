"use client";

import { useMemo, useRef, useState } from "react";
import { aspectRatios, styles } from "../../lib/config";

type FormState = {
  title: string;
  scripture: string;
  speaker: string;
  theme: string;
  style: string;
  size: string;
};

type ApiResult = {
  background: string;
  mode: "preview" | "download";
  concept?: {
    visualMetaphor?: string;
    emotion?: string;
    lighting?: string;
    palette?: string;
  };
};

const examples = [
  "one dominant symbolic object, cinematic side light, dark negative space",
  "lone figure facing overwhelming light, atmospheric fog, deep perspective",
  "tactile object study, black background, warm gold highlights",
  "split editorial composition, high contrast color fields, premium ministry design"
];

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [title.toUpperCase(), ""];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" ").toUpperCase(), words.slice(midpoint).join(" ").toUpperCase()];
}

export default function BuilderPage() {
  const [form, setForm] = useState<FormState>({
    title: "Burning Your Plow",
    scripture: "1 Kings 19:21",
    speaker: "Pastor Steven Ciaccio",
    theme: "radical commitment, no turning back, sacrifice",
    style: "sg-premium",
    size: "hd"
  });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState<"preview" | "download" | "">("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedAspect = useMemo(() => aspectRatios.find((item) => item.id === form.size) || aspectRatios[0], [form.size]);
  const selectedStyle = useMemo(() => styles.find((item) => item.id === form.style) || styles[0], [form.style]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function callApi(endpoint: "/api/preview" | "/api/download", mode: "preview" | "download") {
    setError("");
    setLoading(mode);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
      setTimeout(() => renderCanvas(data), 250);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading("");
    }
  }

  function renderCanvas(data: ApiResult = result as ApiResult) {
    const canvas = canvasRef.current;
    if (!canvas || !data?.background) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = selectedAspect.width;
    canvas.height = selectedAspect.height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(0,0,0,0.68)");
      gradient.addColorStop(0.45, "rgba(0,0,0,0.24)");
      gradient.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const [line1, line2] = splitTitle(form.title);
      const wide = canvas.width > canvas.height;
      const base = Math.min(canvas.width, canvas.height);
      const x = wide ? canvas.width * 0.12 : canvas.width * 0.08;
      const y = wide ? canvas.height * 0.28 : canvas.height * 0.26;
      const titleSize = Math.round(base * (selectedStyle.layout === "serifHero" ? 0.17 : 0.15));
      const titleFont = selectedStyle.layout === "serifHero" ? "Georgia, serif" : "Arial Black, Impact, sans-serif";

      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = selectedStyle.layout === "serifHero" ? "#fff3c8" : "#f8fafc";
      ctx.font = `900 ${titleSize}px ${titleFont}`;
      ctx.letterSpacing = "-3px" as any;
      ctx.fillText(line1, x, y);
      if (line2) ctx.fillText(line2, x, y + titleSize * 0.9);

      ctx.shadowBlur = 8;
      ctx.font = `700 ${Math.round(base * 0.036)}px Arial, sans-serif`;
      ctx.fillStyle = selectedStyle.accentClass.includes("blue") ? "#7dd3fc" : selectedStyle.accentClass.includes("red") ? "#fb7185" : "#fde68a";
      ctx.fillRect(x, y + titleSize * (line2 ? 2.05 : 1.15), Math.round(base * 0.08), Math.max(4, Math.round(base * 0.006)));
      ctx.fillText(form.scripture.toUpperCase(), x + Math.round(base * 0.11), y + titleSize * (line2 ? 1.93 : 1.03));

      ctx.font = `700 ${Math.round(base * 0.028)}px Arial, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.fillText(form.speaker.toUpperCase(), x, canvas.height - base * 0.12);

      if (data.mode === "preview") {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = Math.max(2, base * 0.003);
        for (let i = -canvas.height; i < canvas.width; i += base * 0.16) {
          ctx.beginPath();
          ctx.moveTo(i, canvas.height);
          ctx.lineTo(i + canvas.height, 0);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.font = `800 ${Math.round(base * 0.026)}px Arial, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.86)";
        ctx.fillText("SERMONGRAPHIC.COM PREVIEW", canvas.width - base * 0.5, canvas.height - base * 0.09);
        ctx.restore();
      }
    };
    img.src = data.background;
  }

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "sermon-graphic"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main className="pageShell">
      <section className="hero">
        <div className="eyebrow">SermonGraphic.com Builder</div>
        <h1>Concept-first sermon graphics.</h1>
        <p>
          Built around your design style: one visual metaphor, cinematic lighting, premium typography, and no generic AI church stock art.
        </p>
      </section>

      <section className="workspace">
        <div className="panel formPanel">
          <div className="field"><label>Sermon / Event Title</label><input value={form.title} onChange={(e) => update("title", e.target.value)} /></div>
          <div className="field"><label>Scripture</label><input value={form.scripture} onChange={(e) => update("scripture", e.target.value)} /></div>
          <div className="field"><label>Speaker</label><input value={form.speaker} onChange={(e) => update("speaker", e.target.value)} /></div>
          <div className="field"><label>Theme / Direction</label><textarea value={form.theme} onChange={(e) => update("theme", e.target.value)} /></div>
          <div className="grid2">
            <div className="field"><label>Style</label><select value={form.style} onChange={(e) => update("style", e.target.value)}>{styles.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}</select></div>
            <div className="field"><label>Size</label><select value={form.size} onChange={(e) => update("size", e.target.value)}>{aspectRatios.map((ratio) => <option key={ratio.id} value={ratio.id}>{ratio.group}: {ratio.label}</option>)}</select></div>
          </div>
          <div className="actions">
            <button className="primary" disabled={!!loading} onClick={() => callApi("/api/preview", "preview")}>{loading === "preview" ? "Creating Preview..." : "Generate Preview"}</button>
            <button className="secondary" disabled={!!loading || !result} onClick={() => callApi("/api/download", "download")}>{loading === "download" ? "Creating High-Res..." : "Create High-Res"}</button>
          </div>
          {error ? <div className="error">{error}</div> : null}
          <details className="notice"><summary>Content & Safety Policy</summary><div>Sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery are blocked before generation.</div></details>
          <div className="hint">Selected output: {selectedAspect.width}x{selectedAspect.height}. Preview is watermarked. High-res is clean.</div>
          <div className="hint">Quick theme ideas: {examples.join(" • ")}</div>
        </div>

        <div className="panel stage">
          <div className="canvasFrame">
            <canvas ref={canvasRef} className={result ? "resultCanvas visible" : "resultCanvas"} />
            {!result ? <div className="placeholder"><h2>Your graphic will appear here</h2><p>Generate a concept-first preview, then create the clean high-res version.</p></div> : null}
          </div>
          {result ? <div className="canvasActions"><button onClick={downloadCanvas}>Download Current PNG</button><button onClick={() => callApi("/api/preview", "preview")}>Try Another Preview</button></div> : null}
          {result?.concept ? <div className="conceptBox"><strong>Creative Direction:</strong> {result.concept.visualMetaphor} • {result.concept.lighting} • {result.concept.palette}</div> : null}
        </div>
      </section>
    </main>
  );
}
