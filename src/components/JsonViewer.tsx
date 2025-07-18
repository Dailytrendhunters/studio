
'use client';

import React, { useRef, useEffect } from 'react';
import { Download, Copy, Eye, ChevronDown, ChevronRight, FileText, CheckCircle, BarChart3, Database, FileSpreadsheet, BookOpen, Target, AlertTriangle, MessageSquare, User, Bot, Send, Loader2, Zap } from 'lucide-react';
import type { ChatMessage, ResultTabId } from '@/app/page';

interface JsonViewerProps {
  data: any;
  fileName: string;
  chatHistory: ChatMessage[];
  isChatting: boolean;
  onSendMessage: (message: string) => void;
  activeTab: ResultTabId;
  onTabChange: (tabId: ResultTabId) => void;
  isChatReady: boolean;
}

const JsonNode = ({ nodeValue, defaultExpanded = false, depth = 0 }: { nodeValue: any, defaultExpanded?: boolean, depth?: number }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded || depth < 2);

  const renderValue = (value: any): React.ReactNode => {
    if (value === null) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="text-accent font-medium">{value.toString()}</span>;
    }
    if (typeof value === 'number') {
      return <span className="text-pink-400 font-medium">{value.toLocaleString()}</span>;
    }
    if (typeof value === 'string') {
        const str = value.length > 200 ? value.substring(0, 200) + "..." : value;
      return <span className="text-green-400">"{str}"</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">[]</span>;
      return (
        <div className="ml-4">
          <button onClick={() => setIsExpanded(!isExpanded)} className="group flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-1">
            {isExpanded ? <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:animate-spin-once" /> : <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:animate-spin-once" />}
            <span className="text-sm font-medium text-pink-400">[{value.length} items]</span>
          </button>
          {isExpanded && (
            <div className="overflow-hidden ml-4 mt-2 space-y-2 border-l-2 border-border/50 pl-4">
              {value.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-sm font-mono min-w-[20px]">{index}:</span>
                  <div className="flex-1"><JsonNode nodeValue={item} defaultExpanded={false} depth={depth+1}/></div>
                </div>
              ))}
              {value.length > 10 && <div className="text-muted-foreground text-sm italic">... and {value.length - 10} more items</div>}
            </div>
          )}
        </div>
      );
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return <span className="text-muted-foreground">{'{}'}</span>;
      return (
        <div className="ml-4">
          <button onClick={() => setIsExpanded(!isExpanded)} className="group flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-1">
            {isExpanded ? <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:animate-spin-once" /> : <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:animate-spin-once" />}
            <span className="text-sm font-medium text-purple-400">{'{'}...{'}'} ({keys.length} keys)</span>
          </button>
          {isExpanded && (
            <div className="overflow-hidden ml-4 mt-2 space-y-2 border-l-2 border-border/50 pl-4">
              {keys.slice(0, 20).map((k) => (
                <div key={k} className="flex items-start gap-2">
                  <span className="text-orange-400 font-medium min-w-fit">"{k}":</span>
                  <div className="flex-1"><JsonNode nodeValue={value[k]} defaultExpanded={false} depth={depth+1}/></div>
                </div>
              ))}
              {keys.length > 20 && <div className="text-muted-foreground text-sm italic">... and {keys.length - 20} more properties</div>}
            </div>
          )}
        </div>
      );
    }
    return <span className="text-foreground/90">{String(value)}</span>;
  };

  return renderValue(nodeValue);
};

export const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  fileName, 
  chatHistory, 
  isChatting, 
  onSendMessage,
  activeTab,
  onTabChange,
  isChatReady
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [downloadStatus, setDownloadStatus] = React.useState<'idle' | 'downloading' | 'complete'>('idle');
  const [chatInput, setChatInput] = React.useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  const downloadJson = async () => {
    setDownloadStatus('downloading');
    
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace('.pdf', '')}_complete_extraction.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadStatus('complete');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('idle');
    }
  };

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index ?? -1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const stats = {
    totalPages: data?.metadata?.pages || 0,
    actualPagesDetected: data?.metadata?.actualPagesDetected || 0,
    pagesProcessed: data?.metadata?.pagesProcessed || 0,
    tables: data?.content?.tables?.length || 0,
    financialMetrics: data?.content?.financialData?.length || 0,
    sections: data?.content?.sections?.length || 0,
    pageBreakdown: data?.content?.pageBreakdown?.length || 0,
    fileSize: data?.metadata?.fileSize || 0,
    processingTime: data?.metadata?.processingTime || 0,
    confidence: data?.metadata?.confidence || 0,
    pageCountMethod: data?.metadata?.pageCountMethod || 'Unknown'
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatProcessingTime = (ms: number): string => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div 
              className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Complete Page Processing Verification</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">{stats.actualPagesDetected}</div>
                  <div className="text-sm text-pink-400/80">Pages Detected</div>
                  <div className="text-xs text-muted-foreground mt-1">via {stats.pageCountMethod}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.pagesProcessed}</div>
                  <div className="text-sm text-primary/80">Pages Processed</div>
                  <div className="text-xs text-muted-foreground mt-1">Individual Analysis</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stats.actualPagesDetected === stats.pagesProcessed ? 'text-primary' : 'text-red-400'}`}>
                    {stats.actualPagesDetected === stats.pagesProcessed ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground/80">Complete Match</div>
                  <div className="text-xs text-muted-foreground mt-1">100% Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{((stats.pagesProcessed / (stats.actualPagesDetected || 1)) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-purple-400/80">Processing Rate</div>
                  <div className="text-xs text-muted-foreground mt-1">Completion</div>
                </div>
              </div>
              
              {stats.actualPagesDetected > 0 && stats.actualPagesDetected === stats.pagesProcessed ? (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Perfect Processing: All {stats.actualPagesDetected} pages successfully processed</span>
                  </div>
                  <p className="text-sm text-primary/80 mt-1">
                    Every single page from your {stats.actualPagesDetected}-page document has been individually analyzed and converted to structured JSON.
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-yellow-300">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Processing Discrepancy: {stats.pagesProcessed} of {stats.actualPagesDetected} pages processed</span>
                  </div>
                   <p className="text-sm text-yellow-300/80 mt-1">
                    The AI processed a different number of pages than it initially detected. The result might be incomplete.
                  </p>
                </div>
              )}
            </div>

            <div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                <div className="text-2xl font-bold text-pink-400">{stats.tables}</div>
                <div className="text-sm text-pink-400/80">Tables Extracted</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{stats.financialMetrics}</div>
                <div className="text-sm text-green-400/80">Financial Data Points</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{stats.sections}</div>
                <div className="text-sm text-purple-400/80">Document Sections</div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400">{stats.pageBreakdown}</div>
                <div className="text-sm text-orange-400/80">Page Breakdowns</div>
              </div>
            </div>
            
            <div 
              className="bg-secondary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Processing Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <div className="font-medium text-foreground/90">{formatFileSize(stats.fileSize)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Processing Time:</span>
                  <div className="font-medium text-foreground/90">{formatProcessingTime(stats.processingTime)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence Score:</span>
                  <div className="font-medium text-foreground/90">{(stats.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Detection Method:</span>
                  <div className="font-medium text-foreground/90">{stats.pageCountMethod}</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'pages':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Page-by-Page Breakdown</h3>
              <div className="text-sm text-muted-foreground">
                Showing all {stats.pagesProcessed} processed pages
              </div>
            </div>
            <div className="max-h-[40rem] overflow-y-auto space-y-3 p-1">
              {data?.content?.pageBreakdown?.map((page: any, index: number) => (
                <div key={index} className="bg-secondary/20 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">Page {page.pageNumber}</span>
                    <div className="flex items-center gap-2 text-sm">
                      {page.hasTable && <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs">Tables</span>}
                      {page.hasFinancialData && <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">Financial Data</span>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Words: {page.wordCount?.toLocaleString() || 0}</div>
                    <div>Confidence: {((page.confidence || 0) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'tables':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Extracted Tables ({stats.tables})</h3>
            <div className="max-h-[40rem] overflow-y-auto space-y-4 p-1">
              {data?.content?.tables?.map((table: any, index: number) => (
                <div key={index} className="bg-secondary/20 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{table.title}</h4>
                    <span className="text-sm text-muted-foreground">Page {table.page}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-white/5">
                          {table.headers?.map((header: string, i: number) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows?.slice(0, 3).map((row: string[], i: number) => (
                          <tr key={i} className="border-t border-border/50">
                            {row.map((cell: string, j: number) => (
                              <td key={j} className="px-3 py-2 text-foreground/80">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(table.rows?.length || 0) > 3 && (
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        ... and {(table.rows?.length || 0) - 3} more rows
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'financial':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Financial Data Points ({stats.financialMetrics})</h3>
            <div className="max-h-[40rem] overflow-y-auto space-y-3 p-1">
              {data?.content?.financialData?.map((item: any, index: number) => (
                <div key={index} className="bg-secondary/20 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{item.label}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {item.type} | Period: {item.period} | Page: {item.page}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-pink-400">
                        {item.currency === 'USD' ? '$' : ''}{item.value?.toLocaleString()}{item.currency === '%' ? '%' : ''}
                        {item.currency === 'USD' && item.value > 1000000 ? 'M' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'chat':
        if (!isChatReady) {
          return (
            <div className="flex flex-col items-center justify-center h-[40rem] bg-secondary/20 rounded-lg border border-border text-center p-8">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Chat with Your Document</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start an interactive chat session from the prompt above to ask specific questions about the content of your PDF.
              </p>
            </div>
          );
        }
        return (
          <div className="flex flex-col h-[40rem] bg-secondary/20 rounded-lg border border-border">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-md rounded-xl p-4 ${
                    msg.role === 'assistant'
                      ? 'bg-background text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isChatting && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="max-w-md rounded-xl p-4 bg-background text-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-background/50 border-t border-border">
              <form onSubmit={handleChatSubmit} className="flex items-center gap-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about the document..."
                  className="flex-1 bg-secondary border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isChatting}
                />
                <button type="submit" disabled={isChatting || !chatInput.trim()} className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        );
        
      case 'full':
        return (
          <div className="bg-background/50 rounded-lg p-6 border border-border shadow-sm max-h-[40rem] overflow-y-auto">
            <div className="font-mono text-sm">
              <JsonNode nodeValue={data} defaultExpanded={true} />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto mt-8"
    >
      <div
        className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-card/50 px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Complete PDF Extraction Results</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive data extraction from {fileName} - {stats.pagesProcessed} of {stats.actualPagesDetected} pages processed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/90 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
            >
              <Copy className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
              {copiedIndex === -1 ? 'Copied!' : 'Copied!'}
            </button>
            
            <button
              onClick={downloadJson}
              disabled={downloadStatus === 'downloading'}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              {downloadStatus === 'downloading' ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  Downloading...
                </>
              ) : downloadStatus === 'complete' ? (
                <>
                  <CheckCircle className="w-4 h-4 transition-transform duration-300" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                  Download Complete JSON
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-b border-border">
          <nav className="flex space-x-4 px-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'pages', label: `Pages (${stats.pagesProcessed})`, icon: FileText },
              { id: 'tables', label: `Tables (${stats.tables})`, icon: FileSpreadsheet },
              { id: 'financial', label: `Financial (${stats.financialMetrics})`, icon: Database },
              { id: 'full', label: 'Full JSON', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ResultTabId)}
                className={`group flex-shrink-0 flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <tab.icon className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 bg-background/50">
            <div>
              {renderTabContent()}
            </div>
        </div>

        <div className="bg-card/50 px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>📄 {fileName}</span>
              <span>📊 {stats.actualPagesDetected} pages detected, {stats.pagesProcessed} processed</span>
              <span>⏰ Completed in {formatProcessingTime(stats.processingTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Complete Extraction
              </span>
              <span className="px-2 py-1 bg-pink-500/10 text-pink-400 rounded-full text-xs font-medium">
                {(stats.confidence * 100).toFixed(1)}% Confidence
              </span>
              <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                {stats.pageCountMethod}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
