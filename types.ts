
export enum Difficulty {
  PRIMARY = '小学英语',
  MIDDLE = '初中词汇',
  HIGH = '高中必备',
  COLLEGE = '大学四六级',
  ADVANCED = '托福/雅思/GRE'
}

export interface WordPair {
  id: string;
  en: string;
  zh: string;
  explanation?: string;
}

export interface Card {
  id: string;
  pairId: string;
  content: string;
  type: 'en' | 'zh';
  isMatched: boolean;
}

export type GameStatus = 'idle' | 'loading' | 'playing' | 'finished';
