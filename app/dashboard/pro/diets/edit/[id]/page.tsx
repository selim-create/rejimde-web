"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// NOT: updatePlan fonksiyonunu api.ts dosyanıza eklemeniz gerekecek. 
// Şimdilik createPlan ve getPlan'ı import ediyoruz.
import { getPlan, updatePlan, uploadMedia } from "@/lib/api";

// --- TİPLER ---

interface Meal {
    id: string;
    type: string;
    time: string;
    title: string;
    content: string;
    calories: string;
    tags: string[];
    tip: string;
    // UI States
    isSmartMode?: boolean;
    smartText?: string;
    tagInput?: string;
}

interface DayPlan {
    id: string;
    dayNumber: number;
    meals: Meal[];
}

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

// --- SABİTLER ---

const DIET_CATEGORIES = [
    "Hızlı Sonuç", "Keto", "Vegan", "Vejetaryen", 
    "Düşük Karbonhidrat", "Akdeniz", "Glutensiz", 
    "Ekonomik", "Detoks", "Protein Ağırlıklı", "Aralıklı Oruç"
];

const QUICK_TAGS = ['Vegan', 'Glutensiz', 'Protein', 'C Vitamini', 'Düşük Yağ', 'Şekersiz'];

const MEAL_TYPES = [
    { value: 'breakfast', label: 'Kahvaltı', icon: 'fa-mug-hot' },
    { value: 'lunch', label: 'Öğle', icon: 'fa-utensils' },
    { value: 'dinner', label: 'Akşam', icon: 'fa-moon' },
    { value: 'snack', label: 'Ara Öğün', icon: 'fa-apple-whole' },
    { value: 'pre-workout', label: 'Antrenman Öncesi', icon: 'fa-dumbbell' },
    { value: 'post-workout', label: 'Antrenman Sonrası', icon: 'fa-bolt' },
];

export default function EditDietPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Params'ı unwrap et
  const { id } = use(params);

  // --- STATE ---
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Modal State
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void, onCancel?: () => void }>({
      isOpen: false, title: '', message: '', type: 'success'
  });
  
  // Meta
  const [difficulty, setDifficulty] = useState("medium");
  const [caloriesAvg, setCaloriesAvg] = useState("");
  const [duration, setDuration] = useState("1");
  const [scoreReward, setScoreReward] = useState("100");
  
  // Kategori & Etiket
  const [selectedCategory, setSelectedCategory] = useState("Hızlı Sonuç");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Plan Data
  const [days, setDays] = useState<DayPlan[]>([]);

  // Alışveriş Listesi
  const [shoppingList, setShoppingList] = useState<string[]>([""]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");

  // Medya
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // --- HELPER: Modal Göster ---
  const showModal = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => {
      setModal({ 
          isOpen: true, 
          title, 
          message, 
          type, 
          onConfirm: () => {
              if(onConfirm) onConfirm();
              setModal(prev => ({ ...prev, isOpen: false }));
          },
          onCancel: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
  };

  // --- VERİ ÇEKME (INIT) ---
  useEffect(() => {
    const loadPlan = async () => {
        if (!id) return;
        
        try {
            const res = await getPlan(id);
            if (res.success && res.data) {
                const data = res.data;
                
                // Temel Bilgiler
                setTitle(data.title || "");
                setDescription(data.content || "");
                
                // Medya
                if (data.featured_media_url) setFeaturedImage(data.featured_media_url);
                if (data.featured_media_id) setFeaturedImageId(data.featured_media_id);

                // Meta - DÜZELTİLDİ: Tüm alanlar güvenli şekilde meta'dan çekiliyor
                if (data.meta) {
                    setDifficulty(data.meta.difficulty || "medium");
                    setCaloriesAvg(data.meta.calories || "");
                    setDuration(data.meta.duration || "1");
                    setScoreReward(data.meta.score_reward || "100");
                    setSelectedCategory(data.meta.diet_category || "Hızlı Sonuç");
                    
                    // SEO
                    setSeoTitle(data.meta.rank_math_title || "");
                    setSeoDesc(data.meta.rank_math_description || "");
                    setFocusKeyword(data.meta.rank_math_focus_keyword || "");

                    // Alışveriş Listesi (Meta'dan geliyorsa)
                    // Not: any kullanarak tip hatasını geçiyoruz
                    let metaShoppingList = (data.meta as any).shopping_list;
                    // String gelirse parse et
                    if (typeof metaShoppingList === 'string') {
                        try { metaShoppingList = JSON.parse(metaShoppingList); } catch(e) { metaShoppingList = []; }
                    }

                    if (metaShoppingList && Array.isArray(metaShoppingList)) {
                        setShoppingList([...metaShoppingList, ""]);
                    } else if (data.shopping_list && Array.isArray(data.shopping_list)) {
                        // Root seviyesinden geliyorsa (yedek)
                        setShoppingList([...data.shopping_list, ""]);
                    }

                    // Etiketler (Meta'dan geliyorsa) - DÜZELTME: String Parse Kontrolü Eklendi
                    let metaTags = (data.meta as any).tags;
                    // Eğer string gelirse parse et (API tarafında parse edilmemiş olma ihtimaline karşı)
                    if (typeof metaTags === 'string') {
                        try {
                            metaTags = JSON.parse(metaTags);
                        } catch (e) {
                            metaTags = [];
                        }
                    }

                    if (metaTags && Array.isArray(metaTags)) {
                        setTags(metaTags);
                    } else if (data.tags && Array.isArray(data.tags)) {
                        // Root seviyesinden geliyorsa (yedek) - number[] to string[]
                        setTags(data.tags.map(String));
                    }
                }

                // Plan Data (Günler)
                if (data.plan_data && Array.isArray(data.plan_data)) {
                    // PlanDay[] to DayPlan[] - add missing id field and ensure all required fields
                    const convertedDays = data.plan_data.map((day, idx) => ({
                        id: String(idx + 1),
                        dayNumber: day.dayNumber,
                        meals: day.meals.map(meal => ({
                            id: meal.id,
                            type: meal.type,
                            time: meal.time || '08:00',
                            title: meal.title,
                            content: meal.content,
                            calories: meal.calories || '',
                            tags: meal.tags || [],
                            tip: meal.tip || ''
                        }))
                    }));
                    setDays(convertedDays);
                } else {
                    setDays([{ id: '1', dayNumber: 1, meals: [{ id: 'm1', type: 'breakfast', time: '08:00', title: '', content: '', calories: '', tags: [], tip: '' }] }]);
                }

            } else {
                showModal("Hata", "Plan bulunamadı veya yüklenirken hata oluştu.", "error", () => {
                    router.push("/dashboard/pro");
                });
            }
        } catch (error) {
            console.error("Plan yükleme hatası:", error);
            showModal("Hata", "Bir hata oluştu.", "error");
        } finally {
            setLoading(false);
        }
    };

    loadPlan();
  }, [id, router]);


  // --- FONKSİYONLAR: GÜN VE ÖĞÜN YÖNETİMİ ---

  const addDay = () => {
      setDays(prev => [...prev, { 
          id: Date.now().toString(), 
          dayNumber: prev.length + 1, 
          meals: [{ id: `m${Date.now()}`, type: 'breakfast', time: '08:00', title: '', content: '', calories: '', tags: [], tip: '' }] 
      }]);
      setDuration(prev => (parseInt(prev) + 1).toString());
  };

  const removeDay = (dayIndex: number) => {
      if (days.length <= 1) return;
      showModal("Günü Sil", "Bu günü silmek istediğinize emin misiniz?", "confirm", () => {
          const newDays = days.filter((_, idx) => idx !== dayIndex);
          const reorderedDays = newDays.map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
          setDays(reorderedDays);
          setDuration(prev => (parseInt(prev) - 1).toString());
      });
  };

  const addMeal = (dayIndex: number) => {
      const newDays = [...days];
      const lastMealTime = newDays[dayIndex].meals[newDays[dayIndex].meals.length - 1]?.time || "08:00";
      let nextHour = parseInt(lastMealTime.split(':')[0]) + 3;
      if (nextHour > 23) nextHour = 8;
      const nextTime = `${nextHour.toString().padStart(2, '0')}:00`;

      newDays[dayIndex].meals.push({ 
          id: `m${Date.now()}`, 
          type: 'snack', time: nextTime, title: '', content: '', calories: '', tags: [], tip: '' 
      });
      setDays(newDays);
  };

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: any) => {
      const newDays = [...days];
      newDays[dayIndex].meals[mealIndex] = { ...newDays[dayIndex].meals[mealIndex], [field]: value };
      setDays(newDays);
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
      const newDays = [...days];
      newDays[dayIndex].meals.splice(mealIndex, 1);
      setDays(newDays);
  };

  // --- FONKSİYONLAR: ÖĞÜN ETİKETLERİ ---

  const toggleMealTag = (dayIndex: number, mealIndex: number, tag: string) => {
      const newDays = [...days];
      const currentTags = newDays[dayIndex].meals[mealIndex].tags || [];
      if (currentTags.includes(tag)) {
          newDays[dayIndex].meals[mealIndex].tags = currentTags.filter(t => t !== tag);
      } else {
          newDays[dayIndex].meals[mealIndex].tags = [...currentTags, tag];
      }
      setDays(newDays);
  };

  const addCustomMealTag = (dayIndex: number, mealIndex: number) => {
      const newDays = [...days];
      const meal = newDays[dayIndex].meals[mealIndex];
      if (meal.tagInput && meal.tagInput.trim() !== "") {
          const newTag = meal.tagInput.trim();
          if (!meal.tags.includes(newTag)) {
             meal.tags = [...(meal.tags || []), newTag];
          }
          meal.tagInput = ""; 
          setDays(newDays);
      }
  };

  // --- FONKSİYONLAR: AKILLI LİSTE (SMART PARSER) ---
  
  const applySmartList = (dayIndex: number, mealIndex: number) => {
      const newDays = [...days];
      const meal = newDays[dayIndex].meals[mealIndex];
      const text = meal.smartText || "";
      
      if (!text.trim()) return;

      const ingredients = text.split('\n')
          .filter(line => line.trim() !== "")
          .map(line => line.trim());

      const formattedList = ingredients.map(line => `• ${line}`).join('\n');
      const currentContent = meal.content ? meal.content + "\n\n" : "";
      meal.content = currentContent + formattedList;
      
      setShoppingList(prevList => {
          const cleanPrevList = prevList.filter(item => item.trim() !== "");
          const newItems = ingredients.filter(ing => !cleanPrevList.includes(ing));
          return [...cleanPrevList, ...newItems, ""];
      });

      meal.smartText = "";
      meal.isSmartMode = false;
      
      setDays(newDays);
  };

  // --- FONKSİYONLAR: GENEL PLAN ETİKETLERİ ---

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- FONKSİYONLAR: ALIŞVERİŞ LİSTESİ ---

  const updateShoppingItem = (index: number, value: string) => {
      const newList = [...shoppingList];
      newList[index] = value;
      setShoppingList(newList);
  };
  const addShoppingItem = () => setShoppingList([...shoppingList, ""]);
  const removeShoppingItem = (index: number) => setShoppingList(shoppingList.filter((_, i) => i !== index));

  // --- FONKSİYONLAR: MEDYA ---

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

  // --- GÜNCELLE (UPDATE) ---

  const handleUpdate = async () => {
      if (!title) return showModal("Eksik Bilgi", "Lütfen bir plan başlığı giriniz.", "error");
      
      setSaving(true);

      const planData = {
          id: parseInt(id),
          title,
          content: description,
          status: 'publish',
          featured_media_id: featuredImageId,
          plan_data: days,
          // Root seviyesinde gönderim
          shopping_list: shoppingList.filter(i => i.trim() !== ""),
          tags: tags,
          // Meta içinde gönderim
          meta: {
              difficulty,
              duration,
              calories: caloriesAvg,
              score_reward: scoreReward,
              diet_category: selectedCategory,
              shopping_list: shoppingList.filter(i => i.trim() !== ""),
              tags: tags,
              rank_math_title: seoTitle || title,
              rank_math_description: seoDesc || description,
              rank_math_focus_keyword: focusKeyword
          }
      };

      try {
        const res = await updatePlan(parseInt(id), planData); 
        
        if (res.success) {
            showModal("Başarılı", "Plan başarıyla güncellendi! ✅", "success", () => {
                if (res.data && res.data.slug) {
                    router.push(`/diets/${res.data.slug}`);
                } else {
                    router.push("/dashboard/pro");
                }
            });
        } else {
            showModal("Hata", "Güncelleme hatası: " + res.message, "error");
        }
      } catch (err) {
        showModal("Hata", "Bir hata oluştu. Lütfen tekrar deneyiniz.", "error");
        console.error(err);
      }
      setSaving(false);
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <i className="fa-solid fa-circle-notch animate-spin text-4xl text-rejimde-blue"></i>
                  <p className="text-gray-500 font-bold">Plan Yükleniyor...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-gray-800">
        
        <Modal {...modal} />

        {/* Üst Bar (Sticky) */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-40 flex items-center justify-between shadow-sm/50 backdrop-blur-md bg-white/90">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/pro" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <div>
                    <h1 className="text-lg font-black text-gray-800 leading-tight">Planı Düzenle</h1>
                    <p className="text-xs text-gray-400 font-medium hidden md:block">ID: {id}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Durum</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Yayında</span>
                 </div>
                <button 
                    onClick={handleUpdate} 
                    disabled={saving} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 text-sm flex items-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                    <span>Güncelle</span>
                </button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SOL KOLON: Plan Editörü */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Temel Bilgiler */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Plan Başlığı</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Örn: 21 Günlük Şekersiz Detoks" 
                            className="w-full text-3xl font-black text-gray-800 placeholder-gray-300 outline-none bg-transparent" 
                        />
                    </div>
                    
                    <div>
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kısa Açıklama</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Bu liste kimler için uygun? Hedeflenen sonuç nedir? Kısa ve etkileyici bir giriş yazın..." 
                            className="w-full h-24 resize-none text-sm font-medium text-gray-600 outline-none placeholder-gray-300 bg-gray-50/50 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-rejimde-blue/20 transition"
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
                                    <div className="bg-rejimde-blue text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-md shadow-blue-200">
                                        {day.dayNumber}
                                    </div>
                                    <h3 className="font-extrabold text-gray-800 text-lg">. Gün Planı</h3>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover/day:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => removeDay(dIndex)} 
                                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                                        title="Günü Sil"
                                    >
                                        <i className="fa-solid fa-trash-can text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Öğünler Listesi */}
                            <div className="p-6 space-y-6 bg-slate-50/30">
                                {day.meals.map((meal, mIndex) => (
                                    <div key={meal.id} className="relative group/meal pl-0 md:pl-4 transition-all duration-300">
                                        
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full group-hover/meal:bg-rejimde-yellow transition-colors hidden md:block"></div>

                                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-rejimde-blue/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                                            
                                            {/* Öğün Header Satırı */}
                                            <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center">
                                                
                                                {/* Tip Seçici */}
                                                <div className="relative">
                                                    <select 
                                                        value={meal.type} 
                                                        onChange={(e) => updateMeal(dIndex, mIndex, 'type', e.target.value)}
                                                        className="appearance-none bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl pl-9 pr-8 py-2.5 outline-none focus:border-rejimde-blue cursor-pointer transition hover:bg-gray-100 text-gray-700"
                                                    >
                                                        {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                    </select>
                                                    <i className={`fa-solid ${MEAL_TYPES.find(t => t.value === meal.type)?.icon || 'fa-circle'} absolute left-3 top-3 text-rejimde-blue text-xs`}></i>
                                                    <i className="fa-solid fa-chevron-down absolute right-3 top-3.5 text-gray-300 text-[10px] pointer-events-none"></i>
                                                </div>

                                                {/* Saat - DÜZELTİLDİ: İkon karmaşası giderildi, appearance-none eklendi */}
                                                <div className="relative group/time flex items-center">
                                                    <input 
                                                        type="time" 
                                                        value={meal.time} 
                                                        onChange={(e) => updateMeal(dIndex, mIndex, 'time', e.target.value)} 
                                                        className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-xl px-3 py-2.5 w-28 outline-none focus:border-rejimde-blue text-center text-gray-600 cursor-pointer [appearance:textfield] [&::-webkit-calendar-picker-indicator]:opacity-0 relative z-10" 
                                                    />
                                                    <i className="fa-regular fa-clock absolute right-3 text-gray-300 group-hover/time:text-rejimde-blue text-xs pointer-events-none z-0"></i>
                                                </div>

                                                {/* Başlık */}
                                                <input 
                                                    type="text" 
                                                    value={meal.title} 
                                                    onChange={(e) => updateMeal(dIndex, mIndex, 'title', e.target.value)} 
                                                    className="flex-1 bg-transparent font-bold text-gray-800 border-b-2 border-transparent focus:border-gray-200 outline-none py-1 transition placeholder-gray-300" 
                                                    placeholder="Öğün Başlığı (Örn: Yulaf Lapası)" 
                                                />

                                                {/* Kalori */}
                                                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                                    <i className="fa-solid fa-fire text-orange-400 text-xs"></i>
                                                    <input 
                                                        type="number" 
                                                        value={meal.calories} 
                                                        onChange={(e) => updateMeal(dIndex, mIndex, 'calories', e.target.value)} 
                                                        className="w-12 bg-transparent text-xs font-bold text-orange-700 outline-none text-right placeholder-orange-300" 
                                                        placeholder="0" 
                                                    />
                                                    <span className="text-[10px] font-bold text-orange-400">kcal</span>
                                                </div>

                                                <button onClick={() => removeMeal(dIndex, mIndex)} className="text-gray-300 hover:text-red-500 transition px-2"><i className="fa-solid fa-xmark"></i></button>
                                            </div>

                                            {/* İçerik Alanı & Smart Tool */}
                                            <div className="mb-4 relative">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                        <i className="fa-solid fa-align-left"></i> İçerik / Malzemeler
                                                    </label>
                                                    <button 
                                                        onClick={() => updateMeal(dIndex, mIndex, 'isSmartMode', !meal.isSmartMode)}
                                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-2 border ${meal.isSmartMode ? 'bg-rejimde-purple text-white border-rejimde-purple shadow-lg shadow-purple-200' : 'text-rejimde-purple bg-white border-purple-100 hover:bg-purple-50'}`}
                                                    >
                                                        <i className="fa-solid fa-wand-magic-sparkles"></i> 
                                                        {meal.isSmartMode ? 'Sihirbaz Açık' : 'Akıllı Sihirbaz'}
                                                    </button>
                                                </div>

                                                {meal.isSmartMode ? (
                                                    <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100 shadow-inner relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><i className="fa-solid fa-wand-magic-sparkles text-6xl text-purple-600"></i></div>
                                                        
                                                        <p className="text-xs text-purple-800 mb-3 font-medium flex items-center gap-2">
                                                            <span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-[10px]">1</span>
                                                            Malzemeleri alt alta yazın (Örn: 2 Yumurta)
                                                        </p>
                                                        
                                                        <textarea 
                                                            value={meal.smartText || ''} 
                                                            onChange={(e) => updateMeal(dIndex, mIndex, 'smartText', e.target.value)}
                                                            className="w-full h-32 bg-white border border-purple-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-300 mb-3 shadow-sm resize-none"
                                                            placeholder="2 adet yumurta&#10;1 dilim beyaz peynir&#10;5 adet zeytin&#10;1 fincan şekersiz çay"
                                                            autoFocus
                                                        ></textarea>
                                                        
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-[10px] text-purple-400 italic">*Otomatik olarak listeye ve alışveriş sepetine eklenir.</p>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => updateMeal(dIndex, mIndex, 'isSmartMode', false)} className="text-xs font-bold text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition">Vazgeç</button>
                                                                <button onClick={() => applySmartList(dIndex, mIndex)} className="text-xs font-bold bg-rejimde-purple hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md shadow-purple-200 transition flex items-center gap-2">
                                                                    <i className="fa-solid fa-check"></i> Listeye Dönüştür
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <textarea 
                                                        value={meal.content} 
                                                        onChange={(e) => updateMeal(dIndex, mIndex, 'content', e.target.value)} 
                                                        className="w-full text-sm text-gray-600 outline-none resize-none h-28 bg-gray-50/50 border border-gray-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-rejimde-blue/20 focus:border-rejimde-blue transition placeholder-gray-400" 
                                                        placeholder="Bu öğünde neler yenilecek? Detaylı açıklama..."
                                                    ></textarea>
                                                )}
                                            </div>
                                            
                                            {/* Etiketler & İpucu Alt Satır */}
                                            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
                                                
                                                {/* Etiketler */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {QUICK_TAGS.map(tag => (
                                                            <button 
                                                                key={tag} 
                                                                onClick={() => toggleMealTag(dIndex, mIndex, tag)}
                                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition duration-200 ${meal.tags?.includes(tag) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                                            >
                                                                {tag}
                                                            </button>
                                                        ))}
                                                        {meal.tags?.filter(t => !QUICK_TAGS.includes(t)).map(tag => (
                                                            <button 
                                                                key={tag} 
                                                                onClick={() => toggleMealTag(dIndex, mIndex, tag)}
                                                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1 group/tag"
                                                            >
                                                                {tag}
                                                                <i className="fa-solid fa-xmark text-[9px] opacity-0 group-hover/tag:opacity-100 transition-opacity"></i>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2 group/addtag">
                                                        <i className="fa-solid fa-tag text-gray-300 text-xs group-hover/addtag:text-rejimde-blue transition-colors"></i>
                                                        <input 
                                                            type="text" 
                                                            value={meal.tagInput || ''} 
                                                            onChange={(e) => updateMeal(dIndex, mIndex, 'tagInput', e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && addCustomMealTag(dIndex, mIndex)}
                                                            placeholder="Özel etiket yazıp Enter'a bas..." 
                                                            className="bg-transparent border-none text-xs py-1 outline-none w-48 placeholder-gray-300 focus:placeholder-gray-400 text-gray-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* İpucu - DÜZELTİLDİ: Flex ve absolute center kullanıldı */}
                                                <div className="w-full md:w-1/3 relative flex items-center">
                                                    <div className="absolute left-3 flex items-center justify-center pointer-events-none h-full">
                                                        <i className="fa-regular fa-lightbulb text-yellow-500"></i>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={meal.tip} 
                                                        onChange={(e) => updateMeal(dIndex, mIndex, 'tip', e.target.value)} 
                                                        className="w-full bg-yellow-50 border border-yellow-100 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-yellow-800 placeholder-yellow-400/80 outline-none focus:ring-2 focus:ring-yellow-200 transition" 
                                                        placeholder="Öğün için püf noktası veya ipucu..." 
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))}

                                {/* Alttaki + Butonu */}
                                <div className="pl-0 md:pl-4">
                                    <button 
                                        onClick={() => addMeal(dIndex)} 
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-bold hover:border-rejimde-blue hover:text-rejimde-blue hover:bg-blue-50 transition flex items-center justify-center gap-2 group"
                                    >
                                        <span className="bg-gray-100 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center group-hover:bg-rejimde-blue group-hover:text-white transition shadow-sm">
                                            <i className="fa-solid fa-plus text-sm"></i>
                                        </span>
                                        Bu Güne Yeni Öğün Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Yeni Gün Ekle Ana Buton */}
                    <button 
                        onClick={addDay} 
                        className="w-full py-5 bg-gray-800 hover:bg-gray-900 text-white rounded-[2rem] font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:scale-[1.005] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    >
                        <i className="fa-solid fa-calendar-plus text-xl text-gray-400"></i>
                        Yeni Gün Ekle
                    </button>
                </div>

                {/* 3. Alışveriş Listesi */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-lg shadow-gray-100/50">
                    <h3 className="font-black text-gray-800 text-xl mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-rejimde-purple/10 rounded-xl flex items-center justify-center text-rejimde-purple">
                            <i className="fa-solid fa-basket-shopping"></i>
                        </span>
                        Alışveriş Listesi
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shoppingList.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                                <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-rejimde-purple transition-colors"></div>
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value={item} 
                                        onChange={(e) => updateShoppingItem(idx, e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-rejimde-purple/30 transition placeholder-gray-300"
                                        placeholder="Malzeme ekle..."
                                    />
                                    <button 
                                        onClick={() => removeShoppingItem(idx)} 
                                        className="absolute right-3 top-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={addShoppingItem} 
                            className="flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-rejimde-purple font-bold rounded-xl px-4 py-3 text-sm transition border border-dashed border-purple-200 hover:border-purple-300"
                        >
                            <i className="fa-solid fa-plus"></i> Manuel Ekle
                        </button>
                    </div>
                </div>

            </div>

            {/* SAĞ KOLON: Ayarlar Sidebar */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Kapak Görseli */}
                <div 
                    className="bg-white border-2 border-dashed border-gray-300 hover:border-rejimde-blue rounded-[2rem] p-4 text-center cursor-pointer group relative overflow-hidden transition-colors aspect-video flex flex-col items-center justify-center" 
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
                                <i className="fa-solid fa-circle-notch animate-spin text-3xl text-rejimde-blue"></i>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-blue-50 text-rejimde-blue rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
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

                {/* Genel Ayarlar */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm space-y-5">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Plan Detayları</h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Kategori</label>
                        <div className="relative">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none cursor-pointer appearance-none hover:bg-gray-100 transition">
                                {DIET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-4 top-4 text-gray-400 text-xs pointer-events-none"></i>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Genel Etiketler</label>
                        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-50 rounded-xl min-h-[3rem]">
                            {tags.length === 0 && <span className="text-xs text-gray-300 italic">Etiket yok...</span>}
                            {tags.map(tag => (
                                <span key={tag} className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 w-4 h-4 flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                                </span>
                            ))}
                        </div>
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="+ Etiket ekle" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-rejimde-blue transition" />
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
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Süre (Gün)</label>
                            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold outline-none text-center" />
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 ml-1">
                                <span>Ort. Kalori / Gün</span>
                                <span className="text-gray-300 font-normal">Opsiyonel</span>
                            </label>
                            <div className="relative">
                                <input type="text" value={caloriesAvg} onChange={(e) => setCaloriesAvg(e.target.value)} placeholder="Örn: 1500" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 transition" />
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

                {/* SEO Ayarları */}
                <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-magnifying-glass"></i> SEO & Meta
                    </h3>
                    
                    <div className="space-y-3">
                        <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO Başlığı (Meta Title)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-rejimde-blue transition" />
                        
                        <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Meta Açıklama (Description) - Google'da görünecek özet..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none h-24 resize-none focus:bg-white focus:border-rejimde-blue transition"></textarea>
                        
                        <div className="relative">
                            <i className="fa-solid fa-key absolute left-4 top-3.5 text-gray-400 text-xs"></i>
                            <input type="text" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="Odak Anahtar Kelime" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-rejimde-blue transition" />
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
  );
}