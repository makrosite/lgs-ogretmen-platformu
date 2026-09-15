# LGS Öğretmen Platformu — Bugüne Kadar Yapılanlar

> Son güncelleme: 15 Mart 2026  
> Bu belge, projede şu ana kadar tamamlanan işleri özetler.

---

## 1. Ürün özeti

Öğretmen merkezli LGS deneme takip sistemi:

- Öğretmen hesap ile girer; sınıf, deneme, net, yanlış soru ve veli raporunu yönetir.
- Öğrenci hesap açmaz; tek kullanımlık / süreli link ile PWA form doldurur, yanlış soru fotoğrafı yükler.
- Veli pasif izleyici; JWT link ile mobil rapor görür.
- OMR/OCR yok (bilinçli kapsam dışı).

Tasarım kaynağı: Stitch (`docs/stitch_lgs_haz_rl_k_retmen_takip_sistemi/`) + `DESIGN.md` token’ları.

---

## 2. Mimari kararlar (kilitli)

| Konu | Karar |
|------|--------|
| Stack | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 |
| Veritabanı | PostgreSQL 16 + Prisma 5 |
| Auth | NextAuth (öğretmen, email/şifre) + JWT link (öğrenci/veli) |
| Konteyner | Docker Compose: `next-app` + `postgresql` (tek monolit app) |
| Erişim | Host port **80** → konteyner 3000 → **http://localhost** |
| WhatsApp | `wa.me` deep link (Business API yok) |
| Fotoğraf | Client-side WebP sıkıştırma, `public/uploads` |

---

## 3. Tamamlanan altyapı

- [x] Next.js 15 projesi (`src/` App Router)
- [x] Tailwind Stitch design token’ları (`globals.css`: renk, spacing, tipografi)
- [x] Plus Jakarta Sans + Inter + Material Symbols
- [x] `docker-compose.yml` + `Dockerfile` + `.dockerignore`
- [x] `.env.example` (secret’lar örnek; gerçek `.env` git’e gitmez)
- [x] Prisma şema + `db push` + seed (`prisma/seed.ts`)
- [x] Playwright smoke testleri (`e2e/smoke.spec.ts`) — login / dashboard / müfredat / tercih

### Docker servisleri

| Servis | Port | Açıklama |
|--------|------|----------|
| `postgresql` | 5432 | Postgres 16 Alpine |
| `next-app` | 80→3000 | Next.js production + seed |

```bash
docker compose up -d --build
```

---

## 4. Tamamlanan ekranlar / route’lar

### Öğretmen (NextAuth korumalı)

| Route | Durum | Not |
|-------|--------|-----|
| `/login` | Tamam | Demo: `selim@lgs.local` / `ogretmen123` |
| `/dashboard` | Tamam | KPI, net trend SVG, aktif link özeti |
| `/denemeler` | Tamam | Deneme oluştur + öğrenci form linkleri kopyala |
| `/yanlis-sorular` → `/yanlis-sorular/[examId]` | Tamam | Ders filtre, top-3, galeri, öğrenci tablosu, WhatsApp |
| `/mufredat` | Tamam | Kazanım kartları, heatmap, zümre notları |
| `/tercih` | Tamam | 5 yıllık taban puan (seed okul verisi), olasılık barları |
| `/ogrenciler` → `/ogrenciler/[studentId]` | Tamam | Karne kanvası, net grafik, rapor linki / WhatsApp |
| `/kaynak-takip` → `/kaynak-takip/[studentId]` | Tamam | Takvim, empty state, 4 adımlı ödev modal |
| `/ayarlar` | Tamam | Profil / sınıf bilgisi, çıkış |

Ortak layout: daraltılmış sidebar (`w-60`), header (`h-14`), içerik `max-w-[1280px]`.

### Öğrenci (JWT / token link)

| Route | Durum | Not |
|-------|--------|-----|
| `/form/[token]` | Tamam | Ders accordion, D/Y/B chip, yanlış için foto |
| `/form/onay` | Tamam | Konfeti, LGS projeksiyon, öğretmen not alanı |

### Veli (JWT)

| Route | Durum | Not |
|-------|--------|-----|
| `/rapor/[token]` | Tamam | Mobil bottom-nav: genel / net / kazanım / hedef |

### PWA

- [x] `public/manifest.json`
- [x] `public/sw.js` + client register
- [x] Placeholder ikonlar (`icon-192.png`, `icon-512.png`)

---

## 5. Veri modeli (Prisma — özet)

`Teacher`, `Class`, `Student`, `Exam`, `StudentLink`, `ExamResult`, `SubjectResult`, `WrongQuestion`, `School`, `SchoolYearData`, `ResourceTracker`, `Assignment`, `ZumreNote`, `KazanimProgress`

Seed içeriği:

- Demo öğretmen + 8-A sınıfı + 6 öğrenci
- 2 deneme (biri sonuçlu, biri form linkli)
- Örnek kaynak/ödev, kazanımlar, 4 lise × 5 yıl taban puan

---

## 6. API uçları

| Method | Path | Amaç |
|--------|------|------|
| * | `/api/auth/[...nextauth]` | NextAuth |
| POST/GET | `/api/denemeler` | Deneme CRUD (oluştur/liste) |
| POST | `/api/denemeler/[id]/link` | Eksik form linklerini üret |
| POST | `/api/form/[token]` | Form + foto submit |
| PATCH | `/api/exam-results/[id]/note` | Öğretmen / onay notu |
| PATCH | `/api/wrong-questions/[id]` | Galeri checkbox / teşhis |
| POST | `/api/kaynak-takip` | Kaynak + ödev ekle |

---

## 7. Tema / UI notları

- Stitch’e sadık: `secondary #4b41e1`, surface `#f8f9ff`, dual font
- Kompakt layout geçişi yapıldı: sidebar 288→240px, küçük tipografi/spacing, kısa nav etiketleri
- Docker imajı eski build ise kompakt UI için: `docker compose up -d --build next-app`

---

## 8. Bilinçli olarak yapılmayanlar (MVP dışı)

- Ayrı landing / admin / api konteynerleri
- OMR, OCR, “Benzer Soru Üret” AI
- WhatsApp Business API
- Gerçek `Lisesler.xlsx` import (şu an seed)
- Ücretli SaaS / çok kiracılı kurum paneli
- Production-grade PWA ikonları ve offline stratejisi

---

## 9. Nasıl çalıştırılır (kısa)

```bash
# Docker (önerilen)
docker compose up -d --build
# → http://localhost/login

# Yerel geliştirme
docker compose up -d postgresql
cp .env.example .env   # gerekirse DATABASE_URL localhost:5432
npm install
npx prisma db push
npm run db:seed
npm run dev            # varsayılan :3000
```

---

## 10. Sonraki aday işler (henüz yapılmadı)

1. GitHub remote + ilk push
2. Kompakt UI’nin Docker imajına net yansıması (rebuild)
3. Stitch HTML ile birebir piksel/görsel uyum turu
4. `Lisesler.xlsx` seed import
5. Landing sayfası
6. Daha geniş E2E (form submit → galeri)

---

## 11. İlgili dokümanlar

| Dosya | İçerik |
|-------|--------|
| [lgs-ogretmen-platformu.md](./lgs-ogretmen-platformu.md) | Ürün tanımı / ne değil |
| [GELISTIRME-PLANI.md](./GELISTIRME-PLANI.md) | Detaylı teknik plan |
| [TOKEN-EFFICIENCY.md](./TOKEN-EFFICIENCY.md) | Agent token kuralları |
| `stitch_.../lgs_educator_console/DESIGN.md` | Tasarım sistemi |
