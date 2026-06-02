import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="shell">
        <span className="badge">SermonGraphic.com</span>
        <h1>Build church visuals instantly.</h1>
        <p className="sub">Create sermon graphics, flyers, stage screens, social posts, and church visual concepts using a safe, church-focused AI builder.</p>
        <p style={{ marginTop: 28 }}><Link className="secondary" href="/builder">Open Builder</Link></p>
      </div>
    </main>
  );
}
