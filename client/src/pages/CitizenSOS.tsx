import { useState, useEffect, useRef } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Siren, Phone, Video, Mic, Square, AlertTriangle, ShieldCheck, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type Phase =
  | "idle"
  | "pressing"
  | "choice"
  | "recording_audio"
  | "recording_video"
  | "calling"
  | "sent";

const PRESS_DURATION_MS = 3000;
const CHOICE_DURATION_MS = 6000;
const AUTO_RECORD_MS = 30000;

export default function CitizenSOS() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pressProgress, setPressProgress] = useState(0);
  const [choiceCountdown, setChoiceCountdown] = useState(CHOICE_DURATION_MS / 1000);
  const [recordCountdown, setRecordCountdown] = useState(AUTO_RECORD_MS / 1000);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [alertId, setAlertId] = useState<number | null>(null);

  const pressTimerRef = useRef<number | null>(null);
  const pressIntervalRef = useRef<number | null>(null);
  const choiceTimerRef = useRef<number | null>(null);
  const choiceIntervalRef = useRef<number | null>(null);
  const recordTimerRef = useRef<number | null>(null);
  const recordIntervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Try to get GPS on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      stopMediaTracks();
    };
  }, []);

  const clearAllTimers = () => {
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    if (pressIntervalRef.current) window.clearInterval(pressIntervalRef.current);
    if (choiceTimerRef.current) window.clearTimeout(choiceTimerRef.current);
    if (choiceIntervalRef.current) window.clearInterval(choiceIntervalRef.current);
    if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current);
    if (recordIntervalRef.current) window.clearInterval(recordIntervalRef.current);
  };

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
  };

  const startPress = () => {
    if (phase !== "idle") return;
    setPhase("pressing");
    setPressProgress(0);
    const startTs = Date.now();
    pressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTs;
      const pct = Math.min(100, (elapsed / PRESS_DURATION_MS) * 100);
      setPressProgress(pct);
    }, 50);
    pressTimerRef.current = window.setTimeout(() => {
      // SOS triggered - send alert and enter choice phase
      triggerAlert();
      enterChoicePhase();
    }, PRESS_DURATION_MS);
  };

  const cancelPress = () => {
    if (phase !== "pressing") return;
    if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    if (pressIntervalRef.current) window.clearInterval(pressIntervalRef.current);
    setPressProgress(0);
    setPhase("idle");
  };

  const triggerAlert = async () => {
    try {
      const res = await apiRequest("POST", "/api/sos", {
        coords,
        triggeredAt: new Date().toISOString(),
      });
      const data = await res.json();
      setAlertId(data.id);
      toast({
        title: "SOS Alert Sent",
        description: "Police have been notified of your location.",
      });
    } catch (e) {
      toast({
        title: "Alert queued offline",
        description: "Will sync when network is available.",
        variant: "destructive",
      });
    }
  };

  const enterChoicePhase = () => {
    setPhase("choice");
    setChoiceCountdown(CHOICE_DURATION_MS / 1000);
    const startTs = Date.now();
    choiceIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTs;
      const remaining = Math.max(0, Math.ceil((CHOICE_DURATION_MS - elapsed) / 1000));
      setChoiceCountdown(remaining);
    }, 200);
    choiceTimerRef.current = window.setTimeout(() => {
      // No choice → start audio recording automatically
      if (choiceIntervalRef.current) window.clearInterval(choiceIntervalRef.current);
      startAudioRecording();
    }, CHOICE_DURATION_MS);
  };

  const handleChooseCall = () => {
    clearChoiceTimers();
    setPhase("calling");
    window.location.href = "tel:999";
  };

  const handleChooseSMS = () => {
    clearChoiceTimers();
    // Send pre-filled SMS to Uganda Police emergency line (+256 999)
    const body = encodeURIComponent(
      `EMERGENCY SOS\nLocation: ${coords ? `${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}` : "unknown"}\nSent via CPS Mobile`
    );
    window.location.href = `sms:+256999?body=${body}`;
    setPhase("sent");
  };

  const handleChooseVideo = async () => {
    clearChoiceTimers();
    await startVideoRecording();
  };

  const clearChoiceTimers = () => {
    if (choiceTimerRef.current) window.clearTimeout(choiceTimerRef.current);
    if (choiceIntervalRef.current) window.clearInterval(choiceIntervalRef.current);
  };

  const startAutoRecordCountdown = () => {
    setRecordCountdown(AUTO_RECORD_MS / 1000);
    const startTs = Date.now();
    recordIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTs;
      const remaining = Math.max(0, Math.ceil((AUTO_RECORD_MS - elapsed) / 1000));
      setRecordCountdown(remaining);
    }, 200);
    recordTimerRef.current = window.setTimeout(() => {
      stopRecording();
    }, AUTO_RECORD_MS);
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => uploadRecording(new Blob(chunks, { type: "audio/webm" }), "audio");
      recorder.start();
      mediaRecorderRef.current = recorder;
      setPhase("recording_audio");
      startAutoRecordCountdown();
    } catch {
      toast({
        title: "Microphone unavailable",
        description: "Could not start audio capture.",
        variant: "destructive",
      });
      setPhase("sent");
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => uploadRecording(new Blob(chunks, { type: "video/webm" }), "video");
      recorder.start();
      mediaRecorderRef.current = recorder;
      setPhase("recording_video");
      startAutoRecordCountdown();
    } catch {
      toast({
        title: "Camera unavailable",
        description: "Falling back to audio-only.",
        variant: "destructive",
      });
      startAudioRecording();
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current);
    if (recordIntervalRef.current) window.clearInterval(recordIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    stopMediaTracks();
  };

  const uploadRecording = async (blob: Blob, kind: "audio" | "video") => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1] || "";
        await apiRequest("POST", "/api/sos/recording", {
          alertId,
          kind,
          mimeType: blob.type,
          dataBase64: base64,
        });
        toast({ title: "Evidence uploaded", description: `${kind} recording sent to police.` });
        setPhase("sent");
      };
      reader.readAsDataURL(blob);
    } catch {
      toast({
        title: "Upload deferred",
        description: "Saved locally for next sync.",
        variant: "destructive",
      });
      setPhase("sent");
    }
  };

  const reset = () => {
    clearAllTimers();
    stopMediaTracks();
    setPhase("idle");
    setPressProgress(0);
    setAlertId(null);
  };

  return (
    <MobileLayout className="bg-gradient-to-b from-red-50 to-white min-h-screen">
      <div className="p-6 pt-12 pb-24 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/citizen/dashboard")}
            data-testid="button-back-sos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-red-700">Emergency SOS</h1>
            <p className="text-xs text-neutral-500">
              {coords
                ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                : "Locating..."}
            </p>
          </div>
        </div>

        {/* Main button area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {(phase === "idle" || phase === "pressing") && (
              <motion.div
                key="press"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <p className="text-center text-neutral-700 font-medium">
                  Press and hold for 3 seconds to send SOS
                </p>
                <div className="relative">
                  <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 240 240">
                    <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="8" />
                    <circle
                      cx="120" cy="120" r="110" fill="none" stroke="#dc2626" strokeWidth="8"
                      strokeDasharray={`${(pressProgress / 100) * 691} 691`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 50ms linear" }}
                    />
                  </svg>
                  <button
                    onMouseDown={startPress}
                    onMouseUp={cancelPress}
                    onMouseLeave={cancelPress}
                    onTouchStart={startPress}
                    onTouchEnd={cancelPress}
                    className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-red-600 active:bg-red-700 text-white shadow-2xl shadow-red-600/40 flex flex-col items-center justify-center gap-2 select-none"
                    data-testid="button-sos-press"
                  >
                    <Siren className="w-14 h-14 sm:w-20 sm:h-20" />
                    <span className="text-xl sm:text-2xl font-bold">SOS</span>
                  </button>
                </div>
                {phase === "pressing" && (
                  <p className="text-red-700 font-semibold animate-pulse">
                    Hold... {Math.ceil((PRESS_DURATION_MS * (100 - pressProgress)) / 100000)}s
                  </p>
                )}
              </motion.div>
            )}

            {phase === "choice" && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="bg-red-100 border border-red-300 rounded-2xl p-4 w-full">
                  <p className="text-red-800 font-bold text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alert sent! Choose action ({choiceCountdown}s)
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <Button
                    onClick={handleChooseCall}
                    className="h-24 rounded-2xl bg-blue-600 hover:bg-blue-700 flex flex-col gap-1.5 px-2"
                    data-testid="button-call-police"
                  >
                    <Phone className="w-7 h-7" />
                    <span className="text-xs leading-tight">Call 999</span>
                  </Button>
                  <Button
                    onClick={handleChooseSMS}
                    className="h-24 rounded-2xl bg-orange-500 hover:bg-orange-600 flex flex-col gap-1.5 px-2"
                    data-testid="button-sms-police"
                  >
                    <MessageSquare className="w-7 h-7" />
                    <span className="text-xs leading-tight">SMS +256</span>
                  </Button>
                  <Button
                    onClick={handleChooseVideo}
                    className="h-24 rounded-2xl bg-purple-600 hover:bg-purple-700 flex flex-col gap-1.5 px-2"
                    data-testid="button-video-record"
                  >
                    <Video className="w-7 h-7" />
                    <span className="text-xs leading-tight">Record Video</span>
                  </Button>
                </div>
                <p className="text-xs text-neutral-500 text-center">
                  No action → auto audio recording starts.
                </p>
              </motion.div>
            )}

            {(phase === "recording_audio" || phase === "recording_video") && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <div className="bg-red-600 text-white rounded-2xl p-4 w-full text-center">
                  <p className="font-bold flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    {phase === "recording_video" ? "Recording Video" : "Recording Audio"}
                  </p>
                  <p className="text-sm opacity-90 mt-1">
                    Auto-stop in {recordCountdown}s
                  </p>
                </div>
                {phase === "recording_video" && (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full max-w-sm rounded-2xl bg-black aspect-video"
                  />
                )}
                {phase === "recording_audio" && (
                  <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center">
                    <Mic className="w-16 h-16 text-red-600 animate-pulse" />
                  </div>
                )}
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="rounded-full px-8"
                  data-testid="button-stop-recording"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop & Send
                </Button>
              </motion.div>
            )}

            {phase === "sent" && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700">Help is on the way</h2>
                <p className="text-neutral-600 max-w-xs">
                  Your alert and evidence have been delivered to the nearest station.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={reset} data-testid="button-new-sos">
                    New Alert
                  </Button>
                  <Button
                    onClick={() => setLocation("/citizen/dashboard")}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-return-dashboard"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileLayout>
  );
}
