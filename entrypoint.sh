#!/bin/sh
set -e

echo "⏳ Veritabanı migration çalıştırılıyor..."
npx prisma db push

# Seed sadece teacher tablosu boşsa çalışır (ilk kurulum)
TEACHER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.teacher.count().then(n => { console.log(n); p.\$disconnect(); }).catch(() => { console.log(0); });
")

if [ "$TEACHER_COUNT" = "0" ]; then
  echo "🌱 İlk kurulum: demo veriler yükleniyor..."
  npx tsx prisma/seed.ts
  echo "✅ Demo veriler yüklendi."
else
  echo "✅ Veritabanı mevcut ($TEACHER_COUNT öğretmen), seed atlandı."
fi

echo "🚀 Uygulama başlatılıyor..."
exec npm start
