'use client';

import { MessageTemplate } from '@/lib/api';

interface TemplateSelectorProps {
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
  onClose: () => void;
}

export default function TemplateSelector({ templates, onSelect, onClose }: TemplateSelectorProps) {
  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Genel';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  return (
    <div className="mb-3 bg-slate-900 border border-slate-600 rounded-xl p-3 max-h-60 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase">Şablonlar</h4>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white transition"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
      
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category} className="mb-3 last:mb-0">
          <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">{category}</h5>
          <div className="space-y-1">
            {categoryTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-xs"
              >
                <div className="font-bold text-white mb-1">{template.title}</div>
                <div className="text-slate-400 line-clamp-2">{template.content}</div>
                {template.usage_count > 0 && (
                  <div className="text-[10px] text-slate-500 mt-1">
                    {template.usage_count} kez kullanıldı
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {templates.length === 0 && (
        <div className="text-center text-slate-500 text-xs py-4">
          Henüz şablon eklenmemiş
        </div>
      )}
    </div>
  );
}
