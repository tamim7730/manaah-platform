-- إعداد قاعدة البيانات لمنصة مناح على Render
-- Database setup for Manaah Platform on Render

-- إنشاء امتداد PostGIS للبيانات الجغرافية
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- جدول المناطق السعودية
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    capital_ar VARCHAR(100),
    capital_en VARCHAR(100),
    area_km2 DECIMAL(10,2),
    population INTEGER,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المحافظات
CREATE TABLE IF NOT EXISTS governorates (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    area_km2 DECIMAL(10,2),
    population INTEGER,
    epidemic_belt_risk VARCHAR(20) DEFAULT 'low',
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأمراض
CREATE TABLE IF NOT EXISTS diseases (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    scientific_name VARCHAR(200),
    disease_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) DEFAULT 'medium',
    is_notifiable BOOLEAN DEFAULT false,
    is_zoonotic BOOLEAN DEFAULT false,
    transmission_mode TEXT[],
    incubation_period_days INTEGER,
    symptoms_ar TEXT,
    symptoms_en TEXT,
    prevention_ar TEXT,
    prevention_en TEXT,
    treatment_ar TEXT,
    treatment_en TEXT,
    woah_code VARCHAR(20),
    icd_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المسوحات الوبائية
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title_ar VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    survey_type VARCHAR(50) NOT NULL,
    target_population VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'planning',
    region_id INTEGER REFERENCES regions(id),
    governorate_id INTEGER REFERENCES governorates(id),
    disease_id INTEGER REFERENCES diseases(id),
    sample_size INTEGER,
    methodology_ar TEXT,
    methodology_en TEXT,
    results_summary_ar TEXT,
    results_summary_en TEXT,
    recommendations_ar TEXT,
    recommendations_en TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name_ar VARCHAR(100),
    full_name_en VARCHAR(100),
    role VARCHAR(20) DEFAULT 'viewer',
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول بيانات WOAH
CREATE TABLE IF NOT EXISTS woah_data (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    disease_code VARCHAR(20) NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    report_date DATE NOT NULL,
    outbreak_status VARCHAR(50),
    affected_animals INTEGER,
    deaths INTEGER,
    location_description TEXT,
    control_measures TEXT,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_geometry ON regions USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_governorates_region_id ON governorates(region_id);
CREATE INDEX IF NOT EXISTS idx_governorates_code ON governorates(code);
CREATE INDEX IF NOT EXISTS idx_governorates_geometry ON governorates USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_diseases_type ON diseases(disease_type);
CREATE INDEX IF NOT EXISTS idx_diseases_woah_code ON diseases(woah_code);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_dates ON surveys(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_woah_data_country ON woah_data(country_code);
CREATE INDEX IF NOT EXISTS idx_woah_data_disease ON woah_data(disease_code);
CREATE INDEX IF NOT EXISTS idx_woah_data_date ON woah_data(report_date);

-- إدراج بيانات المناطق السعودية الأساسية
INSERT INTO regions (name_ar, name_en, code, capital_ar, capital_en, area_km2, population) VALUES
('منطقة الرياض', 'Riyadh Region', 'RD', 'الرياض', 'Riyadh', 404240, 8216284),
('منطقة مكة المكرمة', 'Makkah Region', 'MK', 'مكة المكرمة', 'Makkah', 153128, 8557766),
('المنطقة الشرقية', 'Eastern Province', 'EP', 'الدمام', 'Dammam', 672522, 5217748),
('منطقة المدينة المنورة', 'Madinah Region', 'MD', 'المدينة المنورة', 'Madinah', 151990, 2132679),
('منطقة القصيم', 'Al-Qassim Region', 'QS', 'بريدة', 'Buraydah', 58046, 1370727),
('منطقة حائل', 'Hail Region', 'HL', 'حائل', 'Hail', 103887, 731147),
('منطقة تبوك', 'Tabuk Region', 'TB', 'تبوك', 'Tabuk', 146072, 910030),
('منطقة الحدود الشمالية', 'Northern Borders Region', 'NB', 'عرعر', 'Arar', 104000, 320524),
('منطقة جازان', 'Jazan Region', 'JZ', 'جازان', 'Jazan', 11671, 1567547),
('منطقة نجران', 'Najran Region', 'NJ', 'نجران', 'Najran', 119000, 595705),
('منطقة الباحة', 'Al Bahah Region', 'BH', 'الباحة', 'Al Bahah', 9921, 476172),
('منطقة عسير', 'Asir Region', 'AS', 'أبها', 'Abha', 76693, 2211875),
('منطقة الجوف', 'Al Jawf Region', 'JF', 'سكاكا', 'Sakakah', 100212, 508475)
ON CONFLICT (code) DO NOTHING;

-- إنشاء مستخدم إداري افتراضي
INSERT INTO users (username, email, password_hash, full_name_ar, full_name_en, role, department) VALUES
('admin', 'admin@manaah.gov.sa', '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', 'المدير العام', 'System Administrator', 'admin', 'إدارة النظام')
ON CONFLICT (username) DO NOTHING;

-- إدراج بعض الأمراض الأساسية
INSERT INTO diseases (name_ar, name_en, scientific_name, disease_type, severity_level, is_notifiable, is_zoonotic, woah_code) VALUES
('حمى الوادي المتصدع', 'Rift Valley Fever', 'Rift Valley fever virus', 'viral', 'high', true, true, 'RVF'),
('جدري الأغنام والماعز', 'Sheep and Goat Pox', 'Capripoxvirus', 'viral', 'high', true, false, 'SGP'),
('طاعون المجترات الصغيرة', 'Peste des Petits Ruminants', 'Peste des petits ruminants virus', 'viral', 'high', true, false, 'PPR'),
('الحمى القلاعية', 'Foot and Mouth Disease', 'Foot-and-mouth disease virus', 'viral', 'high', true, false, 'FMD'),
('أنفلونزا الطيور', 'Avian Influenza', 'Influenza A virus', 'viral', 'high', true, true, 'AI')
ON CONFLICT (woah_code) DO NOTHING;

COMMIT;