
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, Database, CheckCircle, Zap, Brain, BarChart3, BookOpen } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  progress,
  currentStep
}) => {
  const steps = [
    { id: 'analyzing', label: 'Analyzing PDF Structure', icon: FileText, color: 'blue' },
    { id: 'counting', label: 'Determining Total Pages', icon: BookOpen, color: 'purple' },
    { id: 'processing', label: 'Processing Each Page', icon: Brain, color: 'green' },
    { id: 'extracting', label: 'Extracting Data', icon: Database, color: 'orange' },
    { id: 'analyzing', label: 'Analyzing Tables', icon: BarChart3, color: 'blue' },
    { id: 'converting', label: 'Converting to JSON', icon: Zap, color: 'purple' },
    { id: 'complete', label: 'Processing Complete', icon: CheckCircle, color: 'green' }
  ];

  const getCurrentStepIndex = () => {
    const stepKeywords = {
      'Analyzing': 0,
      'Determining': 1,
      'CONFIRMED': 1,
      'Processing page': 2,
      'Extracting tables': 3,
      'Analyzing financial': 4,
      'Converting': 5,
      'COMPLETE': 6,
      'complete': 6
    };
    
    for (const [keyword, index] of Object.entries(stepKeywords)) {
      if (currentStep.includes(keyword)) {
        return index;
      }
    }
    
    if (progress < 10) return 0;
    if (progress < 15) return 1;
    if (progress < 65) return 2;
    if (progress < 80) return 3;
    if (progress < 90) return 4;
    if (progress < 100) return 5;
    return 6;
  };

  const currentStepIndex = getCurrentStepIndex();

  const extractTotalPages = (step: string): string => {
    const pageMatch = step.match(/(\d+)\s*total pages|(\d+)\s*pages/i);
    if (pageMatch) {
      const pages = pageMatch[1] || pageMatch[2];
      return ` (${pages} total pages)`;
    }
    return '';
  };

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-4"
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Processing Your PDF Document{extractTotalPages(currentStep)}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">{currentStep}</p>
          
          {currentStep.includes('CONFIRMED') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">
                  {currentStep.match(/(\d+)\s*total pages/i)?.[1] || 'Multiple'} pages detected - Processing every single page
                </span>
              </div>
              <p className="text-sm text-primary/80 mt-1">
                No shortcuts - complete page-by-page analysis for 100% accuracy
              </p>
            </motion.div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
            <span className="font-medium">Overall Progress</span>
            <span className="font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-secondary/20 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
          
          {currentStep.includes('Processing page') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center"
            >
              <div className="text-sm text-muted-foreground">
                {currentStep.match(/page (\d+)\/(\d+)/)?.[0] || 'Processing pages individually'}
              </div>
              <div className="text-xs text-muted-foreground/80 mt-1">
                Taking time to ensure every page is processed completely
              </div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <motion.div
                key={step.id + index}
                whileHover={{ y: -4 }}
                className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-primary/80 bg-primary/10 shadow-lg shadow-primary/10'
                    : isCompleted
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-border bg-secondary/20'
                }`}
                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                    animate={isActive ? { 
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <step.icon className="w-4 h-4" />
                  </motion.div>
                  
                  <div>
                    <p className={`text-xs font-medium leading-tight ${
                      isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    
                    {isActive && (
                      <motion.div
                        className="mt-1 flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((dot) => (
                            <motion.div
                              key={dot}
                              className="w-1 h-1 bg-primary rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: dot * 0.2
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    {isCompleted && (
                      <motion.div
                        className="mt-1 text-green-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-3 h-3 mx-auto" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-6 p-4 bg-secondary/20 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>
              {progress < 10 
                ? "Analyzing PDF structure and determining exact page count..."
                : progress < 15
                ? "Confirmed total pages - preparing for comprehensive processing..."
                : progress < 65
                ? "Processing each page individually for complete accuracy (this ensures no content is missed)..."
                : progress < 80
                ? "Extracting tables and financial data from all processed pages..."
                : progress < 95
                ? "Finalizing comprehensive JSON structure with all extracted data..."
                : "Complete processing finished - all pages successfully converted to JSON..."
              }
            </span>
          </div>
          
          {progress > 15 && progress < 65 && (
            <div className="mt-2 text-xs text-primary/80 bg-primary/10 rounded p-2">
              <strong>Quality Assurance:</strong> We process every single page individually to guarantee 100% content coverage. 
              This takes more time but ensures no data is lost or skipped.
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
