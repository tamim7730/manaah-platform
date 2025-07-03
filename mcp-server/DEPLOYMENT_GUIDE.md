# دليل نشر خادم MCP لمنصة مناح

هذا الدليل يوضح كيفية نشر خادم MCP (Model Context Protocol) الخاص بمنصة مناح على منصة Render.

## المتطلبات الأساسية

- حساب على [Render](https://render.com)
- حساب على [GitHub](https://github.com) (اختياري للنشر التلقائي)
- Node.js 18+ للتطوير المحلي
- PostgreSQL مع PostGIS للقاعدة البيانات

## طرق النشر

### الطريقة الأولى: استخدام Render Blueprint (الموصى بها)

1. **رفع الكود إلى GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Manaah Platform MCP Server"
   git branch -M main
   git remote add origin https://github.com/yourusername/manaah-mcp-server.git
   git push -u origin main
   ```

2. **إنشاء خدمة جديدة على Render:**
   - اذهب إلى [Render Dashboard](https://dashboard.render.com)
   - انقر على "New" → "Blueprint"
   - اربط حساب GitHub الخاص بك
   - اختر المستودع الذي يحتوي على كود MCP Server
   - سيقوم Render بقراءة ملف `render.yaml` تلقائياً

3. **تكوين متغيرات البيئة:**
   سيتم إنشاء الخدمات تلقائياً مع المتغيرات المطلوبة من ملف `render.yaml`

### الطريقة الثانية: النشر اليدوي

1. **إنشاء قاعدة البيانات:**
   - اذهب إلى Render Dashboard
   - انقر على "New" → "PostgreSQL"
   - اختر الخطة المناسبة (Starter للاختبار)
   - اسم قاعدة البيانات: `manaah_platform`
   - المستخدم: `manaah_user`
   - فعّل PostGIS Extension

2. **إنشاء Web Service:**
   - انقر على "New" → "Web Service"
   - اربط مستودع GitHub أو ارفع الكود مباشرة
   - تكوين الخدمة:
     - **Name:** `manaah-mcp-server`
     - **Environment:** `Docker`
     - **Plan:** `Starter` (للاختبار)
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`

3. **تكوين متغيرات البيئة:**
   ```
   NODE_ENV=production
   PORT=10000
   
   # Database (من إعدادات PostgreSQL)
   DB_HOST=your-postgres-host
   DB_PORT=5432
   DB_NAME=manaah_platform
   DB_USER=manaah_user
   DB_PASSWORD=your-generated-password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=24h
   
   # MCP Server
   MCP_SERVER_NAME=manaah-platform
   MCP_SERVER_VERSION=1.0.0
   
   # API
   API_BASE_URL=https://your-service-name.onrender.com
   
   # Render
   RENDER_EXTERNAL_URL=https://your-service-name.onrender.com
   ```

## إعداد قاعدة البيانات

1. **الاتصال بقاعدة البيانات:**
   استخدم أي عميل PostgreSQL أو الواجهة الويب لـ Render

2. **تشغيل سكريبت الإعداد:**
   ```sql
   -- نسخ محتوى ملف database-setup.sql وتشغيله
   ```

3. **التحقق من الإعداد:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## النشر التلقائي مع GitHub Actions

1. **إعداد Secrets في GitHub:**
   - اذهب إلى إعدادات المستودع → Secrets and variables → Actions
   - أضف المتغيرات التالية:
     ```
     RENDER_SERVICE_ID=your-service-id
     RENDER_API_KEY=your-api-key
     ```

2. **الحصول على Service ID:**
   - اذهب إلى خدمة Render
   - انسخ الـ Service ID من الرابط

3. **إنشاء API Key:**
   - اذهب إلى Account Settings → API Keys
   - أنشئ مفتاح API جديد

## اختبار النشر

1. **فحص الصحة:**
   ```bash
   curl https://your-service-name.onrender.com/health
   ```

2. **اختبار MCP Server:**
   ```bash
   # اختبار الاتصال بـ MCP Server
   curl -X POST https://your-service-name.onrender.com/mcp \
     -H "Content-Type: application/json" \
     -d '{"method": "tools/list"}'
   ```

## مراقبة الأداء

### Logs
```bash
# عرض السجلات في الوقت الفعلي
render logs --service your-service-name --tail
```

### Metrics
- استخدم Render Dashboard لمراقبة:
  - استخدام الذاكرة
  - استخدام المعالج
  - عدد الطلبات
  - زمن الاستجابة

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات:**
   - تحقق من متغيرات البيئة
   - تأكد من أن PostGIS مفعل

2. **خطأ في بناء التطبيق:**
   - تحقق من ملف `package.json`
   - تأكد من وجود جميع التبعيات

3. **خطأ في تشغيل الخدمة:**
   - تحقق من السجلات
   - تأكد من أن المنفذ صحيح (10000 على Render)

### أوامر مفيدة:

```bash
# إعادة تشغيل الخدمة
render service restart your-service-name

# عرض معلومات الخدمة
render service info your-service-name

# تحديث متغيرات البيئة
render env set KEY=VALUE --service your-service-name
```

## الأمان

1. **متغيرات البيئة الحساسة:**
   - لا تضع كلمات المرور في الكود
   - استخدم متغيرات البيئة دائماً

2. **JWT Secret:**
   - استخدم مفتاح قوي ومعقد
   - غيّر المفتاح بانتظام

3. **قاعدة البيانات:**
   - استخدم كلمات مرور قوية
   - فعّل SSL للاتصالات

## التحديثات

1. **تحديث الكود:**
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

2. **تحديث التبعيات:**
   ```bash
   npm update
   npm audit fix
   ```

## الدعم

للحصول على المساعدة:
- راجع [وثائق Render](https://render.com/docs)
- راجع [وثائق MCP](https://modelcontextprotocol.io/docs)
- تحقق من السجلات للأخطاء التفصيلية

---

**ملاحظة:** هذا الدليل يفترض استخدام الإعدادات الافتراضية. قد تحتاج إلى تعديل بعض الإعدادات حسب احتياجاتك الخاصة.