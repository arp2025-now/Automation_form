"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { questions } from "@/lib/questions";

const ADMIN_PASSWORD = "anat2024";

interface FormSubmission {
  id: string;
  timestamp: string;
  firstName: string;
  email: string;
  answers: Record<string, string | string[]>;
  reportContent?: string;
}

const CHART_COLORS = ["#0f2b5b", "#1a3f7a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

// Map option values to Hebrew labels
function getOptionLabel(questionId: string, value: string): string {
  const q = questions.find((q) => q.id === questionId);
  if (!q || !q.options) return value;
  const opt = q.options.find((o) => o.value === value);
  return opt ? opt.label : value;
}

// Short labels for table headers
function getShortLabel(questionId: string): string {
  const map: Record<string, string> = {
    business_type: "סוג עסק",
    industry: "תחום",
    business_age: "גיל העסק",
    daily_management: "ניהול שוטף",
    lead_management: "זמן חזרה לליד",
    leads_falling: "לידים נופלים",
    manual_tasks: "שעות ידניות",
    ai_automation: "AI ואוטומציה",
    biggest_bottleneck: "צווארי בקבוק",
    open_challenges: "בעיות פתוחות",
  };
  return map[questionId] || questionId;
}

// Truncate text for table cells
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

export default function AdminStats() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<"charts" | "table" | "insights">("charts");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFromAirtable = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchFromAirtable();
    }
  }, [isAuthed, fetchFromAirtable]);

  const refreshData = useCallback(() => {
    fetchFromAirtable();
  }, [fetchFromAirtable]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch("/api/submissions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          refreshData();
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
      setDeleteConfirm(null);
    },
    [refreshData]
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthed(true);
    } else {
      alert("סיסמה שגויה");
    }
  };

  // Build chart data for closed questions
  const chartDataByQuestion = useMemo(() => {
    const result: Record<string, { label: string; data: { name: string; count: number; pct: string }[] }> = {};

    for (const q of questions) {
      if (q.type === "open" || !q.options) continue;

      const counts: Record<string, number> = {};
      for (const opt of q.options) {
        counts[opt.value] = 0;
      }

      for (const sub of submissions) {
        const answer = sub.answers[q.id];
        if (!answer) continue;
        if (Array.isArray(answer)) {
          for (const a of answer) {
            if (counts[a] !== undefined) counts[a]++;
          }
        } else {
          if (counts[answer] !== undefined) counts[answer]++;
        }
      }

      const total = submissions.length || 1;

      result[q.id] = {
        label: q.text,
        data: q.options.map((opt) => ({
          name: opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label,
          count: counts[opt.value] || 0,
          pct: `${Math.round(((counts[opt.value] || 0) / total) * 100)}%`,
        })),
      };
    }

    return result;
  }, [submissions]);

  // Get open-ended answers
  const openAnswers = useMemo(() => {
    const openQ = questions.find((q) => q.type === "open");
    if (!openQ) return [];
    return submissions
      .filter((s) => s.answers[openQ.id] && typeof s.answers[openQ.id] === "string")
      .map((s) => ({
        firstName: s.firstName,
        answer: s.answers[openQ.id] as string,
        timestamp: s.timestamp,
      }))
      .reverse();
  }, [submissions]);

  // Generate insights per question
  const insights = useMemo(() => {
    if (submissions.length < 2) return [];
    const total = submissions.length;
    const result: { question: string; finding: string; recommendation: string; severity: "red" | "yellow" | "green" }[] = [];

    // daily_management insight
    const mgmtCounts = { in_my_head: 0, scattered_tools: 0, clear_system: 0, crm_exists: 0 };
    for (const s of submissions) {
      const v = s.answers.daily_management as string;
      if (v && v in mgmtCounts) mgmtCounts[v as keyof typeof mgmtCounts]++;
    }
    const noSystem = mgmtCounts.in_my_head + mgmtCounts.scattered_tools;
    const noSystemPct = Math.round((noSystem / total) * 100);
    if (noSystemPct >= 50) {
      result.push({
        question: "ניהול שוטף",
        finding: `${noSystemPct}% מהנשאלים מנהלים בלי מערכת מסודרת (הכל בראש או אקסלים מפוזרים).`,
        recommendation: "קהל יעד מצוין להטמעת CRM בסיסי. הכאב ברור - כדאי ליצור תוכן שמדבר על 'מעבר מכאוס לסדר'.",
        severity: "red",
      });
    } else if (noSystemPct >= 25) {
      result.push({
        question: "ניהול שוטף",
        finding: `${noSystemPct}% מנהלים בלי מערכת, ${Math.round((mgmtCounts.crm_exists / total) * 100)}% כבר יש להם CRM.`,
        recommendation: "תמהיל מעניין - חלק צריכים הטמעה חדשה, חלק צריכים אופטימיזציה. כדאי לפלח את המסרים.",
        severity: "yellow",
      });
    } else {
      result.push({
        question: "ניהול שוטף",
        finding: `רוב הנשאלים כבר עובדים עם מערכת (${Math.round(((mgmtCounts.clear_system + mgmtCounts.crm_exists) / total) * 100)}%).`,
        recommendation: "הקהל מתקדם - כדאי לדבר על אופטימיזציה ואוטומציה, לא על 'למה צריך CRM'.",
        severity: "green",
      });
    }

    // lead_management insight
    const leadCounts = { immediate: 0, hours: 0, day: 0, inconsistent: 0 };
    for (const s of submissions) {
      const v = s.answers.lead_management as string;
      if (v && v in leadCounts) leadCounts[v as keyof typeof leadCounts]++;
    }
    const slowLeads = leadCounts.day + leadCounts.inconsistent;
    const slowPct = Math.round((slowLeads / total) * 100);
    if (slowPct >= 40) {
      result.push({
        question: "זמן חזרה לליד",
        finding: `${slowPct}% לוקח להם יום ומעלה או שזה לא עקבי - לידים נאבדים.`,
        recommendation: "הזדמנות ברורה: אוטומציית תגובה מיידית (מייל/וואטסאפ אוטומטי) יכולה להוריד את זמן התגובה מיום ל-5 דקות.",
        severity: "red",
      });
    }

    // leads_falling insight
    const fallCounts = { none: 0, some_unknown: 0, too_many: 0 };
    for (const s of submissions) {
      const v = s.answers.leads_falling as string;
      if (v && v in fallCounts) fallCounts[v as keyof typeof fallCounts]++;
    }
    const fallingPct = Math.round(((fallCounts.some_unknown + fallCounts.too_many) / total) * 100);
    if (fallingPct >= 50) {
      result.push({
        question: "לידים נופלים",
        finding: `${fallingPct}% מודים שלידים נופלים בין הכיסאות - רובם גם לא יודעים כמה בדיוק.`,
        recommendation: "זה ה-pain point הכי חזק לשיווק. כדאי ליצור תוכן סביב 'כמה כסף אתה מפסיד בלי לדעת' ולהציע אבחון חינמי.",
        severity: "red",
      });
    }

    // manual_tasks insight
    const manualCounts = { low: 0, medium: 0, high: 0, very_high: 0 };
    for (const s of submissions) {
      const v = s.answers.manual_tasks as string;
      if (v && v in manualCounts) manualCounts[v as keyof typeof manualCounts]++;
    }
    const highManual = manualCounts.high + manualCounts.very_high;
    const highManualPct = Math.round((highManual / total) * 100);
    if (highManualPct >= 30) {
      result.push({
        question: "שעות ידניות",
        finding: `${highManualPct}% מבזבזים 15+ שעות בשבוע על עבודה ידנית חוזרת.`,
        recommendation: "ROI ברור לאוטומציה. כדאי לחשב: '15 שעות × 4 שבועות × ₪150 = ₪9,000 בחודש על משימות שמכונה יכולה לעשות'.",
        severity: "red",
      });
    }

    // ai_automation insight
    const aiCounts = { none: 0, basic: 0, advanced: 0 };
    for (const s of submissions) {
      const v = s.answers.ai_automation as string;
      if (v && v in aiCounts) aiCounts[v as keyof typeof aiCounts]++;
    }
    const noAiPct = Math.round((aiCounts.none / total) * 100);
    if (noAiPct >= 50) {
      result.push({
        question: "AI ואוטומציה",
        finding: `${noAiPct}% עדיין עובדים לגמרי ידנית - בלי שום אוטומציה או AI.`,
        recommendation: "שוק בשל למסר 'צעד ראשון'. כדאי להציע סדנאות או תוכן שמראה מה AI יכול לעשות בשפה פשוטה - בלי הפחדות.",
        severity: "yellow",
      });
    }

    // biggest_bottleneck insight
    const bottleneckCounts: Record<string, number> = {};
    for (const s of submissions) {
      const v = s.answers.biggest_bottleneck;
      if (Array.isArray(v)) {
        for (const b of v) {
          bottleneckCounts[b] = (bottleneckCounts[b] || 0) + 1;
        }
      }
    }
    const topBottlenecks = Object.entries(bottleneckCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    if (topBottlenecks.length > 0) {
      const labels = topBottlenecks.map(([k, v]) => `${getOptionLabel("biggest_bottleneck", k)} (${Math.round((v / total) * 100)}%)`);
      result.push({
        question: "צווארי בקבוק",
        finding: `צווארי הבקבוק הנפוצים ביותר: ${labels.join(" ו-")}.`,
        recommendation: "כדאי לבנות תכנים ו-case studies שמתמקדים בדיוק בנושאים האלו - הקהל שלך כבר אמר לך מה כואב.",
        severity: "yellow",
      });
    }

    return result;
  }, [submissions]);

  // Login screen
  if (!isAuthed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a3f7a 50%, #0a1e40 100%)" }}
      >
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl p-8"
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mx-auto mb-3"
              style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
            >
              🔐
            </div>
            <h2 className="text-xl font-bold text-white">כניסת מנהל</h2>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הזינו סיסמה"
            className="w-full p-3 rounded-xl border text-center text-base mb-4"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
            }}
            dir="rtl"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold cursor-pointer"
            style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
          >
            כניסה
          </button>
        </form>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f1f5f9" }} dir="rtl">
      {/* Header */}
      <header
        className="py-6 px-4 md:px-8 text-white"
        style={{ background: "linear-gradient(135deg, #0f2b5b, #1a3f7a)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📊 דשבורד תשובות</h1>
            <p className="text-sm opacity-70">מדד היעילות התפעולית | ענת רפאלי פלד</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{submissions.length}</div>
              <div className="text-xs opacity-70">נשאלים</div>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="py-2 px-4 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              {loading ? "⏳ טוען..." : "🔄 רענן"}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm w-fit" style={{ border: "1px solid #e2e8f0" }}>
          {[
            { key: "charts" as const, label: "📊 גרפים", },
            { key: "table" as const, label: "📋 טבלה מרכזת" },
            { key: "insights" as const, label: "💡 תובנות" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="py-2 px-5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: activeTab === tab.key ? "#0f2b5b" : "transparent",
                color: activeTab === tab.key ? "white" : "#64748b",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#0f2b5b" }}>
              עדיין אין תשובות
            </h2>
            <p style={{ color: "#64748b" }}>ברגע שאנשים ימלאו את השאלון, הנתונים יופיעו כאן</p>
          </div>
        ) : (
          <>
            {/* ===================== CHARTS TAB ===================== */}
            {activeTab === "charts" && (
              <div className="space-y-8">
                {/* Bar charts - vertical columns with numbered legend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(chartDataByQuestion).map(([qId, { label, data }]) => {
                    // Create numbered data for X axis
                    const numberedData = data.map((d, i) => ({
                      ...d,
                      num: `${i + 1}`,
                    }));
                    return (
                      <div
                        key={qId}
                        className="bg-white rounded-2xl p-6 shadow-sm border"
                        style={{ borderColor: "#e2e8f0" }}
                      >
                        <h3 className="text-sm font-bold mb-4" style={{ color: "#0f2b5b" }}>
                          {label}
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={numberedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                              dataKey="num"
                              type="category"
                              tick={{ fontSize: 14, fill: "#0f2b5b", fontWeight: "bold" }}
                              interval={0}
                            />
                            <YAxis
                              type="number"
                              allowDecimals={false}
                              tick={{ fontSize: 12, fill: "#94a3b8" }}
                              width={30}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                fontSize: "13px",
                                direction: "rtl",
                              }}
                              labelFormatter={(label) => {
                                const item = numberedData.find((d) => d.num === label);
                                return item ? item.name : label;
                              }}
                              formatter={(value) => [`${value}`, "תשובות"]}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                              {numberedData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        {/* Legend below chart */}
                        <div className="mt-3 space-y-1">
                          {data.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "#475569" }}>
                              <span
                                className="w-5 h-5 rounded flex items-center justify-center text-white font-bold flex-shrink-0"
                                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length], fontSize: "10px" }}
                              >
                                {i + 1}
                              </span>
                              <span>{d.name}</span>
                              <span className="font-bold mr-auto" style={{ color: "#0f2b5b" }}>({d.count})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Open-ended answers */}
                {openAnswers.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#e2e8f0" }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: "#0f2b5b" }}>
                      💬 תשובות פתוחות - &quot;2 הבעיות הגדולות&quot;
                    </h3>
                    <div className="space-y-3">
                      {openAnswers.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border"
                          style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold" style={{ color: "#0f2b5b" }}>
                              {item.firstName}
                            </span>
                            <span className="text-xs" style={{ color: "#94a3b8" }}>
                              {new Date(item.timestamp).toLocaleDateString("he-IL")}
                            </span>
                          </div>
                          <p
                            className="text-sm leading-relaxed whitespace-pre-line"
                            style={{ color: "#1e293b" }}
                          >
                            {item.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== TABLE TAB ===================== */}
            {activeTab === "table" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "#e2e8f0" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: "#0f2b5b" }}>
                    📋 טבלה מרכזת - כל המילויים
                  </h3>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>
                    {submissions.length} מילויים
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse" style={{ minWidth: "1600px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                        <th className="text-right py-3 px-2 font-bold whitespace-nowrap" style={{ color: "#64748b" }}>
                          פעולות
                        </th>
                        <th className="text-right py-3 px-2 font-bold whitespace-nowrap" style={{ color: "#64748b" }}>
                          תאריך ושעה
                        </th>
                        <th className="text-right py-3 px-2 font-bold whitespace-nowrap" style={{ color: "#64748b" }}>
                          שם
                        </th>
                        <th className="text-right py-3 px-2 font-bold whitespace-nowrap" style={{ color: "#64748b" }}>
                          מייל
                        </th>
                        {questions.map((q, idx) => (
                          <th
                            key={q.id}
                            className="text-right py-3 px-2 font-bold whitespace-nowrap"
                            style={{ color: "#64748b" }}
                            title={q.text}
                          >
                            ש{idx + 1}: {getShortLabel(q.id)}
                          </th>
                        ))}
                        <th className="text-right py-3 px-2 font-bold whitespace-nowrap" style={{ color: "#64748b" }}>
                          📧 דוח שנשלח
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...submissions].reverse().map((sub) => (
                        <tr
                          key={sub.id}
                          className="hover:bg-blue-50 transition-colors"
                          style={{ borderBottom: "1px solid #e2e8f0" }}
                        >
                          {/* Delete button */}
                          <td className="py-2.5 px-2">
                            {deleteConfirm === sub.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(sub.id)}
                                  className="py-1 px-2 rounded text-xs font-bold text-white cursor-pointer"
                                  style={{ backgroundColor: "#dc2626" }}
                                >
                                  מחק
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="py-1 px-2 rounded text-xs cursor-pointer"
                                  style={{ backgroundColor: "#e2e8f0", color: "#475569" }}
                                >
                                  ביטול
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(sub.id)}
                                className="py-1 px-2 rounded text-xs cursor-pointer hover:bg-red-50 transition-colors"
                                style={{ color: "#dc2626" }}
                                title="הסר מילוי"
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                          {/* Timestamp */}
                          <td className="py-2.5 px-2 whitespace-nowrap" style={{ color: "#64748b" }}>
                            {new Date(sub.timestamp).toLocaleDateString("he-IL")}{" "}
                            {new Date(sub.timestamp).toLocaleTimeString("he-IL", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          {/* Name */}
                          <td className="py-2.5 px-2 font-medium whitespace-nowrap">{sub.firstName}</td>
                          {/* Email */}
                          <td className="py-2.5 px-2 whitespace-nowrap" style={{ color: "#64748b" }} dir="ltr">
                            {sub.email}
                          </td>
                          {/* All question answers */}
                          {questions.map((q) => {
                            const answer = sub.answers[q.id];
                            let display = "-";
                            if (answer) {
                              if (Array.isArray(answer)) {
                                display = answer.map((a) => getOptionLabel(q.id, a)).join(", ");
                              } else if (q.type === "open") {
                                display = truncate(answer, 60);
                              } else {
                                display = getOptionLabel(q.id, answer);
                              }
                            }
                            return (
                              <td
                                key={q.id}
                                className="py-2.5 px-2"
                                style={{ color: "#475569", maxWidth: "180px" }}
                                title={typeof answer === "string" ? answer : Array.isArray(answer) ? answer.join(", ") : ""}
                              >
                                {truncate(display, 40)}
                              </td>
                            );
                          })}
                          {/* Report content */}
                          <td className="py-2.5 px-2" style={{ maxWidth: "200px" }}>
                            {sub.reportContent ? (
                              <button
                                onClick={() => {
                                  const win = window.open("", "_blank");
                                  if (win) {
                                    win.document.write(sub.reportContent || "");
                                    win.document.close();
                                  }
                                }}
                                className="py-1 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all"
                                style={{
                                  backgroundColor: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                }}
                              >
                                👁️ צפה בדוח
                              </button>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===================== INSIGHTS TAB ===================== */}
            {activeTab === "insights" && (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "סה״כ מילויים",
                      value: submissions.length.toString(),
                      icon: "📝",
                      bg: "#eff6ff",
                    },
                    {
                      label: "בלי מערכת",
                      value: `${Math.round(
                        (submissions.filter(
                          (s) =>
                            s.answers.daily_management === "in_my_head" ||
                            s.answers.daily_management === "scattered_tools"
                        ).length /
                          (submissions.length || 1)) *
                          100
                      )}%`,
                      icon: "🧠",
                      bg: "#fef2f2",
                    },
                    {
                      label: "לידים נופלים",
                      value: `${Math.round(
                        (submissions.filter(
                          (s) =>
                            s.answers.leads_falling === "some_unknown" ||
                            s.answers.leads_falling === "too_many"
                        ).length /
                          (submissions.length || 1)) *
                          100
                      )}%`,
                      icon: "😓",
                      bg: "#fffbeb",
                    },
                    {
                      label: "15+ שעות ידניות",
                      value: `${Math.round(
                        (submissions.filter(
                          (s) =>
                            s.answers.manual_tasks === "high" || s.answers.manual_tasks === "very_high"
                        ).length /
                          (submissions.length || 1)) *
                          100
                      )}%`,
                      icon: "⏰",
                      bg: "#fef2f2",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 text-center"
                      style={{ backgroundColor: card.bg, border: "1px solid #e2e8f0" }}
                    >
                      <div className="text-2xl mb-1">{card.icon}</div>
                      <div className="text-2xl font-bold" style={{ color: "#0f2b5b" }}>
                        {card.value}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "#64748b" }}>
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insights per question */}
                {insights.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold" style={{ color: "#0f2b5b" }}>
                      🔍 תובנות וניתוח לפי שאלה
                    </h3>
                    {insights.map((insight, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-5 shadow-sm border-r-4"
                        style={{
                          borderColor:
                            insight.severity === "red"
                              ? "#dc2626"
                              : insight.severity === "yellow"
                              ? "#f59e0b"
                              : "#10b981",
                          border: `1px solid #e2e8f0`,
                          borderRight: `4px solid ${
                            insight.severity === "red"
                              ? "#dc2626"
                              : insight.severity === "yellow"
                              ? "#f59e0b"
                              : "#10b981"
                          }`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {insight.severity === "red" ? "🔴" : insight.severity === "yellow" ? "🟡" : "🟢"}
                          </span>
                          <h4 className="font-bold" style={{ color: "#0f2b5b" }}>
                            {insight.question}
                          </h4>
                        </div>
                        <p className="text-sm mb-2" style={{ color: "#475569" }}>
                          <strong>ממצא:</strong> {insight.finding}
                        </p>
                        <p className="text-sm" style={{ color: "#1e3a5f" }}>
                          <strong>💡 המלצה:</strong> {insight.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border" style={{ borderColor: "#e2e8f0" }}>
                    <div className="text-3xl mb-3">📈</div>
                    <p style={{ color: "#64748b" }}>צריך לפחות 2 מילויים כדי לייצר תובנות משמעותיות</p>
                  </div>
                )}

                {/* Bottom CTA - detailed action plan */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="py-5 px-6 text-white" style={{ background: "linear-gradient(135deg, #0f2b5b, #2563eb)" }}>
                    <h3 className="text-xl font-bold">🎯 לאן לקחת את הנתונים האלה?</h3>
                    <p className="text-sm opacity-80 mt-1">מדריך פרקטי - מה לעשות עם התובנות מהשאלון</p>
                  </div>

                  <div className="bg-white p-6 space-y-6">
                    {/* 1. Content Marketing */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📢</span>
                        <h4 className="font-bold text-base" style={{ color: "#0f2b5b" }}>תוכן שיווקי ממוקד</h4>
                      </div>
                      <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
                        <p>• <strong>פוסטים ללינקדאין/פייסבוק:</strong> תקחי את צווארי הבקבוק הנפוצים ביותר ותכתבי פוסט לכל אחד. למשל: אם 70% בחרו &quot;מעקב אחרי לידים&quot; - כתבי פוסט: &quot;כמה לידים נפלו לכם השבוע בלי שידעתם?&quot;</p>
                        <p>• <strong>Reels/TikTok:</strong> צלמי סרטון קצר שמראה את הסטטיסטיקה: &quot;שאלתי X בעלי עסקים... והנה מה שגיליתי&quot; - זה תוכן ויראלי כי הוא מבוסס על דאטא אמיתי.</p>
                        <p>• <strong>ניוזלטר/מייל:</strong> שלחי סיכום חודשי: &quot;מה למדתי מ-50 בעלי עסקים שמילאו את השאלון&quot; - ערך + סמכות מקצועית.</p>
                        <p>• <strong>כותרות לפרסום:</strong> השתמשי במילים של הנשאלים עצמם מהתשובות הפתוחות - זו השפה שמדברת ללקוחות.</p>
                      </div>
                    </div>

                    {/* 2. Segmentation */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🎯</span>
                        <h4 className="font-bold text-base" style={{ color: "#0f2b5b" }}>פילוח לידים לפי בשלות</h4>
                      </div>
                      <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
                        <p>• <strong>🔴 חמים (ציון 0-29):</strong> בלי מערכת + לידים נופלים + הרבה שעות ידניות. הכאב חד - אלה הכי בשלים לשיחת מכירה. תתקשרי תוך 24 שעות.</p>
                        <p>• <strong>🟡 פושרים (ציון 30-54):</strong> יש בסיס אבל חסר אופטימיזציה. שלחי להם תוכן ערכי (מדריך PDF, סרטון) ואז הציעי שיחה אחרי שבוע.</p>
                        <p>• <strong>🟢 עתידיים (ציון 55+):</strong> כבר מסודרים יחסית. שמרי קשר דרך ניוזלטר - הם יחזרו כשיגדלו ויצטרכו שדרוג.</p>
                        <p>• <strong>לפי תחום:</strong> אם יש ריכוז גבוה של תחום מסוים (למשל נדל&quot;ן) - בני case study ספציפי לתחום הזה.</p>
                      </div>
                    </div>

                    {/* 3. Sales Calls */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📞</span>
                        <h4 className="font-bold text-base" style={{ color: "#0f2b5b" }}>שיחות מכירה מותאמות אישית</h4>
                      </div>
                      <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
                        <p>• <strong>פתיחה אישית:</strong> &quot;ראיתי שציינת שהבעיה הכי גדולה היא [ציטוט מהתשובה הפתוחה]. ספרי לי עוד על זה&quot; - זה מיידי מייצר אמון.</p>
                        <p>• <strong>תיאום ציפיות:</strong> אם בחרו &quot;הכל בראש שלי&quot; - דברי על מסע קצר ופשוט, לא על מערכת מורכבת. אם כבר יש CRM - דברי על אופטימיזציה.</p>
                        <p>• <strong>ROI מוחשי:</strong> אם בחרו 15+ שעות ידניות - חשבי בשיחה: &quot;15 שעות × ₪150 = ₪9,000 בחודש על עבודה שמכונה יכולה לעשות&quot;.</p>
                        <p>• <strong>הדוח כמנוף:</strong> פתחי את השיחה מתוך הדוח ששלחת: &quot;ראיתי שקיבלת ציון 34 - בוא נראה מה הדבר הראשון שכדאי לשנות&quot;.</p>
                      </div>
                    </div>

                    {/* 4. Products/Services */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">💡</span>
                        <h4 className="font-bold text-base" style={{ color: "#0f2b5b" }}>בניית מוצרים ושירותים</h4>
                      </div>
                      <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
                        <p>• <strong>מיני-מוצר:</strong> אם הרבה עונים &quot;אקסלים ורשימות&quot; - בני חבילת &quot;Setup בסיסי&quot; ב-₪2,000 שמעבירה מאקסל ל-CRM תוך שבוע.</p>
                        <p>• <strong>סדנה:</strong> צרי סדנה בנושא שעולה הכי הרבה: &quot;איך להפסיק לאבד לידים - סדנה מעשית של שעתיים&quot;.</p>
                        <p>• <strong>אוטומציה כשירות:</strong> אם הבעיות החוזרות הן &quot;עבודה ידנית חוזרת&quot; - הציעי חבילת אוטומציה חודשית (retainer).</p>
                        <p>• <strong>תמחור מותאם:</strong> לפי גודל העסק - פרילנסרים צריכים פתרון זול ופשוט, עסקים בינוניים מוכנים לשלם על הטמעה מלאה.</p>
                      </div>
                    </div>

                    {/* 5. Follow-up Automation */}
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🤖</span>
                        <h4 className="font-bold text-base" style={{ color: "#0f2b5b" }}>אוטומציית המשך</h4>
                      </div>
                      <div className="space-y-2 text-sm" style={{ color: "#475569" }}>
                        <p>• <strong>דריפ מיילים:</strong> שלחי סדרת 3 מיילים אחרי הדוח - מייל 1: טיפ מהיר (יום 2), מייל 2: case study (יום 5), מייל 3: הזמנה לשיחה (יום 8).</p>
                        <p>• <strong>ריטרגטינג:</strong> העלי את רשימת המיילים לפייסבוק/גוגל כ-custom audience ותציגי להם מודעות ממוקדות.</p>
                        <p>• <strong>WhatsApp:</strong> שלחי הודעה אישית יום אחרי הדוח: &quot;היי [שם], ראיתי שמילאת את השאלון. האם הדוח היה רלוונטי? יש שאלות?&quot;</p>
                        <p>• <strong>תזכורת לשיחה:</strong> למי שלא תיאם שיחה תוך 3 ימים - שלחי מייל עם slot ספציפי: &quot;שמרתי לך מקום ביום ד׳ ב-10:00&quot;.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
