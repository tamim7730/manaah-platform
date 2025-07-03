#!/bin/bash

# سكريبت النشر لمنصة مناعة
# Deploy script for Manaah Platform

set -e

# الألوان للمخرجات
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة طباعة الرسائل
print_message() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# التحقق من المتطلبات
check_requirements() {
    print_message "التحقق من المتطلبات..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker غير مثبت"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose غير مثبت"
        exit 1
    fi
    
    if ! command -v nginx &> /dev/null; then
        print_warning "Nginx غير مثبت - سيتم استخدام Nginx من Docker"
    fi
    
    print_success "جميع المتطلبات متوفرة"
}

# إعداد متغيرات البيئة
setup_environment() {
    print_message "إعداد متغيرات البيئة..."
    
    if [ ! -f .env.production ]; then
        print_warning "ملف .env.production غير موجود، سيتم إنشاؤه"
        cp .env.example .env.production
        
        # توليد مفاتيح عشوائية
        JWT_SECRET=$(openssl rand -base64 32)
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        POSTGRES_PASSWORD=$(openssl rand -base64 16)
        
        # تحديث الملف
        sed -i "s/your-super-secret-jwt-key-here-make-it-long-and-random/$JWT_SECRET/g" .env.production
        sed -i "s/your-nextauth-secret-here/$NEXTAUTH_SECRET/g" .env.production
        sed -i "s/secure_password/$POSTGRES_PASSWORD/g" .env.production
        
        print_warning "يرجى مراجعة وتحديث ملف .env.production قبل المتابعة"
        read -p "اضغط Enter للمتابعة..."
    fi
    
    # تحميل متغيرات البيئة
    export $(cat .env.production | grep -v '^#' | xargs)
    
    print_success "تم إعداد متغيرات البيئة"
}

# إعداد قاعدة البيانات
setup_database() {
    print_message "إعداد قاعدة البيانات..."
    
    # تشغيل PostgreSQL
    docker-compose up -d postgres
    
    # انتظار تشغيل قاعدة البيانات
    print_message "انتظار تشغيل قاعدة البيانات..."
    sleep 30
    
    # تشغيل المخطط
    docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < scripts/database-schema.sql
    
    # إدراج البيانات التجريبية
    docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < scripts/seed-sample-data.sql
    
    print_success "تم إعداد قاعدة البيانات"
}

# بناء ونشر التطبيق
build_and_deploy() {
    print_message "بناء ونشر التطبيق..."
    
    # بناء الصورة
    docker-compose build app
    
    # تشغيل جميع الخدمات
    docker-compose up -d
    
    # انتظار تشغيل التطبيق
    print_message "انتظار تشغيل التطبيق..."
    sleep 60
    
    # التحقق من حالة الخدمات
    docker-compose ps
    
    print_success "تم نشر التطبيق بنجاح"
}

# إعداد SSL
setup_ssl() {
    print_message "إعداد شهادة SSL..."
    
    # إنشاء مجلد SSL
    mkdir -p ssl
    
    if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
        print_warning "شهادات SSL غير موجودة"
        
        # استخدام Let's Encrypt
        if command -v certbot &> /dev/null; then
            print_message "استخدام Certbot لإنشاء شهادة SSL..."
            
            # إيقاف Nginx مؤقتاً
            docker-compose stop nginx
            
            # إنشاء الشهادة
            certbot certonly --standalone \
                --email admin@manaah.gov.sa \
                --agree-tos \
                --no-eff-email \
                -d manaah.gov.sa \
                -d www.manaah.gov.sa
            
            # نسخ الشهادات
            cp /etc/letsencrypt/live/manaah.gov.sa/fullchain.pem ssl/
            cp /etc/letsencrypt/live/manaah.gov.sa/privkey.pem ssl/
            
            # إعادة تشغيل Nginx
            docker-compose up -d nginx
            
            print_success "تم إعداد شهادة SSL"
        else
            print_warning "Certbot غير مثبت - سيتم استخدام شهادة ذاتية التوقيع"
            
            # إنشاء شهادة ذاتية التوقيع
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ssl/privkey.pem \
                -out ssl/fullchain.pem \
                -subj "/C=SA/ST=Riyadh/L=Riyadh/O=Ministry of Health/CN=manaah.gov.sa"
            
            print_warning "تم إنشاء شهادة ذاتية التوقيع - يرجى استبدالها بشهادة صالحة"
        fi
    else
        print_success "شهادات SSL موجودة"
    fi
}

# إعداد المراقبة
setup_monitoring() {
    print_message "إعداد المراقبة..."
    
    # إنشاء ملف مراقبة الصحة
    cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

# فحص صحة التطبيق
check_app_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
    if [ $response -eq 200 ]; then
        echo "✅ التطبيق يعمل بشكل طبيعي"
        return 0
    else
        echo "❌ التطبيق لا يستجيب - رمز الاستجابة: $response"
        return 1
    fi
}

# فحص قاعدة البيانات
check_database() {
    if docker-compose exec -T postgres pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
        echo "✅ قاعدة البيانات تعمل بشكل طبيعي"
        return 0
    else
        echo "❌ قاعدة البيانات لا تستجيب"
        return 1
    fi
}

# فحص Redis
check_redis() {
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis يعمل بشكل طبيعي"
        return 0
    else
        echo "❌ Redis لا يستجيب"
        return 1
    fi
}

# تشغيل جميع الفحوصات
echo "🔍 فحص صحة النظام..."
echo "========================"

check_app_health
app_status=$?

check_database
db_status=$?

check_redis
redis_status=$?

echo "========================"

if [ $app_status -eq 0 ] && [ $db_status -eq 0 ] && [ $redis_status -eq 0 ]; then
    echo "🎉 جميع الخدمات تعمل بشكل طبيعي"
    exit 0
else
    echo "⚠️  بعض الخدمات تواجه مشاكل"
    exit 1
fi
EOF

    chmod +x scripts/health-check.sh
    
    # إعداد cron job للمراقبة
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/manaah-platform/scripts/health-check.sh >> /var/log/manaah-health.log 2>&1") | crontab -
    
    print_success "تم إعداد المراقبة"
}

# إعداد النسخ الاحتياطي
setup_backup() {
    print_message "إعداد النسخ الاحتياطي..."
    
    # إنشاء سكريبت النسخ الاحتياطي
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/manaah"
DATE=$(date +%Y%m%d_%H%M%S)

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

# نسخ احتياطي لقاعدة البيانات
echo "إنشاء نسخة احتياطية لقاعدة البيانات..."
docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_DIR/database_$DATE.sql.gz

# نسخ احتياطي للملفات المرفوعة
echo "إنشاء نسخة احتياطية للملفات..."
tar -czf $BACKUP_DIR/files_$DATE.tar.gz uploads/

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "تم إنشاء النسخة الاحتياطية: $BACKUP_DIR"
EOF

    chmod +x scripts/backup.sh
    
    # إعداد cron job للنسخ الاحتياطي اليومي
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/manaah-platform/scripts/backup.sh >> /var/log/manaah-backup.log 2>&1") | crontab -
    
    print_success "تم إعداد النسخ الاحتياطي"
}

# الدالة الرئيسية
main() {
    print_message "🚀 بدء نشر منصة مناعة"
    print_message "========================"
    
    check_requirements
    setup_environment
    setup_ssl
    setup_database
    build_and_deploy
    setup_monitoring
    setup_backup
    
    print_message "========================"
    print_success "🎉 تم نشر منصة مناعة بنجاح!"
    print_message "الموقع متاح على: https://manaah.gov.sa"
    print_message "لوحة التحكم: https://manaah.gov.sa/dashboard"
    print_message "========================"
    
    # عرض معلومات مفيدة
    echo ""
    print_message "معلومات مفيدة:"
    echo "• لمراقبة السجلات: docker-compose logs -f"
    echo "• لفحص حالة الخدمات: docker-compose ps"
    echo "• لفحص صحة النظام: ./scripts/health-check.sh"
    echo "• لإنشاء نسخة احتياطية: ./scripts/backup.sh"
    echo ""
}

# تشغيل السكريبت
main "$@"
