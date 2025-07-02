
'use client';

import { useState, useEffect, DragEvent } from 'react';
import { UploadCloud, File, Loader, CheckCircle2 } from 'lucide-react';
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
      onUpload();
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
  }, [status]); // Only re-trigger on status change from parent

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
    // In a real app, you would handle the file here
    // For this simulation, we just trigger the upload process
    if (status === 'idle') {
      onUpload();
    }
  };

  return (
    <div 
      className={cn(
        "w-full rounded-xl border-2 border-dashed transition-all duration-300",
        isDragging ? "border-primary bg-primary/10" : "border-border bg-card",
        status === 'processing' ? "p-8" : "p-12",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {status === 'idle' ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold">Drag & drop your PDF here</h3>
          <p className="text-muted-foreground">or</p>
          <button 
            onClick={onUpload}
            className="px-6 py-2 font-semibold text-white rounded-md bg-primary hover:bg-primary/90 transition-colors"
          >
            Browse Files
          </button>
          <p className="text-sm text-muted-foreground pt-4">Simulated processing for demonstration purposes.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h3 className="text-2xl font-semibold">Processing Document...</h3>
          <div className="w-full max-w-md space-y-4">
            <Progress value={progress} className="w-full h-2" />
            <div className="space-y-3 pt-2">
              {processingSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-start w-full text-left p-3 bg-background rounded-lg">
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
