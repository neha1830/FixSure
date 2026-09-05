import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required." },
        { status: 400 }
      );
    }

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: "Provide an email or phone number so we can reply." },
        { status: 400 }
      );
    }

    await prisma.contactInquiry.create({
      data: {
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
        message: String(message).trim(),
        status: "NEW",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks — we’ll get back to you within 24 hours.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not send your message." },
      { status: 500 }
    );
  }
}
