import type { NextRequest, NextResponse } from "next/server"

// إحصائيات الأداء
interface PerformanceMetrics {
  timestamp: number
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: number
  activeConnections: number
  errorCount: number
  requestCount: number
}

class MonitoringService {
  private metrics: PerformanceMetrics[] = []
  private errorCount = 0
  private requestCount = 0
  private startTime = Date.now()

  // تسجيل طلب جديد
  logRequest(req: NextRequest, responseTime: number) {
    this.requestCount++

    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      responseTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage().user / 1000000, // تحويل إلى ثواني
      activeConnections: this.getActiveConnections(),
      errorCount: this.errorCount,
      requestCount: this.requestCount,
    }

    this.metrics.push(metric)

    // الاحتفاظ بآخر 1000 قياس فقط
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // تسجيل في وحدة التحكم إذا كان الوقت طويل
    if (responseTime > 5000) {
      console.warn(`⚠️  طلب بطيء: ${req.url} - ${responseTime}ms`)
    }
  }

  // تسجيل خطأ
  logError(error: Error, req?: NextRequest) {
    this.errorCount++

    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      url: req?.url,
      method: req?.method,
      userAgent: req?.headers.get("user-agent"),
      ip: req?.ip || req?.headers.get("x-forwarded-for"),
    }

    console.error("❌ خطأ في التطبيق:", errorInfo)

    // إرسال إلى خدمة المراقبة الخارجية
    this.sendToExternalMonitoring(errorInfo)
  }

  // الحصول على عدد الاتصالات النشطة
  private getActiveConnections(): number {
    // في بيئة الإنتاج، يمكن الحصول على هذه المعلومة من خادم HTTP
    return 0
  }

  // إرسال إلى خدمة مراقبة خارجية
  private async sendToExternalMonitoring(data: any) {
    try {
      // يمكن إرسال البيانات إلى Sentry، DataDog، أو أي خدمة مراقبة أخرى
      if (process.env.MONITORING_WEBHOOK_URL) {
        await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      }
    } catch (error) {
      console.error("فشل في إرسال البيانات للمراقبة:", error)
    }
  }

  // الحصول على إحصائيات الأداء
  getMetrics() {
    const now = Date.now()
    const uptime = now - this.startTime

    // حساب المتوسطات
    const recentMetrics = this.metrics.slice(-100) // آخر 100 قياس
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length || 0
    const avgMemoryUsage = recentMetrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentMetrics.length || 0

    return {
      uptime,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      memoryUsage: {
        used: Math.round(avgMemoryUsage / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
      },
      recentMetrics: recentMetrics.slice(-10), // آخر 10 قياسات
    }
  }

  // فحص صحة النظام
  async healthCheck() {
    const metrics = this.getMetrics()

    const health = {
      status: "healthy" as "healthy" | "warning" | "critical",
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      checks: {
        memory: {
          status: metrics.memoryUsage.used < 500 ? "healthy" : "warning",
          used: metrics.memoryUsage.used,
          total: metrics.memoryUsage.total,
        },
        responseTime: {
          status: metrics.avgResponseTime < 1000 ? "healthy" : "warning",
          average: metrics.avgResponseTime,
        },
        errorRate: {
          status: metrics.errorRate < 5 ? "healthy" : "warning",
          rate: metrics.errorRate,
        },
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
      },
    }

    // تحديد الحالة العامة
    const checkStatuses = Object.values(health.checks).map((check) => check.status)
    if (checkStatuses.includes("critical")) {
      health.status = "critical"
    } else if (checkStatuses.includes("warning")) {
      health.status = "warning"
    }

    return health
  }

  // فحص قاعدة البيانات
  private async checkDatabase() {
    try {
      const { Database } = await import("./database")
      const result = await Database.query("SELECT 1")
      return {
        status: "healthy" as const,
        responseTime: Date.now(),
      }
    } catch (error) {
      return {
        status: "critical" as const,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // فحص Redis
  private async checkRedis() {
    try {
      // إذا كان Redis مُعد
      if (process.env.REDIS_URL) {
        // يمكن إضافة فحص Redis هنا
        return {
          status: "healthy" as const,
          responseTime: Date.now(),
        }
      }
      return {
        status: "healthy" as const,
        message: "Redis not configured",
      }
    } catch (error) {
      return {
        status: "critical" as const,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// إنشاء instance واحد للمراقبة
export const monitoring = new MonitoringService()

// Middleware للمراقبة
export function withMonitoring(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()

    try {
      const response = await handler(req)
      const responseTime = Date.now() - startTime

      monitoring.logRequest(req, responseTime)

      return response
    } catch (error) {
      const responseTime = Date.now() - startTime
      monitoring.logRequest(req, responseTime)

      if (error instanceof Error) {
        monitoring.logError(error, req)
      }

      throw error
    }
  }
}
