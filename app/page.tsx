import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home">
      <div className="heroCard">
        <p className="eyebrow">SermonGraphic.com</p>
        <h1>Concept-first sermon graphics.</h1>
        <p className="lead">Generate a cinematic, text-free background, then apply professional typography in the browser.</p>
        <Link href="/builder" className="primaryLink">Open Builder</Link>
      </div>
    </main>
  );
}
