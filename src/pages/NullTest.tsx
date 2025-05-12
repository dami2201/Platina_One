import React, { useRef, useState, useEffect } from "react";

export default function NullTestModule() {
  const fileARef = useRef<HTMLInputElement>(null);
  const fileBRef = useRef<HTMLInputElement>(null);
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const canvasOutRef = useRef<HTMLCanvasElement>(null);
  const [audioCtx] = useState(() => new AudioContext());
  const [gain, setGain] = useState(1);
  const [boost, setBoost] = useState(1);
  const [sources, setSources] = useState<AudioBufferSourceNode[] | null>(null);
  const [meterValues, setMeterValues] = useState({ a: 0, b: 0, out: 0 });
  const analyserA = useRef<AnalyserNode | null>(null);
  const analyserB = useRef<AnalyserNode | null>(null);
  const analyserOut = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    document.title = 'Platina One | NullTest';
  }, []);

  useEffect(() => {
    const drawMeters = () => {
      const bufferLength = 128;
      const dataA = new Uint8Array(bufferLength);
      const dataB = new Uint8Array(bufferLength);
      const dataOut = new Uint8Array(bufferLength);
      analyserA.current?.getByteFrequencyData(dataA);
      analyserB.current?.getByteFrequencyData(dataB);
      analyserOut.current?.getByteFrequencyData(dataOut);
      setMeterValues({
        a: Math.max(...dataA) / 255,
        b: Math.max(...dataB) / 255,
        out: Math.max(...dataOut) / 255,
      });
      requestAnimationFrame(drawMeters);
    };
    drawMeters();
  }, []);

  const drawWaveform = (buffer: AudioBuffer, canvas: HTMLCanvasElement | null, color: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    for (let i = 0; i < width; i++) {
      const min = data[i * step];
      ctx.lineTo(i, amp + min * amp);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const handlePlay = async () => {
    if (!fileARef.current?.files?.[0] || !fileBRef.current?.files?.[0]) return;

    const [bufferA, originalBufferB] = await Promise.all([
      fileARef.current.files[0].arrayBuffer().then(buf => audioCtx.decodeAudioData(buf)),
      fileBRef.current.files[0].arrayBuffer().then(buf => audioCtx.decodeAudioData(buf)),
    ]);

    const bufferB = audioCtx.createBuffer(
      originalBufferB.numberOfChannels,
      originalBufferB.length,
      originalBufferB.sampleRate
    );
    for (let ch = 0; ch < originalBufferB.numberOfChannels; ch++) {
      const input = originalBufferB.getChannelData(ch);
      const output = bufferB.getChannelData(ch);
      for (let i = 0; i < input.length; i++) {
        output[i] = -input[i];
      }
    }

    drawWaveform(bufferA, canvasARef.current, "#3b82f6");
    drawWaveform(bufferB, canvasBRef.current, "#ec4899");
    drawWaveform(bufferB, canvasOutRef.current, "#10b981");

    const sourceA = audioCtx.createBufferSource();
    sourceA.buffer = bufferA;
    const gainNodeA = audioCtx.createGain();
    gainNodeA.gain.value = gain * boost;
    analyserA.current = audioCtx.createAnalyser();
    sourceA.connect(gainNodeA).connect(analyserA.current!).connect(audioCtx.destination);

    const sourceB = audioCtx.createBufferSource();
    sourceB.buffer = bufferB;
    const gainNodeB = audioCtx.createGain();
    gainNodeB.gain.value = gain * boost;
    analyserB.current = audioCtx.createAnalyser();

    analyserOut.current = audioCtx.createAnalyser();
    sourceB.connect(gainNodeB).connect(analyserB.current!).connect(audioCtx.destination);

    const startTime = audioCtx.currentTime + 0.1;
    sourceA.start(startTime);
    sourceB.start(startTime);
    setSources([sourceA, sourceB]);
  };

  const handleStop = () => {
    sources?.forEach(src => src.stop());
    setSources(null);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#0d0d0d] rounded-2xl shadow-2xl space-y-6 text-white animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-white">🎛️ Null Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-semibold text-white">Fájl A</label>
            <input ref={fileARef} type="file" accept="audio/*" className="w-full" />
            <canvas ref={canvasARef} width={400} height={100} className="w-full rounded bg-black" />
            <div className="text-sm text-white">🔊 dB Meter A: <span className="text-blue-400">{(meterValues.a * 100).toFixed(0)}%</span></div>
          </div>
          <div className="space-y-2">
            <label className="block font-semibold text-white">Fájl B</label>
            <input ref={fileBRef} type="file" accept="audio/*" className="w-full" />
            <canvas ref={canvasBRef} width={400} height={100} className="w-full rounded bg-black" />
            <div className="text-sm text-white">🔊 dB Meter B: <span className="text-pink-400">{(meterValues.b * 100).toFixed(0)}%</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-white">🎚️ Master Kimenet</label>
          <canvas ref={canvasOutRef} width={800} height={100} className="w-full rounded bg-black" />
          <div className="text-sm text-white">🔊 dB Meter OUT: <span className="text-green-400">{(meterValues.out * 100).toFixed(0)}%</span></div>
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-white">🔊 Hangerő</label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={gain}
            onChange={(e) => setGain(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-white">🚀 Boost</label>
          <div className="flex gap-3">
            {[1, 2, 3].map(val => (
              <button
                key={val}
                onClick={() => setBoost(val)}
                className={`px-4 py-2 rounded border transform transition-transform duration-200 ${boost === val ? 'bg-white text-black scale-105' : 'bg-transparent border-white hover:scale-105'}`}
              >
                {val}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePlay}
            disabled={sources !== null}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-transform transform hover:scale-105"
          >
            ▶️ Lejátszás
          </button>
          <button
            onClick={handleStop}
            disabled={!sources}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-transform transform hover:scale-105"
          >
            ⏹ Leállítás
          </button>
        </div>
      </div>
    </>
  );
}