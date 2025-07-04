// أنواع البيانات الأساسية لمنصة مناعة
// Core data types for Manaah Platform

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: "admin" | "data_entry" | "viewer"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Region {
  id: number
  nameAr: string
  nameEn: string
  code: string
  geojsonData?: Record<string, unknown>
  population?: number
  areaKm2?: number
  createdAt: string
  updatedAt: string
}

export interface Governorate {
  id: number
  regionId: number
  nameAr: string
  nameEn: string
  code: string
  geojsonData?: Record<string, unknown>
  population?: number
  areaKm2?: number
  epidemicBeltRisk: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  region?: Region
}

export interface Disease {
  id: number
  nameAr: string
  nameEn: string
  code: string
  descriptionAr?: string
  descriptionEn?: string
  category?: string
  severityLevel: "low" | "medium" | "high" | "critical"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Survey {
  id: number
  diseaseId: number
  governorateId: number
  surveyDate: string
  surveyType: string
  status: "planned" | "in_progress" | "completed" | "cancelled"
  totalSamples: number
  positiveSamples: number
  notes?: string
  conductedBy?: string
  createdBy: number
  createdAt: string
  updatedAt: string
  disease?: Disease
  governorate?: Governorate
}

export interface LivestockData {
  id: number
  surveyId: number
  governorateId: number
  animalType: string
  totalCount: number
  healthyCount: number
  sickCount: number
  vaccinatedCount: number
  mortalityRate: number
  collectionDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MosquitoDensity {
  id: number
  surveyId: number
  governorateId: number
  locationName: string
  latitude?: number
  longitude?: number
  densityLevel: "low" | "medium" | "high" | "very_high"
  trapCount: number
  mosquitoCount: number
  speciesIdentified: string[]
  collectionDate: string
  weatherConditions?: string
  temperature?: number
  humidity?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PositiveSample {
  id: number
  surveyId: number
  governorateId: number
  sampleId: string
  sampleType: string
  collectionDate: string
  testDate?: string
  testMethod?: string
  testResult: "positive" | "negative" | "inconclusive"
  pathogenDetected?: string
  viralLoad?: number
  laboratoryName?: string
  technicianName?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  fullName: string
  role: "admin" | "data_entry" | "viewer"
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  fullName?: string
  role?: "admin" | "data_entry" | "viewer"
  isActive?: boolean
}
