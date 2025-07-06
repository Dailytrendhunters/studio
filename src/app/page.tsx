'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Database, Download, RefreshCw, CheckCircle, MessageSquare, ArrowDown, Upload, Zap, Loader2 } from 'lucide-react';
import { storeExtractionResult, getProcessedDocuments } from './actions';

// Sample data for demonstration
const SAMPLE_DATA = {
  metadata: {
    title: "Sample Financial Report",
    pages: 5,
    actualPagesDetected: 5,
    pagesProcessed: 5,
    fileSize: 2048576,
    processingTime: 3200,
    documentType: "Financial Report",
    confidence: 0.95,
    pageCountMethod: "Library Extraction",
    extractedAt: new Date().toISOString()
  },
  content: {
    text: "This is a sample financial document with revenue data, expense reports, and balance sheet information...",
    tables: [
      {
        id: "table_1",
        title: "Revenue Summary",
        headers: ["Quarter", "Revenue", "Growth"],
        rows: [
          ["Q1 2023", "$1.2M", "15%"],
          ["Q2 2023", "$1.4M", "18%"],
          ["Q3 2023", "$1.6M", "22%"]
        ],
        page: 2
      }
    ],
    financialData: [
      {
        id: "financial_1",
        type: "revenue",
        label: "Total Revenue",
        value: 4200000,
        currency: "USD",
        period: "2023",
        page: 1
      },
      {
        id: "financial_2",
        type: "expense",
        label: "Operating Expenses",
        value: 2800000,
        currency: "USD",
        period: "2023",
        page: 3
      }
    ],
    sections: [
      {
        id: "section_1",
        title: "Executive Summary",
        content: "Overview of financial performance...",
        page: 1,
        type: "header"
      }
    ],
    pageBreakdown: [
      { pageNumber: 1, text: "Executive Summary content...", wordCount: 250, hasTable: false, hasFinancialData: true, confidence: 0.98 },
      { pageNumber: 2, text: "Revenue analysis...", wordCount: 320, hasTable: true, hasFinancialData: true, confidence: 0.96 },
      { pageNumber: 3, text: "Expense breakdown...", wordCount: 280, hasTable: false, hasFinancialData: true, confidence: 0.94 },
      { pageNumber: 4, text: "Balance sheet...", wordCount: 310, hasTable: true, hasFinancialData: false, confidence: 0.97 },
      { pageNumber: 5, text: "Conclusions...", wordCount: 180, hasTable: false, hasFinancialData: false, confidence: 0.93 }
    ]
  }
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type ResultTabId = 'overview' | 'pages' | 'tables' | 'financial' | 'chat' | 'full' | 'history';

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<ResultTabId>('overview');
  const [isDragOver, setIsDragOver] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load processed documents on component mount
  useEffect(() => {
    loadProcessedDocuments();
  }, []);

  const loadProcessedDocuments = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await getProcessedDocuments();
      if (result.success) {
        setProcessedDocuments(result.documents);
      } else {
        console.error('Failed to load documents:', result.error);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    setExtractedData(null);
    setChatHistory([]);
    setProcessingStep('Uploading and preparing your document...');
    setIsChatActive(false);
    setActiveResultTab('overview');

    try {
      // Simulate processing steps
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingStep('AI is analyzing your document. This may take a moment for large files...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProcessingStep('Finalizing structured JSON output...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data for demonstration
      const processedData = {
        ...SAMPLE_DATA,
        metadata: {
          ...SAMPLE_DATA.metadata,
          title: file.name,
          fileSize: file.size,
          processingTime: 3200,
          extractedAt: new Date().toISOString()
        }
      };
      
      setExtractedData(processedData);
      setChatHistory([
        { role: 'assistant', content: "I've finished processing your document. What would you like to know? Ask me anything about its content." }
      ]);

      // Store in Supabase
      setProcessingStep('Saving results to database...');
      const storeResult = await storeExtractionResult(
        file.name,
        file.size,
        processedData,
        3200,
        0.95,
        5
      );

      if (storeResult.success) {
        console.log('✅ Document stored in Supabase with ID:', storeResult.id);
        // Reload the documents list
        await loadProcessedDocuments();
      } else {
        console.error('❌ Failed to store document:', storeResult.error);
      }

    } catch (err: any) {
      console.error('PDF processing error:', err);
      setError(err.message || 'An unexpected error occurred during processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file: File) => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileSelect(pdfFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleFileSelect(file);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!extractedData || !message.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newHistory);
    setIsChatting(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = `Based on the document content, I can see that ${message.toLowerCase().includes('revenue') ? 'the total revenue for 2023 was $4.2M with strong growth across quarters' : message.toLowerCase().includes('expense') ? 'operating expenses were $2.8M in 2023' : 'the document contains comprehensive financial data across 5 pages with high confidence scores'}. Is there anything specific you'd like me to elaborate on?`;
      
      setChatHistory([...newHistory, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory([...newHistory, { role: 'assistant', content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
    setProcessingStep('');
    setChatHistory([]);
    setIsChatActive(false);
    setActiveResultTab('overview');
  };

  const features = [
    {
      icon: FileText,
      title: 'Smart PDF Reading',
      description: 'Advanced OCR and text extraction from any PDF document'
    },
    {
      icon: Database,
      title: 'Table Detection',
      description: 'Automatically identifies and extracts tabular data with precision'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Chat',
      description: "Ask questions and get answers directly from your document's content."
    },
    {
      icon: Download,
      title: 'JSON Export',
      description: 'Clean, structured JSON output ready for integration'
    }
  ];

  const getCtaText = () => {
    if (isProcessing) {
      return "Once your document is processed, you can chat with it here.";
    }
    if (extractedData) {
      return "Your document is ready! Start a conversation now.";
    }
    return "First, upload and process your PDF document. This button will unlock, allowing you to start an interactive conversation.";
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="group flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg">
                <FileText className="w-6 h-6 text-white transition-transform duration-300 group-hover:animate-spin-once" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PDF to JSON</h1>
                <p className="text-sm text-muted-foreground">Intelligent Document Converter</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {extractedData && (
                <button
                  onClick={resetApp}
                  className="group px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all shadow-lg hover:shadow-primary/80 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                  Process New File
                </button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${
                  isProcessing ? 'bg-yellow-500 animate-pulse' : extractedData ? 'bg-green-500' : 'bg-primary'
                }`}></div>
                <span>
                  {isProcessing ? 'Processing...' : extractedData ? 'Complete' : 'Ready to process'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        
        {/* Step 1: Uploader or Processing Status */}
        {!extractedData && !isProcessing && (
          <>
            <div className="text-center mb-16">
              <div className="relative inline-block">
                 <h2 className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-[length:400%_400%] bg-clip-text text-4xl font-bold text-transparent animate-gradient-pan sm:text-5xl">
                  Transform Your Financial PDFs
                  <br />
                  Into Smart JSON
                </h2>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent bg-[length:200%_100%] bg-no-repeat animate-shine mix-blend-color-dodge [background-position:200%_0]"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature) => (
                <div key={feature.title} className="group bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-2xl hover:shadow-primary/80 hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:animate-spin-once" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
            
            {/* File Upload */}
            <div className="w-full max-w-2xl mx-auto">
              <div
                className={`group/zone relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragOver
                    ? 'border-primary bg-primary/10 scale-105 shadow-2xl shadow-primary/80'
                    : 'border-border bg-card hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/80'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessing}
                />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
                    {isDragOver ? (
                      <FileText className="w-10 h-10 text-primary" />
                    ) : (
                      <Upload className="w-10 h-10 text-muted-foreground transition-transform duration-300 group-hover/zone:animate-spin-once" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xl font-semibold text-foreground">
                      {isDragOver ? 'Drop your PDF here!' : 'Upload Financial PDF'}
                    </p>
                    <p className="text-muted-foreground">
                      {isDragOver 
                        ? 'Release to start intelligent processing' 
                        : 'Drag and drop your financial document or click to browse'
                      }
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground/80">
                      <span>• PDF files only</span>
                      <span>• Up to 50MB</span>
                      <span>• Secure processing</span>
                    </div>
                  </div>
                  
                  <button
                    className="group/button inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50"
                    disabled={isProcessing}
                  >
                    <FileText className="w-5 h-5 transition-transform duration-300 group-hover/button:animate-spin-once" />
                    {isProcessing ? 'Processing...' : 'Choose PDF File'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Processing Document
              </h3>
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                  <FileText className="w-4 h-4" />
                  <span>{selectedFile?.name}</span>
              </div>
              
              <div className="w-full bg-secondary/20 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>

              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>{processingStep}</span>
              </div>
            </div>
          </div>
        )}
        
        {extractedData && (
          <div className="text-center my-12 animate-in fade-in-0 duration-500">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full mb-4 border-2 border-primary/20">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Document Processed!</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Your document has been successfully analyzed and stored in Supabase.
            </p>
          </div>
        )}

        {/* Step 2: The Chat CTA - Always Visible */}
        <div className="relative mt-16 text-center border-t border-dashed border-border/30 pt-12">
          {!extractedData && !isProcessing && (
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-background px-2">
              <ArrowDown className="w-10 h-10 text-muted-foreground animate-bounce" />
            </div>
          )}
          <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Chat?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            {getCtaText()}
          </p>
          <button
            onClick={() => {
              if (!extractedData) return;
              setIsChatActive(true);
              setActiveResultTab('chat');
            }}
            disabled={!extractedData || isProcessing}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:animate-spin-once" />
            Chat with your PDF
          </button>
        </div>

        {/* Step 3: Results Viewer */}
        {extractedData && !isProcessing && (
          <div className="mt-12">
            <div className="w-full max-w-6xl mx-auto mt-8">
              <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                <div className="bg-card/50 px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Complete PDF Extraction Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive data extraction from {selectedFile?.name} - stored in Supabase
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2))}
                      className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/90 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                    >
                      <Download className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                      Copy JSON
                    </button>
                    
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedFile?.name?.replace('.pdf', '') || 'document'}_extraction.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all shadow-lg hover:shadow-primary/20"
                    >
                      <Download className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                      Download Complete JSON
                    </button>
                  </div>
                </div>

                <div className="border-b border-border">
                  <nav className="flex space-x-4 px-6 overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'chat', label: 'Chat' },
                      { id: 'history', label: `History (${processedDocuments.length})` },
                      { id: 'pages', label: `Pages (${extractedData.metadata.pagesProcessed})` },
                      { id: 'tables', label: `Tables (${extractedData.content.tables.length})` },
                      { id: 'financial', label: `Financial (${extractedData.content.financialData.length})` },
                      { id: 'full', label: 'Full JSON' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveResultTab(tab.id as ResultTabId)}
                        className={`flex-shrink-0 flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeResultTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6 bg-background/50">
                  {activeResultTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Processing Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{extractedData.metadata.actualPagesDetected}</div>
                            <div className="text-sm text-primary/80">Pages Detected</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{extractedData.content.tables.length}</div>
                            <div className="text-sm text-green-400/80">Tables Extracted</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-pink-400">{extractedData.content.financialData.length}</div>
                            <div className="text-sm text-pink-400/80">Financial Data Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{(extractedData.metadata.confidence * 100).toFixed(1)}%</div>
                            <div className="text-sm text-purple-400/80">Confidence Score</div>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Successfully stored in Supabase database</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeResultTab === 'history' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">Processing History</h3>
                        <button
                          onClick={loadProcessedDocuments}
                          disabled={isLoadingHistory}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                          Refresh
                        </button>
                      </div>
                      <div className="max-h-[40rem] overflow-y-auto space-y-3 p-1">
                        {isLoadingHistory ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground mt-2">Loading documents...</p>
                          </div>
                        ) : processedDocuments.length === 0 ? (
                          <div className="text-center py-8">
                            <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No documents processed yet</p>
                          </div>
                        ) : (
                          processedDocuments.map((doc, index) => (
                            <div key={doc.id} className="bg-secondary/20 rounded-lg p-4 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground">{doc.file_name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                                <div>Size: {(doc.file_size / 1024 / 1024).toFixed(2)} MB</div>
                                <div>Pages: {doc.pages_processed}</div>
                                <div>Processing: {doc.processing_time}ms</div>
                                <div>Confidence: {(doc.confidence_score * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeResultTab === 'chat' && (
                    <div className="flex flex-col h-[40rem] bg-secondary/20 rounded-lg border border-border">
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div className={`max-w-md rounded-xl p-4 ${
                              msg.role === 'assistant'
                                ? 'bg-background text-foreground'
                                : 'bg-primary text-primary-foreground'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        {isChatting && (
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                            <div className="max-w-md rounded-xl p-4 bg-background text-foreground">
                              <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-background/50 border-t border-border">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                          if (input.value.trim()) {
                            handleSendMessage(input.value);
                            input.value = '';
                          }
                        }} className="flex items-center gap-4">
                          <input
                            type="text"
                            placeholder="Ask a question about the document..."
                            className="flex-1 bg-secondary border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isChatting}
                          />
                          <button type="submit" disabled={isChatting} className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeResultTab === 'full' && (
                    <div className="bg-background/50 rounded-lg p-6 border border-border shadow-sm max-h-[40rem] overflow-y-auto">
                      <pre className="font-mono text-sm text-foreground/90">
                        <code>{JSON.stringify(extractedData, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Built with React, TypeScript, and Tailwind CSS. 
              Powered by Supabase for secure data storage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}