import { AttendanceSettings, StudentSchedule, TeacherContact } from '../types';
import {
  answerTelegramCallbackQuery,
  interpolateTelegramTemplate,
  saveTelegramUserToSheetPassive,
  sendTelegramMessage,
  TelegramCallbackSelection,
  TelegramIncomingInteraction,
  TelegramSignupRecord,
} from './telegram';
import {
  buildStudentMasterMenuKeyboard,
  isCompletedLessonsQuery,
  isEvaluationResultsQuery,
  isLanguageQuery,
  isMasterMenuQuery,
  isRemainingLessonsQuery,
  isScheduleQuery,
  isStudentInfoQuery,
  isTeacherQuery,
  sendLanguageSelectionMenu,
  sendStudentCompletedLessonsReport,
  sendStudentEvaluationReport,
  sendStudentInfoReport,
  sendStudentMasterMenu,
  sendStudentRemainingLessonsReport,
  sendStudentScheduleReport,
  sendStudentTeacherReport,
} from './telegramEvaluationHelper';

// Global in-memory sets to prevent duplicate execution across multiple components/intervals
export const globalProcessedUpdateIds = new Set<number>();
export const globalProcessedCallbackQueryIds = new Set<string>();
export const globalLastChatActionTime = new Map<string, number>();

/**
 * Sends a dynamic loading/wait message configured via Section 6 (cmd_loading)
 */
export async function sendLoadingWaitNotice(
  token: string,
  chatId: string,
  student: StudentSchedule | null | undefined,
  settings: AttendanceSettings,
  contextDesc?: { ar?: string; en?: string; th?: string }
) {
  const userLang = student?.preferredLanguage || 'ar';
  let waitText = '';
  const loadingCmd = settings?.botCommands?.find(
    (c) => c.id === 'cmd_loading' || c.command === '/loading'
  );

  if (loadingCmd && loadingCmd.enabled !== false) {
    const rawTemplate =
      userLang === 'en'
        ? loadingCmd.responseEn
        : userLang === 'th'
        ? loadingCmd.responseTh
        : loadingCmd.responseAr;

    if (rawTemplate && rawTemplate.trim()) {
      waitText = interpolateTelegramTemplate(rawTemplate, {
        studentName: student?.studentName || '',
        studentId: student?.studentId || '',
      });
    }
  }

  if (!waitText) {
    if (contextDesc) {
      waitText =
        userLang === 'en'
          ? `⏳ **Loading Data...**\n_Please wait a moment while we fetch ${contextDesc.en || 'data'}..._`
          : userLang === 'th'
          ? `⏳ **กำลังโหลดข้อมูล...**\n_กรุณารอสักครู่ กำลังเตรียม ${contextDesc.th || 'ข้อมูล'}..._`
          : `⏳ **جاري تحميل البيانات...**\n_يرجى الانتظار لحظات ريثما يتم جلب ${contextDesc.ar || 'البيانات المعتمدة'}..._`;
    } else {
      waitText =
        userLang === 'en'
          ? `⏳ **Loading Data...**\n_Please wait a moment while we fetch and prepare your report..._`
          : userLang === 'th'
          ? `⏳ **กำลังโหลดข้อมูล...**\n_กรุณารอสักครู่ขณะระบบกำลังดึงข้อมูล..._`
          : `⏳ **جاري تحميل البيانات...**\n_يرجى الانتظار لحظات ريثما يتم تحضير النتائج والبيانات المعتمدة..._`;
    }
  }

  return sendTelegramMessage({
    token,
    chatId,
    text: waitText,
    skipDeduplication: true,
  }).catch(() => null);
}

/**
 * Finds a student record associated with a given Telegram Chat ID
 */
export function findStudentByChatId(
  chatId: string,
  passedSchedules: StudentSchedule[] = []
): StudentSchedule | null {
  const cleanChatId = String(chatId || '').trim();
  if (!cleanChatId) return null;

  // 1. Search in passed schedules
  if (passedSchedules && passedSchedules.length > 0) {
    const found = passedSchedules.find(
      (s) => String(s.telegramChatId || '').trim() === cleanChatId
    );
    if (found) return found;
  }

  // 2. Search in all_schedules_cached in localStorage
  try {
    const rawScheds = localStorage.getItem('all_schedules_cached');
    if (rawScheds) {
      const list = JSON.parse(rawScheds);
      if (Array.isArray(list)) {
        const found = list.find(
          (s: any) => String(s.telegramChatId || '').trim() === cleanChatId
        );
        if (found) return found;
      }
    }
  } catch (e) {}

  // 3. Search in student_telegram_* keys in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('student_telegram_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (String(parsed.telegramChatId || '').trim() === cleanChatId) {
            const sId = key.replace('student_telegram_', '');
            return {
              studentId: sId,
              studentName: parsed.studentName || 'المشترك',
              telegramChatId: cleanChatId,
              preferredLanguage: parsed.preferredLang || parsed.preferredLanguage || 'ar',
              startDate: '',
              activeDays: 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس',
              lessonsPerWeek: '5',
              daysToKeep: '30',
              expiryDate: '',
              guardianPhone: parsed.guardianPhone || '',
            };
          }
        }
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Generates the personalized welcome greeting text upon successful registration
 */
function getWelcomeSuccessText(studentName: string, lang: 'ar' | 'en' | 'th', studentId: string): string {
  if (lang === 'en') {
    return (
      `🎉 **Welcome to the Interactive Student Portal!**\n\n` +
      `✅ **Account Successfully Linked:** ${studentName} (#${studentId})\n` +
      `🌐 **Preferred Language:** English 🇬🇧\n\n` +
      `🔔 You will now receive all class reminders, evaluation results, and attendance alerts automatically here.\n\n` +
      `💡 **Quick Commands & Shortcuts:**\n` +
      `• Type **( details )** or **( /menu )** to open the interactive services menu.\n` +
      `• Type **( results )** to check your grades and evaluation.\n` +
      `• Type **( remaining )** to view remaining lessons.\n` +
      `• Type **( schedule )** to view your class timetable.`
    );
  } else if (lang === 'th') {
    return (
      `🎉 **ยินดีต้อนรับสู่ระบบนักเรียนอัจฉริยะ!**\n\n` +
      `✅ **เชื่อมต่อบัญชีเรียบร้อยแล้ว:** ${studentName} (#${studentId})\n` +
      `🌐 **ภาษาที่เลือก:** ภาษาไทย 🇹🇭\n\n` +
      `🔔 คุณจะได้รับการแจ้งเตือนเวลาเรียน ผลการประเมิน และรายงานการเข้าเรียนที่นี่โดยอัตโนมัติ\n\n` +
      `💡 **คำสั่งลัดที่ใช้งานได้:**\n` +
      `• พิมพ์ **( รายละเอียด )** หรือ **( /menu )** เพื่อเปิดเมนูบริการ\n` +
      `• พิมพ์ **( ผลการเรียน )** เพื่อดูคะแนนและผลการประเมิน\n` +
      `• พิมพ์ **( บทเรียนที่เหลือ )** เพื่อดูบทเรียนคงเหลือ`
    );
  } else {
    return (
      `🎉 **أهلاً بك في بوت المنظومة التعليمية التفاعلية!**\n\n` +
      `✅ **تم ربط حسابك بنجاح:** ${studentName} (رقم: #${studentId})\n` +
      `🌐 **لغة الإشعارات:** العربية 🇸🇦\n\n` +
      `🔔 ستصلك هنا إشعارات بدء الحصص، تقارير الحضور، ونتائج التقييمات أولاً بأول.\n\n` +
      `💡 **الأوامر والاختصارات السريعة:**\n` +
      `• أرسل كلمة **( تفاصيل )** أو **( ت )** لفتح لوحة الخدمات والأزرار التفاعلية.\n` +
      `• أرسل كلمة **( تقييم )** أو **( ن )** للاطلاع على كشف درجاتك وتقييمك.\n` +
      `• أرسل كلمة **( متبقي )** أو **( ب )** لمعرفة الدروس المتبقية في خطتك.\n` +
      `• أرسل كلمة **( جدول )** أو **( ج )** للاطلاع على جدول مواعيدك المعتمد.`
    );
  }
}

export interface ProcessTelegramUpdatesParams {
  token: string;
  settings: AttendanceSettings;
  allSchedules?: StudentSchedule[];
  signups?: TelegramSignupRecord[];
  plainStarts?: TelegramIncomingInteraction[];
  idSubmissions?: TelegramIncomingInteraction[];
  callbackQueries?: TelegramCallbackSelection[];
  onUpdateScheduleStudentTelegram?: (studentId: string, chatId: string, lang?: 'ar' | 'en' | 'th') => void;
  onUpdateTeacherTelegram?: (teacherId: string, chatId: string) => void;
}

/**
 * Master Central Telegram Bot Processor
 * Handles all messages, deep-links, button clicks, and commands reliably across the whole app.
 */
export async function processTelegramBotUpdates(params: ProcessTelegramUpdatesParams): Promise<void> {
  const {
    token,
    settings,
    allSchedules = [],
    signups = [],
    plainStarts = [],
    idSubmissions = [],
    callbackQueries = [],
    onUpdateScheduleStudentTelegram,
    onUpdateTeacherTelegram,
  } = params;

  const cleanToken = token?.trim();
  if (!cleanToken) return;

  // Retrieve ignored/unlinked student IDs from localStorage
  let ignoredSet = new Set<string>();
  try {
    const stored = localStorage.getItem('telegram_unlinked_students');
    if (stored) ignoredSet = new Set(JSON.parse(stored));
  } catch (e) {}

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Process Callback Queries (Interactive Button Clicks)
  // ─────────────────────────────────────────────────────────────────────────
  if (callbackQueries && callbackQueries.length > 0) {
    for (const cq of callbackQueries) {
      if (globalProcessedCallbackQueryIds.has(cq.callbackQueryId)) continue;
      globalProcessedCallbackQueryIds.add(cq.callbackQueryId);

      const cqData = String(cq.data || '').trim();
      const chatId = String(cq.chatId || '').trim();
      if (!chatId || !cqData) continue;

      const student = findStudentByChatId(chatId, allSchedules);

      // A. Language button click: lang_ar, lang_en, lang_th
      if (cqData === 'lang_ar' || cqData === 'lang_en' || cqData === 'lang_th') {
        const chosenLang = (cqData.replace('lang_', '') as 'ar' | 'en' | 'th') || 'ar';

        try {
          localStorage.setItem(`tg_chat_lang_${chatId}`, chosenLang);
          if (student) {
            student.preferredLanguage = chosenLang;
            localStorage.setItem(
              `student_telegram_${student.studentId}`,
              JSON.stringify({
                telegramChatId: chatId,
                studentName: student.studentName,
                preferredLang: chosenLang,
              })
            );
            if (onUpdateScheduleStudentTelegram) {
              onUpdateScheduleStudentTelegram(student.studentId, chatId, chosenLang);
            }
            // Passively record to Telegram_Users sheet (non-blocking)
            saveTelegramUserToSheetPassive({
              studentName: student.studentName,
              studentId: student.studentId,
              telegramChatId: chatId,
              preferredLanguage: chosenLang,
            });
          }
        } catch (e) {}

        const confirmMsg =
          chosenLang === 'en'
            ? `✅ **Notification language set to English 🇬🇧**\n\nAll subsequent notifications and reports will be sent in English.`
            : chosenLang === 'th'
            ? `✅ **ตั้งค่าภาษาการแจ้งเตือนเป็น ภาษาไทย 🇹🇭 เรียบร้อยแล้ว**\n\nรายงานและการแจ้งเตือนทั้งหมดจะส่งเป็นภาษาไทย`
            : `✅ **تم ضبط لغة الإشعارات إلى اللغة العربية 🇸🇦 بنجاح**\n\nستصلك جميع التقارير والإشعارات باللغة العربية.`;

        await sendTelegramMessage({
          token: cleanToken,
          chatId,
          text: confirmMsg,
          skipDeduplication: true,
        }).catch(() => {});

        await answerTelegramCallbackQuery(
          cleanToken,
          cq.callbackQueryId,
          chosenLang === 'en' ? 'Language updated' : chosenLang === 'th' ? 'เปลี่ยนภาษาแล้ว' : 'تم تغيير اللغة'
        ).catch(() => {});
        continue;
      }

      // Answer callback query immediately to stop the button spinner
      const userLang = student?.preferredLanguage || 'ar';
      await answerTelegramCallbackQuery(cleanToken, cq.callbackQueryId).catch(() => {});

      // Helper to send a persistent loading text message before long fetching operations
      const sendWaitMessage = async (actionDescAr: string, actionDescEn: string, actionDescTh: string) => {
        return sendLoadingWaitNotice(cleanToken, chatId, student, settings, {
          ar: actionDescAr,
          en: actionDescEn,
          th: actionDescTh,
        });
      };

      // B. Master Menu trigger
      if (cqData === 'cmd_menu' || cqData === 'cmd_details' || cqData === 'cmd_master_menu') {
        if (student) {
          await sendStudentMasterMenu({
            token: cleanToken,
            chatId,
            student,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي لتتمكن من استخدام لوحة الخدمات.**\n\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // C. Completed Lessons (cmd_completed / cmd_results)
      if (cqData === 'cmd_completed' || cqData === 'cmd_results') {
        if (student) {
          await sendWaitMessage('كشف الدروس المكتملة', 'Completed Lessons', 'บทเรียนที่เสร็จสิ้น');
          await sendStudentCompletedLessonsReport({
            token: cleanToken,
            chatId,
            student,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على الدروس المكتملة.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // D. Remaining Lessons
      if (cqData === 'cmd_remaining') {
        if (student) {
          await sendWaitMessage('خطة الدروس المتبقية', 'Remaining Lessons', 'บทเรียนที่เหลือ');
          await sendStudentRemainingLessonsReport({
            token: cleanToken,
            chatId,
            student,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على الدروس المتبقية.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // E. Schedule
      if (cqData === 'cmd_schedule') {
        if (student) {
          await sendWaitMessage('بيانات الجدول المعتمد', 'Class Schedule', 'ตารางเรียน');
          await sendStudentScheduleReport({
            token: cleanToken,
            chatId,
            student,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على جدولك المعتمد.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // F. Teacher Contact
      if (cqData === 'cmd_teacher') {
        if (student) {
          await sendWaitMessage('بيانات المعلم المشرف', 'Teacher Details', 'ข้อมูลครู');
          await sendStudentTeacherReport({
            token: cleanToken,
            chatId,
            student,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على بيانات معلمك.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // G. Student Account Profile Info
      if (cqData === 'cmd_info') {
        if (student) {
          await sendWaitMessage('بيانات الحساب والاشتراك', 'Account Profile', 'ข้อมูลบัญชี');
          await sendStudentInfoReport({
            token: cleanToken,
            chatId,
            student,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على بيانات حسابك.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // H. Language Menu
      if (cqData === 'cmd_lang') {
        await sendLanguageSelectionMenu({
          token: cleanToken,
          chatId,
          student,
        }).catch(() => {});
        continue;
      }

      // Default answer callback query for unhandled buttons
      await answerTelegramCallbackQuery(cleanToken, cq.callbackQueryId).catch(() => {});
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Process One-Click Deep-Link Signups (/start student_101 or /start teacher_101)
  // ─────────────────────────────────────────────────────────────────────────
  if (signups && signups.length > 0) {
    for (const sub of signups) {
      if (sub.updateId && globalProcessedUpdateIds.has(sub.updateId)) continue;
      if (sub.updateId) globalProcessedUpdateIds.add(sub.updateId);

      const targetId = String(sub.id || '').trim();
      if (!targetId || ignoredSet.has(targetId)) continue;

      if (sub.type === 'student') {
        const matched = allSchedules.find(
          (s) => String(s.studentId).trim() === targetId || String(s.studentId).replace(/\D/g, '') === targetId.replace(/\D/g, '')
        );

        if (matched) {
          const langToSave: 'ar' | 'en' | 'th' = sub.lang || (matched.preferredLanguage as any) || 'ar';
          try {
            matched.telegramChatId = sub.chatId;
            matched.preferredLanguage = langToSave;
            localStorage.setItem(
              `student_telegram_${matched.studentId}`,
              JSON.stringify({
                telegramChatId: sub.chatId,
                studentName: matched.studentName,
                preferredLang: langToSave,
              })
            );
            if (onUpdateScheduleStudentTelegram) {
              onUpdateScheduleStudentTelegram(matched.studentId, sub.chatId, langToSave);
            }
            // Passively record to Telegram_Users sheet (non-blocking)
            saveTelegramUserToSheetPassive({
              studentName: matched.studentName,
              studentId: matched.studentId,
              telegramChatId: sub.chatId,
              preferredLanguage: langToSave,
            });
          } catch (e) {}

          const confirmMsg = getWelcomeSuccessText(matched.studentName, langToSave, matched.studentId);
          await sendTelegramMessage({
            token: cleanToken,
            chatId: sub.chatId,
            text: confirmMsg,
            skipDeduplication: true,
          }).catch(() => {});
        }
      } else if (sub.type === 'teacher') {
        try {
          localStorage.setItem(`teacher_telegram_${targetId}`, JSON.stringify({ telegramChatId: sub.chatId }));
          if (onUpdateTeacherTelegram) {
            onUpdateTeacherTelegram(targetId, sub.chatId);
          }
        } catch (e) {}

        const teacherGreeting =
          `👨‍🏫 **أهلاً بك يا أستاذ!**\n\n` +
          `✅ تم ربط حسابك كمعلم مشرف بنجاح لتلقي الإشعارات الأكاديمية وكشوفات حضور الطلاب.\n` +
          `معرف حسابك: \`${targetId}\``;

        await sendTelegramMessage({
          token: cleanToken,
          chatId: sub.chatId,
          text: teacherGreeting,
          skipDeduplication: true,
        }).catch(() => {});
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Process Incoming Chat Messages & Commands (تفاصيل, ت, /menu, /details, /results, تقييم, etc.)
  // ─────────────────────────────────────────────────────────────────────────
  if (idSubmissions && idSubmissions.length > 0) {
    for (const sub of idSubmissions) {
      if (sub.updateId && globalProcessedUpdateIds.has(sub.updateId)) continue;
      if (sub.updateId) globalProcessedUpdateIds.add(sub.updateId);

      const rawText = String(sub.text || '').trim();
      const chatId = String(sub.chatId || '').trim();
      if (!rawText || !chatId) continue;

      const linkedStudent = findStudentByChatId(chatId, allSchedules);

      // A. Master Details / Menu Query (تفاصيل, ت, قائمة, خدمات, خيارات, منيو, مساعدة, /menu, /details, etc.)
      if (isMasterMenuQuery(rawText)) {
        if (linkedStudent) {
          await sendStudentMasterMenu({
            token: cleanToken,
            chatId,
            student: linkedStudent,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي لتتمكن من استخدام لوحة الخدمات.**\n\n📌 أرسل رقمك الدراسي الآن في رسالة هنا (مثال: \`101\`).\n📌 Please send your Student ID first (e.g. \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // B. Completed Lessons Query (مكتمل, مكتملة, ك, تقييم, ن, نتائج, درجات, كشف, /completed, /results, etc.)
      if (isCompletedLessonsQuery(rawText) || isEvaluationResultsQuery(rawText)) {
        if (linkedStudent) {
          await sendLoadingWaitNotice(cleanToken, chatId, linkedStudent, settings, {
            ar: 'تقرير الدروس المكتملة',
            en: 'Completed Lessons Report',
            th: 'รายงานบทเรียนที่เสร็จสิ้น',
          });

          await sendStudentCompletedLessonsReport({
            token: cleanToken,
            chatId,
            student: linkedStudent,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على الدروس المكتملة.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // C. Remaining Lessons Query (متبقي, ب, باقي, المتبقي, خطة, /remaining, /left, etc.)
      if (isRemainingLessonsQuery(rawText)) {
        if (linkedStudent) {
          await sendLoadingWaitNotice(cleanToken, chatId, linkedStudent, settings, {
            ar: 'خطة الدروس المتبقية',
            en: 'Remaining Lessons Plan',
            th: 'แผนบทเรียนที่เหลือ',
          });

          await sendStudentRemainingLessonsReport({
            token: cleanToken,
            chatId,
            student: linkedStudent,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على الدروس المتبقية.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // D. Schedule Query (جدول, ج, مواعيد, موعد, حصة, /schedule, etc.)
      if (isScheduleQuery(rawText)) {
        if (linkedStudent) {
          await sendLoadingWaitNotice(cleanToken, chatId, linkedStudent, settings, {
            ar: 'بيانات الجدول المعتمد',
            en: 'Class Schedule',
            th: 'ตารางเรียน',
          });

          await sendStudentScheduleReport({
            token: cleanToken,
            chatId,
            student: linkedStudent,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على جدولك المعتمد.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // E. Teacher Query (معلم, م, استاذ, مشرف, /teacher, /contact, etc.)
      if (isTeacherQuery(rawText)) {
        if (linkedStudent) {
          await sendStudentTeacherReport({
            token: cleanToken,
            chatId,
            student: linkedStudent,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على بيانات معلمك.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // F. Student Account Info Query (بيانات, ح, حسابي, ملف, معلومات, /info, /profile, etc.)
      if (isStudentInfoQuery(rawText)) {
        if (linkedStudent) {
          await sendStudentInfoReport({
            token: cleanToken,
            chatId,
            student: linkedStudent,
            settings,
          }).catch(() => {});
        } else {
          await sendTelegramMessage({
            token: cleanToken,
            chatId,
            text: `ℹ️ **يرجى ربط حسابك أولاً بالرقم الدراسي للاطلاع على بيانات حسابك.**\n📌 أرسل رقمك الدراسي هنا (مثال: \`101\`).`,
          }).catch(() => {});
        }
        continue;
      }

      // G. Language Selection Query (لغة, ل, تغيير اللغة, /lang, /language, etc.)
      if (isLanguageQuery(rawText)) {
        await sendLanguageSelectionMenu({
          token: cleanToken,
          chatId,
          student: linkedStudent,
        }).catch(() => {});
        continue;
      }

      // H. Student ID Submission (e.g. typing "101", "طالب 101", "#101", etc.)
      let potentialId = rawText.replace(/^(?:طالب|student|رقم\s*طالب|رقم\s*الدراسي|رقم|تسجيل|معرف|id|reg|code)\s*[:#-]?\s*/i, '').trim();
      potentialId = potentialId.replace(/^[#:]+/, '').trim();

      const normalizedTarget = potentialId.toLowerCase();
      const cleanNumeric = potentialId.replace(/\D/g, '');

      // Search student schedule by ID or Name
      const matchedStudent = allSchedules.find((s) => {
        const sId = String(s.studentId || '').trim().toLowerCase();
        const sName = String(s.studentName || '').trim().toLowerCase();
        const sNumeric = sId.replace(/\D/g, '');

        if (cleanNumeric && sNumeric === cleanNumeric) return true;
        if (sId && sId === normalizedTarget) return true;
        if (sName && (sName === normalizedTarget || sName.includes(normalizedTarget) || normalizedTarget.includes(sName))) {
          return true;
        }
        return false;
      });

      if (matchedStudent) {
        if (ignoredSet.has(matchedStudent.studentId)) continue;

        const langToSave: 'ar' | 'en' | 'th' = (matchedStudent.preferredLanguage as any) || 'ar';
        try {
          matchedStudent.telegramChatId = chatId;
          localStorage.setItem(
            `student_telegram_${matchedStudent.studentId}`,
            JSON.stringify({
              telegramChatId: chatId,
              studentName: matchedStudent.studentName,
              preferredLang: langToSave,
            })
          );
          if (onUpdateScheduleStudentTelegram) {
            onUpdateScheduleStudentTelegram(matchedStudent.studentId, chatId, langToSave);
          }
          // Passively record to Telegram_Users sheet (non-blocking)
          saveTelegramUserToSheetPassive({
            studentName: matchedStudent.studentName,
            studentId: matchedStudent.studentId,
            telegramChatId: chatId,
            preferredLanguage: langToSave,
          });
        } catch (e) {}

        const confirmMsg = getWelcomeSuccessText(matchedStudent.studentName, langToSave, matchedStudent.studentId);
        await sendTelegramMessage({
          token: cleanToken,
          chatId,
          text: confirmMsg,
          skipDeduplication: true,
        }).catch(() => {});
        continue;
      }

      // If text looks like an attempted student ID number or short query that wasn't found
      if (/^\d{1,8}$/.test(potentialId) || potentialId.startsWith('#')) {
        await sendTelegramMessage({
          token: cleanToken,
          chatId,
          text: `⚠️ **عذراً، لم نتمكن من العثور على طالب مسجل بالرقم (#${potentialId}).**\n\nيرجى التأكد من الرقم الدراسي والمحاولة مرة أخرى.`,
        }).catch(() => {});
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Process Plain /start or Bot Greeting (/start, ابدأ, start, help)
  // ─────────────────────────────────────────────────────────────────────────
  if (plainStarts && plainStarts.length > 0) {
    for (const p of plainStarts) {
      if (p.updateId && globalProcessedUpdateIds.has(p.updateId)) continue;
      if (p.updateId) globalProcessedUpdateIds.add(p.updateId);

      const chatId = String(p.chatId || '').trim();
      if (!chatId) continue;

      const lastTime = globalLastChatActionTime.get(`${chatId}_start`) || 0;
      const now = Date.now();
      if (now - lastTime < 3000) continue;
      globalLastChatActionTime.set(`${chatId}_start`, now);

      const linkedStudent = findStudentByChatId(chatId, allSchedules);

      if (linkedStudent) {
        // Student already linked: send friendly greeting with quick instruction to open menu
        const lang: 'ar' | 'en' | 'th' = ((linkedStudent.preferredLanguage as any) || 'ar');
        let greeting = '';
        if (lang === 'en') {
          greeting =
            `👋 **Welcome back, ${linkedStudent.studentName}!**\n\n` +
            `✅ Your Telegram is linked to Student ID #${linkedStudent.studentId}.\n\n` +
            `💡 **To open the interactive services menu, simply type:** ( details ) or ( /menu )`;
        } else if (lang === 'th') {
          greeting =
            `👋 **ยินดีต้อนรับ, ${linkedStudent.studentName}!**\n\n` +
            `✅ เชื่อมต่อกับรหัสนักเรียน #${linkedStudent.studentId} เรียบร้อยแล้ว\n\n` +
            `💡 **เปิดเมนูบริการพิมพ์:** ( รายละเอียด ) หรือ ( /menu )`;
        } else {
          greeting =
            `👋 **مرحباً بك مجدداً يا ${linkedStudent.studentName}!**\n\n` +
            `✅ حسابك مربوط بنجاح بالرقم الدراسي #${linkedStudent.studentId}.\n\n` +
            `💡 **لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة:** ( تفاصيل ) أو ( ت )`;
        }

        await sendTelegramMessage({
          token: cleanToken,
          chatId,
          text: greeting,
          skipDeduplication: true,
        }).catch(() => {});
      } else {
        // Student NOT linked: send friendly onboarding registration prompt
        const prompt =
          `👋 **مرحباً بك في بوت الإشعارات والتقارير الذكي!**\n\n` +
          `📌 **لتسجيل وربط حسابك:** أرسل رقمك الدراسي هنا في رسالة (مثال: \`101\`).\n\n` +
          `🌐 **To link your account:** Please send your Student ID here (e.g. \`101\`).`;

        await sendTelegramMessage({
          token: cleanToken,
          chatId,
          text: prompt,
          skipDeduplication: true,
        }).catch(() => {});
      }
    }
  }
}
