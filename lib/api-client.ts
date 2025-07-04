import type {
  User,
  Disease,
  Region,
  Governorate,
  Survey,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
} from "./types"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl

    // استرجاع التوكن من localStorage عند التهيئة
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || "حدث خطأ في الطلب")
      }

      return data
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("API Request Error:", error)
      throw error
    }
  }

  // تعيين التوكن
  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  // إزالة التوكن
  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  // المصادقة
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.success && response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request<ApiResponse>("/auth/logout", {
      method: "POST",
    })

    this.clearToken()
    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>("/auth/me")
  }

  // الأمراض
  async getDiseases(params?: {
    page?: number
    limit?: number
    search?: string
    active?: boolean
  }): Promise<PaginatedResponse<Disease>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.search) searchParams.set("search", params.search)
    if (params?.active !== undefined) searchParams.set("active", params.active.toString())

    const query = searchParams.toString()
    return this.request<PaginatedResponse<Disease>>(`/diseases${query ? `?${query}` : ""}`)
  }

  async getDisease(id: number): Promise<ApiResponse<Disease>> {
    return this.request<ApiResponse<Disease>>(`/diseases/${id}`)
  }

  async createDisease(disease: Partial<Disease>): Promise<ApiResponse<Disease>> {
    return this.request<ApiResponse<Disease>>("/diseases", {
      method: "POST",
      body: JSON.stringify(disease),
    })
  }

  async updateDisease(id: number, disease: Partial<Disease>): Promise<ApiResponse<Disease>> {
    return this.request<ApiResponse<Disease>>(`/diseases/${id}`, {
      method: "PUT",
      body: JSON.stringify(disease),
    })
  }

  async deleteDisease(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/diseases/${id}`, {
      method: "DELETE",
    })
  }

  // المناطق
  async getRegions(params?: {
    page?: number
    limit?: number
    includeGeojson?: boolean
  }): Promise<PaginatedResponse<Region>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.includeGeojson) searchParams.set("include_geojson", "true")

    const query = searchParams.toString()
    return this.request<PaginatedResponse<Region>>(`/regions${query ? `?${query}` : ""}`)
  }

  async getRegionGovernorates(
    regionId: number,
    params?: { includeGeojson?: boolean; epidemicBeltRisk?: string },
  ): Promise<ApiResponse<Governorate[]>> {
    const searchParams = new URLSearchParams()

    if (params?.includeGeojson) searchParams.set("include_geojson", "true")
    if (params?.epidemicBeltRisk) searchParams.set("epidemic_belt_risk", params.epidemicBeltRisk)

    const query = searchParams.toString()
    return this.request<ApiResponse<Governorate[]>>(`/regions/${regionId}/governorates${query ? `?${query}` : ""}`)
  }

  // المسوحات
  async getSurveys(params?: {
    page?: number
    limit?: number
    diseaseId?: number
    governorateId?: number
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<PaginatedResponse<Survey>> {
    const searchParams = new URLSearchParams()

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString())
      }
    })

    const query = searchParams.toString()
    return this.request<PaginatedResponse<Survey>>(`/surveys${query ? `?${query}` : ""}`)
  }

  async createSurvey(survey: Partial<Survey>): Promise<ApiResponse<Survey>> {
    return this.request<ApiResponse<Survey>>("/surveys", {
      method: "POST",
      body: JSON.stringify(survey),
    })
  }

  // إحصائيات عامة
  async getDashboardStats(): Promise<
    ApiResponse<{
      totalDiseases: number
      totalRegions: number
      totalSurveys: number
      activeSurveys: number
      recentSurveys: Survey[]
    }>
  > {
    return this.request<ApiResponse<{
      totalDiseases: number
      totalRegions: number
      totalSurveys: number
      activeSurveys: number
      recentSurveys: Survey[]
    }>>("/dashboard/stats")
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const apiClient = new ApiClient()
