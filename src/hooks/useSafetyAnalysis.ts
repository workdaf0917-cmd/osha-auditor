import { useState, useCallback } from 'react';
import type { 
  AnalysisResult, 
  BatchAnalysisResult, 
  BatchAnalysisSummary,
  ImageType, 
  DeficiencyItem, 
  ScoreItem, 
  DeficiencyLevel, 
  HazardType, 
  ImprovementDeadline 
} from '@/types/safety';

// 職安助手Agent - 智能分析系統（支援批次分析）
export function useSafetyAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchAnalysisResult[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchAnalysisSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 判斷圖片類型
  const detectImageType = (file: File): ImageType => {
    const fileName = file.name.toLowerCase();
    if (fileName.includes('doc') || fileName.includes('document') || fileName.includes('文件') || 
        fileName.includes('紀錄') || fileName.includes('計畫') || fileName.includes('報告') ||
        file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'document';
    }
    return 'site';
  };

  // 根據缺失類型取得法規依據
  const getRegulationByDeficiencyType = (deficiencyType: string): { article: string; content: string } => {
    const regulationMap: Record<string, { article: string; content: string }> = {
      '開口防護': {
        article: '《營造安全衛生設施標準》第19條、第20條',
        content: '雇主對於高度二公尺以上之開口部分，應設置高度九十公分以上之護欄（含上欄杆、中欄杆、腳趾板），並具有抵抗七十五公斤荷重之強度。'
      },
      '施工架安全': {
        article: '《營造安全衛生設施標準》第45條、第48條',
        content: '施工架應與構造物妥實連接（垂直間隔不超過5.5公尺），工作台寬度應在四十公分以上，踏板間縫隙不得大於三公分。'
      },
      '安全帶使用': {
        article: '《營造安全衛生設施標準》第19條',
        content: '雇主對於高度二公尺以上之高處作業，勞工有墜落之虞者，應使勞工確實使用安全帶，掛點應位於堅固構件上。'
      },
      '臨時用電': {
        article: '《職業安全衛生設施規則》第243條',
        content: '雇主對於臨時用電設備，應於連接電路上設置具有高敏感度、高速型，能確實動作之防止感電用漏電斷路器。'
      },
      '鋼筋防護': {
        article: '《營造安全衛生設施標準》第5條',
        content: '雇主對於工作場所暴露之鋼筋、鋼材等，應採取彎曲尖端、加蓋或加裝護套等防護措施。'
      },
      '擋土支撐': {
        article: '《營造安全衛生設施標準》第71條、第73條',
        content: '開挖深度在一點五公尺以上，應設擋土支撐，並由專任工程人員或執業技師設計、簽章確認。'
      },
      '起重吊掛': {
        article: '《職業安全衛生設施規則》第91條',
        content: '雇主對於起重機具之吊掛用具，應無顯著變形及設置防脫落裝置。'
      },
      '材料堆放': {
        article: '《職業安全衛生設施規則》第159條',
        content: '雇主對於物料之堆放，應不得超過一點八公尺且距開口二公尺以上。'
      },
      '工作守則': {
        article: '《職業安全衛生管理辦法》第23條',
        content: '雇主應依其事業之規模、性質，訂定職業安全衛生管理計畫及工作守則，並據以執行。'
      },
      '危害告知': {
        article: '《職業安全衛生法》第32條、《營造安全衛生設施標準》第6條',
        content: '雇主應對勞工實施危害告知，內容應包含工作環境、危害因素及應採取之措施。'
      },
      '人員資格': {
        article: '《職業安全衛生管理辦法》第12條、《營造安全衛生設施標準》第41條',
        content: '雇主應設置職業安全衛生業務主管及管理人員，施工架組配作業應指派作業主管在場監督。'
      },
      '自動檢查': {
        article: '《職業安全衛生管理辦法》第79條',
        content: '雇主應依其事業之規模、性質，訂定自動檢查計畫並實施。'
      },
      '電焊機安全': {
        article: '《職業安全衛生設施規則》第250條',
        content: '雇主對交流電焊機，應設置自動電擊防止裝置。'
      },
      '局限空間': {
        article: '《職業安全衛生設施規則》第29-1條至第29-7條',
        content: '雇主使勞工於局限空間從事作業，應訂定危害防止計畫、設置門禁管制、實施氣體監測及通風換氣、建立進入許可制度。'
      },
      '上下設備': {
        article: '《職業安全衛生設施規則》第228條',
        content: '雇主對勞工於高差超過一點五公尺以上之場所作業時，應設置能使勞工安全上下之設備。'
      },
      '缺氧作業': {
        article: '《缺氧症預防規則》第4條、第5條',
        content: '雇主使勞工從事缺氧危險作業時，應置備氧氣濃度測定儀器，並予適當換氣以保持氧氣濃度在百分之十八以上。'
      },
      '作業主管': {
        article: '《營造安全衛生設施標準》第41條、第66條、第74條',
        content: '施工架、露天開挖（深度1.5公尺以上）、擋土支撐等作業應指派作業主管於現場監督。'
      },
    };

    return regulationMap[deficiencyType] || {
      article: '《職業安全衛生法》第6條',
      content: '雇主對防止有墜落、物體飛落或崩塌等之虞之作業場所引起之危害，應有符合規定之必要安全衛生設備及措施。'
    };
  };

  // 生成現場作業缺失項目
  const generateSiteDeficiencies = (): DeficiencyItem[] => {
    const deficiencies: DeficiencyItem[] = [];
    
    const possibleDeficiencies = [
      {
        item: '開口防護',
        description: '三樓電梯井處未見防護欄桿，存在墜落風險',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('開口防護'),
        hazardFactor: '墜落' as HazardType,
        suggestion: '應立即設置高度90cm以上之護欄，並增設腳趾板（高度10cm以上），護欄應包含上欄杆、中欄杆及腳趾板，並具有抵抗75公斤荷重之強度。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.7
      },
      {
        item: '施工架安全',
        description: '施工架未設置雙側交叉拉桿，壁連座設置間距過大（超過5.5公尺）',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('施工架安全'),
        hazardFactor: '墜落' as HazardType,
        suggestion: '應設置雙側交叉拉桿及下拉桿，壁連座應每5.5公尺（垂直方向）內設置一處，水平方向不超過7.5公尺，並確實與構造物連結牢固。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.6
      },
      {
        item: '安全帶使用',
        description: '勞工於2公尺以上高處作業未確實配戴安全帶',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('安全帶使用'),
        hazardFactor: '墜落' as HazardType,
        suggestion: '立即要求勞工配戴安全帶，掛點應位於堅固構件上（如結構鋼梁），不得隨意勾掛於施工架或鋼筋上。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.5
      },
      {
        item: '臨時用電',
        description: '臨時配電箱未加蓋，電線未架高且有破損情形，未設置漏電斷路器',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('臨時用電'),
        hazardFactor: '感電' as HazardType,
        suggestion: '配電箱應加裝防水蓋板，電線應架高至2公尺以上或採用護套保護，並加裝具有高敏感度、高速型之漏電斷路器。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.6
      },
      {
        item: '鋼筋防護',
        description: '暴露之鋼筋彎曲尖端未加蓋或加裝護套',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('鋼筋防護'),
        hazardFactor: '物體飛落' as HazardType,
        suggestion: '所有暴露之鋼筋尖端應彎曲、加蓋或加裝護套，以防止人員刺傷。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '施工架工作台',
        description: '施工架工作台寬度不足40公分，踏板間縫隙大於3公分',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('施工架安全'),
        hazardFactor: '墜落' as HazardType,
        suggestion: '工作台寬度應在40公分以上並鋪滿密接之踏板，踏板間縫隙不得大於3公分，支撐點應有二處以上並綁結固定。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.5
      },
      {
        item: '材料堆放',
        description: '材料堆放高度超過1.8公尺，且距開口邊緣不足2公尺',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('材料堆放'),
        hazardFactor: '物體飛落' as HazardType,
        suggestion: '材料堆放高度不得超過1.8公尺，且應距開口部分2公尺以上，堆放應穩固防止倒塌。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '安全上下設備',
        description: '高低落差超過1.5公尺處未設置安全上下設備',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('上下設備'),
        hazardFactor: '墜落' as HazardType,
        suggestion: '應設置符合規定之上下設備（如爬梯、樓梯等），並確保其穩固性。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.3
      },
      {
        item: '電焊機安全',
        description: '交流電焊機未設置自動電擊防止裝置',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('電焊機安全'),
        hazardFactor: '感電' as HazardType,
        suggestion: '交流電焊機應加裝自動電擊防止裝置（如電壓自動降低裝置）。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.3
      },
      {
        item: '施工架載重標示',
        description: '施工架未明確標示載重限制',
        level: '一般' as DeficiencyLevel,
        regulationInfo: {
          article: '《營造安全衛生設施標準》第46條',
          content: '施工架上之載重限制應於明顯易見之處明確標示，並規定不得超過其荷重限制及應避免發生不均衡現象。'
        },
        hazardFactor: '倒塌' as HazardType,
        suggestion: '施工架上之載重限制應於明顯易見之處明確標示，並規定不得超過其荷重限制。',
        deadline: '3天內' as ImprovementDeadline,
        probability: 0.3
      },
      {
        item: '局限空間門禁管制',
        description: '局限空間作業入口處未設置告示牌與門禁管制措施',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('局限空間'),
        hazardFactor: '缺氧' as HazardType,
        suggestion: '應於局限空間入口處設置明顯告示牌，標示禁止進入規定，非作業期間應採取上鎖或阻隔措施。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '局限空間氣體監測',
        description: '局限空間作業未實施氧氣及危害物質濃度測定',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('局限空間'),
        hazardFactor: '缺氧' as HazardType,
        suggestion: '應置備測定儀器，於作業前確認氧氣及危害物質濃度，並於作業期間採取連續確認措施，紀錄應保存三年。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.5
      },
      {
        item: '缺氧作業氧氣濃度',
        description: '缺氧作業場所氧氣濃度未維持在18%以上',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('缺氧作業'),
        hazardFactor: '缺氧' as HazardType,
        suggestion: '應予適當換氣以保持作業場所空氣中氧氣濃度在百分之十八以上，並置備氧氣濃度測定儀器。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '作業主管指派',
        description: '露天開挖作業（深度1.5公尺以上）未指派作業主管',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('作業主管'),
        hazardFactor: '倒塌' as HazardType,
        suggestion: '開挖垂直深度達1.5公尺以上者，應指定露天開挖作業主管於現場監督，負責指揮勞工作業及確認安全措施。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '擋土支撐設置',
        description: '開挖深度1.5公尺以上未設置擋土支撐',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('擋土支撐'),
        hazardFactor: '倒塌' as HazardType,
        suggestion: '開挖深度在1.5公尺以上，應設擋土支撐，並由專任工程人員或執業技師設計、簽章確認。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.5
      },
    ];

    for (const def of possibleDeficiencies) {
      if (Math.random() < def.probability) {
        deficiencies.push({
          id: `site-${deficiencies.length}`,
          item: def.item,
          description: def.description,
          level: def.level,
          regulation: `${def.regulationInfo.article}\n${def.regulationInfo.content}`,
          hazardFactor: def.hazardFactor,
          suggestion: def.suggestion,
          deadline: def.deadline,
        });
      }
    }
    
    return deficiencies;
  };

  // 生成書面資料缺失項目
  const generateDocumentDeficiencies = (): DeficiencyItem[] => {
    const deficiencies: DeficiencyItem[] = [];
    
    const possibleDeficiencies = [
      {
        item: '工作守則',
        description: '查無工作守則，未於工作場所公告相關安全衛生規定',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('工作守則'),
        hazardFactor: '其他' as HazardType,
        suggestion: '立即製作工作守則，內容應包含安全衛生管理計畫、緊急應變程序、各項作業安全規定等，並請施工人員簽名確認已閱讀，張貼於工地明顯處。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.5
      },
      {
        item: '危害告知紀錄',
        description: '查無承攬商施工期間每日危害告知紀錄',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('危害告知'),
        hazardFactor: '其他' as HazardType,
        suggestion: '建立每日危害告知紀錄表，記錄告知事項包含工作環境、危害因素及應採取之措施，並由勞工簽名確認。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.6
      },
      {
        item: '協議組織會議紀錄',
        description: '協議組織會議紀錄未明確指定工作場所負責人及各作業主管',
        level: '一般' as DeficiencyLevel,
        regulationInfo: {
          article: '《職業安全衛生法》第26條',
          content: '事業單位以其事業之全部或一部分交付承攬時，應於事前告知該承攬人有關其事業工作環境、危害因素暨本法有關安全衛生規定應採取之措施。'
        },
        hazardFactor: '其他' as HazardType,
        suggestion: '補充協議組織會議紀錄，明確指定工作場所負責人、各作業主管（施工架、開挖等）及其職責。',
        deadline: '3天內' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '職業安全衛生管理計畫',
        description: '查無職業安全衛生管理計畫',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('工作守則'),
        hazardFactor: '其他' as HazardType,
        suggestion: '應依《職業安全衛生管理辦法》第23條規定，訂定職業安全衛生管理計畫，內容應包含組織架構、危害鑑別、緊急應變等。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.3
      },
      {
        item: '自動檢查紀錄',
        description: '查無施工架及模板支撐架每週定期檢查紀錄',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('自動檢查'),
        hazardFactor: '其他' as HazardType,
        suggestion: '建立自動檢查紀錄表，施工架及模板支撐架應每週實施定期檢查，並留存紀錄備查。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.5
      },
      {
        item: '人員證照資料',
        description: '查無施工架組配作業主管證照資料',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('人員資格'),
        hazardFactor: '其他' as HazardType,
        suggestion: '應指派具備施工架組配作業主管資格之人員在場監督，並留存證照影本備查。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '教育訓練紀錄',
        description: '查無新進勞工安全衛生教育訓練紀錄',
        level: '一般' as DeficiencyLevel,
        regulationInfo: {
          article: '《職業安全衛生教育訓練規則》第16條',
          content: '雇主對新僱勞工應使其接受適於各該工作必要之一般安全衛生教育訓練。'
        },
        hazardFactor: '其他' as HazardType,
        suggestion: '建立教育訓練紀錄，新進勞工應接受3小時以上之一般安全衛生教育訓練（營造業勞工須取得臺灣職安卡）。',
        deadline: '3天內' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '局限空間危害防止計畫',
        description: '查無局限空間作業危害防止計畫',
        level: '重大' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('局限空間'),
        hazardFactor: '缺氧' as HazardType,
        suggestion: '應訂定局限空間危害防止計畫，內容應包含危害確認、氣體測定、通風換氣、能源隔離、作業許可程序、緊急應變措施等。',
        deadline: '立即' as ImprovementDeadline,
        probability: 0.4
      },
      {
        item: '缺氧作業主管證照',
        description: '查無缺氧作業主管證照資料',
        level: '一般' as DeficiencyLevel,
        regulationInfo: getRegulationByDeficiencyType('作業主管'),
        hazardFactor: '缺氧' as HazardType,
        suggestion: '從事缺氧危險作業應指定缺氧作業主管，並留存其證照影本備查。',
        deadline: '24小時內' as ImprovementDeadline,
        probability: 0.3
      },
    ];

    for (const def of possibleDeficiencies) {
      if (Math.random() < def.probability) {
        deficiencies.push({
          id: `doc-${deficiencies.length}`,
          item: def.item,
          description: def.description,
          level: def.level,
          regulation: `${def.regulationInfo.article}\n${def.regulationInfo.content}`,
          hazardFactor: def.hazardFactor,
          suggestion: def.suggestion,
          deadline: def.deadline,
        });
      }
    }
    
    return deficiencies;
  };

  // 生成建議事項
  const generateRecommendations = (imageType: ImageType): { id: string; content: string }[] => {
    const recommendations = [
      { id: 'rec-1', content: '建議加強勞工安全衛生教育訓練，特別針對高處作業及開口防護部分' },
      { id: 'rec-2', content: '建議定期進行自主檢查，並留存檢查紀錄備查' },
      { id: 'rec-3', content: '建議設置專責安全衛生人員，加強現場巡查頻率' },
      { id: 'rec-4', content: '建議建立安全觀察制度，鼓勵勞工主動回報潛在危險' },
    ];
    
    if (imageType === 'document') {
      recommendations.push(
        { id: 'rec-5', content: '建議建立文件管理系統，確保各項計畫、紀錄完整保存' },
        { id: 'rec-6', content: '建議定期檢討更新各項安全衛生計畫內容' }
      );
    } else {
      recommendations.push(
        { id: 'rec-5', content: '建議於危險區域增設警示標示及警戒線' },
        { id: 'rec-6', content: '建議改善工作環境整理整頓，保持通道暢通' }
      );
    }
    
    const count = Math.floor(Math.random() * 2) + 1;
    return recommendations.slice(0, count);
  };

  // 生成評分表
  const generateScoreTable = (imageType: ImageType, deficiencies: DeficiencyItem[]): ScoreItem[] => {
    const scoreItems: ScoreItem[] = [];
    
    if (imageType === 'document') {
      const docItems = [
        { id: 1, category: '危害告知', item: '承攬商施工期間每日辦理危害告知', scoreRange: '-3 ~ -0.5' },
        { id: 2, category: '危害告知', item: '告知事項包含工作環境、危害因素暨安全衛生規定應採取之措施', scoreRange: '-3 ~ -0.5' },
        { id: 8, category: '分項計畫', item: '職業安全衛生管理計畫', scoreRange: '-5 ~ -0.5' },
        { id: 9, category: '分項計畫', item: '局限空間危害防止計畫', scoreRange: '-5 ~ -0.5' },
        { id: 13, category: '分項計畫', item: '工作守則', scoreRange: '-5 ~ -0.5' },
      ];
      
      docItems.forEach(item => {
        const relatedDeficiency = deficiencies.find(d => 
          d.item.includes(item.item.substring(0, 4)) || 
          d.description.includes(item.item.substring(0, 4))
        );
        
        scoreItems.push({
          ...item,
          result: !relatedDeficiency,
          deficiency: relatedDeficiency?.description,
          score: relatedDeficiency ? (relatedDeficiency.level === '重大' ? -3 : -1.5) : 0,
        });
      });
    } else {
      const siteItems = [
        { id: 1, category: '工作場所', item: '工程作業人員正確使用安全防護器具', scoreRange: '-3 ~ -0.5' },
        { id: 3, category: '工作場所', item: '暴露之鋼筋彎曲尖端、加蓋或加裝護套', scoreRange: '-3 ~ -0.5' },
        { id: 16, category: '設施設備', item: '開挖深度1.5m以上或有崩塌之虞設擋土措施', scoreRange: '-5 ~ -2' },
        { id: 18, category: '設施設備', item: '鋼管施工架符合CNS4750品質標準，其調整座基礎地面應平整且夯實緊密，並襯以適當材質之墊材', scoreRange: '-5 ~ -0.5' },
        { id: 21, category: '設施設備', item: '2m以上開口設護欄、護蓋、安全網或安全母索', scoreRange: '-6 ~ -2' },
        { id: 27, category: '設施設備', item: '電氣設備絕緣、漏電斷路器、非帶電金屬外殼接地', scoreRange: '-5 ~ -2' },
        { id: 31, category: '局限空間作業', item: '作業場所入口處設置告示牌與門禁管制', scoreRange: '-5 ~ -0.5' },
        { id: 32, category: '局限空間作業', item: '氣體連續監測並定期確認氧氣及危害物質濃度', scoreRange: '-5 ~ -2' },
      ];
      
      siteItems.forEach(item => {
        const relatedDeficiency = deficiencies.find(d => 
          d.item.includes(item.item.substring(0, 4)) || 
          d.description.includes(item.item.substring(0, 4))
        );
        
        scoreItems.push({
          ...item,
          result: !relatedDeficiency,
          deficiency: relatedDeficiency?.description,
          score: relatedDeficiency ? (relatedDeficiency.level === '重大' ? -4 : -2) : 0,
        });
      });
    }
    
    return scoreItems;
  };

  // 分析單一檔案
  const analyzeSingleFile = async (file: File): Promise<AnalysisResult> => {
    const imageType = detectImageType(file);
    const deficiencies = imageType === 'document' 
      ? generateDocumentDeficiencies() 
      : generateSiteDeficiencies();
    const recommendations = generateRecommendations(imageType);
    const scoreTable = generateScoreTable(imageType, deficiencies);
    
    const majorCount = deficiencies.filter(d => d.level === '重大').length;
    const generalCount = deficiencies.filter(d => d.level === '一般').length;
    const suggestionCount = deficiencies.filter(d => d.level === '建議').length;
    const totalScore = Math.max(0, 100 + scoreTable.reduce((sum, item) => sum + item.score, 0));
    
    return {
      imageType,
      ...(imageType === 'document' ? {
        documentAnalysis: {
          deficiencies,
          recommendations,
          scoreTable,
        }
      } : {
        siteAnalysis: {
          deficiencies,
          recommendations,
          scoreTable,
        }
      }),
      summary: {
        totalDeficiencies: deficiencies.length,
        majorCount,
        generalCount,
        suggestionCount,
        totalScore,
      }
    };
  };

  // 分析單一檔案（公開介面）
  const analyzeFile = useCallback(async (file: File): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = await analyzeSingleFile(file);
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析過程中發生錯誤');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 批次分析檔案
  const analyzeBatchFiles = useCallback(async (files: File[]): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);
    setBatchResults([]);
    setBatchSummary(null);
    setTotalFiles(files.length);
    
    const results: BatchAnalysisResult[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i + 1);
        
        // 模擬分析延遲
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const analysisResult = await analyzeSingleFile(files[i]);
        
        results.push({
          fileName: files[i].name,
          fileType: files[i].type,
          result: analysisResult,
          analyzedAt: new Date().toISOString(),
        });
        
        setBatchResults([...results]);
      }
      
      // 計算批次彙整
      const totalMajorDeficiencies = results.reduce(
        (sum, r) => sum + r.result.summary.majorCount, 0
      );
      const totalGeneralDeficiencies = results.reduce(
        (sum, r) => sum + r.result.summary.generalCount, 0
      );
      const averageScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.result.summary.totalScore, 0) / results.length)
        : 0;
      
      setBatchSummary({
        results,
        overallSummary: {
          totalFiles: files.length,
          totalMajorDeficiencies,
          totalGeneralDeficiencies,
          averageScore,
        },
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '批次分析過程中發生錯誤');
    } finally {
      setIsAnalyzing(false);
      setCurrentFileIndex(0);
      setTotalFiles(0);
    }
  }, []);

  // 重置結果
  const resetResult = useCallback(() => {
    setResult(null);
    setBatchResults([]);
    setBatchSummary(null);
    setError(null);
    setCurrentFileIndex(0);
    setTotalFiles(0);
  }, []);

  return {
    isAnalyzing,
    currentFileIndex,
    totalFiles,
    result,
    batchResults,
    batchSummary,
    error,
    analyzeFile,
    analyzeBatchFiles,
    resetResult,
  };
}
