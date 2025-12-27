"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { getMe, updateUser, changePassword, uploadAvatar, uploadCertificate } from "@/lib/api";
import { CITIES } from "@/lib/locations";
import { LANGUAGE_OPTIONS, COUNTRY_OPTIONS } from "@/lib/constants";
import {
  ProfessionalExperienceSection,
  ExpertiseTagsSection,
  WorkCommunicationSection,
  ExcludedCasesSection,
  PrivacySettingsSection,
} from "@/components/ProSettingsSections";
import DatePickerRejimde from "@/components/ui/DatePickerRejimde";
import TimePickerRejimde from "@/components/ui/TimePickerRejimde";
import MarkdownEditor from "@/components/ui/MarkdownEditor";

type MessageState = { type: "success" | "error"; text: string } | null;

type EducationItem = { school: string; department: string; year: string };
type CertificateItem = { name: string; institution: string; year: string; file_url: string };

// Client Type Options
const CLIENT_TYPE_OPTIONS = [
  { id: 'woman', label: 'Kadın' },
  { id: 'man', label: 'Erkek' },
  { id: 'child', label: 'Çocuk' },
  { id: 'all', label: 'Hepsi' },
];

// Consultation Method Options (Multi-select)
const CONSULTATION_METHOD_OPTIONS = [
  { id: 'message', icon: 'fa-message', label: 'Yazılı Mesaj' },
  { id: 'video', icon: 'fa-video', label: 'Video Görüşme' },
  { id: 'face', icon: 'fa-people-arrows', label: 'Yüz Yüze Görüşme' },
];

// Sidebar Navigation Sections
const SIDEBAR_SECTIONS = [
  { id: 'identity', icon: 'fa-id-card', label: 'Kimlik & İletişim' },
  { id: 'location', icon: 'fa-location-dot', label: 'Lokasyon' },
  { id: 'professional', icon: 'fa-briefcase', label: 'Mesleki Detaylar' },
  { id: 'experience', icon: 'fa-graduation-cap', label: 'Deneyim & Eğitim' },
  { id: 'expertise', icon: 'fa-tags', label: 'Uzmanlık & Etiketler' },
  { id: 'excluded', icon: 'fa-triangle-exclamation', label: 'Çalışmadığı Durumlar' },
  { id: 'work', icon: 'fa-clock', label: 'Çalışma & İletişim' },
  { id: 'privacy', icon: 'fa-shield', label: 'Görünürlük' },
  { id: 'security', icon: 'fa-lock', label: 'Güvenlik' },
];

type FormData = {
  // Basic identity
  name: string;
  email: string;
  title: string;
  brand_name: string;
  bio: string;
  avatar_url: string;
  certificate_url: string;
  certificate_status: string;

  // New identity fields
  motto: string;
  birth_date: string;

  // Professional details
  client_type: string; // 'woman' | 'man' | 'child' | 'all'

  // New professional experience
  career_start_date: string;
  education: EducationItem[];
  certificates: CertificateItem[];

  // Expertise & tags
  expertise_tags: string[];
  goal_tags: string[];
  level_suitability: string[];
  age_groups: string[];

  // Location
  country: string;
  city: string;
  district: string;
  address: string;
  service_languages: string[];

  // Contact
  phone: string;

  // Excluded cases
  excluded_cases: string[];
  referral_note: string;

  // Work & communication
  working_hours: {
    weekday: string;
    weekend: string;
  };
  response_time: string;
  communication_preference: string[]; // Changed to array for multi-select

  // Privacy
  privacy_settings: {
    show_phone: boolean;
    show_address: boolean;
    show_location: boolean;
  };
  kvkk_consent: boolean;
  emergency_disclaimer: boolean;
};

export default function ProSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    // Basic identity
    name: "",
    email: "",
    title: "",
    brand_name: "",
    bio: "",
    avatar_url: "https://i.pravatar.cc/150?img=44",
    certificate_url: "",
    certificate_status: "none",

    // New identity fields
    motto: "",
    birth_date: "",

    // Professional details
    client_type: "all",

    // New professional experience
    career_start_date: "",
    education: [],
    certificates: [],

    // Expertise & tags
    expertise_tags: [],
    goal_tags: [],
    level_suitability: [],
    age_groups: [],

    // Location
    country: "TR",
    city: "",
    district: "",
    address: "",
    service_languages: ["tr"],

    // Contact
    phone: "",

    // Excluded cases
    excluded_cases: [],
    referral_note: "",

    // Work & communication
    working_hours: {
      weekday: "",
      weekend: "",
    },
    response_time: "24h",
    communication_preference: [],

    // Privacy
    privacy_settings: {
      show_phone: false,
      show_address: false,
      show_location: true,
    },
    kvkk_consent: false,
    emergency_disclaimer: false,
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [activeSection, setActiveSection] = useState<string>("identity");

  // Seçilen şehre göre ilçeleri getir
  const selectedCity = CITIES.find((c) => c.id === formData.city);

  // Güvenli JSON parse helper
  const parseMaybeJson = <T,>(value: any, fallback: T): T => {
    try {
      if (value == null) return fallback;
      if (typeof value === "string") return JSON.parse(value) as T;
      return value as T;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    async function loadData() {
      const getLocalStorageFallback = () => {
        try {
          const name = localStorage.getItem("user_name") || "";
          const email = localStorage.getItem("user_email") || "";
          const avatar =
            localStorage.getItem("user_avatar") || "https://api.dicebear.com/9.x/personas/svg?seed=pro";
          return { name, email, avatar_url: avatar };
        } catch {
          return { name: "", email: "", avatar_url: "https://api.dicebear.com/9.x/personas/svg?seed=pro" };
        }
      };

      try {
        const user = await getMe();

        if (user) {
          const userData: any = user;

          setFormData({
            // Basic identity
            name: user.name || "",
            email: user.email || "",
            title: userData.title || "",
            brand_name: userData.brand_name || "",
            bio: userData.bio || "",
            avatar_url:
              user.avatar_url || user.avatar_urls?.["96"] || "https://api.dicebear.com/9.x/personas/svg?seed=pro",
            certificate_url: userData.certificate_url || "",
            certificate_status: userData.certificate_status || "none",

            // New identity fields
            motto: userData.motto || "",
            birth_date: userData.birth_date || "",

            // Professional details
            client_type: userData.client_type || "all",

            // Professional experience
            career_start_date: userData.career_start_date || "",
            education: parseMaybeJson<EducationItem[]>(userData.education, []),
            certificates: parseMaybeJson<CertificateItem[]>(userData.certificates, []),

            // Expertise & tags
            expertise_tags: parseMaybeJson<string[]>(userData.expertise_tags, []),
            goal_tags: parseMaybeJson<string[]>(userData.goal_tags, []),
            level_suitability: parseMaybeJson<string[]>(userData.level_suitability, []),
            age_groups: parseMaybeJson<string[]>(userData.age_groups, []),

            // Location
            country: userData.country || "TR",
            city: userData.city || "",
            district: userData.district || "",
            address: userData.address || "",
            service_languages: parseMaybeJson<string[]>(userData.service_languages, ["tr"]),

            // Contact
            phone: userData.phone || "",

            // Excluded cases
            excluded_cases: parseMaybeJson<string[]>(userData.excluded_cases, []),
            referral_note: userData.referral_note || "",

            // Work & communication
            working_hours: parseMaybeJson<{ weekday: string; weekend: string }>(userData.working_hours, {
              weekday: "",
              weekend: "",
            }),
            response_time: userData.response_time || "24h",
            communication_preference: parseMaybeJson<string[]>(userData.communication_preference, []),

            // Privacy
            privacy_settings: parseMaybeJson<FormData["privacy_settings"]>(userData.privacy_settings, {
              show_phone: false,
              show_address: false,
              show_location: true,
            }),
            kvkk_consent: Boolean(userData.kvkk_consent),
            emergency_disclaimer: Boolean(userData.emergency_disclaimer),
          });
        } else {
          const fallback = getLocalStorageFallback();
          setFormData((prev) => ({ ...prev, ...fallback }));
        }
      } catch (error) {
        console.error("Settings veri hatası", error);
        const fallback = getLocalStorageFallback();
        setFormData((prev) => ({ ...prev, ...fallback }));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Scroll spy for sidebar navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = SIDEBAR_SECTIONS.map(s => s.id);
      const scrollPosition = window.scrollY + 150; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function for multi-select tags
  const toggleTag = (
    field: "expertise_tags" | "goal_tags" | "level_suitability" | "age_groups" | "service_languages" | "excluded_cases" | "communication_preference",
    value: string
  ) => {
    setFormData((prev) => {
      const currentTags = prev[field] as string[];
      if (currentTags.includes(value)) {
        return { ...prev, [field]: currentTags.filter((t) => t !== value) };
      }
      return { ...prev, [field]: [...currentTags, value] };
    });
  };

  // Avatar Yükleme
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Dosya boyutu 2MB'dan küçük olmalıdır." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSaving(true);

    // Önizleme
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = ev.target?.result as string | undefined;
      if (preview) setFormData((prev) => ({ ...prev, avatar_url: preview }));
    };
    reader.readAsDataURL(file);

    try {
      const uploadRes: any = await uploadAvatar(file);

      if (uploadRes?.success && uploadRes?.url) {
        const updated = { ...formData, avatar_url: uploadRes.url };
        setFormData(updated);

        const updateRes: any = await updateUser({ avatar_url: uploadRes.url });

        if (updateRes?.success) {
          setMessage({ type: "success", text: "Profil fotoğrafı güncellendi." });
          try {
            localStorage.setItem("user_avatar", uploadRes.url);
            window.dispatchEvent(new Event("storage"));
          } catch {}
        } else {
          setMessage({ type: "error", text: "Fotoğraf yüklendi fakat profile atanamadı." });
        }
      } else {
        setMessage({ type: "error", text: uploadRes?.message || "Dosya yüklenemedi." });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sertifika Yükleme
  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Dosya boyutu 5MB'dan küçük olmalıdır." });
      if (certInputRef.current) certInputRef.current.value = "";
      return;
    }

    setSaving(true);

    try {
      const uploadRes: any = await uploadCertificate(file);

      if (uploadRes?.success && uploadRes?.url) {
        const updated = { ...formData, certificate_url: uploadRes.url, certificate_status: "pending" };
        setFormData(updated);

        await updateUser({ certificate_url: uploadRes.url, certificate_status: "pending" });

        setMessage({ type: "success", text: "Sertifika yüklendi ve onaya gönderildi." });
      } else {
        setMessage({ type: "error", text: uploadRes?.message || "Yükleme başarısız." });
      }
    } catch {
      setMessage({ type: "error", text: "Hata oluştu." });
    } finally {
      setSaving(false);
      if (certInputRef.current) certInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const dataToSend = {
      ...formData,
      education: JSON.stringify(formData.education),
      certificates: JSON.stringify(formData.certificates),
      expertise_tags: JSON.stringify(formData.expertise_tags),
      goal_tags: JSON.stringify(formData.goal_tags),
      level_suitability: JSON.stringify(formData.level_suitability),
      age_groups: JSON.stringify(formData.age_groups),
      service_languages: JSON.stringify(formData.service_languages),
      excluded_cases: JSON.stringify(formData.excluded_cases),
      working_hours: JSON.stringify(formData.working_hours),
      communication_preference: JSON.stringify(formData.communication_preference),
      privacy_settings: JSON.stringify(formData.privacy_settings),
    };

    try {
      const result: any = await updateUser(dataToSend);

      if (result?.success) {
        setMessage({ type: "success", text: "Uzman profiliniz güncellendi." });
        try {
          localStorage.setItem("user_name", formData.name);
          window.dispatchEvent(new Event("storage"));
        } catch {}
      } else {
        setMessage({ type: "error", text: result?.message || "Hata oluştu." });
      }
    } catch {
      setMessage({ type: "error", text: "Hata oluştu." });
    } finally {
      setSaving(false);
    }
  };

  // Dynamic arrays helpers
  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { school: "", department: "", year: "" }],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }));
  };

  const addCertificate = () => {
    setFormData((prev) => ({
      ...prev,
      certificates: [...prev.certificates, { name: "", institution: "", year: "", file_url: "" }],
    }));
  };

  const removeCertificate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
  };

  const updateCertificate = (index: number, field: keyof CertificateItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certificates: prev.certificates.map((cert, i) => (i === index ? { ...cert, [field]: value } : cert)),
    }));
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Calculate experience years
  const calculateExperience = (startDate: string) => {
    if (!startDate) return null;
    const today = new Date();
    const start = new Date(startDate);
    let years = today.getFullYear() - start.getFullYear();
    const monthDiff = today.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < start.getDate())) years--;
    return years;
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 100; // Header offset
      const top = section.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: "error", text: "Yeni şifreler eşleşmiyor." });
      return;
    }
    setSaving(true);
    try {
      const res: any = await changePassword(passwordData.current, passwordData.new);
      if (res?.success) {
        setMessage({ type: "success", text: "Şifreniz değiştirildi." });
        setPasswordData({ current: "", new: "", confirm: "" });
      } else {
        setMessage({ type: "error", text: res?.message || "Şifre değiştirilemedi." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Pro Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/pro" className="text-slate-400 hover:text-white transition">
          <i className="fa-solid fa-arrow-left"></i> Panele Dön
        </Link>
        <h1 className="font-extrabold text-white text-xl">Uzman Profil Ayarları</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-xl font-bold text-sm ${
                message.type === "success"
                  ? "bg-green-900/50 text-green-400 border border-green-800"
                  : "bg-red-900/50 text-red-400 border border-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

        {/* 1. KİMLİK & AVATAR */}
        <div id="identity" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
          <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-id-card text-rejimde-blue"></i> Kimlik & İletişim
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-6">
            {/* Avatar Change */}
            <div className="relative group cursor-pointer w-24 h-24 shrink-0" onClick={() => fileInputRef.current?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.avatar_url}
                className="w-full h-full rounded-2xl border-4 border-slate-600 object-cover group-hover:border-rejimde-blue transition shadow-sm"
                alt="Avatar"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                {saving ? (
                  <i className="fa-solid fa-circle-notch animate-spin text-white text-xl"></i>
                ) : (
                  <i className="fa-solid fa-camera text-white text-xl"></i>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ad Soyad / Marka</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">E-posta</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Unvan (Örn: Uzman Diyetisyen)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kurum / Klinik Adı</label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue"
                  placeholder="Varsa kurum adınız"
                />
              </div>

              <div>
                <DatePickerRejimde
                  label="Doğum Tarihi"
                  value={formData.birth_date}
                  onChange={(date) => setFormData({ ...formData, birth_date: date })}
                  maxDate={new Date()}
                />
                {formData.birth_date && (
                  <p className="text-xs text-slate-500 mt-1 font-bold">Yaş: {calculateAge(formData.birth_date)}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Motto / Yaklaşım (Max 150 karakter)</label>
                <textarea
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value.slice(0, 150) })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-blue h-20 resize-none"
                  placeholder="Kısa ve öz bir motto veya yaklaşımınızı yazın..."
                />
                <p className="text-xs text-slate-500 mt-1 text-right font-bold">{formData.motto.length}/150</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. LOKASYON BİLGİLERİ */}
        <div id="location" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
          <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-rejimde-green"></i> Lokasyon & Adres
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ülke</label>
                <select
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-green cursor-pointer"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value, city: "", district: "" })}
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hizmet Dilleri</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => toggleTag("service_languages", lang.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition ${
                        formData.service_languages.includes(lang.id)
                          ? "bg-rejimde-green text-white border-rejimde-green"
                          : "bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formData.country === "TR" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Şehir</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-green cursor-pointer"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, district: "" })}
                  >
                    <option value="">Seçiniz</option>
                    {CITIES.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">İlçe</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-green cursor-pointer disabled:opacity-50"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    disabled={!formData.city}
                  >
                    <option value="">Seçiniz</option>
                    {(selectedCity?.districts || []).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Şehir / Bölge</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-green"
                  placeholder="Şehir veya bölge adını yazın"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Açık Adres (Yüz Yüze İçin)</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-rejimde-green h-20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. MESLEKİ DETAYLAR */}
        <div id="professional" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
          <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-briefcase text-rejimde-purple"></i> Mesleki Detaylar
          </h2>

          <div className="space-y-4">
            <MarkdownEditor
              label="Özgeçmiş / Biyografi"
              value={formData.bio}
              onChange={(value) => setFormData({ ...formData, bio: value })}
              placeholder="Kendinizi tanıtın, deneyimlerinizi ve yaklaşımınızı paylaşın..."
              maxLength={2000}
            />
          </div>
        </div>

        {/* 4. BELGELER & SERTİFİKA */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-file-contract text-rejimde-yellow"></i> Belgeler
          </h2>

          <div
            onClick={() => certInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 cursor-pointer transition group text-center ${
              formData.certificate_status === "approved"
                ? "border-green-500 bg-green-900/10"
                : "border-slate-600 hover:bg-slate-700 hover:border-rejimde-yellow"
            }`}
          >
            {formData.certificate_status === "approved" ? (
              <>
                <i className="fa-solid fa-circle-check text-3xl text-green-500 mb-3"></i>
                <p className="text-sm font-bold text-green-400">Belgeleriniz Onaylandı</p>
                <p className="text-xs text-slate-400 mt-1">Profilinizde &quot;Onaylı Uzman&quot; rozeti görünüyor.</p>
              </>
            ) : formData.certificate_status === "pending" ? (
              <>
                <i className="fa-solid fa-clock text-3xl text-yellow-500 mb-3"></i>
                <p className="text-sm font-bold text-yellow-400">Onay Bekliyor</p>
                <p className="text-xs text-slate-400 mt-1">Belgeniz inceleniyor. Yeni dosya yüklemek için tıklayın.</p>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-3 group-hover:text-rejimde-yellow transition"></i>
                <p className="text-sm font-bold text-slate-300">Sertifika / Diploma Yükle</p>
                <p className="text-xs text-slate-500 mt-1 font-bold">PDF, JPG, PNG (Max 5MB)</p>
              </>
            )}

            <input type="file" ref={certInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertificateChange} />
          </div>
        </div>

        {/* NEW SECTIONS */}
        <ProfessionalExperienceSection
          formData={formData}
          setFormData={setFormData}
          calculateExperience={calculateExperience}
          toggleTag={toggleTag}
          addEducation={addEducation}
          removeEducation={removeEducation}
          updateEducation={updateEducation}
          addCertificate={addCertificate}
          removeCertificate={removeCertificate}
          updateCertificate={updateCertificate}
        />

        <ExpertiseTagsSection formData={formData} setFormData={setFormData} toggleTag={toggleTag} calculateExperience={calculateExperience} />

        <ExcludedCasesSection formData={formData} setFormData={setFormData} toggleTag={toggleTag} calculateExperience={calculateExperience} />

        <WorkCommunicationSection formData={formData} setFormData={setFormData} toggleTag={toggleTag} calculateExperience={calculateExperience} />

        <PrivacySettingsSection formData={formData} setFormData={setFormData} toggleTag={toggleTag} calculateExperience={calculateExperience} />

        {/* KAYDET BUTONU */}
        <div className="flex justify-end sticky bottom-6 z-30 pointer-events-none">
          <button
            onClick={handleSave}
            disabled={saving}
            className="pointer-events-auto bg-rejimde-green text-white px-8 py-3 rounded-xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase disabled:opacity-50 flex items-center gap-2 transform hover:scale-105 transition"
          >
            {saving && <i className="fa-solid fa-circle-notch animate-spin"></i>}
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>

        {/* 5. GÜVENLİK */}
        <div id="security" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
          <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-lock text-slate-400"></i> Şifre Değiştir
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="password"
              placeholder="Mevcut Şifre"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-rejimde-blue"
            />
            <input
              type="password"
              placeholder="Yeni Şifre"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-rejimde-blue"
            />
            <input
              type="password"
              placeholder="Şifre Tekrar"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 font-bold text-white outline-none focus:border-rejimde-blue"
            />
          </div>

          <button onClick={handlePasswordChange} className="bg-slate-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-btn shadow-black btn-game">
            Şifreyi Güncelle
          </button>
        </div>

        {/* Danger Zone */}
        <div className="border-2 border-red-900/30 bg-red-900/10 rounded-3xl p-6 md:p-8 mt-8">
          <h2 className="text-lg font-extrabold text-red-500 mb-2">Tehlikeli Bölge</h2>
          <p className="text-xs font-bold text-red-400 mb-4">Hesabını sildiğinde tüm danışan verilerin, planların ve profilin kalıcı olarak silinir.</p>
          <button className="bg-transparent border-2 border-red-900/50 text-red-500 px-6 py-2 rounded-xl font-extrabold text-sm shadow-none uppercase hover:bg-red-900/20 transition">
            Hesabımı Sil
          </button>
        </div>
      </div>

      {/* Right Sidebar Navigation */}
      <aside className="hidden lg:block w-64 sticky top-24 h-fit">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase mb-3 px-2">Bölümler</h3>
          <nav className="space-y-1">
            {SIDEBAR_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-rejimde-blue text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <i className={`fa-solid ${section.icon} w-4`}></i>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </div>
    </div>
  );
}
