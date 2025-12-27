'use client';

import { useState, useEffect } from "react";
import { getMyExperts, MyExpert } from "@/lib/api";

export default function MyExpertsPage() {
  const [experts, setExperts] = useState<MyExpert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMyExperts();
        setExperts(data);
      } catch (error) {
        console.error("Uzmanlar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-block mt-1 bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Aktif</span>;
      case 'pending':
        return <span className="inline-block mt-1 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Beklemede</span>;
      case 'expired':
        return <span className="inline-block mt-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Bitti</span>;
      case 'paused':
        return <span className="inline-block mt-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Durduruldu</span>;
      default:
        return null;
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
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">Uzmanlarım</h1>
                    <p className="text-gray-500 font-bold text-sm">Birlikte çalıştığın profesyoneller.</p>
                </div>
                <a href="/experts" className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition">
                    + Yeni Uzman Bul
                </a>
            </div>

            {experts.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
                <i className="fa-solid fa-user-doctor text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-black text-gray-700 mb-2">Henüz Uzmanın Yok</h3>
                <p className="text-gray-500 font-bold text-sm mb-6">Sana uygun bir uzman bul ve çalışmaya başla!</p>
                <a href="/experts" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-extrabold text-sm shadow-btn btn-game hover:bg-blue-500 transition">
                  Uzman Bul
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experts.map((expert) => (
                    <div key={expert.id} className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm hover:border-blue-200 transition group">
                        <div className="flex items-center gap-4 mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={expert.expert.avatar} className="w-16 h-16 rounded-2xl border-2 border-gray-100 object-cover" alt={expert.expert.name} />
                            <div className="flex-1">
                                <h3 className="font-black text-xl text-gray-800">{expert.expert.name}</h3>
                                <p className="text-xs font-bold text-blue-500 uppercase">{expert.expert.title}</p>
                                {getStatusBadge(expert.status)}
                            </div>
                            {expert.unread_messages > 0 && (
                              <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                {expert.unread_messages}
                              </div>
                            )}
                        </div>
                        
                        {expert.package && (
                          <>
                            <div className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Mevcut Paket</p>
                                <p className="text-sm font-black text-gray-700">{expert.package.name}</p>
                                
                                {expert.package.type !== 'unlimited' && (
                                  <>
                                    <div className="flex justify-between text-xs font-black text-gray-600 mb-2 mt-3">
                                        <span>Kullanılan: {expert.package.used}</span>
                                        <span>Kalan: {expert.package.remaining}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                          style={{ width: `${expert.package.progress_percent}%` }}
                                        ></div>
                                    </div>
                                  </>
                                )}
                            </div>
                            
                            {expert.package.expiry_date && (
                              <p className="text-[10px] text-gray-400 font-bold mb-3">
                                Son Kullanım: {new Date(expert.package.expiry_date).toLocaleDateString('tr-TR')}
                              </p>
                            )}
                          </>
                        )}

                        {expert.next_appointment && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                            <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Sonraki Randevu</p>
                            <p className="text-xs font-black text-blue-600">
                              {new Date(expert.next_appointment.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {expert.next_appointment.time}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                            <a 
                              href={`/dashboard/calendar?expertId=${expert.expert.id}`}
                              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-extrabold text-xs uppercase shadow-btn shadow-blue-600/30 btn-game hover:bg-blue-600 transition text-center"
                            >
                                Randevu Al
                            </a>
                            <a 
                              href={`/dashboard/inbox?expertId=${expert.expert.id}`}
                              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold text-xs uppercase hover:bg-gray-200 transition text-center"
                            >
                                Mesaj At
                            </a>
                        </div>
                    </div>
                ))}
              </div>
            )}

        </div>
    </div>
  );
}