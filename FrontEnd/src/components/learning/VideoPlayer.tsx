import { Box, IconButton, Typography, Slider } from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Fullscreen,
  Settings,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = newValue as number;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = (newValue as number) / 100;
    video.volume = volumeValue;
    setVolume(newValue as number);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          src={videoUrl}
          onClick={handlePlayPause}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
          onClick={handlePlayPause}
        >
          <IconButton
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 80,
              height: 80,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            <PlayArrow sx={{ fontSize: 60, color: "white" }} />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          padding: 2,
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <Slider
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          sx={{
            color: "#a435f0",
            height: 4,
            mb: 1,
            "& .MuiSlider-thumb": {
              width: 12,
              height: 12,
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={onPrevious}
              disabled={!hasPrevious}
              sx={{ color: "white" }}
            >
              <SkipPrevious />
            </IconButton>

            <IconButton onClick={handlePlayPause} sx={{ color: "white" }}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton
              onClick={onNext}
              disabled={!hasNext}
              sx={{ color: "white" }}
            >
              <SkipNext />
            </IconButton>

            <Typography variant="body2" sx={{ color: "white", ml: 2 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: 120,
              }}
            >
              <VolumeUp sx={{ color: "white", mr: 1 }} />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                sx={{
                  color: "white",
                  "& .MuiSlider-thumb": {
                    width: 12,
                    height: 12,
                  },
                }}
              />
            </Box>

            <IconButton sx={{ color: "white" }}>
              <Settings />
            </IconButton>

            <IconButton onClick={handleFullscreen} sx={{ color: "white" }}>
              <Fullscreen />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {showControls && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(rgba(0,0,0,0.7), transparent)",
            padding: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;

