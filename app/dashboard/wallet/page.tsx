'use client';

// import Link from "next/link"; // Hata önlemek için <a> kullanıyoruz
// import LayoutWrapper from '../../../components/LayoutWrapper'; // Import hatası nedeniyle kaldırıldı
// import { MOCK_USER_PACKAGES, MOCK_USER_TRANSACTIONS } from "../../../lib/mock-data-user"; // Dosya içine taşındı

// --- MOCK DATA ---
const MOCK_USER_PACKAGES = [
    {
        id: 1,
        name: "Online Yoga Paketi",
        expert: "Selin Hoca",
        total: 10,
        used: 3,
        remaining: 7,
        progress: 30,
        expiry: "20 Şub 2026"
    },
    {
        id: 2,
        name: "Beslenme Danışmanlığı",
        expert: "Dr. Selim",
        total: 4,
        used: 2,
        remaining: 2,
        progress: 50,
        expiry: "15 Oca 2026"
    }
];

const MOCK_USER_TRANSACTIONS = [
    { id: "TRX-991", date: "27 Ara 2025", title: "Online Yoga Paketi", amount: "-7.500 TL", status: "completed" },
    { id: "TRX-990", date: "15 Ara 2025", title: "Beslenme Danışmanlığı", amount: "-2.000 TL", status: "completed" },
];

export default function WalletPage() {
  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
            
            <h1 className="text-3xl font-black text-gray-800 mb-2">Cüzdanım & Paketlerim</h1>
            <p className="text-gray-500 font-bold text-sm mb-8">Satın aldığın hizmetler ve kalan hakların.</p>

            {/* Active Packages */}
            <h2 className="text-lg font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-box-open text-blue-500"></i> Aktif Paketler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {MOCK_USER_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                        
                        <h3 className="font-black text-gray-800 text-lg mb-1">{pkg.name}</h3>
                        <p className="text-xs font-bold text-gray-400 mb-4">{pkg.expert} ile</p>
                        
                        <div className="flex justify-between text-xs font-black text-gray-600 mb-2">
                            <span>Kullanılan: {pkg.used}</span>
                            <span>Kalan: {pkg.remaining}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${pkg.progress}%` }}></div>
                        </div>

                        <p className="text-[10px] text-gray-400 font-bold text-right">Son Kullanım: {pkg.expiry}</p>
                    </div>
                ))}
            </div>

            {/* Transactions */}
            <h2 className="text-lg font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-gray-400"></i> İşlem Geçmişi
            </h2>
            <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                {MOCK_USER_TRANSACTIONS.map((trx) => (
                    <div key={trx.id} className="p-5 border-b border-gray-100 last:border-0 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border-2 border-green-100">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{trx.title}</h4>
                                <p className="text-xs font-bold text-gray-400">{trx.date}</p>
                            </div>
                        </div>
                        <span className="font-black text-gray-800 text-sm">{trx.amount}</span>
                    </div>
                ))}
            </div>

        </div>
    </div>
  );
}