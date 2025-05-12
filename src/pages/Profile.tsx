import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loops, setLoops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Platina One | Profil';
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      fetch(`http://localhost:3001/api/user/${username}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('User nem található');
          }
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
          setLoops(data.loops);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, 1200); // 2 másodperces "kamu" késleltetés
  }, [username]);

  if (loading || !user) {
    return (
      <>
        <div className="flex flex-col items-center justify-center mt-32 text-white text-center animate-fadeInSlow">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-2xl">Profil betöltése folyamatban...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mt-10 p-6 animate-fadeIn">
        <div className="bg-neutral-900 p-8 rounded-2xl shadow-2xl mb-8">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            {user.username} profilja
          </h1>
          <p className="text-neutral-400 mb-1">📧 Email: {user.email}</p>
          <p className="text-neutral-400">🏅 Rank: {user.rank}</p>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-white">🎵 Loopok</h2>

        {loops.length === 0 ? (
          <p className="text-neutral-500 italic">Nincs feltöltött loop.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loops.map((loop) => (
              <div key={loop.id} className="p-4 bg-neutral-900 rounded-xl shadow-md hover:scale-[1.02] transition-all duration-200">
                <h2 className="text-lg font-bold text-white mb-1 truncate">{loop.title}</h2>
                {loop.description && (
                  <p className="text-neutral-400 text-sm mb-2 line-clamp-3">{loop.description}</p>
                )}
                <audio
                  controls
                  src={`http://localhost:3001/uploads/${loop.file_url}`}
                  className="w-full rounded"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  📅 {new Date(loop.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}