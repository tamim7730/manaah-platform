import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { User } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: number
  username: string
  role: string
}

export class AuthService {
  // تشفير كلمة المرور
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // التحقق من كلمة المرور
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // إنشاء JWT token
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    }

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "manaah-platform",
      audience: "manaah-users",
    } as jwt.SignOptions)
  }

  // التحقق من JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: "manaah-platform",
        audience: "manaah-users",
      }) as JWTPayload

      return decoded
    } catch (error) {
      return null
    }
  }

  // استخراج token من header
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }
    return authHeader.substring(7)
  }

  // التحقق من الصلاحيات
  static hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole)
  }

  // التحقق من صلاحية admin
  static isAdmin(userRole: string): boolean {
    return userRole === "admin"
  }

  // التحقق من صلاحية إدخال البيانات
  static canEditData(userRole: string): boolean {
    return ["admin", "data_entry"].includes(userRole)
  }
}
