import React, { useCallback, useState } from 'react';
import { Upload, FileImage, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

export function FileUploader({ onFileSelect, isAnalyzing }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      setError('檔案大小不得超過 50MB');
      return false;
    }
    
    const validTypes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    const isValid = validTypes.some(type => 
      file.type.startsWith(type) || file.type === type
    );
    
    if (!isValid) {
      setError('不支援的檔案格式，請上傳圖片、PDF、Word 或 Excel 檔案');
      return false;
    }
    
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [selectedFile, onFileSelect]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-12 h-12 text-blue-500" />;
    }
    return <FileText className="w-12 h-12 text-orange-500" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith('image/')) return '圖片檔案';
    if (file.type === 'application/pdf') return 'PDF 文件';
    if (file.type.includes('word')) return 'Word 文件';
    if (file.type.includes('excel') || file.type.includes('sheet')) return 'Excel 試算表';
    return '未知類型';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center
            transition-all duration-200 ease-in-out
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept={Object.entries(ACCEPTED_TYPES).map(([type, exts]) => 
              type === 'image/*' ? 'image/*' : `${type},${exts.join(',')}`
            ).join(',')}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center
              ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
              transition-colors duration-200
            `}>
              <Upload className={`
                w-10 h-10 
                ${dragActive ? 'text-blue-600' : 'text-gray-400'}
              `} />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                拖曳檔案至此，或點擊選擇檔案
              </p>
              <p className="text-sm text-gray-500">
                支援圖片 (JPG, PNG, GIF)、PDF、Word (DOC, DOCX)、Excel (XLS, XLSX)
              </p>
              <p className="text-xs text-gray-400">
                單一檔案大小限制 50MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile)}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {getFileTypeLabel(selectedFile)} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1"
              disabled={isAnalyzing}
            >
              重新選擇
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  分析中...
                </>
              ) : (
                '開始分析'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
