import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals"
import { Database } from "@/lib/database"

describe("Diseases API Tests", () => {
  let testDiseaseId: number

  beforeAll(async () => {
    // إعداد جداول الاختبار
    await Database.query(`
      CREATE TABLE IF NOT EXISTS test_diseases (
        id SERIAL PRIMARY KEY,
        name_ar VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description_ar TEXT,
        description_en TEXT,
        category VARCHAR(50),
        severity_level VARCHAR(20) DEFAULT 'medium',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  })

  afterAll(async () => {
    await Database.query("DROP TABLE IF EXISTS test_diseases")
    await Database.close()
  })

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await Database.query("DELETE FROM test_diseases")
  })

  describe("Disease CRUD Operations", () => {
    it("should create a new disease", async () => {
      const diseaseData = {
        name_ar: "حمى الاختبار",
        name_en: "Test Fever",
        code: "TEST",
        description_ar: "مرض للاختبار",
        category: "Viral",
        severity_level: "medium",
      }

      const result = await Database.query(
        `
        INSERT INTO test_diseases (name_ar, name_en, code, description_ar, category, severity_level)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [
          diseaseData.name_ar,
          diseaseData.name_en,
          diseaseData.code,
          diseaseData.description_ar,
          diseaseData.category,
          diseaseData.severity_level,
        ],
      ) as { rows: Record<string, unknown>[] }

      const disease = result.rows[0]
      testDiseaseId = disease.id

      expect(disease).toBeDefined()
      expect(disease.name_ar).toBe(diseaseData.name_ar)
      expect(disease.name_en).toBe(diseaseData.name_en)
      expect(disease.code).toBe(diseaseData.code)
      expect(disease.is_active).toBe(true)
    })

    it("should retrieve disease by ID", async () => {
      // إنشاء مرض للاختبار
      const createResult = await Database.query(`
        INSERT INTO test_diseases (name_ar, name_en, code)
        VALUES ('حمى الاختبار', 'Test Fever', 'TEST')
        RETURNING id
      `) as { rows: Record<string, unknown>[] }
      const diseaseId = createResult.rows[0].id

      // جلب المرض
      const result = await Database.query("SELECT * FROM test_diseases WHERE id = $1", [diseaseId]) as { rows: Record<string, unknown>[] }

      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].id).toBe(diseaseId)
      expect(result.rows[0].name_ar).toBe("حمى الاختبار")
    })

    it("should update disease", async () => {
      // إنشاء مرض للاختبار
      const createResult = await Database.query(`
        INSERT INTO test_diseases (name_ar, name_en, code)
        VALUES ('حمى الاختبار', 'Test Fever', 'TEST')
        RETURNING id
      `) as { rows: Record<string, unknown>[] }
      const diseaseId = createResult.rows[0].id

      // تحديث المرض
      const updateResult = await Database.query(
        `
        UPDATE test_diseases 
        SET name_ar = $1, severity_level = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `,
        ["حمى الاختبار المحدثة", "high", diseaseId],
      ) as { rows: Record<string, unknown>[] }

      const updatedDisease = updateResult.rows[0]
      expect(updatedDisease.name_ar).toBe("حمى الاختبار المحدثة")
      expect(updatedDisease.severity_level).toBe("high")
    })

    it("should delete disease", async () => {
      // إنشاء مرض للاختبار
      const createResult = await Database.query(`
        INSERT INTO test_diseases (name_ar, name_en, code)
        VALUES ('حمى الاختبار', 'Test Fever', 'TEST')
        RETURNING id
      `) as { rows: Record<string, unknown>[] }
      const diseaseId = createResult.rows[0].id

      // حذف المرض
      const deleteResult = await Database.query("DELETE FROM test_diseases WHERE id = $1 RETURNING id", [diseaseId]) as { rows: Record<string, unknown>[] }

      expect(deleteResult.rows).toHaveLength(1)
      expect(deleteResult.rows[0].id).toBe(diseaseId)

      // التأكد من الحذف
      const checkResult = await Database.query("SELECT * FROM test_diseases WHERE id = $1", [diseaseId]) as { rows: Record<string, unknown>[] }
      expect(checkResult.rows).toHaveLength(0)
    })
  })

  describe("Disease Validation", () => {
    it("should enforce unique code constraint", async () => {
      // إنشاء مرض أول
      await Database.query(`
        INSERT INTO test_diseases (name_ar, name_en, code)
        VALUES ('حمى الاختبار 1', 'Test Fever 1', 'TEST')
      `)

      // محاولة إنشاء مرض بنفس الرمز
      await expect(
        Database.query(`
          INSERT INTO test_diseases (name_ar, name_en, code)
          VALUES ('حمى الاختبار 2', 'Test Fever 2', 'TEST')
        `),
      ).rejects.toThrow()
    })

    it("should validate severity levels", async () => {
      const validSeverityLevels = ["low", "medium", "high", "critical"]

      for (const level of validSeverityLevels) {
        const result = await Database.query(
          `
          INSERT INTO test_diseases (name_ar, name_en, code, severity_level)
          VALUES ($1, $2, $3, $4)
          RETURNING severity_level
        `,
          [`حمى ${level}`, `${level} Fever`, `${level.toUpperCase()}`, level],
        ) as { rows: Record<string, unknown>[] }

        expect(result.rows[0].severity_level).toBe(level)
      }
    })
  })
})
