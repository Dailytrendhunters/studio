
'use client';

import React, { useState } from 'react';
import { FileText, Zap, Database, Download } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { JsonViewer } from '@/components/JsonViewer';
import { processPdf, ExtractedData } from '@/lib/pdfProcessor';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setExtractedData(null);

    // The processor function handles its own errors and returns sample data on failure.
    const data = await processPdf(file, (progress, step) => {
      setProgress(progress);
      setCurrentStep(step);
    });

    setExtractedData(data);
    
    // Check if the returned data is a sample due to an error.
    if (data.metadata.pageCountMethod.includes('Fallback')) {
       setError('Processing failed. Showing sample data to demonstrate functionality.');
       setCurrentStep('Sample data generated - Ready for download');
    } else {
       setCurrentStep('Processing complete - Ready for download');
    }

    setProgress(100);
    setIsProcessing(false);
  };

  const resetApp = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setError(null);
    setProgress(0);
    setCurrentStep('');
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
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10">
      {/* Header */}
      <header
        className="bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg">
                <FileText className="w-6 h-6 text-white" />
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
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all shadow-lg hover:shadow-primary/20"
                >
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
              <h2
                  className="text-4xl sm:text-5xl font-bold text-foreground mb-6"
                >
                  Transform Your{' '}
                  <span
                    className="bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] bg-clip-text text-transparent animate-gradient-pan"
                  >
                    Financial PDFs
                  </span>
                  <br />
                  Into Smart{' '}
                  <span
                    className="bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] bg-clip-text text-transparent animate-gradient-pan"
                  >
                    JSON
                  </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Upload any financial document and get intelligently extracted data in seconds. 
                Perfect for automated analysis, reporting, and integration.
              </p>
            </div>

            {/* Features Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
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

          {isProcessing && (
              <ProcessingStatus
                isProcessing={isProcessing}
                progress={progress}
                currentStep={currentStep}
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
        className="bg-background/50 backdrop-blur-sm border-t border-border mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Built with React, TypeScript, and Tailwind CSS. 
              Powered by simulated PDF processing technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
