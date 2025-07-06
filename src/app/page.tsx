
'use client';

import React, { useState } from 'react';
import { FileText, Zap, Database, Download, RefreshCw } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { JsonViewer } from '@/components/JsonViewer';
import { processPdf } from '@/ai/flows/process-pdf-flow';

// This is the shape of the data object the AI flow will return (after parsing the JSON string)
interface ExtractedData {
  metadata: any;
  content: any;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    setExtractedData(null);

    try {
      const pdfDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
      
      const result = await processPdf({
        pdfDataUri,
        fileName: file.name,
        fileSize: file.size,
      });

      const data = JSON.parse(result.jsonOutput);
      setExtractedData(data);

    } catch (err: any) {
      console.error('PDF processing error:', err);
      setError(err.message || 'An unexpected error occurred during processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
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
      icon: Zap,
      title: 'Financial Intelligence',
      description: 'Recognizes financial patterns, ratios, and key metrics'
    },
    {
      icon: Download,
      title: 'JSON Export',
      description: 'Clean, structured JSON output ready for integration'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header
        className="bg-black/50 backdrop-blur-sm border-b border-border sticky top-0 z-10"
      >
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!extractedData && (
          <>
            {/* Hero Section */}
            <div
              className="text-center mb-16"
            >
              <div className="relative inline-block">
                <h2 className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-[length:400%_400%] bg-clip-text text-4xl font-bold text-transparent animate-gradient-pan sm:text-5xl">
                  Transform Your Financial PDFs
                  <br />
                  Into Smart JSON
                </h2>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent bg-[length:200%_100%] bg-no-repeat animate-shine mix-blend-color-dodge [background-position:200%_0]"></div>
              </div>
            </div>

            {/* Features Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-2xl hover:shadow-primary/80 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                    <feature.icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:animate-spin-once" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Upload Section */}
        <div className="space-y-8">
          {!extractedData && (
            <FileUpload
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              error={error}
            />
          )}

          {extractedData && !isProcessing && (
              <JsonViewer
                data={extractedData}
                fileName={selectedFile?.name || 'document.pdf'}
              />
            )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="bg-black/50 backdrop-blur-sm border-t border-border mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Built with React, TypeScript, and Tailwind CSS. 
              Powered by AI-driven PDF processing technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
