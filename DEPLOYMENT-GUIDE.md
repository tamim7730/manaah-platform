# دليل النشر السريع لمنصة مناح
# Quick Deployment Guide for Manaah Platform

## النشر على Render 🚀

### الخطوات:

1. **إنشاء حساب على Render**
   - اذهب إلى [render.com](https://render.com)
   - أنشئ حساب جديد أو سجل الدخول

2. **ربط مستودع GitHub**
   - اضغط على "New +" → "Blueprint"
   - اختر "Connect GitHub" وأذن لـ Render بالوصول
   - اختر مستودع `manaah-platform`

3. **استخدام Blueprint**
   - سيتم اكتشاف ملف `render.yaml` تلقائياً
   - اضغط "Apply" لبدء النشر

4. **إعداد متغيرات البيئة**
   سيتم إنشاء المتغيرات التالية تلقائياً:
   - `DATABASE_URL` - من قاعدة البيانات المُنشأة
   - `JWT_SECRET` - مُولد تلقائياً
   - `NEXTAUTH_SECRET` - مُولد تلقائياً
   - `NEXTAUTH_URL` - من رابط الخدمة

### الخدمات المُنشأة:

- **Web Service**: `manaah-platform`
  - URL: `https://manaah-platform.onrender.com`
  - Health Check: `/api/health`

- **Database**: `manaah-db`
  - PostgreSQL مع PostGIS
  - خطة مجانية

### بعد النشر:

1. **إعداد قاعدة البيانات**
   ```bash
   # تشغيل script إعداد قاعدة البيانات
   psql $DATABASE_URL -f scripts/render-setup.sql
   ```

2. **التحقق من الصحة**
   - زيارة: `https://your-app.onrender.com/api/health`
   - يجب أن ترى: `{"status":"healthy"}`

3. **تسجيل الدخول**
   - المستخدم: `admin`
   - كلمة المرور: `admin123` (يُنصح بتغييرها)

---

## النشر على Railway 🚄

### الخطوات:

1. **تثبيت Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **تسجيل الدخول**
   ```bash
   railway login
   ```

3. **إنشاء مشروع جديد**
   ```bash
   railway init
   ```

4. **إضافة قاعدة البيانات**
   ```bash
   railway add postgresql
   ```

5. **النشر**
   ```bash
   railway up
   ```

---

## النشر على Vercel ▲

### الخطوات:

1. **تثبيت Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **النشر**
   ```bash
   vercel --prod
   ```

3. **إعداد قاعدة البيانات خارجية**
   - استخدم Supabase أو PlanetScale
   - أضف `DATABASE_URL` في إعدادات Vercel

---

## النشر باستخدام Docker 🐳

### للإنتاج:

```bash
# بناء الصورة
docker-compose -f docker-compose.production.yml build

# تشغيل الخدمات
docker-compose -f docker-compose.production.yml up -d
```

### للتطوير:

```bash
docker-compose up -d
```

---

## متغيرات البيئة المطلوبة

### أساسية:
- `DATABASE_URL` - رابط قاعدة البيانات
- `JWT_SECRET` - مفتاح JWT
- `NEXTAUTH_SECRET` - مفتاح NextAuth
- `NEXTAUTH_URL` - رابط التطبيق

### اختيارية:
- `REDIS_URL` - للتخزين المؤقت
- `MONITORING_WEBHOOK_URL` - للمراقبة
- `WOAH_API_URL` - لبيانات WOAH

---

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في قاعدة البيانات**
   - تأكد من تشغيل `render-setup.sql`
   - تحقق من صحة `DATABASE_URL`

2. **خطأ في البناء**
   - تحقق من logs البناء
   - تأكد من تثبيت جميع التبعيات

3. **خطأ في المصادقة**
   - تحقق من `JWT_SECRET` و `NEXTAUTH_SECRET`
   - تأكد من صحة `NEXTAUTH_URL`

### الحصول على المساعدة:

- تحقق من logs: `/api/monitoring/logs`
- فحص الصحة: `/api/health`
- مراجعة الوثائق في `README.md`

---

## الأمان والصيانة

### بعد النشر:

1. **تغيير كلمات المرور الافتراضية**
2. **إعداد النسخ الاحتياطية**
3. **تفعيل HTTPS**
4. **مراقبة الأداء**
5. **تحديث التبعيات بانتظام**

### مراقبة النظام:

- Dashboard: `/dashboard`
- API Health: `/api/health`
- Monitoring: `/api/monitoring`

---

**🎉 تهانينا! منصة مناح جاهزة للاستخدام**

للدعم التقني: [GitHub Issues](https://github.com/tamim7730/manaah-platform/issues)