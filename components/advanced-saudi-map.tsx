'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MapPin, Users, Building, Home, Download, Filter, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Region {
  region_id: number
  capital_city_id: number
  code: string
  name_ar: string
  name_en: string
  population: number
  center: [number, number]
  boundaries?: [number, number][][]
}

interface City {
  city_id: number
  region_id: number
  name_ar: string
  name_en: string
  center: [number, number]
}

interface District {
  district_id: number
  city_id: number
  name_ar: string
  name_en: string
  center: [number, number]
}

interface MapSettings {
  isEnabled: boolean
  showPopulation: boolean
  showCities: boolean
  showDistricts: boolean
  enableSearch: boolean
  enableDownload: boolean
  defaultZoom: number
  showLegend: boolean
  colorScheme: string
  enableRegionSelection: boolean
  showStatistics: boolean
}

interface AdvancedSaudiMapProps {
  mapSettings?: MapSettings
  regions?: Record<string, unknown>[]
}

const AdvancedSaudiMap: React.FC<AdvancedSaudiMapProps> = ({ mapSettings, regions: passedRegions }) => {
  // الإعدادات الافتراضية
  const defaultSettings: MapSettings = {
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
  }
  
  const settings = mapSettings || defaultSettings
  const [regions, setRegions] = useState<Region[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('map')
  const [loading, setLoading] = useState(true)
  const [mapInstance, setMapInstance] = useState<unknown>(null)
  const [zoomLevel, setZoomLevel] = useState(6)
  const [mapContainerId] = useState(`map-container-${Math.random().toString(36).substr(2, 9)}`)
  const mapRef = useRef<HTMLDivElement>(null)

  // Load data from JSON files or use passed regions
  useEffect(() => {
    const loadData = async () => {
      try {
        // إذا تم تمرير بيانات المناطق، استخدمها
        if (passedRegions && passedRegions.length > 0) {
          // تحويل بيانات المناطق من لوحة التحكم إلى تنسيق الخريطة
          const convertedRegions = passedRegions.map((region, index) => ({
            region_id: index + 1,
            capital_city_id: 1,
            code: region.code || `R${index + 1}`,
            name_ar: region.nameAr,
            name_en: region.nameEn || region.nameAr,
            population: region.governorates?.reduce((total: number, gov: Record<string, unknown>) => {
              return total + (gov.population || 100000)
            }, 0) || 500000,
            center: region.center || [24.0 + (index * 2), 45.0 + (index * 2)]
          }))
          
          setRegions(convertedRegions)
          setCities([])
          setDistricts([])
          setLoading(false)
          return
        }
        
        // وإلا، حمل البيانات من ملفات JSON
        const [regionsRes, citiesRes, districtsRes] = await Promise.all([
          fetch('/saudi-data/regions.json'),
          fetch('/saudi-data/cities.json'),
          fetch('/saudi-data/districts.json')
        ])

        const regionsData = await regionsRes.json()
        const citiesData = await citiesRes.json()
        const districtsData = await districtsRes.json()

        setRegions(regionsData)
        setCities(citiesData)
        setDistricts(districtsData)
        setLoading(false)
      } catch (error) {
        // eslint-disable-next-line no-console
      console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [passedRegions])

  // Filter cities based on selected region
  useEffect(() => {
    if (selectedRegion) {
      const regionCities = cities.filter(city => city.region_id === selectedRegion.region_id)
      setFilteredCities(regionCities)
    } else {
      setFilteredCities(cities)
    }
  }, [selectedRegion, cities])

  // Filter districts based on selected city
  useEffect(() => {
    if (selectedCity) {
      const cityDistricts = districts.filter(district => district.city_id === selectedCity.city_id)
      setFilteredDistricts(cityDistricts)
    } else {
      setFilteredDistricts(districts)
    }
  }, [selectedCity, districts])

  // Initialize Leaflet Map
  useEffect(() => {
    const loadMap = async () => {
      if (!regions.length || !mapRef.current) return
      
      // تنظيف الخريطة السابقة إذا كانت موجودة
      if (mapInstance) {
        try {
          mapInstance.off()
          mapInstance.remove()
        } catch (error) {
          // eslint-disable-next-line no-console
        console.warn('Error removing previous map instance:', error)
        }
        setMapInstance(null)
      }
      
      // تنظيف محتوى الحاوية
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
      
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

        // التأكد من أن العنصر المرجعي متاح
        if (!mapRef.current) return

        // إنشاء الخريطة
        const map = L.map(mapRef.current, {
          center: [24.0, 45.0], // وسط المملكة
          zoom: settings.defaultZoom,
          zoomControl: false,
          attributionControl: false,
        })

        // إضافة طبقة الخريطة الأساسية
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map)

        // ألوان المناطق حسب عدد السكان
        const getRegionColor = (population: number) => {
          if (population > 6000000) return "#ef4444" // أحمر للمناطق الكبيرة
          if (population > 3000000) return "#f97316" // برتقالي
          if (population > 1500000) return "#eab308" // أصفر
          if (population > 800000) return "#22c55e" // أخضر
          return "#3b82f6" // أزرق للمناطق الصغيرة
        }

        // إضافة المناطق كدوائر ملونة
        regions.forEach((region) => {
          const circle = L.circle(region.center as [number, number], {
            color: getRegionColor(region.population),
            fillColor: getRegionColor(region.population),
            fillOpacity: 0.3,
            radius: Math.sqrt(region.population) * 80, // حجم الدائرة حسب عدد السكان
            weight: 3,
          }).addTo(map)

          // إضافة tooltip
          circle.bindTooltip(
            `
            <div style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif;">
              <strong>${region.name_ar}</strong><br/>
              السكان: ${region.population.toLocaleString("ar-SA")}<br/>
              المدن: ${cities.filter(c => c.region_id === region.region_id).length}
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
              <h3 style="margin: 0 0 10px 0; color: #09764c;">${region.name_ar}</h3>
              <p><strong>الاسم الإنجليزي:</strong> ${region.name_en}</p>
              <p><strong>الرمز:</strong> ${region.code}</p>
              <p><strong>عدد السكان:</strong> ${region.population.toLocaleString("ar-SA")}</p>
              <p><strong>عدد المدن:</strong> ${cities.filter(c => c.region_id === region.region_id).length}</p>
              <p><strong>الإحداثيات:</strong> ${region.center[0].toFixed(2)}, ${region.center[1].toFixed(2)}</p>
            </div>
          `)

          // إضافة أحداث النقر
          circle.on("click", () => {
            setSelectedRegion(region)
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
        const LegendControl = L.Control.extend({
          onAdd: function() {
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

            let legendHtml = '<h4 style="margin: 0 0 8px 0; color: #09764c;">عدد السكان</h4>'
            const populationRanges = [
              { range: "أكثر من 6 مليون", color: "#ef4444" },
              { range: "3-6 مليون", color: "#f97316" },
              { range: "1.5-3 مليون", color: "#eab308" },
              { range: "0.8-1.5 مليون", color: "#22c55e" },
              { range: "أقل من 0.8 مليون", color: "#3b82f6" }
            ]
            
            populationRanges.forEach(({ range, color }) => {
              legendHtml += `
                <div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
                  <div style="width: 16px; height: 16px; background: ${color}; border-radius: 50%; border: 2px solid ${color};"></div>
                  <span style="font-size: 12px;">${range}</span>
                </div>
              `
            })

            div.innerHTML = legendHtml
            return div
          }
        })
        
        const legend = new LegendControl({ position: "bottomright" })
        legend.addTo(map)

        setMapInstance(map)
        setZoomLevel(settings.defaultZoom)
      } catch (error) {
        // eslint-disable-next-line no-console
      console.error("Error loading map:", error)
      }
    }

    loadMap()

    return () => {
      // تنظيف الخريطة عند إلغاء تحميل المكون
      if (mapInstance) {
        try {
          mapInstance.off()
          mapInstance.remove()
        } catch (error) {
          // eslint-disable-next-line no-console
      console.warn('Error during map cleanup:', error)
        }
        setMapInstance(null)
      }
      
      // تنظيف محتوى الحاوية
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
    }
  }, [regions, cities]) // إزالة mapInstance من التبعيات لتجنب إعادة التهيئة غير الضرورية

  // Search functionality
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase()
    
    switch (activeTab) {
      case 'regions':
        return regions.filter(region => 
          region.name_ar.includes(term) || 
          region.name_en.toLowerCase().includes(term) ||
          region.code.toLowerCase().includes(term)
        )
      case 'cities':
        return filteredCities.filter(city => 
          city.name_ar.includes(term) || 
          city.name_en.toLowerCase().includes(term)
        )
      case 'districts':
        return filteredDistricts.filter(district => 
          district.name_ar.includes(term) || 
          district.name_en.toLowerCase().includes(term)
        )
      default:
        return []
    }
  }

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region)
    setSelectedCity(null)
    setActiveTab('cities')
  }

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setActiveTab('districts')
  }

  const resetSelection = () => {
    setSelectedRegion(null)
    setSelectedCity(null)
    setSearchTerm('')
    setActiveTab('regions')
  }

  const downloadData = (type: string) => {
    const data = type === 'regions' ? regions : type === 'cities' ? cities : districts
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `saudi-${type}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المملكة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          خريطة المملكة العربية السعودية التفاعلية
        </h1>
        <p className="text-gray-600 text-lg">
          استكشف {regions.length} منطقة و {cities.length} مدينة و {districts.length} حي في المملكة
        </p>
      </div>

      {/* Navigation Breadcrumb */}
      {(selectedRegion || selectedCity) && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                المملكة العربية السعودية
              </Button>
              {selectedRegion && (
                <>
                  <span className="text-gray-400">/</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCity(null)
                      setActiveTab('cities')
                    }}
                  >
                    {selectedRegion.name_ar}
                  </Button>
                </>
              )}
              {selectedCity && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="font-medium">{selectedCity.name_ar}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {(settings.enableSearch || settings.enableDownload) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {settings.enableSearch && (
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="ابحث في المناطق، المدن، أو الأحياء..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 text-right"
                  />
                </div>
              )}
              <div className="flex gap-2">
                {settings.enableRegionSelection && (
                  <Select value={selectedRegion?.region_id.toString() || 'all'} onValueChange={(value) => {
                    if (value === 'all') {
                      setSelectedRegion(null)
                    } else {
                      const region = regions.find(r => r.region_id === parseInt(value))
                      if (region) handleRegionSelect(region)
                    }
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="اختر المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المناطق</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region.region_id} value={region.region_id.toString()}>
                          {region.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {settings.enableDownload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadData(activeTab)}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تحميل البيانات
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {settings.showStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">المناطق</p>
                  <p className="text-2xl font-bold">{regions.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          {settings.showCities && (
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">المدن</p>
                    <p className="text-2xl font-bold">{filteredCities.length}</p>
                  </div>
                  <Building className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          )}
          
          {settings.showDistricts && (
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">الأحياء</p>
                    <p className="text-2xl font-bold">{filteredDistricts.length}</p>
                  </div>
                  <Home className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          )}
          
          {settings.showPopulation && (
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">إجمالي السكان</p>
                    <p className="text-2xl font-bold">
                      {(selectedRegion ? selectedRegion.population : regions.reduce((sum, r) => sum + r.population, 0)).toLocaleString()}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${
          settings.showCities && settings.showDistricts ? 'grid-cols-4' :
          settings.showCities || settings.showDistricts ? 'grid-cols-3' :
          'grid-cols-2'
        }`}>
          <TabsTrigger value="map">الخريطة التفاعلية</TabsTrigger>
          <TabsTrigger value="regions">المناطق ({regions.length})</TabsTrigger>
          {settings.showCities && (
            <TabsTrigger value="cities">المدن ({filteredCities.length})</TabsTrigger>
          )}
          {settings.showDistricts && (
            <TabsTrigger value="districts">الأحياء ({filteredDistricts.length})</TabsTrigger>
          )}
        </TabsList>

        {/* Interactive Map Tab */}
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  الخريطة التفاعلية للمملكة العربية السعودية
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    if (mapInstance) {
                      const newZoom = Math.min(zoomLevel + 1, 10)
                      setZoomLevel(newZoom)
                      mapInstance.setZoom(newZoom)
                    }
                  }}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (mapInstance) {
                      const newZoom = Math.max(zoomLevel - 1, 4)
                      setZoomLevel(newZoom)
                      mapInstance.setZoom(newZoom)
                    }
                  }}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (mapInstance) {
                      mapInstance.setView([24.0, 45.0], 6)
                      setZoomLevel(6)
                      setSelectedRegion(null)
                    }
                  }}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {selectedRegion && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">المنطقة المحددة:</span>
                  <Badge variant="secondary">{selectedRegion.name_ar}</Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div 
                key={mapContainerId}
                ref={mapRef} 
                className="w-full h-96 rounded-lg border bg-gray-100"
                style={{ minHeight: '400px' }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(getFilteredData() as Region[]).map((region: Region) => (
              <Card 
                key={region.region_id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                onClick={() => handleRegionSelect(region)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{region.name_ar}</CardTitle>
                      <p className="text-sm text-gray-500">{region.name_en}</p>
                    </div>
                    <Badge variant="secondary">{region.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">عدد السكان:</span>
                      <span className="font-medium">{region.population.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المدن:</span>
                      <span className="font-medium">
                        {cities.filter(c => c.region_id === region.region_id).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">الإحداثيات:</span>
                      <span className="text-xs text-gray-500">
                        {region.center[0].toFixed(2)}, {region.center[1].toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cities Tab */}
        {settings.showCities && (
          <TabsContent value="cities">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(getFilteredData() as City[]).map((city: City) => {
                  const region = regions.find(r => r.region_id === city.region_id)
                  return (
                    <Card 
                      key={city.city_id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleCitySelect(city)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{city.name_ar}</CardTitle>
                        <p className="text-sm text-gray-500">{city.name_en}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">المنطقة:</span>
                            <span className="font-medium">{region?.name_ar}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">الأحياء:</span>
                            <span className="font-medium">
                              {districts.filter(d => d.city_id === city.city_id).length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">الإحداثيات:</span>
                            <span className="text-xs text-gray-500">
                              {city.center[0].toFixed(2)}, {city.center[1].toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        )}

        {/* Districts Tab */}
        {settings.showDistricts && (
          <TabsContent value="districts">
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(getFilteredData() as District[]).map((district: District) => {
                  const city = cities.find(c => c.city_id === district.city_id)
                  const region = regions.find(r => r.region_id === city?.region_id)
                  return (
                    <Card key={district.district_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{district.name_ar}</h4>
                          <p className="text-xs text-gray-500">{district.name_en}</p>
                          <div className="text-xs text-gray-400">
                            <p>{city?.name_ar} - {region?.name_ar}</p>
                            <p>{district.center[0].toFixed(2)}, {district.center[1].toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default AdvancedSaudiMap