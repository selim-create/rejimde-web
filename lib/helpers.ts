/**
 * Helper Functions for Rejimde Web
 * Kullanıcı profilleri, avatarlar ve genel yardımcı fonksiyonlar
 */

/**
 * Kullanıcının uzman olup olmadığını kontrol eder
 * @param roles - Kullanıcı rolleri dizisi
 * @returns boolean - Uzman ise true
 */
export function isUserExpert(roles: string[] | undefined | null): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes('rejimde_pro');
}

/**
 * Kullanıcı türüne göre doğru profil URL'ini döndürür
 * @param slug - Kullanıcı slug'ı
 * @param isExpert - Kullanıcının uzman olup olmadığı
 * @returns string - Profil URL'i
 */
export function getUserProfileUrl(slug: string, isExpert: boolean): string {
  if (!slug) return '#';
  return isExpert ? `/experts/${slug}` : `/profile/${slug}`;
}

/**
 * Güvenli avatar URL'i döndürür
 * Gravatar içeren URL'leri filtreler ve DiceBear fallback kullanır
 * @param avatarUrl - Kullanıcının avatar URL'i (meta field)
 * @param slug - Kullanıcı slug'ı (fallback için)
 * @returns string - Güvenli avatar URL'i
 */
export function getSafeAvatarUrl(avatarUrl: string | undefined | null, slug: string): string {
  // Eğer avatar_url varsa ve Gravatar değilse, onu kullan
  if (avatarUrl && typeof avatarUrl === 'string' && !avatarUrl.includes('gravatar')) {
    return avatarUrl;
  }
  
  // Fallback: DiceBear kullan
  return `https://api.dicebear.com/9.x/personas/svg?seed=${slug || 'default'}`;
}

/**
 * HTML içeriğinden okuma süresini hesaplar
 * @param htmlContent - HTML içerik
 * @returns string - Okuma süresi (örn: "5 dk")
 */
export function calculateReadingTime(htmlContent: string): string {
  if (!htmlContent) return '3 dk';
  
  // HTML etiketlerini temizle
  const text = htmlContent.replace(/<[^>]+>/g, '').trim();
  
  // Boş içerik kontrolü
  if (!text) return '3 dk';
  
  // Kelimeleri say (Türkçe için de çalışır)
  const words = text.split(/\s+/).length;
  
  // Ortalama okuma hızı: 200 kelime/dakika
  const minutes = Math.max(1, Math.ceil(words / 200));
  
  return `${minutes} dk`;
}

/**
 * Zorluk seviyesini İngilizce'den Türkçe'ye çevirir
 * @param difficulty - İngilizce zorluk seviyesi
 * @returns string - Türkçe zorluk seviyesi
 */
export function translateDifficulty(difficulty: string | undefined): string {
  if (!difficulty) return 'Orta';
  
  const difficultyMap: Record<string, string> = {
    'easy': 'Kolay',
    'medium': 'Orta',
    'hard': 'Zor',
    'beginner': 'Başlangıç',
    'intermediate': 'Orta',
    'advanced': 'İleri',
    // Türkçe değerler zaten Türkçe ise olduğu gibi dön
    'kolay': 'Kolay',
    'orta': 'Orta',
    'zor': 'Zor',
    'başlangıç': 'Başlangıç',
    'ileri': 'İleri'
  };
  
  const lowerDifficulty = difficulty.toLowerCase();
  return difficultyMap[lowerDifficulty] || difficulty;
}
