import { useEffect, useState } from 'react';
import * as Tone from 'tone';

export default function LoopCard({ loop }: { loop: any }) {
  const [ratings, setRatings] = useState({ gold: 0, diamond: 0, platina: 0 });
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/loops/${loop.id}/ratings`)
      .then((res) => res.json())
      .then((data) => setRatings(data));

    fetch(`http://localhost:3001/api/loops/${loop.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [loop.id]);

  const initializeAudioContext = async () => {
    await Tone.start();
    console.log('AudioContext initialized');
  };

  const handleRate = async (ratingValue: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) {
      alert('Be kell jelentkezned az értékeléshez!');
      return;
    }

    {comments.length > 0 && (
        <div className="mt-4 bg-neutral-800 p-3 rounded text-sm text-white">
          <p className="font-bold mb-2">💬 Kommentek:</p>
          {comments.map((c, i) => (
            <div key={i} className="mb-2 border-b border-neutral-700 pb-1">
              <p><span className="text-purple-400">{c.username}</span>: {c.comment}</p>
              <p className="text-neutral-400 text-xs">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
      
    await fetch('http://localhost:3001/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        loop_id: loop.id,
        rating: ratingValue || 0,
        comment: comment || null
      })
    });
  
    // értékelés újratöltése
    const fresh = await fetch(`http://localhost:3001/api/loops/${loop.id}/ratings`).then(res => res.json());
    setRatings(fresh);
    setComment('');
  };

  return (
    <div className="p-4 bg-neutral-900 rounded-lg shadow-md">
      <h2 className="text-lg font-bold text-white">{loop.title}</h2>
      {loop.description && (
        <p className="text-neutral-400 text-sm mb-2">{loop.description}</p>
      )}
      <p className="text-sm text-purple-400">Feltöltötte: {loop.username}</p>

      <audio
        controls
        src={loop.file_url || ''} // Use the file_url directly as it already contains the full URL
        className="w-full mt-2"
        onPlay={initializeAudioContext}
        onError={(e) => {
          console.error('Playback error:', e);
          
        }}
      />
      {!loop.file_url && (
        <p className="text-red-500 text-sm mt-2">Hiba: A loop fájl URL-je hiányzik.</p>
      )}

      <p className="text-xs text-neutral-500 mt-1">
        {new Date(loop.created_at).toLocaleString()}
      </p>

      {/* Értékelés gombok */}
      <div className="mt-3 flex justify-between items-center gap-2">
        <button
          onClick={() => handleRate(1)}
          className="text-yellow-400 hover:scale-110 transition"
        >
          ⭐ {ratings.gold}
        </button>
        <button
          onClick={() => handleRate(2)}
          className="text-cyan-400 hover:scale-110 transition"
        >
          💎 {ratings.diamond}
        </button>
        <button
          onClick={() => handleRate(3)}
          className="text-pink-400 hover:scale-110 transition"
          
        >
          💿 {ratings.platina}
        </button>

        <div className="mt-4">
          <textarea
            placeholder="Írj kommentet a loophoz..."
            className="w-full p-2 bg-neutral-800 rounded text-white text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={() => {
              if (comment.trim()) handleRate(0); // 0 = csak komment
            }}
            className="mt-2 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-1 rounded text-sm"
          >
            💬 Komment küldése TODO
          </button>
        </div>
      </div>
    </div>
  );
}
