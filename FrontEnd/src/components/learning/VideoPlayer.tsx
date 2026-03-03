import { Box, IconButton, Typography, Slider, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Fullscreen,
  Settings,
  SkipNext,
  SkipPrevious,
  Speed,
  HighQuality,
  Check,
  ArrowBack,
  Forward10,
  Replay10,
} from "@mui/icons-material";
import React, { useState, useRef, useEffect } from "react";

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
}

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  videoUrl,
  title,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onTimeUpdate,
  onEnded,
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Settings Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsMode, setSettingsMode] = useState<"main" | "speed" | "quality">("main");

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<any>(null); // Use any to match browser timer type

  React.useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      // Only update state from video if user is NOT dragging the slider
      if (!isScrubbing) {
        setCurrentTime(time);
      }
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Ensure volume is synchronized
      video.volume = volume / 100;
      video.playbackRate = playbackRate;
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [isScrubbing, volume, playbackRate, onTimeUpdate]);

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

  const handleJumpBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(video.currentTime - 10, 0);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleJumpForward = () => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.min(video.currentTime + 10, video.duration);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Called while dragging/clicking - updates UI only
  const handleScrub = (_event: Event, newValue: number | number[]) => {
    setIsScrubbing(true);
    setCurrentTime(newValue as number);
  };

  // Called when drag ends/click releases - updates video
  const handleSeekCommitted = (_event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = newValue as number;
    video.currentTime = seekTime;
    setIsScrubbing(false);
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

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    handleCloseMenu();
  };

  // Menu Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSettingsMode("main");
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSettingsMode("main");
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
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
      // Only hide if menu is not open and video is playing
      if (isPlaying && !anchorEl) {
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
      onMouseLeave={() => {
        if (isPlaying && !anchorEl) setShowControls(false);
      }}
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
          onEnded={onEnded}
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

      {/* Controls Overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          padding: 2,
          opacity: showControls || anchorEl ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <Slider
          value={currentTime}
          min={0}
          max={duration || 100}
          onChange={handleScrub}
          onChangeCommitted={handleSeekCommitted}
          sx={{
            color: "#3b82f6",
            height: 4,
            mb: 1,
            "& .MuiSlider-thumb": {
              width: 12,
              height: 12,
              transition: "0.2s",
              "&:hover, &.Mui-focusVisible": {
                boxShadow: "0px 0px 0px 8px rgba(59, 130, 246, 0.16)"
              }
            },
            "& .MuiSlider-rail": {
              opacity: 0.3
            }
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

            <IconButton onClick={handleJumpBackward} sx={{ color: "white" }}>
              <Replay10 />
            </IconButton>

            <IconButton onClick={handlePlayPause} sx={{ color: "white" }}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton onClick={handleJumpForward} sx={{ color: "white" }}>
              <Forward10 />
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

            <IconButton onClick={handleOpenMenu} sx={{ color: "white" }}>
              <Settings />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  bgcolor: 'rgba(28, 29, 31, 0.95)',
                  color: 'white',
                  width: 250,
                }
              }}
            >
              {settingsMode === 'main' && [
                <MenuItem key="speed" onClick={() => setSettingsMode('speed')}>
                  <ListItemIcon><Speed sx={{ color: "white" }} /></ListItemIcon>
                  <ListItemText>Tốc độ phát</ListItemText>
                  <Typography variant="body2" color="text.secondary">{playbackRate}x</Typography>
                </MenuItem>,
                <MenuItem key="quality" onClick={() => setSettingsMode('quality')}>
                  <ListItemIcon><HighQuality sx={{ color: "white" }} /></ListItemIcon>
                  <ListItemText>Chất lượng</ListItemText>
                  <Typography variant="body2" color="text.secondary">Auto</Typography>
                </MenuItem>
              ]}

              {settingsMode === 'speed' && [
                <MenuItem key="back" onClick={() => setSettingsMode('main')} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <ListItemIcon><ArrowBack sx={{ color: "white" }} /></ListItemIcon>
                  <ListItemText>Quay lại</ListItemText>
                </MenuItem>,
                ...[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                  <MenuItem key={rate} onClick={() => handlePlaybackRateChange(rate)}>
                    <ListItemIcon>
                      {playbackRate === rate && <Check sx={{ color: "#3b82f6" }} />}
                    </ListItemIcon>
                    <ListItemText>{rate === 1 ? 'Chuẩn' : `${rate}x`}</ListItemText>
                  </MenuItem>
                ))
              ]}

              {settingsMode === 'quality' && [
                <MenuItem key="back" onClick={() => setSettingsMode('main')} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <ListItemIcon><ArrowBack sx={{ color: "white" }} /></ListItemIcon>
                  <ListItemText>Quay lại</ListItemText>
                </MenuItem>,
                <MenuItem key="auto" onClick={handleCloseMenu}>
                  <ListItemIcon>
                    <Check sx={{ color: "#3b82f6" }} />
                  </ListItemIcon>
                  <ListItemText>Tự động (720p)</ListItemText>
                </MenuItem>
              ]}
            </Menu>

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
});

export default VideoPlayer;
