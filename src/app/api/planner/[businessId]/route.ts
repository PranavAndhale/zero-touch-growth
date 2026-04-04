import { NextRequest, NextResponse } from "next/server";
import { getPlansForBusiness } from "@/lib/firebase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  if (!businessId) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  try {
    const plans = await getPlansForBusiness(businessId);
    return NextResponse.json({ success: true, plans, count: plans.length });
  } catch (err) {
    console.error("Plans fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
