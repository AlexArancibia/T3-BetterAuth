import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check - can be extended to check database connectivity
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}
