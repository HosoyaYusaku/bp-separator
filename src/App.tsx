import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { 
  BrainCircuit, 
  Users, 
  User, 
  Play, 
  RefreshCw, 
  AlertCircle, 
  GripVertical, 
  Plus, 
  Trash2, 
  Printer, 
  ArrowDown, 
  FileJson, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Cpu, 
  ShieldCheck, 
  Wand2, 
  X, 
  Sparkles,
  Globe
} from 'lucide-react';

// --- Types ---
type Category = 'AI_OPTIMAL' | 'HYBRID' | 'HUMAN_ESSENTIAL';
type Language = 'ja' | 'en';

interface TaskItem {
  id: string;
  content: string;
}

interface AnalysisResult {
  task: string;
  category: Category;
  reason: string;
  prescription: string;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
}

// --- Constants (User Specified) ---
// 指定された内容を忠実に維持
const AI_MODELS: AIModel[] = [
  { 
    id: 'gemini-2.5-pro', 
    name: '賢いLLM (Gemini 2.5 Pro)', 
    description: '最高精度。複雑な文脈理解に最適です。' 
  },
  { 
    id: 'gemini-2.5-flash', 
    name: '普通のLLM (Gemini 2.5 Flash)', 
    description: '速度と精度のバランスに優れた標準モデルです。' 
  },
  { 
    id: 'gemini-2.5-flash-lite', 
    name: 'コスパ良いLLM (Gemini 2.5 Flash Lite)', 
    description: 'コストパフォーマンスと応答速度に優れたモデルです。' 
  },
];

const COLORS = {
  AI_OPTIMAL: {
    border: 'border-l-8 border-l-cyan-600 border-slate-200',
    bg: 'bg-white',
    badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    icon: <BrainCircuit className="w-5 h-5" />,
  },
  HYBRID: {
    border: 'border-l-8 border-l-amber-500 border-slate-200',
    bg: 'bg-white',
    badge: 'bg-amber-100 text-amber-900 border border-amber-200',
    icon: <Users className="w-5 h-5" />,
  },
  HUMAN_ESSENTIAL: {
    border: 'border-l-8 border-l-rose-600 border-slate-200',
    bg: 'bg-white',
    badge: 'bg-rose-100 text-rose-900 border border-rose-200',
    icon: <User className="w-5 h-5" />,
  }
};

const SAMPLE_CONTEXT_JA = "市民意識調査アンケートの実施業務";
const SAMPLE_TASKS_JA = [
  "調査項目の検討と決定",
  "アンケート用紙のデザイン作成",
  "印刷業者への発注",
  "配布対象者のリスト抽出",
  "封入と発送作業",
  "回答の回収とデータ入力",
  "集計結果のグラフ化",
  "報告書の執筆",
  "関係部署への報告会実施"
];

const SAMPLE_CONTEXT_EN = "Conducting a public opinion survey for citizens";
const SAMPLE_TASKS_EN = [
  "Discuss and decide survey questions",
  "Design the questionnaire layout",
  "Order printing from a vendor",
  "Extract the mailing list of residents",
  "Enclose and mail the surveys",
  "Collect responses and enter data",
  "Visualize results (create graphs)",
  "Write the final report",
  "Hold a briefing session for related departments"
];

// JSON Schema Definition for Gemini
const ANALYSIS_SCHEMA = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      task: { type: SchemaType.STRING },
      category: { 
        type: SchemaType.STRING, 
        enum: ["AI_OPTIMAL", "HYBRID", "HUMAN_ESSENTIAL"] 
      },
      reason: { type: SchemaType.STRING },
      prescription: { type: SchemaType.STRING }
    },
    required: ["task", "category", "reason", "prescription"]
  }
};

// --- Localization Dictionary ---
const TRANSLATIONS = {
  ja: {
    title: 'Process Separator',
    subtitle: '業務プロセス仕分け・最適化レポート',
    status_ready: 'READY',
    concept_title: 'AIは「魔法の杖」ではありません',
    concept_body: (
      <>
        このツールは、業務プロセスを<span className="font-bold text-cyan-700">「AI最適」</span><span className="font-bold text-amber-700">「協働」</span><span className="font-bold text-rose-700">「人間必須」</span>の3つに冷徹に仕分け（Separate）します。
        AIへの過度な期待を排し、現実的で地に足のついたBPR（業務改革）プランを提案します。
      </>
    ),
    security_badge: '高セキュリティ設計',
    security_detail: '入力データ・APIキーはサーバーへ保存されません。ブラウザからGoogleへ直接送信されます。',
    model_badge: '最適化モデル搭載',
    model_detail: '選択中のモデル:',
    config_title: 'System Configuration',
    api_label: 'Google Gemini API Key',
    api_warning: '⚠️ 共用PCでは使用後に削除してください',
    api_placeholder: 'APIキーを入力',
    model_label: 'AI Model Selection',
    context_title: '業務概要（コンテキスト）',
    sample_btn: 'サンプルを入力',
    context_placeholder: '例：全社キックオフミーティングの企画・運営業務',
    task_title: '業務フロー詳細',
    task_help: 'ドラッグで移動 / Enterで行追加',
    add_row: '行を追加',
    analyze_btn: '分析実行 (RUN ANALYSIS)',
    analyzing: '分析中 (ANALYZING)...',
    result_title: '分析完了',
    retry_btn: '修正して再実行',
    print_btn: 'レポート印刷',
    report_title: 'Analysis Report',
    target_work: '対象業務:',
    step: 'Step',
    analysis_header: '分析 (Context & Reason)',
    action_header: '処方箋 (Action)',
    // Categories
    cat_ai: 'AI最適 (AI_OPTIMAL)',
    cat_hybrid: '協働 (HYBRID)',
    cat_human: '人間必須 (HUMAN)',
    // Errors
    err_api: 'Gemini APIキーを入力してください。',
    err_task: 'タスクを少なくとも1つ入力してください。',
    err_general: '分析エラーが発生しました。',
    err_404: 'モデルが見つかりません。',
    // Model Translations (Fallback to original constant if used)
    models: {
       'gemini-2.5-pro': { name: '賢いLLM (Gemini 2.5 Pro)', desc: '最高精度。複雑な文脈理解に最適です。' },
       'gemini-2.5-flash': { name: '普通のLLM (Gemini 2.5 Flash)', desc: '速度と精度のバランスに優れた標準モデルです。' },
       'gemini-2.5-flash-lite': { name: 'コスパ良いLLM (Gemini 2.5 Flash Lite)', desc: 'コストパフォーマンスと応答速度に優れたモデルです。' },
    }
  },
  en: {
    title: 'Process Separator',
    subtitle: 'Business Process Separation & Optimization Report',
    status_ready: 'READY',
    concept_title: 'AI is NOT a "Magic Wand"',
    concept_body: (
      <>
        This tool strictly separates business processes into <span className="font-bold text-cyan-700">"AI_OPTIMAL"</span>, <span className="font-bold text-amber-700">"HYBRID"</span>, and <span className="font-bold text-rose-700">"HUMAN_ESSENTIAL"</span>.
        It eliminates excessive expectations for AI and proposes realistic BPR (Business Process Re-engineering) plans.
      </>
    ),
    security_badge: 'High Security Design',
    security_detail: 'Input data and API keys are NOT stored on the server. Sent directly from browser to Google.',
    model_badge: 'Optimization Model',
    model_detail: 'Selected Model:',
    config_title: 'System Configuration',
    api_label: 'Google Gemini API Key',
    api_warning: '⚠️ Remove after use on shared PCs',
    api_placeholder: 'Enter API Key',
    model_label: 'AI Model Selection',
    context_title: 'Business Context',
    sample_btn: 'Load Sample',
    context_placeholder: 'Ex: Planning and organizing a company-wide kickoff meeting',
    task_title: 'Workflow Details',
    task_help: 'Drag to reorder / Enter to add row',
    add_row: 'Add Row',
    analyze_btn: 'RUN ANALYSIS',
    analyzing: 'ANALYZING...',
    result_title: 'Analysis Complete',
    retry_btn: 'Modify & Retry',
    print_btn: 'Print Report',
    report_title: 'Analysis Report',
    target_work: 'Target Process:',
    step: 'Step',
    analysis_header: 'Analysis (Context & Reason)',
    action_header: 'Prescription (Action)',
    // Categories
    cat_ai: 'AI Optimal',
    cat_hybrid: 'Hybrid',
    cat_human: 'Human Essential',
    // Errors
    err_api: 'Please enter your Gemini API Key.',
    err_task: 'Please enter at least one task.',
    err_general: 'An analysis error occurred.',
    err_404: 'Model not found.',
    // Model Translations for English Mode
    models: {
       'gemini-2.5-pro': { name: 'Smart LLM (Gemini 2.5 Pro)', desc: 'Highest accuracy. Best for complex context understanding.' },
       'gemini-2.5-flash': { name: 'Standard LLM (Gemini 2.5 Flash)', desc: 'Balanced speed and accuracy standard model.' },
       'gemini-2.5-flash-lite': { name: 'Cost-effective LLM (Gemini 2.5 Flash Lite)', desc: 'Excellent cost performance and response speed.' },
    }
  }
};

// System Prompt Generator
const getSystemPrompt = (lang: Language) => `
You are a cold and logical BPR consultant.
Analyze the "Business Context" and "Task List" input by the user, and classify each task into the following three categories.

【Classification Criteria】
1. AI_OPTIMAL: Tasks that AI can complete quickly, such as rule-based processing, calculation, data processing, and drafting.
2. HYBRID: Tasks that require human judgment but where AI support (analysis, summarization, translation, detection) is effective.
3. HUMAN_ESSENTIAL: Tasks requiring final responsibility, physical work, high-level negotiation, or emotional care.

【Important: Context Completion】
Even if a task is just a single word (e.g., "printing", "distribution"), infer the specific work content from the "Business Context".

【Output Format】
${lang === 'ja' 
  ? '各タスクの `reason` と `prescription` は必ず【日本語】で出力してください。' 
  : 'Output `reason` and `prescription` for each task strictly in 【English】.'
}
`;

// --- Components ---

const TaskRow = ({ item, index, onUpdate, onDelete, onEnter, isLast, placeholder }: {
  item: TaskItem;
  index: number;
  onUpdate: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onEnter: (index: number) => void;
  isLast: boolean;
  placeholder: string;
}) => {
  const controls = useDragControls();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item.content === '' && isLast) { 
       inputRef.current?.focus();
    }
  }, []);

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={controls}
      className="relative flex items-center group mb-[-1px]"
    >
      <div 
        className="w-12 h-12 flex items-center justify-center bg-slate-100 border-2 border-slate-300 border-r-0 cursor-grab active:cursor-grabbing hover:bg-slate-200 transition-colors"
        onPointerDown={(e) => controls.start(e)}
      >
        <span className="text-xs font-mono text-slate-400 group-hover:hidden">{index + 1}</span>
        <GripVertical className="w-4 h-4 text-slate-500 hidden group-hover:block" />
      </div>

      <div className="flex-1 h-12 border-2 border-slate-300 bg-white focus-within:border-black focus-within:z-10 relative transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={item.content}
          onChange={(e) => onUpdate(item.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onEnter(index);
            }
            if (e.key === 'Backspace' && item.content === '' && (index > 0 || item.content === '')) {
               onDelete(item.id);
            }
          }}
          placeholder={`${placeholder} ${index + 1}`}
          className="w-full h-full px-4 outline-none text-slate-800 placeholder:text-slate-300 font-medium bg-transparent"
        />
      </div>

      <div className="absolute right-0 top-0 h-full flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
          title="Delete row"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('ja');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[1].id); // Default: gemini-2.5-flash
  const [context, setContext] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([{ id: '1', content: '' }]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  const handleAddTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index + 1, 0, { id: crypto.randomUUID(), content: '' });
    setTasks(newTasks);
  };

  const handleUpdateTask = (id: string, newContent: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, content: newContent } : t));
  };

  const handleDeleteTask = (id: string) => {
    if (tasks.length <= 1) {
        handleUpdateTask(id, '');
        return;
    }
    setTasks(tasks.filter(t => t.id !== id));
  };

  const loadSampleData = () => {
    if (lang === 'ja') {
      setContext(SAMPLE_CONTEXT_JA);
      setTasks(SAMPLE_TASKS_JA.map(t => ({ id: crypto.randomUUID(), content: t })));
    } else {
      setContext(SAMPLE_CONTEXT_EN);
      setTasks(SAMPLE_TASKS_EN.map(t => ({ id: crypto.randomUUID(), content: t })));
    }
  };

  const handleAnalyze = async () => {
    const validTasks = tasks.filter(t => t.content.trim() !== '').map(t => t.content);
    
    if (!apiKey) return setError(t.err_api);
    if (validTasks.length === 0) return setError(t.err_task);

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const model = genAI.getGenerativeModel({ 
        model: selectedModel,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ANALYSIS_SCHEMA
        }
      });
      
      const promptText = `
【Business Context】
${context || 'None specified'}

【Task List】
${validTasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}
      `;
      
      // Pass the language to getSystemPrompt to instruct AI language output
      const result = await model.generateContent([getSystemPrompt(lang), promptText]);
      const text = result.response.text();
      
      const parsedData = JSON.parse(text);
      setResults(parsedData);

    } catch (err: any) {
      console.error(err);
      let msg = t.err_general;
      if (err.message.includes('API key')) msg = t.err_api;
      else if (err.message.includes('404')) msg = `${t.err_404} (${selectedModel})`;
      else msg += ` (${err.message})`;
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 選択されたモデル情報を取得（元の定数から）
  const currentModelOriginal = AI_MODELS.find(m => m.id === selectedModel);
  
  // 翻訳辞書に該当IDがあればそちらを、なければ元の定数情報を使用
  // anyキャストで動的なキーアクセスを許可
  const translatedModel = (t.models as any)[selectedModel] || { name: currentModelOriginal?.name, desc: currentModelOriginal?.description };

  // Helper to get category label based on current language
  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case 'AI_OPTIMAL': return t.cat_ai;
      case 'HYBRID': return t.cat_hybrid;
      case 'HUMAN_ESSENTIAL': return t.cat_human;
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto p-6 md:p-12 print:max-w-none">
        
        {/* Header */}
        <header className="mb-8 border-b-4 border-black pb-6 flex items-end justify-between print:border-b-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileJson className="w-8 h-8 text-black" />
              <span className="bg-black text-white px-2 py-0.5 text-xs font-bold tracking-widest uppercase print:border print:border-black print:text-black print:bg-white">
                BPR Tool
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-black uppercase">
              {t.title}
            </h1>
            <p className="text-slate-600 font-medium mt-2 print:text-black">
              {t.subtitle}
            </p>

            {/* Language Switcher */}
            <div className="flex gap-2 mt-4 print:hidden">
                <div className="flex items-center bg-white border border-slate-300 rounded-md overflow-hidden p-1 shadow-sm">
                    <Globe className="w-4 h-4 text-slate-400 ml-2 mr-2" />
                    <button 
                        onClick={() => setLang('ja')}
                        className={`px-3 py-1 text-xs font-bold rounded-sm transition-all ${lang === 'ja' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        日本語
                    </button>
                    <button 
                        onClick={() => setLang('en')}
                        className={`px-3 py-1 text-xs font-bold rounded-sm transition-all ${lang === 'en' ? 'bg-black text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        English
                    </button>
                </div>
            </div>
          </div>
          
          <div className="text-right print:hidden">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Status</div>
            <div className="flex items-center justify-end space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-600 text-sm font-bold">{t.status_ready}</span>
            </div>
          </div>
        </header>

        {/* Concept & Security Card */}
        <div className="print:hidden mb-10 bg-white border-l-4 border-slate-700 shadow-lg rounded-r-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Concept Section */}
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-slate-400" />
                  <span className="border-b-2 border-slate-200 pb-1">{t.concept_title}</span>
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {t.concept_body}
                </p>
              </div>

              {/* Vertical Divider (Desktop only) */}
              <div className="hidden md:block w-px bg-slate-200 self-stretch"></div>

              {/* Security & System Info */}
              <div className="md:w-64 flex-shrink-0 flex flex-col justify-center space-y-4 text-sm">
                
                {/* Security Badge */}
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <div>
                      <span className="block font-bold text-slate-700">{t.security_badge}</span>
                      <p className="text-xs text-slate-500 mt-1 leading-tight">
                        {t.security_detail}
                      </p>
                   </div>
                </div>

                {/* Model Info Badge */}
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full">
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <div>
                      <span className="block font-bold text-slate-700">{t.model_badge}</span>
                      <p className="text-xs text-slate-500 mt-1 leading-tight">
                          {t.model_detail} {translatedModel.name}
                      </p>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="print:hidden space-y-8">
            
            {/* Configuration Panel */}
            <div className="bg-slate-50 p-6 border-2 border-slate-200 rounded-sm shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-slate-700" />
                  <h2 className="font-bold text-slate-700 uppercase tracking-wider">{t.config_title}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* API Key */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                        {t.api_label}
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 normal-case font-normal">
                          {t.api_warning}
                        </span>
                    </label>
                    <div className="relative">
                      <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={t.api_placeholder}
                          className="w-full bg-white border border-slate-300 px-4 py-2 text-sm outline-none focus:border-black transition-colors font-mono pr-10"
                      />
                      {apiKey && (
                        <button 
                          onClick={() => setApiKey('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Clear API Key"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                        {t.model_label}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-white border border-slate-300 px-4 py-2 text-sm outline-none focus:border-black transition-colors appearance-none cursor-pointer font-medium"
                      >
                        {AI_MODELS.map(model => (
                          <option key={model.id} value={model.id}>
                            {/* 表示テキストを言語設定に合わせて切り替え */}
                            {(t.models as any)[model.id]?.name || model.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ArrowDown className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {translatedModel.desc}
                    </p>
                  </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
            {!results && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                >
                    {/* Context Input */}
                    <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-sm">
                        <div className="flex justify-between items-center mb-4">
                           <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {t.context_title}
                            </h2>
                            <button 
                                onClick={loadSampleData}
                                className="text-xs flex items-center gap-1 text-cyan-700 hover:text-cyan-900 font-bold bg-cyan-50 px-3 py-1 rounded border border-cyan-200 hover:bg-cyan-100 transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                                {t.sample_btn}
                            </button>
                        </div>
                        <input 
                            type="text" 
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder={t.context_placeholder}
                            className="w-full border-2 border-slate-200 px-4 py-3 outline-none focus:border-black transition-colors placeholder:text-slate-300"
                        />
                    </div>

                    {/* Task List */}
                    <div className="bg-white shadow-xl border border-slate-200 rounded-sm overflow-hidden">
                        <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex items-center justify-between">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                <ArrowDown className="w-4 h-4" />
                                {t.task_title}
                            </h2>
                            <span className="text-xs text-slate-500">{t.task_help}</span>
                        </div>
                        
                        <div className="p-4 bg-slate-50/50">
                            <Reorder.Group axis="y" values={tasks} onReorder={setTasks}>
                                {tasks.map((task, index) => (
                                    <TaskRow
                                        key={task.id}
                                        item={task}
                                        index={index}
                                        onUpdate={handleUpdateTask}
                                        onDelete={handleDeleteTask}
                                        onEnter={handleAddTask}
                                        isLast={index === tasks.length - 1}
                                        placeholder={lang === 'ja' ? 'タスク' : 'Task'}
                                    />
                                ))}
                            </Reorder.Group>
                            
                            <button
                                onClick={() => handleAddTask(tasks.length - 1)}
                                className="mt-2 w-full py-3 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-medium rounded-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t.add_row}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 font-medium">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="relative overflow-hidden group bg-black text-white px-8 py-4 font-bold text-lg tracking-wide hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg active:translate-y-0.5"
                        >
                            <span className="relative z-10 flex items-center">
                                {isAnalyzing ? t.analyzing : t.analyze_btn}
                                {!isAnalyzing && <Play className="w-5 h-5 ml-2 fill-white" />}
                            </span>
                        </button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Loading Indicator */}
        {isAnalyzing && (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-6"></div>
                <p className="font-mono text-lg tracking-widest text-slate-500 animate-pulse">{t.analyzing}</p>
            </div>
        )}

        {/* Results View */}
        {results && !isAnalyzing && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between print:hidden bg-slate-100 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-600">{t.result_title}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setResults(null);
                                setError(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t.retry_btn}
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center px-4 py-2 text-sm font-bold text-white bg-black hover:bg-slate-800 shadow-sm transition-colors"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {t.print_btn}
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 print:block print:gap-0">
                    <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-black uppercase">{t.report_title}</h2>
                                {context && <p className="text-lg font-bold mt-1">{t.target_work} {context}</p>}
                                <p className="text-sm text-slate-500 mt-1">AI Model: {translatedModel.name}</p>
                            </div>
                            <p className="text-sm text-slate-600">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {results.map((result, index) => {
                        const style = COLORS[result.category];
                        return (
                            <div 
                                key={index} 
                                className={`
                                    relative bg-white p-6 shadow-md mb-6 break-inside-avoid
                                    border-2 border-slate-200 ${style.border}
                                    print:border-2 print:border-black print:shadow-none print:mb-4
                                `}
                            >
                                <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-4 print:border-black print:border-dashed">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${style.badge} print:border print:border-black print:bg-white print:text-black`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">
                                                {t.step} {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-900 print:text-black">
                                                {result.task}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className={`
                                        px-3 py-1 rounded text-xs font-bold tracking-wide uppercase
                                        ${style.badge}
                                        print:border print:border-black print:bg-white print:text-black
                                    `}>
                                        {getCategoryLabel(result.category)}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
                                    <div className="print:border-r print:border-slate-300 print:pr-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center print:text-black">
                                            <div className="w-1.5 h-1.5 bg-slate-400 mr-2 rounded-full print:bg-black"></div>
                                            {t.analysis_header}
                                        </h4>
                                        <p className="text-sm leading-relaxed font-medium text-slate-700 print:text-black">
                                            {result.reason}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-cyan-600 uppercase mb-2 flex items-center print:text-black">
                                            <CheckCircle2 className="w-3 h-3 mr-2" />
                                            {t.action_header}
                                        </h4>
                                        <p className="text-sm leading-relaxed font-medium text-slate-900 print:text-black">
                                            {result.prescription}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        )}
      </div>
    </div>
  );
}