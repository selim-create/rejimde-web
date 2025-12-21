"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPlan, uploadMedia } from "@/lib/api";

interface Meal {
    id: string;
    title: string;
    content: string;
    calories: string;
}

interface DayPlan {
    id: string;
    dayNumber: number;
    meals: Meal[];
}

export default function CreateDietPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Meta
  const [difficulty, setDifficulty] = useState("medium");
  const [caloriesAvg, setCaloriesAvg] = useState("");
  const [duration, setDuration] = useState("1"); // Varsayılan 1 gün ile başlar
  
  // Plan Data
  const [days, setDays] = useState<DayPlan[]>([
      { id: '1', dayNumber: 1, meals: [{ id: 'm1', title: 'Kahvaltı', content: '', calories: '' }] }
  ]);

  // Medya
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState(0);

  // --- PLAN YÖNETİMİ ---
  const addDay = () => {
      setDays(prevDays => {
          const newDayNum = prevDays.length + 1;
          return [...prevDays, { 
              id: Date.now().toString(), 
              dayNumber: newDayNum, 
              meals: [{ id: `m${Date.now()}`, title: 'Kahvaltı', content: '', calories: '' }] 
          }];
      });
      // Süreyi otomatik artır
      setDuration(prev => {
          const current = parseInt(prev) || 0;
          return (current + 1).toString();
      });
  };

  const addMeal = (dayIndex: number) => {
      setDays(prevDays => {
          const newDays = [...prevDays];
          const currentDay = { ...newDays[dayIndex] };
          currentDay.meals = [
              ...currentDay.meals,
              { id: `m${Date.now()}`, title: 'Ara Öğün', content: '', calories: '' }
          ];
          newDays[dayIndex] = currentDay;
          return newDays;
      });
  };

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: string) => {
      setDays(prevDays => {
          const newDays = [...prevDays];
          const currentDay = { ...newDays[dayIndex] };
          const currentMeals = [...currentDay.meals];
          
          currentMeals[mealIndex] = {
              ...currentMeals[mealIndex],
              [field]: value
          };
          
          currentDay.meals = currentMeals;
          newDays[dayIndex] = currentDay;
          return newDays;
      });
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
      setDays(prevDays => {
          const newDays = [...prevDays];
          const currentDay = { ...newDays[dayIndex] };
          const currentMeals = [...currentDay.meals];
          currentMeals.splice(mealIndex, 1);
          currentDay.meals = currentMeals;
          newDays[dayIndex] = currentDay;
          return newDays;
      });
  };

  // Görsel Yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const res = await uploadMedia(e.target.files[0]);
      if (res.success && res.url) {
          setFeaturedImage(res.url);
          setFeaturedImageId(res.id || 0);
      } else {
          alert("Görsel yüklenirken bir hata oluştu.");
      }
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
          plan_data: days, // JSON yapısı
          meta: {
              difficulty,
              duration,
              calories: caloriesAvg
          }
      };

      const res = await createPlan(planData);
      
      if (res.success) {
          alert("Diyet planı başarıyla oluşturuldu! 🎉");
          // Slug varsa oraya, yoksa listeye yönlendir
          if (res.data && res.data.slug) {
              router.push("/diets/" + res.data.slug);
          } else {
              router.push("/diets");
          }
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
                <h1 className="text-xl font-black text-gray-800">Yeni Diyet Listesi</h1>
            </div>
            <button 
                onClick={handlePublish} 
                disabled={loading} 
                className="bg-rejimde-green text-white px-6 py-2 rounded-xl font-extrabold shadow-btn btn-game text-xs uppercase flex items-center gap-2 transition hover:bg-green-500 disabled:opacity-50"
            >
                {loading && <i className="fa-solid fa-circle-notch animate-spin"></i>} Yayınla
            </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Plan Editor */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Liste Adı (Örn: 3 Günlük Detoks)" 
                        className="w-full text-2xl font-black text-gray-800 placeholder-gray-300 outline-none" 
                    />
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Bu liste kimler için uygun? Açıklama yazın..." 
                        className="w-full h-20 resize-none text-sm font-medium text-gray-600 outline-none placeholder-gray-300"
                    ></textarea>
                </div>

                {/* Days Loop */}
                {days.map((day, dIndex) => (
                    <div key={day.id} className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-extrabold text-rejimde-blue text-lg">{day.dayNumber}. Gün</h3>
                            <button onClick={() => addMeal(dIndex)} className="text-xs font-bold text-gray-500 hover:text-rejimde-green bg-white border border-gray-200 px-3 py-1 rounded-lg transition">+ Öğün Ekle</button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {day.meals.map((meal, mIndex) => (
                                <div key={meal.id} className="relative group pl-4 border-l-4 border-gray-200 hover:border-rejimde-yellow transition">
                                    <div className="flex gap-4 mb-2">
                                        <input 
                                            type="text" 
                                            value={meal.title} 
                                            onChange={(e) => updateMeal(dIndex, mIndex, 'title', e.target.value)}
                                            className="font-bold text-gray-800 outline-none w-1/3 bg-transparent focus:border-b border-gray-300"
                                            placeholder="Öğün Adı"
                                        />
                                        <input 
                                            type="number" 
                                            value={meal.calories} 
                                            onChange={(e) => updateMeal(dIndex, mIndex, 'calories', e.target.value)}
                                            className="font-bold text-gray-400 outline-none w-20 text-xs text-right bg-transparent focus:border-b border-gray-300"
                                            placeholder="kcal"
                                        />
                                    </div>
                                    <textarea 
                                        value={meal.content} 
                                        onChange={(e) => updateMeal(dIndex, mIndex, 'content', e.target.value)}
                                        className="w-full text-sm text-gray-600 outline-none resize-none h-16 bg-gray-50 p-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-rejimde-yellow transition"
                                        placeholder="Neler yenilecek? (Örn: 2 yumurta, 1 dilim peynir...)"
                                    ></textarea>
                                    
                                    {/* Silme Butonu */}
                                    {day.meals.length > 1 && (
                                        <button 
                                            onClick={() => removeMeal(dIndex, mIndex)} 
                                            className="absolute top-0 right-0 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                                            title="Öğünü Sil"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button onClick={addDay} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-3xl text-gray-400 font-bold hover:border-rejimde-blue hover:text-rejimde-blue transition uppercase tracking-wide">
                    + Yeni Gün Ekle
                </button>

            </div>

            {/* RIGHT: Settings */}
            <div className="space-y-6">
                
                {/* Featured Image */}
                <div 
                    className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm text-center cursor-pointer hover:border-rejimde-blue group relative overflow-hidden" 
                    onClick={() => fileInputRef.current?.click()}
                >
                    {featuredImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={featuredImage} className="w-full h-40 object-cover rounded-xl" alt="Cover" />
                    ) : (
                        <div className="py-8">
                            <i className="fa-regular fa-image text-3xl text-gray-300 mb-2 group-hover:text-rejimde-blue transition"></i>
                            <p className="text-xs font-bold text-gray-400">Kapak Görseli</p>
                        </div>
                    )}
                    
                    {featuredImage && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-3xl">
                             <span className="text-white font-bold text-xs"><i className="fa-solid fa-pen mr-2"></i>Değiştir</span>
                        </div>
                    )}

                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                </div>

                {/* Details */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase">Detaylar</h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Zorluk</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none cursor-pointer">
                            <option value="easy">Kolay</option>
                            <option value="medium">Orta</option>
                            <option value="hard">Zor</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ort. Kalori</label>
                        <input type="text" value={caloriesAvg} onChange={(e) => setCaloriesAvg(e.target.value)} placeholder="Örn: 1500" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Süre (Gün)</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                    </div>
                </div>

            </div>

        </div>
    </div>
  );
}