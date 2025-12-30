'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  getPrivatePlan,
  updatePrivatePlan,
  updatePrivatePlanStatus,
  assignPrivatePlan,
  duplicatePrivatePlan,
  getProClients,
  type PrivatePlan,
  type ClientListItem 
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// Re-use configurations from create page
const PLAN_TYPE_CONFIG: Record<string, any> = {
  diet: { label: 'Diyet Planı', icon: 'fa-utensils', color: 'green' },
  workout: { label: 'Egzersiz Planı', icon: 'fa-dumbbell', color: 'blue' },
  flow: { label: 'Yoga/Pilates', icon: 'fa-spa', color: 'purple' },
  rehab: { label: 'Rehabilitasyon', icon: 'fa-heart-pulse', color: 'red' },
  habit: { label: 'Alışkanlık', icon: 'fa-check-circle', color: 'amber' }
};

const STATUS_CONFIG: Record<string, any> = {
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-600' },
  ready: { label: 'Hazır', color: 'bg-blue-100 text-blue-600' },
  assigned: { label: 'Atandı', color: 'bg-green-100 text-green-600' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-600' },
  completed: { label: 'Tamamlandı', color: 'bg-purple-100 text-purple-600' }
};

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Kahvaltı' },
  { value: 'lunch', label: 'Öğle' },
  { value: 'dinner', label: 'Akşam' },
  { value: 'snack', label: 'Ara Öğün' },
];

export default function EditPrivatePlanPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const planId = parseInt(params.id as string);
  
  // State
  const [plan, setPlan] = useState<PrivatePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  
  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState<number | ''>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch plan data
  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const data = await getPrivatePlan(planId);
        if (data) {
          setPlan(data);
        } else {
          showToast({ type: 'error', title: 'Hata', message: 'Plan bulunamadı.' });
          router.push('/dashboard/pro/plans');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        showToast({ type: 'error', title: 'Hata', message: 'Plan yüklenirken hata oluştu.' });
      } finally {
        setLoading(false);
      }
    };
    
    const fetchClients = async () => {
      try {
        const result = await getProClients({ status: 'active' });
        setClients(result.clients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchPlan();
    fetchClients();
  }, [planId]);

  // Update plan field
  const updateField = (field: keyof PrivatePlan, value: any) => {
    if (plan) {
      setPlan({ ...plan, [field]: value });
    }
  };

  // Update day item (meal/exercise/pose/habit)
  const updateDayItem = (dayIndex: number, itemIndex: number, field: string, value: any) => {
    if (!plan) return;
    
    const newPlanData = { ...plan.plan_data };
    const days = newPlanData.days || [];
    
    if (days[dayIndex]) {
      const day = days[dayIndex];
      
      if (plan.type === 'diet' && day.meals && day.meals[itemIndex]) {
        day.meals[itemIndex][field] = value;
      } else if ((plan.type === 'workout' || plan.type === 'rehab') && day.exercises && day.exercises[itemIndex]) {
        day.exercises[itemIndex][field] = value;
      } else if (plan.type === 'flow' && day.poses && day.poses[itemIndex]) {
        day.poses[itemIndex][field] = value;
      } else if (plan.type === 'habit' && day.habits && day.habits[itemIndex]) {
        day.habits[itemIndex][field] = value;
      }
      
      setPlan({ ...plan, plan_data: newPlanData });
    }
  };

  // Add day
  const addDay = () => {
    if (!plan) return;
    
    const newPlanData = { ...plan.plan_data };
    const days = newPlanData.days || [];
    const newDay: any = {
      id: `${days.length + 1}`,
      dayNumber: days.length + 1
    };
    
    // Initialize with empty items based on type
    if (plan.type === 'diet') {
      newDay.meals = [{ id: 'm1', type: 'breakfast', time: '08:00', title: '', content: '', calories: '', tags: [], tip: '' }];
    } else if (plan.type === 'workout' || plan.type === 'rehab') {
      newDay.exercises = [{ id: 'e1', name: '', sets: '3', reps: '12', rest: '60', notes: '', tags: [] }];
    } else if (plan.type === 'flow') {
      newDay.poses = [{ id: 'p1', name: '', duration: '30', side: 'both', cues: '', transition: '' }];
    } else if (plan.type === 'habit') {
      newDay.habits = [{ id: 'h1', name: '', frequency: 'daily', target: '1', reminder: '' }];
    }
    
    newPlanData.days = [...days, newDay];
    setPlan({ ...plan, plan_data: newPlanData });
  };

  // Remove day
  const removeDay = (dayIndex: number) => {
    if (!plan) return;
    
    const newPlanData = { ...plan.plan_data };
    const days = newPlanData.days || [];
    
    if (days.length === 1) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'En az bir gün olmalıdır.' });
      return;
    }
    
    newPlanData.days = days.filter((_: any, i: number) => i !== dayIndex);
    setPlan({ ...plan, plan_data: newPlanData });
  };

  // Add item to day
  const addItem = (dayIndex: number) => {
    if (!plan) return;
    
    const newPlanData = { ...plan.plan_data };
    const days = newPlanData.days || [];
    
    if (days[dayIndex]) {
      const day = days[dayIndex];
      
      if (plan.type === 'diet') {
        day.meals = [...(day.meals || []), { 
          id: `m${Date.now()}`, type: 'breakfast', time: '08:00', title: '', content: '', calories: '', tags: [], tip: '' 
        }];
      } else if (plan.type === 'workout' || plan.type === 'rehab') {
        day.exercises = [...(day.exercises || []), { 
          id: `e${Date.now()}`, name: '', sets: '3', reps: '12', rest: '60', notes: '', tags: [] 
        }];
      } else if (plan.type === 'flow') {
        day.poses = [...(day.poses || []), { 
          id: `p${Date.now()}`, name: '', duration: '30', side: 'both', cues: '', transition: '' 
        }];
      } else if (plan.type === 'habit') {
        day.habits = [...(day.habits || []), { 
          id: `h${Date.now()}`, name: '', frequency: 'daily', target: '1', reminder: '' 
        }];
      }
      
      setPlan({ ...plan, plan_data: newPlanData });
    }
  };

  // Remove item from day
  const removeItem = (dayIndex: number, itemIndex: number) => {
    if (!plan) return;
    
    const newPlanData = { ...plan.plan_data };
    const days = newPlanData.days || [];
    
    if (days[dayIndex]) {
      const day = days[dayIndex];
      
      if (plan.type === 'diet' && day.meals) {
        day.meals = day.meals.filter((_: any, i: number) => i !== itemIndex);
      } else if ((plan.type === 'workout' || plan.type === 'rehab') && day.exercises) {
        day.exercises = day.exercises.filter((_: any, i: number) => i !== itemIndex);
      } else if (plan.type === 'flow' && day.poses) {
        day.poses = day.poses.filter((_: any, i: number) => i !== itemIndex);
      } else if (plan.type === 'habit' && day.habits) {
        day.habits = day.habits.filter((_: any, i: number) => i !== itemIndex);
      }
      
      setPlan({ ...plan, plan_data: newPlanData });
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!plan || !plan.title.trim()) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'Lütfen plan başlığı girin.' });
      return;
    }
    
    setSaving(true);
    try {
      const result = await updatePrivatePlan(planId, {
        title: plan.title,
        plan_data: plan.plan_data,
        notes: plan.notes
      });
      
      if (result.success) {
        showToast({ type: 'success', title: 'Başarılı', message: 'Plan güncellendi.' });
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message || 'Plan güncellenemedi.' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Plan güncellenirken hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  // Change status
  const handleChangeStatus = async () => {
    if (!selectedStatus) return;
    
    try {
      const result = await updatePrivatePlanStatus(planId, selectedStatus as any);
      
      if (result.success) {
        showToast({ type: 'success', title: 'Başarılı', message: 'Durum güncellendi.' });
        if (plan) setPlan({ ...plan, status: selectedStatus as any });
        setShowStatusModal(false);
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message || 'Durum güncellenemedi.' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Durum güncellenirken hata oluştu.' });
    }
  };

  // Assign to client
  const handleAssign = async () => {
    if (!selectedClientForAssign) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'Lütfen danışan seçin.' });
      return;
    }
    
    try {
      const result = await assignPrivatePlan(planId, parseInt(selectedClientForAssign as string));
      
      if (result.success) {
        showToast({ type: 'success', title: 'Başarılı', message: 'Plan danışana atandı.' });
        // Refresh plan data
        const updatedPlan = await getPrivatePlan(planId);
        if (updatedPlan) setPlan(updatedPlan);
        setShowAssignModal(false);
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message || 'Plan atanamadı.' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Plan atanırken hata oluştu.' });
    }
  };

  // Duplicate plan
  const handleDuplicate = async () => {
    if (!plan) return;
    
    try {
      const result = await duplicatePrivatePlan(planId, `${plan.title} (Kopya)`);
      
      if (result.success && result.plan) {
        showToast({ type: 'success', title: 'Başarılı', message: 'Plan kopyalandı.' });
        router.push(`/dashboard/pro/plans/${result.plan.id}`);
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message || 'Plan kopyalanamadı.' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Plan kopyalanırken hata oluştu.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-gray-400"></i>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const typeConfig = PLAN_TYPE_CONFIG[plan.type];
  const statusConfig = STATUS_CONFIG[plan.status];
  const days = plan.plan_data?.days || [];

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
                <h1 className="text-2xl font-extrabold text-gray-900">Planı Düzenle</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 ${typeConfig?.label ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-lg text-xs font-bold`}>
                    {typeConfig?.label || plan.type}
                  </span>
                  <span className={`px-2 py-1 ${statusConfig?.color || 'bg-gray-100 text-gray-600'} rounded-lg text-xs font-bold`}>
                    {statusConfig?.label || plan.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-sm transition"
              >
                <i className="fa-solid fa-edit mr-1"></i>
                Durum Değiştir
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition"
              >
                <i className="fa-solid fa-user-plus mr-1"></i>
                Danışana Ata
              </button>
              <button
                onClick={handleDuplicate}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-sm transition"
              >
                <i className="fa-solid fa-copy mr-1"></i>
                Kopyala
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Plan Başlığı *</label>
              <input
                type="text"
                value={plan.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notlar</label>
              <input
                type="text"
                value={plan.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Client Info */}
          {plan.client && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <img 
                  src={plan.client.avatar} 
                  alt={plan.client.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">Atanan Danışan</p>
                  <p className="text-sm text-gray-600">{plan.client.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Days */}
        <div className="space-y-6">
          {days.map((day: any, dayIndex: number) => (
            <div key={day.id || dayIndex} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
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

              {/* Diet Items */}
              {plan.type === 'diet' && day.meals && (
                <div className="space-y-4">
                  {day.meals.map((meal: any, mealIndex: number) => (
                    <div key={meal.id || mealIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Öğün Tipi</label>
                          <select
                            value={meal.type}
                            onChange={(e) => updateDayItem(dayIndex, mealIndex, 'type', e.target.value)}
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
                            onChange={(e) => updateDayItem(dayIndex, mealIndex, 'time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Başlık</label>
                          <input
                            type="text"
                            value={meal.title}
                            onChange={(e) => updateDayItem(dayIndex, mealIndex, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Kalori</label>
                          <input
                            type="text"
                            value={meal.calories}
                            onChange={(e) => updateDayItem(dayIndex, mealIndex, 'calories', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">İçerik</label>
                          <textarea
                            value={meal.content}
                            onChange={(e) => updateDayItem(dayIndex, mealIndex, 'content', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">İpucu</label>
                          <input
                            type="text"
                            value={meal.tip}
                            onChange={(e) => updateDayItem(dayIndex, mealIndex, 'tip', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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

              {/* Exercise Items */}
              {(plan.type === 'workout' || plan.type === 'rehab') && day.exercises && (
                <div className="space-y-4">
                  {day.exercises.map((exercise: any, exerciseIndex: number) => (
                    <div key={exercise.id || exerciseIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Egzersiz Adı</label>
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => updateDayItem(dayIndex, exerciseIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Set</label>
                          <input
                            type="text"
                            value={exercise.sets}
                            onChange={(e) => updateDayItem(dayIndex, exerciseIndex, 'sets', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Tekrar</label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) => updateDayItem(dayIndex, exerciseIndex, 'reps', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Dinlenme (sn)</label>
                          <input
                            type="text"
                            value={exercise.rest}
                            onChange={(e) => updateDayItem(dayIndex, exerciseIndex, 'rest', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Notlar</label>
                          <textarea
                            value={exercise.notes}
                            onChange={(e) => updateDayItem(dayIndex, exerciseIndex, 'notes', e.target.value)}
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

              {/* Flow Items */}
              {plan.type === 'flow' && day.poses && (
                <div className="space-y-4">
                  {day.poses.map((pose: any, poseIndex: number) => (
                    <div key={pose.id || poseIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Duruş Adı</label>
                          <input
                            type="text"
                            value={pose.name}
                            onChange={(e) => updateDayItem(dayIndex, poseIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Süre (sn)</label>
                          <input
                            type="text"
                            value={pose.duration}
                            onChange={(e) => updateDayItem(dayIndex, poseIndex, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Taraf</label>
                          <select
                            value={pose.side}
                            onChange={(e) => updateDayItem(dayIndex, poseIndex, 'side', e.target.value)}
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
                            onChange={(e) => updateDayItem(dayIndex, poseIndex, 'cues', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Geçiş</label>
                          <input
                            type="text"
                            value={pose.transition}
                            onChange={(e) => updateDayItem(dayIndex, poseIndex, 'transition', e.target.value)}
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

              {/* Habit Items */}
              {plan.type === 'habit' && day.habits && (
                <div className="space-y-4">
                  {day.habits.map((habit: any, habitIndex: number) => (
                    <div key={habit.id || habitIndex} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Alışkanlık Adı</label>
                          <input
                            type="text"
                            value={habit.name}
                            onChange={(e) => updateDayItem(dayIndex, habitIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Sıklık</label>
                          <select
                            value={habit.frequency}
                            onChange={(e) => updateDayItem(dayIndex, habitIndex, 'frequency', e.target.value)}
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
                            onChange={(e) => updateDayItem(dayIndex, habitIndex, 'target', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-2">Hatırlatıcı</label>
                          <input
                            type="time"
                            value={habit.reminder}
                            onChange={(e) => updateDayItem(dayIndex, habitIndex, 'reminder', e.target.value)}
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

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Danışana Ata</h3>
            <select
              value={selectedClientForAssign}
              onChange={(e) => setSelectedClientForAssign(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Danışan seçin</option>
              {clients.map(client => (
                <option key={client.id} value={client.client.id}>
                  {client.client.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
              >
                İptal
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition"
              >
                Ata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Durumu Değiştir</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Durum seçin</option>
              <option value="draft">Taslak</option>
              <option value="ready">Hazır</option>
              <option value="assigned">Atandı</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
              >
                İptal
              </button>
              <button
                onClick={handleChangeStatus}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
