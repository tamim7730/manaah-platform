# Manaah Platform MCP Server

خادم MCP (Model Context Protocol) لمنصة مناح - نظام مراقبة الأوبئة والأمراض.

## نظرة عامة

هذا الخادم يوفر واجهة MCP للتفاعل مع بيانات منصة مناح، مما يتيح للنماذج اللغوية الكبيرة (LLMs) الوصول إلى:

- إدارة الأمراض والأوبئة
- إدارة المناطق الجغرافية
- إنشاء وإدارة الاستطلاعات
- استرجاع الإحصائيات والتقارير
- المصادقة وإدارة المستخدمين

## المتطلبات

- Node.js 18+
- PostgreSQL 15+ مع PostGIS
- TypeScript

## التثبيت المحلي

1. **تثبيت التبعيات:**
```bash
npm install
```

2. **إعداد متغيرات البيئة:**
```bash
cp .env.example .env
# قم بتحرير ملف .env وإضافة القيم المطلوبة
```

3. **بناء المشروع:**
```bash
npm run build
```

4. **تشغيل الخادم:**
```bash
npm start
```

للتطوير:
```bash
npm run dev
```

## النشر على Render

### الطريقة الأولى: استخدام Render Blueprint

1. **رفع الكود إلى Git:**
```bash
git add .
git commit -m "Add MCP Server"
git push origin main
```

2. **إنشاء خدمة جديدة على Render:**
   - اذهب إلى [Render Dashboard](https://dashboard.render.com)
   - انقر على "New" → "Blueprint"
   - اربط مستودع Git الخاص بك
   - حدد ملف `render.yaml` في مجلد `mcp-server`
   - انقر على "Apply"

### الطريقة الثانية: النشر اليدوي

1. **إنشاء قاعدة بيانات PostgreSQL:**
   - اذهب إلى Render Dashboard
   - انقر على "New" → "PostgreSQL"
   - اختر الخطة المجانية
   - احفظ معلومات الاتصال

2. **إنشاء Web Service:**
   - انقر على "New" → "Web Service"
   - اربط مستودع Git
   - اختر "Docker" كـ Runtime
   - حدد مسار Dockerfile: `./mcp-server/Dockerfile`
   - حدد Docker Context: `./mcp-server`

3. **إعداد متغيرات البيئة:**
   ```
   NODE_ENV=production
   MCP_SERVER_NAME=Manaah Platform MCP Server
   MCP_SERVER_VERSION=1.0.0
   DATABASE_URL=[من إعدادات قاعدة البيانات]
   DB_HOST=[من إعدادات قاعدة البيانات]
   DB_PORT=[من إعدادات قاعدة البيانات]
   DB_NAME=[من إعدادات قاعدة البيانات]
   DB_USER=[من إعدادات قاعدة البيانات]
   DB_PASSWORD=[من إعدادات قاعدة البيانات]
   JWT_SECRET=[مفتاح سري قوي]
   JWT_EXPIRES_IN=24h
   API_BASE_URL=https://your-app-name.onrender.com
   ```

## إعداد قاعدة البيانات

بعد النشر، تحتاج إلى إنشاء الجداول المطلوبة:

```sql
-- تفعيل PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- جدول المستخدمين
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأمراض
CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    symptoms JSONB,
    prevention_measures JSONB,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المناطق
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('country', 'state', 'city', 'district')),
    parent_id UUID REFERENCES regions(id),
    population INTEGER,
    area_km2 DECIMAL,
    coordinates GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الاستطلاعات
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    disease_id UUID REFERENCES diseases(id),
    region_id UUID REFERENCES regions(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    questions JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول استجابات الاستطلاعات
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES users(id),
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- إنشاء الفهارس
CREATE INDEX idx_diseases_risk_level ON diseases(risk_level);
CREATE INDEX idx_regions_type ON regions(type);
CREATE INDEX idx_regions_parent_id ON regions(parent_id);
CREATE INDEX idx_regions_coordinates ON regions USING GIST(coordinates);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_disease_id ON surveys(disease_id);
CREATE INDEX idx_surveys_region_id ON surveys(region_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
```

## الأدوات المتاحة

### إدارة الأمراض
- `get_diseases` - استرجاع قائمة الأمراض
- `create_disease` - إنشاء مرض جديد
- `get_disease_by_id` - استرجاع تفاصيل مرض محدد
- `search_diseases` - البحث في الأمراض
- `get_diseases_by_risk_level` - استرجاع الأمراض حسب مستوى الخطر

### إدارة المناطق
- `get_regions` - استرجاع قائمة المناطق
- `create_region` - إنشاء منطقة جديدة
- `get_region_by_id` - استرجاع تفاصيل منطقة محددة
- `search_regions` - البحث في المناطق
- `get_regions_by_type` - استرجاع المناطق حسب النوع
- `get_regions_nearby` - البحث عن المناطق المجاورة

### إدارة الاستطلاعات
- `get_surveys` - استرجاع قائمة الاستطلاعات
- `create_survey` - إنشاء استطلاع جديد
- `get_survey_by_id` - استرجاع تفاصيل استطلاع محدد
- `submit_survey_response` - إرسال استجابة لاستطلاع
- `get_survey_responses` - استرجاع استجابات الاستطلاع

### الإحصائيات
- `get_statistics` - استرجاع إحصائيات عامة للنظام

### المصادقة
- `authenticate_user` - مصادقة المستخدم
- `create_user` - إنشاء مستخدم جديد
- `get_user_profile` - استرجاع ملف المستخدم

## الأمان

- جميع كلمات المرور مُشفرة باستخدام bcrypt
- المصادقة تتم عبر JWT tokens
- التحقق من الصلاحيات لكل عملية
- حماية من SQL injection
- تشفير الاتصالات عبر HTTPS

## المراقبة

- Health check endpoint: `/health`
- Logging شامل لجميع العمليات
- معالجة الأخطاء المتقدمة

## الدعم

للحصول على المساعدة أو الإبلاغ عن مشاكل، يرجى إنشاء issue في مستودع GitHub.

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.