import { Link } from "react-router-dom";
import { useEffect } from 'react';

export default function Landing() {
  useEffect(() => {
    document.title = 'Platina One | Kezdőlap';
  }, []);

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">
        {/* HERO */}
        <div className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            Platina One
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-300 max-w-2xl">
            A modern zenei közösségi platform, ahol producerek, loopok és vibe-ok találkoznak.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-transform duration-300 transform hover:scale-105 shadow-md"
            >
              Regisztrálj most
            </Link>
            <Link
              to="/loops"
              className="bg-white text-black font-semibold py-3 px-8 rounded-xl hover:bg-neutral-200 transition-transform duration-300 transform hover:scale-105 shadow-md"
            >
              Böngéssz loopokat
            </Link>
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-black rounded-xl py-20 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slideUp">
          {[
            {
              title: "Loop library",
              desc: "Ezernyi loop a közösségtől, szűréssel és értékeléssel. Találd meg a tökéletes hangmintát a következő projektedhez.",
              icon: "🎶",
            },
            {
              title: "Online DAW",
              desc: "Egyszerű, drag-and-drop DAW, ami minden böngészőben működik. Készíts zenét bárhol, bármikor.",
              icon: "🎛️",
            },
            {
              title: "Live chat",
              desc: "Beszélgess más producerekkel, ossz meg ötleteket, vagy építs saját közösséget.",
              icon: "💬",
            },
            {
              title: "Profil oldal",
              desc: "Mutasd meg a munkáidat a világnak! Töltsd fel a zenéidet, és építsd a saját zenei portfóliódat.",
              icon: "👤",
            },
            {
              title: "Dashboard",
              desc: "Kezeld a projektjeidet, böngéssz a feltöltött loopok között, és értékeld mások munkáit.",
              icon: "📊",
            },
            {
              title: "Feltöltés",
              desc: "Töltsd fel saját loopjaidat, és oszd meg a közösséggel. Értékes visszajelzéseket kaphatsz más producerektől.",
              icon: "📤",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-800 hover:scale-[1.03] transition-all duration-300 flex flex-col items-start gap-3"
            >
              <div className="text-3xl">{f.icon}</div>
              <h2 className="text-xl font-bold text-white">{f.title}</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
