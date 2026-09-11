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
  Volume2,
  VolumeX,
  Sparkles,
  Mic,
  Zap,
  Camera,
  Radio,
  Bot,
  CheckCircle2,
  X,
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
import { speakText, stopSpeech, isSpeechSpeaking } from "@/lib/languages";

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
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [ttsMuted, setTtsMuted] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [autoListenTick, setAutoListenTick] = useState(0);
  const chatEndRef = useRef(null);
  const otherInputRef = useRef(null);


  useEffect(() => {
    setMounted(true);
    if (!session) {
      startNewSession();
    }
  }, []);


  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStopSpeech = useCallback(() => {
    stopSpeech();
    setIsAiSpeaking(false);
    setSpeakingMsgIndex(null);
  }, []);

  const handleSpeak = useCallback(
    (text, index = null) => {
      if (ttsMuted) return;
      setIsAiSpeaking(true);
      if (index !== null) setSpeakingMsgIndex(index);

      speakText(text, language || "en-IN", {
        onStart: () => {
          setIsAiSpeaking(true);
          if (index !== null) setSpeakingMsgIndex(index);
        },
        onEnd: () => {
          setIsAiSpeaking(false);
          setSpeakingMsgIndex(null);
          // If hands-free mode is active, trigger auto-listen for patient's reply
          if (handsFree && !isComplete) {
            setInputMode("voice");
            setAutoListenTick((prev) => prev + 1);
          }
        },
        onError: () => {
          setIsAiSpeaking(false);
          setSpeakingMsgIndex(null);
        },
      });
    },
    [ttsMuted, language, handsFree, isComplete]
  );

  // Initial greeting
  useEffect(() => {
    if (!mounted) return;

    const greeting =
      language === "hi-IN"
        ? "नमस्ते! मैं MediKiosk AI हूँ। आज आप अस्पताल क्यों आए हैं? आप बोलकर या नीचे दिए विकल्पों से बता सकते हैं।"
        : "Hello! I am MediKiosk AI. What brings you to the hospital today? You can speak or tap an option below.";

    const initialOptions = [
      { text: language === "hi-IN" ? "बुखार" : "Fever" },
      { text: language === "hi-IN" ? "सिर दर्द" : "Headache" },
      { text: language === "hi-IN" ? "पेट दर्द" : "Stomach pain" },
      { text: language === "hi-IN" ? "खांसी / जुकाम" : "Cough / Cold" },
      { text: language === "hi-IN" ? "सीने में दर्द" : "Chest pain" },
      { text: language === "hi-IN" ? "शरीर में दर्द" : "Body pain" },
      { text: language === "hi-IN" ? "चोट" : "Injury" },
      { text: language === "hi-IN" ? "सामान्य जांच" : "General checkup" },
      { text: language === "hi-IN" ? "अन्य" : "Other" },
    ];

    setMessages([{ role: "ai", text: greeting }]);
    setCurrentOptions(initialOptions);
    setInputMode("options");

    // Speak the greeting
    setTimeout(() => handleSpeak(greeting, 0), 500);
  }, [mounted, language, handleSpeak]);

  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || isLoading) return;

      // Stop ongoing speech immediately
      handleStopSpeech();

      // Immediate routing if user asks to scan documents or view summary
      const lower = messageText.trim().toLowerCase();
      if (
        lower === "scan" ||
        lower.includes("scan doc") ||
        lower.includes("scan report") ||
        messageText.includes("दस्तावेज़ स्कैन") ||
        messageText.includes("रिपोर्ट स्कैन")
      ) {
        router.push("/scan");
        return;
      }
      if (lower === "summary" || lower.includes("view summary") || messageText.includes("सारांश")) {
        router.push("/summary");
        return;
      }

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

        // Add AI response with language guarantee
        const isEnglish = !language || language === "en" || language.startsWith("en");
        let aiText = data.response || data.response_english || "I understand. Let me continue.";
        if (isEnglish && /[\u0900-\u097F]/.test(aiText) && data.response_english) {
          aiText = data.response_english;
        }

        setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
        addConversationMessage("ai", aiText);

        // Update options
        if (data.options && data.options.length > 0) {
          const sanitizedOptions = data.options.map((opt) => ({
            ...opt,
            text: isEnglish && /[\u0900-\u097F]/.test(opt.text || "") && opt.text_english
              ? opt.text_english
              : opt.text,
          }));
          setCurrentOptions(sanitizedOptions);
          setInputMode((prev) => (prev === "text" ? "text" : "options"));
        } else {
          setCurrentOptions([]);
          setInputMode((prev) => (prev === "options" ? "voice" : prev));
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

        // Speak the AI response with index tracking
        handleSpeak(aiText, messages.length + 1);
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
      router,
      handleSpeak,
      handleStopSpeech,
    ]
  );

  const PAIN_TRIGGERS = [
    "pain", "दर्द", "ache", "hurts", "hurt", "sore", "chest pain",
    "body pain", "stomach pain", "सीने में दर्द", "पेट दर्द", "शरीर में दर्द",
    "headache", "सिर दर्द", "leg pain", "back pain", "joint pain", "injury", "चोट",
  ];

  const handleOptionSelect = (option) => {
    handleStopSpeech();
    const text = typeof option === "string" ? option : option.text;
    const textEn = typeof option === "object" ? (option.text_english || option.text) : option;

    // Direct routing for Scan Documents
    const isScanAction =
      textEn?.toLowerCase().includes("scan") ||
      text?.toLowerCase().includes("scan") ||
      text?.includes("स्कैन") ||
      text?.includes("दस्तावेज़ स्कैन");
    if (isScanAction) {
      router.push("/scan");
      return;
    }

    // Direct routing for View Summary
    const isSummaryAction =
      textEn?.toLowerCase().includes("summary") ||
      text?.toLowerCase().includes("summary") ||
      text?.includes("सारांश");
    if (isSummaryAction) {
      router.push("/summary");
      return;
    }

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

  const handleBodyMapConfirm = (location) => {
    setBodyMapUsed(true);
    setShowBodyMap(false);
    const label = location.label_en || location.label_hi || location.name;
    sendMessage(`Pain located in: ${label}`);
  };

  const handleOtherSubmit = (e) => {
    e.preventDefault();
    if (otherInput.trim()) {
      sendMessage(otherInput.trim());
      setOtherInput("");
      setShowOtherInput(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput.trim());
      setTextInput("");
    }
  };

  const handleSkipInterview = () => {
    setIsComplete(true);
    router.push("/scan");
  };

  const handleComplete = () => {
    router.push("/scan");
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="interview-page-shell">
        <div className="interview-container">
          {/* Progress */}
          <div className="interview-header">
            <InterviewProgress currentSection={currentSection} progress={progress} />
            
            <div className="interview-controls">
              {/* Voice Mute / Unmute Toggle */}
              <button
                type="button"
                className={`mode-toggle ${!ttsMuted ? "audio-on" : "audio-off"}`}
                onClick={() => {
                  if (!ttsMuted) handleStopSpeech();
                  setTtsMuted(!ttsMuted);
                }}
                title={ttsMuted ? "Unmute AI Voice (आवाज़ चालू करें)" : "Mute AI Voice (आवाज़ बंद करें)"}
                id="voice-mute-toggle"
              >
                {ttsMuted ? <VolumeX size={14} /> : <Volume2 size={14} className={isAiSpeaking ? "pulse-icon" : ""} />}
                <span>{ttsMuted ? "Voice Off" : isAiSpeaking ? "Speaking..." : "AI Voice"}</span>
              </button>

              <button
                type="button"
                className="mode-toggle scan-control-btn"
                onClick={() => router.push("/scan")}
                title="Scan prescriptions or lab reports"
                id="header-scan-btn"
              >
                <Camera size={14} />
                <span>Scan Docs</span>
              </button>

              <button
                className={`mode-toggle ${isAyush ? "active" : ""}`}
                onClick={() => setIsAyush(!isAyush)}
                title="Toggle AYUSH mode"
                id="ayush-toggle"
              >
                <Leaf size={15} />
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
                  <div className="chat-ai-header">
                    <span className="chat-sender" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span className="sender-pulse-dot" /> <Bot size={13} /> MediKiosk AI Assistant
                    </span>
                    <button
                      type="button"
                      className={`chat-tts-btn ${isAiSpeaking && speakingMsgIndex === index ? "speaking" : ""}`}
                      onClick={() => {
                        if (isAiSpeaking && speakingMsgIndex === index) {
                          handleStopSpeech();
                        } else {
                          handleSpeak(msg.text, index);
                        }
                      }}
                      title="Listen to question"
                    >
                      {isAiSpeaking && speakingMsgIndex === index ? (
                        <>
                          <span className="mini-bars">
                            <span className="bar bar-1" />
                            <span className="bar bar-2" />
                            <span className="bar bar-3" />
                          </span>
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} /> Replay
                        </>
                      )}
                    </button>
                  </div>
                )}
                <p className="bubble-message-text">{msg.text}</p>
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble ai loading-bubble">
                <div className="chat-ai-header">
                  <span className="chat-sender" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span className="sender-pulse-dot" /> <Bot size={13} /> MediKiosk AI Assistant
                  </span>
                </div>
                <LoadingPulse text="Understanding symptoms & adapting questions..." />
              </div>
            )}

            {!isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "ai" && !isComplete && (
              <div className="waiting-response-banner animate-fade-in">
                <Sparkles size={14} className="accent-sparkle" />
                <span>Your turn: Select an answer or speak below / कृपया नीचे उत्तर दें</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            {/* Input Mode Tabs */}
            {!isComplete && (
              <div className="input-mode-tabs">
                {currentOptions.length > 0 && (
                  <button
                    type="button"
                    className={`mode-tab ${inputMode === "options" ? "active" : ""}`}
                    onClick={() => setInputMode("options")}
                    id="tab-options-btn"
                  >
                    <Zap size={14} /> Quick Options ({currentOptions.length})
                  </button>
                )}
                <button
                  type="button"
                  className={`mode-tab ${inputMode === "voice" ? "active" : ""}`}
                  onClick={() => setInputMode("voice")}
                  id="tab-voice-btn"
                >
                  <Mic size={14} /> Voice (Bhashini)
                </button>
                <button
                  type="button"
                  className={`mode-tab ${inputMode === "text" ? "active" : ""}`}
                  onClick={() => setInputMode("text")}
                  id="tab-text-btn"
                >
                  <Keyboard size={14} /> Type Response
                </button>
                <button
                  type="button"
                  className="mode-tab scan-dock-tab"
                  onClick={() => router.push("/scan")}
                  id="tab-scan-btn"
                  title="Scan medical reports or prescriptions"
                >
                  <Camera size={14} /> Scan Docs
                </button>
              </div>
            )}

            {/* Quick Touch Options */}
            {inputMode === "options" && currentOptions.length > 0 && !isLoading && (
              <div className="options-section animate-fade-in">
                <div className="options-scroll-container">
                  <TouchOptions
                    options={currentOptions}
                    onSelect={handleOptionSelect}
                    disabled={isLoading}
                  />
                </div>
                {/* Instant Quick Mic Shortcut */}
                <div className="quick-voice-bar">
                  <button
                    type="button"
                    className="quick-voice-btn"
                    onClick={() => {
                      handleStopSpeech();
                      setInputMode("voice");
                    }}
                  >
                    <Mic size={15} /> Prefer speaking? Tap here to speak in your language (बोलकर बताएं)
                  </button>
                </div>
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
                    <X size={16} />
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={14} /> Please describe in your own words:
                  </span>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setShowOtherInput(false)}
                    aria-label="Cancel"
                  >
                    <X size={16} />
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

            {/* Voice Input */}
            {inputMode === "voice" && !isComplete && (
              <div className="voice-section animate-fade-in">
                <VoiceRecorder
                  language={language || "en-IN"}
                  onTranscript={sendMessage}
                  disabled={isLoading}
                  autoListen={autoListenTick > 0}
                  isAiSpeaking={isAiSpeaking}
                  handsFree={handsFree}
                  onHandsFreeToggle={setHandsFree}
                />
              </div>
            )}

            {/* Text Input */}
            {inputMode === "text" && !isComplete && (
              <form onSubmit={handleTextSubmit} className="text-input-form animate-fade-in">
                <input
                  type="text"
                  className="input-field input-large"
                  placeholder={language?.startsWith("hi") ? "यहाँ अपना उत्तर लिखें..." : "Type your medical response here..."}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isLoading}
                  id="text-input"
                  autoFocus
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
                  <h3 style={{ color: "var(--color-accent-primary)", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <CheckCircle2 size={20} /> Interview Complete!
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
          </div>

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

        {/* Red Flag Alert */}
        {showRedFlag && (
          <RedFlagAlert
            reason={showRedFlag}
            onDismiss={() => setShowRedFlag(null)}
            onTriage={() => {
              alert("Priority triage alert sent to staff!");
              setShowRedFlag(null);
            }}
          />
        )}
      </div>

      <style jsx>{`
        .interview-page-shell {
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding-top: 72px;
          position: relative;
        }

        .interview-container {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          max-width: 860px;
          margin: 0 auto;
          width: 100%;
          padding: 0 16px;
        }

        .interview-header {
          padding: 6px 0 10px;
          border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
        }

        .interview-controls {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
        }

        .scan-control-btn {
          background: rgba(0, 212, 170, 0.08);
          border-color: rgba(0, 212, 170, 0.3);
          color: var(--color-accent-primary);
        }

        .scan-control-btn:hover {
          background: rgba(0, 212, 170, 0.2);
          transform: translateY(-1px);
        }

        .mode-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
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
          padding: 16px 6px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 0;
          scroll-behavior: smooth;
        }

        .chat-ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .chat-sender {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .sender-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-accent-primary);
          box-shadow: 0 0 8px var(--color-accent-primary);
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        .chat-tts-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 12px;
          background: rgba(0, 212, 170, 0.1);
          border: 1px solid rgba(0, 212, 170, 0.25);
          color: var(--color-accent-primary);
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .chat-tts-btn:hover {
          background: rgba(0, 212, 170, 0.25);
          transform: scale(1.04);
        }

        .chat-tts-btn.speaking {
          background: rgba(56, 189, 248, 0.22);
          border-color: #38bdf8;
          color: #38bdf8;
        }

        .mini-bars {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
        }

        .mini-bars .bar {
          width: 2.5px;
          background: #38bdf8;
          border-radius: 1px;
          animation: barBounce 0.7s ease-in-out infinite alternate;
        }

        .mini-bars .bar-1 { height: 4px; animation-delay: 0.1s; }
        .mini-bars .bar-2 { height: 11px; animation-delay: 0.3s; }
        .mini-bars .bar-3 { height: 7px; animation-delay: 0.2s; }

        @keyframes barBounce {
          0% { height: 3px; }
          100% { height: 12px; }
        }

        .mode-toggle.audio-on {
          border-color: rgba(0, 212, 170, 0.35);
          color: var(--color-accent-primary);
        }

        .mode-toggle.audio-off {
          border-color: rgba(239, 68, 68, 0.35);
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        .quick-voice-bar {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        .quick-voice-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: rgba(0, 212, 170, 0.08);
          border: 1px dashed rgba(0, 212, 170, 0.35);
          color: var(--color-accent-primary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-voice-btn:hover {
          background: rgba(0, 212, 170, 0.18);
          border-style: solid;
          transform: translateY(-1px);
        }

        .bubble-message-text {
          margin: 0;
          line-height: 1.65;
          font-size: 1.05rem;
          color: #ffffff;
        }

        .waiting-response-banner {
          align-self: center;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 20px;
          background: rgba(0, 212, 170, 0.08);
          border: 1px solid rgba(0, 212, 170, 0.25);
          color: var(--color-accent-primary);
          font-size: 0.8rem;
          font-weight: 600;
          box-shadow: 0 0 16px rgba(0, 212, 170, 0.1);
          margin: 4px 0 8px;
        }

        .accent-sparkle {
          color: var(--color-accent-primary);
          animation: spin-slow 6s linear infinite;
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .input-area {
          flex-shrink: 0;
          background: rgba(8, 14, 38, 0.95);
          backdrop-filter: blur(16px);
          border-top: 1.5px solid rgba(0, 212, 170, 0.25);
          border-radius: 20px 20px 0 0;
          padding: 12px 16px 14px;
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.45);
          position: relative;
          z-index: 10;
        }

        .input-mode-tabs {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .mode-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .mode-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 212, 170, 0.3);
          color: var(--color-text-primary);
        }

        .mode-tab.active {
          background: rgba(0, 212, 170, 0.15);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          box-shadow: 0 0 14px rgba(0, 212, 170, 0.2);
        }

        .options-section {
          margin-bottom: 4px;
        }

        .options-scroll-container {
          max-height: 210px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .voice-section {
          display: flex;
          justify-content: center;
          width: 100%;
          max-height: 230px;
          overflow-y: auto;
        }

        .text-input-form {
          display: flex;
          gap: 10px;
          align-items: center;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }

        .text-input-form .input-field {
          flex: 1;
        }

        .complete-section {
          padding: 8px 0;
        }

        .other-input-form {
          margin-bottom: 12px;
          background: rgba(0, 212, 170, 0.06);
          border: 1px solid rgba(0, 212, 170, 0.3);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }

        .other-input-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--color-accent-primary);
          font-weight: 600;
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
          flex-shrink: 0;
        }

        .skip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: var(--radius-full);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text-muted);
          font-size: 0.74rem;
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
          margin: 0 auto 12px;
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
