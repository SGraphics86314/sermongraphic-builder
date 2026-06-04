"use client";

import { useMemo, useRef, useState } from "react";
import { aspectRatios, styles } from "../../lib/config";

type FormState = {
  title: string;
  scripture: string;
  theme: string;
  style: string;
  size: string;
};

const examples = [
  "flour sack in dark studio light, dust particles, tactile sermon object",
  "lens focusing a mountain scene, warm orange and blue cinematic contrast",
  "dark cavern with a beam of light cutting through dust",
  "hourglass with coral sand, minimalist studio lighting",
  "desert road toward mountains, warm sunset, journey metaphor"
];

function textLines(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [title.toUpperCase()];
  if (words.length === 3) return [words.slice(0, 2).join(" ").toUpperCase(), words[2].toUpperCase()];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" ").toUpperCase(), words.slice(mid).join(" ").toUpperCase()];
}

export default function BuilderPage() {
  const [form, setForm] = useState<FormState>({
    title: "God Is Here",
    scripture: "Ezekiel 48:35",
    theme: "restoration, hope, divine presence, modern cinematic atmosphere",
    style: "premium-metaphor",
    size: "hd"
  });
  const [image, setImage] = useState<string>("");
  const [mode, setMode] = useState<"preview" | "download" | "">("");
  const [loading, setLoading] = useState<"preview" | "download" | "">("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedAspect = useMemo(() => aspectRatios.find((item) => item.id === form.size) || aspectRatios[0], [form.size]);
  const selectedStyle = useMemo(() => styles.find((item) => item.id === form.style) || styles[0], [form.style]);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function callApi(endpoint: string, nextMode: "preview" | "download") {
    setError("");
    setLoading(nextMode);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setImage(data.image);
      setMode(nextMode);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading("");
    }
  }

  async function downloadComposited() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title || "sermon-graphic"}.png`;
    a.click();
  }

  const lines = textLines(form.title);

  return (
    <main className="builderShell">
      <section className="heroBlock">
        <p className="pill">SermonGraphic.com Builder</p>
        <h1>Create concept-driven sermon graphics.</h1>
        <p>Built around your style: one strong visual metaphor, cinematic lighting, and controlled typography.</p>
      </section>

      <section className="workspace">
        <div className="panel formPanel">
          <label>Sermon / Event Title</label>
          <input value={form.title} onChange={(event) => update("title", event.target.value)} />

          <label>Scripture</label>
          <input value={form.scripture} onChange={(event) => update("scripture", event.target.value)} />

          <label>Theme / Visual Direction</label>
          <textarea value={form.theme} onChange={(event) => update("theme", event.target.value)} />

          <div className="twoCol">
            <div className="field">
              <label>Design Style</label>
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
            <button className="primary" disabled={!!loading} onClick={() => callApi("/api/preview", "preview")}>{loading === "preview" ? "Creating Preview..." : "Generate Free Preview"}</button>
            <button className="secondary" disabled={!!loading || !image} onClick={() => callApi("/api/download", "download")}>{loading === "download" ? "Creating High-Res..." : "Purchase / Create High-Res"}</button>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <details className="notice">
            <summary>Content & Safety Policy</summary>
            <div>Safety filters block sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery before generation.</div>
          </details>

          <div className="hint">Selected output: {selectedAspect.width}x{selectedAspect.height}. Preview is watermarked. High-res is clean.</div>
          <div className="hint">Quick theme ideas: {examples.join(" • ")}</div>
        </div>

        <div className="panel stage">
          <div className="canvasFrame" style={{ aspectRatio: `${selectedAspect.width} / ${selectedAspect.height}` }}>
            {image ? (
              <div className={`poster typography-${selectedStyle.typography}`}>
                <img src={image} alt="Generated sermon background" />
                <div className="darken" />
                <div className="titleLayer">
                  {selectedStyle.typography === "script" ? (
                    <>
                      <div className="titleSmall">{lines[0] || form.title}</div>
                      <div className="titleScript">{lines[1] || lines[0] || form.title}</div>
                    </>
                  ) : selectedStyle.typography === "serif" ? (
                    lines.map((line, i) => <div className="titleSerif" key={i}>{line}</div>)
                  ) : selectedStyle.typography === "condensed" ? (
                    lines.map((line, i) => <div className="titleCondensed" key={i}>{line}</div>)
                  ) : selectedStyle.typography === "split" ? (
                    <>
                      <div className="titleBlock">{lines[0] || form.title}</div>
                      <div className="titleAccent">{lines[1] || ""}</div>
                    </>
                  ) : (
                    lines.map((line, i) => <div className="titleBold" key={i}>{line}</div>)
                  )}
                  <div className="meta">PASTOR NAME&nbsp;&nbsp;|&nbsp;&nbsp;{form.scripture.toUpperCase()}</div>
                </div>
                {mode === "preview" ? <div className="watermark">SERMONGRAPHIC.COM PREVIEW</div> : null}
              </div>
            ) : (
              <div className="emptyState">
                <h2>Your graphic will appear here</h2>
                <p>Generate a text-free cinematic background, then the builder overlays clean typography.</p>
              </div>
            )}
          </div>

          {image ? <button className="downloadBtn" onClick={downloadComposited}>Download Current PNG</button> : null}
          <canvas ref={canvasRef} className="hiddenCanvas" width={selectedAspect.width} height={selectedAspect.height} />
        </div>
      </section>
    </main>
  );
}
