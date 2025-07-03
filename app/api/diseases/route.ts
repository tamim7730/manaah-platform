import { NextResponse } from "next/server"
import { Database, QueryBuilder } from "@/lib/database"
import { withAuth, dataEntryOrAdmin } from "@/lib/middleware"
import type { Disease, PaginatedResponse } from "@/lib/types"

// جلب جميع الأمراض مع pagination
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const isActive = searchParams.get("active")

    const offset = (page - 1) * limit

    let whereClause = ""
    const queryParams: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += `(name_ar ILIKE $${paramIndex} OR name_en ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (isActive !== null && isActive !== undefined) {
      if (whereClause) whereClause += " AND "
      whereClause += `is_active = $${paramIndex}`
      queryParams.push(isActive === "true")
      paramIndex++
    }

    // جلب العدد الإجمالي
    const countQuery = `SELECT COUNT(*) FROM diseases${whereClause ? ` WHERE ${whereClause}` : ""}`
    const countResult = await Database.query(countQuery, queryParams)
    const total = Number.parseInt(countResult.rows[0].count)

    // جلب البيانات
    const dataQuery = QueryBuilder.buildSelectQuery(
      "diseases",
      ["*"],
      whereClause || undefined,
      "created_at DESC",
      limit,
      offset,
    )

    const result = await Database.query(dataQuery, queryParams)

    const diseases: Disease[] = result.rows.map((row: any) => ({
      id: row.id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      code: row.code,
      descriptionAr: row.description_ar,
      descriptionEn: row.description_en,
      category: row.category,
      severityLevel: row.severity_level,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    const response: PaginatedResponse<Disease> = {
      success: true,
      data: diseases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get diseases error:", error)
    return NextResponse.json({ success: false, error: "خطأ في جلب بيانات الأمراض" }, { status: 500 })
  }
})

// إضافة مرض جديد
export const POST = dataEntryOrAdmin(async (req) => {
  try {
    const body = await req.json()
    const { nameAr, nameEn, code, descriptionAr, descriptionEn, category, severityLevel } = body

    // التحقق من صحة البيانات
    if (!nameAr || !nameEn || !code) {
      return NextResponse.json({ success: false, error: "الاسم العربي والإنجليزي والرمز مطلوبة" }, { status: 400 })
    }

    // التحقق من عدم تكرار الرمز
    const existingDisease = await Database.query("SELECT id FROM diseases WHERE code = $1", [code])

    if (existingDisease.rows.length > 0) {
      return NextResponse.json({ success: false, error: "رمز المرض موجود مسبقاً" }, { status: 409 })
    }

    const diseaseData = {
      name_ar: nameAr,
      name_en: nameEn,
      code,
      description_ar: descriptionAr,
      description_en: descriptionEn,
      category,
      severity_level: severityLevel || "medium",
    }

    const { query, values } = QueryBuilder.buildInsertQuery("diseases", diseaseData)
    const result = await Database.query(query, values)

    const newDisease = result.rows[0]
    const disease: Disease = {
      id: newDisease.id,
      nameAr: newDisease.name_ar,
      nameEn: newDisease.name_en,
      code: newDisease.code,
      descriptionAr: newDisease.description_ar,
      descriptionEn: newDisease.description_en,
      category: newDisease.category,
      severityLevel: newDisease.severity_level,
      isActive: newDisease.is_active,
      createdAt: newDisease.created_at,
      updatedAt: newDisease.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: disease,
      message: "تم إضافة المرض بنجاح",
    })
  } catch (error) {
    console.error("Create disease error:", error)
    return NextResponse.json({ success: false, error: "خطأ في إضافة المرض" }, { status: 500 })
  }
})
