"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

// بيانات المناطق السعودية مع الإحداثيات الحقيقية
const saudiRegionsData = [
  {
    id: 1,
    nameAr: "منطقة الرياض",
    nameEn: "Riyadh Region",
    code: "RD",
    population: 8000000,
    riskLevel: "medium",
    center: [24.7136, 46.6753],
    bounds: [
      [23.5, 45.0],
      [26.0, 48.5],
    ],
    governorates: [
      "الرياض",
      "الخرج",
      "الدوادمي",
      "المجمعة",
      "القويعية",
      "وادي الدواسر",
      "الأفلاج",
      "الزلفي",
      "شقراء",
      "حوطة بني تميم",
      "عفيف",
      "السليل",
      "ضرما",
      "المزاحمية",
      "رماح",
      "ثادق",
      "حريملاء",
      "الدرعية",
      "الغاط",
      "مرات",
    ],
  },
  {
    id: 2,
    nameAr: "منطقة مكة المكرمة",
    nameEn: "Makkah Region",
    code: "MK",
    population: 8557766,
    riskLevel: "high",
    center: [21.3891, 39.8579],
    bounds: [
      [19.5, 38.0],
      [25.0, 43.0],
    ],
    governorates: [
      "مكة المكرمة",
      "جدة",
      "الطائف",
      "القنفذة",
      "الليث",
      "رابغ",
      "خليص",
      "الكامل",
      "المويه",
      "ميسان",
      "أضم",
      "الخرمة",
      "رنية",
      "تربة",
      "الجموم",
      "بحرة",
      "الشفا",
      "المندق",
      "العرضيات",
      "بلجرشي",
      "المخواة",
      "قلوة",
      "الباحة",
    ],
  },
  {
    id: 3,
    nameAr: "المنطقة الشرقية",
    nameEn: "Eastern Province",
    code: "EP",
    population: 5068752,
    riskLevel: "low",
    center: [25.3548, 49.5834],
    bounds: [
      [22.0, 47.0],
      [28.5, 52.0],
    ],
    governorates: [
      "الدمام",
      "الأحساء",
      "حفر الباطن",
      "الجبيل",
      "القطيف",
      "الخبر",
      "الظهران",
      "بقيق",
      "رأس تنورة",
      "الخفجي",
      "النعيرية",
      "قرية العليا",
      "العديد",
      "طريف",
    ],
  },
  {
    id: 4,
    nameAr: "منطقة المدينة المنورة",
    nameEn: "Madinah Region",
    code: "MD",
    population: 2132679,
    riskLevel: "medium",
    center: [24.5247, 39.5692],
    bounds: [
      [22.0, 36.0],
      [28.0, 42.0],
    ],
    governorates: ["المدينة المنورة", "ينبع", "العلا", "مهد الذهب", "الحناكية", "بدر", "خيبر", "العيص", "وادي الفرع"],
  },
  {
    id: 5,
    nameAr: "منطقة القصيم",
    nameEn: "Qassim Region",
    code: "QS",
    population: 1370727,
    riskLevel: "low",
    center: [26.3269, 43.975],
    bounds: [
      [25.0, 42.5],
      [27.5, 45.5],
    ],
    governorates: [
      "بريدة",
      "عنيزة",
      "الرس",
      "المذنب",
      "البكيرية",
      "البدائع",
      "الأسياح",
      "النبهانية",
      "عيون الجواء",
      "الشماسية",
      "عقلة الصقور",
      "ضرية",
      "رياض الخبراء",
    ],
  },
  {
    id: 6,
    nameAr: "منطقة حائل",
    nameEn: "Hail Region",
    code: "HL",
    population: 731147,
    riskLevel: "low",
    center: [27.5114, 41.69],
    bounds: [
      [25.5, 39.5],
      [29.5, 44.0],
    ],
    governorates: ["حائل", "بقعاء", "الغزالة", "الشنان", "السليمي", "الحائط", "الشملي", "موقق"],
  },
  {
    id: 7,
    nameAr: "منطقة تبوك",
    nameEn: "Tabuk Region",
    code: "TB",
    population: 910030,
    riskLevel: "medium",
    center: [28.3998, 36.57],
    bounds: [
      [27.0, 34.0],
      [30.0, 39.0],
    ],
    governorates: ["تبوك", "الوجه", "ضباء", "تيماء", "أملج", "حقل", "البدع"],
  },
  {
    id: 8,
    nameAr: "المنطقة الشمالية",
    nameEn: "Northern Borders Region",
    code: "NB",
    population: 375913,
    riskLevel: "low",
    center: [30.9843, 41.0152],
    bounds: [
      [29.5, 38.5],
      [32.5, 44.0],
    ],
    governorates: ["عرعر", "رفحاء", "طريف"],
  },
  {
    id: 9,
    nameAr: "منطقة جازان",
    nameEn: "Jazan Region",
    code: "JZ",
    population: 1567547,
    riskLevel: "high",
    center: [17.3307, 42.6602],
    bounds: [
      [16.0, 41.5],
      [18.5, 44.0],
    ],
    governorates: [
      "جازان",
      "صبيا",
      "أبو عريش",
      "صامطة",
      "بيش",
      "فرسان",
      "العيدابي",
      "الدرب",
      "الحرث",
      "ضمد",
      "الريث",
      "أحد المسارحة",
      "الطوال",
      "فيفا",
      "العارضة",
      "الداير",
      "هروب",
    ],
  },
  {
    id: 10,
    nameAr: "منطقة نجران",
    nameEn: "Najran Region",
    code: "NJ",
    population: 603253,
    riskLevel: "medium",
    center: [17.4924, 44.1277],
    bounds: [
      [16.5, 43.0],
      [19.0, 46.0],
    ],
    governorates: ["نجران", "شرورة", "حبونا", "ثار", "بدر الجنوب", "يدمة", "خباش"],
  },
  {
    id: 11,
    nameAr: "منطقة الباحة",
    nameEn: "Al Bahah Region",
    code: "BH",
    population: 476172,
    riskLevel: "low",
    center: [20.0129, 41.4687],
    bounds: [
      [19.0, 40.5],
      [21.0, 42.5],
    ],
    governorates: ["الباحة", "بلجرشي", "المندق", "المخواة", "قلوة", "العقيق", "الحجرة", "غامد الزناد", "القرى"],
  },
  {
    id: 12,
    nameAr: "منطقة عسير",
    nameEn: "Asir Region",
    code: "AS",
    population: 2211875,
    riskLevel: "medium",
    center: [18.2465, 42.5053],
    bounds: [
      [17.0, 41.0],
      [20.0, 44.5],
    ],
    governorates: [
      "أبها",
      "خميس مشيط",
      "بيشة",
      "النماص",
      "محايل عسير",
      "سراة عبيدة",
      "الأمواه",
      "تثليث",
      "ظهران الجنوب",
      "رجال ألمع",
      "المجاردة",
      "بارق",
      "بلقرن",
      "تنومة",
      "طريب",
    ],
  },
  {
    id: 13,
    nameAr: "منطقة الجوف",
    nameEn: "Al Jouf Region",
    code: "JF",
    population: 518458,
    riskLevel: "low",
    center: [29.7859, 40.2172],
    bounds: [
      [28.5, 38.0],
      [31.5, 42.5],
    ],
    governorates: ["سكاكا", "القريات", "دومة الجندل", "طبرجل"],
  },
]

// تعريف الألوان حسب مستوى الخطر
const RISK_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
}

const RISK_LABELS = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
  critical: "حرج",
}

interface RealInteractiveMapProps {
  onRegionClick?: (region: any) => void
  className?: string
}

export function RealInteractiveMap({ onRegionClick, className }: RealInteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedRegion, setSelectedRegion] = useState<any>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(6)

  useEffect(() => {
    const loadMap = async () => {
      try {
        // تحميل Leaflet بشكل ديناميكي
        const L = (await import("leaflet")).default

        // إضافة CSS للخريطة
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        if (mapRef.current && !mapInstance) {
          // إنشاء الخريطة
          const map = L.map(mapRef.current, {
            center: [24.0, 45.0], // وسط المملكة
            zoom: zoomLevel,
            zoomControl: false,
            attributionControl: false,
          })

          // إضافة طبقة الخريطة الأساسية
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map)

          // إضافة المناطق كدوائر ملونة
          saudiRegionsData.forEach((region) => {
            const circle = L.circle(region.center as [number, number], {
              color: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
              fillColor: RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS],
              fillOpacity: 0.3,
              radius: Math.sqrt(region.population) * 50, // حجم الدائرة حسب عدد السكان
              weight: 3,
            }).addTo(map)

            // إضافة tooltip
            circle.bindTooltip(
              `
              <div style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif;">
                <strong>${region.nameAr}</strong><br/>
                السكان: ${region.population.toLocaleString("ar-SA")}<br/>
                مستوى الخطر: ${RISK_LABELS[region.riskLevel as keyof typeof RISK_LABELS]}
              </div>
            `,
              {
                permanent: false,
                direction: "top",
              },
            )

            // إضافة popup
            circle.bindPopup(`
              <div style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #09764c;">${region.nameAr}</h3>
                <p><strong>الاسم الإنجليزي:</strong> ${region.nameEn}</p>
                <p><strong>الرمز:</strong> ${region.code}</p>
                <p><strong>عدد السكان:</strong> ${region.population.toLocaleString("ar-SA")}</p>
                <p><strong>مستوى الخطر:</strong> 
                  <span style="color: ${RISK_COLORS[region.riskLevel as keyof typeof RISK_COLORS]}; font-weight: bold;">
                    ${RISK_LABELS[region.riskLevel as keyof typeof RISK_LABELS]}
                  </span>
                </p>
                <p><strong>عدد المحافظات:</strong> ${region.governorates.length}</p>
              </div>
            `)

            // إضافة أحداث النقر
            circle.on("click", () => {
              setSelectedRegion(region)
              onRegionClick?.(region)
              map.setView(region.center as [number, number], 8)
            })

            // تأثيرات التمرير
            circle.on("mouseover", () => {
              circle.setStyle({
                weight: 5,
                fillOpacity: 0.5,
              })
            })

            circle.on("mouseout", () => {
              circle.setStyle({
                weight: 3,
                fillOpacity: 0.3,
              })
            })
          })

          // إضافة مفتاح الخريطة
          const legend = new L.Control({ position: "bottomright" })
          legend.onAdd = (): HTMLElement => {
            const div = L.DomUtil.create("div", "legend")
            div.style.cssText = `
              background: white;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              font-family: 'Cairo', sans-serif;
              direction: rtl;
              text-align: right;
            `

            let legendHtml = '<h4 style="margin: 0 0 8px 0; color: #09764c;">مستوى الخطر</h4>'
            Object.entries(RISK_COLORS).forEach(([level, color]) => {
              legendHtml += `
                <div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 16px; height: 16px; background: ${color}; border-radius: 50%; border: 2px solid ${color};"></div>
                  <span style="font-size: 12px;">${RISK_LABELS[level as keyof typeof RISK_LABELS]}</span>
                </div>
              `
            })

            div.innerHTML = legendHtml
            return div
          }
          legend.addTo(map)

          setMapInstance(map)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error loading map:", error)
        setIsLoading(false)
      }
    }

    loadMap()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
        setMapInstance(null)
      }
    }
  }, [])

  const handleZoomIn = () => {
    if (mapInstance) {
      const newZoom = Math.min(zoomLevel + 1, 10)
      setZoomLevel(newZoom)
      mapInstance.setZoom(newZoom)
    }
  }

  const handleZoomOut = () => {
    if (mapInstance) {
      const newZoom = Math.max(zoomLevel - 1, 4)
      setZoomLevel(newZoom)
      mapInstance.setZoom(newZoom)
    }
  }

  const handleReset = () => {
    if (mapInstance) {
      mapInstance.setView([24.0, 45.0], 6)
      setZoomLevel(6)
      setSelectedRegion(null)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              الخريطة التفاعلية للمملكة العربية السعودية
            </CardTitle>
            {selectedRegion && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">المنطقة المحددة:</span>
                <Badge variant="secondary">{selectedRegion.nameAr}</Badge>
              </div>
            )}
          </div>

          {/* أدوات التحكم */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* الخريطة */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} className="w-full h-[500px] rounded-lg border" style={{ direction: "ltr" }} />
          </div>

          {/* معلومات المنطقة المحددة */}
          {selectedRegion && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">معلومات تفصيلية - {selectedRegion.nameAr}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                  <span className="text-blue-700 font-medium">عدد المحافظات:</span>
                  <p className="text-blue-800">{selectedRegion.governorates.length} محافظة</p>
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

              {/* قائمة المحافظات */}
              <div className="mt-4">
                <span className="text-blue-700 font-medium">المحافظات:</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedRegion.governorates.slice(0, 10).map((gov: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {gov}
                    </Badge>
                  ))}
                  {selectedRegion.governorates.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedRegion.governorates.length - 10} أخرى
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">13</div>
              <div className="text-xs text-muted-foreground">منطقة إدارية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {saudiRegionsData.filter((r) => r.riskLevel === "low").length}
              </div>
              <div className="text-xs text-muted-foreground">خطر منخفض</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {saudiRegionsData.filter((r) => r.riskLevel === "medium").length}
              </div>
              <div className="text-xs text-muted-foreground">خطر متوسط</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {saudiRegionsData.filter((r) => r.riskLevel === "high").length}
              </div>
              <div className="text-xs text-muted-foreground">خطر عالي</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
