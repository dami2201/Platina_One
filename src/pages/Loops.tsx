import { useEffect, useState } from 'react';
import * as Tone from 'tone';
import LoopCard from '../components/LoopCard';

export default function Loops() {
  const [loops, setLoops] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    document.title = 'Platina One | Loopok';
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/loops')
      .then((res) => res.json())
      .then((data) => setLoops(data))
      .catch((err) => console.error('Hiba a loopok lekérésénél:', err));
  }, []);

  const handleUpload = async () => {
    if (!file || !title) {
      alert('Adj meg címet és válassz fájlt!');
      return;
    }

    await Tone.start(); // Ensure AudioContext is initialized

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user?.id) {
      alert('Be kell jelentkezned a feltöltéshez.');
      return;
    }

    const formData = new FormData();
    formData.append('loop', file);
    formData.append('user_id', user.id);
    formData.append('title', title);
    formData.append('description', description);

    await fetch('http://localhost:3001/api/loops/upload', {
      method: 'POST',
      body: formData,
    });

    const updated = await fetch('http://localhost:3001/api/loops').then((res) => res.json());
    setLoops(updated);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto mt-10 p-6 animate-fadeIn">
        <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Böngészd a Loopokat 🎶
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Loop lista */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loops.map((loop) => (
              <LoopCard key={loop.id} loop={loop} />
            ))}
          </div>

          {/* Feltöltés form oldalra tolva */}
          <div className="w-full md:w-80 bg-neutral-900 p-6 rounded-xl shadow-xl self-start">
            <h2 className="text-xl font-bold mb-4 text-white">Új Loop Feltöltése</h2>
            <input
              type="text"
              placeholder="Loop címe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-2 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Leírás (opcionális)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-2 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block mb-4 text-sm text-white"
            />
            <button
              onClick={handleUpload}
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold text-white transition-transform transform hover:scale-105"
            >
              🚀 Feltöltés
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
