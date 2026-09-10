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
      // Simulate network delay for OTP verification
      setTimeout(() => {
        setIsVerifyingAbha(false);
        setOtpSent(false); // hide OTP field after success
        setForm((prev) => ({
          ...prev,
          name: "Rajesh Kumar",
          age: "45",
          gender: "male",
          phone: "9876543210",
        }));
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

                  {form.name && (
                    <div className="abha-result animate-fade-in">
                      <div className="badge badge-success">✓ ABHA Verified</div>
                      <div className="patient-card">
                        <User size={32} />
                        <div>
                          <h3>{form.name}</h3>
                          <p>
                            Age: {form.age} | Gender: {form.gender} | Phone:{" "}
                            {form.phone}
                          </p>
                        </div>
                      </div>

                      <button
                        className="btn-primary btn-large btn-touch"
                        onClick={handleProceed}
                        id="abha-proceed-btn"
                        style={{ width: "100%", marginTop: 16 }}
                      >
                        <ArrowRight size={20} />
                        Proceed to Interview
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
                    <div className="form-group">
                      <label>
                        <Calendar size={16} /> Age / उम्र
                      </label>
                      <input
                        type="number"
                        className="input-field input-large"
                        placeholder="Age"
                        value={form.age}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, age: e.target.value }))
                        }
                        min="0"
                        max="150"
                        id="age-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender / लिंग</label>
                      <div className="gender-options">
                        {["male", "female", "other"].map((g) => (
                          <button
                            key={g}
                            className={`touch-option ${
                              form.gender === g ? "selected" : ""
                            }`}
                            onClick={() =>
                              setForm((p) => ({ ...p, gender: g }))
                            }
                            id={`gender-${g}`}
                            style={{ flex: 1, justifyContent: "center" }}
                          >
                            <span style={{ fontSize: "1.5rem" }}>
                              {g === "male"
                                ? "👨"
                                : g === "female"
                                ? "👩"
                                : "🧑"}
                            </span>
                            <span style={{ textTransform: "capitalize" }}>
                              {g}
                            </span>
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
          grid-template-columns: 1fr 2fr;
          gap: 16px;
        }

        .input-row {
          display: flex;
          gap: 10px;
        }

        .input-row .input-field {
          flex: 1;
        }

        .gender-options {
          display: flex;
          gap: 10px;
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
