import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const seedUsers = [
      { name: "Dispatcher", email: "dispatcher@glory.com", password: "123456", area: "DISPATCHER", role: "user" },
      { name: "Ejecutiva", email: "ejecutiva@glory.com", password: "123456", area: "EXECUTIVE_ACCOUNTANT", role: "user" },
      { name: "Financiera", email: "financiera@glory.com", password: "123456", area: "FINANCE", role: "user" },
      { name: "Operaciones", email: "operaciones@glory.com", password: "123456", area: "OPERATIONS", role: "user" },
      { name: "Cadena de Suministro", email: "cadena@glory.com", password: "123456", area: "SUPPLY_CHAIN", role: "user" },
      { name: "Soporte", email: "soporte@glory.com", password: "123456", area: "SERVICE_SUPPORT", role: "user" },
      { name: "Admin", email: "admin@glory.com", password: "123456", area: "DISPATCHER", role: "admin" },
    ];

    const results = [];

    for (const userData of seedUsers) {
      const existing = await db.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        results.push({ email: userData.email, status: "already_exists" });
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await db.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          area: userData.area,
          role: userData.role,
        },
      });

      results.push({ email: userData.email, status: "created", id: user.id });
    }

    const created = results.filter((r) => r.status === "created").length;
    const skipped = results.filter((r) => r.status === "already_exists").length;

    return NextResponse.json({
      message: `Seed completado: ${created} usuarios creados, ${skipped} ya existían`,
      created,
      skipped,
      users: results,
    });
  } catch (error) {
    console.error("Error seeding users:", error);
    return NextResponse.json(
      { error: "Error al crear usuarios de prueba" },
      { status: 500 }
    );
  }
}
