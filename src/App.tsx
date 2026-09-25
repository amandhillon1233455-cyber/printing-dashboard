import React, { useState } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Modal } from './components/Modal';
import { UploadZone } from './components/UploadZone';
import { PrintOrderForm } from './components/PrintOrderForm';
import { DocumentPreview } from './components/DocumentPreview';
import { DocumentRecord, PrintOrder } from './services/api';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { OrdersPage } from './pages/OrdersPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { showToast } = useToast();

  // Navigation State
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload & Order Creation Modal Flow
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<'upload' | 'configure'>('upload');
  const [activeDocumentForOrder, setActiveDocumentForOrder] = useState<DocumentRecord | null>(null);

  // Cross-page state (e.g. passing doc to AI assistant)
  const [aiDocContextId, setAiDocContextId] = useState<string | undefined>(undefined);

  const handleGetStarted = () => {
    setViewMode('app');
    setCurrentTab('dashboard');
  };

  const handleOpenUploadModal = () => {
    setActiveDocumentForOrder(null);
    setUploadStep('upload');
    setIsUploadModalOpen(true);
  };

  const handleDocumentUploaded = (doc: DocumentRecord) => {
    setActiveDocumentForOrder(doc);
    setUploadStep('configure');
  };

  const handleOrderCreated = (order: PrintOrder) => {
    setIsUploadModalOpen(false);
    setActiveDocumentForOrder(null);
    setUploadStep('upload');
    setCurrentTab('orders');
    showToast(`Order ${order.order_id} added to spooler!`, 'success');
  };

  const handleSelectDocumentForOrder = (doc: DocumentRecord) => {
    setActiveDocumentForOrder(doc);
    setUploadStep('configure');
    setIsUploadModalOpen(true);
  };

  const handleSelectDocumentForAI = (doc: DocumentRecord) => {
    setAiDocContextId(doc.document_id);
    setCurrentTab('assistant');
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onExploreFeatures={() => {
          const el = document.getElementById('features');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    );
  }

  const pageTitles: Record<NavTab, string> = {
    dashboard: 'Dashboard Overview',
    documents: 'Document Repository',
    orders: 'Print Orders',
    assistant: 'AI Assistant',
    knowledge: 'Knowledge Base',
    analytics: 'Analytics & Reporting',
    settings: 'Settings & Integrations',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={pageTitles[currentTab]}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenUpload={handleOpenUploadModal}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onOpenUpload={handleOpenUploadModal}
              onNavigateToAssistant={() => setCurrentTab('assistant')}
              onNavigateToOrders={() => setCurrentTab('orders')}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsPage
              onOpenUpload={handleOpenUploadModal}
              onSelectDocumentForOrder={handleSelectDocumentForOrder}
              onSelectDocumentForAI={handleSelectDocumentForAI}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersPage
              onOpenUpload={handleOpenUploadModal}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'assistant' && (
            <AIAssistantPage initialDocumentId={aiDocContextId} />
          )}

          {currentTab === 'knowledge' && <KnowledgeBasePage />}

          {currentTab === 'analytics' && <AnalyticsPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Document Upload & Order Creation Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={uploadStep === 'upload' ? 'Upload Document for Printing' : 'Configure Print Specifications'}
        subtitle={
          uploadStep === 'upload'
            ? 'Drag and drop your PDF or office file (maximum 10 MB)'
            : 'Specify copies, paper size, color mode, duplex conservation, and queue priority.'
        }
        maxWidth={uploadStep === 'configure' ? 'xl' : 'lg'}
      >
        {uploadStep === 'upload' ? (
          <UploadZone
            onDocumentUploaded={handleDocumentUploaded}
            onCancel={() => setIsUploadModalOpen(false)}
          />
        ) : (
          activeDocumentForOrder && (
            <PrintOrderForm
              document={activeDocumentForOrder}
              onOrderCreated={handleOrderCreated}
              onCancel={() => {
                setUploadStep('upload');
                setActiveDocumentForOrder(null);
              }}
            />
          )
        )}
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
