"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Download, Eye } from "lucide-react"
import { MapModal } from "@/components/map-modal"

// بيانات المناطق السعودية مع مسارات الخرائط الصحيحة
const saudiRegionsWithMaps = [
  {
    id: 1,
    nameAr: "منطقة الرياض",
    nameEn: "Riyadh Region",
    code: "RD",
    population: 8000000,
    riskLevel: "medium",
    mapPath: "/المملكة والمناطق/منطقة الرياض.svg",
    governorates: 20,
    area: "412,000 كم²",
    capital: "الرياض"
  },
  {
    id: 2,
    nameAr: "منطقة مكة المكرمة",
    nameEn: "Makkah Region",
    code: "MK",
    population: 8557766,
    riskLevel: "high",
    mapPath: "/المملكة والمناطق/مكة المكرمة.svg",
    governorates: 23,
    area: "164,000 كم²",
    capital: "مكة المكرمة"
  },
  {
    id: 3,
    nameAr: "المنطقة الشرقية",
    nameEn: "Eastern Province",
    code: "EP",
    population: 5068752,
    riskLevel: "low",
    mapPath: "/المملكة والمناطق/المنطقة الشرقية.svg",
    governorates: 14,
    area: "540,000 كم²",
    capital: "الدمام"
  },
  {
    id: 4,
    nameAr: "منطقة المدينة المنورة",
    nameEn: "Madinah Region",
    code: "MD",
    population: 2132679,
    riskLevel: "medium",
    mapPath: "/المملكة والمناطق/المدينة المنورة.svg",
    governorates: 9,
    area: "151,990 كم²",
    capital: "المدينة المنورة"
  },
  {
    id: 5,
    nameAr: "منطقة القصيم",
    nameEn: "Qassim Region",
    code: "QS",
    population: 1370727,
    riskLevel: "low",
    mapPath: "/المملكة والمناطق/القصيم.svg",
    governorates: 13,
    area: "65,000 كم²",
    capital: "بريدة"
  },
  {
    id: 6,
    nameAr: "منطقة حائل",
    nameEn: "Hail Region",
    code: "HL",
    population: 731147,
    riskLevel: "low",
    mapPath: "/المملكة والمناطق/حائل.svg",
    governorates: 8,
    area: "103,887 كم²",
    capital: "حائل"
  },
  {
    id: 7,
    nameAr: "منطقة تبوك",
    nameEn: "Tabuk Region",
    code: "TB",
    population: 910030,
    riskLevel: "medium",
    mapPath: "/المملكة والمناطق/تبوك.svg",
    governorates: 7,
    area: "146,072 كم²",
    capital: "تبوك"
  },
  {
    id: 8,
    nameAr: "الحدود الشمالية",
    nameEn: "Northern Borders Region",
    code: "NB",
    population: 375913,
    riskLevel: "low",
    mapPath: "/المملكة والمناطق/الحدود الشمالية.svg",
    governorates: 3,
    area: "104,000 كم²",
    capital: "عرعر"
  },
  {
    id: 9,
    nameAr: "منطقة جازان",
    nameEn: "Jazan Region",
    code: "JZ",
    population: 1567547,
    riskLevel: "high",
    mapPath: "/المملكة والمناطق/منطقة جازان.svg",
    governorates: 17,
    area: "11,671 كم²",
    capital: "جازان"
  },
  {
    id: 10,
    nameAr: "منطقة نجران",
    nameEn: "Najran Region",
    code: "NJ",
    population: 603253,
    riskLevel: "medium",
    mapPath: "/المملكة والمناطق/نجران.svg",
    governorates: 7,
    area: "119,000 كم²",
    capital: "نجران"
  },
  {
    id: 11,
    nameAr: "منطقة الباحة",
    nameEn: "Al Bahah Region",
    code: "BH",
    population: 476172,
    riskLevel: "low",
    mapPath: "/المملكة والمناطق/الباحة.svg",
    governorates: 9,
    area: "9,921 كم²",
    capital: "الباحة"
  },
  {
    id: 12,
    nameAr: "منطقة عسير",
    nameEn: "Asir Region",
    code: "AS",
    population: 2211875,
    riskLevel: "medium",
    mapPath: "/المملكة والمناطق/عسير.svg",
    governorates: 15,
    area: "76,693 كم²",
    capital: "أبها"
  },
  {
    id: 13,
    nameAr: "منطقة الجوف",
    nameEn: "Al Jouf Region",
    code: "JF",
    population: 518458,
    riskLevel: "low",
    mapPath: "/المملكة والمناطق/الجوف.svg",
    governorates: 4,
    area: "85,000 كم²",
    capital: "سكاكا"
  },
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

interface SaudiRegionsMapProps {
  onRegionClick?: (region: any) => void
  className?: string
}

export function SaudiRegionsMap({ onRegionClick, className }: SaudiRegionsMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<any>(null)

  const handleRegionClick = (region: any) => {
    setSelectedRegion(region)
    onRegionClick?.(region)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          خرائط مناطق المملكة العربية السعودية
        </CardTitle>
        {selectedRegion && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">المنطقة المحددة:</span>
            <Badge variant="secondary">{selectedRegion.nameAr}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* خريطة المملكة الكاملة */}
          <div className="text-center">
            <MapModal
              mapName="خريطة المملكة الكاملة"
              mapPath="/المملكة والمناطق/خريطة المملكة.svg"
              title="خريطة المملكة العربية السعودية"
              description="الخريطة الكاملة للمملكة العربية السعودية"
              triggerText="عرض خريطة المملكة الكاملة"
              variant="default"
              size="lg"
            />
          </div>

          {/* شبكة المناطق */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {saudiRegionsWithMaps.map((region) => (
              <div
                key={region.id}
                onClick={() => handleRegionClick(region)}
                className={`
                  group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 
                  hover:scale-105 hover:shadow-xl hover:shadow-blue-100
                  ${selectedRegion?.id === region.id ? "ring-2 ring-primary shadow-lg" : ""}
                `}
                style={{
                  backgroundColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS] + "15",
                  borderColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS] + "80",
                }}
              >
                {/* رأس البطاقة */}
                <div className="text-center mb-3">
                  <h3 className="font-bold text-lg mb-1 text-gray-800">{region.nameAr}</h3>
                  <p className="text-sm text-gray-600 mb-2">{region.nameEn}</p>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium"
                    style={{
                      borderColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
                      color: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
                      backgroundColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS] + "20",
                    }}
                  >
                    {RISK_LABELS[region.riskLevel as keyof typeof RISK_LABELS]}
                  </Badge>
                </div>

                {/* معلومات المنطقة */}
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">العاصمة:</span>
                    <span>{region.capital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">السكان:</span>
                    <span>{(region.population / 1000000).toFixed(1)}م نسمة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">المحافظات:</span>
                    <span>{region.governorates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">المساحة:</span>
                    <span>{region.area}</span>
                  </div>
                </div>

                {/* أزرار العمل */}
                <div className="flex gap-2">
                  <MapModal
                    mapName={region.nameAr}
                    mapPath={region.mapPath}
                    title={`خريطة ${region.nameAr}`}
                    description={`خريطة تفصيلية لـ${region.nameAr} ومحافظاتها`}
                    triggerText="عرض الخريطة"
                    variant="secondary"
                    size="sm"
                  />
                </div>

                {/* مؤشر التحديد */}
                {selectedRegion?.id === region.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* معلومات المنطقة المحددة */}
          {selectedRegion && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-xl text-blue-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                معلومات تفصيلية عن {selectedRegion.nameAr}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">الاسم العربي:</span>
                  <p className="text-blue-900 font-medium">{selectedRegion.nameAr}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">الاسم الإنجليزي:</span>
                  <p className="text-blue-900 font-medium">{selectedRegion.nameEn}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">عدد السكان:</span>
                  <p className="text-blue-900 font-medium">{selectedRegion.population.toLocaleString("ar-SA")} نسمة</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">مستوى الخطر:</span>
                  <Badge
                    variant="outline"
                    className="font-medium"
                    style={{
                      borderColor: RISK_COLORS[selectedRegion.riskLevel as keyof typeof RISK_COLORS],
                      color: RISK_COLORS[selectedRegion.riskLevel as keyof typeof RISK_COLORS],
                      backgroundColor: RISK_COLORS[selectedRegion.riskLevel as keyof typeof RISK_COLORS] + "20",
                    }}
                  >
                    {RISK_LABELS[selectedRegion.riskLevel as keyof typeof RISK_LABELS]}
                  </Badge>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">العاصمة:</span>
                  <p className="text-blue-900 font-medium">{selectedRegion.capital}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">المساحة:</span>
                  <p className="text-blue-900 font-medium">{selectedRegion.area}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">عدد المحافظات:</span>
                  <p className="text-blue-900 font-medium">{selectedRegion.governorates} محافظة</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-blue-700 font-semibold block mb-1">الكثافة السكانية:</span>
                  <p className="text-blue-900 font-medium">
                    {Math.round(selectedRegion.population / parseInt(selectedRegion.area.replace(/[^0-9]/g, "")))} نسمة/كم²
                  </p>
                </div>
              </div>
              
              {/* زر عرض الخريطة التفصيلية */}
              <div className="mt-4 text-center">
                <MapModal
                  mapName={selectedRegion.nameAr}
                  mapPath={selectedRegion.mapPath}
                  title={`خريطة ${selectedRegion.nameAr}`}
                  description={`خريطة تفصيلية لـ${selectedRegion.nameAr} ومحافظاتها`}
                  triggerText={`عرض خريطة ${selectedRegion.nameAr} التفصيلية`}
                  variant="default"
                  size="lg"
                />
              </div>
            </div>
          )}

          {/* مفتاح الخريطة */}
          <div className="flex items-center justify-center gap-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
            <span className="text-sm font-bold text-gray-700">مستوى الخطر:</span>
            {Object.entries(RISK_COLORS).map(([level, color]) => (
              <div key={level} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                  style={{ backgroundColor: color }} 
                />
                <span className="text-sm font-medium text-gray-700">
                  {RISK_LABELS[level as keyof typeof RISK_LABELS]}
                </span>
              </div>
            ))}
          </div>

          {/* خرائط إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MapModal
              mapName="المملكة بالمحافظات"
              mapPath="/المملكة والمناطق/المملكة بالمحافظات.svg"
              title="خريطة المملكة بالمحافظات"
              description="خريطة المملكة العربية السعودية مع تفاصيل جميع المحافظات"
              triggerText="عرض خريطة المملكة بالمحافظات"
              variant="outline"
              size="default"
            />
            <MapModal
              mapName="حدود المناطق"
              mapPath="/المملكة والمناطق/حدود المناطق.svg"
              title="خريطة حدود المناطق"
              description="خريطة توضح الحدود الإدارية لجميع مناطق المملكة"
              triggerText="عرض خريطة حدود المناطق"
              variant="outline"
              size="default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SaudiRegionsMap