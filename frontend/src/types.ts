export interface ExpectedChunk {
  text: string;
  kana: string;
  phonemes: string[];
  index: number;
}

export interface SavedSentence {
  id: string;
  text: string;
  createdAt: string;
}

export interface ScoreDetail {
  phoneme: number;
  completeness: number;
  fluency: number;
  overall: number;
}

export interface ChunkAlignment {
  text: string;
  kana?: string;
  romaji?: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
  phonemes: string[];
}

export interface PronunciationError {
  word: string;
  token: string;
  type: string;
  severity: 'info' | 'minor' | 'major';
  message: string;
  fix_suggestion: string;
}

export interface ScoreData {
  status: 'success' | 'error';
  error_type?: string;
  message?: string;
  transcription?: string;
  asr_text?: string;
  score?: number;
  scores?: ScoreDetail;
  alignment?: ChunkAlignment[];
  errors?: PronunciationError[];
  feedback?: string[];
}

export interface HistoryItem {
  id: string;
  text: string;
  date: string;
  score: number;
  phoneme: number;
  completeness: number;
  fluency: number;
  source: 'record' | 'upload';
  scoreData?: ScoreData;
}
