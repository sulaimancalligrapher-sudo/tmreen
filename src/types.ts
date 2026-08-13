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
  isAdmin?: boolean;
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

export interface HomeContentItem {
  type: 'announcement' | 'photo' | 'video' | 'instruction' | 'link' | string;
  title: string;
  content: string;
  targetStudent?: string;
  status?: string;
}

export interface GeneralData {
  profile: string[][];
  contact: string[][];
  about: string[][];
  homeContent: string[][];
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

export interface SignatureConfig {
  id: string;
  url: string;
  title: string;
  width: string;
  height: string;
}

export interface StampConfig {
  id: string;
  url: string;
  title: string;
  width: string;
  height: string;
}

export interface CertificateConfig {
  id: string;
  pagePosition: number; // رقم الصفحة التي تظهر فيها الشهادة (e.g. 1, 2, 3...)
  
  // Frame Image
  frameUrl?: string; // رابط صورة إطار الشهادة المفرغ (PNG)

  // Margins
  marginTop?: string; // الهامش العلوي لنص الشهادة (e.g. "25mm")
  marginSide?: string; // الهامش الجانبي لنص الشهادة (e.g. "20mm")
  marginBottom?: string; // الهامش السفلي لنص الشهادة (e.g. "20mm")

  // Subject / Title
  subjectText: string;
  subjectFontSize: string; // e.g. "26px"
  subjectAlign: 'right' | 'center' | 'left';
  subjectFontFamily: string; // e.g. "Amiri", "Tajawal", "Cairo"

  // Body Text
  bodyText: string; // Multiline, supports {{اسم_الطالب}}, {{نص 1}}..{{نص 10}}, {{صورة 1}}..{{صورة 5}}
  bodyFontSize: string; // e.g. "18px"
  bodyAlign: 'right' | 'center' | 'left' | 'justify';
  bodyFontFamily: string;

  // Bottom Image (Merged Signatures / Stamp)
  footerImageUrl?: string; // رابط صورة الجزء السفلي (التواوقيع والختم)
  footerImageHeight?: string; // ارتفاع الصورة السفلية (e.g. "120px")
  footerImageAlign?: 'center' | 'right' | 'left';

  // Per-certificate Custom Image Sizes for {{صورة 1}} to {{صورة 5}}
  customImageSizes?: CustomImageSizes;

  // Legacy Signatures & Stamps
  signatures?: SignatureConfig[];
  stamps?: StampConfig[];
}

export interface CustomImageSizes {
  img1Width: string; img1Height: string;
  img2Width: string; img2Height: string;
  img3Width: string; img3Height: string;
  img4Width: string; img4Height: string;
  img5Width: string; img5Height: string;
}

export interface PdfSettings {
  backgroundUrl: string; // رابط خلفية عامة لملف PDF (A4)
  imagesBeforeTable: string[]; // روابط صور قبل الجدول (A4)
  imagesAfterTable: string[]; // روابط صور بعد الجدول (A4)
  customImageSizes: CustomImageSizes;
  certificates: CertificateConfig[];
}

