import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, []);

  useEffect(() => {
    document.title = 'Platina One | Register';
  }, []);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Something went wrong');
      }

      navigate('/login');
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

          <h2 className="text-xl font-bold text-white mb-6 text-center">Regisztráció</h2>

          {error && <div className="text-red-400 text-sm mb-4 text-center">{error}</div>}

          <input
            type="text"
            placeholder="Felhasználónév"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Jelszó újra"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 mb-6 rounded bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded font-bold text-white transition-transform transform hover:scale-105"
          >
            ✨ Regisztráció
          </button>
        </div>
      </div>
    </>
  );
}