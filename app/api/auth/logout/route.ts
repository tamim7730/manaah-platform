import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = AuthService.extractTokenFromHeader(authHeader || "")

    if (token) {
      // حذف الجلسة من قاعدة البيانات
      const tokenHash = await AuthService.hashPassword(token)
      await Database.query("DELETE FROM user_sessions WHERE token_hash = $1", [tokenHash])
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "خطأ في الخادم" }, { status: 500 })
  }
}
