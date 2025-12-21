export type MascotState = 
  | 'onboarding_welcome'
  | 'water_reminder'
  | 'cheat_meal_detected'
  | 'workout_motivation'
  | 'success_milestone'
  | 'idle_dashboard';

export const MASCOT_CONFIG = {
  meta: {
    version: "1.0",
    character_name: "FitBuddy",
    tone: "witty_supportive",
    description: "Kullanıcıyı yargılamayan ama tatlı sert uyaran, esprili yol arkadaşı."
  },
  states: {
    onboarding_welcome: {
      description: "Kullanıcı ilk kez uygulamayı açtığında",
      assets: [
        {
          type: "image",
          file: "mascot_wave_hello.png",
          alt: "FitBuddy el sallıyor"
        },
        {
          type: "image",
          file: "mascot_holding_sign.png",
          alt: "FitBuddy tabela tutuyor"
        }
      ],
      texts: [
        "Rejimde'ye hoş geldin! Baklavalar peşini bıraksın istiyorsan doğru yerdesin.",
        "Selam! Ben senin yeni suç ortağınım... pardon, sağlık koçunum!",
        "Hazır mısın? Bugün hayatının en fit gününün ilk günü!"
      ]
    },
    water_reminder: {
      description: "Su tüketimi hedefi tutmadığında veya hatırlatma zamanında",
      assets: [
        {
          type: "image",
          file: "mascot_thirsty_sweating.png",
          alt: "FitBuddy terliyor ve susamış"
        },
        {
          type: "image",
          file: "mascot_holding_water_glass.png",
          alt: "FitBuddy su bardağı uzatıyor"
        },
        {
          type: "image",
          file: "mascot_dry_plant.png",
          alt: "FitBuddy kurumuş bir bitki gibi"
        }
      ],
      texts: [
        "Hocam o suyu içmezsen skorun düşecek, benden söylemesi! 💧",
        "Su içsen yarıyor aslında ama biz yine de içelim.",
        "Kuruduk kaldık şurada... Bir bardak su ısmarlamaz mısın?",
        "Böbrekler ağlıyor şu an, duyuyor musun? 😢",
        "Senin kaktüs bile senden çok su içti bugün!"
      ]
    },
    cheat_meal_detected: {
      description: "Kullanıcı yüksek kalorili/sağlıksız bir yemek girmeye çalıştığında veya fotoğraf çektiğinde",
      assets: [
        {
          type: "image",
          file: "mascot_whistle_police.png",
          alt: "FitBuddy polis düdüğü çalıyor"
        },
        {
          type: "image",
          file: "mascot_shocked_eyes_wide.png",
          alt: "FitBuddy şok olmuş"
        },
        {
          type: "image",
          file: "mascot_holding_stop_sign.png",
          alt: "FitBuddy DUR levhası tutuyor"
        }
      ],
      texts: [
        "Şimdi elindeki o poğaçayı yavaşça yere bırak! 🥐🚫",
        "Bunu yersen yarınki antrenmanda acısını çıkarırım, anlaşalım.",
        "Hocam emin miyiz? Rejimde Skoru bunu beğenmedi...",
        "O tabaktaki karbonhidratı görmediğimi sanma! 👀",
        "Kaçamak mı? Hafta sonuna saklasak daha tatlı olmaz mı?"
      ]
    },
    workout_motivation: {
      description: "Antrenman öncesi veya sırasında",
      assets: [
        {
          type: "image",
          file: "mascot_lifting_dumbbell.png",
          alt: "FitBuddy dambıl kaldırıyor"
        },
        {
          type: "image",
          file: "mascot_running_sweatband.png",
          alt: "FitBuddy koşuyor"
        },
        {
          type: "image",
          file: "mascot_yoga_pose.png",
          alt: "FitBuddy yoga yapıyor"
        }
      ],
      texts: [
        "Biraz egzersiz Rejimde skorunu da canlandırır aslında! 😉",
        "Sabah koşusu gibisi yok, değil mi? (Yalan olsa da inan!)",
        "Kanepe seni özler, merak etme. Hadi kalk!",
        "Ter, yağların ağlama şeklidir. Ağlat onları! 💪",
        "Sadece 20 dakika... Bir dizi bölümünden kısa."
      ]
    },
    success_milestone: {
      description: "Kilo verdiğinde, skor arttığında veya streak yaptığında",
      assets: [
        {
          type: "image",
          file: "mascot_holding_trophy.png",
          alt: "FitBuddy kupa tutuyor"
        },
        {
          type: "image",
          file: "mascot_confetti_celebration.png",
          alt: "FitBuddy konfetilerle kutluyor"
        },
        {
          type: "image",
          file: "mascot_flexing_muscles.png",
          alt: "FitBuddy kaslarını gösteriyor"
        }
      ],
      texts: [
        "İşte bu! Kim tutar seni be!",
        "Şampiyonlar Ligi müziği çalıyor şu an, duyuyor musun? 🏆",
        "Bu hızla gidersen yaza kalmadan manken olursun.",
        "Skorun tavan yaptı! Gurur duydum."
      ]
    },
    idle_dashboard: {
      description: "Kullanıcı sadece ana sayfada dolaşırken",
      assets: [
        {
          type: "image",
          file: "mascot_meditating.png",
          alt: "FitBuddy meditasyon yapıyor"
        },
        {
          type: "image",
          file: "mascot_reading_book.png",
          "alt": "FitBuddy kitap okuyor"
        },
        {
          type: "image",
          file: "mascot_sipping_tea.png",
          alt: "FitBuddy çay içiyor"
        }
      ],
      texts: [
        "Rejimdeyim rejimde, baklavalar börekler hep benim peşimde...",
        "Bugün hava tam yürüyüş havası değil mi?",
        "Akşam yemeğini hafif mi geçsek?",
        "Klanındaki herkes seni geçti, haberin olsun. 👀"
      ]
    }
  }
};