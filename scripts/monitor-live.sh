#!/bin/bash

# مراقبة مستمرة للنظام
# Live system monitoring

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}🔍 مراقبة مستمرة لمنصة مناعة${NC}"
echo -e "${CYAN}================================${NC}"
echo "اضغط Ctrl+C للخروج"
echo ""

while true; do
    # مسح الشاشة والعودة للأعلى
    tput cup 4 0
    
    # الوقت الحالي
    echo -e "${BLUE}⏰ الوقت: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # حالة الخدمات
    echo -e "${YELLOW}📊 حالة الخدمات:${NC}"
    echo "==================="
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | head -10
    echo ""
    
    # استخدام الموارد
    echo -e "${YELLOW}💻 استخدام الموارد:${NC}"
    echo "===================="
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -5
    echo ""
    
    # فحص الصحة السريع
    echo -e "${YELLOW}❤️  فحص الصحة:${NC}"
    echo "==============="
    
    # فحص التطبيق
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "  التطبيق: ${GREEN}✅ يعمل${NC}"
    else
        echo -e "  التطبيق: ${RED}❌ لا يعمل${NC}"
    fi
    
    # فحص قاعدة البيانات
    if docker-compose exec -T postgres pg_isready -U manaah_user > /dev/null 2>&1; then
        echo -e "  قاعدة البيانات: ${GREEN}✅ تعمل${NC}"
    else
        echo -e "  قاعدة البيانات: ${RED}❌ لا تعمل${NC}"
    fi
    
    # فحص Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "  Redis: ${GREEN}✅ يعمل${NC}"
    else
        echo -e "  Redis: ${YELLOW}⚠️  لا يعمل${NC}"
    fi
    
    echo ""
    
    # مساحة القرص
    echo -e "${YELLOW}💾 مساحة القرص:${NC}"
    echo "================"
    df -h | grep -E "(Filesystem|/dev/)" | head -3
    echo ""
    
    # آخر السجلات
    echo -e "${YELLOW}📝 آخر السجلات:${NC}"
    echo "==============="
    docker-compose logs --tail=3 app 2>/dev/null | tail -3
    echo ""
    
    # انتظار 5 ثواني
    sleep 5
done
