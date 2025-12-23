"use client";

import { useState, useEffect } from 'react';
import { fetchExpertReviews, approveComment, rejectComment, spamComment, CommentData } from '@/lib/comment-service';

// --- MODAL ---
const AlertModal = ({ isOpen, title, message, type, onConfirm, onCancel, confirmText = "Evet", cancelText = "Vazgeç" }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`absolute top-0 left-0 w-full h-2 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'success' ? 'bg-green-100 text-green-600' : type === 'error' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    <i className={`fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'} text-3xl`}></i>
                </div>
                <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-6 font-bold leading-relaxed">{message}</p>
                <div className="flex gap-2">
                    {onCancel && (
                        <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition">
                            {cancelText}
                        </button>
                    )}
                    <button onClick={onConfirm} className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition shadow-lg text-white ${type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ExpertReviewsPage() {
    const [comments, setComments] = useState<CommentData[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    
    const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, type: string, onConfirm?: () => void, onCancel?: () => void }>({ isOpen: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchExpertReviews();
            if (data && data.comments) {
                setComments(data.comments);
                setStats(data.stats || null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const confirmAction = (title: string, message: string, action: () => Promise<void>, type: 'success' | 'error' = 'success') => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: async () => {
                await action();
                setModal(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleApprove = (id: number) => {
        confirmAction("Onaylıyor musun?", "Bu yorumu yayınlamak istediğine emin misin?", async () => {
            try {
                await approveComment(id);
                setComments(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
            } catch (e) { alert("Hata oluştu."); }
        }, 'success');
    };

    const handleReject = (id: number) => {
        confirmAction("Reddediyor musun?", "Bu yorum silinecek (çöpe taşınacak). Emin misin?", async () => {
            try {
                await rejectComment(id);
                setComments(prev => prev.filter(c => c.id !== id)); // Listeden kaldır
            } catch (e) { alert("Hata oluştu."); }
        }, 'error');
    };

    const handleSpam = (id: number) => {
        confirmAction("Spam Bildir", "Bu yorumu spam olarak işaretlemek istiyor musun?", async () => {
            try {
                await spamComment(id);
                setComments(prev => prev.filter(c => c.id !== id)); // Listeden kaldır
            } catch (e) { alert("Hata oluştu."); }
        }, 'error');
    };

    const filteredComments = comments.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    const pendingCount = comments.filter(c => c.status === 'pending').length;

    return (
        <div className="p-6 md:p-10 space-y-8 bg-gray-50 min-h-screen">
            <AlertModal {...modal} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} />

            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* HEADER & STATS */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 mb-2">Değerlendirmeler</h1>
                        <p className="text-gray-500 font-bold text-sm">Profilinize gelen yorumları buradan yönetebilirsiniz.</p>
                    </div>
                    
                    {stats && (
                        <div className="flex gap-6">
                            <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-3xl font-black text-gray-800">{stats.average}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Puan</div>
                            </div>
                            <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-3xl font-black text-gray-800">{stats.total}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Yorum</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FILTER TABS */}
                <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm ${filter === 'all' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>Tümü</button>
                    <button onClick={() => setFilter('pending')} className={`px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 ${filter === 'pending' ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                        Onay Bekleyen
                        {pendingCount > 0 && <span className="bg-white text-orange-500 text-[10px] px-1.5 py-0.5 rounded font-black">{pendingCount}</span>}
                    </button>
                    <button onClick={() => setFilter('approved')} className={`px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm ${filter === 'approved' ? 'bg-green-600 text-white shadow-green-200' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>Yayında</button>
                </div>

                {/* REVIEWS LIST */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 font-bold">Yükleniyor...</div>
                    ) : filteredComments.length > 0 ? (
                        filteredComments.map(comment => (
                            <div key={comment.id} className={`bg-white rounded-[2rem] p-6 border-2 transition relative overflow-hidden group ${comment.status === 'pending' ? 'border-orange-200 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}>
                                {comment.status === 'pending' && (
                                    <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                        Onay Bekliyor
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={comment.author.avatar} alt={comment.author.name} className="w-12 h-12 rounded-xl bg-gray-100 object-cover border border-gray-100"/>
                                        <div>
                                            <h3 className="font-extrabold text-gray-800 text-sm">{comment.author.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {comment.rating && (
                                                    <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`fa-star ${i < (comment.rating || 0) ? 'fa-solid' : 'fa-regular text-gray-200'}`}></i>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="text-xs font-bold text-gray-400">• {comment.timeAgo}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AKSİYON BUTONLARI */}
                                    <div className="flex gap-2">
                                        {comment.status === 'pending' && (
                                            <button onClick={() => handleApprove(comment.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-green-100 transition flex items-center gap-1">
                                                <i className="fa-solid fa-check"></i> Onayla
                                            </button>
                                        )}
                                        <button onClick={() => handleReject(comment.id)} className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1">
                                            <i className="fa-solid fa-trash"></i> Reddet
                                        </button>
                                        <button onClick={() => handleSpam(comment.id)} className="text-gray-400 hover:text-orange-500 px-2 transition" title="Spam Bildir">
                                            <i className="fa-solid fa-flag"></i>
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 font-bold text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">{comment.content}</p>

                                {/* Nested Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-3">
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className="text-xs relative group/reply">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-indigo-900">{reply.author.name}</span>
                                                    {reply.status === 'pending' && (
                                                        <div className="flex gap-2 ml-auto opacity-0 group-hover/reply:opacity-100 transition">
                                                            <button onClick={() => handleApprove(reply.id)} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold hover:bg-green-200">Onayla</button>
                                                            <button onClick={() => handleReject(reply.id)} className="text-[10px] text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 font-medium">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                            <i className="fa-regular fa-comment-dots text-4xl text-gray-200 mb-4 block"></i>
                            <p className="text-gray-400 font-bold">
                                {filter === 'pending' ? 'Onay bekleyen yorum yok.' : 'Henüz değerlendirme yapılmamış veya profilinize ait veri bulunamadı.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}