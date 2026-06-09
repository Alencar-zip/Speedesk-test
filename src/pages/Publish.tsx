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
  
  const imagePlaceholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuoEugjmSopUyUtAwG0-zss0p7RzRcvfHLOU0wx9imP7yj7Z57OHzUUq38ct7Nmrl2ZCcVFof79aVBjFpriVydBh_NFeGFnB5ilo7u85_SzuuHtKHczwZrfLGH6-4Feqimr7obtmqOCVrI8g2B7-lYcwvscuM0iDmnMqvjg5EMUsPDGr0c7PCPp0PxVUP7pa_LADIXbacjo1QE9GTx7a_S1oiKM9TjJMt_0WGL_RKkm5EgCDoNdPFEaRtLcz43Y7wTDBeU6ZFi6w",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCM1Hz1H6ynJIWJKCrOwNTXgYoI634qu_ys5SPkklO1NRVumHHTCLtXnsi2OpjVeocz0fvSji7Wyupu9VLO72T2xHCtIFZU3Uqh0WmBy_53ubXFWFSUDq3gthM5ahI33aiKsMhofdhVaMq7LeEuFojCxoxp5-L3j8rCz6wvaczWYBwKNmMh2ay_sFPiINZvm6vnqqqaP4ldpaRuHay00V96ISArZHyen1sb9vrPkeuP3_dDAzAPB7o8Ut4t7qicR21Qblwm84nNLA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSSDWhJHMgaYslQBn204xjhoYQlq9bv4_AVOI51RAyIwv6reQbS739I8FHeByarsWa_EkkGBkAY51mGjXABbMEl_D_n7tNvMrYTMxs8GIZOAdNKi3WMqZ_hqqF8kyve5FHtARjJaehJk1vRdtzVM9jsUSgm24E6Sz78s400oRpjh-UeEcaBIaFiXPEwSIqxe-jk3oqt3wlRamgfNO2MNlC6OgG5VnMmNpX2rrECm2yakMh-YMykkgXVQ0zkToL2ONNAqaEMMCfsg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqSDtqw3mLx2D7OFa1K_aJtvLyKwcOD4rFdwAF4l5myLeX4EDRWrz8bwzu7CG6UZ5CNT0DAc34WdXJPrAl7qD7H_ViT830SKw_beNDhhdYIw5MIpJZCC5P6UWKGjT5CGH0UqDdzHB-at9DUA18ccYWcX7xjtJLUIM4Kzzi0EPJZOo-okuy3juS98-g84-2i61eTCvAotCuM3VyEnHWe1mZXmLJDDI5Q_5KzcnrcRDsVmz8eRCIPAIQncQV02H03lj9MYdsk17kg"
  ];
  const [selectedImg, setSelectedImg] = useState(imagePlaceholders[0]);
  const [customImgUrl, setCustomImgUrl] = useState('');

  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    "Totalmente responsivo e customizável",
    "Tipos de dados vetoriais e gráficos",
    "Fontes inclusas e linkadas"
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.name.endsWith('.zip')) {
      setActualFile(file);
    } else {
      alert("Erro: Apenas arquivos compactados no formato .ZIP são aceitos.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
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
    if (!actualFile) return;

    setLoading(true);
    try {
        // 1. Cria o registro como analyzing no Supabase
        const { data: product } = await supabase.from('products').insert([{
            title, price, status: 'analyzing'
        }]).select().single();

        // 2. Manda o arquivo para o SEU servidor (Porta 4242) fazer o scan
        const formData = new FormData();
        formData.append('file', actualFile);
        formData.append('productId', product.id);

        const response = await fetch('http://localhost:4242/api/upload-secure', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert("Publicado e validado pelo ClamAV!");
            navigate('/');
        } else {
            alert("Arquivo rejeitado pela triagem de seguranca.");
        }
    } catch (err) {
        alert("Erro na esteira de seguranca.");
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="pb-20 animate-fade-in relative max-w-4xl mx-auto">
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-[#c0c1ff]/5 rounded-full blur-[80px] pointer-events-none" />

      <header className="mb-8">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Editor & Publicador</h1>
        <p className="text-xs text-on-surface-variant font-medium">
          Interface de submissão. Configure os metadados e realize o upload do pacote técnico.
        </p>
      </header>

      <form onSubmit={handlePublishSubmit} className="bg-[#1d2022] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary text-xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>cloud_upload</span>
          <h2 className="font-bold text-white uppercase tracking-wider font-display text-xs">Especificações e Metadados</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-8 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Título do Lançamento</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Preço Comercial (R$)</label>
            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono">
              <option value="SLIDES">SLIDES</option>
              <option value="UI KIT">UI KIT</option>
              <option value="3D MODEL">3D MODEL</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Formato</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono">
              <option value="PPTX">PowerPoint (.pptx)</option>
              <option value="KEYNOTE">Keynote (.key)</option>
              <option value="FIGMA">Figma (.fig)</option>
              <option value="ZIP">Compactado (.zip)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Software</label>
            <input type="text" value={software} onChange={e => setSoftware(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Resumo da Vitrine</label>
          <input type="text" required maxLength={120} value={description} onChange={e => setDescription(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Descrição Completa</label>
          <textarea rows={4} required value={longDescription} onChange={e => setLongDescription(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none resize-none" />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold block">Recursos Principais</label>
          <div className="flex gap-2">
            <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} className="bg-[#101415] border border-white/10 focus:border-primary rounded-xl px-4 py-2 text-xs text-white font-mono flex-1 outline-none" />
            <button type="button" onClick={addFeature} className="bg-primary/20 text-primary border border-primary/20 px-4 rounded-xl text-xs font-mono font-bold">Adicionar</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feat, i) => (
              <span key={i} className="bg-white/5 border border-white/5 text-[10px] py-1 pl-3 pr-2 rounded-full inline-flex items-center gap-1.5 text-[#bac9cd] font-mono">
                {feat} <button type="button" onClick={() => removeFeature(i)} className="text-red-400 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold block">Imagem de Capa</label>
          <div className="grid grid-cols-4 gap-2">
            {imagePlaceholders.map((img, i) => (
              <button key={i} type="button" onClick={() => { setSelectedImg(img); setCustomImgUrl(''); }} className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${selectedImg === img && !customImgUrl ? 'border-primary shadow-[0_0_8px_#00e0ff]' : 'border-white/5 opacity-40 hover:opacity-100'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <input type="url" placeholder="URL da imagem customizada" value={customImgUrl} onChange={e => setCustomImgUrl(e.target.value)} className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none w-full" />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Pacote Técnico (.ZIP)</label>
          <div
            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-[#101415]/10 ${dragActive ? 'border-primary bg-primary/5' : actualFile ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-white/20'}`}
          >
            {actualFile ? (
              <div className="space-y-3">
                <span className="material-symbols-outlined text-2xl text-green-400">archive</span>
                <p className="text-xs font-bold text-white font-mono truncate">{actualFile.name}</p>
                <button type="button" onClick={() => setActualFile(null)} className="text-[10px] text-red-400 font-bold uppercase">Trocar arquivo</button>
              </div>
            ) : (
              <div>
                <span className="material-symbols-outlined text-4xl text-[#bac9cd]/30 mb-2 select-none">upload_file</span>
                <p className="text-xs font-bold text-white">Arraste seu arquivo ZIP aqui</p>
                <label className="mt-4 inline-block bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-mono font-bold text-primary cursor-pointer uppercase">
                  Selecionar <input type="file" accept=".zip" onChange={handleFileInput} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full font-black py-4 rounded-xl bg-primary text-black hover:scale-[1.01] shadow-[0_0_25px_rgba(0,224,255,0.4)] transition-all text-xs font-mono tracking-widest flex justify-center items-center gap-2 uppercase disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">{loading ? 'sync' : 'verified_user'}</span>
          {loading ? 'Processando...' : 'Publicar Ativo Técnico'}
        </button>
      </form>
    </div>
  );
}