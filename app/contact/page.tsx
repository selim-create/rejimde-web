"use client";

import { useState, FormEvent } from "react";
import MascotDisplay from "@/components/MascotDisplay";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Genel Sorular",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Lütfen tüm alanları doldurunuz.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "Genel Sorular",
          message: ""
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Bir hata oluştu.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Bağlantı hatası. Lütfen tekrar deneyiniz.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text bg-[#f7f7f7]">
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] shadow-card overflow-hidden border-2 border-gray-200 flex flex-col md:flex-row">
            
            {/* Left: Info */}
            <div className="w-full md:w-2/5 bg-rejimde-blue text-white p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)'}}></div>
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-4">Bize Ulaşın</h1>
                    <p className="text-blue-100 font-bold mb-8">
                        Soruların mı var? Ekibimiz ve FitBuddy sana yardımcı olmak için burada.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
                                <i className="fa-solid fa-envelope"></i>
                            </div>
                            <div>
                                <p className="text-xs font-black text-blue-200 uppercase mb-1">E-posta</p>
                                <p className="font-bold">destek@rejimde.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
                                <i className="fa-solid fa-location-dot"></i>
                            </div>
                            <div>
                                <p className="text-xs font-black text-blue-200 uppercase mb-1">Ofis</p>
                                <p className="font-bold">Kolektif House, Levent<br/>İstanbul, Türkiye</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12">
                     <MascotDisplay state="onboarding_welcome" size={150} showBubble={false} />
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full md:w-3/5 p-10 bg-white">
                {submitStatus && (
                  <div className={`mb-6 p-4 rounded-xl border-2 ${
                    submitStatus.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center gap-2 font-bold">
                      <i className={`fa-solid ${submitStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {submitStatus.message}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Adın</label>
                            <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition" 
                              placeholder="Ali Veli"
                              required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">E-posta</label>
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition" 
                              placeholder="ali@ornek.com"
                              required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Konu</label>
                        <select 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition cursor-pointer"
                        >
                            <option>Genel Sorular</option>
                            <option>Uzmanlık Başvurusu</option>
                            <option>Teknik Destek</option>
                            <option>İş Birliği</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Mesajın</label>
                        <textarea 
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition h-32 resize-none" 
                          placeholder="Nasıl yardımcı olabiliriz?"
                          required
                        ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-rejimde-blue text-white py-4 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                </form>
            </div>

        </div>
      </div>

    </div>
  );
}