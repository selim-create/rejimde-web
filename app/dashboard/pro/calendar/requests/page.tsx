'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAppointmentRequests } from '@/lib/api';
import type { AppointmentRequest } from '@/lib/api';
import RequestCard from '../components/RequestCard';
import ApproveModal from '../components/ApproveModal';
import RejectModal from '../components/RejectModal';

export default function AppointmentRequestsPage() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, pending: 0 });
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    const statusFilter = filter === 'all' ? undefined : filter;
    const data = await getAppointmentRequests(statusFilter);
    setRequests(data.requests);
    setMeta(data.meta);
    setLoading(false);
  };

  const handleApprove = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleReject = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleSuccess = () => {
    loadRequests();
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/pro/calendar" 
                className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <div>
                <h1 className="font-extrabold text-white text-xl tracking-tight">Randevu Talepleri</h1>
                <p className="text-xs font-bold text-slate-500">
                  {meta.pending > 0 ? `${meta.pending} bekleyen talep` : 'Bekleyen talep yok'}
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bekleyen
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Onaylanan
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reddedilen
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Toplam Talep</p>
                <p className="text-2xl font-extrabold text-white">{meta.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-inbox text-blue-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Bekleyen</p>
                <p className="text-2xl font-extrabold text-yellow-400">{meta.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-clock text-yellow-400 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">İşlenen</p>
                <p className="text-2xl font-extrabold text-white">{meta.total - meta.pending}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-check text-green-400 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-slate-400">Talepler yükleniyor...</p>
            </div>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request)}
                onReject={() => handleReject(request)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-regular fa-inbox text-2xl text-slate-500"></i>
            </div>
            <h3 className="font-bold text-slate-300 text-lg">Talep Yok</h3>
            <p className="text-slate-500 text-sm mt-1">
              {filter === 'pending' 
                ? 'Henüz bekleyen randevu talebi bulunmuyor.'
                : `${filter === 'all' ? 'Hiç' : filter === 'approved' ? 'Onaylanmış' : 'Reddedilmiş'} talep yok.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showApproveModal && selectedRequest && (
        <ApproveModal
          request={selectedRequest}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {showRejectModal && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
