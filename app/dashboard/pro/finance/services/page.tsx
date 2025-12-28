'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, updateService, deleteService, forceDeleteService, toggleServiceActive, type Service } from '@/lib/api';
import ServiceCard from '../components/ServiceCard';
import NewServiceModal from '../components/NewServiceModal';
import EditServiceModal from '../components/EditServiceModal';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '@/components/ui/AlertModal';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    service: Service | null;
    mode: 'choose' | 'soft' | 'force';
  }>({
    isOpen: false,
    service: null,
    mode: 'choose'
  });
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
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
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Hizmet güncellenemedi.',
        variant: 'error'
      });
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const result = await toggleServiceActive(service.id);
      if (result.success) {
        loadServices();
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Hata',
          message: result.message || 'Hizmet durumu değiştirilemedi.',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Hizmet durumu değiştirilemedi.',
        variant: 'error'
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleDelete = (service: Service) => {
    setDeleteModalState({
      isOpen: true,
      service: service,
      mode: 'choose'
    });
  };

  const handleDeleteConfirm = async (mode: 'soft' | 'force') => {
    const service = deleteModalState.service;
    if (!service) return;

    try {
      const result = mode === 'force' 
        ? await forceDeleteService(service.id)
        : await deleteService(service.id);
      
      setDeleteModalState({ isOpen: false, service: null, mode: 'choose' });
      
      if (result.success) {
        setAlertModal({
          isOpen: true,
          title: 'Başarılı',
          message: mode === 'force' 
            ? 'Hizmet kalıcı olarak silindi.' 
            : 'Hizmet pasife alındı.',
          variant: 'success'
        });
        loadServices();
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Hata',
          message: result.message || 'İşlem başarısız oldu.',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      setDeleteModalState({ isOpen: false, service: null, mode: 'choose' });
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Hizmet silinemedi.',
        variant: 'error'
      });
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
            setAlertModal({
              isOpen: true,
              title: 'Başarılı',
              message: 'Hizmet başarıyla oluşturuldu!',
              variant: 'success'
            });
          }}
        />
      )}

      {editingService && (
        <EditServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSuccess={() => {
            loadServices();
            setAlertModal({
              isOpen: true,
              title: 'Başarılı',
              message: 'Hizmet başarıyla güncellendi!',
              variant: 'success'
            });
          }}
        />
      )}

      {/* Delete Choice Modal */}
      {deleteModalState.isOpen && deleteModalState.mode === 'choose' && deleteModalState.service && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setDeleteModalState({ isOpen: false, service: null, mode: 'choose' })}
        >
          <div 
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-xl font-black text-white mb-2">Hizmeti Nasıl Silmek İstersiniz?</h3>
              <p className="text-slate-300 mb-4">"{deleteModalState.service.name}" hizmeti için bir seçenek belirleyin:</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalState({ ...deleteModalState, mode: 'soft' });
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-xl transition text-left"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-eye-slash text-xl"></i>
                  <div>
                    <div className="font-black">Pasife Al</div>
                    <div className="text-xs opacity-90">Hizmet gizlenir, veriler korunur</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setDeleteModalState({ ...deleteModalState, mode: 'force' });
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition text-left"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-trash text-xl"></i>
                  <div>
                    <div className="font-black">Kalıcı Olarak Sil</div>
                    <div className="text-xs opacity-90">Tüm veriler silinir, geri alınamaz</div>
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, service: null, mode: 'choose' })}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation */}
      {deleteModalState.isOpen && deleteModalState.mode === 'soft' && deleteModalState.service && (
        <ConfirmModal
          isOpen={true}
          title="Pasife Al"
          message={`"${deleteModalState.service.name}" hizmeti pasife alınacak. Veriler korunacak ve istediğiniz zaman tekrar aktif edebilirsiniz.`}
          confirmText="Pasife Al"
          cancelText="İptal"
          confirmVariant="warning"
          onConfirm={() => handleDeleteConfirm('soft')}
          onCancel={() => setDeleteModalState({ isOpen: false, service: null, mode: 'choose' })}
        />
      )}

      {/* Force Delete Confirmation */}
      {deleteModalState.isOpen && deleteModalState.mode === 'force' && deleteModalState.service && (
        <ConfirmModal
          isOpen={true}
          title="Kalıcı Olarak Sil"
          message={`"${deleteModalState.service.name}" hizmeti ve tüm ilgili veriler kalıcı olarak silinecek. Bu işlem geri alınamaz!`}
          confirmText="Kalıcı Olarak Sil"
          cancelText="İptal"
          confirmVariant="danger"
          onConfirm={() => handleDeleteConfirm('force')}
          onCancel={() => setDeleteModalState({ isOpen: false, service: null, mode: 'choose' })}
        />
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
}
