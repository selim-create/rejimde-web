"use client";

import { useState } from "react";
import { requestService } from "@/lib/api";

interface ServiceRequestModalProps {
    expertId: number;
    expertName: string;
    service: {
        id: number;
        name: string;
        price: number;
        type: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export default function ServiceRequestModal({ 
    expertId, 
    expertName, 
    service, 
    onClose, 
    onSuccess 
}: ServiceRequestModalProps) {
    const [message, setMessage] = useState('');
    const [contactPreference, setContactPreference] = useState<'message' | 'video' | 'phone'>('message');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        
        try {
            const res = await requestService({
                expert_id: expertId,
                service_id: service.id,
                message,
                contact_preference: contactPreference
            });
            
            if (res.success) {
                onSuccess();
            } else {
                setError(res.message || 'Talep gönderilemedi.');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-paper-plane text-2xl text-green-600"></i>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-800">Paket Talebi</h2>
                    <p className="text-sm text-gray-500 mt-1">{expertName} - {service.name}</p>
                </div>

                <div className="space-y-4">
                    {/* Fiyat Bilgisi */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <span className="text-2xl font-black text-gray-800">{service.price} ₺</span>
                        <span className="text-sm text-gray-500 block">{service.type}</span>
                    </div>

                    {/* Mesaj */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mesajınız (Opsiyonel)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Kendinizi kısaca tanıtın veya hedefinizi belirtin..."
                            className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-green-500 focus:outline-none resize-none h-24"
                        />
                    </div>

                    {/* İletişim Tercihi */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">İletişim Tercihi</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'message', label: 'Mesaj', icon: 'fa-message' },
                                { id: 'video', label: 'Video', icon: 'fa-video' },
                                { id: 'phone', label: 'Telefon', icon: 'fa-phone' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setContactPreference(opt.id as any)}
                                    className={`p-3 rounded-xl border-2 text-center transition ${
                                        contactPreference === opt.id 
                                            ? 'border-green-500 bg-green-50 text-green-600' 
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <i className={`fa-solid ${opt.icon} block text-lg mb-1`}></i>
                                    <span className="text-xs font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold">
                            <i className="fa-solid fa-circle-exclamation mr-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Butonlar */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition disabled:opacity-50"
                        >
                            {loading ? 'Gönderiliyor...' : 'Talep Gönder'}
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center">
                        Talebiniz uzmana iletilecektir. Onaylandığında bilgilendirileceksiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}
