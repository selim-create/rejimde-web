"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPost, uploadMedia } from "@/lib/api";
import MascotDisplay from "@/components/MascotDisplay";

// Blok Tipleri
type BlockType = 'paragraph' | 'heading' | 'list' | 'image' | 'tip' | 'warning' | 'quote' | 'video';

interface ContentBlock {
    id: string;
    type: BlockType;
    content: string;
    url?: string; // Resim/Video için
}

export default function CreateBlogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  
  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [modalMessage, setModalMessage] = useState({ title: "", desc: "" });
  
  // Blok Tabanlı İçerik (Notion Style Lite)
  const [blocks, setBlocks] = useState<ContentBlock[]>([
      { id: '1', type: 'paragraph', content: '' }
  ]);

  // Medya
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Taksonomi
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");

  // Başlangıç: Kategorileri Çek
  useEffect(() => {
    async function fetchCategories() {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
            const res = await fetch(`${apiUrl}/wp/v2/categories?per_page=100`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0) setSelectedCategory(data[0].id);
            }
        } catch (e) { console.error(e); }
    }
    fetchCategories();
  }, []);

  // --- BLOK YÖNETİMİ ---
  const addBlock = (type: BlockType) => {
      // Liste ise varsayılan içerik
      const defaultContent = type === 'list' ? '<ul>\n<li>Liste öğesi 1</li>\n<li>Liste öğesi 2</li>\n</ul>' : '';
      setBlocks([...blocks, { id: Date.now().toString(), type, content: defaultContent }]);
  };

  const updateBlock = (id: string, value: string) => {
      setBlocks(blocks.map(b => b.id === id ? { ...b, content: value } : b));
  };

  const removeBlock = (id: string) => {
      if (blocks.length > 1) {
          setBlocks(blocks.filter(b => b.id !== id));
      }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
      const newBlocks = [...blocks];
      if (direction === 'up' && index > 0) {
          [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
      } else if (direction === 'down' && index < newBlocks.length - 1) {
          [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      }
      setBlocks(newBlocks);
  };

  // Blok İçi Görsel Yükleme
  const handleBlockImageUpload = async (file: File, blockId: string) => {
      try {
          const res = await uploadMedia(file);
          if (res.success && res.url) {
              setBlocks(blocks.map(b => b.id === blockId ? { ...b, url: res.url, content: 'Görsel Yüklendi' } : b));
          } else {
              alert("Hata: " + res.message);
          }
      } catch (e) { alert("Yükleme hatası"); }
  };

  // Öne Çıkan Görsel Yükleme
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const res = await uploadMedia(e.target.files[0]);
      if (res.success && res.url) {
          setFeaturedImage(res.url);
          setFeaturedImageId(res.id || 0);
      } else {
          alert("Hata: " + res.message);
      }
      setIsUploading(false);
    }
  };

  // Tag Yönetimi
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Editör Helper
  const insertFormat = (startTag: string, endTag: string = "") => {
      const textarea = textAreaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);

      const replacement = startTag + selectedText + endTag;
      const newText = text.substring(0, start) + replacement + text.substring(end);
      
      // Ana içerik state'ini güncelle (Eğer tek textarea kullanıyorsak)
      // Ancak blok yapısında her bloğun kendi inputu var. Bu fonksiyon şu an global toolbar için.
      // Blok yapısında global toolbar biraz karmaşık olabilir, o yüzden blok içi inputları kullanmak daha sağlıklı.
      // Şimdilik bu fonksiyonu devre dışı bırakıyoruz veya aktif blok için özelleştirebiliriz.
  };

  // YAYINLA
  const handlePublish = async (status: 'publish' | 'draft') => {
    if (!title) { alert("Lütfen başlık giriniz."); return; }

    setLoading(true);

    // Blokları HTML'e çevir
    let htmlContent = "";
    blocks.forEach(block => {
        // İçeriği olmayan blokları atla (resim hariç)
        if (!block.content && block.type !== 'image') return;

        switch (block.type) {
            case 'heading': htmlContent += `<h2>${block.content}</h2>`; break;
            case 'paragraph': htmlContent += `<p>${block.content}</p>`; break;
            case 'list': htmlContent += block.content; break; // Liste zaten HTML olarak saklanıyor
            case 'tip': 
                htmlContent += `<div class="bg-blue-50 border-l-4 border-rejimde-blue p-4 rounded-r-xl my-4"><p class="font-bold text-rejimde-blueDark mb-0"><i class="fa-solid fa-lightbulb mr-2"></i> ${block.content}</p></div>`; 
                break;
            case 'warning':
                htmlContent += `<div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl my-4"><p class="font-bold text-red-700 mb-0"><i class="fa-solid fa-triangle-exclamation mr-2"></i> ${block.content}</p></div>`;
                break;
            case 'quote':
                htmlContent += `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">"${block.content}"</blockquote>`;
                break;
            case 'image':
                if (block.url) htmlContent += `<img src="${block.url}" alt="Blog Görseli" class="rounded-xl w-full my-4" />`;
                break;
            case 'video':
                htmlContent += `<div class="aspect-video my-4"><iframe src="${block.content}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe></div>`;
                break;
        }
    });

    const postData = {
        title,
        content: htmlContent,
        status, 
        excerpt,
        featured_media_id: featuredImageId,
        categories: [Number(selectedCategory)],
        tags: tags,
        meta: {
            rank_math_title: seoTitle || title,
            rank_math_description: seoDesc || excerpt,
            rank_math_focus_keyword: focusKeyword
        }
    };

    const res = await createPost(postData);

    if (res.success) {
      setModalMessage({
          title: status === 'publish' ? "Yazı Yayında! 🎉" : "Taslak Kaydedildi 💾",
          desc: status === 'publish' ? "Harika bir içerik oluşturdun. Şimdi herkes okuyabilir." : "Daha sonra düzenlemeye devam edebilirsin."
      });
      if (res.data && res.data.slug) setCreatedSlug(res.data.slug);
      setShowSuccessModal(true);
    } else {
      alert("Hata: " + res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-rejimde-text">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
             <Link href="/dashboard/pro" className="text-gray-400 hover:text-gray-600 transition"><i className="fa-solid fa-arrow-left"></i></Link>
             <h1 className="text-xl font-black text-gray-800">Akıllı Blog Editörü</h1>
         </div>
         <div className="flex gap-3">
             <button onClick={() => handlePublish('draft')} disabled={loading} className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition text-xs uppercase">Taslak</button>
             <button onClick={() => handlePublish('publish')} disabled={loading} className="bg-rejimde-green text-white px-6 py-2 rounded-xl font-extrabold shadow-btn shadow-rejimde-greenDark btn-game text-xs uppercase flex items-center gap-2">
                {loading && <i className="fa-solid fa-circle-notch animate-spin"></i>} Yayınla
             </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Block Editor Area */}
        <div className="lg:col-span-2 space-y-6">
            
            <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlığınızı Buraya Yazın..." 
                className="w-full bg-transparent text-4xl font-black text-gray-800 placeholder-gray-300 outline-none"
            />

            {/* Blocks List */}
            <div className="space-y-4">
                {blocks.map((block, index) => (
                    <div key={block.id} className="group relative pl-10 transition-all">
                        
                        {/* Block Controls (Hover) */}
                        <div className="absolute left-0 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                             <button onClick={() => removeBlock(block.id)} className="text-red-300 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                             <div className="flex flex-col text-gray-300">
                                 <button onClick={() => moveBlock(index, 'up')} className="hover:text-gray-500"><i className="fa-solid fa-chevron-up"></i></button>
                                 <button onClick={() => moveBlock(index, 'down')} className="hover:text-gray-500"><i className="fa-solid fa-chevron-down"></i></button>
                             </div>
                        </div>

                        {/* Block Input Types */}
                        {block.type === 'paragraph' && (
                            <textarea 
                                value={block.content}
                                onChange={(e) => {
                                    updateBlock(block.id, e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                className="w-full bg-transparent text-lg text-gray-600 outline-none resize-none overflow-hidden placeholder-gray-300 border-l-2 border-transparent focus:border-gray-200 pl-2"
                                placeholder="Bir şeyler yazın..."
                            />
                        )}
                        
                        {block.type === 'heading' && (
                            <input 
                                type="text" 
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                className="w-full bg-transparent text-2xl font-bold text-gray-800 outline-none placeholder-gray-300 border-l-2 border-transparent focus:border-gray-200 pl-2"
                                placeholder="Alt Başlık"
                            />
                        )}

                        {block.type === 'list' && (
                             <textarea 
                                value={block.content}
                                onChange={(e) => {
                                    updateBlock(block.id, e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                className="w-full bg-transparent text-base text-gray-600 outline-none resize-none overflow-hidden placeholder-gray-300 border-l-4 border-gray-200 pl-4 font-mono"
                                placeholder="<ul><li>Madde 1</li></ul> formatında yazın..."
                            />
                        )}

                        {block.type === 'tip' && (
                            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-rejimde-blue flex gap-3">
                                <i className="fa-solid fa-lightbulb text-rejimde-blue mt-1"></i>
                                <textarea 
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-rejimde-blueDark outline-none resize-none placeholder-blue-300"
                                    placeholder="İpucunu buraya yaz..."
                                />
                            </div>
                        )}

                        {block.type === 'warning' && (
                            <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 flex gap-3">
                                <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1"></i>
                                <textarea 
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-red-800 outline-none resize-none placeholder-red-300"
                                    placeholder="Uyarı metnini yaz..."
                                />
                            </div>
                        )}

                        {block.type === 'quote' && (
                            <div className="pl-4 border-l-4 border-gray-300 italic">
                                <textarea 
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    className="w-full bg-transparent text-xl text-gray-500 outline-none resize-none placeholder-gray-300"
                                    placeholder="Alıntı..."
                                />
                            </div>
                        )}

                        {block.type === 'image' && (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative group/img">
                                {block.url ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={block.url} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" />
                                        <div 
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition"
                                            onClick={(e) => {
                                                // Tıklamayı inputa yönlendir
                                                const fileInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                                                fileInput?.click();
                                            }}
                                        >
                                            <span className="text-white font-bold text-xs"><i className="fa-solid fa-pen mr-2"></i>Değiştir</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8" onClick={(e) => {
                                         const fileInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                                         fileInput?.click();
                                    }}>
                                        <i className="fa-regular fa-image text-3xl text-gray-300 mb-2"></i>
                                        <p className="text-xs text-gray-400 font-bold">Görsel Yüklemek İçin Tıkla</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={(e) => {
                                    if(e.target.files?.[0]) handleBlockImageUpload(e.target.files[0], block.id);
                                }} />
                            </div>
                        )}

                        {block.type === 'video' && (
                             <input 
                                type="text" 
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none placeholder-gray-400"
                                placeholder="YouTube Video URL'sini veya ID'sini yapıştır..."
                            />
                        )}

                    </div>
                ))}
            </div>

            {/* Add Block Bar */}
            <div className="flex gap-2 flex-wrap items-center pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase mr-2">Ekle:</span>
                <button onClick={() => addBlock('paragraph')} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200">Metin</button>
                <button onClick={() => addBlock('heading')} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200">Başlık</button>
                <button onClick={() => addBlock('list')} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200"><i className="fa-solid fa-list-ul mr-1"></i> Liste</button>
                <button onClick={() => addBlock('image')} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200"><i className="fa-regular fa-image mr-1"></i> Görsel</button>
                <button onClick={() => addBlock('video')} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200"><i className="fa-brands fa-youtube mr-1"></i> Video</button>
                <button onClick={() => addBlock('tip')} className="px-3 py-1 bg-blue-50 text-rejimde-blue rounded-lg text-xs font-bold hover:bg-blue-100">💡 İpucu</button>
                <button onClick={() => addBlock('warning')} className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100">⚠️ Uyarı</button>
                <button onClick={() => addBlock('quote')} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200">❝ Alıntı</button>
            </div>

        </div>

        {/* RIGHT: Settings Sidebar */}
        <div className="space-y-6">
            
            {/* Featured Image */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Öne Çıkan Görsel</h3>
                <div 
                    className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden group ${featuredImage ? 'border-transparent' : 'border-gray-300 hover:border-rejimde-blue hover:bg-blue-50'}`}
                >
                    {featuredImage ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                            <div 
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            >
                                <span className="text-white font-bold text-xs"><i className="fa-solid fa-pen mr-2"></i>Değiştir</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4" onClick={() => fileInputRef.current?.click()}>
                            {isUploading ? <i className="fa-solid fa-circle-notch animate-spin text-2xl text-rejimde-blue"></i> : <><i className="fa-regular fa-image text-3xl text-gray-300 mb-2"></i><p className="text-xs font-bold text-gray-400">Görsel Yükle</p></>}
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>

            {/* Category */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Kategori</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {categories.length > 0 ? categories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition hover:bg-gray-50 has-[:checked]:border-rejimde-green has-[:checked]:bg-green-50">
                            <input type="radio" name="category" value={cat.id} checked={Number(selectedCategory) === cat.id} onChange={(e) => setSelectedCategory(Number(e.target.value))} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${Number(selectedCategory) === cat.id ? 'border-rejimde-green' : 'border-gray-300'}`}>
                                {Number(selectedCategory) === cat.id && <div className="w-2 h-2 rounded-full bg-rejimde-green"></div>}
                            </div>
                            {/* HTML entity'leri temizle */}
                            <span className={`text-sm font-bold ${Number(selectedCategory) === cat.id ? 'text-gray-800' : 'text-gray-500'}`} dangerouslySetInnerHTML={{ __html: cat.name }}></span>
                        </label>
                    )) : <p className="text-sm text-gray-400">Yükleniyor...</p>}
                </div>
            </div>

            {/* Tags */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Etiketler</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">#{tag}<button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500"><i className="fa-solid fa-xmark"></i></button></span>
                    ))}
                </div>
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Etiket ekle ve Enter..." className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-rejimde-blue transition" />
            </div>

            {/* Excerpt */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4">Kısa Özet (Excerpt)</h3>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-rejimde-blue transition h-24 resize-none" placeholder="Yazının kartlarda görünecek kısa özeti..."></textarea>
            </div>

            {/* SEO */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2"><i className="fa-solid fa-magnifying-glass"></i> SEO Ayarları</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">SEO Başlığı</label>
                        <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-rejimde-blue" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Meta Açıklama</label>
                        <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder={excerpt || "Özet..."} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-rejimde-blue h-20 resize-none"></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Odak Anahtar Kelime</label>
                        <input type="text" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-rejimde-blue" />
                    </div>
                </div>
            </div>

        </div>

      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowSuccessModal(false)}>
            <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center animate-bounce-slow" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-500">
                    <i className="fa-solid fa-check text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">{modalMessage.title}</h3>
                <p className="text-gray-500 font-bold mb-6 text-sm">{modalMessage.desc}</p>
                <div className="flex justify-center mb-6">
                     <MascotDisplay state="success_milestone" size={120} showBubble={false} />
                </div>
                <div className="flex flex-col gap-3">
                    {createdSlug && (
                        <Link href={`/blog/${createdSlug}`} className="w-full bg-rejimde-green text-white py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase">
                            Yazıyı Görüntüle
                        </Link>
                    )}
                    <Link href="/blog" className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold btn-game uppercase hover:bg-gray-200">
                        Blog Listesine Dön
                    </Link>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}