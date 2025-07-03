-- Manaah Platform Database Setup
-- This script sets up the database schema for the MCP Server

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create diseases table
CREATE TABLE IF NOT EXISTS diseases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    symptoms JSONB DEFAULT '[]'::jsonb,
    prevention_measures JSONB DEFAULT '[]'::jsonb,
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('country', 'state', 'city', 'district')),
    parent_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    population INTEGER CHECK (population >= 0),
    area_km2 DECIMAL(10,2) CHECK (area_km2 >= 0),
    coordinates GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    disease_id UUID REFERENCES diseases(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date)
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Diseases indexes
CREATE INDEX IF NOT EXISTS idx_diseases_name ON diseases(name);
CREATE INDEX IF NOT EXISTS idx_diseases_risk_level ON diseases(risk_level);
CREATE INDEX IF NOT EXISTS idx_diseases_created_at ON diseases(created_at);

-- Regions indexes
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(type);
CREATE INDEX IF NOT EXISTS idx_regions_parent_id ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_coordinates ON regions USING GIST(coordinates);

-- Surveys indexes
CREATE INDEX IF NOT EXISTS idx_surveys_title ON surveys(title);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_disease_id ON surveys(disease_id);
CREATE INDEX IF NOT EXISTS idx_surveys_region_id ON surveys(region_id);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_start_date ON surveys(start_date);
CREATE INDEX IF NOT EXISTS idx_surveys_end_date ON surveys(end_date);

-- Survey responses indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_respondent_id ON survey_responses(respondent_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_submitted_at ON survey_responses(submitted_at);

-- Create triggers for updating updated_at timestamps

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for each table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON diseases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)

-- Sample admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@manaah.com', '$2b$10$rQZ9QmjlZKZK5Z5Z5Z5Z5uJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'مدير النظام', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Sample diseases
INSERT INTO diseases (name, description, symptoms, prevention_measures, risk_level) VALUES 
('كوفيد-19', 'مرض فيروسي معدي يسببه فيروس كورونا المستجد', 
 '["حمى", "سعال جاف", "ضيق في التنفس", "فقدان حاسة الشم والتذوق"]', 
 '["غسل اليدين بانتظام", "ارتداء الكمامة", "التباعد الاجتماعي", "التطعيم"]', 
 'high'),
('الإنفلونزا الموسمية', 'عدوى فيروسية تصيب الجهاز التنفسي', 
 '["حمى", "صداع", "آلام في العضلات", "سعال", "التهاب الحلق"]', 
 '["التطعيم السنوي", "غسل اليدين", "تجنب المرضى", "تقوية المناعة"]', 
 'medium'),
('الملاريا', 'مرض طفيلي ينتقل عن طريق البعوض', 
 '["حمى متقطعة", "قشعريرة", "صداع", "غثيان", "تعب شديد"]', 
 '["استخدام الناموسيات", "طارد الحشرات", "الأدوية الوقائية", "تجفيف المياه الراكدة"]', 
 'critical')
ON CONFLICT (name) DO NOTHING;

-- Sample regions
INSERT INTO regions (name, code, type, population, area_km2, coordinates) VALUES 
('المملكة العربية السعودية', 'SA', 'country', 35000000, 2149690, ST_SetSRID(ST_MakePoint(45.0792, 23.8859), 4326)),
('منطقة الرياض', 'SA-01', 'state', 8000000, 404240, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326)),
('مدينة الرياض', 'SA-01-RY', 'city', 7000000, 1973, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326))
ON CONFLICT (code) DO NOTHING;

-- Update parent relationships
UPDATE regions SET parent_id = (SELECT id FROM regions WHERE code = 'SA') WHERE code = 'SA-01';
UPDATE regions SET parent_id = (SELECT id FROM regions WHERE code = 'SA-01') WHERE code = 'SA-01-RY';

-- Sample survey
INSERT INTO surveys (title, description, disease_id, region_id, status, start_date, end_date, questions, created_by) 
SELECT 
    'استطلاع انتشار كوفيد-19 في الرياض',
    'استطلاع لمراقبة انتشار فيروس كورونا في منطقة الرياض',
    d.id,
    r.id,
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    '[
        {
            "id": "q1",
            "question": "هل تعاني من أعراض تشبه أعراض كوفيد-19؟",
            "type": "boolean",
            "required": true,
            "order": 1
        },
        {
            "id": "q2",
            "question": "ما هي الأعراض التي تعاني منها؟",
            "type": "multiple_choice",
            "options": ["حمى", "سعال", "ضيق تنفس", "فقدان حاسة الشم", "صداع"],
            "required": false,
            "order": 2
        },
        {
            "id": "q3",
            "question": "هل تلقيت لقاح كوفيد-19؟",
            "type": "single_choice",
            "options": ["نعم، جرعة واحدة", "نعم، جرعتان", "نعم، ثلاث جرعات أو أكثر", "لا"],
            "required": true,
            "order": 3
        }
    ]'::jsonb,
    u.id
FROM diseases d, regions r, users u
WHERE d.name = 'كوفيد-19' 
  AND r.code = 'SA-01-RY'
  AND u.email = 'admin@manaah.com'
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;

-- Create a view for survey statistics
CREATE OR REPLACE VIEW survey_statistics AS
SELECT 
    s.id,
    s.title,
    s.status,
    COUNT(sr.id) as response_count,
    s.start_date,
    s.end_date,
    CASE 
        WHEN s.end_date IS NULL THEN 'ongoing'
        WHEN s.end_date < CURRENT_TIMESTAMP THEN 'expired'
        WHEN s.start_date > CURRENT_TIMESTAMP THEN 'upcoming'
        ELSE 'active'
    END as time_status
FROM surveys s
LEFT JOIN survey_responses sr ON s.id = sr.survey_id
GROUP BY s.id, s.title, s.status, s.start_date, s.end_date;

-- Create a view for disease statistics
CREATE OR REPLACE VIEW disease_statistics AS
SELECT 
    d.id,
    d.name,
    d.risk_level,
    COUNT(s.id) as survey_count,
    COUNT(sr.id) as total_responses
FROM diseases d
LEFT JOIN surveys s ON d.id = s.disease_id
LEFT JOIN survey_responses sr ON s.id = sr.survey_id
GROUP BY d.id, d.name, d.risk_level;

-- Create a view for region statistics
CREATE OR REPLACE VIEW region_statistics AS
SELECT 
    r.id,
    r.name,
    r.type,
    r.population,
    COUNT(s.id) as survey_count,
    COUNT(sr.id) as total_responses
FROM regions r
LEFT JOIN surveys s ON r.id = s.region_id
LEFT JOIN survey_responses sr ON s.id = sr.survey_id
GROUP BY r.id, r.name, r.type, r.population;

COMMIT;

-- Display setup completion message
SELECT 'Database setup completed successfully!' as message;