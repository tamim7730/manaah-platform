# دليل الصيانة - منصة مناعة

## المراقبة اليومية

### فحص حالة النظام
\`\`\`bash
# فحص حالة الخدمات
docker-compose ps

# فحص صحة التطبيق
curl -f http://localhost:3000/api/health

# فحص السجلات
docker-compose logs --tail=100 app
\`\`\`

### مراقبة الأداء
\`\`\`bash
# مراقبة استخدام الموارد
docker stats

# فحص مساحة القرص
df -h

# فحص الذاكرة
free -h
\`\`\`

## الصيانة الأسبوعية

### تنظيف السجلات
\`\`\`bash
# تنظيف سجلات Docker
docker system prune -f

# تنظيف سجلات Nginx
find /var/log/nginx -name "*.log" -mtime +7 -delete

# ضغط السجلات القديمة
gzip /var/log/nginx/*.log.1
\`\`\`

### تحديث النظام
\`\`\`bash
# تحديث حزم النظام
sudo apt update && sudo apt upgrade -y

# إعادة تشغيل الخدمات إذا لزم الأمر
docker-compose restart
\`\`\`

## الصيانة الشهرية

### النسخ الاحتياطي
\`\`\`bash
# تشغيل النسخ الاحتياطي يدوياً
./scripts/backup.sh

# التحقق من النسخ الاحتياطية
ls -la /opt/backups/manaah/

# اختبار استعادة النسخة الاحتياطية
./scripts/restore-test.sh
\`\`\`

### تحديث شهادات SSL
\`\`\`bash
# تجديد شهادات Let's Encrypt
certbot renew --dry-run

# إعادة تحميل Nginx
docker-compose exec nginx nginx -s reload
\`\`\`

## استكشاف الأخطاء

### مشاكل الأداء
\`\`\`bash
# فحص استخدام CPU
top -p $(pgrep -f "node")

# فحص استخدام الذاكرة
ps aux --sort=-%mem | head

# فحص الاتصالات النشطة
netstat -an | grep :3000 | wc -l
\`\`\`

### مشاكل قاعدة البيانات
\`\`\`bash
# فحص حالة PostgreSQL
docker-compose exec postgres pg_isready

# فحص الاتصالات النشطة
docker-compose exec postgres psql -U manaah_user -d manaah_platform -c "SELECT count(*) FROM pg_stat_activity;"

# فحص حجم قاعدة البيانات
docker-compose exec postgres psql -U manaah_user -d manaah_platform -c "SELECT pg_size_pretty(pg_database_size('manaah_platform'));"
\`\`\`

### مشاكل الشبكة
\`\`\`bash
# فحص الاتصال بالإنترنت
ping -c 4 8.8.8.8

# فحص DNS
nslookup manaah.gov.sa

# فحص المنافذ
netstat -tlnp | grep :80
netstat -tlnp | grep :443
\`\`\`

## إجراءات الطوارئ

### إعادة تشغيل سريع
\`\`\`bash
# إعادة تشغيل التطبيق فقط
docker-compose restart app

# إعادة تشغيل جميع الخدمات
docker-compose restart

# إعادة تشغيل كامل
docker-compose down && docker-compose up -d
\`\`\`

### استعادة من النسخة الاحتياطية
\`\`\`bash
# إيقاف الخدمات
docker-compose down

# استعادة قاعدة البيانات
gunzip -c /opt/backups/manaah/database_YYYYMMDD_HHMMSS.sql.gz | \
docker-compose exec -T postgres psql -U manaah_user -d manaah_platform

# استعادة الملفات
tar -xzf /opt/backups/manaah/files_YYYYMMDD_HHMMSS.tar.gz

# إعادة تشغيل الخدمات
docker-compose up -d
\`\`\`

### التراجع إلى إصدار سابق
\`\`\`bash
# عرض الإصدارات المتاحة
docker images | grep manaah

# التراجع إلى إصدار سابق
docker-compose down
docker tag manaah-app:previous manaah-app:latest
docker-compose up -d
\`\`\`

## جهات الاتصال للطوارئ

- **فريق التطوير**: dev-team@manaah.gov.sa
- **مدير النظام**: sysadmin@manaah.gov.sa
- **الدعم الفني**: support@manaah.gov.sa
- **هاتف الطوارئ**: +966-11-XXX-XXXX

## سجل الصيانة

يرجى توثيق جميع أعمال الصيانة في الجدول التالي:

| التاريخ | النوع | الوصف | المنفذ | الملاحظات |
|---------|-------|--------|--------|-----------|
| | | | | |
\`\`\`

أخيراً، دعنا ننشئ ملف README شامل للنشر:
