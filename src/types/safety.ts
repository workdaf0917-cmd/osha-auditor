// 職安法規相關類型定義

export type ImageType = 'document' | 'site' | 'unknown';
export type DeficiencyLevel = '重大' | '一般' | '建議';
export type HazardType = '墜落' | '感電' | '物體飛落' | '倒塌' | '火災' | '爆炸' | '中毒' | '缺氧' | '其他';
export type ImprovementDeadline = '立即' | '24小時內' | '3天內';

export interface DeficiencyItem {
  id: string;
  item: string;
  description: string;
  level: DeficiencyLevel;
  regulation: string;
  regulationArticle?: string;
  hazardFactor: HazardType;
  suggestion: string;
  deadline: ImprovementDeadline;
}

export interface RecommendationItem {
  id: string;
  content: string;
}

export interface ScoreItem {
  id: number;
  category: string;
  item: string;
  result: boolean;
  deficiency?: string;
  scoreRange: string;
  score: number;
}

export interface AnalysisResult {
  imageType: ImageType;
  documentAnalysis?: {
    deficiencies: DeficiencyItem[];
    recommendations: RecommendationItem[];
    scoreTable: ScoreItem[];
  };
  siteAnalysis?: {
    deficiencies: DeficiencyItem[];
    recommendations: RecommendationItem[];
    scoreTable: ScoreItem[];
  };
  summary: {
    totalDeficiencies: number;
    majorCount: number;
    generalCount: number;
    suggestionCount: number;
    totalScore: number;
  };
}

// 批次分析結果
export interface BatchAnalysisResult {
  fileName: string;
  fileType: string;
  result: AnalysisResult;
  analyzedAt: string;
}

// 批次分析彙整
export interface BatchAnalysisSummary {
  results: BatchAnalysisResult[];
  overallSummary: {
    totalFiles: number;
    totalMajorDeficiencies: number;
    totalGeneralDeficiencies: number;
    averageScore: number;
  };
}

// 法規條文類型
export interface RegulationArticle {
  article: string;
  title?: string;
  content: string;
  category: string;
}

export interface RegulationCategory {
  name: string;
  description: string;
  articles: RegulationArticle[];
}

// 書面資料檢查項目
export const DOCUMENT_CHECK_ITEMS = [
  {
    category: '危害告知',
    items: [
      { id: 1, text: '承攬商施工期間每日辦理危害告知', scoreRange: '-3 ~ -0.5' },
      { id: 2, text: '告知事項包含工作環境、危害因素暨安全衛生規定應採取之措施', scoreRange: '-3 ~ -0.5' },
      { id: 3, text: '熱危害(氣溫超過36℃)之安全防護檢點表及作業勞工額溫量測紀錄表', scoreRange: '-3 ~ -0.5' },
      { id: 4, text: '抽查工作場所負責人、職安人員、相關作業主管及急救人員當日在場執行職務', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '共同作業必要措施',
    items: [
      { id: 5, text: '承攬商對分包廠商召開協議組織會議及危害告知(含書面資料)', scoreRange: '-3 ~ -0.5' },
      { id: 6, text: '協議組織會議紀錄明確指定工作場所負責人及各作業主管', scoreRange: '-3 ~ -0.5' },
      { id: 7, text: '工作場所連繫、調整及巡視紀錄', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '分項計畫提報審核',
    items: [
      { id: 8, text: '職業安全衛生管理計畫', scoreRange: '-5 ~ -0.5' },
      { id: 9, text: '局限空間危害防止計畫', scoreRange: '-5 ~ -0.5' },
      { id: 10, text: '自動檢查計畫', scoreRange: '-5 ~ -0.5' },
      { id: 11, text: '緊急應變計畫', scoreRange: '-5 ~ -0.5' },
      { id: 12, text: '墜落災害防止計畫、露天開挖計畫、擋土支撐計畫', scoreRange: '-5 ~ -0.5' },
      { id: 13, text: '工作守則', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '人員及證照',
    items: [
      { id: 14, text: '職安業務主管及管理人員', scoreRange: '-5 ~ -0.5' },
      { id: 15, text: '營造作業主管(擋土、露天開挖、模板支撐、隧道、施工架)', scoreRange: '-5 ~ -0.5' },
      { id: 16, text: '高壓氣體作業主管、潛水作業主管', scoreRange: '-5 ~ -0.5' },
      { id: 17, text: '有害作業主管(有機溶劑、缺氧等)', scoreRange: '-5 ~ -0.5' },
      { id: 18, text: '危險性機械、高空作業車操作或特殊作業人員', scoreRange: '-5 ~ -0.5' },
      { id: 19, text: '急救人員', scoreRange: '-5 ~ -0.5' },
      { id: 20, text: '各級承攬商勞工名冊、勞工保險(含職災保險)', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '教育訓練',
    items: [
      { id: 21, text: '在職勞工不得少於3小時；營造作業、車輛系營建機械', scoreRange: '-5 ~ -0.5' },
      { id: 22, text: '符合職業教育訓練機構所辦理之「一般安全衛生教育」', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '自動檢查',
    items: [
      { id: 23, text: '定期(作業)檢查：一般車輛(三個月、每日)、車輛系', scoreRange: '-5 ~ -0.5' },
      { id: 24, text: '作業檢點：營造作業(含擋土支撐、露天開挖、混凝土、施工架、模板支撐)及局限空間作業檢點表', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '假設工程圖說',
    items: [
      { id: 25, text: '高度7公尺以上且面積達330平方公尺以上之施工架、模板支撐施工圖說及強度計算書簽章確認', scoreRange: '-5 ~ -0.5' },
      { id: 26, text: '開挖1.5公尺之擋土支撐施工圖說專業人員簽認', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '其他',
    items: [
      { id: 27, text: '施工照片安全衛生設置情形及其他書面資料', scoreRange: '-6 ~ -0.5' },
      { id: 28, text: '危害鑑別風險評估表單', scoreRange: '-6 ~ -0.5' },
      { id: 29, text: '水上、臨水作業救生設備、保養維護及檢點紀錄', scoreRange: '-3 ~ -0.5' },
      { id: 30, text: '車輛、機械、設備、機具進場申請表', scoreRange: '-3 ~ -0.5' },
      { id: 31, text: '其他不符事項', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '加分項',
    items: [
      { id: 32, text: '其他優良事項(加分項)', scoreRange: '+0.1 ~ +2' },
    ]
  },
];

// 現場作業檢查項目
export const SITE_CHECK_ITEMS = [
  {
    category: '工作場所',
    items: [
      { id: 1, text: '工程作業人員正確使用安全防護器具', scoreRange: '-3 ~ -0.5' },
      { id: 2, text: '工作場所未發現酒類或含酒精性飲料', scoreRange: '-3 ~ -0.5' },
      { id: 3, text: '暴露之鋼筋彎曲尖端、加蓋或加裝護套', scoreRange: '-3 ~ -0.5' },
      { id: 4, text: '環境整理整頓', scoreRange: '-3 ~ -0.5' },
      { id: 5, text: '工作場所公告工作守則', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '人員管理',
    items: [
      { id: 6, text: '工作場所負責人及職安人員常駐工地', scoreRange: '-3 ~ -0.5' },
      { id: 7, text: '各作業主管實際在場指揮勞工作業', scoreRange: '-3 ~ -0.5' },
      { id: 8, text: '各項危險性機械或設備合格之操作人員', scoreRange: '-3 ~ -0.5' },
      { id: 9, text: '車輛性營建機械迴轉半徑專人指揮監督', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '物料之儲存',
    items: [
      { id: 10, text: '材料堆放1.8m以下且距開口2m以上', scoreRange: '-3 ~ -0.5' },
      { id: 11, text: '高壓氣體設施與易燃物存放(包含固定、消防、滅火器及標示)', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '危害預防',
    items: [
      { id: 12, text: '當日危害告知及於全部勞工', scoreRange: '-3 ~ -0.5' },
      { id: 13, text: '危害告知敘明工作環境、危害因素即應採取之措施', scoreRange: '-3 ~ -0.5' },
      { id: 14, text: '施工架及模板支撐架每周定期檢查', scoreRange: '-3 ~ -0.5' },
      { id: 15, text: '當日機械(如挖土機油壓系統)、設備檢查及作業檢', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '設施設備',
    items: [
      { id: 16, text: '開挖深度1.5m以上或有崩塌之虞設擋土措施', scoreRange: '-5 ~ -2' },
      { id: 17, text: '高低落差超過1.5m設置安全上下設備', scoreRange: '-5 ~ -2' },
      { id: 18, text: '鋼管施工架符合CNS4750品質標準，其調整座基礎地面應平整且夯實緊密，並襯以適當材質之墊材', scoreRange: '-5 ~ -0.5' },
      { id: 19, text: '2m以上施工架寬40cm以上工作台，踏板間縫隙3cm', scoreRange: '-5 ~ -0.5' },
      { id: 20, text: '系統式施工架各構件連結交叉處不得以各式活扣緊結或鐵線代替', scoreRange: '-5 ~ -0.5' },
      { id: 21, text: '2m以上開口設護欄、護蓋、安全網或安全母索', scoreRange: '-6 ~ -2' },
      { id: 22, text: '禁止鋼筋作為工作架或起重支持架', scoreRange: '-5 ~ -0.5' },
      { id: 23, text: '機械傳動帶應有防護措施', scoreRange: '-5 ~ -0.5' },
      { id: 24, text: '吊掛用具無顯著變形及有防脫裝置（吊運作業半徑)', scoreRange: '-5 ~ -2' },
      { id: 25, text: '移動梯寬度30cm以上及防止轉動及滑動之必要措施', scoreRange: '-5 ~ -0.5' },
      { id: 26, text: '合梯高度未達2m、兩梯腳間有金屬繫材及防滑絕緣', scoreRange: '-5 ~ -0.5' },
      { id: 27, text: '電氣設備絕緣、漏電斷路器、非帶電金屬外殼接地', scoreRange: '-5 ~ -2' },
      { id: 28, text: '交流電焊機自動電擊防止裝置', scoreRange: '-5 ~ -2' },
      { id: 29, text: '道路交通引導人員、電動旗手、交維設施符合規定', scoreRange: '-5 ~ -2' },
      { id: 30, text: '水上、臨水作業備置救生用具及監視人員設置', scoreRange: '-5 ~ -0.5' },
    ]
  },
  {
    category: '局限空間作業',
    items: [
      { id: 31, text: '作業場所入口處設置告示牌與門禁管制', scoreRange: '-5 ~ -0.5' },
      { id: 32, text: '氣體連續監測並定期確認氧氣及危害物質濃度', scoreRange: '-5 ~ -2' },
      { id: 33, text: '確實執行通風換氣，檢點換氣裝置紀錄', scoreRange: '-5 ~ -2' },
      { id: 34, text: '指派現場監視人員，清點進出人員與確認作業許可', scoreRange: '-5 ~ -2' },
      { id: 35, text: '作業人員配戴安全帶及必要防護器具', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '警告標示',
    items: [
      { id: 36, text: '施工架載重限制標示', scoreRange: '-3 ~ -0.5' },
      { id: 37, text: '有墜落危險場所警告標示', scoreRange: '-3 ~ -0.5' },
      { id: 38, text: '露天開挖作業工作場所警告標示', scoreRange: '-3 ~ -0.5' },
      { id: 39, text: '車輛機械迴轉半徑禁止進入標示（警示燈及蜂鳴器)', scoreRange: '-3 ~ -0.5' },
      { id: 40, text: '局限空間禁止作業無關人員進入標示', scoreRange: '-5 ~ -2' },
      { id: 41, text: '高壓氣體貯存場所警戒標示', scoreRange: '-3 ~ -0.5' },
      { id: 42, text: 'GHS、SDS標示', scoreRange: '-3 ~ -0.5' },
    ]
  },
  {
    category: '其他',
    items: [
      { id: 43, text: '工程施工即時影像系統報工情形建議事項', scoreRange: '-3 ~ -0.5' },
      { id: 44, text: '其他不符事項', scoreRange: '-3 ~ -0.5' },
    ]
  },
];

// 高頻率缺失檢查重點
export const KEY_AUDIT_FOCUS = [
  {
    id: 'opening-protection',
    title: '開口防護',
    description: '電梯井、樓梯口、預留孔洞是否設置堅固護欄或覆蓋',
    regulation: '營造安全衛生設施標準第19條、第20條',
  },
  {
    id: 'scaffold-safety',
    title: '施工架安全',
    description: '是否設置雙側交叉拉桿、腳趾板、內側護欄，以及壁連座是否穩固',
    regulation: '營造安全衛生設施標準第45條、第48條',
  },
  {
    id: 'height-work',
    title: '高處作業',
    description: '勞工是否配戴安全帶？掛點是否位於堅固構件上（而非隨意勾掛）',
    regulation: '營造安全衛生設施標準第19條、第17條',
  },
  {
    id: 'temp-electric',
    title: '臨時用電',
    description: '電箱是否加蓋、是否有漏電斷路器、電線是否架高或有破損防護',
    regulation: '職業安全衛生設施規則第243條',
  },
  {
    id: 'confined-space',
    title: '局限空間作業',
    description: '是否設置門禁管制、氣體監測、通風換氣、作業許可制度',
    regulation: '職業安全衛生設施規則第29-1條至第29-7條',
  },
  {
    id: 'hypoxia',
    title: '缺氧作業',
    description: '氧氣濃度是否維持在18%以上、是否實施適當換氣',
    regulation: '缺氧症預防規則第4條、第5條',
  },
  {
    id: 'supervisor',
    title: '作業主管',
    description: '開挖、施工架、擋土支撐等作業是否指派作業主管在場監督',
    regulation: '營造安全衛生設施標準第41條、第66條、第74條',
  },
  {
    id: 'shoring-support',
    title: '擋土支撐',
    description: '開挖深度1.5公尺以上是否設置擋土支撐、是否有專人設計簽章',
    regulation: '營造安全衛生設施標準第71條、第73條',
  },
];
