import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import intro from "@/assets/video/intro1.mp4";

const IntroVideo1 = () => {
  /** @type {React.MutableRefObject<HTMLVideoElement|null>} */
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);

    // try to play once mounted (some browsers need a catch)
    const tryPlay = async () => {
      try {
        v.muted = true; // ensure muted for autoplay policies
        await v.play();
        setIsPlaying(!v.paused);
      } catch (_) {
        // Autoplay blocked; show paused state
        setIsPlaying(false);
      }
    };
    tryPlay();

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  return (
    <section className="relative isolate w-full overflow-hidden bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="h-[70vh] w-full object-cover md:h-[85vh]"
        src={intro}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
      />

      {/* Left gradient scrim */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_0%_100%,rgba(0,0,0,0.55)_0%,transparent_60%)]" />

      {/* Copy block (bottom-left) */}
      <div className="pointer-events-none absolute bottom-8 left-6 z-10 max-w-xl text-white sm:left-10 sm:bottom-10 md:bottom-14">
        <h2 className="pointer-events-auto mb-3 text-2xl font-semibold tracking-wide sm:text-3xl md:text-4xl">
          LV Rouge Matte
        </h2>
        <p className="pointer-events-auto max-w-lg text-sm leading-relaxed text-white/85 sm:text-[15px]">
          Velvet matte color and intense longwear adorn lips with immediate
          moisture and rich tones — in 28 irresistible shades.
        </p>
      </div>

      {/* Controls (bottom-right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3 sm:bottom-6 sm:right-6">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </section>
  );
};

export default IntroVideo1;
