#!/bin/bash

# سكريبت اختبار النشر الشامل
# Comprehensive deployment testing script

set -e

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}[TEST] 🧪 $1${NC}"
}

print_pass() {
    echo -e "${GREEN}[PASS] ✅ $1${NC}"
}

print_fail() {
    echo -e "${RED}[FAIL] ❌ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}[WARN] ⚠️  $1${NC}"
}

echo "🧪 بدء اختبار النشر الشامل"
echo "=========================="

TESTS_PASSED=0
TESTS_FAILED=0

# اختبار 1: حالة الخدمات
print_test "فحص حالة الخدمات"
if docker-compose ps | grep -q "Up"; then
    print_pass "الخدمات تعمل"
    ((TESTS_PASSED++))
else
    print_fail "بعض الخدمات لا تعمل"
    ((TESTS_FAILED++))
fi

# اختبار 2: قاعدة البيانات
print_test "فحص قاعدة البيانات"
if docker-compose exec -T postgres pg_isready -U manaah_user > /dev/null 2>&1; then
    print_pass "قاعدة البيانات متاحة"
    ((TESTS_PASSED++))
else
    print_fail "قاعدة البيانات غير متاحة"
    ((TESTS_FAILED++))
fi

# اختبار 3: Redis
print_test "فحص Redis"
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_pass "Redis متاح"
    ((TESTS_PASSED++))
else
    print_warn "Redis غير متاح (اختياري)"
fi

# اختبار 4: API الصحة
print_test "فحص API الصحة"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_pass "API الصحة يعمل"
    ((TESTS_PASSED++))
else
    print_fail "API الصحة لا يعمل"
    ((TESTS_FAILED++))
fi

# اختبار 5: الصفحة الرئيسية
print_test "فحص الصفحة الرئيسية"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_pass "الصفحة الرئيسية تعمل"
    ((TESTS_PASSED++))
else
    print_fail "الصفحة الرئيسية لا تعمل"
    ((TESTS_FAILED++))
fi

# اختبار 6: صفحة تسجيل الدخول
print_test "فحص صفحة تسجيل الدخول"
if curl -f http://localhost:3000/login > /dev/null 2>&1; then
    print_pass "صفحة تسجيل الدخول تعمل"
    ((TESTS_PASSED++))
else
    print_fail "صفحة تسجيل الدخول لا تعمل"
    ((TESTS_FAILED++))
fi

# اختبار 7: API المصادقة
print_test "فحص API المصادقة"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if [ "$RESPONSE" = "200" ]; then
    print_pass "API المصادقة يعمل"
    ((TESTS_PASSED++))
else
    print_fail "API المصادقة لا يعمل (رمز: $RESPONSE)"
    ((TESTS_FAILED++))
fi

# اختبار 8: قاعدة البيانات - الجداول
print_test "فحص جداول قاعدة البيانات"
TABLES=$(docker-compose exec -T postgres psql -U manaah_user -d manaah_platform -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ "$TABLES" -gt 5 ]; then
    print_pass "جداول قاعدة البيانات موجودة ($TABLES جدول)"
    ((TESTS_PASSED++))
else
    print_fail "جداول قاعدة البيانات مفقودة"
    ((TESTS_FAILED++))
fi

# اختبار 9: المستخدم الإداري
print_test "فحص المستخدم الإداري"
ADMIN_EXISTS=$(docker-compose exec -T postgres psql -U manaah_user -d manaah_platform -t -c "SELECT COUNT(*) FROM users WHERE username = 'admin';" 2>/dev/null | tr -d ' ')

if [ "$ADMIN_EXISTS" = "1" ]; then
    print_pass "المستخدم الإداري موجود"
    ((TESTS_PASSED++))
else
    print_fail "المستخدم الإداري مفقود"
    ((TESTS_FAILED++))
fi

# اختبار 10: الملفات الثابتة
print_test "فحص الملفات الثابتة"
if curl -f http://localhost:3000/_next/static/ > /dev/null 2>&1; then
    print_pass "الملفات الثابتة متاحة"
    ((TESTS_PASSED++))
else
    print_warn "الملفات الثابتة قد تحتاج وقت إضافي"
fi

# النتائج
echo ""
echo "=========================="
echo "📊 نتائج الاختبار:"
echo "  ✅ نجح: $TESTS_PASSED"
echo "  ❌ فشل: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 جميع الاختبارات نجحت!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  بعض الاختبارات فشلت${NC}"
    exit 1
fi
