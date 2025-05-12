import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = 'Platina One | Vezérlőpult';
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white px-4 py-16 animate-fadeIn">
        <div className="max-w-5xl mx-auto bg-neutral-900 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Üdvözöllek, {user.username}! 🎶
          </h1>
          <p className="text-neutral-400 mb-10 text-lg">
            Nézd meg a loopjaidat, értékeld mások zenéit, vagy hozz létre új projektet!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/loops')}
              className="p-6 bg-purple-700 hover:bg-purple-800 rounded-xl font-bold text-white text-lg transition-transform hover:scale-105 shadow-md"
            >
              🎧 Böngéssz Loopokat
            </button>
            <button
              onClick={() => navigate('/daw')}
              className="p-6 bg-blue-700 hover:bg-blue-800 rounded-xl font-bold text-white text-lg transition-transform hover:scale-105 shadow-md"
            >
              🎚️ Nyisd meg a DAW-ot
            </button>
            <button
              onClick={() => navigate(`/profile/${user.username}`)}
              className="p-6 bg-green-700 hover:bg-green-800 rounded-xl font-bold text-white text-lg transition-transform hover:scale-105 shadow-md"
            >
              👤 Saját profilod
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="p-6 bg-red-700 hover:bg-red-800 rounded-xl font-bold text-white text-lg transition-transform hover:scale-105 shadow-md"
            >
              💬 Chat szoba
            </button>
          </div>
        </div>
      </div>
    </>
  );
}