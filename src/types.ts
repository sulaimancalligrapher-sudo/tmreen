/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeaderData {
  logoUrl: string;
  mainTitle: string;
  description: string;
  buttons: Array<{ buttonText: string; buttonUrl: string }>;
}

export interface Student {
  name: string;
  id: string;
}

export interface OrderingLessonTopic {
  row: number;
  topic: string;
  isCompleted: boolean;
  allowReset: boolean;
  maxResets: number;
  usedResets: number;
}

export interface OrderingQuestion {
  topic: string;
  question: string;
  media: string;
  letters: string[];
  correct: string[];
  displayText: string;
  type: 'arrange' | 'completion' | string;
  condition: string;
  retryCondition: string;
  showCorrectAnswer: string;
  index: number;
  totalQuestions?: number;
  answeredQuestions?: number;
}

export interface DrawingQuestion {
  subLabel: string;
  imageUrls: string[];
  templateAlpha: number;
  requiredPercent: number;
  requiredPenSize: number | null;
  requiredRepetitions: number;
  timeMinutes: number;
  drawType: 'normal' | 'free' | string;
  allowUndo: boolean;
  maxRestarts: number;
  maxCancels: number;
}

export interface DrawingLesson {
  label: string;
  questions: DrawingQuestion[];
}

export interface HoomWidget {
  type: 'بطاقة' | 'معرض صور' | 'أزرار' | 'من نحن' | string;
  title: string;
  text: string;
  media: string[];
  videos: string[];
  buttons?: Array<{ text: string; url: string }>;
}

export interface GeneralData {
  profile: string[][];
  contact: string[][];
  about: string[][];
  hoom: string[][];
  header: HeaderData;
}

export enum ExerciseType {
  DRAWING = 'drawing',
  WORDS = 'words',
  MATCHING = 'matching',
}

export interface LeftItem {
  type: 'text' | 'image' | 'audio' | string;
  value: string;
}

export interface ShuffledRightItem {
  type: 'text' | 'image' | 'audio' | string;
  value: string;
}

export interface MatchQuestion {
  questionText: string;
  leftItems: LeftItem[];
  shuffledRight: ShuffledRightItem[];
  rightIds: string[];
  correctMatches: string; // JSON string mapping left Index (1-based) to array of right IDs (e.g. ['a', 'b'])
}

export interface MatchLesson {
  lessonName: string;
  questions: MatchQuestion[];
  nextControl: string;
  retryControl: string;
  colorControl: string;
  undoControl: string;
  retryAllowed: string;
  maxRetries: number;
}

export interface StudentResult {
  label: string;
  answers: {
    details: string;
    percentage: string;
    imageUrl: string;
  }[];
  finalPercent: string;
  allowReset: string;
}
