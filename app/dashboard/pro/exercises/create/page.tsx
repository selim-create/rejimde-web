"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createExercisePlan, uploadMedia } from "@/lib/api";

// --- TİPLER ---

interface Exercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    rest: string; // Dinlenme süresi
    notes: string;
    videoUrl?: string; // Opsiyonel video linki
    image?: string;    // Opsiyonel görsel URL
    imageId?: number;  // Opsiyonel görsel ID
    tags: string[];
    // UI States
    isSmartMode?: boolean;
    smartText?: string;
    tagInput?: string;
    isUploading?: boolean; // Görsel yükleniyor mu?
}

interface DayPlan {
    id: string;
    dayNumber: number;
    exercises: Exercise[];
}

// --- SABİTLER ---

const EXERCISE_CATEGORIES = [
    "Kardiyo", "Güç Antrenmanı", "HIIT", "Yoga", 
    "Pilates", "CrossFit", "Vücut Ağırlığı", 
    "Esneklik", "Rehabilitasyon", "Başlangıç Seviyesi"
];

const QUICK_TAGS = ['Dambıl', 'Makine', 'Vücut Ağırlığı', 'Direnç Bandı', 'Evde', 'Spor Salonu'];

// --- MODAL BİLEŞENİ ---
const Modal = ({ isOpen, title, message, type, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void, onCancel?: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'success' ? 'bg-green-100 text-green-600' : type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <i className={`fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-xmark' : 'fa-question'} text-xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    {type === 'confirm' ? (
                        <>
                            <button onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition">Vazgeç</button>
                            <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition">Onayla</button>
                        </>
                    ) : (
                        <button onClick={onConfirm || onCancel} className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition">Tamam</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function CreateExercisePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Modal State
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void, onCancel?: () => void }>({
      isOpen: false, title: '', message: '', type: 'success'
  });

  // Meta
  const [difficulty, setDifficulty] = useState("medium");
  const [caloriesBurn, setCaloriesBurn] = useState("");
  const [duration, setDuration] = useState("30"); 
  const [scoreReward, setScoreReward] = useState("50");
  
  // Kategori & Etiket
  const [selectedCategory, setSelectedCategory] = useState("Güç Antrenmanı");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Plan Data
  const [days, setDays] = useState<DayPlan[]>([
      { id: '1', dayNumber: 1, exercises: [{ id: 'e1', name: '', sets: '3', reps: '12', rest: '60', notes: '', tags: [] }] }
  ]);

  // Ekipman Listesi
  const [equipmentList, setEquipmentList] = useState<string[]>([""]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");

  // Medya (Kapak)
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // --- HELPER: Modal Göster ---
  const showModal = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => {
      setModal({ 
          isOpen: true, title, message, type, 
          onConfirm: () => { if(onConfirm) onConfirm(); setModal(prev => ({ ...prev, isOpen: false })); },
          onCancel: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
  };

  // SEO Otomatik Doldurma
  useEffect(() => {
    if (!seoTitle || seoTitle === title.slice(0, -1)) setSeoTitle(title);
  }, [title]);

  useEffect(() => {
    if (!seoDesc || seoDesc === description.slice(0, -1)) setSeoDesc(description.slice(0, 160));
  }, [description]);


  // --- PLAN YÖNETİMİ ---

  const addDay = () => {
      setDays(prev => [...prev, { 
          id: Date.now().toString(), 
          dayNumber: prev.length + 1, 
          exercises: [{ id: `e${Date.now()}`, name: '', sets: '3', reps: '10', rest: '45', notes: '', tags: [] }] 
      }]);
  };

  const removeDay = (dayIndex: number) => {
      if (days.length <= 1) return;
      showModal("Günü Sil", "Bu günü silmek istediğinize emin misiniz?", "confirm", () => {
          const newDays = days.filter((_, idx) => idx !== dayIndex);
          const reorderedDays = newDays.map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
          setDays(reorderedDays);
      });
  };

  const addExercise = (dayIndex: number) => {
      const newDays = [...days];
      newDays[dayIndex].exercises.push({ 
          id: `e${Date.now()}`, name: '', sets: '3', reps: '10', rest: '45', notes: '', tags: [] 
      });
      setDays(newDays);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
      const newDays = [...days];
      newDays[dayIndex].exercises[exerciseIndex] = { ...newDays[dayIndex].exercises[exerciseIndex], [field]: value };
      setDays(newDays);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
      const newDays = [...days];
      newDays[dayIndex].exercises.splice(exerciseIndex, 1);
      setDays(newDays);
  };

  // --- EGZERSİZ GÖRSEL YÜKLEME ---
  const handleExerciseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, dayIndex: number, exerciseIndex: number) => {
    if (e.target.files && e.target.files[0]) {
        // Loading state
        updateExercise(dayIndex, exerciseIndex, 'isUploading', true);
        
        try {
            const res = await uploadMedia(e.target.files[0]);
            if (res.success && res.url) {
                const newDays = [...days];
                newDays[dayIndex].exercises[exerciseIndex].image = res.url;
                newDays[dayIndex].exercises[exerciseIndex].imageId = res.id;
                newDays[dayIndex].exercises[exerciseIndex].isUploading = false;
                setDays(newDays);
            } else {
                alert("Görsel yüklenemedi.");
                updateExercise(dayIndex, exerciseIndex, 'isUploading', false);
            }
        } catch (err) {
            alert("Bağlantı hatası.");
            updateExercise(dayIndex, exerciseIndex, 'isUploading', false);
        }
    }
  };

  // --- EGZERSİZ ETİKETLERİ ---

  const toggleExerciseTag = (dayIndex: number, exerciseIndex: number, tag: string) => {
      const newDays = [...days];
      const currentTags = newDays[dayIndex].exercises[exerciseIndex].tags || [];
      if (currentTags.includes(tag)) {
          newDays[dayIndex].exercises[exerciseIndex].tags = currentTags.filter(t => t !== tag);
      } else {
          newDays[dayIndex].exercises[exerciseIndex].tags = [...currentTags, tag];
      }
      setDays(newDays);
  };

  // --- AKILLI EGZERSİZ SİHİRBAZI ---
  
  const applySmartExercise = (dayIndex: number, exerciseIndex: number) => {
      const newDays = [...days];
      const exercise = newDays[dayIndex].exercises[exerciseIndex];
      const text = exercise.smartText || "";
      
      if (!text.trim()) return;

      const lines = text.split('\n');
      if (lines.length > 0) {
          if(!exercise.name) {
              exercise.name = lines[0];
              if(lines.length > 1) exercise.notes = lines.slice(1).join('\n');
          } else {
              exercise.notes = (exercise.notes ? exercise.notes + "\n" : "") + text;
          }
      }

      exercise.smartText = "";
      exercise.isSmartMode = false;
      setDays(newDays);
  };

  // --- GENEL ETİKETLER ---

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- EKİPMAN LİSTESİ ---

  const updateEquipmentItem = (index: number, value: string) => {
      const newList = [...equipmentList];
      newList[index] = value;
      setEquipmentList(newList);
  };
  const addEquipmentItem = () => setEquipmentList([...equipmentList, ""]);
  const removeEquipmentItem = (index: number) => setEquipmentList(equipmentList.filter((_, i) => i !== index));

  // --- MEDYA ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const res = await uploadMedia(e.target.files[0]);
        if (res.success && res.url) {
            setFeaturedImage(res.url);
            setFeaturedImageId(res.id || 0);
        } else {
            showModal("Hata", "Görsel yüklenirken hata oluştu: " + res.message, "error");
        }
      } catch (err) {
        showModal("Hata", "Bağlantı hatası oluştu.", "error");
      }
      setIsUploading(false);
    }
  };

  // --- YAYINLA ---

  const handlePublish = async () => {
      if (!title) return showModal("Eksik Bilgi", "Lütfen bir plan başlığı giriniz.", "error");
      if (featuredImageId === 0) return showModal("Eksik Bilgi", "Lütfen bir kapak görseli yükleyiniz.", "error");

      setLoading(true);

      const planData = {
          title,
          content: description,
          status: 'publish',
          featured_media_id: featuredImageId,
          plan_data: days, 
          tags: tags,
          meta: {
              type: 'exercise_plan',
              difficulty,
              duration,
              calories: caloriesBurn,
              score_reward: scoreReward,
              exercise_category: selectedCategory,
              equipment_list: equipmentList.filter(i => i.trim() !== ""),
              tags: tags,
              rank_math_title: seoTitle || title,
              rank_math_description: seoDesc || description,
              rank_math_focus_keyword: focusKeyword // Yeni alan eklendi
          }
      };

      try {
        const res = await createExercisePlan(planData);
        
        if (res.success) {
            showModal("Başarılı", "Egzersiz planı başarıyla yayınlandı! 🎉", "success", () => {
                if (res.data && res.data.slug) router.push("/exercises/" + res.data.slug);
            });
        } else {
            showModal("Hata", res.message || "Bir hata oluştu", "error");
        }
      } catch (err) {
        showModal("Hata", "Bir hata oluştu. Lütfen tekrar deneyiniz.", "error");
        console.error(err);
      }
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-gray-800">
        
        <Modal {...modal} />

        {/* Üst Bar */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-40 flex items-center justify-between shadow-sm/50 backdrop-blur-md bg-white/90">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/pro" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <div>
                    <h1 className="text-lg font-black text-gray-800 leading-tight">Egzersiz Planı Oluştur</h1>
                    <p className="text-xs text-gray-400 font-medium hidden md:block">Profesyonel Antrenör Editörü</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Durum</span>
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Taslak</span>
                 </div>
                <button 
                    onClick={handlePublish} 
                    disabled={loading} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 text-sm flex items-center gap-2 transition disabled:opacity-70"
                >
                    {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-dumbbell"></i>}
                    <span>Yayınla</span>
                </button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SOL KOLON: Plan Editörü */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Temel Bilgiler */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Başlığı</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Örn: 4 Haftalık Evde Karın Kası Programı" 
                            className="w-full text-3xl font-black text-gray-800 placeholder-gray-300 outline-none bg-transparent" 
                        />
                    </div>
                    
                    <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Program Açıklaması</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Bu program kimler için uygun? Hangi bölgeleri çalıştırır? Hedeflenen sonuç nedir?" 
                            className="w-full h-24 resize-none text-sm font-medium text-gray-600 outline-none placeholder-gray-300 bg-gray-50/50 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                        ></textarea>
                    </div>
                </div>

                {/* 2. Günler Döngüsü */}
                <div className="space-y-6">
                    {days.map((day, dIndex) => (
                        <div key={day.id} className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition duration-300 relative group/day">
                            
                            {/* Gün Başlığı */}
                            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-blue-200">
                                        {day.dayNumber}
                                    </div>
                                    <h3 className="font-extrabold text-gray-800 text-lg">. Gün Antrenmanı</h3>
                                </div>
                                <button 
                                    onClick={() => removeDay(dIndex)} 
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition opacity-0 group-hover/day:opacity-100"
                                    title="Günü Sil"
                                >
                                    <i className="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </div>
                            
                            {/* Egzersizler Listesi */}
                            <div className="p-6 space-y-6 bg-slate-50/30">
                                {day.exercises.map((exercise, eIndex) => (
                                    <div key={exercise.id} className="relative group/exercise pl-0 md:pl-4 transition-all duration-300">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full group-hover/exercise:bg-blue-500 transition-colors hidden md:block"></div>

                                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                                            
                                            {/* Egzersiz Header */}
                                            <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
                                                <div className="flex-1 w-full">
                                                    <input 
                                                        type="text" 
                                                        value={exercise.name} 
                                                        onChange={(e) => updateExercise(dIndex, eIndex, 'name', e.target.value)} 
                                                        className="w-full bg-transparent font-bold text-gray-800 text-lg border-b-2 border-transparent focus:border-gray-200 outline-none py-1 transition placeholder-gray-300" 
                                                        placeholder="Hareket Adı (Örn: Push Up)" 
                                                    />
                                                </div>
                                                
                                                {/* Set/Tekrar/Dinlenme */}
                                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Set</span>
                                                        <input type="number" value={exercise.sets} onChange={(e) => updateExercise(dIndex, eIndex, 'sets', e.target.value)} className="w-8 bg-transparent text-sm font-bold text-center outline-none" />
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Tk</span>
                                                        <input type="text" value={exercise.reps} onChange={(e) => updateExercise(dIndex, eIndex, 'reps', e.target.value)} className="w-8 bg-transparent text-sm font-bold text-center outline-none" />
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                                        <i className="fa-regular fa-clock text-xs text-gray-400"></i>
                                                        <input type="number" value={exercise.rest} onChange={(e) => updateExercise(dIndex, eIndex, 'rest', e.target.value)} className="w-8 bg-transparent text-sm font-bold text-center outline-none" />
                                                        <span className="text-[10px] font-bold text-gray-400">sn</span>
                                                    </div>
                                                </div>

                                                <button onClick={() => removeExercise(dIndex, eIndex)} className="text-gray-300 hover:text-red-500 transition px-2"><i className="fa-solid fa-xmark"></i></button>
                                            </div>

                                            {/* Notlar, Video ve Görsel */}
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <div className="relative">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Notlar / Açıklama</label>
                                                    <textarea 
                                                        value={exercise.notes} 
                                                        onChange={(e) => updateExercise(dIndex, eIndex, 'notes', e.target.value)} 
                                                        className="w-full text-sm text-gray-600 outline-none resize-none h-24 bg-gray-50/50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder-gray-300" 
                                                        placeholder="Hareketin formu, püf noktaları..."
                                                    ></textarea>
                                                </div>
                                                <div className="space-y-3">
                                                    
                                                    {/* Video Linki */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Video Linki</label>
                                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                                            <i className="fa-brands fa-youtube text-red-500"></i>
                                                            <input 
                                                                type="text" 
                                                                value={exercise.videoUrl || ''} 
                                                                onChange={(e) => updateExercise(dIndex, eIndex, 'videoUrl', e.target.value)} 
                                                                className="w-full bg-transparent text-sm font-medium outline-none placeholder-gray-400" 
                                                                placeholder="https://youtube.com/..." 
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Görsel Yükleme (Video Yoksa veya Alternatif) */}
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Hareket Görseli (Opsiyonel)</label>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 relative">
                                                                <input 
                                                                    type="file" 
                                                                    id={`exercise-img-${day.id}-${exercise.id}`}
                                                                    className="hidden" 
                                                                    onChange={(e) => handleExerciseImageUpload(e, dIndex, eIndex)}
                                                                />
                                                                <label 
                                                                    htmlFor={`exercise-img-${day.id}-${exercise.id}`}
                                                                    className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border-2 border-dashed cursor-pointer transition ${exercise.image ? 'border-green-300 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-400 hover:border-blue-300 hover:text-blue-500'}`}
                                                                >
                                                                    {exercise.isUploading ? (
                                                                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                                                                    ) : exercise.image ? (
                                                                        <>
                                                                            <i className="fa-solid fa-check"></i> 
                                                                            <span className="text-xs font-bold">Görsel Yüklendi</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fa-regular fa-image"></i> 
                                                                            <span className="text-xs font-bold">Görsel Seç</span>
                                                                        </>
                                                                    )}
                                                                </label>
                                                            </div>
                                                            {exercise.image && (
                                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                                <img src={exercise.image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button 
                                                        onClick={() => updateExercise(dIndex, eIndex, 'isSmartMode', !exercise.isSmartMode)}
                                                        className={`w-full text-[10px] font-bold px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-2 border ${exercise.isSmartMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}
                                                    >
                                                        <i className="fa-solid fa-wand-magic-sparkles"></i> 
                                                        {exercise.isSmartMode ? 'Sihirbazı Kapat' : 'Akıllı Sihirbaz'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Smart Mode Panel */}
                                            {exercise.isSmartMode && (
                                                <div className="mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in zoom-in-95">
                                                    <p className="text-xs text-indigo-800 mb-2 font-bold">Hızlı Giriş:</p>
                                                    <textarea 
                                                        value={exercise.smartText || ''} 
                                                        onChange={(e) => updateExercise(dIndex, eIndex, 'smartText', e.target.value)}
                                                        className="w-full h-20 bg-white border border-indigo-200 rounded-lg p-2 text-sm outline-none mb-2"
                                                        placeholder="Squat 4 set 12 tekrar 60sn dinlenme&#10;Forma dikkat et"
                                                    ></textarea>
                                                    <button onClick={() => applySmartExercise(dIndex, eIndex)} className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Uygula</button>
                                                </div>
                                            )}
                                            
                                            {/* Etiketler */}
                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                                {QUICK_TAGS.map(tag => (
                                                    <button 
                                                        key={tag} 
                                                        onClick={() => toggleExerciseTag(dIndex, eIndex, tag)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition ${exercise.tags?.includes(tag) ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>

                                        </div>
                                    </div>
                                ))}

                                {/* Yeni Hareket Ekle */}
                                <div className="pl-0 md:pl-4">
                                    <button 
                                        onClick={() => addExercise(dIndex)} 
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-bold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 group"
                                    >
                                        <span className="bg-gray-100 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition shadow-sm">
                                            <i className="fa-solid fa-plus text-sm"></i>
                                        </span>
                                        Bu Güne Hareket Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={addDay} 
                        className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-[2rem] font-bold shadow-xl shadow-gray-200 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    >
                        <i className="fa-solid fa-calendar-plus text-xl text-gray-400"></i>
                        Yeni Gün Ekle
                    </button>
                </div>

            </div>

            {/* SAĞ KOLON: Ayarlar */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Kapak Görseli */}
                <div 
                    className="bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-[2rem] p-4 text-center cursor-pointer group relative overflow-hidden transition-colors aspect-video flex flex-col items-center justify-center" 
                    onClick={() => fileInputRef.current?.click()}
                >
                    {featuredImage ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={featuredImage} className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-bold text-sm"><i className="fa-solid fa-pen"></i> Değiştir</span>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            {isUploading ? (
                                <i className="fa-solid fa-circle-notch animate-spin text-3xl text-blue-500"></i>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <i className="fa-regular fa-image text-2xl"></i>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-600">Kapak Görseli</p>
                                        <p className="text-xs text-gray-400">Tıkla veya sürükle</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                </div>

                {/* Detaylar */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm space-y-5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Program Detayları</h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Kategori</label>
                        <div className="relative">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer appearance-none hover:bg-gray-100 transition">
                                {EXERCISE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-gray-400 text-xs pointer-events-none"></i>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Zorluk</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold outline-none">
                                <option value="easy">Kolay</option>
                                <option value="medium">Orta</option>
                                <option value="hard">Zor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Süre (Dk/Gün)</label>
                            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold outline-none text-center" />
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 ml-1">
                                <span>Yakılan Kalori (Ort.)</span>
                            </label>
                            <div className="relative">
                                <input type="text" value={caloriesBurn} onChange={(e) => setCaloriesBurn(e.target.value)} placeholder="Örn: 300" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 transition" />
                                <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400">kcal</span>
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 ml-1">
                                <span>Tamamlama Ödülü</span>
                                <i className="fa-solid fa-trophy text-yellow-400"></i>
                            </label>
                            <div className="relative">
                                <input type="number" value={scoreReward} onChange={(e) => setScoreReward(e.target.value)} className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl pl-4 pr-12 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-green-100 transition" />
                                <span className="absolute right-4 top-3.5 text-xs font-bold text-green-500">Puan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ekipman Listesi */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-dumbbell"></i> Gerekli Ekipmanlar
                    </h3>
                    <div className="space-y-2">
                        {equipmentList.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 group">
                                <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                                <input 
                                    type="text" 
                                    value={item} 
                                    onChange={(e) => updateEquipmentItem(idx, e.target.value)}
                                    className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder-gray-300"
                                    placeholder="Ekipman ekle..."
                                />
                                <button onClick={() => removeEquipmentItem(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i className="fa-solid fa-trash-can"></i></button>
                            </div>
                        ))}
                        <button onClick={addEquipmentItem} className="mt-2 text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                            <i className="fa-solid fa-plus"></i> Ekipman Ekle
                        </button>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-magnifying-glass"></i> SEO & Meta
                    </h3>
                    <input 
                        type="text" 
                        value={seoTitle} 
                        onChange={(e) => setSeoTitle(e.target.value)} 
                        placeholder="SEO Başlığı (Meta Title)" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition" 
                    />
                    <textarea 
                        value={seoDesc} 
                        onChange={(e) => setSeoDesc(e.target.value)} 
                        placeholder="Meta Açıklama (Description) - Google'da görünecek özet..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none h-20 resize-none focus:bg-white focus:border-blue-500 transition"
                    ></textarea>
                    
                    {/* YENİ EKLENEN: Focus Keyword */}
                    <div className="relative">
                        <i className="fa-solid fa-key absolute left-4 top-3.5 text-gray-400 text-xs"></i>
                        <input 
                            type="text" 
                            value={focusKeyword} 
                            onChange={(e) => setFocusKeyword(e.target.value)} 
                            placeholder="Odak Anahtar Kelime" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-blue-500 transition" 
                        />
                    </div>
                </div>

            </div>

        </div>
    </div>
  );
}