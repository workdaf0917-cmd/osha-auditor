import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, FileText, Scale, Globe, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CONSTRUCTION_SAFETY_REGULATIONS, 
  SAFETY_FACILITY_REGULATIONS,
  SAFETY_MANAGEMENT_REGULATIONS,
  OCCUPATIONAL_SAFETY_LAW,
  searchRegulations,
  type RegulationArticle 
} from '@/data/regulations';
import { 
  ALL_EXTENDED_REGULATIONS,
  searchRegulationOnline 
} from '@/data/regulations_extended';

interface RegulationCategoryProps {
  title: string;
  description: string;
  articles: RegulationArticle[];
  defaultExpanded?: boolean;
}

const RegulationCategory: React.FC<RegulationCategoryProps> = ({ 
  title, 
  description, 
  articles,
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (articles.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{articles.length} 條</Badge>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {articles.map((article, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Scale className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {article.article}
                      </Badge>
                      {article.title && (
                        <span className="font-medium text-sm">{article.title}</span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                      {article.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export function RegulationSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RegulationArticle[]>([]);
  const [onlineResults, setOnlineResults] = useState<{article: string; content: string; source: string}[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // 本地法規庫搜尋
      const localResults = searchRegulations(searchQuery);
      
      // 擴充法規庫搜尋
      const extendedResults = ALL_EXTENDED_REGULATIONS.flatMap(cat => 
        cat.articles.filter(a => 
          a.article.includes(searchQuery) || 
          (a.title && a.title.includes(searchQuery)) ||
          a.content.includes(searchQuery) ||
          a.category.includes(searchQuery)
        )
      );
      
      setSearchResults([...localResults, ...extendedResults]);
      
      // 網路搜尋補充
      setIsSearchingOnline(true);
      try {
        const online = await searchRegulationOnline(searchQuery);
        setOnlineResults(online);
      } catch (e) {
        setOnlineResults([]);
      } finally {
        setIsSearchingOnline(false);
      }
      
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const allRegulations = useMemo(() => [
    { 
      title: '營造安全衛生設施標準', 
      description: '營造工程專用之安全衛生設施規定',
      regulations: CONSTRUCTION_SAFETY_REGULATIONS 
    },
    { 
      title: '職業安全衛生設施規則', 
      description: '一般產業安全衛生設施之基本規定',
      regulations: SAFETY_FACILITY_REGULATIONS 
    },
    { 
      title: '職業安全衛生管理辦法', 
      description: '安全衛生管理組織及運作之規定',
      regulations: SAFETY_MANAGEMENT_REGULATIONS 
    },
    { 
      title: '職業安全衛生法', 
      description: '職業安全衛生之基本法律',
      regulations: OCCUPATIONAL_SAFETY_LAW 
    },
    { 
      title: '缺氧症預防規則 / 局限空間 / 作業主管', 
      description: '缺氧作業、局限空間、作業主管等擴充法規',
      regulations: ALL_EXTENDED_REGULATIONS 
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* 搜尋區塊 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            法規搜尋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="輸入關鍵字搜尋法規（如：墜落、施工架、漏電斷路器、局限空間、缺氧...）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              搜尋
            </Button>
          </div>
          
          {hasSearched && (
            <div className="mt-4">
              <Tabs defaultValue="local">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="local">
                    本地法規庫 ({searchResults.length})
                  </TabsTrigger>
                  <TabsTrigger value="online">
                    網路搜尋補充 ({onlineResults.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="local">
                  {searchResults.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{result.article}</Badge>
                            {result.title && (
                              <span className="font-medium text-sm">{result.title}</span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                            {result.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      未在本地法規庫找到相關條文
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="online">
                  {isSearchingOnline ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">正在搜尋網路法規資料...</p>
                    </div>
                  ) : onlineResults.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {onlineResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-blue-50">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{result.article}</Badge>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {result.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                            {result.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        未找到網路補充資料。建議前往
                        <a 
                          href="https://laws.mol.gov.tw/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          勞動部全國法規資料庫
                        </a>
                        查詢完整法規內容。
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 法規分類瀏覽 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          法規分類瀏覽
        </h3>
        
        {allRegulations.map((reg, idx) => (
          <div key={idx}>
            <h4 className="text-md font-medium text-gray-700 mb-2 mt-4">
              {reg.title}
            </h4>
            {reg.regulations.map((category, cidx) => (
              <RegulationCategory
                key={cidx}
                title={category.name}
                description={category.description}
                articles={category.articles}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 法規來源說明 */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>
          法規資料來源：
          <a 
            href="https://laws.mol.gov.tw/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            勞動部全國法規資料庫
          </a>
        </p>
        <p className="mt-1">本系統法規僅供參考，實際法規解釋以主管機關為準</p>
      </div>
    </div>
  );
}
