const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

// إعداد الاتصال بقاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/manaah_platform",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

async function setupDatabase() {
  const client = await pool.connect()

  try {
    console.log("🚀 بدء إعداد قاعدة البيانات...")

    // قراءة ملف SQL
    const schemaPath = path.join(__dirname, "database-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // تنفيذ الاستعلامات
    await client.query(schema)

    console.log("✅ تم إعداد قاعدة البيانات بنجاح!")
    console.log("📊 تم إنشاء الجداول والفهارس")
    console.log("🌱 تم إدراج البيانات الأولية")
  } catch (error) {
    console.error("❌ خطأ في إعداد قاعدة البيانات:", error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// تشغيل الإعداد
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
