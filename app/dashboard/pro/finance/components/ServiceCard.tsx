import type { Service } from '@/lib/api';
import { formatCurrency } from '@/lib/format-utils';

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onToggleFeatured?: (service: Service) => void;
}

const typeLabels: Record<Service['type'], string> = {
  session: 'seans',
  package: 'paket',
  subscription: 'abonelik',
  one_time: 'tek seferlik'
};

export default function ServiceCard({ service, onEdit, onDelete, onToggleFeatured }: ServiceCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden hover:border-slate-600 transition">
      {/* Renk şeridi */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5" 
        style={{ backgroundColor: service.color }}
      ></div>
      
      {service.is_featured && (
        <span className="absolute top-4 right-4 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
          <i className="fa-solid fa-star mr-1"></i>Öne Çıkan
        </span>
      )}
      
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
