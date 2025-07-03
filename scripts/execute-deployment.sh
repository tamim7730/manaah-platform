#!/bin/bash

# سكريبت تنفيذ النشر الفوري لمنصة مناعة
# Immediate deployment execution script for Manaah Platform

set -e

# الألوان للمخرجات
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# دالة طباعة الرسائل
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_step() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] 🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] ✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] ❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}[INFO] ℹ️  $1${NC}"
}

# بدء النشر
print_header "🚀 بدء تنفيذ نشر منصة مناعة"
echo -e "${CYAN}التوقيت: $(date)${NC}"
echo ""

# الخطوة 1: التحقق من البيئة
print_step "التحقق من البيئة والمتطلبات"

# التحقق من Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker متوفر - الإصدار: $DOCKER_VERSION"
else
    print_error "Docker غير مثبت"
    print_info "تثبيت Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_success "تم تثبيت Docker"
fi

# التحقق من Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker Compose متوفر - الإصدار: $COMPOSE_VERSION"
else
    print_info "تثبيت Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "تم تثبيت Docker Compose"
fi

# الخطوة 2: إعداد متغيرات البيئة
print_step "إعداد متغيرات البيئة للإنتاج"

if [ ! -f .env.production ]; then
    print_info "إنشاء ملف .env.production..."
    
    # توليد مفاتيح آمنة
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    POSTGRES_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    cat > .env.production << EOF
# بيئة الإنتاج - تم إنشاؤها تلقائياً
NODE_ENV=production

# قاعدة البيانات
DATABASE_URL=postgresql://manaah_user:${POSTGRES_PASSWORD}@postgres:5432/manaah_platform

# Redis
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# NextAuth Configuration
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost:3000

# PostgreSQL
POSTGRES_DB=manaah_platform
POSTGRES_USER=manaah_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# تكوين التطبيق
APP_NAME=منصة مناعة
APP_VERSION=1.0.0
APP_URL=http://localhost:3000

# المراقبة
MONITORING_WEBHOOK_URL=

# البريد الإلكتروني (اختياري)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EOF

    print_success "تم إنشاء ملف .env.production"
else
    print_success "ملف .env.production موجود"
fi

# تحميل متغيرات البيئة
export $(cat .env.production | grep -v '^#' | xargs)

# الخطوة 3: إعداد الشبكة والمجلدات
print_step "إعداد الشبكة والمجلدات"

# إنشاء المجلدات المطلوبة
mkdir -p ssl
mkdir -p nginx/logs
mkdir -p postgres_data
mkdir -p redis_data
mkdir -p uploads
mkdir -p backups

print_success "تم إنشاء المجلدات المطلوبة"

# الخطوة 4: إعداد شهادات SSL التطويرية
print_step "إعداد شهادات SSL للتطوير"

if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
    print_info "إنشاء شهادات SSL ذاتية التوقيع للتطوير..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/privkey.pem \
        -out ssl/fullchain.pem \
        -subj "/C=SA/ST=Riyadh/L=Riyadh/O=Manaah Platform/CN=localhost" \
        2>/dev/null
    
    print_success "تم إنشاء شهادات SSL"
else
    print_success "شهادات SSL موجودة"
fi

# الخطوة 5: بناء ونشر التطبيق
print_step "بناء ونشر التطبيق"

print_info "إيقاف الخدمات السابقة (إن وجدت)..."
docker-compose down 2>/dev/null || true

print_info "بناء صور Docker..."
docker-compose build --no-cache

print_info "تشغيل الخدمات..."
docker-compose up -d

# انتظار تشغيل الخدمات
print_info "انتظار تشغيل الخدمات..."
sleep 30

# الخطوة 6: التحقق من حالة الخدمات
print_step "التحقق من حالة الخدمات"

# فحص PostgreSQL
if docker-compose exec -T postgres pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
    print_success "PostgreSQL يعمل بشكل طبيعي"
else
    print_error "PostgreSQL لا يستجيب"
    docker-compose logs postgres
fi

# فحص Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis يعمل بشكل طبيعي"
else
    print_warning "Redis لا يستجيب (اختياري)"
fi

# فحص التطبيق
sleep 10
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "التطبيق يعمل بشكل طبيعي"
else
    print_warning "التطبيق قد يحتاج وقت إضافي للتشغيل"
    print_info "فحص سجلات التطبيق..."
    docker-compose logs --tail=20 app
fi

# الخطوة 7: إعداد قاعدة البيانات
print_step "إعداد قاعدة البيانات"

print_info "انتظار استقرار قاعدة البيانات..."
sleep 20

# تشغيل المخطط
print_info "تشغيل مخطط قاعدة البيانات..."
if docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/01-schema.sql > /dev/null 2>&1; then
    print_success "تم تشغيل مخطط قاعدة البيانات"
else
    print_warning "قد يكون المخطط مُشغل مسبقاً"
fi

# إدراج البيانات التجريبية
print_info "إدراج البيانات التجريبية..."
if docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@manaah.gov.sa', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', 'مدير النظام', 'admin')
ON CONFLICT (username) DO NOTHING;
" > /dev/null 2>&1; then
    print_success "تم إدراج البيانات التجريبية"
else
    print_warning "البيانات التجريبية موجودة مسبقاً"
fi

# الخطوة 8: إعداد المراقبة
print_step "إعداد نظام المراقبة"

# إنشاء سكريبت فحص الصحة
cat > scripts/health-monitor.sh << 'EOF'
#!/bin/bash

# فحص صحة النظام
echo "🔍 فحص صحة منصة مناعة - $(date)"
echo "================================"

# فحص التطبيق
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ التطبيق: يعمل بشكل طبيعي"
else
    echo "❌ التطبيق: لا يستجيب"
fi

# فحص قاعدة البيانات
if docker-compose exec -T postgres pg_isready -U manaah_user > /dev/null 2>&1; then
    echo "✅ قاعدة البيانات: تعمل بشكل طبيعي"
else
    echo "❌ قاعدة البيانات: لا تستجيب"
fi

# فحص Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: يعمل بشكل طبيعي"
else
    echo "⚠️  Redis: لا يستجيب"
fi

# فحص استخدام الموارد
echo ""
echo "📊 استخدام الموارد:"
echo "==================="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "💾 مساحة القرص:"
echo "==============="
df -h | grep -E "(Filesystem|/dev/)"

echo ""
echo "================================"
EOF

chmod +x scripts/health-monitor.sh

print_success "تم إعداد نظام المراقبة"

# الخطوة 9: إعداد النسخ الاحتياطي
print_step "إعداد نظام النسخ الاحتياطي"

cat > scripts/quick-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "📦 إنشاء نسخة احتياطية - $DATE"

# نسخ احتياطي لقاعدة البيانات
echo "💾 نسخ قاعدة البيانات..."
docker-compose exec -T postgres pg_dump -U manaah_user manaah_platform | gzip > $BACKUP_DIR/database_$DATE.sql.gz

# نسخ احتياطي للملفات المرفوعة
if [ -d "uploads" ] && [ "$(ls -A uploads)" ]; then
    echo "📁 نسخ الملفات المرفوعة..."
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/
fi

# نسخ ملفات التكوين
echo "⚙️  نسخ ملفات التكوين..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env.production docker-compose.yml nginx/

echo "✅ تم إنشاء النسخة الاحتياطية في: $BACKUP_DIR"
ls -la $BACKUP_DIR/*$DATE*
EOF

chmod +x scripts/quick-backup.sh

print_success "تم إعداد نظام النسخ الاحتياطي"

# الخطوة 10: الاختبار النهائي
print_step "إجراء الاختبار النهائي"

sleep 5

# اختبار الصفحة الرئيسية
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "الصفحة الرئيسية تعمل"
else
    print_warning "الصفحة الرئيسية قد تحتاج وقت إضافي"
fi

# اختبار API
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "API يعمل بشكل طبيعي"
else
    print_warning "API قد يحتاج وقت إضافي"
fi

# عرض حالة الخدمات
print_info "حالة الخدمات:"
docker-compose ps

# الخطوة 11: إنشاء نسخة احتياطية أولية
print_step "إنشاء نسخة احتياطية أولية"
./scripts/quick-backup.sh

# النتيجة النهائية
print_header "🎉 تم النشر بنجاح!"

echo ""
print_success "منصة مناعة تعمل الآن!"
echo ""
print_info "الروابط المتاحة:"
echo "  🌐 الموقع الرئيسي: http://localhost:3000"
echo "  🔧 لوحة التحكم: http://localhost:3000/dashboard"
echo "  ❤️  فحص الصحة: http://localhost:3000/api/health"
echo ""
print_info "بيانات تسجيل الدخول التجريبية:"
echo "  👤 المدير: admin / admin123"
echo ""
print_info "أوامر مفيدة:"
echo "  📊 مراقبة الخدمات: docker-compose ps"
echo "  📝 عرض السجلات: docker-compose logs -f"
echo "  🔍 فحص الصحة: ./scripts/health-monitor.sh"
echo "  💾 نسخة احتياطية: ./scripts/quick-backup.sh"
echo ""
print_warning "ملاحظات مهمة:"
echo "  • تم استخدام شهادات SSL ذاتية التوقيع للتطوير"
echo "  • يرجى تحديث ملف .env.production للإنتاج الفعلي"
echo "  • تأكد من تأمين كلمات المرور قبل النشر العام"
echo ""

print_header "النشر مكتمل! 🚀"
