# API Integration Guide - rejimde-web

## Overview

Bu doküman `rejimde-web` frontend uygulaması ile `rejimde-core` WordPress plugin backend'i arasındaki API entegrasyonunu açıklar.

## Base URL

```
API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://api.rejimde.com/wp-json'
```

## Diet Plans API (`/rejimde/v1/plans`)

### 1. List Plans - `GET /rejimde/v1/plans`

**Frontend Kullanımı:**
```typescript
import { getPlans } from '@/lib/api';

const plans = await getPlans(category?, difficulty?);
```

**Query Parameters:**
- `category` (optional): Plan kategorisi (örn: "keto", "vegan")
- `difficulty` (optional): Zorluk seviyesi ("easy", "medium", "hard")

**Desteklenen Backend Response Formatları:**

**Format 1 (Önerilen):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 123,
      "title": "7 Günlük Keto Diyeti",
      "slug": "7-gunluk-keto-diyeti",
      "excerpt": "Ketojenik diyet ile...",
      "image": "https://...",
      "meta": {
        "difficulty": "medium",
        "duration": "7",
        "calories": "1500-1800",
        "score_reward": "200",
        "diet_category": "keto"
      },
      "author": {
        "name": "Dr. Ayşe Yılmaz",
        "slug": "ayse-yilmaz",
        "avatar": "https://...",
        "is_expert": true
      }
    }
  ]
}
```

**Format 2 (Alternatif):**
```json
[
  {
    "id": 123,
    "title": "...",
    ...
  }
]
```

**Format 3 (Fallback):**
```json
{
  "data": [...]
}
```

**Frontend Handling:**
- ✅ Tüm formatları destekler
- ✅ Boş array döner hata durumunda
- ✅ Parametreleri valide eder
- ✅ URL encode yapar

---

### 2. Get Plan by Slug - `GET /rejimde/v1/plans/{slug}`

**Frontend Kullanımı:**
```typescript
import { getPlanBySlug } from '@/lib/api';

const plan = await getPlanBySlug('7-gunluk-keto-diyeti');
```

**URL Parameters:**
- `slug` (required): Plan slug'ı (URL-safe string)

**Desteklenen Backend Response Formatları:**

**Format 1 (Önerilen):**
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "title": "7 Günlük Keto Diyeti",
    "slug": "7-gunluk-keto-diyeti",
    "content": "<p>Plan açıklaması...</p>",
    "plan_data": [
      {
        "dayNumber": 1,
        "meals": [
          {
            "id": "meal-1-1",
            "type": "breakfast",
            "title": "Kahvaltı",
            "time": "08:00",
            "content": "2 yumurta, 50g beyaz peynir...",
            "calories": "350",
            "tags": ["protein", "low-carb"],
            "tip": "Yumurtaları haşlayabilirsiniz"
          }
        ]
      }
    ],
    "shopping_list": [
      "10 adet yumurta",
      "200g beyaz peynir",
      "1kg tavuk göğsü"
    ],
    "meta": {
      "difficulty": "medium",
      "duration": "7",
      "calories": "1500-1800",
      "score_reward": "200",
      "diet_category": "keto",
      "is_verified": true
    },
    "approved_by": {
      "name": "Dr. Ayşe Yılmaz",
      "slug": "ayse-yilmaz",
      "avatar": "https://..."
    },
    "completed_count": 156,
    "completed_users": [
      {
        "name": "Mehmet Y.",
        "slug": "mehmet-y",
        "avatar": "https://..."
      }
    ]
  }
}
```

**Format 2 (Alternatif):**
```json
{
  "data": { ... }
}
```

**Format 3 (Fallback - Direkt obje):**
```json
{
  "id": 123,
  "title": "...",
  ...
}
```

**Error Response:**
```json
{
  "status": "error",
  "code": "not_found",
  "message": "Plan bulunamadı"
}
```

**Frontend Handling:**
- ✅ Tüm formatları destekler
- ✅ Slug'ı URL encode yapar
- ✅ Null döner hata durumunda
- ✅ Hata mesajlarını loglar

---

### 3. Create Plan - `POST /rejimde/v1/plans/create`

**Frontend Kullanımı:**
```typescript
import { createPlan } from '@/lib/api';

const result = await createPlan({
  title: "Yeni Diyet Planı",
  content: "Plan açıklaması...",
  plan_data: [...],
  shopping_list: [...],
  meta: {
    difficulty: "medium",
    duration: "7",
    calories: "1500-1800",
    score_reward: "200",
    diet_category: "genel"
  }
});
```

**Request Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Yeni Diyet Planı",
  "content": "Plan açıklaması",
  "plan_data": [...],
  "shopping_list": [...],
  "meta": {
    "difficulty": "medium",
    "duration": "7",
    "calories": "1500-1800",
    "score_reward": "200",
    "diet_category": "genel"
  },
  "featured_media_id": 456
}
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": 789,
    "title": "Yeni Diyet Planı",
    "slug": "yeni-diyet-plani",
    ...
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Plan başlığı gerekli",
  "code": "invalid_data"
}
```

**Frontend Validation:**
- ✅ Title required ve boş değil
- ✅ Data obje kontrolü
- ✅ JSON parse hataları yakalanır
- ✅ Detaylı hata mesajları döner

---

### 4. Update Plan - `POST /rejimde/v1/plans/update/{id}`

**Frontend Kullanımı:**
```typescript
import { updatePlan } from '@/lib/api';

const result = await updatePlan(123, {
  title: "Güncellenmiş Başlık",
  content: "Yeni içerik...",
  ...
});
```

**URL Parameters:**
- `id` (required): Plan ID (positive integer)

**Request Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:** (createPlan ile aynı format)

**Success/Error Responses:** (createPlan ile aynı format)

**Frontend Validation:**
- ✅ ID geçerlilik kontrolü (>0, not NaN)
- ✅ Data obje kontrolü
- ✅ JSON parse hataları yakalanır

---

### 5. Get Plan for Editing - `GET /wp/v2/rejimde_plan/{id}?context=edit`

**Frontend Kullanımı:**
```typescript
import { getPlan } from '@/lib/api';

const result = await getPlan(123);
if (result.success) {
  const planData = result.data;
  // planData.title, planData.plan_data, vs...
}
```

**URL Parameters:**
- `id` (required): Plan ID

**Query Parameters:**
- `context=edit` (required): Düzenleme context'i
- `_embed` (optional): Embedded data (featured media, author)

**Request Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Plan Başlığı",
    "content": "İçerik...",
    "status": "publish",
    "plan_data": [...],
    "shopping_list": [...],
    "tags": [12, 34],
    "meta": {
      "difficulty": "medium",
      "duration": "7",
      "calories": "1500-1800",
      "score_reward": "200",
      "diet_category": "keto"
    },
    "featured_media_id": 456,
    "featured_media_url": "https://..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Plan bulunamadı veya erişim yetkiniz yok"
}
```

**Frontend Handling:**
- ✅ ID validasyonu
- ✅ Meta field'ları safeParse ile parse eder
- ✅ Default değerler sağlar
- ✅ Embedded data'yı extract eder

---

## Data Types

### PlanMeal
```typescript
interface PlanMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
  title: string;
  time?: string;
  content: string;
  calories?: string;
  tags?: string[];
  tip?: string;
}
```

### PlanDay
```typescript
interface PlanDay {
  dayNumber: number;
  meals: PlanMeal[];
}
```

### PlanMeta
```typescript
interface PlanMeta {
  difficulty?: 'easy' | 'medium' | 'hard';
  duration?: string;
  calories?: string;
  score_reward?: string;
  diet_category?: string;
  is_verified?: boolean;
  rank_math_title?: string;
  rank_math_description?: string;
  rank_math_focus_keyword?: string;
}
```

---

## Backend Requirements (rejimde-core)

### Required Endpoints

1. **List Plans**: `GET /rejimde/v1/plans`
   - Parametreler: `category`, `difficulty`
   - Response: `{ status: 'success', data: [] }`

2. **Get Plan**: `GET /rejimde/v1/plans/{slug}`
   - Response: `{ status: 'success', data: {...} }`

3. **Create Plan**: `POST /rejimde/v1/plans/create`
   - Auth: Required
   - Response: `{ status: 'success', data: {...} }`

4. **Update Plan**: `POST /rejimde/v1/plans/update/{id}`
   - Auth: Required
   - Response: `{ status: 'success', data: {...} }`

### WordPress REST API

5. **Get Plan for Edit**: `GET /wp/v2/rejimde_plan/{id}`
   - Auth: Required
   - Context: edit
   - Response: WordPress standard format

### Database Schema (Config Tables)

Backend'de aşağıdaki meta field'lar saklanmalı:

**Post Meta (`wp_postmeta`):**
```
- difficulty (string: 'easy'|'medium'|'hard')
- duration (string: gün sayısı)
- calories (string: kalori aralığı)
- score_reward (string: puan)
- diet_category (string: kategori)
- is_verified (boolean: uzman onayı)
- plan_data (JSON string: öğün verileri)
- shopping_list (JSON string: alışveriş listesi)
```

**Custom Tables (varsa):**
```
wp_rejimde_plan_progress
- user_id
- plan_id
- completed_items (JSON)
- progress_percentage
- started_at
- completed_at
```

---

## Error Handling

### Frontend Error Handling Pattern

```typescript
try {
  const result = await apiFunction(...);
  
  if (!result) {
    // Handle null/undefined
    showError('Veri alınamadı');
    return;
  }
  
  if (result.success === false) {
    // Handle API error
    showError(result.message || 'Bir hata oluştu');
    return;
  }
  
  // Success
  processData(result.data);
  
} catch (error) {
  // Handle network/unexpected errors
  console.error('API Error:', error);
  showError('Sunucu hatası');
}
```

### Backend Error Response Format

```json
{
  "status": "error",
  "code": "error_code",
  "message": "Human-readable error message",
  "data": null
}
```

**Common Error Codes:**
- `not_found` - Kaynak bulunamadı
- `invalid_data` - Geçersiz veri
- `unauthorized` - Yetki hatası
- `forbidden` - Erişim engellendi
- `validation_error` - Validasyon hatası

---

## Testing Checklist

### Backend (rejimde-core)

- [ ] GET `/rejimde/v1/plans` endpoint çalışıyor
- [ ] GET `/rejimde/v1/plans/{slug}` endpoint çalışıyor
- [ ] POST `/rejimde/v1/plans/create` endpoint çalışıyor
- [ ] POST `/rejimde/v1/plans/update/{id}` endpoint çalışıyor
- [ ] JWT authentication çalışıyor
- [ ] Meta field'lar doğru kaydediliyor
- [ ] JSON serialization/deserialization çalışıyor
- [ ] Error response formatı tutarlı

### Frontend (rejimde-web)

- [ ] `getPlans()` tüm backend formatlarını destekliyor
- [ ] `getPlanBySlug()` tüm backend formatlarını destekliyor
- [ ] `createPlan()` validasyon çalışıyor
- [ ] `updatePlan()` validasyon çalışıyor
- [ ] `getPlan()` edit data formatı doğru
- [ ] Error handling çalışıyor
- [ ] TypeScript tipleri doğru
- [ ] URL encoding çalışıyor

---

## Migration Notes

Eğer backend'de farklı bir format kullanılıyorsa, frontend'deki API fonksiyonları bunu otomatik olarak handle eder. Ancak backend'i güncellemek için:

1. Response formatını `{ status: 'success', data: ... }` olarak standartlaştırın
2. Error response'ları `{ status: 'error', code: ..., message: ... }` formatında dönün
3. Meta field'ları JSON string olarak saklayın ve doğru şekilde parse edin
4. Slug'ları URL-safe hale getirin

---

## Contact

Sorular için: backend@rejimde.com
