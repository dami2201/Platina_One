import { Link } from 'react-router-dom';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <header className="bg-black border-b border-neutral-800 px-6 py-4 flex justify-between items-center shadow-md animate-fadeIn">
      <Link to="/">
        <img
          src="https://cdn.discordapp.com/attachments/1366475946001039380/1371321915255558174/feher.png?ex=6822b68e&is=6821650e&hm=f77b168854ea41e029c41f0bd78850e4b7e81af94bd765d36d62ecf09d60eadb&"
          alt="Platina One Logo"
          className="w-50 h-10 hover:scale-110 transition-transform duration-300"
        />
      </Link>

      <nav className="flex flex-wrap gap-4 items-center text-sm sm:text-base text-neutral-300 font-medium">
        <Link to="/loops" className="hover:text-white hover:scale-110 transition-transform duration-200">Loopok</Link>
        <Link to="/daw" className="hover:text-white hover:scale-110 transition-transform duration-200">DAW</Link>
        <Link to="/NullTest" className="hover:text-white hover:scale-110 transition-transform duration-200">Null Test</Link>
        <Link to="/chat" className="hover:text-white hover:scale-110 transition-transform duration-200">Csevegés</Link>
        <Link to="/dashboard" className="hover:text-white hover:scale-110 transition-transform duration-200">Vezérlőpult</Link>

        {!user ? (
          <>
            <Link to="/login" className="hover:text-white hover:scale-110 transition-transform duration-200">Bejelentkezés</Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 hover:scale-105 transition-transform duration-300"
            >
              Regisztráció
            </Link>
          </>
        ) : (
          <>
            <Link
              to={`/profile/${user.username}`}
              className="text-blue-400 hover:underline underline-offset-2 hover:scale-110 transition-transform duration-200"
            >
              {user.username}
            </Link>
           <button
  onClick={() => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }}
  className="hover:text-white hover:scale-110 transition-transform duration-200 text-neutral-300 flex items-center gap-2 group cursor-pointer"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors duration-200"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7"
    />
  </svg>
  <span className="group-hover:text-red-500 transition-colors duration-200">Kijelentkezés</span>
</button>

          </>
        )}
      </nav>
    </header>
  );
}