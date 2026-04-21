import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, logAuthError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`Intento de inicio de sesión para: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Attempt to find user by email or name
    let user;
    try {
      user = await db.user.findFirst({
        where: {
          OR: [
            { email: email },
            { name: email } // In this context, 'email' is the input value from the UI
          ]
        }
      });
    } catch (dbError: any) {
      logAuthError("Database connection during login", dbError);
      return NextResponse.json(
        { error: "Error de conexión con la base de datos", details: dbError.message },
        { status: 503 }
      );
    }

    if (!user) {
      console.log(`Usuario no encontrado: ${email}`);
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log(`Usuario inactivo intentando entrar: ${email}`);
      return NextResponse.json(
        { error: "Usuario inactivo. Contacte al administrador." },
        { status: 403 }
      );
    }

    // Verify password: Check if it's bcrypt hashed or plain text
    let isValid = false;
    let needsHashing = false;

    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text check (for manually created users)
      isValid = (password === user.password);
      if (isValid) {
        needsHashing = true;
      }
    }

    if (!isValid) {
      console.log(`Contraseña incorrecta para: ${email}`);
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Hash the password if it was plain text and store it securely
    if (needsHashing) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log(`Contraseña de ${email} encriptada y migrada exitosamente.`);
    }

    // Generate token using Centralized Secret
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, area: user.area },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    console.log(`Login exitoso: ${email}`);

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    logAuthError("General Login Handler", error);
    return NextResponse.json(
      { error: "Error interno al iniciar sesión", details: error.message },
      { status: 500 }
    );
  }
}
