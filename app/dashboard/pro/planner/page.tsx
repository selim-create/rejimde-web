"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  generateAIPlan, 
  createPrivatePlan,
  getProClients,
  type ClientListItem,
  type AIGeneratePlanRequest,
  type AIGeneratePlanResponse
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const PLAN_TYPES = [
  { value: 'diet', label: 'Diyet Planı', icon: 'fa-utensils' },
  { value: 'workout', label: 'Egzersiz', icon: 'fa-dumbbell' },
  { value: 'flow', label: 'Yoga/Pilates', icon: 'fa-spa' },
  { value: 'rehab', label: 'Rehabilitasyon', icon: 'fa-heart-pulse' },
  { value: 'habit', label: 'Alışkanlık', icon: 'fa-check-circle' }
];

export default function AIPlannerPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
  const [selectedPlanType, setSelectedPlanType] = useState<'diet' | 'workout' | 'flow' | 'rehab' | 'habit'>('diet');
  
  // Parameters
  const [goal, setGoal] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [restrictionInput, setRestrictionInput] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // AI Generation
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<AIGeneratePlanResponse | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await getProClients({ status: 'active' });
        setClients(result.clients || []);
        if (result.clients && result.clients.length > 0) {
          setSelectedClientId(result.clients[0].client.id);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  const handleAddRestriction = () => {
    if (restrictionInput.trim() && !restrictions.includes(restrictionInput.trim())) {
      setRestrictions([...restrictions, restrictionInput.trim()]);
      setRestrictionInput("");
    }
  };

  const removeRestriction = (restriction: string) => {
    setRestrictions(restrictions.filter(r => r !== restriction));
  };

  const handleGenerate = async () => {
    if (!goal.trim()) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'Lütfen hedef girin.' });
      return;
    }

    setGenerating(true);
    try {
      const request: AIGeneratePlanRequest = {
        client_id: selectedClientId,
        plan_type: selectedPlanType,
        parameters: {
          goal,
          duration_days: durationDays,
          restrictions: restrictions.length > 0 ? restrictions : undefined,
          additional_notes: additionalNotes || undefined
        }
      };

      const result = await generateAIPlan(request);
      
      if (result.success && result.data) {
        setGeneratedPlan(result.data);
        showToast({ 
          type: 'success', 
          title: 'Başarılı', 
          message: 'AI tarafından plan oluşturuldu.' 
        });
      } else {
        showToast({ 
          type: 'error', 
          title: 'Hata', 
          message: result.message || 'Plan oluşturulamadı.' 
        });
      }
    } catch (error) {
      showToast({ 
        type: 'error', 
        title: 'Hata', 
        message: 'Plan oluşturulurken hata oluştu.' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePlan = async (assignImmediately: boolean = false) => {
    if (!generatedPlan || !generatedPlan.draft_plan) {
      showToast({ type: 'warning', title: 'Uyarı', message: 'Önce plan oluşturun.' });
      return;
    }

    setSaving(true);
    try {
      const title = generatedPlan.draft_plan.title || `${selectedPlanType === 'diet' ? 'Diyet' : selectedPlanType === 'workout' ? 'Egzersiz' : selectedPlanType === 'flow' ? 'Yoga' : selectedPlanType === 'rehab' ? 'Rehabilitasyon' : 'Alışkanlık'} Planı - ${new Date().toLocaleDateString('tr-TR')}`;
      
      const result = await createPrivatePlan({
        title,
        type: selectedPlanType,
        client_id: assignImmediately ? selectedClientId : undefined,
        plan_data: generatedPlan.draft_plan,
        notes: goal,
        status: assignImmediately ? 'assigned' : 'draft'
      });

      if (result.success) {
        showToast({ 
          type: 'success', 
          title: 'Başarılı', 
          message: assignImmediately ? 'Plan kaydedildi ve danışana atandı.' : 'Plan taslak olarak kaydedildi.' 
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
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans text-rejimde-text">
        
        {/* Planner Header */}
        <header className="bg-rejimde-dark text-white h-16 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/pro" className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-bold">
                    <i className="fa-solid fa-arrow-left"></i> Panele Dön
                </Link>
                <div className="h-6 w-px bg-slate-600"></div>
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-rejimde-purple"></i>
                    <span className="font-extrabold tracking-tight">AI Co-Pilot</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {generatedPlan && (
                  <>
                    <button 
                      onClick={() => handleSavePlan(false)}
                      disabled={saving}
                      className="bg-gray-600 text-white px-6 py-2 rounded-xl font-extrabold text-sm shadow-btn hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-save"></i> <span className="hidden md:inline">Taslak Kaydet</span>
                    </button>
                    <button 
                      onClick={() => handleSavePlan(true)}
                      disabled={saving}
                      className="bg-rejimde-green text-white px-6 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-rejimde-greenDark btn-game flex items-center gap-2 hover:bg-green-500 disabled:opacity-50"
                    >
                      <i className="fa-solid fa-paper-plane"></i> <span className="hidden md:inline">Kaydet ve Gönder</span>
                    </button>
                  </>
                )}
            </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT: Parameters Form */}
            <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-extrabold text-gray-700 text-sm uppercase">Plan Parametreleri</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Client Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Danışan</label>
                      <select
                        value={selectedClientId || ''}
                        onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rejimde-purple"
                      >
                        <option value="">Seçilmedi</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.client.id}>
                            {client.client.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Plan Tipi</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLAN_TYPES.map(type => (
                          <button
                            key={type.value}
                            onClick={() => setSelectedPlanType(type.value as any)}
                            className={`p-3 rounded-lg border-2 transition text-sm font-bold ${
                              selectedPlanType === type.value
                                ? 'bg-purple-100 border-rejimde-purple text-rejimde-purple'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <i className={`fa-solid ${type.icon} mb-1`}></i>
                            <div className="text-xs">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Goal */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Hedef / Amaç *</label>
                      <textarea
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Örn: Kilo vermek için düşük kalorili, gluten hassasiyeti olan danışan için..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rejimde-purple resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Süre (Gün)</label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={durationDays}
                        onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rejimde-purple"
                      />
                    </div>

                    {/* Restrictions */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Kısıtlamalar / Tercihler</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={restrictionInput}
                          onChange={(e) => setRestrictionInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddRestriction()}
                          placeholder="Örn: Glutensiz"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rejimde-purple"
                        />
                        <button
                          onClick={handleAddRestriction}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold transition"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {restrictions.map(restriction => (
                          <span 
                            key={restriction}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            {restriction}
                            <button
                              onClick={() => removeRestriction(restriction)}
                              className="text-blue-400 hover:text-blue-600"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Ek Notlar</label>
                      <textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Diğer özel istekler..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rejimde-purple resize-none"
                        rows={3}
                      />
                    </div>
                </div>

                {/* Generate Button */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !goal.trim()}
                      className="w-full bg-rejimde-purple hover:bg-purple-600 text-white py-3 rounded-xl font-extrabold text-sm shadow-btn transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                          AI ile Plan Oluştur
                        </>
                      )}
                    </button>
                </div>
            </div>

            {/* RIGHT: Preview */}
            <div className="flex-1 bg-slate-100 flex flex-col h-full overflow-hidden relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                {generatedPlan ? (
                  <>
                    {/* Toolbar */}
                    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="font-extrabold text-gray-700">AI Taslak Plan</h2>
                            {generatedPlan.suggestions && generatedPlan.suggestions.length > 0 && (
                              <span className="bg-purple-100 text-rejimde-purpleDark px-2 py-0.5 rounded text-xs font-black uppercase">
                                {generatedPlan.suggestions.length} Öneri
                              </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <span className="text-xs font-bold text-gray-400">
                              {generatedPlan.tokens_used} token kullanıldı
                            </span>
                        </div>
                    </div>

                    {/* Plan Content */}
                    <div className="flex-1 overflow-y-auto p-8 relative z-10">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* Suggestions */}
                            {generatedPlan.suggestions && generatedPlan.suggestions.length > 0 && (
                              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                                <h3 className="font-extrabold text-rejimde-purpleDark mb-2 flex items-center gap-2">
                                  <i className="fa-solid fa-lightbulb"></i>
                                  AI Önerileri
                                </h3>
                                <ul className="space-y-1">
                                  {generatedPlan.suggestions.map((suggestion, index) => (
                                    <li key={index} className="text-sm font-bold text-gray-700">
                                      • {suggestion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Days */}
                            {generatedPlan.draft_plan?.days?.map((day: any, index: number) => (
                              <div key={index} className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-rejimde-blue text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                                      {day.dayNumber}. Gün
                                    </span>
                                    {day.title && (
                                      <h3 className="font-extrabold text-gray-700">{day.title}</h3>
                                    )}
                                  </div>
                                </div>

                                <div className="divide-y divide-gray-100">
                                  {/* Diet meals */}
                                  {selectedPlanType === 'diet' && day.meals?.map((meal: any, mealIndex: number) => (
                                    <div key={mealIndex} className="p-4 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl shrink-0">
                                        <i className="fa-solid fa-utensils"></i>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex justify-between">
                                          <h4 className="font-extrabold text-gray-800 text-sm">{meal.title || meal.type}</h4>
                                          {meal.calories && (
                                            <span className="text-xs font-bold text-gray-400">{meal.calories} kcal</span>
                                          )}
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 mt-1">{meal.content}</p>
                                        {meal.tip && (
                                          <p className="text-xs text-gray-400 mt-2 italic">💡 {meal.tip}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Workout/Rehab exercises */}
                                  {(selectedPlanType === 'workout' || selectedPlanType === 'rehab') && day.exercises?.map((exercise: any, exIndex: number) => (
                                    <div key={exIndex} className="p-4 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl shrink-0">
                                        <i className="fa-solid fa-dumbbell"></i>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-extrabold text-gray-800 text-sm">{exercise.name}</h4>
                                        <p className="text-sm font-bold text-gray-500 mt-1">
                                          {exercise.sets} set × {exercise.reps} tekrar • {exercise.rest}sn dinlenme
                                        </p>
                                        {exercise.notes && (
                                          <p className="text-xs text-gray-400 mt-2">{exercise.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Flow poses */}
                                  {selectedPlanType === 'flow' && day.poses?.map((pose: any, poseIndex: number) => (
                                    <div key={poseIndex} className="p-4 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl shrink-0">
                                        <i className="fa-solid fa-spa"></i>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-extrabold text-gray-800 text-sm">{pose.name}</h4>
                                        <p className="text-sm font-bold text-gray-500 mt-1">
                                          {pose.duration}sn • {pose.side}
                                        </p>
                                        {pose.cues && (
                                          <p className="text-xs text-gray-400 mt-2">{pose.cues}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Habits */}
                                  {selectedPlanType === 'habit' && day.habits?.map((habit: any, habitIndex: number) => (
                                    <div key={habitIndex} className="p-4 flex items-start gap-4">
                                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl shrink-0">
                                        <i className="fa-solid fa-check-circle"></i>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-extrabold text-gray-800 text-sm">{habit.name}</h4>
                                        <p className="text-sm font-bold text-gray-500 mt-1">
                                          {habit.frequency} • Hedef: {habit.target}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-wand-magic-sparkles text-3xl text-rejimde-purple"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AI Plan Oluşturucu</h3>
                      <p className="text-gray-500 mb-4">Soldaki formu doldurun ve AI ile plan oluşturun</p>
                    </div>
                  </div>
                )}
            </div>
        </div>
    </div>
  );
}