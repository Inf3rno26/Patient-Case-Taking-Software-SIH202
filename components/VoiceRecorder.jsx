"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Check } from "lucide-react";
import { getBhashiniLang } from "@/lib/bhashini";

export default function VoiceRecorder({
  language = "en-IN",
  onTranscript,
  onInterimTranscript,
  disabled = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [asrEngine, setAsrEngine] = useState("bhashini"); // 'bhashini' | 'browser'
  const recognitionRef = useRef(null);

  const bhashiniMeta = getBhashiniLang(language);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => {
          const newTranscript = prev ? prev + " " + final : final;
          return newTranscript;
        });
      }
      setInterimText(interim);
      if (onInterimTranscript) onInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language, onInterimTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Send final transcript
      if (transcript) {
        onTranscript(transcript);
        setTranscript("");
        setInterimText("");
      }
    } else {
      setTranscript("");
      setInterimText("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  }, [isListening, transcript, onTranscript]);

  const sendTranscript = useCallback(() => {
    if (transcript) {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      onTranscript(transcript);
      setTranscript("");
      setInterimText("");
    }
  }, [transcript, isListening, onTranscript]);

  if (!isSupported) {
    return (
      <div className="voice-unsupported">
        <MicOff size={24} />
        <p>Voice input is not supported in this browser. Please use Chrome.</p>
        <style jsx>{`
          .voice-unsupported {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px;
            color: var(--color-text-muted);
            text-align: center;
            font-size: 0.85rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      {/* Digital India Bhashini & AI4Bharat Telemetry Badge */}
      <div className="bhashini-badge animate-fade-in">
        <div className="bhashini-left">
          <span className="bhashini-emblem">🇮🇳</span>
          <div className="bhashini-info">
            <div className="bhashini-title-row">
              <strong>Digital India BHASHINI (भाषिणी)</strong>
              <span className="bhashini-tag">AI4Bharat Model</span>
            </div>
            <span className="bhashini-sub">
              {bhashiniMeta.native} ({bhashiniMeta.name}) • {bhashiniMeta.script} Script • {bhashiniMeta.model.split("/")[1]}
            </span>
          </div>
        </div>

        <div className="bhashini-engine-pills">
          <button
            type="button"
            className={`engine-pill ${asrEngine === "bhashini" ? "active" : ""}`}
            onClick={() => setAsrEngine("bhashini")}
            title="MeitY Bhashini Indic ASR Conformer Pipeline"
          >
            Bhashini Indic
          </button>
          <button
            type="button"
            className={`engine-pill ${asrEngine === "browser" ? "active" : ""}`}
            onClick={() => setAsrEngine("browser")}
            title="Edge / Web Speech API"
          >
            Web Speech
          </button>
        </div>
      </div>

      {/* Waveform */}
      {isListening && (
        <div className="waveform">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="waveform-bar" />
          ))}
        </div>
      )}

      {/* Microphone button */}
      <button
        className={`voice-btn ${isListening ? "recording" : ""}`}
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? "Stop recording" : "Start recording"}
        id="voice-record-btn"
      >
        {isListening && <span className="pulse-ring" />}
        {isListening && <span className="pulse-ring" style={{ animationDelay: "0.5s" }} />}
        {isListening ? <MicOff size={36} color="white" /> : <Mic size={36} color="#060a1a" />}
      </button>

      {/* Status text */}
      <p className="voice-status">
        {isListening
          ? `🎙️ Bhashini ASR listening in ${bhashiniMeta.name} (${bhashiniMeta.native})... Speak now`
          : `Tap microphone to speak in ${bhashiniMeta.name} (${bhashiniMeta.native})`}
      </p>

      {/* Live transcript display */}
      {(transcript || interimText) && (
        <div className="voice-transcript">
          {transcript && <span className="final-text">{transcript}</span>}
          {interimText && <span className="interim-text">{interimText}</span>}
        </div>
      )}

      {/* Send button */}
      {transcript && !isListening && (
        <button className="btn-primary" onClick={sendTranscript} id="voice-send-btn">
          <Volume2 size={18} />
          Send Response
        </button>
      )}

      <style jsx>{`
        .voice-recorder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 16px 20px 24px;
          width: 100%;
        }

        .bhashini-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 540px;
          padding: 10px 14px;
          background: rgba(255, 153, 51, 0.06);
          border: 1px solid rgba(255, 153, 51, 0.25);
          border-radius: var(--radius-md);
          margin-bottom: 4px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .bhashini-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bhashini-emblem {
          font-size: 1.4rem;
        }

        .bhashini-info {
          display: flex;
          flex-direction: column;
        }

        .bhashini-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bhashini-title-row strong {
          font-size: 0.82rem;
          color: var(--color-text-primary);
        }

        .bhashini-tag {
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(255, 153, 51, 0.15);
          color: #ff9933;
          font-weight: 700;
        }

        .bhashini-sub {
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .bhashini-engine-pills {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
        }

        .engine-pill {
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          font-size: 0.7rem;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .engine-pill.active {
          background: var(--color-accent-primary);
          color: #060a1a;
          font-weight: 700;
        }

        .voice-status {
          color: var(--color-text-secondary);
          font-size: 0.88rem;
          text-align: center;
        }

        .voice-transcript {
          max-width: 500px;
          width: 100%;
          padding: 16px;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          line-height: 1.6;
          min-height: 60px;
          text-align: center;
        }

        .final-text {
          color: var(--color-text-primary);
        }

        .interim-text {
          color: var(--color-text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
