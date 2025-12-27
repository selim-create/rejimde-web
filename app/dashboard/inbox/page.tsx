'use client';

import { useState, useEffect } from "react";
// import Link from "next/link"; // Hata önlemek için <a> kullanıyoruz

// --- MOCK DATA ---
const MOCK_USER_EXPERTS = [
    { id: 1, name: "Dr. Selim", title: "Uzman Diyetisyen", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selim" },
    { id: 2, name: "Selin Hoca", title: "Yoga Eğitmeni", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selin" }
];

const MOCK_THREADS = [
    {
        id: 1,
        expert: { id: 1, name: "Dr. Selim", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selim", status: "online" },
        subject: "Öğün değişikliği hakkında",
        lastMessage: "Tabii, yulaf yerine 2 dilim tam buğday ekmeği tüketebilirsiniz.",
        timestamp: "10 dk önce",
        isRead: false,
        messages: [
            { id: 101, sender: 'user', content: "Merhaba Selim Bey, sabah kahvaltısında yulaf yemekten biraz sıkıldım. Alternatif ne önerirsiniz?", time: "09:30" },
            { id: 102, sender: 'expert', content: "Merhaba! Yulaf yerine 2 dilim kızarmış tam buğday ekmeği ve yanında bol yeşillik tercih edebilirsiniz. Kalori dengesi açısından aynıdır.", time: "09:45" },
            { id: 103, sender: 'user', content: "Süper, teşekkürler!", time: "09:50" },
            { id: 104, sender: 'expert', content: "Rica ederim, afiyet olsun! 🥑", time: "09:51" }
        ]
    },
    {
        id: 2,
        expert: { id: 2, name: "Selin Hoca", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selin", status: "offline" },
        subject: "Bel ağrısı",
        lastMessage: "Geçmiş olsun, videoyu izleyip dönüş yapacağım.",
        timestamp: "Dün",
        isRead: true,
        messages: [
            { id: 201, sender: 'user', content: "Hocam dünkü dersten sonra belimde hafif bir ağrı oldu. Yanlış bir hareket mi yaptım acaba?", time: "Dün 14:00" },
            { id: 202, sender: 'expert', content: "Merhaba, geçmiş olsun. Kobra pozunda beli çok zorlamış olabilirsin. Ağrı keskin mi yoksa yaygın bir kas ağrısı mı?", time: "Dün 15:30" },
            { id: 203, sender: 'user', content: "Daha çok kas ağrısı gibi, batma yok.", time: "Dün 15:35" },
            { id: 204, sender: 'expert', content: "Tamamdır, o zaman korkulacak bir şey yok. Sıcak su torbası iyi gelecektir. Bir sonraki derste o harekete dikkat edelim.", time: "Dün 16:00" }
        ]
    }
];

export default function UserInboxPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  
  // New Message Form State
  const [newMsgData, setNewMsgData] = useState({ expertId: "", subject: "", message: "" });

  const activeThread = MOCK_THREADS.find(t => t.id === selectedThreadId);
  
  const filteredThreads = MOCK_THREADS.filter(t => {
      if (activeTab === 'unread') return !t.isRead;
      return true;
  });

  const handleSendMessage = () => {
      if(!replyText.trim()) return;
      alert("Mesaj gönderildi! (Demo)");
      setReplyText("");
  };

  const handleStartNewThread = () => {
      alert("Yeni konu başlatıldı! (Demo)");
      setShowNewMessageModal(false);
      setNewMsgData({ expertId: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-4">
            <a href="/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
                <i className="fa-solid fa-arrow-left"></i>
            </a>
            <div>
                <h1 className="font-extrabold text-gray-800 text-xl tracking-tight">Mesajlarım</h1>
                <p className="text-xs font-bold text-gray-500">Uzmanlarınla iletişimde kal</p>
            </div>
         </div>
         <button 
            onClick={() => setShowNewMessageModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn btn-game flex items-center gap-2 hover:bg-blue-500 transition"
         >
            <i className="fa-solid fa-pen-to-square"></i> <span className="hidden sm:inline">Yeni Soru</span>
         </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-100px)]">
        
        <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row h-full">
            
            {/* THREAD LIST (LEFT) */}
            <div className={`w-full md:w-1/3 border-r-2 border-gray-100 flex flex-col ${selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
                {/* Search & Filters */}
                <div className="p-4 border-b-2 border-gray-100 bg-gray-50/50">
                    <div className="relative mb-3">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                        <input type="text" placeholder="Mesajlarda ara..." className="w-full bg-white border-2 border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:border-blue-400 focus:outline-none transition" />
                    </div>
                    <div className="flex bg-gray-200/50 rounded-xl p-1">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Tümü
                        </button>
                        <button 
                            onClick={() => setActiveTab('unread')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'unread' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Okunmamış
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredThreads.map(thread => (
                        <div 
                            key={thread.id}
                            onClick={() => setSelectedThreadId(thread.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-blue-50 ${selectedThreadId === thread.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={thread.expert.avatar} className="w-10 h-10 rounded-xl bg-gray-200 object-cover" alt={thread.expert.name} />
                                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${thread.expert.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    </div>
                                    <div>
                                        <h4 className={`text-sm leading-tight ${!thread.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>{thread.expert.name}</h4>
                                        <span className="text-[10px] font-bold text-gray-400">{thread.subject}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{thread.timestamp}</span>
                            </div>
                            <p className={`text-xs mt-2 line-clamp-2 ${!thread.isRead ? 'font-bold text-gray-600' : 'text-gray-500'}`}>
                                {!thread.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>}
                                {thread.lastMessage}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHAT DETAIL (RIGHT) */}
            <div className={`w-full md:w-2/3 flex flex-col bg-gray-50/30 ${!selectedThreadId ? 'hidden md:flex' : 'flex'}`}>
                {activeThread ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b-2 border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedThreadId(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                                        {activeThread.subject}
                                        <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">#{activeThread.id}</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold">{activeThread.expert.name} ile</p>
                                </div>
                            </div>
                            <button className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition flex items-center justify-center" title="Detaylar">
                                <i className="fa-solid fa-circle-info"></i>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeThread.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 rounded-tl-none border-2 border-gray-100'
                                    }`}>
                                        <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                        <div className={`text-[10px] font-black mt-1 opacity-70 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area */}
                        <div className="p-4 bg-white border-t-2 border-gray-100">
                            <div className="relative flex items-end gap-2">
                                <button className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-paperclip"></i>
                                </button>
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 pr-10 text-gray-700 text-sm font-bold focus:border-blue-400 focus:outline-none min-h-[48px] max-h-[120px] resize-none"
                                    placeholder="Mesajınızı yazın..."
                                ></textarea>
                                <button 
                                    onClick={handleSendMessage}
                                    className="w-12 h-10 rounded-xl bg-blue-600 text-white shadow-btn btn-game flex items-center justify-center shrink-0 hover:bg-blue-500 transition"
                                >
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <i className="fa-regular fa-comments text-4xl text-gray-300"></i>
                        </div>
                        <h3 className="font-extrabold text-xl text-gray-600 mb-2">Mesaj Kutusu</h3>
                        <p className="text-sm font-bold max-w-xs">Uzmanlarınızla iletişime geçmek veya geçmiş konuşmalarınızı görmek için soldan bir seçim yapın.</p>
                    </div>
                )}
            </div>

        </div>
      </div>

      {/* NEW MESSAGE MODAL */}
      {showNewMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowNewMessageModal(false)}>
              <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowNewMessageModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-pen-to-square text-blue-500"></i> Yeni Soru Sor
                  </h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2 ml-1">Kime</label>
                          <div className="grid grid-cols-2 gap-3">
                              {MOCK_USER_EXPERTS.map(expert => (
                                  <div 
                                    key={expert.id}
                                    onClick={() => setNewMsgData({...newMsgData, expertId: expert.id.toString()})}
                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${newMsgData.expertId === expert.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                                  >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={expert.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt={expert.name} />
                                      <div className="overflow-hidden">
                                          <p className="text-xs font-black text-gray-800 truncate">{expert.name}</p>
                                          <p className="text-[10px] font-bold text-gray-500 truncate">{expert.title}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2 ml-1">Konu</label>
                          <input 
                            type="text" 
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold focus:border-blue-400 focus:outline-none"
                            placeholder="Örn: Antrenman programı hakkında"
                            value={newMsgData.subject}
                            onChange={(e) => setNewMsgData({...newMsgData, subject: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2 ml-1">Mesaj</label>
                          <textarea 
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-gray-800 font-bold focus:border-blue-400 focus:outline-none min-h-[120px] resize-none"
                            placeholder="Sorunuzu detaylı bir şekilde yazın..."
                            value={newMsgData.message}
                            onChange={(e) => setNewMsgData({...newMsgData, message: e.target.value})}
                          ></textarea>
                      </div>

                      <div className="flex gap-3 pt-2">
                            <button className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-extrabold text-sm hover:bg-gray-200 transition">
                                Fotoğraf Ekle
                            </button>
                            <button 
                                onClick={handleStartNewThread}
                                className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition"
                            >
                                Gönder
                            </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}