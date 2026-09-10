"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

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
  const recognitionRef = useRef(null);

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
        {isListening ? "🎙️ Listening... Speak now" : "Tap microphone to speak"}
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
          padding: 20px;
        }

        .voice-status {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
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
