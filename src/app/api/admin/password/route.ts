import { NextRequest, NextResponse } from "next/server";
import {
  changeAdminPassword,
  requireAdmin,
  unauthorized,
} from "@/lib/auth";

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return unauthorized();

  try {
    const body = await req.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    // Also verify the current password matches the one in the header
    // (already checked by requireAdmin) AND the form currentPassword
    const result = await changeAdminPassword(currentPassword, newPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Password updated. Use the new password next time you log in.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not change password." },
      { status: 500 }
    );
  }
}
