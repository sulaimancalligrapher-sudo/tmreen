/**
 * Helper utility to calculate study day number based on student schedule:
 * Option 1 (Academic Plan): Based on startDate and active study days.
 */

export interface StudyDayInfo {
  dayNumber: number | null;
  dayOrdinal: string;
  isTodayActiveDay: boolean;
  status: 'active_day' | 'rest_day' | 'not_started' | 'no_schedule';
  welcomeMessage: string;
  badgeText: string;
  startDateStr: string;
  activeDaysStr: string;
}

const ARABIC_ORDINALS: { [key: number]: string } = {
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
  31: 'الحادي والثلاثون',
  32: 'الثاني والثلاثون',
  33: 'الثالث والثلاثون',
  34: 'الرابع والثلاثون',
  35: 'الخامس والثلاثون',
  36: 'السادس والثلاثون',
  37: 'السابع والثلاثون',
  38: 'الثامن والثلاثون',
  39: 'التاسع والثلاثون',
  40: 'الأربعون',
};

export function getArabicOrdinal(num: number): string {
  if (ARABIC_ORDINALS[num]) {
    return ARABIC_ORDINALS[num];
  }
  return `الـ ${num}`;
}

export function parseActiveDaysArray(activeDaysStr?: string): number[] {
  if (!activeDaysStr || !activeDaysStr.trim()) {
    // Default all 7 days if not specified
    return [0, 1, 2, 3, 4, 5, 6];
  }

  const str = activeDaysStr.trim();
  // Check for common Arabic names
  const days: number[] = [];
  const parts = str.split(/[,،\s]+/);

  for (const part of parts) {
    const p = part.trim();
    if (p.includes('أحد') || p.includes('الاحد') || p.includes('الأحد') || p.toLowerCase().includes('sun')) days.push(0);
    else if (p.includes('اثنين') || p.includes('الاثنين') || p.includes('الأثنين') || p.toLowerCase().includes('mon')) days.push(1);
    else if (p.includes('ثلاثاء') || p.includes('الثلاثاء') || p.toLowerCase().includes('tue')) days.push(2);
    else if (p.includes('أربعاء') || p.includes('الاربعاء') || p.includes('الأربعاء') || p.toLowerCase().includes('wed')) days.push(3);
    else if (p.includes('خميس') || p.includes('الخميس') || p.toLowerCase().includes('thu')) days.push(4);
    else if (p.includes('جمعة') || p.includes('الجمعة') || p.toLowerCase().includes('fri')) days.push(5);
    else if (p.includes('سبت') || p.includes('السبت') || p.toLowerCase().includes('sat')) days.push(6);
  }

  return days.length > 0 ? Array.from(new Set(days)) : [0, 1, 2, 3, 4, 5, 6];
}

function getStudyDayTranslation(key: string, defaultAr: string): string {
  try {
    const lang = (localStorage.getItem('app_language_code') as any) || 'ar';
    const overrides = localStorage.getItem('app_i18n_dictionary_overrides');
    if (overrides) {
      const parsed = JSON.parse(overrides);
      if (parsed?.home?.[key]?.[lang]) {
        return parsed.home[key][lang];
      }
    }
  } catch (e) {}
  return defaultAr;
}

/**
 * Calculate study day based on student schedule & current date
 */
export function calculateStudentStudyDay(
  schedule?: { startDate?: string; activeDays?: string } | null,
  studentName?: string,
  studentId?: string
): StudyDayInfo {
  const name = (studentName || '').trim() || 'يا بطل';
  let effectiveSchedule = schedule;

  // If schedule or startDate is missing, check localStorage caches
  if (!effectiveSchedule || !effectiveSchedule.startDate) {
    try {
      const sId = studentId || '';
      const sName = studentName || '';
      const customRaw =
        (sId ? localStorage.getItem(`student_custom_sched_${sId}`) : null) ||
        (sName ? localStorage.getItem(`student_custom_sched_${sName}`) : null);

      if (customRaw) {
        const parsed = JSON.parse(customRaw);
        if (parsed && parsed.startDate) {
          effectiveSchedule = parsed;
        }
      }

      if (!effectiveSchedule || !effectiveSchedule.startDate) {
        const allRaw = localStorage.getItem('all_schedules_cached');
        if (allRaw) {
          const list = JSON.parse(allRaw);
          if (Array.isArray(list)) {
            const found = list.find((s: any) => {
              const itemSid = String(s.studentId || s.id || '').trim();
              const itemSname = String(s.studentName || s.name || '').trim();
              return (sId && itemSid === sId) || (sName && itemSname === sName);
            });
            if (found && found.startDate) {
              effectiveSchedule = found;
            } else {
              const def = list.find((s: any) => s.studentId === 'DEFAULT_STUDENT');
              if (def && def.startDate) {
                effectiveSchedule = def;
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  if (!effectiveSchedule || !effectiveSchedule.startDate || !effectiveSchedule.startDate.trim()) {
    return {
      dayNumber: null,
      dayOrdinal: '',
      isTodayActiveDay: true,
      status: 'no_schedule',
      welcomeMessage: `أهلاً بك يا ${name}.. تم تسجيل دخولك بنجاح في المنصة التعليمية، نتمنى لك علماً نافعاً وموفقاً! 🌟`,
      badgeText: 'المنظومة التعليمية 📚',
      startDateStr: '',
      activeDaysStr: '',
    };
  }

  const startDateStr = effectiveSchedule.startDate.trim();
  const activeDaysStr = effectiveSchedule.activeDays || '';
  const parts = startDateStr.split('-');

  if (parts.length !== 3) {
    return {
      dayNumber: null,
      dayOrdinal: '',
      isTodayActiveDay: true,
      status: 'no_schedule',
      welcomeMessage: `أهلاً بك يا ${name}.. تم تسجيل دخولك بنجاح، نتمنى لك علماً نافعاً وموفقاً! 🌟`,
      badgeText: 'المنظومة التعليمية 📚',
      startDateStr,
      activeDaysStr,
    };
  }

  const startDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If today is before the start date
  if (today.getTime() < startDate.getTime()) {
    const notStartedTemplate = getStudyDayTranslation(
      'welcomeNotStartedMessageTemplate',
      'أهلاً بك يا {name}.. يبدأ برنامجك الدراسي بتاريخ {date}، نتمنى لك رحلة تعليمية موفقة! 🌟'
    );
    const notStartedMsg = notStartedTemplate
      .replace(/{name}/g, name)
      .replace(/{date}/g, startDateStr);

    return {
      dayNumber: 0,
      dayOrdinal: 'قبل البداية',
      isTodayActiveDay: false,
      status: 'not_started',
      welcomeMessage: notStartedMsg,
      badgeText: `يبدأ بتاريخ ${startDateStr} ⏳`,
      startDateStr,
      activeDaysStr,
    };
  }

  const activeDays = parseActiveDaysArray(activeDaysStr);
  const todayDayOfWeek = today.getDay();
  const isTodayActiveDay = activeDays.includes(todayDayOfWeek);

  // Count active study days passed from startDate up to today (inclusive)
  let activeDaysPassed = 0;
  const tempDate = new Date(startDate.getTime());
  let safetyLoop = 0;

  while (tempDate.getTime() <= today.getTime() && safetyLoop < 1500) {
    if (activeDays.includes(tempDate.getDay())) {
      activeDaysPassed++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
    safetyLoop++;
  }

  // Ensure at least day 1 if we've reached start date
  const dayNumber = Math.max(1, activeDaysPassed);
  const ordinal = getArabicOrdinal(dayNumber);

  if (isTodayActiveDay) {
    const activeTemplate = getStudyDayTranslation(
      'welcomeDayMessageTemplate',
      'أهلاً بك يا {name}.. تم تسجيل دخولك في اليوم {day} من البرنامج، نتمنى لك علماً نافعاً وموفقاً! 🌟'
    );
    const activeMsg = activeTemplate
      .replace(/{name}/g, name)
      .replace(/{day}/g, ordinal);

    return {
      dayNumber,
      dayOrdinal: ordinal,
      isTodayActiveDay: true,
      status: 'active_day',
      welcomeMessage: activeMsg,
      badgeText: `اليوم ${ordinal} من البرنامج الدراسي 📚`,
      startDateStr,
      activeDaysStr,
    };
  } else {
    const restTemplate = getStudyDayTranslation(
      'welcomeRestDayMessageTemplate',
      'أهلاً بك يا {name}.. اليوم استراحة ومراجعة بعد إنهاء اليوم {day} من البرنامج، نتمنى لك وقتاً ممتعاً! 🌟'
    );
    const restMsg = restTemplate
      .replace(/{name}/g, name)
      .replace(/{day}/g, ordinal);

    return {
      dayNumber,
      dayOrdinal: ordinal,
      isTodayActiveDay: false,
      status: 'rest_day',
      welcomeMessage: restMsg,
      badgeText: `يوم استراحة ومراجعة (اليوم ${ordinal}) 🌿`,
      startDateStr,
      activeDaysStr,
    };
  }
}
