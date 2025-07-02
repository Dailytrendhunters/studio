
'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { JsonViewer } from '@/components/json-viewer';
import { getSampleJsonAction, getSummaryAction } from './actions';
import { FileText, Database, Zap, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';

type Status = 'idle' | 'processing' | 'success' | 'error';

const features = [
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: 'Smart PDF Reading',
    description: 'Advanced OCR and text extraction from any PDF document',
  },
  {
    icon: <Database className="w-8 h-8 text-primary" />,
    title: 'Table Detection',
    description: 'Automatically identifies and extracts tabular data with precision',
  },
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: 'Financial Intelligence',
    description: 'Recognizes financial patterns, ratios, and key metrics',
  },
  {
    icon: <Download className="w-8 h-8 text-primary" />,
    title: 'JSON Export',
    description: 'Clean, structured JSON output ready for integration',
  },
];


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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <div className="p-2 bg-primary rounded-lg mr-3">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">PDF to JSON</h2>
              <p className="text-sm text-muted-foreground">Intelligent Document Converter</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <p className="text-sm text-muted-foreground">Ready to process</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container relative py-8">
          {status === 'idle' && (
            <section className="pb-12 md:pb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index} 
                    className="bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 text-center flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                    style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-4 bg-primary/10 rounded-lg mb-4 inline-block">
                        {feature.icon}
                    </div>
                    <h3 className="text-base font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <div className="transition-all duration-500 ease-in-out">
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
          </div>
        </div>
      </main>
    </div>
  );
}
