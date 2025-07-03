import { NextResponse } from "next/server"
import { Database, QueryBuilder } from "@/lib/database"
import { withAuth, dataEntryOrAdmin } from "@/lib/middleware"
import type { Region, PaginatedResponse } from "@/lib/types"

// جلب جميع المناطق
export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const includeGeojson = searchParams.get("include_geojson") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const offset = (page - 1) * limit

    const columns = includeGeojson
      ? ["*"]
      : ["id", "name_ar", "name_en", "code", "population", "area_km2", "created_at", "updated_at"]

    // جلب العدد الإجمالي
    const countResult = await Database.query("SELECT COUNT(*) FROM regions")
    const total = Number.parseInt(countResult.rows[0].count)

    // جلب البيانات
    const query = QueryBuilder.buildSelectQuery("regions", columns, undefined, "name_ar ASC", limit, offset)

    const result = await Database.query(query)

    const regions: Region[] = result.rows.map((row: any) => ({
      id: row.id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      code: row.code,
      geojsonData: includeGeojson ? row.geojson_data : undefined,
      population: row.population,
      areaKm2: row.area_km2,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    const response: PaginatedResponse<Region> = {
      success: true,
      data: regions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get regions error:", error)
    return NextResponse.json({ success: false, error: "خطأ في جلب بيانات المناطق" }, { status: 500 })
  }
})

// إضافة منطقة جديدة
export const POST = dataEntryOrAdmin(async (req) => {
  try {
    const body = await req.json()
    const { nameAr, nameEn, code, geojsonData, population, areaKm2 } = body

    if (!nameAr || !nameEn || !code) {
      return NextResponse.json({ success: false, error: "الاسم العربي والإنجليزي والرمز مطلوبة" }, { status: 400 })
    }

    // التحقق من عدم تكرار الرمز
    const existingRegion = await Database.query("SELECT id FROM regions WHERE code = $1", [code])

    if (existingRegion.rows.length > 0) {
      return NextResponse.json({ success: false, error: "رمز المنطقة موجود مسبقاً" }, { status: 409 })
    }

    const regionData = {
      name_ar: nameAr,
      name_en: nameEn,
      code,
      geojson_data: geojsonData ? JSON.stringify(geojsonData) : null,
      population,
      area_km2: areaKm2,
    }

    const { query, values } = QueryBuilder.buildInsertQuery("regions", regionData)
    const result = await Database.query(query, values)

    const newRegion = result.rows[0]
    const region: Region = {
      id: newRegion.id,
      nameAr: newRegion.name_ar,
      nameEn: newRegion.name_en,
      code: newRegion.code,
      geojsonData: newRegion.geojson_data,
      population: newRegion.population,
      areaKm2: newRegion.area_km2,
      createdAt: newRegion.created_at,
      updatedAt: newRegion.updated_at,
    }

    return NextResponse.json({
      success: true,
      data: region,
      message: "تم إضافة المنطقة بنجاح",
    })
  } catch (error) {
    console.error("Create region error:", error)
    return NextResponse.json({ success: false, error: "خطأ في إضافة المنطقة" }, { status: 500 })
  }
})
