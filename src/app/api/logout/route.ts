import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/", "http://localhost:3000"), {
    status: 302,
  });

  response.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}


export async function GET() {
  const response = NextResponse.redirect(new URL("/", "http://localhost:3000"), {
    status: 302,
  });

  response.cookies.set("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

