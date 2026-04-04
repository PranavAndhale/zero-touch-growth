import { NextRequest, NextResponse } from "next/server";
import { getUpcomingFestivals } from "@/lib/calendarific";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") || "IN";
  const days = parseInt(searchParams.get("days") || "90", 10);

  try {
    const festivals = await getUpcomingFestivals(country, Math.min(days, 180));
    return NextResponse.json({ success: true, festivals, count: festivals.length });
  } catch (err) {
    console.error("Festivals API error:", err);
    return NextResponse.json({ error: "Failed to fetch festivals" }, { status: 500 });
  }
}
