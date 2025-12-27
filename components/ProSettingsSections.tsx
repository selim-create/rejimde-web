// components/ProSettingsSections.tsx
"use client";

import {
  EXPERTISE_TAGS,
  GOAL_TAGS,
  LEVEL_OPTIONS,
  AGE_GROUP_OPTIONS,
  EXCLUDED_CASES_OPTIONS
} from "@/lib/constants";
import DatePickerRejimde from "@/components/ui/DatePickerRejimde";
import TimePickerRejimde from "@/components/ui/TimePickerRejimde";

// Type definitions
type EducationItem = { school: string; department: string; year: string };
type CertificateItem = { name: string; institution: string; year: string; file_url: string };

type TagField = "expertise_tags" | "goal_tags" | "level_suitability" | "age_groups" | "service_languages" | "excluded_cases" | "communication_preference";

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

interface SectionProps {
  formData: any;
  setFormData: (data: any) => void;
  toggleTag: (field: TagField, value: string) => void;
  calculateExperience: (date: string) => number | null;
}

interface ProfessionalExperienceSectionProps extends SectionProps {
  addEducation: () => void;
  removeEducation: (index: number) => void;
  updateEducation: (index: number, field: keyof EducationItem, value: string) => void;
  addCertificate: () => void;
  removeCertificate: (index: number) => void;
  updateCertificate: (index: number, field: keyof CertificateItem, value: string) => void;
}

// Professional Experience Section
export function ProfessionalExperienceSection({ 
  formData, 
  setFormData, 
  calculateExperience 
}: ProfessionalExperienceSectionProps) {
  return (
    <div id="experience" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
        <i className="fa-solid fa-graduation-cap text-rejimde-yellow"></i> Deneyim & Eğitim
      </h2>
      
      <div className="space-y-4">
        <div>
          <DatePickerRejimde
            label="Mesleğe Başlama Tarihi"
            value={formData.career_start_date}
            onChange={(date) => setFormData({...formData, career_start_date: date})}
            maxDate={new Date()}
          />
          {formData.career_start_date && (
            <p className="text-xs text-slate-500 mt-1 font-bold">Tecrübe: {calculateExperience(formData.career_start_date)} yıl</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-bold text-slate-400 uppercase">Eğitim Bilgileri</label>
            <button 
              type="button"
              onClick={() => setFormData({...formData, education: [...formData.education, {school: "", department: "", year: ""}]})}
              className="bg-rejimde-yellow text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 transition"
            >
              <i className="fa-solid fa-plus mr-1"></i> Ekle
            </button>
          </div>
          {formData.education.map((edu: EducationItem, index: number) => (
            <div key={index} className="bg-slate-900 rounded-xl p-4 mb-3 relative border border-slate-700">
              <button 
                type="button"
                onClick={() => setFormData({...formData, education: formData.education.filter((_: EducationItem, i: number) => i !== index)})}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-sm"
              >
                <i className="fa-solid fa-times"></i>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Okul/Üniversite"
                  value={edu.school}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].school = e.target.value;
                    setFormData({...formData, education: newEducation});
                  }}
                  className="bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm font-bold text-white outline-none focus:border-rejimde-yellow"
                />
                <input 
                  type="text" 
                  placeholder="Bölüm"
                  value={edu.department}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].department = e.target.value;
                    setFormData({...formData, education: newEducation});
                  }}
                  className="bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm font-bold text-white outline-none focus:border-rejimde-yellow"
                />
                <input 
                  type="text" 
                  placeholder="Mezuniyet Yılı"
                  value={edu.year}
                  onChange={(e) => {
                    const newEducation = [...formData.education];
                    newEducation[index].year = e.target.value;
                    setFormData({...formData, education: newEducation});
                  }}
                  className="bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm font-bold text-white outline-none focus:border-rejimde-yellow"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Expertise Tags Section
export function ExpertiseTagsSection({ formData, setFormData, toggleTag }: SectionProps) {
  return (
    <div id="expertise" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
        <i className="fa-solid fa-tags text-rejimde-purple"></i> Uzmanlık & Etiketler
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Uzmanlık Alanları</label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_TAGS.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag('expertise_tags', tag.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition ${
                  formData.expertise_tags.includes(tag.id)
                    ? 'bg-rejimde-purple text-white border-rejimde-purple'
                    : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Çalıştığı Hedefler</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_TAGS.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag('goal_tags', tag.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition flex items-center gap-2 ${
                  formData.goal_tags.includes(tag.id)
                    ? 'bg-rejimde-blue text-white border-rejimde-blue'
                    : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
                }`}
              >
                <i className={`fa-solid ${tag.icon}`}></i>
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Danışan Türü</label>
          <select
            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-purple cursor-pointer"
            value={formData.client_type}
            onChange={(e) => setFormData({...formData, client_type: e.target.value})}
          >
            {CLIENT_TYPE_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Seviye Uygunluğu</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LEVEL_OPTIONS.map(level => (
              <label
                key={level.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  formData.level_suitability.includes(level.id)
                    ? 'bg-rejimde-green/20 border-rejimde-green'
                    : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={formData.level_suitability.includes(level.id)}
                  onChange={() => toggleTag('level_suitability', level.id)}
                  className="hidden"
                />
                <div className="text-sm font-extrabold text-white mb-1">{level.label}</div>
                <div className="text-xs text-slate-400">{level.description}</div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Yaş Grupları</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {AGE_GROUP_OPTIONS.map(age => (
              <label
                key={age.id}
                className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                  formData.age_groups.includes(age.id)
                    ? 'bg-rejimde-blue/20 border-rejimde-blue'
                    : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={formData.age_groups.includes(age.id)}
                  onChange={() => toggleTag('age_groups', age.id)}
                  className="hidden"
                />
                <div className="text-sm font-extrabold text-white mb-1">{age.label}</div>
                <div className="text-xs text-slate-400">{age.range}</div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Work & Communication Section
export function WorkCommunicationSection({ formData, setFormData, toggleTag }: SectionProps) {
  return (
    <div id="work" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
        <i className="fa-solid fa-clock text-rejimde-teal"></i> Çalışma & İletişim
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TimePickerRejimde
            label="Hafta İçi Çalışma Saatleri"
            startTime={formData.working_hours.weekday.split(' - ')[0] || ''}
            endTime={formData.working_hours.weekday.split(' - ')[1] || ''}
            onChange={(start, end) => setFormData({
              ...formData, 
              working_hours: {...formData.working_hours, weekday: `${start} - ${end}`}
            })}
          />
          <TimePickerRejimde
            label="Hafta Sonu Çalışma Saatleri"
            startTime={formData.working_hours.weekend.split(' - ')[0] || ''}
            endTime={formData.working_hours.weekend.split(' - ')[1] || ''}
            onChange={(start, end) => setFormData({
              ...formData, 
              working_hours: {...formData.working_hours, weekend: `${start} - ${end}`}
            })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ortalama Yanıt Süresi</label>
          <select 
            className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-teal cursor-pointer"
            value={formData.response_time}
            onChange={(e) => setFormData({...formData, response_time: e.target.value})}
          >
            <option value="1h">1 Saat İçinde</option>
            <option value="24h">24 Saat İçinde</option>
            <option value="48h">48 Saat İçinde</option>
            <option value="3d">3 Gün İçinde</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Danışan Metodu (Çoklu Seçim)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CONSULTATION_METHOD_OPTIONS.map(method => (
              <label
                key={method.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  formData.communication_preference.includes(method.id)
                    ? 'bg-rejimde-teal/20 border-rejimde-teal'
                    : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={formData.communication_preference.includes(method.id)}
                  onChange={() => toggleTag('communication_preference', method.id)}
                  className="hidden"
                />
                <div className="text-center">
                  <i className={`fa-solid ${method.icon} text-2xl text-white mb-2`}></i>
                  <div className="text-sm font-extrabold text-white">{method.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Excluded Cases Section
export function ExcludedCasesSection({ formData, toggleTag, setFormData }: SectionProps) {
  return (
    <div id="excluded" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
        <i className="fa-solid fa-triangle-exclamation text-orange-500"></i> Çalışmadığı Durumlar
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Çalışmadığım Durumlar</label>
          <div className="space-y-2">
            {EXCLUDED_CASES_OPTIONS.map(option => (
              <label
                key={option.id}
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition ${
                  formData.excluded_cases.includes(option.id)
                    ? 'bg-orange-500/20 border-orange-500'
                    : 'bg-slate-900 border-slate-600 hover:border-slate-500'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={formData.excluded_cases.includes(option.id)}
                  onChange={() => toggleTag('excluded_cases', option.id)}
                  className="w-4 h-4 mr-3 rounded accent-orange-500"
                />
                <span className="text-sm font-bold text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Yönlendirme Notu (Opsiyonel)</label>
          <textarea 
            value={formData.referral_note} 
            onChange={(e) => setFormData({...formData, referral_note: e.target.value})} 
            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 font-medium text-white outline-none focus:border-orange-500 h-24 resize-none"
            placeholder="Bu durumlar için öneriniz varsa (örn: hangi uzmanlara yönlendiriyorsunuz)"
          ></textarea>
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Section
export function PrivacySettingsSection({ formData, setFormData }: SectionProps) {
  return (
    <div id="privacy" className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 scroll-mt-24">
      <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
        <i className="fa-solid fa-shield text-rejimde-blue"></i> Görünürlük & Mahremiyet
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Profilde Göster</label>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-600">
              <span className="text-sm font-bold text-white">Telefon Numarası</span>
              <input 
                type="checkbox"
                checked={formData.privacy_settings.show_phone}
                onChange={(e) => setFormData({
                  ...formData, 
                  privacy_settings: {...formData.privacy_settings, show_phone: e.target.checked}
                })}
                className="w-5 h-5 rounded accent-rejimde-blue"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-600">
              <span className="text-sm font-bold text-white">Açık Adres</span>
              <input 
                type="checkbox"
                checked={formData.privacy_settings.show_address}
                onChange={(e) => setFormData({
                  ...formData, 
                  privacy_settings: {...formData.privacy_settings, show_address: e.target.checked}
                })}
                className="w-5 h-5 rounded accent-rejimde-blue"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-600">
              <span className="text-sm font-bold text-white">Şehir/İlçe Bilgisi</span>
              <input 
                type="checkbox"
                checked={formData.privacy_settings.show_location}
                onChange={(e) => setFormData({
                  ...formData, 
                  privacy_settings: {...formData.privacy_settings, show_location: e.target.checked}
                })}
                className="w-5 h-5 rounded accent-rejimde-blue"
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start p-4 rounded-xl bg-slate-900 border border-slate-600">
            <input 
              type="checkbox"
              checked={formData.kvkk_consent}
              onChange={(e) => setFormData({...formData, kvkk_consent: e.target.checked})}
              className="w-5 h-5 mt-0.5 mr-3 rounded accent-rejimde-blue"
            />
            <span className="text-xs font-bold text-slate-300">KVKK kapsamında kişisel verilerimin işlenmesini onaylıyorum.</span>
          </label>
          <label className="flex items-start p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <input 
              type="checkbox"
              checked={formData.emergency_disclaimer}
              onChange={(e) => setFormData({...formData, emergency_disclaimer: e.target.checked})}
              className="w-5 h-5 mt-0.5 mr-3 rounded accent-orange-500"
            />
            <span className="text-xs font-bold text-orange-200">Acil sağlık durumlarında 112&apos;yi aramalarını hatırlatıyorum.</span>
          </label>
        </div>
      </div>
    </div>
  );
}
