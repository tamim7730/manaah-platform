"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/stats-card"
import AdvancedSaudiMap from "@/components/advanced-saudi-map"
import { GlobalHealthUpdates } from "@/components/global-health-updates"
import {
  Shield,
  BarChart3,
  MapPin,
  Users,
  Activity,
  Database,
  Globe,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileText,
  LogIn,
  Settings,
} from "lucide-react"
import Link from "next/link"

// بيانات تجريبية للمسوحات الحديثة - سيتم استبدالها ببيانات من لوحة التحكم
const defaultRecentSurveys = [
  {
    id: 1,
    disease: "حمى الوادي المتصدع",
    region: "منطقة الرياض",
    date: "2024-01-15",
    status: "completed",
    totalSamples: 150,
    positiveSamples: 3,
  },
  {
    id: 2,
    disease: "حمى الضنك",
    region: "منطقة جازان",
    date: "2024-01-14",
    status: "in_progress",
    totalSamples: 200,
    positiveSamples: 8,
  },
  {
    id: 3,
    disease: "حمى غرب النيل",
    region: "المنطقة الشرقية",
    date: "2024-01-13",
    status: "completed",
    totalSamples: 100,
    positiveSamples: 0,
  },
  {
    id: 4,
    disease: "الملاريا",
    region: "منطقة عسير",
    date: "2024-01-12",
    status: "completed",
    totalSamples: 80,
    positiveSamples: 2,
  },
  {
    id: 5,
    disease: "الحمى النزفية الفيروسية",
    region: "منطقة تبوك",
    date: "2024-01-11",
    status: "planned",
    totalSamples: 120,
    positiveSamples: 0,
  },
]

export default function HomePage() {
  const [isGlobalHealthUpdatesEnabled, setIsGlobalHealthUpdatesEnabled] = useState<boolean>(true)
  const [mapSettings, setMapSettings] = useState({
    isEnabled: true,
    showPopulation: true,
    showCities: true,
    showDistricts: true,
    enableSearch: true,
    enableDownload: true,
    defaultZoom: 6,
    showLegend: true,
    colorScheme: 'population',
    enableRegionSelection: true,
    showStatistics: true
  })
  
  const [interfaceSettings, setInterfaceSettings] = useState({
    showHeader: true,
    showHeroSection: true,
    showStatsSection: true,
    showRecentUpdatesSection: true,
    showFeaturesSection: true,
    showFooter: true,
    heroTitle: 'منصة مناعة',
    heroSubtitle: 'لإدارة الأمراض الوبائية',
    heroDescription: 'نظام متطور لرصد وإدارة الأمراض الوبائية في المملكة العربية السعودية، يوفر بيانات دقيقة وتحليلات شاملة لدعم اتخاذ القرارات الصحية',
    recentUpdatesTitle: 'آخر التحديثات المحلية',
    recentUpdatesDescription: 'أحدث المسوحات والتقارير الميدانية من مختلف مناطق المملكة',
    featuresTitle: 'ميزات المنصة',
    featuresDescription: 'نظام شامل يوفر جميع الأدوات اللازمة لرصد وإدارة الأمراض الوبائية بكفاءة عالية',
    maxRecentSurveys: 6
  })

  // البيانات المحملة من لوحة التحكم
  const [regions, setRegions] = useState<any[]>([])
  const [diseases, setDiseases] = useState<any[]>([])
  const [recentSurveys, setRecentSurveys] = useState<any[]>(defaultRecentSurveys)
  const [stats, setStats] = useState({
    totalDiseases: 5,
    totalRegions: 13,
    totalSurveys: 47,
    activeSurveys: 8,
  })

  // تحميل البيانات والإعدادات من localStorage
  useEffect(() => {
    const savedGlobalHealthUpdates = localStorage.getItem('manaah-globalHealthUpdatesEnabled')
    if (savedGlobalHealthUpdates !== null) {
      try {
        setIsGlobalHealthUpdatesEnabled(JSON.parse(savedGlobalHealthUpdates))
      } catch (error) {
        console.error('خطأ في تحميل إعدادات التحديثات العامة:', error)
      }
    }
    
    const savedMapSettings = localStorage.getItem('manaah-mapSettings')
    if (savedMapSettings !== null) {
      try {
        setMapSettings(JSON.parse(savedMapSettings))
      } catch (error) {
        console.error('خطأ في تحميل إعدادات الخريطة:', error)
      }
    }
    
    const savedInterfaceSettings = localStorage.getItem('manaah-interfaceSettings')
    if (savedInterfaceSettings !== null) {
      try {
        setInterfaceSettings(JSON.parse(savedInterfaceSettings))
      } catch (error) {
        console.error('خطأ في تحميل إعدادات الواجهة:', error)
      }
    }

    // تحميل بيانات المناطق والأمراض من لوحة التحكم
    const savedRegions = localStorage.getItem('manaah-regions')
    if (savedRegions) {
      try {
        const regionsData = JSON.parse(savedRegions)
        setRegions(regionsData)
        
        // استخراج المسوحات الحديثة من بيانات المناطق
        const allSurveys: any[] = []
        regionsData.forEach((region: any) => {
          region.governorates.forEach((gov: any) => {
            gov.surveys.forEach((survey: any) => {
              allSurveys.push({
                id: survey.id,
                disease: "حمى الوادي المتصدع", // المرض الافتراضي
                region: region.nameAr,
                governorate: gov.nameAr,
                date: survey.date,
                status: survey.status,
                totalSamples: survey.totalSamples,
                positiveSamples: survey.positiveSamples,
                surveyNumber: survey.surveyNumber
              })
            })
          })
        })
        
        // ترتيب المسوحات حسب التاريخ (الأحدث أولاً)
        allSurveys.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentSurveys(allSurveys)
        
        // حساب الإحصائيات الحقيقية
        const totalSurveys = allSurveys.length
        const activeSurveys = allSurveys.filter(survey => survey.status === 'ongoing').length
        const totalRegions = regionsData.length
        
        setStats({
          totalDiseases: 1, // حالياً نتعامل مع مرض واحد فقط
          totalRegions: totalRegions,
          totalSurveys: totalSurveys,
          activeSurveys: activeSurveys,
        })
        
      } catch (error) {
        console.error('خطأ في تحميل بيانات المناطق:', error)
      }
    }
    
    const savedDiseases = localStorage.getItem('manaah-diseases')
    if (savedDiseases) {
      try {
        const diseasesData = JSON.parse(savedDiseases)
        setDiseases(diseasesData)
        
        // تحديث عدد الأمراض في الإحصائيات
        setStats(prevStats => ({
          ...prevStats,
          totalDiseases: diseasesData.length
        }))
      } catch (error) {
        console.error('خطأ في تحميل بيانات الأمراض:', error)
      }
    }
  }, [])

  // حفظ إعدادات الواجهة في localStorage
  useEffect(() => {
    localStorage.setItem('manaah-interfaceSettings', JSON.stringify(interfaceSettings))
  }, [interfaceSettings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      {interfaceSettings.showHeader && (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">منصة مناعة</h1>
                <p className="text-sm text-muted-foreground">إدارة ورصد الأمراض الوبائية</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
                الرئيسية
              </Link>
              <Link href="/diseases" className="text-gray-600 hover:text-primary transition-colors">
                الأمراض
              </Link>
              <Link href="/regions" className="text-gray-600 hover:text-primary transition-colors">
                المناطق
              </Link>
              <Link href="/surveys" className="text-gray-600 hover:text-primary transition-colors">
                المسوحات
              </Link>
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  <Settings className="w-4 h-4 mr-2" />
                  لوحة التحكم
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">
                  <LogIn className="w-4 h-4 mr-2" />
                  تسجيل الدخول
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      )}

      {/* Hero Section */}
      {interfaceSettings.showHeroSection && (
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">المملكة العربية السعودية</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {interfaceSettings.heroTitle}
            <span className="block text-primary">{interfaceSettings.heroSubtitle}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {interfaceSettings.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                <BarChart3 className="mr-2 w-5 h-5" />
                عرض لوحة التحكم
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary text-primary hover:bg-primary/5 bg-transparent"
              onClick={() => document.getElementById("map-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              <MapPin className="mr-2 w-5 h-5" />
              استكشاف الخريطة
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* Stats Section */}
      {interfaceSettings.showStatsSection && (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatsCard
              title="الأمراض المرصودة"
              value={stats.totalDiseases}
              description="مرض وبائي مختلف"
              icon={Database}
            />
            <StatsCard
              title="المناطق الإدارية"
              value={stats.totalRegions}
              description="منطقة في المملكة"
              icon={MapPin}
            />
            <StatsCard
              title="إجمالي المسوحات"
              value={stats.totalSurveys}
              description="مسح ميداني منجز"
              icon={FileText}
            />
            <StatsCard
              title="المسوحات النشطة"
              value={stats.activeSurveys}
              description="مسح قيد التنفيذ"
              icon={Activity}
              trend={{ value: 12, isPositive: true }}
            />
          </div>
        </div>
      </section>
      )}

      {/* Advanced Interactive Map Section */}
      {mapSettings.isEnabled && (
        <section id="map-section" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-green-50">
          <div className="container mx-auto">
            <AdvancedSaudiMap mapSettings={mapSettings} regions={regions} />
          </div>
        </section>
      )}

      {/* Global Animal Health Updates Section */}
      {isGlobalHealthUpdatesEnabled && <GlobalHealthUpdates />}

      {/* Recent Updates Section */}
      {interfaceSettings.showRecentUpdatesSection && (
      <section className="py-20 px-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{interfaceSettings.recentUpdatesTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {interfaceSettings.recentUpdatesDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSurveys.slice(0, interfaceSettings.maxRecentSurveys).map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{survey.disease}</CardTitle>
                    <Badge
                      variant={survey.status === "completed" ? "default" : survey.status === "ongoing" ? "secondary" : "outline"}
                      className={
                        survey.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : survey.status === "ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {survey.status === "completed"
                        ? "مكتمل"
                        : survey.status === "ongoing"
                          ? "قيد التنفيذ"
                          : survey.status === "planned"
                            ? "مخطط"
                            : survey.status}
                    </Badge>
                  </div>
                  <CardDescription>{survey.region}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span suppressHydrationWarning>{new Date(survey.date).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{survey.totalSamples} عينة إجمالية</span>
                    </div>
                    {survey.positiveSamples > 0 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{survey.positiveSamples} عينة إيجابية</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/surveys">
              <Button variant="outline" size="lg">
                عرض جميع المسوحات
                <TrendingUp className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Features Section */}
      {interfaceSettings.showFeaturesSection && (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{interfaceSettings.featuresTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {interfaceSettings.featuresDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>الخرائط التفاعلية الحقيقية</CardTitle>
                <CardDescription>
                  عرض البيانات الجغرافية للأمراض الوبائية على خرائط تفاعلية حقيقية مع البيانات الدقيقة لمناطق المملكة
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>التحليلات المتقدمة</CardTitle>
                <CardDescription>رسوم بيانية وتحليلات إحصائية شاملة لفهم انتشار الأمراض واتجاهاتها</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>نظام الإنذار المبكر</CardTitle>
                <CardDescription>تنبيهات فورية عند اكتشاف أنماط غير طبيعية أو زيادة في معدلات الإصابة</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>إدارة البيانات</CardTitle>
                <CardDescription>نظام متطور لجمع وتخزين ومعالجة بيانات المسوحات والعينات المختبرية</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>نظام صلاحيات متدرج يسمح بالوصول المناسب للمعلومات حسب دور كل مستخدم</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>التقارير الشاملة</CardTitle>
                <CardDescription>إنتاج تقارير مفصلة قابلة للتخصيص والتصدير بصيغ مختلفة</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      {interfaceSettings.showFooter && (
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">منصة مناعة</h3>
                  <p className="text-sm text-gray-400">إدارة الأمراض الوبائية</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                نظام متطور لرصد وإدارة الأمراض الوبائية في المملكة العربية السعودية
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">الميزات</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>الخرائط التفاعلية الحقيقية</li>
                <li>التحليلات المتقدمة</li>
                <li>نظام الإنذار المبكر</li>
                <li>إدارة البيانات</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>دليل المستخدم</li>
                <li>الأسئلة الشائعة</li>
                <li>الدعم الفني</li>
                <li>التدريب</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@manaah.gov.sa</li>
                <li>+966 11 123 4567</li>
                <li>الرياض، المملكة العربية السعودية</li>
                <li>الأحد - الخميس: 8:00 - 17:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 منصة مناعة - المملكة العربية السعودية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
      )}

    </div>
  )
}
