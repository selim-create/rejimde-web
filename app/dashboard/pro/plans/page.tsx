'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getPrivatePlans, 
  deletePrivatePlan, 
  duplicatePrivatePlan,
  getProClients,
  type PrivatePlan,
  type ClientListItem 
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// Plan type configurations
const PLAN_TYPE_CONFIG = {
  diet: { 
    label: 'Diyet Planı', 
    icon: 'fa-utensils', 
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  workout: { 
    label: 'Egzersiz Planı', 
    icon: 'fa-dumbbell', 
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  flow: { 
    label: 'Yoga/Pilates', 
    icon: 'fa-spa', 
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  rehab: { 
    label: 'Rehabilitasyon', 
    icon: 'fa-heart-pulse', 
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200'
  },
  habit: { 
    label: 'Alışkanlık', 
    icon: 'fa-check-circle', 
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200'
  }
};

const STATUS_CONFIG = {
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-600' },
  ready: { label: 'Hazır', color: 'bg-blue-100 text-blue-600' },
  assigned: { label: 'Atandı', color: 'bg-green-100 text-green-600' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-600' },
  completed: { label: 'Tamamlandı', color: 'bg-purple-100 text-purple-600' }
};

export default function PrivatePlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PrivatePlan[]>([]);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const options: any = {};
      if (selectedType !== 'all') options.type = selectedType;
      if (selectedStatus !== 'all') options.status = selectedStatus;
      if (selectedClient !== 'all') options.client_id = parseInt(selectedClient);
      
      const result = await getPrivatePlans(options);
      setPlans(result.plans || []);
      setTotalCount(result.meta?.total || 0);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showToast({ type: 'error', title: 'Hata', message: 'Planlar yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for filter
  const fetchClients = async () => {
    try {
      const result = await getProClients({ status: 'active' });
      setClients(result.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedStatus, selectedClient]);

  // Filter by search term (client-side)
  const filteredPlans = plans.filter(plan => 
    searchTerm === "" || plan.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (planId: number) => {
    try {
      const result = await deletePrivatePlan(planId);
      if (result.success) {
        showToast({ type: 'success', title: 'Başarılı', message: 'Plan silindi.' });
        fetchPlans();
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message || 'Plan silinemedi.' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Plan silinirken hata oluştu.' });
    }
    setDeleteConfirm(null);
  };

  // Handle duplicate
  const handleDuplicate = async (planId: number, title: string) => {
    try {
      const result = await duplicatePrivatePlan(planId, `${title} (Kopya)`);
      if (result.success) {
        showToast({ type: 'success', title: 'Başarılı', message: 'Plan kopyalandı.' });
        fetchPlans();
      } else {
        showToast({ type: 'error', title: 'Hata', message: result.message || 'Plan kopyalanamadı.' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Plan kopyalanırken hata oluştu.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/pro" className="text-gray-500 hover:text-gray-700 transition">
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Özel Planlarım</h1>
                <p className="text-sm text-gray-500 mt-1">Danışanlarınız için oluşturduğunuz planlar</p>
              </div>
            </div>
            <Link
              href="/dashboard/pro/plans/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Yeni Plan
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Ara</label>
              <input
                type="text"
                placeholder="Plan adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Plan Tipi</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="diet">Diyet</option>
                <option value="workout">Egzersiz</option>
                <option value="flow">Yoga/Pilates</option>
                <option value="rehab">Rehabilitasyon</option>
                <option value="habit">Alışkanlık</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Durum</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="draft">Taslak</option>
                <option value="ready">Hazır</option>
                <option value="assigned">Atandı</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Danışan</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                {clients.map(client => (
                  <option key={client.id} value={client.client.id}>
                    {client.client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-gray-400"></i>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-clipboard-list text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz plan yok</h3>
            <p className="text-gray-500 mb-6">Danışanlarınız için özel planlar oluşturmaya başlayın</p>
            <Link
              href="/dashboard/pro/plans/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              <i className="fa-solid fa-plus"></i>
              İlk Planı Oluştur
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map(plan => {
              const typeConfig = PLAN_TYPE_CONFIG[plan.type];
              const statusConfig = STATUS_CONFIG[plan.status];
              
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
                >
                  {/* Type Icon */}
                  <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <i className={`fa-solid ${typeConfig.icon} ${typeConfig.textColor} text-xl`}></i>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{plan.title}</h3>

                  {/* Type & Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 ${typeConfig.bgColor} ${typeConfig.textColor} rounded-lg text-xs font-bold`}>
                      {typeConfig.label}
                    </span>
                    <span className={`px-2 py-1 ${statusConfig.color} rounded-lg text-xs font-bold`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Client */}
                  {plan.client && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <img 
                        src={plan.client.avatar} 
                        alt={plan.client.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{plan.client.name}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-500 mb-4">
                    {new Date(plan.created_at).toLocaleDateString('tr-TR')}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/dashboard/pro/plans/${plan.id}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      <i className="fa-solid fa-edit mr-1"></i>
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDuplicate(plan.id, plan.title)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition"
                      title="Kopyala"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(plan.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold transition"
                      title="Sil"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto bg-red-100 text-red-600">
              <i className="fa-solid fa-trash text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Planı Sil</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              Bu planı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
              >
                İptal
              </button>
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
