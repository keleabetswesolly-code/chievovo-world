import React, { useRef, useEffect, useState, useCallback } from 'react';

export default function StreamingPlayer({ 
  videoSrc, 
  streamTitle, 
  artistName, 
  coverArtUrl,
  onNextTrack,
  onPrevTrack
}) {
  const videoRef = useRef(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Synchronize OS lock screen progress bar
  const updatePositionState = useCallback(() => {
    if ('mediaSession' in navigator && videoRef.current) {
      const video = videoRef.current;
      if (isFinite(video.duration) && video.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: video.duration,
            playbackRate: video.playbackRate,
            position: video.currentTime
          });
        } catch (error) {
          console.error("Error updating position state:", error);
        }
      }
    }
  }, []);

  // 1. Media Session API + playback event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: streamTitle,
        artist: artistName,
        artwork: [{ src: coverArtUrl, sizes: '512x512', type: 'image/png' }]
      });

      navigator.mediaSession.setActionHandler('play', () => videoElement.play());
      navigator.mediaSession.setActionHandler('pause', () => videoElement.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) videoElement.currentTime = details.seekTime;
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        videoElement.currentTime = Math.max(videoElement.currentTime - (details.seekOffset || 10), 0);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        videoElement.currentTime = Math.min(videoElement.currentTime + (details.seekOffset || 10), videoElement.duration);
      });
      navigator.mediaSession.setActionHandler('previoustrack', onPrevTrack ? () => onPrevTrack() : null);
      navigator.mediaSession.setActionHandler('nexttrack', onNextTrack ? () => onNextTrack() : null);
    }

    videoElement.addEventListener('loadedmetadata', updatePositionState);
    videoElement.addEventListener('play', updatePositionState);
    videoElement.addEventListener('pause', updatePositionState);
    videoElement.addEventListener('seeked', updatePositionState);
    videoElement.addEventListener('ratechange', updatePositionState);

    return () => {
      videoElement.removeEventListener('loadedmetadata', updatePositionState);
      videoElement.removeEventListener('play', updatePositionState);
      videoElement.removeEventListener('pause', updatePositionState);
      videoElement.removeEventListener('seeked', updatePositionState);
      videoElement.removeEventListener('ratechange', updatePositionState);
    };
  }, [streamTitle, artistName, coverArtUrl, onNextTrack, onPrevTrack, updatePositionState]);

  // 2. Picture-in-Picture lifecycle
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const onEnterPiP = () => setIsPipActive(true);
    const onLeavePiP = () => setIsPipActive(false);

    videoElement.addEventListener('enterpictureinpicture', onEnterPiP);
    videoElement.addEventListener('leavepictureinpicture', onLeavePiP);

    return () => {
      videoElement.removeEventListener('enterpictureinpicture', onEnterPiP);
      videoElement.removeEventListener('leavepictureinpicture', onLeavePiP);
    };
  }, []);

  // 3. Page Visibility API — don't interrupt background PiP playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && document.pictureInPictureElement) {
        console.log("App minimized, continuing playback in PiP window.");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const togglePiP = async () => {
    if (!document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Failed to toggle PiP:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto bg-[#111] border border-white/10 rounded-2xl p-5 shadow-2xl">
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          controls
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="text-lg font-bold text-white truncate">{streamTitle}</h2>
          <p className="text-sm text-gray-400 truncate">{artistName}</p>
        </div>

        <button
          onClick={togglePiP}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-colors"
          style={isPipActive
            ? { background: 'rgba(255,255,255,0.1)', color: '#00D4FF', border: '1px solid #00D4FF40' }
            : { background: 'linear-gradient(135deg, #00D4FF, #FF6B35)', color: '#000' }
          }
        >
          {isPipActive ? 'Exit PiP' : 'Enter PiP'}
        </button>
      </div>
    </div>
  );
}