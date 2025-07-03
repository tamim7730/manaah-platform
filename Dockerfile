# استخدام Node.js 18 Alpine كصورة أساسية
FROM node:18-alpine AS base

# تثبيت المتطلبات الأساسية
RUN apk add --no-cache libc6-compat
WORKDIR /app

# نسخ ملفات package
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# مرحلة البناء
FROM base AS builder
WORKDIR /app
COPY . .

# تثبيت جميع المتطلبات للبناء
RUN npm ci

# بناء التطبيق
RUN npm run build

# مرحلة الإنتاج
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# إنشاء مستخدم غير جذر
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات المبنية
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
