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
