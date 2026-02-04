import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createJWT, setAuthCookie } from "@/lib/auth";
import { compare, hash } from "bcryptjs";

// Validar formato de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar que no sea una contraseña débil
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener minúsculas");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener mayúsculas");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe contener números");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Map para rastrear intentos fallidos por IP/email
const failedAttempts = new Map<string, { count: number; timestamp: number }>();

// Limpiar intentos antiguos
function cleanOldAttempts(): void {
  const now = Date.now();
  for (const [key, value] of failedAttempts.entries()) {
    if (now - value.timestamp > 15 * 60 * 1000) { // 15 minutos
      failedAttempts.delete(key);
    }
  }
}

// Verificar si está bloqueado por intentos fallidos
function isBlockedByFailedAttempts(email: string): boolean {
  cleanOldAttempts();
  const key = `login_${email}`;
  const attempt = failedAttempts.get(key);
  return attempt ? attempt.count >= 5 : false;
}

// Registrar intento fallido
function recordFailedAttempt(email: string): void {
  const key = `login_${email}`;
  const now = Date.now();
  const attempt = failedAttempts.get(key);

  if (attempt) {
    attempt.count++;
    attempt.timestamp = now;
  } else {
    failedAttempts.set(key, { count: 1, timestamp: now });
  }
}

// Limpiar intentos fallidos al login exitoso
function clearFailedAttempts(email: string): void {
  const key = `login_${email}`;
  failedAttempts.delete(key);
}

export async function POST(request: Request) {
  try {
    // Validar que el body sea JSON válido
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud debe ser JSON válido" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validar que los campos no estén vacíos
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Validar tipos de datos
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email y contraseña deben ser textos" },
        { status: 400 }
      );
    }

    // Validar longitud mínima de campos
    if (email.trim().length === 0 || password.length === 0) {
      return NextResponse.json(
        { error: "Email y contraseña no pueden estar vacíos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }

    // Verificar si está bloqueado por demasiados intentos fallidos
    if (isBlockedByFailedAttempts(email.trim())) {
      return NextResponse.json(
        { error: "Cuenta bloqueada temporalmente. Intente más tarde." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      recordFailedAttempt(email.trim());
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      recordFailedAttempt(email.trim());
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // Limpiar intentos fallidos al login exitoso
    clearFailedAttempts(email.trim());

    const token = await createJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        message: "Sesión iniciada correctamente",
      },
      { status: 200 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST para iniciar sesión",
    example: {
      email: "admin@example.com",
      password: "password123",
    },
  });
}

