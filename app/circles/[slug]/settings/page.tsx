'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { CircleTask, CircleMember, CreateTaskData } from '@/types';

// Hazır Circle Avatarları
const CIRCLE_AVATARS = [
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle2&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle4&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle5&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/personas/svg?seed=Circle6&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle7&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle8&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle9&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/bottts/svg?seed=Circle10&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Circle11&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Circle12&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Circle13&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Circle14&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/icons/svg?seed=Circle15&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/icons/svg?seed=Circle16&backgroundColor=ffd5dc',
];

type TabType = 'general' | 'tasks' | 'members' | 'notifications' | 'visibility';

export default function CircleSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  // Circle & User State
  const [circle, setCircle] = useState<any>(null);
  const [isMentor, setIsMentor] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    name: '',
    logo: '',
    motto: '',
    description: '',
    privacy: 'public' as 'public' | 'invite_only',
    chat_status: 'open' as 'open' | 'closed',
  });

  // Tasks State
  const [tasks, setTasks] = useState<CircleTask[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<CircleTask | null>(null);
  const [taskForm, setTaskForm] = useState<CreateTaskData>({
    title: '',
    description: '',
    points: 10,
    deadline: '',
    assigned_to: [],
  });

  // Members State
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    new_member: true,
    new_comment: true,
  });

  // Visibility Settings State
  const [visibilitySettings, setVisibilitySettings] = useState({
    show_members: true,
    show_score: true,
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Fetch Circle Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await auth.me();

        const circleData = await auth.getCircle(slug);
        if (circleData) {
          setCircle(circleData);
          
          // Check if user is mentor
          if (user && circleData.leader_id && user.id === circleData.leader_id) {
            setIsMentor(true);
          } else {
            // Not a mentor, redirect
            showToast({
              type: 'error',
              title: 'Erişim Engellendi',
              message: 'Bu sayfaya sadece Circle Mentor erişebilir.',
            });
            router.push(`/circles/${slug}`);
            return;
          }

          // Set general settings
          setGeneralSettings({
            name: circleData.name || '',
            logo: circleData.logo || CIRCLE_AVATARS[0],
            motto: circleData.motto || '',
            description: circleData.description || '',
            privacy: circleData.privacy || 'public',
            chat_status: circleData.chat_status || 'open',
          });

          // Fetch additional data
          if (circleData.id) {
            try {
              const [tasksData, membersData, settingsData] = await Promise.all([
                auth.getCircleTasksForManagement(circleData.id),
                auth.getCircleMembers(circleData.id),
                auth.getCircleSettings(circleData.id),
              ]);
              
              setTasks(tasksData || []);
              setMembers(membersData || []);
              
              if (settingsData) {
                setNotificationSettings(settingsData.notifications || {
                  new_member: true,
                  new_comment: true,
                });
                setVisibilitySettings(settingsData.visibility || {
                  show_members: true,
                  show_score: true,
                });
              }
            } catch (err) {
              console.error('Error fetching additional data:', err);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching circle:', error);
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Circle bilgileri yüklenemedi.',
        });
        router.push('/circles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, router]);

  // Save General Settings
  const handleSaveGeneral = async () => {
    if (!circle) return;
    
    setSaving(true);
    try {
      await auth.updateCircle(circle.id, generalSettings);
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Genel ayarlar kaydedildi.',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Ayarlar kaydedilemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Task Management Functions
  const handleCreateTask = async () => {
    if (!circle) return;
    
    if (!taskForm.title || !taskForm.deadline) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Görev başlığı ve son tarih zorunludur.',
      });
      return;
    }

    setSaving(true);
    try {
      const newTask = await auth.createCircleTask(circle.id, taskForm);
      setTasks([...tasks, newTask]);
      setTaskForm({
        title: '',
        description: '',
        points: 10,
        deadline: '',
        assigned_to: [],
      });
      setShowTaskForm(false);
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Görev oluşturuldu.',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Görev oluşturulamadı.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!circle || !editingTask) return;

    setSaving(true);
    try {
      const updatedTask = await auth.updateCircleTask(circle.id, editingTask.id, taskForm);
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        points: 10,
        deadline: '',
        assigned_to: [],
      });
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Görev güncellendi.',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Görev güncellenemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Görevi Sil',
      message: 'Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      type: 'warning',
      onConfirm: async () => {
        if (!circle) return;
        
        try {
          await auth.deleteCircleTask(circle.id, taskId);
          setTasks(tasks.filter(t => t.id !== taskId));
          showToast({
            type: 'success',
            title: 'Başarılı',
            message: 'Görev silindi.',
          });
        } catch (error: any) {
          showToast({
            type: 'error',
            title: 'Hata',
            message: error.message || 'Görev silinemedi.',
          });
        }
      },
    });
  };

  const handleEditTask = (task: CircleTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      points: task.points,
      deadline: task.deadline,
      assigned_to: task.assigned_to,
    });
    setShowTaskForm(true);
  };

  // Member Management Functions
  const handleRemoveMember = (memberId: number, memberName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Üyeyi Çıkar',
      message: `${memberName} adlı üyeyi Circle'dan çıkarmak istediğinizden emin misiniz?`,
      type: 'warning',
      onConfirm: async () => {
        if (!circle) return;
        
        try {
          await auth.removeCircleMember(circle.id, memberId);
          setMembers(members.filter(m => m.id !== memberId));
          showToast({
            type: 'success',
            title: 'Başarılı',
            message: 'Üye çıkarıldı.',
          });
        } catch (error: any) {
          showToast({
            type: 'error',
            title: 'Hata',
            message: error.message || 'Üye çıkarılamadı.',
          });
        }
      },
    });
  };

  // Save Notification Settings
  const handleSaveNotifications = async () => {
    if (!circle) return;
    
    setSaving(true);
    try {
      await auth.updateCircleSettings(circle.id, {
        notifications: notificationSettings,
      });
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Bildirim ayarları kaydedildi.',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Ayarlar kaydedilemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Visibility Settings
  const handleSaveVisibility = async () => {
    if (!circle) return;
    
    setSaving(true);
    try {
      await auth.updateCircleSettings(circle.id, {
        visibility: visibilitySettings,
      });
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Görünürlük ayarları kaydedildi.',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Ayarlar kaydedilemedi.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter members
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!isMentor) {
    return null;
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50">
        {/* Header */}
        <div className="bg-purple-600 text-white pt-12 pb-16 relative overflow-hidden rounded-b-[3rem] shadow-lg mb-10">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            <button
              onClick={() => router.push(`/circles/${slug}`)}
              className="absolute left-4 top-0 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-bold transition"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i> Geri
            </button>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-4">
              <i className="fa-solid fa-gear text-4xl"></i>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight drop-shadow-sm">
              Circle Ayarları
            </h1>
            <p className="text-purple-100 font-bold text-lg opacity-90">
              {circle?.name}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-2 mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'general' as TabType, icon: 'fa-sliders', label: 'Genel' },
                { id: 'tasks' as TabType, icon: 'fa-list-check', label: 'Görevler' },
                { id: 'members' as TabType, icon: 'fa-users', label: 'Üyeler' },
                { id: 'notifications' as TabType, icon: 'fa-bell', label: 'Bildirimler' },
                { id: 'visibility' as TabType, icon: 'fa-eye', label: 'Görünürlük' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-[0_4px_0_rgb(126,34,206)]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 p-8">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 mb-6">
                  <i className="fa-solid fa-sliders text-purple-600 mr-3"></i>
                  Genel Ayarlar
                </h2>

                {/* Circle Name */}
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-purple-600"></i> Circle Adı
                  </label>
                  <input
                    type="text"
                    value={generalSettings.name}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, name: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl py-4 px-5 font-bold text-gray-800 text-lg outline-none transition"
                  />
                </div>

                {/* Circle Logo */}
                <div className="space-y-4">
                  <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-image text-purple-600"></i> Circle Logosu
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {CIRCLE_AVATARS.map((url, index) => (
                      <div
                        key={index}
                        onClick={() => setGeneralSettings({ ...generalSettings, logo: url })}
                        className={`aspect-square rounded-2xl cursor-pointer border-4 transition-all duration-200 overflow-hidden relative ${
                          generalSettings.logo === url
                            ? 'border-purple-500 shadow-[0_4px_0_rgb(168,85,247)] translate-y-[-4px]'
                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                        {generalSettings.logo === url && (
                          <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                            <i className="fa-solid fa-check text-white text-xl drop-shadow-md"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circle Motto */}
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-quote-left text-purple-600"></i> Circle Mottosu
                  </label>
                  <input
                    type="text"
                    value={generalSettings.motto}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, motto: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl py-4 px-5 font-bold text-gray-800 text-lg outline-none transition"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-pen-nib text-purple-600"></i> Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={generalSettings.description}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, description: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 focus:border-purple-500 focus:bg-white rounded-2xl py-4 px-5 font-bold text-gray-800 outline-none transition resize-none"
                  />
                </div>

                {/* Privacy */}
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide block">Gizlilik Ayarı</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setGeneralSettings({ ...generalSettings, privacy: 'public' })}
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                        generalSettings.privacy === 'public'
                          ? 'border-green-500 bg-green-50 shadow-[0_4px_0_rgb(34,197,94)] translate-y-[-2px]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                        generalSettings.privacy === 'public' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <i className="fa-solid fa-earth-americas"></i>
                      </div>
                      <div>
                        <h4 className={`font-extrabold ${generalSettings.privacy === 'public' ? 'text-green-700' : 'text-gray-700'}`}>Herkese Açık</h4>
                        <p className="text-xs font-bold text-gray-400">Herkes bulup katılabilir.</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setGeneralSettings({ ...generalSettings, privacy: 'invite_only' })}
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                        generalSettings.privacy === 'invite_only'
                          ? 'border-amber-500 bg-amber-50 shadow-[0_4px_0_rgb(245,158,11)] translate-y-[-2px]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                        generalSettings.privacy === 'invite_only' ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        <i className="fa-solid fa-lock"></i>
                      </div>
                      <div>
                        <h4 className={`font-extrabold ${generalSettings.privacy === 'invite_only' ? 'text-amber-700' : 'text-gray-700'}`}>Sadece Davetle</h4>
                        <p className="text-xs font-bold text-gray-400">Yalnızca Mentor onayıyla.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Status */}
                <div className="space-y-3">
                  <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wide block">Sohbet Durumu</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setGeneralSettings({ ...generalSettings, chat_status: 'open' })}
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                        generalSettings.chat_status === 'open'
                          ? 'border-blue-500 bg-blue-50 shadow-[0_4px_0_rgb(59,130,246)] translate-y-[-2px]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                        generalSettings.chat_status === 'open' ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        <i className="fa-solid fa-comments"></i>
                      </div>
                      <div>
                        <h4 className={`font-extrabold ${generalSettings.chat_status === 'open' ? 'text-blue-700' : 'text-gray-700'}`}>Chat Açık</h4>
                        <p className="text-xs font-bold text-gray-400">Üyeler mesajlaşabilir.</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setGeneralSettings({ ...generalSettings, chat_status: 'closed' })}
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${
                        generalSettings.chat_status === 'closed'
                          ? 'border-gray-500 bg-gray-50 shadow-[0_4px_0_rgb(107,114,128)] translate-y-[-2px]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition ${
                        generalSettings.chat_status === 'closed' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        <i className="fa-solid fa-comment-slash"></i>
                      </div>
                      <div>
                        <h4 className={`font-extrabold ${generalSettings.chat_status === 'closed' ? 'text-gray-700' : 'text-gray-700'}`}>Chat Kapalı</h4>
                        <p className="text-xs font-bold text-gray-400">Sohbet devre dışı.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSaveGeneral}
                    disabled={saving}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-extrabold uppercase text-lg shadow-[0_6px_0_rgb(126,34,206)] hover:bg-purple-700 hover:shadow-[0_4px_0_rgb(126,34,206)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Kaydediliyor...</>
                    ) : (
                      <><i className="fa-solid fa-check mr-2"></i> Kaydet</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-800">
                    <i className="fa-solid fa-list-check text-purple-600 mr-3"></i>
                    Görev Yönetimi
                  </h2>
                  <button
                    onClick={() => {
                      setShowTaskForm(!showTaskForm);
                      setEditingTask(null);
                      setTaskForm({
                        title: '',
                        description: '',
                        points: 10,
                        deadline: '',
                        assigned_to: [],
                      });
                    }}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_0_rgb(22,163,74)] hover:bg-green-700 transition"
                  >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Yeni Görev
                  </button>
                </div>

                {/* Task Form */}
                {showTaskForm && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 space-y-4">
                    <h3 className="font-black text-lg text-purple-800">
                      {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
                    </h3>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Görev Başlığı</label>
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className="w-full bg-white border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 font-bold text-gray-800 outline-none transition"
                        placeholder="Örn: 10.000 adım at"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Açıklama</label>
                      <textarea
                        rows={3}
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full bg-white border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 font-bold text-gray-800 outline-none transition resize-none"
                        placeholder="Görev detayları..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Puan</label>
                        <input
                          type="number"
                          value={taskForm.points}
                          onChange={(e) => setTaskForm({ ...taskForm, points: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 font-bold text-gray-800 outline-none transition"
                          min="0"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700">Son Tarih</label>
                        <input
                          type="date"
                          value={taskForm.deadline}
                          onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                          className="w-full bg-white border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 font-bold text-gray-800 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Üyelere Ata (Çoklu Seçim)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border-2 border-purple-200 rounded-xl p-3 bg-white">
                        {members.map(member => (
                          <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 p-2 rounded-lg">
                            <input
                              type="checkbox"
                              checked={taskForm.assigned_to.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTaskForm({ ...taskForm, assigned_to: [...taskForm.assigned_to, member.id] });
                                } else {
                                  setTaskForm({ ...taskForm, assigned_to: taskForm.assigned_to.filter(id => id !== member.id) });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                            <span className="text-sm font-bold text-gray-700">{member.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={editingTask ? handleUpdateTask : handleCreateTask}
                        disabled={saving}
                        className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {saving ? (
                          <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Kaydediliyor...</>
                        ) : (
                          <><i className="fa-solid fa-check mr-2"></i> {editingTask ? 'Güncelle' : 'Oluştur'}</>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowTaskForm(false);
                          setEditingTask(null);
                          setTaskForm({
                            title: '',
                            description: '',
                            points: 10,
                            deadline: '',
                            assigned_to: [],
                          });
                        }}
                        className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Task List */}
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="fa-solid fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-400 font-bold">Henüz görev oluşturulmamış.</p>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="border-2 border-gray-200 rounded-2xl p-5 hover:border-purple-300 transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-black text-lg text-gray-800 mb-1">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                                <i className="fa-solid fa-star mr-1"></i> {task.points} Puan
                              </span>
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                                <i className="fa-solid fa-calendar mr-1"></i> {new Date(task.deadline).toLocaleDateString('tr-TR')}
                              </span>
                              <span className={`px-3 py-1 rounded-full font-bold ${
                                task.status === 'active' ? 'bg-green-100 text-green-700' :
                                task.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {task.status === 'active' ? 'Aktif' : task.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="w-10 h-10 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        {task.assigned_to.length > 0 && (
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-500">Atanan:</span>
                            <div className="flex -space-x-2">
                              {task.assigned_to.slice(0, 5).map(memberId => {
                                const member = members.find(m => m.id === memberId);
                                return member ? (
                                  <img
                                    key={member.id}
                                    src={member.avatar}
                                    alt={member.name}
                                    title={member.name}
                                    className="w-7 h-7 rounded-full border-2 border-white"
                                  />
                                ) : null;
                              })}
                              {task.assigned_to.length > 5 && (
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                  +{task.assigned_to.length - 5}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-800">
                    <i className="fa-solid fa-users text-purple-600 mr-3"></i>
                    Üye Yönetimi
                  </h2>
                  <div className="relative">
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Üye ara..."
                      className="bg-gray-100 border-2 border-gray-200 focus:border-purple-500 rounded-xl py-2 pl-10 pr-4 font-bold text-gray-800 outline-none transition"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="fa-solid fa-users text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-400 font-bold">Üye bulunamadı.</p>
                    </div>
                  ) : (
                    filteredMembers.map(member => (
                      <div key={member.id} className="border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-300 transition">
                        <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-gray-800">{member.name}</h4>
                            {member.role === 'mentor' && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                <i className="fa-solid fa-crown mr-1"></i> Mentor
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{member.email}</p>
                          <div className="flex gap-3 text-xs text-gray-600">
                            <span><i className="fa-solid fa-star text-purple-500 mr-1"></i> {member.score} Puan</span>
                            <span><i className="fa-solid fa-calendar text-blue-500 mr-1"></i> {new Date(member.joined_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        {member.role !== 'mentor' && (
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-200 transition"
                          >
                            <i className="fa-solid fa-user-minus mr-2"></i>
                            Çıkar
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 mb-6">
                  <i className="fa-solid fa-bell text-purple-600 mr-3"></i>
                  Bildirim Ayarları
                </h2>

                <div className="space-y-4">
                  <div className="border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-purple-300 transition">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Yeni Üye Bildirimi</h4>
                      <p className="text-sm text-gray-500">Circle'a yeni üye katıldığında bildirim al</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({ ...notificationSettings, new_member: !notificationSettings.new_member })}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        notificationSettings.new_member ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                        notificationSettings.new_member ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>

                  <div className="border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-purple-300 transition">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Yeni Yorum Bildirimi</h4>
                      <p className="text-sm text-gray-500">Circle'da yeni yorum yapıldığında bildirim al</p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({ ...notificationSettings, new_comment: !notificationSettings.new_comment })}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        notificationSettings.new_comment ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                        notificationSettings.new_comment ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-extrabold uppercase text-lg shadow-[0_6px_0_rgb(126,34,206)] hover:bg-purple-700 hover:shadow-[0_4px_0_rgb(126,34,206)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Kaydediliyor...</>
                    ) : (
                      <><i className="fa-solid fa-check mr-2"></i> Kaydet</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Visibility Tab */}
            {activeTab === 'visibility' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 mb-6">
                  <i className="fa-solid fa-eye text-purple-600 mr-3"></i>
                  Görünürlük Ayarları
                </h2>

                <div className="space-y-4">
                  <div className="border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-purple-300 transition">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Üyeleri Göster</h4>
                      <p className="text-sm text-gray-500">Circle üyelerini herkese göster</p>
                    </div>
                    <button
                      onClick={() => setVisibilitySettings({ ...visibilitySettings, show_members: !visibilitySettings.show_members })}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        visibilitySettings.show_members ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                        visibilitySettings.show_members ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>

                  <div className="border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-purple-300 transition">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Puanları Göster</h4>
                      <p className="text-sm text-gray-500">Üye puanlarını herkese göster</p>
                    </div>
                    <button
                      onClick={() => setVisibilitySettings({ ...visibilitySettings, show_score: !visibilitySettings.show_score })}
                      className={`w-14 h-8 rounded-full transition-colors relative ${
                        visibilitySettings.show_score ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                        visibilitySettings.show_score ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveVisibility}
                    disabled={saving}
                    className="w-full bg-purple-600 text-white py-4 rounded-2xl font-extrabold uppercase text-lg shadow-[0_6px_0_rgb(126,34,206)] hover:bg-purple-700 hover:shadow-[0_4px_0_rgb(126,34,206)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Kaydediliyor...</>
                    ) : (
                      <><i className="fa-solid fa-check mr-2"></i> Kaydet</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        showCancel={true}
        confirmText="Onayla"
        cancelText="İptal"
      />
    </LayoutWrapper>
  );
}
