
'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, FileJson, AlertTriangle, Check } from 'lucide-react';
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
        <Alert variant="destructive" className="animate-in fade-in duration-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription>{errorDetails}</AlertDescription>
        </Alert>
      )}

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{animationFillMode: 'backwards', animationDelay: '100ms'}}>
        <CardHeader>
          <CardTitle>AI-Generated Summary</CardTitle>
          <CardDescription>A concise overview of the key financial data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90">{summary}</p>
        </CardContent>
      </Card>
      
      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{animationFillMode: 'backwards', animationDelay: '200ms'}}>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center"><FileJson className="mr-2 h-6 w-6" />Extracted JSON Data</CardTitle>
                    <CardDescription>Structured data from your document.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded-md border bg-background p-4">
            <pre>
              <code className="text-sm font-mono">{prettyJson()}</code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="text-center pt-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{animationFillMode: 'backwards', animationDelay: '300ms'}}>
        <Button size="lg" onClick={onReset} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <RefreshCw className="mr-2 h-4 w-4" />
          Process Another Document
        </Button>
      </div>
    </div>
  );
}
