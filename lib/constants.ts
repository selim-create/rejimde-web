// lib/constants.ts

// ============================================
// USER LEVELS & GAMIFICATION
// ============================================
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

// ============================================
// PROFESSION CATEGORIES
// ============================================
export const PROFESSION_CATEGORIES = [
    {
        id: "nutrition",
        title: "Beslenme",
        theme: "green",
        icon: "fa-carrot",
        items: [
            { id: "dietitian", label: "Diyetisyen", prefix: "Dyt." },
            { id: "nutritionist", label: "Beslenme Uzmanı", prefix: "" }
        ]
    },
    {
        id: "fitness",
        title: "Hareket & Fitness",
        theme: "blue",
        icon: "fa-dumbbell",
        items: [
            { id: "pt", label: "Personal Trainer", prefix: "PT" },
            { id: "fitness_coach", label: "Fitness Koçu", prefix: "" },
            { id: "functional", label: "Fonksiyonel Antrenman", prefix: "" },
            { id: "crossfit", label: "CrossFit Eğitmeni", prefix: "" },
            { id: "swim", label: "Yüzme Eğitmeni", prefix: "" },
            { id: "run", label: "Koşu Eğitmeni", prefix: "" }
        ]
    },
    {
        id: "mindbody",
        title: "Yoga & Pilates",
        theme: "teal",
        icon: "fa-spa",
        items: [
            { id: "yoga", label: "Yoga Eğitmeni", prefix: "" },
            { id: "pilates", label: "Pilates Eğitmeni", prefix: "" },
            { id: "reformer", label: "Reformer Pilates", prefix: "" }
        ]
    },
    {
        id: "mental",
        title: "Zihin & Alışkanlık",
        theme: "purple",
        icon: "fa-brain",
        items: [
            { id: "psychologist", label: "Psikolog", prefix: "Psk." },
            { id: "life_coach", label: "Yaşam Koçu", prefix: "" },
            { id: "breath", label: "Nefes & Meditasyon", prefix: "" }
        ]
    },
    {
        id: "health",
        title: "Sağlık & Rehabilitasyon",
        theme: "red",
        icon: "fa-user-doctor",
        items: [
            { id: "physiotherapist", label: "Fizyoterapist", prefix: "Fzt." },
            { id: "doctor", label: "Doktor", prefix: "Dr." }
        ]
    },
    {
        id: "combat",
        title: "Dövüş Sanatları",
        theme: "orange",
        icon: "fa-hand-fist",
        items: [
            { id: "box", label: "Boks Eğitmeni", prefix: "" },
            { id: "kickbox", label: "Kickboks Eğitmeni", prefix: "" },
            { id: "mma", label: "MMA Eğitmeni", prefix: "" },
            { id: "defense", label: "Savunma Eğitmeni", prefix: "" }
        ]
    }
];

// ============================================
// EXPERTISE TAGS
// ============================================
export const EXPERTISE_TAGS = [
    // Beslenme
    { id: "weight_management", label: "Kilo Yönetimi", category: "nutrition" },
    { id: "sports_nutrition", label: "Sporcu Beslenmesi", category: "nutrition" },
    { id: "pcos", label: "PCOS Beslenmesi", category: "nutrition" },
    { id: "diabetes", label: "Diyabet Yönetimi", category: "nutrition" },
    { id: "pregnancy_nutrition", label: "Hamilelik Beslenmesi", category: "nutrition" },
    { id: "child_nutrition", label: "Çocuk Beslenmesi", category: "nutrition" },
    { id: "vegan_vegetarian", label: "Vegan/Vejetaryen", category: "nutrition" },
    { id: "eating_disorders", label: "Yeme Bozuklukları", category: "nutrition" },
    { id: "gut_health", label: "Bağırsak Sağlığı", category: "nutrition" },
    { id: "keto", label: "Keto Diyet", category: "nutrition" },
    { id: "intermittent_fasting", label: "Aralıklı Oruç", category: "nutrition" },
    
    // Fitness
    { id: "muscle_building", label: "Kas Geliştirme", category: "fitness" },
    { id: "fat_loss", label: "Yağ Yakımı", category: "fitness" },
    { id: "strength_training", label: "Güç Antrenmanı", category: "fitness" },
    { id: "hiit", label: "HIIT", category: "fitness" },
    { id: "cardio", label: "Kardiyo", category: "fitness" },
    { id: "bodybuilding", label: "Vücut Geliştirme", category: "fitness" },
    { id: "calisthenics", label: "Calisthenics", category: "fitness" },
    { id: "home_workout", label: "Evde Egzersiz", category: "fitness" },
    
    // Rehabilitasyon
    { id: "posture", label: "Postür Düzeltme", category: "rehab" },
    { id: "back_pain", label: "Bel Ağrısı", category: "rehab" },
    { id: "neck_pain", label: "Boyun Ağrısı", category: "rehab" },
    { id: "joint_health", label: "Eklem Sağlığı", category: "rehab" },
    { id: "injury_recovery", label: "Sakatlık Rehabilitasyonu", category: "rehab" },
    { id: "chronic_pain", label: "Kronik Ağrı", category: "rehab" },
    
    // Mind-Body
    { id: "stress_management", label: "Stres Yönetimi", category: "mental" },
    { id: "sleep_improvement", label: "Uyku Düzeni", category: "mental" },
    { id: "anxiety", label: "Anksiyete", category: "mental" },
    { id: "mindfulness", label: "Farkındalık", category: "mental" },
    { id: "habit_change", label: "Alışkanlık Değişimi", category: "mental" },
    { id: "motivation", label: "Motivasyon", category: "mental" },
    
    // Özel Gruplar
    { id: "senior_fitness", label: "50+ Yaş Fitness", category: "special" },
    { id: "prenatal", label: "Hamilelik Egzersizi", category: "special" },
    { id: "postnatal", label: "Doğum Sonrası", category: "special" },
    { id: "kids_fitness", label: "Çocuk Fitness", category: "special" },
    { id: "teen_fitness", label: "Ergen Fitness", category: "special" },
    { id: "corporate_wellness", label: "Kurumsal Sağlık", category: "special" }
];

// ============================================
// GOAL TAGS
// ============================================
export const GOAL_TAGS = [
    { id: "weight_loss", label: "Kilo Verme", icon: "fa-weight-scale" },
    { id: "muscle_gain", label: "Kas Kazanımı", icon: "fa-dumbbell" },
    { id: "flexibility", label: "Esneklik", icon: "fa-person-walking" },
    { id: "endurance", label: "Dayanıklılık", icon: "fa-heart-pulse" },
    { id: "strength", label: "Güç Artışı", icon: "fa-hand-fist" },
    { id: "pain_relief", label: "Ağrı Azaltma", icon: "fa-bandage" },
    { id: "stress_relief", label: "Stres Azaltma", icon: "fa-brain" },
    { id: "better_sleep", label: "Daha İyi Uyku", icon: "fa-moon" },
    { id: "energy_boost", label: "Enerji Artışı", icon: "fa-bolt" },
    { id: "body_toning", label: "Vücut Şekillendirme", icon: "fa-person" },
    { id: "posture_fix", label: "Duruş Düzeltme", icon: "fa-child-reaching" },
    { id: "healthy_habits", label: "Sağlıklı Alışkanlıklar", icon: "fa-leaf" }
];

// ============================================
// LEVEL OPTIONS
// ============================================
export const LEVEL_OPTIONS = [
    { id: "beginner", label: "Yeni Başlayan", description: "Hiç deneyimi olmayan" },
    { id: "intermediate", label: "Orta Seviye", description: "Temel bilgisi olan" },
    { id: "advanced", label: "İleri Seviye", description: "Deneyimli" },
    { id: "professional", label: "Profesyonel", description: "Sporcu seviyesi" }
];

// ============================================
// AGE GROUP OPTIONS
// ============================================
export const AGE_GROUP_OPTIONS = [
    { id: "child", label: "Çocuk", range: "6-12 yaş" },
    { id: "teen", label: "Ergen", range: "13-17 yaş" },
    { id: "young_adult", label: "Genç Yetişkin", range: "18-35 yaş" },
    { id: "adult", label: "Yetişkin", range: "36-50 yaş" },
    { id: "senior", label: "50+", range: "50 yaş üstü" }
];

// ============================================
// LANGUAGE OPTIONS
// ============================================
export const LANGUAGE_OPTIONS = [
    { id: "tr", label: "Türkçe", flag: "🇹🇷" },
    { id: "en", label: "English", flag: "🇬🇧" },
    { id: "de", label: "Deutsch", flag: "🇩🇪" },
    { id: "ar", label: "العربية", flag: "🇸🇦" },
    { id: "ru", label: "Русский", flag: "🇷🇺" },
    { id: "fr", label: "Français", flag: "🇫🇷" }
];

// ============================================
// COUNTRY OPTIONS
// ============================================
export const COUNTRY_OPTIONS = [
    { id: "TR", label: "Türkiye", hasDetailedCities: true },
    { id: "DE", label: "Almanya", hasDetailedCities: false },
    { id: "GB", label: "İngiltere", hasDetailedCities: false },
    { id: "US", label: "Amerika", hasDetailedCities: false },
    { id: "NL", label: "Hollanda", hasDetailedCities: false },
    { id: "FR", label: "Fransa", hasDetailedCities: false },
    { id: "AT", label: "Avusturya", hasDetailedCities: false },
    { id: "BE", label: "Belçika", hasDetailedCities: false },
    { id: "AE", label: "BAE", hasDetailedCities: false },
    { id: "SA", label: "Suudi Arabistan", hasDetailedCities: false },
    { id: "OTHER", label: "Diğer", hasDetailedCities: false }
];

// ============================================
// COMMUNICATION PREFERENCES
// ============================================
export const COMMUNICATION_PREFERENCES = [
    { id: "message", label: "Yazılı Mesaj", icon: "fa-message" },
    { id: "video", label: "Video Görüşme", icon: "fa-video" },
    { id: "both", label: "Her İkisi", icon: "fa-comments" }
];

// ============================================
// EXCLUDED CASES OPTIONS
// ============================================
export const EXCLUDED_CASES_OPTIONS = [
    { id: "diabetes", label: "Diyabet" },
    { id: "pregnancy", label: "Gebelik" },
    { id: "heart_disease", label: "Kalp Hastalıkları" },
    { id: "kidney_disease", label: "Böbrek Hastalıkları" },
    { id: "eating_disorder", label: "Yeme Bozuklukları" },
    { id: "chronic_illness", label: "Kronik Hastalıklar" },
    { id: "pregnancy_risk", label: "Riskli Hamilelik" },
    { id: "mental_health", label: "Ağır Psikolojik Durumlar" },
    { id: "severe_medical", label: "Ciddi Tıbbi Durumlar" },
    { id: "children_under_12", label: "12 Yaş Altı Çocuklar" }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get profession label from ID
export function getProfessionLabel(professionId: string = ''): string {
    const idLower = professionId.toLowerCase();
    for (const cat of PROFESSION_CATEGORIES) {
        const found = cat.items.find(item => item.id === idLower || idLower.includes(item.id));
        if (found) return found.label;
    }
    // Fallback to old SPECIALTY_CATEGORIES logic for backward compatibility
    return professionId;
}

// Get expert style based on profession
export function getExpertStyle(profession: string = '') {
    const prof = profession.toLowerCase();
    let category = PROFESSION_CATEGORIES.find(cat => 
        cat.items.some(item => item.id === prof || prof.includes(item.id))
    );

    // Varsayılan tema
    const theme = category ? category.theme : 'indigo';
    const icon = category ? category.icon : 'fa-user-doctor';

    // Renk Haritaları (Tailwind)
    const colors: Record<string, any> = {
        green: { 
            bg: 'bg-green-50', 
            border: 'border-green-400', 
            shadow: 'shadow-green-200', 
            text: 'text-green-700', 
            badgeBg: 'bg-green-100', 
            iconColor: 'text-green-200', 
            btnMain: 'bg-green-500 hover:bg-green-600 border-green-600 text-white',
            btnOutline: 'text-green-500 border-green-200 hover:bg-green-50',
            hoverBorder: 'group-hover:border-green-200',
            iconBg: 'bg-green-50',
            button: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-100',
            badge: 'bg-green-100 text-green-700 border-green-200'
        },
        blue: { 
            bg: 'bg-blue-50', 
            border: 'border-blue-400', 
            shadow: 'shadow-blue-200', 
            text: 'text-blue-700', 
            badgeBg: 'bg-blue-100', 
            iconColor: 'text-blue-200', 
            btnMain: 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white',
            btnOutline: 'text-blue-500 border-blue-200 hover:bg-blue-50',
            hoverBorder: 'group-hover:border-blue-200',
            iconBg: 'bg-blue-50',
            button: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100',
            badge: 'bg-blue-100 text-blue-700 border-blue-200'
        },
        purple: { 
            bg: 'bg-purple-50', 
            border: 'border-purple-400', 
            shadow: 'shadow-purple-200', 
            text: 'text-purple-700', 
            badgeBg: 'bg-purple-100', 
            iconColor: 'text-purple-200', 
            btnMain: 'bg-purple-500 hover:bg-purple-600 border-purple-600 text-white',
            btnOutline: 'text-purple-500 border-purple-200 hover:bg-purple-50',
            hoverBorder: 'group-hover:border-purple-200',
            iconBg: 'bg-purple-50',
            button: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100',
            badge: 'bg-purple-100 text-purple-700 border-purple-200'
        },
        teal: { 
            bg: 'bg-teal-50', 
            border: 'border-teal-400', 
            shadow: 'shadow-teal-200', 
            text: 'text-teal-700', 
            badgeBg: 'bg-teal-100', 
            iconColor: 'text-teal-200', 
            btnMain: 'bg-teal-500 hover:bg-teal-600 border-teal-600 text-white',
            btnOutline: 'text-teal-500 border-teal-200 hover:bg-teal-50',
            hoverBorder: 'group-hover:border-teal-200',
            iconBg: 'bg-teal-50',
            button: 'text-teal-600 bg-teal-50 hover:bg-teal-100 border-teal-100',
            badge: 'bg-teal-100 text-teal-700 border-teal-200'
        },
        red: { 
            bg: 'bg-red-50', 
            border: 'border-red-400', 
            shadow: 'shadow-red-200', 
            text: 'text-red-700', 
            badgeBg: 'bg-red-100', 
            iconColor: 'text-red-200', 
            btnMain: 'bg-red-500 hover:bg-red-600 border-red-600 text-white',
            btnOutline: 'text-red-500 border-red-200 hover:bg-red-50',
            hoverBorder: 'group-hover:border-red-200',
            iconBg: 'bg-red-50',
            button: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100',
            badge: 'bg-red-100 text-red-700 border-red-200'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-400',
            shadow: 'shadow-orange-200',
            text: 'text-orange-700',
            badgeBg: 'bg-orange-100',
            iconColor: 'text-orange-200',
            btnMain: 'bg-orange-500 hover:bg-orange-600 border-orange-600 text-white',
            btnOutline: 'text-orange-500 border-orange-200 hover:bg-orange-50',
            hoverBorder: 'group-hover:border-orange-200',
            iconBg: 'bg-orange-50',
            button: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100',
            badge: 'bg-orange-100 text-orange-700 border-orange-200'
        },
        indigo: { 
            bg: 'bg-indigo-50', 
            border: 'border-indigo-400', 
            shadow: 'shadow-indigo-200', 
            text: 'text-indigo-700', 
            badgeBg: 'bg-indigo-100', 
            iconColor: 'text-indigo-200', 
            btnMain: 'bg-indigo-500 hover:bg-indigo-600 border-indigo-600 text-white',
            btnOutline: 'text-indigo-500 border-indigo-200 hover:bg-indigo-50',
            hoverBorder: 'group-hover:border-indigo-200',
            iconBg: 'bg-indigo-50',
            button: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100',
            badge: 'bg-indigo-100 text-indigo-700 border-indigo-200'
        },
    };

    const c = colors[theme];
    return { ...c, decorationIcon: icon, theme };
}

// ============================================
// PROGRAM TYPES
// ============================================
export const PROGRAM_TYPES = [
  { id: 'online', label: 'Online', icon: 'fa-video' },
  { id: 'face_to_face', label: 'Yüz Yüze', icon: 'fa-people-arrows' },
  { id: 'package', label: 'Paket Program', icon: 'fa-box' },
  { id: 'group', label: 'Grup', icon: 'fa-users' },
];
