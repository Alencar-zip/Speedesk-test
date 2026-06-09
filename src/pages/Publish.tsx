import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface PublishProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProductStatus: (id: number | string, status: 'analyzing' | 'approved' | 'declined') => void;
  username: string;
}

export default function Publish({ onAddProduct, username }: PublishProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SLIDES');
  const [format, setFormat] = useState('PPTX');
  const [price, setPrice] = useState('150');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [software, setSoftware] = useState('PowerPoint');
  const [resolution, setResolution] = useState('1920x1080 (16:9)');
  const [size, setSize] = useState('12.5 MB');
  const [slidesCount, setSlidesCount] = useState('30');
  
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualFile) return alert("Anexe o arquivo ZIP.");

    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return alert("Sessão expirada.");

      // 1. Upload do Arquivo
      const fileName = `${Date.now()}-${actualFile.name}`;
      await supabase.storage.from('assets').upload(fileName, actualFile);

      // 2. Gravação no Banco
      const { data: dbProduct, error: dbError } = await supabase
        .from('products')
        .insert([{
          title,
          price: parseFloat(price),
          category: category.toLowerCase(),
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuoEugjmSopUyUtAwG0-zss0p7RzRcvfHLOU0wx9imP7yj7Z57OHzUUq38ct7Nmrl2ZCcVFof79aVBjFpriVydBh_NFeGFnB5ilo7u85_SzuuHtKHczwZrfLGH6-4Feqimr7obtmqOCVrI8g2B7-lYcwvscuM0iDmnMqvjg5EMUsPDGr0c7PCPp0PxVUP7pa_LADIXbacjo1QE9GTx7a_S1oiKM9TjJMt_0WGL_RKkm5EgCDoNdPFEaRtLcz43Y7wTDBeU6ZFi6w",
          format,
          description,
          long_description: longDescription,
          file_path: fileName,
          status: 'active',
          creator: username,
          creator_id: auth.user.id,
          specs: { resolution, software, size, updates: 'Vitalícias', slidesCount }
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      onAddProduct(dbProduct as unknown as Product);
      navigate('/');
    } catch (err: any) {
      alert("Falha: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-primary tracking-tighter">Publicar Ativo</h1>
      </header>

      <form onSubmit={handlePublishSubmit} className="bg-[#1d2022] border border-white/10 rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl p-3 text-white outline-none" required />
          <input type="number" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl p-3 text-white outline-none" required />
        </div>

        <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center">
          <input type="file" accept=".zip" onChange={e => setActualFile(e.target.files?.[0] || null)} className="hidden" id="zip" />
          <label htmlFor="zip" className="cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-primary block mb-2">upload_file</span>
            <p className="text-xs">{actualFile ? actualFile.name : "Clique para subir o ZIP"}</p>
          </label>
        </div>

        {loading && (
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 animate-pulse text-center">
            <p className="text-[10px] text-on-surface-variant uppercase font-mono">Triagem Iniciada via ClamAV Daemon...</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-black font-black rounded-xl uppercase text-xs">
          {loading ? 'Processando...' : 'Publicar Agora'}
        </button>
      </form>
    </div>
  );
}