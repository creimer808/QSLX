import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET || "fallback-secret"
    ) as { userId: string; email: string };

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }
}
