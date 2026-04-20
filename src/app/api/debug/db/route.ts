import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Debug: Probando conexión a DB...");
    
    // Test simple query
    const result = await db.$queryRaw`SELECT 1 as connected`;
    
    return NextResponse.json({
      status: "connected",
      result,
      env: {
        has_db_url: !!process.env.DATABASE_URL,
        db_url_length: process.env.DATABASE_URL?.length,
      }
    });
  } catch (error: any) {
    console.error("Debug Error:", error);
    return NextResponse.json({
      status: "error",
      message: error.message,
      code: error.code,
      meta: error.meta,
    }, { status: 500 });
  }
}
