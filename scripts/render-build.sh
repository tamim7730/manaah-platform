#!/bin/bash
# Render Build Script for Manaah Platform

set -e

echo "🚀 بدء عملية البناء لمنصة مناح على Render..."
echo "🚀 Starting Manaah Platform build on Render..."

# تثبيت التبعيات
echo "📦 تثبيت التبعيات..."
echo "📦 Installing dependencies..."
npm ci

# فحص الأنواع
echo "🔍 فحص TypeScript..."
echo "🔍 Type checking..."
npm run type-check

# بناء التطبيق
echo "🏗️ بناء التطبيق..."
echo "🏗️ Building application..."
npm run build

echo "✅ تم إكمال عملية البناء بنجاح!"
echo "✅ Build completed successfully!"