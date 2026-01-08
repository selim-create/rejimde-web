'use client';

import { useState } from 'react';

type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export default function ProVerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>('not_submitted');
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    profession: 'dietitian'
  });
  const [files, setFiles] = useState({
    idDocument: null as File | null,
    certificate: null as File | null,
    workplaceDoc: null as File | null
  });
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles({ ...files, [field]: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.idNumber || !files.idDocument || !files.certificate) {
      setSubmitStatus({
        type: 'error',
        message: 'Lütfen tüm zorunlu alanları doldurun ve gerekli belgeleri yükleyin.'
      });
      return;
    }

    setIsSubmitting(true);
    
    // TODO: Implement actual file upload and form submission to backend API
    // This is a placeholder simulation for UI demonstration
    setTimeout(() => {
      setStatus('pending');
      setIsSubmitting(false);
      setSubmitStatus({
        type: 'success',
        message: 'Başvurunuz başarıyla gönderildi! Ekibimiz 2-5 iş günü içinde inceleyecektir.'
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/dashboard/pro" className="text-slate-400 hover:text-white transition">
            <i className="fa-solid fa-arrow-left"></i>
          </a>
          <h1 className="font-extrabold text-white text-xl">Onaylı Uzman Başvurusu</h1>
          <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-black uppercase border border-purple-500/20 ml-auto">
            Doğrulama
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Status Banner */}
        {status === 'pending' && (
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-clock text-yellow-400 text-xl"></i>
            </div>
            <div>
              <h3 className="font-black text-yellow-400 text-lg mb-2">Başvurunuz İnceleniyor</h3>
              <p className="text-slate-300 font-bold text-sm">
                Belgeleriniz ekibimiz tarafından inceleniyor. 2-5 iş günü içinde e-posta ile bilgilendirileceksiniz.
              </p>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-check-circle text-green-400 text-xl"></i>
            </div>
            <div>
              <h3 className="font-black text-green-400 text-lg mb-2">Tebrikler! Onaylandınız</h3>
              <p className="text-slate-300 font-bold text-sm mb-3">
                Onaylı uzman rozetiniz aktif edildi. +20 bonus puan hesabınıza eklendi.
              </p>
              <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-500/30">
                <i className="fa-solid fa-certificate text-green-400"></i>
                <span className="font-black text-green-400 text-sm">Onaylı Uzman</span>
              </div>
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-exclamation-circle text-red-400 text-xl"></i>
            </div>
            <div>
              <h3 className="font-black text-red-400 text-lg mb-2">Başvurunuz Reddedildi</h3>
              <p className="text-slate-300 font-bold text-sm mb-2">
                Belgelerinizde eksiklik veya uyumsuzluk tespit edildi. Lütfen bilgileri kontrol edip tekrar başvurun.
              </p>
              <button 
                onClick={() => setStatus('not_submitted')}
                className="text-blue-400 font-bold text-sm hover:text-blue-300 underline"
              >
                Yeniden Başvur →
              </button>
            </div>
          </div>
        )}

        {/* Information Card */}
        <div className="bg-gradient-to-r from-purple-900/40 to-slate-800 border border-slate-700 rounded-3xl p-6 mb-8">
          <h2 className="font-black text-white text-2xl mb-3 flex items-center gap-2">
            <i className="fa-solid fa-certificate text-purple-400"></i>
            Onaylı Uzman Nedir?
          </h2>
          <p className="text-slate-300 font-bold mb-4">
            Onaylı uzman rozeti, kimlik ve sertifikalarını doğrulayan profesyonel sağlık uzmanlarına verilen bir güven işaretidir.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <i className="fa-solid fa-star text-2xl text-yellow-400 mb-2"></i>
              <h3 className="font-black text-white mb-1">+20 Bonus Puan</h3>
              <p className="text-xs text-slate-400 font-bold">Tek seferlik onay bonusu</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <i className="fa-solid fa-arrow-up text-2xl text-blue-400 mb-2"></i>
              <h3 className="font-black text-white mb-1">Üst Sıralarda</h3>
              <p className="text-xs text-slate-400 font-bold">Arama önceliği</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <i className="fa-solid fa-badge-check text-2xl text-purple-400 mb-2"></i>
              <h3 className="font-black text-white mb-1">Güven Rozeti</h3>
              <p className="text-xs text-slate-400 font-bold">Profilinde görünür</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        {(status === 'not_submitted' || status === 'rejected') && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-card">
            <h2 className="font-black text-white text-xl mb-6">Başvuru Formu</h2>
            
            {/* Status Message */}
            {submitStatus && (
              <div className={`mb-6 p-4 rounded-xl border-2 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  <i className={`fa-solid ${submitStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                  {submitStatus.message}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-400 text-sm uppercase tracking-wide">Kişisel Bilgiler</h3>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                    Ad Soyad <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 font-bold text-white focus:border-purple-500 outline-none transition"
                    placeholder="Örn: Dr. Ahmet Yılmaz"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                    TC Kimlik No <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 font-bold text-white focus:border-purple-500 outline-none transition"
                    placeholder="11 haneli TC kimlik numarası"
                    maxLength={11}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                    Meslek <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 font-bold text-white focus:border-purple-500 outline-none transition"
                  >
                    <option value="dietitian">Diyetisyen</option>
                    <option value="trainer">Spor Eğitmeni</option>
                    <option value="physiotherapist">Fizyoterapist</option>
                    <option value="psychologist">Psikolog</option>
                    <option value="doctor">Doktor</option>
                    <option value="other">Diğer Sağlık Uzmanı</option>
                  </select>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-400 text-sm uppercase tracking-wide">Belgeler</h3>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <i className="fa-solid fa-id-card text-blue-400 text-xl mt-1"></i>
                    <div className="flex-1">
                      <h4 className="font-black text-white mb-1">Kimlik Belgesi <span className="text-red-400">*</span></h4>
                      <p className="text-xs text-slate-400 font-bold mb-3">TC Kimlik veya pasaport fotoğrafı (JPG, PNG - Max 5MB)</p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange('idDocument', e)}
                        accept="image/*"
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                        required
                      />
                      {files.idDocument && (
                        <p className="text-xs text-green-400 font-bold mt-2">
                          <i className="fa-solid fa-check-circle mr-1"></i>
                          {files.idDocument.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <i className="fa-solid fa-graduation-cap text-purple-400 text-xl mt-1"></i>
                    <div className="flex-1">
                      <h4 className="font-black text-white mb-1">Sertifika/Diploma <span className="text-red-400">*</span></h4>
                      <p className="text-xs text-slate-400 font-bold mb-3">Meslek sertifikası veya diploma (JPG, PNG, PDF - Max 5MB)</p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange('certificate', e)}
                        accept="image/*,.pdf"
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                        required
                      />
                      {files.certificate && (
                        <p className="text-xs text-green-400 font-bold mt-2">
                          <i className="fa-solid fa-check-circle mr-1"></i>
                          {files.certificate.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <i className="fa-solid fa-building text-green-400 text-xl mt-1"></i>
                    <div className="flex-1">
                      <h4 className="font-black text-white mb-1">İş Yeri Belgesi (Opsiyonel)</h4>
                      <p className="text-xs text-slate-400 font-bold mb-3">Klinik veya spor salonu çalışan belgesi (JPG, PNG, PDF - Max 5MB)</p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange('workplaceDoc', e)}
                        accept="image/*,.pdf"
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-green-500/10 file:text-green-400 hover:file:bg-green-500/20"
                      />
                      {files.workplaceDoc && (
                        <p className="text-xs text-green-400 font-bold mt-2">
                          <i className="fa-solid fa-check-circle mr-1"></i>
                          {files.workplaceDoc.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Process */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
                <h3 className="font-black text-blue-400 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-info-circle"></i>
                  Doğrulama Süreci
                </h3>
                <div className="space-y-2 text-sm font-bold text-slate-300">
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-400 mt-1"></i>
                    <span>Belgeleriniz 2-5 iş günü içinde incelenir</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-400 mt-1"></i>
                    <span>Onay sonucu e-posta ile bildirilir</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-check text-blue-400 mt-1"></i>
                    <span>Onaylandığında rozet ve bonus puan otomatik aktif olur</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-btn shadow-purple-800 btn-game hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Başvuruyu Gönder
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 font-bold text-center">
                Başvurarak <a href="/privacy" className="text-blue-400 hover:underline">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
              </p>
            </form>
          </div>
        )}

        {/* Pending state - Show submitted info */}
        {status === 'pending' && (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-card">
            <h2 className="font-black text-white text-xl mb-6">Başvuru Bilgileri</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                <span className="text-slate-400 font-bold">Durum:</span>
                <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-lg text-sm font-black border border-yellow-500/20">
                  İnceleniyor
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                <span className="text-slate-400 font-bold">Başvuru Tarihi:</span>
                <span className="text-white font-black">{new Date().toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                <span className="text-slate-400 font-bold">Tahmini Yanıt:</span>
                <span className="text-white font-black">2-5 İş Günü</span>
              </div>
            </div>
          </div>
        )}

        {/* Help Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 font-bold text-sm mb-2">Yardıma mı ihtiyacınız var?</p>
          <a href="/help/pro/verification" className="text-blue-400 font-bold hover:text-blue-300 transition">
            Onaylı Uzman Rehberini İncele →
          </a>
        </div>
      </div>
    </div>
  );
}
