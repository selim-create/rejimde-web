'use client';

import { useState } from 'react';
import { MessageTemplate } from '@/lib/api';
import TemplateSelector from './TemplateSelector';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onAIDraft?: () => void;
  templates?: MessageTemplate[];
  sending?: boolean;
}

export default function MessageInput({ onSend, onAIDraft, templates, sending }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    await onSend(message);
    setMessage('');
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setMessage(template.content);
    setShowTemplates(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-slate-700 bg-slate-800">
      {/* Quick Actions */}
      {!message && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {onAIDraft && (
            <button 
              onClick={onAIDraft}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition whitespace-nowrap"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              AI ile Taslak Oluştur
            </button>
          )}
          {templates && templates.length > 0 && (
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-400 text-xs font-bold hover:text-white transition whitespace-nowrap"
            >
              <i className="fa-solid fa-file-lines mr-2"></i>
              Şablon Seç
            </button>
          )}
        </div>
      )}

      {/* Template Selector */}
      {showTemplates && templates && (
        <TemplateSelector
          templates={templates}
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Message Input */}
      <div className="relative">
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
          className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 pr-12 text-white text-sm font-medium focus:border-blue-500 focus:outline-none min-h-[100px] resize-none placeholder-slate-500 disabled:opacity-50"
          placeholder="Cevabınızı yazın... (Enter ile gönder, Shift+Enter ile yeni satır)"
        ></textarea>
        <button 
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <i className="fa-solid fa-spinner fa-spin text-sm"></i>
          ) : (
            <i className="fa-solid fa-paper-plane text-sm"></i>
          )}
        </button>
      </div>
    </div>
  );
}
