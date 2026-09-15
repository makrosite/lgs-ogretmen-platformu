# LGS Öğretmen Platformu — Proje Özeti

## 1. Uygulama Nedir / Ne Değildir

| | **NEDİR** | **NE DEĞİLDİR** |
|---|---|---|
| Hedef kullanıcı | Öğretmen (hesap sahibi, aktif kullanıcı) | Öğrenciye yönelik bir "LGS hazırlık app'i" |
| Öğrenci rolü | Sadece veri girişi arayüzü (link → form) | App indiren, hesabı olan, giriş yapan kullanıcı |
| Veli rolü | Pasif rapor izleyici (link ile) | Aktif kullanıcı, hesap sahibi |
| Soru çözme | Yok | Adaptif soru bankası / spaced repetition |
| OMR/OCR | Yok (bilinçli olarak çıkarıldı) | Otomatik optik form okuma sistemi |
| Temel değer | Sınıf yönetimi + net takibi + tercih motoru | Bir "quiz" veya "deneme çözme" platformu |
| Tercih motoru | Statik + zamanla büyüyen veri (5 yıllık taban puan) | Kesin/garanti tahmin yapan bir "büyücü" |
| İş modeli | Ücretsiz, veri odaklı (satış konusu ayrı ele alınacak) | Şu an için ücretli/premium bir SaaS ürünü |

## 2. Temel Akış

1. Öğretmen → öğrenciye tek kullanımlık/zaman sınırlı link gönderir (PWA, app indirme/hesap yok)
2. Öğrenci: deneme adı otomatik gelir → doğru/yanlış/boş sayısını (ders bazlı) girer
3. Öğrenci: yanlış ve boş soruların numaralarını girer (chip/tag input)
4. Sistem her numara için "bu sorunun fotoğrafını çek" ister (fotoğraf adımı atlanabilir, sonradan tamamlanabilir)
5. Fotoğraflar sıkıştırılıp (WebP) saklanır — OCR yok, sadece görsel
6. Öğretmen ekranı: net dağılımı + kazanım bazlı ısı haritası + soru numarasına göre sıralı fotoğraf galerisi
7. Veli raporu: otomatik oluşur, öğretmen not ekleyip onaylar/gönderir (PDF veya paylaşılabilir link, WhatsApp öncelikli)
8. Ayrı modül — Tercih Motoru: Lisesler.xlsx verisi (2021-2025 taban puan, kontenjan, yüzdelik dilim) üzerinden okul arama/filtreleme ve yerleştirme tahmini

## 3. Teknik Altyapı Kararları

- **Geliştirme ortamı:** Docker Desktop (kurulu, kullanıma hazır)
- **Veritabanı:** PostgreSQL
- **UI/UX tasarımı:** Stitch ile tamamlandı, hazır
- **Konteyner mimarisi:** 3 ayrı servis planı
  - `landing-page` — ayrı konteyner
  - `admin-panel` — ayrı konteyner
  - `app-api` / backend — konumu netleşecek (bkz. açık sorular)
  - `postgresql` — veritabanı konteyneri

### Taslak Mimari

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                      │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ landing-page │  │ admin-panel  │  │  app-api    ││
│  │  (öğretmen/  │  │ (yönetim,    │  │ (backend,   ││
│  │   veli/öğr.  │  │  içerik,     │  │  business   ││
│  │   giriş +    │  │  kurum/okul  │  │  logic, tüm ││
│  │   PWA formu) │  │  veri yönet.)│  │  API'ler)   ││
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘│
│         │                 │                  │        │
│         └─────────────────┴──────────────────┘        │
│                            │                           │
│                   ┌────────▼────────┐                 │
│                   │   postgresql     │                 │
│                   │   (tek konteyner,│                 │
│                   │   şema bazlı     │                 │
│                   │   ayrım)         │                 │
│                   └──────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

## 4. Açık Sorular (Netleştirilecek)

1. **app-api'nin yeri:** Öğretmen paneli, öğrenci form işleme, net hesaplama, tercih motoru sorguları hangi konteynerde çalışacak? Ayrı bir backend konteyneri mi, admin-panel içine mi gömülü?
2. **Landing page kapsamı:** Sadece statik pazarlama sayfası mı, yoksa öğretmen kayıt/giriş ve öğrenci link-form akışı da buradan mı geçecek?
3. **Frontend teknolojisi:** Stitch tasarımları hangi framework'e aktarılacak (React/Next.js, Vue vb.)? Bu, konteyner sayısını/yapısını etkileyebilir.
4. **PostgreSQL şema stratejisi:** admin-panel, app-api ve tercih motoru verisi (Lisesler.xlsx) aynı veritabanında farklı şemalarda mı, yoksa mantıksal olarak ayrı mı tutulacak?

## 5. Bilinçli Olarak Kapsam Dışı Bırakılanlar

- OMR (optik form otomatik okuma) — MVP'de yok, manuel giriş var
- OCR (soru metni çıkarma) — telif riski + gereksiz karmaşıklık nedeniyle çıkarıldı
- Satış/gelir modeli — şu aşamada odak dışı, ürün netleştikten sonra ele alınacak
