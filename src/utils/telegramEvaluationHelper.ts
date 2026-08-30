/**
 * Evaluation & Progress Reporting Utility for Telegram Bot
 * Connects directly with Google Apps Script (ConsolidatedEvaluations & StudentSchedule)
 * and delivers real-time grades, star ratings, remaining curriculum, schedule, and teacher contact.
 */

import { AttendanceSettings, StudentSchedule, TelegramLanguageTemplates, TelegramBotCommandConfig } from '../types';
import {
  DEFAULT_TELEGRAM_TEMPLATES_AR,
  DEFAULT_TELEGRAM_TEMPLATES_EN,
  DEFAULT_TELEGRAM_TEMPLATES_TH,
  interpolateTelegramTemplate,
  sendTelegramMessage,
} from './telegram';
import { callGasApi } from './api';

export interface EvaluationItem {
  lessonName: string;
  score: number;
  stars: number;
  completedAt?: string;
  notes?: string;
  wordsScore?: string;
  waslScore?: string;
  writingScore?: string;
  picScore?: string;
  audioScore?: string;
}

export interface StudentEvaluationSummary {
  studentName: string;
  studentId: string;
  completedLessonsList: string[];
  remainingLessonsList: string[];
  completedLessonsCount: number;
  remainingLessonsCount: number;
  totalLessonsCount: number;
  items?: EvaluationItem[];
  averageScore?: number;
  totalStars?: number;
}

/**
 * Normalizes an Arabic string or keyword for command matching
 */
export function normalizeQueryKeyword(text: string): string {
  if (!text) return '';
  let t = String(text).trim().toLowerCase();
  // Strip leading slashes, hashes, colons, or dashes
  t = t.replace(/^[/#:\s-]+/, '');
  // Normalize Arabic letters
  t = t.replace(/[أإآٱ]/g, 'ا');
  t = t.replace(/ة/g, 'ه');
  t = t.replace(/ى/g, 'ي');
  t = t.replace(/[\u064B-\u065F\u0670]/g, ''); // strip tashkeel
  // Strip punctuation but keep letters, digits, spaces
  t = t.replace(/[^\w\s\u0600-\u06FF\u0E00-\u0E7F]/g, ' ');
  return t.trim();
}

/**
 * Checks if incoming text matches the Master Menu / Details trigger keyword
 * Matches keywords like: تفاصيل, ت, قائمة, خيارات, خدمات, اوامر, منيو, مساعدة, /menu, /details, /help, /start, menu, details, options, services
 */
export function isMasterMenuQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const masterKeywords = new Set([
    'تفاصيل',
    'تفصيل',
    'التفاصيل',
    'ت',
    'قائمه',
    'قائمة',
    'القائمه',
    'القائمة',
    'خيارات',
    'الخيارات',
    'خيار',
    'الخيار',
    'خدمات',
    'الخدمات',
    'خدمه',
    'الخدمه',
    'اوامر',
    'الاوامر',
    'امر',
    'منيو',
    'المنيو',
    'مساعده',
    'مساعدة',
    'المساعده',
    'المساعدة',
    'بدء',
    'ابدأ',
    'ابدا',
    'البدء',
    'menu',
    'details',
    'detail',
    'options',
    'option',
    'services',
    'service',
    'help',
    'start',
    'เมนู',
    'รายละเอียด',
  ]);

  if (masterKeywords.has(clean) || masterKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('تفاصيل') ||
    clean.startsWith('قائمه') ||
    clean.startsWith('قائمة') ||
    clean.startsWith('خدمات') ||
    clean.startsWith('خيارات') ||
    rawClean.startsWith('menu') ||
    rawClean.startsWith('detail')
  );
}

/**
 * Checks if incoming text matches a Completed Lessons query
 * Matches keywords like: مكتمل, مكتملة, الدروس المكتملة, اكتمل, منجز, تم, ك, ن, تقييم, درجات, نتائج, /completed, /results, etc.
 */
export function isCompletedLessonsQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const completedKeywords = new Set([
    'مكتمل',
    'مكتمله',
    'مكتملة',
    'المكتمل',
    'المكتمله',
    'المكتملة',
    'الدروس المكتمله',
    'الدروس المكتملة',
    'دروس مكتمله',
    'دروس مكتملة',
    'اكتمل',
    'تم',
    'تمت',
    'المنجز',
    'منجز',
    'انجزت',
    'المنجزة',
    'المنجزه',
    'ك',
    'م',
    'تقييم',
    'تقيم',
    'التقييم',
    'التقيم',
    'ن',
    'نتائج',
    'النتائج',
    'درجات',
    'الدرجات',
    'درجه',
    'الدرجه',
    'نتيجه',
    'النتيجه',
    'كشف',
    'الكشف',
    'علامات',
    'علاماتي',
    'درجاتي',
    'تقييمي',
    'completed',
    'complete',
    'done',
    'finished',
    'finish',
    'results',
    'result',
    'eval',
    'evaluation',
    'grades',
    'grade',
    'score',
    'scores',
    'marks',
    'เสร็จสิ้น',
    'เสร็จ',
    'ผลการเรียน',
    'คะแนน',
    'ประเมิน',
  ]);

  if (completedKeywords.has(clean) || completedKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('مكتمل') ||
    clean.startsWith('الدروس المكتمل') ||
    clean.startsWith('دروس مكتمل') ||
    clean.startsWith('اكتمل') ||
    clean.startsWith('منجز') ||
    clean.startsWith('تقييم') ||
    clean.startsWith('تقيم') ||
    clean.startsWith('نتائج') ||
    clean.startsWith('درجات') ||
    rawClean.startsWith('complet') ||
    rawClean.startsWith('done') ||
    rawClean.startsWith('finish') ||
    rawClean.startsWith('result') ||
    rawClean.startsWith('eval') ||
    rawClean.startsWith('grade')
  );
}

/**
 * Backward compatibility alias for isCompletedLessonsQuery
 */
export const isEvaluationResultsQuery = isCompletedLessonsQuery;

/**
 * Checks if incoming text matches a Remaining Lessons query
 * Matches keywords like: متبقي, ب, باقي, المتبقي, دروس متبقية, خطة, /remaining, /left, remaining, left, plan
 */
export function isRemainingLessonsQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const remKeywords = new Set([
    'متبقي',
    'ب',
    'باقي',
    'المتبقي',
    'المتبقيه',
    'المتبقية',
    'دروس متبقيه',
    'دروس متبقية',
    'الدروس المتبقيه',
    'الدروس المتبقية',
    'خطه',
    'خطة',
    'الخطه',
    'الخطة',
    'الدروس',
    'دروسي',
    'باقيلي',
    'remaining',
    'left',
    'rem',
    'plan',
    'lessons',
    'บทเรียนที่เหลือ',
    'เหลือ',
  ]);

  if (remKeywords.has(clean) || remKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('متبقي') ||
    clean.startsWith('باقي') ||
    clean.startsWith('الدروس المتبق') ||
    rawClean.startsWith('remain') ||
    rawClean.startsWith('left')
  );
}

/**
 * Checks if incoming text matches a Schedule query
 * Matches keywords like: جدول, ج, مواعيد, موعد, حصة, توقيت, /schedule, /timetable, schedule, timetable
 */
export function isScheduleQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const schedKeywords = new Set([
    'جدول',
    'ج',
    'جدولي',
    'الجدول',
    'مواعيد',
    'مواعيدي',
    'المواعيد',
    'موعد',
    'موعدي',
    'حصه',
    'حصة',
    'الحصة',
    'الحصه',
    'حصص',
    'حصصي',
    'الحصص',
    'توقيت',
    'التوقيت',
    'وقتي',
    'ايام',
    'الايام',
    'schedule',
    'timetable',
    'timing',
    'time',
    'ตารางเรียน',
    'ตาราง',
  ]);

  if (schedKeywords.has(clean) || schedKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('جدول') ||
    clean.startsWith('مواعيد') ||
    rawClean.startsWith('sched') ||
    rawClean.startsWith('time')
  );
}

/**
 * Checks if incoming text matches a Teacher Contact query
 * Matches keywords like: معلم, م, استاذ, مشرف, مدرس, تواصل, /teacher, /contact, teacher, contact
 */
export function isTeacherQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const teacherKeywords = new Set([
    'معلم',
    'م',
    'معلمي',
    'المعلم',
    'استاذ',
    'استاذي',
    'الأستاذ',
    'الاستاذ',
    'مدرس',
    'مدرسي',
    'المدرس',
    'مشرف',
    'مشرفي',
    'المشرف',
    'تواصل',
    'اتصال',
    'teacher',
    'instructor',
    'contact',
    'supervisor',
    'คุณครู',
    'ครู',
  ]);

  if (teacherKeywords.has(clean) || teacherKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('معلم') ||
    clean.startsWith('استاذ') ||
    clean.startsWith('مدرس') ||
    rawClean.startsWith('teach') ||
    rawClean.startsWith('contact')
  );
}

/**
 * Checks if incoming text matches a Student Info query
 * Matches keywords like: بيانات, ح, حسابي, ملف, معلومات, رقمي, /info, /profile, /account, profile, info
 */
export function isStudentInfoQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const infoKeywords = new Set([
    'بيانات',
    'ح',
    'بياناتي',
    'البيانات',
    'حساب',
    'حسابي',
    'الحساب',
    'ملفي',
    'ملف',
    'الملف',
    'معلومات',
    'معلوماتي',
    'المعلومات',
    'رقمي',
    'رقم',
    'الرقم',
    'تسجيل',
    'التسجيل',
    'profile',
    'account',
    'info',
    'me',
    'id',
    'ข้อมูล',
    'โปรไฟล์',
  ]);

  if (infoKeywords.has(clean) || infoKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('بيانات') ||
    clean.startsWith('حسابي') ||
    clean.startsWith('معلومات') ||
    rawClean.startsWith('profile') ||
    rawClean.startsWith('account') ||
    rawClean.startsWith('info')
  );
}

/**
 * Checks if incoming text matches a Language query
 * Matches keywords like: لغة, ل, لغات, تغيير اللغة, عربي, انجليزي, تايلندي, /lang, /language, lang, language
 */
export function isLanguageQuery(text: string): boolean {
  if (!text) return false;
  const clean = normalizeQueryKeyword(text);
  const rawClean = text.trim().toLowerCase().replace(/^[/#:\s-]+/, '');

  const langKeywords = new Set([
    'لغة',
    'لغه',
    'اللغة',
    'اللغه',
    'ل',
    'لغات',
    'اللغات',
    'تغيير اللغه',
    'تغيير اللغة',
    'عربي',
    'العربيه',
    'انجليزي',
    'الانجليزيه',
    'تايلندي',
    'التايلنديه',
    'lang',
    'language',
    'languages',
    'ภาษา',
  ]);

  if (langKeywords.has(clean) || langKeywords.has(rawClean)) {
    return true;
  }

  return (
    clean.startsWith('لغ') ||
    clean.startsWith('تغيير اللغ') ||
    rawClean.startsWith('lang')
  );
}

/**
 * Interactive Language Selection keyboard
 */
export function buildLanguageSelectionKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🇸🇦 العربية (Arabic)', callback_data: 'lang_ar' },
      ],
      [
        { text: '🇬🇧 English', callback_data: 'lang_en' },
      ],
      [
        { text: '🇹🇭 ภาษาไทย (Thai)', callback_data: 'lang_th' },
      ],
    ],
  };
}

/**
 * Dispatches Language Selection Menu with 3 Interactive Buttons
 */
export async function sendLanguageSelectionMenu(params: {
  token: string;
  chatId: string;
  student?: StudentSchedule | null;
}): Promise<boolean> {
  const { token, chatId, student } = params;
  const lang: 'ar' | 'en' | 'th' = ((student?.preferredLanguage as any) || 'ar');

  let text = '';
  if (lang === 'en') {
    text = `🌐 **Notification Language Selection**\n\nPlease select your preferred language for all Telegram notifications and reports:`;
  } else if (lang === 'th') {
    text = `🌐 **เลือกภาษาสำหรับการแจ้งเตือน**\n\nกรุณาเลือกภาษาที่คุณต้องการสำหรับรายงานและการแจ้งเตือน:`;
  } else {
    text = `🌐 **تغيير لغة الإشعارات والتقارير في تيليجرام**\n\nيرجى اختيار اللغة المفضلة لاستلام التقارير والإشعارات عبر الأزرار أدناه:`;
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text,
    replyMarkup: buildLanguageSelectionKeyboard(),
    skipDeduplication: true,
  });

  return res.ok;
}

/**
 * Helper to parse a percentage or grade string into a number 0-100
 */
function parseGradeNumber(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const str = String(val).trim();
  if (str === '-' || str === 'لم' || str === '0/0' || str === 'لم يبدأ' || str === 'لم يبدا') return null;

  if (str.endsWith('%')) {
    const num = parseFloat(str.replace('%', '').trim());
    return isNaN(num) ? null : Math.min(100, Math.max(0, num));
  }

  if (str.includes('/')) {
    const parts = str.split('/');
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
      return Math.min(100, Math.max(0, Math.round((numerator / denominator) * 100)));
    }
  }

  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (num <= 10 && num > 0) return Math.round(num * 10);
    return Math.min(100, Math.max(0, Math.round(num)));
  }

  return null;
}

/**
 * Parses ConsolidatedEvaluations rows into completed lessons and remaining lessons
 * Uses Column V (index 21) as primary indicator of lesson completion ('اكتمل')
 */
function parseConsolidatedRows(
  rows: any[][],
  cleanId: string,
  cleanName: string
): { completedList: string[]; remainingList: string[]; completedItems: EvaluationItem[] } {
  const completedList: string[] = [];
  const remainingList: string[] = [];
  const completedItems: EvaluationItem[] = [];

  for (const row of rows) {
    if (!row || !Array.isArray(row) || row.length < 3) continue;
    const rId = String(row[0] || '').trim();
    const rName = String(row[1] || '').trim();
    const lessonName = String(row[2] || '').trim();

    if (!lessonName || lessonName === 'dummy' || lessonName === 'موضوع الدرس' || lessonName === 'Topic') continue;

    const isMatch =
      (cleanId && rId && (cleanId === rId || cleanId.replace(/\D/g, '') === rId.replace(/\D/g, ''))) ||
      (cleanName && rName && (cleanName.toLowerCase() === rName.toLowerCase() || rName.includes(cleanName) || cleanName.includes(rName)));

    if (!isMatch && cleanId) continue;

    // ConsolidatedEvaluations 22-column index structure:
    // row[0]: studentId
    // row[1]: studentName
    // row[2]: lessonName (topic)
    // row[3]: sentStatus ('تم' / 'لم')
    // row[4]: picGrade
    // row[5]: audioGrade
    // row[11]: wordsPct
    // row[15]: waslPct
    // row[19]: writingPct
    // row[21]: topicStatus ('اكتمل' / 'لم يكتمل') - Column V

    const sentStatus = String(row[3] || '').trim();
    const picGrade = row[4];
    const audioGrade = row[5];
    const wordsPct = row[11];
    const waslPct = row[15];
    const writingPct = row[19];
    const topicStatus = String(row[21] || '').trim();

    // Check completion strictly from Column V or sent status with grades
    const isTopicCompleted =
      topicStatus === 'اكتمل' ||
      topicStatus.includes('اكتمل') ||
      topicStatus.includes('مكتمل') ||
      topicStatus === 'نعم' ||
      topicStatus.toLowerCase() === 'completed' ||
      topicStatus.toLowerCase() === 'done';

    const isExplicitlyPending =
      topicStatus === 'لم يكتمل' ||
      topicStatus.includes('لم') ||
      topicStatus === 'لا' ||
      topicStatus.toLowerCase() === 'pending' ||
      topicStatus.toLowerCase() === 'incomplete';

    const grades: number[] = [];
    const pW = parseGradeNumber(wordsPct);
    const pWasl = parseGradeNumber(waslPct);
    const pWrit = parseGradeNumber(writingPct);
    const pPic = parseGradeNumber(picGrade);
    const pAud = parseGradeNumber(audioGrade);

    if (pW !== null) grades.push(pW);
    if (pWasl !== null) grades.push(pWasl);
    if (pWrit !== null) grades.push(pWrit);
    if (pPic !== null) grades.push(pPic);
    if (pAud !== null) grades.push(pAud);

    const isCompleted = isTopicCompleted || (!isExplicitlyPending && sentStatus === 'تم' && grades.length > 0);

    if (isCompleted) {
      if (!completedList.includes(lessonName)) {
        completedList.push(lessonName);
      }
      const avgScore = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : 100;
      const stars = Math.min(5, Math.max(1, Math.round((avgScore / 100) * 5)));
      completedItems.push({
        lessonName,
        score: avgScore,
        stars,
        wordsScore: wordsPct ? String(wordsPct) : undefined,
        waslScore: waslPct ? String(waslPct) : undefined,
        writingScore: writingPct ? String(writingPct) : undefined,
      });
    } else {
      if (!remainingList.includes(lessonName)) {
        remainingList.push(lessonName);
      }
    }
  }

  return { completedList, remainingList, completedItems };
}

/**
 * Retrieves student completed lessons and remaining lessons from all available storage sources
 * (ConsolidatedEvaluations live GAS, getStudentFullReportData, and LocalStorage caches)
 */
export async function getStudentEvaluations(studentId: string, studentName: string): Promise<StudentEvaluationSummary> {
  const cleanId = String(studentId || '').trim();
  const cleanName = String(studentName || '').trim();

  let completedLessonsList: string[] = [];
  let remainingLessonsList: string[] = [];
  let completedItems: EvaluationItem[] = [];

  try {
    // 1. Live Fetch from getStudentFullReportData (which provides aReport with completedLessons & pendingLessons)
    try {
      const fullReport = await callGasApi<any>('getStudentFullReportData', {
        studentId: cleanId,
        studentName: cleanName,
      });

      if (fullReport && fullReport.success && fullReport.aReport) {
        const aReport = fullReport.aReport;
        if (Array.isArray(aReport.completedLessons) && aReport.completedLessons.length > 0) {
          aReport.completedLessons.forEach((item: any) => {
            const lessonName = String(item.topic || item.lessonName || '').trim();
            if (lessonName && !completedLessonsList.includes(lessonName)) {
              completedLessonsList.push(lessonName);
              completedItems.push({
                lessonName,
                score: 100,
                stars: 5,
              });
            }
          });
        }

        if (Array.isArray(aReport.pendingLessons) && aReport.pendingLessons.length > 0) {
          aReport.pendingLessons.forEach((item: any) => {
            const lessonName = String(item.topic || item.lessonName || '').trim();
            if (lessonName && !remainingLessonsList.includes(lessonName) && !completedLessonsList.includes(lessonName)) {
              remainingLessonsList.push(lessonName);
            }
          });
        }
      }
    } catch (fullReportErr) {
      // Continue to next source
    }

    // 2. Fetch specific ConsolidatedEvaluations from GAS if needed
    if (completedLessonsList.length === 0 && remainingLessonsList.length === 0) {
      try {
        const liveRes = await callGasApi<any>('getStudentConsolidatedEvaluation', {
          studentId: cleanId,
          studentName: cleanName,
        });

        if (liveRes && liveRes.success && Array.isArray(liveRes.data) && liveRes.data.length > 0) {
          const parsed = parseConsolidatedRows(liveRes.data, cleanId, cleanName);
          completedLessonsList = parsed.completedList;
          remainingLessonsList = parsed.remainingList;
          completedItems = parsed.completedItems;

          try {
            localStorage.setItem(`tg_consolidated_${cleanId}`, JSON.stringify(liveRes.data));
          } catch (e) {}
        }
      } catch (apiErr) {
        // GAS request failed or offline
      }
    }

    // 3. Try global evaluations sheet if still empty
    if (completedLessonsList.length === 0 && remainingLessonsList.length === 0) {
      try {
        const allEvalsRes = await callGasApi<any>('getStudentsEvaluations');
        if (allEvalsRes && allEvalsRes.success && Array.isArray(allEvalsRes.data) && allEvalsRes.data.length > 0) {
          const parsed = parseConsolidatedRows(allEvalsRes.data, cleanId, cleanName);
          completedLessonsList = parsed.completedList;
          remainingLessonsList = parsed.remainingList;
          completedItems = parsed.completedItems;

          try {
            localStorage.setItem('consolidated_evaluations_cached', JSON.stringify(allEvalsRes.data));
          } catch (e) {}
        }
      } catch (e) {}
    }

    // 4. Check LocalStorage caches
    if (completedLessonsList.length === 0 && remainingLessonsList.length === 0) {
      const cached =
        localStorage.getItem(`tg_consolidated_${cleanId}`) ||
        localStorage.getItem('consolidated_evaluations_cached') ||
        localStorage.getItem('ConsolidatedEvaluations') ||
        localStorage.getItem('evaluations_cache');

      if (cached) {
        const parsedJson = JSON.parse(cached);
        if (Array.isArray(parsedJson)) {
          if (parsedJson.length > 0 && Array.isArray(parsedJson[0])) {
            const parsed = parseConsolidatedRows(parsedJson, cleanId, cleanName);
            completedLessonsList = parsed.completedList;
            remainingLessonsList = parsed.remainingList;
            completedItems = parsed.completedItems;
          } else {
            // Object format [{ studentId, lessonName, topicStatus, ... }]
            parsedJson.forEach((row: any) => {
              const rId = String(row.studentId || row.id || '').trim();
              const rName = String(row.studentName || row.name || '').trim();
              const isMatch =
                (cleanId && rId && (cleanId === rId || cleanId.replace(/\D/g, '') === rId.replace(/\D/g, ''))) ||
                (cleanName && rName && (cleanName.toLowerCase() === rName.toLowerCase() || rName.includes(cleanName)));

              if (isMatch) {
                const lessonName = String(row.lessonName || row.topic || 'درس').trim();
                const status = String(row.topicStatus || row.status || '').trim();
                if (status === 'اكتمل' || status.includes('اكتمل') || status === 'نعم' || row.isCompleted) {
                  if (!completedLessonsList.includes(lessonName)) {
                    completedLessonsList.push(lessonName);
                    completedItems.push({ lessonName, score: 100, stars: 5 });
                  }
                } else {
                  if (!remainingLessonsList.includes(lessonName) && !completedLessonsList.includes(lessonName)) {
                    remainingLessonsList.push(lessonName);
                  }
                }
              }
            });
          }
        }
      }
    }
  } catch (e) {}

  const completedCount = completedLessonsList.length;
  const remainingCount = remainingLessonsList.length;
  const totalLessonsCount = completedCount + remainingCount;

  return {
    studentName: cleanName || 'المشترك',
    studentId: cleanId,
    completedLessonsList,
    remainingLessonsList,
    completedLessonsCount: completedCount,
    remainingLessonsCount: remainingCount,
    totalLessonsCount,
    items: completedItems,
    averageScore: 100,
    totalStars: completedCount * 5,
  };
}

/**
 * Builds a clean list of completed lesson topics
 */
export function formatCompletedLessonsString(list: string[], lang: 'ar' | 'en' | 'th' = 'ar'): string {
  if (!list || list.length === 0) {
    if (lang === 'en') return '📌 No completed lessons recorded yet in the curriculum.';
    if (lang === 'th') return '📌 ยังไม่มีบทเรียนที่บันทึกว่าเสร็จสิ้นในแผนการเรียน';
    return '📌 لا توجد دروس مسجلة بحالة (اكتمل) في خطتك التعليمية حتى الآن.';
  }

  return list
    .map((item, idx) => {
      return `✅ ${idx + 1}. ${item}`;
    })
    .join('\n');
}

/**
 * Backward compatibility alias for detailed evaluation string
 */
export function formatEvaluationDetailString(items: EvaluationItem[], lang: 'ar' | 'en' | 'th' = 'ar'): string {
  const list = items?.map((it) => it.lessonName) || [];
  return formatCompletedLessonsString(list, lang);
}

/**
 * Builds a clean list of remaining lessons
 */
export function formatRemainingLessonsString(list: string[], lang: 'ar' | 'en' | 'th' = 'ar'): string {
  if (!list || list.length === 0) {
    if (lang === 'en') return '🎉 All scheduled lessons and curriculum completed!';
    if (lang === 'th') return '🎉 สำเร็จบทเรียนทั้งหมดตามแผนการเรียนแล้ว!';
    return '🎉 لقد أتممت جميع الدروس والتمارين المقررة في خطتك التعليمية بنجاح!';
  }

  return list
    .map((item, idx) => {
      return `⏳ ${idx + 1}. ${item}`;
    })
    .join('\n');
}

/**
 * Interactive master menu keyboard shown ONLY when student triggers (تفاصيل / menu)
 * Contains all 6 comprehensive service buttons with 3-language and custom settings support:
 * 1. ✅ الدروس المكتملة
 * 2. 📚 الدروس المتبقية
 * 3. 📅 جدولي الدراسي المعتمد
 * 4. 👨‍🏫 بيانات المعلم المشرف
 * 5. 👤 بيانات حساب المشترك
 * 6. 🌐 تغيير لغة الإشعارات
 */
export function buildStudentMasterMenuKeyboard(
  lang: 'ar' | 'en' | 'th' = 'ar',
  botCommands?: TelegramBotCommandConfig[]
) {
  // Helper to extract button text for a command id or command string
  const getBtnText = (
    cmdId: string,
    defaultAr: string,
    defaultEn: string,
    defaultTh: string
  ): string => {
    if (botCommands && Array.isArray(botCommands)) {
      const match = botCommands.find(
        (c) => c.id === cmdId || c.command === `/${cmdId.replace(/^cmd_/, '')}`
      );
      if (match) {
        if (lang === 'en' && match.buttonTextEn && match.buttonTextEn.trim()) return match.buttonTextEn.trim();
        if (lang === 'th' && match.buttonTextTh && match.buttonTextTh.trim()) return match.buttonTextTh.trim();
        if (lang === 'ar' && match.buttonTextAr && match.buttonTextAr.trim()) return match.buttonTextAr.trim();
      }
    }
    if (lang === 'en') return defaultEn;
    if (lang === 'th') return defaultTh;
    return defaultAr;
  };

  const textCompleted = getBtnText('cmd_completed', '✅ الدروس المكتملة', '✅ Completed Lessons', '✅ บทเรียนที่เสร็จสิ้น');
  const textRemaining = getBtnText('cmd_remaining', '📚 الدروس المتبقية', '📚 Remaining Lessons', '📚 บทเรียนที่เหลือ');
  const textSchedule = getBtnText('cmd_schedule', '📅 جدولي الدراسي المعتمد', '📅 My Official Schedule', '📅 ตารางเรียนที่อนุมัติ');
  const textTeacher = getBtnText('cmd_teacher', '👨‍🏫 بيانات المعلم المشرف', '👨‍🏫 Teacher Contact', '👨‍🏫 ข้อมูลคุณครู');
  const textInfo = getBtnText('cmd_info', '👤 بيانات حساب المشترك', '👤 Student Account Profile', '👤 ข้อมูลบัญชีนักเรียน');
  const textLang = getBtnText('cmd_lang', '🌐 تغيير لغة الإشعارات', '🌐 Change Language', '🌐 เปลี่ยนภาษา');

  return {
    inline_keyboard: [
      [
        { text: textCompleted, callback_data: 'cmd_completed' },
        { text: textRemaining, callback_data: 'cmd_remaining' },
      ],
      [
        { text: textSchedule, callback_data: 'cmd_schedule' },
        { text: textTeacher, callback_data: 'cmd_teacher' },
      ],
      [
        { text: textInfo, callback_data: 'cmd_info' },
        { text: textLang, callback_data: 'cmd_lang' },
      ],
    ],
  };
}

/**
 * Sends the Master Services Menu WITH the interactive keyboard (Triggered ONLY by "تفاصيل" / "menu" / "ت")
 */
export async function sendStudentMasterMenu(params: {
  token: string;
  chatId: string;
  student: StudentSchedule;
  settings?: AttendanceSettings;
}): Promise<boolean> {
  const { token, chatId, student, settings } = params;
  const lang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';
  const botCommands = settings?.botCommands;

  let menuText = '';
  const menuConfig = botCommands?.find((c) => c.id === 'cmd_master_menu' || c.command === '/menu');
  if (menuConfig) {
    const rawTemplate = lang === 'en' ? menuConfig.responseEn : lang === 'th' ? menuConfig.responseTh : menuConfig.responseAr;
    if (rawTemplate && rawTemplate.trim()) {
      menuText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student.studentName,
        studentId: student.studentId,
      });
    }
  }

  if (!menuText) {
    if (lang === 'en') {
      menuText = `📋 **Smart Services & Details Menu**\n👤 **Student:** ${student.studentName} (#${student.studentId})\n\n👇 **Please choose an option from the buttons below:**`;
    } else if (lang === 'th') {
      menuText = `📋 **เมนูบริการและรายละเอียด**\n👤 **นักเรียน:** ${student.studentName} (#${student.studentId})\n\n👇 **กรุณาเลือกบริการที่ต้องการจากปุ่มด้านล่าง:**`;
    } else {
      menuText = `📋 **لوحة الخدمات والخيارات الذكية للمشترك:**\n👤 **المشترك:** ${student.studentName} (#${student.studentId})\n\n👇 **يرجى اختيار الخدمة المطلوبة بالنقر على الأزرار أدناه:**`;
    }
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text: menuText,
    replyMarkup: buildStudentMasterMenuKeyboard(lang, botCommands),
    skipDeduplication: true,
  });

  return res.ok;
}

/**
 * Dispatches the Completed Lessons List to a student via Telegram (Clean Text, No Inline Keyboard)
 * Displays only the topics of completed lessons
 */
export async function sendStudentCompletedLessonsReport(params: {
  token: string;
  chatId: string;
  student: StudentSchedule;
  settings?: AttendanceSettings;
}): Promise<boolean> {
  const { token, chatId, student, settings } = params;
  const lang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';

  const summary = await getStudentEvaluations(student.studentId, student.studentName);
  const formattedCompleted = formatCompletedLessonsString(summary.completedLessonsList, lang);
  const totalLessons = summary.totalLessonsCount || (summary.completedLessonsCount + summary.remainingLessonsCount);

  let messageText = '';
  const cmdConfig = settings?.botCommands?.find((c) => c.id === 'cmd_completed' || c.command === '/completed');
  if (cmdConfig) {
    const rawTemplate = lang === 'en' ? cmdConfig.responseEn : lang === 'th' ? cmdConfig.responseTh : cmdConfig.responseAr;
    if (rawTemplate && rawTemplate.trim()) {
      messageText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student.studentName,
        studentId: student.studentId,
        completed_lessons_list: formattedCompleted,
        completed_count: summary.completedLessonsCount,
        remaining_count: summary.remainingLessonsCount,
        total_lessons: totalLessons > 0 ? totalLessons : summary.completedLessonsCount,
        lessons: totalLessons > 0 ? totalLessons : summary.completedLessonsCount,
      });
    }
  }

  if (!messageText) {
    if (lang === 'en') {
      messageText =
        `✅ **Approved Completed Lessons in Official Curriculum:**\n` +
        `👤 **Student:** ${student.studentName} (#${student.studentId})\n\n` +
        `📊 **Progress:** Completed (${summary.completedLessonsCount}) of (${totalLessons > 0 ? totalLessons : summary.completedLessonsCount}) lessons\n\n` +
        `📖 **Completed Lessons List:**\n` +
        `${formattedCompleted}\n\n` +
        `✨ _Congratulations on your progress and dedication! 🌿_\n\n` +
        `💡 _To open services menu with buttons, type: ( details )_`;
    } else if (lang === 'th') {
      messageText =
        `✅ **บทเรียนที่เสร็จสิ้นแล้วตามหลักสูตรที่อนุมัติ:**\n` +
        `👤 **นักเรียน:** ${student.studentName} (#${student.studentId})\n\n` +
        `📊 **ความคืบหน้า:** สำเร็จแล้ว (${summary.completedLessonsCount}) จาก (${totalLessons > 0 ? totalLessons : summary.completedLessonsCount}) บทเรียน\n\n` +
        `📖 **รายชื่อบทเรียนที่เสร็จสิ้น:**\n` +
        `${formattedCompleted}\n\n` +
        `✨ _ขอแสดงความยินดีกับความก้าวหน้าและการเรียนรู้! 🌿_\n\n` +
        `💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_`;
    } else {
      messageText =
        `✅ **كشف الدروس المكتملة المعتمدة في المنظومة:**\n` +
        `👤 **المشترك:** ${student.studentName} (#${student.studentId})\n\n` +
        `📊 **حالة الإنجاز:** أتممت (${summary.completedLessonsCount}) درس من إجمالي (${totalLessons > 0 ? totalLessons : summary.completedLessonsCount}) درس\n\n` +
        `📖 **قائمة الدروس المكتملة:**\n` +
        `${formattedCompleted}\n\n` +
        `✨ _هنيئاً لك هذا التقدم والاجتهاد المبارك! 🌿_\n\n` +
        `💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_`;
    }
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text: messageText,
    skipDeduplication: true,
  });

  return res.ok;
}

/**
 * Backward compatibility alias for sendStudentCompletedLessonsReport
 */
export const sendStudentEvaluationReport = sendStudentCompletedLessonsReport;

/**
 * Dispatches the Remaining Lessons Plan to a student via Telegram (Clean Text, No Inline Keyboard)
 * Displays only the topics of pending lessons
 */
export async function sendStudentRemainingLessonsReport(params: {
  token: string;
  chatId: string;
  student: StudentSchedule;
  settings?: AttendanceSettings;
}): Promise<boolean> {
  const { token, chatId, student, settings } = params;
  const lang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';

  const summary = await getStudentEvaluations(student.studentId, student.studentName);
  const formattedRemaining = formatRemainingLessonsString(summary.remainingLessonsList, lang);

  let messageText = '';
  const cmdConfig = settings?.botCommands?.find((c) => c.id === 'cmd_remaining' || c.command === '/remaining');
  if (cmdConfig) {
    const rawTemplate = lang === 'en' ? cmdConfig.responseEn : lang === 'th' ? cmdConfig.responseTh : cmdConfig.responseAr;
    if (rawTemplate && rawTemplate.trim()) {
      messageText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student.studentName,
        studentId: student.studentId,
        remaining_lessons_list: formattedRemaining,
        remaining_count: summary.remainingLessonsCount,
        completed_count: summary.completedLessonsCount,
      });
    }
  }

  if (!messageText) {
    if (lang === 'en') {
      messageText =
        `📚 **Remaining Lessons & Study Plan:**\n` +
        `👤 **Student:** ${student.studentName} (#${student.studentId})\n\n` +
        `📊 **Remaining Lessons:** (${summary.remainingLessonsCount}) lessons left\n\n` +
        `📖 **Remaining Lessons List:**\n` +
        `${formattedRemaining}\n\n` +
        `✨ _Keep up the dedication to complete your curriculum! 🌿_\n\n` +
        `💡 _To open services menu with buttons, type: ( details )_`;
    } else if (lang === 'th') {
      messageText =
        `📚 **แผนบทเรียนและแบบฝึกหัดที่เหลือ:**\n` +
        `👤 **นักเรียน:** ${student.studentName} (#${student.studentId})\n\n` +
        `📊 **คงเหลือ:** (${summary.remainingLessonsCount}) บทเรียน\n\n` +
        `📖 **รายชื่อบทเรียนที่เหลือ:**\n` +
        `${formattedRemaining}\n\n` +
        `✨ _ขอเป็นกำลังใจให้ตั้งใจเรียนเพื่อสำเร็จตามแผน! 🌿_\n\n` +
        `💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_`;
    } else {
      messageText =
        `📚 **خطة الدروس والتمارين المتبقية:**\n` +
        `👤 **المشترك:** ${student.studentName} (#${student.studentId})\n\n` +
        `📊 **المتبقي لإتمام الخطة:** (${summary.remainingLessonsCount}) درس\n\n` +
        `📖 **قائمة الدروس المتبقية:**\n` +
        `${formattedRemaining}\n\n` +
        `✨ _نحثك على مواصلة الجد والمثابرة لإتمام خطتك بنجاح! 🌿_\n\n` +
        `💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_`;
    }
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text: messageText,
    skipDeduplication: true,
  });

  return res.ok;
}

/**
 * Dispatches the Real Official Schedule to a student via Telegram (Clean Text, No Inline Keyboard)
 * Uses accurate data from student schedule record, settings, and Google Sheets
 */
export async function sendStudentScheduleReport(params: {
  token: string;
  chatId: string;
  student: StudentSchedule;
  settings: AttendanceSettings;
}): Promise<boolean> {
  const { token, chatId, student, settings } = params;
  const lang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';

  // Read default schedule if available
  let defaultActiveDays = 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت';
  let defaultLessonsPerWeek = '3';
  try {
    const cachedScheds = localStorage.getItem('all_schedules_cached');
    if (cachedScheds) {
      const parsed = JSON.parse(cachedScheds);
      if (Array.isArray(parsed)) {
        const def = parsed.find((s: any) => s.studentId === 'DEFAULT_STUDENT');
        if (def) {
          if (def.activeDays) defaultActiveDays = def.activeDays;
          if (def.lessonsPerWeek) defaultLessonsPerWeek = def.lessonsPerWeek;
        }
      }
    }
  } catch (e) {}

  // Accurate extraction of schedule parameters
  const effectiveDays = student.activeDays && student.activeDays.trim() ? student.activeDays.trim() : defaultActiveDays;
  const effectiveTime = student.customStartTime && student.customStartTime.trim() ? student.customStartTime.trim() : (settings.startTime || '19:00');
  const sessionDuration = student.customSessionDuration || (settings.durationType === 'from_login' ? settings.sessionDurationFromLogin : settings.sessionDurationFromStart) || 120;
  const durationTypeDesc = (student.customDurationType === 'from_login' || (!student.customDurationType && settings.durationType === 'from_login'))
    ? (lang === 'en' ? 'Calculated from student login' : lang === 'th' ? 'นับตั้งแต่เวลาเข้าสู่ระบบ' : 'تحتسب من لحظة دخول الطالب')
    : (lang === 'en' ? 'Calculated from official class start time' : lang === 'th' ? 'นับจากเวลาเริ่มคลาสอย่างเป็นทางการ' : 'تحتسب من وقت بداية الحصة الرسمي');

  const preventEarly = student.customPreventEarlyEntry !== undefined
    ? student.customPreventEarlyEntry
    : Boolean(settings.preventEarlyEntry);

  const earlyEntryDesc = preventEarly
    ? (lang === 'en' ? '⛔ Blocked before class time' : lang === 'th' ? '⛔ ไม่อนุญาตก่อนเวลา' : '⛔ غير مسموح بالدخول قبل الموعد')
    : (lang === 'en' ? '✅ Allowed anytime' : lang === 'th' ? '✅ อนุญาตเข้าได้ตลอด' : '✅ مسموح بالدخول');

  const lessonsPerWeek = student.lessonsPerWeek && student.lessonsPerWeek.trim() ? student.lessonsPerWeek.trim() : defaultLessonsPerWeek;
  const startDate = student.startDate && student.startDate.trim() ? student.startDate.trim() : (lang === 'en' ? 'Registered in System' : lang === 'th' ? 'ลงทะเบียนแล้ว' : 'معتمد ومسجل بالمنظومة');
  const expiryDate = student.expiryDate && student.expiryDate.trim() ? student.expiryDate.trim() : (lang === 'en' ? 'Active / Ongoing' : lang === 'th' ? 'ใช้งานได้ต่อเนื่อง' : 'ساري ومستمر');

  // Look up assigned teacher
  let teacherName = lang === 'en' ? 'Academic Supervisory Administration' : lang === 'th' ? 'ฝ่ายวิชาการผู้ดูแล' : 'الإدارة الأكاديمية المشرفة';
  if (student.assignedTeacherId && settings.teachers && Array.isArray(settings.teachers)) {
    const matchedTeacher = settings.teachers.find((t) => t.id === student.assignedTeacherId);
    if (matchedTeacher && matchedTeacher.name) {
      teacherName = matchedTeacher.name;
    }
  }

  let messageText = '';
  const cmdConfig = settings?.botCommands?.find((c) => c.id === 'cmd_schedule' || c.command === '/schedule');
  if (cmdConfig) {
    const rawTemplate = lang === 'en' ? cmdConfig.responseEn : lang === 'th' ? cmdConfig.responseTh : cmdConfig.responseAr;
    if (rawTemplate && rawTemplate.trim()) {
      messageText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student.studentName,
        studentId: student.studentId,
        days: effectiveDays,
        time: effectiveTime,
        duration: sessionDuration,
        duration_type: durationTypeDesc,
        early_entry_status: earlyEntryDesc,
        lessons_per_week: lessonsPerWeek,
        start_date: startDate,
        expiry_date: expiryDate,
        teacher: teacherName,
        teacherName: teacherName,
        teacher_name: teacherName,
        اسم_الطالب: student.studentName,
        رقم_الطالب: student.studentId,
        أيام_الحضور: effectiveDays,
        ايام_الحضور: effectiveDays,
        أيام_الاسبوع: effectiveDays,
        الايام: effectiveDays,
        وقت_البدء: effectiveTime,
        وقت_البداية: effectiveTime,
        الوقت: effectiveTime,
        مدة_الجلسة: sessionDuration,
        المدة: sessionDuration,
        نوع_احتساب_المدة: durationTypeDesc,
        نوع_المدة: durationTypeDesc,
        حالة_الدخول_المبكر: earlyEntryDesc,
        الدخول_المبكر: earlyEntryDesc,
        الدروس_الأسبوعية: lessonsPerWeek,
        الدروس_الاسبوعية: lessonsPerWeek,
        معدل_الدروس: lessonsPerWeek,
        تاريخ_البدء: startDate,
        تاريخ_البداية: startDate,
        تاريخ_الانتهاء: expiryDate,
        تاريخ_الصلاحية: expiryDate,
        المعلم: teacherName,
        المعلم_المشرف: teacherName,
        اسم_المعلم: teacherName,
      });
    }
  }

  if (!messageText) {
    if (lang === 'en') {
      messageText =
        `📅 **Official Approved Schedule for ${student.studentName} (#${student.studentId})**\n\n` +
        `🗓️ **Scheduled Days:** ${effectiveDays}\n` +
        `⏰ **Class Start Time:** ${effectiveTime}\n` +
        `⏱️ **Session Duration:** ${sessionDuration} minutes (${durationTypeDesc})\n` +
        `🚪 **Early Entry Status:** ${earlyEntryDesc}\n` +
        `📚 **Target Lessons:** ${lessonsPerWeek} lessons / week\n` +
        `🚀 **Plan Start Date:** ${startDate}\n` +
        `🏁 **Expiry Date:** ${expiryDate}\n` +
        `👨‍🏫 **Assigned Teacher:** ${teacherName}`;
    } else if (lang === 'th') {
      messageText =
        `📅 **ตารางเรียนของ ${student.studentName} (#${student.studentId})**\n\n` +
        `🗓️ **วันเรียน:** ${effectiveDays}\n` +
        `⏰ **เวลาเริ่มเรียน:** ${effectiveTime}\n` +
        `⏱️ **ระยะเวลา:** ${sessionDuration} นาที (${durationTypeDesc})\n` +
        `🚪 **การเข้าก่อนเวลา:** ${earlyEntryDesc}\n` +
        `📚 **จำนวนบทเรียน:** ${lessonsPerWeek} บทต่อสัปดาห์\n` +
        `🚀 **วันที่เริ่ม:** ${startDate}\n` +
        `🏁 **สิ้นสุดวันที่:** ${expiryDate}\n` +
        `👨‍🏫 **คุณครูผู้ดูแล:** ${teacherName}`;
    } else {
      messageText =
        `📅 **جدولك الدراسي يا ${student.studentName} (#${student.studentId}) المعتمد**\n\n` +
        `🗓️ **أيام الحضور المقررة:** ${effectiveDays}\n` +
        `⏰ **توقيت بدء الحصة:** ${effectiveTime}\n` +
        `⏱️ **مدة الجلسة الدراسية:** ${sessionDuration} دقيقة (${durationTypeDesc})\n` +
        `🚪 **حالة الدخول المبكر:** ${earlyEntryDesc}\n` +
        `📚 **معدل الدروس المقررة:** ${lessonsPerWeek} دروس أسبوعياً\n` +
        `🚀 **تاريخ بدء الخطة:** ${startDate}\n` +
        `🏁 **تاريخ الانتهاء والصلاحية:** ${expiryDate}\n` +
        `👨‍🏫 **المعلم المشرف:** ${teacherName}`;
    }
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text: messageText,
    skipDeduplication: true,
  });

  return res.ok;
}

/**
 * Dispatches Teacher Contact Info (Clean Text, No Inline Keyboard)
 */
export async function sendStudentTeacherReport(params: {
  token: string;
  chatId: string;
  student: StudentSchedule;
  settings: AttendanceSettings;
}): Promise<boolean> {
  const { token, chatId, student, settings } = params;
  const lang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';

  let matchedTeacher = settings.teachers?.find((t) => t.id === student.assignedTeacherId);
  if (!matchedTeacher && settings.teachers && settings.teachers.length > 0) {
    matchedTeacher = settings.teachers[0];
  }

  const teacherName = matchedTeacher?.name || 'فريق الإشراف الأكاديمي';
  const teacherPhone = matchedTeacher?.phone || 'متاح عبر الإدارة المدرسية';
  const teacherRole = matchedTeacher?.role || 'المعلم المشرف';

  let messageText = '';
  const cmdConfig = settings?.botCommands?.find((c) => c.id === 'cmd_teacher' || c.command === '/teacher');
  if (cmdConfig) {
    const rawTemplate = lang === 'en' ? cmdConfig.responseEn : lang === 'th' ? cmdConfig.responseTh : cmdConfig.responseAr;
    if (rawTemplate && rawTemplate.trim()) {
      messageText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student.studentName,
        teacher: teacherName,
        teacherPhone: teacherPhone,
        teacherRole: teacherRole,
        subject: teacherRole,
        phone: teacherPhone,
      });
    }
  }

  if (!messageText) {
    if (lang === 'en') {
      messageText =
        `👨‍🏫 **Assigned Teacher & Contact Info:**\n\n` +
        `👤 **Teacher:** ${teacherName}\n` +
        `📖 **Role / Subject:** ${teacherRole}\n` +
        `📞 **Contact:** ${teacherPhone}\n\n` +
        `💡 _To open services menu with buttons, type: ( details )_`;
    } else if (lang === 'th') {
      messageText =
        `👨‍🏫 **ข้อมูลคุณครูผู้ดูแลและการติดต่อ:**\n\n` +
        `👤 **คุณครู:** ${teacherName}\n` +
        `📖 **วิชา / หน้าที่:** ${teacherRole}\n` +
        `📞 **เบอร์ติดต่อ:** ${teacherPhone}\n\n` +
        `💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_`;
    } else {
      messageText =
        `👨‍🏫 **بيانات المعلم المشرف والتواصل:**\n\n` +
        `👤 **اسم المعلم:** ${teacherName}\n` +
        `📖 **الدور / المادة:** ${teacherRole}\n` +
        `📞 **هاتف التواصل:** ${teacherPhone}\n\n` +
        `💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_`;
    }
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text: messageText,
    skipDeduplication: true,
  });

  return res.ok;
}

/**
 * Dispatches Student Profile Details (Clean Text, No Inline Keyboard)
 */
export async function sendStudentInfoReport(params: {
  token: string;
  chatId: string;
  student: StudentSchedule;
  settings?: AttendanceSettings;
}): Promise<boolean> {
  const { token, chatId, student, settings } = params;
  const lang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';
  const langLabel = lang === 'ar' ? 'العربية 🇸🇦' : lang === 'en' ? 'English 🇬🇧' : 'ไทย 🇹🇭';
  const guardianPhone = student.guardianPhone || (lang === 'en' ? 'Registered' : lang === 'th' ? 'ลงทะเบียนแล้ว' : 'مسجل بالمنظومة');
  const tgStatus = lang === 'en' ? 'Actively Linked' : lang === 'th' ? 'เชื่อมต่อเรียบร้อย' : 'مربوط بنجاح وبشكل نشط';

  let messageText = '';
  const cmdConfig = settings?.botCommands?.find((c) => c.id === 'cmd_info' || c.command === '/info');
  if (cmdConfig) {
    const rawTemplate = lang === 'en' ? cmdConfig.responseEn : lang === 'th' ? cmdConfig.responseTh : cmdConfig.responseAr;
    if (rawTemplate && rawTemplate.trim()) {
      messageText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student.studentName,
        studentId: student.studentId,
        preferred_language: langLabel,
        guardian_phone: guardianPhone,
        telegram_status: tgStatus,
      });
    }
  }

  if (!messageText) {
    if (lang === 'en') {
      messageText =
        `👤 **Student Account & Registration Details:**\n\n` +
        `📌 **Student Name:** ${student.studentName}\n` +
        `🔢 **Student ID:** #${student.studentId}\n` +
        `🌐 **Preferred Language:** ${lang.toUpperCase()}\n` +
        `📱 **Guardian Phone:** ${guardianPhone}\n` +
        `✅ **Telegram Status:** ${tgStatus}\n\n` +
        `💡 _To open services menu with buttons, type: ( details )_`;
    } else if (lang === 'th') {
      messageText =
        `👤 **ข้อมูลบัญชีและการลงทะเบียนของนักเรียน:**\n\n` +
        `📌 **ชื่อนักเรียน:** ${student.studentName}\n` +
        `🔢 **รหัสนักเรียน:** #${student.studentId}\n` +
        `🌐 **ภาษาที่เลือก:** ${lang.toUpperCase()}\n` +
        `📱 **เบอร์ผู้ปกครอง:** ${guardianPhone}\n` +
        `✅ **สถานะ Telegram:** ${tgStatus}\n\n` +
        `💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_`;
    } else {
      messageText =
        `👤 **بيانات المشترك وحالة التسجيل في المنظومة:**\n\n` +
        `📌 **اسم الطالب:** ${student.studentName}\n` +
        `🔢 **الرقم الدراسي:** #${student.studentId}\n` +
        `🌐 **لغة الإشعارات المفضلة:** ${langLabel}\n` +
        `📱 **هاتف ولي الأمر:** ${guardianPhone}\n` +
        `✅ **حالة الربط في تيليجرام:** ${tgStatus}\n\n` +
        `💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_`;
    }
  }

  const res = await sendTelegramMessage({
    token,
    chatId,
    text: messageText,
    skipDeduplication: true,
  });

  return res.ok;
}

