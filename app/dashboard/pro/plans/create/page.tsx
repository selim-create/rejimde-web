'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  createPrivatePlan, 
  getProClients,
  generateAIPlan,
  type ClientListItem,
  type AIGeneratePlanRequest 
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// Plan types
const PLAN_TYPES = [
  { 
    value: 'diet', 
    label: 'Diyet Planı', 
    icon: 'fa-utensils', 
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    description: 'Öğünlere dayalı beslenme planı'
  },
  { 
    value: 'workout', 
    label: 'Egzersiz Planı', 
    icon: 'fa-dumbbell', 
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    description: 'Set/tekrar tabanlı antrenman programı'
  },
  { 
    value: 'flow', 
    label: 'Yoga/Pilates Flow', 
    icon: 'fa-spa', 
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    description: 'Duruş sıralı akış programı'
  },
  { 
    value: 'rehab', 
    label: 'Rehabilitasyon', 
    icon: 'fa-heart-pulse', 
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    description: 'Toparlanma odaklı egzersiz programı'
  },
  { 
    value: 'habit', 
    label: 'Alışkanlık Planı', 
    icon: 'fa-check-circle', 
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    description: 'Günlük alışkanlıklar kontrol listesi'
  }
];

// Meal types for diet
const MEAL_TYPES = [
  { value: 'breakfast', label: 'Kahvaltı', icon: 'fa-mug-hot' },
  { value: 'lunch', label: 'Öğle', icon: 'fa-utensils' },
  { value: 'dinner', label: 'Akşam', icon: 'fa-moon' },
  { value: 'snack', label: 'Ara Öğün', icon: 'fa-apple-whole' },
];

// Types for plan data structures
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

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
  tags: string[];
}

interface Pose {
  id: string;
  name: string;
  duration: string;
  side: string;
  cues: string;
  transition: string;
}

interface Habit {
  id: string;
  name: string;
  frequency: string;
  target: string;
  reminder: string;
}

interface DayPlan {
  id: string;
  dayNumber: number;
  meals?: Meal[];
  exercises?: Exercise[];
  poses?: Pose[];
  habits?: Habit[];
}

export default function CreatePrivatePlanPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Steps
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: Type Selection
  const [selectedType, setSelectedType] = useState<'diet' | 'workout' | 'flow' | 'rehab' | 'habit' | ''>('');
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  
  // Step 2: Plan Editor
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<DayPlan[]>([
    { id: '1', dayNumber: 1 }
  ]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await getProClients({ status: 'active' });
        setClients(result.clients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  // Initialize first item when type is selected
  useEffect(() => {
    if (selectedType && days[0]) {
      const firstDay = { ...days[0] };
      
      if (selectedType === 'diet' && !firstDay.meals) {
        firstDay.meals = [{ 
          id: 'm1', 
          type: 'breakfast', 
          time: '08:00', 
          title: '', 
          content: '', 
          calories: '', 
          tags: [], 
          tip: '' 
        }];
      } else if ((selectedType === 'workout' || selectedType === 'rehab') && !firstDay.exercises) {
        firstDay.exercises = [{ 
          id: 'e1', 
          name: '', 
          sets: '3', 
          reps: '12', 
          rest: '60', 
          notes: '', 
          tags: [] 
        }];
      } else if (selectedType === 'flow' && !firstDay.poses) {
        firstDay.poses = [{ 
          id: 'p1', 
          name: '', 
          duration: '30', 
          side: 'both', 
          cues: '', 
          transition: '' 
        }];
      } else if (selectedType === 'habit' && !firstDay.habits) {
        firstDay.habits = [{ 
          id: 'h1', 
          name: '', 
          frequency: 'daily', 
          target: '1', 
          reminder: '' 
        }];
      }
      
      setDays([firstDay]);
    }
  }, [selectedType]);

  // Go to step 2
  const handleContinue = () => {
    if (!selectedType) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'Lütfen plan tipi seçin.' });
      return;
    }
    setStep(2);
  };

  // Add day
  const addDay = () => {
    const newDay: DayPlan = {
      id: `${days.length + 1}`,
      dayNumber: days.length + 1
    };
    
    if (selectedType === 'diet') {
      newDay.meals = [{ 
        id: 'm1', 
        type: 'breakfast', 
        time: '08:00', 
        title: '', 
        content: '', 
        calories: '', 
        tags: [], 
        tip: '' 
      }];
    } else if (selectedType === 'workout' || selectedType === 'rehab') {
      newDay.exercises = [{ 
        id: 'e1', 
        name: '', 
        sets: '3', 
        reps: '12', 
        rest: '60', 
        notes: '', 
        tags: [] 
      }];
    } else if (selectedType === 'flow') {
      newDay.poses = [{ 
        id: 'p1', 
        name: '', 
        duration: '30', 
        side: 'both', 
        cues: '', 
        transition: '' 
      }];
    } else if (selectedType === 'habit') {
      newDay.habits = [{ 
        id: 'h1', 
        name: '', 
        frequency: 'daily', 
        target: '1', 
        reminder: '' 
      }];
    }
    
    setDays([...days, newDay]);
  };

  // Remove day
  const removeDay = (dayIndex: number) => {
    if (days.length === 1) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'En az bir gün olmalıdır.' });
      return;
    }
    setDays(days.filter((_, i) => i !== dayIndex));
  };

  // Add item to day (meal, exercise, pose, habit)
  const addItem = (dayIndex: number) => {
    const newDays = [...days];
    
    if (selectedType === 'diet' && newDays[dayIndex].meals) {
      const newMeal: Meal = { 
        id: `m${Date.now()}`, 
        type: 'breakfast', 
        time: '08:00', 
        title: '', 
        content: '', 
        calories: '', 
        tags: [], 
        tip: '' 
      };
      newDays[dayIndex].meals = [...(newDays[dayIndex].meals || []), newMeal];
    } else if ((selectedType === 'workout' || selectedType === 'rehab') && newDays[dayIndex].exercises) {
      const newExercise: Exercise = { 
        id: `e${Date.now()}`, 
        name: '', 
        sets: '3', 
        reps: '12', 
        rest: '60', 
        notes: '', 
        tags: [] 
      };
      newDays[dayIndex].exercises = [...(newDays[dayIndex].exercises || []), newExercise];
    } else if (selectedType === 'flow' && newDays[dayIndex].poses) {
      const newPose: Pose = { 
        id: `p${Date.now()}`, 
        name: '', 
        duration: '30', 
        side: 'both', 
        cues: '', 
        transition: '' 
      };
      newDays[dayIndex].poses = [...(newDays[dayIndex].poses || []), newPose];
    } else if (selectedType === 'habit' && newDays[dayIndex].habits) {
      const newHabit: Habit = { 
        id: `h${Date.now()}`, 
        name: '', 
        frequency: 'daily', 
        target: '1', 
        reminder: '' 
      };
      newDays[dayIndex].habits = [...(newDays[dayIndex].habits || []), newHabit];
    }
    
    setDays(newDays);
  };

  // Remove item from day
  const removeItem = (dayIndex: number, itemIndex: number) => {
    const newDays = [...days];
    
    if (selectedType === 'diet' && newDays[dayIndex].meals) {
      newDays[dayIndex].meals = newDays[dayIndex].meals!.filter((_, i) => i !== itemIndex);
    } else if ((selectedType === 'workout' || selectedType === 'rehab') && newDays[dayIndex].exercises) {
      newDays[dayIndex].exercises = newDays[dayIndex].exercises!.filter((_, i) => i !== itemIndex);
    } else if (selectedType === 'flow' && newDays[dayIndex].poses) {
      newDays[dayIndex].poses = newDays[dayIndex].poses!.filter((_, i) => i !== itemIndex);
    } else if (selectedType === 'habit' && newDays[dayIndex].habits) {
      newDays[dayIndex].habits = newDays[dayIndex].habits!.filter((_, i) => i !== itemIndex);
    }
    
    setDays(newDays);
  };

  // Update meal
  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: any) => {
    const newDays = [...days];
    if (newDays[dayIndex].meals && newDays[dayIndex].meals![mealIndex]) {
      (newDays[dayIndex].meals![mealIndex] as any)[field] = value;
      setDays(newDays);
    }
  };

  // Update exercise
  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    const newDays = [...days];
    if (newDays[dayIndex].exercises && newDays[dayIndex].exercises![exerciseIndex]) {
      (newDays[dayIndex].exercises![exerciseIndex] as any)[field] = value;
      setDays(newDays);
    }
  };

  // Update pose
  const updatePose = (dayIndex: number, poseIndex: number, field: keyof Pose, value: any) => {
    const newDays = [...days];
    if (newDays[dayIndex].poses && newDays[dayIndex].poses![poseIndex]) {
      (newDays[dayIndex].poses![poseIndex] as any)[field] = value;
      setDays(newDays);
    }
  };

  // Update habit
  const updateHabit = (dayIndex: number, habitIndex: number, field: keyof Habit, value: any) => {
    const newDays = [...days];
    if (newDays[dayIndex].habits && newDays[dayIndex].habits![habitIndex]) {
      (newDays[dayIndex].habits![habitIndex] as any)[field] = value;
      setDays(newDays);
    }
  };

  // Generate AI Plan
  const handleGenerateAI = async () => {
    if (!selectedType) return;
    
    setAiGenerating(true);
    try {
      const request: AIGeneratePlanRequest = {
        client_id: selectedClientId,
        plan_type: selectedType,
        parameters: {
          duration_days: days.length,
          goal: notes || undefined,
        }
      };
      
      const result = await generateAIPlan(request);
      
      if (result.success && result.data?.draft_plan) {
        // Parse and set the draft plan
        setDays(result.data.draft_plan.days || days);
        if (result.data.draft_plan.title) setTitle(result.data.draft_plan.title);
        
        showToast({ 
          type: 'success', 
          title: 'Başarılı', 
          message: 'AI tarafından plan taslağı oluşturuldu.' 
        });
      } else {
        showToast({ 
          type: 'error', 
          title: 'Hata', 
          message: result.message || 'AI plan oluşturulamadı.' 
        });
      }
    } catch (error) {
      showToast({ 
        type: 'error', 
        title: 'Hata', 
        message: 'AI plan oluşturulurken hata oluştu.' 
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // Save plan
  const handleSave = async (status: 'draft' | 'ready') => {
    if (!title.trim()) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'Lütfen plan başlığı girin.' });
      return;
    }
    
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const result = await createPrivatePlan({
        title,
        type: selectedType,
        client_id: selectedClientId,
        plan_data: { days },
        notes,
        status
      });
      
      if (result.success) {
        showToast({ 
          type: 'success', 
          title: 'Başarılı', 
          message: `Plan ${status === 'draft' ? 'taslak olarak' : ''} kaydedildi.` 
        });
        router.push('/dashboard/pro/plans');
      } else {
        showToast({ 
          type: 'error', 
          title: 'Hata', 
          message: result.message || 'Plan kaydedilemedi.' 
        });
      }
    } catch (error) {
      showToast({ 
        type: 'error', 
        title: 'Hata', 
        message: 'Plan kaydedilirken hata oluştu.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/pro/plans" className="text-gray-500 hover:text-gray-700 transition">
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Yeni Özel Plan</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {step === 1 ? 'Plan tipi seçin' : 'Plan detaylarını düzenleyin'}
                </p>
              </div>
            </div>
            {step === 2 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  Taslak Kaydet
                </button>
                <button
                  onClick={() => handleSave('ready')}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Hazır Olarak Kaydet'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 ? (
          /* STEP 1: Type Selection */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Plan Tipi Seçin</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {PLAN_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as any)}
                    className={`p-6 rounded-2xl border-2 transition ${
                      selectedType === type.value
                        ? `${type.bgColor} border-${type.color}-300`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-14 h-14 ${type.bgColor} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                      <i className={`fa-solid ${type.icon} ${type.textColor} text-2xl`}></i>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Danışan Seçin (Opsiyonel)</h3>
                <select
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Şimdilik seçme (sonra atayabilirsiniz)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.client.id}>
                      {client.client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleContinue}
                  disabled={!selectedType}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Devam Et
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: Plan Editor */
          <div>
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Plan Başlığı *</label>
                  <input
                    type="text"
                    placeholder="Örn: Ayşe için 7 Günlük Diyet Planı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notlar</label>
                  <input
                    type="text"
                    placeholder="Plan hakkında özel notlar..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  {aiGenerating ? 'Oluşturuluyor...' : 'AI ile Taslak Oluştur'}
                </button>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-6">
              {days.map((day, dayIndex) => (
                <div key={day.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Gün {day.dayNumber}</h3>
                    <button
                      onClick={() => removeDay(dayIndex)}
                      className="text-red-600 hover:text-red-700 text-sm font-bold"
                    >
                      <i className="fa-solid fa-trash mr-1"></i>
                      Günü Sil
                    </button>
                  </div>

                  {/* Diet Plan Items */}
                  {selectedType === 'diet' && day.meals && (
                    <div className="space-y-4">
                      {day.meals.map((meal, mealIndex) => (
                        <div key={meal.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Öğün Tipi</label>
                              <select
                                value={meal.type}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                {MEAL_TYPES.map(mt => (
                                  <option key={mt.value} value={mt.value}>{mt.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Saat</label>
                              <input
                                type="time"
                                value={meal.time}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'time', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Başlık</label>
                              <input
                                type="text"
                                value={meal.title}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Örn: Protein Kahvaltı"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Kalori</label>
                              <input
                                type="text"
                                value={meal.calories}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'calories', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="300"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">İçerik</label>
                              <textarea
                                value={meal.content}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'content', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={3}
                                placeholder="Örn: 2 yumurta, 1 dilim tam buğday ekmeği..."
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">İpucu</label>
                              <input
                                type="text"
                                value={meal.tip}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'tip', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Örn: Bol su için..."
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(dayIndex, mealIndex)}
                            className="mt-3 text-red-600 hover:text-red-700 text-xs font-bold"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>
                            Öğünü Kaldır
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem(dayIndex)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 font-bold text-sm transition"
                      >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Öğün Ekle
                      </button>
                    </div>
                  )}

                  {/* Workout/Rehab Plan Items */}
                  {(selectedType === 'workout' || selectedType === 'rehab') && day.exercises && (
                    <div className="space-y-4">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div key={exercise.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Egzersiz Adı</label>
                              <input
                                type="text"
                                value={exercise.name}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Örn: Bench Press"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Set</label>
                              <input
                                type="text"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'sets', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Tekrar</label>
                              <input
                                type="text"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Dinlenme (sn)</label>
                              <input
                                type="text"
                                value={exercise.rest}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'rest', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Notlar</label>
                              <textarea
                                value={exercise.notes}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={2}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(dayIndex, exerciseIndex)}
                            className="mt-3 text-red-600 hover:text-red-700 text-xs font-bold"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>
                            Egzersizi Kaldır
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem(dayIndex)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 font-bold text-sm transition"
                      >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Egzersiz Ekle
                      </button>
                    </div>
                  )}

                  {/* Flow Plan Items */}
                  {selectedType === 'flow' && day.poses && (
                    <div className="space-y-4">
                      {day.poses.map((pose, poseIndex) => (
                        <div key={pose.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Duruş Adı</label>
                              <input
                                type="text"
                                value={pose.name}
                                onChange={(e) => updatePose(dayIndex, poseIndex, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Örn: Downward Dog"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Süre (sn)</label>
                              <input
                                type="text"
                                value={pose.duration}
                                onChange={(e) => updatePose(dayIndex, poseIndex, 'duration', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Taraf</label>
                              <select
                                value={pose.side}
                                onChange={(e) => updatePose(dayIndex, poseIndex, 'side', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="both">İki Taraf</option>
                                <option value="left">Sol</option>
                                <option value="right">Sağ</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">İpuçları</label>
                              <textarea
                                value={pose.cues}
                                onChange={(e) => updatePose(dayIndex, poseIndex, 'cues', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={2}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Geçiş</label>
                              <input
                                type="text"
                                value={pose.transition}
                                onChange={(e) => updatePose(dayIndex, poseIndex, 'transition', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(dayIndex, poseIndex)}
                            className="mt-3 text-red-600 hover:text-red-700 text-xs font-bold"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>
                            Duruşu Kaldır
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem(dayIndex)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 font-bold text-sm transition"
                      >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Duruş Ekle
                      </button>
                    </div>
                  )}

                  {/* Habit Plan Items */}
                  {selectedType === 'habit' && day.habits && (
                    <div className="space-y-4">
                      {day.habits.map((habit, habitIndex) => (
                        <div key={habit.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Alışkanlık Adı</label>
                              <input
                                type="text"
                                value={habit.name}
                                onChange={(e) => updateHabit(dayIndex, habitIndex, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Örn: 2L su iç"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Sıklık</label>
                              <select
                                value={habit.frequency}
                                onChange={(e) => updateHabit(dayIndex, habitIndex, 'frequency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="daily">Günlük</option>
                                <option value="weekly">Haftalık</option>
                                <option value="custom">Özel</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-2">Hedef</label>
                              <input
                                type="text"
                                value={habit.target}
                                onChange={(e) => updateHabit(dayIndex, habitIndex, 'target', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-2">Hatırlatıcı</label>
                              <input
                                type="time"
                                value={habit.reminder}
                                onChange={(e) => updateHabit(dayIndex, habitIndex, 'reminder', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(dayIndex, habitIndex)}
                            className="mt-3 text-red-600 hover:text-red-700 text-xs font-bold"
                          >
                            <i className="fa-solid fa-trash mr-1"></i>
                            Alışkanlığı Kaldır
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem(dayIndex)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 font-bold text-sm transition"
                      >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Alışkanlık Ekle
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addDay}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-gray-400 hover:text-gray-700 font-bold transition"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Yeni Gün Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
