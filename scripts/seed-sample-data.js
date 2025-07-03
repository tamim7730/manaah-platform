const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/manaah_platform",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

async function seedSampleData() {
  const client = await pool.connect()

  try {
    console.log("🌱 بدء إدراج البيانات التجريبية...")

    // إنشاء مستخدم إداري تجريبي
    const bcrypt = require("bcryptjs")
    const adminPassword = await bcrypt.hash("admin123", 12)

    await client.query(
      `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ('admin', 'admin@manaah.gov.sa', $1, 'مدير النظام', 'admin')
      ON CONFLICT (username) DO NOTHING
    `,
      [adminPassword],
    )

    // إدراج بيانات تجريبية للمحافظات
    await client.query(`
      INSERT INTO governorates (region_id, name_ar, name_en, code, population, epidemic_belt_risk)
      SELECT 1, 'الرياض', 'Riyadh', 'RD01', 7000000, 'medium'
      WHERE EXISTS (SELECT 1 FROM regions WHERE id = 1)
      ON CONFLICT (code) DO NOTHING
    `)

    await client.query(`
      INSERT INTO governorates (region_id, name_ar, name_en, code, population, epidemic_belt_risk)
      SELECT 2, 'جدة', 'Jeddah', 'MK01', 50000, 'high'
      WHERE EXISTS (SELECT 1 FROM regions WHERE id = 2)
      ON CONFLICT (code) DO NOTHING
    `)

    // إدراج مسوحات تجريبية
    await client.query(`
      INSERT INTO surveys (disease_id, governorate_id, survey_date, survey_type, status, total_samples, positive_samples, conducted_by, created_by)
      SELECT 
        d.id,
        g.id,
        CURRENT_DATE - INTERVAL '30 days',
        'مسح ميداني',
        'completed',
        100,
        5,
        'فريق المسح الميداني',
        u.id
      FROM diseases d, governorates g, users u
      WHERE d.code = 'RVF' AND g.code = 'RD01' AND u.username = 'admin'
      LIMIT 1
      ON CONFLICT DO NOTHING
    `)

    // إدراج بيانات الثروة الحيوانية التجريبية
    await client.query(`
      INSERT INTO livestock_data (survey_id, governorate_id, animal_type, total_count, healthy_count, sick_count, vaccinated_count, collection_date)
      SELECT 
        s.id,
        s.governorate_id,
        'أبقار',
        1000,
        950,
        50,
        800,
        s.survey_date
      FROM surveys s
      LIMIT 1
      ON CONFLICT DO NOTHING
    `)

    // إدراج بيانات كثافة البعوض التجريبية
    await client.query(`
      INSERT INTO mosquito_density (survey_id, governorate_id, location_name, latitude, longitude, density_level, trap_count, mosquito_count, collection_date)
      SELECT 
        s.id,
        s.governorate_id,
        'منطقة الرياض الشمالية',
        24.7136,
        46.6753,
        'medium',
        10,
        150,
        s.survey_date
      FROM surveys s
      LIMIT 1
      ON CONFLICT DO NOTHING
    `)

    console.log("✅ تم إدراج البيانات التجريبية بنجاح!")
    console.log("👤 مستخدم إداري: admin / admin123")
    console.log("📊 تم إدراج مسوحات وبيانات تجريبية")
  } catch (error) {
    console.error("❌ خطأ في إدراج البيانات التجريبية:", error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// تشغيل الإدراج
if (require.main === module) {
  seedSampleData()
}

module.exports = { seedSampleData }
