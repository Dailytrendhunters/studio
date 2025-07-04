import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      // Show error for non-PDF files
      console.error('Please select a PDF file');
    }
  }, [onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg'
            : selectedFile && !error
            ? 'border-green-400 bg-green-50'
            : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <AnimatePresence mode="wait">
          {selectedFile && !error ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800 break-all">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <Zap className="w-4 h-4" />
                  <span>Ready for intelligent processing</span>
                </div>
              </div>
              {!isProcessing && (
                <button
                  onClick={clearFile}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove File
                </button>
              )}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-red-800">Processing Error</p>
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-gray-500">
                  Don't worry - we've generated sample data to show you how the app works!
                </p>
              </div>
              <button
                onClick={clearFile}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Try Another File
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                animate={{ 
                  y: isDragOver ? -10 : 0,
                  scale: isDragOver ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full"
              >
                {isDragOver ? (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <FileText className="w-10 h-10 text-blue-600" />
                  </motion.div>
                ) : (
                  <Upload className="w-10 h-10 text-gray-600" />
                )}
              </motion.div>
              
              <div className="space-y-3">
                <p className="text-xl font-semibold text-gray-800">
                  {isDragOver ? 'Drop your PDF here!' : 'Upload Financial PDF'}
                </p>
                <p className="text-gray-600">
                  {isDragOver 
                    ? 'Release to start intelligent processing' 
                    : 'Drag and drop your financial document or click to browse'
                  }
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span>• PDF files only</span>
                  <span>• Up to 50MB</span>
                  <span>• Secure processing</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isProcessing}
              >
                <FileText className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Choose PDF File'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Processing indicator overlay */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"
            />
            <p className="text-sm font-medium text-gray-600">Processing your PDF...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};