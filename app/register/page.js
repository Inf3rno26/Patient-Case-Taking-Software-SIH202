"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Phone,
  ArrowRight,
  UserPlus,
  Hash,
  Calendar,
  Minus,
  Plus,
  UserCheck,
  Building2,
  Stethoscope,
  Pill,
  FlaskConical,
  FolderOpen,
  CheckCircle,
  Users,
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import ConsentModal from "@/components/ConsentModal";
import { usePatient } from "@/context/PatientContext";

function RegisterContent() {
  const router = useRouter();
  const { language = "en-IN", startNewSession, updatePatient, updateConsent } = usePatient();
  const [mode, setMode] = useState(null); // 'abha' | 'new'
  const [showConsent, setShowConsent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVerifyingAbha, setIsVerifyingAbha] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [abhaFetchStep, setAbhaFetchStep] = useState(null); // null | 'fetching' | 'done'
  const [abhaRecords, setAbhaRecords] = useState(null);
  const [form, setForm] = useState({
    abhaId: "",
    name: "",
    age: "",
    gender: "",
    phone: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAbhaLookup = () => {
    if (form.abhaId.length >= 14) {
      setIsVerifyingAbha(true);
      // Simulate network delay for sending OTP
      setTimeout(() => {
        setIsVerifyingAbha(false);
        setOtpSent(true);
      }, 1000);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setIsVerifyingAbha(true);
      // Step 1: Verify OTP
      setTimeout(() => {
        setIsVerifyingAbha(false);
        setOtpSent(false);
        // Step 2: Animate ABDM health record fetch
        setAbhaFetchStep("fetching");
        // Simulate fetching records from ABDM
        setTimeout(() => {
          const mockRecords = {
            name: "Rajesh Kumar",
            age: "45",
            gender: "male",
            phone: "9876543210",
            abhaAddress: form.abhaId + "@abdm",
            // Linked health records from ABDM
            lastVisit: { date: "12 Aug 2026", hospital: "AIIMS New Delhi", dept: "Endocrinology" },
            existingConditions: ["Type 2 Diabetes Mellitus (since 2019)", "Hypertension (since 2021)"],
            currentMedications: ["Metformin 500mg BD", "Amlodipine 5mg OD", "Ecosprin 75mg"],
            lastLabResults: [{ test: "HbA1c", value: "7.8%", date: "Jun 2026", flag: "↑" }, { test: "Creatinine", value: "1.0", date: "Jun 2026", flag: "" }],
            vaccinationStatus: "COVID-19 (2 doses), Influenza (Oct 2025)",
          };
          setAbhaRecords(mockRecords);
          setAbhaFetchStep("done");
          setForm((prev) => ({
            ...prev,
            name: mockRecords.name,
            age: mockRecords.age,
            gender: mockRecords.gender,
            phone: mockRecords.phone,
          }));
        }, 2200);
      }, 1000);
    }
  };

  const handleProceed = () => {
    if (!form.name || !form.age || !form.gender) return;
    setShowConsent(true);
  };

  const handleConsentAccept = (consentData) => {
    const session = startNewSession();
    updatePatient({
      abhaId: form.abhaId || null,
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      phone: form.phone,
    });
    updateConsent(consentData);
    setShowConsent(false);
    router.push("/interview");
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-center">
          <div className="container container-narrow">
            <div className="section-header animate-fade-in">
              <h1>
                Patient <span className="text-gradient">Registration</span>
              </h1>
              <p>Enter your details or scan your ABHA ID to get started</p>
            </div>

            {/* Mode Selection */}
            {!mode && (
              <div className="mode-grid animate-fade-in-up delay-2">
                <GlassCard
                  className="mode-card"
                  onClick={() => setMode("abha")}
                >
                  <div className="mode-icon">
                    <CreditCard size={40} />
                  </div>
                  <h3>I have ABHA ID</h3>
                  <p>Enter your Ayushman Bharat Health Account number</p>
                </GlassCard>

                <GlassCard
                  className="mode-card"
                  onClick={() => setMode("new")}
                >
                  <div className="mode-icon new">
                    <UserPlus size={40} />
                  </div>
                  <h3>New Patient</h3>
                  <p>Register with your basic details</p>
                </GlassCard>
              </div>
            )}

            {/* ABHA Entry */}
            {mode === "abha" && (
              <div className="form-container animate-fade-in-up">
                <GlassCard hoverable={false}>
                  <div className="form-group">
                    <label>
                      <Hash size={16} /> ABHA ID Number
                    </label>
                    <div className="input-row">
                      <input
                        type="text"
                        className="input-field input-large"
                        placeholder="XX-XXXX-XXXX-XXXX"
                        value={form.abhaId}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, abhaId: e.target.value }))
                        }
                        maxLength={17}
                        disabled={otpSent || form.name}
                        id="abha-input"
                      />
                      {(!otpSent && !form.name) && (
                        <button
                          className="btn-primary"
                          onClick={handleAbhaLookup}
                          disabled={form.abhaId.length < 14 || isVerifyingAbha}
                          id="abha-lookup-btn"
                        >
                          {isVerifyingAbha ? "Sending..." : "Verify"}
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && !form.name && (
                    <div className="form-group animate-fade-in-up">
                      <label style={{ color: "var(--color-accent-primary)" }}>
                        Enter 4-digit OTP sent to linked mobile number
                      </label>
                      <div className="input-row">
                        <input
                          type="text"
                          className="input-field input-large"
                          placeholder="e.g. 1234"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={4}
                          id="abha-otp-input"
                        />
                        <button
                          className="btn-primary"
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 4 || isVerifyingAbha}
                          id="abha-verify-otp-btn"
                        >
                          {isVerifyingAbha ? "Verifying..." : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ABHA Fetching Animation */}
                  {abhaFetchStep === "fetching" && (
                    <div className="abha-fetching animate-fade-in">
                      <div className="abdm-logo-row">
                        <div className="abdm-logo">
                          <Building2 size={24} />
                        </div>
                        <div className="abdm-connecting">
                          <div className="connect-pulse" />
                          <span>Fetching records from ABDM National Health Registry...</span>
                        </div>
                      </div>
                      <div className="fetch-steps">
                        {[
                          "Authenticating ABHA identity...",
                          "Retrieving past medical history...",
                          "Fetching linked medications...",
                          "Loading lab results...",
                        ].map((step, i) => (
                          <div key={i} className="fetch-step" style={{ animationDelay: `${i * 0.45}s` }}>
                            <div className="step-dot" style={{ animationDelay: `${i * 0.45}s` }} />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ABHA Records Prefill Result */}
                  {abhaFetchStep === "done" && abhaRecords && form.name && (
                    <div className="abha-result animate-fade-in">
                      <div className="abha-verified-header">
                        <span className="badge badge-success">ABHA Verified &amp; Records Prefilled</span>
                        <span className="abdm-badge">Ayushman Bharat Digital Mission</span>
                      </div>
                      
                      <div className="patient-card">
                        <User size={32} />
                        <div>
                          <h3>{form.name}</h3>
                          <p>Age: {form.age} | Gender: {form.gender} | Phone: {form.phone}</p>
                          <p style={{ fontSize: "0.72rem", color: "var(--color-accent-primary)" }}>ABHA: {abhaRecords.abhaAddress}</p>
                        </div>
                      </div>

                      {/* Pre-fetched ABDM Health Records */}
                      <div className="abdm-records">
                        <div className="abdm-record-header">
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <FolderOpen size={16} /> Pre-loaded Health Records from ABDM
                          </span>
                        </div>

                        <div className="abdm-record-item animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                          <span className="record-icon"><Building2 size={16} /></span>
                          <div>
                            <strong>Last Visit:</strong> {abhaRecords.lastVisit.hospital}
                            <span className="record-date">{abhaRecords.lastVisit.date} — {abhaRecords.lastVisit.dept}</span>
                          </div>
                        </div>

                        <div className="abdm-record-item animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                          <span className="record-icon"><Stethoscope size={16} /></span>
                          <div>
                            <strong>Known Conditions:</strong>
                            <div className="record-tags">
                              {abhaRecords.existingConditions.map((c, i) => (
                                <span key={i} className="record-tag condition">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="abdm-record-item animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                          <span className="record-icon"><Pill size={16} /></span>
                          <div>
                            <strong>Current Medications:</strong>
                            <div className="record-tags">
                              {abhaRecords.currentMedications.map((m, i) => (
                                <span key={i} className="record-tag medication">{m}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="abdm-record-item animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                          <span className="record-icon"><FlaskConical size={16} /></span>
                          <div>
                            <strong>Recent Labs:</strong>
                            <div className="record-tags">
                              {abhaRecords.lastLabResults.map((l, i) => (
                                <span key={i} className={`record-tag ${l.flag ? "abnormal" : "normal"}`}>
                                  {l.test}: {l.value} {l.flag} ({l.date})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="abdm-prefill-note">
                          MediKiosk will use these records to pre-fill your interview — saving time and improving accuracy
                        </p>
                      </div>

                      <button
                        className="btn-primary btn-large btn-touch"
                        onClick={handleProceed}
                        id="abha-proceed-btn"
                        style={{ width: "100%", marginTop: 16 }}
                      >
                        <ArrowRight size={20} />
                        Continue with Pre-filled Interview
                      </button>
                    </div>
                  )}

                  <button
                    className="btn-secondary"
                    onClick={() => setMode("new")}
                    style={{ width: "100%", marginTop: 16 }}
                  >
                    Register as New Patient Instead
                  </button>
                </GlassCard>
              </div>
            )}

            {/* New Patient Form */}
            {mode === "new" && (
              <div className="form-container animate-fade-in-up">
                <GlassCard hoverable={false}>
                  <div className="form-group">
                    <label>
                      <User size={16} /> Full Name / पूरा नाम
                    </label>
                    <input
                      type="text"
                      className="input-field input-large"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      id="name-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group age-group-container">
                      <label htmlFor="age-input">
                        <Calendar size={16} /> Age / उम्र (in Years / वर्ष)
                      </label>
                      <div className="age-stepper-box">
                        <button
                          type="button"
                          className="age-step-btn"
                          onClick={() => {
                            const cur = parseInt(form.age) || 0;
                            if (cur > 1) setForm((p) => ({ ...p, age: String(cur - 1) }));
                          }}
                          disabled={!form.age || parseInt(form.age) <= 1}
                          aria-label="Decrease age"
                          id="age-decrement-btn"
                        >
                          <Minus size={18} />
                        </button>
                        <div className="age-input-wrap">
                          <input
                            type="number"
                            className="age-direct-input"
                            placeholder="e.g. 35"
                            value={form.age}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 125)) {
                                setForm((p) => ({ ...p, age: val }));
                              }
                            }}
                            min="1"
                            max="125"
                            id="age-input"
                          />
                          {form.age && <span className="age-unit-label">Yrs</span>}
                        </div>
                        <button
                          type="button"
                          className="age-step-btn"
                          onClick={() => {
                            const cur = parseInt(form.age) || 0;
                            if (cur < 120) setForm((p) => ({ ...p, age: String(cur + 1) }));
                          }}
                          aria-label="Increase age"
                          id="age-increment-btn"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      {/* Quick Age Chips */}
                      <div className="age-chips-row">
                        {[
                          { label: "18", val: "18" },
                          { label: "25", val: "25" },
                          { label: "45", val: "45" },
                          { label: "60+", val: "65" },
                        ].map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            className={`age-chip ${form.age === chip.val ? "active" : ""}`}
                            onClick={() => setForm((p) => ({ ...p, age: chip.val }))}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group gender-group-container">
                      <label>
                        <UserCheck size={16} /> Gender / लिंग
                      </label>
                      <div className="gender-cards-grid">
                        {[
                          { key: "male", en: "Male", hi: "पुरुष" },
                          { key: "female", en: "Female", hi: "महिला" },
                          { key: "other", en: "Other", hi: "अन्य" },
                        ].map((g) => (
                          <button
                            key={g.key}
                            type="button"
                            className={`gender-card ${
                              form.gender === g.key ? "selected" : ""
                            }`}
                            onClick={() =>
                              setForm((p) => ({ ...p, gender: g.key }))
                            }
                            id={`gender-${g.key}`}
                          >
                            <span className="gender-card-icon">
                              <User size={20} />
                            </span>
                            <span className="gender-card-en">{g.en}</span>
                            <span className="gender-card-hi">{g.hi}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <Phone size={16} /> Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      className="input-field input-large"
                      placeholder="Mobile number"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      id="phone-input"
                    />
                  </div>

                  <button
                    className="btn-primary btn-large btn-touch"
                    onClick={handleProceed}
                    disabled={!form.name || !form.age || !form.gender}
                    id="new-patient-proceed-btn"
                    style={{ width: "100%", marginTop: 16 }}
                  >
                    <ArrowRight size={20} />
                    Proceed to Consent
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => setMode("abha")}
                    style={{ width: "100%", marginTop: 10 }}
                  >
                    I Have an ABHA ID
                  </button>
                </GlassCard>
              </div>
            )}
          </div>
        </div>

        {/* Consent Modal */}
        {showConsent && (
          <ConsentModal
            language={language || "en-IN"}
            onAccept={handleConsentAccept}
            onDecline={() => setShowConsent(false)}
          />
        )}
      </div>

      <style jsx>{`
        .mode-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .mode-card {
          text-align: center;
          cursor: pointer;
          padding: 32px 20px;
        }

        .mode-icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(0, 212, 170, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-primary);
          margin: 0 auto 16px;
        }

        .mode-icon.new {
          background: rgba(0, 153, 255, 0.08);
          color: var(--color-accent-secondary);
        }

        .mode-card h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
        }

        .mode-card p {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .form-container {
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: minmax(180px, 1.15fr) minmax(240px, 1.85fr);
          gap: 18px;
          align-items: start;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        /* Age Stepper UI */
        .age-stepper-box {
          display: flex;
          align-items: stretch;
          background: rgba(12, 20, 50, 0.7);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all var(--transition-base);
          min-height: 58px;
        }

        .age-stepper-box:focus-within {
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
        }

        .age-step-btn {
          width: 44px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .age-step-btn:hover:not(:disabled) {
          background: rgba(0, 212, 170, 0.15);
          color: var(--color-accent-primary);
        }

        .age-step-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .age-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-width: 0;
          padding: 0 10px;
        }

        .age-direct-input {
          width: 100%;
          max-width: 90px;
          height: 100%;
          border: none;
          background: transparent;
          color: #ffffff;
          font-size: 1.35rem;
          font-weight: 700;
          text-align: center;
          padding: 0;
          outline: none;
          font-family: var(--font-display);
        }

        .age-direct-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
          font-size: 1rem;
          font-weight: 400;
        }

        .age-unit-label {
          font-size: 0.72rem;
          color: var(--color-accent-primary);
          background: rgba(0, 212, 170, 0.12);
          border: 1px solid rgba(0, 212, 170, 0.25);
          padding: 2px 6px;
          border-radius: 4px;
          pointer-events: none;
          font-weight: 600;
          letter-spacing: 0.03em;
          flex-shrink: 0;
        }

        .age-chips-row {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .age-chip {
          flex: 1;
          padding: 5px 0;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }

        .age-chip:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 212, 170, 0.3);
          color: var(--color-text-primary);
        }

        .age-chip.active {
          background: rgba(0, 212, 170, 0.15);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          font-weight: 700;
        }

        /* Gender Cards UI */
        .gender-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .gender-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 6px;
          background: rgba(12, 20, 50, 0.7);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          min-height: 76px;
        }

        .gender-card:hover {
          background: rgba(20, 30, 75, 0.8);
          border-color: rgba(0, 212, 170, 0.35);
          transform: translateY(-2px);
        }

        .gender-card.selected {
          background: rgba(0, 212, 170, 0.12);
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 16px rgba(0, 212, 170, 0.2);
        }

        .gender-card-emoji {
          font-size: 1.4rem;
          margin-bottom: 2px;
        }

        .gender-card-en {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .gender-card-hi {
          font-size: 0.68rem;
          color: var(--color-text-muted);
        }

        .gender-card.selected .gender-card-en {
          color: var(--color-accent-primary);
        }

        .input-row {
          display: flex;
          gap: 10px;
        }

        .input-row .input-field {
          flex: 1;
        }

        .abha-result {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
        }

        .patient-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--color-bg-glass);
          border-radius: var(--radius-md);
          margin-top: 12px;
        }

        .patient-card h3 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .patient-card p {
          font-size: 0.82rem;
          color: var(--color-text-muted);
        }

        /* ABHA Fetch Animation */
        .abha-fetching {
          margin-top: 20px;
          padding: 20px;
          background: rgba(0, 153, 255, 0.06);
          border: 1px solid rgba(0, 153, 255, 0.2);
          border-radius: var(--radius-md);
        }

        .abdm-logo-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .abdm-logo {
          font-size: 2rem;
          filter: drop-shadow(0 0 10px rgba(0,153,255,0.5));
        }

        .abdm-connecting {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: #4db8ff;
          font-weight: 500;
        }

        .connect-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4db8ff;
          animation: pulse-dot 1s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.4; }
        }

        .fetch-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fetch-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          animation: step-appear 0.4s ease-out both;
        }

        @keyframes step-appear {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4db8ff;
          flex-shrink: 0;
          animation: step-pulse 0.8s ease-in-out infinite alternate;
        }

        @keyframes step-pulse {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }

        /* ABHA Result with ABDM records */
        .abha-verified-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .abdm-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ff9933;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,153,51,0.3);
          background: rgba(255,153,51,0.06);
        }

        .abdm-records {
          margin-top: 16px;
          padding: 14px;
          background: rgba(0, 153, 255, 0.04);
          border: 1px solid rgba(0, 153, 255, 0.15);
          border-radius: var(--radius-md);
        }

        .abdm-record-header {
          font-size: 0.8rem;
          font-weight: 700;
          color: #4db8ff;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(77, 184, 255, 0.15);
        }

        .abdm-record-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.8rem;
        }

        .record-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .abdm-record-item strong {
          display: block;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 4px;
        }

        .record-date {
          display: block;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .record-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 4px;
        }

        .record-tag {
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 500;
          border: 1px solid;
        }

        .record-tag.condition {
          background: rgba(255, 179, 71, 0.08);
          border-color: rgba(255, 179, 71, 0.3);
          color: #ffb347;
        }

        .record-tag.medication {
          background: rgba(0, 212, 170, 0.08);
          border-color: rgba(0, 212, 170, 0.3);
          color: var(--color-accent-primary);
        }

        .record-tag.abnormal {
          background: rgba(255, 71, 87, 0.08);
          border-color: rgba(255, 71, 87, 0.3);
          color: #ff6b7a;
        }

        .record-tag.normal {
          background: rgba(0, 212, 170, 0.06);
          border-color: rgba(0, 212, 170, 0.2);
          color: var(--color-accent-primary);
        }

        .abdm-prefill-note {
          font-size: 0.75rem;
          color: var(--color-accent-primary);
          margin-top: 10px;
          padding: 8px 10px;
          background: rgba(0, 212, 170, 0.06);
          border-radius: 6px;
        }

        @media (max-width: 600px) {
          .mode-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default function RegisterPage() {
  return <RegisterContent />;
}
