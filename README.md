# LGS Öğretmen Platformu

LGS deneme takip sistemi — öğrenci form linkleri, yanlış soru galerisi, veli WhatsApp raporları.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · PostgreSQL · Prisma · Docker

---

## Yeni PC'de Kurulum (Docker Desktop gerekli)

```bash
git clone https://github.com/makrosite/lgs-ogretmen-platformu.git
cd lgs-ogretmen-platformu
bash setup.sh
```

Script otomatik olarak:
- `.env` dosyasını oluşturur ve güvenli secret'lar üretir
- Docker image'ı build eder
- Konteynerleri başlatır
- Veritabanını hazırlar ve demo verileri yükler

Kurulum bittikten sonra → **http://localhost**

| Alan | Değer |
|------|-------|
| E-posta | `selim@lgs.local` |
| Şifre | `ogretmen123` |

---

## Gereksinimler

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac/Linux)
- Git

Node.js veya npm **gerekmez** — her şey Docker içinde çalışır.

---

## Konteyner Yönetimi

```bash
# Durdur
docker compose down

# Tekrar başlat
docker compose up -d

# Canlı log
docker compose logs -f

# Veritabanı dahil tamamen sil
docker compose down -v
```

---

## Ekranlar

| Route | Açıklama |
|-------|----------|
| `/login` | Öğretmen girişi |
| `/dashboard` | Ana gösterge paneli |
| `/denemeler` | Sınav listesi + öğrenci link üretici |
| `/yanlis-sorular/[examId]` | Fotoğraf galerisi + öğrenci tablosu |
| `/mufredat` | Müfredat ve kazanım takibi |
| `/tercih` | Hedef lise ve taban puan motoru |
| `/ogrenciler/[studentId]` | Öğrenci karnesi + veli raporu |
| `/kaynak-takip/[studentId]` | Kaynak ve ödev çizelgesi |
| `/form/[token]` | Öğrenci PWA formu (D/Y/B + fotoğraf) |
| `/rapor/[token]` | Veli mobil raporu |

---

## Geliştirme (local)

```bash
docker compose up -d postgresql
cp .env.example .env
# .env içinde DATABASE_URL'i localhost'a çevir
npm install
npx prisma db push
npm run db:seed
npm run dev
```
