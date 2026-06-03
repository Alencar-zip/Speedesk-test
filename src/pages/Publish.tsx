import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface PublishProps {
  products: Product[];
  onAddProduct: (product: Product, forceThreat?: boolean) => void;
  onUpdateProductStatus: (id: number, status: 'analyzing' | 'approved' | 'declined') => void;
  username: string;
  simulateMalware?: boolean;
}

export default function Publish({ onAddProduct, username, simulateMalware }: PublishProps) {
  const navigate = useNavigate();

  // Form states
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
  
  // Custom cover images (cyberpunk placeholders the user can pick or upload URL)
  const imagePlaceholders = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAuoEugjmSopUyUtAwG0-zss0p7RzRcvfHLOU0wx9imP7yj7Z57OHzUUq38ct7Nmrl2ZCcVFof79aVBjFpriVydBh_NFeGFnB5ilo7u85_SzuuHtKHczwZrfLGH6-4Feqimr7obtmqOCVrI8g2B7-lYcwvscuM0iDmnMqvjg5EMUsPDGr0c7PCPp0PxVUP7pa_LADIXbacjo1QE9GTx7a_S1oiKM9TjJMt_0WGL_RKkm5EgCDoNdPFEaRtLcz43Y7wTDBeU6ZFi6w",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCM1Hz1H6ynJIWJKCrOwNTXgYoI634qu_ys5SPkklO1NRVumHHTCLtXnsi2OpjVeocz0fvSji7Wyupu9VLO72T2xHCtIFZU3Uqh0WmBy_53ubXFWFSUDq3gthM5ahI33aiKsMhofdhVaMq7LeEuFojCxoxp5-L3j8rCz6wvaczWYBwKNmMh2ay_sFPiINZvm6vnqqqaP4ldpaRuHay00V96ISArZHyen1sb9vrPkeuP3_dDAzAPB7o8Ut4t7qicR21Qblwm84nNLA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSSDWhJHMgaYslQBn204xjhoYQlq9bv4_AVOI51RAyIwv6reQbS739I8FHeByarsWa_EkkGBkAY51mGjXABbMEl_D_n7tNvMrYTMxs8GIZOAdNKi3WMqZ_hqqF8kyve5FHtARjJaehJk1vRdtzVM9jsUSgm24E6Sz78s400oRpjh-UeEcaBIaFiXPEwSIqxe-jk3oqt3wlRamgfNO2MNlC6OgG5VnMmNpX2rrECm2yakMh-YMykkgXVQ0zkToL2ONNAqaEMMCfsg",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqSDtqw3mLx2D7OFa1K_aJtvLyKwcOD4rFdwAF4l5myLeX4EDRWrz8bwzu7CG6UZ5CNT0DAc34WdXJPrAl7qD7H_ViT830SKw_beNDhhdYIw5MIpJZCC5P6UWKGjT5CGH0UqDdzHB-at9DUA18ccYWcX7xjtJLUIM4Kzzi0EPJZOo-okuy3juS98-g84-2i61eTCvAotCuM3VyEnHWe1mZXmLJDDI5Q_5KzcnrcRDsVmz8eRCIPAIQncQV02H03lj9MYdsk17kg"
  ];
  const [selectedImg, setSelectedImg] = useState(imagePlaceholders[0]);
  const [customImgUrl, setCustomImgUrl] = useState('');

  // Features list
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([
    "Totalmente responsivo e customizável",
    "Tipos de dados vetoriais e gráficos",
    "Fontes inclusas e linkadas"
  ]);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedZip, setUploadedZip] = useState<{ name: string; size: string } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        setUploadedZip({ name: file.name, size: sizeMb });
        setSize(sizeMb);
      } else {
        alert("Erro: Apenas arquivos compactados no formato .ZIP são aceitos para análise Speedesk de segurança.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        setUploadedZip({ name: file.name, size: sizeMb });
        setSize(sizeMb);
      } else {
        alert("Erro: Apenas arquivos compactados no formato .ZIP são aceitos para análise Speedesk de segurança.");
      }
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

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedZip) {
      alert("Aviso: É obrigatório subir um arquivo ZIP contendo os layouts e arquivos do ativo para validação de segurança.");
      return;
    }

    const priceNum = parseFloat(price) || 0;
    const finalImg = customImgUrl.trim() || selectedImg;

    const newProduct: Product = {
      id: Date.now(),
      title: title || 'Ativo Sem Nome',
      format: format,
      price: priceNum,
      category: category.toLowerCase(),
      img: finalImg,
      creator: username,
      description: description || 'Sem descrição breve.',
      longDescription: longDescription || 'Sem detalhes longos fornecidos.',
      features: features.length > 0 ? features : ["Recurso padrão incluído"],
      specs: {
        resolution,
        software,
        size,
        updates: 'Gratuitas Vitalícias',
        slidesCount: format !== 'ZIP' ? slidesCount : undefined,
        fileFormat: format === 'PPTX' ? '.pptx' : format === 'KEYNOTE' ? '.key' : format === 'FIGMA' ? '.fig' : '.zip'
      },
      rating: 5.0,
      downloads: 0,
      views: 12,
      zipFileName: uploadedZip.name
    };

    // Analyze if the file or title contains malicious keys or if simulateMalware is toggled
    const isFileThreat = uploadedZip ? (
      uploadedZip.name.toLowerCase().includes('virus') || 
      uploadedZip.name.toLowerCase().includes('malware') || 
      uploadedZip.name.toLowerCase().includes('trojan') ||
      title.toLowerCase().includes('virus') ||
      title.toLowerCase().includes('malware') ||
      title.toLowerCase().includes('trojan')
    ) : false;

    const shouldSimulateThreat = !!simulateMalware || isFileThreat;

    // Add globally and kick off the API scan background process
    onAddProduct(newProduct, shouldSimulateThreat);

    // Redirect user to the Creator Panel to track progress in real-time
    navigate('/creator');
  };

  return (
    <div className="pb-20 animate-fade-in relative max-w-4xl mx-auto">
      {/* Background radial soft lights */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-[#c0c1ff]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Editor & Publicador</h1>
        <p className="text-xs text-on-surface-variant font-medium">
          Espaço Criador. Submeta novos arquivos de layout, configure as especificações comerciais e audite instantaneamente contra malwares.
        </p>
      </header>

      {/* SUBMISSION FORM */}
      <form onSubmit={handlePublishSubmit} className="bg-[#1d2022] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="material-symbols-outlined text-primary text-xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>cloud_upload</span>
          <h2 className="font-bold text-white uppercase tracking-wider font-display text-xs">Especificações Técnicas e Metadados</h2>
        </div>

        {/* Inputs: Title & Price */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-8 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Título do Lançamento</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Cyberpunk Keynote Deck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
            />
          </div>

          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Preço Comercial (R$)</label>
            <input 
              type="number" 
              required
              min="0"
              max="50000"
              placeholder="150"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
            />
          </div>
        </div>

        {/* Selects: Category, Format & Tooling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
            >
              <option value="SLIDES">SLIDES (Apresentação)</option>
              <option value="UI KIT">UI KIT (Design)</option>
              <option value="3D MODEL">3D MODEL (Assets)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Formato de Arquivo</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
            >
              <option value="PPTX">PowerPoint (.pptx)</option>
              <option value="KEYNOTE">Keynote (.key)</option>
              <option value="FIGMA">Figma (.fig)</option>
              <option value="ZIP">Compactado (.zip)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Software Compatível</label>
            <input 
              type="text" 
              required
              placeholder="Ex: PowerPoint / Blender 4.2"
              value={software}
              onChange={(e) => setSoftware(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
            />
          </div>
        </div>

        {/* Description fields */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Descrição Curta (Vitrine)</label>
          <input 
            type="text" 
            required
            maxLength={120}
            placeholder="Ex e sumário simples que aparece na vitrine do Marketplace."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all placeholder:text-[#bac9cd]/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Descrição Completa</label>
          <textarea 
            rows={4}
            required
            placeholder="Forneça os diferenciais técnicos do layout, esquemas de cores e organização das seções."
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all resize-none placeholder:text-[#bac9cd]/30"
          />
        </div>

        {/* Specs detail section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-white/5 bg-[#101415]/30">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-on-surface-variant uppercase font-bold">Resolução / Redimensionamento</label>
            <input 
              type="text"
              placeholder="Ex: 1920x1080 (16:9)"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-mono text-on-surface-variant uppercase font-bold">Quantidade de Telas / Slides</label>
            <input 
              type="text"
              placeholder="Ex: 35 slides"
              value={slidesCount}
              onChange={(e) => setSlidesCount(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none"
              disabled={format === 'ZIP'}
            />
          </div>
        </div>

        {/* Custom Features lists */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold block">Recursos Principais do Ativo</label>
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Ex: Inclui 50+ ícones vetoriais"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className="bg-[#101415] border border-white/10 focus:border-primary rounded-xl px-4 py-2 text-xs text-white font-mono flex-1 outline-none"
            />
            <button
              type="button"
              onClick={addFeature}
              className="bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 px-4 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all"
            >
              Adicionar
            </button>
          </div>

          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feat, index) => (
                <span 
                  key={index} 
                  className="bg-white/5 border border-white/5 text-[10px] py-1 pl-3 pr-2 rounded-full inline-flex items-center gap-1.5 text-[#bac9cd] font-mono"
                >
                  {feat}
                  <button 
                    type="button" 
                    onClick={() => removeFeature(index)} 
                    className="text-red-400 hover:text-red-300 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pick Image Cover */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold block">Capa de Apresentação (Imagem)</label>
          <div className="grid grid-cols-4 gap-2">
            {imagePlaceholders.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedImg(img);
                  setCustomImgUrl('');
                }}
                className={`aspect-video rounded-lg overflow-hidden border-2 relative transition-all ${
                  selectedImg === img && !customImgUrl ? 'border-primary shadow-[0_0_8px_rgba(0,224,255,0.4)] border-primary' : 'border-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Placeholder" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[9px] font-mono text-on-surface-variant uppercase">Ou cole o link de uma imagem customizada</span>
            <input 
              type="url"
              placeholder="https://exemplo.com/sua_capa.png"
              value={customImgUrl}
              onChange={(e) => setCustomImgUrl(e.target.value)}
              className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* DRAG AND DROP ZIP FILE UPLOAD */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Arquivo ZIP do Produto Comercial</label>
            <span className="text-[9px] font-mono text-primary font-bold bg-primary/10 tracking-widest px-2 py-0.5 rounded border border-primary/20">OBRIGATÓRIO</span>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-[#101415]/10 relative ${
              dragActive 
                ? 'border-primary bg-primary/5 text-primary' 
                : uploadedZip 
                  ? 'border-green-500/40 bg-green-500/5' 
                  : 'border-white/10 hover:border-white/20'
            }`}
          >
            {uploadedZip ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <span className="material-symbols-outlined text-2xl select-none">archive</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono truncate max-w-sm mx-auto">{uploadedZip.name}</h4>
                  <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Tamanho: {uploadedZip.size} • Pronto para auditoria heurística</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedZip(null)}
                  className="bg-[#272a2c] hover:bg-[#3b494c] text-xs text-white font-mono px-3 py-1 rounded-lg border border-white/5 transition-all text-[10px] uppercase font-bold"
                >
                  Trocar arquivo
                </button>
              </div>
            ) : (
              <div>
                <span className="material-symbols-outlined text-4xl text-[#bac9cd]/30 mb-2 select-none">upload_file</span>
                <h3 className="text-xs font-bold text-white leading-relaxed">Arraste seu arquivo .ZIP aqui</h3>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Formatos suportados: apenas pacotes compactados ZIP de até 500MB.</p>
                
                <label className="mt-4 inline-block bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:text-white px-4 py-2 rounded-xl text-[10px] font-mono font-bold text-primary transition-all cursor-pointer uppercase">
                  Escolher arquivo
                  <input 
                    type="file" 
                    accept=".zip"
                    onChange={handleFileInput}
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit and upload */}
        <button
          type="submit"
          className="w-full font-black py-4 rounded-xl bg-primary text-black hover:scale-101 shadow-[0_0_20px_rgba(0,224,255,0.25)] border-transparent cursor-pointer transition-all text-xs font-mono tracking-wider flex justify-center items-center gap-2 uppercase"
          id="publish-submit-btn"
        >
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          Publicar Layout & Iniciar Análise de IA
        </button>
      </form>
    </div>
  );
}
