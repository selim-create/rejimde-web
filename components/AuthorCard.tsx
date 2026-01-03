"use client";

import { useState } from "react";
import Link from "next/link";
import { getUserProfileUrl } from "@/lib/helpers";
import { toggleFollow, sendHighFive } from "@/lib/api";
import { getExpertStyle, getProfessionLabel, PROFESSION_CATEGORIES } from "@/lib/constants";

interface AuthorCardProps {
    author: {
        id: number;
        name: string;
        slug: string;
        avatar: string;
        role?: string;
        profession?: string;
        isExpert?: boolean;
        isVerified?: boolean;
        rank?: number; // Renamed from level - user experience rank
        score?: number;
        rejimde_total_score?: number;
        articleCount?: number;
        content_count?: number;
        followers_count?: number;
        high_fives?: number;
        is_following?: boolean;
        has_high_fived?: boolean;
        career_start_date?: string;
        
        // YENİ EKLENENLER
        rating?: string | number;
        reji_score?: number;
        client_count?: number;
        title?: string; // Ünvan prefix için
    };
    context?: string;
}

export default function AuthorCard({ author, context = "Yazar" }: AuthorCardProps) {
    // Veri yoksa render etme
    if (!author) return null;

    const isExpert = author.isExpert || author.role === 'rejimde_pro';
    const style = isExpert ? getExpertStyle(author.profession) : null;
    const profileUrl = getUserProfileUrl(author.slug, isExpert);

    // Etkileşim State'leri
    const [isFollowing, setIsFollowing] = useState(Boolean(author.is_following));
    const [followerCount, setFollowerCount] = useState(author.followers_count || 0);
    const [highFives, setHighFives] = useState(author.high_fives || 0);
    const [hasHighFived, setHasHighFived] = useState(Boolean(author.has_high_fived));
    
    // Deneyim yılı hesaplama
    const experienceYears = author.career_start_date 
        ? Math.max(0, new Date().getFullYear() - new Date(author.career_start_date).getFullYear())
        : null;

    // Helper fonksiyon: Meslek prefix'ini al
    const getProfessionPrefix = (profession: string | undefined): string => {
        if (!profession) return '';
        for (const cat of PROFESSION_CATEGORIES) {
            const item = cat.items.find(i => i.id === profession || profession.includes(i.id));
            if (item && item.prefix) return item.prefix;
        }
        return '';
    };

    const handleFollow = async () => {
        const newState = !isFollowing;
        setIsFollowing(newState);
        setFollowerCount(prev => newState ? prev + 1 : prev - 1);
        try {
            await toggleFollow(author.id); 
        } catch (error) {
            setIsFollowing(!newState); // Hata varsa geri al
            setFollowerCount(prev => !newState ? prev + 1 : prev - 1);
        }
    };

    const handleHighFive = async () => {
        if (hasHighFived) return;
        setHighFives(prev => prev + 1);
        setHasHighFived(true);
        try {
            await sendHighFive(author.id);
        } catch (error) {
            setHighFives(prev => prev - 1);
            setHasHighFived(false);
        }
    };

    // --- UZMAN KARTI TASARIMI ---
    if (isExpert && style) {
        const prefix = getProfessionPrefix(author.profession);
        const displayName = prefix ? `${prefix} ${author.name}` : author.name;
        
        return (
            <div className={`bg-white rounded-[2rem] border-2 ${style.border} shadow-[0_6px_0_rgba(0,0,0,0.08)] relative group overflow-hidden transition-transform hover:-translate-y-1`}>
                
                {/* Uzman Ribbon */}
                <div className={`absolute top-0 right-0 ${style?.btnMain || 'bg-indigo-500 text-white'} text-[10px] font-black px-4 py-1.5 rounded-bl-2xl z-20 border-b-2 border-l-2 border-black/10 shadow-sm uppercase tracking-wider`}>
                    UZMAN
                </div>
                
                {/* Header Pattern */}
                <div className={`h-24 ${style.bg} w-full relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shine_3s_infinite_linear]"></div>
                    <i className={`fa-solid ${style.decorationIcon} ${style.iconColor} text-7xl absolute -bottom-4 -right-2 rotate-12 opacity-30`}></i>
                    <i className={`fa-solid ${style.decorationIcon} ${style.iconColor} text-5xl absolute top-2 left-4 -rotate-12 opacity-30`}></i>
                </div>

                {/* Avatar & Info */}
                <div className="px-6 relative -mt-12 text-center z-10">
                    <div className="relative inline-block group-hover:scale-105 transition-transform duration-300">
                        <Link href={profileUrl}>
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={author.avatar} 
                                alt={author.name} 
                                className="w-24 h-24 rounded-full border-[4px] border-white shadow-md object-cover bg-white"
                            />
                        </Link>
                        {/* Onay Rozeti (Sadece isVerified true ise) */}
                        {author.isVerified && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-sm" title="Onaylı Uzman">
                                <i className="fa-solid fa-check text-xs"></i>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2">
                        <Link href={profileUrl} className="text-xl font-extrabold text-gray-800 hover:text-blue-600 transition block leading-tight">
                            {displayName}
                        </Link>
                        {/* Dinamik Meslek */}
                        <span className={`inline-flex items-center gap-1.5 ${style?.badgeBg || 'bg-gray-100'} ${style?.text || 'text-gray-700'} text-[10px] font-black px-3 py-1 rounded-full border-b-2 border-black/5 mt-2 uppercase tracking-wider`}>
                            <i className={`fa-solid ${style.decorationIcon}`}></i>
                            {getProfessionLabel(author.profession || '') || 'Rejimde Uzmanı'}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 px-4 py-5 text-center mt-2">
                    {/* RejiScore */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mb-1 text-sm shadow-sm">
                            <i className="fa-solid fa-chart-simple"></i>
                        </div>
                        <span className="font-black text-gray-700 text-sm">{author.reji_score ?? '--'}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">RejiScore</span>
                    </div>
                    
                    {/* Danışan Sayısı */}
                    <div className="flex flex-col items-center border-l border-r border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-1 text-sm shadow-sm">
                            <i className="fa-solid fa-users"></i>
                        </div>
                        <span className="font-black text-gray-700 text-sm">{author.client_count ?? 0}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Danışan</span>
                    </div>
                    
                    {/* Takipçi Sayısı */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-1 text-sm shadow-sm">
                            <i className="fa-solid fa-heart"></i>
                        </div>
                        <span className="font-black text-gray-700 text-sm">{followerCount}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Takipçi</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3 mt-4">
                    <Link href={profileUrl} className={`w-full font-bold py-3 rounded-2xl border-b-[4px] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase text-sm shadow-md ${style?.btnMain || 'bg-indigo-500 hover:bg-indigo-600 border-indigo-700 text-white'}`}>
                        <i className="fa-solid fa-calendar-check text-base"></i>
                        Randevu Al
                    </Link>
                    
                    <button 
                        onClick={handleFollow}
                        className={`w-full font-bold py-3 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${isFollowing ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'}`}
                    >
                        <i className={`fa-solid ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                        {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                    </button>
                    
                    {/* Extra Info */}
                    <div className="flex justify-between items-center px-2 pt-1 text-[10px] font-bold text-gray-400">
                        <span>{followerCount} Takipçi</span>
                        <span>{experienceYears !== null && experienceYears >= 0 ? `${experienceYears}+ Yıl Tecrübe` : ''}</span>
                    </div>
                </div>
            </div>
        );
    }

    // --- STANDART KULLANICI KARTI TASARIMI ---
    return (
        <div className="bg-white rounded-[2rem] border-2 border-gray-200 shadow-[0_6px_0_#E5E7EB] overflow-hidden relative group transition-transform hover:-translate-y-1">
            
            {/* Header Background */}
            <div className="h-24 bg-blue-50 w-full relative overflow-hidden">
                <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-blue-200 opacity-60 animate-pulse"></div>
                <div className="absolute top-10 left-16 w-3 h-3 rounded-full bg-blue-300 opacity-60"></div>
                <div className="absolute top-6 right-10 w-10 h-10 rounded-full border-4 border-blue-200 opacity-30"></div>
            </div>

            {/* Avatar & Info */}
            <div className="px-6 relative -mt-12 flex items-end justify-between z-10">
                <div className="relative group-hover:scale-105 transition-transform duration-300">
                     <Link href={profileUrl}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={author.avatar} 
                            alt={author.name} 
                            className="w-20 h-20 rounded-2xl border-[4px] border-white shadow-md object-cover bg-white"
                        />
                     </Link>
                     {/* Yazı Sayısı Rozeti (Avatar Üzerinde) */}
                     <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-[2px] border-white shadow-sm" title="İçerik Sayısı">
                        {author.content_count || author.articleCount || 1}
                    </div>
                </div>
                <div className="mb-2 text-right flex-1 pl-2">
                    <Link href={profileUrl} className="text-lg font-extrabold text-gray-800 leading-tight hover:text-blue-600 transition block">
                        {author.name}
                    </Link>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{context}</span>
                </div>
            </div>

            {/* Gamification Stats */}
            <div className="px-6 py-6">
                 {/* Rejimde Skoru */}
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Rejimde Skoru</span>
                    <span className="text-sm font-black text-blue-500">{author.rejimde_total_score || author.score || 0} XP</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-3 mb-6 border border-gray-200 overflow-hidden relative">
                     <div className="absolute top-0 left-0 h-full bg-blue-400 w-2/3 shadow-[0_2px_0_rgba(0,0,0,0.1) inset]"></div>
                     <div className="absolute top-0 left-0 h-full w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] opacity-30 animate-[shine_2s_infinite]"></div>
                 </div>

                 {/* Grid Stats */}
                 <div className="flex justify-between items-center text-center gap-3">
                     <div className="bg-orange-50 rounded-2xl p-3 flex-1 border border-orange-100 group/stat hover:bg-orange-100 transition">
                         <div className="text-orange-500 font-black text-xl flex items-center justify-center gap-1 group-hover/stat:scale-110 transition">
                             <i className="fa-solid fa-hand-spock"></i> {highFives}
                         </div>
                         <div className="text-[9px] text-orange-400/80 font-black uppercase tracking-wide">Beşlik</div>
                     </div>
                     <div className="bg-indigo-50 rounded-2xl p-3 flex-1 border border-indigo-100 group/stat hover:bg-indigo-100 transition">
                         <div className="text-indigo-500 font-black text-xl flex items-center justify-center gap-1 group-hover/stat:scale-110 transition">
                             {/* Kilo verdi yerine Takipçi */}
                             <i className="fa-solid fa-users"></i> {followerCount}
                         </div>
                         <div className="text-[9px] text-indigo-400/80 font-black uppercase tracking-wide">Takipçi</div>
                     </div>
                 </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
                <button 
                    onClick={handleHighFive}
                    disabled={hasHighFived}
                    className={`flex-1 ${hasHighFived ? 'bg-gray-100 text-gray-400 border-gray-300' : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-600'} font-black py-3 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide`}
                >
                    <i className="fa-solid fa-hand-holding-heart text-base"></i>
                    {hasHighFived ? 'Çakıldı!' : "5'lik Çak"}
                </button>
                
                <button 
                    onClick={handleFollow}
                    className={`w-14 font-bold py-3 rounded-2xl border-2 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center ${isFollowing ? 'bg-blue-100 text-blue-500 border-blue-200 hover:bg-blue-200' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                >
                    <i className={`fa-solid ${isFollowing ? 'fa-user-check' : 'fa-user-plus'} text-lg`}></i>
                </button>
            </div>
        </div>
    );
}