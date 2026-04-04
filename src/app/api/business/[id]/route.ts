import { NextRequest, NextResponse } from "next/server";
import { getBusinessFromFirestore } from "@/lib/firebase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Business ID required" }, { status: 400 });
  }

  const business = await getBusinessFromFirestore(id);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, business }, { status: 200 });
}
