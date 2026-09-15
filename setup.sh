#!/bin/bash
# ============================================================
#  LGS Öğretmen Platformu — Yeni PC Kurulum Scripti
#  Gereksinim: Docker Desktop kurulu ve çalışıyor olmalı
#  Kullanım: bash setup.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   LGS Öğretmen Platformu — Kurulum       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Docker kontrolü
if ! command -v docker &> /dev/null; then
  echo -e "${RED}✗ Docker bulunamadı!${NC}"
  echo "  Docker Desktop indir: https://www.docker.com/products/docker-desktop"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}✗ Docker çalışmıyor!${NC}"
  echo "  Docker Desktop uygulamasını başlatın ve tekrar deneyin."
  exit 1
fi

echo -e "${GREEN}✓ Docker hazır${NC}"

# .env dosyası kontrolü
if [ ! -f ".env" ]; then
  echo ""
  echo -e "${YELLOW}⚙  .env dosyası oluşturuluyor...${NC}"
  cp .env.example .env

  # Rastgele güvenli secret'lar üret
  if command -v openssl &> /dev/null; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    # .env içindeki placeholder'ları değiştir
    sed -i "s/BURAYA_32_KARAKTER_RASTGELE_YAZ/${NEXTAUTH_SECRET}/" .env
    # İkinci satırı da değiştir (JWT_SECRET için)
    ESCAPED=$(echo "$JWT_SECRET" | sed 's/[\/&]/\\&/g')
    awk -v new="$ESCAPED" '/JWT_SECRET=BURAYA/ { $0 = "JWT_SECRET=" new } 1' .env > .env.tmp && mv .env.tmp .env
    echo -e "${GREEN}✓ Güvenli secret'lar otomatik üretildi${NC}"
  else
    echo -e "${YELLOW}⚠  openssl bulunamadı — .env dosyasını manuel düzenleyin:${NC}"
    echo "   NEXTAUTH_SECRET ve JWT_SECRET alanlarına rastgele 32 karakter yazın"
  fi
else
  echo -e "${GREEN}✓ .env dosyası mevcut${NC}"
fi

echo ""
echo -e "${BLUE}🔨 Docker image build ediliyor (ilk seferde 3-5 dk sürebilir)...${NC}"
docker compose build

echo ""
echo -e "${BLUE}🚀 Konteynerler başlatılıyor...${NC}"
docker compose up -d

echo ""
echo -e "${BLUE}⏳ Uygulama hazır olana kadar bekleniyor...${NC}"
MAX_WAIT=120
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/login 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "302" ]; then
    break
  fi
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  echo -n "."
done
echo ""

if [ $ELAPSED -ge $MAX_WAIT ]; then
  echo -e "${YELLOW}⚠  Uygulama henüz yanıt vermiyor. Logları kontrol edin:${NC}"
  echo "   docker compose logs next-app"
else
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   ✅ Kurulum tamamlandı!                      ║${NC}"
  echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
  echo -e "${GREEN}║   🌐 Adres  : http://localhost                ║${NC}"
  echo -e "${GREEN}║   📧 E-posta: selim@lgs.local                 ║${NC}"
  echo -e "${GREEN}║   🔑 Şifre  : ogretmen123                     ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}Faydalı komutlar:${NC}"
  echo "  docker compose logs -f        # canlı log"
  echo "  docker compose down           # durdur"
  echo "  docker compose down -v        # durdur + veritabanını sil"
  echo "  docker compose up -d          # tekrar başlat"
fi
