# وثائق API لخادم MCP - منصة مناح

هذا المستند يوضح جميع الأدوات (Tools) المتاحة في خادم MCP الخاص بمنصة مناح لمراقبة الأوبئة.

## نظرة عامة

خادم MCP يوفر مجموعة شاملة من الأدوات للتفاعل مع منصة مناح، بما في ذلك:
- إدارة الأمراض والأوبئة
- إدارة المناطق الجغرافية
- إدارة الاستبيانات والاستطلاعات
- الحصول على الإحصائيات والتحليلات

## الأدوات المتاحة

### 1. إدارة الأمراض

#### `get_diseases`
استرجاع قائمة الأمراض المسجلة في النظام.

**المعاملات:**
- `limit` (اختياري): عدد النتائج المطلوبة (افتراضي: 50)
- `offset` (اختياري): عدد النتائج المراد تخطيها (افتراضي: 0)

**مثال:**
```json
{
  "name": "get_diseases",
  "arguments": {
    "limit": 20,
    "offset": 0
  }
}
```

#### `create_disease`
إنشاء مرض جديد في النظام.

**المعاملات:**
- `name` (مطلوب): اسم المرض
- `description` (اختياري): وصف المرض
- `symptoms` (اختياري): الأعراض
- `risk_level` (مطلوب): مستوى الخطر (low, medium, high, critical)
- `transmission_method` (اختياري): طريقة الانتقال
- `prevention_measures` (اختياري): إجراءات الوقاية

**مثال:**
```json
{
  "name": "create_disease",
  "arguments": {
    "name": "كوفيد-19",
    "description": "مرض فيروسي معدي يصيب الجهاز التنفسي",
    "symptoms": ["حمى", "سعال", "ضيق تنفس"],
    "risk_level": "high",
    "transmission_method": "الرذاذ التنفسي",
    "prevention_measures": ["ارتداء الكمامة", "التباعد الاجتماعي"]
  }
}
```

#### `search_diseases`
البحث عن الأمراض بالاسم أو الوصف.

**المعاملات:**
- `search_term` (مطلوب): مصطلح البحث
- `limit` (اختياري): عدد النتائج (افتراضي: 10)

#### `get_diseases_by_risk_level`
استرجاع الأمراض حسب مستوى الخطر.

**المعاملات:**
- `risk_level` (مطلوب): مستوى الخطر (low, medium, high, critical)

### 2. إدارة المناطق

#### `get_regions`
استرجاع قائمة المناطق الجغرافية.

**المعاملات:**
- `limit` (اختياري): عدد النتائج (افتراضي: 50)
- `offset` (اختياري): عدد النتائج المراد تخطيها (افتراضي: 0)

#### `search_regions`
البحث عن المناطق بالاسم أو الرمز.

**المعاملات:**
- `search_term` (مطلوب): مصطلح البحث
- `limit` (اختياري): عدد النتائج (افتراضي: 20)

#### `get_regions_by_type`
استرجاع المناطق حسب النوع.

**المعاملات:**
- `type` (مطلوب): نوع المنطقة (country, state, city, district)

#### `get_regions_nearby`
العثور على المناطق القريبة من موقع محدد.

**المعاملات:**
- `latitude` (مطلوب): خط العرض
- `longitude` (مطلوب): خط الطول
- `radius_km` (اختياري): نطاق البحث بالكيلومتر (افتراضي: 50)
- `limit` (اختياري): عدد النتائج (افتراضي: 10)

**مثال:**
```json
{
  "name": "get_regions_nearby",
  "arguments": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "radius_km": 100,
    "limit": 15
  }
}
```

### 3. إدارة الاستبيانات

#### `get_surveys`
استرجاع قائمة الاستبيانات.

**المعاملات:**
- `limit` (اختياري): عدد النتائج (افتراضي: 20)
- `offset` (اختياري): عدد النتائج المراد تخطيها (افتراضي: 0)

#### `search_surveys`
البحث عن الاستبيانات بالعنوان أو الوصف.

**المعاملات:**
- `search_term` (مطلوب): مصطلح البحث
- `limit` (اختياري): عدد النتائج (افتراضي: 20)

#### `get_surveys_by_disease`
استرجاع الاستبيانات المتعلقة بمرض محدد.

**المعاملات:**
- `disease_id` (مطلوب): معرف المرض

#### `get_surveys_by_region`
استرجاع الاستبيانات لمنطقة محددة.

**المعاملات:**
- `region_id` (مطلوب): معرف المنطقة

#### `submit_survey_response`
تقديم إجابة على استبيان.

**المعاملات:**
- `survey_id` (مطلوب): معرف الاستبيان
- `answers` (مطلوب): مصفوفة الإجابات
- `respondent_id` (اختياري): معرف المجيب

**مثال:**
```json
{
  "name": "submit_survey_response",
  "arguments": {
    "survey_id": "survey-123",
    "answers": [
      {
        "question_id": "q1",
        "answer": "نعم"
      },
      {
        "question_id": "q2",
        "answer": 25
      }
    ],
    "respondent_id": "user-456"
  }
}
```

#### `get_survey_responses`
استرجاع إجابات استبيان محدد.

**المعاملات:**
- `survey_id` (مطلوب): معرف الاستبيان
- `limit` (اختياري): عدد الإجابات (افتراضي: 50)
- `offset` (اختياري): عدد الإجابات المراد تخطيها (افتراضي: 0)

### 4. الإحصائيات والتحليلات

#### `get_statistics`
الحصول على إحصائيات النظام والتحليلات.

**المعاملات:**
- `period` (اختياري): الفترة الزمنية (week, month, quarter, year) - افتراضي: month
- `include_details` (اختياري): تضمين تفاصيل إضافية (افتراضي: false)

**مثال:**
```json
{
  "name": "get_statistics",
  "arguments": {
    "period": "month",
    "include_details": true
  }
}
```

**مثال على الاستجابة:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "period": "month",
  "total_diseases": 45,
  "total_regions": 120,
  "total_surveys": 15,
  "total_responses": 1250,
  "details": {
    "diseases_by_risk": [
      {"risk_level": "high", "count": 8},
      {"risk_level": "medium", "count": 22},
      {"risk_level": "low", "count": 15}
    ],
    "regions_by_type": [
      {"type": "city", "count": 85},
      {"type": "state", "count": 25},
      {"type": "country", "count": 10}
    ]
  }
}
```

## أنواع البيانات

### Disease (المرض)
```typescript
interface Disease {
  id: string;
  name: string;
  description?: string;
  symptoms?: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  transmission_method?: string;
  prevention_measures?: string[];
  created_at: string;
  updated_at: string;
}
```

### Region (المنطقة)
```typescript
interface Region {
  id: string;
  name: string;
  code: string;
  type: 'country' | 'state' | 'city' | 'district';
  parent_id?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  population?: number;
  created_at: string;
  updated_at: string;
}
```

### Survey (الاستبيان)
```typescript
interface Survey {
  id: string;
  title: string;
  description?: string;
  disease_id?: string;
  region_id?: string;
  questions: SurveyQuestion[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'multiple_choice' | 'single_choice';
  options?: string[];
  required: boolean;
}
```

### SurveyResponse (إجابة الاستبيان)
```typescript
interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_id?: string;
  answers: SurveyAnswer[];
  submitted_at: string;
}

interface SurveyAnswer {
  question_id: string;
  answer: string | number | boolean | string[];
}
```

## رموز الأخطاء

- `400` - طلب غير صحيح (معاملات مفقودة أو غير صحيحة)
- `401` - غير مصرح (مطلوب تسجيل دخول)
- `403` - ممنوع (صلاحيات غير كافية)
- `404` - غير موجود (المورد المطلوب غير موجود)
- `500` - خطأ في الخادم

## أمثلة على الاستخدام

### البحث عن مرض معين
```json
{
  "name": "search_diseases",
  "arguments": {
    "search_term": "كوفيد",
    "limit": 5
  }
}
```

### الحصول على المناطق القريبة من الرياض
```json
{
  "name": "get_regions_nearby",
  "arguments": {
    "latitude": 24.7136,
    "longitude": 46.6753,
    "radius_km": 50
  }
}
```

### إنشاء استبيان جديد
```json
{
  "name": "create_survey",
  "arguments": {
    "title": "استبيان أعراض الإنفلونزا",
    "description": "استبيان لمراقبة انتشار أعراض الإنفلونزا",
    "disease_id": "disease-123",
    "questions": [
      {
        "question": "هل تعاني من حمى؟",
        "type": "boolean",
        "required": true
      },
      {
        "question": "ما هي درجة الحرارة؟",
        "type": "number",
        "required": false
      }
    ]
  }
}
```

## ملاحظات مهمة

1. **التوقيت**: جميع التواريخ والأوقات بصيغة ISO 8601 UTC
2. **الترقيم**: جميع المعرفات (IDs) هي UUID v4
3. **اللغة**: النظام يدعم اللغة العربية والإنجليزية
4. **الإحداثيات**: تستخدم نظام WGS84 (EPSG:4326)
5. **الحدود**: هناك حدود على عدد النتائج لضمان الأداء

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- راجع سجلات الخادم للأخطاء التفصيلية
- تأكد من صحة المعاملات المرسلة
- تحقق من صلاحيات المستخدم