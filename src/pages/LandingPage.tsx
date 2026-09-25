import React from 'react';
import {
  ArrowRight,
  UploadCloud,
  Printer,
  Bot,
  Database,
  Workflow,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import heroImg from '../assets/images/hero_print_management_1790295928260.jpg';
import kioskImg from '../assets/images/smart_kiosk_preview_1790295952463.jpg';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
}

const FEATURES = [
  {
    icon: UploadCloud,
    title: 'Smart Document Upload',
    description: 'Instant client & drag-drop file validation for PDF, DOCX, JPG, and PNG with strict 10 MB boundary controls.',
  },
  {
    icon: Printer,
    title: 'Print Order Management',
    description: 'Fine-grained configuration for copies, paper size, duplex conservation discounts, and priority queue dispatch.',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Gemini 3.8 Flash integrated assistant answering printing queries, document summarization, and spooling status.',
  },
  {
    icon: Database,
    title: 'RAG Knowledge Base',
    description: 'Context-grounded retrieval from approved campus pricing policies, paper specifications, and refund guidelines.',
  },
  {
    icon: Workflow,
    title: 'n8n Automation',
    description: 'Real-time event webhooks dispatched on status change (Pending → Processing → Ready → Completed) for external alerts.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Live operational metrics tracking print volume, paper size distribution, daily throughput, and cost audits.',
  },
];

const WORKFLOW_STEPS = [
  { step: '01', title: 'Upload', desc: 'Securely upload PDF or documents with instant pre-validation.' },
  { step: '02', title: 'Configure', desc: 'Set copies, A4/A3 sizes, monochrome or color, and duplex mode.' },
  { step: '03', title: 'Order', desc: 'Generate unique Order ID and save directly into MongoDB persistence.' },
  { step: '04', title: 'Track', desc: 'Monitor live spooler status with n8n automated webhook notifications.' },
  { step: '05', title: 'Complete', desc: 'Collect authenticated prints from campus station or cyber café desk.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onExploreFeatures }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-100 sticky top-0 z-40 bg-white/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs">
              P
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PrintAI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-medium text-blue-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Centralized Printing Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
              Smart Printing Management with AI
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Upload documents, create print orders, track jobs, and get AI-powered printing assistance. Tailored for colleges, enterprise offices, and modern print-service kiosks.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Explore Features
              </button>
            </div>

            {/* Quick Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Gemini 3.8 Flash RAG
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                MongoDB Atlas Ready
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                n8n Webhook Integration
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 aspect-16/9 lg:aspect-4/3 relative">
              <img
                src={heroImg}
                alt="PrintAI Smart Workspace"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <p className="text-xs font-mono uppercase tracking-widest text-blue-400">
                    High-Velocity Spooler Engine
                  </p>
                  <p className="text-sm font-bold">
                    Connected to 4 Laser Stations · 12 ms Average Queue Latency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Modern Print Operations
            </h2>
            <p className="text-sm text-slate-600">
              Everything required to orchestrate high-yield printing, automated student quotas, and verified RAG document inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
              Operational Lifecycle
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Seamless 5-Step Print Execution
            </h2>
            <p className="text-sm text-slate-600">
              From drag-and-drop ingestion to n8n dispatch and physical collection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {WORKFLOW_STEPS.map((wf, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2 relative"
              >
                <span className="text-2xl font-extrabold font-mono text-blue-600 block">
                  {wf.step}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{wf.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{wf.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-blue-200">
                <img src={kioskImg} alt="Kiosk Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Autonomous Campus Kiosks</h4>
                <p className="text-xs text-slate-600">
                  Ready for direct QR pickup releases with our touch terminal client.
                </p>
              </div>
            </div>
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Open Management Console
            </button>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-semibold text-slate-800">PrintAI Platform</span>
            <span>·</span>
            <span>Version 1.0.0</span>
          </div>

          <div className="flex items-center gap-6">
            <span>FastAPI & Express Full-Stack</span>
            <span>·</span>
            <span>Google Gemini 3.8 Flash</span>
            <span>·</span>
            <span>MongoDB Atlas</span>
            <span>·</span>
            <span>n8n Webhook</span>
          </div>

          <div>
            © {new Date().getFullYear()} PrintAI Core Operations. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
