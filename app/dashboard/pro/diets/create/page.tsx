"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPlan, uploadMedia } from "@/lib/api";

interface Meal {
    id: string;
    type: string;
    time: string;
    title: string;
    content: string;
    calories: string;
    tags: string[];
    tip: string;
}

interface DayPlan {
    id: string;
    dayNumber: number;
    meals: Meal[];
}

// Özel Diyet Kategorileri
const DIET_CATEGORIES = [
    "Hızlı Sonuç", "Keto", "Vegan", "Vejetaryen", 
    "Düşük Karbonhidrat", "Akdeniz", "Glutensiz", 
    "Ekonomik", "Detoks", "Protein Ağırlıklı", "Aralıklı Oruç"
];

export default function CreateDietPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
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
  const [days, setDays] = useState<DayPlan[]>([
      { id: '1', dayNumber: 1, meals: [{ id: 'm1', type: 'breakfast', time: '08:00', title: '', content: '', calories: '', tags: [], tip: '' }] }
  ]);

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

  // SEO OTOMATİK DOLDURMA
  useEffect(() => {
    // Eğer SEO başlığı boşsa veya ana başlığın bir önceki haliyle aynıysa güncelle
    if (!seoTitle || seoTitle === title.slice(0, -1)) {
        setSeoTitle(title);
    }
  }, [title]);

  useEffect(() => {
    if (!seoDesc || seoDesc === description.slice(0, -1)) {
        setSeoDesc(description.slice(0, 160));
    }
  }, [description]);


  // --- PLAN YÖNETİMİ ---
  const addDay = () => {
      setDays(prev => [...prev, { 
          id: Date.now().toString(), 
          dayNumber: prev.length + 1, 
          meals: [{ id: `m${Date.now()}`, type: 'breakfast', time: '08:00', title: '', content: '', calories: '', tags: [], tip: '' }] 
      }]);
      setDuration(prev => (parseInt(prev) + 1).toString());
  };

  const addMeal = (dayIndex: number) => {
      const newDays = [...days];
      newDays[dayIndex].meals.push({ 
          id: `m${Date.now()}`, 
          type: 'snack', time: '15:00', title: '', content: '', calories: '', tags: [], tip: '' 
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

  const handleMealTag = (dayIndex: number, mealIndex: number, tag: string) => {
      const newDays = [...days];
      const currentTags = newDays[dayIndex].meals[mealIndex].tags || [];
      if (currentTags.includes(tag)) {
          newDays[dayIndex].meals[mealIndex].tags = currentTags.filter(t => t !== tag);
      } else {
          newDays[dayIndex].meals[mealIndex].tags = [...currentTags, tag];
      }
      setDays(newDays);
  };

  // --- ETIKET YÖNETİMİ ---
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

  // --- ALIŞVERİŞ LİSTESİ ---
  const updateShoppingItem = (index: number, value: string) => {
      const newList = [...shoppingList];
      newList[index] = value;
      setShoppingList(newList);
  };
  const addShoppingItem = () => setShoppingList([...shoppingList, ""]);
  const removeShoppingItem = (index: number) => setShoppingList(shoppingList.filter((_, i) => i !== index));

  // Görsel Yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const res = await uploadMedia(e.target.files[0]);
      if (res.success && res.url) {
          setFeaturedImage(res.url);
          setFeaturedImageId(res.id || 0);
      } else {
          alert("Hata: " + res.message);
      }
      setIsUploading(false);
    }
  };

  // Yayınla
  const handlePublish = async () => {
      if (!title) return alert("Başlık giriniz.");
      setLoading(true);

      const planData = {
          title,
          content: description,
          status: 'publish',
          featured_media_id: featuredImageId,
          plan_data: days,
          shopping_list: shoppingList.filter(i => i.trim() !== ""),
          tags: tags, // Etiketler
          meta: {
              difficulty,
              duration,
              calories: caloriesAvg,
              score_reward: scoreReward,
              diet_category: selectedCategory, // Özel Diyet Kategorisi
              // SEO
              rank_math_title: seoTitle || title,
              rank_math_description: seoDesc || description,
              rank_math_focus_keyword: focusKeyword
          }
      };

      const res = await createPlan(planData);
      
      if (res.success) {
          alert("Diyet planı başarıyla oluşturuldu! 🎉");
          if (res.data && res.data.slug) router.push("/diets/" + res.data.slug);
      } else {
          alert("Hata: " + res.message);
      }
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-rejimde-text">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/pro" className="text-gray-400 hover:text-gray-600 transition"><i className="fa-solid fa-arrow-left"></i></Link>
                <h1 className="text-xl font-black text-gray-800">Profesyonel Diyet Editörü</h1>
            </div>
            <button onClick={handlePublish} disabled={loading} className="bg-rejimde-green text-white px-6 py-2 rounded-xl font-extrabold shadow-btn btn-game text-xs uppercase flex items-center gap-2 transition hover:bg-green-500 disabled:opacity-50">
                {loading && <i className="fa-solid fa-circle-notch animate-spin"></i>} Yayınla
            </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Plan Editor */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Liste Adı (Örn: 3 Günlük Hızlı Ödem)" className="w-full text-2xl font-black text-gray-800 placeholder-gray-300 outline-none" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bu liste kimler için uygun? Açıklama yazın..." className="w-full h-20 resize-none text-sm font-medium text-gray-600 outline-none placeholder-gray-300"></textarea>
                </div>

                {/* Days Loop */}
                {days.map((day, dIndex) => (
                    <div key={day.id} className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-extrabold text-rejimde-blue text-lg">{day.dayNumber}. Gün</h3>
                            <button onClick={() => addMeal(dIndex)} className="text-xs font-bold text-gray-500 hover:text-rejimde-green bg-white border border-gray-200 px-3 py-1 rounded-lg transition">+ Öğün Ekle</button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {day.meals.map((meal, mIndex) => (
                                <div key={meal.id} className="relative group pl-4 border-l-4 border-gray-200 hover:border-rejimde-yellow transition bg-slate-50/50 p-4 rounded-r-xl">
                                    
                                    <div className="flex flex-wrap gap-3 mb-3 items-center">
                                        <select 
                                            value={meal.type} 
                                            onChange={(e) => updateMeal(dIndex, mIndex, 'type', e.target.value)}
                                            className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:border-rejimde-blue cursor-pointer"
                                        >
                                            <option value="breakfast">Kahvaltı</option>
                                            <option value="lunch">Öğle</option>
                                            <option value="dinner">Akşam</option>
                                            <option value="snack">Ara Öğün</option>
                                        </select>
                                        <input type="time" value={meal.time} onChange={(e) => updateMeal(dIndex, mIndex, 'time', e.target.value)} className="bg-white border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 w-20 outline-none" />
                                        <input type="text" value={meal.title} onChange={(e) => updateMeal(dIndex, mIndex, 'title', e.target.value)} className="flex-1 bg-transparent font-bold text-gray-800 border-b border-transparent focus:border-gray-300 outline-none" placeholder="Öğün Başlığı (Örn: Yulaf Lapası)" />
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={meal.calories} onChange={(e) => updateMeal(dIndex, mIndex, 'calories', e.target.value)} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-right outline-none" placeholder="0" />
                                            <span className="text-xs font-bold text-gray-400">kcal</span>
                                        </div>
                                    </div>

                                    <textarea value={meal.content} onChange={(e) => updateMeal(dIndex, mIndex, 'content', e.target.value)} className="w-full text-sm text-gray-600 outline-none resize-none h-20 bg-white border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-rejimde-yellow transition mb-3" placeholder="Neler yenilecek? Detaylı açıklama..."></textarea>
                                    
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex gap-2">
                                            {['Vegan', 'Glutensiz', 'Protein', 'C Vitamini'].map(tag => (
                                                <button 
                                                    key={tag} 
                                                    onClick={() => handleMealTag(dIndex, mIndex, tag)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${meal.tags?.includes(tag) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1">
                                            <input type="text" value={meal.tip} onChange={(e) => updateMeal(dIndex, mIndex, 'tip', e.target.value)} className="w-full bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-1 text-xs font-medium text-yellow-700 placeholder-yellow-400/70 outline-none" placeholder="💡 İpucu ekle (Opsiyonel)" />
                                        </div>
                                    </div>

                                    <button onClick={() => removeMeal(dIndex, mIndex)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="flex gap-4">
                    <button onClick={addDay} className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-3xl text-gray-400 font-bold hover:border-rejimde-blue hover:text-rejimde-blue transition uppercase tracking-wide">+ Yeni Gün Ekle</button>
                </div>
                
                {/* SHOPPING LIST */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-gray-700 text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-basket-shopping text-rejimde-purple"></i> Alışveriş Listesi
                    </h3>
                    <div className="space-y-2">
                        {shoppingList.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center mt-2"><div className="w-2 h-2 bg-gray-300 rounded-full"></div></div>
                                <input 
                                    type="text" 
                                    value={item} 
                                    onChange={(e) => updateShoppingItem(idx, e.target.value)}
                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-rejimde-purple"
                                    placeholder="Örn: 500gr Tavuk Göğsü"
                                />
                                <button onClick={() => removeShoppingItem(idx)} className="text-gray-300 hover:text-red-500 px-2"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addShoppingItem} className="mt-4 text-xs font-bold text-rejimde-purple hover:underline">+ Malzeme Ekle</button>
                </div>

            </div>

            {/* RIGHT: Settings Sidebar */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Featured Image */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm text-center cursor-pointer hover:border-rejimde-blue group relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                    {featuredImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={featuredImage} className="w-full h-40 object-cover rounded-xl" alt="Cover" />
                    ) : (
                        <div className="py-8">
                            {isUploading ? <i className="fa-solid fa-circle-notch animate-spin text-2xl text-rejimde-blue"></i> : <><i className="fa-regular fa-image text-3xl text-gray-300 mb-2 group-hover:text-rejimde-blue"></i><p className="text-xs font-bold text-gray-400">Kapak Görseli</p></>}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                </div>

                {/* Details */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase">Detaylar</h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Diyet Türü</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none cursor-pointer">
                            {DIET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    
                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Etiketler</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">#{tag}<button onClick={() => removeTag(tag)} className="hover:text-red-500"><i className="fa-solid fa-xmark"></i></button></span>
                            ))}
                        </div>
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Etiket ekle ve Enter..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Zorluk</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none">
                                <option value="easy">Kolay</option>
                                <option value="medium">Orta</option>
                                <option value="hard">Zor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Süre (Gün)</label>
                            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ort. Kalori / Gün</label>
                        <input type="text" value={caloriesAvg} onChange={(e) => setCaloriesAvg(e.target.value)} placeholder="Örn: 1500" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tamamlama Puanı</label>
                        <input type="number" value={scoreReward} onChange={(e) => setScoreReward(e.target.value)} className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase flex items-center gap-2"><i className="fa-solid fa-magnifying-glass"></i> SEO Ayarları</h3>
                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO Başlığı" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none" />
                    <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Meta Açıklama" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none h-20 resize-none"></textarea>
                    <input type="text" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="Odak Anahtar Kelime" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none" />
                </div>

            </div>

        </div>
    </div>
  );
}