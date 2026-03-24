"use client";

import { motion } from "framer-motion";

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a3f7a 50%, #0a1e40 100%)" }}
    >
      <div className="w-full max-w-2xl mx-auto">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: "rgba(37, 99, 235, 0.2)", color: "#93c5fd", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <span>⏱️</span>
            <span>אבחון של 3 דקות</span>
            <span>•</span>
            <span>10 שאלות</span>
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="rounded-3xl p-8 md:p-12 shadow-2xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)" }}>
              📊
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white text-center leading-snug mb-4">
            האם העסק שלך בנוי לצמיחה?
          </h1>

          <p className="text-xl md:text-2xl font-medium text-center mb-8"
            style={{ color: "#93c5fd" }}>
            בואו לגלות את מדד היעילות התפעולית שלכם
          </p>

          <div className="h-px w-16 mx-auto mb-8" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

          {/* CTA paragraph first - bigger and bolder */}
          <div className="mb-6 p-5 rounded-xl text-center"
            style={{ backgroundColor: "rgba(37, 99, 235, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
            <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
              תשקיעו כ-3 דקות כדי לענות על 10 שאלות, וקבלו למייל דוח אבחון אישי שמנתח את צווארי הבקבוק בעסק שלכם ומציע פתרון פרקטי לייעול מיידי.
            </p>
          </div>

          <div className="space-y-4 text-base md:text-lg leading-relaxed mb-10"
            style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            <p>
              היי, אני <strong className="text-white">ענת רפאלי פלד</strong>. אחרי שנים בניהול עסקי, למדתי ששיעור הצמיחה של עסק לא נקבע לפי כמות הלידים שנכנסים, אלא לפי התשתית שמחזיקה אותם.
            </p>
            <p>
              היום אני עוזרת לעסקים להשיג תוצאות טובות יותר על ידי הטמעת <strong className="text-white">מערכת שעובדת בשבילם</strong> בשילוב של AI ואוטומציות שחוסכות שעות של עבודה ידנית ומוודאות שאף שקל לא נופל בין הכסאות.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="w-full py-4 px-8 rounded-2xl text-white text-lg font-bold cursor-pointer transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              boxShadow: "0 8px 32px rgba(37, 99, 235, 0.35)",
            }}
          >
            בואו נתחיל →
          </motion.button>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-sm mt-6"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          🔒 המידע שלכם נשמר בצורה מאובטחת ולא יועבר לצד שלישי
        </motion.p>
      </div>
    </motion.div>
  );
}
