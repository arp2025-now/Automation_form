import { NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;

interface AirtableRecord {
  id: string;
  fields: Record<string, string | undefined>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

// Map Airtable field names to our question IDs
const FIELD_MAP: Record<string, string> = {
  "שאלה 1": "business_type",
  "שאלה 2": "industry",
  "שאלה 3": "business_age",
  "שאלה 4": "daily_management",
  "שאלה 5": "lead_management",
  "שאלה 6": "leads_falling",
  "שאלה 7": "manual_tasks",
  "שאלה 8": "ai_automation",
  "שאלה 9": "biggest_bottleneck",
  "שאלה 10": "open_challenges",
};

function mapAirtableRecord(record: AirtableRecord) {
  const fields = record.fields;
  const answers: Record<string, string | string[]> = {};

  for (const [airtableField, questionId] of Object.entries(FIELD_MAP)) {
    const value = fields[airtableField];
    if (value) {
      // biggest_bottleneck might be comma-separated
      if (questionId === "biggest_bottleneck" && value.includes(",")) {
        answers[questionId] = value.split(",").map((s) => s.trim());
      } else {
        answers[questionId] = value;
      }
    }
  }

  return {
    id: record.id,
    timestamp: record.createdTime || fields["תאריך"] || new Date().toISOString(),
    firstName: fields["שם"] || fields["שם פרטי"] || fields["name"] || fields["firstName"] || "",
    email: fields["מייל"] || fields["email"] || fields["Email"] || "",
    answers,
    reportContent: fields["סיכום שאלון ותובנות"] || fields["דוח"] || fields["report"] || "",
  };
}

export async function GET() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Missing Airtable configuration" },
      { status: 500 }
    );
  }

  try {
    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    // Paginate through all records
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`
      );
      url.searchParams.set("pageSize", "100");
      if (offset) url.searchParams.set("offset", offset);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Airtable error:", res.status, errText);
        return NextResponse.json(
          { error: `Airtable API error: ${res.status}` },
          { status: res.status }
        );
      }

      const data: AirtableResponse = await res.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    const submissions = allRecords.map(mapAirtableRecord);

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("Airtable fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from Airtable" },
      { status: 500 }
    );
  }
}

// DELETE - remove a record from Airtable
export async function DELETE(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    return NextResponse.json(
      { error: "Missing Airtable configuration" },
      { status: 500 }
    );
  }

  try {
    const { id } = await request.json();

    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Airtable delete error: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Airtable delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete from Airtable" },
      { status: 500 }
    );
  }
}
