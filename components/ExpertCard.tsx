import Link from "next/link";
import Image from "next/image";
import { getExpertStyle } from "@/lib/constants";

interface ExpertCardProps {
  name: string;
  title: string;
  image: string;
  rating: string;
  scoreImpact?: string; // Kept for backward compatibility
  trendPercentage?: string; // Yeni trend gösterimi (örn: "+12%" veya "-5%")
  slug: string;
  isOnline?: boolean;
  isFeatured?: boolean; // Editörün Seçimi (Sarı Yıldız)
  isVerified?: boolean; // Onaylı Uzman (Mavi Tik)
  isNew?: boolean;
  type: 'dietitian' | 'nutritionist' | 'pt' | 'fitness_coach' | 'yoga' | 'pilates' | 'reformer' | 'psychologist' | 'life_coach' | 'physiotherapist' | 'doctor' | 'box' | 'kickbox' | 'mma' | 'functional' | 'crossfit' | 'swim' | 'run' | 'breath' | 'defense' | 'unclaimed';
  rejiScore?: number;
  clientCount?: number;
  followersCount?: number;
  contentCount?: number;
}

export default function ExpertCard({ name, title, image, rating, scoreImpact, trendPercentage, slug, isOnline, isFeatured, isVerified, isNew, type, rejiScore, clientCount, followersCount, contentCount }: ExpertCardProps) {
  
  // Trend verisi varsa onu kullan, yoksa scoreImpact'i kullan (backward compatibility)
  const displayTrend = trendPercentage || scoreImpact || '—';
  
  // Trend pozitif mi negatif mi kontrol et (renk için)
  const isPositiveTrend = displayTrend.startsWith('+');
  const isNegativeTrend = displayTrend.startsWith('-');
  const trendColor = isPositiveTrend ? 'text-green-600' : isNegativeTrend ? 'text-red-600' : 'text-gray-500';
  
  // Onaysız hesap (Gri Kart)
  if (type === 'unclaimed') {
    // ... (Eski kod aynı kalacak, onaysız kart yapısı) ...
    return (
      <Link href={`/experts/${slug}`} className="bg-white border-2 border-gray-200 rounded-3xl p-0 opacity-80 relative shadow-card flex flex-col h-full hover:opacity-100 hover:border-rejimde-blue transition group">
        <div className="h-28 bg-gray-100 rounded-t-3xl relative">
            <div className="absolute top-2 right-2 bg-gray-200 text-gray-500 px-2 py-1 rounded text-[10px] font-black uppercase">
                Onaysız
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                    <i className="fa-solid fa-user"></i>
                </div>
            </div>
        </div>
        <div className="pt-12 px-5 pb-5 text-center flex-1 flex flex-col">
            <h3 className="font-extrabold text-lg text-gray-600 leading-tight mb-1 group-hover:text-rejimde-blue transition">{name}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{title}</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs font-bold text-gray-500">Henüz Rejimde ligine katılmadı.</div>
            <div className="flex-1"></div>
            <button className="w-full bg-white border-2 border-rejimde-green text-rejimde-green py-2 rounded-xl font-bold text-xs shadow-btn shadow-gray-200 btn-game hover:bg-green-50 uppercase flex items-center justify-center gap-2">
                <i className="fa-solid fa-envelope-open-text"></i> Davet Et (+50 P)
            </button>
        </div>
      </Link>
    );
  }

  // Normal Uzman Kartı
  const style = getExpertStyle(type);
  
  return (
    <Link href={`/experts/${slug}`} className={`bg-white border-2 ${style?.border || 'border-gray-200'} rounded-3xl p-0 transition group relative shadow-card flex flex-col h-full hover:border-rejimde-blue hover:-translate-y-1 duration-200`}>
        
        {/* EDITÖRÜN SEÇİMİ (Featured) */}
        {isFeatured && (
            <div className="absolute top-4 left-4 z-10 bg-rejimde-yellow text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border border-white/20 flex items-center gap-1">
                <i className="fa-solid fa-star"></i> Editörün Seçimi
            </div>
        )}

        {isNew && (
             <div className="absolute top-4 left-4 z-10 bg-rejimde-purple text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border border-white/20">
                YENİ
            </div>
        )}

        <div className={`h-28 ${style?.bg || 'bg-gradient-to-r from-green-50 to-blue-50'} rounded-t-3xl relative overflow-hidden`}>
            {/* Shine animation */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shine_3s_infinite]"></div>
            
            {/* Decorative Icons */}
            <i className={`fa-solid ${style?.decorationIcon || 'fa-utensils'} ${style?.iconColor || 'text-green-300'} text-5xl absolute -bottom-2 -right-1 rotate-12 opacity-30`}></i>
            <i className={`fa-solid ${style?.decorationIcon || 'fa-utensils'} ${style?.iconColor || 'text-green-300'} text-3xl absolute top-1 left-2 -rotate-12 opacity-30`}></i>
            
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <img src={image} className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm bg-white object-cover group-hover:scale-105 transition-transform duration-300" alt={name} />
                
                {/* ONLINE DURUMU */}
                {isOnline && <div className="absolute bottom-0 right-0 w-5 h-5 bg-rejimde-green border-2 border-white rounded-full" title="Online"></div>}
                
                {/* ONAY ROZETİ (Verified) - Resmin sağ üst köşesine eklenir */}
                {isVerified && (
                     <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]" title="Onaylı Uzman">
                         <i className="fa-solid fa-check"></i>
                     </div>
                )}
            </div>
        </div>

        <div className="pt-12 px-5 pb-5 text-center flex-1 flex flex-col">
            <h3 className="font-extrabold text-lg text-gray-800 leading-tight mb-1 group-hover:text-rejimde-blue transition flex items-center justify-center gap-1">
                {name}
                {/* İsim yanında da küçük onay ikonu olabilir */}
                {isVerified && <i className="fa-solid fa-circle-check text-blue-500 text-xs"></i>}
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{title}</p>
            
            <div className="flex justify-center gap-4 mb-4 border-y-2 border-gray-50 py-3">
                <div>
                    <div className={`flex items-center justify-center gap-1 ${style?.text || 'text-indigo-500'} text-sm font-black`}>
                        <i className="fa-solid fa-chart-simple"></i> {rejiScore ?? '--'}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">RejiScore</div>
                </div>
                <div className="w-px bg-gray-100"></div>
                <div>
                    <div className={`font-black text-sm ${trendColor}`}>{displayTrend}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">Trend</div>
                </div>
            </div>

            <div className="flex-1"></div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <span className="bg-white border-2 border-gray-200 text-gray-500 py-2 rounded-xl font-bold text-xs uppercase hover:bg-gray-50 flex items-center justify-center">
                    Profili
                </span>
                <span className={`text-white py-2 rounded-xl font-bold text-xs shadow-btn btn-game uppercase flex items-center justify-center ${style?.btnMain || 'bg-rejimde-green shadow-rejimde-greenDark'}`}>
                    Randevu
                </span>
            </div>
        </div>
    </Link>
  );
}