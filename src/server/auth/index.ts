import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { cache } from "react";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

export const auth = cache(async (): Promise<{ user: User } | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET || "fallback-secret"
    ) as { userId: string; email: string };

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return null;
    }

    return { user };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
});

export const signIn = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

export const signOut = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
};
