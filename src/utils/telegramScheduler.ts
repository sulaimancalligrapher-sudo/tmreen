import { AttendanceSettings, StudentSchedule, TeacherContact, TelegramLanguageTemplates } from '../types';
import {
  clearTelegramDispatchCache,
  DEFAULT_TELEGRAM_TEMPLATES_AR,
  DEFAULT_TELEGRAM_TEMPLATES_EN,
  DEFAULT_TELEGRAM_TEMPLATES_TH,
  interpolateTelegramTemplate,
  sendTelegramMessage,
} from './telegram';

export interface DispatchNotificationParams {
  eventType: keyof TelegramLanguageTemplates;
  student: {
    id: string;
    name: string;
    telegramChatId?: string;
    preferredLanguage?: 'ar' | 'en' | 'th';
    assignedTeacherId?: string;
  };
  settings: AttendanceSettings;
  customSchedule?: Partial<StudentSchedule> | null;
  extraVars?: Record<string, string | number>;
  forceSend?: boolean;
}

export interface DispatchNotificationResult {
  sentToStudent: boolean;
  sentToTeacher: boolean;
  sentToAdmin: boolean;
  sentToChannelsCount: number;
  errors: string[];
}

/**
 * Clears all notification deduplication keys, locks, and dispatch tracking from storage.
 * NOTE: Intentionally preserves student Telegram chat IDs (student_telegram_*) and actual attendance logs!
 */
export function clearAllTelegramNotificationMemory(): { clearedCount: number; clearedKeys: string[] } {
  let clearedCount = 0;
  const clearedKeys: string[] = [];

  try {
    // 1. Clear LocalStorage notification & dispatch tracking keys (Preserving accounts & attendance)
    const lsKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // DO NOT delete linked telegram accounts or chat language preferences or active student records
      if (
        key.startsWith('student_telegram_') ||
        key.startsWith('tg_chat_lang_') ||
        key.startsWith('tg_registered_') ||
        key.startsWith('telegram_unlinked_') ||
        key === 'all_schedules_cached' ||
        key === 'attendance_settings_cached' ||
        key === 'studentId' ||
        key === 'studentName'
      ) {
        continue;
      }

      if (
        key.startsWith('tg_preclass_') ||
        key.startsWith('tg_late_') ||
        key.startsWith('tg_final_absent_') ||
        key.startsWith('tg_teacher_') ||
        key.startsWith('tg_entry_notified_') ||
        key.startsWith('tg_event_dispatched_') ||
        key.startsWith('tg_dispatch_lock_') ||
        key.startsWith('tg_blocked_') ||
        key.startsWith('tg_last_dispatched_') ||
        key.startsWith('tg_early_') ||
        key.includes('preclass_sent') ||
        key.includes('preclass_lock') ||
        key.includes('late_count') ||
        key.includes('late_last_time') ||
        key.includes('late_lock') ||
        key.includes('final_absent_sent') ||
        key.includes('final_absent_lock') ||
        key.includes('teacher_briefing') ||
        key.includes('teacher_snapshot') ||
        key.includes('teacher_wrapup') ||
        key.includes('entry_notified') ||
        key.includes('event_dispatched')
      ) {
        lsKeysToRemove.push(key);
      }
    }

    lsKeysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
        clearedCount++;
        clearedKeys.push(k);
      } catch (e) {}
    });

    // 2. Clear SessionStorage keys
    const ssKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('tg_') ||
        key.includes('entry_notified') ||
        key.includes('event_dispatched') ||
        key.includes('blocked')
      ) {
        ssKeysToRemove.push(key);
      }
    }

    ssKeysToRemove.forEach((k) => {
      try {
        sessionStorage.removeItem(k);
        clearedCount++;
        clearedKeys.push(k);
      } catch (e) {}
    });

    // 3. Clear In-memory deduplication cache
    clearTelegramDispatchCache();

    // 4. Clear all cached presence records and live presence state for test mode
    try {
      localStorage.removeItem('today_active_presence_registry');
      localStorage.removeItem('live_active_students_cached');
      localStorage.removeItem('live_logged_out_students_cached');
      localStorage.removeItem('live_completed_students_cached');
      localStorage.removeItem('live_absent_students_cached');
      
      const presenceKeysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (
          k.startsWith('student_present_') ||
          k.startsWith('student_attended_') ||
          k.startsWith('punchin_') ||
          k.startsWith('attendance_punch_in_')
        ) {
          presenceKeysToRemove.push(k);
        }
      }
      presenceKeysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}

    // 5. Dispatch broadcast event for all components
    try {
      window.dispatchEvent(new CustomEvent('telegram_memory_cleared', { detail: { clearedCount, timestamp: Date.now() } }));
    } catch (e) {}
  } catch (e) {}

  return { clearedCount, clearedKeys };
}

/**
 * Clears active presence records for a specific student upon logout, while securely registering them as attended & logged out today.
 */
export function clearStudentActivePresence(studentId: string, studentName?: string): void {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const sId = String(studentId || '').trim();
  const sName = String(studentName || '').trim();
  const cleanId = normalizeStudentIdForMatching(sId);
  const time = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });

  try {
    // 1. Permanently register that this student attended the session today (so they are NEVER marked absent later)
    if (sId) {
      localStorage.setItem(`student_attended_${sId}_${todayIsoKey}`, JSON.stringify({ studentId: sId, studentName: sName, date: todayIsoKey, time }));
    }
    if (cleanId) {
      localStorage.setItem(`student_attended_${cleanId}_${todayIsoKey}`, JSON.stringify({ studentId: sId, studentName: sName, date: todayIsoKey, time }));
    }

    // 2. Remove active session keys (student is no longer currently inside the portal)
    if (sId) {
      sessionStorage.removeItem(`student_active_session_${sId}`);
      sessionStorage.removeItem(`tg_entry_time_${sId}`);
    }
    if (cleanId) {
      sessionStorage.removeItem(`student_active_session_${cleanId}`);
      sessionStorage.removeItem(`tg_entry_time_${cleanId}`);
    }
    if (sName) {
      sessionStorage.removeItem(`student_active_session_${sName}`);
      sessionStorage.removeItem(`tg_entry_time_${sName}`);
    }

    // 3. Move from live_active_students_cached to live_logged_out_students_cached
    try {
      const liveRaw = localStorage.getItem('live_active_students_cached');
      let entryTimeFromLive = time;
      if (liveRaw) {
        const liveList = JSON.parse(liveRaw);
        if (Array.isArray(liveList)) {
          const found = liveList.find((st: any) =>
            areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })
          );
          if (found && (found.loginTime || found.entryTime)) {
            entryTimeFromLive = found.loginTime || found.entryTime;
          }
          const filtered = liveList.filter(
            (st: any) => !areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })
          );
          localStorage.setItem('live_active_students_cached', JSON.stringify(filtered));
        }
      }

      // Add to logged out cache
      const loggedOutRaw = localStorage.getItem('live_logged_out_students_cached');
      let loggedOutList = loggedOutRaw ? JSON.parse(loggedOutRaw) : [];
      if (!Array.isArray(loggedOutList)) loggedOutList = [];
      const alreadyInLoggedOut = loggedOutList.some((st: any) =>
        areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })
      );
      if (!alreadyInLoggedOut) {
        loggedOutList.push({
          studentId: sId,
          studentName: sName,
          loginTime: entryTimeFromLive,
          entryTime: entryTimeFromLive,
          status: 'logged_out',
          date: todayIsoKey,
        });
        localStorage.setItem('live_logged_out_students_cached', JSON.stringify(loggedOutList));
      }
    } catch (e) {}

    // 4. Dispatch update
    try {
      window.dispatchEvent(new CustomEvent('student_presence_updated', { detail: { studentId: sId, studentName: sName, loggedOut: true } }));
    } catch (e) {}
  } catch (e) {}
}

/**
 * Normalizes Arabic text (removes tashkeel, standardizes hamzas, taa marbuta, alif maksura).
 */
export function normalizeArabicText(text?: string): string {
  if (!text) return '';
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[أإآآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[يى]/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes an identifier string for resilient matching (strips '#', converts Arabic/Thai digits, trims, lowercase).
 */
export function normalizeStudentIdForMatching(id?: string | number): string {
  if (id === undefined || id === null) return '';
  let str = String(id).trim().toLowerCase();
  if (str.startsWith('#')) str = str.slice(1).trim();
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '٨', '٩'];
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(arabicDigits[i], String(i)).replaceAll(thaiDigits[i], String(i));
  }
  return str;
}

/**
 * Cross-checks if two student identifiers or records match (supporting ID, digits-only, or normalized name).
 */
export function areStudentRecordsMatching(
  s1: { id?: string | number; studentId?: string | number; name?: string; studentName?: string },
  s2: { id?: string | number; studentId?: string | number; name?: string; studentName?: string }
): boolean {
  const rawId1 = s1.studentId !== undefined ? s1.studentId : s1.id;
  const rawId2 = s2.studentId !== undefined ? s2.studentId : s2.id;
  const id1 = normalizeStudentIdForMatching(rawId1);
  const id2 = normalizeStudentIdForMatching(rawId2);

  if (id1 && id2 && id1 === id2) return true;

  // Compare numeric component if length >= 2
  const num1 = id1.replace(/\D+/g, '');
  const num2 = id2.replace(/\D+/g, '');
  if (num1 && num2 && num1 === num2 && num1.length >= 2) return true;

  const rawName1 = s1.studentName || s1.name;
  const rawName2 = s2.studentName || s2.name;
  const n1 = normalizeArabicText(rawName1);
  const n2 = normalizeArabicText(rawName2);

  if (n1 && n2 && (n1 === n2 || (n1.length > 3 && n2.length > 3 && (n1.includes(n2) || n2.includes(n1))))) {
    return true;
  }

  return false;
}

/**
 * Registers student active presence into all localStorage & sessionStorage keys and central active registry.
 */
export function registerStudentActivePresence(
  studentId: string,
  studentName?: string,
  entryTimeStr?: string
): void {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const sId = String(studentId || '').trim();
  const sName = String(studentName || '').trim();
  const cleanId = normalizeStudentIdForMatching(sId);
  const time = entryTimeStr || now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });

  try {
    // 1. Direct LocalStorage flags
    if (sId) {
      localStorage.setItem(`student_present_${sId}_${todayKey}`, 'true');
      localStorage.setItem(`student_present_${sId}_${todayIsoKey}`, 'true');
      localStorage.setItem(`punchin_${sId}_${todayKey}`, 'true');
      localStorage.setItem(`punchin_${sId}_${todayIsoKey}`, 'true');
      localStorage.setItem(`punchin_time_${sId}_${todayIsoKey}`, time);
      localStorage.setItem(`attendance_punch_in_${sId}_${todayKey}`, 'true');
    }
    if (cleanId && cleanId !== sId) {
      localStorage.setItem(`student_present_${cleanId}_${todayKey}`, 'true');
      localStorage.setItem(`student_present_${cleanId}_${todayIsoKey}`, 'true');
      localStorage.setItem(`punchin_${cleanId}_${todayKey}`, 'true');
      localStorage.setItem(`punchin_${cleanId}_${todayIsoKey}`, 'true');
      localStorage.setItem(`punchin_time_${cleanId}_${todayIsoKey}`, time);
      localStorage.setItem(`attendance_punch_in_${cleanId}_${todayKey}`, 'true');
    }
    if (sName) {
      localStorage.setItem(`student_present_${sName}_${todayKey}`, 'true');
      localStorage.setItem(`student_present_${sName}_${todayIsoKey}`, 'true');
      localStorage.setItem(`punchin_${sName}_${todayKey}`, 'true');
      localStorage.setItem(`punchin_${sName}_${todayIsoKey}`, 'true');
      localStorage.setItem(`attendance_punch_in_${sName}_${todayKey}`, 'true');
    }

    // 2. SessionStorage flags
    if (sId) {
      sessionStorage.setItem(`student_active_session_${sId}`, 'true');
      sessionStorage.setItem(`tg_entry_time_${sId}`, time);
    }
    if (cleanId) {
      sessionStorage.setItem(`student_active_session_${cleanId}`, 'true');
      sessionStorage.setItem(`tg_entry_time_${cleanId}`, time);
    }
    if (sName) {
      sessionStorage.setItem(`student_active_session_${sName}`, 'true');
      sessionStorage.setItem(`tg_entry_time_${sName}`, time);
    }

    // 3. Central presence registry in LocalStorage
    const registryRaw = localStorage.getItem('today_active_presence_registry');
    let registry: Record<string, { studentId: string; studentName: string; time: string; timestamp: number; date: string }> = {};
    if (registryRaw) {
      try {
        registry = JSON.parse(registryRaw) || {};
      } catch (e) {}
    }
    const regKey = cleanId || sId || sName;
    if (regKey) {
      registry[regKey] = {
        studentId: sId,
        studentName: sName,
        time,
        timestamp: Date.now(),
        date: todayIsoKey,
      };
      localStorage.setItem('today_active_presence_registry', JSON.stringify(registry));
    }

    // 4. Update live_active_students_cached and remove from absent cache
    try {
      const liveRaw = localStorage.getItem('live_active_students_cached');
      let liveList = liveRaw ? JSON.parse(liveRaw) : [];
      if (!Array.isArray(liveList)) liveList = [];
      const alreadyInLive = liveList.some((st: any) =>
        areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })
      );
      if (!alreadyInLive) {
        liveList.push({
          studentId: sId,
          studentName: sName,
          loginTime: time,
          entryTime: time,
          status: 'active',
          date: todayIsoKey,
        });
        localStorage.setItem('live_active_students_cached', JSON.stringify(liveList));
      }

      // Remove from cached absent list if present
      const absentRaw = localStorage.getItem('live_absent_students_cached');
      if (absentRaw) {
        const absentList = JSON.parse(absentRaw);
        if (Array.isArray(absentList)) {
          const filteredAbsent = absentList.filter((st: any) =>
            !areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })
          );
          localStorage.setItem('live_absent_students_cached', JSON.stringify(filteredAbsent));
        }
      }
    } catch (e) {}

    // 5. Dispatch custom presence update event across the browser window/tabs
    try {
      window.dispatchEvent(new CustomEvent('student_presence_updated', { detail: { studentId: sId, studentName: sName, time } }));
    } catch (e) {}
  } catch (e) {}
}

/**
 * Checks whether a student is present / logged in / active / completed today from all sources (local + backend synced).
 */
export function isStudentPresentOrActiveToday(
  studentId: string,
  studentName?: string
): { isPresent: boolean; entryTime: string } {
  const sId = String(studentId || '').trim();
  const sName = String(studentName || '').trim();
  const cleanId = normalizeStudentIdForMatching(sId);

  const now = new Date();
  const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 1. Check if student actually punched in / attended TODAY on this client or session
  try {
    const todayPunchInKeys = [
      sId ? `punchin_${sId}_${todayIsoKey}` : '',
      sName ? `punchin_${sName}_${todayIsoKey}` : '',
      cleanId ? `punchin_${cleanId}_${todayIsoKey}` : '',
      sId ? `student_present_${sId}_${todayIsoKey}` : '',
      cleanId ? `student_present_${cleanId}_${todayIsoKey}` : '',
      sId ? `attendance_punch_in_${sId}_${todayIsoKey}` : '',
      cleanId ? `attendance_punch_in_${cleanId}_${todayIsoKey}` : '',
    ].filter(Boolean);

    for (const key of todayPunchInKeys) {
      if (localStorage.getItem(key) === 'true' || sessionStorage.getItem(key) === 'true') {
        const time =
          sessionStorage.getItem(`tg_entry_time_${sId}`) ||
          sessionStorage.getItem(`tg_entry_time_${cleanId}`) ||
          localStorage.getItem(`punchin_time_${sId}_${todayIsoKey}`) ||
          localStorage.getItem(`punchin_time_${cleanId}_${todayIsoKey}`) ||
          'مسجل اليوم';
        return { isPresent: true, entryTime: time };
      }
    }

    // Check active session flag for today
    const activeSessionKey = `student_active_session_${sId}`;
    if (sessionStorage.getItem(activeSessionKey) === todayIsoKey) {
      return { isPresent: true, entryTime: sessionStorage.getItem(`tg_entry_time_${sId}`) || 'متواجد الآن' };
    }
  } catch (e) {}

  // 2. Check live_active_students_cached (synced directly from Google Sheet AttendanceLogs for today)
  try {
    const liveActiveRaw = localStorage.getItem('live_active_students_cached');
    if (liveActiveRaw) {
      const list = JSON.parse(liveActiveRaw);
      if (Array.isArray(list) && list.length > 0) {
        for (const st of list) {
          if (areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })) {
            return { isPresent: true, entryTime: st.loginTime || st.entryTime || 'متواجد الآن' };
          }
        }
      }
    }
  } catch (e) {}

  // 3. Check live_completed_students_cached (completed all required lessons today)
  try {
    const liveCompletedRaw = localStorage.getItem('live_completed_students_cached');
    if (liveCompletedRaw) {
      const list = JSON.parse(liveCompletedRaw);
      if (Array.isArray(list) && list.length > 0) {
        for (const st of list) {
          if (areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })) {
            return { isPresent: true, entryTime: st.loginTime || 'أتم الدروس بنجاح' };
          }
        }
      }
    }
  } catch (e) {}

  // 4. Check live_logged_out_students_cached (student attended and logged out today)
  try {
    const liveLoggedOutRaw = localStorage.getItem('live_logged_out_students_cached');
    if (liveLoggedOutRaw) {
      const list = JSON.parse(liveLoggedOutRaw);
      if (Array.isArray(list) && list.length > 0) {
        for (const st of list) {
          if (areStudentRecordsMatching({ id: sId, name: sName }, { id: st.studentId || st.id, name: st.studentName || st.name })) {
            return { isPresent: true, entryTime: st.loginTime || st.entryTime || 'حضر وسجل خروج' };
          }
        }
      }
    }
  } catch (e) {}

  // 5. Check local student_attended records for today
  try {
    const attendedKeys = [
      sId ? `student_attended_${sId}_${todayIsoKey}` : '',
      cleanId ? `student_attended_${cleanId}_${todayIsoKey}` : '',
      sName ? `student_attended_${sName}_${todayIsoKey}` : '',
    ].filter(Boolean);

    for (const k of attendedKeys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.date === todayIsoKey || !parsed.date)) {
            return { isPresent: true, entryTime: parsed.time || 'حضر وسجل خروج' };
          }
        } catch (e) {
          return { isPresent: true, entryTime: 'حضر وسجل خروج' };
        }
      }
    }
  } catch (e) {}

  // 6. Check central presence registry for today
  try {
    const registryRaw = localStorage.getItem('today_active_presence_registry');
    if (registryRaw) {
      const registry = JSON.parse(registryRaw);
      if (registry && typeof registry === 'object') {
        for (const [k, item] of Object.entries<any>(registry)) {
          if (item?.date && item.date !== todayIsoKey) continue;
          if (areStudentRecordsMatching({ id: sId, name: sName }, { id: item?.studentId || k, name: item?.studentName })) {
            return { isPresent: true, entryTime: item.time || 'مسجل بالحصة' };
          }
        }
      }
    }
  } catch (e) {}

  return { isPresent: false, entryTime: '' };
}

/**
 * Normalizes any language string or code (e.g. 'العربية (AR)', 'ภาษาไทย (TH)', 'English (EN)', 'th-TH', 'thai') into a clean 'ar' | 'en' | 'th'
 */
export function normalizeTelegramLanguage(lang?: any): 'ar' | 'en' | 'th' {
  if (!lang) return 'ar';
  const l = String(lang).toLowerCase().trim();
  if (l === 'en' || l.startsWith('en') || l.includes('eng') || l.includes('english')) return 'en';
  if (l === 'th' || l.startsWith('th') || l.includes('thai') || l.includes('ไทย')) return 'th';
  return 'ar';
}

/**
 * Resolves the student's Telegram Chat ID from multiple fallback sources.
 */
export function resolveStudentTelegramChatId(
  studentId: string,
  studentName?: string,
  explicitChatId?: string
): { chatId: string; lang: 'ar' | 'en' | 'th' } {
  if (explicitChatId && explicitChatId.trim()) {
    let lang: 'ar' | 'en' | 'th' = 'ar';
    try {
      const storedLang = localStorage.getItem(`tg_chat_lang_${explicitChatId.trim()}`);
      if (storedLang) lang = normalizeTelegramLanguage(storedLang);
    } catch (e) {}
    return { chatId: explicitChatId.trim(), lang };
  }

  const sId = String(studentId || '').trim();
  const sName = String(studentName || '').trim();
  const cleanId = normalizeStudentIdForMatching(sId);

  // Check if explicitly unlinked
  if (
    localStorage.getItem(`telegram_unlinked_${sId}`) === 'true' ||
    (cleanId && localStorage.getItem(`telegram_unlinked_${cleanId}`) === 'true')
  ) {
    return { chatId: '', lang: 'ar' };
  }

  try {
    const keysToTry = [
      sId ? `student_telegram_${sId}` : '',
      cleanId ? `student_telegram_${cleanId}` : '',
      sName ? `student_telegram_${sName}` : '',
      sId ? `student_custom_sched_${sId}` : '',
      cleanId ? `student_custom_sched_${cleanId}` : '',
      sName ? `student_custom_sched_${sName}` : '',
    ].filter(Boolean);

    for (const key of keysToTry) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const cid = parsed.telegramChatId || parsed.chatId;
          if (cid && String(cid).trim()) {
            return {
              chatId: String(cid).trim(),
              lang: normalizeTelegramLanguage(parsed.preferredLang || parsed.preferredLanguage || parsed.languagePreference),
            };
          }
        } catch (e) {
          // If raw is a plain chatId string
          const trimmed = raw.trim();
          if (trimmed && /^-?\d+$/.test(trimmed)) {
            let directLang: 'ar' | 'en' | 'th' = 'ar';
            try {
              const sl = localStorage.getItem(`tg_chat_lang_${trimmed}`);
              if (sl) directLang = normalizeTelegramLanguage(sl);
            } catch (e2) {}
            return { chatId: trimmed, lang: directLang };
          }
        }
      }
    }

    // Search in all_schedules_cached
    const allSchedRaw = localStorage.getItem('all_schedules_cached');
    if (allSchedRaw) {
      try {
        const parsedList = JSON.parse(allSchedRaw);
        if (Array.isArray(parsedList)) {
          const matched = parsedList.find((item) => {
            const itemCleanId = normalizeStudentIdForMatching(item.studentId || item.id);
            const itemCleanName = (item.studentName || item.name || '').toLowerCase().trim();
            return (
              (cleanId && itemCleanId === cleanId) ||
              (sId && String(item.studentId || item.id).trim() === sId) ||
              (sName && itemCleanName === sName.toLowerCase().trim())
            );
          });
          if (matched && matched.telegramChatId && String(matched.telegramChatId).trim()) {
            return {
              chatId: String(matched.telegramChatId).trim(),
              lang: normalizeTelegramLanguage(matched.preferredLanguage || matched.preferredLang),
            };
          }
        }
      } catch (e) {}
    }
  } catch (e) {}

  return { chatId: '', lang: 'ar' };
}

/**
 * Validates that a schedule or student record is a real student (not a default/dummy template record)
 */
export function isRealStudentRecord(id?: string, name?: string): boolean {
  if (!id && !name) return false;
  const sId = (id || '').trim().toLowerCase();
  const sName = (name || '').trim().toLowerCase();

  if (
    sId === 'default_student' ||
    sId === 'general_class_students' ||
    sId === 'dummy' ||
    sId === 'admin' ||
    sId === 'admin_preview' ||
    sName.includes('الإعدادات الافتراضية') ||
    sName.includes('default') ||
    sName.includes('طلاب الشعبة')
  ) {
    return false;
  }
  return true;
}

/**
 * Atomic lock helper to prevent concurrent overlapping executions across intervals and tabs.
 */
function acquireAtomicDispatchLock(lockKey: string, maxAgeMs = 120000): boolean {
  try {
    const val = localStorage.getItem(lockKey);
    if (val) {
      if (val === 'sent' || val === 'true') {
        return false; // Already sent
      }
      if (val.startsWith('locked_')) {
        const lockTime = Number(val.replace('locked_', '')) || 0;
        if (Date.now() - lockTime < maxAgeMs) {
          return false; // Currently held by active dispatch
        }
      }
    }
    localStorage.setItem(lockKey, 'locked_' + Date.now());
    return true;
  } catch (e) {
    return true;
  }
}

function releaseAtomicDispatchLock(lockKey: string, success: boolean): void {
  try {
    if (success) {
      localStorage.setItem(lockKey, 'true');
    } else {
      localStorage.removeItem(lockKey);
    }
  } catch (e) {}
}

/**
 * Unified and resilient Telegram Notification Dispatcher
 */
export async function dispatchAttendanceTelegramNotification(
  params: DispatchNotificationParams
): Promise<DispatchNotificationResult> {
  const { eventType, student, settings, customSchedule, extraVars = {} } = params;
  const result: DispatchNotificationResult = {
    sentToStudent: false,
    sentToTeacher: false,
    sentToAdmin: false,
    sentToChannelsCount: 0,
    errors: [],
  };

  // Skip dummy / template student records immediately
  if (!isRealStudentRecord(student?.id, student?.name)) {
    return result;
  }

  const botToken = settings.telegramToken?.trim();
  if (!botToken || (settings.telegramEnabled === false && !settings.telegramToken)) {
    result.errors.push('البوت غير مفعل أو رمز التوكن غير موجود');
    return result;
  }

  // Resolve Student Info & Chat ID
  const resolved = resolveStudentTelegramChatId(
    student.id,
    student.name,
    student.telegramChatId || customSchedule?.telegramChatId
  );
  const studentChatId = resolved.chatId;
  const rawStudentLang = student.preferredLanguage || customSchedule?.preferredLanguage || resolved.lang || 'ar';
  const studentLang = normalizeTelegramLanguage(rawStudentLang);

  // Compute Times & Common Variables
  const now = new Date();
  const nowTimeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
  const classTime = customSchedule?.customStartTime || settings.startTime || '19:00';
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isScheduledTimeEvent =
    eventType === 'preClass' ||
    eventType === 'absent' ||
    eventType === 'finalAbsent' ||
    eventType === 'earlyEntryAllowed' ||
    eventType === 'earlyEntryBlocked' ||
    eventType === 'welcome' ||
    eventType === 'scheduleReminder';

  const displayTime = isScheduledTimeEvent ? classTime : nowTimeStr;

  const defaultVars: Record<string, string | number> = {
    studentName: student.name || 'المشترك',
    studentId: student.id || '',
    actualTime: nowTimeStr,
    actual_time: nowTimeStr,
    classTime: classTime,
    class_time: classTime,
    startTime: classTime,
    start_time: classTime,
    time: displayTime,
    الوقت: displayTime,
    وقت_الحصة: classTime,
    وقت_البدء: classTime,
    الوقت_الفعلي: nowTimeStr,
    date: todayStr,
    lesson: 'الدروس المقررة',
    ...extraVars,
  };

  // Helper to get localized template safely
  const getTemplate = (langInput: string | undefined, key: keyof TelegramLanguageTemplates): string => {
    const lang = normalizeTelegramLanguage(langInput);
    if (lang === 'en') {
      return settings.templatesEn?.[key] || DEFAULT_TELEGRAM_TEMPLATES_EN[key] || '';
    }
    if (lang === 'th') {
      return settings.templatesTh?.[key] || DEFAULT_TELEGRAM_TEMPLATES_TH[key] || '';
    }
    return settings.templatesAr?.[key] || DEFAULT_TELEGRAM_TEMPLATES_AR[key] || '';
  };

  const studentTemplate = getTemplate(studentLang, eventType);
  const studentMessage = interpolateTelegramTemplate(studentTemplate, defaultVars);

  // Deduplication guard for session events (login, early entry, exit) per student per date/session
  const studentIdentifier = String(student.id || student.name || 'unknown').trim();
  const eventDedupKey = `tg_event_dispatched_${studentIdentifier}_${eventType}_${todayStr}_${classTime}`;
  const legacyDedupKey = `tg_event_dispatched_${studentIdentifier}_${eventType}_${todayStr}`;
  const isSessionLockEvent = eventType === 'login' || eventType === 'earlyEntryAllowed' || eventType === 'regularExit' || eventType === 'earlyExit';

  if (!params.forceSend && isSessionLockEvent) {
    if (
      localStorage.getItem(eventDedupKey) === 'true' ||
      sessionStorage.getItem(eventDedupKey) === 'true'
    ) {
      return {
        sentToStudent: true,
        sentToTeacher: false,
        sentToAdmin: true,
        sentToChannelsCount: 0,
        errors: [],
      };
    }
  }

  // 1️⃣ Send to Student (Direct to student chat if linked, or fallback to general configured Chat ID)
  let resolvedDirectChatId = studentChatId;
  if (!resolvedDirectChatId) {
    const r = resolveStudentTelegramChatId(student.id, student.name);
    if (r.chatId) {
      resolvedDirectChatId = r.chatId;
    }
  }
  const targetStudentChatId = (resolvedDirectChatId || settings.telegramChatId || '').trim();
  if (targetStudentChatId && studentMessage) {
    try {
      const res = await sendTelegramMessage({
        token: botToken,
        chatId: targetStudentChatId,
        text: studentMessage,
        skipDeduplication: Boolean(params.forceSend),
      });
      if (res.ok) {
        result.sentToStudent = true;
        if (isSessionLockEvent) {
          try {
            localStorage.setItem(eventDedupKey, 'true');
            sessionStorage.setItem(eventDedupKey, 'true');
            localStorage.setItem(legacyDedupKey, 'true');
          } catch (e) {}
        }
      } else {
        result.errors.push(`فشل الإرسال للمشترك (${targetStudentChatId}): ${res.error || 'خطأ'}`);
      }
    } catch (e: any) {
      result.errors.push(`خطأ الإرسال للمشترك: ${e.message}`);
    }
  }

  // NOTE: Individual student entry/exit alerts to teachers are intentionally omitted.
  // Teachers receive the 3 comprehensive aggregated session reports (Briefing, Snapshot, Wrap-Up).

  // 2️⃣ Send to General / Admin Chat ID (Only if explicitly different from student and forced or during admin testing)
  const adminChatId = (settings.telegramChatId || settings.telegramAdminUserId || '').trim();
  if (adminChatId && params.forceSend) {
    const alreadyReceivedByAdmin = Boolean(result.sentToStudent && targetStudentChatId === adminChatId);
    if (!alreadyReceivedByAdmin) {
      try {
        const adminTemplate = getTemplate('ar', eventType);
        const adminMsg = interpolateTelegramTemplate(adminTemplate, defaultVars);
        if (adminMsg) {
          const res = await sendTelegramMessage({
            token: botToken,
            chatId: adminChatId,
            text: adminMsg,
            skipDeduplication: true,
          });
          if (res.ok) result.sentToAdmin = true;
        }
      } catch (e: any) {
        result.errors.push(`خطأ الإرسال للإدارة: ${e.message}`);
      }
    }
  }

  // NOTE: Sending to Telegram channels/groups is currently paused as requested.

  return result;
}

/**
 * 1️⃣ Teacher Pre-Class Briefing (تقرير ما قبل الحصة المجمّع للأستاذ)
 * Sent before class start time (e.g. 15 mins before) with full subscriber list for that hour.
 */
export async function dispatchTeacherPreClassBriefing(options: {
  settings: AttendanceSettings;
  schedules: StudentSchedule[];
  classTime: string;
  targetTeacher?: TeacherContact;
  reminderMinutes?: number;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { settings, schedules, classTime, targetTeacher, reminderMinutes = 15 } = options;
  const botToken = settings.telegramToken?.trim();
  if (!botToken) return { ok: false, error: 'رمز التوكن غير متوفر' };

  // Filter real students
  let targetStudents = schedules.filter((s) => {
    if (!isRealStudentRecord(s.studentId, s.studentName)) return false;
    const sTime = s.customStartTime || settings.startTime || '19:00';
    const matchesTime = sTime === classTime;
    const matchesTeacher = !targetTeacher || !s.assignedTeacherId || s.assignedTeacherId === targetTeacher.id;
    return matchesTime && matchesTeacher;
  });

  // Fallback: If no students matched exact time, use all real students in schedules
  if (targetStudents.length === 0) {
    targetStudents = schedules.filter((s) => isRealStudentRecord(s.studentId, s.studentName));
  }

  if (targetStudents.length === 0) {
    return { ok: false, error: 'لا يوجد مشتركون مسجلون في الجدول حالياً' };
  }

  const teacherName = targetTeacher?.name || 'المعلم المشرف';
  const studentListText = targetStudents
    .map((s, idx) => `${idx + 1}️⃣ ${s.studentName} (#${s.studentId})`)
    .join('\n');

  const briefingMessage = `👨‍🏫 مرحباً يا أستاذ ${teacherName}،\n⏰ تذكير: ستبدأ الحصة اليوم في تمام الساعة ${classTime} (خلال ${reminderMinutes} دقيقة) 📚\n\n👥 قائمة المشتركين المقرر حضورهم في هذه الساعة (${targetStudents.length}):\n${studentListText}\n\n✨ يرجى الاستعداد واستقبال المشتركين في الموعد المحدد. نتمنى لكم حصة موفقة ومثمرة! 🌿`;

  const recipients = new Set<string>();
  if (targetTeacher?.telegramChatId?.trim()) {
    recipients.add(targetTeacher.telegramChatId.trim());
  } else {
    const teacherChatIds = (settings.teachers || [])
      .filter((t) => t.enabled && t.telegramChatId?.trim())
      .map((t) => t.telegramChatId.trim());

    if (teacherChatIds.length > 0) {
      teacherChatIds.forEach((id) => recipients.add(id));
    } else {
      if (settings.telegramChatId?.trim()) recipients.add(settings.telegramChatId.trim());
      if (settings.telegramAdminUserId?.trim()) recipients.add(settings.telegramAdminUserId.trim());
    }
  }

  if (recipients.size === 0) {
    return { ok: false, error: 'لا يوجد معرّف محادثة (Chat ID) مسجل للمعلم في دليل المعلمين أو في خانة الإدارة بالإعدادات' };
  }

  let anySent = false;
  for (const chatId of recipients) {
    try {
      const res = await sendTelegramMessage({
        token: botToken,
        chatId,
        text: briefingMessage,
        skipDeduplication: false,
      });
      if (res.ok) anySent = true;
    } catch (e) {}
  }

  return { ok: anySent, message: briefingMessage };
}

/**
 * 2️⃣ Teacher Mid-Class Live Attendance Snapshot (تقرير المتابعة اللحظية بعد مهلة التأخر)
 * Sent after late delay window (e.g. 10 mins into class) with present vs late subscribers list in ONE single message.
 */
export async function dispatchTeacherMidClassSnapshot(options: {
  settings: AttendanceSettings;
  schedules: StudentSchedule[];
  classTime: string;
  targetTeacher?: TeacherContact;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { settings, schedules, classTime, targetTeacher } = options;
  const botToken = settings.telegramToken?.trim();
  if (!botToken) return { ok: false, error: 'رمز التوكن غير متوفر' };

  const now = new Date();
  const nowTimeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });

  let targetStudents = schedules.filter((s) => {
    if (!isRealStudentRecord(s.studentId, s.studentName)) return false;
    const sTime = s.customStartTime || settings.startTime || '19:00';
    const matchesTime = sTime === classTime;
    const matchesTeacher = !targetTeacher || !s.assignedTeacherId || s.assignedTeacherId === targetTeacher.id;
    return matchesTime && matchesTeacher;
  });

  if (targetStudents.length === 0) {
    targetStudents = schedules.filter((s) => isRealStudentRecord(s.studentId, s.studentName));
  }

  if (targetStudents.length === 0) {
    return { ok: false, error: 'لا يوجد مشتركون مسجلون في الجدول حالياً' };
  }

  const presentList: { name: string; id: string; entryTime: string }[] = [];
  const lateList: { name: string; id: string }[] = [];

  for (const s of targetStudents) {
    const studentId = s.studentId;
    const studentName = s.studentName;
    const presence = isStudentPresentOrActiveToday(studentId, studentName);

    if (presence.isPresent) {
      presentList.push({ name: studentName, id: studentId, entryTime: presence.entryTime || 'في الموعد' });
    } else {
      lateList.push({ name: studentName, id: studentId });
    }
  }

  const total = targetStudents.length;
  const attendanceRate = Math.round((presentList.length / total) * 100);
  const teacherName = targetTeacher?.name || 'المعلم المشرف';

  let snapshotMessage = `📋 تقرير المتابعة اللحظية لحضور الحصة:\n👨‍🏫 الأستاذ: ${teacherName}\n⏰ توقيت الحصة: ${classTime} | الوقت الحالي: ${nowTimeStr}\n\n`;

  if (presentList.length > 0) {
    snapshotMessage += `🟢 الحاضرون الذين سجلوا دخولهم (${presentList.length}):\n`;
    snapshotMessage += presentList.map((p) => `• ${p.name} (#${p.id}) - ${p.entryTime} ✅`).join('\n');
    snapshotMessage += '\n\n';
  } else {
    snapshotMessage += `🟢 الحاضرون: لا يوجد تسجيل دخول حتى الآن ⏳\n\n`;
  }

  if (lateList.length > 0) {
    snapshotMessage += `🔴 المتأخرون / لم يسجلوا بعد (${lateList.length}):\n`;
    snapshotMessage += lateList.map((l) => `• ${l.name} (#${l.id}) ⏳`).join('\n');
    snapshotMessage += '\n\n';
  } else {
    snapshotMessage += `✨ اكتمل حضور جميع المشتركين المقيدين بنجاح! 👏\n\n`;
  }

  snapshotMessage += `📊 نسبة الحضور اللحظية: ${attendanceRate}% (${presentList.length} من ${total})`;

  const recipients = new Set<string>();
  if (targetTeacher?.telegramChatId?.trim()) {
    recipients.add(targetTeacher.telegramChatId.trim());
  } else {
    const teacherChatIds = (settings.teachers || [])
      .filter((t) => t.enabled && t.telegramChatId?.trim())
      .map((t) => t.telegramChatId.trim());

    if (teacherChatIds.length > 0) {
      teacherChatIds.forEach((id) => recipients.add(id));
    } else {
      if (settings.telegramChatId?.trim()) recipients.add(settings.telegramChatId.trim());
      if (settings.telegramAdminUserId?.trim()) recipients.add(settings.telegramAdminUserId.trim());
    }
  }

  if (recipients.size === 0) {
    return { ok: false, error: 'لا يوجد معرّف محادثة (Chat ID) مسجل للمعلم في دليل المعلمين أو في خانة الإدارة بالإعدادات' };
  }

  let anySent = false;
  for (const chatId of recipients) {
    try {
      const res = await sendTelegramMessage({
        token: botToken,
        chatId,
        text: snapshotMessage,
        skipDeduplication: false,
      });
      if (res.ok) anySent = true;
    } catch (e) {}
  }

  return { ok: anySent, message: snapshotMessage };
}

/**
 * 3️⃣ Teacher Post-Session / End-of-Day Wrap-Up Report (التقرير الختامي الشامل للحصة)
 * Sent when session concludes, showing total present vs total absent in ONE comprehensive report.
 */
export async function dispatchTeacherPostSessionWrapup(options: {
  settings: AttendanceSettings;
  schedules: StudentSchedule[];
  classTime: string;
  targetTeacher?: TeacherContact;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const { settings, schedules, classTime, targetTeacher } = options;
  const botToken = settings.telegramToken?.trim();
  if (!botToken) return { ok: false, error: 'رمز التوكن غير متوفر' };

  const now = new Date();
  const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let targetStudents = schedules.filter((s) => {
    if (!isRealStudentRecord(s.studentId, s.studentName)) return false;
    const sTime = s.customStartTime || settings.startTime || '19:00';
    const matchesTime = sTime === classTime;
    const matchesTeacher = !targetTeacher || !s.assignedTeacherId || s.assignedTeacherId === targetTeacher.id;
    return matchesTime && matchesTeacher;
  });

  if (targetStudents.length === 0) {
    targetStudents = schedules.filter((s) => isRealStudentRecord(s.studentId, s.studentName));
  }

  if (targetStudents.length === 0) {
    return { ok: false, error: 'لا يوجد مشتركون مسجلون في الجدول حالياً' };
  }

  const attendedList: { name: string; id: string }[] = [];
  const absentList: { name: string; id: string }[] = [];

  for (const s of targetStudents) {
    const studentId = s.studentId;
    const studentName = s.studentName;
    const presence = isStudentPresentOrActiveToday(studentId, studentName);

    if (presence.isPresent) {
      attendedList.push({ name: studentName, id: studentId });
    } else {
      absentList.push({ name: studentName, id: studentId });
    }
  }

  const total = targetStudents.length;
  const attendanceRate = Math.round((attendedList.length / total) * 100);
  const teacherName = targetTeacher?.name || 'المعلم المشرف';

  let wrapupMessage = `📊 التقرير الختامي الشامل لحصة اليوم:\n👨‍🏫 الأستاذ: ${teacherName}\n📅 التاريخ: ${todayIsoKey} | ⏰ توقيت الحصة: ${classTime}\n\n`;

  if (attendedList.length > 0) {
    wrapupMessage += `🟢 إجمالي الحاضرين والمنجزين (${attendedList.length}):\n`;
    wrapupMessage += attendedList.map((a) => `▫️ ${a.name} (#${a.id}) ✅`).join('\n');
    wrapupMessage += '\n\n';
  } else {
    wrapupMessage += `🟢 إجمالي الحاضرين: 0 مشترك\n\n`;
  }

  if (absentList.length > 0) {
    wrapupMessage += `🔴 إجمالي الغائبين (${absentList.length}):\n`;
    wrapupMessage += absentList.map((ab) => `▫️ ${ab.name} (#${ab.id}) ❌`).join('\n');
    wrapupMessage += '\n\n';
  } else {
    wrapupMessage += `🌟 حضور تام ومثالي 100% لجميع المشتركين!\n\n`;
  }

  wrapupMessage += `📈 إجمالي عدد المشتركين: ${total} مشترك\n🎯 نسبة الالتزام الإجمالية: ${attendanceRate}%`;

  const recipients = new Set<string>();
  if (targetTeacher?.telegramChatId?.trim()) {
    recipients.add(targetTeacher.telegramChatId.trim());
  } else {
    const teacherChatIds = (settings.teachers || [])
      .filter((t) => t.enabled && t.telegramChatId?.trim())
      .map((t) => t.telegramChatId.trim());

    if (teacherChatIds.length > 0) {
      teacherChatIds.forEach((id) => recipients.add(id));
    } else {
      if (settings.telegramChatId?.trim()) recipients.add(settings.telegramChatId.trim());
      if (settings.telegramAdminUserId?.trim()) recipients.add(settings.telegramAdminUserId.trim());
    }
  }

  if (recipients.size === 0) {
    return { ok: false, error: 'لا يوجد معرّف محادثة (Chat ID) مسجل للمعلم في دليل المعلمين أو في خانة الإدارة بالإعدادات' };
  }

  let anySent = false;
  for (const chatId of recipients) {
    try {
      const res = await sendTelegramMessage({
        token: botToken,
        chatId,
        text: wrapupMessage,
        skipDeduplication: false,
      });
      if (res.ok) anySent = true;
    } catch (e) {}
  }

  return { ok: anySent, message: wrapupMessage };
}

export interface SchedulerStudentDiagnostic {
  studentId: string;
  studentName: string;
  source: 'custom' | 'default';
  classStartTime: string;
  diffMinutes: number;
  currentWindow: 'outside' | 'pre_class' | 'in_session_on_time' | 'late_warning' | 'session_ended';
  hasPunchedIn: boolean;
  actionTaken: string;
  statusColor: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
}

export interface AutomatedSchedulerResult {
  dispatchedCount: number;
  logs: string[];
  simulatedTimeUsed?: string;
  studentDiagnostics: SchedulerStudentDiagnostic[];
  digestsEvaluated: {
    slot?: string;
    classTime?: string;
    preClassTriggered: boolean;
    snapshotTriggered: boolean;
    wrapupTriggered: boolean;
  }[];
}

/**
 * Checks all student schedules against the current clock time (or simulated time) and dispatches:
 * 1. Student personal reminders (Pre-class, Late warning, Final absent)
 * 2. Teacher & Admin Consolidated Digests (Pre-class Briefing, Mid-class Snapshot, Post-session Wrap-up)
 */
export async function checkAndDispatchAutomatedAlerts(
  schedules: StudentSchedule[],
  settings: AttendanceSettings,
  options?: {
    simulatedTime?: string;
    forceSend?: boolean;
    skipLocks?: boolean;
  }
): Promise<AutomatedSchedulerResult> {
  const logs: string[] = [];
  const studentDiagnostics: SchedulerStudentDiagnostic[] = [];
  const digestsEvaluated: AutomatedSchedulerResult['digestsEvaluated'] = [];
  let dispatchedCount = 0;

  const botToken = settings.telegramToken?.trim();
  if (!botToken || (settings.telegramEnabled === false && !settings.telegramToken)) {
    return {
      dispatchedCount: 0,
      logs: ['⚠️ بوت التيليجرام غير مفعّل أو رمز التوكن مفقود.'],
      studentDiagnostics: [],
      digestsEvaluated: [],
    };
  }

  // Atomic single-flight lock across intervals and tabs
  if (!options?.skipLocks && !options?.forceSend) {
    const activeRunLock = localStorage.getItem('tg_scheduler_active_run_lock');
    if (activeRunLock) {
      const lockTs = Number(activeRunLock) || 0;
      if (Date.now() - lockTs < 6000) {
        return {
          dispatchedCount: 0,
          logs: ['ℹ️ تم تخطي الفحص لتفادي التكرار (عملية فحص أخرى جارية حالياً).'],
          studentDiagnostics: [],
          digestsEvaluated: [],
        };
      }
    }
    localStorage.setItem('tg_scheduler_active_run_lock', String(Date.now()));
  }

  const now = new Date();
  let nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

  if (options?.simulatedTime && options.simulatedTime.includes(':')) {
    const [simH, simM] = options.simulatedTime.split(':').map(Number);
    if (!isNaN(simH) && !isNaN(simM)) {
      nowTotalMinutes = simH * 60 + simM;
      logs.push(`⚙️ تشغيل المجدول في وضع المحاكاة بتوقيت افتراضي: [${options.simulatedTime}]`);
    }
  }

  const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const preClassMins = Number(settings.telegramPreClassReminderMinutes) || 15;
  const lateDelayMins = Number(settings.telegramLateAlertDelayMinutes) || 10;
  const repeatEnabled = settings.telegramLateAlertRepeatEnabled !== false;
  const repeatIntervalMins = Math.max(1, Number(settings.telegramLateAlertRepeatIntervalMinutes) || 15);
  const maxRepeatCount = Math.max(1, Number(settings.telegramLateAlertMaxCount) || 2);
  const finalAbsentTiming = settings.telegramFinalAbsentTiming || 'end_of_session';
  const isDigestEnabled = settings.telegramTeacherDigestEnabled !== false;

  // Deduplicate active student schedules to prevent multiple dispatches for the same student
  const rawList = (schedules && schedules.length > 0 ? schedules : []).filter((s) =>
    isRealStudentRecord(s.studentId || (s as any).id, s.studentName || (s as any).name)
  );

  const activeSchedules: any[] = [];
  const seenStudentIdentifiers = new Set<string>();

  for (const s of rawList) {
    const sId = String(s.studentId || (s as any).id || '').trim();
    const sName = String(s.studentName || (s as any).name || '').trim();
    if (!isRealStudentRecord(sId, sName)) continue;

    const normId = normalizeStudentIdForMatching(sId);
    const normName = normalizeArabicText(sName);
    const primaryKey = normId || normName || sId;
    if (seenStudentIdentifiers.has(primaryKey)) continue;
    seenStudentIdentifiers.add(primaryKey);
    if (normName) seenStudentIdentifiers.add(normName);
    if (normId) seenStudentIdentifiers.add(normId);

    activeSchedules.push(s);
  }

  if (activeSchedules.length === 0) {
    return {
      dispatchedCount: 0,
      logs: ['⚠️ لا توجد سجلات طلاب حقيقيين مفعلة في الجدول.'],
      studentDiagnostics: [],
      digestsEvaluated: [],
    };
  }

  // Collect unique class start times to manage Teacher Consolidated Digests
  const timeSlots = new Set<string>();
  for (const s of activeSchedules) {
    timeSlots.add(s.customStartTime || settings.startTime || '19:00');
  }

  // -----------------------------------------------------------------
  // A. PROCESS INDIVIDUAL STUDENT ALERTS
  // -----------------------------------------------------------------
  for (const s of activeSchedules) {
    const studentId = s.studentId || (s as any).id;
    const studentName = s.studentName || (s as any).name || 'المشترك';
    if (!studentId || !isRealStudentRecord(studentId, studentName)) continue;

    const hasCustomTime = Boolean(s.customStartTime && s.customStartTime.trim());
    const classStartTimeStr = s.customStartTime || settings.startTime || '19:00';
    const [sh, sm] = classStartTimeStr.split(':').map(Number);
    const startTotalMinutes = (sh || 19) * 60 + (sm || 0);

    const durationMins = s.customSessionDuration || settings.sessionDurationFromStart || 120;
    const endTotalMinutes = startTotalMinutes + durationMins;

    const diffFromStart = nowTotalMinutes - startTotalMinutes;

    // Resilient Presence Evaluation (Cross-checked with Sheet, LocalStorage, and Active Registry)
    const presenceCheck = isStudentPresentOrActiveToday(studentId, studentName);
    const hasPunchedIn = presenceCheck.isPresent;

    let currentWindow: SchedulerStudentDiagnostic['currentWindow'] = 'outside';
    let actionTaken = 'في الانتظار (خارج نطاق التنبيهات)';
    let statusColor: SchedulerStudentDiagnostic['statusColor'] = 'slate';

    if (hasPunchedIn) {
      currentWindow = 'in_session_on_time';
      actionTaken = `✅ المشترك حاضر ومسجل دخوله بالحصة (${presenceCheck.entryTime})`;
      statusColor = 'emerald';
    } else if (nowTotalMinutes >= startTotalMinutes - preClassMins && nowTotalMinutes < startTotalMinutes) {
      currentWindow = 'pre_class';
      const remainingToStart = startTotalMinutes - nowTotalMinutes;
      actionTaken = `🔔 نافذة تذكير ما قبل الحصة (متبقي ${remainingToStart} دقيقة على البداية)`;
      statusColor = 'blue';
    } else if (nowTotalMinutes >= startTotalMinutes && nowTotalMinutes < startTotalMinutes + lateDelayMins) {
      currentWindow = 'in_session_on_time';
      const minsSinceStart = nowTotalMinutes - startTotalMinutes;
      actionTaken = `⏳ مهلة الحضور المسموحة (مضى ${minsSinceStart} دقيقة من أصل مهلة ${lateDelayMins} دقيقة - لم يتأخر رسمياً بعد)`;
      statusColor = 'amber';
    } else if (nowTotalMinutes >= startTotalMinutes + lateDelayMins && nowTotalMinutes < endTotalMinutes) {
      currentWindow = 'late_warning';
      const minsLate = nowTotalMinutes - startTotalMinutes;
      actionTaken = `🚨 نافذة تنبيه التأخر والغياب (متأخر ${minsLate} دقيقة عن بداية الحصة)`;
      statusColor = 'rose';
    } else if (nowTotalMinutes >= endTotalMinutes) {
      currentWindow = 'session_ended';
      actionTaken = '🏁 انتهاء وقت الحصة الكامل (مستحق للغياب النهائي)';
      statusColor = 'slate';
    }

    // 1️⃣ STUDENT PRE-CLASS REMINDER
    const preClassTriggerTime = startTotalMinutes - preClassMins;
    const normKey = normalizeStudentIdForMatching(studentId) || normalizeArabicText(studentName) || String(studentId).trim();
    const preClassSentKey = `tg_preclass_sent_${studentId}_${todayIsoKey}_${classStartTimeStr}_${preClassMins}`;
    const preClassLockKey = `tg_preclass_lock_${studentId}_${todayIsoKey}_${classStartTimeStr}_${preClassMins}`;

    if (
      nowTotalMinutes >= preClassTriggerTime &&
      nowTotalMinutes < startTotalMinutes &&
      !hasPunchedIn &&
      (options?.skipLocks || (
        localStorage.getItem(preClassSentKey) !== 'true' &&
        localStorage.getItem(`tg_preclass_sent_${normKey}_${todayIsoKey}_${classStartTimeStr}_${preClassMins}`) !== 'true'
      ))
    ) {
      const lockAcquired = options?.skipLocks || acquireAtomicDispatchLock(preClassLockKey);
      if (lockAcquired) {
        const res = await dispatchAttendanceTelegramNotification({
          eventType: 'preClass',
          student: { id: studentId, name: studentName, telegramChatId: s.telegramChatId, preferredLanguage: s.preferredLanguage },
          settings,
          customSchedule: s,
          extraVars: {
            classTime: classStartTimeStr,
            startTime: classStartTimeStr,
            time: classStartTimeStr,
            الوقت: classStartTimeStr,
            وقت_الحصة: classStartTimeStr,
            دقائق_التذكير: preClassMins,
          },
          forceSend: options?.forceSend,
        });

        const isSuccess = res.sentToStudent || res.sentToTeacher || res.sentToAdmin;
        releaseAtomicDispatchLock(preClassLockKey, isSuccess);

        if (isSuccess) {
          if (!options?.skipLocks) {
            localStorage.setItem(preClassSentKey, 'true');
            if (normKey) localStorage.setItem(`tg_preclass_sent_${normKey}_${todayIsoKey}_${classStartTimeStr}_${preClassMins}`, 'true');
          }
          dispatchedCount++;
          actionTaken = `🚀 تم إرسال تذكير ما قبل الحصة (${preClassMins} دقيقة)`;
          logs.push(`[تذكير مسبق] تم إرسال تذكير للحصة (${classStartTimeStr}) للطالب ${studentName} (#${studentId})`);
        }
      }
    }

    // 2️⃣ STUDENT LATE ALERT
    const firstLateTriggerTime = startTotalMinutes + lateDelayMins;
    const lateSentCountKey = `tg_late_count_${normKey}_${todayIsoKey}_${classStartTimeStr}`;
    const lastLateMsKey = `tg_late_last_ms_${normKey}_${todayIsoKey}_${classStartTimeStr}`;
    const lateCompletedKey = `tg_late_completed_${normKey}_${todayIsoKey}_${classStartTimeStr}`;

    // Maximum total sends: If repeatEnabled is true, repeat up to maxRepeatCount times (e.g. 2 means 2 total alerts)
    const maxTotalLateSends = repeatEnabled ? Math.max(1, maxRepeatCount) : 1;

    if (nowTotalMinutes >= firstLateTriggerTime && nowTotalMinutes < endTotalMinutes && !hasPunchedIn) {
      const isAlreadyCompleted =
        localStorage.getItem(lateCompletedKey) === 'true' ||
        localStorage.getItem(`tg_late_completed_${studentId}_${todayIsoKey}_${classStartTimeStr}`) === 'true';
      const currentSentCount =
        Number(localStorage.getItem(lateSentCountKey)) ||
        Number(localStorage.getItem(`tg_late_count_${studentId}_${todayIsoKey}_${classStartTimeStr}`)) ||
        0;
      const lastSentMs =
        Number(localStorage.getItem(lastLateMsKey)) ||
        Number(localStorage.getItem(`tg_late_last_ms_${studentId}_${todayIsoKey}_${classStartTimeStr}`)) ||
        0;
      const nowMs = Date.now();
      const intervalMs = Math.max(1, repeatIntervalMins) * 60 * 1000;

      let shouldSendLate = false;
      if (!isAlreadyCompleted && currentSentCount < maxTotalLateSends) {
        if (options?.skipLocks || currentSentCount === 0) {
          shouldSendLate = true;
        } else if (repeatEnabled && currentSentCount < maxTotalLateSends) {
          if (nowMs - lastSentMs >= intervalMs) {
            shouldSendLate = true;
          }
        }
      }

      if (shouldSendLate) {
        const lateLockKey = `tg_late_lock_${normKey}_${todayIsoKey}_${classStartTimeStr}_${currentSentCount}`;
        const lockAcquired = options?.skipLocks || acquireAtomicDispatchLock(lateLockKey);

        if (lockAcquired) {
          const minutesLate = nowTotalMinutes - startTotalMinutes;
          const res = await dispatchAttendanceTelegramNotification({
            eventType: 'absent',
            student: { id: studentId, name: studentName, telegramChatId: s.telegramChatId, preferredLanguage: s.preferredLanguage },
            settings,
            customSchedule: s,
            extraVars: {
              classTime: classStartTimeStr,
              startTime: classStartTimeStr,
              time: classStartTimeStr,
              الوقت: classStartTimeStr,
              وقت_الحصة: classStartTimeStr,
              minutesLate: String(minutesLate),
              دقائق_التأخر: String(minutesLate),
            },
            forceSend: options?.forceSend,
          });

          const isSuccess = res.sentToStudent || res.sentToTeacher || res.sentToAdmin;
          releaseAtomicDispatchLock(lateLockKey, isSuccess);

          if (isSuccess) {
            const nextCount = currentSentCount + 1;
            if (!options?.skipLocks) {
              const keysToSet = [
                `tg_late_count_${normKey}_${todayIsoKey}_${classStartTimeStr}`,
                `tg_late_count_${studentId}_${todayIsoKey}_${classStartTimeStr}`,
                studentName ? `tg_late_count_${studentName}_${todayIsoKey}_${classStartTimeStr}` : '',
              ].filter(Boolean);

              const msKeysToSet = [
                `tg_late_last_ms_${normKey}_${todayIsoKey}_${classStartTimeStr}`,
                `tg_late_last_ms_${studentId}_${todayIsoKey}_${classStartTimeStr}`,
                studentName ? `tg_late_last_ms_${studentName}_${todayIsoKey}_${classStartTimeStr}` : '',
              ].filter(Boolean);

              keysToSet.forEach((k) => localStorage.setItem(k, String(nextCount)));
              msKeysToSet.forEach((k) => localStorage.setItem(k, String(nowMs)));

              if (nextCount >= maxTotalLateSends) {
                localStorage.setItem(lateCompletedKey, 'true');
                localStorage.setItem(`tg_late_completed_${studentId}_${todayIsoKey}_${classStartTimeStr}`, 'true');
              }
            }
            dispatchedCount++;
            actionTaken = `🚨 تم إرسال تنبيه التأخر (${nextCount}/${maxTotalLateSends}) (تأخر ${minutesLate} دقيقة)`;
            logs.push(`[تنبيه تأخر] تم إرسال تنبيه تأخر (#${nextCount}/${maxTotalLateSends} - ${minutesLate} دقيقة) للطالب ${studentName} (#${studentId})`);
          }
        }
      }
    }

    // 3️⃣ STUDENT FINAL ABSENT NOTIFICATION
    const finalAbsentKey = `tg_final_absent_sent_${studentId}_${todayIsoKey}_${classStartTimeStr}`;
    const finalAbsentLockKey = `tg_final_absent_lock_${studentId}_${todayIsoKey}_${classStartTimeStr}`;
    const isSessionEnded = finalAbsentTiming === 'end_of_session' ? (nowTotalMinutes >= endTotalMinutes) : (nowTotalMinutes >= 23 * 60);

    if (isSessionEnded && !hasPunchedIn && (options?.skipLocks || localStorage.getItem(finalAbsentKey) !== 'true')) {
      const lockAcquired = options?.skipLocks || acquireAtomicDispatchLock(finalAbsentLockKey);
      if (lockAcquired) {
        const res = await dispatchAttendanceTelegramNotification({
          eventType: 'finalAbsent',
          student: { id: studentId, name: studentName, telegramChatId: s.telegramChatId, preferredLanguage: s.preferredLanguage },
          settings,
          customSchedule: s,
          extraVars: {
            classTime: classStartTimeStr,
            startTime: classStartTimeStr,
            time: classStartTimeStr,
            الوقت: classStartTimeStr,
            وقت_الحصة: classStartTimeStr,
          },
          forceSend: options?.forceSend,
        });

        const isSuccess = res.sentToStudent || res.sentToTeacher || res.sentToAdmin;
        releaseAtomicDispatchLock(finalAbsentLockKey, isSuccess);

        if (isSuccess) {
          if (!options?.skipLocks) localStorage.setItem(finalAbsentKey, 'true');
          dispatchedCount++;
          actionTaken = '❌ تم إرسال إشعار الغياب النهائي بعد انتهاء الحصة';
          logs.push(`[غياب نهائي] تم إرسال إشعار الغياب النهائي للطالب ${studentName} (#${studentId})`);
        }
      }
    }

    studentDiagnostics.push({
      studentId,
      studentName,
      source: hasCustomTime ? 'custom' : 'default',
      classStartTime: classStartTimeStr,
      diffMinutes: diffFromStart,
      currentWindow,
      hasPunchedIn,
      actionTaken,
      statusColor,
    });
  }

  // -----------------------------------------------------------------
  // B. PROCESS TEACHER & ADMIN CONSOLIDATED DIGEST REPORTS
  // -----------------------------------------------------------------
  if (isDigestEnabled) {
    for (const classStartTimeStr of timeSlots) {
      const [sh, sm] = classStartTimeStr.split(':').map(Number);
      const startTotalMinutes = (sh || 19) * 60 + (sm || 0);
      const durationMins = settings.sessionDurationFromStart || 120;
      const endTotalMinutes = startTotalMinutes + durationMins;

      let preClassTriggered = false;
      let snapshotTriggered = false;
      let wrapupTriggered = false;

      // 1. Teacher Pre-Class Briefing (at start - preClassMins)
      const preClassTriggerTime = startTotalMinutes - preClassMins;
      const teacherBriefingKey = `tg_teacher_briefing_${classStartTimeStr}_${todayIsoKey}`;
      const teacherBriefingLock = `tg_teacher_briefing_lock_${classStartTimeStr}_${todayIsoKey}`;

      if (
        nowTotalMinutes >= preClassTriggerTime &&
        nowTotalMinutes < startTotalMinutes &&
        (options?.skipLocks || localStorage.getItem(teacherBriefingKey) !== 'true')
      ) {
        const lockAcquired = options?.skipLocks || acquireAtomicDispatchLock(teacherBriefingLock);
        if (lockAcquired) {
          const briefingRes = await dispatchTeacherPreClassBriefing({
            settings,
            schedules: activeSchedules,
            classTime: classStartTimeStr,
            reminderMinutes: preClassMins,
          });

          releaseAtomicDispatchLock(teacherBriefingLock, briefingRes.ok);

          if (briefingRes.ok) {
            if (!options?.skipLocks) localStorage.setItem(teacherBriefingKey, 'true');
            dispatchedCount++;
            preClassTriggered = true;
            logs.push(`[تقرير المعلم 1] تم إرسال قائمة المشتركين لحصة ${classStartTimeStr} قبل الحصة`);
          }
        }
      }

      // 2. Teacher Mid-Class Snapshot Report (after start + lateDelayMins)
      const midClassTriggerTime = startTotalMinutes + lateDelayMins;
      const teacherSnapshotKey = `tg_teacher_snapshot_${classStartTimeStr}_${todayIsoKey}`;
      const teacherSnapshotLock = `tg_teacher_snapshot_lock_${classStartTimeStr}_${todayIsoKey}`;

      if (
        nowTotalMinutes >= midClassTriggerTime &&
        nowTotalMinutes < endTotalMinutes &&
        (options?.skipLocks || localStorage.getItem(teacherSnapshotKey) !== 'true')
      ) {
        const lockAcquired = options?.skipLocks || acquireAtomicDispatchLock(teacherSnapshotLock);
        if (lockAcquired) {
          const snapshotRes = await dispatchTeacherMidClassSnapshot({
            settings,
            schedules: activeSchedules,
            classTime: classStartTimeStr,
          });

          releaseAtomicDispatchLock(teacherSnapshotLock, snapshotRes.ok);

          if (snapshotRes.ok) {
            if (!options?.skipLocks) localStorage.setItem(teacherSnapshotKey, 'true');
            dispatchedCount++;
            snapshotTriggered = true;
            logs.push(`[تقرير المعلم 2] تم إرسال تقرير الحضور والغياب اللحظي لحصة ${classStartTimeStr}`);
          }
        }
      }

      // 3. Teacher Post-Session Wrap-Up Report (at end of session)
      const isSessionEnded = finalAbsentTiming === 'end_of_session' ? (nowTotalMinutes >= endTotalMinutes) : (nowTotalMinutes >= 23 * 60);
      const teacherWrapupKey = `tg_teacher_wrapup_${classStartTimeStr}_${todayIsoKey}`;
      const teacherWrapupLock = `tg_teacher_wrapup_lock_${classStartTimeStr}_${todayIsoKey}`;

      if (isSessionEnded && (options?.skipLocks || localStorage.getItem(teacherWrapupKey) !== 'true')) {
        const lockAcquired = options?.skipLocks || acquireAtomicDispatchLock(teacherWrapupLock);
        if (lockAcquired) {
          const wrapupRes = await dispatchTeacherPostSessionWrapup({
            settings,
            schedules: activeSchedules,
            classTime: classStartTimeStr,
          });

          releaseAtomicDispatchLock(teacherWrapupLock, wrapupRes.ok);

          if (wrapupRes.ok) {
            if (!options?.skipLocks) localStorage.setItem(teacherWrapupKey, 'true');
            dispatchedCount++;
            wrapupTriggered = true;
            logs.push(`[تقرير المعلم 3] تم إرسال التقرير الختامي الشامل لحصة ${classStartTimeStr}`);
          }
        }
      }

      digestsEvaluated.push({
        slot: classStartTimeStr,
        classTime: classStartTimeStr,
        preClassTriggered,
        snapshotTriggered,
        wrapupTriggered,
      });
    }
  }

  return {
    dispatchedCount,
    logs,
    simulatedTimeUsed: options?.simulatedTime,
    studentDiagnostics,
    digestsEvaluated,
  };
}
