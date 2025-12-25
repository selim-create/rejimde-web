'use client';

import { useParams } from 'next/navigation';
import { LEVELS } from '@/lib/constants';

export default function LevelDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    
    const level = LEVELS.find(l => l.slug === slug);
    
    if (!level) {
        return <div>Level bulunamadı</div>;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-black">{level.name}</h1>
                <p className="text-xl text-gray-600 mt-4">{level.description}</p>
                <div className="mt-8">
                    <span className={`${level.color} text-6xl`}>
                        <i className={`fa-solid ${level.icon}`}></i>
                    </span>
                </div>
                <p className="mt-4 text-gray-500">
                    Gerekli Puan: {level.min} - {level.max}
                </p>
            </div>
        </div>
    );
}
