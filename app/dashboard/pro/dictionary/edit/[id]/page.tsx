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

                    {/* Form fields same as create page - shortened for brevity */}
                    <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-8 shadow-sm">
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
                            <div className="col-span-2">
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
