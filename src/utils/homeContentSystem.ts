/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemHomeTranslation {
  titleEn?: string;
  contentEn?: string;
  titleTh?: string;
  contentTh?: string;
}

export interface LessonReminderConfig {
  enabled: boolean;
  titleAr: string;
  contentAr: string;
  titleEn: string;
  contentEn: string;
  titleTh: string;
  contentTh: string;
}

export interface StudentReminderStats {
  dayNumber: number;
  newLessons: number;
  pendingLessons: number;
  completedLessons: number;
  totalRemaining: number;
  studentName: string;
}

const HOME_TRANSLATIONS_KEY = 'school_home_system_translations_v1';
const LESSON_REMINDER_KEY = 'school_lesson_reminder_config_v1';

export const DEFAULT_LESSON_REMINDER: LessonReminderConfig = {
  enabled: true,
  titleAr: 'تذكير هام بالدروس والتمارين 📌',
  contentAr: 'مرحباً بك يا {student_name}! هذا هو يومك التدريبي ({day_number})، لديك ({new_lessons}) دروس جديدة، و({pending_lessons}) دروس سابقة لم ترسل إجابتها (المتبقي: {total_remaining}، المنجز: {completed_lessons}). يمكنك إنجازها ومتابعتها من قسم التقارير 📊.',
  titleEn: 'Important Reminder on Lessons & Exercises 📌',
  contentEn: 'Welcome {student_name}! This is your training day ({day_number}). You have ({new_lessons}) new lessons and ({pending_lessons}) pending lessons (Total remaining: {total_remaining}, Completed: {completed_lessons}). You can track and complete them from the Reports section 📊.',
  titleTh: 'แจ้งเตือนสำคัญเกี่ยวกับบทเรียนและแบบฝึกหัด 📌',
  contentTh: 'ยินดีต้อนรับ {student_name}! วันนี้เป็นวันฝึกอบรมที่ ({day_number}) ของคุณ มีบทเรียนใหม่ ({new_lessons}) บทเรียน และบทเรียนค้าง ({pending_lessons}) บทเรียน (คงเหลือทั้งหมด: {total_remaining}, เสร็จสิ้น: {completed_lessons}) สามารถติดตามและทำต่อได้จากส่วนรายงาน 📊',
};

/**
 * Get all system translations for Home Content
 */
export function getAllSystemHomeTranslations(): Record<string, SystemHomeTranslation> {
  try {
    const raw = localStorage.getItem(HOME_TRANSLATIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load system home translations', e);
    return {};
  }
}

/**
 * Get system translation for a specific item title or key
 */
export function getSystemHomeTranslation(title: string): SystemHomeTranslation | null {
  if (!title) return null;
  const all = getAllSystemHomeTranslations();
  const cleanKey = title.trim().toLowerCase();
  return all[cleanKey] || all[title.trim()] || null;
}

/**
 * Save system translation for a specific item title
 */
export function saveSystemHomeTranslation(title: string, translation: SystemHomeTranslation): void {
  if (!title) return;
  try {
    const all = getAllSystemHomeTranslations();
    const cleanKey = title.trim().toLowerCase();
    all[cleanKey] = {
      titleEn: translation.titleEn || '',
      contentEn: translation.contentEn || '',
      titleTh: translation.titleTh || '',
      contentTh: translation.contentTh || '',
    };
    all[title.trim()] = all[cleanKey];
    localStorage.setItem(HOME_TRANSLATIONS_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('Failed to save system home translation', e);
  }
}

/**
 * Get Lesson Reminder Configuration from system
 */
export function getLessonReminderConfig(): LessonReminderConfig {
  try {
    const raw = localStorage.getItem(LESSON_REMINDER_KEY);
    if (!raw) return { ...DEFAULT_LESSON_REMINDER };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_LESSON_REMINDER,
      ...parsed,
    };
  } catch (e) {
    console.warn('Failed to load lesson reminder config', e);
    return { ...DEFAULT_LESSON_REMINDER };
  }
}

/**
 * Save Lesson Reminder Configuration to system
 */
export function saveLessonReminderConfig(config: Partial<LessonReminderConfig>): LessonReminderConfig {
  try {
    const current = getLessonReminderConfig();
    const updated: LessonReminderConfig = {
      ...current,
      ...config,
    };
    localStorage.setItem(LESSON_REMINDER_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save lesson reminder config', e);
    return { ...DEFAULT_LESSON_REMINDER, ...config } as LessonReminderConfig;
  }
}

/**
 * Convert integer to Arabic ordinal word (e.g. 1 -> الأول, 10 -> العاشر)
 */
export function formatArabicOrdinalDay(day: number): string {
  const ordinals: Record<number, string> = {
    1: 'الأول',
    2: 'الثاني',
    3: 'الثالث',
    4: 'الرابع',
    5: 'الخامس',
    6: 'السادس',
    7: 'السابع',
    8: 'الثامن',
    9: 'التاسع',
    10: 'العاشر',
    11: 'الحادي عشر',
    12: 'الثاني عشر',
    13: 'الثالث عشر',
    14: 'الرابع عشر',
    15: 'الخامس عشر',
    16: 'السادس عشر',
    17: 'السابع عشر',
    18: 'الثامن عشر',
    19: 'التاسع عشر',
    20: 'العشرون',
    21: 'الحادي والعشرون',
    22: 'الثاني والعشرون',
    23: 'الثالث والعشرون',
    24: 'الرابع والعشرون',
    25: 'الخامس والعشرون',
    26: 'السادس والعشرون',
    27: 'السابع والعشرون',
    28: 'الثامن والعشرون',
    29: 'التاسع والعشرون',
    30: 'الثلاثون',
  };
  return ordinals[day] || `اليوم ${day}`;
}

/**
 * Convert integer to English ordinal (e.g. 1 -> 1st, 2 -> 2nd)
 */
export function formatEnglishOrdinalDay(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return `${day}st`;
  if (j === 2 && k !== 12) return `${day}nd`;
  if (j === 3 && k !== 13) return `${day}rd`;
  return `${day}th`;
}

/**
 * Calculates a student's active day number based on their schedule & start date
 */
export function calculateStudentDayNumber(studentId: string, studentName?: string): number {
  if (!studentId && !studentName) return 1;

  const sId = String(studentId || '').trim();
  const sName = String(studentName || '').trim();

  let startDateStr = '';
  let activeDaysStr = '';

  // 1. Check custom schedule override
  try {
    const customRaw = localStorage.getItem(`student_custom_sched_${sId}`);
    if (customRaw) {
      const parsed = JSON.parse(customRaw);
      if (parsed.startDate) startDateStr = parsed.startDate;
      if (parsed.activeDays) activeDaysStr = parsed.activeDays;
    }
  } catch (e) {}

  // 2. Check cached all schedules list
  if (!startDateStr) {
    try {
      const allRaw = localStorage.getItem('all_schedules_cached');
      if (allRaw) {
        const schedules = JSON.parse(allRaw);
        if (Array.isArray(schedules)) {
          const match = schedules.find((s: any) => {
            const id = String(s.studentId || s.id || '').trim();
            const name = String(s.studentName || s.name || '').trim();
            return (sId && id === sId) || (sName && name === sName);
          });
          if (match) {
            if (match.startDate) startDateStr = match.startDate;
            if (match.activeDays) activeDaysStr = match.activeDays;
          }

          // Fallback to default schedule if student has no custom start date
          if (!startDateStr) {
            const def = schedules.find((s: any) => s.studentId === 'DEFAULT_STUDENT');
            if (def && def.startDate) {
              startDateStr = def.startDate;
              if (!activeDaysStr && def.activeDays) activeDaysStr = def.activeDays;
            }
          }
        }
      }
    } catch (e) {}
  }

  if (!startDateStr || !startDateStr.trim()) {
    return 1;
  }

  // Calculate day count
  try {
    const parts = startDateStr.split('-');
    if (parts.length === 3) {
      const start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      start.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (today < start) {
        return 1;
      }

      // Parse active days indices (0 = Sunday, 1 = Monday, ...)
      const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      let activeIndices = [0, 1, 2, 3, 4, 5, 6];
      if (activeDaysStr && activeDaysStr.trim()) {
        const parsedIndices: number[] = [];
        for (let i = 0; i < dayNames.length; i++) {
          if (activeDaysStr.includes(dayNames[i])) parsedIndices.push(i);
        }
        if (parsedIndices.length > 0) activeIndices = parsedIndices;
      }

      // Count active days from start date to today
      let activeDayCount = 0;
      const cur = new Date(start);
      while (cur <= today) {
        if (activeIndices.includes(cur.getDay())) {
          activeDayCount++;
        }
        cur.setDate(cur.getDate() + 1);
      }

      return Math.max(1, activeDayCount);
    }
  } catch (e) {}

  return 1;
}

/**
 * Replaces dynamic variables in reminder templates with live student data:
 * {day_number}
 * {new_lessons}
 * {pending_lessons}
 * {completed_lessons}
 * {total_remaining}
 * {student_name}
 */
export function interpolateReminderText(
  template: string,
  stats: Partial<StudentReminderStats>,
  lang: 'ar' | 'en' | 'th' = 'ar'
): string {
  if (!template) return '';

  const dayNum = stats.dayNumber !== undefined ? Number(stats.dayNumber) : 1;
  const newL = stats.newLessons !== undefined ? Number(stats.newLessons) : 0;
  const pendingL = stats.pendingLessons !== undefined ? Number(stats.pendingLessons) : 0;
  const completedL = stats.completedLessons !== undefined ? Number(stats.completedLessons) : 0;
  const totalRem = stats.totalRemaining !== undefined ? Number(stats.totalRemaining) : (newL + pendingL);
  const sName = stats.studentName || (lang === 'en' ? 'Student' : lang === 'th' ? 'นักเรียน' : 'بطلنا');

  // Format day display based on language
  let formattedDay = String(dayNum);
  if (lang === 'ar') {
    formattedDay = formatArabicOrdinalDay(dayNum);
  } else if (lang === 'en') {
    formattedDay = formatEnglishOrdinalDay(dayNum);
  } else if (lang === 'th') {
    formattedDay = `วันที่ ${dayNum}`;
  }

  let result = template;

  // Variables mapping (Supporting both English code-style and Arabic descriptive placeholders)
  const varsMap: Record<string, string | number> = {
    '{day_number}': formattedDay,
    '{day_num}': dayNum,
    '{اليوم}': formattedDay,
    '{رقم_اليوم}': formattedDay,
    '{new_lessons}': newL,
    '{دروس_جديدة}': newL,
    '{الدروس_الجديدة}': newL,
    '{pending_lessons}': pendingL,
    '{دروس_معلقة}': pendingL,
    '{الدروس_المعلقة}': pendingL,
    '{الدروس_السابقة}': pendingL,
    '{completed_lessons}': completedL,
    '{دروس_مكتملة}': completedL,
    '{الدروس_المكتملة}': completedL,
    '{total_remaining}': totalRem,
    '{المتبقي}': totalRem,
    '{إجمالي_المتبقي}': totalRem,
    '{student_name}': sName,
    '{اسم_الطالب}': sName,
    '{الطالب}': sName,
  };

  for (const [placeholder, value] of Object.entries(varsMap)) {
    result = result.split(placeholder).join(String(value));
  }

  return result;
}
