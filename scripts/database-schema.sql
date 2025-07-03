-- إنشاء قاعدة البيانات الأساسية لمنصة مناعة
-- Database Schema for Manaah Platform

-- جدول المستخدمين
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'data_entry', 'viewer')) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المناطق الإدارية
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    geojson_data JSONB,
    population INTEGER,
    area_km2 DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المحافظات
CREATE TABLE governorates (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    geojson_data JSONB,
    population INTEGER,
    area_km2 DECIMAL(10,2),
    epidemic_belt_risk VARCHAR(20) CHECK (epidemic_belt_risk IN ('low', 'medium', 'high')) DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأمراض الوبائية
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    category VARCHAR(50),
    severity_level VARCHAR(20) CHECK (severity_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المسوحات
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    disease_id INTEGER REFERENCES diseases(id) ON DELETE CASCADE,
    governorate_id INTEGER REFERENCES governorates(id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    survey_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planned',
    total_samples INTEGER DEFAULT 0,
    positive_samples INTEGER DEFAULT 0,
    notes TEXT,
    conducted_by VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول بيانات الثروة الحيوانية
CREATE TABLE livestock_data (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    governorate_id INTEGER REFERENCES governorates(id) ON DELETE CASCADE,
    animal_type VARCHAR(50) NOT NULL,
    total_count INTEGER NOT NULL,
    healthy_count INTEGER DEFAULT 0,
    sick_count INTEGER DEFAULT 0,
    vaccinated_count INTEGER DEFAULT 0,
    mortality_rate DECIMAL(5,2) DEFAULT 0,
    collection_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول كثافة البعوض
CREATE TABLE mosquito_density (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    governorate_id INTEGER REFERENCES governorates(id) ON DELETE CASCADE,
    location_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    density_level VARCHAR(20) CHECK (density_level IN ('low', 'medium', 'high', 'very_high')) DEFAULT 'low',
    trap_count INTEGER DEFAULT 0,
    mosquito_count INTEGER DEFAULT 0,
    species_identified TEXT[],
    collection_date DATE NOT NULL,
    weather_conditions VARCHAR(100),
    temperature DECIMAL(4,1),
    humidity DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول تفاصيل العينات الإيجابية
CREATE TABLE positive_samples (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    governorate_id INTEGER REFERENCES governorates(id) ON DELETE CASCADE,
    sample_id VARCHAR(50) UNIQUE NOT NULL,
    sample_type VARCHAR(50) NOT NULL,
    collection_date DATE NOT NULL,
    test_date DATE,
    test_method VARCHAR(100),
    test_result VARCHAR(20) CHECK (test_result IN ('positive', 'negative', 'inconclusive')) DEFAULT 'positive',
    pathogen_detected VARCHAR(100),
    viral_load DECIMAL(10,2),
    laboratory_name VARCHAR(100),
    technician_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول جلسات المستخدمين
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_surveys_disease_governorate ON surveys(disease_id, governorate_id);
CREATE INDEX idx_surveys_date ON surveys(survey_date);
CREATE INDEX idx_livestock_survey ON livestock_data(survey_id);
CREATE INDEX idx_mosquito_survey ON mosquito_density(survey_id);
CREATE INDEX idx_positive_samples_survey ON positive_samples(survey_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- إدراج بيانات أولية للمناطق الإدارية السعودية
INSERT INTO regions (name_ar, name_en, code, population) VALUES
('منطقة الرياض', 'Riyadh Region', 'RD', 8000000),
('منطقة مكة المكرمة', 'Makkah Region', 'MK', 8557766),
('المنطقة الشرقية', 'Eastern Province', 'EP', 5068752),
('منطقة المدينة المنورة', 'Madinah Region', 'MD', 2132679),
('منطقة القصيم', 'Qassim Region', 'QS', 1370727),
('منطقة حائل', 'Hail Region', 'HL', 731147),
('منطقة تبوك', 'Tabuk Region', 'TB', 910030),
('المنطقة الشمالية', 'Northern Borders Region', 'NB', 375913),
('منطقة جازان', 'Jazan Region', 'JZ', 1567547),
('منطقة نجران', 'Najran Region', 'NJ', 603253),
('منطقة الباحة', 'Al Bahah Region', 'BH', 476172),
('منطقة عسير', 'Asir Region', 'AS', 2211875),
('منطقة الجوف', 'Al Jouf Region', 'JF', 518458);

-- إدراج بيانات أولية للأمراض الوبائية
INSERT INTO diseases (name_ar, name_en, code, description_ar, category, severity_level) VALUES
('حمى الوادي المتصدع', 'Rift Valley Fever', 'RVF', 'مرض فيروسي ينتقل عن طريق البعوض ويصيب الحيوانات والإنسان', 'Viral', 'high'),
('حمى الضنك', 'Dengue Fever', 'DENG', 'مرض فيروسي ينتقل عن طريق بعوض الزاعجة', 'Viral', 'medium'),
('الحمى النزفية الفيروسية', 'Viral Hemorrhagic Fever', 'VHF', 'مجموعة من الأمراض الفيروسية التي تسبب نزيف داخلي', 'Viral', 'critical'),
('حمى غرب النيل', 'West Nile Fever', 'WNF', 'مرض فيروسي ينتقل عن طريق البعوض', 'Viral', 'medium'),
('الملاريا', 'Malaria', 'MAL', 'مرض طفيلي ينتقل عن طريق بعوض الأنوفيليس', 'Parasitic', 'high');
