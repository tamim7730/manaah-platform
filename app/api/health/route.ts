import { NextResponse } from "next/server"
import { monitoring } from "@/lib/monitoring"

export async function GET() {
  try {
    const health = await monitoring.healthCheck()

    const statusCode = health.status === "healthy" ? 200 : health.status === "warning" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: "critical",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
