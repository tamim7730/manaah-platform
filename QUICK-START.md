# 🚀 التنفيذ السريع - منصة مناعة

## تنفيذ فوري في خطوة واحدة

\`\`\`bash
# تنفيذ كامل في أمر واحد
npm run run:now
\`\`\`

## أو خطوة بخطوة:

### 1. الإعداد السريع
\`\`\`bash
npm run deploy:dev
\`\`\`

### 2. النشر
\`\`\`bash
npm run deploy
\`\`\`

### 3. الاختبار
\`\`\`bash
npm run deploy:test
\`\`\`

### 4. المراقبة
\`\`\`bash
npm run monitor
\`\`\`

## الروابط السريعة

- 🌐 **الموقع**: http://localhost:3000
- 🔧 **لوحة التحكم**: http://localhost:3000/dashboard  
- ❤️ **فحص الصحة**: http://localhost:3000/api/health

## بيانات تسجيل الدخول

- 👤 **المدير**: admin / admin123
- 📊 **مدخل البيانات**: data_entry / data123
- 👁️ **مشاهد**: viewer / view123

## أوامر مفيدة

\`\`\`bash
# مراقبة الخدمات
npm run docker:ps

# عرض السجلات
npm run docker:logs

# نسخة احتياطية
npm run backup

# فحص الصحة
npm run health
\`\`\`

## استكشاف الأخطاء

### إذا فشل النشر:
\`\`\`bash
# إعادة تشغيل الخدمات
npm run docker:down
npm run docker:up

# فحص السجلات
npm run docker:logs
\`\`\`

### إذا لم تعمل قاعدة البيانات:
\`\`\`bash
# إعادة تشغيل قاعدة البيانات
docker-compose restart postgres

# فحص حالة قاعدة البيانات
docker-compose exec postgres pg_isready -U manaah_user
\`\`\`

## الدعم

- 📧 **البريد الإلكتروني**: support@manaah.gov.sa
- 📱 **الهاتف**: +966-11-XXX-XXXX
- 🌐 **الموقع**: https://manaah.gov.sa

---

**تم التنفيذ بنجاح! 🎉**
