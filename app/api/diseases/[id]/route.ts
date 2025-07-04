import { NextRequest, NextResponse } from "next/server"
import { Database, QueryBuilder } from "@/lib/database"
import { withAuth, dataEntryOrAdmin } from "@/lib/middleware"
import type { Disease } from "@/lib/types"

// جلب مرض محدد
export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const diseaseId = Number.parseInt(params.id)

    if (isNaN(diseaseId)) {
      return NextResponse.json({ success: false, error: "معرف المرض غير صالح" }, { status: 400 })
    }

    const result = await Database.query("SELECT * FROM diseases WHERE id = $1", [diseaseId]) as { rows: Record<string, unknown>[] }

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "المرض غير موجود" }, { status: 404 })
    }

    const row = result.rows[0]
    const disease: Disease = {
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
    }

    return NextResponse.json({
      success: true,
      data: disease,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get disease error:", error)
    return NextResponse.json({ success: false, error: "خطأ في جلب بيانات المرض" }, { status: 500 })
  }
})

// تحديث مرض
export const PUT = dataEntryOrAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const diseaseId = Number.parseInt(params.id)
    const body = await req.json()

    if (isNaN(diseaseId)) {
      return NextResponse.json({ success: false, error: "معرف المرض غير صالح" }, { status: 400 })
    }

    // التحقق من وجود المرض
    const existingDisease = await Database.query("SELECT id FROM diseases WHERE id = $1", [diseaseId])

    if (existingDisease.rows.length === 0) {
      return NextResponse.json({ success: false, error: "المرض غير موجود" }, { status: 404 })
    }

    // إعداد البيانات للتحديث
    const updateData: Record<string, unknown> = {}
    if (body.nameAr) updateData.name_ar = body.nameAr
    if (body.nameEn) updateData.name_en = body.nameEn
    if (body.code) updateData.code = body.code
    if (body.descriptionAr !== undefined) updateData.description_ar = body.descriptionAr
    if (body.descriptionEn !== undefined) updateData.description_en = body.descriptionEn
    if (body.category !== undefined) updateData.category = body.category
    if (body.severityLevel) updateData.severity_level = body.severityLevel
    if (body.isActive !== undefined) updateData.is_active = body.isActive

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "لا توجد بيانات للتحديث" }, { status: 400 })
    }

    const { query, values } = QueryBuilder.buildUpdateQuery(
      "diseases",
      updateData,
      "id = $" + (Object.keys(updateData).length + 1),
      [diseaseId],
    )

    await Database.query(query, values)
    
    // جلب البيانات المحدثة
    const updatedResult = await Database.query("SELECT * FROM diseases WHERE id = $1", [diseaseId]) as { rows: Record<string, unknown>[] }
    const updatedDisease = updatedResult.rows[0]

    const disease: Disease = {
      id: updatedDisease.id,
      nameAr: updatedDisease.name_ar,
      nameEn: updatedDisease.name_en,
      code: updatedDisease.code,
      descriptionAr: updatedDisease.description_ar,
      descriptionEn: updatedDisease.description_en,
      category: updatedDisease.category,
      severityLevel: updatedDisease.severity_level,
      isActive: updatedDisease.is_active,
      createdAt: updatedDisease.created_at,
      updatedAt: updatedDisease.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: disease,
      message: "تم تحديث المرض بنجاح",
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Update disease error:", error)
    return NextResponse.json({ success: false, error: "خطأ في تحديث المرض" }, { status: 500 })
  }
})

// حذف مرض
export const DELETE = dataEntryOrAdmin(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const diseaseId = Number.parseInt(params.id)

    if (isNaN(diseaseId)) {
      return NextResponse.json({ success: false, error: "معرف المرض غير صالح" }, { status: 400 })
    }

    // التحقق من وجود مسوحات مرتبطة بهذا المرض
    const relatedSurveys = await Database.query("SELECT COUNT(*) FROM surveys WHERE disease_id = $1", [diseaseId])

    if (Number.parseInt(relatedSurveys.rows[0].count) > 0) {
      return NextResponse.json({ success: false, error: "لا يمكن حذف المرض لوجود مسوحات مرتبطة به" }, { status: 409 })
    }

    const result = await Database.query("DELETE FROM diseases WHERE id = $1 RETURNING id", [diseaseId])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "المرض غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف المرض بنجاح",
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Delete disease error:", error)
    return NextResponse.json({ success: false, error: "خطأ في حذف المرض" }, { status: 500 })
  }
})
