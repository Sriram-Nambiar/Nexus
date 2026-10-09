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
    <div className="flex flex-col h-full bg-black text-white rounded-xl overflow-hidden border border-zinc-800">
      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
            <h4 className="text-base font-semibold text-zinc-100 mb-1">Video Stream Notice</h4>
            <p className="text-xs text-zinc-400 max-w-md mb-4">
              Unable to stream video directly from `{resource.file_url}`. If you are offline or using a local media proxy, check your media path.
            </p>
            <Button
              variant="outline"
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

            {/* Big center play icon overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-700/80 flex items-center justify-center text-white hover:scale-110 hover:bg-zinc-800 transition-all shadow-xl backdrop-blur-sm"
                aria-label="Play video"
              >
                <Play className="w-7 h-7 translate-x-0.5 fill-white" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Media Controls Bar */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex flex-col gap-2">
        {/* Scrubber Timeline */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 ml-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Speed:</span>
              <div className="flex items-center bg-zinc-800 rounded-md p-0.5 border border-zinc-700">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      playbackRate === rate ? 'bg-zinc-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
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
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1"
              title="Download local video copy"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline text-xs">Download</span>
            </a>

            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
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
