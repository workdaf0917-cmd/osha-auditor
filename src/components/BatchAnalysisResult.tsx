import React, { useState } from 'react';
import { 
  FileText, HardHat, AlertTriangle, CheckCircle, 
  ChevronDown, ChevronUp, Award, ArrowLeft, Download,
  BarChart3, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import type { BatchAnalysisSummary, BatchAnalysisResult, DeficiencyItem } from '@/types/safety';

interface BatchAnalysisResultProps {
  batchSummary: BatchAnalysisSummary;
  onReset: () => void;
}

const getLevelBadge = (level: string) => {
  switch (level) {
    case '重大':
      return <Badge variant="destructive" className="bg-red-600">重大</Badge>;
    case '一般':
      return <Badge variant="default" className="bg-orange-500">一般</Badge>;
    case '建議':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">建議</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

const SingleFileResult: React.FC<{ result: BatchAnalysisResult; index: number }> = ({ result, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const analysis = result.result.imageType === 'document' 
    ? result.result.documentAnalysis 
    : result.result.siteAnalysis;
  
  if (!analysis) return null;

  return (
    <div className="border rounded-lg overflow-hidden mb-4">
      <div 
        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono">{index + 1}</span>
            {result.result.imageType === 'document' ? (
              <FileText className="w-5 h-5 text-blue-600" />
            ) : (
              <HardHat className="w-5 h-5 text-orange-600" />
            )}
            <div>
              <p className="font-medium text-gray-900">{result.fileName}</p>
              <p className="text-sm text-gray-500">
                {result.result.imageType === 'document' ? '書面文件' : '現場工地'} · 
                {analysis.deficiencies.length} 項缺失 · 
                評分: {result.result.summary.totalScore}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result.result.summary.majorCount > 0 && (
              <Badge variant="destructive" className="bg-red-600">
                {result.result.summary.majorCount} 重大
              </Badge>
            )}
            {result.result.summary.generalCount > 0 && (
              <Badge variant="default" className="bg-orange-500">
                {result.result.summary.generalCount} 一般
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t bg-white">
          {/* 缺失事項 */}
          {analysis.deficiencies.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                缺失事項
              </h4>
              {analysis.deficiencies.map((def, idx) => (
                <div key={def.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 text-sm">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getLevelBadge(def.level)}
                        <span className="font-medium text-sm">{def.item}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{def.description}</p>
                      <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded">
                        <span className="font-medium">法規依據：</span>
                        {def.regulation.split('\n')[0]}
                      </div>
                      <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <span className="font-medium">改善建議：</span>
                        {def.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>未發現缺失事項，符合法規要求</span>
            </div>
          )}

          {/* 評分表 */}
          {analysis.scoreTable.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-500" />
                評分表
              </h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">序號</TableHead>
                      <TableHead>評分項目</TableHead>
                      <TableHead className="w-24">查核結果</TableHead>
                      <TableHead className="w-20">扣分</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.scoreTable.map((item) => (
                      <TableRow key={item.id} className={!item.result ? 'bg-red-50' : ''}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="text-sm">
                          <span className="text-gray-500">[{item.category}]</span> {item.item}
                        </TableCell>
                        <TableCell>
                          {item.result ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              符合
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-700">
                              未符
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className={`font-mono ${item.score < 0 ? 'text-red-600' : ''}`}>
                          {item.score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function BatchAnalysisResultView({ batchSummary, onReset }: BatchAnalysisResultProps) {
  const { overallSummary, results } = batchSummary;
  const [activeView, setActiveView] = useState('summary');

  // 彙整所有缺失
  const allDeficiencies: (DeficiencyItem & { fileName: string })[] = [];
  results.forEach(r => {
    const analysis = r.result.imageType === 'document' 
      ? r.result.documentAnalysis 
      : r.result.siteAnalysis;
    if (analysis) {
      analysis.deficiencies.forEach(d => {
        allDeficiencies.push({ ...d, fileName: r.fileName });
      });
    }
  });

  // 按缺失等級分組
  const majorDeficiencies = allDeficiencies.filter(d => d.level === '重大');
  const generalDeficiencies = allDeficiencies.filter(d => d.level === '一般');

  return (
    <div className="space-y-6">
      {/* 批次分析摘要 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                批次分析結果彙整
              </h2>
              <p className="text-gray-600 mt-1">
                分析完成時間: {new Date().toLocaleString('zh-TW')}
              </p>
            </div>
            
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-700">{overallSummary.totalFiles}</p>
                <p className="text-sm text-gray-600">分析檔案數</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{overallSummary.totalMajorDeficiencies}</p>
                <p className="text-sm text-gray-600">重大缺失</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{overallSummary.totalGeneralDeficiencies}</p>
                <p className="text-sm text-gray-600">一般缺失</p>
              </div>
              <div className="text-center pl-6 border-l">
                <p className={`text-3xl font-bold ${overallSummary.averageScore >= 80 ? 'text-green-600' : overallSummary.averageScore >= 60 ? 'text-orange-500' : 'text-red-600'}`}>
                  {overallSummary.averageScore}
                </p>
                <p className="text-sm text-gray-600">平均評分</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 切換視圖 */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">摘要統計</TabsTrigger>
          <TabsTrigger value="deficiencies">缺失彙整</TabsTrigger>
          <TabsTrigger value="details">詳細結果</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {/* 各檔案評分比較 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                各檔案評分比較
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-8">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate max-w-md">{r.fileName}</span>
                        <span className={`font-bold ${r.result.summary.totalScore >= 80 ? 'text-green-600' : r.result.summary.totalScore >= 60 ? 'text-orange-500' : 'text-red-600'}`}>
                          {r.result.summary.totalScore} 分
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${r.result.summary.totalScore >= 80 ? 'bg-green-500' : r.result.summary.totalScore >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${r.result.summary.totalScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 缺失統計 */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertOctagon className="w-5 h-5" />
                  重大缺失統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                {majorDeficiencies.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {majorDeficiencies.map((d, idx) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 rounded">
                        <span className="font-medium">{d.item}</span>
                        <span className="text-gray-500 ml-2">({d.fileName})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">無重大缺失</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-500">
                  <AlertTriangle className="w-5 h-5" />
                  一般缺失統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generalDeficiencies.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {generalDeficiencies.map((d, idx) => (
                      <div key={idx} className="text-sm p-2 bg-orange-50 rounded">
                        <span className="font-medium">{d.item}</span>
                        <span className="text-gray-500 ml-2">({d.fileName})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">無一般缺失</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deficiencies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                所有缺失事項彙整
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allDeficiencies.length > 0 ? (
                <div className="space-y-3">
                  {allDeficiencies.map((def, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 font-mono">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getLevelBadge(def.level)}
                            <span className="font-medium">{def.item}</span>
                            <span className="text-sm text-gray-500">({def.fileName})</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{def.description}</p>
                          <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            {def.regulation.split('\n')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">所有檔案均未發現缺失事項</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            {results.map((result, index) => (
              <SingleFileResult key={index} result={result} index={index} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 操作按鈕 */}
      <div className="flex justify-center gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="px-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          分析新檔案
        </Button>
        <Button 
          onClick={() => window.print()}
          className="px-8 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          匯出報告
        </Button>
      </div>

      {/* 免責聲明 */}
      <div className="text-center text-xs text-gray-400 pt-4">
        <p>本分析結果僅供參考，最終法規解釋以主管機關為準</p>
        <p>如有疑問，請諮詢專業職業安全衛生管理人員</p>
      </div>
    </div>
  );
}
