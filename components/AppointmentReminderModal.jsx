"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  X,
  Send,
  Smartphone,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { calculateReminderDate, formatReminderNotifications } from "@/lib/reminders";
import { playAudioCue } from "@/lib/languages";

/**
 * AppointmentReminderModal — Interactive follow-up scheduler and
 * simulated Push Notification, SMS, and Email reminder viewer.
 */
export default function AppointmentReminderModal({
  isOpen,
  onClose,
  patient,
  department = "General Medicine",
  initialAppointmentDate = null,
  onSaveSchedule,
}) {
  // Default appointment: exactly 7 days from now (1 week next visit)
  const defaultApptDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().split("T")[0];
  };

  const [appointmentDate, setAppointmentDate] = useState(
    initialAppointmentDate ? initialAppointmentDate.split("T")[0] : defaultApptDate()
  );
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [activePreviewChannel, setActivePreviewChannel] = useState("push"); // 'push' | 'sms' | 'email'
  const [showLivePushBanner, setShowLivePushBanner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const patientName = patient?.name || "Patient";
  const phone = patient?.phone || "9876543210";
  const email = patient?.email || "patient@example.com";

  // Build full timestamp
  const fullApptDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
  const reminderDateTime = calculateReminderDate(fullApptDateTime);

  const notifications = formatReminderNotifications({
    patientName,
    phone,
    email,
    department,
    appointmentDate: fullApptDateTime.toISOString(),
    reminderDate: reminderDateTime.toISOString(),
  });

  const handleTriggerTestPush = () => {
    playAudioCue("start");
    setShowLivePushBanner(true);
    setTimeout(() => {
      // Auto-hide banner after 7 seconds
      setShowLivePushBanner(false);
    }, 7000);
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onSaveSchedule) {
      onSaveSchedule({
        appointmentDate: fullApptDateTime.toISOString(),
        reminderDate: reminderDateTime.toISOString(),
        department,
        status: "scheduled",
      });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const presetDays = [
    { label: "In 3 Days", days: 3 },
    { label: "In 1 Week (7 Days)", days: 7 },
    { label: "In 2 Weeks (14 Days)", days: 14 },
    { label: "In 1 Month (30 Days)", days: 30 },
  ];

  return (
    <div className="modal-backdrop animate-fade-in">
      {/* Live Simulated Push Notification Toast */}
      {showLivePushBanner && (
        <div className="live-push-notification-toast animate-fade-in-down">
          <div className="toast-header">
            <div className="toast-brand">
              <span className="toast-dot-pulse" />
              <Bell size={14} color="#00d4aa" />
              <strong>MediKiosk Push Alert</strong>
              <span className="toast-now">now</span>
            </div>
            <button
              className="toast-close"
              onClick={() => setShowLivePushBanner(false)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
          <div className="toast-body">
            <h4 className="toast-title">{notifications.push.title}</h4>
            <p className="toast-text">{notifications.push.body}</p>
          </div>
          <div className="toast-footer">
            <span>Delivered via Web Push to patient&apos;s registered smartphone</span>
            <span className="toast-badge">2 Days Prior</span>
          </div>
        </div>
      )}

      <div className="modal-box">
        <GlassCard hoverable={false} className="reminder-glass-modal">
          {/* Modal Header */}
          <div className="modal-header-row">
            <div className="title-area">
              <div className="bell-badge">
                <Bell size={20} color="#00d4aa" />
              </div>
              <div>
                <h2>Automated Checkup Reminder System</h2>
                <p>
                  Schedule next follow-up and automate 2-day pre-appointment Push, SMS &amp; Email alerts
                </p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          <div className="modal-grid">
            {/* Left Column: Date Selector & 2-Day Calculation */}
            <div className="schedule-column">
              <div className="section-subtitle">
                <Calendar size={15} /> 1. Select Follow-up Checkup Date
              </div>

              {/* Quick Preset Buttons */}
              <div className="preset-buttons-row">
                {presetDays.map((p) => {
                  const target = new Date();
                  target.setDate(target.getDate() + p.days);
                  const targetStr = target.toISOString().split("T")[0];
                  const isSelected = appointmentDate === targetStr;

                  return (
                    <button
                      key={p.days}
                      type="button"
                      className={`preset-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setAppointmentDate(targetStr)}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Date & Time Input Row */}
              <div className="datetime-input-row">
                <div className="input-group">
                  <label htmlFor="modal-appt-date">Appointment Date</label>
                  <input
                    id="modal-appt-date"
                    type="date"
                    className="input-field"
                    value={appointmentDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ maxWidth: 140 }}>
                  <label htmlFor="modal-appt-time">Time</label>
                  <input
                    id="modal-appt-time"
                    type="time"
                    className="input-field"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Automated 2-Day Pre-Alert Calculation Card */}
              <div className="calculation-card">
                <div className="calc-header">
                  <Sparkles size={14} color="#00d4aa" />
                  <strong>Automated 2-Day Pre-Appointment Trigger</strong>
                </div>
                <div className="calc-details">
                  <div className="calc-row">
                    <span className="lbl">Doctor Checkup Date:</span>
                    <span className="val highlight">
                      {fullApptDateTime.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })} ({appointmentTime})
                    </span>
                  </div>
                  <div className="calc-row">
                    <span className="lbl">Reminder Dispatched On:</span>
                    <span className="val reminder-val">
                      {reminderDateTime.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })} (Exact 48 hrs prior)
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Linked Contact Information */}
              <div className="linked-contacts-card">
                <div className="contacts-title">Target Patient Channels (Linked):</div>
                <div className="contact-badge-item">
                  <Phone size={14} color="var(--color-accent-secondary)" />
                  <span>SMS Alerts: <strong>{phone}</strong></span>
                  <span className="badge-verified">Verified</span>
                </div>
                <div className="contact-badge-item">
                  <Mail size={14} color="var(--color-accent-primary)" />
                  <span>Email Reminders: <strong>{email}</strong></span>
                  <span className="badge-verified">Verified</span>
                </div>
                <div className="contact-badge-item">
                  <Smartphone size={14} color="#4db8ff" />
                  <span>Push Notification: <strong>Browser &amp; Smartphone PWA</strong></span>
                  <span className="badge-verified">Active</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Multi-Channel Previews */}
            <div className="preview-column">
              <div className="section-subtitle" style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Bell size={15} /> 2. Notification Previews
                </span>
                <button
                  type="button"
                  className="test-push-btn"
                  onClick={handleTriggerTestPush}
                  id="trigger-live-push-btn"
                  title="Show realistic push notification toast"
                >
                  <Sparkles size={13} /> Test Push Alert Now
                </button>
              </div>

              {/* Channel Selector Tabs */}
              <div className="channel-tabs">
                <button
                  type="button"
                  className={`channel-tab ${activePreviewChannel === "push" ? "active" : ""}`}
                  onClick={() => setActivePreviewChannel("push")}
                >
                  <Smartphone size={14} /> Push Notification
                </button>
                <button
                  type="button"
                  className={`channel-tab ${activePreviewChannel === "sms" ? "active" : ""}`}
                  onClick={() => setActivePreviewChannel("sms")}
                >
                  <Phone size={14} /> SMS Text
                </button>
                <button
                  type="button"
                  className={`channel-tab ${activePreviewChannel === "email" ? "active" : ""}`}
                  onClick={() => setActivePreviewChannel("email")}
                >
                  <Mail size={14} /> Email
                </button>
              </div>

              {/* Preview Content Area */}
              <div className="preview-screen-box">
                {activePreviewChannel === "push" && (
                  <div className="mockup-push-card animate-fade-in">
                    <div className="mockup-app-bar">
                      <div className="app-dot" />
                      <span>MEDIKIOSK • PUSH NOTIFICATION</span>
                      <span className="time-ago">Pre-2 Days</span>
                    </div>
                    <div className="mockup-content">
                      <div className="push-icon-box">
                        <Bell size={20} color="#00d4aa" />
                      </div>
                      <div>
                        <h4>{notifications.push.title}</h4>
                        <p>{notifications.push.body}</p>
                      </div>
                    </div>
                    <div className="mockup-actions">
                      <button className="mockup-btn primary" onClick={handleTriggerTestPush}>
                        Simulate Tap / Sound
                      </button>
                    </div>
                  </div>
                )}

                {activePreviewChannel === "sms" && (
                  <div className="mockup-sms-card animate-fade-in">
                    <div className="sms-header">
                      <span>SMS to: {notifications.sms.to}</span>
                      <span className="sms-tag">Sender: {notifications.sms.senderId}</span>
                    </div>
                    <div className="sms-bubble">
                      <p>{notifications.sms.message}</p>
                      <div className="sms-timestamp">Scheduled for: {notifications.sms.scheduledFor} at 09:00 AM</div>
                    </div>
                  </div>
                )}

                {activePreviewChannel === "email" && (
                  <div className="mockup-email-card animate-fade-in">
                    <div className="email-meta-bar">
                      <div><strong>To:</strong> {notifications.email.to}</div>
                      <div><strong>Subject:</strong> {notifications.email.subject}</div>
                    </div>
                    <div
                      className="email-body-preview"
                      dangerouslySetInnerHTML={{ __html: notifications.email.htmlContent }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              id="confirm-schedule-reminder-btn"
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={18} /> Reminder Schedule Locked!
                </>
              ) : (
                <>
                  <Send size={18} /> Schedule 2-Day Pre-Appointment Reminder
                </>
              )}
            </button>
          </div>
        </GlassCard>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(4, 8, 20, 0.85);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-box {
          width: 100%;
          max-width: 920px;
          max-height: 90vh;
          overflow-y: auto;
        }

        :global(.reminder-glass-modal) {
          padding: 24px !important;
          background: rgba(8, 16, 32, 0.95) !important;
          border: 1px solid rgba(0, 212, 170, 0.3) !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
        }

        .modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
          margin-bottom: 18px;
        }

        .title-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bell-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 212, 170, 0.12);
          border: 1px solid rgba(0, 212, 170, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .title-area h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--color-text-primary);
        }

        .title-area p {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .section-subtitle {
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preset-buttons-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }

        .preset-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--color-text-secondary);
          font-size: 0.76rem;
          padding: 8px 10px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text-primary);
        }

        .preset-btn.selected {
          background: rgba(0, 212, 170, 0.12);
          border-color: #00d4aa;
          color: #00d4aa;
          font-weight: 700;
        }

        .datetime-input-row {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-group label {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .calculation-card {
          background: rgba(0, 212, 170, 0.05);
          border: 1px solid rgba(0, 212, 170, 0.25);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-bottom: 14px;
        }

        .calc-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #00d4aa;
          margin-bottom: 8px;
        }

        .calc-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.78rem;
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calc-row .lbl {
          color: var(--color-text-muted);
        }

        .calc-row .val.highlight {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .calc-row .val.reminder-val {
          color: #00d4aa;
          font-weight: 700;
        }

        .linked-contacts-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contacts-title {
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .contact-badge-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.76rem;
          color: var(--color-text-secondary);
          gap: 6px;
        }

        .badge-verified {
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(0, 212, 170, 0.12);
          color: #00d4aa;
          border: 1px solid rgba(0, 212, 170, 0.3);
        }

        .test-push-btn {
          background: rgba(0, 212, 170, 0.12);
          border: 1px solid rgba(0, 212, 170, 0.35);
          color: #00d4aa;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .test-push-btn:hover {
          background: #00d4aa;
          color: #060a1a;
        }

        .channel-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 6px;
        }

        .channel-tab {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .channel-tab:hover {
          color: var(--color-text-primary);
        }

        .channel-tab.active {
          color: #00d4aa;
          background: rgba(0, 212, 170, 0.1);
        }

        .preview-screen-box {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          min-height: 280px;
          max-height: 340px;
          overflow-y: auto;
          padding: 14px;
        }

        .mockup-push-card {
          background: rgba(18, 28, 48, 0.9);
          border: 1px solid rgba(0, 212, 170, 0.35);
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .mockup-app-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }

        .app-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d4aa;
        }

        .time-ago {
          margin-left: auto;
          color: #00d4aa;
        }

        .mockup-content {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .push-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(0, 212, 170, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mockup-content h4 {
          margin: 0 0 4px;
          font-size: 0.88rem;
          color: var(--color-text-primary);
        }

        .mockup-content p {
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--color-text-secondary);
        }

        .mockup-actions {
          margin-top: 14px;
          display: flex;
          justify-content: flex-end;
        }

        .mockup-btn.primary {
          background: #00d4aa;
          color: #060a1a;
          font-weight: 700;
          font-size: 0.74rem;
          padding: 6px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .mockup-sms-card {
          padding: 8px;
        }

        .sms-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin-bottom: 10px;
        }

        .sms-tag {
          color: #4db8ff;
          font-weight: 700;
        }

        .sms-bubble {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px 12px 12px 2px;
          padding: 12px 14px;
          font-size: 0.82rem;
          line-height: 1.5;
          color: #f1f5f9;
        }

        .sms-timestamp {
          margin-top: 8px;
          font-size: 0.68rem;
          color: #94a3b8;
          text-align: right;
        }

        .mockup-email-card {
          background: #ffffff;
          color: #1e293b;
          border-radius: 8px;
          padding: 12px;
          font-size: 0.8rem;
        }

        .email-meta-bar {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 10px;
          font-size: 0.75rem;
          color: #475569;
        }

        .email-body-preview {
          font-size: 0.8rem;
        }

        .modal-footer-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 16px;
        }

        /* Live Push Alert Toast Banner */
        .live-push-notification-toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 520px;
          background: rgba(11, 22, 44, 0.98);
          border: 2px solid #00d4aa;
          box-shadow: 0 15px 50px rgba(0, 212, 170, 0.45);
          border-radius: 14px;
          padding: 14px 18px;
          z-index: 100000;
        }

        .toast-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .toast-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: #00d4aa;
        }

        .toast-dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00d4aa;
          animation: pulse 1.5s infinite;
        }

        .toast-now {
          font-size: 0.68rem;
          color: var(--color-text-muted);
          margin-left: 6px;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }

        .toast-title {
          margin: 0 0 4px;
          font-size: 0.92rem;
          color: #ffffff;
        }

        .toast-text {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.45;
          color: #cbd5e1;
        }

        .toast-footer {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.68rem;
          color: var(--color-text-muted);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 6px;
        }

        .toast-badge {
          background: rgba(0, 212, 170, 0.15);
          color: #00d4aa;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }

        @media (max-width: 768px) {
          .modal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
