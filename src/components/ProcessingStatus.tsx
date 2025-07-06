
'use client';

import React from 'react';
import { Loader2, FileText, Zap } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  currentStep: string;
  fileName: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  currentStep,
  fileName
}) => {
  if (!isProcessing) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Processing Document
        </h3>
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <FileText className="w-4 h-4" />
            <span>{fileName}</span>
        </div>
        
        <div className="w-full bg-secondary/20 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full animate-pulse"
              style={{ width: '100%' }}
            ></div>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>{currentStep}</span>
        </div>
      </div>
    </div>
  );
};
