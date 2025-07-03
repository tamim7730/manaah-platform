import { NextResponse } from "next/server"
import { monitoring } from "@/lib/monitoring"
import { withAuth } from "@/lib/middleware"

export const GET = withAuth(
  async (req) => {
    try {
      // التحقق من صلاحية المدير
      if (req.user?.role !== "admin") {
        return NextResponse.json({ success: false, error: "غير مصرح لك بالوصول" }, { status: 403 })
      }

      const metrics = monitoring.getMetrics()

      return NextResponse.json({
        success: true,
        data: metrics,
      })
    } catch (error) {
      console.error("Error fetching metrics:", error)
      return NextResponse.json({ success: false, error: "خطأ في جلب الإحصائيات" }, { status: 500 })
    }
  },
  ["admin"],
)
