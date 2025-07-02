
'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { JsonViewer } from '@/components/json-viewer';
import { getSampleJsonAction, getSummaryAction } from './actions';
import { ArrowLeftRight } from 'lucide-react';

type Status = 'idle' | 'processing' | 'success' | 'error';

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [jsonData, setJsonData] = useState('');
  const [summary, setSummary] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  const handleUpload = async () => {
    setStatus('processing');
    try {
      const { jsonOutput } = await getSampleJsonAction({ 
        description: 'A standard 10-K financial report with income statement, balance sheet, and cash flow statement.' 
      });
      
      // Add a delay for a more realistic simulation
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const { summary } = await getSummaryAction({ jsonData: jsonOutput });
      
      setJsonData(jsonOutput);
      setSummary(summary);
      setStatus('success');
    } catch (e) {
      console.error(e);
      setErrorDetails('We encountered an issue processing your document. As a demonstration, here is some sample financial data.');
      try {
        const { jsonOutput } = await getSampleJsonAction({ description: 'A sample balance sheet from a startup.' });
        setJsonData(jsonOutput);
        setSummary('Could not generate a summary due to a processing error.');
        setStatus('error');
      } catch (finalError) {
        console.error(finalError);
        setJsonData('{ "error": "Could not generate sample data." }');
        setSummary('A critical error occurred while fetching fallback data. Please try again later.');
        setStatus('error');
      }
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setJsonData('');
    setSummary('');
    setErrorDetails('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 lg:p-8 bg-grid-slate-100/[0.05] dark:bg-grid-slate-900/[0.05]">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
             <ArrowLeftRight className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
            FinPDF to JSON
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Instantly convert financial PDF documents into structured JSON using AI. Drag and drop a file to begin.
          </p>
        </header>
        
        <main className="transition-all duration-500 ease-in-out">
          {status === 'idle' || status === 'processing' ? (
            <FileUploader status={status} onUpload={handleUpload} />
          ) : (
            <JsonViewer 
              jsonData={jsonData} 
              summary={summary} 
              onReset={handleReset} 
              isError={status === 'error'} 
              errorDetails={errorDetails}
            />
          )}
        </main>
      </div>
    </div>
  );
}
