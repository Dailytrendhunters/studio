
'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file: File) => file.type === 'application/pdf');
    
    if (pdfFile) {
      setSelectedFile(pdfFile);
      onFileSelect(pdfFile);
    } else {
      console.error('Please select a PDF file');
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        console.error('Please select a PDF file');
      }
    }
  }, [onFileSelect]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={`group/zone relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/10 scale-105 shadow-2xl shadow-primary/80'
            : selectedFile && !error
            ? 'border-primary/80 bg-primary/10'
            : error
            ? 'border-destructive bg-destructive/10'
            : 'border-border bg-card hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/80'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
          {selectedFile && !error ? (
            <div
              className="space-y-4"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground break-all">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                  <Zap className="w-4 h-4" />
                  <span>Ready for intelligent processing</span>
                </div>
              </div>
              {!isProcessing && (
                <button
                  onClick={clearFile}
                  className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                  Remove File
                </button>
              )}
            </div>
          ) : error ? (
            <div
              className="space-y-4"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-destructive/10 rounded-full">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Processing Error</p>
                <p className="text-sm text-destructive">{error}</p>
                <p className="text-xs text-muted-foreground">
                  Don't worry - we've generated sample data to show you how the app works!
                </p>
              </div>
              <button
                onClick={clearFile}
                className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4 transition-transform duration-300 group-hover:animate-spin-once" />
                Try Another File
              </button>
            </div>
          ) : (
            <div
              className="space-y-6"
            >
              <div
                className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full"
              >
                {isDragOver ? (
                  <div>
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                ) : (
                  <Upload className="w-10 h-10 text-muted-foreground transition-transform duration-300 group-hover/zone:animate-spin-once" />
                )}
              </div>
              
              <div className="space-y-3">
                <p className="text-xl font-semibold text-foreground">
                  {isDragOver ? 'Drop your PDF here!' : 'Upload Financial PDF'}
                </p>
                <p className="text-muted-foreground">
                  {isDragOver 
                    ? 'Release to start intelligent processing' 
                    : 'Drag and drop your financial document or click to browse'
                  }
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground/80">
                  <span>• PDF files only</span>
                  <span>• Up to 50MB</span>
                  <span>• Secure processing</span>
                </div>
              </div>
              
              <button
                onClick={handleButtonClick}
                className="group/button inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/50 group-hover/zone:scale-150 group-hover/zone:-translate-y-1"
                disabled={isProcessing}
              >
                <FileText className="w-5 h-5 transition-transform duration-300 group-hover/button:animate-spin-once" />
                {isProcessing ? 'Processing...' : 'Choose PDF File'}
              </button>
            </div>
          )}
      </div>
      
      {isProcessing && (
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
        >
          <div className="text-center">
            <div
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2 animate-spin"
            />
            <p className="text-sm font-medium text-muted-foreground">Processing your PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
};
