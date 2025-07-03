import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { AuthService } from "@/lib/auth"
import type { LoginRequest, AuthResponse, User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    // التحقق من صحة البيانات المدخلة
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "اسم المستخدم وكلمة المرور مطلوبان" }, { status: 400 })
    }

    // البحث عن المستخدم في قاعدة البيانات
    const result = await Database.query("SELECT * FROM users WHERE username = $1 AND is_active = true", [username])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    const user = result.rows[0]

    // التحقق من كلمة المرور
    const isPasswordValid = await AuthService.verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    // إنشاء JWT token
    const userForToken: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }

    const token = AuthService.generateToken(userForToken)

    // حفظ الجلسة في قاعدة البيانات
    const tokenHash = await AuthService.hashPassword(token)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 أيام

    await Database.query("INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)", [
      user.id,
      tokenHash,
      expiresAt,
    ])

    const response: AuthResponse = {
      success: true,
      user: userForToken,
      token,
      message: "تم تسجيل الدخول بنجاح",
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "خطأ في الخادم" }, { status: 500 })
  }
}
