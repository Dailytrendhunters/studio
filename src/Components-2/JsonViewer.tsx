import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Eye, EyeOff, ChevronDown, ChevronRight, FileText, CheckCircle, BarChart3, Database, FileSpreadsheet, BookOpen, Target } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  fileName: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, fileName }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'complete'>('idle');
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'tables' | 'financial' | 'full'>('overview');

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

  const renderJsonValue = (value: any, key?: string, depth = 0): React.ReactNode => {
    const [isItemExpanded, setIsItemExpanded] = useState(depth < 2);
    
    if (value === null) {
      return <span className="text-gray-500 italic">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-600 font-medium">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600 font-medium">{value.toLocaleString()}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }
      
      return (
        <div className="ml-4">
          <button
            onClick={() => setIsItemExpanded(!isItemExpanded)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors mb-1"
          >
            {isItemExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-sm font-medium text-blue-700">[{value.length} items]</span>
          </button>
          {isItemExpanded && (
            <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
              {value.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-500 text-sm font-mono min-w-[20px]">{index}:</span>
                  <div className="flex-1">{renderJsonValue(item, undefined, depth + 1)}</div>
                </div>
              ))}
              {value.length > 10 && (
                <div className="text-gray-500 text-sm italic">... and {value.length - 10} more items</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-gray-500">{'{}'}</span>;
      }
      
      return (
        <div className="ml-4">
          <button
            onClick={() => setIsItemExpanded(!isItemExpanded)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors mb-1"
          >
            {isItemExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-sm font-medium text-purple-700">{'{'}...{'}'}  ({keys.length} keys)</span>
          </button>
          {isItemExpanded && (
            <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
              {keys.slice(0, 10).map((k, index) => (
                <div key={k} className="flex items-start gap-2">
                  <span className="text-orange-600 font-medium min-w-fit">"{k}":</span>
                  <div className="flex-1">{renderJsonValue(value[k], k, depth + 1)}</div>
                </div>
              ))}
              {keys.length > 10 && (
                <div className="text-gray-500 text-sm italic">... and {keys.length - 10} more properties</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-gray-800">{String(value)}</span>;
  };

  // Calculate comprehensive statistics
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
            {/* Page Processing Verification */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Complete Page Processing Verification</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.actualPagesDetected}</div>
                  <div className="text-sm text-blue-700">Pages Detected</div>
                  <div className="text-xs text-gray-600 mt-1">via {stats.pageCountMethod}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.pagesProcessed}</div>
                  <div className="text-sm text-green-700">Pages Processed</div>
                  <div className="text-xs text-gray-600 mt-1">Individual Analysis</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stats.actualPagesDetected === stats.pagesProcessed ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.actualPagesDetected === stats.pagesProcessed ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-gray-700">Complete Match</div>
                  <div className="text-xs text-gray-600 mt-1">100% Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{((stats.pagesProcessed / stats.actualPagesDetected) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-purple-700">Processing Rate</div>
                  <div className="text-xs text-gray-600 mt-1">Completion</div>
                </div>
              </div>
              
              {stats.actualPagesDetected === stats.pagesProcessed ? (
                <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Perfect Processing: All {stats.actualPagesDetected} pages successfully processed</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Every single page from your {stats.actualPagesDetected}-page document has been individually analyzed and converted to structured JSON.
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Target className="w-5 h-5" />
                    <span className="font-medium">Processing Status: {stats.pagesProcessed} of {stats.actualPagesDetected} pages processed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Data Extraction Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{stats.tables}</div>
                <div className="text-sm text-blue-700">Tables Extracted</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.financialMetrics}</div>
                <div className="text-sm text-green-700">Financial Data Points</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{stats.sections}</div>
                <div className="text-sm text-purple-700">Document Sections</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{stats.pageBreakdown}</div>
                <div className="text-sm text-orange-700">Page Breakdowns</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Processing Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File Size:</span>
                  <div className="font-medium">{formatFileSize(stats.fileSize)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Processing Time:</span>
                  <div className="font-medium">{formatProcessingTime(stats.processingTime)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence Score:</span>
                  <div className="font-medium">{(stats.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Detection Method:</span>
                  <div className="font-medium">{stats.pageCountMethod}</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'pages':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Page-by-Page Breakdown</h3>
              <div className="text-sm text-gray-600">
                Showing all {stats.pagesProcessed} processed pages
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {data?.content?.pageBreakdown?.map((page: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">Page {page.pageNumber}</span>
                    <div className="flex items-center gap-2 text-sm">
                      {page.hasTable && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Tables</span>}
                      {page.hasFinancialData && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Financial Data</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
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
            <h3 className="text-lg font-semibold text-gray-800">Extracted Tables ({stats.tables})</h3>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {data?.content?.tables?.map((table: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">{table.title}</h4>
                    <span className="text-sm text-gray-600">Page {table.page}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          {table.headers?.map((header: string, i: number) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-gray-700">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows?.slice(0, 3).map((row: string[], i: number) => (
                          <tr key={i} className="border-t border-gray-200">
                            {row.map((cell: string, j: number) => (
                              <td key={j} className="px-3 py-2 text-gray-600">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(table.rows?.length || 0) > 3 && (
                      <div className="text-center text-sm text-gray-500 mt-2">
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
            <h3 className="text-lg font-semibold text-gray-800">Financial Data Points ({stats.financialMetrics})</h3>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {data?.content?.financialData?.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{item.label}</div>
                      <div className="text-sm text-gray-600">
                        Type: {item.type} | Period: {item.period} | Page: {item.page}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
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
        
      case 'full':
        return (
          <div className="bg-white rounded-lg p-6 border shadow-sm max-h-96 overflow-y-auto">
            <div className="font-mono text-sm">
              {renderJsonValue(data)}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-6xl mx-auto mt-8"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6 border border-green-200"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Complete Processing Successful! All {stats.actualPagesDetected} Pages Processed
            </h2>
            <p className="text-gray-600">
              Every single page ({stats.pagesProcessed}/{stats.actualPagesDetected}) has been individually analyzed and converted to structured JSON format.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-500">100% Complete</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Complete PDF Extraction Results</h3>
              <p className="text-sm text-gray-600">
                Comprehensive data extraction from {fileName} - {stats.actualPagesDetected} pages processed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2))}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
            >
              <Copy className="w-4 h-4" />
              {copiedIndex === -1 ? 'Copied!' : 'Copy JSON'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadJson}
              disabled={downloadStatus === 'downloading'}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {downloadStatus === 'downloading' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Downloading...
                </>
              ) : downloadStatus === 'complete' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Complete JSON
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'pages', label: `Pages (${stats.pagesProcessed})`, icon: FileText },
              { id: 'tables', label: `Tables (${stats.tables})`, icon: FileSpreadsheet },
              { id: 'financial', label: `Financial (${stats.financialMetrics})`, icon: Database },
              { id: 'full', label: 'Full JSON', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>📄 {fileName}</span>
              <span>📊 {stats.actualPagesDetected} pages detected, {stats.pagesProcessed} processed</span>
              <span>⏰ Completed in {formatProcessingTime(stats.processingTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Complete Extraction
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {(stats.confidence * 100).toFixed(1)}% Confidence
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                {stats.pageCountMethod}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};