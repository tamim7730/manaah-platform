# دليل النشر - منصة مناعة

## متطلبات النشر

### متطلبات الخادم
- **نظام التشغيل**: Ubuntu 20.04 LTS أو أحدث
- **المعالج**: 4 أنوية على الأقل
- **الذاكرة**: 8 جيجابايت RAM على الأقل
- **التخزين**: 100 جيجابايت SSD على الأقل
- **الشبكة**: اتصال إنترنت مستقر

### البرامج المطلوبة
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (اختياري - يمكن استخدام Docker)
- Certbot (لشهادات SSL)
- Git

## خطوات النشر

### 1. إعداد الخادم
\`\`\`bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# تثبيت Certbot
sudo apt install certbot -y
\`\`\`

### 2. تحميل الكود
\`\`\`bash
# إنشاء مجلد المشروع
sudo mkdir -p /opt/manaah-platform
sudo chown $USER:$USER /opt/manaah-platform
cd /opt/manaah-platform

# استنساخ المشروع
git clone https://github.com/your-org/manaah-platform.git .

# إعداد الصلاحيات
chmod +x scripts/*.sh
\`\`\`

### 3. تكوين البيئة
\`\`\`bash
# نسخ ملف البيئة
cp .env.example .env.production

# تحرير متغيرات البيئة
nano .env.production
\`\`\`

### 4. تشغيل النشر
\`\`\`bash
# تشغيل سكريبت النشر
./scripts/deploy.sh
\`\`\`

## التكوين المتقدم

### إعداد Firewall
\`\`\`bash
# تفعيل UFW
sudo ufw enable

# السماح بالمنافذ الأساسية
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# منع الوصول المباشر لقاعدة البيانات
sudo ufw deny 5432
\`\`\`

### إعداد المراقبة
\`\`\`bash
# تثبيت htop للمراقبة
sudo apt install htop -y

# إعداد logrotate
sudo nano /etc/logrotate.d/manaah
\`\`\`

### إعداد النسخ الاحتياطي التلقائي
\`\`\`bash
# إضافة مهام cron
crontab -e

# إضافة المهام التالية:
# نسخ احتياطي يومي في الساعة 2 صباحاً
0 2 * * * /opt/manaah-platform/scripts/backup.sh

# فحص صحة النظام كل 5 دقائق
*/5 * * * * /opt/manaah-platform/scripts/health-check.sh
\`\`\`

## الأمان

### تأمين SSH
\`\`\`bash
# تحرير تكوين SSH
sudo nano /etc/ssh/sshd_config

# تغيير المنفذ الافتراضي
Port 2222

# منع تسجيل الدخول كـ root
PermitRootLogin no

# استخدام مفاتيح SSH فقط
PasswordAuthentication no

# إعادة تشغيل SSH
sudo systemctl restart ssh
\`\`\`

### تأمين قاعدة البيانات
\`\`\`bash
# تغيير كلمات المرور الافتراضية
docker-compose exec postgres psql -U manaah_user -d manaah_platform

# إنشاء مستخدمين إضافيين بصلاحيات محدودة
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
\`\`\`

## المراقبة والصيانة

### إعداد التنبيهات
\`\`\`bash
# تثبيت mailutils للإشعارات
sudo apt install mailutils -y

# إعداد تنبيهات البريد الإلكتروني
echo "admin@manaah.gov.sa" | sudo tee /etc/aliases
sudo newaliases
\`\`\`

### مراقبة الأداء
\`\`\`bash
# تثبيت أدوات المراقبة
sudo apt install iotop nethogs -y

# مراقبة استخدام القرص
df -h

# مراقبة استخدام الذاكرة
free -h

# مراقبة العمليات
htop
\`\`\`

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. فشل في تشغيل Docker
\`\`\`bash
# التحقق من حالة Docker
sudo systemctl status docker

# إعادة تشغيل Docker
sudo systemctl restart docker

# فحص السجلات
sudo journalctl -u docker.service
\`\`\`

#### 2. مشاكل في قاعدة البيانات
\`\`\`bash
# فحص حالة PostgreSQL
docker-compose exec postgres pg_isready

# فحص السجلات
docker-compose logs postgres

# إعادة تشغيل قاعدة البيانات
docker-compose restart postgres
\`\`\`

#### 3. مشاكل SSL
\`\`\`bash
# فحص صحة الشهادة
openssl x509 -in ssl/fullchain.pem -text -noout

# تجديد الشهادة
certbot renew

# إعادة تحميل Nginx
docker-compose exec nginx nginx -s reload
\`\`\`

## التحديثات

### تحديث التطبيق
\`\`\`bash
# سحب أحدث التغييرات
git pull origin main

# إعادة بناء ونشر
docker-compose build app
docker-compose up -d app
\`\`\`

### تحديث قاعدة البيانات
\`\`\`bash
# تشغيل migrations
docker-compose exec app npm run db:migrate

# تحديث البيانات
docker-compose exec app npm run db:seed
\`\`\`

## النسخ الاحتياطي والاستعادة

### إنشاء نسخة احتياطية
\`\`\`bash
# نسخة احتياطية كاملة
./scripts/backup.sh

# نسخة احتياطية لقاعدة البيانات فقط
docker-compose exec postgres pg_dump -U manaah_user manaah_platform > backup.sql
\`\`\`

### استعادة النسخة الاحتياطية
\`\`\`bash
# إيقاف التطبيق
docker-compose down

# استعادة قاعدة البيانات
docker-compose up -d postgres
sleep 30
cat backup.sql | docker-compose exec -T postgres psql -U manaah_user -d manaah_platform

# إعادة تشغيل التطبيق
docker-compose up -d
\`\`\`

## الدعم

للحصول على المساعدة:
1. راجع ملف MAINTENANCE.md
2. تحقق من السجلات: `docker-compose logs`
3. تواصل مع فريق التطوير: dev-team@manaah.gov.sa

---

**تم النشر بنجاح! 🎉**

الموقع متاح الآن على: https://manaah.gov.sa
