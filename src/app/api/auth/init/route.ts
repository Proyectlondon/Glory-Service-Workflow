import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Iniciando auto-construcción de base de datos...");

    // 1. Create Tables using Raw SQL (PostgreSQL format)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "area" TEXT NOT NULL DEFAULT 'DISPATCHER',
        "role" TEXT NOT NULL DEFAULT 'user',
        "avatar" TEXT NOT NULL DEFAULT '',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Workflow" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "currentArea" TEXT NOT NULL DEFAULT 'DISPATCHER',
        "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
        "documentData" TEXT NOT NULL DEFAULT '',
        "documentName" TEXT NOT NULL,
        "completedAreas" TEXT NOT NULL DEFAULT '[]',
        "createdBy" TEXT,
        "updatedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "WorkflowField" (
        "id" TEXT NOT NULL,
        "workflowId" TEXT NOT NULL,
        "label" TEXT NOT NULL,
        "value" TEXT NOT NULL DEFAULT '',
        "fieldType" TEXT NOT NULL DEFAULT 'text',
        "area" TEXT NOT NULL DEFAULT 'DISPATCHER',
        "required" BOOLEAN NOT NULL DEFAULT false,
        "orderIndex" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "WorkflowField_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "WorkflowField_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT NOT NULL,
        "workflowId" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'info',
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Notification_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AreaLog" (
        "id" TEXT NOT NULL,
        "workflowId" TEXT NOT NULL,
        "fromArea" TEXT NOT NULL,
        "toArea" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AreaLog_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "AreaLog_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 2. Create UNIQUE index for email if not exists
    try {
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`);
    } catch (e) {
      // Ignorar si el índice ya existe
    }

    // 3. Create Admin if not exists
    const adminCount = await prisma.user.count();
    if (adminCount === 0) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: {
          name: "Administrador Glory",
          email: "admin",
          password: hashedAdminPassword,
          role: "admin",
          area: "EXECUTIVE_ACCOUNTANT",
          updatedAt: new Date(),
        },
      });

      const hashedUserPassword = await bcrypt.hash("user123", 10);
      await prisma.user.create({
        data: {
          name: "Empleado Pruebas",
          email: "user",
          password: hashedUserPassword,
          role: "user",
          area: "DISPATCHER",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Base de datos CREADA e inicializada correctamente",
        admin: { email: "admin", pass: "admin123" },
        status: "created"
      });
    }

    return NextResponse.json({ 
      message: "Base de datos ya está lista", 
      status: "ready" 
    });

  } catch (error: any) {
    console.error("Error fatal en init:", error);
    return NextResponse.json({ 
      error: "Error al fabricar las tablas", 
      details: error.message,
      sql_error: true 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
