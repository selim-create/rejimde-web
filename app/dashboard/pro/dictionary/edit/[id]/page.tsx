'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api'; 

// Kategori Bazlı Konfigürasyon
const CATEGORY_CONFIG: Record<string, any> = {
    'Fitness': {
        icon: 'fa-dumbbell',
        color: 'text-red-500',
        fields: ['muscles', 'equipment', 'difficulty'],
        labels: { muscles: 'Hedef Kaslar', equipment: 'Ekipman' }
    },
    'Yoga': {
        icon: 'fa-yin-yang',
        color: 'text-purple-500',
        fields: ['sanskrit_name', 'muscles', 'difficulty'],
        labels: { sanskrit_name: 'Sanskritçe Adı', muscles: 'Etkilenen Bölgeler' }
    },
    'Pilates': {
        icon: 'fa-person-praying',
        color: 'text-blue-500',
        fields: ['equipment', 'muscles', 'difficulty'],
        labels: { equipment: 'Alet (Reformer/Mat)', muscles: 'Odak Bölgesi' }
    },
    'Beslenme': {
        icon: 'fa-carrot',
        color: 'text-green-500',
        fields: ['food_group', 'calories'], 
        labels: { food_group: 'Besin Grubu', calories: 'Kalori (100g)' }
    },
    'Meditasyon': {
        icon: 'fa-brain',
        color: 'text-indigo-500',
        fields: ['duration'],
        labels: { duration: 'Önerilen Süre (dk)' }
    }
};

const MUSCLE_GROUPS = ['Karın (Core)', 'Bacaklar', 'Kollar', 'Sırt', 'Göğüs', 'Omuz', 'Tüm Vücut'];
const EQUIPMENTS = ['Mat', 'Dumbbell', 'Kettlebell', 'Barbell', 'Direnç Bandı', 'Reformer', 'Vücut Ağırlığı'];
const FOOD_GROUPS = ['Protein', 'Karbonhidrat', 'Yağ', 'Vitamin/Mineral', 'Sıvı'];

export default function EditDictionaryItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Medya tipi seçimi
  const [mediaInputType, setMediaInputType] = useState<'video' | 'image_url' | 'image_upload'>('video');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Fitness',
    video_url: '',
    image_url: '',
    difficulty: 1,
    muscles: [] as string[],
    equipment: [] as string[],
    benefit: '',
    alt_names: '',
    sanskrit_name: '',
    food_group: '',
    calories: ''
  });

  const activeConfig = CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG['Fitness'];

  // Mevcut veriyi çek
  useEffect(() => {
    async function fetchItem() {
      try {
        const data = await auth.getDictionaryItemById(id);
        if (data) {
          setFormData({
            title: data.title || '',
            content: data.content || '',
            excerpt: data.excerpt || '',
            category: data.category || 'Fitness',
            video_url: data.video_url || '',
            image_url: data.image_url || '',
            difficulty: data.difficulty || 1,
            muscles: Array.isArray(data.muscles) ? data.muscles : [],
            equipment: Array.isArray(data.equipment) ? data.equipment : [],
            benefit: data.main_benefit || data.benefit || '',
            alt_names: data.alt_names || '',
            sanskrit_name: data.sanskrit_name || '',
            food_group: data.food_group || '',
            calories: data.calories || ''
          });
          
          // Set media input type based on existing data
          if (data.video_url) {
            setMediaInputType('video');
          } else if (data.image_url) {
            setMediaInputType('image_url');
          }
        } else {
          alert('Terim bulunamadı');
          router.push('/sozluk');
        }
      } catch (error) {
        console.error(error);
        alert('Terim yüklenirken hata oluştu');
        router.push('/sozluk');
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
          const res = await auth.uploadMedia(file); 
          if (res.success) {
              setFormData(prev => ({ ...prev, image_url: res.url }));
          } else {
              alert('Görsel yüklenemedi: ' + res.message);
          }
      } catch (error) {
          console.error(error);
          alert('Yükleme hatası.');
      } finally {
          setUploading(false);
      }
  };

  const toggleSelection = (field: 'muscles' | 'equipment', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(i => i !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("Başlık zorunludur.");
    
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        video_url: formData.video_url,
        image_url: formData.image_url,
        main_benefit: formData.benefit,
        difficulty: formData.difficulty,
        alt_names: formData.alt_names,
        muscles: formData.muscles,
        equipment: formData.equipment,
        sanskrit_name: formData.sanskrit_name,
        food_group: formData.food_group,
        calories: formData.calories
      };

      const res = await auth.updateDictionaryItem(Number(id), payload);
      
      if (res && res.success) {
          alert('Terim başarıyla güncellendi! 🎉');
          router.push('/sozluk');
      } else {
          alert('Hata: ' + (res?.message || 'Güncellenemedi'));
      }

    } catch (error) {
      console.error(error);
      alert('Beklenmedik bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Terim yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/50">
        
        <div className="bg-indigo-600 text-white pt-24 pb-12 relative overflow-hidden mb-8 shadow-lg">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 backdrop-blur-sm">
                    <i className="fa-solid fa-pen-to-square text-3xl"></i>
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Terimi Düzenle</h1>
                <p className="text-indigo-100 font-bold text-lg opacity-90">Sözlük içeriğini güncelle.</p>
            </div>
        </div>

        <LayoutWrapper>
            <div className="max-w-4xl mx-auto px-4">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Kategori Seçimi - Abbreviated for length, same as create page */}
                    <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-6 shadow-sm">
                        <label className="block text-xs font-black text-gray-400 uppercase mb-4 ml-1">Kategori Seçimi</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.keys(CATEGORY_CONFIG).map(cat => (
                                <div 
                                    key={cat}
                                    onClick={() => setFormData({...formData, category: cat})}
                                    className={`cursor-pointer rounded-xl p-4 text-center border-2 transition-all duration-200 ${
                                        formData.category === cat 
                                        ? `border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md transform -translate-y-1` 
                                        : 'border-gray-100 hover:border-gray-300 text-gray-500'
                                    }`}
                                >
                                    <i className={`fa-solid ${CATEGORY_CONFIG[cat].icon} text-2xl mb-2 block`}></i>
                                    <span className="font-bold text-xs uppercase">{cat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. TEMEL BİLGİLER */}
                    <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-100 pb-4">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeConfig.color.replace('text-', 'bg-').replace('500', '100')} ${activeConfig.color}`}>
                                <i className={`fa-solid ${activeConfig.icon}`}></i>
                            </span>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide">Terim Detayları</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Terim Adı</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Örn: Squat"
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-black text-gray-800 text-lg focus:border-indigo-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Alternatif İsimler</label>
                                <input 
                                    type="text" 
                                    value={formData.alt_names}
                                    onChange={e => setFormData({...formData, alt_names: e.target.value})}
                                    placeholder="Örn: Çömelme"
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-600 focus:border-indigo-500 outline-none transition"
                                />
                            </div>

                            {/* DİNAMİK ALANLAR */}
                            {activeConfig.fields.includes('sanskrit_name') && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">{activeConfig.labels.sanskrit_name}</label>
                                    <input 
                                        type="text" 
                                        value={formData.sanskrit_name}
                                        onChange={e => setFormData({...formData, sanskrit_name: e.target.value})}
                                        className="w-full bg-purple-50 border-2 border-purple-100 rounded-xl px-4 py-3 font-bold text-purple-700 focus:border-purple-500 outline-none transition"
                                    />
                                </div>
                            )}

                            {activeConfig.fields.includes('food_group') && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-1">{activeConfig.labels.food_group}</label>
                                    <select 
                                        value={formData.food_group} 
                                        onChange={e => setFormData({...formData, food_group: e.target.value})}
                                        className="w-full bg-green-50 border-2 border-green-100 rounded-xl px-4 py-3 font-bold text-green-700 focus:border-green-500 outline-none transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Seçiniz</option>
                                        {FOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Ana Fayda (Motto)</label>
                                <input 
                                    type="text" 
                                    value={formData.benefit}
                                    onChange={e => setFormData({...formData, benefit: e.target.value})}
                                    placeholder="Örn: Tüm vücudu güçlendirir."
                                    className="w-full bg-yellow-50 border-2 border-yellow-100 rounded-xl px-4 py-3 font-bold text-yellow-700 focus:border-yellow-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase mb-1">Detaylı Açıklama</label>
                                <textarea 
                                    rows={5}
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                    placeholder="Nasıl yapılır? Nelere dikkat edilmeli?"
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-600 focus:border-indigo-500 outline-none transition resize-y"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. MEDYA SEÇİMİ */}
                    <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide">Medya Ekle</h3>
                            <div className="bg-gray-100 p-1 rounded-xl flex self-start sm:self-auto">
                                <button 
                                    type="button"
                                    onClick={() => setMediaInputType('video')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-2 ${mediaInputType === 'video' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <i className="fa-brands fa-youtube"></i> Video
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setMediaInputType('image_upload')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-2 ${mediaInputType === 'image_upload' ? 'bg-white shadow-sm text-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Yükle
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setMediaInputType('image_url')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-2 ${mediaInputType === 'image_url' ? 'bg-white shadow-sm text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <i className="fa-solid fa-link"></i> Link
                                </button>
                            </div>
                        </div>

                        {/* Video Input */}
                        {mediaInputType === 'video' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex gap-2">
                                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center text-xl shrink-0">
                                        <i className="fa-brands fa-youtube"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.video_url}
                                        onChange={e => setFormData({...formData, video_url: e.target.value})}
                                        placeholder="Youtube Video ID (Örn: dQw4w9WgXcQ)"
                                        className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-mono text-gray-600 focus:border-red-400 outline-none transition"
                                    />
                                </div>
                                {formData.video_url && (
                                    <div className="rounded-xl overflow-hidden shadow-md aspect-video">
                                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${formData.video_url}`} allowFullScreen className="border-0"></iframe>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Image Upload Input */}
                        {mediaInputType === 'image_upload' && (
                            <div className="animate-in fade-in">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-4 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition group relative"
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    
                                    {formData.image_url && !formData.video_url ? (
                                        <div className="relative h-64 w-full">
                                            <img src={formData.image_url} className="w-full h-full object-contain rounded-xl" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                                                <span className="text-white font-bold"><i className="fa-solid fa-pen mr-2"></i> Değiştir</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-300 mb-3 group-hover:text-indigo-400 transition"></i>
                                            <p className="text-gray-500 font-bold">Görsel Yüklemek İçin Tıkla</p>
                                            <p className="text-xs text-gray-400 mt-1">İllüstrasyon veya fotoğraf (Max 2MB)</p>
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                            <p className="text-indigo-500 font-bold animate-pulse">Yükleniyor...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Image URL Input */}
                        {mediaInputType === 'image_url' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex gap-2">
                                    <div className="w-12 h-12 bg-green-100 text-green-500 rounded-xl flex items-center justify-center text-xl shrink-0">
                                        <i className="fa-solid fa-link"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.image_url}
                                        onChange={e => setFormData({...formData, image_url: e.target.value, video_url: ''})} // Link girilince videoyu temizle
                                        placeholder="https://ornek-gorsel-linki.com/resim.jpg"
                                        className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 font-mono text-gray-600 focus:border-green-400 outline-none transition"
                                    />
                                </div>
                                {formData.image_url && !formData.video_url && (
                                    <div className="rounded-xl overflow-hidden shadow-md h-64 bg-gray-100 relative">
                                        <img src={formData.image_url} className="w-full h-full object-contain" alt="Preview" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. ETİKETLER */}
                    {(activeConfig.fields.includes('muscles') || activeConfig.fields.includes('equipment')) && (
                        <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-6">Etiketler</h3>
                            
                            {activeConfig.fields.includes('muscles') && (
                                <div className="mb-6">
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">{activeConfig.labels.muscles || 'Kas Grupları'}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {MUSCLE_GROUPS.map(muscle => (
                                            <button
                                                type="button"
                                                key={muscle}
                                                onClick={() => toggleSelection('muscles', muscle)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition ${
                                                    formData.muscles.includes(muscle) 
                                                    ? 'bg-red-500 text-white border-red-500 shadow-sm' 
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'
                                                }`}
                                            >
                                                {muscle}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeConfig.fields.includes('equipment') && (
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">{activeConfig.labels.equipment || 'Ekipman'}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EQUIPMENTS.map(eq => (
                                            <button
                                                type="button"
                                                key={eq}
                                                onClick={() => toggleSelection('equipment', eq)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition ${
                                                    formData.equipment.includes(eq) 
                                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                                                }`}
                                            >
                                                {eq}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUBMIT */}
                    <div className="pt-4 border-t-2 border-gray-100">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-extrabold uppercase text-lg shadow-btn shadow-indigo-800 btn-game hover:bg-indigo-700 hover:scale-[1.01] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i> Terimi Güncelle
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </LayoutWrapper>

    </div>
  );
}
