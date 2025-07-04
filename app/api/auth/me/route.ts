import { NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { withAuth } from "@/lib/middleware"

export const GET = withAuth(async (req) => {
  try {
    const userId = req.user?.userId

    const result = await Database.query(
      "SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = $1",
      [userId],
    ) as { rows: Record<string, unknown>[] }

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "المستخدم غير موجود" }, { status: 404 })
    }

    const user = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get user profile error:", error)
    return NextResponse.json({ success: false, error: "خطأ في الخادم" }, { status: 500 })
  }
})
