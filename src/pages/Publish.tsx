import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface PublishProps {
  products: Product[];
  onAddProduct: (product: Product, forceThreat?: boolean) => void;
  onUpdateProductStatus: (id: number | string, status: 'analyzing' | 'approved' | 'declined') => void;
  username: string;
}

export default function Publish({ onAddProduct, username }: PublishProps) {
  const navigate = useNavigate();

  // 1. ESTADOS DO FORMULÁRIO
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SLIDES');
  const [format, setFormat] = useState('PPTX');
  const [price, setPrice] = useState('150');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [software, setSoftware] = useState('PowerPoint');
  const [resolution, setResolution] = useState('1920x1080 (16:9)');
  const [slidesCount, setSlidesCount] = useState('30');
  
  // 2. SISTEMA DE IMAGEM DE CAPA
  const imagePlaceholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuoEugjmSopUyUtAwG0-zss0p7RzRcvfHLOU0wx9imP7yj7Z57OHzUUq38ct7Nmrl2ZCcVFof79aVBjFpriVydBh_NFeGFnB5ilo7u85_SzuuHtKHczwZrfLGH6-4Feqimr7obtmqOCVrI8g2B7-lYcwvscuM0iDmnMqvjg5EMUsPDGr0c7PCPp0PxVUP7pa_LADIXbacjo1QE9GTx7a_S1oiKM9TjJMt_0WGL_RKkm5EgCDoNdPFEaRtLcz43Y7wTDBeU6ZFi6w",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCM1Hz1H6ynJIWJKCrOwNTXgYoI634qu_ys5SPkklO1NRVumHHTCLtXnsi2OpjVeocz0fvSji7Wyupu9VLO72T2xHCtIFZU3Uqh0WmBy_53ubXFWFSUDq3gthM5ahI33aiKsMhofdhVaMq7LeEuFojCxoxp5-L3j8rCz6wvaczWYBwKNmMh2ay_sFPiINZvm6vnqqqaP4ldpaRuHay00V96ISArZHyen1sb9vrPkeuP3_dDAzAPB7o8Ut4t7qicR21Qblwm84nNLA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSSDWhJHMgaYslQBn204xjhoYQlq9bv4_AVOI51RAyIwv6reQbS739I8FHeByarsWa_EkkGBkAY51mGjXABbMEl_D_n7tNvMrYTMxs8GIZOAdNKi3WMqZ_hqqF8kyve5FHtARjJaehJk1vRdtzVM9jsUSgm24E6Sz78s400oRpjh-UeEcaBIaFiXPEwSIqxe-jk3oqt3wlRamgfNO2MNlC6OgG5VnMmNpX2rrECm2yakMh-YMykkgXVQ0zkToL2ONNAqaEMMCfsg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqSDtqw3mLx2D7OFa1K_aJtvLyKwcOD4rFdwAF4l5myLeX4EDRWrz8bwzu7CG6UZ5CNT0DAc34WdXJPrAl7qD7H_ViT830SKw_beNDhhdYIw5MIpJZCC5P6UWKGjT5CGH0UqDdzHB-at9DUA18ccYWcX7xjtJLUIM4Kzzi0EPJZOo-okuy3juS98-g84-2i61eTCvAotCuM3VyEnHWe1mZXmLJDDI5Q_5KzcnrcRDsVmz8eRCIPAIQncQV02H03lj9MYdsk17kg"
  ];
  const [selectedImg, setSelectedImg] = useState(imagePlaceholders[0]);
  const [customImgUrl, setCustomImgUrl] = useState('');

  // 3. RECURSOS (TAGS)
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>(["Totalmente responsivo", "Vetor incluso"]);

  const addFeature = () => { if (featureInput.trim()) { setFeatures([...features, featureInput.trim()]); setFeatureInput(''); } };
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));

  // 4. ESTADOS DE UPLOAD REAL
  const [dragActive, setDragActive] = useState(false);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setActualFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setActualFile(e.target.files[0]);
    }
  };

  // 5. SUBMISSÃO PARA O ECOSSISTEMA
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualFile) return alert("Aviso: Anexe o arquivo ZIP do produto para continuar.");

    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return alert("Erro: Faca login novamente para publicar.");

      // 1. Upload do arquivo para o Storage
      const fileName = `${Date.now()}-${actualFile.name.replace(/\s+/g, '_')}`;
      const { error: storageError } = await supabase.storage.from('assets').upload(fileName, actualFile);
      if (storageError) throw storageError;

      // 2. Cálculo inteligente de tamanho (Resolve erro de 0.0 MB)
      const bytes = actualFile.size;
      const sizeFormatted = bytes < 1024 * 1024 
        ? (bytes / 1024).toFixed(1) + " KB" 
        : (bytes / (1024 * 1024)).toFixed(1) + " MB";

      // 3. Chamada ao Servidor para criar na Stripe e no Banco
      const finalImg = customImgUrl.trim() || selectedImg;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';

      const response = await fetch(`${API_URL}/api/products/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price,
          description,
          userId: user.id,
          category: category.toLowerCase(),
          img: finalImg,
          format,
          features,
          file_path: fileName, // Enviando caminho para o banco
          specs: { 
            resolution, 
            software, 
            size: sizeFormatted, 
            updates: 'Vitalicias', 
            slidesCount 
          }
        })
      });

      if (!response.ok) throw new Error("Falha na sincronizacao financeira.");

      const dbProduct = await response.json();
      onAddProduct(dbProduct);
      alert("Sucesso: Ativo publicado no ecossistema.");
      navigate('/creator');

    } catch (err: any) {
      alert("Falha na publicacao: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in relative max-w-4xl mx-auto">
      {/* Design System: Background lights */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[#c0c1ff]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="mb-10">
        <h1 className="text-4xl font-black text-primary font-display tracking-tighter mb-2">Editor & Publicador</h1>
        <p className="text-xs text-on-surface-variant font-medium">Configure os metadados técnicos e realize o upload do pacote para triagem.</p>
      </header>

      <form onSubmit={handlePublishSubmit} className="bg-[#1d2022] border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 flex flex-col gap-2">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Título do Ativo</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white focus:border-primary outline-none transition-all" placeholder="Ex: Deck Minimalista v2" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Preço (R$)</label>
            <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white focus:border-primary outline-none transition-all font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white outline-none">
              <option value="SLIDES">SLIDES</option>
              <option value="UI KIT">UI KIT</option>
              <option value="3D MODEL">3D MODEL</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Formato</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white outline-none">
              <option value="PPTX">PowerPoint</option>
              <option value="KEYNOTE">Keynote</option>
              <option value="FIGMA">Figma</option>
              <option value="ZIP">Pacote ZIP</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Software Base</label>
            <input type="text" value={software} onChange={e => setSoftware(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Descrição Curta</label>
          <input type="text" maxLength={120} value={description} onChange={e => setDescription(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white outline-none" placeholder="Breve resumo comercial..." />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Descrição Detalhada</label>
          <textarea rows={4} value={longDescription} onChange={e => setLongDescription(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-4 text-xs text-white outline-none resize-none" placeholder="Explique os diferenciais técnicos..." />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold block tracking-widest">Recursos Principais</label>
          <div className="flex gap-2">
            <input type="text" value={featureInput} onChange={e => setFeatureInput(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white flex-1 outline-none focus:border-primary" placeholder="Adicionar recurso..." />
            <button type="button" onClick={addFeature} className="bg-primary/20 text-primary px-6 rounded-2xl text-[10px] font-bold uppercase border border-primary/30">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span key={i} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2">
                {f} <button type="button" onClick={() => removeFeature(i)} className="text-red-400 font-black hover:text-red-300">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Imagem de Capa</label>
            <div className="grid grid-cols-2 gap-2">
              {imagePlaceholders.map((img, i) => (
                <button key={i} type="button" onClick={() => {setSelectedImg(img); setCustomImgUrl('')}} className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${selectedImg === img && !customImgUrl ? 'border-primary shadow-[0_0_10px_#00e0ff]' : 'border-white/5 opacity-50'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input type="url" placeholder="Ou cole a URL de uma imagem externa" value={customImgUrl} onChange={e => setCustomImgUrl(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none" />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Pacote Técnico (.ZIP)</label>
            <div 
              onDragOver={handleDrag} onDragEnter={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
              className={`h-[150px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all bg-[#101415]/30 ${dragActive ? 'border-primary bg-primary/5' : actualFile ? 'border-green-500/40' : 'border-white/10 hover:border-white/20'}`}
            >
              <input type="file" accept=".zip" onChange={handleFileInput} className="hidden" id="zip-upload" />
              <label htmlFor="zip-upload" className="cursor-pointer text-center p-4">
                <span className="material-symbols-outlined text-3xl text-primary mb-2">upload_file</span>
                <p className="text-[10px] font-bold uppercase tracking-wider">{actualFile ? actualFile.name : "Clique ou Arraste o arquivo"}</p>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-[0_0_30px_rgba(0,224,255,0.4)] hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-[3px] text-xs disabled:opacity-50">
          {loading ? 'Sincronizando com a Nuvem...' : 'Publicar Ativo & Gerar Triagem'}
        </button>
      </form>
    </div>
  );
}