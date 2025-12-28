'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, updateService, deleteService, type Service } from '@/lib/api';
import ServiceCard from '../components/ServiceCard';
import NewServiceModal from '../components/NewServiceModal';
import EditServiceModal from '../components/EditServiceModal';
import ConfirmModal from '../components/ConfirmModal';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      // Defensive: ensure array
      setServices(Array.isArray(data) ? data : []);
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
      setConfirmModal({
        isOpen: true,
        title: 'Hata',
        message: 'Hizmet güncellenemedi.',
        onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
        variant: 'warning'
      });
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await updateService(service.id, { is_active: !service.is_active });
      loadServices();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      setConfirmModal({
        isOpen: true,
        title: 'Hata',
        message: 'Hizmet durumu değiştirilemedi.',
        onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
        variant: 'warning'
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleDelete = async (service: Service) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hizmeti Sil',
      message: `${service.name} hizmetini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          const result = await deleteService(service.id);
          setConfirmModal({ ...confirmModal, isOpen: false });
          if (result.success) {
            setConfirmModal({
              isOpen: true,
              title: 'Başarılı',
              message: 'Hizmet başarıyla silindi.',
              onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
              variant: 'primary'
            });
            loadServices();
          } else {
            setConfirmModal({
              isOpen: true,
              title: 'Hata',
              message: result.message || 'Hizmet silinemedi.',
              onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
              variant: 'warning'
            });
          }
        } catch (error) {
          console.error('Failed to delete service:', error);
          setConfirmModal({
            isOpen: true,
            title: 'Hata',
            message: 'Hizmet silinemedi.',
            onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
            variant: 'warning'
          });
        }
      }
    });
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
        {/* Header Warning Banner */}
        <div className="bg-gradient-to-r from-teal-900/50 to-blue-900/50 border border-teal-700/30 rounded-3xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white mb-2">Hizmetlerini Yönet</h2>
            <p className="text-slate-400 text-sm font-medium max-w-xl">
              Burada oluşturduğun hizmetler ve paketler, uzman profilinde danışanlarına gösterilir. 
              Fiyatlarını, sürelerini ve içeriklerini dilediğin zaman güncelleyebilirsin.
            </p>
          </div>
          <div className="hidden sm:block">
            <i className="fa-solid fa-shop text-5xl text-teal-500/20"></i>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredServices.length > 0 || activeFilter === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Service Card - Only show when viewing all */}
            {activeFilter === 'all' && (
              <div 
                onClick={() => setShowNewServiceModal(true)}
                className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800 hover:border-slate-600 transition group min-h-[250px]"
              >
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-lg">
                  <i className="fa-solid fa-plus text-2xl text-slate-400 group-hover:text-white"></i>
                </div>
                <h3 className="font-extrabold text-white text-lg">Yeni Hizmet Ekle</h3>
                <p className="text-xs font-bold text-slate-500 mt-2">
                  Online ders, yüzyüze seans veya paket program oluştur.
                </p>
              </div>
            )}
            
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onToggleFeatured={handleToggleFeatured}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
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

      {editingService && (
        <EditServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSuccess={() => {
            loadServices();
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmVariant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
