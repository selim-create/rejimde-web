import type { AppointmentRequest } from '@/lib/api';
import { formatDate, formatTime, getRelativeTime } from '@/lib/calendar-utils';

interface RequestCardProps {
  request: AppointmentRequest;
  onApprove: () => void;
  onReject: () => void;
}

export default function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img
            src={request.requester.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${request.requester.name}`}
            alt={request.requester.name}
            className="w-14 h-14 rounded-xl"
          />
          <div>
            <h3 className="font-bold text-white text-lg">{request.requester.name}</h3>
            <p className="text-sm text-slate-400">{request.requester.email}</p>
            {request.requester.phone && (
              <p className="text-sm text-slate-400">{request.requester.phone}</p>
            )}
            {request.requester.is_member && (
              <span className="inline-block text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded mt-1">
                Üye
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-slate-500">{getRelativeTime(request.created_at)}</span>
      </div>

      {/* Service */}
      {request.service && (
        <div className="mb-4">
          <span className="text-xs text-slate-500 uppercase font-bold">Hizmet</span>
          <p className="text-white font-bold">{request.service.name}</p>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/50 rounded-xl p-3">
          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tercih Edilen</div>
          <div className="text-white font-bold">{formatDate(request.preferred_date)}</div>
          <div className="text-blue-400 text-sm">{formatTime(request.preferred_time)}</div>
        </div>
        
        {request.alternative_date && (
          <div className="bg-slate-900/50 rounded-xl p-3">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Alternatif</div>
            <div className="text-white font-bold">{formatDate(request.alternative_date)}</div>
            <div className="text-blue-400 text-sm">{formatTime(request.alternative_time || '')}</div>
          </div>
        )}
      </div>

      {/* Message */}
      {request.message && (
        <div className="mb-4 bg-slate-900/30 rounded-xl p-3">
          <div className="text-xs text-slate-500 uppercase font-bold mb-1">Mesaj</div>
          <p className="text-sm text-slate-300 italic">"{request.message}"</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition"
        >
          <i className="fa-solid fa-check mr-2"></i>
          Onayla
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-600 transition"
        >
          <i className="fa-solid fa-times mr-2"></i>
          Reddet
        </button>
      </div>
    </div>
  );
}
