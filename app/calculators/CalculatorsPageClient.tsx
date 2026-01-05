"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMe, updateUser, earnPoints, saveCalculatorResult } from "@/lib/api"; 
import MascotDisplay from "@/components/MascotDisplay"; // Added missing import

// SEO metadata set in useEffect since this is a client component

// Hesaplama Türleri
type CalculatorType = 'bmi' | 'ideal_weight' | 'calorie' | 'water' | 'macro' | 'body_fat' | 'pregnancy' | 'bmr' | 'waist_hip' | null;

export default function CalculatorsPageClient() {
  const [activeTool, setActiveTool] = useState<CalculatorType>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Kaydetme durumu için state
  const [savedCalculators, setSavedCalculators] = useState<string[]>([]);
  
  // Custom Modal States
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState({ title: "", desc: "", type: "success" });

  // Ortak Input State'leri
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [age, setAge] = useState(30);
  const [activity, setActivity] = useState(1.2); 
  
  // Yeni State'ler
  const [waist, setWaist] = useState(80); 
  const [neck, setNeck] = useState(35);   
  const [hip, setHip] = useState(95);     

  // Oturum ve Veri Kontrolü
  useEffect(() => {
    async function init() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        if (token) {
            setIsLoggedIn(true);
            const user = await getMe();
            if (user) {
                // Verileri doldur
                if (user.height) setHeight(parseInt(user.height));
                if (user.current_weight) setWeight(parseInt(user.current_weight));
                if (user.gender) setGender(user.gender as 'male' | 'female');
                
                // DÜZELTME: Yaşı doğum tarihinden hesapla
                if (user.birth_date) {
                    const birthYear = new Date(user.birth_date).getFullYear();
                    const currentYear = new Date().getFullYear();
                    const calculatedAge = currentYear - birthYear;
                    setAge(calculatedAge > 0 ? calculatedAge : 30);
                }
                
                if (user.activity_level) setActivity(parseFloat(user.activity_level));
            }
        }
    }
    init();
  }, []);

  // --- HESAPLAMA FONKSİYONLARI ---

  const calculateBMI = () => {
    if (!height || !weight) return "0.0";
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  };
  const bmiValue = calculateBMI();
  
  const getBMIStatus = (val: string) => {
      const v = parseFloat(val);
      if (isNaN(v) || v === 0) return { label: "--", color: "text-gray-400", bg: "bg-gray-100" };
      if (v < 18.5) return { label: "Zayıf", color: "text-blue-500", bg: "bg-blue-100" };
      if (v < 25) return { label: "İdeal Kilo", color: "text-rejimde-green", bg: "bg-green-100" };
      if (v < 30) return { label: "Fazla Kilolu", color: "text-orange-500", bg: "bg-orange-100" };
      return { label: "Obezite", color: "text-rejimde-red", bg: "bg-red-100" };
  };
  const bmiStatus = getBMIStatus(bmiValue);

  const calculateIdealWeight = () => {
      if (!height) return "--";
      const heightInInches = height / 2.54;
      const base = gender === 'male' ? 50 : 45.5;
      const ideal = base + 2.3 * (heightInInches - 60);
      return ideal > 0 ? ideal.toFixed(1) : "--";
  };

  const calculateBMRRaw = () => {
      if (!weight || !height || !age) return 0;
      let bmr = (10 * weight) + (6.25 * height) - (5 * age);
      bmr += gender === 'male' ? 5 : -161;
      return bmr;
  };
  
  const calculateCalories = () => {
      const bmr = calculateBMRRaw();
      return bmr > 0 ? Math.round(bmr * activity) : "--";
  };

  const calculateWater = () => {
      if (!weight) return "--";
      return (weight * 0.033).toFixed(1);
  };

  const calculateBMR = () => {
      const bmr = calculateBMRRaw();
      return bmr > 0 ? Math.round(bmr) : "--";
  };

  const calculateBodyFat = () => {
      if (!waist || !neck || !height) return "--";
      if (waist <= neck) return "--"; 
      let bodyFat = 0;
      if (gender === 'male') {
          bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
          if (!hip) return "--";
          bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
      }
      return bodyFat > 0 ? bodyFat.toFixed(1) : "--";
  };

  const calculateWaistHipRatio = () => {
      if (!waist || !hip) return "--";
      return (waist / hip).toFixed(2);
  };
  
  const getWHRStatus = (val: string) => {
      const v = parseFloat(val);
      if (isNaN(v)) return { label: "--", color: "text-gray-400" };
      if (gender === 'male') {
          if (v <= 0.90) return { label: "Düşük Risk", color: "text-rejimde-green" };
          if (v <= 0.95) return { label: "Orta Risk", color: "text-orange-500" };
          return { label: "Yüksek Risk", color: "text-rejimde-red" };
      } else {
          if (v <= 0.80) return { label: "Düşük Risk", color: "text-rejimde-green" };
          if (v <= 0.85) return { label: "Orta Risk", color: "text-orange-500" };
          return { label: "Yüksek Risk", color: "text-rejimde-red" };
      }
  };
  const whrValue = calculateWaistHipRatio();
  const whrStatus = getWHRStatus(whrValue);

  // SONUÇLARI KAYDETME VE PUAN KAZANMA
  const handleSaveResults = async () => {
      setIsSaving(true);
      try {
          // 1. Profil Verilerini Güncelle
          // Not: Yaşı güncellemiyoruz çünkü doğum tarihini değiştirmek için Ayarlar sayfası kullanılmalı.
          // Sadece anlık değişebilen fiziksel verileri güncelliyoruz.
          const updateData = {
              height: height.toString(),
              current_weight: weight.toString(),
              gender: gender,
              activity_level: activity.toString()
          };
          
          await updateUser(updateData);

          // 2. Puan Kazan
          const pointRes = await earnPoints('update_weight');

          if (pointRes.success) {
              setResultMessage({
                  type: "success",
                  title: "Harika İş! 🎉",
                  desc: `Verilerin güncellendi ve ${pointRes.data.earned} Puan kazandın! Profilin şimdi çok daha güçlü.`
              });
          } else {
              setResultMessage({
                  type: "info",
                  title: "Bilgiler Güncel",
                  desc: `Verilerin kaydedildi. (Not: ${pointRes.message})`
              });
          }
          setShowResultModal(true);

      } catch (error) {
          console.error(error);
          setResultMessage({ type: "error", title: "Hata", desc: "Bir sorun oluştu." });
          setShowResultModal(true);
      } finally {
          setIsSaving(false);
      }
  };

  // Hesaplama sonucunu kaydetme ve puan kazanma
  const handleSaveCalculatorResult = async (calculatorType: string, result: any) => {
      if (!isLoggedIn) {
          setResultMessage({
              type: "info",
              title: "Giriş Yapmalısın",
              desc: "Sonuçları kaydetmek ve puan kazanmak için giriş yapmalısın."
          });
          setShowResultModal(true);
          return;
      }
      
      if (savedCalculators.includes(calculatorType)) {
          return; // Zaten kaydedilmiş
      }
      
      setIsSaving(true);
      try {
          const res = await saveCalculatorResult(calculatorType, result);
          if (res.success) {
              setSavedCalculators([...savedCalculators, calculatorType]);
              setResultMessage({
                  type: "success",
                  title: "Harika! 🎉",
                  desc: `${res.points_earned || 50} puan kazandın! Hesaplama sonuçların kaydedildi.`
              });
              setShowResultModal(true);
          } else {
              setResultMessage({
                  type: "error",
                  title: "Hata",
                  desc: res.message || "Sonuçlar kaydedilemedi."
              });
              setShowResultModal(true);
          }
      } catch (error) {
          console.error(error);
          setResultMessage({ type: "error", title: "Hata", desc: "Bir sorun oluştu." });
          setShowResultModal(true);
      } finally {
          setIsSaving(false);
      }
  };

  const tools = [
    { id: 'ideal_weight', icon: "fa-weight-hanging", color: "text-rejimde-green", bg: "bg-green-100", title: "İdeal Kilo", desc: "Boyuna ve cinsiyetine göre en sağlıklı kilo aralığını öğren.", borderHover: "hover:border-rejimde-green" },
    { id: 'calorie', icon: "fa-fire-flame-curved", color: "text-orange-500", bg: "bg-orange-100", title: "Günlük Kalori", desc: "Kilo hedefine ulaşmak için günde kaç kalori almalısın?", borderHover: "hover:border-orange-500" },
    { id: 'water', icon: "fa-glass-water", color: "text-rejimde-blue", bg: "bg-blue-100", title: "Su İhtiyacı", desc: "Vücudunun susuz kalmaması için gereken günlük miktar.", borderHover: "hover:border-rejimde-blue" },
    { id: 'bmi', icon: "fa-person", color: "text-rejimde-purple", bg: "bg-purple-100", title: "VKİ Analizi", desc: "Vücut Kitle İndeksini hesapla ve sağlık durumunu gör.", borderHover: "hover:border-rejimde-purple" },
    { id: 'body_fat', icon: "fa-ruler-combined", color: "text-rejimde-red", bg: "bg-red-100", title: "Yağ Oranı", desc: "Mezura ölçülerini girerek vücut yağ yüzdene en yakın tahmini sonucu al.", borderHover: "hover:border-rejimde-red" },
    { id: 'bmr', icon: "fa-battery-full", color: "text-rejimde-yellowDark", bg: "bg-yellow-100", title: "Bazal Metabolizma", desc: "Hiç hareket etmeden, sadece yaşamak için vücudunun yaktığı enerjiyi öğren.", borderHover: "hover:border-rejimde-yellow" },
    { id: 'waist_hip', icon: "fa-person-dots-from-line", color: "text-teal-600", bg: "bg-teal-100", title: "Bel/Kalça Oranı", desc: "Bel ve kalça ölçülerinle metabolik sağlık riskini analiz et.", borderHover: "hover:border-teal-400" },
    { id: null, icon: "fa-baby-carriage", color: "text-gray-400", bg: "bg-gray-100", title: "Gebelik (Yakında)", desc: "Hamilelik haftana göre kilo takibi.", borderHover: "hover:border-gray-300" },
  ];

  return (
    <div className="min-h-screen pb-20">
      
      {/* HERO & QUICK BMI */}
      <div className="bg-rejimde-blue text-white py-12 relative overflow-hidden mb-12 shadow-md">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10 animate-pulse">
                    <i className="fa-solid fa-calculator text-yellow-300"></i> Ücretsiz Araçlar
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                    Vücudunun şifrelerini <br />
                    <span className="text-blue-200">birlikte çözelim.</span>
                </h1>
                <p className="text-blue-100 font-bold text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                    İdeal kilonu, günlük kalori ihtiyacını veya su hedefini saniyeler içinde öğren. Bilimsel formüllerle çalışıyoruz.
                </p>
            </div>

            {/* Quick Interactive Card */}
            <div className="bg-white text-rejimde-text rounded-3xl p-6 md:p-8 shadow-float relative max-w-md mx-auto w-full">
                <div className="absolute -top-4 -right-4 bg-rejimde-yellow text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg border-4 border-white transform rotate-12">
                    BMI
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-weight-scale text-rejimde-blue"></i>
                    Hızlı VKİ Kontrolü
                </h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Boyun</label>
                            <span className="text-sm font-black text-rejimde-blue">{height || 0} cm</span>
                        </div>
                        <input 
                          type="range" 
                          min="140" 
                          max="220" 
                          value={height || 140} 
                          onChange={(e) => setHeight(parseInt(e.target.value))} 
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rejimde-blue" 
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-black text-gray-400 uppercase">Kilon</label>
                            <span className="text-sm font-black text-rejimde-blue">{weight || 0} kg</span>
                        </div>
                        <input 
                          type="range" 
                          min="40" 
                          max="150" 
                          value={weight || 40} 
                          onChange={(e) => setWeight(parseInt(e.target.value))} 
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rejimde-blue" 
                        />
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 text-center border-2 border-dashed border-gray-200 transition-all duration-300">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Sonucun</p>
                        <div className={`text-4xl font-black mb-1 ${bmiStatus.color}`}>{bmiValue}</div>
                        <span className={`${bmiStatus.bg} ${bmiStatus.color} px-3 py-1 rounded-lg text-xs font-black uppercase inline-block`}>
                          {bmiStatus.label}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    </div>

    {/* MAIN TOOLS GRID */}
    <div className="max-w-6xl mx-auto px-4 relative">
        
        {/* Puan Banner */}
        {isLoggedIn && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl mb-8 shadow-lg">
                <div className="flex items-center gap-4">
                    <i className="fa-solid fa-coins text-yellow-300 text-3xl"></i>
                    <div>
                        <p className="font-bold text-lg">Sonuçlarını kaydet, <span className="text-yellow-300">+50 puan</span> kazan!</p>
                        <p className="text-sm text-green-100">Her hesaplama bir kez kaydedilebilir.</p>
                    </div>
                </div>
            </div>
        )}
        
        <h2 className="text-2xl font-extrabold text-gray-800 mb-8 flex items-center gap-3">
            <span className="w-8 h-8 bg-rejimde-green rounded-lg flex items-center justify-center text-white text-sm">
                <i className="fa-solid fa-shapes"></i>
            </span>
            Detaylı Hesaplamalar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <div 
                key={index} 
                onClick={() => tool.id && setActiveTool(tool.id as CalculatorType)}
                className={`bg-white border-2 border-gray-200 rounded-3xl p-6 transition shadow-sm hover:shadow-card group hover:-translate-y-1 duration-200 cursor-pointer ${tool.borderHover} ${!tool.id ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                  <div className={`w-14 h-14 ${tool.bg} rounded-2xl flex items-center justify-center ${tool.color} text-3xl mb-4 group-hover:scale-110 transition`}>
                      <i className={`fa-solid ${tool.icon}`}></i>
                  </div>
                  <h3 className={`text-lg font-extrabold text-gray-800 mb-2 transition`}>{tool.title}</h3>
                  <p className="text-sm font-bold text-gray-400 leading-snug">
                      {tool.desc}
                  </p>
              </div>
            ))}
        </div>
    </div>

    {/* MODAL: CALCULATOR OVERLAY */}
    {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setActiveTool(null)}>
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-bounce-slow max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        {activeTool === 'ideal_weight' && <><i className="fa-solid fa-weight-hanging text-rejimde-green"></i> İdeal Kilo Hesapla</>}
                        {activeTool === 'calorie' && <><i className="fa-solid fa-fire text-orange-500"></i> Kalori İhtiyacı</>}
                        {activeTool === 'water' && <><i className="fa-solid fa-glass-water text-rejimde-blue"></i> Su Tüketimi</>}
                        {activeTool === 'bmi' && <><i className="fa-solid fa-person text-rejimde-purple"></i> VKİ Analizi</>}
                        {activeTool === 'body_fat' && <><i className="fa-solid fa-ruler-combined text-rejimde-red"></i> Yağ Oranı</>}
                        {activeTool === 'bmr' && <><i className="fa-solid fa-battery-full text-rejimde-yellowDark"></i> Bazal Metabolizma</>}
                        {activeTool === 'waist_hip' && <><i className="fa-solid fa-person-dots-from-line text-teal-600"></i> Bel/Kalça Oranı</>}
                    </h3>
                    <button onClick={() => setActiveTool(null)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-6">
                    
                    {/* Common Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Cinsiyet</label>
                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${gender === 'female' ? 'bg-white text-rejimde-blue shadow-sm' : 'text-gray-400'}`}>Kadın</button>
                                <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${gender === 'male' ? 'bg-white text-rejimde-blue shadow-sm' : 'text-gray-400'}`}>Erkek</button>
                            </div>
                        </div>
                        {/* Yaş gerektirenler */}
                        {(activeTool === 'calorie' || activeTool === 'bmr' || activeTool === 'body_fat' || activeTool === 'bmi' || activeTool === 'ideal_weight') && (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Yaş</label>
                                <input 
                                    type="number" 
                                    value={age || ''} 
                                    onChange={(e) => setAge(parseInt(e.target.value) || 0)} 
                                    className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none text-center" 
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {(activeTool !== 'waist_hip') && (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Boy (cm)</label>
                                <input 
                                    type="number" 
                                    value={height || ''} 
                                    onChange={(e) => setHeight(parseInt(e.target.value) || 0)} 
                                    className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none text-center" 
                                />
                            </div>
                         )}
                         {(activeTool !== 'waist_hip' && activeTool !== 'body_fat') && (
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Kilo (kg)</label>
                                <input 
                                    type="number" 
                                    value={weight || ''} 
                                    onChange={(e) => setWeight(parseInt(e.target.value) || 0)} 
                                    className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none text-center" 
                                />
                            </div>
                         )}
                    </div>

                    {/* Extra Inputs for Body Fat & WHR */}
                    {(activeTool === 'body_fat' || activeTool === 'waist_hip') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-2">Bel Çevresi (cm)</label>
                                <input 
                                    type="number" 
                                    value={waist || ''} 
                                    onChange={(e) => setWaist(parseInt(e.target.value) || 0)} 
                                    className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none text-center" 
                                />
                            </div>
                            {(activeTool === 'body_fat' || gender === 'female') && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Kalça Çevresi (cm)</label>
                                    <input 
                                        type="number" 
                                        value={hip || ''} 
                                        onChange={(e) => setHip(parseInt(e.target.value) || 0)} 
                                        className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none text-center" 
                                        disabled={activeTool === 'body_fat' && gender === 'male'}
                                        placeholder={activeTool === 'body_fat' && gender === 'male' ? '-' : ''}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    
                    {activeTool === 'body_fat' && (
                        <div>
                             <label className="block text-xs font-black text-gray-400 uppercase mb-2">Boyun Çevresi (cm)</label>
                             <input 
                                type="number" 
                                value={neck || ''} 
                                onChange={(e) => setNeck(parseInt(e.target.value) || 0)} 
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-2 px-4 font-bold text-gray-700 outline-none text-center" 
                            />
                        </div>
                    )}

                    {activeTool === 'calorie' && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Aktivite Seviyesi</label>
                            <select 
                                value={activity} 
                                onChange={(e) => setActivity(parseFloat(e.target.value))}
                                className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl py-3 px-4 font-bold text-gray-600 outline-none cursor-pointer text-sm"
                            >
                                <option value={1.2}>Hareketsiz (Masa başı)</option>
                                <option value={1.375}>Az Hareketli (Haftada 1-3 gün spor)</option>
                                <option value={1.55}>Orta Hareketli (Haftada 3-5 gün spor)</option>
                                <option value={1.725}>Çok Hareketli (Haftada 6-7 gün spor)</option>
                            </select>
                        </div>
                    )}

                    {/* RESULT BOX */}
                    <div className="bg-rejimde-text text-white rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hesaplanan Değer</p>
                            
                            {activeTool === 'ideal_weight' && (
                                <>
                                    <div className="text-5xl font-black text-rejimde-green mb-1">{calculateIdealWeight()} <span className="text-xl">kg</span></div>
                                    <p className="text-sm font-bold text-gray-300">Senin için en sağlıklı hedef.</p>
                                </>
                            )}
                            
                            {activeTool === 'calorie' && (
                                <>
                                    <div className="text-5xl font-black text-orange-400 mb-1">{calculateCalories()} <span className="text-xl">kcal</span></div>
                                    <p className="text-sm font-bold text-gray-300">Kilonu korumak için alman gereken.</p>
                                </>
                            )}
                            
                            {activeTool === 'bmr' && (
                                <>
                                    <div className="text-5xl font-black text-yellow-400 mb-1">{calculateBMR()} <span className="text-xl">kcal</span></div>
                                    <p className="text-sm font-bold text-gray-300">Vücudunun dinlenirken yaktığı enerji.</p>
                                </>
                            )}

                            {activeTool === 'water' && (
                                <>
                                    <div className="text-5xl font-black text-blue-400 mb-1">{calculateWater()} <span className="text-xl">lt</span></div>
                                    <p className="text-sm font-bold text-gray-300">Günde ortalama içmen gereken su.</p>
                                </>
                            )}

                            {activeTool === 'bmi' && (
                                <>
                                    <div className={`text-5xl font-black mb-1 ${bmiStatus.label === 'İdeal Kilo' ? 'text-green-400' : 'text-yellow-400'}`}>{bmiValue}</div>
                                    <p className="text-sm font-bold text-gray-300">{bmiStatus.label}</p>
                                </>
                            )}
                            
                            {activeTool === 'body_fat' && (
                                <>
                                    <div className="text-5xl font-black text-rejimde-red mb-1">%{calculateBodyFat()}</div>
                                    <p className="text-sm font-bold text-gray-300">Tahmini vücut yağ oranı.</p>
                                </>
                            )}
                            
                            {activeTool === 'waist_hip' && (
                                <>
                                    <div className={`text-5xl font-black mb-1 ${whrStatus.color.replace('text-', 'text-')}`}>{whrValue}</div>
                                    <p className="text-sm font-bold text-gray-300">{whrStatus.label}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    {isLoggedIn && (
                        savedCalculators.includes(activeTool) ? (
                            <div className="bg-green-100 border-2 border-green-300 text-green-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 justify-center">
                                <i className="fa-solid fa-check-circle text-2xl"></i>
                                <div>
                                    <p className="font-black">Sonuçları kaydettin, puanı kaptın! 🎉</p>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => {
                                    const result = {
                                        type: activeTool,
                                        height,
                                        weight,
                                        age,
                                        gender,
                                        activity,
                                        ...(activeTool === 'body_fat' ? { waist, neck, hip } : {}),
                                        ...(activeTool === 'waist_hip' ? { waist, hip } : {}),
                                        value: activeTool === 'ideal_weight' ? calculateIdealWeight() :
                                               activeTool === 'calorie' ? calculateCalories() :
                                               activeTool === 'water' ? calculateWater() :
                                               activeTool === 'bmi' ? calculateBMI() :
                                               activeTool === 'body_fat' ? calculateBodyFat() :
                                               activeTool === 'bmr' ? calculateBMR() :
                                               activeTool === 'waist_hip' ? calculateWaistHipRatio() : null
                                    };
                                    handleSaveCalculatorResult(activeTool, result);
                                }}
                                disabled={isSaving}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-coins"></i>
                                        Sonuçları Kaydet (+50p)
                                    </>
                                )}
                            </button>
                        )
                    )}

                    <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-extrabold text-sm hover:bg-gray-200 transition" onClick={() => setActiveTool(null)}>
                        Kapat
                    </button>
                </div>

            </div>
        </div>
    )}

    {/* RESULT SUCCESS MODAL */}
    {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowResultModal(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${resultMessage.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500'}`}>
                    <i className={`fa-solid ${resultMessage.type === 'success' ? 'fa-trophy' : 'fa-info'} text-4xl`}></i>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">{resultMessage.title}</h3>
                <p className="text-gray-500 font-bold mb-6 text-sm">{resultMessage.desc}</p>
                <div className="flex justify-center mb-6">
                     <MascotDisplay state={resultMessage.type === 'success' ? "success_milestone" : "idle_dashboard"} size={120} showBubble={false} />
                </div>
                <button onClick={() => setShowResultModal(false)} className="w-full bg-rejimde-text text-white py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase">Harika!</button>
            </div>
        </div>
    )}

    {/* GAMIFICATION BANNER */}
    <div className="max-w-6xl mx-auto px-4 mt-16 mb-12">
        <div className="bg-rejimde-text text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-float flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
            
            <div className="relative z-10 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black mb-2">
                    {isLoggedIn ? "Sonuçları Kaydet, Rozeti Kap!" : "Profilini Tamamla, Puanları Topla!"}
                </h2>
                <p className="text-gray-400 font-bold text-lg max-w-xl">
                    {isLoggedIn 
                        ? "Hesaplamalarını profiline işleyerek Rejimde Skoru'nu artırabilirsin." 
                        : "Bu sonuçları profiline kaydederek Rejimde Skoru'nu başlat. İlk kayıtta +50 Puan hediye."}
                </p>
            </div>

            <div className="relative z-10 flex gap-4">
                {isLoggedIn ? (
                    <button 
                        onClick={handleSaveResults}
                        disabled={isSaving}
                        className="bg-rejimde-green text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-save"></i>}
                        Sonuçları Kaydet
                    </button>
                ) : (
                    <Link href="/register/user" className="bg-rejimde-green text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide whitespace-nowrap">
                        Kayıt Ol ve Kaydet
                    </Link>
                )}
            </div>
        </div>
    </div>

    </div>
  );
}