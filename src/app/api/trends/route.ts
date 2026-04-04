import { NextRequest, NextResponse } from "next/server";
import { getTrendingInIndia, getIndustryTrends } from "@/lib/trends";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry");

  try {
    const trends = industry
      ? await getIndustryTrends(industry)
      : await getTrendingInIndia();

    return NextResponse.json({ success: true, trends, count: trends.length });
  } catch (err) {
    console.error("Trends API error:", err);
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
