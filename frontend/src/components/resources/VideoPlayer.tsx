import React, { useRef, useState } from 'react';
import type { Resource } from '../../api/types';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle, Download, Clock } from 'lucide-react';
import { Button } from '../common/Button';

interface VideoPlayerProps {
  resource: Resource;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ resource }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(resource.duration_seconds || 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-black rounded-xl overflow-hidden border-2 border-black shadow-hard-lg">
      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-[#171e19] text-white w-full h-full">
            <AlertCircle className="w-12 h-12 text-[#ff5f57] mb-3" />
            <h4 className="font-heading text-lg font-bold text-white mb-1">HTTP Range Notice</h4>
            <p className="text-xs text-[#b7c6c2] max-w-md mb-4 font-mono">
              Unable to stream directly from `{resource.file_url}`. Video may still be downloading to local storage.
            </p>
            <Button
              variant="yellow"
              size="sm"
              onClick={() => {
                setHasError(false);
                videoRef.current?.load();
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retry Playback
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={resource.file_url}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current && videoRef.current.duration) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
              preload="metadata"
              playsInline
            />

            {/* Neo-Brutalist Play overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-2xl bg-[#ffe17c] border-2 border-black flex items-center justify-center text-black shadow-hard-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 translate-x-0.5 fill-black" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Media Controls Bar: Neo-Brutalist White & Yellow */}
      <div className="p-3 bg-white border-t-2 border-black flex flex-col gap-2">
        {/* Scrubber Timeline */}
        <div className="flex items-center gap-3 text-xs font-mono font-bold text-black">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-zinc-200 border border-black rounded-lg appearance-none cursor-pointer accent-[#ffe17c]"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-[#b7c6c2] text-black border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-black font-bold ml-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Speed:</span>
              <div className="flex items-center bg-white rounded-lg p-0.5 border-2 border-black shadow-hard-sm">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      playbackRate === rate ? 'bg-black text-[#ffe17c]' : 'text-black hover:bg-[#ffe17c]'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resource.file_url}
              download={resource.file_name || `${resource.title}.mp4`}
              className="p-2 rounded-lg bg-[#ffe17c] text-black border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5 font-bold cursor-pointer"
              title="Download local video copy"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline text-xs">Offline Save</span>
            </a>

            <button
              onClick={handleFullscreen}
              className="p-2 rounded-lg bg-white text-black border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
