/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeaderData {
  logoUrl: string;
  mainTitle: string;
  description: string;
  buttons: Array<{ buttonText: string; buttonUrl: string }>;
  mainTitleEn?: string;
  mainTitleTh?: string;
  descriptionEn?: string;
  descriptionTh?: string;
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
  titleEn?: string;
  contentEn?: string;
  titleTh?: string;
  contentTh?: string;
  targetStudent?: string;
  status?: string;
  row?: number;
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

export interface TeacherContact {
  id: string;
  name: string;
  role: string;
  telegramChatId: string;
  phone?: string;
  enabled: boolean;
  notes?: string;
}

export interface TelegramLanguageTemplates {
  welcome: string;
  welcomePrompt?: string;
  idVerifiedPrompt?: string;
  regSuccess?: string;
  linkedStudentPrompt?: string;
  securityLinkedAlert?: string;
  deviceProtectionAlert?: string;
  studentNotFound?: string;
  login: string;
  earlyEntryAllowed?: string;
  earlyEntryBlocked?: string;
  lateEntryBlocked?: string;
  lateEntryAllowed?: string;
  preClass: string;
  absent: string;
  earlyExit?: string;
  regularExit?: string;
  finalAbsent?: string;
  complete: string;
  evaluation: string;
  evaluationDetail?: string;
  remainingLessons?: string;
  adminAlert: string;
  scheduleReminder: string;
  teacherAlert: string;
}

export interface TelegramBotCommandConfig {
  id?: string;
  command: string; // e.g. "/menu", "/completed", "/remaining", "/schedule", "/teacher", "/info", "/lang"
  buttonTextAr?: string;
  buttonTextEn?: string;
  buttonTextTh?: string;
  description: string;
  keywords?: string;
  responseAr: string;
  responseEn: string;
  responseTh: string;
  supportedVars?: { tag: string; label: string }[];
  enabled: boolean;
}

export interface AttendanceSettings {
  startTime: string; // وقت بداية الحصة (e.g. "19:00")
  durationType: 'from_start' | 'from_login'; // نوع احتساب مدة الحصة
  sessionDurationFromStart: number; // مدة الحصة من وقت البدء بالدقائق (e.g. 120)
  sessionDurationFromLogin: number; // مدة الحصة من وقت دخول الطالب بالدقائق (e.g. 90)
  forceLogin: boolean; // إجبار الدخول (نعم / لا)
  timeRestricted: boolean; // التقيد بالوقت (نعم / لا)
  preventEarlyEntry?: boolean; // منع الدخول قبل الوقت المحدد (نعم / لا)
  inactivityTimeoutMinutes?: number; // مهلة الخروج التلقائي عند انقطاع النشاط بالدقائق (e.g. 10)
  allowedExceptionStudents: string[]; // قائمة أسماء/أرقام الطلاب المسموح لهم بالدخول الاستثنائي
  
  // Telegram Settings
  telegramToken: string;
  telegramBotUsername?: string; // اسم مستخدم البوت (Bot Username بدون @)
  telegramChatId: string; // Admin / General Channel ID (Legacy or default fallback)
  telegramAdminUserId?: string; // معرّف الإداري الشخصي الخاص (Private User ID)
  telegramGroups?: { id: string; name: string; chatId: string; type: 'teachers' | 'students' | 'general'; description?: string }[];
  telegramChannels?: { id: string; name: string; chatId: string; accessType: 'public' | 'private'; description?: string }[];
  telegramEnabled: boolean;
  telegramTemplatePreClass: string;
  telegramTemplateLogin: string;
  telegramTemplateComplete: string;
  telegramTemplateAbsent: string;
  
  // Telegram Automated Timing & Repetition Rules
  telegramPreClassReminderMinutes?: number; // وقت التذكير قبل الحصة (دقائق: 10, 15, 30, 60)
  telegramLateAlertDelayMinutes?: number; // مهلة إنذار التأخر الأول (دقائق: 5, 10, 15)
  telegramLateAlertRepeatEnabled?: boolean; // تفعيل تكرار إنذار التأخر
  telegramLateAlertRepeatIntervalMinutes?: number; // الفاصل الزمني لتكرار الإنذار (دقائق: 10, 15, 20, 30)
  telegramLateAlertMaxCount?: number; // أقصى عدد لمرات التكرار (1, 2, 3)
  telegramFinalAbsentTiming?: 'end_of_session' | 'end_of_day'; // توقيت إشعار الغياب النهائي
  telegramNotifyTeacherDirectly?: boolean; // إشعار المعلم المسؤول في تيليجرام الخاص به
  telegramTeacherDigestEnabled?: boolean; // تفعيل تقارير المعلم المجمّعة الذكية (بدلاً من رسائل فردية متناثرة)
  telegramTeacherPreClassDigest?: boolean; // تقرير ما قبل الحصة المجمّع بقائمة المشتركين
  telegramTeacherMidClassDigest?: boolean; // تقرير الحضور والغياب اللحظي أثناء الحصة بعد مهلة التأخر
  telegramTeacherPostSessionDigest?: boolean; // التقرير الختامي الشامل للحصة وإجمالي الحضور والغياب
  
  // Enhanced Multi-Recipient & Multi-Language Telegram Hub
  teachers?: TeacherContact[];
  templatesAr?: Partial<TelegramLanguageTemplates>;
  templatesEn?: Partial<TelegramLanguageTemplates>;
  templatesTh?: Partial<TelegramLanguageTemplates>;
  botCommands?: TelegramBotCommandConfig[];
}

export interface StudentSchedule {
  studentId: string;
  studentName: string;
  startDate: string;
  activeDays: string;
  lessonsPerWeek: string;
  daysToKeep?: string;
  expiryDate?: string;
  examOverrides?: string;
  customStartTime?: string;
  customSessionDuration?: number;
  customDurationType?: 'from_start' | 'from_login';
  customPreventEarlyEntry?: boolean;
  customForceLogin?: boolean;
  
  // Telegram Specific
  telegramChatId?: string;
  preferredLanguage?: 'ar' | 'en' | 'th';
  guardianPhone?: string;
  assignedTeacherId?: string;
}

export interface StudentCustomTimeSetting {
  studentId: string;
  studentName?: string;
  customStartTime?: string; // e.g. "16:30"
  customSessionDuration?: number; // e.g. 60
  customDurationType?: 'from_start' | 'from_login';
  customPreventEarlyEntry?: boolean;
  customForceLogin?: boolean;
}

export interface LiveStudentStatus {
  studentId: string;
  studentName: string;
  status: 'active' | 'completed' | 'absent' | 'idle' | 'logged_out';
  loginTime?: string;
  lastActiveTime?: string;
  completedLessonsCount: number;
  totalRequiredLessons: number;
  completedTopics: string[];
  pendingTopics: string[];
  notes?: string;
  customTime?: {
    startTime?: string;
    sessionDuration?: number;
    durationType?: 'from_start' | 'from_login';
    preventEarlyEntry?: boolean;
    forceLogin?: boolean;
  };
}

export interface LiveMonitoringData {
  settings: AttendanceSettings;
  activeStudents: LiveStudentStatus[];
  loggedOutStudents?: LiveStudentStatus[];
  completedStudents: LiveStudentStatus[];
  absentStudents: LiveStudentStatus[];
  lastRefreshed: string;
}

