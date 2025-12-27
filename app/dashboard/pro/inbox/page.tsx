'use client';

import { useState, useEffect } from "react";
// import Link from "next/link"; // Hata verdiği için geçici olarak kaldırıldı

// --- MOCK API & DATA (Bağımsız çalışması için buraya eklendi) ---
const getMe = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 99,
                name: "Dr. Selim",
                title: "Baş Diyetisyen",
                avatar_url: "https://api.dicebear.com/9.x/personas/svg?seed=Selim",
            });
        }, 500);
    });
};

const MOCK_THREADS = [
    {
        id: 1,
        client: { name: "Ayşe K.", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse", status: "online" },
        subject: "Ara öğün değişimi hk.",
        lastMessage: "Hocam merhaba, badem yerine ceviz yiyebilir miyim?",
        timestamp: "10 dk önce",
        status: "open", // open, answered, closed
        isRead: false,
        messages: [
            { id: 101, sender: 'client', content: "Hocam merhaba, listemde ara öğünde 10 adet badem var. Evde kalmamış, onun yerine ceviz tüketsem olur mu? Kaç tane yemeliyim?", time: "14:30" }
        ]
    },
    {
        id: 2,
        client: { name: "Burak Yılmaz", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak", status: "offline" },
        subject: "Antrenman sonrası ağrı",
        lastMessage: "Tamamdır hocam, buz uygulayacağım.",
        timestamp: "2 saat önce",
        status: "answered",
        isRead: true,
        messages: [
            { id: 201, sender: 'client', content: "Dünkü bacak antrenmanından sonra dizimde hafif bir sızı var. Ne önerirsiniz?", time: "09:00" },
            { id: 202, sender: 'expert', content: "Merhaba Burak, zorlamış olabilirsin. Bugün bacak antrenmanını pas geçelim. Ağrıyan bölgeye 15dk buz kompresi yapabilirsin.", time: "09:15" },
            { id: 203, sender: 'client', content: "Tamamdır hocam, buz uygulayacağım. Teşekkürler.", time: "09:20" }
        ]
    },
    {
        id: 3,
        client: { name: "Selin Yılmaz", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selin", status: "online" },
        subject: "Yoga matı önerisi",
        lastMessage: "Teşekkürler, sipariş verdim.",
        timestamp: "Dün",
        status: "closed",
        isRead: true,
        messages: [
            { id: 301, sender: 'client', content: "Hocam derste kullandığınız matın markası neydi?", time: "Dün 10:00" },
            { id: 302, sender: 'expert', content: "Manduka Pro kullanıyorum Selin. Biraz ağırdır ama kaymaz.", time: "Dün 11:00" },
            { id: 303, sender: 'client', content: "Teşekkürler, sipariş verdim.", time: "Dün 11:05" }
        ]
    }
];
// ------------------------------------------------------------------

export default function ProInboxPage() {
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Inbox State
  const [activeTab, setActiveTab] = useState<'open' | 'answered' | 'closed'>('open');
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    getMe().then((user) => {
        setPro(user);
        setLoading(false);
    });
  }, []);

  const filteredThreads = MOCK_THREADS.filter(t => t.status === activeTab);
  const activeThread = MOCK_THREADS.find(t => t.id === selectedThreadId);

  // AI Taslak Oluşturma Simülasyonu
  const handleGenerateAIDraft = () => {
      setIsGeneratingAI(true);
      setTimeout(() => {
          setReplyText("Merhaba Ayşe Hanım, evet değişim yapabilirsiniz. 10 adet badem yaklaşık 2 tam cevize eşittir. Kalori dengesi açısından 2-3 tam ceviz tüketmenizde bir sakınca yok. Afiyet olsun! 🌱");
          setIsGeneratingAI(false);
      }, 1500);
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <a href="/" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </a>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
                    PRO PANEL
                </span>
                <h1 className="font-extrabold text-white text-lg">Gelen Kutusu</h1>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pro?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">

        {/* SIDEBAR NAV (Tam Liste) */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 h-full overflow-y-auto custom-scrollbar pr-2">
            <a href="/dashboard/pro" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gauge-high w-6 text-center group-hover:text-blue-400"></i> Panel
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">Yönetim</p>
            <a href="/dashboard/pro/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-bell w-6 text-center group-hover:text-blue-400"></i> Bildirimler
            </a>
            <a href="/dashboard/pro/activity" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-chart-line w-6 text-center group-hover:text-purple-400"></i> Aktiviteler
            </a>
            <a href="/dashboard/pro/inbox" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-extrabold shadow-btn shadow-blue-800 btn-game transition-transform hover:scale-105">
                <i className="fa-solid fa-envelope w-6 text-center"></i> Gelen Kutusu
            </a>
            <a href="/dashboard/pro/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-users w-6 text-center group-hover:text-blue-400"></i> Danışanlar
            </a>
            <a href="/dashboard/pro/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-calendar-check w-6 text-center group-hover:text-green-400"></i> Takvim
            </a>
            <a href="/dashboard/pro/earnings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wallet w-6 text-center group-hover:text-yellow-400"></i> Gelirler
            </a>
            <a href="/dashboard/pro/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-list w-6 text-center group-hover:text-teal-400"></i> Paketlerim
            </a>
            <a href="/dashboard/pro/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-star w-6 text-center group-hover:text-yellow-400"></i> Değerlendirmeler
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">İçerik & Araçlar</p>
            <a href="/dashboard/pro/diets/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-utensils w-6 text-center group-hover:text-orange-400"></i> Diyet Yaz
            </a>
            <a href="/dashboard/pro/exercises/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-dumbbell w-6 text-center group-hover:text-red-400"></i> Egzersiz Yaz
            </a>
            <a href="/dashboard/pro/blog/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-pen-nib w-6 text-center group-hover:text-pink-400"></i> Blog Yazısı
            </a>
            <a href="/dashboard/pro/dictionary/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-book-open w-6 text-center group-hover:text-teal-400"></i> Sözlük Ekle
            </a>
            
            <div className="h-px bg-slate-800 my-2"></div>
            
            <a href="/dashboard/pro/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wand-magic-sparkles w-6 text-center text-purple-500"></i> AI Asistan
            </a>
            <a href="/dashboard/pro/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gear w-6 text-center group-hover:text-gray-300"></i> Ayarlar
            </a>
        </div>

        {/* INBOX CONTENT */}
        <div className="lg:col-span-10 bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-card flex flex-col md:flex-row h-full">
            
            {/* THREAD LIST (LEFT) */}
            <div className={`w-full md:w-1/3 border-r border-slate-700 flex flex-col ${selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
                {/* Filters */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex bg-slate-900 rounded-xl p-1">
                        <button 
                            onClick={() => setActiveTab('open')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'open' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Bekleyen
                        </button>
                        <button 
                            onClick={() => setActiveTab('answered')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'answered' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Yanıtlanan
                        </button>
                        <button 
                            onClick={() => setActiveTab('closed')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'closed' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Arşiv
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredThreads.length > 0 ? (
                        filteredThreads.map(thread => (
                            <div 
                                key={thread.id}
                                onClick={() => setSelectedThreadId(thread.id)}
                                className={`p-4 border-b border-slate-700 cursor-pointer transition hover:bg-slate-700/50 ${selectedThreadId === thread.id ? 'bg-slate-700/50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={thread.client.avatar} className="w-8 h-8 rounded-full" alt={thread.client.name} />
                                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-800 ${thread.client.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                                        </div>
                                        <span className={`font-bold text-sm ${!thread.isRead ? 'text-white' : 'text-slate-300'}`}>{thread.client.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">{thread.timestamp}</span>
                                </div>
                                <h4 className={`text-sm mb-1 line-clamp-1 ${!thread.isRead ? 'font-black text-white' : 'font-bold text-slate-400'}`}>
                                    {!thread.isRead && <span className="w-2 h-2 inline-block bg-blue-500 rounded-full mr-2"></span>}
                                    {thread.subject}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-1">{thread.lastMessage}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <i className="fa-regular fa-folder-open text-2xl mb-2"></i>
                            <p className="text-xs font-bold">Mesaj bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CHAT DETAIL (RIGHT) */}
            <div className={`w-full md:w-2/3 flex flex-col ${!selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
                {activeThread ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedThreadId(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400">
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h3 className="font-extrabold text-white text-base">{activeThread.subject}</h3>
                                    <p className="text-xs text-slate-400 font-bold">{activeThread.client.name} ile konuşuluyor</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition flex items-center justify-center" title="Danışan Profili">
                                    <i className="fa-regular fa-user"></i>
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 transition flex items-center justify-center" title="Konuyu Kapat">
                                    <i className="fa-solid fa-check"></i>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
                            {activeThread.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'expert' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                                        msg.sender === 'expert' 
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                                            : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                                    }`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                        <div className={`text-[10px] font-bold mt-2 opacity-70 ${msg.sender === 'expert' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area */}
                        {activeThread.status !== 'closed' && (
                            <div className="p-4 border-t border-slate-700 bg-slate-800">
                                {/* AI Action Bar */}
                                {!replyText && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                                        <button 
                                            onClick={handleGenerateAIDraft}
                                            disabled={isGeneratingAI}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition whitespace-nowrap"
                                        >
                                            <i className={`fa-solid ${isGeneratingAI ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                                            {isGeneratingAI ? 'Yazılıyor...' : 'AI ile Taslak Oluştur'}
                                        </button>
                                        <button className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-400 text-xs font-bold hover:text-white transition whitespace-nowrap">
                                            👍 Teşekkürler
                                        </button>
                                        <button className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-400 text-xs font-bold hover:text-white transition whitespace-nowrap">
                                            📅 Randevu Oluştur
                                        </button>
                                    </div>
                                )}

                                <div className="relative">
                                    <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pr-12 text-white text-sm font-medium focus:border-blue-500 focus:outline-none min-h-[100px] resize-none placeholder-slate-500"
                                        placeholder="Cevabınızı yazın..."
                                    ></textarea>
                                    <button className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition shadow-blue-900/50">
                                        <i className="fa-solid fa-paper-plane text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeThread.status === 'closed' && (
                            <div className="p-4 border-t border-slate-700 bg-slate-800 text-center">
                                <p className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-lock"></i> Bu konu kapatılmıştır.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-900/30">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <i className="fa-solid fa-paper-plane text-4xl text-slate-600"></i>
                        </div>
                        <h3 className="font-bold text-lg text-slate-300">Bir görüşme seçin</h3>
                        <p className="text-sm">Mesaj detaylarını görmek için soldan bir konu seçin.</p>
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
}