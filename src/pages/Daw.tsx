import React, { useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';
import WaveSurfer from 'wavesurfer.js';
import WavEncoder from 'wav-encoder';

interface Track {
  id: string;
  file: File | null;
  url: string | null;
  player: Tone.Player | null;
  waveform: WaveSurfer | null | undefined;
  loaded: boolean;
  duration: number;
  gain: number;
  pan: number;
  panner: Tone.Panner | null;
  offset: number;
  startInFile: number;
  left: number;
}

type Action = {
  type: 'move' | 'cut' | 'delete' | 'add' | 'duplicate';
  payload: any;
};

const Daw: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [zoom, setZoom] = useState(100);
  const [lastStopTime, setLastStopTime] = useState(0);
  const [history, setHistory] = useState<Action[]>([]);
  const [markers, setMarkers] = useState<number[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const maxDuration = Math.max(...tracks.map((t) => (t.duration || 0) + t.offset), 0);

  const updatePlayhead = () => {
    const now = Tone.Transport.seconds;

    tracks.forEach((track) => {
      const start = track.offset;
      const end = start + (track.duration || 0);
      if (now >= start && now < end) {
        const localTime = now - start;
        const startInFile = track.startInFile || 0;
        if (!track.player?.state || track.player?.state === 'stopped') {
          try {
            track.player?.start(Tone.now(), startInFile + localTime);
          } catch {}
        }
      } else {
        try {
          track.player?.stop();
        } catch {}
      }
    });

    if (playheadRef.current) {
      playheadRef.current.style.left = `${now * zoom}px`;
      const timeDisplay = document.getElementById('time-display');
      if (timeDisplay) {
        const minutes = Math.floor(now / 60);
        const seconds = Math.floor(now % 60);
        const centiseconds = Math.floor((now % 1) * 100);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
      }
    }

    if (now >= maxDuration) {
      handleStop();
      return;
    }

    animationRef.current = requestAnimationFrame(updatePlayhead);
  };

  const loadWaveform = (track: Track) => {
    if (!track.url) return;
    const container = document.querySelector(`#${CSS.escape(track.id)}`) as HTMLElement | null;
    if (!container) return;
    const waveform = WaveSurfer.create({
      container,
      waveColor: '#ff7700',
      progressColor: '#00ffcc',
      height: 50,
      barWidth: 2,
      barGap: 1,
      normalize: true,
      interact: false,
    });
    waveform.load(track.url);
    waveform.on('ready', () => {
      const duration = waveform.getDuration();
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? { ...t, waveform, loaded: true, duration }
            : t
        )
      );
    });

    // Hiba esetén is frissítjük a loaded állapotot
    waveform.on('error', () => {
      console.error(`Hiba történt a sáv betöltésekor: ${track.id}`);
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? { ...t, loaded: false }
            : t
        )
      );
    });
  };

  const handlePlay = async () => {
    await Tone.start(); // Ensure AudioContext starts after user interaction
    Tone.Transport.seconds = lastStopTime;
    tracks.forEach((track) => {
      if (track.loaded && track.player) {
        try {
          const offset = lastStopTime - track.offset;
          if (offset >= 0 && offset <= (track.duration || 0)) {
            const startInFile = track.startInFile || 0;
            track.player.start(Tone.now(), startInFile + offset);
          }
        } catch {}
      }
    });
    Tone.Transport.start('+0.1');
    animationRef.current = requestAnimationFrame(updatePlayhead);
  };

  const handlePause = () => {
    setLastStopTime(Tone.Transport.seconds);
    Tone.Transport.pause();
    tracks.forEach((track) => track.player?.stop());
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleStop = () => {
    setLastStopTime(0);
    Tone.Transport.stop();
    tracks.forEach((track) => track.player?.stop());
    if (playheadRef.current) playheadRef.current.style.left = '0px';
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seconds = clickX / zoom;
    Tone.Transport.seconds = seconds;
    setLastStopTime(seconds);
    setMarkers((prev) => [...prev, seconds]);
    if (playheadRef.current) playheadRef.current.style.left = `${clickX}px`;
  };

  const handleZoomChange = (value: number) => {
    setZoom((prev) => Math.max(10, prev + value));
  };

  const handleTrackDrag = (e: React.MouseEvent, id: string) => {
    const track = tracks.find((t) => t.id === id);
    if (!track) return;
    setSelectedTrackId(id);
    const startX = e.clientX;
    const startLeft = track.left;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newLeft = Math.round(Math.max(0, startLeft + delta) / 10) * 10;
      const newOffset = newLeft / zoom;
      setTracks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, left: newLeft, offset: newOffset } : t))
      );
    };
    const handleMouseUp = () => {
      setHistory((prev) => [...prev, { type: 'move', payload: { id, from: track.left, to: track.left } }]);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleUndo = () => {
    const lastAction = history.pop();
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'cut': {
        setTracks(lastAction.payload);
        break;
      }
      case 'delete': {
        setTracks((prev) => [...prev, lastAction.payload]);
        break;
      }
      case 'add': {
        setTracks((prev) => prev.filter((t) => t.id !== lastAction.payload.id));
        break;
      }
      case 'duplicate': {
        setTracks((prev) => prev.filter((t) => t.id !== lastAction.payload.id));
        break;
      }
      case 'move': {
        const { id, from } = lastAction.payload;
        setTracks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, left: from, offset: from / zoom } : t))
        );
        break;
      }
      default:
        break;
    }
  };

  const handleCutAtPlayhead = () => {
    const position = Tone.Transport.seconds;
    const updatedTracks: Track[] = [];

    tracks.forEach((track) => {
      const trackStart = track.offset;
      const trackEnd = trackStart + (track.duration || 0);

      if (!track.loaded || position <= trackStart || position >= trackEnd) {
        updatedTracks.push(track);
        return;
      }

      const cutPosition = position - trackStart;
      const leftTrackId = `${track.id}_L_${Date.now()}`;
      const rightTrackId = `${track.id}_R_${Date.now()}`;

      const leftTrack: Track = {
        ...track,
        id: leftTrackId,
        duration: cutPosition,
        player: new Tone.Player({ url: track.url || undefined, autostart: false }).toDestination(),
        gain: track.gain,
        pan: track.pan,
        panner: track.panner,
      };

      const rightTrack: Track = {
        ...track,
        id: rightTrackId,
        duration: (track.duration || 0) - cutPosition,
        offset: track.offset + cutPosition,
        left: track.left + cutPosition * zoom,
        player: new Tone.Player({ url: track.url || undefined, autostart: false }).toDestination(),
        gain: track.gain,
        pan: track.pan,
        panner: track.panner,
      };

      updatedTracks.push(leftTrack, rightTrack);

      setTimeout(() => {
        loadWaveform(leftTrack);
        loadWaveform(rightTrack);
      }, 100);
    });

    setTracks(updatedTracks);
    setHistory((prev) => [
      ...prev,
      { type: 'cut', payload: tracks.map(({ waveform, ...rest }) => rest) },
    ]);

    Tone.Transport.seconds = position;
    setLastStopTime(position);
  };

  const handleDuplicate = () => {
    const track = tracks.find((t) => t.id === selectedTrackId);
    if (!track) return;
    const newTrack = {
      ...track,
      id: `dup_${Date.now()}`,
      left: track.left + (track.duration || 0) * zoom,
      offset: track.offset + (track.duration || 0),
    };
    setTracks((prev) => [...prev, newTrack]);
    setHistory((prev) => [...prev, { type: 'duplicate', payload: newTrack }]);
  };

  const handleDelete = () => {
    const track = tracks.find((t) => t.id === selectedTrackId);
    if (!track) return;

    setTracks((prev) =>
      prev.map((t) =>
        t.id === track.id
          ? { ...t, file: null, url: null, player: null, waveform: null, loaded: false, duration: 0 }
          : t
      )
    );
  };

  const handleTrackGainChange = (id: string, value: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === id
          ? { ...track, gain: value }
          : track
      )
    );
    const track = tracks.find((t) => t.id === id);
    if (track?.player) {
      track.player.volume.value = value;
    }
  };

  const handleTrackPanChange = (id: string, value: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === id
          ? { ...track, pan: value }
          : track
      )
    );
    const track = tracks.find((t) => t.id === id);
    if (track?.panner) {
      track.panner.pan.value = value;
    }
  };

  const handleDragStart = (e: React.DragEvent, trackId: string) => {
    e.dataTransfer.setData('trackId', trackId);
  };

  const handleDrop = (e: React.DragEvent, targetTrackId: string) => {
    e.preventDefault();
    const draggedTrackId = e.dataTransfer.getData('trackId');
    if (!draggedTrackId || draggedTrackId === targetTrackId) return;

    const draggedTrack = tracks.find((t) => t.id === draggedTrackId);
    const targetTrack = tracks.find((t) => t.id === targetTrackId);

    if (draggedTrack && targetTrack) {
      setTracks((prev) =>
        prev.map((track) => {
          if (track.id === draggedTrackId) {
            return { ...track, file: targetTrack.file, url: targetTrack.url };
          } else if (track.id === targetTrackId) {
            return { ...track, file: draggedTrack.file, url: draggedTrack.url };
          }
          return track;
        })
      );
    }
  };

  const handleDropOnTrack = (e: React.DragEvent<HTMLDivElement>, targetTrackId: string) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('audio/')) {
      console.error('Csak audio fájlokat lehet betölteni.');
      return;
    }

    const targetTrack = tracks.find((t) => t.id === targetTrackId);
    if (!targetTrack) {
      console.error('A cél track nem található.');
      return;
    }

    const url = URL.createObjectURL(file);
    const player = new Tone.Player({ url, autostart: false }).toDestination();
    const panner = new Tone.Panner(0).toDestination();
    player.connect(panner);

    setTracks((prev) =>
      prev.map((track) =>
        track.id === targetTrackId
          ? { ...track, file, url, player, panner, loaded: false }
          : track
      )
    );

    setTimeout(() => {
      loadWaveform({ ...targetTrack, url });
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, trackId: string) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('audio/')) {
      console.error('Csak audio fájlokat lehet betölteni.');
      return;
    }

    const url = URL.createObjectURL(file);
    const player = new Tone.Player({ url, autostart: false }).toDestination();
    const panner = new Tone.Panner(0).toDestination();
    player.connect(panner);

    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId
          ? { ...track, file, url, player, panner, loaded: false }
          : track
      )
    );

    setTimeout(() => {
      const targetTrack = tracks.find((t) => t.id === trackId);
      if (targetTrack) {
        loadWaveform({ ...targetTrack, url });
      }
    }, 100);
  };

  const handleExport = async () => {
    if (tracks.length === 0) {
      console.error('Nincsenek sávok az exportáláshoz.');
      return;
    }

    // Ellenőrzés: minden sáv betöltve van-e
    const unloadedTracks = tracks.filter((track) => !track.loaded);
    if (unloadedTracks.length > 0) {
      console.error('Nem minden sáv van betöltve. Kérjük, várjon, amíg a sávok betöltődnek.');
      return;
    }

    // Ellenőrzés: maxDuration > 0
    if (maxDuration <= 0) {
      console.error('A sávok hossza érvénytelen az exportáláshoz.');
      return;
    }

    try {
      await Tone.start(); // Ensure AudioContext starts after user interaction

      const renderedBuffer = await Tone.Offline(({ transport }) => {
        tracks.forEach((track) => {
          if (track.player && track.loaded) {
            const player = new Tone.Player({
              url: track.url || undefined,
              autostart: false,
            }).toDestination();

            player.volume.value = track.gain;
            const panner = new Tone.Panner(track.pan).toDestination();
            player.connect(panner);

            player.start(track.offset);
          }
        });

        transport.start();
      }, maxDuration);

      if (!renderedBuffer) {
        console.error('Nem sikerült renderelni az audiót.');
        return;
      }

      const channelData = [];
      for (let i = 0; i < renderedBuffer.numberOfChannels; i++) {
        channelData.push(renderedBuffer.getChannelData(i));
      }

      const wavData = await WavEncoder.encode({
        sampleRate: renderedBuffer.sampleRate,
        channelData,
      });

      const wavBlob = new Blob([wavData], { type: 'audio/wav' });
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_audio.wav';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Hiba történt az exportálás során:', error);
    }
  };

  useEffect(() => {
    if (tracks.length === 0) {
      const initialTracks = Array.from({ length: 4 }, (_, i) => ({
        id: `track_${i + 1}`,
        file: null,
        url: null,
        player: null,
        waveform: null,
        loaded: false,
        duration: 0,
        gain: 0,
        pan: 0,
        panner: null,
        offset: 0,
        startInFile: 0,
        left: 0,
      }));
      setTracks(initialTracks);
    }
  }, [tracks]);

  useEffect(() => {
    document.title = 'Platina One | DAW';
  }, []);

  return (
  <div className="bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] text-white min-h-screen font-sans">
    {/* Header */}
    <div className="p-6 bg-[#111] shadow-lg flex items-center justify-between border-b border-[#333] animate-fadeIn">
      <h1 className="text-3xl font-extrabold text-[#00ffcc] tracking-tight">🎧 Platina DAW</h1>
      <div className="flex items-center gap-4">
        <div id="time-display" className="text-xl font-bold text-white bg-black px-4 py-2 rounded shadow-md">
          0:00:00
        </div>
        <button onClick={handlePlay} className="bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ▶ Play
        </button>
        <button onClick={handlePause} className="bg-[#ffaa00] hover:bg-[#e69a00] text-black font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ⏸ Pause
        </button>
        <button onClick={handleStop} className="bg-[#ff4444] hover:bg-[#e63c3c] text-black font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ⏹ Stop
        </button>
        <button onClick={handleUndo} className="bg-[#8884ff] hover:bg-[#776bff] text-white font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ↩ Undo
        </button>
        <button onClick={handleCutAtPlayhead} className="bg-[#ffcc00] hover:bg-[#e6b800] text-black font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ✂ Cut
        </button>
        <button onClick={handleDuplicate} className="bg-[#00ccff] hover:bg-[#00b8e6] text-black font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ⧉ Duplicate
        </button>
        <button onClick={handleDelete} className="bg-[#ff6666] hover:bg-[#e65c5c] text-white font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          🗑 Delete
        </button>
        <button onClick={handleExport} className="bg-[#00ff66] hover:bg-[#00e65c] text-black font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ⬇ Export WAV
        </button>
        <button onClick={() => handleZoomChange(10)} className="bg-[#8884ff] hover:bg-[#776bff] text-white font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ➕ Zoom In
        </button>
        <button onClick={() => handleZoomChange(-10)} className="bg-[#8884ff] hover:bg-[#776bff] text-white font-semibold px-5 py-2 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
          ➖ Zoom Out
        </button>
      </div>
    </div>

    {/* Track Controls */}
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-slideUp">
      {tracks.map((track, i) => (
        <div key={track.id} className="bg-[#2b2b2b] rounded-xl p-4 shadow-inner border border-[#3a3a3a] transition hover:scale-[1.02]">
          <h2 className="text-lg font-bold text-[#00ffcc] mb-2">🎚️ Track {i + 1}</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileSelect(e, track.id)}
            className="mb-2 text-sm text-gray-300 file:cursor-pointer file:border-0 file:bg-[#00ffcc] file:text-black file:px-3 file:py-1 file:rounded-md hover:file:bg-[#00e6b8]"
          />
          <div className="mb-2">
            <label className="block text-sm text-gray-400">Gain</label>
            <input
              type="range"
              min="-60"
              max="0"
              value={track.gain}
              onChange={(e) => handleTrackGainChange(track.id, parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Pan</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={track.pan}
              onChange={(e) => handleTrackPanChange(track.id, parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      ))}
    </div>

    {/* Timeline */}
    <div
      ref={containerRef}
      className="relative w-full h-[500px] bg-[#1e1e1e] overflow-auto border-t border-[#444] animate-fadeInSlow"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, selectedTrackId || '')}
    >
      <div ref={playheadRef} className="absolute top-0 bottom-0 w-[2px] bg-[#00ffcc] z-50 transition-all duration-75"></div>
      <div className="relative" style={{ width: `${maxDuration * zoom}px` }}>
        {/* Ruler */}
        <div className="relative w-full h-10 bg-[#2d2d2d] border-b border-[#444]" onClick={handleRulerClick}>
          {[...Array(200)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-gray-600 text-xs text-white text-center"
              style={{ left: `${i * zoom}px`, width: `${zoom}px` }}
            >
              {i + 1}
            </div>
          ))}
          {markers.map((m, i) => (
            <div key={i} style={{ left: `${m * zoom}px` }} className="absolute top-0 bottom-0 w-[2px] bg-green-400" />
          ))}
        </div>

        {/* Tracks */}
        {tracks.map((track, i) => (
          <div
            key={track.id}
            className={`absolute h-[100px] px-2 py-1 border-b border-[#555] rounded-md shadow transition-all duration-200 cursor-pointer ${selectedTrackId === track.id ? 'bg-[#444] scale-[1.01]' : 'bg-[#2a2a2a]'}`}
            style={{
              top: `${(i + 1) * 75}px`,
              left: `${track.left}px`,
              width: `${track.duration ? track.duration * zoom : 0}px`,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, track.id)}
            onMouseDown={(e) => handleTrackDrag(e, track.id)}
            onClick={() => setSelectedTrackId(track.id)}
            onDrop={(e) => handleDropOnTrack(e, track.id)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300 truncate">🎵 {track.file?.name || `Track ${i + 1}`}</span>
            </div>
            <div id={track.id} className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
// Daw component

export default Daw;