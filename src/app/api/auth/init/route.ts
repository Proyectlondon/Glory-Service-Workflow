import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Check if admin exists
    const admin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (admin) {
      return NextResponse.json({ 
        message: "Administrador ya existe", 
        email: admin.email,
        status: "ready" 
      });
    }

    // 2. Create the initial admin user
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const newAdmin = await prisma.user.create({
      data: {
        name: "Administrador Glory",
        email: "admin", // Using 'admin' as identifier for simplicity in the demo
        password: hashedAdminPassword,
        role: "admin",
        area: "EXECUTIVE_ACCOUNTANT",
      },
    });

    // 3. Create a dispatcher user for the demo
    const hashedUserPassword = await bcrypt.hash("user123", 10);
    await prisma.user.create({
      data: {
        name: "Empleado Pruebas",
        email: "user",
        password: hashedUserPassword,
        role: "user",
        area: "DISPATCHER",
      },
    });

    return NextResponse.json({
      message: "Base de datos inicializada correctamente",
      admin: { email: "admin", pass: "admin123" },
      user: { email: "user", pass: "user123" },
      status: "initialized"
    });
  } catch (error: any) {
    console.error("Error init db:", error);
    return NextResponse.json({ 
      error: "Error al inicializar la base de datos", 
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
