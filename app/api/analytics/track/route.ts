import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`analytics:${clientIp}`, 30, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many tracking requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { type, issueId } = body;

    if (type !== "view" && type !== "download") {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    await trackAnalyticsEvent(type, issueId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging analytics event:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
