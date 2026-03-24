"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import StartScreen from "@/components/StartScreen";
import QuestionCard from "@/components/QuestionCard";
import ContactForm from "@/components/ContactForm";
import SuccessScreen from "@/components/SuccessScreen";
import ProgressBar from "@/components/ProgressBar";
import { questions } from "@/lib/questions";
import { addSubmission } from "@/lib/store";

type Screen = "start" | "questions" | "contact" | "success";

const WEBHOOK_URL = "https://hook.eu2.make.com/iljj4uwhc2mgpt16mvdgrnpxx1gouoa6";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = useCallback(() => {
    setScreen("questions");
  }, []);

  const handleAnswer = useCallback((value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: value,
    }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setScreen("contact");
    }
  }, [currentQuestion]);

  const handlePrev = useCallback(() => {
    if (screen === "contact") {
      setScreen("questions");
      setCurrentQuestion(questions.length - 1);
    } else if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [screen, currentQuestion]);

  const handleSubmit = useCallback(async (name: string, email: string) => {
    setIsSubmitting(true);
    setFirstName(name);

    const payload = {
      firstName: name,
      email,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // Save locally for admin stats
    addSubmission({
      id: crypto.randomUUID(),
      timestamp: payload.submittedAt,
      firstName: name,
      email,
      answers,
    });

    // Send to webhook
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silently handle - data is already saved locally
      console.log("Webhook not configured or unreachable");
    }

    setIsSubmitting(false);
    setScreen("success");
  }, [answers]);

  return (
    <AnimatePresence mode="wait">
      {screen === "start" && (
        <StartScreen key="start" onStart={handleStart} />
      )}

      {screen === "questions" && (
        <div
          key="questions"
          className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <ProgressBar
            current={currentQuestion + 1}
            total={questions.length}
          />
          <QuestionCard
            question={questions[currentQuestion]}
            answer={answers[questions[currentQuestion].id] || (questions[currentQuestion].type === "multiple" ? [] : "")}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={currentQuestion === 0}
            isLast={currentQuestion === questions.length - 1}
          />
        </div>
      )}

      {screen === "contact" && (
        <div
          key="contact"
          className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <ProgressBar current={questions.length} total={questions.length} />
          <ContactForm
            onSubmit={handleSubmit}
            onPrev={handlePrev}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {screen === "success" && (
        <SuccessScreen key="success" firstName={firstName} />
      )}
    </AnimatePresence>
  );
}
