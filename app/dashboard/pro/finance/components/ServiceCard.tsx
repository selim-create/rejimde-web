import type { Service } from '@/lib/api';
import { formatCurrency } from '@/lib/format-utils';

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onToggleFeatured?: (service: Service) => void;
  onToggleActive?: (service: Service) => void;
}

const typeLabels: Record<Service['type'], string> = {
  online: 'online',
  face_to_face: 'yüzyüze',
  group: 'grup dersi',
  package: 'paket',
  consultation: 'danışmanlık',
  session: 'seans',
  one_time: 'tek seferlik'
};

const typeBadges: Record<Service['type'], { icon: string; label: string; color: string }> = {
  online: { icon: 'fa-video', label: 'Online', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  face_to_face: { icon: 'fa-location-dot', label: 'Yüzyüze', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  group: { icon: 'fa-users', label: 'Grup', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  package: { icon: 'fa-box-open', label: 'Paket', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  consultation: { icon: 'fa-comments', label: 'Danışmanlık', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  session: { icon: 'fa-calendar-day', label: 'Seans', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  one_time: { icon: 'fa-star', label: 'Tek Seferlik', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' }
};

export default function ServiceCard({ service, onEdit, onDelete, onToggleFeatured, onToggleActive }: ServiceCardProps) {
  const badge = typeBadges[service.type];
  
  return (
    <div className={`bg-slate-800 border rounded-2xl p-6 relative overflow-hidden transition hover:shadow-lg ${
      service.is_active ? 'border-slate-700 hover:border-slate-600' : 'border-slate-700/50 opacity-75'
    }`}>
      {/* Renk şeridi */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5" 
        style={{ backgroundColor: service.color }}
      ></div>
      
      {/* Active/Inactive Toggle Switch - Top Position */}
      {onToggleActive && (
        <button 
          onClick={() => onToggleActive(service)}
          className={`absolute top-4 right-4 w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
            service.is_active ? 'bg-green-500' : 'bg-slate-600'
          }`}
          title={service.is_active ? 'Pasife Al' : 'Aktif Et'}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            service.is_active ? 'translate-x-6' : 'translate-x-0'
          }`}></div>
        </button>
      )}
      
      {service.is_featured && (
        <span className="absolute top-14 right-4 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
          <i className="fa-solid fa-star mr-1"></i>Öne Çıkan
        </span>
      )}
      
      {/* Type Badge */}
      <div className="mb-3 mt-2">
        <span className={`${badge.color} border px-2 py-1 rounded text-[10px] font-black uppercase`}>
          <i className={`fa-solid ${badge.icon} mr-1`}></i> {badge.label}
        </span>
      </div>
      
      <h3 className="font-bold text-white text-lg mt-2">{service.name}</h3>
      {service.description && (
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{service.description}</p>
      )}
      
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-black text-white">{formatCurrency(service.price)}</span>
        <span className="text-slate-500">/ {typeLabels[service.type]}</span>
      </div>
      
      <div className="mt-4 space-y-2 text-sm text-slate-400">
        {service.duration_minutes > 0 && (
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-clock w-5"></i>
            <span>{service.duration_minutes} dakika</span>
          </div>
        )}
        {service.capacity && (service.type === 'group' || service.type === 'package') && (
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user-group w-5"></i>
            <span>Kontenjan: {service.capacity}</span>
          </div>
        )}
        {service.session_count && (
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-layer-group w-5"></i>
            <span>{service.session_count} seans</span>
          </div>
        )}
        {service.validity_days && (
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-calendar-check w-5"></i>
            <span>{service.validity_days} gün geçerli</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-500">{service.usage_count} kez satıldı</span>
        <div className="flex gap-2">
          {onToggleFeatured && (
            <button 
              onClick={() => onToggleFeatured(service)}
              className={`${service.is_featured ? 'text-yellow-400' : 'text-slate-400'} hover:text-yellow-400 transition`}
              title={service.is_featured ? 'Öne çıkandan kaldır' : 'Öne çıkar'}
            >
              <i className="fa-solid fa-star"></i>
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(service)}
              className="text-slate-400 hover:text-white transition"
            >
              <i className="fa-solid fa-pen"></i>
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(service)}
              className="text-slate-400 hover:text-red-400 transition"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
