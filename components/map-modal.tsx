"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map, X, Download } from "lucide-react"

// دالة تحميل الخريطة
const downloadMap = async (mapPath: string, mapName: string) => {
  try {
    const response = await fetch(mapPath)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${mapName}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('خطأ في تحميل الخريطة:', error)
    alert('فشل في تحميل الخريطة')
  }
}

interface MapModalProps {
  mapName: string
  mapPath: string
  title: string
  description?: string
  triggerText?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function MapModal({ 
  mapName, 
  mapPath, 
  title, 
  description, 
  triggerText, 
  variant = "outline",
  size = "sm"
}: MapModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Map className="h-4 w-4" />
          {triggerText || `عرض خريطة ${mapName}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadMap(mapPath, mapName)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل الخريطة
            </Button>
            <div className="text-right">
              <DialogTitle className="text-xl font-bold">
                {title}
              </DialogTitle>
              {description && (
                <p className="text-muted-foreground mt-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="relative bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            {!imageLoaded && !imageError && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
              </div>
            )}
            
            {imageError && (
              <div className="text-center text-red-500">
                <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>فشل في تحميل الخريطة</p>
                <p className="text-sm text-muted-foreground mt-1">
                  المسار: {mapPath}
                </p>
              </div>
            )}
            
            <img
              src={mapPath}
              alt={`خريطة ${mapName}`}
              className={`max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg ${
                imageLoaded ? 'block' : 'hidden'
              }`}
              onLoad={() => {
                setImageLoaded(true)
                setImageError(false)
              }}
              onError={() => {
                setImageError(true)
                setImageLoaded(false)
              }}
            />
          </div>
          
          {imageLoaded && (
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="text-xs">
                خريطة {mapName}
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// مكون منفصل لعرض خريطة واحدة في نافذة منبثقة
export function SimpleMapModal({ 
  isOpen, 
  onClose, 
  mapPath 
}: { 
  isOpen: boolean
  onClose: () => void
  mapPath: string | null 
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!isOpen || !mapPath) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const mapName = mapPath.split('/').pop()?.replace('.svg', '') || 'خريطة'
                downloadMap(mapPath, mapName)
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل الخريطة
            </Button>
            <DialogTitle className="text-right text-xl font-bold">
              عرض الخريطة
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="relative bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            {!imageLoaded && !imageError && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
              </div>
            )}
            
            {imageError && (
              <div className="text-center text-red-500">
                <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>فشل في تحميل الخريطة</p>
                <p className="text-sm text-muted-foreground mt-1">
                  المسار: {mapPath}
                </p>
              </div>
            )}
            
            <img
              src={mapPath}
              alt="خريطة"
              className={`max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg ${
                imageLoaded ? 'block' : 'hidden'
              }`}
              onLoad={() => {
                setImageLoaded(true)
                setImageError(false)
              }}
              onError={() => {
                setImageError(true)
                setImageLoaded(false)
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// مكون لعرض قائمة جميع الخرائط
export function AllMapsModalComponent({ 
  isOpen, 
  onClose, 
  onSelectMap 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelectMap: (mapPath: string) => void 
}) {
  const maps = [
    {
      name: "المملكة العربية السعودية",
      path: "/المملكة والمناطق/خريطة المملكة.svg",
      description: "الخريطة الكاملة للمملكة العربية السعودية"
    },
    {
      name: "المملكة بالمحافظات",
      path: "/المملكة والمناطق/المملكة بالمحافظات.svg",
      description: "خريطة المملكة مع تفاصيل المحافظات"
    },
    {
      name: "حدود المناطق",
      path: "/المملكة والمناطق/حدود المناطق.svg",
      description: "خريطة حدود المناطق الإدارية"
    },
    {
      name: "منطقة الرياض",
      path: "/المملكة والمناطق/منطقة الرياض.svg",
      description: "خريطة منطقة الرياض"
    },
    {
      name: "مكة المكرمة",
      path: "/المملكة والمناطق/مكة المكرمة.svg",
      description: "خريطة منطقة مكة المكرمة"
    },
    {
      name: "المدينة المنورة",
      path: "/المملكة والمناطق/المدينة المنورة.svg",
      description: "خريطة منطقة المدينة المنورة"
    },
    {
      name: "المنطقة الشرقية",
      path: "/المملكة والمناطق/المنطقة الشرقية.svg",
      description: "خريطة المنطقة الشرقية"
    },
    {
      name: "عسير",
      path: "/المملكة والمناطق/عسير.svg",
      description: "خريطة منطقة عسير"
    },
    {
      name: "تبوك",
      path: "/المملكة والمناطق/تبوك.svg",
      description: "خريطة منطقة تبوك"
    },
    {
      name: "القصيم",
      path: "/المملكة والمناطق/القصيم.svg",
      description: "خريطة منطقة القصيم"
    },
    {
      name: "حائل",
      path: "/المملكة والمناطق/حائل.svg",
      description: "خريطة منطقة حائل"
    },
    {
      name: "الحدود الشمالية",
      path: "/المملكة والمناطق/الحدود الشمالية.svg",
      description: "خريطة منطقة الحدود الشمالية"
    },
    {
      name: "جازان",
      path: "/المملكة والمناطق/منطقة جازان.svg",
      description: "خريطة منطقة جازان"
    },
    {
      name: "نجران",
      path: "/المملكة والمناطق/نجران.svg",
      description: "خريطة منطقة نجران"
    },
    {
      name: "الباحة",
      path: "/المملكة والمناطق/الباحة.svg",
      description: "خريطة منطقة الباحة"
    },
    {
      name: "الجوف",
      path: "/المملكة والمناطق/الجوف.svg",
      description: "خريطة منطقة الجوف"
    }
  ]

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold">
            خرائط المملكة العربية السعودية والمناطق
          </DialogTitle>
          <p className="text-right text-muted-foreground mt-2">
            مجموعة شاملة من خرائط المملكة والمناطق الإدارية
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {maps.map((map, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-right mb-2">{map.name}</h3>
              <p className="text-sm text-muted-foreground text-right mb-3">
                {map.description}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectMap(map.path)}
                  className="flex-1"
                >
                  <Map className="h-4 w-4 ml-1" />
                  عرض الخريطة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadMap(map.path, map.name)}
                  className="px-3"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// مكون خاص لعرض جميع الخرائط (النسخة الأصلية)
export function AllMapsModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  const maps = [
    {
      name: "المملكة العربية السعودية",
      path: "/المملكة والمناطق/خريطة المملكة.svg",
      description: "الخريطة الكاملة للمملكة العربية السعودية"
    },
    {
      name: "المملكة بالمحافظات",
      path: "/المملكة والمناطق/المملكة بالمحافظات.svg",
      description: "خريطة المملكة مع تفاصيل المحافظات"
    },
    {
      name: "حدود المناطق",
      path: "/المملكة والمناطق/حدود المناطق.svg",
      description: "خريطة حدود المناطق الإدارية"
    },
    {
      name: "منطقة الرياض",
      path: "/المملكة والمناطق/منطقة الرياض.svg",
      description: "خريطة منطقة الرياض"
    },
    {
      name: "مكة المكرمة",
      path: "/المملكة والمناطق/مكة المكرمة.svg",
      description: "خريطة منطقة مكة المكرمة"
    },
    {
      name: "المدينة المنورة",
      path: "/المملكة والمناطق/المدينة المنورة.svg",
      description: "خريطة منطقة المدينة المنورة"
    },
    {
      name: "المنطقة الشرقية",
      path: "/المملكة والمناطق/المنطقة الشرقية.svg",
      description: "خريطة المنطقة الشرقية"
    },
    {
      name: "عسير",
      path: "/المملكة والمناطق/عسير.svg",
      description: "خريطة منطقة عسير"
    },
    {
      name: "تبوك",
      path: "/المملكة والمناطق/تبوك.svg",
      description: "خريطة منطقة تبوك"
    },
    {
      name: "القصيم",
      path: "/المملكة والمناطق/القصيم.svg",
      description: "خريطة منطقة القصيم"
    },
    {
      name: "حائل",
      path: "/المملكة والمناطق/حائل.svg",
      description: "خريطة منطقة حائل"
    },
    {
      name: "الحدود الشمالية",
      path: "/المملكة والمناطق/الحدود الشمالية.svg",
      description: "خريطة منطقة الحدود الشمالية"
    },
    {
      name: "جازان",
      path: "/المملكة والمناطق/منطقة جازان.svg",
      description: "خريطة منطقة جازان"
    },
    {
      name: "نجران",
      path: "/المملكة والمناطق/نجران.svg",
      description: "خريطة منطقة نجران"
    },
    {
      name: "الباحة",
      path: "/المملكة والمناطق/الباحة.svg",
      description: "خريطة منطقة الباحة"
    },
    {
      name: "الجوف",
      path: "/المملكة والمناطق/الجوف.svg",
      description: "خريطة منطقة الجوف"
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Map className="h-4 w-4" />
          عرض جميع الخرائط
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold">
            خرائط المملكة العربية السعودية والمناطق
          </DialogTitle>
          <p className="text-right text-muted-foreground mt-2">
            مجموعة شاملة من خرائط المملكة والمناطق الإدارية
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {maps.map((map, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-right mb-2">{map.name}</h3>
              <p className="text-sm text-muted-foreground text-right mb-3">
                {map.description}
              </p>
              <MapModal
                mapName={map.name}
                mapPath={map.path}
                title={`خريطة ${map.name}`}
                description={map.description}
                triggerText="عرض الخريطة"
                variant="secondary"
                size="sm"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}