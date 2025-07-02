'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { JsonViewer } from '@/components/json-viewer';
import { processPdfAction, getSampleJsonAction } from './actions';
import { FileText, Cpu, ScanLine, Code, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

type Status = 'idle' | 'processing' | 'success' | 'error';

const features = [
  {
    icon: <ScanLine className="w-8 h-8 text-primary" />,
    title: 'Intelligent Parsing',
    description: 'Advanced OCR and text extraction from any PDF document.',
  },
  {
    icon: <Code className="w-8 h-8 text-primary" />,
    title: 'Table Recognition',
    description: 'Automatically identifies and extracts tabular data with precision.',
  },
  {
    icon: <Cpu className="w-8 h-8 text-primary" />,
    title: 'Financial AI',
    description: 'Recognizes financial patterns, ratios, and key metrics.',
  },
  {
    icon: <Share2 className="w-8 h-8 text-primary" />,
    title: 'JSON Export',
    description: 'Clean, structured JSON output ready for your integrations.',
  },
];

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [jsonData, setJsonData] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pagesProcessed, setPagesProcessed] = useState(0);

  const handleUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setErrorDetails('Invalid file type. Please upload a PDF.');
      setStatus('error');
      setJsonData('{ "error": "Invalid file type. Please upload a PDF." }');
      return;
    }
    
    setUploadedFile(file);
    setStatus('processing');
    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);

      // 2. Construct gs:// URI
      const pdfUri = `gs://${storageRef.bucket}/${storageRef.fullPath}`;
      
      const { jsonOutput, totalPages, pagesProcessed } = await processPdfAction({ pdfUri });
      
      setJsonData(jsonOutput);
      setTotalPages(totalPages);
      setPagesProcessed(pagesProcessed);
      setStatus('success');
    } catch (e) {
      console.error(e);
      setErrorDetails('We encountered an issue processing your document. As a demonstration, here is some sample financial data.');
      try {
        const { jsonOutput } = await getSampleJsonAction({ description: 'A sample balance sheet from a startup.' });
        setJsonData(jsonOutput);
        setTotalPages(0);
        setPagesProcessed(0);
        setStatus('error');
      } catch (finalError) {
        console.error(finalError);
        setJsonData('{ "error": "Could not generate sample data." }');
        setStatus('error');
      }
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setJsonData('');
    setErrorDetails('');
    setUploadedFile(null);
    setTotalPages(0);
    setPagesProcessed(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <header className="w-full">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
             </div>
            <h2 className="font-bold text-lg text-foreground">PDF to JSON</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                status === 'processing' ? 'bg-yellow-400' : 'bg-primary'
              )}></span>
              <span className={cn(
                "relative inline-flex rounded-full h-2.5 w-2.5",
                status === 'processing' ? 'bg-yellow-500' : 'bg-primary'
              )}></span>
            </span>
            <p className="text-sm text-muted-foreground">{status === 'processing' ? 'Processing...' : 'Ready for analysis'}</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container relative py-8">
          {status === 'idle' && (
            <section className="pb-12 md:pb-24 text-center animate-in fade-in-0 slide-in-from-bottom-12 duration-500">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 [background-size:200%_auto] animate-text-gradient-pan">
                Unlock Data from Documents
              </h1>
              <p className="max-w-2xl mx-auto mb-10 text-lg text-muted-foreground">
                Instantly convert complex financial PDFs into structured JSON. Powered by AI for unmatched accuracy.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="group relative rounded-xl border border-white/10 bg-card p-6 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700 transition-all ease-in-out hover:!shadow-2xl hover:!shadow-primary/80 hover:-translate-y-2"
                    style={{ animationFillMode: 'backwards', animationDelay: `${200 + index * 100}ms` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                     <div className="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 group-hover:opacity-100 group-hover:border-primary/80 transition-all duration-500"/>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg mb-4 inline-block">
                            {feature.icon}
                        </div>
                        <h3 className="text-base font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="transition-all duration-500 ease-in-out">
            {status === 'idle' || status === 'processing' ? (
              <FileUploader 
                status={status} 
                onUpload={handleUpload} 
                file={uploadedFile} 
              />
            ) : (
              <JsonViewer 
                jsonData={jsonData} 
                onReset={handleReset} 
                isError={status === 'error'} 
                errorDetails={errorDetails}
                totalPages={totalPages}
                pagesProcessed={pagesProcessed}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
