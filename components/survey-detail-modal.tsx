"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Printer, Download, X, FileText, Calendar, MapPin, Activity, TrendingUp, Users, AlertTriangle, CheckCircle, Clock, Table, Bug } from "lucide-react"

interface SurveyDetailModalProps {
  survey: Record<string, unknown>
  isOpen: boolean
  onClose: () => void
}

const epidemiologicalBelts: Record<string, {
  id: string;
  nameAr: string;
  description: string;
  riskLevel: string;
  color: string;
  governorates: string[];
}> = {
  red: {
    id: "red",
    nameAr: "الحزام الأحمر",
    description: "حزام السيطرة على المرض ومنع انتشاره إلى بقية مناطق المملكة ويتميز بارتفاع مخاطر الاصابة بالمرض",
    riskLevel: "عالي جداً",
    color: "#dc2626",
    governorates: ["الطوال", "الحرث", "العارضة", "فيفا", "الدائر", "العيدابي", "الريث"]
  },
  orange: {
    id: "orange",
    nameAr: "الحزام البرتقالي",
    description: "محافظات قد سبق أن سُجلت الإصابة فيها تاريخياً منذ الاندلاعة الأولى في 1421هـ ومجاورة لمحافظات الحزام الأحمر",
    riskLevel: "عالي",
    color: "#ea580c",
    governorates: [
      "جازان", "ضمد", "صبيا", "هروب", "بيش", "الدرب", "أبو عريش", "أحد المسارحة",
      "محايل عسير", "رجال ألمع", "المجاردة", "الحريضة", "قناة والبحر", "السعيدة", "تهامة ابها",
      "القنفذة"
    ]
  },
  yellow: {
    id: "yellow",
    nameAr: "الحزام الأصفر",
    description: "حزام مراقبة وبائية، لم يسبق أن سُجلت الإصابة فيها تاريخياً منذ الاندلاعة الأولى في 1421 هـ",
    riskLevel: "متوسط",
    color: "#eab308",
    governorates: [
      "الليث", "العرضيات",
      "النماص", "تنومة", "خميس مشيط", "أحد رفيدة", "أبها", "سراة عبيدة", "ظهران الجنوب",
      "المخواة", "قلوة",
      "نجران", "شرورة", "حبونا", "بدر الجنوب", "يدمة", "ثار", "خباش"
    ]
  },
  green: {
    id: "green",
    nameAr: "الحزام الأخضر",
    description: "حزام خال من المرض السريري والعدوى معاً، يشمل جميع مناطق المملكة عدا المناطق المذكورة في الأحزمة السابقة",
    riskLevel: "منخفض",
    color: "#16a34a",
    governorates: []
  }
}

function getEpidemiologicalBelt(governorateName: string) {
  for (const belt of Object.values(epidemiologicalBelts)) {
    if (belt.governorates.includes(governorateName)) {
      return belt
    }
  }
  return epidemiologicalBelts.green
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'in-progress':
      return <Clock className="w-5 h-5 text-yellow-600" />
    case 'pending':
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    default:
      return <FileText className="w-5 h-5 text-gray-600" />
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'مكتمل'
    case 'in-progress':
      return 'قيد التنفيذ'
    case 'pending':
      return 'معلق'
    default:
      return 'غير محدد'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'pending':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function SurveyDetailModal({ survey, isOpen, onClose }: SurveyDetailModalProps) {
  const [isPrintMode, setIsPrintMode] = useState(false)

  const handlePrint = () => {
    setIsPrintMode(true)
    setTimeout(() => {
      window.print()
      setIsPrintMode(false)
    }, 100)
  }

  const handleDownload = () => {
    // يمكن إضافة وظيفة تحميل PDF هنا
    alert('سيتم إضافة وظيفة التحميل قريباً')
  }

  if (!survey) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl max-h-[90vh] overflow-y-auto ${isPrintMode ? 'print:max-w-full print:max-h-full print:overflow-visible' : ''}`}>
        {/* Header - مخفي في وضع الطباعة */}
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-right">تفاصيل المسح {survey.surveyNumber}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                تحميل PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Header للطباعة */}
        <div className="hidden print:block print:mb-8">
          <div className="text-center border-b-2 border-green-600 pb-4 mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/api/placeholder/80/80" alt="شعار وزارة البيئة" className="w-20 h-20" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">وزارة البيئة والمياه والزراعة</h1>
                <h2 className="text-lg text-gray-700">إدارة المسوحات - حمى الوادي المتصدع</h2>
              </div>
              <img src="/api/placeholder/80/80" alt="شعار المملكة" className="w-20 h-20" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">تقرير تفصيلي للمسح {survey.surveyNumber}</h3>
          </div>
        </div>

        <div className="space-y-6">
          {/* معلومات أساسية */}
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="w-6 h-6 text-green-600" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    رقم المسح
                  </div>
                  <div className="text-lg font-semibold text-green-800">{survey.surveyNumber}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    تاريخ المسح
                  </div>
                  <div className="text-lg font-semibold">{new Date(survey.date).toLocaleDateString('ar-SA')}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    حالة المسح
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(survey.status)}
                    <Badge className={`${getStatusColor(survey.status)} font-semibold`}>
                      {getStatusText(survey.status)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    معدل الانتشار
                  </div>
                  <div className="text-lg font-semibold text-blue-600">{survey.prevalenceRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الإحصائيات التفصيلية */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Activity className="w-6 h-6 text-blue-600" />
                الإحصائيات التفصيلية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-800">{survey.totalSamples?.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">إجمالي العينات</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-800">{survey.negativeSamples?.toLocaleString()}</div>
                      <div className="text-sm text-green-600">العينات السالبة</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-800">{survey.positiveSamples?.toLocaleString()}</div>
                      <div className="text-sm text-red-600">العينات الموجبة</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-800">{survey.prevalenceRate}%</div>
                      <div className="text-sm text-purple-600">معدل الانتشار</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-800">{survey.suspectedCases?.toLocaleString()}</div>
                      <div className="text-sm text-orange-600">الحالات المشتبهة</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-800">{survey.confirmedCases?.toLocaleString()}</div>
                      <div className="text-sm text-red-600">الحالات المؤكدة</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-800">{survey.recoveries?.toLocaleString()}</div>
                      <div className="text-sm text-green-600">حالات الشفاء</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تفاصيل العينات الإيجابية */}
          {survey.positiveSamples > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Table className="w-6 h-6 text-red-600" />
                  تفاصيل العينات الإيجابية
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {survey.positiveSamples} عينة موجبة
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">المحافظة</th>
                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">نوع الحيوان</th>
                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">العدد</th>
                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {survey.positiveDetails?.map((detail: Record<string, unknown>, index: number) => {
                        const belt = getEpidemiologicalBelt(detail.governorate)
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: belt.color }}
                                ></div>
                                <span className="font-medium">{detail.governorate}</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="text-gray-700">{detail.animalType}</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="font-semibold text-red-600">{detail.count}</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <Badge 
                                variant={detail.status === 'مؤكد' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {detail.status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      }) || (
                        // بيانات تجريبية في حالة عدم وجود بيانات
                        <>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-600"></div>
                                <span className="font-medium">جازان</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="text-gray-700">أغنام</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="font-semibold text-red-600">15</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <Badge variant="destructive" className="text-xs">مؤكد</Badge>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-600"></div>
                                <span className="font-medium">صبيا</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="text-gray-700">ماعز</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="font-semibold text-red-600">8</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <Badge variant="destructive" className="text-xs">مؤكد</Badge>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-600"></div>
                                <span className="font-medium">الحرث</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="text-gray-700">أبقار</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="font-semibold text-red-600">3</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <Badge variant="secondary" className="text-xs">مشتبه</Badge>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-600"></div>
                                <span className="font-medium">أبو عريش</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="text-gray-700">أغنام</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="font-semibold text-red-600">12</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <Badge variant="destructive" className="text-xs">مؤكد</Badge>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-600"></div>
                                <span className="font-medium">فيفا</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="text-gray-700">ماعز</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <span className="font-semibold text-red-600">7</span>
                            </td>
                            <td className="border border-gray-300 px-4 py-3">
                              <Badge variant="destructive" className="text-xs">مؤكد</Badge>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* ملخص العينات الإيجابية */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {survey.positiveDetails?.reduce((sum: number, detail: Record<string, unknown>) => sum + (detail.count as number), 0) || 45}
                      </div>
                      <div className="text-sm text-red-700">إجمالي العينات الموجبة</div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {survey.positiveDetails?.filter((detail: Record<string, unknown>) => detail.status === 'مؤكد').reduce((sum: number, detail: Record<string, unknown>) => sum + (detail.count as number), 0) || 42}
                      </div>
                      <div className="text-sm text-orange-700">الحالات المؤكدة</div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {survey.positiveDetails?.filter((detail: Record<string, unknown>) => detail.status === 'مشتبه').reduce((sum: number, detail: Record<string, unknown>) => sum + (detail.count as number), 0) || 3}
                      </div>
                      <div className="text-sm text-yellow-700">الحالات المشتبهة</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* التقصي الحشري */}
          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Bug className="w-6 h-6 text-amber-600" />
                التقصي الحشري
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  {survey.entomologicalSurvey?.totalTraps || 0} مصيدة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* إحصائيات التقصي الحشري */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {survey.entomologicalSurvey?.totalTraps || 120}
                    </div>
                    <div className="text-sm text-blue-700">إجمالي المصائد</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {survey.entomologicalSurvey?.activeTraps || 95}
                    </div>
                    <div className="text-sm text-green-700">المصائد النشطة</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {survey.entomologicalSurvey?.positiveTraps || 12}
                    </div>
                    <div className="text-sm text-orange-700">المصائد الموجبة</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {survey.entomologicalSurvey?.positivityRate || '10.0'}%
                    </div>
                    <div className="text-sm text-purple-700">معدل الإيجابية</div>
                  </div>
                </div>
              </div>

              {/* تفاصيل التقصي الحشري بالمناطق */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">المنطقة</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">المحافظة</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">عدد المصائد</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">المصائد الموجبة</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">نوع الناقل</th>
                      <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">معدل الإيجابية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {survey.entomologicalSurvey?.details?.map((detail: Record<string, unknown>, index: number) => {
                      const belt = getEpidemiologicalBelt(detail.governorate)
                      const positivityRate = detail.totalTraps > 0 ? ((detail.positiveTraps / detail.totalTraps) * 100).toFixed(1) : '0.0'
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: belt.color }}
                              ></div>
                              <span className="font-medium">{detail.region}</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">{detail.governorate}</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">{detail.totalTraps}</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">{detail.positiveTraps}</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">
                              {detail.vectorType}
                            </Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge 
                              variant={parseFloat(positivityRate) > 15 ? 'destructive' : parseFloat(positivityRate) > 5 ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {positivityRate}%
                            </Badge>
                          </td>
                        </tr>
                      )
                    }) || (
                      // بيانات تجريبية في حالة عدم وجود بيانات
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-600"></div>
                              <span className="font-medium">جازان</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">جازان</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">25</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">4</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">Culex tritaeniorhynchus</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="destructive" className="text-xs">16.0%</Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-600"></div>
                              <span className="font-medium">جازان</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">صبيا</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">20</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">3</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">Aedes vexans</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="destructive" className="text-xs">15.0%</Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-600"></div>
                              <span className="font-medium">جازان</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">أبو عريش</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">18</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">2</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">Culex tritaeniorhynchus</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="secondary" className="text-xs">11.1%</Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-orange-600"></div>
                              <span className="font-medium">عسير</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">محايل عسير</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">15</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">1</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">Aedes vexans</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="secondary" className="text-xs">6.7%</Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-yellow-600"></div>
                              <span className="font-medium">نجران</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">نجران</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">12</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">1</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">Culex tritaeniorhynchus</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="secondary" className="text-xs">8.3%</Badge>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-600"></div>
                              <span className="font-medium">الرياض</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="text-gray-700">الرياض</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-blue-600">10</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span className="font-semibold text-orange-600">0</span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="outline" className="text-xs">لا يوجد</Badge>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <Badge variant="default" className="text-xs">0.0%</Badge>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ملخص أنواع النواقل */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">أنواع النواقل المكتشفة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-800">Culex tritaeniorhynchus</div>
                        <div className="text-sm text-blue-600">البعوض الناقل الرئيسي</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {survey.entomologicalSurvey?.vectorTypes?.culex || 8}
                        </div>
                        <div className="text-xs text-blue-500">مصيدة موجبة</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-green-800">Aedes vexans</div>
                        <div className="text-sm text-green-600">البعوض الناقل الثانوي</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {survey.entomologicalSurvey?.vectorTypes?.aedes || 4}
                        </div>
                        <div className="text-xs text-green-500">مصيدة موجبة</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المحافظات المشمولة */}
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <MapPin className="w-6 h-6 text-purple-600" />
                المحافظات المشمولة في المسح
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  {survey.governoratesIncluded?.length || 0} محافظة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(survey.governoratesIncluded) ? survey.governoratesIncluded : [])?.map((gov: string, index: number) => {
                  const belt = getEpidemiologicalBelt(gov)
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
                      style={{ borderLeftColor: belt.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: belt.color }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-800">{gov}</div>
                          <div className="text-xs text-gray-600">{belt.nameAr}</div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: belt.color, 
                          color: belt.color,
                          backgroundColor: `${belt.color}15`
                        }}
                      >
                        {belt.riskLevel}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية للطباعة */}
          <div className="hidden print:block">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">معلومات إضافية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <strong>تاريخ إنشاء التقرير:</strong> {new Date().toLocaleDateString('ar-SA')}
                  </div>
                  <div>
                    <strong>المرض المستهدف:</strong> حمى الوادي المتصدع (RVF)
                  </div>
                  <div>
                    <strong>الجهة المسؤولة:</strong> وزارة البيئة والمياه والزراعة - إدارة المسوحات
                  </div>
                  <div>
                    <strong>ملاحظات:</strong> هذا التقرير يحتوي على معلومات سرية ولا يجوز تداولها خارج نطاق العمل الرسمي.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer للطباعة */}
        <div className="hidden print:block print:mt-8 print:pt-4 border-t-2 border-gray-300">
          <div className="text-center text-sm text-gray-600">
            <p>وزارة البيئة والمياه والزراعة - المملكة العربية السعودية</p>
            <p>تم إنشاء هذا التقرير في: {new Date().toLocaleString('ar-SA')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}