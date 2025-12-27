// lib/mock-data-pro.ts

export const MOCK_STATS = {
    activeClients: 42,
    pendingAppointments: 8,
    pendingRevisions: 5,
    monthlyIncome: "₺24.500",
    weeklyGrowth: "+3",
    totalBalance: "₺8.250",
    pendingPayout: "₺12.000",
    lastPayout: "₺15.000"
};

export const MOCK_SERVICES = [
    { id: 1, title: "Online Yoga (Birebir)", price: 750, duration: 60 },
    { id: 2, title: "Reformer Pilates (Stüdyo)", price: 1200, duration: 50 },
    { id: 3, title: "Beslenme Danışmanlığı", price: 2000, duration: 45 },
    { id: 4, title: "PT Paketi (10 Ders)", price: 15000, duration: 60 },
];

export const MOCK_CLIENTS = [
  {
    id: 101,
    name: "Burak Yılmaz",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak",
    status: "danger", 
    statusText: "3 gündür log girmiyor",
    score: 420,
    nextAction: "whatsapp",
    packageInfo: {
        name: "Online PT Paketi",
        total: 24,
        used: 18,
        remaining: 6
    },
    agreement: {
        startDate: "2025-12-01",
        endDate: "2026-02-01",
        duration: "2 Ay",
        price: 8500,
        notes: "Bel fıtığı geçmişi var, ağırlıklara dikkat edilecek."
    },
    requests: [
        { id: 1, type: 'diet', title: 'Diyet Revizesi', date: '2 saat önce', status: 'pending', desc: 'Hocam, öğle yemeklerinde dışarıdayım, alternatifi güncelleyebilir miyiz?' },
        { id: 2, type: 'form_check', title: 'Squat Form Videosu', date: 'Dün', status: 'approved', desc: 'Son antrenman videosunu yükledim.' }
    ]
  },
  {
    id: 102,
    name: "Ayşe K.",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse",
    status: "warning",
    statusText: "Yeni liste talep etti",
    score: 750,
    nextAction: "plan",
    packageInfo: {
        name: "Beslenme Danışmanlığı",
        total: 4,
        used: 1,
        remaining: 3
    },
    agreement: {
        startDate: "2025-12-15",
        endDate: "2026-01-15",
        duration: "1 Ay",
        price: 2000,
        notes: "Gluten hassasiyeti."
    },
    requests: [
        { id: 3, type: 'new_plan', title: 'Yeni Liste Talebi', date: 'Bugün', status: 'pending', desc: 'İlk haftayı tamamladım, yeni listemi bekliyorum.' }
    ]
  },
  {
    id: 103,
    name: "Mehmet Demir",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet",
    status: "success",
    statusText: "Hedefine ulaştı 🎉",
    score: 1200,
    nextAction: "congrats",
    packageInfo: {
        name: "Reformer Pilates",
        total: 12,
        used: 12,
        remaining: 0
    },
    agreement: {
        startDate: "2025-11-01",
        endDate: "2025-12-20",
        duration: "12 Ders",
        price: 12000,
        notes: "Paket tamamlandı, yenileme teklif edilecek."
    },
    requests: []
  },
  {
    id: 104,
    name: "Selin Yılmaz",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selin",
    status: "success", 
    statusText: "Düzenli ilerliyor",
    score: 890,
    nextAction: "whatsapp",
    packageInfo: {
        name: "Yoga 101",
        total: 10,
        used: 3,
        remaining: 7
    },
    agreement: {
        startDate: "2025-12-10",
        endDate: "2026-01-20",
        duration: "10 Ders",
        price: 7500,
        notes: "Esneklik odaklı çalışmak istiyor."
    },
    requests: []
  }
];

export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    clientId: 101,
    clientName: "Selin Yılmaz",
    date: "2025-12-28", 
    time: "10:00",
    duration: 60,
    type: "online",
    title: "Vinyasa Flow - Seviye 2",
    status: "confirmed", 
    location: "https://zoom.us/j/123456"
  },
  {
    id: 2,
    clientId: 103,
    clientName: "Merve Boluğur",
    date: "2025-12-28",
    time: "15:30",
    duration: 45,
    type: "offline",
    title: "Haftalık Kontrol",
    status: "confirmed",
    location: "Nişantaşı Ofis"
  },
  {
    id: 3,
    clientId: 102,
    clientName: "Caner Erkin",
    date: "2025-12-27", 
    time: "19:00",
    duration: 50,
    type: "offline",
    title: "Reformer Başlangıç",
    status: "completed",
    location: "Ataşehir Stüdyo"
  },
  {
    id: 4,
    clientId: 104,
    clientName: "Ali Veli",
    date: "2025-12-27", 
    time: "14:00",
    duration: 30,
    type: "online",
    title: "İlk Görüşme",
    status: "completed",
    location: "https://meet.google.com/abc-defg-hij"
  }
];

export const MOCK_APPOINTMENT_REQUESTS = [
    {
        id: 501,
        clientName: "Gizem A.",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Gizem",
        service: "Online Yoga (Birebir)",
        date: "29 Ara, Pzt",
        time: "14:00",
        status: "pending"
    },
    {
        id: 502,
        clientName: "Mehmet Demir",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet",
        service: "Reformer Pilates (Stüdyo)",
        date: "30 Ara, Salı",
        time: "09:00",
        status: "pending"
    }
];

export const MOCK_INBOX = [
    {
        id: 601,
        from: "Ayşe K.",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse",
        subject: "Ara öğün hakkında",
        preview: "Hocam, ara öğünde verdiğiniz badem yerine ceviz tüketsem...",
        time: "10 dk önce",
        isRead: false
    },
    {
        id: 602,
        from: "Burak Yılmaz",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak",
        subject: "Antrenman sonrası ağrı",
        preview: "Dünkü bacak antrenmanından sonra dizimde hafif bir sızı var...",
        time: "2 saat önce",
        isRead: false
    }
];
export const MOCK_TRANSACTIONS = [
    {
        id: "TRX-1092",
        clientName: "Burak Yılmaz",
        clientId: 101,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak",
        date: "27 Ara, 14:30",
        amount: 8500,
        status: "completed", // completed, pending, cancelled
        type: "package",
        description: "Online PT - 24 Ders (Peşin)"
    },
    {
        id: "TRX-1090",
        clientName: "Ayşe K.",
        clientId: 102,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse",
        date: "25 Ara, 11:00",
        amount: 2000,
        status: "pending",
        type: "consultation",
        description: "Aylık Beslenme Danışmanlığı"
    },
    {
        id: "TRX-1089",
        clientName: "Mehmet Demir",
        clientId: 103,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet",
        date: "20 Ara, 16:45",
        amount: 12000,
        status: "completed",
        type: "package",
        description: "Reformer Paket (12 Ders)"
    }
];