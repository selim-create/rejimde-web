// lib/constants.ts
export const LEVELS = [
  { id: 'level-1', name: 'Begin', level: 1, slug: 'begin', min: 0, max: 200, color: 'text-gray-500', bgColor: 'bg-gray-100', icon: 'fa-seedling', description: 'Her yolculuk bir adımla başlar. Burada beklenti yok, sadece başlamak var.' },
  { id: 'level-2', name: 'Adapt', level: 2, slug: 'adapt', min: 200, max: 300, color: 'text-orange-500', bgColor: 'bg-orange-100', icon: 'fa-sync', description: 'Vücut ve zihin yeni rutine alışmaya başlar. Küçük değişimler büyük farklar yaratır.' },
  { id: 'level-3', name: 'Commit', level: 3, slug: 'commit', min: 300, max: 500, color: 'text-green-500', bgColor: 'bg-green-100', icon: 'fa-check-circle', description: 'İstikrar burada doğar. Düzenli devam etmek artık bir tercih değil, alışkanlık.' },
  { id: 'level-4', name: 'Balance', level: 4, slug: 'balance', min: 500, max: 1000, color: 'text-blue-500', bgColor: 'bg-blue-100', icon: 'fa-scale-balanced', description: 'Beslenme, hareket ve zihin dengelenir. Kendini daha kontrollü ve rahat hissedersin.' },
  { id: 'level-5', name: 'Strengthen', level: 5, slug: 'strengthen', min: 1000, max: 2000, color: 'text-red-500', bgColor: 'bg-red-100', icon: 'fa-dumbbell', description: 'Fiziksel ve zihinsel olarak güçlenme başlar. Gelişim artık net şekilde hissedilir.' },
  { id: 'level-6', name: 'Sustain', level: 6, slug: 'sustain', min: 2000, max: 4000, color: 'text-teal-500', bgColor: 'bg-teal-100', icon: 'fa-infinity', description: 'Bu bir rejim olmaktan çıkar, yaşam tarzına dönüşür. Devam etmek zor gelmez.' },
  { id: 'level-7', name: 'Mastery', level: 7, slug: 'mastery', min: 4000, max: 6000, color: 'text-yellow-500', bgColor: 'bg-yellow-100', icon: 'fa-crown', description: 'Bilinçli seçimler yaparsın. Ne yaptığını ve neden yaptığını bilerek ilerlersin.' },
  { id: 'level-8', name: 'Transform', level: 8, slug: 'transform', min: 6000, max: 10000, color: 'text-purple-600', bgColor: 'bg-purple-100', icon: 'fa-star', description: 'Kalıcı değişim. Yeni bir denge, yeni bir sen.' },
];

export const CIRCLE_AVATARS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle5&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle6&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle7&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle8&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle9&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle10&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Circle11&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Circle12&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Circle13&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Circle14&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/icons/svg?seed=Circle15&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/icons/svg?seed=Circle16&backgroundColor=ffd5dc',
];

// Helper function to get level by score
export function getLevelByScore(score: number) {
  const level = [...LEVELS].reverse().find(l => score >= l.min);
  return level || LEVELS[0];
}

// Helper function to get level by slug
export function getLevelBySlug(slug: string) {
  return LEVELS.find(l => l.slug === slug) || null;
}
