# LGS Öğretmen Platformu — Eksiksiz Geliştirme Planı

> Tüm Stitch ekran tasarımları okunarak hazırlanmıştır. Birebir uygulama hedeflenir.

---

## 1. Mimari (Final)

| Katman | Teknoloji |
|--------|-----------|
| Frontend + API | Next.js 15 (App Router) + TypeScript |
| Stil | Tailwind CSS + özel design token'lar |
| Veritabanı | PostgreSQL + Prisma ORM |
| Öğretmen Auth | NextAuth.js (email/password) |
| Öğrenci/Veli Link | JWT (stateless, one-time, süreli) |
| PWA | manifest.json + service worker (öğrenci formu) |
| Konteynerler | Docker Compose: `next-app` + `postgresql` (2 adet) |

```yaml
# docker-compose.yml (özet)
services:
  next-app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://...
  postgresql:
    image: postgres:16
    ports: ["5432:5432"]
```

---

## 2. Klasör Yapısı

```
src/
  app/
    (teacher)/                    # NextAuth korumalı öğretmen alanı
      dashboard/page.tsx
      denemeler/page.tsx
      yanlis-sorular/[examId]/page.tsx
      mufredat/page.tsx
      tercih/page.tsx
      ogrenciler/[studentId]/page.tsx
      kaynak-takip/[studentId]/page.tsx
      ayarlar/page.tsx
      layout.tsx                  # Sidebar + Header wrapper

    form/
      [token]/page.tsx            # Öğrenci PWA formu (no-auth)
      onay/page.tsx               # Gönderim onay ekranı (konfeti)

    rapor/
      [token]/page.tsx            # Veli mobil raporu (no-auth)

    api/
      auth/[...nextauth]/route.ts
      denemeler/route.ts
      denemeler/[id]/link/route.ts
      form/[token]/route.ts
      form/[token]/photo/route.ts
      ogrenciler/route.ts
      ogrenciler/[id]/rapor/route.ts
      tercih/okullar/route.ts
      kaynak-takip/route.ts
      kaynak-takip/[id]/gorev/route.ts

  components/
    layout/
      Sidebar.tsx                 # w-72, 7 nav item, şube dropdown
      Header.tsx                  # search + "Yeni Deneme Linki" + notif + profil
    ui/
      MetricCard.tsx
      KazanimCard.tsx             # border-l-4 renkli
      DataTable.tsx
      Badge.tsx
      Toast.tsx
      Modal.tsx
    teacher/
      WrongQuestionGallery/
      CurriculumTracker/
      ResourceCalendar/
      StudentReportCanvas/
      PreferenceEngine/
    student/
      ExamForm/                   # D/Y/B chips + fotoğraf yükleme
      ConfirmationScreen/         # konfeti animasyonu
    parent/
      MobileReport/               # mobil PWA görünümü

  lib/
    auth.ts                       # NextAuth config
    prisma.ts                     # Prisma client singleton
    jwt.ts                        # Öğrenci link token oluştur/doğrula
    whatsapp.ts                   # wa.me mesaj şablonu
    pdf.ts                        # Rapor PDF export

  prisma/
    schema.prisma
    seed.ts                       # Lisesler.xlsx → schools tablosu

  public/
    manifest.json                 # lang: tr-TR, standalone, theme: #2563eb
    sw.js                         # service worker
```

---

## 3. Tailwind Design Tokens (birebir Stitch)

```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'secondary':                '#4b41e1',
      'on-secondary':             '#ffffff',
      'secondary-container':      '#e4dfff',
      'on-secondary-container':   '#100060',
      'error':                    '#ba1a1a',
      'error-container':          '#ffdad6',
      'tertiary-container':       '#002113',
      'on-tertiary-container':    '#009668',
      'surface':                  '#faf9ff',
      'surface-container-low':    '#f4f3fa',
      'surface-container':        '#eeedf4',
      'outline':                  '#787680',
      'outline-variant':          '#cac4d4',
      'primary-container':        '#0f172a',
      'on-primary-container':     '#e2e8f0',
    },
    fontFamily: {
      'headline': ['Plus Jakarta Sans', 'sans-serif'],
      'body':     ['Inter', 'sans-serif'],
    },
    spacing: {
      'xs':  '4px',
      'sm':  '8px',
      'md':  '16px',
      'lg':  '24px',
      'xl':  '40px',
    },
    borderRadius: {
      'card': '12px',
      'chip': '8px',
      'badge': '6px',
    }
  }
}
```

---

## 4. Veritabanı Şeması (Prisma)

```prisma
model Teacher {
  id        String      @id @default(cuid())
  email     String      @unique
  name      String
  title     String?
  classes   Class[]
  notes     ZumreNote[]
}

model Class {
  id        String    @id @default(cuid())
  name      String    // "8-A"
  teacherId String
  teacher   Teacher   @relation(fields: [teacherId], references: [id])
  students  Student[]
  exams     Exam[]
}

model Student {
  id           String            @id @default(cuid())
  name         String
  number       Int
  classId      String
  class        Class             @relation(fields: [classId], references: [id])
  targetSchool String?
  parentPhone  String?
  examResults  ExamResult[]
  links        StudentLink[]
  resources    ResourceTracker[]
}

model Exam {
  id        String        @id @default(cuid())
  name      String        // "Özdebir Türkiye Geneli 4"
  publisher String
  date      DateTime
  classId   String
  class     Class         @relation(fields: [classId], references: [id])
  links     StudentLink[]
  results   ExamResult[]
  locked    Boolean       @default(false)
}

model StudentLink {
  id        String    @id @default(cuid())
  token     String    @unique
  examId    String
  studentId String
  exam      Exam      @relation(fields: [examId], references: [id])
  student   Student   @relation(fields: [studentId], references: [id])
  usedAt    DateTime?
  expiresAt DateTime
}

model ExamResult {
  id             String          @id @default(cuid())
  examId         String
  studentId      String
  exam           Exam            @relation(fields: [examId], references: [id])
  student        Student         @relation(fields: [studentId], references: [id])
  subjectResults SubjectResult[]
  wrongQuestions WrongQuestion[]
  submittedAt    DateTime        @default(now())
  parentNotified Boolean         @default(false)
  teacherNote    String?
}

model SubjectResult {
  id           String     @id @default(cuid())
  examResultId String
  examResult   ExamResult @relation(fields: [examResultId], references: [id])
  subject      String     // "Matematik" | "Türkçe" | "Fen" | "Sosyal" | "İngilizce" | "Din" | "İnkılap"
  correct      Int
  wrong        Int
  blank        Int
  // net = correct - (wrong / 3)
}

model WrongQuestion {
  id           String     @id @default(cuid())
  examResultId String
  examResult   ExamResult @relation(fields: [examResultId], references: [id])
  subject      String
  questionNo   Int
  photoUrl     String?    // WebP, /public/uploads/
  teacherDiag  String?
  kazanim      String?    // MEB kodu: "M.8.1.1.3"
  solvedInClass Boolean   @default(false)
}

model School {
  id       String         @id @default(cuid())
  name     String
  type     String         // "Fen Lisesi" | "Anadolu Lisesi" | "Sosyal Bil." | "İMKB"
  city     String
  district String
  yearData SchoolYearData[]
}

model SchoolYearData {
  id         String @id @default(cuid())
  schoolId   String
  school     School @relation(fields: [schoolId], references: [id])
  year       Int
  minScore   Float
  maxScore   Float
  quota      Int
  percentile Float
}

model ResourceTracker {
  id          String       @id @default(cuid())
  studentId   String
  student     Student      @relation(fields: [studentId], references: [id])
  publisher   String
  bookName    String
  totalTests  Int
  assignments Assignment[]
}

model Assignment {
  id                String          @id @default(cuid())
  resourceTrackerId String
  resource          ResourceTracker @relation(fields: [resourceTrackerId], references: [id])
  startTest         Int
  endTest           Int
  dueDate           DateTime
  status            String          @default("pending") // "pending" | "done" | "remedial"
  score             String?
}

model ZumreNote {
  id        String   @id @default(cuid())
  teacherId String
  teacher   Teacher  @relation(fields: [teacherId], references: [id])
  content   String
  createdAt DateTime @default(now())
}
```

---

## 5. Route → Ekran Eşleştirmesi

| Route | Ekran | Auth |
|-------|-------|------|
| `/dashboard` | Ana Gösterge Paneli | NextAuth |
| `/denemeler` | Deneme Sınavları + Link Oluştur | NextAuth |
| `/yanlis-sorular/[examId]` | Yanlış Soru Galerisi | NextAuth |
| `/mufredat` | Müfredat & Konu Takip | NextAuth |
| `/tercih` | Tercih Motoru & Taban Puanlar | NextAuth |
| `/ogrenciler/[studentId]` | Öğrenci Karnesi & Veli Raporlama | NextAuth |
| `/kaynak-takip/[studentId]` | Kaynak & Ödev Takip | NextAuth |
| `/ayarlar` | Ayarlar | NextAuth |
| `/form/[token]` | Öğrenci PWA Formu | JWT token |
| `/form/onay` | Gönderim Onay (konfeti) | JWT token |
| `/rapor/[token]` | Veli Mobil Raporu | JWT token |

---

## 6. Sayfa Detayları (Birebir Tasarım)

### 6.1 Teacher Layout
- Sol sidebar: `fixed left-0 w-72`, `bg-surface-container-low`
- **7 nav item:** Dashboard, Denemeler, Yanlış Soru Galerisi, Müfredat Takip, Tercih Motoru, Öğrenci & Veli Raporu, Kaynak & Ödev Takibi, Ayarlar
- Aktif item: `bg-secondary-container text-on-secondary-container rounded-r-full`
- Header: `h-16 fixed top-0 left-72`, search, "Yeni Deneme Linki Oluştur" (filled button), bildirim (error badge), profil avatar

### 6.2 Yanlış Soru Galerisi `/yanlis-sorular/[examId]`
- Deneme başlığı + tarih badge + katılım sayısı
- "Sonuçları Kilitle" + "Toplu PDF" butonları
- Ders sekmeleri: Tümü / Matematik / Fen / Türkçe / Sosyal / İngilizce / Din / İnkılap (hata sayısı badge'li)
- Filtre bar: En Çok Yanlış / Soru No / Öğrenciye Göre dropdown
- **Top 3 Kritik Soru:** 3'lü grid, fire icon + yüzde + öğrenci sayısı
- **Fotoğraf Galerisi (4 kolon):**
  - `h-56` görsel alanı + öğrenci avatar overlay (sağ üst)
  - Soru no badge (sol üst)
  - Alt kart: kazanım kodu + doğru şık + öğretmen teşhis notu
  - Checkbox "Derste Birlikte Çöz" + zoom + "Benzer Soru Üret" butonları
- **Öğrenci tablosu:** Ad / Doğru / Yanlış / Boş / Net / Puan / Fotoğraf / Veli Durum / Aksiyon
  - Veli durumu badge: "Gönderildi" (on-tertiary-container bg) / "Kuyrukta" / "Gönderilmedi" (error)
- Alt: "Toplu WhatsApp Gönder" butonu

### 6.3 Müfredat Takip `/mufredat`
- LGS gün sayacı badge + Hafta navigator + butonlar (Kazanım Ödevi, PDF, Haftalık Telafi)
- Ders sekme filtresi (Matematik aktif) 
- **4 KPI kartı:** Müfredat %68.5 / Hakimiyet %74.2 / 4 Kritik Konu / %88 Ödev
- **8/4 grid:**
  - Sol 8 kolon: Kazanım kart listesi
    - Her kart: `border-l-4` renk kodlaması:
      - `border-error` = kritik (kırmızı)
      - `border-on-tertiary-container` = tamamlandı (yeşil)
      - `border-secondary` = devam (mor)
      - `border-outline-variant` = planlandı (gri)
    - MEB kodu badge + başarı % + mini progress bar + aksiyon butonları
  - Sağ 4 kolon: Bu haftanın odağı + Riskli öğrenci segmentasyonu + Zümre notları
- **7-hücre Heatmap:** error (<50%) / secondary (50-74%) / on-tertiary-container (75%+)

### 6.4 Öğrenci Karnesi `/ogrenciler/[studentId]`
- Öğrenci profil header + hedef okul badge
- 3 buton: "Not Düzenle" + "PDF İndir" + "WhatsApp Gönder"
- **"Veli Önizleme Modu"** bilgi bandı (sarı/warning)
- **Rapor Kanvası** (dark `bg-primary-container` header):
  - LGS tahmini puan + öğrenci adı
  - Öğretmen anlatım notu (modal ile düzenlenebilir)
  - 3 KPI kartı: doğruluk % / son net + sınıf sırası / yüzdelik dilim
  - **SVG Net Gelişim Grafiği:** 4 veri noktası polyline + area gradient fill (secondary renk)
  - Ders progress barlar: Türkçe / Matematik / Fen + sözel 3'lü mini grid
  - Hedef lise uyumluluk barları (3 okul, % uyum)
  - Yanlış sorular bölümü (veli dostu, fotoğrafsız)
- **WhatsApp Log:** son gönderilen mesaj önizleme + Kopyala + Gönder

### 6.5 Veli Mobil Raporu `/rapor/[token]`
- Mobile layout, fixed header + bottom nav (4 tab: Genel Bakış / Net Takibi / Kazanımlar / Hedef Liseler)
- **"Doğrulanmış Rapor"** badge (verified yeşil)
- Öğrenci fotoğraf kartı
- Öğretmen notu kartı + veli yönlendirme pill'i
- **2×2 bento metric grid:** LGS Puanı / yüzdelik dilim / doğruluk % / son net
- Ders bazlı net breakdown: TR / MAT / FEN / sözel
- İncelenen yanlış sorular (2 kart, fotoğraflı)
- Hedef liseler (3 okul, uyumluluk bar + etiket)
- PDF İndir + WhatsApp ile Öğretmene butonları

### 6.6 Öğrenci PWA Formu `/form/[token]`
- **manifest.json:** `lang: tr-TR`, `display: standalone`, `background_color: #0f172a`, `theme_color: #2563eb`
- Deneme bilgisi header (yayınevi + tarih)
- Ders accordion'ları (Türkçe/Matematik/Fen/Sosyal/İngilizce/Din/İnkılap)
  - Her soruda: **D / Y / B** chip seçimi (3'lü toggle)
  - Soru numarası listesi + seçim durumu
- **Fotoğraf Yükleme:** `input[type=file accept="image/*"]`, WebP compression (canvas API), max 800px
- Submit: validasyon → API → `/form/onay`

### 6.7 Gönderim Onay Ekranı `/form/onay`
- **Konfeti animasyonu:** 18 renkli nokta, CSS keyframes (`@keyframes confetti-fall`)
- Animated ping badge + success icon (yeşil)
- "Harika İş Çıkardın [Öğrenci Adı]! 🎉"
- Flash LGS Projeksiyon kartı: Net / Puan / Yüzdelik aralık / Hedef okul uyum barı
- Yüklenen soru galerisi (2 kart + "Diğer X'i Göster")
- Veli bildirim durum göstergesi
- **Öğretmen Not Alanı:**
  - `textarea` 0/120 karakter sayacı
  - Hızlı snippet butonları: "Teşekkürler" / "Süre Sorunu" / "Harika Çalışma"
  - Gönder + WhatsApp tetik butonları

### 6.8 Kaynak & Ödev Takip `/kaynak-takip/[studentId]`
- Sidebar 7. nav item: "Kaynak & Ödev Takibi" (auto_stories ikonu)
- **Filtre Deck:** Öğrenci / Ders / Tarih Aralığı / Durum dropdown'ları
- **Yayınevi hızlı filtre tag'leri:** 8 adet (Orijinal, Nitelik, TYT/AYT, Hız, vb.)
- **Özet Kart:** toplam soru / doğruluk % / kritik telafi sayısı
- **Konu milestone status bar:** 4 renkli kart (tamamlanan/devam/bekleyen/telafi)
- **7 günlük Takvim Matrisi (2 hafta):**
  - Yeşil kart = tamamlandı
  - Kırmızı kart = gecikmiş/bekleyen
  - Her kart: yayınevi + test no + tarih
- **Yayınevi İlerleme Barları:** 4 kitap (% tamamlanma + toplam soru sayısı)
- **Hızlı Ödev Atama Dock:**
  - Yayınevi / Test Aralığı / Tarih select'leri
  - WhatsApp + Excel + Yeni Ödev butonları
- **Modal (hızlı ödev atama):**
  - Arka plan: `blur-[2px] opacity-75 pointer-events-none`
  - Overlay: `bg-[#0b1c30]/65 backdrop-blur-sm`
  - **4 adım:**
    1. Yayınevi seçimi (7 renkli ikonlu kart, seçili = `ring-2 ring-secondary`)
    2. Ders + kazanım dropdown
    3. Test aralığı inputları + otomatik hesaplama (soru sayısı, süre)
    4. Dağıtım yöntemi (3 günlük / tek gün / telafi havuzu, radio card)
  - WhatsApp bildirim toggle switch
  - Footer: Vazgeç + Ekle butonları

### 6.9 Empty State (Kaynak Takip)
- Aynı layout, yeni öğrenci için
- Takvim: dashed border + boş
- Büyük ikon + "Henüz program oluşturulmadı" mesajı
- CTA: "+ Yeni Kaynak Çizelgesi Başlat" + "Sınıf Şablonundan Kopyala"
- Önerilen başlangıç kitapları (4 kart + "Kitaplığa Ekle")

---

## 7. Authentication Akışı

```
Öğretmen:
  /login → NextAuth → session cookie → (teacher) layout

Öğrenci:
  Öğretmen "Link Oluştur" → JWT(examId, studentId, exp:48h) → QR/link
  /form/[token] → API doğrular → form

Veli:
  Öğretmen "WhatsApp Gönder" → wa.me/[telefon]?text=[...rapor linki...]
  /rapor/[token] → JWT(studentId, examResultId) → mobil rapor
```

---

## 8. Fotoğraf Yükleme Stratejisi

```typescript
// client-side WebP compression
async function compressToWebP(file: File): Promise<Blob> {
  const img = new Image()
  img.src = URL.createObjectURL(file)
  await img.decode()
  
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 800 / Math.max(img.width, img.height))
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  return new Promise(r => canvas.toBlob(b => r(b!), 'image/webp', 0.82))
}
```

Dosya kayıt: `/public/uploads/[examId]/[studentId]/q[no].webp`
API: `POST /api/form/[token]/photo` → multipart/form-data

---

## 9. WhatsApp Entegrasyonu

```typescript
// lib/whatsapp.ts
export function buildParentMessage(data: {
  studentName: string
  examName: string
  net: number
  score: number
  percentile: number
  reportUrl: string
}): string {
  return `Sayın veli,\n\n` +
    `${data.studentName} öğrencinizin *${data.examName}* sonuçları hazır.\n\n` +
    `📊 Net: ${data.net} | Puan: ${data.score} | Dilim: %${data.percentile}\n\n` +
    `Detaylı rapor için: ${data.reportUrl}\n\n` +
    `_LGS Takip Sistemi_`
}

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/90${phone}?text=${encodeURIComponent(message)}`
}
```

---

## 10. PWA Manifest

```json
{
  "name": "LGS Deneme Formu",
  "short_name": "LGS Form",
  "lang": "tr-TR",
  "start_url": "/form",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 11. Geliştirme Öncelik Sırası

### Aşama 1 — Temel Altyapı
1. `docker-compose.yml` + Dockerfile
2. Next.js 15 kurulumu + Tailwind config (design token'lar)
3. Prisma şema + migration
4. `seed.ts` → Lisesler.xlsx import
5. NextAuth kurulumu

### Aşama 2 — Öğrenci Tarafı (PWA)
6. `/form/[token]` → D/Y/B formu + fotoğraf yükleme
7. API endpoint'leri (form submit + photo upload)
8. `/form/onay` → konfeti ekranı

### Aşama 3 — Öğretmen Paneli (Core)
9. Teacher Layout (sidebar + header)
10. `/dashboard` → KPI kartları
11. `/denemeler` → sınav listesi + link oluşturucu
12. `/yanlis-sorular/[examId]` → galeri + tablo

### Aşama 4 — Analiz Ekranları
13. `/mufredat` → kazanım takip + heatmap
14. `/ogrenciler/[studentId]` → rapor kanvası + SVG grafik
15. `/tercih` → okul tercih motoru

### Aşama 5 — Veli & Kaynak
16. `/rapor/[token]` → veli mobil raporu
17. `/kaynak-takip/[studentId]` → takvim + ödev modal
18. WhatsApp entegrasyonu
19. PDF export

### Aşama 6 — Son Rötuşlar
20. Service worker + PWA offline
21. E2E testler (Playwright)
22. Production Docker build optimizasyonu

---

## 12. Ortam Değişkenleri

```env
DATABASE_URL=postgresql://postgres:password@postgresql:5432/lgs_db
NEXTAUTH_SECRET=<random-32-char>
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=<random-32-char>
JWT_EXPIRES_IN=48h
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
