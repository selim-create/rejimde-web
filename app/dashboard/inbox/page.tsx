'use client';

import { useState, useEffect } from "react";
import { getMyInboxThreads, getMyInboxThread, sendMyInboxMessage, createMyInboxThread, getMyExperts, MyInboxThread, MyInboxMessage, MyExpert } from "@/lib/api";

export default function UserInboxPage() {
  const [threads, setThreads] = useState<MyInboxThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MyInboxThread | null>(null);
  const [messages, setMessages] = useState<MyInboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [experts, setExperts] = useState<MyExpert[]>([]);
  
  // New Message Form State
  const [newMsgData, setNewMsgData] = useState({ expertId: 0, subject: "", message: "" });

  useEffect(() => {
    loadThreads();
    loadExperts();
  }, []);

  async function loadThreads() {
    try {
      const data = await getMyInboxThreads();
      setThreads(data);
    } catch (error) {
      console.error("Mesajlar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadExperts() {
    try {
      const data = await getMyExperts();
      setExperts(data);
    } catch (error) {
      console.error("Uzmanlar yüklenemedi:", error);
    }
  }

  async function selectThread(threadId: number) {
    const thread = await getMyInboxThread(threadId);
    if (thread) {
      setSelectedThread(thread);
      setMessages(thread.messages || []);
    }
  }

  async function handleSendMessage() {
    if (!replyText.trim() || !selectedThread) return;
    
    setSending(true);
    const result = await sendMyInboxMessage(selectedThread.id, replyText);
    if (result.success) {
      setReplyText("");
      // Reload thread
      await selectThread(selectedThread.id);
      await loadThreads(); // Refresh thread list
    } else {
      alert('Mesaj gönderilemedi.');
    }
    setSending(false);
  }

  async function handleStartNewThread() {
    if (!newMsgData.expertId || !newMsgData.subject.trim() || !newMsgData.message.trim()) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    
    const result = await createMyInboxThread(newMsgData.expertId, newMsgData.subject, newMsgData.message);
    if (result.success && result.thread_id) {
      setShowNewMessageModal(false);
      setNewMsgData({ expertId: 0, subject: "", message: "" });
      await loadThreads();
      // Auto-select the new thread
      if (result.thread_id) {
        await selectThread(result.thread_id);
      }
    } else {
      alert('Mesaj gönderilemedi.');
    }
  }

  const filteredThreads = threads.filter(t => {
    if (activeTab === 'unread') return !t.is_read;
    return true;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diff / (1000 * 60));
      return `${diffMinutes} dk önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 font-sans text-gray-800">
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
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

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
        
        {threads.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
            <i className="fa-solid fa-message text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-black text-gray-700 mb-2">Henüz Mesaj Yok</h3>
            <p className="text-gray-500 font-bold text-sm mb-6">Uzmanlarınla iletişime geçmek için yeni bir soru sor!</p>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition"
            >
              <i className="fa-solid fa-pen-to-square mr-2"></i> Yeni Soru Sor
            </button>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row h-full">
            
            {/* THREAD LIST (LEFT) */}
            <div className={`w-full md:w-1/3 border-r-2 border-gray-100 flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
                {/* Search & Filters */}
                <div className="p-4 border-b-2 border-gray-100 bg-gray-50/50">
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
                          onClick={() => selectThread(thread. id)}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-blue-50 ${selectedThread?.id === thread.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                  <div className="relative">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img 
                                          src={thread.expert?. avatar || 'https://api.dicebear.com/9.x/personas/svg? seed=default'} 
                                          className="w-10 h-10 rounded-xl bg-gray-200 object-cover" 
                                          alt={thread.expert?. name || 'Uzman'} 
                                      />
                                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${thread.expert?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                  </div>
                                  <div>
                                      <h4 className={`text-sm leading-tight ${! thread.is_read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                          {thread.expert?.name || 'Uzman'}
                                      </h4>
                                      <span className="text-[10px] font-bold text-gray-400">{thread.subject}</span>
                                  </div>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{formatTime(thread.last_message_time)}</span>
                          </div>
                          <p className={`text-xs mt-2 line-clamp-2 ${! thread.is_read ? 'font-bold text-gray-600' : 'text-gray-500'}`}>
                              {! thread.is_read && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>}
                              {thread. last_message}
                          </p>
                      </div>
                  ))}
                </div>
            </div>

            {/* CHAT DETAIL (RIGHT) */}
            <div className={`w-full md:w-2/3 flex flex-col bg-gray-50/30 ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
                {selectedThread ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b-2 border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedThread(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h3 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                                        {selectedThread.subject}
                                        <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">#{selectedThread.id}</span>
                                    </h3>
                                  <p className="text-xs text-gray-500 font-bold">{selectedThread. expert?. name || 'Uzman'} ile</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                        msg.sender === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 rounded-tl-none border-2 border-gray-100'
                                    }`}>
                                        <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                        <div className={`text-[10px] font-black mt-1 opacity-70 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-gray-400'}`}>
                                            {formatTime(msg.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area */}
                        <div className="p-4 bg-white border-t-2 border-gray-100">
                            <div className="relative flex items-end gap-2">
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                      }
                                    }}
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 pr-10 text-gray-700 text-sm font-bold focus:border-blue-400 focus:outline-none min-h-[48px] max-h-[120px] resize-none"
                                    placeholder="Mesajınızı yazın..."
                                    disabled={sending}
                                ></textarea>
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={sending || !replyText.trim()}
                                    className="w-12 h-10 rounded-xl bg-blue-600 text-white shadow-btn btn-game flex items-center justify-center shrink-0 hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                      <i className="fa-solid fa-spinner fa-spin"></i>
                                    ) : (
                                      <i className="fa-solid fa-paper-plane"></i>
                                    )}
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
        )}
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
                              {experts.map(expert => (
                                  <div 
                                    key={expert.id}
                                    onClick={() => setNewMsgData({...newMsgData, expertId: expert.expert.id})}
                                    className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${newMsgData.expertId === expert.expert.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                                  >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={expert.expert.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt={expert.expert.name} />
                                      <div className="overflow-hidden">
                                          <p className="text-xs font-black text-gray-800 truncate">{expert.expert.name}</p>
                                          <p className="text-[10px] font-bold text-gray-500 truncate">{expert.expert.title}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {experts.length === 0 && (
                            <p className="text-xs text-gray-400 mt-2">Henüz uzmanın yok. <a href="/experts" className="text-blue-600 font-bold hover:underline">Uzman bul</a></p>
                          )}
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
                            <button 
                                onClick={handleStartNewThread}
                                disabled={!newMsgData.expertId || !newMsgData.subject.trim() || !newMsgData.message.trim()}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
