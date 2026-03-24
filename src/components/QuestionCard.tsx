"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/questions";

interface QuestionCardProps {
  question: Question;
  answer: string | string[];
  onAnswer: (value: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function QuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
}: QuestionCardProps) {

  const handleSingleSelect = (value: string) => {
    onAnswer(value);
  };

  const handleMultiSelect = (value: string) => {
    const current = Array.isArray(answer) ? answer : [];
    if (current.includes(value)) {
      onAnswer(current.filter((v) => v !== value));
    } else if (current.length < 2) {
      onAnswer([...current, value]);
    }
  };

  const isSelected = (value: string): boolean => {
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  const canProceed = () => {
    if (question.type === "open") return typeof answer === "string" && answer.trim().length > 0;
    if (question.type === "multiple") return Array.isArray(answer) && answer.length > 0;
    return typeof answer === "string" && answer.length > 0;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-xl mx-auto"
      >
        {/* Question text */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--primary)" }}>
            {question.text}
          </h2>
          {question.subtitle && (
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              {question.subtitle}
            </p>
          )}
        </div>

        {/* Options */}
        {question.type !== "open" && question.options && (
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const selected = isSelected(option.value);
              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                  onClick={() =>
                    question.type === "multiple"
                      ? handleMultiSelect(option.value)
                      : handleSingleSelect(option.value)
                  }
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-right transition-all duration-200 cursor-pointer border"
                  style={{
                    backgroundColor: selected ? "rgba(37, 99, 235, 0.06)" : "white",
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    boxShadow: selected
                      ? "0 0 0 2px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(37, 99, 235, 0.1)"
                      : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Checkbox/Radio indicator */}
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200"
                    style={{
                      border: selected ? "none" : "2px solid var(--border)",
                      background: selected ? "linear-gradient(135deg, var(--primary), var(--accent))" : "white",
                    }}
                  >
                    {selected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Emoji */}
                  {option.emoji && (
                    <span className="text-xl flex-shrink-0">{option.emoji}</span>
                  )}

                  {/* Label */}
                  <span
                    className="text-base font-medium flex-grow"
                    style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}
                  >
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Open-ended text input */}
        {question.type === "open" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-8"
          >
            <textarea
              value={typeof answer === "string" ? answer : ""}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full p-4 rounded-xl border text-base resize-none focus:outline-none focus:ring-2 transition-all duration-200"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "white",
                color: "var(--foreground)",
              }}
              dir="rtl"
            />
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-2">
          {!isFirst && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPrev}
              className="py-3.5 px-6 rounded-xl text-base font-medium cursor-pointer border transition-all duration-200"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
                backgroundColor: "white",
              }}
            >
              חזרה →
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            onClick={onNext}
            disabled={!canProceed()}
            className="flex-grow py-3.5 px-6 rounded-xl text-white text-base font-bold transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canProceed()
                ? "linear-gradient(135deg, var(--primary), var(--accent))"
                : "#cbd5e1",
              boxShadow: canProceed()
                ? "0 4px 16px rgba(37, 99, 235, 0.25)"
                : "none",
            }}
          >
            {isLast ? "← לשלב האחרון" : "← הבא"}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
