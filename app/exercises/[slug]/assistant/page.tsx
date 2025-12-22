"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getExercisePlanBySlug, createComment, getMe } from "@/lib/api"; // createComment ve getMe eklendi

interface Exercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    rest: string; 
    notes: string;
    videoUrl?: string; 
    image?: string;
}

export default function AssistantPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { slug } = use(params);
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null); // Mevcut kullanıcı
    
    // Asistan State
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false); // Antrenman bitti mi?

    // Yorum State
    const [comment, setComment] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentSent, setCommentSent] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [data, user] = await Promise.all([
                    getExercisePlanBySlug(slug),
                    getMe()
                ]);

                if (data) {
                    setPlan(data);
                    const firstDay = data.plan_data?.[0];
                    if (firstDay && firstDay.exercises) {
                        const exList = Array.isArray(firstDay.exercises) ? firstDay.exercises : Object.values(firstDay.exercises);
                        setExercises(exList as Exercise[]);
                    }
                }
                setCurrentUser(user);
            } catch (error) {
                console.error("Yükleme hatası:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [slug]);

    const currentExercise = exercises[currentIndex];
    const totalSets = currentExercise ? (parseInt(currentExercise.sets) || 1) : 1;

    // Sesli Komut Fonksiyonu
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = 1.0; 
            window.speechSynthesis.speak(utterance);
        }
    };

    // Durum Değişikliğinde Konuş
    useEffect(() => {
        if (!currentExercise || isFinished) return;
        
        if (isResting) {
            speak(`${timeLeft} saniye dinlenme.`);
        } else {
            if (currentSet === 1) {
                speak(`Sıradaki hareket: ${currentExercise.name}. ${totalSets} set, ${currentExercise.reps} tekrar. İlk set için hazırlan.`);
            } else {
                speak(`${currentSet}. set başlıyor. Hazır ol.`);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, currentSet, isResting, currentExercise, isFinished]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isResting && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
        } else if (isResting && timeLeft === 0) {
            setIsResting(false);
            if (currentSet < totalSets) {
                setCurrentSet(p => p + 1);
            } else {
                if (currentIndex < exercises.length - 1) {
                    setCurrentIndex(p => p + 1);
                    setCurrentSet(1);
                } else {
                    setIsFinished(true); // Antrenman bitti
                    speak("Antrenman tamamlandı! Harika iş çıkardın.");
                }
            }
        }
        return () => clearInterval(interval);
    }, [isResting, timeLeft, currentSet, totalSets, currentIndex, exercises.length]);

    const handleNext = () => {
        const rest = parseInt(currentExercise.rest) || 30;
        setTimeLeft(rest);
        setIsResting(true);
    };

    const handleSkipRest = () => setTimeLeft(0);
    const handleClose = () => router.back();

    // Uzman Onayı İşlemi
    const handleApprove = async () => {
        if (!currentUser) return;
        
        try {
             // Token'ı localStorage'dan alıyoruz
             const token = localStorage.getItem('jwt_token');
             const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json'}/rejimde/v1/exercises/approve/${plan.id}`, {
                 method: 'POST',
                 headers: { 
                     'Authorization': `Bearer ${token}`,
                     'Content-Type': 'application/json' 
                 }
             });
             const json = await res.json();
             
             if (json.status === 'success') {
                 alert("Egzersiz başarıyla onaylandı!");
                 setPlan({ ...plan, meta: { ...plan.meta, is_verified: true } });
             } else {
                 // Hata mesajını göster (Backend permission hatası burada yakalanır)
                 alert("Hata: " + (json.message || "Onaylama işlemi başarısız. Yetkiniz olmayabilir."));
             }
        } catch (e) {
            alert("Bir bağlantı hatası oluştu.");
        }
    };

    // Yorum Gönderme
    const handleSubmitComment = async () => {
        if (!comment.trim()) return;
        setIsSubmittingComment(true);
        try {
            const res = await createComment(plan.id, comment);
            if (res.success) {
                setCommentSent(true);
                setComment("");
            } else {
                alert("Yorum gönderilemedi: " + res.message);
            }
        } catch (e) {
            alert("Yorum gönderilirken hata oluştu.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><i className="fa-solid fa-circle-notch animate-spin text-4xl"></i></div>;
    if (!currentExercise && !isFinished) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Egzersiz bulunamadı.</div>;

    // YouTube Embed Helper
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1&controls=0&loop=1` : url;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 text-white flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded">Asistan</span>
                    {!isFinished && (
                        <span className="text-sm font-bold opacity-70">
                            {currentIndex + 1} / {exercises.length} • Set {currentSet} / {totalSets}
                        </span>
                    )}
                </div>
                <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-red-500/80 transition">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* İçerik */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-y-auto custom-scrollbar">
            

                {/* Arkaplan Blur */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    {currentExercise?.image && (
                         /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={currentExercise.image} className="w-full h-full object-cover blur-xl" alt="bg" />
                    )}
                </div>

                <div className="relative z-10 w-full max-w-md">
                    
                    {isFinished ? (
                        /* BİTİŞ EKRANI */
                        <div className="animate-in zoom-in duration-500 text-center">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-5xl mb-6 mx-auto shadow-lg shadow-green-500/50">
                                <i className="fa-solid fa-trophy"></i>
                            </div>
                            <h2 className="text-3xl font-black mb-2">Harika İş!</h2>
                            <p className="text-gray-400 mb-8">Antrenmanı başarıyla tamamladın.</p>
                            
                            {/* Yorum Alanı */}
                            <div className="bg-white/10 p-6 rounded-3xl border border-white/10 mb-6 text-left">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <i className="fa-regular fa-comment-dots"></i> Deneyimini Paylaş
                                </h3>
                                {commentSent ? (
                                    <div className="bg-green-500/20 text-green-300 p-4 rounded-xl text-center font-bold">
                                        <i className="fa-solid fa-check-circle mr-2"></i> Yorumun gönderildi!
                                    </div>
                                ) : (
                                    <>
                                        <textarea 
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Bu antrenman nasıldı? Zorlandın mı?" 
                                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-sm text-white placeholder-gray-500 outline-none h-24 resize-none mb-4 focus:border-blue-500 transition"
                                        ></textarea>
                                        <button 
                                            onClick={handleSubmitComment}
                                            disabled={isSubmittingComment}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
                                        >
                                            {isSubmittingComment ? 'Gönderiliyor...' : 'Yorum Gönder'}
                                        </button>
                                    </>
                                )}
                            </div>

                            <button onClick={handleClose} className="text-gray-400 hover:text-white text-sm font-bold underline">
                                Egzersiz Sayfasına Dön
                            </button>
                        </div>
                    ) : isResting ? (
                        /* DİNLENME EKRANI */
                        <div className="animate-in zoom-in duration-300">
                            <p className="text-blue-400 font-black text-xl mb-4 uppercase tracking-widest">Dinlenme</p>
                            <div className="text-[120px] font-black leading-none mb-8 font-mono tabular-nums">{timeLeft}</div>
                            <p className="text-gray-400 text-sm mb-8">
                                {currentSet < totalSets 
                                    ? `Sonraki: ${currentExercise.name} (${currentSet + 1}. Set)` 
                                    : `Sonraki: ${exercises[currentIndex + 1]?.name || 'Bitiş'}`
                                }
                            </p>
                            <button onClick={handleSkipRest} className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-bold transition w-full">
                                Dinlenmeyi Atla
                            </button>
                        </div>
                    ) : (
                        /* EGZERSİZ EKRANI */
                        <div className="animate-in slide-in-from-right duration-500">
                            <div className="w-full aspect-video bg-black/50 rounded-3xl mb-6 overflow-hidden border-2 border-white/10 shadow-2xl relative">
                                {currentExercise.videoUrl ? (
                                    <iframe 
                                        src={getEmbedUrl(currentExercise.videoUrl)} 
                                        className="w-full h-full pointer-events-none" 
                                        allow="autoplay; encrypted-media"
                                    ></iframe>
                                ) : currentExercise.image ? (
                                     /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={currentExercise.image} alt={currentExercise.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <i className="fa-solid fa-dumbbell text-6xl opacity-20"></i>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-3xl font-black mb-1">{currentExercise.name}</h2>
                            <p className="text-white/60 text-sm mb-6 font-medium">Set {currentSet} / {totalSets}</p>

                            <div className="flex justify-center gap-4 mb-8">
                                <div className="bg-blue-600 px-6 py-3 rounded-2xl">
                                    <span className="text-3xl font-black block">{currentExercise.reps}</span>
                                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Tekrar</span>
                                </div>
                            </div>

                            <button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white w-full py-5 rounded-3xl font-black text-xl shadow-lg shadow-green-500/30 transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                                <i className="fa-solid fa-check"></i> 
                                {currentSet < totalSets ? 'Seti Tamamla' : (currentIndex < exercises.length - 1 ? 'Hareketi Bitir' : 'Antrenmanı Bitir')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}