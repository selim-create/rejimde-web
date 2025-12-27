'use client';

import { useState, useEffect } from "react";
import { getMyPrivatePlans, updateMyPlanProgress, MyPrivatePlan } from "@/lib/api";

export default function MyPlansPage() {
  const [plans, setPlans] = useState<MyPrivatePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MyPrivatePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMyPrivatePlans();
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlan(data[0]);
        }
      } catch (error) {
        console.error("Planlar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCheckItem = async (planId: number, itemId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setUpdating(true);

    const completedItems = plan.completed_items.includes(itemId)
      ? plan.completed_items.filter(i => i !== itemId)
      : [...plan.completed_items, itemId];

    const result = await updateMyPlanProgress(planId, { completed_items: completedItems });
    
    if (result.success) {
      // Update local state
      const updatedPlans = plans.map(p => 
        p.id === planId ? { ...p, completed_items: completedItems } : p
      );
      setPlans(updatedPlans);
      
      if (selectedPlan?.id === planId) {
        setSelectedPlan({ ...selectedPlan, completed_items: completedItems });
      }
    } else {
      alert(result.message || 'İlerleme kaydedilemedi.');
    }

    setUpdating(false);
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'diet':
        return 'fa-utensils';
      case 'workout':
        return 'fa-dumbbell';
      case 'habit':
        return 'fa-list-check';
      default:
        return 'fa-clipboard-list';
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'diet':
        return 'text-green-500 bg-green-50';
      case 'workout':
        return 'text-orange-500 bg-orange-50';
      case 'habit':
        return 'text-purple-500 bg-purple-50';
      default:
        return 'text-blue-500 bg-blue-50';
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
                  <h1 className="font-extrabold text-gray-800 text-xl tracking-tight">Planlarım</h1>
                  <p className="text-xs font-bold text-gray-500">Uzmanların sana özel hazırladığı planlar</p>
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
                <h1 className="font-extrabold text-gray-800 text-xl tracking-tight">Planlarım</h1>
                <p className="text-xs font-bold text-gray-500">Uzmanların sana özel hazırladığı planlar</p>
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {plans.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
            <i className="fa-solid fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-black text-gray-700 mb-2">Henüz Planın Yok</h3>
            <p className="text-gray-500 font-bold text-sm mb-6">Uzmanların sana özel plan hazırladığında burada görünecek.</p>
            <a href="/dashboard/experts" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition">
              Uzmanlarım
            </a>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Plans List (Left) */}
            <div className="w-full md:w-1/3">
              <h2 className="text-sm font-extrabold text-gray-400 uppercase mb-3 px-2">Tüm Planlar ({plans.length})</h2>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                      selectedPlan?.id === plan.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPlanColor(plan.type)}`}>
                        <i className={`fa-solid ${getPlanIcon(plan.type)}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-800 text-sm truncate">{plan.title}</h3>
                        <p className="text-xs text-gray-500 font-bold truncate">{plan.expert.name}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${plan.progress_percent}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                      İlerleme: {plan.progress_percent}%
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Detail (Right) */}
            <div className="flex-1">
              {selectedPlan ? (
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getPlanColor(selectedPlan.type)}`}>
                        <i className={`fa-solid ${getPlanIcon(selectedPlan.type)} text-2xl`}></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-800">{selectedPlan.title}</h2>
                        <p className="text-sm text-gray-500 font-bold">{selectedPlan.expert.name} tarafından hazırlandı</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      selectedPlan.status === 'active' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedPlan.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500">İlerleme</span>
                      <span className="text-lg font-black text-blue-600">{selectedPlan.progress_percent}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${selectedPlan.progress_percent}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-2">
                      Atanma Tarihi: {new Date(selectedPlan.assigned_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>

                  {/* Plan Content */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-gray-400 uppercase mb-3">Plan İçeriği</h3>
                    
                    {selectedPlan.plan_data && typeof selectedPlan.plan_data === 'object' ? (
                      Object.entries(selectedPlan.plan_data).map(([key, value]: [string, any]) => {
                        if (Array.isArray(value)) {
                          return (
                            <div key={key} className="space-y-2">
                              <h4 className="text-sm font-bold text-gray-700 capitalize mb-2">{key}</h4>
                              {value.map((item: any, idx: number) => {
                                const itemId = `${key}-${idx}`;
                                const isCompleted = selectedPlan.completed_items.includes(itemId);
                                
                                return (
                                  <label 
                                    key={itemId}
                                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                                      isCompleted 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-white border-gray-200 hover:border-blue-200'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isCompleted}
                                      onChange={() => handleCheckItem(selectedPlan.id, itemId)}
                                      disabled={updating}
                                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                      <p className={`text-sm font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                        {typeof item === 'string' ? item : item.name || item.title || JSON.stringify(item)}
                                      </p>
                                      {typeof item === 'object' && item.description && (
                                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                        <i className="fa-solid fa-file-lines text-4xl text-gray-300 mb-3"></i>
                        <p className="text-sm text-gray-500 font-bold">Plan detayları yükleniyor...</p>
                      </div>
                    )}
                  </div>

                  {/* Expert Info */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedPlan.expert.avatar} className="w-10 h-10 rounded-full border-2 border-gray-100" alt={selectedPlan.expert.name} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500">Planı Hazırlayan</p>
                        <p className="text-sm font-black text-gray-800">{selectedPlan.expert.name}</p>
                      </div>
                      <a 
                        href={`/dashboard/inbox?expertId=${selectedPlan.expert.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn btn-game hover:bg-blue-500 transition"
                      >
                        <i className="fa-solid fa-message mr-2"></i> Mesaj Gönder
                      </a>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
                  <i className="fa-solid fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-black text-gray-700 mb-2">Plan Seç</h3>
                  <p className="text-gray-500 font-bold text-sm">Detayları görmek için soldan bir plan seç.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
