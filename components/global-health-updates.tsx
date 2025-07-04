'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Globe, AlertTriangle, Database, Bell, RefreshCw, ExternalLink, Loader2, FileText, TrendingUp, MapPin, Calendar, Users, Activity, Download, Share2, Filter, Search, BarChart3, PieChart, LineChart, Shield } from "lucide-react"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface WOAHAlert {
  id: string
  disease: string
  location: string
  country: string
  severity: 'high' | 'medium' | 'low'
  diseaseCode: string
  timestamp: string
  description?: string
  affectedAnimals?: number
  controlMeasures?: string[]
  isNew?: boolean
  economicImpact?: {
    estimatedLoss: number
    currency: string
    affectedFarms: number
    affectedSectors?: string[]
  }
  geographicSpread?: {
    lat: number
    lng: number
    radius: number
    affectedAreas?: string[]
  }
  preventionMeasures?: string[]
  vaccinationStatus?: {
    available: boolean
    coverage: number
    effectiveness: number
  }
  riskLevel?: number
  trend?: 'increasing' | 'stable' | 'decreasing'
}

interface WOAHStats {
  memberCountries: number
  activeAlerts: number
  monthlyReports: number
  diseases: {
    name: string
    count: number
    cases: number
    severity: 'high' | 'medium' | 'low'
    trend: 'up' | 'down' | 'stable'
    changePercent: number
  }[]
  globalTrends: {
    totalOutbreaks: number
    affectedCountries: number
    economicImpact: number
    vaccinationCoverage: number
  }
  riskAssessment: {
    global: number
    regional: { [key: string]: number }
  }
  monthlyComparison: {
    current: number
    previous: number
    change: number
  }
}

const mockAlerts: WOAHAlert[] = [
  {
    id: '1',
    disease: 'إنفلونزا الطيور عالية الإمراضية',
    location: 'منطقة نورماندي',
    country: 'فرنسا',
    severity: 'high',
    diseaseCode: 'H5N1',
    timestamp: '2024-01-15T10:00:00Z',
    description: 'تفشي إنفلونزا الطيور في مزارع الدواجن التجارية',
    affectedAnimals: 125000,
    economicImpact: {
      estimatedLoss: 2500000,
      currency: 'EUR',
      affectedFarms: 15,
      affectedSectors: ['الدواجن التجارية', 'صناعة البيض', 'التصدير']
    },
    geographicSpread: {
      lat: 49.1829,
      lng: -0.3707,
      radius: 25,
      affectedAreas: ['نورماندي الشرقية', 'نورماندي الغربية', 'كالفادوس']
    },
    controlMeasures: ['الإعدام الوقائي', 'منطقة الحجر الصحي', 'تقييد الحركة'],
    preventionMeasures: ['التطعيم الطارئ', 'تعزيز الأمن الحيوي', 'المراقبة المكثفة'],
    vaccinationStatus: {
      available: true,
      coverage: 85,
      effectiveness: 92
    },
    riskLevel: 9,
    trend: 'increasing'
  },
  {
    id: '2',
    disease: 'حمى الخنازير الأفريقية',
    location: 'ولاية ساكسونيا',
    country: 'ألمانيا',
    severity: 'medium',
    diseaseCode: 'ASF',
    timestamp: '2024-01-15T07:00:00Z',
    description: 'حالات في الخنازير البرية مع انتشار محدود',
    affectedAnimals: 45,
    economicImpact: {
      estimatedLoss: 850000,
      currency: 'EUR',
      affectedFarms: 3,
      affectedSectors: ['تربية الخنازير', 'الصيد']
    },
    geographicSpread: {
      lat: 51.1045,
      lng: 13.2017,
      radius: 15,
      affectedAreas: ['ساكسونيا الشرقية', 'ساكسونيا الوسطى']
    },
    controlMeasures: ['صيد الخنازير البرية', 'تطهير المناطق المصابة', 'حظر نقل الخنازير'],
    preventionMeasures: ['تعزيز السياج', 'مراقبة الخنازير البرية', 'تدريب المزارعين'],
    vaccinationStatus: {
      available: false,
      coverage: 0,
      effectiveness: 0
    },
    riskLevel: 6,
    trend: 'stable'
  },
  {
    id: '3',
    disease: 'مرض اللسان الأزرق',
    location: 'منطقة الأندلس',
    country: 'إسبانيا',
    severity: 'low',
    diseaseCode: 'BTV-3',
    timestamp: '2024-01-14T22:00:00Z',
    description: 'حالات متفرقة في الأغنام والماعز',
    affectedAnimals: 230,
    economicImpact: {
      estimatedLoss: 125000,
      currency: 'EUR',
      affectedFarms: 8,
      affectedSectors: ['تربية الأغنام', 'تربية الماعز']
    },
    geographicSpread: {
      lat: 37.3891,
      lng: -5.9845,
      radius: 10,
      affectedAreas: ['إشبيلية', 'قادس', 'هويلفا']
    },
    controlMeasures: ['مراقبة الحشرات الناقلة', 'عزل الحيوانات المصابة'],
    preventionMeasures: ['التطعيم الوقائي', 'مكافحة الحشرات', 'تحسين التهوية'],
    vaccinationStatus: {
      available: true,
      coverage: 70,
      effectiveness: 88
    },
    riskLevel: 3,
    trend: 'decreasing'
  }
]

const mockStats: WOAHStats = {
  memberCountries: 182,
  activeAlerts: 24,
  monthlyReports: 156,
  diseases: [
    { name: 'إنفلونزا الطيور', count: 12, cases: 12, severity: 'high', trend: 'up', changePercent: 15.2 },
    { name: 'حمى الخنازير الأفريقية', count: 8, cases: 8, severity: 'medium', trend: 'stable', changePercent: -2.1 },
    { name: 'مرض اللسان الأزرق', count: 6, cases: 6, severity: 'low', trend: 'down', changePercent: -8.5 }
  ],
  globalTrends: {
    totalOutbreaks: 156,
    affectedCountries: 45,
    economicImpact: 2.8,
    vaccinationCoverage: 78
  },
  riskAssessment: {
    global: 6.2,
    regional: {
      'أوروبا': 7.1,
      'آسيا': 6.8,
      'أفريقيا': 5.9,
      'أمريكا الشمالية': 4.2,
      'أمريكا الجنوبية': 5.5,
      'أوقيانوسيا': 3.8
    }
  },
  monthlyComparison: {
    current: 156,
    previous: 142,
    change: 9.9
  }
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const alertTime = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'منذ أقل من ساعة'
  if (diffInHours === 1) return 'منذ ساعة واحدة'
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'منذ يوم واحد'
  return `منذ ${diffInDays} أيام`
}

function getSeverityColor(severity: 'high' | 'medium' | 'low') {
  switch (severity) {
    case 'high': return 'red'
    case 'medium': return 'orange'
    case 'low': return 'yellow'
    default: return 'gray'
  }
}

export function GlobalHealthUpdates() {
  const [alerts, setAlerts] = useState<WOAHAlert[]>([])
  const [stats, setStats] = useState<WOAHStats | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedAlert, setSelectedAlert] = useState<WOAHAlert | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/woah-data?type=alerts&limit=5')
      const result = await response.json()
      
      if (result.success) {
        setAlerts(result.data)
        setLastUpdate(new Date())
      } else {
        toast.error('خطأ في تحميل التنبيهات')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching alerts:', error)
      toast.error('خطأ في الاتصال بالخادم')
    }
  }, [])

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/woah-data?type=stats')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        toast.error('خطأ في تحميل الإحصائيات')
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching stats:', error)
      toast.error('خطأ في الاتصال بالخادم')
    }
  }, [])

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchAlerts(), fetchStats()])
      setIsLoading(false)
    }
    
    loadData()
  }, [fetchAlerts, fetchStats])

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/woah-data?type=alerts&limit=1&since=' + lastUpdate.toISOString())
        const result = await response.json()
        
        if (result.success && result.data.length > 0) {
          const newAlert = result.data[0]
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
          setLastUpdate(new Date())
          
          toast.success('تنبيه جديد: تم رصد حالة جديدة', {
            description: `${newAlert.disease} في ${newAlert.location}, ${newAlert.country}`,
            action: {
              label: 'عرض التفاصيل',
              onClick: () => {
          // eslint-disable-next-line no-console
          console.log('View alert:', newAlert.id)
        },
            },
          })
        }
      } catch (error) {
        // eslint-disable-next-line no-console
      console.error('Error checking for updates:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [lastUpdate])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchAlerts(), fetchStats()])
      toast.success('تم تحديث البيانات بنجاح')
    } catch (error) {
      toast.error('خطأ في تحديث البيانات')
    } finally {
      setIsRefreshing(false)
    }
  }

  const generatePDFReport = async () => {
    try {
      toast.info('جاري إنشاء التقرير...', { duration: 2000 })
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20
      
      // إعداد الخطوط والألوان
      pdf.setFont('helvetica', 'bold')
      
      // Header with gradient effect simulation
      pdf.setFillColor(59, 130, 246) // Blue
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      // Logo placeholder (circle)
      pdf.setFillColor(255, 255, 255)
      pdf.circle(25, 20, 8, 'F')
      pdf.setTextColor(59, 130, 246)
      pdf.setFontSize(12)
      pdf.text('🌍', 21, 24)
      
      // Title
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.text('Global Animal Health Updates Report', 45, 20)
      pdf.setFontSize(12)
      pdf.text('World Organisation for Animal Health (WOAH)', 45, 28)
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 45, 35)
      
      yPosition = 60
      
      // Executive Summary Section
      pdf.setFillColor(248, 250, 252) // Light gray background
      pdf.rect(10, yPosition - 5, pageWidth - 20, 50, 'F')
      
      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(16)
      pdf.text('Executive Summary', 15, yPosition + 5)
      
      // Summary statistics in a grid
      const summaryData = [
        { label: 'Active Alerts', value: alerts.length.toString(), color: [59, 130, 246] },
        { label: 'High Severity', value: alerts.filter(a => a.severity === 'high').length.toString(), color: [239, 68, 68] },
        { label: 'Affected Animals', value: alerts.reduce((sum, alert) => sum + (alert.affectedAnimals || 0), 0).toLocaleString(), color: [245, 158, 11] },
        { label: 'Economic Impact', value: `€${(alerts.reduce((sum, alert) => sum + (alert.economicImpact?.estimatedLoss || 0), 0) / 1000000).toFixed(1)}M`, color: [16, 185, 129] }
      ]
      
      summaryData.forEach((item, index) => {
        const x = 15 + (index % 2) * 90
        const y = yPosition + 15 + Math.floor(index / 2) * 15
        
        pdf.setFillColor(item.color[0], item.color[1], item.color[2])
        pdf.circle(x, y, 2, 'F')
        pdf.setTextColor(75, 85, 99)
        pdf.setFontSize(10)
        pdf.text(item.label + ':', x + 5, y - 1)
        pdf.setFont('helvetica', 'bold')
        pdf.text(item.value, x + 5, y + 4)
        pdf.setFont('helvetica', 'normal')
      })
      
      yPosition += 70
      
      // Global Trends Section
      if (stats?.globalTrends) {
        pdf.setFillColor(239, 246, 255) // Light blue background
        pdf.rect(10, yPosition - 5, pageWidth - 20, 40, 'F')
        
        pdf.setTextColor(30, 41, 59)
        pdf.setFontSize(14)
        pdf.text('Global Trends Overview', 15, yPosition + 5)
        
        const trendsData = [
          { label: 'Total Outbreaks', value: stats.globalTrends.totalOutbreaks?.toString() || '0' },
          { label: 'Affected Countries', value: stats.globalTrends.affectedCountries?.toString() || '0' },
          { label: 'Vaccination Coverage', value: `${stats.globalTrends.vaccinationCoverage || 0}%` },
          { label: 'Economic Impact', value: `€${stats.globalTrends.economicImpact || 0}B` }
        ]
        
        trendsData.forEach((item, index) => {
          const x = 15 + (index % 2) * 90
          const y = yPosition + 15 + Math.floor(index / 2) * 10
          
          pdf.setTextColor(75, 85, 99)
          pdf.setFontSize(9)
          pdf.text(`${item.label}: ${item.value}`, x, y)
        })
        
        yPosition += 50
      }
      
      // Disease Analysis Section
      if (stats?.diseases && stats.diseases.length > 0) {
        pdf.setTextColor(30, 41, 59)
        pdf.setFontSize(14)
        pdf.text('Disease Analysis', 15, yPosition)
        yPosition += 10
        
        stats.diseases.forEach((disease, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }
          
          const trendColor = disease.trend === 'up' ? [239, 68, 68] : 
                           disease.trend === 'down' ? [16, 185, 129] : [245, 158, 11]
          
          pdf.setFillColor(trendColor[0], trendColor[1], trendColor[2])
          pdf.circle(15, yPosition, 1.5, 'F')
          
          pdf.setTextColor(30, 41, 59)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.text(disease.name, 20, yPosition)
          
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(9)
          pdf.text(`Cases: ${disease.cases} | Trend: ${disease.changePercent > 0 ? '+' : ''}${disease.changePercent}%`, 20, yPosition + 5)
          
          yPosition += 15
        })
      }
      
      yPosition += 10
      
      // Active Alerts Section
      if (alerts.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setTextColor(30, 41, 59)
        pdf.setFontSize(14)
        pdf.text('Active Alerts Details', 15, yPosition)
        yPosition += 15
        
        alerts.slice(0, 5).forEach((alert, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage()
            yPosition = 20
          }
          
          // Alert severity indicator
          const severityColor = alert.severity === 'high' ? [239, 68, 68] : 
                               alert.severity === 'medium' ? [245, 158, 11] : [16, 185, 129]
          
          pdf.setFillColor(severityColor[0], severityColor[1], severityColor[2])
          pdf.rect(15, yPosition - 2, 3, 8, 'F')
          
          pdf.setTextColor(30, 41, 59)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.text(alert.disease, 22, yPosition + 2)
          
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(9)
          pdf.text(`Location: ${alert.location}, ${alert.country}`, 22, yPosition + 8)
          pdf.text(`Affected Animals: ${alert.affectedAnimals?.toLocaleString() || 'N/A'}`, 22, yPosition + 14)
          
          if (alert.economicImpact) {
            pdf.text(`Economic Impact: €${(alert.economicImpact.estimatedLoss / 1000000).toFixed(1)}M`, 22, yPosition + 20)
          }
          
          yPosition += 30
        })
      }
      
      // Footer
      const footerY = pageHeight - 15
      pdf.setFillColor(59, 130, 246)
      pdf.rect(0, footerY - 5, pageWidth, 20, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('Generated by MANAAH Platform - Animal Health Monitoring System', 15, footerY)
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 30, footerY)
      
      // Save the PDF
      const fileName = `WOAH-Report-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('تم إنشاء التقرير بنجاح! 📄', {
        description: 'تم تنزيل ملف PDF بتصميم احترافي',
        duration: 4000
      })
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating PDF:', error)
      toast.error('خطأ في إنشاء التقرير', {
        description: 'حدث خطأ أثناء إنشاء ملف PDF'
      })
    }
  }

  const generateAdvancedPDFReport = async () => {
    try {
      toast.info('جاري إنشاء التقرير المتقدم...', { duration: 3000 })
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20
      
      // Header with enhanced design
      pdf.setFillColor(30, 41, 59) // Dark blue
      pdf.rect(0, 0, pageWidth, 50, 'F')
      
      // Decorative elements
      pdf.setFillColor(59, 130, 246)
      pdf.rect(0, 45, pageWidth, 5, 'F')
      
      // Logo and branding
      pdf.setFillColor(255, 255, 255)
      pdf.circle(30, 25, 12, 'F')
      pdf.setTextColor(59, 130, 246)
      pdf.setFontSize(16)
      pdf.text('🌍', 24, 30)
      
      // Enhanced title
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text('COMPREHENSIVE ANIMAL HEALTH REPORT', 50, 20)
      pdf.setFontSize(14)
      pdf.text('Global Disease Surveillance & Risk Assessment', 50, 30)
      pdf.setFontSize(10)
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 50, 40)
      
      yPosition = 70
      
      // Risk Assessment Dashboard
      pdf.setFillColor(254, 242, 242) // Light red background
      pdf.rect(10, yPosition - 5, pageWidth - 20, 60, 'F')
      
      pdf.setTextColor(185, 28, 28)
      pdf.setFontSize(18)
      pdf.text('🚨 GLOBAL RISK ASSESSMENT', 15, yPosition + 5)
      
      // Risk level indicator
      const globalRisk = stats?.riskAssessment?.global || 0
      const riskColor = globalRisk >= 7 ? [239, 68, 68] : globalRisk >= 5 ? [245, 158, 11] : [16, 185, 129]
      
      pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2])
      pdf.rect(15, yPosition + 15, 60, 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.text(`Global Risk Level: ${globalRisk}/10`, 17, yPosition + 21)
      
      // Regional risk breakdown
      pdf.setTextColor(75, 85, 99)
      pdf.setFontSize(11)
      pdf.text('Regional Risk Levels:', 15, yPosition + 35)
      
      if (stats?.riskAssessment?.regional) {
        Object.entries(stats.riskAssessment.regional).forEach(([region, risk], index) => {
          const x = 15 + (index % 2) * 90
          const y = yPosition + 45 + Math.floor(index / 2) * 8
          
          const regionRiskColor = risk >= 7 ? [239, 68, 68] : risk >= 5 ? [245, 158, 11] : [16, 185, 129]
          pdf.setFillColor(regionRiskColor[0], regionRiskColor[1], regionRiskColor[2])
          pdf.circle(x, y, 1.5, 'F')
          
          pdf.setTextColor(75, 85, 99)
          pdf.setFontSize(9)
          pdf.text(`${region}: ${risk}/10`, x + 5, y + 1)
        })
      }
      
      yPosition += 75
      
      // Disease Outbreak Trends with Visual Charts
      pdf.setFillColor(239, 246, 255) // Light blue
      pdf.rect(10, yPosition - 5, pageWidth - 20, 80, 'F')
      
      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(16)
      pdf.text('📊 DISEASE OUTBREAK ANALYSIS', 15, yPosition + 5)
      
      // Create a simple bar chart for diseases
      if (stats?.diseases && stats.diseases.length > 0) {
        const maxCases = Math.max(...stats.diseases.map(d => d.cases))
        const chartWidth = 160
        const chartHeight = 40
        const barWidth = chartWidth / stats.diseases.length - 5
        
        stats.diseases.forEach((disease, index) => {
          const barHeight = (disease.cases / maxCases) * chartHeight
          const x = 15 + index * (barWidth + 5)
          const y = yPosition + 50 - barHeight
          
          const barColor = disease.severity === 'high' ? [239, 68, 68] : 
                          disease.severity === 'medium' ? [245, 158, 11] : [16, 185, 129]
          
          pdf.setFillColor(barColor[0], barColor[1], barColor[2])
          pdf.rect(x, y, barWidth, barHeight, 'F')
          
          // Disease name (rotated)
          pdf.setTextColor(75, 85, 99)
          pdf.setFontSize(8)
          pdf.text(disease.name.substring(0, 10), x + 2, yPosition + 55)
          
          // Case count
          pdf.setFontSize(7)
          pdf.text(disease.cases.toString(), x + 2, y - 2)
        })
        
        // Chart legend
        pdf.setTextColor(75, 85, 99)
        pdf.setFontSize(9)
        pdf.text('Disease Cases Distribution', 15, yPosition + 65)
      }
      
      yPosition += 90
      
      // Economic Impact Analysis
      if (yPosition > pageHeight - 80) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFillColor(254, 249, 195) // Light yellow
      pdf.rect(10, yPosition - 5, pageWidth - 20, 70, 'F')
      
      pdf.setTextColor(146, 64, 14)
      pdf.setFontSize(16)
      pdf.text('💰 ECONOMIC IMPACT ASSESSMENT', 15, yPosition + 5)
      
      const totalEconomicImpact = alerts.reduce((sum, alert) => sum + (alert.economicImpact?.estimatedLoss || 0), 0)
      const totalAffectedFarms = alerts.reduce((sum, alert) => sum + (alert.economicImpact?.affectedFarms || 0), 0)
      
      // Economic metrics
      const economicMetrics = [
        { label: 'Total Economic Loss', value: `€${(totalEconomicImpact / 1000000).toFixed(1)}M`, icon: '💸' },
        { label: 'Affected Farms', value: totalAffectedFarms.toString(), icon: '🏭' },
        { label: 'Average Loss per Alert', value: `€${(totalEconomicImpact / alerts.length / 1000).toFixed(0)}K`, icon: '📉' },
        { label: 'Recovery Time Est.', value: '3-6 months', icon: '⏱️' }
      ]
      
      economicMetrics.forEach((metric, index) => {
        const x = 15 + (index % 2) * 90
        const y = yPosition + 20 + Math.floor(index / 2) * 20
        
        pdf.setFillColor(255, 255, 255)
        pdf.rect(x, y - 5, 80, 15, 'F')
        
        pdf.setTextColor(146, 64, 14)
        pdf.setFontSize(12)
        pdf.text(metric.icon, x + 2, y + 2)
        
        pdf.setTextColor(75, 85, 99)
        pdf.setFontSize(9)
        pdf.text(metric.label, x + 8, y)
        pdf.setFont('helvetica', 'bold')
        pdf.text(metric.value, x + 8, y + 6)
        pdf.setFont('helvetica', 'normal')
      })
      
      yPosition += 80
      
      // Detailed Alert Analysis
      if (yPosition > pageHeight - 100) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setTextColor(30, 41, 59)
      pdf.setFontSize(16)
      pdf.text('🔍 DETAILED ALERT ANALYSIS', 15, yPosition)
      yPosition += 15
      
      alerts.forEach((alert, index) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }
        
        // Alert card background
        pdf.setFillColor(249, 250, 251)
        pdf.rect(10, yPosition - 5, pageWidth - 20, 50, 'F')
        
        // Severity indicator
        const severityColor = alert.severity === 'high' ? [239, 68, 68] : 
                             alert.severity === 'medium' ? [245, 158, 11] : [16, 185, 129]
        
        pdf.setFillColor(severityColor[0], severityColor[1], severityColor[2])
        pdf.rect(12, yPosition - 3, 4, 46, 'F')
        
        // Alert content
        pdf.setTextColor(30, 41, 59)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${alert.disease}`, 20, yPosition + 2)
        
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.text(`📍 ${alert.location}, ${alert.country}`, 20, yPosition + 8)
        pdf.text(`🐄 Affected Animals: ${alert.affectedAnimals?.toLocaleString() || 'N/A'}`, 20, yPosition + 14)
        pdf.text(`💰 Economic Impact: €${alert.economicImpact ? (alert.economicImpact.estimatedLoss / 1000000).toFixed(1) + 'M' : 'N/A'}`, 20, yPosition + 20)
        pdf.text(`📈 Trend: ${alert.trend === 'increasing' ? '↗️ Increasing' : alert.trend === 'decreasing' ? '↘️ Decreasing' : '➡️ Stable'}`, 20, yPosition + 26)
        
        if (alert.vaccinationStatus) {
          pdf.text(`💉 Vaccination: ${alert.vaccinationStatus.available ? `Available (${alert.vaccinationStatus.coverage}% coverage)` : 'Not Available'}`, 20, yPosition + 32)
        }
        
        if (alert.controlMeasures && alert.controlMeasures.length > 0) {
          pdf.text(`🛡️ Control Measures: ${alert.controlMeasures.slice(0, 2).join(', ')}`, 20, yPosition + 38)
        }
        
        yPosition += 55
      })
      
      // Add new page for recommendations
      pdf.addPage()
      yPosition = 20
      
      // Recommendations Section
      pdf.setFillColor(240, 253, 244) // Light green
      pdf.rect(10, yPosition - 5, pageWidth - 20, 100, 'F')
      
      pdf.setTextColor(22, 101, 52)
      pdf.setFontSize(18)
      pdf.text('💡 RECOMMENDATIONS & ACTION ITEMS', 15, yPosition + 5)
      
      const recommendations = [
        '🔬 Enhance surveillance systems in high-risk regions',
        '💉 Accelerate vaccination programs in affected areas',
        '🚧 Implement stricter biosecurity measures',
        '📊 Increase monitoring frequency for emerging diseases',
        '🤝 Strengthen international cooperation and data sharing',
        '📚 Provide training for veterinary professionals',
        '⚡ Develop rapid response protocols',
        '🔍 Invest in early detection technologies'
      ]
      
      recommendations.forEach((rec, index) => {
        pdf.setTextColor(22, 101, 52)
        pdf.setFontSize(10)
        pdf.text(rec, 15, yPosition + 20 + index * 8)
      })
      
      // Footer with enhanced design
      const footerY = pageHeight - 20
      pdf.setFillColor(30, 41, 59)
      pdf.rect(0, footerY - 5, pageWidth, 25, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('🌍 Generated by MANAAH Platform - Advanced Animal Health Monitoring System', 15, footerY)
      pdf.text('📧 Contact: info@manaah.platform | 🌐 www.manaah.platform', 15, footerY + 5)
      pdf.text(`📄 Page ${pdf.getNumberOfPages()} | 📅 ${new Date().toLocaleDateString()}`, pageWidth - 50, footerY)
      
      // Save the enhanced PDF
      const fileName = `WOAH-Advanced-Report-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('تم إنشاء التقرير المتقدم بنجاح! 🎉', {
        description: 'تم تنزيل ملف PDF شامل مع تحليلات متقدمة ورسوم بيانية',
        duration: 5000
      })
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating advanced PDF:', error)
      toast.error('خطأ في إنشاء التقرير المتقدم', {
        description: 'حدث خطأ أثناء إنشاء ملف PDF المتقدم'
      })
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const matchesSearch = searchTerm === '' || 
      alert.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSeverity && matchesSearch
  })

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case 'down':
      case 'decreasing':
        return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
      default:
        return <Activity className="w-4 h-4 text-yellow-500" />
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 8) return 'text-red-600 bg-red-50'
    if (risk >= 6) return 'text-orange-600 bg-orange-50'
    if (risk >= 4) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <h2 className="text-3xl font-bold text-gray-900">جاري تحميل البيانات...</h2>
            </div>
            <p className="text-lg text-gray-600">يتم تحميل آخر التحديثات من المنظمة العالمية لصحة الحيوان</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                التحديثات العالمية لصحة الحيوان
              </h2>
              <p className="text-lg text-gray-600">
                مركز المراقبة والتحليل المتقدم للأمراض الحيوانية
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.globalTrends?.totalOutbreaks || 0}</div>
                <div className="text-sm text-gray-600">تفشي نشط</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats?.globalTrends?.affectedCountries || 0}</div>
                <div className="text-sm text-gray-600">دولة متأثرة</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats?.globalTrends?.economicImpact || 0}B€</div>
                <div className="text-sm text-gray-600">تأثير اقتصادي</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.globalTrends?.vaccinationCoverage || 0}%</div>
                <div className="text-sm text-gray-600">تغطية التطعيم</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">مصدر البيانات: WOAH</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}</span>
            </div>
            <Button 
              onClick={generatePDFReport}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              تنزيل التقرير PDF
            </Button>
            <Button 
              onClick={generateAdvancedPDFReport}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              التقرير المتقدم 🎨
            </Button>
            <Button 
              onClick={() => setShowReportDialog(true)}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              التحليلات المتقدمة
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في التنبيهات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              <option value="all">جميع المستويات</option>
              <option value="high">عالي الخطورة</option>
              <option value="medium">متوسط الخطورة</option>
              <option value="low">منخفض الخطورة</option>
            </select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                التنبيهات النشطة
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                الاتجاهات
              </TabsTrigger>
              <TabsTrigger value="prevention" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                الوقاية
              </TabsTrigger>
              <TabsTrigger value="vaccination" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                التطعيم
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlerts.map((alert, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm cursor-pointer transform hover:scale-105" 
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getRiskColor(alert.riskLevel || 5)}`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' : 
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(alert.trend || 'stable')}
                          <span className="text-xs text-gray-500">{getTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 text-gray-900">{alert.disease}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{alert.location}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{alert.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">الحيوانات المتأثرة:</span>
                          <span className="font-medium">{alert.affectedAnimals?.toLocaleString() || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">التأثير الاقتصادي:</span>
                          <span className="font-medium text-red-600">{alert.economicImpact ? `${(alert.economicImpact.estimatedLoss / 1000000).toFixed(1)}M€` : 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">حالة التطعيم:</span>
                          <span className={`font-medium ${
                            alert.vaccinationStatus?.available ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {alert.vaccinationStatus?.available ? 'متوفر' : 'غير متوفر'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      اتجاهات الأمراض
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.diseases?.map((disease, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-sm">{disease.name}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(disease.trend)}
                          <span className={`text-sm font-medium ${
                            disease.changePercent > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {disease.changePercent > 0 ? '+' : ''}{disease.changePercent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      التقييم الإقليمي للمخاطر
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats && stats.riskAssessment?.regional && Object.entries(stats.riskAssessment.regional).map(([region, risk]) => (
                      <div key={region} className="flex items-center justify-between py-2">
                        <span className="text-sm">{region}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                risk >= 7 ? 'bg-red-500' : risk >= 5 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(risk / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{risk}/10</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="prevention" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alerts.map((alert, index) => (
                  alert.preventionMeasures && (
                    <Card key={index} className="bg-white/90 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">{alert.disease}</CardTitle>
                        <CardDescription>{alert.country}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold mb-2 text-green-700">إجراءات الوقاية:</h4>
                        <ul className="space-y-1">
                          {alert.preventionMeasures.map((measure, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <Shield className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {measure}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </TabsContent>

            <TabsContent value="vaccination" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alerts.map((alert, index) => (
                  alert.vaccinationStatus && (
                    <Card key={index} className="bg-white/90 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">{alert.disease}</CardTitle>
                        <CardDescription>{alert.country}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">التوفر:</span>
                            <Badge variant={alert.vaccinationStatus.available ? "default" : "destructive"}>
                              {alert.vaccinationStatus.available ? 'متوفر' : 'غير متوفر'}
                            </Badge>
                          </div>
                          {alert.vaccinationStatus.available && (
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">التغطية:</span>
                                  <span className="text-sm font-medium">{alert.vaccinationStatus.coverage}%</span>
                                </div>
                                <Progress value={alert.vaccinationStatus.coverage} className="h-2" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">الفعالية:</span>
                                  <span className="text-sm font-medium">{alert.vaccinationStatus.effectiveness}%</span>
                                </div>
                                <Progress value={alert.vaccinationStatus.effectiveness} className="h-2" />
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Live Alerts */}
          <Card className="lg:col-span-2 border-2 border-red-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-red-800">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  التنبيهات الفورية
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <Bell className="w-3 h-3 mr-1" />
                    مباشر
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-red-600 hover:text-red-700"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-red-700">
                تنبيهات فورية حول تفشي الأمراض الحيوانية في العالم
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const severityColor = getSeverityColor(alert.severity)
                  return (
                    <div 
                      key={alert.id} 
                      className={`border-l-4 border-${severityColor}-500 pl-4 py-3 bg-${severityColor}-50 rounded-r-lg ${alert.isNew ? 'ring-2 ring-blue-200 animate-pulse' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold text-${severityColor}-800`}>{alert.disease}</h4>
                            {alert.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                جديد
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm text-${severityColor}-600 mt-1`}>{alert.country} - {alert.location}</p>
                          {alert.description && (
                            <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                          )}
                          {alert.affectedAnimals && (
                            <p className="text-xs text-gray-600 mt-1">الحيوانات المتأثرة: {alert.affectedAnimals.toLocaleString()}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">{getTimeAgo(alert.timestamp)}</p>
                        </div>
                        <Badge variant="outline" className={`text-${severityColor}-600 border-${severityColor}-300`}>
                          {alert.diseaseCode}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  <Globe className="w-4 h-4 mr-2" />
                  عرض جميع التنبيهات العالمية
                  <ExternalLink className="w-3 h-3 mr-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Global Statistics */}
          <Card className="border-2 border-blue-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-3 text-blue-800">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                الإحصائيات العالمية
              </CardTitle>
              <CardDescription className="text-blue-700">
                إحصائيات شاملة للأمراض الحيوانية عالمياً
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {stats ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stats.memberCountries}</div>
                    <div className="text-sm text-gray-600">دولة عضو في WOAH</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">{stats.activeAlerts}</div>
                      <div className="text-xs text-gray-600">تنبيه نشط</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{stats.monthlyReports}</div>
                      <div className="text-xs text-gray-600">تقرير هذا الشهر</div>
                    </div>
                  </div>

                  {stats.diseases && stats.diseases.length > 0 && (
                    <div className="space-y-3">
                      {stats.diseases.map((disease, index) => {
                        const severityColor = getSeverityColor(disease.severity)
                        return (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{disease.name}</span>
                            <span className={`text-sm font-semibold text-${severityColor}-600`}>
                              {disease.count} {disease.count === 1 ? 'دولة' : 'دول'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">جاري تحميل الإحصائيات...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Sources */}
        <Card className="border-2 border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-gray-600" />
              </div>
              مصادر البيانات والمراجع
            </CardTitle>
            <CardDescription>
              المصادر الرسمية للبيانات العالمية لصحة الحيوان
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-sm">WOAH-WAHIS</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">نظام المعلومات العالمي لصحة الحيوان</p>
                <a 
                  href="https://www.woah.org/en/what-we-do/animal-health-and-welfare/disease-data-collection/world-animal-health-information-system/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  زيارة المصدر
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-sm">التنبيهات الفورية</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">تنبيهات الأمراض الاستثنائية</p>
                <a 
                  href="https://www.woah.org/en/what-we-do/animal-health-and-welfare/disease-data-collection/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  زيارة المصدر
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-sm">التقارير النصف سنوية</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">تقارير مراقبة الأمراض</p>
                <a 
                  href="https://www.woah.org/en/what-we-do/animal-health-and-welfare/disease-data-collection/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  زيارة المصدر
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-sm">GLEWS+</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">نظام الإنذار المبكر العالمي</p>
                <a 
                  href="https://www.woah.org/en/what-we-do/animal-health-and-welfare/disease-data-collection/active-search/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  زيارة المصدر
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">i</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">حول البيانات</h4>
                  <p className="text-sm text-blue-700">
                    يتم تحديث البيانات في الوقت الفعلي من خلال نظام WAHIS التابع للمنظمة العالمية لصحة الحيوان (WOAH). 
                    تشمل البيانات التنبيهات الفورية، التقارير النصف سنوية، والمعلومات الوبائية من 182 دولة عضو.
                    يتم إرسال إشعارات فورية عند ظهور تنبيهات جديدة.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Advanced Analytics Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                التحليلات المتقدمة لصحة الحيوان
              </DialogTitle>
              <DialogDescription>
                تحليل شامل للبيانات العالمية لصحة الحيوان مع الاتجاهات والتوقعات
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
                    <div className="text-sm text-blue-700">إجمالي التنبيهات</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {alerts.filter(a => a.severity === 'high').length}
                    </div>
                    <div className="text-sm text-red-700">عالي الخطورة</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {alerts.filter(a => a.severity === 'medium').length}
                    </div>
                    <div className="text-sm text-yellow-700">متوسط الخطورة</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {alerts.filter(a => a.severity === 'low').length}
                    </div>
                    <div className="text-sm text-green-700">منخفض الخطورة</div>
                  </CardContent>
                </Card>
              </div>

              {/* Disease Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    توزيع الأمراض حسب النوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.diseases?.map((disease, index) => {
                      const percentage = (disease.cases / (stats?.globalTrends?.totalOutbreaks || 1)) * 100
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{disease.name}</span>
                          <div className="flex items-center gap-2 flex-1 mx-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 min-w-[3rem]">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    التحليل الجغرافي للمخاطر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats && stats.riskAssessment?.regional && Object.entries(stats.riskAssessment.regional).map(([region, risk]) => (
                      <div key={region} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{region}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            risk >= 7 ? 'bg-red-100 text-red-800' : 
                            risk >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {risk >= 7 ? 'عالي' : risk >= 5 ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                        <Progress value={(risk / 10) * 100} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">مستوى المخاطر: {risk}/10</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Economic Impact Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    تحليل التأثير الاقتصادي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {stats?.globalTrends?.economicImpact}B€
                        </div>
                        <div className="text-sm text-red-700">إجمالي الخسائر</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {alerts.reduce((sum, alert) => sum + (alert.economicImpact?.estimatedLoss || 0), 0) / 1000000}M€
                        </div>
                        <div className="text-sm text-blue-700">خسائر مباشرة</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {((alerts.reduce((sum, alert) => sum + (alert.economicImpact?.estimatedLoss || 0), 0) / 1000000) * 0.3).toFixed(1)}M€
                        </div>
                        <div className="text-sm text-yellow-700">تكاليف الوقاية</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button onClick={generatePDFReport} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  تنزيل التقرير الكامل
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة التحليل
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Details Dialog */}
        {selectedAlert && (
          <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    selectedAlert.severity === 'high' ? 'text-red-500' : 
                    selectedAlert.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  {selectedAlert.disease}
                </DialogTitle>
                <DialogDescription>
                  {selectedAlert.location} • {getTimeAgo(selectedAlert.timestamp)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">وصف الحالة</h4>
                  <p className="text-gray-700">{selectedAlert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">الإحصائيات</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>الحيوانات المتأثرة:</span>
                        <span className="font-medium">{selectedAlert.affectedAnimals?.toLocaleString() || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>مستوى المخاطر:</span>
                        <span className="font-medium">{selectedAlert.riskLevel || 'غير محدد'}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الانتشار الجغرافي:</span>
                        <span className="font-medium">{selectedAlert.geographicSpread?.affectedAreas?.length || 0} منطقة</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">التأثير الاقتصادي</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>الخسائر المقدرة:</span>
                        <span className="font-medium text-red-600">
                          {selectedAlert.economicImpact ? `${(selectedAlert.economicImpact.estimatedLoss / 1000000).toFixed(1)}M€` : 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>القطاعات المتأثرة:</span>
                        <span className="font-medium">{selectedAlert.economicImpact?.affectedSectors?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAlert.preventionMeasures && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">إجراءات الوقاية</h4>
                    <ul className="space-y-1">
                      {selectedAlert.preventionMeasures.map((measure, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Shield className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {measure}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAlert.vaccinationStatus && (
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-700">حالة التطعيم</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">التوفر:</span>
                        <Badge variant={selectedAlert.vaccinationStatus.available ? "default" : "destructive"}>
                          {selectedAlert.vaccinationStatus.available ? 'متوفر' : 'غير متوفر'}
                        </Badge>
                      </div>
                      {selectedAlert.vaccinationStatus.available && (
                        <>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">التغطية:</span>
                              <span className="text-sm font-medium">{selectedAlert.vaccinationStatus.coverage}%</span>
                            </div>
                            <Progress value={selectedAlert.vaccinationStatus.coverage} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">الفعالية:</span>
                              <span className="text-sm font-medium">{selectedAlert.vaccinationStatus.effectiveness}%</span>
                            </div>
                            <Progress value={selectedAlert.vaccinationStatus.effectiveness} className="h-2" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}