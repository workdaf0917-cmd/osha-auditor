import React from 'react';
import { 
  AlertTriangle, CheckCircle, Info, FileText, HardHat, 
  ChevronDown, ChevronUp, Award,
  ShieldAlert, Zap, ArrowDownFromLine, Package, Flame,
  Droplets, Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import type { AnalysisResult as AnalysisResultType, DeficiencyItem, ScoreItem, DeficiencyLevel, HazardType } from '@/types/safety';

interface AnalysisResultProps {
  result: AnalysisResultType;
  onReset: () => void;
}

const getLevelBadge = (level: DeficiencyLevel) => {
  switch (level) {
    case '重大':
      return <Badge variant="destructive" className="bg-red-600">重大</Badge>;
    case '一般':
      return <Badge variant="default" className="bg-orange-500">一般</Badge>;
    case '建議':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">建議</Badge>;
  }
};

const getHazardIcon = (hazard: HazardType) => {
  switch (hazard) {
    case '墜落':
      return <ArrowDownFromLine className="w-4 h-4" />;
    case '感電':
      return <Zap className="w-4 h-4" />;
    case '物體飛落':
      return <Package className="w-4 h-4" />;
    case '倒塌':
      return <ChevronDown className="w-4 h-4" />;
    case '火災':
      return <Flame className="w-4 h-4" />;
    case '爆炸':
      return <ShieldAlert className="w-4 h-4" />;
    case '中毒':
      return <Droplets className="w-4 h-4" />;
    case '其他':
      return <Wind className="w-4 h-4" />;
  }
};

const getDeadlineBadge = (deadline: string) => {
  switch (deadline) {
    case '立即':
      return <Badge variant="destructive">立即</Badge>;
    case '24小時內':
      return <Badge variant="default" className="bg-orange-500">24小時內</Badge>;
    case '3天內':
      return <Badge variant="secondary">3天內</Badge>;
    default:
      return <Badge variant="outline">{deadline}</Badge>;
  }
};

const DeficiencyTable: React.FC<{ items: DeficiencyItem[]; title: string }> = ({ items, title }) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  if (items.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">未發現缺失事項，符合法規要求</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          {title}
          <Badge variant="outline" className="ml-2">{items.length} 項</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-mono">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getLevelBadge(item.level)}
                      <span className="font-medium">{item.item}</span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                  </div>
                  {expandedItems.has(item.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedItems.has(item.id) && (
                <div className="p-4 border-t bg-white">
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">法規依據</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{item.regulation}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">危害因子</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getHazardIcon(item.hazardFactor)}
                          {item.hazardFactor}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">改善期限</p>
                        <div>{getDeadlineBadge(item.deadline)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">改善建議</p>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">{item.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ScoreTable: React.FC<{ items: ScoreItem[]; title: string }> = ({ items, title }) => {
  const totalScore = items.reduce((sum, item) => sum + item.score, 100);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">總分:</span>
            <span className={`text-2xl font-bold ${totalScore >= 80 ? 'text-green-600' : totalScore >= 60 ? 'text-orange-500' : 'text-red-600'}`}>
              {totalScore}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">序號</TableHead>
                <TableHead>評分項目</TableHead>
                <TableHead className="w-24">查核結果</TableHead>
                <TableHead>缺失項目</TableHead>
                <TableHead className="w-24">級距</TableHead>
                <TableHead className="w-20">扣分</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className={!item.result ? 'bg-red-50' : ''}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm">
                      <span className="text-gray-500">[{item.category}]</span>
                      <br />
                      {item.item}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.result ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        符合
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                        V
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-red-600 max-w-xs">
                    {item.deficiency || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{item.scoreRange}</TableCell>
                  <TableCell className={`font-mono ${item.score < 0 ? 'text-red-600' : item.score > 0 ? 'text-green-600' : ''}`}>
                    {item.score > 0 ? `+${item.score}` : item.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const Recommendations: React.FC<{ items: { id: string; content: string }[] }> = ({ items }) => {
  if (items.length === 0) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          建議事項
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 font-mono">{index + 1}</span>
              <p className="text-gray-700">{item.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function AnalysisResultView({ result, onReset }: AnalysisResultProps) {
  const { imageType, summary } = result;
  const analysis = imageType === 'document' ? result.documentAnalysis : result.siteAnalysis;
  
  if (!analysis) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <p className="text-gray-600">分析結果載入失敗</p>
        <Button onClick={onReset} className="mt-4">
          重新分析
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 摘要卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {imageType === 'document' ? (
                  <>
                    <FileText className="w-6 h-6 text-blue-600" />
                    書面資料分析結果
                  </>
                ) : (
                  <>
                    <HardHat className="w-6 h-6 text-orange-600" />
                    現場作業分析結果
                  </>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                分析完成時間: {new Date().toLocaleString('zh-TW')}
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{summary.majorCount}</p>
                <p className="text-sm text-gray-600">重大缺失</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{summary.generalCount}</p>
                <p className="text-sm text-gray-600">一般缺失</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{summary.suggestionCount}</p>
                <p className="text-sm text-gray-600">建議事項</p>
              </div>
              <div className="text-center pl-4 border-l">
                <p className={`text-3xl font-bold ${summary.totalScore >= 80 ? 'text-green-600' : summary.totalScore >= 60 ? 'text-orange-500' : 'text-red-600'}`}>
                  {summary.totalScore}
                </p>
                <p className="text-sm text-gray-600">總評分</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 缺失事項 */}
      <DeficiencyTable 
        items={analysis.deficiencies} 
        title={imageType === 'document' ? '壹、書面資料缺失事項' : '貳、現場作業缺失事項'}
      />

      {/* 建議事項 */}
      <Recommendations items={analysis.recommendations} />

      {/* 評分表 */}
      <ScoreTable 
        items={analysis.scoreTable} 
        title={imageType === 'document' ? '壹、書面資料評分表' : '貳、現場作業評分表'}
      />

      {/* 操作按鈕 */}
      <div className="flex justify-center gap-4 pt-6">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="px-8"
        >
          分析新檔案
        </Button>
        <Button 
          onClick={() => window.print()}
          className="px-8 bg-blue-600 hover:bg-blue-700"
        >
          列印報告
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
