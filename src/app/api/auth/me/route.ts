import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token no proporcionado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
        area: string;
      };
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Sesión expirada o inválida" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
