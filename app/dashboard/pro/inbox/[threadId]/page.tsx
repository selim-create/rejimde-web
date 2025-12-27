'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  getMe, 
  getInboxThread, 
  sendInboxMessage,
  markThreadAsRead,
  closeInboxThread,
  archiveInboxThread,
  getMessageTemplates,
  generateAIDraft,
  InboxThread,
  InboxMessage,
  MessageTemplate
} from "@/lib/api";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import { useToast } from "@/components/ui/Toast";

export default function ThreadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = Number(params.threadId);
  const { showToast } = useToast();
  
  const [pro, setPro] = useState<any>(null);
  const [thread, setThread] = useState<InboxThread | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch user info
  useEffect(() => {
    getMe().then((user) => setPro(user));
  }, []);

  // Fetch thread data
  const fetchThread = async () => {
    setLoading(true);
    const result = await getInboxThread(threadId);
    
    if (result) {
      setThread(result.thread);
      setMessages(result.messages);
      
      // Mark as read
      if (result.thread.unread_count > 0) {
        await markThreadAsRead(threadId);
      }
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Thread bulunamadı'
      });
      router.push('/dashboard/pro/inbox');
    }
    
    setLoading(false);
  };

  // Fetch templates
  const fetchTemplates = async () => {
    const result = await getMessageTemplates();
    setTemplates(result);
  };

  useEffect(() => {
    if (threadId) {
      fetchThread();
      fetchTemplates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setSending(true);
    
    // Optimistic update
    const tempMessage: InboxMessage = {
      id: Date.now(), // temporary ID
      sender_id: pro?.id || 0,
      sender_type: 'expert',
      sender_name: pro?.name || '',
      sender_avatar: pro?.avatar_url || '',
      content: content,
      content_type: 'text',
      attachments: null,
      is_read: false,
      is_ai_generated: false,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    const result = await sendInboxMessage(threadId, { content });
    
    if (result.success && result.message) {
      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? result.message! : m));
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Mesaj gönderildi'
      });
    } else {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.error || 'Mesaj gönderilemedi'
      });
    }
    
    setSending(false);
  };

  // Generate AI draft
  const handleAIDraft = async () => {
    const result = await generateAIDraft(threadId);
    
    if (result.success && result.draft) {
      // For now, we'll just send it directly
      // In a real implementation, you might want to show it in the input for editing
      await handleSendMessage(result.draft);
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'AI taslak oluşturulamadı'
      });
    }
  };

  // Close thread
  const handleCloseThread = async () => {
    const success = await closeInboxThread(threadId);
    
    if (success) {
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Thread kapatıldı'
      });
      fetchThread(); // Refresh to update status
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Thread kapatılamadı'
      });
    }
  };

  // Archive thread
  const handleArchiveThread = async () => {
    const success = await archiveInboxThread(threadId);
    
    if (success) {
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Thread arşivlendi'
      });
      router.push('/dashboard/pro/inbox');
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Thread arşivlenemedi'
      });
    }
  };

  if (loading || !thread) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/pro/inbox')}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
              PRO PANEL
            </span>
            <h1 className="font-extrabold text-white text-lg">{thread.subject || 'Mesajlaşma'}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pro?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Thread Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-card flex flex-col h-[calc(100vh-180px)]">
          
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={thread.client.avatar} 
                className="w-10 h-10 rounded-full" 
                alt={thread.client.name} 
              />
              <div>
                <h3 className="font-extrabold text-white text-base">{thread.subject || 'Konu yok'}</h3>
                <p className="text-xs text-slate-400 font-bold">{thread.client.name} ile konuşuluyor</p>
              </div>
              <span className={`ml-2 px-2 py-1 rounded-lg text-[10px] font-bold ${
                thread.status === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                thread.status === 'closed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {thread.status === 'open' ? 'Açık' : thread.status === 'closed' ? 'Kapalı' : 'Arşiv'}
              </span>
            </div>
            <div className="flex gap-2">
              {thread.status === 'open' && (
                <>
                  <button 
                    onClick={handleCloseThread}
                    className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-green-400 transition flex items-center justify-center" 
                    title="Thread'i Kapat"
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button 
                    onClick={handleArchiveThread}
                    className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-yellow-400 transition flex items-center justify-center" 
                    title="Arşivle"
                  >
                    <i className="fa-solid fa-box-archive"></i>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-500">
                  <i className="fa-regular fa-comments text-4xl mb-3"></i>
                  <p className="text-sm font-bold">Henüz mesaj yok</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_type === 'expert'}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {thread.status === 'open' ? (
            <MessageInput
              onSend={handleSendMessage}
              onAIDraft={handleAIDraft}
              templates={templates}
              sending={sending}
            />
          ) : (
            <div className="p-4 border-t border-slate-700 bg-slate-800 text-center">
              <p className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2">
                <i className="fa-solid fa-lock"></i> 
                Bu thread {thread.status === 'closed' ? 'kapatılmış' : 'arşivlenmiş'}tir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
