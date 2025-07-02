
'use client';

import { useState, useEffect, DragEvent, useRef } from 'react';
import { Upload, File, Loader, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type Status = 'idle' | 'processing';

interface FileUploaderProps {
  status: Status;
  onUpload: (file: File) => void;
}

const processingSteps = [
  { text: 'Uploading document...', duration: 1000 },
  { text: 'Parsing content...', duration: 1500 },
  { text: 'Recognizing tables...', duration: 1500 },
  { text: 'Applying financial AI...', duration: 2000 },
  { text: 'Generating structured JSON...', duration: 1000 },
];

export function FileUploader({ status, onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'processing') {
      let stepTimeout: NodeJS.Timeout;
      let progressInterval: NodeJS.Timer;

      const runStep = (stepIndex: number) => {
        if (stepIndex >= processingSteps.length) {
          setProgress(100);
          return;
        }

        setCurrentStep(stepIndex);
        const stepDuration = processingSteps[stepIndex].duration;
        const targetProgress = (stepIndex + 1) * (100 / processingSteps.length);

        clearInterval(progressInterval);
        progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev < targetProgress) {
              return prev + 1;
            }
            clearInterval(progressInterval);
            return prev;
          });
        }, stepDuration / (100 / processingSteps.length));

        stepTimeout = setTimeout(() => {
          runStep(stepIndex + 1);
        }, stepDuration);
      };

      runStep(0);

      return () => {
        clearTimeout(stepTimeout);
        clearInterval(progressInterval);
      };
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
  
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0 && status === 'idle') {
      onUpload(files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        "relative w-full rounded-xl border-2 border-dashed transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-5",
        "bg-card/50 backdrop-blur-sm",
        isDragging ? "border-primary bg-primary/10" : "border-border",
        status === 'processing' ? "p-8" : "p-12",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        accept="application/pdf"
      />
      <div className={cn(
        "absolute -inset-px rounded-xl border-2 border-transparent transition-all duration-300",
        isDragging && "border-primary shadow-2xl shadow-primary/30"
      )} />
      {status === 'idle' ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 transition-transform duration-300 group-hover:scale-110">
            <Upload className="w-10 h-10 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 className="text-2xl font-semibold">Upload Financial PDF</h3>
          <p className="text-muted-foreground">Drag & drop your document here or click to select a file</p>
          <button 
            onClick={handleButtonClick}
            className="px-6 py-2 mt-2 font-semibold text-primary-foreground rounded-md bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-100 inline-flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Choose PDF File
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h3 className="text-2xl font-semibold animate-in fade-in duration-500">Analyzing Document...</h3>
          <div className="w-full max-w-lg space-y-4">
            <Progress value={progress} className="w-full h-2 bg-secondary" />
            <div className="space-y-3 pt-2">
              {processingSteps.map((step, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center justify-start w-full text-left p-3 bg-secondary/50 rounded-lg animate-in fade-in-0 slide-in-from-left-4 duration-500 transition-all ease-in-out",
                    currentStep > index ? "border-l-4 border-primary" : "border-l-4 border-transparent",
                    currentStep === index && "bg-primary/10 border-l-4 border-primary",
                    { animationFillMode: 'backwards', animationDelay: `${index * 150}ms` }
                  )}
                >
                  {currentStep > index ? (
                    <CheckCircle2 className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                  ) : currentStep === index ? (
                    <Loader className="w-5 h-5 mr-3 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <File className="w-5 h-5 mr-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={cn(
                    "transition-colors duration-300",
                    currentStep > index ? "text-foreground/80 font-medium" : "text-muted-foreground",
                    currentStep === index && "text-primary-foreground"
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
