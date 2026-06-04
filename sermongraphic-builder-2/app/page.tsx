import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <div>
        <p className="eyebrow">SermonGraphic.com</p>
        <h1>Concept-first sermon graphics.</h1>
        <p className="sub">Build church-ready visuals with cinematic metaphors and controlled typography.</p>
        <Link className="primaryLink" href="/builder">Open Builder</Link>
      </div>
    </main>
  );
}
