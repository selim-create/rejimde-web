'use client';

import { useState, useEffect } from "react";
import { getMe as getRealMe, getProFAQ, createProFAQ, updateProFAQ, deleteProFAQ, FAQItem } from "@/lib/api";

// --- MOCK API & DATA (Bağımsız çalışması için) ---
const getMe = async () => {
    // Try real API first
    const realUser = await getRealMe();
    if (realUser) return realUser;
    
    // Fallback to mock
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 99,
                name: "Dr. Selim",
                title: "Baş Diyetisyen",
                avatar_url: "https://api.dicebear.com/9.x/personas/svg?seed=Selim",
            });
        }, 500);
    });
};

const TEMPLATE_PACKAGES = [
    {
        id: 'yoga',
        title: 'Yoga Eğitmeni Paketi',
        icon: 'fa-person-praying',
        questions: [
            { question: "Yeni başlayanlar için uygun mu?", answer: "Evet, derslerimiz her seviyeye uygun modifikasyonlar içerir. Başlangıç seviyesinden ileri seviyeye kadar herkes katılabilir." },
            { question: "Ders öncesi yemek yemeli miyim?", answer: "Dersten en az 2 saat önce ağır bir öğün yememiş olmanız önerilir. Hafif bir atıştırmalık tüketebilirsiniz." },
            { question: "Hangi ekipmanlara ihtiyacım var?", answer: "Rahat kıyafetler ve kaymaz bir yoga matı yeterlidir. Blok ve kemer opsiyoneldir." }
        ]
    },
    {
        id: 'diet',
        title: 'Diyetisyen Paketi',
        icon: 'fa-carrot',
        questions: [
            { question: "Listeler ne sıklıkla güncelleniyor?", answer: "Listeleriniz haftalık kontrollerimizden sonra gidişata göre güncellenir." },
            { question: "Kan tahlili gerekli mi?", answer: "Evet, son 6 aya ait kan tahlillerinizi görmemiz programın sağlığınız için uygunluğu açısından önemlidir." },
            { question: "WhatsApp desteği var mı?", answer: "Evet, mesai saatleri içerisinde (09:00 - 18:00) sorularınızı WhatsApp üzerinden iletebilirsiniz." }
        ]
    },
    {
        id: 'pt',
        title: 'PT / Fitness Paketi',
        icon: 'fa-dumbbell',
        questions: [
            { question: "Spor salonuna gitmem şart mı?", answer: "Hayır, evde veya açık havada yapabileceğiniz ekipmansız programlar da hazırlayabilirim." },
            { question: "Haftada kaç gün antrenman yapmalıyım?", answer: "Hedefinize göre değişmekle birlikte, başlangıç için haftada 3-4 gün idealdir." },
            { question: "Sakatlığım var, yine de çalışabilir miyim?", answer: "Doktor onayınız varsa, sakatlığınıza uygun rehabilitasyon odaklı bir program hazırlayabiliriz." }
        ]
    }
];

export default function ProFaqPage() {
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ question: "", answer: "" });

  useEffect(() => {
    async function loadData() {
      const user = await getMe();
      setPro(user);
      
      // Load FAQs from API
      const items = await getProFAQ();
      setFaqs(items.map((item: FAQItem) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        active: item.is_public
      })));
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
      if (!formData.question || !formData.answer) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      setSubmitting(true);

      if (editingId) {
          // Edit
          const result = await updateProFAQ(editingId, {
            question: formData.question,
            answer: formData.answer
          });
          
          if (result.success) {
            setFaqs(faqs.map(f => f.id === editingId ? { ...f, question: formData.question, answer: formData.answer } : f));
            closeModal();
            alert("Soru başarıyla güncellendi!");
          } else {
            alert(result.message || "Soru güncellenirken bir hata oluştu.");
          }
      } else {
          // Add
          const result = await createProFAQ({
            question: formData.question,
            answer: formData.answer,
            is_public: true
          });
          
          if (result.success && result.item) {
            const newFaq = {
              id: result.item.id,
              question: result.item.question,
              answer: result.item.answer,
              active: result.item.is_public
            };
            setFaqs([newFaq, ...faqs]);
            closeModal();
            alert("Soru başarıyla eklendi!");
          } else {
            alert(result.message || "Soru eklenirken bir hata oluştu.");
          }
      }
      
      setSubmitting(false);
  };

  const handleImportTemplate = async (pkg: typeof TEMPLATE_PACKAGES[0]) => {
      setSubmitting(true);
      const newFaqs: any[] = [];
      
      for (const q of pkg.questions) {
        const result = await createProFAQ({
          question: q.question,
          answer: q.answer,
          is_public: true
        });
        
        if (result.success && result.item) {
          newFaqs.push({
            id: result.item.id,
            question: result.item.question,
            answer: result.item.answer,
            active: result.item.is_public
          });
        }
      }
      
      setFaqs([...newFaqs, ...faqs]);
      setShowTemplatesModal(false);
      setSubmitting(false);
      alert(`${pkg.title} başarıyla eklendi!`);
  };

  const handleEdit = (faq: any) => {
      setEditingId(faq.id);
      setFormData({ question: faq.question, answer: faq.answer });
      setShowModal(true);
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
        return;
      }
      
      const result = await deleteProFAQ(id);
      
      if (result.success) {
        setFaqs(faqs.filter(f => f.id !== id));
        alert("Soru başarıyla silindi.");
      } else {
        alert(result.message || "Soru silinirken bir hata oluştu.");
      }
  };

  const toggleStatus = async (id: number) => {
      const faq = faqs.find(f => f.id === id);
      if (!faq) return;
      
      const result = await updateProFAQ(id, {
        is_public: !faq.active
      });
      
      if (result.success) {
        setFaqs(faqs.map(f => f.id === id ? { ...f, active: !f.active } : f));
      } else {
        alert(result.message || "Durum değiştirilirken bir hata oluştu.");
      }
  };

  const closeModal = () => {
      setShowModal(false);
      setEditingId(null);
      setFormData({ question: "", answer: "" });
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <a href="/dashboard/pro" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </a>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
                    PRO PANEL
                </span>
                <h1 className="font-extrabold text-white text-lg">SSS Yönetimi</h1>
            </div>
         </div>
         <div className="flex gap-4">
            <button 
                onClick={() => setShowTemplatesModal(true)}
                className="hidden sm:flex bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-600 hover:text-white transition items-center gap-2"
            >
                <i className="fa-solid fa-wand-magic-sparkles"></i> <span className="hidden md:inline">Şablon Kullan</span>
            </button>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-cyan-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-cyan-900/50 btn-game flex items-center gap-2 hover:bg-cyan-500 transition"
            >
                <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Soru Ekle</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pro?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR NAV */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 sticky top-24 h-fit">
            <a href="/dashboard/pro" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gauge-high w-6 text-center group-hover:text-blue-400"></i> Panel
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">Yönetim</p>
            <a href="/dashboard/pro/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-bell w-6 text-center group-hover:text-blue-400"></i> Bildirimler
            </a>
            <a href="/dashboard/pro/activity" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-chart-line w-6 text-center group-hover:text-purple-400"></i> Aktiviteler
            </a>
            <a href="/dashboard/pro/inbox" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-envelope w-6 text-center group-hover:text-pink-400"></i> Gelen Kutusu
            </a>
            <a href="/dashboard/pro/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-users w-6 text-center group-hover:text-blue-400"></i> Danışanlar
            </a>
            <a href="/dashboard/pro/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-calendar-check w-6 text-center group-hover:text-green-400"></i> Takvim
            </a>
            <a href="/dashboard/pro/earnings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wallet w-6 text-center group-hover:text-yellow-400"></i> Gelirler
            </a>
            <a href="/dashboard/pro/finance/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-list w-6 text-center group-hover:text-teal-400"></i> Paketlerim
            </a>
            <a href="/dashboard/pro/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-star w-6 text-center group-hover:text-yellow-400"></i> Değerlendirmeler
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">İçerik & Araçlar</p>
            <a href="/dashboard/pro/media" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-photo-film w-6 text-center group-hover:text-indigo-400"></i> Medya Kütüphanesi
            </a>
            <a href="/dashboard/pro/faq" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-600/20 text-cyan-400 font-bold border border-cyan-500/30 transition-transform hover:scale-105">
                <i className="fa-solid fa-circle-question w-6 text-center"></i> SSS Yönetimi
            </a>
            <a href="/dashboard/pro/diets/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-utensils w-6 text-center group-hover:text-orange-400"></i> Diyet Yaz
            </a>
            <a href="/dashboard/pro/exercises/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-dumbbell w-6 text-center group-hover:text-red-400"></i> Egzersiz Yaz
            </a>
            <a href="/dashboard/pro/blog/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-pen-nib w-6 text-center group-hover:text-pink-400"></i> Blog Yazısı
            </a>
            <a href="/dashboard/pro/dictionary/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-book-open w-6 text-center group-hover:text-teal-400"></i> Sözlük Ekle
            </a>
            
            <div className="h-px bg-slate-800 my-2"></div>
            
            <a href="/dashboard/pro/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wand-magic-sparkles w-6 text-center text-purple-500"></i> AI Asistan
            </a>
            <a href="/dashboard/pro/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gear w-6 text-center group-hover:text-gray-300"></i> Ayarlar
            </a>
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-10">
            
            {/* Intro Card */}
            <div className="bg-gradient-to-r from-cyan-900/50 to-slate-900 border border-cyan-700/30 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-card">
                <div>
                    <h2 className="text-xl font-extrabold text-white mb-2">Sıkça Sorulan Sorular</h2>
                    <p className="text-slate-400 text-sm font-medium max-w-xl">
                        Danışanlarının sık sorduğu soruları buraya ekleyerek zaman kazan. Bu sorular uzman profilinde görüntülenecektir.
                    </p>
                </div>
                <div className="hidden sm:block">
                    <i className="fa-solid fa-circle-question text-5xl text-cyan-500/20"></i>
                </div>
            </div>

            {/* Empty State */}
            {faqs.length === 0 && (
                 <div className="text-center py-12 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-clipboard-question text-3xl text-slate-500"></i>
                    </div>
                    <h3 className="font-bold text-slate-300 text-lg">Henüz soru eklemedin</h3>
                    <p className="text-slate-500 text-xs mt-1 mb-4">Danışanların için ilk soruyu şimdi oluştur veya hazır şablonlardan seç.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setShowTemplatesModal(true)} className="text-cyan-400 font-bold text-sm hover:underline border border-cyan-500/30 px-4 py-2 rounded-xl">
                            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Şablonları Gör
                        </button>
                        <button onClick={() => setShowModal(true)} className="bg-cyan-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-cyan-500 transition shadow-lg">
                            + Soru Ekle
                        </button>
                    </div>
                </div>
            )}

            {/* FAQ List */}
            <div className="space-y-4">
                {faqs.map((faq) => (
                    <div key={faq.id} className={`bg-slate-800 border rounded-2xl p-5 transition group ${faq.active ? 'border-slate-700 hover:border-slate-600' : 'border-slate-700/50 opacity-70 grayscale'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-extrabold text-lg pr-4">{faq.question}</h3>
                            <div className="flex gap-2 shrink-0">
                                <button 
                                    onClick={() => handleEdit(faq)}
                                    className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition flex items-center justify-center"
                                >
                                    <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button 
                                    onClick={() => handleDelete(faq.id)}
                                    className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 transition flex items-center justify-center"
                                >
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">{faq.answer}</p>
                        <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${faq.active ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                {faq.active ? 'Yayında' : 'Pasif'}
                            </span>
                            <button 
                                onClick={() => toggleStatus(faq.id)}
                                className={`text-xs font-bold transition ${faq.active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                            >
                                {faq.active ? 'Yayından Kaldır' : 'Yayınla'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>

      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <h2 className="text-xl font-extrabold text-white mb-6">
                      {editingId ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
                  </h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Soru</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none font-bold placeholder-slate-600" 
                            placeholder="Örn: Hafta sonu hizmet veriyor musunuz?" 
                            value={formData.question}
                            onChange={(e) => setFormData({...formData, question: e.target.value})}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Cevap</label>
                          <textarea 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-cyan-500 focus:outline-none font-medium min-h-[120px] resize-none text-sm placeholder-slate-600"
                            placeholder="Cevabınızı buraya yazın..."
                            value={formData.answer}
                            onChange={(e) => setFormData({...formData, answer: e.target.value})}
                          ></textarea>
                      </div>
                      
                      <button 
                        onClick={handleSave}
                        disabled={submitting}
                        className="w-full bg-cyan-600 text-white py-3.5 rounded-xl font-extrabold shadow-btn btn-game hover:bg-cyan-500 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {submitting ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Kaydet ve Yayınla')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* TEMPLATES MODAL (YENİ) */}
      {showTemplatesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTemplatesModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-4xl border border-slate-700 shadow-2xl p-6 relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowTemplatesModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"><i className="fa-solid fa-xmark text-xl"></i></button>
                  
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-cyan-400 border border-cyan-500/20">
                          <i className="fa-solid fa-wand-magic-sparkles text-3xl"></i>
                      </div>
                      <h2 className="text-2xl font-extrabold text-white">Hazır SSS Şablonları</h2>
                      <p className="text-sm font-bold text-slate-500">Uzmanlık alanına uygun paketi seç, soruları otomatik ekle.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto p-2">
                      {TEMPLATE_PACKAGES.map((pkg) => (
                          <div key={pkg.id} className="bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500 transition group flex flex-col h-full">
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition">
                                      <i className={`fa-solid ${pkg.icon}`}></i>
                                  </div>
                                  <h3 className="font-bold text-white text-sm">{pkg.title}</h3>
                              </div>
                              <ul className="space-y-2 mb-6 flex-1">
                                  {pkg.questions.map((q, idx) => (
                                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                          <i className="fa-solid fa-check text-green-500 mt-0.5"></i>
                                          {q.question}
                                      </li>
                                  ))}
                              </ul>
                              <button 
                                  onClick={() => handleImportTemplate(pkg)}
                                  disabled={submitting}
                                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs border border-slate-700 hover:bg-cyan-600 hover:border-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  {submitting ? 'İçe Aktarılıyor...' : 'Paketi İçe Aktar'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}