"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  image: string;
  concept: string;
  prompt: string;
  width: number;
  height: number;
  watermark: boolean;
};

const examples = [
  "decisive commitment, no turning back, old life burned away",
  "light breaking through darkness, restoration after loss",
  "healing the mind, clarity replacing confusion",
  "spiritual revolution, a city awakened by light"
];

function splitTitle(title: string): string[] {
  const words = title.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [words.join(" ")];
  if (words.length === 3) return [words[0], words.slice(1).join(" ")];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export default function BuilderPage() {
  const [form, setForm] = useState<FormState>({
    title: "Burning Your Plow",
    scripture: "1 Kings 19:21",
    speaker: "Pastor Steven Ciaccio",
    theme: "decisive commitment, no turning back, old life burned away",
    style: "sg-premium",
    size: "hd"
  });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState<"preview" | "download" | "">("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedAspect = useMemo(
    () => aspectRatios.find((item) => item.id === form.size) || aspectRatios[0],
    [form.size]
  );
  const selectedStyle = useMemo(
    () => styles.find((item) => item.id === form.style) || styles[0],
    [form.style]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function callApi(path: "/api/preview" | "/api/download", mode: "preview" | "download") {
    setError("");
    setLoading(mode);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading("");
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = selectedAspect.width;
    const height = selectedAspect.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#05060b";
    ctx.fillRect(0, 0, width, height);

    const drawText = () => {
      const lines = splitTitle(form.title || "Untitled");
      const isWide = width / height > 2.2;
      const titleSize = Math.max(54, Math.min(height * 0.2, width / (isWide ? 9 : 8)));
      const metaSize = Math.max(22, Math.min(height * 0.045, width / 46));
      const left = width * 0.085;
      const centerX = width / 2;
      const titleY = height * (selectedStyle.layout === "editorial" ? 0.32 : 0.34);

      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.30)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 26;
      ctx.textBaseline = "middle";

      if (selectedStyle.layout === "serif") {
        ctx.textAlign = "center";
        ctx.fillStyle = "#f8ebc2";
        ctx.font = `800 ${Math.round(titleSize * 1.1)}px Georgia, 'Times New Roman', serif`;
        lines.forEach((line, index) => ctx.fillText(line, centerX, titleY + index * titleSize * 1.02));
      } else if (selectedStyle.layout === "script") {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.round(titleSize * 0.78)}px Arial Black, Impact, sans-serif`;
        ctx.fillText(lines[0] || form.title.toUpperCase(), centerX, titleY - titleSize * 0.28);
        ctx.fillStyle = "#7dd3fc";
        ctx.font = `italic 500 ${Math.round(titleSize * 0.82)}px Georgia, serif`;
        ctx.fillText(lines.slice(1).join(" ") || "", centerX, titleY + titleSize * 0.42);
      } else if (selectedStyle.layout === "editorial") {
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.round(titleSize * 0.75)}px Arial Black, Impact, sans-serif`;
        lines.forEach((line, index) => ctx.fillText(line, left, titleY + index * titleSize * 0.82));
      } else {
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.round(titleSize)}px Arial Black, Impact, sans-serif`;
        lines.forEach((line, index) => ctx.fillText(line, left, titleY + index * titleSize * 0.9));
      }

      ctx.shadowBlur = 14;
      ctx.fillStyle = selectedStyle.accentClass === "accentGold" ? "#f2c75c" : selectedStyle.accentClass === "accentBlue" ? "#7dd3fc" : "#ffffff";
      ctx.textAlign = selectedStyle.layout === "editorial" || selectedStyle.layout === "impact" ? "left" : "center";
      ctx.font = `800 ${Math.round(metaSize)}px Arial, sans-serif`;
      const meta = [form.speaker, form.scripture].filter(Boolean).join("  |  ").toUpperCase();
      const metaX = selectedStyle.layout === "editorial" || selectedStyle.layout === "impact" ? left : centerX;
      ctx.fillText(meta, metaX, height * 0.78);
      ctx.restore();

      if (result?.watermark) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,.13)";
        ctx.lineWidth = Math.max(2, width / 800);
        for (let x = -width; x < width * 2; x += width * 0.18) {
          ctx.beginPath();
          ctx.moveTo(x, height);
          ctx.lineTo(x + width * 0.6, 0);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(0,0,0,.55)";
        ctx.strokeStyle = "rgba(255,255,255,.3)";
        const wm = "SERMONGRAPHIC.COM PREVIEW";
        ctx.font = `900 ${Math.round(Math.max(18, height * 0.032))}px Arial, sans-serif`;
        const textWidth = ctx.measureText(wm).width;
        const pad = height * 0.025;
        const bx = width - textWidth - pad * 3;
        const by = height - pad * 3;
        ctx.beginPath();
        ctx.roundRect(bx, by, textWidth + pad * 2, pad * 2.2, 16);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(wm, bx + pad, by + pad * 1.1);
        ctx.restore();
      }
    };

    if (!result?.image) {
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imageRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let dx = 0;
      let dy = 0;
      if (imageRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
        dx = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = width / imageRatio;
        dy = (height - drawHeight) / 2;
      }
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      drawText();
    };
    img.src = result.image;
  }, [form, result, selectedAspect, selectedStyle]);

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${form.title || "sermon-graphic"}.png`.replace(/[^a-z0-9-_. ]/gi, "");
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main className="builder">
      <header className="builderHeader">
        <p className="eyebrow">Creative Director Sermon Graphic Builder</p>
        <h1>Create sermon graphics with a designer brain.</h1>
        <p>
          This builder creates a concept-first, text-free cinematic background and then overlays controlled typography in your SermonGraphic style.
        </p>
      </header>

      <section className="grid">
        <div className="panel">
          <div className="formGrid">
            <div className="field">
              <label>Sermon / Event Title</label>
              <input value={form.title} onChange={(event) => update("title", event.target.value)} />
            </div>
            <div className="field">
              <label>Scripture</label>
              <input value={form.scripture} onChange={(event) => update("scripture", event.target.value)} />
            </div>
            <div className="field">
              <label>Speaker</label>
              <input value={form.speaker} onChange={(event) => update("speaker", event.target.value)} />
            </div>
            <div className="field">
              <label>Theme / Direction</label>
              <textarea value={form.theme} onChange={(event) => update("theme", event.target.value)} />
            </div>
            <div className="two">
              <div className="field">
                <label>Style</label>
                <select value={form.style} onChange={(event) => update("style", event.target.value)}>
                  {styles.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Size</label>
                <select value={form.size} onChange={(event) => update("size", event.target.value)}>
                  {aspectRatios.map((ratio) => <option key={ratio.id} value={ratio.id}>{ratio.label}</option>)}
                </select>
              </div>
            </div>

            <div className="actions">
              <button className="primary" disabled={!!loading} onClick={() => callApi("/api/preview", "preview")}>
                {loading === "preview" ? "Generating Preview..." : "Generate Watermarked Preview"}
              </button>
              <button className="secondary" disabled={!!loading} onClick={() => callApi("/api/download", "download")}>
                {loading === "download" ? "Creating Clean Version..." : "Create Clean High-Res Version"}
              </button>
            </div>

            {error ? <div className="error">{error}</div> : null}
            <details className="notice">
              <summary>Content & Safety Policy</summary>
              <div style={{ marginTop: 10 }}>
                Sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery are blocked before generation.
              </div>
            </details>
            <div className="hint">Output: {selectedAspect.width}x{selectedAspect.height}. Preview is watermarked. High-res is clean.</div>
            <div className="hint">Quick theme ideas: {examples.join(" • ")}</div>
          </div>
        </div>

        <div className="panel stage">
          <div className="canvasShell">
            <div className="canvasWrap" style={{ aspectRatio: `${selectedAspect.width} / ${selectedAspect.height}` }}>
              <canvas ref={canvasRef} />
              {!result ? (
                <div className="placeholder">
                  <div>
                    <h2>Your graphic will appear here</h2>
                    <p>Generate a preview first. The AI creates the background; the browser handles the typography.</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          {result ? (
            <>
              <div className="resultTools">
                <button className="secondary" onClick={downloadCanvas}>Download Current PNG</button>
                <button className="secondary" disabled={!!loading} onClick={() => callApi("/api/preview", "preview")}>Try Another Preview</button>
              </div>
              <div className="concept"><strong>Creative concept:</strong> {result.concept}</div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
