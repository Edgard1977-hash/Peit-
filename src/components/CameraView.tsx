import React, { useState, useEffect, useRef } from "react";
import { X, HelpCircle, Image, Zap, ZapOff, Loader2, Trash2 } from "lucide-react";
import { Pet } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CameraViewProps {
  pet: Pet;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export default function CameraView({ pet, onClose, onCapture }: CameraViewProps) {
  const [zoom, setZoom] = useState<"0.5" | "1">("0.5");
  const [flash, setFlash] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showFlashOverlay, setShowFlashOverlay] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  const addPhoto = (dataUrl: string) => {
    setCapturedPhotos(prev => [...prev, dataUrl]);
    setIsPopupOpen(true);
  };

  const handleContinue = () => {
    if (capturedPhotos.length > 0) {
      onCapture(capturedPhotos[capturedPhotos.length - 1]);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Play a realistic synthesized shutter click sound using Web Audio API
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.12; // 120ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate snappy high-pass mechanical click noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, audioCtx.currentTime);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.1);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noise.start();
    } catch (e) {
      console.log("Audio feedback omitted:", e);
    }
  };

  // Initialize and start camera stream once on mount
  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("navigator.mediaDevices.getUserMedia is not supported on this browser.");
        if (active) {
          setHasPermission(false);
          setCameraActive(false);
        }
        return;
      }

      try {
        if (active) {
          setHasPermission(null);
        }

        // Stop any currently active streams before starting a new one
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Standard robust constraints for the environment (back) camera
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (active) {
          streamRef.current = stream;
          setCameraStream(stream);
          setCameraActive(true);
          setHasPermission(true);
        }
      } catch (err) {
        console.warn("Preferred camera device constraints failed, trying fallback standard environment camera:", err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
          });
          if (active) {
            streamRef.current = fallbackStream;
            setCameraStream(fallbackStream);
            setCameraActive(true);
            setHasPermission(true);
          }
        } catch (fallbackErr) {
          console.warn("Camera fallback failed, trying simple video stream:", fallbackErr);
          try {
            const simplestStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
            if (active) {
              streamRef.current = simplestStream;
              setCameraStream(simplestStream);
              setCameraActive(true);
              setHasPermission(true);
            }
          } catch (finalErr) {
            console.warn("Camera access failed completely:", finalErr);
            if (active) {
              setHasPermission(false);
              setCameraActive(false);
            }
          }
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Bind the current active stream to the video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.warn("Video auto-play failed, attempting play on user interaction:", err);
      });
    }
  }, [cameraStream]);

  // Apply physical camera flashlight (torch) constraint dynamically
  useEffect(() => {
    if (!cameraStream) return;
    const videoTrack = cameraStream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      // Try to apply the torch constraint to the active camera track
      videoTrack.applyConstraints({
        advanced: [{ torch: flash }]
      } as any).catch(err => {
        console.warn("Could not toggle camera physical torch constraint:", err);
      });
    } catch (e) {
      console.warn("Device does not support standard WebRTC torch constraints:", e);
    }
  }, [flash, cameraStream]);

  // Handle shutter button click (capture photo)
  const handleShutterClick = () => {
    setIsCapturing(true);

    // Play tactile physical click sound and trigger minor haptic feel
    playShutterSound();
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    // Trigger visual flash if flash is enabled
    if (flash) {
      setShowFlashOverlay(true);
      setTimeout(() => setShowFlashOverlay(false), 200);
    }

    // Delay slightly to match camera shutter feel
    setTimeout(() => {
      try {
        if (cameraActive && videoRef.current) {
          const video = videoRef.current;
          const canvas = document.createElement("canvas");
          
          // Use the actual internal video track resolution
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Respect the digital zoom level during capture
            if (zoom === "1") {
              const scaleFactor = 1.5;
              const sWidth = canvas.width / scaleFactor;
              const sHeight = canvas.height / scaleFactor;
              const sx = (canvas.width - sWidth) / 2;
              const sy = (canvas.height - sHeight) / 2;
              ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            } else {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            addPhoto(dataUrl);
          }
        } else {
          // Simulated fallback photo if no real webcam is connected
          addPhoto(pet.image);
        }
      } catch (err) {
        console.warn("Error capturing photo, using pet image as fallback:", err);
        addPhoto(pet.image);
      } finally {
        setIsCapturing(false);
      }
    }, 250);
  };

  // Handle selecting from gallery
  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-between font-sans select-none overflow-hidden py-4">
      {/* Hidden File Input for Gallery */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Bar with elegant circular buttons */}
      <div className="w-full max-w-md flex justify-between items-center px-6 pt-4 z-10">
        {/* Back / Exit Button */}
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex-shrink-0"
          title="Назад"
        >
          <X className="w-5 h-5 text-black" strokeWidth={2} />
        </button>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* Top-Right: Circular preview thumbnail of the captured photos */}
        {capturedPhotos.length > 0 ? (
          <button
            onClick={() => setIsPopupOpen(true)}
            className="w-12 h-12 rounded-full border border-zinc-100 shadow-[0_4px_14px_rgba(0,0,0,0.06)] overflow-hidden relative flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title="Просмотр фото"
          >
            <img
              src={capturedPhotos[capturedPhotos.length - 1]}
              alt="Миниатюра"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {capturedPhotos.length > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white scale-90">
                {capturedPhotos.length}
              </div>
            )}
          </button>
        ) : (
          <div className="w-12 h-12 flex-shrink-0" />
        )}
      </div>

      {/* Central Viewfinder Container wrapped in clean white background */}
      <div className="w-full max-w-md flex-1 flex items-center justify-center px-3 py-4">
        <div 
          className="relative w-full aspect-[3/4] bg-zinc-950 rounded-[48px] overflow-hidden transition-all duration-300"
        >
          {/* Live Video, Connecting Loader, or Falling Back View */}
          {hasPermission === true ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transition-transform duration-300 ease-out origin-center"
              style={{
                transform: zoom === "0.5" ? "scale(1)" : "scale(1.5)",
              }}
            />
          ) : hasPermission === null ? (
            /* Minimal clean loader while connecting */
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin mb-3" />
              <span className="text-white/40 text-xs font-semibold tracking-wide">Подключение...</span>
            </div>
          ) : (
            /* Immersive simulated feed if camera not authorized or not available */
            <div className="w-full h-full flex flex-col items-center justify-between p-6 relative overflow-hidden bg-zinc-950 text-white">
              {/* Top status */}
              <div className="w-full text-center mt-4">
                <span className="text-white/40 text-[10px] uppercase tracking-widest font-mono block mb-1">
                  Анализатор питомца
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400">
                  Доступ заблокирован браузером
                </span>
              </div>

              {/* Ultra-minimal Pet Image (No grids, borders, outlines, or scanning effects) with smooth zoom transition */}
              <div className="relative flex items-center justify-center overflow-hidden w-40 h-40 rounded-full bg-zinc-900 border border-white/5">
                <img
                  src={pet.image}
                  alt={pet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80 transition-transform duration-300 ease-out origin-center"
                  style={{
                    transform: zoom === "0.5" ? "scale(1)" : "scale(1.5)",
                  }}
                />
              </div>

              {/* Help & manual steps */}
              <div className="w-full pb-4 z-10">
                <p className="text-white/80 text-xs text-center font-medium mb-3 leading-snug px-2">
                  Разрешите доступ к камере или откройте приложение в отдельной вкладке:
                </p>
                <div className="flex flex-col gap-2 px-2">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#183BA7] hover:bg-[#153494] text-white text-center py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Открыть в отдельной вкладке ↗</span>
                  </a>
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full bg-white/10 hover:bg-white/15 text-white/90 text-center py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Загрузить готовое фото питомца
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Flash visual overlay */}
          {showFlashOverlay && (
            <div className="absolute inset-0 bg-white z-40 animate-fade-out pointer-events-none"></div>
          )}

          {/* Quick Capture loader */}
          {isCapturing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {/* Zoom Toggles (0.5x and 1x) - Connected tabs style inside viewfinder bottom */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/30 backdrop-blur-md p-1 rounded-full flex gap-1 z-20 select-none">
            <button
              onClick={() => setZoom("0.5")}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                zoom === "0.5" ? "text-black font-bold" : "text-white/90 hover:text-white"
              }`}
            >
              {zoom === "0.5" && (
                <motion.div
                  layoutId="activeZoomPill"
                  className="absolute inset-0 bg-white rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              0.5x
            </button>
            <button
              onClick={() => setZoom("1")}
              className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                zoom === "1" ? "text-black font-bold" : "text-white/90 hover:text-white"
              }`}
            >
              {zoom === "1" && (
                <motion.div
                  layoutId="activeZoomPill"
                  className="absolute inset-0 bg-white rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              1x
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls Area in pure White Background (Flat, no separating shadows or borders) */}
      <div className="w-full max-w-md bg-white pb-12 pt-2 px-8 flex flex-col items-center gap-6 z-10">
        {/* Shutter, Gallery, Flash row with exact matching layout */}
        <div className="w-full flex justify-between items-center px-4">
          {/* Left: Flash toggle button (Styled exactly like top buttons) */}
          <button
            onClick={() => setFlash(!flash)}
            className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
            title={flash ? "Выключить вспышку" : "Включить вспышку"}
          >
            {flash ? (
              <Zap className="w-5 h-5 text-black" strokeWidth={2} />
            ) : (
              <ZapOff className="w-5 h-5 text-black" strokeWidth={2} />
            )}
          </button>

          {/* Middle: Shutter button - flat white circle with a bold black border and elegant shadow */}
          <button
            onClick={handleShutterClick}
            disabled={isCapturing}
            className="w-20 h-20 rounded-full bg-white border-[6px] border-black shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
            title="Сделать снимок"
          />

          {/* Right: Gallery button (Styled exactly like top buttons) */}
          <button
            onClick={handleGalleryClick}
            className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
            title="Выбрать из галереи"
          >
            <Image className="w-5 h-5 text-black" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Sliding Capture Popup Overlay */}
      <AnimatePresence>
        {isPopupOpen && capturedPhotos.length > 0 && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
            {/* Smooth fading backdrop dimming */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsPopupOpen(false)}
            />
            
            {/* Highly tactile, fully responsive, spring-loaded drag-to-dismiss sheet */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.85 }}
              onDragEnd={(event, info) => {
                if (info.offset.y > 100 || info.velocity.y > 180) {
                  setIsPopupOpen(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="relative w-full max-w-md mx-auto bg-white rounded-t-[64px] px-6 pt-18 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] flex flex-col items-center gap-4 z-10 select-none touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Delete Photo Button in top-left of the popup styled like the circular close button with plenty of space */}
              <button
                onClick={() => {
                  setCapturedPhotos(prev => {
                    const next = prev.filter((_, i) => i !== prev.length - 1);
                    if (next.length === 0) {
                      setIsPopupOpen(false);
                    }
                    return next;
                  });
                }}
                className="absolute top-5 left-6 w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all cursor-pointer text-red-500 z-20"
                title="Удалить фото"
              >
                <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2} />
              </button>

              {/* Photo Preview Container matching 100% of the camera viewfinder aspect ratio & style, completely unconstrained */}
              <div className="relative w-full aspect-[3/4] rounded-[48px] overflow-hidden shadow-md border border-zinc-100">
                <img
                  src={capturedPhotos[capturedPhotos.length - 1]}
                  alt="Captured Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Buttons Row */}
              <div className="w-full flex gap-4">
                {/* "Take more" Button */}
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className={`flex-1 py-[18px] text-base font-extrabold tracking-wide rounded-[2rem] transition-all active:scale-95 cursor-pointer select-none text-center ${
                    capturedPhotos.length < 5
                      ? "bg-black text-white hover:bg-zinc-900 shadow-md border border-transparent"
                      : "bg-white border border-zinc-300 text-black hover:bg-zinc-50"
                  }`}
                >
                  Take more
                </button>

                {/* "Continue" Button */}
                <button
                  onClick={handleContinue}
                  className={`flex-1 py-[18px] text-base font-extrabold tracking-wide rounded-[2rem] transition-all active:scale-95 cursor-pointer select-none text-center ${
                    capturedPhotos.length >= 5
                      ? "bg-black text-white hover:bg-zinc-900 shadow-md border border-transparent"
                      : "bg-white border border-zinc-300 text-black hover:bg-zinc-50"
                  }`}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
