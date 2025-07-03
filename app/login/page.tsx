"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // محاكاة تسجيل الدخول
    if (formData.username === "admin" && formData.password === "admin123") {
      alert("تم تسجيل الدخول بنجاح! سيتم توجيهك إلى لوحة التحكم")
      window.location.href = "/dashboard"
    } else {
      alert("اسم المستخدم أو كلمة المرور غير صحيحة")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-primary">منصة مناعة</h1>
              <p className="text-sm text-muted-foreground">إدارة ورصد الأمراض الوبائية</p>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بيانات الدخول للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  اسم المستخدم
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المستخدم"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="أدخل كلمة المرور"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right pr-10"
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full">
                تسجيل الدخول
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">للحصول على حساب جديد، تواصل مع مدير النظام</p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">بيانات تجريبية:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>المدير:</strong> admin / admin123
              </p>
              <p>
                <strong>مدخل البيانات:</strong> data_entry / data123
              </p>
              <p>
                <strong>مشاهد:</strong> viewer / view123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
            <ArrowRight className="w-4 h-4 ml-1" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
