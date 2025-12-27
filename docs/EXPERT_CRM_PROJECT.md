Aşağıda, **senin paylaştığın tüm metinleri**, daha önce birlikte kurguladığımız **CRM / capability / booking / private plan / Q&A** mimarisiyle **birleştirerek**, çelişkisiz, uçtan uca ve **tek başına “anayasa” niteliğinde** bir **Markdown (MD)** dökümanı yazıyorum.

Bu doküman:

* Backend geliştiriciye → *hangi tablo, hangi endpoint, hangi state*
* Frontend geliştiriciye → *hangi sayfa, hangi modül, hangi edge case*
* Ürün tarafına → *neden böyle, neden fazlara bölündü*
* Sana → *“bir şey eksik mi?” sorusunu sormayacağın*
  bir **MASTER PROJECT FILE**’dır.

---

# 🧠 REJİMDE PRO

## Expert CRM, Private Plans, Q&A & Booking Platform

### **MASTER PROJECT FILE — v3.0 (FINAL MVP SCOPE)**

**Tarih:** 27 Aralık 2025
**Konum:** Dashboard / Pro Modülü
**Statü:** UI & Frontend Logic Tamamlandı → Backend Entegrasyonuna Hazır
**Mimari:** Next.js (App Router) + Tailwind CSS + Headless WordPress (Rejimde Core)
**AI:** OpenAI API (Server-side Proxy)

---

## 0) BU DÖKÜMAN NE İŞE YARAR?

Bu dosya, **Rejimde Pro** ürününün:

* Ürün vizyonunu
* Bilgi mimarisini
* Modül ve sayfa yapısını
* Tüm kullanıcı akışlarını (expert ↔ client ↔ guest)
* Veri modelini (WP Core + Custom Tables + CPT + User Meta)
* API kontratlarını
* Güvenlik, KVKK ve yetkilendirme kurallarını
* MVP sınırlarını ve fazlı yol haritasını

**tek ve bağlayıcı bir kaynak** altında toplar.

> 📌 Bu doküman, backend–frontend–ürün arasında **tek “source of truth”** olarak kabul edilir.

---

## 1) PROJE VİZYONU — “DİJİTAL OFİS”

> **“Uzmanlar için bir panel değil, bir iş işletim sistemi.”**

Rejimde Pro; diyetisyenler, spor eğitmenleri ve mind–body uzmanları için:

* Danışan yönetimini (CRM)
* Kişiye özel plan üretimini
* Asenkron iletişimi (Q&A)
* Randevu & özel ders organizasyonunu
* Gelir ve paket takibini

**tek bir platformda** birleştiren bir **SaaS + Marketplace** çözümüdür.

### 1.1 Temel Değer Önermesi

**Operasyonel Yükü Azalt**
WhatsApp + Excel + Not defteri karmaşasını ortadan kaldır.

**Gelirleri Artır**
Randevu doluluk, paket, seans ve talep yönetimi.

**Bağlılığı Artır (Retention)**
Gamification (skor, rozet, streak) ile danışanı sistemde tut.

**AI ile Verimlilik**
Tekrar eden işleri (taslak plan, cevap, rapor) AI’a devret.

---

## 2) HEDEF UZMAN PROFİLLERİ

Rejimde Pro aşağıdaki meslekleri destekler:

* **Beslenme:** Diyetisyen, Beslenme Uzmanı
* **Fitness:** PT, Fitness Koçu, CrossFit, Fonksiyonel, Koşu, Yüzme
* **Mind–Body:** Yoga, Pilates, Reformer
* **Sağlık:** Fizyoterapist, Doktor
* **Mental:** Yaşam Koçu, Nefes & Meditasyon
* **Combat:** Boks, Kickboks, MMA, Savunma Sporları

> ❗ Ürün davranışı **mesleğe göre değil, capability’ye göre** şekillenir.

---

## 3) ÜRÜN YAKLAŞIMI — PROFESSION DEĞİL CAPABILITY

Aynı meslek farklı iş yapabilir.
Bu yüzden sistem, modülleri **capability (yetkinlik)** üzerinden açar.

### 3.1 Core Capability Seti

* `content_public` → Blog / Diyet / Egzersiz / Sözlük
* `crm_clients` → Danışan & ilişki yönetimi
* `private_plans` → Kişiye özel planlar
* `qa_inbox` → Soru–cevap / mesajlaşma
* `booking` → Randevu & özel ders
* `services` → Hizmet & fiyat tanımı
* `group_classes` → Kontenjanlı grup dersleri
* `media_review` → Video/foto analiz
* `clinical_uploads` → Tahlil & rapor
* `ai_copilot` → AI taslak üretimi

### 3.2 Kritik Uzmanlar (Öncelik)

#### 🧘 Yoga / Pilates

* Flow Builder (akış + ödev)
* Grup dersi & kapasite
* Video form analizi

#### 🏋️ PT / Fitness

* Split & set/tekrar programları
* Form video feedback
* Seans/paket yönetimi

#### 🥗 Diyetisyen

* Öğün bazlı plan
* Klinik dosya alanı
* (Faz 3) Fotoğraf analizi

---

## 4) BİLGİ MİMARİSİ & SİTE HARİTASI

### 4.1 Pro Dashboard Route Yapısı

```
/dashboard/pro
/dashboard/pro/clients
/dashboard/pro/clients/[id]
/dashboard/pro/inbox
/dashboard/pro/inbox/[threadId]
/dashboard/pro/plans
/dashboard/pro/plans/create
/dashboard/pro/calendar
/dashboard/pro/services
/dashboard/pro/earnings
/dashboard/pro/media
/dashboard/pro/faq
/dashboard/pro/activity
/dashboard/pro/notifications
/dashboard/pro/settings
```

---

## 5) CORE FLOWS (UÇTAN UCA)

### 5.1 Danışan – Uzman Bağlantısı (Handshake)

#### A) Marketplace (Pull)

1. Client → Uzman profili
2. “Danışmanlık Al / Ders Talep Et”
3. `relationship = pending`
4. Uzman onayı → `active`

#### B) Davet Linki (Push)

1. Uzman → Davet linki üretir
2. Client kayıt olur
3. Otomatik `active`

#### C) Guest Randevu (Lead)

1. Üye olmayan kişi randevu talep eder
2. Lead oluşur
3. Uzman onaylar
4. Kayıt sonrası client’a dönüşür

**Relationship State Machine**

```
pending → active → paused → archived / blocked
```

---

### 5.2 Kişiye Özel Planlar (Private Plans)

**Plan Türleri**

* diet
* workout
* flow (yoga/pilates)
* rehab
* habit

**Plan State**

```
draft → ready → assigned → revised → (completed)
```

**Akış**

1. Uzman → Client → Plan oluştur
2. Manual veya AI taslak
3. Uzman onayı
4. Client’a atanır
5. Bildirim gider

---

### 5.3 Soru–Cevap (Inbox)

* Thread bazlı yapı
* Dosya ekleri
* AI taslak yanıt
* Paket bazlı limit (faz 3)

---

### 5.4 Takvim & Booking

* Online / Offline
* Availability + conflict check
* Guest destekli
* Grup dersleri (capacity)

---

## 6) MODÜL DETAYLARI

### 6.1 Ana Dashboard

* KPI kartları
* Liderlik tablosu
* Rozet verme
* Duyurular

### 6.2 Danışanlar

* Segmentler
* Risk analizi (AI)
* Paket ilerleme barı
* Detay profil + notlar

### 6.3 Inbox

* AI co-pilot
* Şablon cevaplar
* Profil slide-over

### 6.4 Takvim

* Haftalık görünüm
* Tekrarlayan ders
* Google Calendar (faz 2)

### 6.5 Gelirler

* Bakiye
* Manuel ödeme
* Çekim talebi

### 6.6 Medya Kütüphanesi

* Link bazlı (YouTube, IG, Spotify)
* Plan & mesajlarda kullanım

### 6.7 SSS

* Manuel SSS
* Meslek bazlı şablon paketleri

---

## 7) VERİ MODELİ

### 7.1 Custom Tables (Özet)

* `wp_rejimde_relationships`
* `wp_rejimde_appointments`
* `wp_rejimde_messages`
* `wp_rejimde_transactions`
* `wp_rejimde_notifications`
* `wp_rejimde_audit_logs`

### 7.2 CPT’ler

* `rejimde_private_plan`
* `rejimde_service`
* `rejimde_media`
* `rejimde_faq`

### 7.3 User Meta

* `rejimde_score`
* `rejimde_badges`
* `expert_profile`

---

## 8) API STRATEJİSİ (ÖZET)

* `GET /me`
* `GET /pro/stats`
* `GET /pro/clients`
* `POST /pro/clients/invite`
* `GET /pro/inbox`
* `POST /pro/inbox/reply`
* `GET /pro/calendar`
* `POST /ai/generate-draft`

> AI çağrıları **her zaman server-side proxy** üzerinden yapılır.

---

## 9) MVP (FAZ 1) SINIRLARI

### Dahil

* CRM
* Private Plan
* Inbox
* Booking (basic)
* Manuel ödeme
* In-app notification

### Hariç (Faz 2+)

* Online ödeme
* Gerçek zamanlı chat
* Dosya upload
* Google Calendar çift yönlü sync

---

## 10) TASARIM PRENSİPLERİ

* Dark UI (Slate)
* Empty state’ler zorunlu
* Mobil uyumlu
* Toast & loading standart

---

## 11) GÜVENLİK & KVKK

* Relationship bazlı erişim
* Private content izolasyonu
* Dosya erişim kontrolü
* Audit log zorunlu

---

## 12) DONE DEFINITION (V1)

Bir modül:

* API + UI + empty/error state içeriyorsa
* Yetki kontrolleri tamamsa
* Notification & audit çalışıyorsa
  → **DONE** kabul edilir.

---

## 13) SON SÖZ

Bu doküman:

* Rejimde Pro’nun **ürün anayasasıdır**
* Backend & frontend geliştirmede **tartışmasız referanstır**
* Yeni özellikler **yalnızca bu yapıyı bozmadan** eklenir
