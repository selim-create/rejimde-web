"use client";

import { useState } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  maxLength?: number;
}

export default function MarkdownEditor({ value, onChange, label, placeholder, maxLength = 1000 }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const renderPreview = () => {
    let html = value;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-rejimde-blue underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside ml-4 my-2">$&</ul>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div>
      {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
      
      {/* Toolbar */}
      <div className="bg-slate-800 border border-slate-600 rounded-t-xl p-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => insertMarkdown('**')}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition text-xs font-bold"
          title="Kalın (Bold)"
        >
          <i className="fa-solid fa-bold"></i>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*')}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition text-xs font-bold"
          title="İtalik (Italic)"
        >
          <i className="fa-solid fa-italic"></i>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('- ')}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition text-xs font-bold"
          title="Liste (List)"
        >
          <i className="fa-solid fa-list"></i>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition text-xs font-bold"
          title="Link"
        >
          <i className="fa-solid fa-link"></i>
        </button>
        
        <div className="flex-1"></div>
        
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
            isPreview
              ? 'bg-rejimde-purple text-white'
              : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
        >
          <i className={`fa-solid ${isPreview ? 'fa-edit' : 'fa-eye'} mr-1`}></i>
          {isPreview ? 'Düzenle' : 'Önizleme'}
        </button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div className="bg-slate-900 border border-slate-600 border-t-0 rounded-b-xl p-4 min-h-[200px] text-white">
          {value ? renderPreview() : <p className="text-slate-500 italic">Önizleme için metin yazın...</p>}
        </div>
      ) : (
        <textarea
          id="markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-600 border-t-0 rounded-b-xl p-4 font-medium text-white outline-none focus:border-rejimde-purple min-h-[200px] resize-none"
        />
      )}

      {/* Character Counter */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-slate-500">
          <i className="fa-solid fa-info-circle mr-1"></i>
          Markdown desteklenir: **kalın**, *italik*, [link](url), - liste
        </p>
        <p className="text-xs text-slate-500 font-bold">
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}
