'use client';

// import Link from "next/link"; // Hata önlemek için <a> kullanıyoruz

// --- MOCK DATA (Import sorununu aşmak için buraya taşındı) ---
const MOCK_USER_EXPERTS = [
    {
        id: 1,
        name: "Dr. Selim",
        title: "Uzman Diyetisyen",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selim",
        status: "active", // active, pending, expired
        nextAppointment: "Yarın, 14:00",
        package: "Aylık Beslenme Danışmanlığı"
    },
    {
        id: 2,
        name: "Selin Hoca",
        title: "Yoga Eğitmeni",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selin",
        status: "active",
        nextAppointment: "Cuma, 10:00",
        package: "Online Yoga (10 Ders)"
    }
];

export default function MyExpertsPage() {
  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">Uzmanlarım</h1>
                    <p className="text-gray-500 font-bold text-sm">Birlikte çalıştığın profesyoneller.</p>
                </div>
                <a href="/experts" className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition">
                    + Yeni Uzman Bul
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_USER_EXPERTS.map((expert) => (
                    <div key={expert.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm hover:border-blue-200 transition group">
                        <div className="flex items-center gap-4 mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={expert.avatar} className="w-16 h-16 rounded-2xl border-2 border-gray-100 object-cover" alt={expert.name} />
                            <div>
                                <h3 className="font-black text-xl text-gray-800">{expert.name}</h3>
                                <p className="text-xs font-bold text-blue-500 uppercase">{expert.title}</p>
                                <span className="inline-block mt-1 bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Aktif</span>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Mevcut Paket</p>
                            <p className="text-sm font-black text-gray-700">{expert.package}</p>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-extrabold text-xs uppercase shadow-btn shadow-blue-600/30 btn-game hover:bg-blue-600 transition">
                                Randevu Al
                            </button>
                            <button className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold text-xs uppercase hover:bg-gray-200 transition">
                                Mesaj At
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    </div>
  );
}