
'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, FileJson, AlertTriangle, Check, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonViewerProps {
  jsonData: string;
  summary: string;
  onReset: () => void;
  isError: boolean;
  errorDetails?: string;
}

export function JsonViewer({ jsonData, summary, onReset, isError, errorDetails }: JsonViewerProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const prettyJson = () => {
    try {
      return JSON.stringify(JSON.parse(jsonData), null, 2);
    } catch (e) {
      return jsonData;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prettyJson());
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "JSON data has been copied successfully.",
      variant: 'default',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prettyJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download started!",
      description: "Your JSON file is being downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      {isError && errorDetails && (
        <Alert variant="destructive" className="animate-in fade-in duration-300 bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription>{errorDetails}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{animationFillMode: 'backwards', animationDelay: '100ms'}}>
        <CardHeader>
          <CardTitle className="flex items-center"><BrainCircuit className="mr-2 h-6 w-6 text-primary" />AI-Generated Summary</CardTitle>
          <CardDescription>A concise overview of the key financial data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>
      
      <Card className="relative bg-card/50 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{animationFillMode: 'backwards', animationDelay: '200ms'}}>
        <div className="absolute -inset-px rounded-xl border border-primary/20" />
        <CardHeader>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center"><FileJson className="mr-2 h-6 w-6 text-primary" />Extracted JSON Data</CardTitle>
                    <CardDescription>Structured data from your document.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="transition-all hover:scale-105 active:scale-100 hover:bg-primary/10 hover:text-primary">
                        {copied ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="transition-all hover:scale-105 active:scale-100 hover:bg-primary/10 hover:text-primary">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="relative z-10 h-96 w-full rounded-md border bg-black/30 p-4">
            <pre>
              <code className="text-sm font-mono text-foreground/90">{prettyJson()}</code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="text-center pt-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{animationFillMode: 'backwards', animationDelay: '300ms'}}>
        <Button size="lg" onClick={onReset} className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 active:scale-100">
          <RefreshCw className="mr-2 h-4 w-4" />
          Process Another Document
        </Button>
      </div>
    </div>
  );
}
