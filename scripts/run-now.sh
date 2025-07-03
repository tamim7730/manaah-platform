#!/bin/bash

# تنفيذ فوري لمنصة مناعة
# Immediate execution for Manaah Platform

set -e

echo "🚀 تنفيذ فوري لمنصة مناعة"
echo "========================="

# التحقق من وجود Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت. يرجى تثبيت Docker أولاً."
    exit 1
fi

# إعطاء صلاحيات التنفيذ للسكريبتات
chmod +x scripts/*.sh

# تشغيل الإعداد السريع للتطوير
echo "🔧 تشغيل الإعداد السريع..."
./scripts/dev-setup.sh

# بناء التطبيق
echo "🏗️  بناء التطبيق..."
npm run build

# تشغيل النشر
echo "🚀 تشغيل النشر..."
./scripts/execute-deployment.sh

# تشغيل الاختبارات
echo "🧪 تشغيل الاختبارات..."
sleep 10
./scripts/test-deployment.sh

echo ""
echo "🎉 تم التنفيذ بنجاح!"
echo ""
echo "🌐 المنصة متاحة على:"
echo "   http://localhost:3000"
echo ""
echo "🔧 لمراقبة النظام:"
echo "   ./scripts/monitor-live.sh"
