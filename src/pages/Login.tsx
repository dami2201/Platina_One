import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    document.title = 'Platina One | Login';
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Something went wrong');
      }

      const userData = await res.json();
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12 animate-fadeIn">
        <div className="w-full max-w-md bg-neutral-900 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-center text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-8">
            Platina One
          </h1>

          <h2 className="text-xl font-bold text-white mb-6 text-center">Bejelentkezés</h2>

          {error && <div className="text-red-400 text-sm mb-4 text-center">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold text-white transition-transform transform hover:scale-105"
          >
            🚀 Belépés
          </button>
        </div>
      </div>
    </>
  );
}