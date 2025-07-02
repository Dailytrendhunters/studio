'use client';

import { useState, useEffect, DragEvent, useRef } from 'react';
import { Upload, FileText, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type Status = 'idle' | 'processing';

interface FileUploaderProps {
  status: Status;
  onUpload: (file: File) => void;
  file: File | null;
}

export function FileUploader({ status, onUpload, file }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'processing') {
      setProgress(0);
      const totalDuration = 8000; // 8 seconds for fake progress
      const intervalTime = 50;
      const increment = (100 / (totalDuration / intervalTime));
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 99) {
            clearInterval(progressInterval);
            return 99;
          }
          return prev + increment;
        });
      }, intervalTime);

      return () => {
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

  if (status === 'processing' && file) {
    return (
        <div className="space-y-8 animate-in fade-in-0 duration-500">
            <div className="relative rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-6 text-center">
                <div className="absolute top-4 right-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{file.name}</h3>
                <p className="text-sm text-muted-foreground/80 mb-3">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1 text-sm font-medium text-primary">
                    <Zap className="h-4 w-4" />
                    <span>Ready for intelligent processing</span>
                </div>
            </div>

            <div className="relative rounded-2xl border border-border bg-card/80 p-8 text-center backdrop-blur-sm">
                 <div className="mb-4">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                 </div>
                 <h3 className="text-2xl font-bold tracking-tight">Processing Your Financial PDF</h3>
                 <p className="text-muted-foreground mb-6">Extracting financial data and tables</p>

                 <div className="mx-auto w-full max-w-md">
                     <div className="flex justify-between items-end mb-1">
                         <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                         <span className="text-lg font-bold text-primary">{Math.min(100, Math.ceil(progress))}%</span>
                     </div>
                     <Progress value={progress} className="h-2.5 bg-secondary" />
                 </div>
            </div>
        </div>
    )
  }

  return (
    <div 
      className={cn(
        "relative w-full rounded-xl border-2 border-dashed transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-5",
        "bg-card/50 backdrop-blur-sm",
        isDragging ? "border-primary bg-primary/10" : "border-border",
        "p-12",
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
    </div>
  );
}
