"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Simple success animation data (checkmark animation)
const successAnimationData = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 15, s: [0, 0, 100] }, { t: 35, s: [100, 100, 100] }] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-25, 0], [-8, 18], [25, -18]],
                  c: false,
                },
              },
            },
            {
              ty: "st",
              c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 8 },
              lc: 2,
              lj: 2,
            },
            {
              ty: "tm",
              s: { a: 0, k: 0 },
              e: { a: 1, k: [{ i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 20, s: [0] }, { t: 40, s: [100] }] },
              o: { a: 0, k: 0 },
            },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 5, s: [0, 0, 100] }, { t: 25, s: [100, 100, 100] }] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            { ty: "el", d: 1, s: { a: 0, k: [80, 80] }, p: { a: 0, k: [0, 0] } },
            {
              ty: "st",
              c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4 },
              lc: 2,
              lj: 2,
            },
            { ty: "fl", c: { a: 0, k: [0.82, 0.98, 0.88, 1] }, o: { a: 0, k: 100 } },
            { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
    },
  ],
};

interface SuccessScreenProps {
  firstName: string;
}

export default function SuccessScreen({ firstName }: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a3f7a 50%, #0a1e40 100%)" }}
    >
      <div className="w-full max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-32 h-32 mx-auto mb-6"
        >
          <Lottie
            animationData={successAnimationData}
            loop={false}
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-3xl p-8 md:p-10"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            תודה רבה{firstName ? `, ${firstName}` : ""}! 🎉
          </h2>

          <div className="h-px w-12 mx-auto mb-6" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

          <div className="space-y-4 text-lg leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            <p>
              הדוח האישי שלך <strong className="text-white">נמצא בהכנה</strong> ויישלח למייל שלך תוך דקות ספורות.
            </p>
            <p>
              הדוח יכלול ניתוח מעמיק של צווארי הבקבוק בעסק שלך והצעות קונקרטיות לייעול.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 p-4 rounded-xl"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}
          >
            <p className="text-sm" style={{ color: "#6ee7b7" }}>
              💡 <strong>טיפ:</strong> בדקו גם את תיבת הספאם אם לא קיבלתם את הדוח תוך 10 דקות
            </p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="mt-8 p-6 rounded-xl text-center"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <p className="text-base mb-2 font-medium text-white">
              רוצה שנעבור על הדו״ח יחד?
            </p>
            <p className="text-sm mb-5" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              בוא/י לשיחת ייעוץ קצרה של 15 דקות (ללא עלות) ונבין מה הצעד הראשון שהכי נכון לעסק שלך כרגע.
            </p>
            <a
              href="https://apauto.fillout.com/t/oY3MYKc5qMus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-3.5 px-8 rounded-xl text-white text-base font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.35)",
              }}
            >
              📅 לתיאום שיחה ביומן שלי
            </a>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-sm mt-6"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          © {new Date().getFullYear()} ענת רפאלי פלד | AP Automations
        </motion.p>
      </div>
    </motion.div>
  );
}
