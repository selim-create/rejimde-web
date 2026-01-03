'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth, getComments, createComment, getCircleTasks } from '@/lib/api';
import TaskCard from '@/components/tasks/TaskCard';
import type { CircleTask as GamificationCircleTask } from '@/types/gamification';

// Hazır Circle Avatarları
const CIRCLE_AVATARS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle5&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle6&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle7&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle8&backgroundColor=ffdfbf',
];

// --- MODERN MODAL BİLEŞENİ ---
const Modal = ({ isOpen, onClose, title, children, footer }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-black text-xl text-gray-800">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                {footer && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  // Chat container ref'i (Sayfayı değil, sadece kutuyu kaydırmak için)
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Modals State
  const [activeModal, setActiveModal] = useState<'none' | 'settings' | 'invite' | 'leave_confirm' | 'message'>('none');
  const [modalMessage, setModalMessage] = useState({ title: '', text: '', type: 'info' });

  const [settingsData, setSettingsData] = useState({
      name: '',
      description: '',
      privacy: 'public',
      logo: '',
      comment_status: 'open' 
  });

  // Circle Tasks State
  const [circleTasks, setCircleTasks] = useState<GamificationCircleTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Verileri Çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await auth.me();
        setCurrentUser(user);

        const circleData = await auth.getCircle(slug);
        if (circleData) {
          setCircle(circleData);
          setSettingsData({
              name: circleData.name,
              description: circleData.description,
              privacy: circleData.privacy,
              logo: circleData.logo,
              comment_status: circleData.comment_status || 'open'
          });

          if (user && user.clan && user.clan.id === circleData.id) {
            setIsMember(true);
            if (circleData.leader_id && user.id === circleData.leader_id) {
                setIsMentor(true);
            }
          }
          
          // Fetch circle tasks
          if (circleData.id) {
            setTasksLoading(true);
            try {
              const tasks: GamificationCircleTask[] = await getCircleTasks(circleData.id);
              setCircleTasks(tasks);
            } catch (error) {
              console.error('Circle tasks error:', error);
            } finally {
              setTasksLoading(false);
            }
          }
        } else {
          router.push('/circles');
        }
      } catch (error) {
        console.error('Veri hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, router]);

  // Chat Yükleme ve Polling
  useEffect(() => {
      if (circle?.id && isMember) {
          setChatLoading(true);
          const loadMessages = () => {
              getComments(circle.id).then(msgs => {
                  // API'den gelen mesajları ters çevir (Eskiden yeniye sıralı chat için)
                  setChatMessages(msgs.reverse());
                  setChatLoading(false);
              });
          };

          loadMessages();
          const interval = setInterval(loadMessages, 5000); 
          return () => clearInterval(interval);
      }
  }, [circle?.id, isMember]);

  // Chat otomatik scroll (Sadece Chat Container)
  useEffect(() => {
      if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
  }, [chatMessages]);

  const openModal = (name: 'settings' | 'invite' | 'leave_confirm') => setActiveModal(name);
  const closeModal = () => setActiveModal('none');
  
  const showMessage = (title: string, text: string, type: 'info' | 'success' | 'error' = 'info') => {
      setModalMessage({ title, text, type });
      setActiveModal('message');
  };

  // Mesaj Gönder
  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const tempId = Date.now();
      const tempMsg = {
          id: tempId,
          user: currentUser?.name || 'Ben',
          userId: currentUser?.id,
          text: chatInput,
          date: new Date().toISOString(),
          avatar: currentUser?.avatar_url,
          pending: true
      };

      setChatMessages(prev => [...prev, tempMsg]);
      setChatInput('');

      try {
          const res = await createComment(circle.id, tempMsg.text);
          if (!res.success) {
              showMessage("Hata", res.message || "Mesaj gönderilemedi.", "error");
          } else {
              const msgs = await getComments(circle.id);
              setChatMessages(msgs.reverse());
          }
      } catch (error) {
          console.error("Mesaj hatası", error);
      }
  };

  const handleJoin = async () => {
    if (!currentUser) return router.push('/login');
    if (currentUser.clan) {
      showMessage("Hata", "Zaten bir Circle'dasın. Önce ondan ayrılmalısın.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await auth.joinCircle(circle.id);
      setIsMember(true);
      setCircle({ ...circle, member_count: circle.member_count + 1 });
      showMessage("Başarılı", "Circle'a hoş geldin!", "success");
    } catch (error: any) {
      showMessage("Hata", error.message || "Katılma başarısız.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmLeave = async () => {
    setActionLoading(true);
    try {
      await auth.leaveCircle();
      setIsMember(false);
      setCircle({ ...circle, member_count: circle.member_count - 1 });
      closeModal();
      showMessage("Bilgi", "Circle'dan ayrıldın.", "info");
    } catch (error: any) {
      showMessage("Hata", error.message || "Ayrılma başarısız.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      setActionLoading(true);
      try {
          await auth.updateCircle(circle.id, settingsData);
          setCircle({ ...circle, ...settingsData });
          closeModal();
          showMessage("Başarılı", "Circle bilgileri güncellendi!", "success");
      } catch (error: any) {
          showMessage("Hata", error.message, "error");
      } finally {
          setActionLoading(false);
      }
  };

  const copyInviteLink = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      showMessage("Kopyalandı", "Link kopyalandı!", "success");
  };

  if (loading) {
    return (
        <LayoutWrapper>
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        </LayoutWrapper>
    );
  }

  if (!circle) return null;

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/50">
      
      {/* HEADER */}
      <div className="bg-[#FF6F91] text-white py-12 md:py-16 relative overflow-hidden shadow-lg mb-8">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.5) 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Logo */}
                  <div className="relative group cursor-pointer shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 rounded-3xl flex items-center justify-center border-4 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)] backdrop-blur-sm group-hover:scale-105 transition overflow-hidden">
                          {circle.logo ? (
                              <img src={circle.logo} alt={circle.name} className="w-full h-full object-cover" />
                          ) : (
                              <i className="fa-solid fa-shield-halved text-6xl md:text-7xl text-white drop-shadow-md"></i>
                          )}
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-yellow-400 border-4 border-[#FF6F91] w-12 h-12 rounded-full flex items-center justify-center font-black text-gray-800 text-sm shadow-md">5</div>
                  </div>
                  {/* Info */}
                  <div className="text-center md:text-left flex-1 w-full">
                      <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-4 justify-center md:justify-start flex-wrap">
                          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wide drop-shadow-sm leading-none">{circle.name}</h1>
                          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 md:mt-0">
                              <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-white/20 flex items-center gap-1 backdrop-blur-sm"><i className="fa-solid fa-users"></i> {circle.member_count} Üye</span>
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border border-white/20 flex items-center gap-1 backdrop-blur-sm ${circle.privacy === 'invite_only' ? 'bg-amber-500/80' : 'bg-green-500/80'}`}>
                                  <i className={`fa-solid ${circle.privacy === 'invite_only' ? 'fa-lock' : 'fa-globe'}`}></i> {circle.privacy === 'invite_only' ? 'Davetle' : 'Herkese Açık'}
                              </span>
                          </div>
                      </div>
                      <p className="text-pink-50 font-bold text-lg md:text-xl italic mb-8 px-4 md:px-0 opacity-90">&quot;{circle.description || 'Hedefe birlikte koşuyoruz!'}&quot;</p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          {isMember ? (
                              <>
                                {isMentor && (
                                    <button onClick={() => router.push(`/circles/${slug}/settings`)} className="bg-white text-[#FF6F91] px-6 py-3 rounded-xl font-extrabold uppercase text-sm shadow-[0_4px_0_rgba(0,0,0,0.1)] flex items-center gap-2 hover:bg-pink-50 active:translate-y-1 active:shadow-none transition-all"><i className="fa-solid fa-gear"></i> Ayarlar</button>
                                )}
                                <button onClick={() => openModal('invite')} className="bg-pink-800 text-white border-2 border-white/20 px-6 py-3 rounded-xl font-extrabold uppercase text-sm hover:bg-pink-900 transition flex items-center gap-2"><i className="fa-solid fa-user-plus"></i> Üye Davet Et</button>
                              </>
                          ) : (
                              <button onClick={handleJoin} disabled={actionLoading} className="bg-green-500 text-white border-b-4 border-green-700 px-8 py-3 rounded-xl font-extrabold uppercase text-sm hover:bg-green-400 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 shadow-lg"><i className="fa-solid fa-right-to-bracket"></i> Circle'a Katıl</button>
                          )}
                      </div>
                  </div>
                  {/* Score */}
                  <div className="hidden md:block bg-white/10 px-8 py-4 rounded-2xl border border-white/20 backdrop-blur-md text-center min-w-[150px]">
                      <p className="text-xs font-bold text-pink-100 uppercase mb-1">Toplam Puan</p>
                      <div className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-md">{circle.total_score}</div>
                      <div className="text-xs font-bold text-green-300 mt-1 bg-black/20 rounded px-2 py-1 inline-block"><i className="fa-solid fa-arrow-trend-up"></i> Level 4</div>
                  </div>
              </div>
          </div>
      </div>

      <LayoutWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
            
            {/* SOL KOLON: TASKS & MEMBERS */}
            <div className="lg:col-span-8 space-y-8">
                {/* CIRCLE TASKS */}
                {tasksLoading ? (
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 font-bold mt-4">Görevler yükleniyor...</p>
                  </div>
                ) : circleTasks.length > 0 ? (
                  <div className="space-y-6">
                    {circleTasks.map((task) => (
                      <TaskCard key={task.id} task={task} type="circle" />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                    <i className="fa-solid fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500 font-bold">Henüz aktif görev yok</p>
                    <p className="text-sm text-gray-400 mt-2">Mentor yeni görevler ekleyebilir</p>
                  </div>
                )}

                {/* MEMBER LIST */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-[0_4px_0_rgba(229,231,235,0.8)]">
                    <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-100 flex justify-between items-center">
                        <h3 className="font-extrabold text-gray-700 uppercase text-sm">Üye Sıralaması</h3>
                        <div className="flex gap-2">
                            <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition">Bu Hafta</button>
                            <button className="text-xs font-bold text-gray-400 hover:bg-gray-100 px-3 py-1 rounded-lg transition">Genel</button>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {circle.members && circle.members.length > 0 ? (
                            circle.members.map((member: any, index: number) => (
                                <div key={member.id} className={`flex items-center px-6 py-4 transition ${currentUser && currentUser.id === member.id ? 'bg-green-50/50 border-l-4 border-green-500 pl-5' : 'hover:bg-gray-50'}`}>
                                    <span className={`font-black w-6 text-lg text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-700' : 'text-gray-300'}`}>{index + 1}</span>
                                    <div className="relative mr-4 ml-2">
                                        <img src={member.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${member.name}`} className={`w-12 h-12 rounded-2xl bg-gray-200 ${currentUser && currentUser.id === member.id ? 'border-2 border-green-500' : ''}`} alt={member.name} />
                                        {index === 0 && <i className="fa-solid fa-crown text-yellow-500 absolute -top-3 -right-2 text-xl drop-shadow-sm transform rotate-12"></i>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-extrabold ${currentUser && currentUser.id === member.id ? 'text-green-600' : 'text-gray-800'}`}>{currentUser && currentUser.id === member.id ? 'SEN' : member.name}</span>
                                            {member.id === circle.leader_id && <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase font-bold">Mentor</span>}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">0 Puan Katkı</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 font-bold">Henüz üye listesi yüklenemedi.</div>
                        )}
                    </div>
                    <button className="w-full py-3 text-center text-xs font-bold text-gray-400 hover:bg-gray-50 uppercase tracking-wide">Tüm Üyeleri Gör ({circle.member_count})</button>
                </div>
            </div>

            {/* SAĞ KOLON: CHAT & ACTIONS */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* CIRCLE CHAT */}
                <div className="bg-white rounded-3xl flex flex-col h-[600px] shadow-lg border-0 overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-extrabold text-gray-700 uppercase text-sm flex items-center gap-2"><i className="fa-regular fa-comments text-gray-400"></i> Circle Sohbeti</h3>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online</span>
                    </div>
                    
                    {/* Chat Messages Area - Scroll düzeltmesi için ref buraya eklendi */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-gray-50/50 relative flex flex-col custom-scrollbar">
                        {isMember ? (
                            <>
                                {circle.comment_status === 'closed' && !isMentor ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                                        <i className="fa-solid fa-comment-slash text-4xl text-gray-300 mb-2"></i>
                                        <p className="text-sm font-bold text-gray-500">Sohbet Mentor tarafından kapatıldı.</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 p-4 space-y-4">
                                        {chatMessages.length > 0 ? (
                                            chatMessages.map((msg: any) => {
                                                const isMe = msg.userId === currentUser?.id;
                                                return (
                                                    <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        <img src={msg.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${msg.user}`} className="w-8 h-8 rounded-xl bg-gray-200 shrink-0 self-end shadow-sm" alt={msg.user} />
                                                        <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            {!isMe && <span className="text-[10px] font-bold text-gray-400 ml-1 mb-0.5">{msg.user}</span>}
                                                            <div className={`p-3 text-xs font-bold shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm' : 'bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-bl-sm'} ${msg.pending ? 'opacity-70' : ''}`}>{msg.text}</div>
                                                            <span className="text-[9px] text-gray-400 mt-1 mx-1 font-medium">{new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                                                <i className="fa-regular fa-comments text-4xl mb-2"></i>
                                                <p className="text-xs font-bold">Henüz mesaj yok</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4 border-2 border-dashed border-gray-200"><i className="fa-solid fa-lock text-2xl"></i></div>
                                <h3 className="font-bold text-gray-700">Sohbet Kilitli</h3>
                                <p className="text-xs font-medium text-gray-400 mt-1 mb-6 max-w-[180px]">Sohbete katılmak için Circle'a üye olmalısın.</p>
                                <button onClick={handleJoin} disabled={actionLoading} className="bg-blue-500 text-white border-b-4 border-blue-700 px-6 py-2 rounded-xl font-extrabold uppercase text-xs hover:bg-blue-400 active:border-b-0 active:translate-y-1 transition-all">Hemen Katıl</button>
                            </div>
                        )}
                    </div>

                    {isMember && circle.comment_status !== 'closed' && (
                        <div className="p-3 bg-white border-t border-gray-100 sticky bottom-0 z-10">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Bir mesaj yaz..." className="w-full bg-gray-100 border-2 border-transparent focus:border-purple-200 focus:bg-white rounded-xl text-xs font-bold pl-4 pr-12 py-3 outline-none transition placeholder:text-gray-400" />
                                <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"><i className="fa-solid fa-paper-plane text-xs"></i></button>
                            </form>
                        </div>
                    )}
                    {isMember && circle.comment_status === 'closed' && (
                        <div className="p-4 bg-gray-100 text-center text-xs font-bold text-gray-500 border-t border-gray-200">
                            <i className="fa-solid fa-lock mr-1"></i> Sohbet kapalı
                        </div>
                    )}
                </div>

                {isMember && (
                    <button onClick={() => openModal('leave_confirm')} disabled={actionLoading} className="w-full border-2 border-red-100 text-red-400 py-4 rounded-2xl font-extrabold uppercase text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition flex items-center justify-center gap-2 group"><i className="fa-solid fa-arrow-right-from-bracket group-hover:scale-110 transition-transform"></i> Circle'dan Ayrıl</button>
                )}
            </div>
        </div>
      </LayoutWrapper>

      {/* SETTINGS MODAL - Note: This is deprecated, now using separate settings page */}
      <Modal isOpen={activeModal === 'settings'} onClose={closeModal} title="Circle Ayarları" footer={<button onClick={handleSaveSettings} disabled={actionLoading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-extrabold uppercase shadow-btn shadow-purple-200 hover:bg-purple-700 hover:shadow-lg active:translate-y-1 active:shadow-none transition-all">{actionLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</button>}>
          <form className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Circle Adı</label><input type="text" value={settingsData.name} onChange={(e) => setSettingsData({...settingsData, name: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 font-bold focus:border-purple-500 outline-none transition" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label><textarea rows={3} value={settingsData.description} onChange={(e) => setSettingsData({...settingsData, description: e.target.value})} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 font-bold focus:border-purple-500 outline-none transition resize-none" /></div>
              
              {/* Sohbet Durumu */}
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sohbet Durumu</label>
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setSettingsData({...settingsData, comment_status: 'open'})} className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition ${settingsData.comment_status === 'open' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>Açık</button>
                      <button type="button" onClick={() => setSettingsData({...settingsData, comment_status: 'closed'})} className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition ${settingsData.comment_status === 'closed' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}>Kapalı</button>
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo Seçimi</label>
                  <div className="grid grid-cols-4 gap-2">
                      {CIRCLE_AVATARS.map((url, idx) => (
                          <div key={idx} onClick={() => setSettingsData({...settingsData, logo: url})} className={`aspect-square rounded-xl cursor-pointer border-2 overflow-hidden relative ${settingsData.logo === url ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent hover:border-gray-200'}`}><img src={url} className="w-full h-full object-cover" alt="Logo option" />{settingsData.logo === url && (<div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center"><i className="fa-solid fa-check text-white drop-shadow-md"></i></div>)}</div>
                      ))}
                  </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gizlilik</label>
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setSettingsData({...settingsData, privacy: 'public'})} className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition ${settingsData.privacy === 'public' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>Herkese Açık</button>
                      <button type="button" onClick={() => setSettingsData({...settingsData, privacy: 'invite_only'})} className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition ${settingsData.privacy === 'invite_only' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-400'}`}>Sadece Davetle</button>
                  </div>
              </div>
          </form>
      </Modal>

      {/* INVITE MODAL */}
      <Modal isOpen={activeModal === 'invite'} onClose={closeModal} title="Arkadaşlarını Davet Et">
          <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500"><i className="fa-solid fa-envelope-open-text text-3xl"></i></div>
              <p className="text-gray-500 text-sm font-bold mb-6">Bu linki paylaşarak arkadaşlarını Circle'ına katılmaya davet edebilirsin.</p>
              <div className="bg-gray-100 p-3 rounded-xl flex items-center gap-2 mb-6 border-2 border-gray-200"><input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="bg-transparent w-full text-xs font-bold text-gray-600 outline-none" /></div>
              <button onClick={copyInviteLink} className="w-full bg-pink-500 text-white py-3 rounded-xl font-extrabold uppercase shadow-btn shadow-pink-200 hover:bg-pink-600 hover:shadow-lg active:translate-y-1 active:shadow-none transition-all"><i className="fa-regular fa-copy mr-2"></i> Linki Kopyala</button>
          </div>
      </Modal>

      {/* LEAVE CONFIRM MODAL */}
      <Modal isOpen={activeModal === 'leave_confirm'} onClose={closeModal} title="Ayrılmak İstediğine Emin misin?" footer={<div className="flex gap-3"><button onClick={closeModal} className="flex-1 py-3 rounded-xl font-extrabold text-gray-500 hover:bg-gray-100 transition">İptal</button><button onClick={confirmLeave} disabled={actionLoading} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-extrabold hover:bg-red-600 transition shadow-lg shadow-red-200">Evet, Ayrıl</button></div>}>
          <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><i className="fa-solid fa-heart-crack text-3xl"></i></div>
              <p className="text-gray-500 font-medium">Circle'dan ayrılırsan sohbet geçmişine erişemeyecek ve Circle puanına katkıda bulunamayacaksın.</p>
          </div>
      </Modal>

      {/* GENERIC MESSAGE MODAL */}
      <Modal isOpen={activeModal === 'message'} onClose={closeModal} title={modalMessage.title} footer={<button onClick={closeModal} className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold hover:bg-gray-200 transition">Tamam</button>}>
          <div className="text-center py-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${modalMessage.type === 'success' ? 'bg-green-100 text-green-500' : modalMessage.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}><i className={`fa-solid ${modalMessage.type === 'success' ? 'fa-check' : modalMessage.type === 'error' ? 'fa-circle-exclamation' : 'fa-info'} text-xl`}></i></div>
              <p className="text-gray-600 font-bold">{modalMessage.text}</p>
          </div>
      </Modal>
    </div>
  );
}