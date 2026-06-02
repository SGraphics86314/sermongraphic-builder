"use client";

import { useState } from "react";
import { aspectRatios, styles } from "../../lib/presets";

export default function BuilderPage() {
  const [title, setTitle] = useState("");
  const [scripture, setScripture] = useState("");
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState(styles[0]);
  const [ratioId, setRatioId] = useState("hd");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, scripture, theme, style, ratioId, customWidth, customHeight })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="header">
          <div>
            <span className="badge">AI Sermon Graphic Builder</span>
            <h1>Create church-ready graphics.</h1>
            <p className="sub">Generate clean, professional sermon art, stage visuals, church flyers, and social graphics with built-in safety rules for church-appropriate output.</p>
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
              <textarea value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Restoration, God's presence, hope after brokenness..." />
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
            <button className="btn" onClick={generate} disabled={loading || !title.trim()}>{loading ? "Generating..." : "Generate Graphic"}</button>
            {error && <div className="error">{error}</div>}
            <div className="safety">Backend safety filters are active. Sexual content, nudity, gore, gross imagery, graphic violence, and self-harm imagery are blocked before generation.</div>
          </section>

          <section className="card preview">
            {!image ? (
              <div className="placeholder">
                <h2>Your graphic will appear here</h2>
                <p>Enter a sermon title, scripture, theme, and format. Then generate a church-ready visual.</p>
              </div>
            ) : (
              <div>
                <img className="resultImage" src={image} alt="Generated sermon graphic" />
                <div className="actions">
                  <a className="secondary" href={image} download="sermon-graphic.png">Download PNG</a>
                  <button className="secondary" onClick={generate}>Generate Another</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
