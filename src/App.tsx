import { useState } from 'react';
import { Shield, HardHat, FileCheck, AlertCircle, BookOpen, Building2, Search, ClipboardCheck, Layers } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { BatchFileUploader } from '@/components/BatchFileUploader';
import { AnalysisResultView } from '@/components/AnalysisResult';
import { BatchAnalysisResultView } from '@/components/BatchAnalysisResult';
import { RegulationSearch } from '@/components/RegulationSearch';
import { useSafetyAnalysis } from '@/hooks/useSafetyAnalysis';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { KEY_AUDIT_FOCUS } from '@/types/safety';

function App() {
  const { 
    isAnalyzing, 
    currentFileIndex,
    totalFiles,
    result, 
    batchResults,
    batchSummary,
    error, 
    analyzeFile, 
    analyzeBatchFiles,
    resetResult 
  } = useSafetyAnalysis();
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [isBatchMode, setIsBatchMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">職安助手 Agent</h1>
                <p className="text-blue-200 text-sm">台灣營造工地職業安全衛生智能稽核系統</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-yellow-400" />
                <span>15年專業經驗</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-400" />
                <span>法規即時查核</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-300" />
                <span>批次分析</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              智能稽核分析
            </TabsTrigger>
            <TabsTrigger value="regulations" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              法規查詢
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            {!result && batchResults.length === 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* 歡迎區塊 */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    智能職安稽核分析
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    上傳工地現場照片或書面文件，AI 將自動辨識內容並根據
                    《職業安全衛生設施規則》及《營造安全衛生設施標準》
                    進行法規符合性分析，產出專業督導報告。
                  </p>
                </div>

                {/* 批次模式切換 */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Switch
                    id="batch-mode"
                    checked={isBatchMode}
                    onCheckedChange={setIsBatchMode}
                  />
                  <Label htmlFor="batch-mode" className="flex items-center gap-2 cursor-pointer">
                    <Layers className="w-4 h-4" />
                    批次分析模式（最多10個檔案）
                  </Label>
                </div>

                {/* 錯誤提示 */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>分析錯誤</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 檔案上傳 */}
                {isBatchMode ? (
                  <BatchFileUploader 
                    onFilesSelect={analyzeBatchFiles} 
                    isAnalyzing={isAnalyzing}
                    maxFiles={10}
                  />
                ) : (
                  <FileUploader onFileSelect={analyzeFile} isAnalyzing={isAnalyzing} />
                )}

                {/* 批次分析進度 */}
                {isAnalyzing && isBatchMode && totalFiles > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700 font-medium">
                      正在分析第 {currentFileIndex} / {totalFiles} 個檔案...
                    </p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentFileIndex / totalFiles) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 支援類型說明 */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">現場工地照片</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          開口防護檢查（電梯井、樓梯口、預留孔洞）
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          施工架安全檢查（交叉拉桿、腳趾板、壁連座）
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          高處作業檢查（安全帶使用、掛點設置）
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          臨時用電檢查（電箱、漏電斷路器、電線防護）
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FileCheck className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-800">書面文件</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          危害告知紀錄、協議組織會議紀錄
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          職業安全衛生管理計畫、工作守則
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          自動檢查紀錄、教育訓練紀錄
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          人員證照、勞工名冊、保險資料
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* 特別注意項目 */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    特別注意項目（高頻率缺失）
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {KEY_AUDIT_FOCUS.map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-1 text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                          <p className="text-xs text-gray-400">{item.regulation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 法規依據 */}
                <div className="mt-8 text-center">
                  <Separator className="mb-6" />
                  <p className="text-sm text-gray-500">
                    法規依據：《職業安全衛生法》、《職業安全衛生設施規則》、
                    《營造安全衛生設施標準》、《缺氧症預防規則》、《職業安全衛生管理辦法》
                  </p>
                </div>
              </div>
            ) : (
              <>
                {result && !batchSummary && (
                  <AnalysisResultView result={result} onReset={resetResult} />
                )}
                {batchSummary && (
                  <BatchAnalysisResultView 
                    batchSummary={batchSummary} 
                    onReset={resetResult} 
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="regulations">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  職安法規查詢系統
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  整合《職業安全衛生法》、《職業安全衛生設施規則》、
                  《營造安全衛生設施標準》、《缺氧症預防規則》等重要法規，
                  提供快速搜尋與瀏覽功能。
                </p>
              </div>
              <RegulationSearch />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            職安助手 Agent © 2024 | 本系統僅供參考，實際法規解釋以主管機關為準
          </p>
          <p className="text-xs mt-2">
            建議由專業職業安全衛生管理師進行最終審核
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
