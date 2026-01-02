# Expert Reviews Module

Bu modül, uzman profillerindeki değerlendirme sistemini yönetir.

## Bileşenler

### ExpertReviewsContainer
Ana konteyner bileşeni. Tüm alt bileşenleri yönetir ve koordine eder.

**Props:**
- `expertId: number` - Uzman ID
- `expertSlug?: string` - Uzman slug (opsiyonel)

### ReviewStats
Puan özeti ve dağılım grafiğini gösterir.

**Props:**
- `stats: ReviewStatsData | null` - İstatistik verileri

**Veri Yapısı:**
```typescript
{
  average: number;              // Ortalama puan
  total: number;                // Toplam yorum sayısı
  distribution: Record<number, { count: number; percent: number }>;  // Puan dağılımı
  verifiedClientCount: number;  // Onaylı danışan sayısı
  averageProcessDuration: number; // Ortalama süreç süresi (hafta)
  successRate: number;          // Başarı oranı (%)
}
```

### ReviewFilters
Yorumları filtreleme arayüzü.

**Props:**
- `filters: FilterState` - Mevcut filtre durumu
- `onFilterChange: (filters: FilterState) => void` - Filtre değişikliği callback

**Filtre Seçenekleri:**
- Hedefe göre filtreleme
- Program tipine göre filtreleme
- Minimum puan filtresi
- Sadece onaylı danışanlar
- Sadece hikaye içerenler

### FeaturedReviews
Öne çıkan yorumları carousel veya grid olarak gösterir.

**Props:**
- `reviews: CommentData[]` - Öne çıkan yorumlar (1-3 adet)

### SuccessStories
Başarı hikayelerini gösterir.

**Props:**
- `stories: SuccessStory[]` - Başarı hikayeleri

**Hikaye Yapısı:**
```typescript
{
  id: number;
  authorInitials: string;       // Baş harfler
  authorName?: string;          // Tam ad (anonim değilse)
  isAnonymous: boolean;
  goalTag: string;              // Hedef etiketi
  processWeeks: number;         // Süreç süresi
  story: string;                // Hikaye metni
  rating: number;               // Puan
  verifiedClient: boolean;
  createdAt: string;
}
```

### ReviewForm
Geliştirilmiş yorum formu.

**Props:**
- `user: UserData | null` - Kullanıcı bilgileri
- `onSubmit: (data: ReviewFormData) => Promise<void>` - Gönder callback
- `isSubmitting: boolean` - Gönderim durumu

**Form Alanları:**
- `rating` (zorunlu): 1-5 yıldız
- `content` (zorunlu): Yorum metni
- `isAnonymous`: Anonim checkbox
- `goalTag` (opsiyonel): Hedef seçimi
- `programType` (opsiyonel): Program tipi
- `processWeeks` (opsiyonel): Süreç süresi
- `wouldRecommend`: Tavsiye eder misiniz?
- `hasSuccessStory`: Hikaye ekle toggle
- `successStory` (opsiyonel): Hikaye metni

### ReviewList
Yorumları listeler.

**Props:**
- `reviews: CommentData[]` - Yorumlar
- `expertSlug?: string` - Uzman slug
- `onLike: (commentId: number) => void` - Beğen callback
- `onReply?: (commentId: number) => void` - Yanıtla callback
- `user: UserData | null` - Kullanıcı bilgileri
- `isLoading?: boolean` - Yükleniyor durumu

### ReviewCard
Tek bir yorum kartı.

**Props:**
- `review: CommentData` - Yorum verisi
- `expertSlug?: string` - Uzman slug
- `onLike: (commentId: number) => void` - Beğen callback
- `onReply?: (commentId: number) => void` - Yanıtla callback
- `canReply: boolean` - Yanıtlama yetkisi
- `user: UserData | null` - Kullanıcı bilgileri

### CommunityImpact
Topluluk etkisi istatistiklerini gösterir.

**Props:**
- `data: CommunityImpactData | null` - Topluluk verisi

**Veri Yapısı:**
```typescript
{
  totalClientsSupported: number;    // Destek verilen toplam danışan
  programsCompleted: number;        // Tamamlanan program sayısı
  averageJourneyWeeks: number;      // Ortalama yolculuk süresi
  goalsAchieved: number;            // Hedefe ulaşan sayısı
  context: {
    message: string;                // Bağlamsal mesaj
    highlight: string;              // Vurgulanan metin
  };
}
```

## Anonim Değerlendirme

Kullanıcılar, değerlendirme yaparken anonim seçeneğini işaretleyebilir. Bu durumda:
- Adı soyadı yerine baş harfleri görünür (örn: "Ahmet Kaya" → "A.K.")
- Avatar görünür
- Diğer bilgiler (rank, onaylı danışan vb.) korunur

```typescript
const getDisplayName = (authorName: string, isAnonymous: boolean) => {
  if (isAnonymous) {
    const initials = authorName
      .split(' ')
      .map(word => word[0])
      .join('.')
      .toUpperCase();
    return initials + '.';
  }
  return authorName;
};
```

## Kullanım

```tsx
import { ExpertReviewsContainer } from '@/components/expert-reviews';

<ExpertReviewsContainer 
  expertId={expert.id} 
  expertSlug={expert.slug} 
/>
```

## Backend Entegrasyonu

Şu anki implementasyon mevcut `comment-service.ts` API'yi kullanıyor. Yeni alanlar için backend güncellemesi gerekiyor:

### Gerekli API Değişiklikleri:

1. **POST /rejimde/v1/comments** - Yeni alanları kabul etmeli:
   - `isAnonymous`
   - `goalTag`
   - `programType`
   - `processWeeks`
   - `wouldRecommend`
   - `hasSuccessStory`
   - `successStory`

2. **GET /rejimde/v1/comments** - Yanıtta ek metadata dönmeli:
   - Yorum için: `isAnonymous`, `goalTag`, `programType`, `processWeeks`
   - İstatistik için: `verifiedClientCount`, `averageProcessDuration`, `successRate`

3. **Yeni endpoint önerileri:**
   - `GET /rejimde/v1/experts/{id}/stats` - Detaylı istatistikler
   - `GET /rejimde/v1/experts/{id}/success-stories` - Başarı hikayeleri
   - `GET /rejimde/v1/experts/{id}/community-impact` - Topluluk etkisi

## Stil

Mevcut tasarım diline uygun:
- Rounded-3xl köşeler
- Font-extrabold başlıklar
- Shadow-card gölgeler
- Rejimde renk paleti (green, blue, yellow, purple vb.)
- Animate-in geçişleri
- Mobile-first responsive tasarım
