"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// بيانات المناطق السعودية
const saudiRegions = [
  { id: 1, nameAr: "منطقة الرياض", nameEn: "Riyadh Region", code: "RD", population: 8000000, riskLevel: "medium" },
  { id: 2, nameAr: "منطقة مكة المكرمة", nameEn: "Makkah Region", code: "MK", population: 8557766, riskLevel: "high" },
  { id: 3, nameAr: "المنطقة الشرقية", nameEn: "Eastern Province", code: "EP", population: 5068752, riskLevel: "low" },
  {
    id: 4,
    nameAr: "منطقة المدينة المنورة",
    nameEn: "Madinah Region",
    code: "MD",
    population: 2132679,
    riskLevel: "medium",
  },
  { id: 5, nameAr: "منطقة القصيم", nameEn: "Qassim Region", code: "QS", population: 1370727, riskLevel: "low" },
  { id: 6, nameAr: "منطقة حائل", nameEn: "Hail Region", code: "HL", population: 731147, riskLevel: "low" },
  { id: 7, nameAr: "منطقة تبوك", nameEn: "Tabuk Region", code: "TB", population: 910030, riskLevel: "medium" },
  { id: 8, nameAr: "المنطقة الشمالية", nameEn: "Northern Borders", code: "NB", population: 375913, riskLevel: "low" },
  { id: 9, nameAr: "منطقة جازان", nameEn: "Jazan Region", code: "JZ", population: 1567547, riskLevel: "high" },
  { id: 10, nameAr: "منطقة نجران", nameEn: "Najran Region", code: "NJ", population: 603253, riskLevel: "medium" },
  { id: 11, nameAr: "منطقة الباحة", nameEn: "Al Bahah Region", code: "BH", population: 476172, riskLevel: "low" },
  { id: 12, nameAr: "منطقة عسير", nameEn: "Asir Region", code: "AS", population: 2211875, riskLevel: "medium" },
  { id: 13, nameAr: "منطقة الجوف", nameEn: "Al Jouf Region", code: "JF", population: 518458, riskLevel: "low" },
]

// تعريف الألوان حسب مستوى الخطر
const RISK_COLORS = {
  low: "#22c55e", // أخضر
  medium: "#eab308", // أصفر
  high: "#f97316", // برتقالي
  critical: "#ef4444", // أحمر
}

const RISK_LABELS = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
  critical: "حرج",
}

interface InteractiveMapProps {
  onRegionClick?: (region: Record<string, unknown>) => void
  className?: string
}

export function InteractiveMap({ onRegionClick, className }: InteractiveMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<Record<string, unknown> | null>(null)

  const handleRegionClick = (region: Record<string, unknown>) => {
    setSelectedRegion(region)
    onRegionClick?.(region)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>الخريطة التفاعلية للمملكة</CardTitle>
        {selectedRegion && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">المنطقة المحددة:</span>
            <Badge variant="secondary">{selectedRegion.nameAr}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* خريطة تفاعلية مبسطة */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg min-h-[400px]">
            {saudiRegions.map((region) => (
              <div
                key={region.id}
                onClick={() => handleRegionClick(region)}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg
                  ${selectedRegion?.id === region.id ? "ring-2 ring-primary" : ""}
                `}
                style={{
                  backgroundColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS] + "20",
                  borderColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
                }}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-sm mb-1">{region.nameAr}</h3>
                  <p className="text-xs text-gray-600 mb-2">{region.code}</p>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
                      color: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
                    }}
                  >
                    {RISK_LABELS[region.riskLevel as keyof typeof RISK_LABELS]}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{(region.population / 1000000).toFixed(1)}م نسمة</p>
                </div>
              </div>
            ))}
          </div>

          {/* معلومات المنطقة المحددة */}
          {selectedRegion && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">معلومات المنطقة</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">الاسم العربي:</span>
                  <p className="text-blue-800">{selectedRegion.nameAr}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">الاسم الإنجليزي:</span>
                  <p className="text-blue-800">{selectedRegion.nameEn}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">عدد السكان:</span>
                  <p className="text-blue-800">{selectedRegion.population.toLocaleString("ar-SA")} نسمة</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">مستوى الخطر:</span>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: RISK_COLORS[selectedRegion.riskLevel as keyof typeof RISK_COLORS],
                      color: RISK_COLORS[selectedRegion.riskLevel as keyof typeof RISK_COLORS],
                    }}
                  >
                    {RISK_LABELS[selectedRegion.riskLevel as keyof typeof RISK_LABELS]}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* مفتاح الخريطة */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">مستوى الخطر:</span>
            {Object.entries(RISK_COLORS).map(([level, color]) => (
              <div key={level} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: color }} />
                <span className="text-xs">{RISK_LABELS[level as keyof typeof RISK_LABELS]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
