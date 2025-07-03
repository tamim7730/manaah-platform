import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "./auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number
    username: string
    role: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>, requiredRoles: string[] = []) {
  return async (req: AuthenticatedRequest, context?: any): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization")
      const token = AuthService.extractTokenFromHeader(authHeader || "")

      if (!token) {
        return NextResponse.json({ success: false, error: "رمز المصادقة مطلوب" }, { status: 401 })
      }

      const payload = AuthService.verifyToken(token)
      if (!payload) {
        return NextResponse.json({ success: false, error: "رمز المصادقة غير صالح" }, { status: 401 })
      }

      // التحقق من الصلاحيات المطلوبة
      if (requiredRoles.length > 0 && !AuthService.hasPermission(payload.role, requiredRoles)) {
        return NextResponse.json({ success: false, error: "ليس لديك صلاحية للوصول إلى هذا المورد" }, { status: 403 })
      }

      // إضافة معلومات المستخدم إلى الطلب
      req.user = payload

      return handler(req, context)
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ success: false, error: "خطأ في المصادقة" }, { status: 500 })
    }
  }
}

export function adminOnly(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return withAuth(handler, ["admin"])
}

export function dataEntryOrAdmin(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return withAuth(handler, ["admin", "data_entry"])
}
