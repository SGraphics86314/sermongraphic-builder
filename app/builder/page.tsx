"use client";

import { useMemo, useState } from "react";
import { aspectRatios, styles } from "../../lib/presets";

type ApiResponse = {
  image?: string;
  error?: string;
  requestedSize?: { width: number; height: number; label: string };
  generatedSize?: string;
  watermarked?: boolean;
  paymentRequired?: boolean;
  charged?: boolean;
  mode?: "preview" | "download" | "legacy-generate";
};

export default function BuilderPage() {
  const [title, setTitle] = useState("God Is Here");
  const [scripture, setScripture] = useState("Ezekiel 48:35");
  const [theme, setTheme] = useState("Restoration, peace, warm light, modern premium atmosphere");
  const [style, setStyle] = useState(styles[0]);
  const [ratioId, setRatioId] = useState("hd");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ApiResponse | null>(null);

  const selectedSize = useMemo(() => aspectRatios.find((r) => r.id === ratioId), [ratioId]);
  const activeImage = finalImage || previewImage;
  const hasPreview = Boolean(previewImage);

  const payload = { title, scripture, theme, style, ratioId, customWidth, customHeight };

  async function callImageApi(endpoint: "/api/preview" | "/api/download") {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data: ApiResponse = await response.json();
    if (!response.ok) throw new Error(data.error || "Generation failed.");
    if (!data.image) throw new Error("No image was returned.");
    return data;
  }

  async function generatePreview() {
    setPreviewLoading(true);
    setError(null);
    setFinalImage(null);
    setMeta(null);

    try {
      const data = await callImageApi("/api/preview");
      setPreviewImage(data.image || null);
      setMeta(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function generateHighResDownload() {
    setDownloadLoading(true);
    setError(null);
    setMeta(null);

    try {
      const data = await callImageApi("/api/download");
      setFinalImage(data.image || null);
      setMeta(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDownloadLoading(false);
    }
  }

  function downloadCurrentImage() {
    if (!finalImage) return;
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = `${title || "sermon-graphic"}-${selectedSize?.width || "custom"}x${selectedSize?.height || "size"}.png`;
    link.click();
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="header">
          <div>
            <span className="badge">SermonGraphic.com Builder</span>
            <h1>Create church-ready graphics.</h1>
            <p className="sub">Generate a watermarked preview first. The AI creates a text-free background, then SermonGraphic.com adds clean professional typography.</p>
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <div className="field">
              <label>Sermon / Event Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="God Is Here" />
            </div>
            <div className="field">
              <label>Scripture</label>
              <input value={scripture} onChange={(e) => setScripture(e.target.value)} placeholder="Ezekiel 48:35" />
            </div>
            <div className="field">
              <label>Theme / Direction</label>
              <textarea value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Simple direction: restoration, peace, city at dawn, storm clearing, bold and modern..." />
            </div>
            <div className="row">
              <div className="field">
                <label>Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  {styles.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Size</label>
                <select value={ratioId} onChange={(e) => setRatioId(e.target.value)}>
                  {aspectRatios.map((r) => <option key={r.id} value={r.id}>{r.group}: {r.label} ({r.width}x{r.height})</option>)}
                  <option value="custom">Custom Size</option>
                </select>
              </div>
            </div>
            {ratioId === "custom" && (
              <div className="row">
                <div className="field"><label>Custom Width</label><input value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} placeholder="4096" /></div>
                <div className="field"><label>Custom Height</label><input value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} placeholder="1152" /></div>
              </div>
            )}
            {selectedSize && <div className="hint">Selected final target: {selectedSize.width}x{selectedSize.height}. Preview is watermarked. High-res download is clean.</div>}

            <button className="btn" onClick={generatePreview} disabled={previewLoading || downloadLoading || !title.trim()}>
              {previewLoading ? "Generating Preview..." : "Generate Free Preview"}
            </button>

            <button className="btn dark" onClick={generateHighResDownload} disabled={downloadLoading || previewLoading || !hasPreview}>
              {downloadLoading ? "Creating High-Res..." : "Purchase / Create High-Res Download"}
            </button>

            {finalImage && <button className="secondary full" onClick={downloadCurrentImage}>Download Clean PNG</button>}
            {!hasPreview && <div className="note">High-res download stays locked until a preview has been generated. Previews are watermarked; clean files are created only after approval.</div>}
            {error && <div className="error">{error}</div>}
            <div className="safety">Backend safety filters are active. Sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery are blocked before generation.</div>
          </section>

          <section className="card preview">
            {!activeImage ? (
              <div className="placeholder">
                <h2>Your designed preview will appear here</h2>
                <p>The AI generates a clean background only. The app adds the sermon title and scripture with controlled typography so the result does not look like cheap AI text art.</p>
              </div>
            ) : (
              <div className="resultWrap">
                <img className="resultImage" src={activeImage} alt={finalImage ? "Final sermon graphic" : "Watermarked sermon graphic preview"} />
                {meta && <p className="meta">Mode: {meta.mode}. Base generated: {meta.generatedSize}. Target: {meta.requestedSize?.width}x{meta.requestedSize?.height}. {meta.watermarked ? "Watermarked preview." : "Clean high-res output."}</p>}
                <div className="actions">
                  <button className="secondary" onClick={generatePreview} disabled={previewLoading || downloadLoading}>{previewLoading ? "Generating..." : "Generate New Preview"}</button>
                  <button className="secondary" onClick={generateHighResDownload} disabled={downloadLoading || previewLoading || !hasPreview}>{downloadLoading ? "Creating..." : "Create Clean Download"}</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
