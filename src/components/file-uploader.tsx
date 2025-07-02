
'use client';

import { useState, useEffect, DragEvent } from 'react';
import { Upload, File, Loader, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type Status = 'idle' | 'processing';

interface FileUploaderProps {
  status: Status;
  onUpload: () => void;
}

const processingSteps = [
  { text: 'Uploading file...', duration: 1000 },
  { text: 'Extracting text...', duration: 1500 },
  { text: 'Detecting tables...', duration: 1500 },
  { text: 'Analyzing financials...', duration: 2000 },
  { text: 'Finalizing JSON...', duration: 1000 },
];

export function FileUploader({ status, onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'processing') {
      let stepTimeout: NodeJS.Timeout;
      
      const runStep = (stepIndex: number) => {
        if (stepIndex >= processingSteps.length) {
          setProgress(100);
          return;
        }
        
        setCurrentStep(stepIndex);
        const stepDuration = processingSteps[stepIndex].duration;
        const progressIncrement = 100 / processingSteps.length;
        setProgress(stepIndex * progressIncrement);
        
        stepTimeout = setTimeout(() => {
          runStep(stepIndex + 1);
        }, stepDuration);
      };
      
      runStep(0);

      return () => clearTimeout(stepTimeout);
    }
  }, [status]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (status === 'idle') {
      onUpload();
    }
  };

  return (
    <div 
      className={cn(
        "w-full rounded-xl border-2 border-dashed transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-5",
        isDragging ? "border-primary bg-primary/10" : "border-border bg-card",
        status === 'processing' ? "p-8" : "p-12",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {status === 'idle' ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold">Upload Financial PDF</h3>
          <p className="text-muted-foreground">Drag and drop your financial document or click to browse</p>
          <div className="text-xs text-muted-foreground flex items-center gap-x-2">
            <span>PDF files only</span>
            <span className="text-lg leading-none">&middot;</span>
            <span>Up to 50MB</span>
            <span className="text-lg leading-none">&middot;</span>
            <span>Secure processing</span>
          </div>
          <button 
            onClick={onUpload}
            className="px-6 py-2 font-semibold text-white rounded-md bg-primary hover:bg-primary/90 transition-colors inline-flex items-center gap-2 mt-2"
          >
            <FileText className="w-4 h-4" />
            Choose PDF File
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h3 className="text-2xl font-semibold animate-in fade-in duration-500">Processing Document...</h3>
          <div className="w-full max-w-md space-y-4">
            <Progress value={progress} className="w-full h-2" />
            <div className="space-y-3 pt-2">
              {processingSteps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-start w-full text-left p-3 bg-secondary rounded-lg animate-in fade-in-0 slide-in-from-left-4 duration-500"
                  style={{ animationFillMode: 'backwards', animationDelay: `${index * 200}ms` }}
                >
                  {currentStep > index ? (
                    <CheckCircle2 className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                  ) : currentStep === index ? (
                    <Loader className="w-5 h-5 mr-3 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <File className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={cn(
                    "transition-colors",
                    currentStep > index ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
