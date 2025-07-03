import { NextRequest, NextResponse } from 'next/server'

// Mock data structure for WOAH alerts
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
}

interface WOAHStats {
  memberCountries: number
  activeAlerts: number
  monthlyReports: number
  diseases: {
    name: string
    count: number
    severity: 'high' | 'medium' | 'low'
  }[]
}

// Mock data - in production, this would fetch from WOAH's WAHIS system
const mockAlerts: WOAHAlert[] = [
  {
    id: '2024-001',
    disease: 'إنفلونزا الطيور عالية الإمراضية',
    location: 'منطقة نورماندي',
    country: 'فرنسا',
    severity: 'high',
    diseaseCode: 'H5N1',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    description: 'تفشي إنفلونزا الطيور في مزارع الدواجن',
    affectedAnimals: 15000,
    controlMeasures: ['الحجر الصحي', 'إعدام الطيور المصابة', 'تطهير المزارع']
  },
  {
    id: '2024-002',
    disease: 'حمى الخنازير الأفريقية',
    location: 'ولاية ساكسونيا',
    country: 'ألمانيا',
    severity: 'medium',
    diseaseCode: 'ASF',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    description: 'حالات إصابة في الخنازير البرية',
    affectedAnimals: 45,
    controlMeasures: ['مراقبة الحياة البرية', 'تقييد الحركة', 'تعزيز الأمن الحيوي']
  },
  {
    id: '2024-003',
    disease: 'مرض اللسان الأزرق',
    location: 'منطقة الأندلس',
    country: 'إسبانيا',
    severity: 'low',
    diseaseCode: 'BTV-3',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    description: 'حالات محدودة في قطعان الأغنام',
    affectedAnimals: 120,
    controlMeasures: ['التطعيم', 'مكافحة الحشرات الناقلة', 'المراقبة المكثفة']
  },
  {
    id: '2024-004',
    disease: 'مرض جنون البقر',
    location: 'مقاطعة ألبرتا',
    country: 'كندا',
    severity: 'high',
    diseaseCode: 'BSE',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    description: 'حالة مؤكدة في بقرة عمرها 8 سنوات',
    affectedAnimals: 1,
    controlMeasures: ['إعدام القطيع', 'تتبع المصدر', 'حظر الأعلاف']
  },
  {
    id: '2024-005',
    disease: 'حمى الوادي المتصدع',
    location: 'منطقة دودوما',
    country: 'تنزانيا',
    severity: 'medium',
    diseaseCode: 'RVF',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    description: 'تفشي في الماشية والأغنام',
    affectedAnimals: 350,
    controlMeasures: ['التطعيم الطارئ', 'مكافحة البعوض', 'تقييد حركة الحيوانات']
  }
]

const mockStats: WOAHStats = {
  memberCountries: 182,
  activeAlerts: 24,
  monthlyReports: 156,
  diseases: [
    { name: 'إنفلونزا الطيور', count: 12, severity: 'high' },
    { name: 'حمى الخنازير الأفريقية', count: 8, severity: 'medium' },
    { name: 'مرض اللسان الأزرق', count: 6, severity: 'low' },
    { name: 'مرض جنون البقر', count: 3, severity: 'high' },
    { name: 'حمى الوادي المتصدع', count: 4, severity: 'medium' }
  ]
}

// Simulate real-time data updates
function generateRandomAlert(): WOAHAlert {
  const diseases = [
    { name: 'إنفلونزا الطيور', code: 'H5N1', severity: 'high' as const },
    { name: 'حمى الخنازير الأفريقية', code: 'ASF', severity: 'medium' as const },
    { name: 'مرض اللسان الأزرق', code: 'BTV', severity: 'low' as const },
    { name: 'مرض الحمى القلاعية', code: 'FMD', severity: 'high' as const },
    { name: 'داء الكلب', code: 'RAB', severity: 'medium' as const }
  ]
  
  const countries = [
    { name: 'البرازيل', location: 'ولاية ساو باولو' },
    { name: 'الهند', location: 'ولاية راجستان' },
    { name: 'أستراليا', location: 'نيو ساوث ويلز' },
    { name: 'جنوب أفريقيا', location: 'مقاطعة الكاب الغربية' },
    { name: 'الأرجنتين', location: 'مقاطعة بوينس آيرس' }
  ]
  
  const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]
  const randomCountry = countries[Math.floor(Math.random() * countries.length)]
  
  return {
    id: `2024-${Date.now()}`,
    disease: randomDisease.name,
    location: randomCountry.location,
    country: randomCountry.name,
    severity: randomDisease.severity,
    diseaseCode: randomDisease.code,
    timestamp: new Date().toISOString(),
    description: `تفشي جديد تم الإبلاغ عنه في ${randomCountry.location}`,
    affectedAnimals: Math.floor(Math.random() * 1000) + 10,
    controlMeasures: ['تحت التحقيق', 'تطبيق إجراءات الطوارئ']
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'alerts'
    const limit = parseInt(searchParams.get('limit') || '10')
    const since = searchParams.get('since')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (type === 'stats') {
      // Update stats with some randomization
      const updatedStats = {
        ...mockStats,
        activeAlerts: mockStats.activeAlerts + Math.floor(Math.random() * 5) - 2,
        monthlyReports: mockStats.monthlyReports + Math.floor(Math.random() * 10)
      }
      
      return NextResponse.json({
        success: true,
        data: updatedStats,
        timestamp: new Date().toISOString()
      })
    }
    
    if (type === 'alerts') {
      let alerts = [...mockAlerts]
      
      // Add some random new alerts (10% chance)
      if (Math.random() < 0.1) {
        alerts.unshift(generateRandomAlert())
      }
      
      // Filter by timestamp if 'since' parameter is provided
      if (since) {
        const sinceDate = new Date(since)
        alerts = alerts.filter(alert => new Date(alert.timestamp) > sinceDate)
      }
      
      // Limit results
      alerts = alerts.slice(0, limit)
      
      return NextResponse.json({
        success: true,
        data: alerts,
        total: alerts.length,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('WOAH API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'subscribe') {
      // In a real implementation, this would subscribe to WOAH's notification system
      return NextResponse.json({
        success: true,
        message: 'تم الاشتراك في التنبيهات بنجاح',
        subscriptionId: `sub_${Date.now()}`
      })
    }
    
    if (action === 'refresh') {
      // Force refresh data
      const newAlert = generateRandomAlert()
      return NextResponse.json({
        success: true,
        data: newAlert,
        message: 'تم تحديث البيانات'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('WOAH API POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}