import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface PublishProps {
  products: Product[];
  onAddProduct: (product: Product, forceThreat?: boolean) => void;
  onUpdateProductStatus: (id: number, status: 'analyzing' | 'approved' | 'declined') => void;
  username: string;
  simulateMalware?: boolean;
}

export default function Publish({ onAddProduct, username, simulateMalware }: PublishProps) {
  const navigate = useNavigate();

  // Estados do Formulário
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
  
  // Imagens
  const imagePlaceholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuoEugjmSopUyUtAwG0-zss0p7RzRcvfHLOU0wx9imP7yj7Z57OHzUUq38ct7Nmrl2ZCcVFof79aVBjFpriVydBh_NFeGFnB5ilo7u85_SzuuHtKHczwZrfLGH6-4Feqimr7obtmqOCVrI8g2B7-lYcwvscuM0iDmnMqvjg5EMUsPDGr0c7PCPp0PxVUP7pa_LADIXbacjo1QE9GTx7a_S1oiKM9TjJMt_0WGL_RKkm5EgCDoNdPFEaRtLcz43Y7wTDBeU6ZFi6w",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCM1Hz1H6ynJIWJKCrOwNTXgYoI634qu_ys5SPkklO1NRVumHHTCLtXnsi2OpjVeocz0fvSji7Wyupu9VLO72T2xHCtIFZU3Uqh0WmBy_53ubXFWFSUDq3gthM5ahI33aiKsMhofdhVaMq7LeEuFojCxoxp5-L3j8rCz6wvaczWYBwKNmMh2ay_sFPiINZvm6vnqqqaP4ldpaRuHay00V96ISArZHyen1sb9vrPkeuP3_dDAzAPB7o8Ut4t7qicR21Qblwm84nNLA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSSDWhJHMgaYslQBn204xjhoYQlq9bv4_AVOI51RAyIwv6reQbS739I8FHeByarsWa_EkkGBkAY51mGjXABbMEl_D_n7tNvMrYTMxs8GIZOAdNKi3WMqZ_hqqF8kyve5FHtARjJaehJk1vRdtzVM9jsUSgm24E6Sz78s400oRpjh-UeEcaBIaFiXPEwSIqxe-jk3oqt3wlRamgfNO2MNlC6OgG5VnMmNpX2rrECm2yakMh-YMykkgXVQ0zkToL2ONNAqaEMMCfsg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqSDtqw3mLx2D7OFa1K_aJtvLyKwcOD4rFdwAF4l5myLeX4EDRWrz8bwzu7CG6UZ5CNT0DAc34WdXJPrAl7qD7H_ViT830SKw_beNDhhdYIw5MIpJZCC5P6UWKGjT5CGH0UqDdzHB-at9DUA18ccYWcX7xjtJLUIM4Kzzi0EPJZOo-okuy3juS98-g84-2i61eTCvAotCuM3VyEnHWe1mZXmLJDDI5Q_5KzcnrcRDsVmz8eRCIPAIQncQV02H03lj9MYdsk17kg"
  ];
  const [selectedImg, setSelectedImg] = useState(imagePlaceholders[0]);
  const [customImgUrl, setCustomImgUrl] = useState('');

  const [features, setFeatures] = useState<string[]>([
    "Totalmente responsivo e customizável",
    "Tipos de dados vetoriais e gráficos",
    "Fontes inclusas e linkadas"
  ]);
  const [featureInput, setFeatureInput] = useState('');

  // Estados de Upload (CORRIGIDO: Agora salva o arquivo real 'File')
  const [dragActive, setDragActive] = useState(false);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.name.endsWith('.zip')) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      setActualFile(file);
      setSize(sizeMb);
    } else {
      alert("Erro: Apenas arquivos .ZIP são aceitos.");
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures(prev => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actualFile) {
      alert("Aviso: É obrigatório subir um arquivo ZIP.");
      return;
    }

    setLoading(true);

    try {
      // 1. Pegar usuário logado
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("Você precisa estar logado para publicar.");

      // 2. Upload do Arquivo para o Supabase Storage
      const fileExt = actualFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, actualFile);

      if (uploadError) throw uploadError;

      // 3. Preparar metadados do produto
      const finalPrice = parseFloat(price) || 0;
      const finalImg = customImgUrl.trim() || selectedImg;

      const newProductData = {
        title: title || 'Ativo Sem Nome',
        format: format,
        price: finalPrice,
        category: category.toLowerCase(),
        img: finalImg,
        creator: username,
        description: description,
        long_description: longDescription,
        features: features,
        specs: {
          resolution,
          software,
          size,
          updates: 'Gratuitas Vitalícias',
          slidesCount: format !== 'ZIP' ? slidesCount : undefined,
          fileFormat: format
        },
        file_path: filePath,
        status: 'active', // Fica ativo direto para o MVP
        creator_id: user.id
      };

      // 4. Inserir na tabela 'products' do Supabase
      const { data: dbProduct, error: dbError } = await supabase
        .from('products')
        .insert([newProductData])
        .select()
        .single();

      if (dbError) throw dbError;

      // 5. Atualizar estado local no App.tsx e navegar
      onAddProduct(dbProduct as unknown as Product);
      alert("Ativo publicado com sucesso!");
      navigate('/');

    } catch (err: any) {
      console.error(err);
      alert("Falha na publicação: " + (err.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in relative max-w-4xl mx-auto">
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="mb-8">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Editor & Publicador</h1>
        <p className="text-xs text-on-surface-variant font-medium">Submeta novos arquivos e configure as especificações comerciais.</p>
      </header>

      <form onSubmit={handlePublishSubmit} className="bg-[#1d2022] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary text-xl">cloud_upload</span>
          <h2 className="font-bold text-white uppercase tracking-wider text-xs">Especificações Técnicas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-8 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Título do Ativo</label>
            <input 
              type="text" required placeholder="Ex: Cyberpunk Keynote Deck"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none"
            />
          </div>
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Preço (R$)</label>
            <input 
              type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
              <option value="SLIDES">SLIDES</option>
              <option value="UI KIT">UI KIT</option>
              <option value="3D MODEL">3D MODEL</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Formato</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
              <option value="PPTX">PowerPoint</option>
              <option value="KEYNOTE">Keynote</option>
              <option value="FIGMA">Figma</option>
              <option value="ZIP">Arquivo ZIP</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Software</label>
            <input type="text" value={software} onChange={(e) => setSoftware(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Descrição Curta</label>
          <input type="text" maxLength={120} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Descrição Completa</label>
          <textarea rows={4} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none resize-none" />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Imagem de Capa</label>
          <div className="grid grid-cols-4 gap-2">
            {imagePlaceholders.map((img, i) => (
              <button key={i} type="button" onClick={() => { setSelectedImg(img); setCustomImgUrl(''); }} className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${selectedImg === img && !customImgUrl ? 'border-primary' : 'border-white/5 opacity-40'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <input type="url" placeholder="Ou cole a URL de uma imagem" value={customImgUrl} onChange={(e) => setCustomImgUrl(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Arquivo .ZIP do Produto</label>
          <div
            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : actualFile ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-white/20'}`}
          >
            {actualFile ? (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-green-400">check_circle</span>
                <p className="text-xs font-bold text-white font-mono">{actualFile.name}</p>
                <button type="button" onClick={() => setActualFile(null)} className="text-[10px] text-red-400 uppercase font-bold">Remover</button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <span className="material-symbols-outlined text-4xl text-[#bac9cd]/30 mb-2">upload_file</span>
                <p className="text-xs font-bold text-white">Arraste seu arquivo ZIP aqui ou clique para selecionar</p>
                <input type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full font-black py-4 rounded-xl bg-primary text-black shadow-lg hover:scale-[1.01] transition-all flex justify-center items-center gap-2 uppercase text-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">{loading ? 'sync' : 'verified_user'}</span>
          {loading ? 'Processando Upload...' : 'Publicar Ativo Agora'}
        </button>
      </form>
    </div>
  );
}