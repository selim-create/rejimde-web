'use client';

import { useState, useEffect } from "react";
// import Link from "next/link"; // Hata sebebiyle kaldırıldı

// --- MOCK API & DATA (Bağımsız çalışması için) ---
// Gerçek entegrasyonda bu veriler API'den gelecek.
const getMe = async () => {
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

const INITIAL_SERVICES = [
    { id: 1, title: "Online Yoga (Birebir)", price: 750, duration: 60, type: 'online', capacity: 1, active: true },
    { id: 2, title: "Reformer Pilates (Stüdyo)", price: 1200, duration: 50, type: 'offline', capacity: 1, active: true },
    { id: 3, title: "Beslenme Danışmanlığı", price: 2000, duration: 45, type: 'consultation', capacity: 1, active: true },
    { id: 4, title: "PT Paketi (10 Ders)", price: 15000, duration: 60, type: 'package', capacity: 1, active: false },
    { id: 5, title: "Grup Mat Pilates", price: 400, duration: 60, type: 'group', capacity: 8, active: true },
];

export default function ProServicesPage() {
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newService, setNewService] = useState({
      title: "",
      type: "online",
      price: "",
      duration: "",
      capacity: 1
  });

  useEffect(() => {
    getMe().then((user) => {
        setPro(user);
        setLoading(false);
    });
  }, []);

  const handleAddService = () => {
      if (!newService.title || !newService.price) return;

      const service = {
          id: Date.now(),
          title: newService.title,
          type: newService.type,
          price: parseInt(newService.price) || 0,
          duration: parseInt(newService.duration) || 0,
          capacity: newService.capacity,
          active: true
      };
      setServices([service, ...services]);
      setShowAddModal(false);
      setNewService({ title: "", type: "online", price: "", duration: "", capacity: 1 });
  };

  const toggleStatus = (id: number) => {
      setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const deleteService = (id: number) => {
      if(confirm('Bu hizmeti silmek istediğine emin misin?')) {
          setServices(services.filter(s => s.id !== id));
      }
  };

  // Type Badge Helper
  const getTypeBadge = (type: string) => {
      switch(type) {
          case 'online': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-black uppercase"><i className="fa-solid fa-video mr-1"></i> Online</span>;
          case 'offline': return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-[10px] font-black uppercase"><i className="fa-solid fa-location-dot mr-1"></i> Stüdyo</span>;
          case 'group': return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-[10px] font-black uppercase"><i className="fa-solid fa-users mr-1"></i> Grup</span>;
          case 'package': return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-[10px] font-black uppercase"><i className="fa-solid fa-box-open mr-1"></i> Paket</span>;
          default: return <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-[10px] font-black uppercase">Genel</span>;
      }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <a href="/" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </a>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
                    PRO PANEL
                </span>
                <h1 className="font-extrabold text-white text-lg">Hizmetlerim & Paketlerim</h1>
            </div>
         </div>
         <div className="flex gap-4">
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-800 btn-game flex items-center gap-2 hover:bg-blue-500 transition"
            >
                <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Yeni Ekle</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pro?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR NAV - Sticky özelliği kaldırıldı ve yükseklik serbest bırakıldı */}
        <div className="hidden lg:block lg:col-span-2 space-y-2">
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
            <a href="/dashboard/pro/services" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-extrabold shadow-btn shadow-blue-800 btn-game transition-transform hover:scale-105">
                <i className="fa-solid fa-list w-6 text-center"></i> Paketlerim
            </a>
            <a href="/dashboard/pro/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-star w-6 text-center group-hover:text-yellow-400"></i> Değerlendirmeler
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">İçerik & Araçlar</p>
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
            <div className="bg-gradient-to-r from-teal-900/50 to-blue-900/50 border border-teal-700/30 rounded-3xl p-6 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-white mb-2">Hizmetlerini Yönet</h2>
                    <p className="text-slate-400 text-sm font-medium max-w-xl">
                        Burada oluşturduğun hizmetler ve paketler, uzman profilinde danışanlarına gösterilir. 
                        Fiyatlarını, sürelerini ve içeriklerini dilediğin zaman güncelleyebilirsin.
                    </p>
                </div>
                <div className="hidden sm:block">
                    <i className="fa-solid fa-shop text-5xl text-teal-500/20"></i>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Add New Card */}
                <div 
                    onClick={() => setShowAddModal(true)}
                    className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition group min-h-[250px]"
                >
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                        <i className="fa-solid fa-plus text-2xl text-slate-400 group-hover:text-white"></i>
                    </div>
                    <h3 className="font-extrabold text-white text-lg">Yeni Hizmet Ekle</h3>
                    <p className="text-xs font-bold text-slate-500 mt-2">
                        Online ders, yüzyüze seans veya paket program oluştur.
                    </p>
                </div>

                {/* Service Cards */}
                {services.map((service) => (
                    <div key={service.id} className={`bg-slate-800 border rounded-3xl p-6 flex flex-col relative overflow-hidden transition hover:shadow-lg ${service.active ? 'border-slate-700 hover:border-slate-600' : 'border-slate-700/50 opacity-75 grayscale'}`}>
                        {/* Status Toggle */}
                        <button 
                            onClick={() => toggleStatus(service.id)}
                            className={`absolute top-4 right-4 w-10 h-6 rounded-full transition-colors flex items-center px-1 ${service.active ? 'bg-green-500' : 'bg-slate-600'}`}
                            title={service.active ? 'Pasife Al' : 'Aktif Et'}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${service.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>

                        <div className="mb-4">
                            {getTypeBadge(service.type)}
                        </div>

                        <h3 className="font-extrabold text-white text-lg mb-2 leading-tight">{service.title}</h3>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                                <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Fiyat</span>
                                <span className="text-xl font-black text-white">{service.price} ₺</span>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                                <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Süre</span>
                                <span className="text-xl font-black text-white">{service.duration} dk</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-700 flex gap-2">
                            <button className="flex-1 bg-white text-slate-900 py-2.5 rounded-xl font-extrabold text-xs uppercase hover:bg-slate-200 transition">
                                Düzenle
                            </button>
                            <button 
                                onClick={() => deleteService(service.id)}
                                className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* ADD SERVICE MODAL */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <h2 className="text-xl font-extrabold text-white mb-1">Yeni Hizmet Oluştur</h2>
                  <p className="text-slate-400 text-xs font-bold mb-6">Danışanlarına sunacağın yeni paketi tanımla.</p>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Hizmet Adı</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold placeholder-slate-600" 
                            placeholder="Örn: 10 Derslik Yoga Paketi" 
                            value={newService.title}
                            onChange={(e) => setNewService({...newService, title: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tür</label>
                              <select 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none"
                                value={newService.type}
                                onChange={(e) => setNewService({...newService, type: e.target.value})}
                              >
                                  <option value="online">Online (Birebir)</option>
                                  <option value="offline">Stüdyo / Yüzyüze</option>
                                  <option value="group">Grup Dersi</option>
                                  <option value="package">Ders Paketi</option>
                                  <option value="consultation">Danışmanlık</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Kontenjan</label>
                              <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                                placeholder="1" 
                                value={newService.capacity}
                                onChange={(e) => setNewService({...newService, capacity: parseInt(e.target.value)})}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ücret (TL)</label>
                              <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                                placeholder="0" 
                                value={newService.price}
                                onChange={(e) => setNewService({...newService, price: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Süre (Dk)</label>
                              <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                                placeholder="60" 
                                value={newService.duration}
                                onChange={(e) => setNewService({...newService, duration: e.target.value})}
                              />
                          </div>
                      </div>
                      
                      <button 
                        onClick={handleAddService}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-extrabold shadow-btn btn-game hover:bg-blue-500 transition mt-2"
                      >
                          Oluştur ve Yayınla
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}