import { NextResponse } from "next/server"
import { Database, QueryBuilder } from "@/lib/database"
import { withAuth, dataEntryOrAdmin } from "@/lib/middleware"
import type { Survey, PaginatedResponse } from "@/lib/types"

// جلب جميع المسوحات مع إمكانية التصفية
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const diseaseId = searchParams.get("disease_id")
    const governorateId = searchParams.get("governorate_id")
    const status = searchParams.get("status")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    const offset = (page - 1) * limit

    let whereClause = ""
    const queryParams: any[] = []
    let paramIndex = 1

    if (diseaseId) {
      whereClause += `s.disease_id = $${paramIndex}`
      queryParams.push(Number.parseInt(diseaseId))
      paramIndex++
    }

    if (governorateId) {
      if (whereClause) whereClause += " AND "
      whereClause += `s.governorate_id = $${paramIndex}`
      queryParams.push(Number.parseInt(governorateId))
      paramIndex++
    }

    if (status) {
      if (whereClause) whereClause += " AND "
      whereClause += `s.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    if (dateFrom) {
      if (whereClause) whereClause += " AND "
      whereClause += `s.survey_date >= $${paramIndex}`
      queryParams.push(dateFrom)
      paramIndex++
    }

    if (dateTo) {
      if (whereClause) whereClause += " AND "
      whereClause += `s.survey_date <= $${paramIndex}`
      queryParams.push(dateTo)
      paramIndex++
    }

    // جلب العدد الإجمالي
    const countQuery = `
      SELECT COUNT(*) 
      FROM surveys s
      ${whereClause ? `WHERE ${whereClause}` : ""}
    `
    const countResult = await Database.query(countQuery, queryParams)
    const total = Number.parseInt(countResult.rows[0].count)

    // جلب البيانات مع معلومات المرض والمحافظة
    const dataQuery = `
      SELECT 
        s.*,
        d.name_ar as disease_name_ar,
        d.name_en as disease_name_en,
        d.code as disease_code,
        g.name_ar as governorate_name_ar,
        g.name_en as governorate_name_en,
        g.code as governorate_code,
        r.name_ar as region_name_ar,
        r.name_en as region_name_en
      FROM surveys s
      JOIN diseases d ON s.disease_id = d.id
      JOIN governorates g ON s.governorate_id = g.id
      JOIN regions r ON g.region_id = r.id
      ${whereClause ? `WHERE ${whereClause}` : ""}
      ORDER BY s.survey_date DESC, s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const result = await Database.query(dataQuery, queryParams)

    const surveys: Survey[] = result.rows.map((row: any) => ({
      id: row.id,
      diseaseId: row.disease_id,
      governorateId: row.governorate_id,
      surveyDate: row.survey_date,
      surveyType: row.survey_type,
      status: row.status,
      totalSamples: row.total_samples,
      positiveSamples: row.positive_samples,
      notes: row.notes,
      conductedBy: row.conducted_by,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      disease: {
        id: row.disease_id,
        nameAr: row.disease_name_ar,
        nameEn: row.disease_name_en,
        code: row.disease_code,
        severityLevel: "medium",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
      governorate: {
        id: row.governorate_id,
        regionId: 0,
        nameAr: row.governorate_name_ar,
        nameEn: row.governorate_name_en,
        code: row.governorate_code,
        epidemicBeltRisk: "low",
        createdAt: "",
        updatedAt: "",
      },
    }))

    const response: PaginatedResponse<Survey> = {
      success: true,
      data: surveys,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get surveys error:", error)
    return NextResponse.json({ success: false, error: "خطأ في جلب بيانات المسوحات" }, { status: 500 })
  }
})

// إضافة مسح جديد
export const POST = dataEntryOrAdmin(async (req) => {
  try {
    const body = await req.json()
    const {
      diseaseId,
      governorateId,
      surveyDate,
      surveyType,
      status,
      totalSamples,
      positiveSamples,
      notes,
      conductedBy,
    } = body

    // التحقق من صحة البيانات المطلوبة
    if (!diseaseId || !governorateId || !surveyDate || !surveyType) {
      return NextResponse.json(
        { success: false, error: "المرض والمحافظة وتاريخ المسح ونوع المسح مطلوبة" },
        { status: 400 },
      )
    }

    // التحقق من وجود المرض والمحافظة
    const diseaseExists = await Database.query("SELECT id FROM diseases WHERE id = $1", [diseaseId])
    const governorateExists = await Database.query("SELECT id FROM governorates WHERE id = $1", [governorateId])

    if (diseaseExists.rows.length === 0) {
      return NextResponse.json({ success: false, error: "المرض المحدد غير موجود" }, { status: 404 })
    }

    if (governorateExists.rows.length === 0) {
      return NextResponse.json({ success: false, error: "المحافظة المحددة غير موجودة" }, { status: 404 })
    }

    const surveyData = {
      disease_id: diseaseId,
      governorate_id: governorateId,
      survey_date: surveyDate,
      survey_type: surveyType,
      status: status || "planned",
      total_samples: totalSamples || 0,
      positive_samples: positiveSamples || 0,
      notes,
      conducted_by: conductedBy,
      created_by: req.user?.userId,
    }

    const { query, values } = QueryBuilder.buildInsertQuery("surveys", surveyData)
    const result = await Database.query(query, values)

    const newSurvey = result.rows[0]
    const survey: Survey = {
      id: newSurvey.id,
      diseaseId: newSurvey.disease_id,
      governorateId: newSurvey.governorate_id,
      surveyDate: newSurvey.survey_date,
      surveyType: newSurvey.survey_type,
      status: newSurvey.status,
      totalSamples: newSurvey.total_samples,
      positiveSamples: newSurvey.positive_samples,
      notes: newSurvey.notes,
      conductedBy: newSurvey.conducted_by,
      createdBy: newSurvey.created_by,
      createdAt: newSurvey.created_at,
      updatedAt: newSurvey.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: survey,
      message: "تم إضافة المسح بنجاح",
    })
  } catch (error) {
    console.error("Create survey error:", error)
    return NextResponse.json({ success: false, error: "خطأ في إضافة المسح" }, { status: 500 })
  }
})
