import { describe, it, expect, beforeAll, afterAll } from "@jest/globals"
import { Database } from "@/lib/database"
import { AuthService } from "@/lib/auth"

describe("Authentication API Tests", () => {
  beforeAll(async () => {
    // إعداد قاعدة البيانات للاختبار
    await Database.query(`
      CREATE TABLE IF NOT EXISTS test_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'viewer',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  })

  afterAll(async () => {
    // تنظيف قاعدة البيانات
    await Database.query("DROP TABLE IF EXISTS test_users")
    await Database.close()
  })

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "testPassword123"
      const hashedPassword = await AuthService.hashPassword(password)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
    })

    it("should verify password correctly", async () => {
      const password = "testPassword123"
      const hashedPassword = await AuthService.hashPassword(password)

      const isValid = await AuthService.verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)

      const isInvalid = await AuthService.verifyPassword("wrongPassword", hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe("JWT Token Management", () => {
    const testUser = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      fullName: "Test User",
      role: "admin" as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    it("should generate JWT token", () => {
      const token = AuthService.generateToken(testUser)

      expect(token).toBeDefined()
      expect(typeof token).toBe("string")
      expect(token.split(".")).toHaveLength(3) // JWT has 3 parts
    })

    it("should verify JWT token", () => {
      const token = AuthService.generateToken(testUser)
      const payload = AuthService.verifyToken(token)

      expect(payload).toBeDefined()
      expect(payload?.userId).toBe(testUser.id)
      expect(payload?.username).toBe(testUser.username)
      expect(payload?.role).toBe(testUser.role)
    })

    it("should reject invalid JWT token", () => {
      const invalidToken = "invalid.jwt.token"
      const payload = AuthService.verifyToken(invalidToken)

      expect(payload).toBeNull()
    })
  })

  describe("Permission Checks", () => {
    it("should check admin permissions", () => {
      expect(AuthService.isAdmin("admin")).toBe(true)
      expect(AuthService.isAdmin("data_entry")).toBe(false)
      expect(AuthService.isAdmin("viewer")).toBe(false)
    })

    it("should check data editing permissions", () => {
      expect(AuthService.canEditData("admin")).toBe(true)
      expect(AuthService.canEditData("data_entry")).toBe(true)
      expect(AuthService.canEditData("viewer")).toBe(false)
    })

    it("should check role-based permissions", () => {
      expect(AuthService.hasPermission("admin", ["admin"])).toBe(true)
      expect(AuthService.hasPermission("admin", ["admin", "data_entry"])).toBe(true)
      expect(AuthService.hasPermission("data_entry", ["admin"])).toBe(false)
      expect(AuthService.hasPermission("viewer", ["admin", "data_entry"])).toBe(false)
    })
  })
})
