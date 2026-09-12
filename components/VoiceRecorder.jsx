"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, RotateCcw, Send, Radio, AlertCircle, Loader2 } from "lucide-react";
import { getBhashiniLang } from "@/lib/bhashini";
import { playAudioCue, stopSpeech } from "@/lib/languages";

export default function VoiceRecorder({
  language = "en-IN",
  onTranscript,
  onInterimTranscript,
  disabled = false,
  autoListen = false,
  isAiSpeaking = false,
  onHandsFreeToggle,
  handsFree = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isHandsFreeActive, setIsHandsFreeActive] = useState(handsFree);
  const [activeEngine, setActiveEngine] = useState("hybrid"); // 'web_speech' | 'cloud_asr' | 'hybrid'

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const bhashiniMeta = getBhashiniLang(language);
  const isEnglish = !language || language === "en" || language.startsWith("en");

  // Keep transcriptRef & interimRef in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    interimRef.current = interimText;
  }, [interimText]);

  // Sync external handsFree prop
  useEffect(() => {
    setIsHandsFreeActive(handsFree);
  }, [handsFree]);

  // Stop listening if AI starts speaking
  useEffect(() => {
    if (isAiSpeaking && isListeningRef.current) {
      stopListening(false);
    }
  }, [isAiSpeaking]);

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Cleanup helper
  const cleanupMedia = useCallback(() => {
    clearSilenceTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, [clearSilenceTimer]);

  // Transcribe audio blob via server-side /api/asr (Gemini / Bhashini fallback)
  const transcribeAudioBlob = useCallback(
    async (audioBlob, mimeType) => {
      try {
        setIsTranscribing(true);
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
        reader.readAsDataURL(audioBlob);
        const base64Data = await base64Promise;

        const res = await fetch("/api/asr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64Data,
            mimeType: mimeType || "audio/webm",
            language: language || "en-IN",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            const text = data.transcript.trim();
            setTranscript(text);
            playAudioCue("success");
            onTranscript(text);
            return text;
          }
        }
      } catch (err) {
        console.warn("[Cloud ASR Error]:", err);
      } finally {
        setIsTranscribing(false);
      }
      return null;
    },
    [language, onTranscript]
  );

  // Stop microphone recording & process transcript
  const stopListening = useCallback(
    async (sendImmediately = true) => {
      clearSilenceTimer();
      isListeningRef.current = false;
      setIsListening(false);
      playAudioCue("stop");

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      // Check if Web Speech already captured final or interim transcript
      const existingText = (
        (transcriptRef.current || "") + " " + (interimRef.current || "")
      ).trim();

      // Stop MediaRecorder and obtain final audio blob
      let recordedBlob = null;
      let effectiveMime = "audio/webm";

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        effectiveMime = mediaRecorderRef.current.mimeType || "audio/webm";
        await new Promise((resolve) => {
          mediaRecorderRef.current.onstop = () => {
            recordedBlob = new Blob(audioChunksRef.current, { type: effectiveMime });
            resolve();
          };
          mediaRecorderRef.current.stop();
        });
      }

      cleanupMedia();

      // If we already have a clean live transcript from Web Speech, send it!
      if (existingText) {
        if (sendImmediately) {
          playAudioCue("success");
          onTranscript(existingText);
          setTranscript("");
          setInterimText("");
          interimRef.current = "";
          transcriptRef.current = "";
        }
        return;
      }

      // If Web Speech was silent or hit a network error, use Cloud ASR on the recorded audio
      if (recordedBlob && recordedBlob.size > 1000) {
        const cloudText = await transcribeAudioBlob(recordedBlob, effectiveMime);
        if (cloudText && sendImmediately) {
          setTranscript("");
          setInterimText("");
          interimRef.current = "";
          transcriptRef.current = "";
        }
      }
    },
    [clearSilenceTimer, cleanupMedia, onTranscript, transcribeAudioBlob]
  );

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language || "en-IN";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }

        if (final) {
          setTranscript((prev) => {
            const next = prev ? `${prev} ${final}` : final;
            transcriptRef.current = next;
            return next;
          });
          setErrorMessage(null);
        }

        setInterimText(interim);
        interimRef.current = interim;
        if (onInterimTranscript) onInterimTranscript(interim);

        // Reset silence timer: automatically stop & send after 2.0s of silence
        clearSilenceTimer();
        const currentSpoken = ((transcriptRef.current || "") + " " + (interim || "")).trim();
        if (currentSpoken.length > 2) {
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopListening(true);
            }
          }, 2000);
        }
      };

      recognition.onerror = (event) => {
        console.warn("[SpeechRecognition Notice]:", event.error);
        if (event.error === "no-speech") return;

        if (event.error === "network") {
          console.log("[ASR] Web Speech network notice. Cloud MediaRecorder ASR standby.");
          setActiveEngine("cloud_asr");
          return;
        }

        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access blocked. Please allow microphone in your browser settings.");
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If listening is still supposed to be active, gently restart
        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {}
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      isListeningRef.current = false;
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      cleanupMedia();
    };
  }, [language, onInterimTranscript, cleanupMedia, clearSilenceTimer, stopListening]);

  // Start microphone recording (with MediaRecorder fail-safe)
  const startListening = useCallback(async () => {
    if (disabled || isTranscribing) return;

    stopSpeech();
    clearSilenceTimer();
    setErrorMessage(null);
    setTranscript("");
    setInterimText("");
    transcriptRef.current = "";
    interimRef.current = "";
    audioChunksRef.current = [];

    // 1. Start local MediaRecorder (works across all browsers and networks)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

        const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(250); // Slice into 250ms chunks
      }
    } catch (err) {
      console.warn("MediaRecorder mic access warning:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Microphone permission denied. Please allow microphone access in your browser.");
        return;
      }
    }

    // 2. Start Web Speech recognition for live preview
    isListeningRef.current = true;
    setIsListening(true);
    playAudioCue("start");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Web Speech start note:", e.message);
      }
    }
  }, [disabled, isTranscribing, clearSilenceTimer]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening(true); // Send immediately on user mic click!
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  // Auto-listen trigger when AI finishes speaking (if handsFree is active)
  useEffect(() => {
    if (autoListen && isHandsFreeActive && !isListening && !disabled && !isAiSpeaking && !isTranscribing) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoListen, isHandsFreeActive, isAiSpeaking, disabled, isListening, isTranscribing, startListening]);

  const handleManualSend = useCallback(() => {
    const fullText = (
      (transcript || "") + " " + (interimText || "")
    ).trim();
    if (!fullText) return;

    if (isListening) {
      stopListening(false);
    }
    playAudioCue("success");
    onTranscript(fullText);
    setTranscript("");
    setInterimText("");
    transcriptRef.current = "";
    interimRef.current = "";
  }, [transcript, interimText, isListening, stopListening, onTranscript]);

  const handleClear = useCallback(() => {
    clearSilenceTimer();
    setTranscript("");
    setInterimText("");
    transcriptRef.current = "";
    interimRef.current = "";
  }, [clearSilenceTimer]);

  const toggleHandsFree = useCallback(() => {
    const next = !isHandsFreeActive;
    setIsHandsFreeActive(next);
    if (onHandsFreeToggle) {
      onHandsFreeToggle(next);
    }
    if (next && !isListening && !isAiSpeaking) {
      startListening();
    }
  }, [isHandsFreeActive, onHandsFreeToggle, isListening, isAiSpeaking, startListening]);

  const hasContent = Boolean(transcript || interimText);

  return (
    <div className="voice-recorder-pro animate-fade-in">
      {/* Telemetry Header */}
      <div className="telemetry-bar">
        <div className="telemetry-left">
          <span className="telemetry-flag">{isEnglish ? "🇬🇧" : "🇮🇳"}</span>
          <div className="telemetry-titles">
            <div className="telemetry-main">
              <strong>{isEnglish ? "Medical Voice Intake" : "Digital India BHASHINI"}</strong>
              <span className="telemetry-badge">
                {activeEngine === "cloud_asr" ? "AI Cloud ASR" : "Live + AI Audio"}
              </span>
            </div>
            <span className="telemetry-lang">
              Language: <strong>{bhashiniMeta.name} ({bhashiniMeta.native})</strong>
            </span>
          </div>
        </div>

        <div className="telemetry-right">
          <button
            type="button"
            className={`handsfree-toggle-btn ${isHandsFreeActive ? "active" : ""}`}
            onClick={toggleHandsFree}
            title="Hands-free continuous conversation: AI speaks, then mic automatically listens"
          >
            <Radio size={13} className={isHandsFreeActive ? "pulse-icon" : ""} />
            <span>Hands-free: {isHandsFreeActive ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Error notice if microphone access is blocked */}
      {errorMessage && (
        <div className="error-banner animate-fade-in">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Reactive Visualizer Bars */}
      <div className={`visualizer-container ${isListening ? "active" : ""}`}>
        <div className="waveform-spectrum">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`spectrum-bar ${isListening ? "active-bar" : ""}`}
              style={{
                animationDelay: `${(i % 5) * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Primary Microphone Action Button */}
      <div className="mic-action-area">
        <div className="mic-wrapper">
          {isListening && <div className="pulse-aura aura-1" />}
          {isListening && <div className="pulse-aura aura-2" />}

          <button
            type="button"
            className={`main-mic-btn ${isListening ? "recording" : ""} ${isTranscribing ? "transcribing" : ""}`}
            onClick={toggleListening}
            disabled={disabled || isAiSpeaking || isTranscribing}
            aria-label={isListening ? "Stop listening" : "Start speaking"}
            id="voice-record-btn"
          >
            {isTranscribing ? (
              <Loader2 size={36} className="mic-icon animate-spin" color="white" />
            ) : isListening ? (
              <MicOff size={38} className="mic-icon animate-pulse" />
            ) : (
              <Mic size={38} className="mic-icon" />
            )}
          </button>
        </div>

        <div className="status-container">
          <p className="status-text">
            {isTranscribing ? (
              <span className="speaking-state">
                <Loader2 size={16} className="animate-spin" />
                Transcribing your speech with AI speech model...
              </span>
            ) : isAiSpeaking ? (
              <span className="speaking-state">
                <Volume2 size={16} className="pulse-icon" />
                AI is speaking...
              </span>
            ) : isListening ? (
              <span className="listening-state">
                <span className="status-dot green" />
                Listening now... Tap microphone or &quot;Send Response&quot; when finished
              </span>
            ) : (
              <span className="idle-state">
                Tap microphone to speak in <strong>{bhashiniMeta.name}</strong>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Live Transcript Display Box */}
      {hasContent && (
        <div className="transcript-box animate-scale-in">
          <div className="transcript-header">
            <span className="transcript-title">
              <Sparkles size={14} style={{ color: "var(--color-accent-primary)" }} /> What we heard:
            </span>
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              title="Clear transcript"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>

          <div className="transcript-text">
            {transcript && <span className="final-part">{transcript}</span>}
            {interimText && <span className="interim-part"> {interimText}</span>}
          </div>

          <div className="transcript-actions">
            <button
              type="button"
              className="btn-send-now"
              onClick={handleManualSend}
              id="voice-send-btn"
              disabled={isTranscribing}
            >
              <Send size={15} /> Send Response ({isEnglish ? "Submit" : "जमा करें"})
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .voice-recorder-pro {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 18px;
          width: 100%;
          max-width: 580px;
          margin: 0 auto;
        }

        .telemetry-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 14px;
          background: rgba(0, 212, 170, 0.06);
          border: 1px solid rgba(0, 212, 170, 0.2);
          border-radius: var(--radius-md);
          flex-wrap: wrap;
          gap: 8px;
        }

        .telemetry-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .telemetry-flag {
          font-size: 1.3rem;
        }

        .telemetry-titles {
          display: flex;
          flex-direction: column;
        }

        .telemetry-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .telemetry-main strong {
          font-size: 0.82rem;
          color: var(--color-text-primary);
        }

        .telemetry-badge {
          font-size: 0.62rem;
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(0, 212, 170, 0.15);
          color: var(--color-accent-primary);
          font-weight: 700;
        }

        .telemetry-lang {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .handsfree-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-muted);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .handsfree-toggle-btn.active {
          background: rgba(0, 212, 170, 0.18);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          font-weight: 600;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          font-size: 0.78rem;
        }

        .visualizer-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          width: 100%;
        }

        .waveform-spectrum {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 32px;
        }

        .spectrum-bar {
          width: 4px;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(180deg, #00d4aa 0%, #38bdf8 100%);
          opacity: 0.3;
          transition: all 0.15s;
        }

        .spectrum-bar.active-bar {
          opacity: 0.9;
          animation: barScale 1s ease-in-out infinite alternate;
        }

        @keyframes barScale {
          0% { height: 4px; }
          100% { height: 28px; }
        }

        .mic-action-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .mic-wrapper {
          position: relative;
          width: 86px;
          height: 86px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-aura {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.25);
          pointer-events: none;
          animation: pulseRing 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .aura-2 {
          animation-delay: 0.8s;
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.55);
            opacity: 0;
          }
        }

        .main-mic-btn {
          position: relative;
          z-index: 2;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #00d4aa 0%, #38bdf8 100%);
          color: #060a1a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 212, 170, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .main-mic-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 26px rgba(0, 212, 170, 0.5);
        }

        .main-mic-btn.recording {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 24px rgba(239, 68, 68, 0.5);
        }

        .main-mic-btn.transcribing {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .status-container {
          text-align: center;
        }

        .status-text {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }

        .status-dot.green {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .speaking-state {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #38bdf8;
          font-weight: 500;
        }

        .transcript-box {
          width: 100%;
          padding: 12px 16px;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .transcript-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .transcript-title {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.72rem;
          cursor: pointer;
        }

        .transcript-text {
          font-size: 1.05rem;
          line-height: 1.5;
          color: var(--color-text-primary);
          min-height: 38px;
        }

        .final-part {
          color: var(--color-text-primary);
          font-weight: 500;
        }

        .interim-part {
          color: var(--color-text-muted);
          font-style: italic;
        }

        .transcript-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn-send-now {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: var(--radius-md);
          background: var(--color-accent-primary);
          color: #060a1a;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .btn-send-now:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-send-now:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
