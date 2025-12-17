export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-extrabold">FiWe Interactive Books</h1>
      <p className="mt-2 text-slate-300">
        Demo flipbook + Phaser overlay.
      </p>

      <a
        className="mt-6 inline-block rounded-xl bg-white/10 px-4 py-3 font-semibold hover:bg-white/20"
        href="/book/demo"
      >
        Open Demo Book →
      </a>
    </main>
  );
}
