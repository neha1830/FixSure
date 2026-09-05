import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getApprovedReviews } from "@/lib/public-data";

export async function GET() {
  const reviews = await getApprovedReviews(40);
  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, device, body: reviewBody, phoneNumber, rating } = body;

    if (!name?.trim() || !reviewBody?.trim()) {
      return NextResponse.json(
        { error: "Name and review text are required." },
        { status: 400 }
      );
    }

    const stars = Math.min(5, Math.max(1, Number(rating) || 5));

    await prisma.customerReview.create({
      data: {
        name: String(name).trim(),
        device: device ? String(device).trim() : null,
        body: String(reviewBody).trim(),
        phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
        rating: stars,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Thanks! Your review was submitted and will appear after we approve it.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not submit review." },
      { status: 500 }
    );
  }
}
