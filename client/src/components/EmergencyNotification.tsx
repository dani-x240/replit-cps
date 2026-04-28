import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Send,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Mode = "video" | "photo" | null;

export function EmergencyNotification() {
  const [showBanner, setShowBanner] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Show banner — with a tiny delay on first visit, instantly otherwise.
  useEffect(() => {
    const dismissed = localStorage.getItem("cps-emergency-banner-dismissed");
    const delay = dismissed ? 0 : 400;
    const t = setTimeout(() => setShowBanner(true), delay);
    return () => clearTimeout(t);
  }, []);

  // Capture GPS the moment the modal opens.
  useEffect(() => {
    if (!open || coords) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, [open, coords]);

  // Wire active stream to the preview element.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, mode]);

  // Cleanup on close.
  useEffect(() => {
    if (!open) {
      stopStream();
      setMode(null);
      setRecording(false);
      setSending(false);
      setDone(false);
      chunksRef.current = [];
    }
  }, [open]);

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
  }

  async function startVideoMode() {
    setMode("video");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: includeAudio,
      });
      setStream(s);
    } catch (err) {
      toast({
        title: "Camera blocked",
        description: "Please allow camera access to send a video alert.",
        variant: "destructive",
      });
      setMode(null);
    }
  }

  async function startPhotoMode() {
    setMode("photo");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(s);
    } catch {
      toast({
        title: "Camera blocked",
        description: "Please allow camera access to send a photo alert.",
        variant: "destructive",
      });
      setMode(null);
    }
  }

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm",
    });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => uploadVideo();
    mr.start();
    recorderRef.current = mr;
    setRecording(true);
    // Cap at 15 seconds so the alert sends quickly.
    setTimeout(() => stopRecording(), 15000);
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
      setRecording(false);
    }
  }

  async function uploadVideo() {
    setSending(true);
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const dataBase64 = await blobToBase64(blob);
    await sendToServer({
      mediaKind: "video",
      mimeType: "video/webm",
      dataBase64,
      hasAudio: includeAudio,
    });
  }

  async function takePhoto() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 720;
    canvas.height = v.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.85),
    );
    const dataBase64 = await blobToBase64(blob);
    setSending(true);
    await sendToServer({
      mediaKind: "photo",
      mimeType: "image/jpeg",
      dataBase64,
      hasAudio: false,
    });
  }

  async function sendToServer(payload: {
    mediaKind: "video" | "photo";
    mimeType: string;
    dataBase64: string;
    hasAudio: boolean;
  }) {
    try {
      const res = await fetch("/api/emergency/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, coords }),
      });
      if (!res.ok) throw new Error("send failed");
      setDone(true);
      stopStream();
      toast({
        title: "Emergency sent",
        description: "Nearest police have been alerted.",
      });
    } catch {
      toast({
        title: "Could not send",
        description: "Try again or call 999 directly.",
        variant: "destructive",
      });
      setSending(false);
    }
  }

  function dismissBanner() {
    localStorage.setItem("cps-emergency-banner-dismissed", "1");
    setShowBanner(false);
  }

  return (
    <>
      {/* Notification banner */}
      <AnimatePresence>
        {showBanner && !open && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed top-4 left-4 right-4 lg:left-auto lg:right-6 lg:top-6 lg:w-96 z-50"
          >
            <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900 shadow-2xl rounded-2xl p-4 flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                    SOS Emergency
                  </span>
                  <span className="text-[10px] text-muted-foreground">now</span>
                </div>
                <p className="text-sm text-foreground font-medium leading-snug">
                  In immediate danger?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Tap to send a quick video or photo of your emergency to the nearest police.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white h-8 px-3 text-xs"
                    onClick={() => setOpen(true)}
                    data-testid="button-emergency-open"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Send Emergency
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={dismissBanner}
                    data-testid="button-emergency-dismiss"
                  >
                    Later
                  </Button>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="text-muted-foreground hover:text-foreground -mt-1 -mr-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => !sending && !recording && setOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-red-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Emergency Alert</span>
                </div>
                {!recording && !sending && (
                  <button onClick={() => setOpen(false)} aria-label="Close">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-5">
                {done ? (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Help is on the way</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The nearest police station has been alerted with your location and media.
                    </p>
                    <Button
                      className="mt-6 w-full"
                      onClick={() => setOpen(false)}
                      data-testid="button-emergency-close-success"
                    >
                      Close
                    </Button>
                  </div>
                ) : !mode ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose how to record your emergency. Audio is optional.
                    </p>

                    <button
                      onClick={() => setIncludeAudio(!includeAudio)}
                      className={`w-full mb-4 flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        includeAudio
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-neutral-50 border-neutral-200 text-foreground"
                      }`}
                      data-testid="button-toggle-audio"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {includeAudio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        Include audio with video
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          includeAudio ? "bg-red-600 text-white" : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {includeAudio ? "ON" : "OFF"}
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={startVideoMode}
                        className="p-5 rounded-2xl bg-red-600 text-white hover:bg-red-700 flex flex-col items-center gap-2 transition-colors"
                        data-testid="button-mode-video"
                      >
                        <Video className="w-8 h-8" />
                        <span className="font-semibold">Record Video</span>
                        <span className="text-[10px] opacity-80">up to 15s</span>
                      </button>
                      <button
                        onClick={startPhotoMode}
                        className="p-5 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 flex flex-col items-center gap-2 transition-colors"
                        data-testid="button-mode-photo"
                      >
                        <Camera className="w-8 h-8" />
                        <span className="font-semibold">Take Photo</span>
                        <span className="text-[10px] opacity-80">silent</span>
                      </button>
                    </div>

                    {coords && (
                      <p className="text-[11px] text-muted-foreground mt-4 text-center">
                        Location ready: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4] mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {recording && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC
                        </div>
                      )}
                    </div>

                    {sending ? (
                      <Button disabled className="w-full">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending to police…
                      </Button>
                    ) : mode === "video" ? (
                      recording ? (
                        <Button
                          onClick={stopRecording}
                          className="w-full bg-red-600 hover:bg-red-700"
                          data-testid="button-stop-recording"
                        >
                          <Send className="w-4 h-4 mr-2" /> Stop & Send
                        </Button>
                      ) : (
                        <Button
                          onClick={startRecording}
                          className="w-full bg-red-600 hover:bg-red-700"
                          data-testid="button-start-recording"
                          disabled={!stream}
                        >
                          <Video className="w-4 h-4 mr-2" /> Start Recording
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={takePhoto}
                        className="w-full bg-red-600 hover:bg-red-700"
                        data-testid="button-capture-photo"
                        disabled={!stream}
                      >
                        <Camera className="w-4 h-4 mr-2" /> Capture & Send
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
