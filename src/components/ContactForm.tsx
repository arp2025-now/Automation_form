"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ContactFormProps {
  onSubmit: (firstName: string, email: string) => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export default function ContactForm({ onSubmit, onPrev, isSubmitting }: ContactFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; privacy?: string }>({});

  const validate = (): boolean => {
    const newErrors: { firstName?: string; email?: string; privacy?: string } = {};
    if (!firstName.trim()) newErrors.firstName = "נא להזין שם פרטי";
    if (!email.trim()) {
      newErrors.email = "נא להזין כתובת מייל";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "כתובת מייל לא תקינה";
    }
    if (!privacyAccepted) {
      newErrors.privacy = "יש לאשר את מדיניות הפרטיות כדי להמשיך";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(firstName.trim(), email.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))", boxShadow: "0 8px 32px rgba(37, 99, 235, 0.2)" }}>
          📧
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--primary)" }}>
          כמעט סיימנו!
        </h2>
        <p className="text-base" style={{ color: "var(--text-muted)" }}>
          לאן לשלוח את דוח האבחון האישי שלך?
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-4 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
            שם פרטי
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
            }}
            placeholder="הכניסו את השם שלכם"
            className="w-full p-4 rounded-xl border text-base focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              borderColor: errors.firstName ? "#ef4444" : "var(--border)",
              backgroundColor: "white",
            }}
            dir="rtl"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
            כתובת מייל
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="example@email.com"
            className="w-full p-4 rounded-xl border text-base focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              borderColor: errors.email ? "#ef4444" : "var(--border)",
              backgroundColor: "white",
            }}
            dir="ltr"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Privacy checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => {
              setPrivacyAccepted(!privacyAccepted);
              if (errors.privacy) setErrors((p) => ({ ...p, privacy: undefined }));
            }}
            className="w-5 h-5 mt-0.5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              border: privacyAccepted ? "none" : `2px solid ${errors.privacy ? "#ef4444" : "var(--border)"}`,
              background: privacyAccepted ? "linear-gradient(135deg, var(--primary), var(--accent))" : "white",
            }}
          >
            {privacyAccepted && (
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            אני מאשר/ת שקראתי את{" "}
            <a
              href="https://docs.google.com/document/d/1Xs3Rx948BxVrQPqLO4RQZr27jbQkMp0obeLZJ_GdwVk/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
              style={{ color: "var(--accent)" }}
              onClick={(e) => e.stopPropagation()}
            >
              מדיניות הפרטיות
            </a>{" "}
            ומסכים/ה לקבלת דוח האבחון ותכנים רלוונטיים למייל.
          </span>
        </label>
        {errors.privacy && (
          <p className="mt-1.5 text-sm text-red-500 mr-8">{errors.privacy}</p>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 mb-6 p-3 rounded-lg"
        style={{ backgroundColor: "var(--surface)" }}>
        <span className="text-base flex-shrink-0">🔒</span>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          המידע שלכם מאובטח ונשמר בפרטיות מוחלטת. הדוח ישלח ישירות למייל שהזנתם.
        </p>
      </div>

      {/* Buttons - back on right (RTL), submit on left */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrev}
          disabled={isSubmitting}
          className="py-3.5 px-6 rounded-xl text-base font-medium cursor-pointer border transition-all duration-200"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
            backgroundColor: "white",
          }}
        >
          חזרה →
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-grow py-3.5 px-6 rounded-xl text-white text-base font-bold transition-all duration-300 cursor-pointer disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, var(--success), #059669)",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              שולח...
            </span>
          ) : (
            "← שלחו לי את הדוח! 🚀"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
