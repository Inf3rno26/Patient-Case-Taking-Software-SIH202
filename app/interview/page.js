"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowRight,
  Leaf,
  MessageSquare,
  FileText,
  Keyboard,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingPulse from "@/components/ui/LoadingPulse";
import VoiceRecorder from "@/components/VoiceRecorder";
import TouchOptions from "@/components/TouchOptions";
import InterviewProgress from "@/components/InterviewProgress";
import RedFlagAlert from "@/components/RedFlagAlert";
import BodyMap from "@/components/BodyMap";
import { usePatient } from "@/context/PatientContext";
import { speakText } from "@/lib/languages";

function InterviewContent() {
  const router = useRouter();
  const {
    session,
    language,
    startNewSession,
    addConversationMessage,
    updateSession,
    addRedFlag,
  } = usePatient();

  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [currentSection, setCurrentSection] = useState("chief_complaint");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showRedFlag, setShowRedFlag] = useState(null);
  const [isAyush, setIsAyush] = useState(false);
  const [inputMode, setInputMode] = useState("voice"); // 'voice' | 'text'
  const [textInput, setTextInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [otherInput, setOtherInput] = useState("");      // for "Other" inline box
  const [showOtherInput, setShowOtherInput] = useState(false); // show when "Other" tapped
  const [showBodyMap, setShowBodyMap] = useState(false); // body map pain locator
  const [bodyMapUsed, setBodyMapUsed] = useState(false); // track if used already
  const chatEndRef = useRef(null);
  const otherInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (!mounted) return;

    const greeting =
      language === "hi-IN"
        ? "नमस्ते! मैं MediKiosk AI हूँ। आज आप अस्पताल क्यों आए हैं? आप बोलकर या नीचे दिए विकल्पों से बता सकते हैं।"
        : "Hello! I am MediKiosk AI. What brings you to the hospital today? You can speak or tap an option below.";

    const initialOptions = [
      { text: language === "hi-IN" ? "बुखार" : "Fever", icon: "🤒" },
      { text: language === "hi-IN" ? "सिर दर्द" : "Headache", icon: "🤕" },
      { text: language === "hi-IN" ? "पेट दर्द" : "Stomach pain", icon: "😣" },
      { text: language === "hi-IN" ? "खांसी / जुकाम" : "Cough / Cold", icon: "😷" },
      { text: language === "hi-IN" ? "सीने में दर्द" : "Chest pain", icon: "💔" },
      { text: language === "hi-IN" ? "शरीर में दर्द" : "Body pain", icon: "🦴" },
      { text: language === "hi-IN" ? "चोट" : "Injury", icon: "🩹" },
      { text: language === "hi-IN" ? "सामान्य जांच" : "General checkup", icon: "🏥" },
      { text: language === "hi-IN" ? "अन्य" : "Other", icon: "💬" },
    ];

    setMessages([{ role: "ai", text: greeting }]);
    setCurrentOptions(initialOptions);

    // Speak the greeting
    setTimeout(() => speakText(greeting, language || "en-IN"), 500);
  }, [mounted, language]);

  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || isLoading) return;

      // Add patient message to chat
      const patientMsg = { role: "patient", text: messageText.trim() };
      setMessages((prev) => [...prev, patientMsg]);
      addConversationMessage("patient", messageText.trim());
      setCurrentOptions([]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText.trim(),
            conversationHistory: [...messages, patientMsg].map((m) => ({
              role: m.role,
              text: m.text,
            })),
            language: language || "en-IN",
            isAyush,
            currentSection,
          }),
        });

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();

        // Add AI response
        const aiText = data.response || data.response_english || "I understand. Let me continue.";
        setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
        addConversationMessage("ai", aiText);

        // Update options
        if (data.options && data.options.length > 0) {
          setCurrentOptions(data.options);
        }

        // Update progress
        if (data.section) setCurrentSection(data.section);
        if (data.progress !== undefined) setProgress(data.progress);

        // Check for red flags
        if (data.isRedFlag) {
          setShowRedFlag(data.redFlagReason || "Emergency symptoms detected");
          addRedFlag({ reason: data.redFlagReason, section: data.section });
        }

        // Check for completion
        if (data.section === "complete") {
          setIsComplete(true);
        }

        // Update extracted data
        if (data.extractedData && Object.keys(data.extractedData).length > 0) {
          updateSession({ extractedHistory: { ...session?.extractedHistory, ...data.extractedData } });
        }

        // Speak the AI response
        speakText(aiText, language || "en-IN");
      } catch (error) {
        console.error("Interview error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "I apologize, there was a brief interruption. Could you please repeat that?",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      messages,
      language,
      isAyush,
      currentSection,
      addConversationMessage,
      addRedFlag,
      updateSession,
      session,
    ]
  );

  const PAIN_TRIGGERS = [
    "pain", "दर्द", "ache", "hurts", "hurt", "sore", "chest pain",
    "body pain", "stomach pain", "सीने में दर्द", "पेट दर्द", "शरीर में दर्द",
    "headache", "सिर दर्द", "leg pain", "back pain", "joint pain", "injury", "चोट",
  ];

  const handleOptionSelect = (option) => {
    const text = typeof option === "string" ? option : option.text;
    const textEn = typeof option === "object" ? (option.text_english || option.text) : option;
    // If "Other" / "अन्य" is tapped, show an inline text box instead of sending
    const isOther =
      textEn?.toLowerCase() === "other" ||
      text === "अन्य" ||
      text?.toLowerCase() === "other";
    if (isOther) {
      setShowOtherInput(true);
      setOtherInput("");
      setTimeout(() => otherInputRef.current?.focus(), 100);
      return;
    }

    // Auto-show BodyMap if patient selects a pain-related chief complaint
    if (
      currentSection === "chief_complaint" &&
      !bodyMapUsed &&
      PAIN_TRIGGERS.some((trigger) => text.toLowerCase().includes(trigger.toLowerCase()))
    ) {
      setShowBodyMap(true);
    }

    setShowOtherInput(false);
    sendMessage(text);
  };

  const handleBodyMapConfirm = (locationData) => {
    // Auto-send body map result as a structured message into the interview
    const msg = locationData.description;
    setShowBodyMap(false);
    setBodyMapUsed(true);
    sendMessage(msg);
  };

  const handleOtherSubmit = (e) => {
    e?.preventDefault();
    if (otherInput.trim()) {
      setShowOtherInput(false);
      sendMessage(otherInput.trim());
      setOtherInput("");
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput("");
    }
  };

  const handleComplete = () => {
    router.push("/scan");
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="interview-container">
          {/* Progress */}
          <div className="interview-header">
            <InterviewProgress currentSection={currentSection} progress={progress} />
            
            <div className="interview-controls">
              <button
                className={`mode-toggle ${isAyush ? "active" : ""}`}
                onClick={() => setIsAyush(!isAyush)}
                title="Toggle AYUSH mode"
                id="ayush-toggle"
              >
                <Leaf size={16} />
                AYUSH
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${msg.role === "ai" ? "ai" : "patient"}`}
              >
                {msg.role === "ai" && (
                  <span className="chat-sender">🤖 MediKiosk AI</span>
                )}
                <p>{msg.text}</p>
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble ai">
                <LoadingPulse text="" />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            {/* Touch Options */}
            {currentOptions.length > 0 && !isLoading && (
              <div className="options-section">
                <p className="options-label">
                  <MessageSquare size={14} /> Tap to answer / बोलकर या टैप करके जवाब दें
                </p>
                <TouchOptions
                  options={currentOptions}
                  onSelect={handleOptionSelect}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Body Map — auto-appears for pain-related complaints */}
            {showBodyMap && !isLoading && (
              <div className="bodymap-section animate-fade-in-up">
                <div className="bodymap-toggle-header">
                  <MapPin size={14} />
                  <span>Show us where it hurts — Tap your pain location</span>
                  <button
                    className="btn-icon"
                    onClick={() => setShowBodyMap(false)}
                    title="Skip body map"
                    id="bodymap-skip-btn"
                  >
                    ✕
                  </button>
                </div>
                <BodyMap
                  onLocationSelect={handleBodyMapConfirm}
                  language={language}
                />
              </div>
            )}

            {/* "Other" custom input — shown when user taps Other */}
            {showOtherInput && !isLoading && (
              <form
                onSubmit={handleOtherSubmit}
                className="other-input-form animate-fade-in-up"
              >
                <div className="other-input-header">
                  <span>💬 Please describe in your own words:</span>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowOtherInput(false)}
                    aria-label="Cancel"
                  >
                    ✕
                  </button>
                </div>
                <div className="other-input-row">
                  <input
                    ref={otherInputRef}
                    type="text"
                    className="input-field input-large"
                    placeholder={language?.startsWith("hi") ? "यहाँ अपनी समस्या लिखें..." : "Describe your symptom or concern..."}
                    value={otherInput}
                    onChange={(e) => setOtherInput(e.target.value)}
                    id="other-input-field"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!otherInput.trim()}
                    id="other-submit-btn"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* Mode Toggle */}
            <div className="input-mode-toggle">
              <button
                className={`mode-btn ${inputMode === "voice" ? "active" : ""}`}
                onClick={() => setInputMode("voice")}
                id="mode-voice-btn"
              >
                🎤 Voice
              </button>
              <button
                className={`mode-btn ${inputMode === "text" ? "active" : ""}`}
                onClick={() => setInputMode("text")}
                id="mode-text-btn"
              >
                <Keyboard size={14} /> Type
              </button>
            </div>

            {/* Voice Input */}
            {inputMode === "voice" && !isComplete && (
              <VoiceRecorder
                language={language || "en-IN"}
                onTranscript={sendMessage}
                disabled={isLoading}
              />
            )}

            {/* Text Input */}
            {inputMode === "text" && !isComplete && (
              <form onSubmit={handleTextSubmit} className="text-input-form">
                <input
                  type="text"
                  className="input-field input-large"
                  placeholder="Type your response..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isLoading}
                  id="text-input"
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!textInput.trim() || isLoading}
                  id="text-send-btn"
                >
                  <Send size={20} />
                </button>
              </form>
            )}

            {/* Complete Button */}
            {isComplete && (
              <div className="complete-section animate-scale-in">
                <GlassCard hoverable={false} style={{ textAlign: "center" }}>
                  <h3 style={{ color: "var(--color-accent-primary)", marginBottom: 12 }}>
                    ✅ Interview Complete!
                  </h3>
                  <p style={{ color: "var(--color-text-secondary)", marginBottom: 20, fontSize: "0.9rem" }}>
                    Your medical history has been recorded. You can now scan documents or view your summary.
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      className="btn-secondary btn-touch"
                      onClick={() => router.push("/scan")}
                      id="go-scan-btn"
                    >
                      <FileText size={18} />
                      Scan Documents
                    </button>
                    <button
                      className="btn-primary btn-touch"
                      onClick={() => router.push("/summary")}
                      id="go-summary-btn"
                    >
                      <ArrowRight size={18} />
                      View Summary
                    </button>
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Always-visible escape hatch — skip to summary */}
            {!isComplete && messages.length > 2 && (
              <div className="skip-bar">
                <button
                  className="skip-btn"
                  onClick={() => router.push("/summary")}
                  id="skip-to-summary-btn"
                >
                  <ArrowRight size={14} />
                  Skip → Generate Summary
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Red Flag Alert */}
        {showRedFlag && (
          <RedFlagAlert
            reason={showRedFlag}
            onDismiss={() => setShowRedFlag(null)}
            onTriage={() => {
              alert("🚨 Priority triage alert sent to staff!");
              setShowRedFlag(null);
            }}
          />
        )}
      </div>

      <style jsx>{`
        .interview-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 70px);
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 0 16px;
        }

        .interview-header {
          padding: 12px 0;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .interview-controls {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .mode-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .mode-toggle.active {
          background: rgba(0, 212, 170, 0.1);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-sender {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-accent-primary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .chat-bubble p {
          margin: 0;
          line-height: 1.6;
        }

        .input-area {
          flex-shrink: 0;
          padding: 12px 0 20px;
          border-top: 1px solid var(--color-border);
        }

        .options-section {
          margin-bottom: 16px;
        }

        .options-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-bottom: 10px;
        }

        .input-mode-toggle {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 12px;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.85rem;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .mode-btn.active {
          background: rgba(0, 212, 170, 0.1);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .text-input-form {
          display: flex;
          gap: 10px;
        }

        .text-input-form .input-field {
          flex: 1;
        }

        .complete-section {
          padding: 8px 0;
        }

        .other-input-form {
          margin-bottom: 12px;
          background: rgba(0, 212, 170, 0.05);
          border: 1px solid rgba(0, 212, 170, 0.25);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }

        .other-input-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--color-accent-primary);
          font-weight: 500;
          margin-bottom: 10px;
        }

        .other-input-row {
          display: flex;
          gap: 10px;
        }

        .other-input-row .input-field {
          flex: 1;
        }

        .skip-bar {
          display: flex;
          justify-content: center;
          padding: 6px 0 2px;
        }

        .skip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: var(--radius-full);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .skip-btn:hover {
          background: rgba(0, 212, 170, 0.06);
          border-color: rgba(0, 212, 170, 0.25);
          color: var(--color-accent-primary);
        }
        /* Body Map Section */
        .bodymap-section {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }

        .bodymap-toggle-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 94, 87, 0.06);
          border: 1px solid rgba(255, 94, 87, 0.2);
          border-bottom: none;
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          font-size: 0.8rem;
          color: #ff8c82;
          font-weight: 500;
        }

        .bodymap-toggle-header button {
          margin-left: auto;
        }
      `}</style>
    </>
  );
}

export default function InterviewPage() {
  return <InterviewContent />;
}
