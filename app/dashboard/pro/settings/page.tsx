"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getMe, updateUser, changePassword, uploadAvatar, uploadCertificate } from "@/lib/api";
import { CITIES } from "@/lib/locations";

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  avatar: string;
  role: string;
  // Expert specific fields
  title?: string;
  bio?: string;
  specializations?: string[];
  experience?: string;
  education?: string;
  certificates?: string[];
  city?: string;
  district?: string;
  languages?: string[];
  gender?: string;
  birthDate?: string;
  tcNo?: string;
  sessionPrice?: number;
  sessionDuration?: number;
  availableOnline?: boolean;
  availableInPerson?: boolean;
}

export default function ProSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "expert">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    email: "",
  });

  const [expertData, setExpertData] = useState({
    title: "",
    bio: "",
    specializations: [] as string[],
    experience: "",
    education: "",
    city: "",
    district: "",
    languages: [] as string[],
    gender: "",
    birthDate: "",
    tcNo: "",
    sessionPrice: 0,
    sessionDuration: 50,
    availableOnline: true,
    availableInPerson: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certificates, setCertificates] = useState<string[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);

  const specializationOptions = [
    "Klinik Psikolog",
    "Uzman Psikolog",
    "Psikiyatrist",
    "Aile Terapisti",
    "Çift Terapisti",
    "Çocuk Psikoloğu",
    "Ergen Psikoloğu",
    "Travma Uzmanı",
    "Bağımlılık Uzmanı",
    "Yeme Bozuklukları Uzmanı",
    "Anksiyete Uzmanı",
    "Depresyon Uzmanı",
    "OKB Uzmanı",
    "EMDR Terapisti",
    "Bilişsel Davranışçı Terapist",
    "Psikanalitik Terapist",
    "Gestalt Terapist",
    "Varoluşçu Terapist",
  ];

  const languageOptions = [
    "Türkçe",
    "İngilizce",
    "Almanca",
    "Fransızca",
    "İspanyolca",
    "Arapça",
    "Rusça",
    "Çince",
    "Japonca",
    "Korece",
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getMe();
      
      if (response.success && response.data) {
        const user = response.data;
        setUserData(user);
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          displayName: user.displayName || "",
          phone: user.phone || "",
          email: user.email || "",
        });
        setExpertData({
          title: user.title || "",
          bio: user.bio || "",
          specializations: user.specializations || [],
          experience: user.experience || "",
          education: user.education || "",
          city: user.city || "",
          district: user.district || "",
          languages: user.languages || ["Türkçe"],
          gender: user.gender || "",
          birthDate: user.birthDate || "",
          tcNo: user.tcNo || "",
          sessionPrice: user.sessionPrice || 0,
          sessionDuration: user.sessionDuration || 50,
          availableOnline: user.availableOnline ?? true,
          availableInPerson: user.availableInPerson ?? false,
        });
        setCertificates(user.certificates || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: "error", text: "Kullanıcı bilgileri yüklenemedi" });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        phone: formData.phone,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Profil bilgileri güncellendi" });
        fetchUserData();
      } else {
        setMessage({ type: "error", text: response.message || "Güncelleme başarısız" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  const handleExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await updateUser({
        ...expertData,
        certificates,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Uzman bilgileri güncellendi" });
        fetchUserData();
      } else {
        setMessage({ type: "error", text: response.message || "Güncelleme başarısız" });
      }
    } catch (error) {
      console.error("Error updating expert data:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Yeni şifreler eşleşmiyor" });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Şifre en az 8 karakter olmalıdır" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setMessage({ type: "success", text: "Şifre başarıyla değiştirildi" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: response.message || "Şifre değiştirilemedi" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Lütfen bir resim dosyası seçin" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Dosya boyutu 5MB'dan küçük olmalıdır" });
      return;
    }

    setAvatarUploading(true);
    setMessage(null);

    try {
      const response = await uploadAvatar(file);

      if (response.success) {
        setMessage({ type: "success", text: "Profil fotoğrafı güncellendi" });
        fetchUserData();
      } else {
        setMessage({ type: "error", text: response.message || "Yükleme başarısız" });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Lütfen resim veya PDF dosyası seçin" });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Dosya boyutu 10MB'dan küçük olmalıdır" });
      return;
    }

    setCertificateUploading(true);
    setMessage(null);

    try {
      const response = await uploadCertificate(file);

      if (response.success && response.data?.url) {
        setCertificates([...certificates, response.data.url]);
        setMessage({ type: "success", text: "Sertifika yüklendi" });
      } else {
        setMessage({ type: "error", text: response.message || "Yükleme başarısız" });
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      setMessage({ type: "error", text: "Bir hata oluştu" });
    } finally {
      setCertificateUploading(false);
    }
  };

  const removeCertificate = (index: number) => {
    const newCertificates = certificates.filter((_, i) => i !== index);
    setCertificates(newCertificates);
  };

  const toggleSpecialization = (spec: string) => {
    if (expertData.specializations.includes(spec)) {
      setExpertData({
        ...expertData,
        specializations: expertData.specializations.filter((s) => s !== spec),
      });
    } else {
      setExpertData({
        ...expertData,
        specializations: [...expertData.specializations, spec],
      });
    }
  };

  const toggleLanguage = (lang: string) => {
    if (expertData.languages.includes(lang)) {
      setExpertData({
        ...expertData,
        languages: expertData.languages.filter((l) => l !== lang),
      });
    } else {
      setExpertData({
        ...expertData,
        languages: [...expertData.languages, lang],
      });
    }
  };

  const getDistrictsForCity = (cityName: string) => {
    const city = CITIES.find((c) => c.name === cityName);
    return city?.districts || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fa-solid fa-circle-notch animate-spin text-primary-600 text-3xl"></i>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ayarlar</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <i className="fa-solid fa-user"></i>
          Profil Bilgileri
        </button>
        <button
          onClick={() => setActiveTab("expert")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "expert"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <i className="fa-solid fa-briefcase"></i>
          Uzman Bilgileri
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <i className="fa-solid fa-lock"></i>
          Güvenlik
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <i className={`fa-solid ${message.type === "success" ? "fa-check" : "fa-times"}`}></i>
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {userData?.avatar ? (
                  <Image
                    src={userData.avatar}
                    alt="Profil"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-semibold">
                    {userData?.firstName?.[0] || "U"}
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {avatarUploading ? (
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-camera"></i>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profil Fotoğrafı</h3>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG veya WebP. Maksimum 5MB.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fa-solid fa-user text-gray-400 mr-2"></i>
                  Ad
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fa-solid fa-user text-gray-400 mr-2"></i>
                  Soyad
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fa-solid fa-id-card text-gray-400 mr-2"></i>
                Görünen Ad
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Profilinizde görünecek ad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fa-solid fa-envelope text-gray-400 mr-2"></i>
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                E-posta adresi değiştirilemez
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fa-solid fa-phone text-gray-400 mr-2"></i>
                Telefon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="5XX XXX XX XX"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expert Tab */}
      {activeTab === "expert" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleExpertSubmit} className="space-y-8">
            {/* Basic Expert Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-info-circle text-primary-600"></i>
                Temel Bilgiler
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    value={expertData.title}
                    onChange={(e) => setExpertData({ ...expertData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Örn: Klinik Psikolog, Uzman Psikolog"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hakkımda
                  </label>
                  <textarea
                    value={expertData.bio}
                    onChange={(e) => setExpertData({ ...expertData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Kendinizi ve uzmanlık alanlarınızı tanıtın..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fa-solid fa-venus-mars text-gray-400 mr-2"></i>
                      Cinsiyet
                    </label>
                    <select
                      value={expertData.gender}
                      onChange={(e) => setExpertData({ ...expertData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="">Seçiniz</option>
                      <option value="male">Erkek</option>
                      <option value="female">Kadın</option>
                      <option value="other">Belirtmek İstemiyorum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="fa-solid fa-calendar text-gray-400 mr-2"></i>
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      value={expertData.birthDate}
                      onChange={(e) => setExpertData({ ...expertData, birthDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fa-solid fa-id-card text-gray-400 mr-2"></i>
                    TC Kimlik No
                  </label>
                  <input
                    type="text"
                    value={expertData.tcNo}
                    onChange={(e) => setExpertData({ ...expertData, tcNo: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="11 haneli TC Kimlik numaranız"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Kimlik doğrulama için gereklidir, gizli tutulur.
                  </p>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-briefcase text-primary-600"></i>
                Uzmanlık Alanları
              </h3>
              <div className="flex flex-wrap gap-2">
                {specializationOptions.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      expertData.specializations.includes(spec)
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Education & Experience */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-graduation-cap text-primary-600"></i>
                Eğitim ve Deneyim
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eğitim Bilgileri
                  </label>
                  <textarea
                    value={expertData.education}
                    onChange={(e) => setExpertData({ ...expertData, education: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Lisans, yüksek lisans, doktora vb. eğitim bilgileriniz..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deneyim
                  </label>
                  <textarea
                    value={expertData.experience}
                    onChange={(e) => setExpertData({ ...expertData, experience: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Çalıştığınız kurumlar, yıl, pozisyon vb..."
                  />
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-certificate text-primary-600"></i>
                Sertifikalar ve Belgeler
              </h3>
              
              <div className="space-y-4">
                {certificates.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-file-alt text-gray-400"></i>
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">
                            Sertifika {index + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => certificateInputRef.current?.click()}
                  disabled={certificateUploading}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50"
                >
                  {certificateUploading ? (
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                  ) : (
                    <i className="fa-solid fa-upload"></i>
                  )}
                  Sertifika Yükle
                </button>
                <input
                  ref={certificateInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCertificateUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP veya PDF. Maksimum 10MB.
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-map-marker-alt text-primary-600"></i>
                Konum
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İl
                  </label>
                  <select
                    value={expertData.city}
                    onChange={(e) => setExpertData({ ...expertData, city: e.target.value, district: "" })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="">İl Seçiniz</option>
                    {CITIES.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <select
                    value={expertData.district}
                    onChange={(e) => setExpertData({ ...expertData, district: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    disabled={!expertData.city}
                  >
                    <option value="">İlçe Seçiniz</option>
                    {getDistrictsForCity(expertData.city).map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-language text-primary-600"></i>
                Diller
              </h3>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      expertData.languages.includes(lang)
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-calendar text-primary-600"></i>
                Seans Ayarları
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seans Ücreti (₺)
                    </label>
                    <input
                      type="number"
                      value={expertData.sessionPrice}
                      onChange={(e) => setExpertData({ ...expertData, sessionPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seans Süresi (dk)
                    </label>
                    <select
                      value={expertData.sessionDuration}
                      onChange={(e) => setExpertData({ ...expertData, sessionDuration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value={30}>30 dakika</option>
                      <option value={45}>45 dakika</option>
                      <option value={50}>50 dakika</option>
                      <option value={60}>60 dakika</option>
                      <option value={90}>90 dakika</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expertData.availableOnline}
                      onChange={(e) => setExpertData({ ...expertData, availableOnline: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Online görüşme yapıyorum</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expertData.availableInPerson}
                      onChange={(e) => setExpertData({ ...expertData, availableInPerson: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Yüz yüze görüşme yapıyorum</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Şifre Değiştir</h3>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fa-solid ${showPasswords.current ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fa-solid ${showPasswords.new ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">En az 8 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fa-solid ${showPasswords.confirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Değiştiriliyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i>
                    Şifreyi Değiştir
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
