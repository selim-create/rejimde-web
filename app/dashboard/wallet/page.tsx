'use client';

import { useState, useEffect } from "react";
import { getMyPackages, getMyTransactions, MyPackage, MyTransaction } from "@/lib/api";

export default function WalletPage() {
  const [packages, setPackages] = useState<MyPackage[]>([]);
  const [transactions, setTransactions] = useState<MyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pkgs, txns] = await Promise.all([
          getMyPackages(),
          getMyTransactions()
        ]);
        setPackages(pkgs);
        setTransactions(txns);
      } catch (error) {
        console.error("Cüzdan verileri yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatAmount = (amount: number, currency: string) => {
    const formatted = new Intl.NumberFormat('tr-TR').format(amount);
    return `${formatted} ${currency}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <i className="fa-solid fa-check"></i>;
      case 'pending':
        return <i className="fa-solid fa-clock"></i>;
      case 'failed':
        return <i className="fa-solid fa-xmark"></i>;
      default:
        return <i className="fa-solid fa-check"></i>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'failed':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
            
            <h1 className="text-3xl font-black text-gray-800 mb-2">Cüzdanım & Paketlerim</h1>
            <p className="text-gray-500 font-bold text-sm mb-8">Satın aldığın hizmetler ve kalan hakların.</p>

            {/* Active Packages */}
            <h2 className="text-lg font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-box-open text-blue-500"></i> Aktif Paketler
            </h2>
            
            {packages.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center mb-10">
                <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-black text-gray-700 mb-2">Henüz Paket Almadın</h3>
                <p className="text-gray-500 font-bold text-sm">Uzmanlardan paket satın alarak çalışmaya başla!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8"></div>
                        
                        <h3 className="font-black text-gray-800 text-lg mb-1">{pkg.name}</h3>
                        <p className="text-xs font-bold text-gray-400 mb-4">{pkg.expert.name} ile</p>
                        
                        {pkg.type !== 'unlimited' && pkg.total !== null && pkg.remaining !== null && (
                          <>
                            <div className="flex justify-between text-xs font-black text-gray-600 mb-2">
                                <span>Kullanılan: {pkg.used}</span>
                                <span>Kalan: {pkg.remaining}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                                <div 
                                  className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                  style={{ width: `${pkg.progress_percent}%` }}
                                ></div>
                            </div>
                          </>
                        )}
                        
                        {pkg.type === 'unlimited' && (
                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-4">
                            <p className="text-xs font-black text-purple-600">Sınırsız Kullanım</p>
                          </div>
                        )}

                        {pkg.expiry_date && (
                          <p className="text-[10px] text-gray-400 font-bold text-right">
                            Son Kullanım: {new Date(pkg.expiry_date).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                    </div>
                ))}
              </div>
            )}

            {/* Transactions */}
            <h2 className="text-lg font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-gray-400"></i> İşlem Geçmişi
            </h2>
            
            {transactions.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
                <i className="fa-solid fa-receipt text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-black text-gray-700 mb-2">İşlem Geçmişin Boş</h3>
                <p className="text-gray-500 font-bold text-sm">Henüz bir ödeme yapmadın.</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                {transactions.map((trx) => (
                    <div key={trx.id} className="p-5 border-b border-gray-100 last:border-0 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${getStatusColor(trx.status)}`}>
                                {getStatusIcon(trx.status)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{trx.description}</h4>
                                <p className="text-xs font-bold text-gray-400">
                                  {new Date(trx.date).toLocaleDateString('tr-TR')} • {trx.expert.name}
                                </p>
                            </div>
                        </div>
                        <span className="font-black text-gray-800 text-sm">
                          -{formatAmount(trx.amount, trx.currency)}
                        </span>
                    </div>
                ))}
              </div>
            )}

        </div>
    </div>
  );
}