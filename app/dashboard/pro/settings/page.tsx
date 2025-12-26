"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
    FaUser, 
    FaCamera, 
    FaMapMarkerAlt, 
    FaBriefcase, 
    FaClock, 
    FaMoneyBillWave, 
    FaCertificate, 
    FaGraduationCap,
    FaInstagram,
    FaGlobe,
    FaTiktok,
    FaSave,
    FaSpinner,
    FaCheckCircle,
    FaExclamationCircle,
    FaTimes,
    FaPlus,
    FaTrash,
    FaYoutube,
    FaImage,
    FaVideo
} from 'react-icons/fa';
import { turkishCities, getDistrictsByCity } from '@/lib/turkishLocations';

// Uzmanlık alanları
const expertiseAreas = [
    "Kilo Verme",
    "Kas Geliştirme", 
    "Fonksiyonel Antrenman",
    "Rehabilitasyon",
    "Sporcu Performansı",
    "Vücut Geliştirme",
    "Kardiyovasküler Sağlık",
    "Esneklik ve Mobilite",
    "Yaşlı Fitness",
    "Hamilelik ve Doğum Sonrası",
    "Gençler ve Çocuklar",
    "Beslenme Koçluğu",
    "Online Koçluk",
    "Grup Dersleri",
    "HIIT",
    "CrossFit",
    "Yoga",
    "Pilates",
    "Boks/Kickboks",
    "Yüzme"
];

// Sertifikalar
const certificationOptions = [
    "ACE (American Council on Exercise)",
    "NASM (National Academy of Sports Medicine)",
    "ACSM (American College of Sports Medicine)",
    "ISSA (International Sports Sciences Association)",
    "NSCA (National Strength and Conditioning Association)",
    "CrossFit Level 1/2/3",
    "Yoga Alliance RYT 200/500",
    "Pilates Mat/Reformer",
    "TRX Suspension Training",
    "Kettlebell Certification",
    "Olympic Weightlifting",
    "Sports Nutrition Certification",
    "CPR/AED/First Aid",
    "Pre/Postnatal Fitness",
    "Senior Fitness Specialist",
    "Corrective Exercise Specialist",
    "Performance Enhancement Specialist",
    "Türkiye Vücut Geliştirme Federasyonu",
    "Gençlik ve Spor Bakanlığı Antrenörlük Belgesi",
    "Üniversite Spor Bilimleri Diploması"
];

interface ProProfile {
    id: string;
    user_id: string;
    // Temel bilgiler
    display_name: string;
    bio: string;
    profile_image_url: string;
    cover_image_url: string;
    // Konum
    city: string;
    district: string;
    address: string;
    // Mesleki
    experience_years: number;
    expertise_areas: string[];
    certifications: string[];
    education: string;
    // Çalışma bilgileri
    session_duration: number;
    session_types: string[];
    availability_status: string;
    // Fiyatlandırma
    hourly_rate: number;
    package_rates: { sessions: number; price: number; discount: number }[];
    // Galeri
    gallery_images: string[];
    intro_video_url: string;
    // Sosyal
    instagram_url: string;
    youtube_url: string;
    tiktok_url: string;
    website_url: string;
    // Durum
    is_verified: boolean;
    is_featured: boolean;
    rating: number;
    total_reviews: number;
    created_at: string;
    updated_at: string;
}

export default function ProSettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState('profile');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState<Partial<ProProfile>>({
        display_name: '',
        bio: '',
        profile_image_url: '',
        cover_image_url: '',
        city: '',
        district: '',
        address: '',
        experience_years: 0,
        expertise_areas: [],
        certifications: [],
        education: '',
        session_duration: 60,
        session_types: [],
        availability_status: 'available',
        hourly_rate: 0,
        package_rates: [],
        gallery_images: [],
        intro_video_url: '',
        instagram_url: '',
        youtube_url: '',
        tiktok_url: '',
        website_url: ''
    });

    const [districts, setDistricts] = useState<string[]>([]);
    const [newCertification, setNewCertification] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (formData.city) {
            const cityDistricts = getDistrictsByCity(formData.city);
            setDistricts(cityDistricts);
        }
    }, [formData.city]);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }
            setUser(user);
            await loadProfile(user.id);
        } catch (error) {
            console.error('Auth error:', error);
            router.push('/auth');
        } finally {
            setLoading(false);
        }
    };

    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('pro_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading profile:', error);
                return;
            }

            if (data) {
                setFormData(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleImageUpload = async (file: File, type: 'profile' | 'cover' | 'gallery') => {
        if (!user) return;
        
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${type}/${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('pro-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('pro-images')
                .getPublicUrl(fileName);

            if (type === 'profile') {
                setFormData(prev => ({ ...prev, profile_image_url: publicUrl }));
            } else if (type === 'cover') {
                setFormData(prev => ({ ...prev, cover_image_url: publicUrl }));
            } else if (type === 'gallery') {
                setFormData(prev => ({
                    ...prev,
                    gallery_images: [...(prev.gallery_images || []), publicUrl]
                }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Resim yüklenirken bir hata oluştu.');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            gallery_images: prev.gallery_images?.filter((_, i) => i !== index) || []
        }));
    };

    const addPackageRate = () => {
        setFormData(prev => ({
            ...prev,
            package_rates: [...(prev.package_rates || []), { sessions: 8, price: 0, discount: 10 }]
        }));
    };

    const removePackageRate = (index: number) => {
        setFormData(prev => ({
            ...prev,
            package_rates: prev.package_rates?.filter((_, i) => i !== index) || []
        }));
    };

    const updatePackageRate = (index: number, field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            package_rates: prev.package_rates?.map((pkg, i) => 
                i === index ? { ...pkg, [field]: value } : pkg
            ) || []
        }));
    };

    const toggleExpertise = (expertise: string) => {
        setFormData(prev => ({
            ...prev,
            expertise_areas: prev.expertise_areas?.includes(expertise)
                ? prev.expertise_areas.filter(e => e !== expertise)
                : [...(prev.expertise_areas || []), expertise]
        }));
    };

    const toggleCertification = (cert: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications?.includes(cert)
                ? prev.certifications.filter(c => c !== cert)
                : [...(prev.certifications || []), cert]
        }));
    };

    const addCustomCertification = () => {
        if (newCertification.trim() && !formData.certifications?.includes(newCertification.trim())) {
            setFormData(prev => ({
                ...prev,
                certifications: [...(prev.certifications || []), newCertification.trim()]
            }));
            setNewCertification('');
        }
    };

    const toggleSessionType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            session_types: prev.session_types?.includes(type)
                ? prev.session_types.filter(t => t !== type)
                : [...(prev.session_types || []), type]
        }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        
        setSaving(true);
        setSaveStatus('idle');

        try {
            const { data: existing } = await supabase
                .from('pro_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            const profileData = {
                ...formData,
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            let error;
            if (existing) {
                const { error: updateError } = await supabase
                    .from('pro_profiles')
                    .update(profileData)
                    .eq('user_id', user.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('pro_profiles')
                    .insert({
                        ...profileData,
                        created_at: new Date().toISOString()
                    });
                error = insertError;
            }

            if (error) throw error;

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <FaSpinner className="animate-spin text-4xl text-rejimde-green" />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profil', icon: FaUser },
        { id: 'professional', label: 'Mesleki', icon: FaBriefcase },
        { id: 'pricing', label: 'Fiyatlandırma', icon: FaMoneyBillWave },
        { id: 'gallery', label: 'Galeri', icon: FaImage },
        { id: 'social', label: 'Sosyal', icon: FaGlobe }
    ];

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">PRO Profil Ayarları</h1>
                        <p className="text-slate-400 mt-1">Profesyonel profilinizi oluşturun ve müşterilerinizi etkileyin</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            saving 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : saveStatus === 'success'
                                ? 'bg-green-500 text-white'
                                : saveStatus === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-rejimde-green text-black hover:bg-rejimde-green/90'
                        }`}
                    >
                        {saving ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : saveStatus === 'success' ? (
                            <>
                                <FaCheckCircle />
                                Kaydedildi!
                            </>
                        ) : saveStatus === 'error' ? (
                            <>
                                <FaExclamationCircle />
                                Hata!
                            </>
                        ) : (
                            <>
                                <FaSave />
                                Kaydet
                            </>
                        )}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-2 rounded-2xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-rejimde-green text-black'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <tab.icon className="text-sm" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-slate-900/50 rounded-3xl p-6 md:p-8 border border-slate-800">
                    
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">Kapak Fotoğrafı</label>
                                <div 
                                    className="relative h-48 bg-slate-800 rounded-2xl overflow-hidden cursor-pointer group"
                                    onClick={() => coverInputRef.current?.click()}
                                >
                                    {formData.cover_image_url ? (
                                        <Image
                                            src={formData.cover_image_url}
                                            alt="Cover"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <FaCamera className="text-4xl text-slate-600 mx-auto mb-2" />
                                                <p className="text-slate-500">Kapak fotoğrafı ekleyin</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <FaCamera className="text-3xl text-white" />
                                    </div>
                                </div>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                                />
                            </div>

                            {/* Profile Image & Name */}
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-bold text-white mb-3">Profil Fotoğrafı</label>
                                    <div 
                                        className="relative w-32 h-32 bg-slate-800 rounded-2xl overflow-hidden cursor-pointer group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {formData.profile_image_url ? (
                                            <Image
                                                src={formData.profile_image_url}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <FaUser className="text-4xl text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <FaCamera className="text-2xl text-white" />
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                                    />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Görünen İsim</label>
                                        <input
                                            type="text"
                                            value={formData.display_name}
                                            onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                                            placeholder="Müşterilerinizin göreceği isim"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Biyografi</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            placeholder="Kendinizi tanıtın, uzmanlık alanlarınızdan ve deneyimlerinizden bahsedin..."
                                            rows={4}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-rejimde-green" />
                                    Konum Bilgileri
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">İl</label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value, district: ''})}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                        >
                                            <option value="">İl Seçin</option>
                                            {turkishCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">İlçe</label>
                                        <select
                                            value={formData.district}
                                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                                            disabled={!formData.city}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green disabled:opacity-50"
                                        >
                                            <option value="">İlçe Seçin</option>
                                            {districts.map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Tab */}
                    {activeTab === 'professional' && (
                        <div className="space-y-8">
                            {/* Experience */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaClock className="text-rejimde-green" />
                                    Deneyim
                                </h3>
                                <div className="max-w-xs">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Deneyim Süresi (Yıl)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={formData.experience_years}
                                        onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                    />
                                </div>
                            </div>

                            {/* Expertise Areas */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaBriefcase className="text-rejimde-green" />
                                    Uzmanlık Alanları
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {expertiseAreas.map(area => (
                                        <button
                                            key={area}
                                            onClick={() => toggleExpertise(area)}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                                formData.expertise_areas?.includes(area)
                                                    ? 'bg-rejimde-green text-black'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {area}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaCertificate className="text-rejimde-green" />
                                    Sertifikalar
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {certificationOptions.map(cert => (
                                        <button
                                            key={cert}
                                            onClick={() => toggleCertification(cert)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                formData.certifications?.includes(cert)
                                                    ? 'bg-rejimde-green text-black'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {cert}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Custom certification */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCertification}
                                        onChange={(e) => setNewCertification(e.target.value)}
                                        placeholder="Başka sertifika ekleyin..."
                                        className="flex-1 bg-slate-900 border border-slate-600 rounded-xl p-3 font-medium text-white outline-none focus:border-rejimde-green"
                                        onKeyPress={(e) => e.key === 'Enter' && addCustomCertification()}
                                    />
                                    <button
                                        onClick={addCustomCertification}
                                        className="px-4 py-3 bg-rejimde-green text-black rounded-xl font-bold hover:bg-rejimde-green/90 transition-all"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                {/* Selected certifications */}
                                {formData.certifications && formData.certifications.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Seçili Sertifikalar:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.certifications.map((cert, index) => (
                                                <span
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-white"
                                                >
                                                    {cert}
                                                    <button
                                                        onClick={() => toggleCertification(cert)}
                                                        className="text-slate-400 hover:text-red-400"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Education */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaGraduationCap className="text-rejimde-green" />
                                    Eğitim
                                </h3>
                                <textarea
                                    value={formData.education}
                                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                                    placeholder="Eğitim geçmişinizi yazın (üniversite, bölüm, kurslar vb.)"
                                    rows={3}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                        <div className="space-y-8">
                            {/* Session Types */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Ders Türleri</h3>
                                <div className="flex flex-wrap gap-3">
                                    {['Yüz Yüze', 'Online', 'Açık Hava'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleSessionType(type)}
                                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                                formData.session_types?.includes(type)
                                                    ? 'bg-rejimde-green text-black'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Session Duration */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Ders Süresi</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[30, 45, 60, 90, 120].map(duration => (
                                        <button
                                            key={duration}
                                            onClick={() => setFormData({...formData, session_duration: duration})}
                                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                                formData.session_duration === duration
                                                    ? 'bg-rejimde-green text-black'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            {duration} dk
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-rejimde-green" />
                                    Saatlik Ücret
                                </h3>
                                <div className="max-w-xs">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.hourly_rate}
                                            onChange={(e) => setFormData({...formData, hourly_rate: parseInt(e.target.value) || 0})}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pr-12 font-medium text-white outline-none focus:border-rejimde-green"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                                    </div>
                                </div>
                            </div>

                            {/* Package Rates */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Paket Fiyatları</h3>
                                    <button
                                        onClick={addPackageRate}
                                        className="flex items-center gap-2 px-4 py-2 bg-rejimde-green text-black rounded-xl font-bold hover:bg-rejimde-green/90 transition-all"
                                    >
                                        <FaPlus /> Paket Ekle
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {formData.package_rates?.map((pkg, index) => (
                                        <div key={index} className="flex flex-wrap items-center gap-4 bg-slate-800/50 p-4 rounded-xl">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ders Sayısı</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={pkg.sessions}
                                                    onChange={(e) => updatePackageRate(index, 'sessions', parseInt(e.target.value) || 0)}
                                                    className="w-24 bg-slate-900 border border-slate-600 rounded-lg p-2 font-medium text-white outline-none focus:border-rejimde-green"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Toplam Fiyat (₺)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={pkg.price}
                                                    onChange={(e) => updatePackageRate(index, 'price', parseInt(e.target.value) || 0)}
                                                    className="w-32 bg-slate-900 border border-slate-600 rounded-lg p-2 font-medium text-white outline-none focus:border-rejimde-green"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">İndirim (%)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={pkg.discount}
                                                    onChange={(e) => updatePackageRate(index, 'discount', parseInt(e.target.value) || 0)}
                                                    className="w-20 bg-slate-900 border border-slate-600 rounded-lg p-2 font-medium text-white outline-none focus:border-rejimde-green"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removePackageRate(index)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all mt-5"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Müsaitlik Durumu</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { value: 'available', label: 'Müsait', color: 'bg-green-500' },
                                        { value: 'limited', label: 'Sınırlı', color: 'bg-yellow-500' },
                                        { value: 'unavailable', label: 'Müsait Değil', color: 'bg-red-500' }
                                    ].map(status => (
                                        <button
                                            key={status.value}
                                            onClick={() => setFormData({...formData, availability_status: status.value})}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                                formData.availability_status === status.value
                                                    ? 'bg-rejimde-green text-black'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gallery Tab */}
                    {activeTab === 'gallery' && (
                        <div className="space-y-8">
                            {/* Intro Video */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaVideo className="text-rejimde-green" />
                                    Tanıtım Videosu
                                </h3>
                                <p className="text-slate-400 text-sm mb-3">YouTube video linki ekleyin</p>
                                <input
                                    type="url"
                                    value={formData.intro_video_url}
                                    onChange={(e) => setFormData({...formData, intro_video_url: e.target.value})}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                />
                            </div>

                            {/* Gallery */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <FaImage className="text-rejimde-green" />
                                    Galeri Fotoğrafları
                                </h3>
                                <p className="text-slate-400 text-sm mb-3">Antrenman fotoğrafları, müşteri dönüşümleri, çalışma ortamınız</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.gallery_images?.map((img, index) => (
                                        <div key={index} className="relative aspect-square bg-slate-800 rounded-xl overflow-hidden group">
                                            <Image
                                                src={img}
                                                alt={`Gallery ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <button
                                        onClick={() => galleryInputRef.current?.click()}
                                        disabled={uploadingImage}
                                        className="aspect-square bg-slate-800 rounded-xl border-2 border-dashed border-slate-600 hover:border-rejimde-green transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-rejimde-green"
                                    >
                                        {uploadingImage ? (
                                            <FaSpinner className="animate-spin text-2xl" />
                                        ) : (
                                            <>
                                                <FaPlus className="text-2xl" />
                                                <span className="text-sm font-medium">Ekle</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'gallery')}
                                />
                            </div>
                        </div>
                    )}

                    {/* Social Tab */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Sosyal Medya Hesapları</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
                                        <FaInstagram className="text-pink-500" /> Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.instagram_url}
                                        onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                                        placeholder="https://instagram.com/kullaniciadi"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
                                        <FaYoutube className="text-red-500" /> YouTube
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.youtube_url}
                                        onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                                        placeholder="https://youtube.com/@kanaliniz"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
                                        <FaTiktok /> TikTok
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.tiktok_url}
                                        onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
                                        placeholder="https://tiktok.com/@kullaniciadi"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
                                        <FaGlobe className="text-blue-400" /> Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website_url}
                                        onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                                        placeholder="https://siteniz.com"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
