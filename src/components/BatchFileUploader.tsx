import React, { useCallback, useState } from 'react';
import { Upload, FileImage, FileText, X, AlertCircle, File, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface BatchFileUploaderProps {
  onFilesSelect: (files: File[]) => void;
  isAnalyzing: boolean;
  maxFiles?: number;
}

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_MAX_FILES = 10; // 預設最多10個檔案

interface FileWithStatus {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function BatchFileUploader({ 
  onFilesSelect, 
  isAnalyzing, 
  maxFiles = DEFAULT_MAX_FILES 
}: BatchFileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `檔案大小不得超過 50MB`;
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
      return '不支援的檔案格式';
    }
    
    return null;
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

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    
    setGlobalError(null);
    const newFiles: FileWithStatus[] = [];
    
    // 檢查是否超過最大檔案數
    if (selectedFiles.length + files.length > maxFiles) {
      setGlobalError(`最多只能上傳 ${maxFiles} 個檔案`);
      return;
    }

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      newFiles.push({
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      });
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }, [selectedFiles.length, maxFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    addFiles(e.target.files);
    // 重置 input 以便可以重複選擇相同檔案
    e.target.value = '';
  }, [selectedFiles.length, maxFiles]);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
    setGlobalError(null);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setGlobalError(null);
  };

  const handleSubmit = useCallback(() => {
    const validFiles = selectedFiles
      .filter(f => f.status !== 'error')
      .map(f => f.file);
    
    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    }
  }, [selectedFiles, onFilesSelect]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    }
    return <FileText className="w-8 h-8 text-orange-500" />;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith('image/')) return '圖片';
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type.includes('word')) return 'Word';
    if (file.type.includes('excel') || file.type.includes('sheet')) return 'Excel';
    return '其他';
  };

  const validFilesCount = selectedFiles.filter(f => f.status !== 'error').length;
  const errorFilesCount = selectedFiles.filter(f => f.status === 'error').length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {globalError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* 上傳區域 */}
      {selectedFiles.length < maxFiles && (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center
            transition-all duration-200 ease-in-out mb-6
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
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept={Object.entries(ACCEPTED_TYPES).map(([type, exts]) => 
              type === 'image/*' ? 'image/*' : `${type},${exts.join(',')}`
            ).join(',')}
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
              transition-colors duration-200
            `}>
              <Upload className={`
                w-8 h-8 
                ${dragActive ? 'text-blue-600' : 'text-gray-400'}
              `} />
            </div>
            
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-700">
                拖曳檔案至此，或點擊選擇檔案
              </p>
              <p className="text-sm text-gray-500">
                支援圖片、PDF、Word、Excel（最多 {maxFiles} 個檔案）
              </p>
              <p className="text-xs text-gray-400">
                單一檔案大小限制 50MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 檔案列表 */}
      {selectedFiles.length > 0 && (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">
                已選擇 {selectedFiles.length} 個檔案
              </span>
              {validFilesCount > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  {validFilesCount} 個有效
                </Badge>
              )}
              {errorFilesCount > 0 && (
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errorFilesCount} 個錯誤
                </Badge>
              )}
            </div>
            <button
              onClick={clearAllFiles}
              disabled={isAnalyzing}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              全部清除
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {selectedFiles.map((fileWithStatus, index) => (
              <div 
                key={fileWithStatus.id}
                className={`
                  p-3 flex items-center gap-3 border-b last:border-b-0
                  ${fileWithStatus.status === 'error' ? 'bg-red-50' : 'hover:bg-gray-50'}
                `}
              >
                <span className="text-gray-400 font-mono text-sm w-6">
                  {index + 1}
                </span>
                
                {getFileIcon(fileWithStatus.file)}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {fileWithStatus.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      {getFileTypeLabel(fileWithStatus.file)}
                    </span>
                    <span className="text-gray-400">
                      {(fileWithStatus.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {fileWithStatus.status === 'error' && fileWithStatus.error && (
                      <span className="text-red-500">
                        {fileWithStatus.error}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(fileWithStatus.id)}
                  disabled={isAnalyzing}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>

          {/* 進度條（分析中顯示） */}
          {isAnalyzing && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">正在分析檔案...</span>
                <span className="text-sm text-gray-500">請稍候</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="p-4 border-t bg-gray-50 flex gap-3">
            <Button
              variant="outline"
              onClick={clearAllFiles}
              disabled={isAnalyzing}
              className="flex-1"
            >
              重新選擇
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isAnalyzing || validFilesCount === 0}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  分析中...
                </>
              ) : (
                `開始分析 (${validFilesCount} 個檔案)`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
