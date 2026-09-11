"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCcw, Leaf, Check, Activity } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import { usePatient } from "@/context/PatientContext";

/**
 * AYUSH Prakriti Assessment — Dashavidha Pariksha
 * Visual, icon-driven quiz for Vata/Pitta/Kapha constitution assessment
 * Compliant with Ministry of AYUSH SIH26047 requirements
 */

// ─── Prakriti quiz questions ─────────────────────────────────────────────────
const PRAKRITI_QUESTIONS = [
  {
    id: "q1",
    category: "Deha Prakriti (Body)",
    question: "How would you describe your body frame?",
    questionHi: "आपकी शारीरिक बनावट कैसी है?",
    options: [
      { text: "Thin, light, joints visible", textHi: "दुबला-पतला, हड्डियाँ दिखती हैं", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Medium, well-proportioned", textHi: "मध्यम, सुडौल", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Large, heavy, broad frame", textHi: "भारी, मजबूत शरीर", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q2",
    category: "Twak (Skin)",
    question: "How is your skin naturally?",
    questionHi: "आपकी त्वचा कैसी है?",
    options: [
      { text: "Dry, rough, cold to touch", textHi: "रूखी, खुरदरी, ठंडी", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Warm, oily, prone to rashes", textHi: "गर्म, तैलीय, दाने होते हैं", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Thick, smooth, oily, glowing", textHi: "मोटी, चिकनी, चमकदार", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q3",
    category: "Kesh (Hair)",
    question: "How is your hair naturally?",
    questionHi: "आपके बाल कैसे हैं?",
    options: [
      { text: "Dry, frizzy, breaks easily", textHi: "रूखे, उलझे, टूटते हैं", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Thin, oily, goes grey early", textHi: "पतले, तैलीय, जल्दी सफेद होते हैं", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Thick, lustrous, wavy, oily", textHi: "घने, चमकदार, लहराते हैं", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q4",
    category: "Agni (Digestion)",
    question: "How is your digestion and appetite?",
    questionHi: "आपकी पाचन शक्ति और भूख कैसी है?",
    options: [
      { text: "Irregular — sometimes hungry, sometimes not", textHi: "अनिश्चित — कभी भूख कभी नहीं", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Strong — very hungry, can't skip meals", textHi: "तेज — बहुत भूख लगती है", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Slow — not very hungry, can skip meals", textHi: "धीमी — कम भूख लगती है", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q5",
    category: "Koshtha (Bowel)",
    question: "What are your bowel habits like?",
    questionHi: "आपकी पेट साफ होने की आदत कैसी है?",
    options: [
      { text: "Irregular, constipated, dry stools", textHi: "अनियमित, कब्ज, कठोर मल", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Regular, 1-2 times/day, loose sometimes", textHi: "नियमित, कभी-कभी पतला", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Slow, once/day, heavy, formed stools", textHi: "एक बार, भारी, बंधे हुए", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q6",
    category: "Manas (Mind)",
    question: "How would you describe your mind?",
    questionHi: "आपका मन कैसा रहता है?",
    options: [
      { text: "Quick, creative, anxious, scattered", textHi: "तेज, रचनात्मक, चिंतित, बिखरा हुआ", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Sharp, focused, competitive, critical", textHi: "तेज, केंद्रित, आलोचनात्मक", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Calm, steady, loving, slow to learn but remembers well", textHi: "शांत, स्थिर, प्रेमी, धीरे सीखता है", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q7",
    category: "Nidra (Sleep)",
    question: "How is your sleep?",
    questionHi: "आपकी नींद कैसी है?",
    options: [
      { text: "Light, disturbed, less than 6 hours", textHi: "हल्की, बाधित, 6 घंटे से कम", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Moderate, 6-7 hours, can't sleep in heat", textHi: "ठीक, 6-7 घंटे, गर्मी में नींद नहीं", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Deep, heavy, more than 8 hours", textHi: "गहरी, भारी, 8+ घंटे", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q8",
    category: "Ahara (Diet Preference)",
    question: "What food do you naturally prefer?",
    questionHi: "आप स्वाभाविक रूप से कौन सा भोजन पसंद करते हैं?",
    options: [
      { text: "Warm, oily, sweet, salty, sour foods", textHi: "गर्म, तैलीय, मीठा, नमकीन, खट्टा", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Cool, raw, bitter, sweet foods", textHi: "ठंडा, कच्चा, कड़वा, मीठा", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Dry, light, spicy, pungent foods", textHi: "सूखा, हल्का, तीखा", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q9",
    category: "Vyayama Shakti (Exercise)",
    question: "How is your exercise tolerance?",
    questionHi: "आप कितनी शारीरिक गतिविधि कर सकते हैं?",
    options: [
      { text: "Low — tire easily, love light activity", textHi: "कम — जल्दी थक जाते हैं", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Medium — moderate exercise, competitive", textHi: "मध्यम — प्रतिस्पर्धी", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "High — good endurance, love slow steady exercise", textHi: "अधिक — सहनशीलता ज़्यादा है", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
  {
    id: "q10",
    category: "Sattva (Mental Strength)",
    question: "Under stress, you typically:",
    questionHi: "तनाव में आप आमतौर पर क्या करते हैं?",
    options: [
      { text: "Become anxious, fearful, overthink", textHi: "चिंतित, डरे हुए, ज़्यादा सोचते हैं", dosha: "V", score: { V: 3, P: 0, K: 0 } },
      { text: "Become irritable, angry, judgmental", textHi: "चिड़चिड़े, गुस्सैल होते हैं", dosha: "P", score: { V: 0, P: 3, K: 0 } },
      { text: "Withdraw, become quiet, comfort eat", textHi: "शांत हो जाते हैं, खाने से मन लगाते हैं", dosha: "K", score: { V: 0, P: 0, K: 3 } },
    ],
  },
];

const DOSHA_INFO = {
  V: {
    name: "Vata",
    nameHi: "वात",
    element: "Air + Ether",
    color: "#a29bfe",
    traits: ["Creative", "Quick-thinking", "Enthusiastic", "Flexible"],
    tendencies: ["Anxiety", "Dry skin", "Irregular digestion", "Light sleep"],
    diet: ["Warm, cooked, oily foods", "Sweet, salty, sour tastes", "Avoid cold and raw foods"],
    lifestyle: ["Regular routine", "Gentle yoga", "Meditation", "Warm oil massage (Abhyanga)"],
    herbs: ["Ashwagandha", "Shatavari", "Triphala", "Sesame oil"],
  },
  P: {
    name: "Pitta",
    nameHi: "पित्त",
    element: "Fire + Water",
    color: "#ff9933",
    traits: ["Sharp intellect", "Courageous", "Focused", "Natural leader"],
    tendencies: ["Inflammation", "Acid reflux", "Skin rashes", "Irritability"],
    diet: ["Cool, sweet, bitter foods", "Coconut water, milk, ghee", "Avoid spicy, sour, fermented foods"],
    lifestyle: ["Cooling activities", "Swimming", "Avoid midday sun", "Regular breaks"],
    herbs: ["Neem", "Guduchi", "Amalaki (Amla)", "Licorice"],
  },
  K: {
    name: "Kapha",
    nameHi: "कफ",
    element: "Earth + Water",
    color: "#00d4aa",
    traits: ["Strong", "Calm", "Compassionate", "Excellent memory"],
    tendencies: ["Weight gain", "Lethargy", "Congestion", "Attachment"],
    diet: ["Light, dry, warm, spicy foods", "Bitter, pungent, astringent tastes", "Avoid heavy, oily, sweet foods"],
    lifestyle: ["Vigorous exercise", "Early rising", "Dry massage", "Fasting"],
    herbs: ["Ginger", "Black pepper", "Trikatu", "Guggul"],
  },
};

export default function AyushAssessmentPage() {
  const router = useRouter();
  const { session, updateSession } = usePatient();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const question = PRAKRITI_QUESTIONS[currentQ];
  const totalQuestions = PRAKRITI_QUESTIONS.length;
  const isLast = currentQ === totalQuestions - 1;
  const progress = ((currentQ) / totalQuestions) * 100;

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [question.id]: option };
    setAnswers(newAnswers);

    if (isLast) {
      // Calculate scores
      const scores = { V: 0, P: 0, K: 0 };
      Object.values(newAnswers).forEach(a => {
        scores.V += a.score.V;
        scores.P += a.score.P;
        scores.K += a.score.K;
      });

      // Determine primary and secondary dosha
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const primary = sorted[0][0];
      const secondary = sorted[1][0];
      const total = scores.V + scores.P + scores.K;

      const prakritiResult = {
        scores,
        primary,
        secondary,
        total,
        prakritiType: `${primary}-${secondary}`,
        percentages: {
          V: Math.round(scores.V / total * 100),
          P: Math.round(scores.P / total * 100),
          K: Math.round(scores.K / total * 100),
        },
        completedAt: new Date().toISOString(),
      };

      // Save to session
      if (updateSession) {
        updateSession({ ayushAssessment: prakritiResult });
      }

      setAnimating(true);
      setTimeout(() => {
        setResult(prakritiResult);
        setAnimating(false);
      }, 400);
    } else {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ(prev => prev + 1);
        setAnimating(false);
      }, 250);
    }
  };

  // ─── Result Screen ─────────────────────────────────────────────────────────
  if (result) {
    const primary = DOSHA_INFO[result.primary];
    const secondary = DOSHA_INFO[result.secondary];

    return (
      <>
        <Navbar />
        <div className="page-wrapper">
          <div className="container container-narrow" style={{ padding: "24px 16px 60px" }}>

            <div className="result-header animate-fade-in">
              <div className="result-title">
                <span className="result-icon-badge" style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${primary.color}20`,
                  border: `2px solid ${primary.color}`,
                  color: primary.color
                }}>
                  <Leaf size={28} />
                </span>
                <div>
                  <h1>Your Prakriti</h1>
                  <p className="result-type">{primary.name}-{secondary.name} Prakriti</p>
                  <p className="result-type-hi">{primary.nameHi}-{secondary.nameHi} प्रकृति</p>
                </div>
              </div>
              <div className="compliance-badge">
                <Leaf size={14} /> Dashavidha Pariksha — AYUSH Compliant
              </div>
            </div>

            {/* Dosha Radar / Balance Bar */}
            <GlassCard hoverable={false} className="dosha-card animate-fade-in-up">
              <h2 className="dosha-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={18} /> Dosha Balance Analysis
              </h2>

              {/* Visual bars */}
              <div className="dosha-bars">
                {["V", "P", "K"].map(d => {
                  const info = DOSHA_INFO[d];
                  const pct = result.percentages[d];
                  const isPrimary = d === result.primary;
                  return (
                    <div key={d} className="dosha-bar-row">
                      <div className="dosha-bar-label">
                        <span className="dosha-badge" style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: `${info.color}20`,
                          color: info.color,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          marginRight: 6
                        }}>
                          {d}
                        </span>
                        <div>
                          <strong style={{ color: info.color }}>{info.name}</strong>
                          <span className="dosha-hindi">{info.nameHi}</span>
                        </div>
                        {isPrimary && <span className="primary-badge">Primary</span>}
                      </div>
                      <div className="dosha-bar-track">
                        <div
                          className="dosha-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${info.color}80, ${info.color})`,
                          }}
                        />
                        <span className="dosha-pct" style={{ color: info.color }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SVG Triangle chart */}
              <div className="dosha-triangle-wrapper">
                <svg viewBox="0 0 200 180" className="dosha-triangle">
                  {/* Triangle background */}
                  <polygon points="100,10 190,170 10,170" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  {/* Dosha labels */}
                  <text x="100" y="6" textAnchor="middle" fontSize="9" fill={DOSHA_INFO.V.color} fontWeight="700">Vata</text>
                  <text x="194" y="178" textAnchor="end" fontSize="9" fill={DOSHA_INFO.P.color} fontWeight="700">Pitta</text>
                  <text x="6" y="178" textAnchor="start" fontSize="9" fill={DOSHA_INFO.K.color} fontWeight="700">Kapha</text>
                  {/* Patient's dosha point — weighted position */}
                  {(() => {
                    const vPct = result.percentages.V / 100;
                    const pPct = result.percentages.P / 100;
                    const kPct = result.percentages.K / 100;
                    // Barycentric coordinates for equilateral triangle
                    const vx = 100, vy = 10;
                    const px = 190, py = 170;
                    const kx = 10, ky = 170;
                    const x = vPct * vx + pPct * px + kPct * kx;
                    const y = vPct * vy + pPct * py + kPct * ky;
                    return (
                      <>
                        <circle cx={x} cy={y} r="8" fill={primary.color} opacity="0.3" />
                        <circle cx={x} cy={y} r="5" fill={primary.color} />
                        <circle cx={x} cy={y} r="5" fill={primary.color}>
                          <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </>
                    );
                  })()}
                </svg>
                <p className="triangle-note">
                  Your constitution point on the Tridosha triangle
                </p>
              </div>
            </GlassCard>

            {/* Primary Dosha Details */}
            <GlassCard hoverable={false} className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h2 style={{ color: primary.color, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Leaf size={20} /> {primary.name} Prakriti — Key Characteristics
              </h2>
              <p className="dosha-element">Element: <strong>{primary.element}</strong></p>

              <div className="dosha-detail-grid">
                <div className="dosha-detail-section">
                  <h4>Natural Strengths</h4>
                  <ul>{primary.traits.map(t => <li key={t}>{t}</li>)}</ul>
                </div>
                <div className="dosha-detail-section">
                  <h4>Health Tendencies</h4>
                  <ul>{primary.tendencies.map(t => <li key={t}>{t}</li>)}</ul>
                </div>
              </div>
            </GlassCard>

            {/* Diet & Lifestyle Recommendations */}
            <GlassCard hoverable={false} className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <h2 style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Leaf size={20} style={{ color: "#00d4aa" }} /> Personalized AYUSH Recommendations
              </h2>

              <div className="recommendations-grid">
                <div className="rec-section">
                  <h4>Ahara (Diet)</h4>
                  <ul>{primary.diet.map(d => <li key={d}>{d}</li>)}</ul>
                </div>
                <div className="rec-section">
                  <h4>Vihara (Lifestyle)</h4>
                  <ul>{primary.lifestyle.map(l => <li key={l}>{l}</li>)}</ul>
                </div>
                <div className="rec-section">
                  <h4>Aushadhi (Herbs)</h4>
                  <div className="herb-tags">
                    {primary.herbs.map(h => (
                      <span key={h} className="herb-tag" style={{ borderColor: `${primary.color}50`, color: primary.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Leaf size={11} /> {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="result-actions animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <button
                className="btn-primary btn-large btn-touch"
                onClick={() => router.push(session ? "/interview" : "/")}
                id="prakriti-continue-btn"
              >
                <ArrowRight size={20} />
                Continue to Clinical Interview
              </button>
              <button
                className="btn-secondary"
                onClick={() => { setResult(null); setCurrentQ(0); setAnswers({}); }}
                id="prakriti-retake-btn"
              >
                <RotateCcw size={16} /> Retake Assessment
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          /* Result styles */
          .result-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .result-title {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .result-emoji { font-size: 3rem; }

          h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 2px; }

          .result-type {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-accent-primary);
          }

          .result-type-hi {
            font-size: 0.85rem;
            color: var(--color-text-muted);
          }

          .compliance-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: var(--radius-full);
            border: 1px solid rgba(255,153,51,0.4);
            background: rgba(255,153,51,0.06);
            color: #ff9933;
            font-size: 0.72rem;
            font-weight: 700;
          }

          .dosha-card-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 16px;
          }

          .dosha-bars { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }

          .dosha-bar-row { display: flex; align-items: center; gap: 12px; }

          .dosha-bar-label {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 140px;
            flex-shrink: 0;
          }

          .dosha-emoji { font-size: 1.2rem; }

          .dosha-hindi {
            display: block;
            font-size: 0.7rem;
            color: var(--color-text-muted);
          }

          .primary-badge {
            padding: 2px 8px;
            border-radius: var(--radius-full);
            background: rgba(0,212,170,0.1);
            color: var(--color-accent-primary);
            font-size: 0.65rem;
            font-weight: 800;
            margin-left: 4px;
          }

          .dosha-bar-track {
            flex: 1;
            height: 14px;
            background: rgba(255,255,255,0.06);
            border-radius: 7px;
            overflow: visible;
            position: relative;
          }

          .dosha-bar-fill {
            height: 100%;
            border-radius: 7px;
            transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .dosha-pct {
            position: absolute;
            right: -34px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.75rem;
            font-weight: 800;
          }

          .dosha-triangle-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 12px;
          }

          .dosha-triangle { width: 200px; height: 180px; }

          .triangle-note {
            font-size: 0.7rem;
            color: var(--color-text-muted);
            text-align: center;
            margin-top: 6px;
          }

          .dosha-element {
            font-size: 0.82rem;
            color: var(--color-text-muted);
            margin-bottom: 12px;
          }

          .dosha-detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .dosha-detail-section h4 {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--color-text-secondary);
            margin-bottom: 6px;
          }

          .dosha-detail-section ul {
            padding-left: 16px;
            margin: 0;
          }

          .dosha-detail-section li {
            font-size: 0.78rem;
            color: var(--color-text-muted);
            margin-bottom: 3px;
          }

          .recommendations-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .rec-section h4 {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--color-text-secondary);
            margin-bottom: 6px;
          }

          .rec-section ul {
            padding-left: 16px;
            margin: 0;
          }

          .rec-section li {
            font-size: 0.75rem;
            color: var(--color-text-muted);
            margin-bottom: 4px;
          }

          .herb-tags { display: flex; flex-wrap: wrap; gap: 6px; }

          .herb-tag {
            padding: 3px 10px;
            border-radius: var(--radius-full);
            border: 1px solid;
            font-size: 0.72rem;
            font-weight: 500;
          }

          .result-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            flex-wrap: wrap;
          }

          .result-actions .btn-primary { flex: 1; }

          @media (max-width: 600px) {
            .dosha-detail-grid, .recommendations-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </>
    );
  }

  // ─── Quiz Screen ───────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container container-narrow" style={{ padding: "24px 16px 60px" }}>

          {/* Header */}
          <div className="quiz-header animate-fade-in">
            <button className="back-btn" onClick={() => currentQ > 0 ? setCurrentQ(q => q - 1) : router.back()} id="prakriti-back-btn">
              <ArrowLeft size={16} />
            </button>
            <div className="quiz-title">
              <Leaf size={20} style={{ color: "#ff9933" }} />
              <div>
                <h1>Prakriti Assessment</h1>
                <p>Ayurvedic Constitution Analysis · Dashavidha Pariksha</p>
              </div>
            </div>
            <span className="q-counter">{currentQ + 1} / {totalQuestions}</span>
          </div>

          {/* Progress bar */}
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Question */}
          <div className={`question-card animate-fade-in ${animating ? "fading" : ""}`}>
            <GlassCard hoverable={false}>
              <div className="category-badge">
                {question.category}
              </div>
              <h2 className="question-text">{question.question}</h2>
              <p className="question-hindi">{question.questionHi}</p>

              <div className="options-grid">
                {question.options.map((opt) => {
                  const doshaInfo = DOSHA_INFO[opt.dosha];
                  return (
                    <button
                      key={opt.dosha}
                      className="prakriti-option"
                      onClick={() => handleAnswer(opt)}
                      id={`prakriti-option-${opt.dosha}`}
                      style={{ "--dosha-color": doshaInfo.color }}
                    >
                      <span className="opt-badge" style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `${doshaInfo.color}20`,
                        border: `1px solid ${doshaInfo.color}50`,
                        color: doshaInfo.color,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        flexShrink: 0
                      }}>
                        {opt.dosha}
                      </span>
                      <div className="opt-text">
                        <span className="opt-main">{opt.text}</span>
                        <span className="opt-hindi">{opt.textHi}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Dosha mini indicators */}
          <div className="dosha-indicators animate-fade-in-up">
            {["V", "P", "K"].map(d => {
              const info = DOSHA_INFO[d];
              const answered = Object.values(answers).filter(a => a.dosha === d).length;
              return (
                <div key={d} className="dosha-indicator">
                  <span style={{ fontWeight: 700, color: info.color }}>{d}</span>
                  <span style={{ color: info.color }}>{info.name}</span>
                  <div className="indicator-dots">
                    {Array.from({ length: answered }).map((_, i) => (
                      <div key={i} className="dot filled" style={{ background: info.color }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .quiz-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .back-btn {
          padding: 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .back-btn:hover { background: rgba(255,255,255,0.06); }

        .quiz-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .quiz-title h1 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
        }

        .quiz-title p {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .q-counter {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .quiz-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .quiz-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff9933, #ff6b00);
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        .question-card { margin-bottom: 16px; }
        .question-card.fading { opacity: 0; transform: translateX(20px); transition: all 0.2s ease; }

        .category-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: var(--radius-full);
          background: rgba(255,153,51,0.1);
          border: 1px solid rgba(255,153,51,0.25);
          color: #ff9933;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 12px;
        }

        .question-text {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .question-hindi {
          font-size: 0.88rem;
          color: var(--color-text-muted);
          margin-bottom: 20px;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .prakriti-option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .prakriti-option:hover {
          background: color-mix(in srgb, var(--dosha-color) 8%, transparent);
          border-color: color-mix(in srgb, var(--dosha-color) 40%, transparent);
          transform: translateX(4px);
        }

        .opt-icon { font-size: 1.8rem; flex-shrink: 0; }

        .opt-main {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .opt-hindi {
          display: block;
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }

        .dosha-indicators {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        .dosha-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
        }

        .indicator-dots {
          display: flex;
          gap: 3px;
          min-height: 8px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      `}</style>
    </>
  );
}
