"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/ui/stats-card"
import { DataTable } from "@/components/ui/data-table"
import { Loading } from "@/components/ui/loading"
import { apiClient } from "@/lib/api-client"
import type { Region, Governorate, Survey } from "@/lib/types"
import { ArrowLeft, MapPin, BarChart3, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

const RISK_COLORS = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
}

const RISK_LABELS = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
  critical: "حرج",
}

export default function RegionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const regionId = Number(params.id)

  const [region, setRegion] = useState<Region | null>(null)
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        setLoading(true)

        // جلب بيانات المنطقة والمحافظات والمسوحات
        const [regionsRes, governoratesRes, surveysRes] = await Promise.all([
          apiClient.getRegions({ includeGeojson: false }),
          apiClient.getRegionGovernorates(regionId),
          apiClient.getSurveys({ limit: 50 }),
        ])

        // العثور على المنطقة المحددة
        const foundRegion = regionsRes.data.find((r) => r.id === regionId)
        if (!foundRegion) {
          router.push("/404")
          return
        }

        setRegion(foundRegion)

        if (governoratesRes.success && governoratesRes.data) {
          setGovernorates(governoratesRes.data)
        }

        if (surveysRes.success && surveysRes.data && governoratesRes.data) {
          // تصفية المسوحات للمحافظات التابعة لهذه المنطقة
          const regionGovernorateIds = governoratesRes.data.map((g) => g.id)
          const regionSurveys = surveysRes.data.filter((s) => regionGovernorateIds.includes(s.governorateId))
          setSurveys(regionSurveys)
        }
      } catch (error) {
        console.error("Error fetching region data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (regionId) {
      fetchRegionData()
    }
  }, [regionId, router])

  // تعريف أعمدة جدول المحافظات
  const governoratesColumns: ColumnDef<Governorate>[] = [
    {
      accessorKey: "nameAr",
      header: "اسم المحافظة",
    },
    {
      accessorKey: "code",
      header: "الرمز",
    },
    {
      accessorKey: "population",
      header: "عدد السكان",
      cell: ({ row }) => {
        const population = row.getValue("population") as number
        return population ? population.toLocaleString("ar-SA") : "غير محدد"
      },
    },
    {
      accessorKey: "epidemicBeltRisk",
      header: "مستوى الخطر",
      cell: ({ row }) => {
        const risk = row.getValue("epidemicBeltRisk") as keyof typeof RISK_LABELS
        return <Badge className={RISK_COLORS[risk]}>{RISK_LABELS[risk]}</Badge>
      },
    },
  ]

  // تعريف أعمدة جدول المسوحات
  const surveysColumns: ColumnDef<Survey>[] = [
    {
      accessorKey: "disease.nameAr",
      header: "المرض",
    },
    {
      accessorKey: "governorate.nameAr",
      header: "المحافظة",
    },
    {
      accessorKey: "surveyDate",
      header: "تاريخ المسح",
      cell: ({ row }) => {
        const date = row.getValue("surveyDate") as string
        return <span suppressHydrationWarning>{new Date(date).toLocaleDateString("ar-SA")}</span>
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusLabels = {
          planned: "مخطط",
          in_progress: "قيد التنفيذ",
          completed: "مكتمل",
          cancelled: "ملغي",
        }
        const statusColors = {
          planned: "bg-blue-100 text-blue-800",
          in_progress: "bg-yellow-100 text-yellow-800",
          completed: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        }
        return (
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {statusLabels[status as keyof typeof statusLabels]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "totalSamples",
      header: "إجمالي العينات",
    },
    {
      accessorKey: "positiveSamples",
      header: "العينات الإيجابية",
      cell: ({ row }) => {
        const positive = row.getValue("positiveSamples") as number
        return positive > 0 ? (
          <span className="text-orange-600 font-medium">{positive}</span>
        ) : (
          <span className="text-green-600">0</span>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <Loading text="جاري تحميل بيانات المنطقة..." />
      </div>
    )
  }

  if (!region) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">المنطقة غير موجودة</h2>
            <p className="text-muted-foreground mb-4">لم يتم العثور على المنطقة المطلوبة</p>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedSurveys = surveys.filter((s) => s.status === "completed").length
  const activeSurveys = surveys.filter((s) => s.status === "in_progress").length
  const totalPositiveSamples = surveys.reduce((sum, s) => sum + s.positiveSamples, 0)
  const highRiskGovernorates = governorates.filter((g) => g.epidemicBeltRisk === "high").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">{region.nameAr}</h1>
                <p className="text-sm text-muted-foreground">{region.nameEn}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard title="المحافظات" value={governorates.length} description="محافظة في المنطقة" icon={MapPin} />
          <StatsCard title="المسوحات المكتملة" value={completedSurveys} description="مسح منجز" icon={CheckCircle} />
          <StatsCard title="المسوحات النشطة" value={activeSurveys} description="مسح قيد التنفيذ" icon={BarChart3} />
          <StatsCard
            title="العينات الإيجابية"
            value={totalPositiveSamples}
            description="عينة إيجابية"
            icon={AlertTriangle}
          />
        </div>

        {/* معلومات المنطقة */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>معلومات المنطقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">الاسم العربي</h4>
                <p className="text-muted-foreground">{region.nameAr}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">الاسم الإنجليزي</h4>
                <p className="text-muted-foreground">{region.nameEn}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">الرمز</h4>
                <p className="text-muted-foreground">{region.code}</p>
              </div>
              {region.population && (
                <div>
                  <h4 className="font-semibold mb-2">عدد السكان</h4>
                  <p className="text-muted-foreground">{region.population.toLocaleString("ar-SA")}</p>
                </div>
              )}
              {region.areaKm2 && (
                <div>
                  <h4 className="font-semibold mb-2">المساحة</h4>
                  <p className="text-muted-foreground">{region.areaKm2.toLocaleString("ar-SA")} كم²</p>
                </div>
              )}
              {highRiskGovernorates > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">المحافظات عالية الخطر</h4>
                  <Badge className="bg-orange-100 text-orange-800">{highRiskGovernorates} محافظة</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* التبويبات */}
        <Tabs defaultValue="governorates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="governorates">المحافظات</TabsTrigger>
            <TabsTrigger value="surveys">المسوحات</TabsTrigger>
          </TabsList>

          <TabsContent value="governorates">
            <Card>
              <CardHeader>
                <CardTitle>محافظات {region.nameAr}</CardTitle>
                <CardDescription>
                  قائمة بجميع المحافظات التابعة لمنطقة {region.nameAr} مع مستوى الخطر الوبائي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={governoratesColumns}
                  data={governorates}
                  searchKey="nameAr"
                  searchPlaceholder="البحث في المحافظات..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveys">
            <Card>
              <CardHeader>
                <CardTitle>مسوحات {region.nameAr}</CardTitle>
                <CardDescription>جميع المسوحات الميدانية المنجزة في محافظات منطقة {region.nameAr}</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={surveysColumns}
                  data={surveys}
                  searchKey="disease.nameAr"
                  searchPlaceholder="البحث في المسوحات..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
