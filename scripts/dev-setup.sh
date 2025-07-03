#!/bin/bash

# إعداد سريع لبيئة التطوير
# Quick development environment setup

set -e

echo "🚀 إعداد سريع لبيئة التطوير"
echo "============================="

# إنشاء ملف .env للتطوير
if [ ! -f .env.local ]; then
    echo "📝 إنشاء ملف .env.local..."
    cat > .env.local << 'EOF'
# بيئة التطوير المحلية
NODE_ENV=development

# قاعدة البيانات
DATABASE_URL=postgresql://manaah_user:dev_password@localhost:5432/manaah_platform

# JWT
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRES_IN=7d

# NextAuth
NEXTAUTH_SECRET=dev-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# PostgreSQL
POSTGRES_DB=manaah_platform
POSTGRES_USER=manaah_user
POSTGRES_PASSWORD=dev_password

# تكوين التطبيق
APP_NAME=منصة مناعة - تطوير
APP_VERSION=1.0.0-dev
APP_URL=http://localhost:3000
EOF
    echo "✅ تم إنشاء ملف .env.local"
fi

# تثبيت المتطلبات
echo "📦 تثبيت المتطلبات..."
npm install

# تشغيل قاعدة البيانات فقط
echo "🗄️  تشغيل قاعدة البيانات..."
docker-compose up -d postgres redis

# انتظار قاعدة البيانات
echo "⏳ انتظار قاعدة البيانات..."
sleep 10

# إعداد قاعدة البيانات
echo "🔧 إعداد قاعدة البيانات..."
docker-compose exec -T postgres psql -U manaah_user -d manaah_platform < scripts/database-schema.sql 2>/dev/null || echo "المخطط موجود مسبقاً"

# إدراج بيانات تجريبية
echo "🌱 إدراج بيانات تجريبية..."
docker-compose exec -T postgres psql -U manaah_user -d manaah_platform -c "
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@manaah.gov.sa', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', 'مدير النظام', 'admin')
ON CONFLICT (username) DO NOTHING;
" 2>/dev/null || echo "البيانات موجودة مسبقاً"

echo ""
echo "✅ تم إعداد بيئة التطوير!"
echo ""
echo "🚀 لتشغيل التطبيق:"
echo "   npm run dev"
echo ""
echo "🌐 الروابط:"
echo "   التطبيق: http://localhost:3000"
echo "   لوحة التحكم: http://localhost:3000/dashboard"
echo ""
echo "👤 بيانات تسجيل الدخول:"
echo "   المدير: admin / admin123"
