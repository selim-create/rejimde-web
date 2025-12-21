"use client";

import MascotDisplay from "@/components/MascotDisplay";

export default function ContactPage() {
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
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Adın</label>
                            <input type="text" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition" placeholder="Ali Veli" />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">E-posta</label>
                            <input type="email" className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition" placeholder="ali@ornek.com" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Konu</label>
                        <select className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition cursor-pointer">
                            <option>Genel Sorular</option>
                            <option>Uzmanlık Başvurusu</option>
                            <option>Teknik Destek</option>
                            <option>İş Birliği</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase mb-2">Mesajın</label>
                        <textarea className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-rejimde-blue outline-none transition h-32 resize-none" placeholder="Nasıl yardımcı olabiliriz?"></textarea>
                    </div>

                    <button className="w-full bg-rejimde-blue text-white py-4 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-blueDark btn-game uppercase tracking-wide">
                        Gönder
                    </button>
                </form>
            </div>

        </div>
      </div>

    </div>
  );
}