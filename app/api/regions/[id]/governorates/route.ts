import { NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { withAuth } from "@/lib/middleware"
import type { Governorate } from "@/lib/types"

// جلب محافظات منطقة معينة
export const GET = withAuth(async (req, { params }: { params: { id: string } }) => {
  try {
    const regionId = Number.parseInt(params.id)
    const { searchParams } = new URL(req.url)
    const includeGeojson = searchParams.get("include_geojson") === "true"
    const epidemicBeltRisk = searchParams.get("epidemic_belt_risk")

    if (isNaN(regionId)) {
      return NextResponse.json({ success: false, error: "معرف المنطقة غير صالح" }, { status: 400 })
    }

    let whereClause = "region_id = $1"
    const queryParams: any[] = [regionId]
    let paramIndex = 2

    if (epidemicBeltRisk) {
      whereClause += ` AND epidemic_belt_risk = $${paramIndex}`
      queryParams.push(epidemicBeltRisk)
      paramIndex++
    }

    const columns = includeGeojson
      ? ["g.*", "r.name_ar as region_name_ar", "r.name_en as region_name_en"]
      : [
          "g.id",
          "g.name_ar",
          "g.name_en",
          "g.code",
          "g.population",
          "g.area_km2",
          "g.epidemic_belt_risk",
          "g.created_at",
          "g.updated_at",
          "r.name_ar as region_name_ar",
          "r.name_en as region_name_en",
        ]

    const query = `
      SELECT ${columns.join(", ")}
      FROM governorates g
      JOIN regions r ON g.region_id = r.id
      WHERE ${whereClause}
      ORDER BY g.name_ar ASC
    `

    const result = await Database.query(query, queryParams)

    const governorates: Governorate[] = result.rows.map((row: any) => ({
      id: row.id,
      regionId: row.region_id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      code: row.code,
      geojsonData: includeGeojson ? row.geojson_data : undefined,
      population: row.population,
      areaKm2: row.area_km2,
      epidemicBeltRisk: row.epidemic_belt_risk,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      region: {
        id: regionId,
        nameAr: row.region_name_ar,
        nameEn: row.region_name_en,
        code: "",
        createdAt: "",
        updatedAt: "",
      },
    }))

    return NextResponse.json({
      success: true,
      data: governorates,
    })
  } catch (error) {
    console.error("Get governorates error:", error)
    return NextResponse.json({ success: false, error: "خطأ في جلب بيانات المحافظات" }, { status: 500 })
  }
})
