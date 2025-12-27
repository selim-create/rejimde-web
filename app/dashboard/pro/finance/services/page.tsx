'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, updateService, deleteService, type Service } from '@/lib/api';
import ServiceCard from '../components/ServiceCard';
import NewServiceModal from '../components/NewServiceModal';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = services.filter(service => {
    if (activeFilter === 'active') return service.is_active;
    if (activeFilter === 'inactive') return !service.is_active;
    return true;
  });

  const handleToggleFeatured = async (service: Service) => {
    try {
      await updateService(service.id, { is_featured: !service.is_featured });
      loadServices();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      alert('Hizmet güncellenemedi.');
    }
  };

  const handleDelete = async (service: Service) => {
    if (confirm(`${service.name} hizmetini silmek istediğinize emin misiniz?`)) {
      try {
        const result = await deleteService(service.id);
        if (result.success) {
          alert('Hizmet silindi!');
          loadServices();
        } else {
          alert(result.message || 'Hizmet silinemedi.');
        }
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Hizmet silinemedi.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/pro/finance" 
              className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Hizmet & Paket Yönetimi</h1>
              <p className="text-sm text-slate-400">Sunduğunuz hizmetleri yönetin</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewServiceModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition"
          >
            <i className="fa-solid fa-plus mr-2"></i>Yeni Hizmet
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tümü ({services.length})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeFilter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Aktif ({services.filter(s => s.is_active).length})
          </button>
          <button
            onClick={() => setActiveFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              activeFilter === 'inactive' 
                ? 'bg-slate-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Pasif ({services.filter(s => !s.is_active).length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onToggleFeatured={handleToggleFeatured}
                onEdit={(service) => {
                  // TODO: Implement edit modal
                  console.log('Edit service:', service.id);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-layer-group text-4xl mb-4"></i>
            <p className="mb-2">
              {activeFilter === 'all' ? 'Henüz hizmet eklenmedi' : 'Bu filtre için hizmet bulunamadı'}
            </p>
            {activeFilter === 'all' && (
              <button
                onClick={() => setShowNewServiceModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition"
              >
                İlk Hizmeti Ekle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewServiceModal && (
        <NewServiceModal
          onClose={() => setShowNewServiceModal(false)}
          onSuccess={() => {
            loadServices();
          }}
        />
      )}
    </div>
  );
}
