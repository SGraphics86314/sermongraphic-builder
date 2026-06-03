"use client";

import { useMemo, useState } from "react";
import { aspectRatios, styles } from "../../lib/config";

type FormState = {
  title: string;
  scripture: string;
  theme: string;
  style: string;
  size: string;
};

const examples = [
  "light breaking through storm clouds, hope after loss, modern abstract atmosphere",
  "restored city at dawn, warm light, peace after brokenness, cinematic depth",
  "dark valley becoming alive with golden light, clean negative space",
  "modern conference background, deep navy and gold, subtle texture, premium worship visual"
];

export default function BuilderPage() {
  const [form, setForm] = useState<FormState>({
    title: "God Is Here",
    scripture: "Ezekiel 48:35",
    theme: "restoration, hope, divine presence, modern cinematic atmosphere",
    style: "cinematic",
    size: "hd"
  });
  const [image, setImage] = useState<string>("");
  const [mode, setMode] = useState<"preview" | "download" | "">("");
  const [loading, setLoading] = useState<"preview" | "download" | "">("");
  const [error, setError] = useState("");

  const selectedAspect = useMemo(() => aspectRatios.find((item) => item.id === form.size) || aspectRatios[0], [form.size]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function callApi(endpoint: "/api/preview" | "/api/download", nextMode: "preview" | "download") {
    setError("");
    setLoading(nextMode);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setImage(data.image);
      setMode(nextMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading("");
    }
  }

  function downloadImage() {
    if (!image) return;
    const link = document.createElement("a");
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sermon-graphic";
    link.href = image;
    link.download = `${slug}-${mode || "graphic"}.png`;
    link.click();
  }

  return (
    <main className="page">
      <span className="badge">SermonGraphic.com Builder</span>
      <h1>Create church-ready graphics that don&apos;t look like cheap AI art.</h1>
      <p className="subtitle">Generate a clean AI background first, then let the app place polished title and scripture typography on top. Preview before committing to the high-res download.</p>

      <section className="grid">
        <div className="panel form">
          <div className="field">
            <label>Sermon / Event Title</label>
            <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="God Is Here" />
          </div>

          <div className="field">
            <label>Scripture</label>
            <input value={form.scripture} onChange={(event) => update("scripture", event.target.value)} placeholder="Ezekiel 48:35" />
          </div>

          <div className="field">
            <label>Theme / Direction</label>
            <textarea value={form.theme} onChange={(event) => update("theme", event.target.value)} placeholder="restoration, hope, divine presence, modern cinematic atmosphere" />
            <div className="hint">Tip: describe mood and metaphor, not clip art. Better: “light breaking through storm clouds.” Worse: “church with cross and Jesus.”</div>
          </div>

          <div className="row">
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
            <button className="primary" disabled={!!loading} onClick={() => callApi("/api/preview", "preview")}>{loading === "preview" ? "Generating Preview..." : "Generate Free Preview"}</button>
            <button className="secondary" disabled={!!loading || !image} onClick={() => callApi("/api/download", "download")}>{loading === "download" ? "Creating High-Res..." : "Purchase / Create High-Res Download"}</button>
          </div>

          {error ? <div className="error">{error}</div> : null}
          <div className="notice">Backend safety filters are active. Sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery are blocked before generation.</div>
          <div className="hint">Selected output: {selectedAspect.width}x{selectedAspect.height}. Preview is watermarked. High-res is clean.</div>

          <div className="hint">Quick theme ideas: {examples.join(" • ")}</div>
        </div>

        <div className="panel stage">
          <div className="canvasWrap">
            {image ? <img className="resultImage" src={image} alt="Generated sermon graphic" /> : (
              <div className="placeholder">
                <strong>Your graphic will appear here</strong>
                <span>Generate a watermarked preview first. If you like it, create the clean high-res download.</span>
              </div>
            )}
          </div>
          {image ? (
            <div className="resultActions">
              <button onClick={downloadImage}>Download Current PNG</button>
              <button onClick={() => callApi("/api/preview", "preview")} disabled={!!loading}>Try Another Preview</button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
