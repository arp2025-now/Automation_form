export type QuestionType = "single" | "multiple" | "open";

export interface Option {
  value: string;
  label: string;
  emoji?: string;
}

export interface Question {
  id: string;
  text: string;
  subtitle?: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
}

export const questions: Question[] = [
  {
    id: "business_type",
    text: "מה סוג העסק שלך?",
    subtitle: "בחר/י את התשובה הכי קרובה",
    type: "single",
    options: [
      { value: "freelancer", label: "פרילנסר / עצמאי", emoji: "👤" },
      { value: "small_business", label: "עסק קטן (2-10 עובדים)", emoji: "🏢" },
      { value: "medium_business", label: "עסק בינוני (11-50 עובדים)", emoji: "🏗️" },
      { value: "large_business", label: "עסק גדול (50+ עובדים)", emoji: "🏛️" },
    ],
  },
  {
    id: "industry",
    text: "באיזה תחום העסק שלך פועל?",
    type: "single",
    options: [
      { value: "real_estate", label: "נדל״ן ויזמות", emoji: "🏠" },
      { value: "courses_training", label: "הדרכות, קורסים וליווי עסקי", emoji: "🎓" },
      { value: "services", label: "שירותים מקצועיים (ייעוץ, עו״ד, רו״ח)", emoji: "💼" },
      { value: "health_beauty", label: "בריאות, יופי וטיפוח", emoji: "💆" },
      { value: "ecommerce", label: "מסחר אלקטרוני / קמעונאות", emoji: "🛒" },
      { value: "marketing_digital", label: "שיווק דיגיטלי ופרסום", emoji: "📱" },
      { value: "construction_renovation", label: "בנייה ושיפוצים", emoji: "🔨" },
      { value: "finance_insurance", label: "פיננסים וביטוח", emoji: "📊" },
    ],
  },
  {
    id: "business_age",
    text: "כמה זמן העסק שלך פעיל?",
    type: "single",
    options: [
      { value: "under_2", label: "פחות משנתיים", emoji: "🌱" },
      { value: "2_to_5", label: "2-5 שנים", emoji: "🌿" },
      { value: "over_5", label: "מעל 5 שנים", emoji: "🌳" },
    ],
  },
  {
    id: "daily_management",
    text: "איך נראה הניהול השוטף בעסק?",
    type: "single",
    options: [
      { value: "clear_system", label: "יש מערכת ברורה וכולם יודעים מה לעשות", emoji: "✅" },
      { value: "in_my_head", label: "הכל בראש שלי ואני צריך להגיד לכולם מה לעשות, ולפעמים שוכח", emoji: "🧠" },
      { value: "scattered_tools", label: "אני משתמש באקסלים, ברשימות ובוואטסאפ  - אבל זה לא עובד חלק", emoji: "📋" },
      { value: "crm_exists", label: "יש מערכת CRM (גם אם לא מנצלים את כל הפוטנציאל שלה)", emoji: "⚙️" },
    ],
  },
  {
    id: "lead_management",
    text: "כמה זמן לוקח לכם לחזור לליד חדש?",
    subtitle: "מרגע שהליד נכנס ועד לתגובה ראשונה",
    type: "single",
    options: [
      { value: "immediate", label: "מיידי (עד 5 דקות)", emoji: "⚡" },
      { value: "hours", label: "תוך מספר שעות", emoji: "⏰" },
      { value: "day", label: "תוך יום עסקים", emoji: "📅" },
      { value: "inconsistent", label: "לא עקבי / תלוי מי פנוי", emoji: "🎲" },
    ],
  },
  {
    id: "leads_falling",
    text: "כמה לידים או לקוחות לדעתך ׳נופלים בין הכיסאות׳ בחודש?",
    type: "single",
    options: [
      { value: "none", label: "אף אחד  - יש מעקב מסודר", emoji: "✅" },
      { value: "some_unknown", label: "כנראה כמה, אבל אין לי דרך לדעת בדיוק", emoji: "🤷" },
      { value: "too_many", label: "יותר מדי  - אני יודע/ת שאנחנו מפספסים הזדמנויות", emoji: "😓" },
    ],
  },
  {
    id: "manual_tasks",
    text: "כמה שעות בשבוע מוקדשות למשימות ידניות חוזרות?",
    subtitle: "כמו הזנת נתונים, שליחת מיילים, מעקב ידני",
    type: "single",
    options: [
      { value: "low", label: "פחות מ-5 שעות", emoji: "🟢" },
      { value: "medium", label: "5-15 שעות", emoji: "🟡" },
      { value: "high", label: "15-30 שעות", emoji: "🟠" },
      { value: "very_high", label: "מעל 30 שעות", emoji: "🔴" },
    ],
  },
  {
    id: "ai_automation",
    text: "האם יש שילוב של כלי AI או אוטומציה בעסק?",
    type: "single",
    options: [
      { value: "none", label: "לא, הכל נעשה ידנית (אקסלים, וואטסאפ, מיילים ידניים)", emoji: "📝" },
      { value: "basic", label: "יש כלים בסיסיים (תזכורות אוטומטיות, טפסים דיגיטליים, שליחת חשבוניות)", emoji: "🔧" },
      { value: "advanced", label: "יש תהליכים אוטומטיים ו/או כלי AI (צ׳אטבוטים, מיילים אוטומטיים, דוחות אוטומטיים)", emoji: "🤖" },
    ],
  },
  {
    id: "biggest_bottleneck",
    text: "מהו צוואר הבקבוק הכי גדול בעסק שלך?",
    subtitle: "ניתן לבחור עד 2 תשובות",
    type: "multiple",
    options: [
      { value: "lead_followup", label: "מעקב אחרי לידים ולקוחות", emoji: "📞" },
      { value: "manual_work", label: "עבודה ידנית שחוזרת על עצמה", emoji: "🔄" },
      { value: "data_chaos", label: "מידע מפוזר בין מערכות שונות", emoji: "🗂️" },
      { value: "team_coordination", label: "תיאום בין חברי צוות", emoji: "👥" },
      { value: "reporting", label: "חוסר נראות ודוחות", emoji: "📊" },
      { value: "scaling", label: "קושי לגדול בלי להגדיל צוות", emoji: "📈" },
    ],
  },
  {
    id: "open_challenges",
    text: "מהן 2 הבעיות הכי גדולות שמעכבות את העסק שלך?",
    subtitle: "ספר/י לנו בכמה מילים  - ככל שתפרט/י יותר, הדוח יהיה מדויק יותר",
    type: "open",
    placeholder: "לדוגמה:\n1. אני מבזבז/ת שעות על מעקב ידני אחרי לידים\n2. אין לי תמונה ברורה של הכנסות מול הוצאות",
  },
];
