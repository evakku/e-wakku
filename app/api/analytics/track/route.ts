import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, issueId } = body;

    if (type !== "view" && type !== "download") {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const updated = await trackAnalyticsEvent(type, issueId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error logging analytics event:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
