import React, { useState, useEffect, useRef } from 'react';
import { callGasApi } from '../utils/api';
import { AttendanceSettings, LiveMonitoringData, LiveStudentStatus, StudentSchedule } from '../types';
import TelegramHub from './TelegramHub';
import { sendTelegramMessage, interpolateTelegramTemplate, saveTelegramUserToSheetPassive } from '../utils/telegram';
import { checkAndDispatchAutomatedAlerts, clearStudentActivePresence, ensureTodayAttendanceSync } from '../utils/telegramScheduler';
import {
  Clock,
  UserCheck,
  UserX,
  Activity,
  Send,
  Save,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  BellRing,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronLeft,
  Users,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Search,
  UserPlus,
  SlidersHorizontal,
  RotateCcw,
  Check,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MonitoringDashboardProps {
  onBackToAdmin?: () => void;
  onGoToStudentHome?: () => void;
  onLogout?: () => void;
  currentAdminName?: string;
}

export default function MonitoringDashboard({
  onBackToAdmin,
  onGoToStudentHome,
  onLogout,
  currentAdminName,
}: MonitoringDashboardProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  
  // Helper to ensure 'HH:mm' time format
  const formatTimeStr = (t: any): string => {
    if (!t) return '19:00';
    const s = String(t).trim().replace(/^'+/, '');
    const match = s.match(/(\d{1,2}:\d{2})/);
    if (match) {
      const parts = match[1].split(':');
      const hh = parts[0].length === 1 ? '0' + parts[0] : parts[0];
      return `${hh}:${parts[1]}`;
    }
    return s || '19:00';
  };

  // Helper to accurately parse Arabic active days indices (0 = Sun, ..., 6 = Sat)
  const parseActiveDaysIndices = (activeDaysStr?: string): number[] => {
    if (!activeDaysStr || !activeDaysStr.trim()) return [0, 1, 2, 3, 4, 5, 6];
    const parts = activeDaysStr.split(/[,،]/);
    const days: number[] = [];
    for (const part of parts) {
      const d = part.trim();
      let idx = -1;
      if (d.includes('أحد') || d.includes('الاحد') || d.includes('الأحد')) idx = 0;
      else if (d.includes('اثنين') || d.includes('الاثنين') || d.includes('الأثنين') || d.includes('الإثنين')) idx = 1;
      else if (d.includes('ثلاثاء') || d.includes('الثلاثاء')) idx = 2;
      else if (d.includes('أربعاء') || d.includes('الاربعاء') || d.includes('الأربعاء')) idx = 3;
      else if (d.includes('خميس') || d.includes('الخميس')) idx = 4;
      else if (d.includes('جمعة') || d.includes('الجمعة')) idx = 5;
      else if (d.includes('سبت') || d.includes('السبت')) idx = 6;
      if (idx !== -1 && !days.includes(idx)) days.push(idx);
    }
    return days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];
  };

  // Helper to display timestamps cleanly in standard 12h format (e.g. 10:24 م / 09:15 ص)
  const formatDisplayTime = (t?: string): string => {
    if (!t) return '-';
    const s = String(t).trim();
    const timeMatch = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const period = hours >= 12 ? 'م' : 'ص';
      const h12 = hours % 12 === 0 ? 12 : hours % 12;
      const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
      return `${hStr}:${minutes} ${period}`;
    }
    return s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  };

  // Settings State with Local Storage fallback
  const [settings, setSettings] = useState<AttendanceSettings>(() => {
    try {
      const cached = localStorage.getItem('attendance_settings_cached');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          startTime: formatTimeStr(parsed.startTime),
          durationType: parsed.durationType || 'from_start',
          preventEarlyEntry: Boolean(parsed.preventEarlyEntry),
        };
      }
    } catch (e) {}
    return {
      startTime: '19:00',
      durationType: 'from_start',
      sessionDurationFromStart: 120,
      sessionDurationFromLogin: 90,
      forceLogin: false,
      timeRestricted: false,
      preventEarlyEntry: false,
      allowedExceptionStudents: [],
      telegramToken: '',
      telegramChatId: '',
      telegramEnabled: false,
      telegramTemplatePreClass: 'تذكير: تبدأ حصتك اليوم الساعة {{الوقت}}.',
      telegramTemplateLogin: 'تم تسجيل دخول الطالب {{اسم_الطالب}} للحصة.',
      telegramTemplateComplete: 'أنجز الطالب {{اسم_الطالب}} تمارين وواجبات اليوم بنجاح ✨.',
      telegramTemplateAbsent: 'تنبيه: الطالب {{اسم_الطالب}} لم يسجل دخوله للحصة المقررة اليوم.',
      telegramPreClassReminderMinutes: 15,
      telegramLateAlertDelayMinutes: 10,
      telegramLateAlertRepeatEnabled: true,
      telegramLateAlertRepeatIntervalMinutes: 15,
      telegramLateAlertMaxCount: 2,
      telegramFinalAbsentTiming: 'end_of_session',
      telegramNotifyTeacherDirectly: true,
    };
  });

  const [allowedInput, setAllowedInput] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('attendance_settings_cached');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.allowedExceptionStudents)) {
          return parsed.allowedExceptionStudents.join(', ');
        }
      }
    } catch (e) {}
    return '';
  });

  // Live Monitoring Lists (Pre-loaded from cache for instant 0.0s rendering)
  const [activeStudents, setActiveStudents] = useState<LiveStudentStatus[]>(() => {
    try {
      const now = new Date();
      ensureTodayAttendanceSync(now);
      const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const cacheDate = localStorage.getItem('live_attendance_cache_date');
      if (cacheDate && cacheDate !== todayIsoKey) return [];

      const cached = localStorage.getItem('live_active_students_cached');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [loggedOutStudents, setLoggedOutStudents] = useState<LiveStudentStatus[]>(() => {
    try {
      const now = new Date();
      const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const cacheDate = localStorage.getItem('live_attendance_cache_date');
      if (cacheDate && cacheDate !== todayIsoKey) return [];

      const cached = localStorage.getItem('live_logged_out_students_cached');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [completedStudents, setCompletedStudents] = useState<LiveStudentStatus[]>(() => {
    try {
      const now = new Date();
      const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const cacheDate = localStorage.getItem('live_attendance_cache_date');
      if (cacheDate && cacheDate !== todayIsoKey) return [];

      const cached = localStorage.getItem('live_completed_students_cached');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [absentStudents, setAbsentStudents] = useState<LiveStudentStatus[]>(() => {
    try {
      const now = new Date();
      const todayIsoKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const cacheDate = localStorage.getItem('live_attendance_cache_date');
      if (cacheDate && cacheDate !== todayIsoKey) return [];

      const cached = localStorage.getItem('live_absent_students_cached');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Per-Student Custom Time State
  const [allSchedules, setAllSchedules] = useState<StudentSchedule[]>(() => {
    try {
      const cached = localStorage.getItem('all_schedules_cached');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customStartTime, setCustomStartTime] = useState<string>('16:30');
  const [customSessionDuration, setCustomSessionDuration] = useState<number>(60);
  const [customDurationType, setCustomDurationType] = useState<'from_start' | 'from_login'>('from_login');
  const [customPreventEarlyEntry, setCustomPreventEarlyEntry] = useState<boolean>(true);
  const [customForceLogin, setCustomForceLogin] = useState<boolean>(true);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [savingCustomStudent, setSavingCustomStudent] = useState<boolean>(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<{ studentId: string; studentName: string } | null>(null);
  const [customSearchFilter, setCustomSearchFilter] = useState<string>('');
  const [customStatusMsg, setCustomStatusMsg] = useState<string>('');

  // Lock recently saved student overrides for 60 seconds to prevent background polling from reverting to stale Google Sheet cache
  const recentlySavedOverridesRef = useRef<Map<string, { override: Partial<StudentSchedule>; timestamp: number }>>(new Map());
  // Lock recently saved general settings for 90 seconds to prevent background polling from reverting user-saved time
  const recentlySavedSettingsRef = useRef<{ settings: AttendanceSettings; timestamp: number } | null>(null);
  const activeTabRef = useRef<'live' | 'settings' | 'telegram'>('live');

  // Active Tab View in Dashboard
  const [activeTab, setActiveTab] = useState<'live' | 'settings' | 'telegram'>('live');

  // Keep allSchedules ref updated
  const allSchedulesRef = useRef<StudentSchedule[]>(allSchedules);
  useEffect(() => {
    allSchedulesRef.current = allSchedules;
  }, [allSchedules]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    fetchMonitoringData(false);
  }, []);

  // Listen for real-time Telegram linking events from the bot background engine
  useEffect(() => {
    const handleLinkedEvent = (e: any) => {
      const detail = e.detail;
      if (detail && detail.studentId && detail.chatId) {
        const sKey = String(detail.studentId).toLowerCase().trim();
        recentlySavedOverridesRef.current.set(sKey, {
          override: {
            telegramChatId: detail.chatId,
            preferredLanguage: detail.lang || 'ar',
          },
          timestamp: Date.now(),
        });

        setAllSchedules((prev) => {
          const updated = prev.map((s) => {
            if (
              s.studentId === detail.studentId ||
              (s.studentId && s.studentId.toLowerCase().trim() === sKey)
            ) {
              return {
                ...s,
                telegramChatId: detail.chatId,
                preferredLanguage: detail.lang || s.preferredLanguage || 'ar',
              };
            }
            return s;
          });
          try {
            localStorage.setItem('all_schedules_cached', JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
      }
    };

    window.addEventListener('telegram_student_linked', handleLinkedEvent);
    return () => {
      window.removeEventListener('telegram_student_linked', handleLinkedEvent);
    };
  }, []);

  // Auto Refresh interval: every 30 seconds in background (lightweight)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoringData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchMonitoringData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // In background, only fetch live monitoring data to keep GAS fast and responsive
      const responsePromise = callGasApi<{ success: boolean; data: LiveMonitoringData }>('getLiveMonitoringData');
      const schedulesPromise = isBackground
        ? Promise.resolve(null)
        : callGasApi<StudentSchedule[]>('getAllStudentsSchedule').catch(() => null);

      const [response, schedulesRes] = await Promise.all([responsePromise, schedulesPromise]);

      if (response && response.data && response.data.settings) {
        setSettings((prevSettings) => {
          const s = response.data.settings;
          let cachedSettings: Partial<AttendanceSettings> = {};
          try {
            const cachedRaw = localStorage.getItem('attendance_settings_cached');
            if (cachedRaw) cachedSettings = JSON.parse(cachedRaw);
          } catch (e) {}

          const recentSaved = recentlySavedSettingsRef.current;
          const isRecentlySaved = Boolean(recentSaved && Date.now() - recentSaved.timestamp < 90000);
          const isViewingSettings = activeTabRef.current === 'settings' || activeTabRef.current === 'telegram';

          // Protect user-saved startTime and settings from stale background polling
          const effectiveStartTime = isRecentlySaved
            ? recentSaved!.settings.startTime
            : isViewingSettings
            ? prevSettings.startTime
            : formatTimeStr(s.startTime || cachedSettings.startTime || prevSettings.startTime);

          const baseSource = isRecentlySaved
            ? { ...prevSettings, ...cachedSettings, ...s, ...recentSaved!.settings }
            : { ...prevSettings, ...cachedSettings, ...s };

          const fetchedSettings: AttendanceSettings = {
            ...prevSettings,
            ...baseSource,
            startTime: effectiveStartTime,
            durationType: baseSource.durationType || 'from_start',
            sessionDurationFromStart: Number(baseSource.sessionDurationFromStart) || 120,
            sessionDurationFromLogin: Number(baseSource.sessionDurationFromLogin) || 90,
            forceLogin: baseSource.forceLogin !== undefined ? Boolean(baseSource.forceLogin) : Boolean(prevSettings.forceLogin),
            timeRestricted: baseSource.timeRestricted !== undefined ? Boolean(baseSource.timeRestricted) : Boolean(prevSettings.timeRestricted),
            preventEarlyEntry: baseSource.preventEarlyEntry !== undefined ? Boolean(baseSource.preventEarlyEntry) : Boolean(prevSettings.preventEarlyEntry),
            
            telegramPreClassReminderMinutes: baseSource.telegramPreClassReminderMinutes !== undefined ? Number(baseSource.telegramPreClassReminderMinutes) : (Number(prevSettings.telegramPreClassReminderMinutes) || 15),
            telegramLateAlertDelayMinutes: baseSource.telegramLateAlertDelayMinutes !== undefined ? Number(baseSource.telegramLateAlertDelayMinutes) : (Number(prevSettings.telegramLateAlertDelayMinutes) || 10),
            telegramLateAlertRepeatEnabled: baseSource.telegramLateAlertRepeatEnabled !== undefined ? Boolean(baseSource.telegramLateAlertRepeatEnabled) : (prevSettings.telegramLateAlertRepeatEnabled !== false),
            telegramLateAlertRepeatIntervalMinutes: baseSource.telegramLateAlertRepeatIntervalMinutes !== undefined ? Number(baseSource.telegramLateAlertRepeatIntervalMinutes) : (Number(prevSettings.telegramLateAlertRepeatIntervalMinutes) || 15),
            telegramLateAlertMaxCount: baseSource.telegramLateAlertMaxCount !== undefined ? Number(baseSource.telegramLateAlertMaxCount) : (Number(prevSettings.telegramLateAlertMaxCount) || 2),
            telegramFinalAbsentTiming: baseSource.telegramFinalAbsentTiming || prevSettings.telegramFinalAbsentTiming || 'end_of_session',
            telegramNotifyTeacherDirectly: baseSource.telegramNotifyTeacherDirectly !== undefined ? Boolean(baseSource.telegramNotifyTeacherDirectly) : (prevSettings.telegramNotifyTeacherDirectly !== false),
            
            telegramToken: baseSource.telegramToken || prevSettings.telegramToken || '',
            telegramChatId: baseSource.telegramChatId || prevSettings.telegramChatId || '',
            telegramAdminUserId: baseSource.telegramAdminUserId || prevSettings.telegramAdminUserId || '',
            telegramBotUsername: baseSource.telegramBotUsername || prevSettings.telegramBotUsername || '',
            telegramEnabled: baseSource.telegramEnabled !== undefined ? Boolean(baseSource.telegramEnabled) : Boolean(prevSettings.telegramEnabled),
            
            telegramTemplatePreClass: baseSource.telegramTemplatePreClass || prevSettings.telegramTemplatePreClass || '',
            telegramTemplateLogin: baseSource.telegramTemplateLogin || prevSettings.telegramTemplateLogin || '',
            telegramTemplateComplete: baseSource.telegramTemplateComplete || prevSettings.telegramTemplateComplete || '',
            telegramTemplateAbsent: baseSource.telegramTemplateAbsent || prevSettings.telegramTemplateAbsent || '',
            
            telegramGroups: Array.isArray(baseSource.telegramGroups) ? baseSource.telegramGroups : (prevSettings.telegramGroups || []),
            telegramChannels: Array.isArray(baseSource.telegramChannels) ? baseSource.telegramChannels : (prevSettings.telegramChannels || []),
            teachers: Array.isArray(baseSource.teachers) ? baseSource.teachers : (prevSettings.teachers || []),
            templatesAr: baseSource.templatesAr || prevSettings.templatesAr,
            templatesEn: baseSource.templatesEn || prevSettings.templatesEn,
            templatesTh: baseSource.templatesTh || prevSettings.templatesTh,
            botCommands: baseSource.botCommands || prevSettings.botCommands,
          };

          try {
            localStorage.setItem('attendance_settings_cached', JSON.stringify(fetchedSettings));
          } catch (e) {}

          return fetchedSettings;
        });

        if (Array.isArray(response.data.settings.allowedExceptionStudents)) {
          setAllowedInput(response.data.settings.allowedExceptionStudents.join(', '));
        }
      }
      let fetchedActive = response?.data?.activeStudents || [];
      let fetchedLoggedOut = response?.data?.loggedOutStudents || [];
      let fetchedCompleted = response?.data?.completedStudents || [];
      let fetchedAbsent = response?.data?.absentStudents || [];

      // If we got fresh schedules from GAS, process and merge them
      if (Array.isArray(schedulesRes) && schedulesRes.length > 0) {
        const now = Date.now();
        // Merge recent local overrides (within 60 seconds) and local student Telegram records
        const mergedSchedules = schedulesRes.map((sched) => {
          const sKey = (sched.studentId || '').toLowerCase().trim();
          let localTelegram: { telegramChatId?: string; preferredLang?: 'ar' | 'en' | 'th'; guardianPhone?: string } | null = null;
          try {
            const raw = localStorage.getItem(`student_telegram_${sched.studentId}`);
            if (raw) localTelegram = JSON.parse(raw);
          } catch (e) {}

          let isUnlinked = false;
          try {
            const rawUnlinked = localStorage.getItem('telegram_unlinked_students');
            if (rawUnlinked) {
              const unlinkedList: string[] = JSON.parse(rawUnlinked);
              if (unlinkedList.includes(String(sched.studentId).trim())) {
                isUnlinked = true;
              }
            }
          } catch (e) {}

          const recent = recentlySavedOverridesRef.current.get(sKey);
          let resSched = { ...sched };
          if (isUnlinked) {
            resSched.telegramChatId = '';
          } else if (localTelegram && localTelegram.telegramChatId && !resSched.telegramChatId) {
            resSched.telegramChatId = localTelegram.telegramChatId;
            if (localTelegram.preferredLang) resSched.preferredLanguage = localTelegram.preferredLang;
            if (localTelegram.guardianPhone) resSched.guardianPhone = localTelegram.guardianPhone;
          }
          if (recent && (now - recent.timestamp < 60000)) {
            resSched = {
              ...resSched,
              ...recent.override,
            };
          }
          return resSched;
        });

        // Also check if any recent student was newly created and not yet in schedulesRes
        recentlySavedOverridesRef.current.forEach((val, sKey) => {
          if (now - val.timestamp < 60000) {
            const exists = mergedSchedules.some((s) => (s.studentId || '').toLowerCase().trim() === sKey);
            if (!exists) {
              mergedSchedules.push({
                studentId: val.override.studentId || sKey,
                studentName: val.override.studentName || sKey,
                startDate: '',
                activeDays: '',
                lessonsPerWeek: '3',
                daysToKeep: '',
                expiryDate: '',
                ...val.override,
              } as StudentSchedule);
            }
          }
        });

        setAllSchedules(mergedSchedules);
        allSchedulesRef.current = mergedSchedules;
        try {
          localStorage.setItem('all_schedules_cached', JSON.stringify(mergedSchedules));
        } catch (e) {}

        // Trigger automated Telegram alert checks (Pre-class, Late Alert, Absent)
        let alertSettings = settings;
        try {
          const raw = localStorage.getItem('attendance_settings_cached');
          if (raw) alertSettings = JSON.parse(raw);
        } catch (e) {}

        if (alertSettings && alertSettings.telegramToken && alertSettings.telegramEnabled !== false) {
          checkAndDispatchAutomatedAlerts(mergedSchedules, alertSettings).catch(() => {});
        }
      }

      // Use the best available schedule list to calculate absent students
      const currentActiveSchedules = (Array.isArray(schedulesRes) && schedulesRes.length > 0)
        ? schedulesRes
        : allSchedulesRef.current;

      if (currentActiveSchedules && currentActiveSchedules.length > 0) {
        // Cross-verify with allSchedules so absent students are never omitted
        const presentIds = new Set([
          ...fetchedActive.map((s) => s.studentId),
          ...fetchedLoggedOut.map((s) => s.studentId),
          ...fetchedCompleted.map((s) => s.studentId),
          ...fetchedAbsent.map((s) => s.studentId),
        ]);

        const defaultSched = currentActiveSchedules.find((s) => s.studentId === 'DEFAULT_STUDENT');
        const currentDayOfWeek = new Date().getDay();
        const todayMid = new Date();
        todayMid.setHours(0, 0, 0, 0);

        const additionalAbsent: LiveStudentStatus[] = [];

        for (const sched of currentActiveSchedules) {
          if (!sched.studentId || sched.studentId === 'DEFAULT_STUDENT') continue;
          if (presentIds.has(sched.studentId)) continue;

          const activeDaysStr = sched.activeDays || defaultSched?.activeDays || 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت';
          const activeDaysIndices = parseActiveDaysIndices(activeDaysStr);
          const isDayScheduled = activeDaysIndices.includes(currentDayOfWeek);

          const effStartDate = sched.startDate || defaultSched?.startDate || '';
          let isStarted = true;
          if (effStartDate && effStartDate.trim()) {
            const p = effStartDate.split('-');
            if (p.length === 3) {
              const sDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
              sDate.setHours(0, 0, 0, 0);
              if (todayMid < sDate) isStarted = false;
            }
          }

          const effExpDate = sched.expiryDate || defaultSched?.expiryDate || '';
          let isExpired = false;
          if (effExpDate && effExpDate.trim()) {
            const expP = effExpDate.split('-');
            if (expP.length === 3) {
              const expDate = new Date(parseInt(expP[0], 10), parseInt(expP[1], 10) - 1, parseInt(expP[2], 10));
              expDate.setHours(0, 0, 0, 0);
              if (todayMid > expDate) isExpired = true;
            }
          }

          if (isDayScheduled && isStarted && !isExpired) {
            additionalAbsent.push({
              studentId: sched.studentId,
              studentName: sched.studentName || `طالب ${sched.studentId}`,
              status: 'absent',
              completedLessonsCount: 0,
              totalRequiredLessons: parseInt(sched.lessonsPerWeek || defaultSched?.lessonsPerWeek || '3', 10) || 3,
              completedTopics: [],
              pendingTopics: [],
              notes: 'يوم دراسة مقرر',
              customTime: (sched.customStartTime || sched.customSessionDuration !== undefined) ? {
                startTime: sched.customStartTime || '',
                sessionDuration: sched.customSessionDuration,
                durationType: sched.customDurationType,
                preventEarlyEntry: sched.customPreventEarlyEntry,
                forceLogin: sched.customForceLogin,
              } : undefined,
            });
          }
        }

        if (additionalAbsent.length > 0) {
          fetchedAbsent = [...fetchedAbsent, ...additionalAbsent];
        }
      }

      setActiveStudents(fetchedActive);
      setLoggedOutStudents(fetchedLoggedOut);
      setCompletedStudents(fetchedCompleted);
      setAbsentStudents(fetchedAbsent);
      try {
        const todayIso = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        localStorage.setItem('live_active_students_cached', JSON.stringify(fetchedActive));
        localStorage.setItem('live_logged_out_students_cached', JSON.stringify(fetchedLoggedOut));
        localStorage.setItem('live_completed_students_cached', JSON.stringify(fetchedCompleted));
        localStorage.setItem('live_absent_students_cached', JSON.stringify(fetchedAbsent));
        localStorage.setItem('live_attendance_cache_date', todayIso);
      } catch (e) {}
      setLastRefreshed(response?.data?.lastRefreshed || new Date().toLocaleTimeString('ar-SA'));
    } catch (err: any) {
      console.error('Error fetching live monitoring data:', err);
      if (!isBackground) setStatusMessage('تعذر جلب البيانات الحية من الشيت.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleSaveSettings = async (overrideSettings?: AttendanceSettings | any) => {
    setSavingSettings(true);
    setStatusMessage('');
    try {
      const allowedArr = allowedInput
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter((s) => s !== '');

      // Ensure overrideSettings is a real plain AttendanceSettings object, not a React SyntheticEvent or DOM event
      const isActualSettingsObject = Boolean(
        overrideSettings &&
        typeof overrideSettings === 'object' &&
        !('_reactName' in overrideSettings) &&
        !('nativeEvent' in overrideSettings) &&
        !('target' in overrideSettings) &&
        !('currentTarget' in overrideSettings)
      );

      const baseSettings: AttendanceSettings = isActualSettingsObject ? (overrideSettings as AttendanceSettings) : settings;

      // Extract and sanitize clean primitives to guarantee zero circular structures
      const cleanSettings: AttendanceSettings = {
        startTime: formatTimeStr(baseSettings.startTime || settings.startTime || '19:00'),
        durationType: baseSettings.durationType || settings.durationType || 'from_start',
        sessionDurationFromStart: Number(baseSettings.sessionDurationFromStart || settings.sessionDurationFromStart) || 120,
        sessionDurationFromLogin: Number(baseSettings.sessionDurationFromLogin || settings.sessionDurationFromLogin) || 90,
        forceLogin: Boolean(baseSettings.forceLogin),
        timeRestricted: Boolean(baseSettings.timeRestricted),
        preventEarlyEntry: Boolean(baseSettings.preventEarlyEntry),
        allowedExceptionStudents: isActualSettingsObject ? (baseSettings.allowedExceptionStudents || allowedArr) : allowedArr,
        telegramToken: baseSettings.telegramToken || settings.telegramToken || '',
        telegramChatId: baseSettings.telegramChatId || settings.telegramChatId || '',
        telegramAdminUserId: baseSettings.telegramAdminUserId || settings.telegramAdminUserId || '',
        telegramBotUsername: baseSettings.telegramBotUsername || settings.telegramBotUsername || '',
        telegramEnabled: Boolean((baseSettings.telegramToken || settings.telegramToken) && (baseSettings.telegramEnabled !== false && settings.telegramEnabled !== false)),
        telegramTemplatePreClass: baseSettings.telegramTemplatePreClass || settings.telegramTemplatePreClass || '',
        telegramTemplateLogin: baseSettings.telegramTemplateLogin || settings.telegramTemplateLogin || '',
        telegramTemplateComplete: baseSettings.telegramTemplateComplete || settings.telegramTemplateComplete || '',
        telegramTemplateAbsent: baseSettings.telegramTemplateAbsent || settings.telegramTemplateAbsent || '',
        telegramPreClassReminderMinutes: Number(baseSettings.telegramPreClassReminderMinutes !== undefined ? baseSettings.telegramPreClassReminderMinutes : (settings.telegramPreClassReminderMinutes || 15)),
        telegramLateAlertDelayMinutes: Number(baseSettings.telegramLateAlertDelayMinutes !== undefined ? baseSettings.telegramLateAlertDelayMinutes : (settings.telegramLateAlertDelayMinutes || 10)),
        telegramLateAlertRepeatEnabled: baseSettings.telegramLateAlertRepeatEnabled !== undefined ? Boolean(baseSettings.telegramLateAlertRepeatEnabled) : (settings.telegramLateAlertRepeatEnabled !== false),
        telegramLateAlertRepeatIntervalMinutes: Number(baseSettings.telegramLateAlertRepeatIntervalMinutes !== undefined ? baseSettings.telegramLateAlertRepeatIntervalMinutes : (settings.telegramLateAlertRepeatIntervalMinutes || 15)),
        telegramLateAlertMaxCount: Number(baseSettings.telegramLateAlertMaxCount !== undefined ? baseSettings.telegramLateAlertMaxCount : (settings.telegramLateAlertMaxCount || 2)),
        telegramFinalAbsentTiming: (baseSettings.telegramFinalAbsentTiming || settings.telegramFinalAbsentTiming || 'end_of_session') as any,
        telegramNotifyTeacherDirectly: baseSettings.telegramNotifyTeacherDirectly !== undefined ? Boolean(baseSettings.telegramNotifyTeacherDirectly) : (settings.telegramNotifyTeacherDirectly !== false),
        telegramGroups: Array.isArray(baseSettings.telegramGroups) ? baseSettings.telegramGroups : (settings.telegramGroups || []),
        telegramChannels: Array.isArray(baseSettings.telegramChannels) ? baseSettings.telegramChannels : (settings.telegramChannels || []),
        teachers: Array.isArray(baseSettings.teachers) ? baseSettings.teachers : (settings.teachers || []),
        templatesAr: baseSettings.templatesAr || settings.templatesAr,
        templatesEn: baseSettings.templatesEn || settings.templatesEn,
        templatesTh: baseSettings.templatesTh || settings.templatesTh,
        botCommands: baseSettings.botCommands || settings.botCommands,
      };

      recentlySavedSettingsRef.current = {
        settings: cleanSettings,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem('attendance_settings_cached', JSON.stringify(cleanSettings));
        localStorage.setItem('attendance_settings_saved_at', String(Date.now()));
      } catch (e) {}

      setSettings(cleanSettings);

      const response = await callGasApi<{ success: boolean; message: string }>('saveAttendanceSettings', {
        settings: cleanSettings,
      });

      if (response && response.success) {
        setStatusMessage('✅ ' + (response.message || 'تم حفظ جميع إعدادات المتابعة وتليجرام بنجاح!'));
      } else {
        setStatusMessage('❌ فشل حفظ الإعدادات.');
      }
    } catch (err: any) {
      setStatusMessage('❌ خطأ في الاتصال: ' + (err.message || 'تعذر الحفظ'));
    } finally {
      setSavingSettings(false);
    }
  };

  // Update Student Telegram data in allSchedules
  const handleUpdateScheduleStudentTelegram = (
    studentId: string,
    telegramChatId: string,
    preferredLang?: 'ar' | 'en' | 'th',
    guardianPhone?: string
  ) => {
    const sKey = (studentId || '').toLowerCase().trim();
    recentlySavedOverridesRef.current.set(sKey, {
      override: {
        telegramChatId,
        preferredLanguage: preferredLang,
        guardianPhone,
      },
      timestamp: Date.now(),
    });

    setAllSchedules((prev) => {
      const updated = prev.map((s) =>
        s.studentId === studentId || (s.studentId && s.studentId.toLowerCase().trim() === sKey)
          ? {
              ...s,
              telegramChatId,
              preferredLanguage: preferredLang || s.preferredLanguage || 'ar',
              guardianPhone: guardianPhone !== undefined ? guardianPhone : s.guardianPhone,
            }
          : s
      );
      try {
        localStorage.setItem('all_schedules_cached', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      if (telegramChatId && telegramChatId.trim()) {
        localStorage.setItem(`student_telegram_${studentId}`, JSON.stringify({ telegramChatId, preferredLang, guardianPhone }));
        // Also remove from unlinked/ignored list when they get a new chatId
        const rawUnlinked = localStorage.getItem('telegram_unlinked_students');
        if (rawUnlinked) {
          const list: string[] = JSON.parse(rawUnlinked);
          const filtered = list.filter((id) => id !== String(studentId).trim() && id !== sKey);
          localStorage.setItem('telegram_unlinked_students', JSON.stringify(filtered));
        }
        // Passively record to Telegram_Users sheet in Google Sheets
        const matched = allSchedules.find(
          (s) => s.studentId === studentId || (s.studentId && s.studentId.toLowerCase().trim() === sKey)
        );
        saveTelegramUserToSheetPassive({
          studentName: matched?.studentName || `طالب ${studentId}`,
          studentId,
          telegramChatId,
          preferredLanguage: preferredLang,
        });
      }
    } catch (e) {}
  };

  // Delete / Unlink Student Telegram Registration
  const handleDeleteStudentTelegram = (studentId: string) => {
    const student = allSchedules.find((s) => s.studentId === studentId);
    setAllSchedules((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              telegramChatId: '',
            }
          : s
      )
    );
    try {
      clearStudentActivePresence(studentId, student?.studentName);
      localStorage.removeItem(`student_telegram_${studentId}`);
      const todayIso = new Date().toISOString().split('T')[0];
      localStorage.removeItem(`tg_entry_notified_${studentId}_${todayIso}`);
      localStorage.removeItem(`tg_event_dispatched_${studentId}_login_${todayIso}`);
      localStorage.removeItem(`tg_event_dispatched_${studentId}_earlyEntryAllowed_${todayIso}`);
      localStorage.removeItem(`tg_event_dispatched_${studentId}_earlyExit_${todayIso}`);
      localStorage.removeItem(`tg_event_dispatched_${studentId}_regularExit_${todayIso}`);
    } catch (e) {}
  };

  // Quick Send Absent Alert from Live Table
  const handleQuickSendAbsentAlert = async (st: LiveStudentStatus) => {
    if (!settings.telegramToken) {
      setStatusMessage('⚠️ يرجى ضبط رمز البوت (Bot Token) في تبويب إعدادات تليجرام أولاً.');
      return;
    }
    const sched = allSchedules.find((s) => s.studentId === st.studentId);
    const targetChatId = sched?.telegramChatId || settings.telegramChatId;
    if (!targetChatId) {
      setStatusMessage(`⚠️ لا يوجد معرّف تيليجرام مسجل للطالب (${st.studentName}) أو للقناة الإدارية.`);
      return;
    }

    const templateText =
      (sched?.preferredLanguage === 'en'
        ? settings.templatesEn?.absent
        : sched?.preferredLanguage === 'th'
        ? settings.templatesTh?.absent
        : settings.templatesAr?.absent) ||
      settings.telegramTemplateAbsent ||
      'تنبيه: الطالب {{اسم_الطالب}} لم يسجل دخوله للحصة المقررة اليوم.';

    const textToSend = interpolateTelegramTemplate(templateText, {
      studentName: st.studentName,
      studentId: st.studentId,
      time: sched?.customStartTime || settings.startTime || '19:00',
      date: new Date().toLocaleDateString('ar-SA'),
    });

    setStatusMessage(`جاري إرسال إنذار الغياب للطالب (${st.studentName})...`);
    try {
      const res = await sendTelegramMessage({
        token: settings.telegramToken,
        chatId: targetChatId,
        text: textToSend,
      });

      if (res.ok) {
        setStatusMessage(`✅ تم إرسال تنبيه الغياب للطالب (${st.studentName}) بنجاح عبر تليجرام!`);
      } else {
        setStatusMessage(`❌ فشل إرسال التنبيه: ${res.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ خطأ: ${err.message}`);
    }
  };

  // Save Per-Student Custom Settings
  const handleSaveCustomStudent = async () => {
    if (!selectedStudentId) {
      setCustomStatusMsg('⚠️ يرجى اختيار الطالب المراد تخصيص إعداداته أولاً.');
      return;
    }
    setSavingCustomStudent(true);
    setCustomStatusMsg('');
    try {
      const formattedTime = formatTimeStr(customStartTime);
      const overrideData: Partial<StudentSchedule> = {
        studentId: selectedStudentId,
        customStartTime: formattedTime,
        customSessionDuration: Number(customSessionDuration) || 60,
        customDurationType: customDurationType,
        customPreventEarlyEntry: Boolean(customPreventEarlyEntry),
        customForceLogin: Boolean(customForceLogin),
      };

      const res = await callGasApi<{ success: boolean; message: string }>('saveStudentCustomTime', {
        studentId: selectedStudentId,
        customStartTime: formattedTime,
        customSessionDuration: Number(customSessionDuration) || 60,
        customDurationType: customDurationType,
        customPreventEarlyEntry: Boolean(customPreventEarlyEntry),
        customForceLogin: Boolean(customForceLogin),
      });

      if (res && res.success) {
        setCustomStatusMsg('✅ ' + (res.message || 'تم حفظ تخصيص الطالب بنجاح في ورقة StudentSchedule!'));

        // Register in local override lock ref for 60 seconds
        const sKey = selectedStudentId.toLowerCase().trim();
        recentlySavedOverridesRef.current.set(sKey, {
          override: overrideData,
          timestamp: Date.now(),
        });

        // Also update local cache for student preview
        try {
          localStorage.setItem(`student_custom_sched_${selectedStudentId}`, JSON.stringify(overrideData));
        } catch (e) {}

        // Optimistically update allSchedules
        setAllSchedules((prev) => {
          const exists = prev.some((s) => s.studentId === selectedStudentId);
          if (exists) {
            return prev.map((s) =>
              s.studentId === selectedStudentId
                ? {
                    ...s,
                    ...overrideData,
                  }
                : s
            );
          } else {
            return [
              ...prev,
              {
                studentId: selectedStudentId,
                studentName: selectedStudentId,
                startDate: '',
                activeDays: '',
                lessonsPerWeek: '3',
                daysToKeep: '',
                expiryDate: '',
                ...overrideData,
              } as StudentSchedule,
            ];
          }
        });
        setEditingStudentId(null);
      } else {
        setCustomStatusMsg('❌ فشل حفظ تخصيص الطالب.');
      }
    } catch (err: any) {
      setCustomStatusMsg('❌ خطأ في الاتصال: ' + (err.message || 'تعذر الحفظ'));
    } finally {
      setSavingCustomStudent(false);
    }
  };

  // Delete / Reset Per-Student Custom Settings
  const executeDeleteCustomStudent = async (studentId: string, studentName: string) => {
    setDeleteConfirmStudent(null);
    setDeletingStudentId(studentId);
    setCustomStatusMsg('');
    try {
      const sKey = (studentId || '').toLowerCase().trim();
      recentlySavedOverridesRef.current.delete(sKey);
      try {
        localStorage.removeItem(`student_custom_sched_${studentId}`);
        if (studentName) localStorage.removeItem(`student_custom_sched_${studentName}`);
      } catch (e) {}

      const updatedSchedules = allSchedules.map((s) =>
        s.studentId === studentId || (s.studentId && s.studentId.toLowerCase().trim() === sKey)
          ? {
              ...s,
              customStartTime: '',
              customSessionDuration: undefined,
              customDurationType: undefined,
              customPreventEarlyEntry: undefined,
              customForceLogin: undefined,
            }
          : s
      );

      setAllSchedules(updatedSchedules);
      allSchedulesRef.current = updatedSchedules;
      try {
        localStorage.setItem('all_schedules_cached', JSON.stringify(updatedSchedules));
      } catch (e) {}

      if (editingStudentId === studentId) {
        setEditingStudentId(null);
        setSelectedStudentId('');
      }

      let res = await callGasApi<{ success: boolean; message: string }>('deleteStudentCustomTime', {
        studentId: studentId,
      });

      if (!res || !res.success) {
        res = await callGasApi<{ success: boolean; message: string }>('saveStudentCustomTime', {
          studentId: studentId,
          customStartTime: '',
          customSessionDuration: 0,
          customDurationType: 'from_start',
          customPreventEarlyEntry: false,
          customForceLogin: false,
        });
      }

      if (res && res.success) {
        setCustomStatusMsg(`✅ تم إلغاء تخصيص الطالب (${studentName}) وإعادته للإعدادات العامة بنجاح.`);
      } else {
        setCustomStatusMsg(`✅ تم إلغاء تخصيص الطالب (${studentName}) محلياً بنجاح.`);
      }
    } catch (err: any) {
      setCustomStatusMsg('⚠️ تم التحديث: ' + (err.message || 'خطأ في مزامنة الشيت'));
    } finally {
      setDeletingStudentId(null);
    }
  };

  // Populate Custom Form for Editing
  const handleEditCustomStudent = (sched: StudentSchedule) => {
    setSelectedStudentId(sched.studentId);
    setCustomStartTime(sched.customStartTime || settings.startTime || '16:30');
    setCustomSessionDuration(
      sched.customSessionDuration ||
        (sched.customDurationType === 'from_start'
          ? settings.sessionDurationFromStart
          : settings.sessionDurationFromLogin) ||
        60
    );
    setCustomDurationType(sched.customDurationType || 'from_login');
    setCustomPreventEarlyEntry(sched.customPreventEarlyEntry !== undefined ? sched.customPreventEarlyEntry : true);
    setCustomForceLogin(sched.customForceLogin !== undefined ? sched.customForceLogin : true);
    setEditingStudentId(sched.studentId);
    setCustomStatusMsg(`✏️ جاري تعديل تخصيص الطالب: ${sched.studentName}`);

    // Switch tab if not in settings
    setActiveTab('settings');
    setTimeout(() => {
      const el = document.getElementById('student-custom-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const customizedStudents = allSchedules.filter((s) => Boolean(s.customStartTime));
  const filteredCustomizedStudents = customizedStudents.filter((s) => {
    if (!customSearchFilter.trim()) return true;
    const q = customSearchFilter.toLowerCase();
    return (s.studentName || '').toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans" dir="rtl">
      {/* Top Fixed Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  لوحة المتابعة المباشرة أونلاين
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  حي مباشر
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة دخول وخروج الطلاب وإنجاز الدروس في الوقت الفعلي
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-3">
            {currentAdminName && (
              <div className="text-right hidden sm:block pl-3 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">المشرف الحالي:</span>
                <span className="text-xs font-bold text-emerald-400 block">{currentAdminName}</span>
              </div>
            )}

            <button
              onClick={() => fetchMonitoringData(false)}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
              title="تحديث البيانات الآن"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">تحديث الآن</span>
            </button>

            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">لوحة الإدارة</span>
              </button>
            )}

            {onGoToStudentHome && (
              <button
                onClick={onGoToStudentHome}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 p-2 rounded-xl transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
          <div className="flex gap-2 py-2">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'live'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>لوحة المتابعة الحية</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px] text-emerald-400 border border-slate-700">
                {activeStudents.length + completedStudents.length + absentStudents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>إعدادات المتابعة والوقت</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'telegram'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-4 h-4 text-indigo-400" />
              <span>إعدادات تليجرام (Telegram)</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>تحديث تلقائي (كل 15 ثانية)</span>
            </label>
            {lastRefreshed && (
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50 text-slate-300">
                آخر تحديث: {lastRefreshed}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Alert / Notification Bar */}
      {statusMessage && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
          <div className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => setStatusMessage('')}
              className="text-slate-400 hover:text-white text-xs bg-slate-700 px-2 py-1 rounded"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading && allSchedules.length === 0 && activeStudents.length === 0 && !settings.telegramToken ? (
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-12 text-center my-8">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">جاري جلب بيانات المتابعة الحية...</h3>
            <p className="text-xs text-slate-400">يتم قراءة جدول التخصيص وسجلات الحضور وإنجاز التمارين من الشيت سريعا</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: LIVE MONITORING DASHBOARD */}
            {activeTab === 'live' && (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Summary Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Metric 1: Active Now */}
                  <div className="bg-gradient-to-br from-emerald-950/40 to-slate-800/60 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 tracking-wider block">
                          🟢 المتواجدون أونلاين الآن
                        </span>
                        <h2 className="text-3xl font-black text-white mt-1">
                          {activeStudents.length} <span className="text-xs text-slate-400 font-normal">طلاب نشطون</span>
                        </h2>
                      </div>
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                        <UserCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      متواجدون حالياً يتصفحون ويحلون التمارين
                    </p>
                  </div>

                  {/* Metric 2: Logged Out Today */}
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-600/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-300 tracking-wider block">
                          ⚪ غادروا المنصة اليوم
                        </span>
                        <h2 className="text-3xl font-black text-white mt-1">
                          {loggedOutStudents.length} <span className="text-xs text-slate-400 font-normal">سجلوا خروجهم</span>
                        </h2>
                      </div>
                      <div className="p-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
                        <Clock className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      حضروا وسجلوا خروجهم بعد أداء الحصة
                    </p>
                  </div>

                  {/* Metric 3: Completed Today */}
                  <div className="bg-gradient-to-br from-blue-950/40 to-slate-800/60 border border-blue-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-blue-400 tracking-wider block">
                          ✅ أتموا دروس اليوم بنجاح
                        </span>
                        <h2 className="text-3xl font-black text-white mt-1">
                          {completedStudents.length} <span className="text-xs text-slate-400 font-normal">طلاب مكتملون</span>
                        </h2>
                      </div>
                      <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      أنهوا حل تمارين وواجبات الحصة المقررة اليوم
                    </p>
                  </div>

                  {/* Metric 4: Absent / Pending Today */}
                  <div className="bg-gradient-to-br from-rose-950/40 to-slate-800/60 border border-rose-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-rose-400 tracking-wider block">
                          ⚠️ غائبون / لم يدخلوا بعد
                        </span>
                        <h2 className="text-3xl font-black text-white mt-1">
                          {absentStudents.length} <span className="text-xs text-slate-400 font-normal">طلاب غائبون</span>
                        </h2>
                      </div>
                      <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
                        <UserX className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      عندهم حصة دراسية مخصصة اليوم وحضورهم معلق
                    </p>
                  </div>
                </div>

                {/* List 1: Active Online Students */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h3 className="font-bold text-white text-base">🟢 قائمة المتواجدين أونلاين الآن</h3>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                      {activeStudents.length} متواجد
                    </span>
                  </div>

                  <div className="p-6">
                    {activeStudents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        لا يوجد طلاب متواجدون أونلاين حالياً في هذه اللحظة.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeStudents.map((st) => {
                          const sched = allSchedules.find((s) => s.studentId === st.studentId);
                          const hasCustom = Boolean(sched?.customStartTime || st.customTime?.startTime);
                          const customTimeVal = sched?.customStartTime || st.customTime?.startTime;
                          return (
                            <div
                              key={st.studentId}
                              className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-emerald-500/50 transition"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-white text-sm">{st.studentName}</h4>
                                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                                      #{st.studentId}
                                    </span>
                                    {hasCustom && (
                                      <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        موعد خاص: {formatDisplayTime(customTimeVal)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400 flex items-center gap-3">
                                    <span>دخول: <strong className="text-emerald-400 font-mono">{formatDisplayTime(st.loginTime) || 'الآن'}</strong></span>
                                    <span>آخر نشاط: <strong className="text-slate-200 font-mono">{formatDisplayTime(st.lastActiveTime) || 'منذ قليل'}</strong></span>
                                  </div>
                                </div>
                                <div className="text-left shrink-0">
                                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg font-bold block">
                                    أنجز: {st.completedLessonsCount} / {st.totalRequiredLessons}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                                <span className="text-slate-400">
                                  {st.notes || 'جلسة نشطة'}
                                </span>
                                <button
                                  onClick={() => handleEditCustomStudent(sched || { studentId: st.studentId, studentName: st.studentName, startDate: '', activeDays: '', lessonsPerWeek: '3' })}
                                  className="text-slate-400 hover:text-amber-300 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold"
                                  title="تخصيص وقت هذا الطالب"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                  <span>{hasCustom ? 'تعديل التوقيت' : 'تخصيص توقيت'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* List 2: Logged Out Students */}
                {loggedOutStudents.length > 0 && (
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                        <h3 className="font-bold text-white text-base">⚪ قائمة الذين غادروا المنصة وسجلوا خروجهم</h3>
                      </div>
                      <span className="text-xs bg-slate-700 text-slate-300 border border-slate-600 px-3 py-1 rounded-full font-bold">
                        {loggedOutStudents.length} غادروا
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loggedOutStudents.map((st) => {
                          const sched = allSchedules.find((s) => s.studentId === st.studentId);
                          const hasCustom = Boolean(sched?.customStartTime || st.customTime?.startTime);
                          const customTimeVal = sched?.customStartTime || st.customTime?.startTime;
                          return (
                            <div
                              key={st.studentId}
                              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 opacity-90 hover:opacity-100 transition"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-slate-200 text-sm">{st.studentName}</h4>
                                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                                      #{st.studentId}
                                    </span>
                                    {hasCustom && (
                                      <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        توقيت خاص: {formatDisplayTime(customTimeVal)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400 flex items-center gap-3">
                                    <span>دخول: <strong className="text-slate-300 font-mono">{formatDisplayTime(st.loginTime)}</strong></span>
                                    <span>خروج: <strong className="text-amber-400 font-mono">{formatDisplayTime(st.lastActiveTime)}</strong></span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-lg font-bold">
                                    غادر المنصة ⚪
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* List 3: Completed Today's Schedule */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      <h3 className="font-bold text-white text-base">✅ قائمة الذين أتموا دروس اليوم بالكامل</h3>
                    </div>
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-bold">
                      {completedStudents.length} مكتمل
                    </span>
                  </div>

                  <div className="p-6">
                    {completedStudents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        لم يكمل أي طالب دروس اليوم حتى الآن.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedStudents.map((st) => {
                          const sched = allSchedules.find((s) => s.studentId === st.studentId);
                          const hasCustom = Boolean(sched?.customStartTime || st.customTime?.startTime);
                          return (
                            <div
                              key={st.studentId}
                              className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex justify-between items-center hover:border-blue-500/50 transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-white text-sm">{st.studentName}</h4>
                                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                                    #{st.studentId}
                                  </span>
                                  {hasCustom && (
                                    <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      مخصص
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">
                                  أتم جميع التمارين المقررة ({st.completedLessonsCount} دروس)
                                </p>
                              </div>
                              <div>
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg font-bold border border-blue-500/30">
                                  مكتمل 100% ✨
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* List 4: Absent / Pending Schedule */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserX className="w-5 h-5 text-rose-400" />
                      <h3 className="font-bold text-white text-base">⚠️ قائمة الغائبين / المعلقين اليوم</h3>
                    </div>
                    <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full font-bold">
                      {absentStudents.length} غائب
                    </span>
                  </div>

                  <div className="p-6">
                    {absentStudents.length === 0 ? (
                      <div className="text-center py-8 text-emerald-400 text-sm font-bold">
                        🎉 ممتاز! جميع الطلاب المقرر عليهم دراسة اليوم حضروا أو أتموا دروسهم.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {absentStudents.map((st) => {
                          const sched = allSchedules.find((s) => s.studentId === st.studentId);
                          const hasCustom = Boolean(sched?.customStartTime || st.customTime?.startTime);
                          const customTimeVal = sched?.customStartTime || st.customTime?.startTime;
                          return (
                            <div
                              key={st.studentId}
                              className="bg-slate-900/80 border border-rose-950/60 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-rose-500/50 transition"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-white text-sm">{st.studentName}</h4>
                                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                                      #{st.studentId}
                                    </span>
                                    {hasCustom && (
                                      <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        موعده: {formatDisplayTime(customTimeVal)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-rose-300/80">
                                    {st.notes} (مطلوب منه اليوم {st.totalRequiredLessons} دروس)
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-lg font-bold border border-rose-500/30">
                                    معلق / غائب ⚠️
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] gap-2">
                                <button
                                  onClick={() => handleQuickSendAbsentAlert(st)}
                                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold"
                                  title="إرسال رسالة إنذار وتنبيه غياب عبر تليجرام"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>إرسال إنذار غياب (Telegram)</span>
                                </button>
                                <button
                                  onClick={() => handleEditCustomStudent(sched || { studentId: st.studentId, studentName: st.studentName, startDate: '', activeDays: '', lessonsPerWeek: '3' })}
                                  className="text-slate-400 hover:text-amber-300 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold"
                                  title="تخصيص وقت هذا الطالب"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                  <span>{hasCustom ? 'تعديل توقيته الخاص' : 'تخصيص توقيت منفصل'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: MONITORING & SESSION SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* SECTION 1: GENERAL ATTENDANCE SETTINGS */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-700 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <Clock className="w-6 h-6 text-blue-400" />
                        🏛️ الإعدادات العامة لجميع الطلاب (الخطة الافتراضية للشعبة)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        تطبق هذه الخطة تلقائياً على كافة الطلاب ما لم يتم تخصيص وقت فردي لطالب محدد
                      </p>
                    </div>
                    <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs px-3 py-1 rounded-full font-bold">
                      الأعمدة العامة الموحدة (J:O)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Setting 1: Start Time */}
                    <div className="bg-slate-900/70 border border-slate-700 p-5 rounded-xl space-y-2">
                      <label className="text-sm font-bold text-slate-200 block">
                        ⏰ توقيت بداية الحصة العام:
                      </label>
                      <input
                        type="time"
                        value={settings.startTime}
                        onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-mono focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400">
                        وقت انطلاق الحصة الرسمي المعتمد للشعبة (مثال: 19:00 يعادل 7:00 مساءً)
                      </p>
                    </div>

                    {/* Setting 2: Allowed Exception Students */}
                    <div className="bg-slate-900/70 border border-slate-700 p-5 rounded-xl space-y-2">
                      <label className="text-sm font-bold text-slate-200 block">
                        👥 قائمة السماح بالدخول الاستثنائي (أسماء/أرقام الطلاب):
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: أحمد علي, 102, 105"
                        value={allowedInput}
                        onChange={(e) => setAllowedInput(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400">
                        فصل الأسماء أو الأرقام بفواصل لإعطاء هؤلاء الطلاب إمكانية الدخول المفتوح دون قيود
                      </p>
                    </div>
                  </div>

                  {/* Duration Calculation Selection: One Active Choice */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-400" />
                          طريقة احتساب مدة الحصة العامة (اختر نوعاً واحداً للتفعيل):
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          يتم تفعيل خيار واحد فقط لضبط العداد التنازلي ونهاية الجلسة لجميع الطلاب
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Option 1: From Start Time */}
                      <div
                        onClick={() => setSettings({ ...settings, durationType: 'from_start' })}
                        className={`p-5 rounded-xl border-2 transition cursor-pointer space-y-3 ${
                          settings.durationType === 'from_start'
                            ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="durationType"
                              checked={settings.durationType === 'from_start'}
                              onChange={() => setSettings({ ...settings, durationType: 'from_start' })}
                              className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-white">
                              1️⃣ من بداية توقيت الحصة العام ({settings.startTime || '19:00'})
                            </span>
                          </div>
                          {settings.durationType === 'from_start' && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              مُفعّل الآن
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 pr-6">
                          <label className="text-xs font-bold text-slate-300 block">
                            مدة الحصة بالدقائق:
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="600"
                            disabled={settings.durationType !== 'from_start'}
                            value={settings.sessionDurationFromStart}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                sessionDurationFromStart: parseInt(e.target.value, 10) || 120,
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-mono focus:border-blue-500 focus:outline-none disabled:opacity-50"
                          />
                          <p className="text-[11px] text-slate-400">
                            تنتهي الحصة للجميع عند حلول: وقت البدء + هذه المدة (مثلاً {settings.startTime || '19:00'} + {settings.sessionDurationFromStart || 120} دقيقة)
                          </p>
                        </div>
                      </div>

                      {/* Option 2: From Student Login */}
                      <div
                        onClick={() => setSettings({ ...settings, durationType: 'from_login' })}
                        className={`p-5 rounded-xl border-2 transition cursor-pointer space-y-3 ${
                          settings.durationType === 'from_login'
                            ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="durationType"
                              checked={settings.durationType === 'from_login'}
                              onChange={() => setSettings({ ...settings, durationType: 'from_login' })}
                              className="w-4 h-4 text-amber-600 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-white">
                              2️⃣ من لحظة تسجيل دخول الطالب الفعلي
                            </span>
                          </div>
                          {settings.durationType === 'from_login' && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              مُفعّل الآن
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 pr-6">
                          <label className="text-xs font-bold text-slate-300 block">
                            مدة الحصة بالدقائق:
                          </label>
                          <input
                            type="number"
                            min="10"
                            max="600"
                            disabled={settings.durationType !== 'from_login'}
                            value={settings.sessionDurationFromLogin}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                sessionDurationFromLogin: parseInt(e.target.value, 10) || 90,
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
                          />
                          <p className="text-[11px] text-slate-400">
                            يبدأ العداد الفردي لكل طالب فور تسجيل دخوله للحصة وتستمر معه هذه المدة
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggles Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-700">
                    {/* Toggle 1: Force Login */}
                    <div className="bg-slate-900/70 border border-slate-700 p-5 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {settings.forceLogin ? <Lock className="w-5 h-5 text-amber-400" /> : <Unlock className="w-5 h-5 text-slate-400" />}
                          <h4 className="font-bold text-white text-sm">إجبار تسجيل الدخول للحصة:</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          يلزم الطالب بالضغط على "تسجيل دخول الحصة" أولاً لفتح التمارين
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.forceLogin}
                          onChange={(e) => setSettings({ ...settings, forceLogin: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {/* Toggle 2: Prevent Early Entry */}
                    <div className="bg-slate-900/70 border border-slate-700 p-5 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-400" />
                          <h4 className="font-bold text-white text-sm">منع الدخول قبل الوقت المحدد:</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          قفل التمارين من بداية اليوم حتى موعد البدء العام ({formatDisplayTime(settings.startTime)})
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.preventEarlyEntry)}
                          onChange={(e) => setSettings({ ...settings, preventEarlyEntry: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                      </label>
                    </div>

                    {/* Toggle 3: Time Restriction */}
                    <div className="bg-slate-900/70 border border-slate-700 p-5 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <h4 className="font-bold text-white text-sm">التقيد بالوقت وقفل التمارين:</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          عند انتهاء مدة الحصة، تقفل أزرار بدء الأنشطة والتمارين فقط
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.timeRestricted}
                          onChange={(e) => setSettings({ ...settings, timeRestricted: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings()}
                      disabled={savingSettings}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 text-sm"
                    >
                      <Save className={`w-5 h-5 ${savingSettings ? 'animate-spin' : ''}`} />
                      <span>حفظ الإعدادات العامة للشعبة</span>
                    </button>
                  </div>
                </div>

                {/* SECTION 2: PER-STUDENT CUSTOM TIME OVERRIDES */}
                <div
                  id="student-custom-section"
                  className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Decorative Amber Glow */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-700/80 pb-4 relative">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                          <SlidersHorizontal className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight">
                          🎯 تخصيص مواعيد وإعدادات الطلاب الفردية (Student Overrides)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300">
                        تحديد توقيت أو مدة أو قواعد استثنائية لطالب محدد في ورقة <code className="text-amber-300 font-mono">StudentSchedule</code> (الأعمدة P:S) دون التأثير على بقية زملائه
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {customizedStudents.length} طلاب مخصصين
                      </span>
                    </div>
                  </div>

                  {/* Feedback Notification if any */}
                  {customStatusMsg && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition animate-fadeIn ${
                        customStatusMsg.includes('✅')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : customStatusMsg.includes('✏️')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      <span>{customStatusMsg}</span>
                      <button
                        onClick={() => setCustomStatusMsg('')}
                        className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Quick Add / Edit Bar */}
                  <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-5 md:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {editingStudentId ? (
                          <>
                            <Edit2 className="w-4 h-4 text-amber-400" />
                            <span>تعديل تخصيص الطالب المحدد</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-emerald-400" />
                            <span>شريط الإضافة / التخصيص السريع لطالب:</span>
                          </>
                        )}
                      </h4>
                      {editingStudentId && (
                        <button
                          onClick={() => {
                            setEditingStudentId(null);
                            setSelectedStudentId('');
                            setCustomStatusMsg('');
                          }}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>إلغاء التعديل والعودة للإضافة</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Field 1: Student Selector */}
                      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>الطالب:</span>
                        </label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedStudentId(val);
                            const found = allSchedules.find((s) => s.studentId === val);
                            if (found && found.customStartTime) {
                              setCustomStartTime(found.customStartTime);
                              setCustomSessionDuration(found.customSessionDuration || 60);
                              setCustomDurationType(found.customDurationType || 'from_login');
                              setCustomPreventEarlyEntry(found.customPreventEarlyEntry !== undefined ? found.customPreventEarlyEntry : true);
                              setCustomForceLogin(found.customForceLogin !== undefined ? found.customForceLogin : true);
                            }
                          }}
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                        >
                          <option value="">-- اختر الطالب --</option>
                          {allSchedules.map((s) => (
                            <option key={s.studentId} value={s.studentId}>
                              {s.studentName || s.studentId} {s.customStartTime ? '★ (مخصص)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Field 2: Custom Start Time */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>⏰ وقت البدء الخاص:</span>
                        </label>
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={(e) => setCustomStartTime(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Field 3: Custom Duration */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>⏳ مدة الحصة (دقيقة):</span>
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="600"
                          value={customSessionDuration}
                          onChange={(e) => setCustomSessionDuration(parseInt(e.target.value, 10) || 60)}
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Field 4: Duration Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          <span>⚙️ نوع الاحتساب:</span>
                        </label>
                        <select
                          value={customDurationType}
                          onChange={(e) => setCustomDurationType(e.target.value as 'from_start' | 'from_login')}
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold focus:border-amber-500 focus:outline-none"
                        >
                          <option value="from_login">من لحظة تسجيل الدخول</option>
                          <option value="from_start">من وقت البدء المحدد</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggles & Save Button Row */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Toggle 1: Prevent Early Entry as Switch */}
                        <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-bold text-slate-200">منع الدخول قبل الموعد:</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customPreventEarlyEntry}
                              onChange={(e) => setCustomPreventEarlyEntry(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                          </label>
                          <span className="text-[11px] font-bold text-slate-400">
                            {customPreventEarlyEntry ? 'مُفعّل' : 'معطل'}
                          </span>
                        </div>

                        {/* Toggle 2: Force Login as Switch */}
                        <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-slate-200">إجباري تسجيل الدخول:</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customForceLogin}
                              onChange={(e) => setCustomForceLogin(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                          </label>
                          <span className="text-[11px] font-bold text-slate-400">
                            {customForceLogin ? 'مُفعّل' : 'معطل'}
                          </span>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSaveCustomStudent}
                        disabled={savingCustomStudent || !selectedStudentId}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-6 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {savingCustomStudent ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{editingStudentId ? 'تحديث التخصيص للطالب' : '➕ حفظ تخصيص الطالب'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Table of Customized Students */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>قائمة الطلاب الذين لديهم مواعيد مخصصة حالياً:</span>
                        </h4>
                        <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                          {customizedStudents.length}
                        </span>
                      </div>

                      {/* Search Filter */}
                      {customizedStudents.length > 0 && (
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="بحث بالاسم أو الرقم..."
                            value={customSearchFilter}
                            onChange={(e) => setCustomSearchFilter(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-700 text-white pr-9 pl-3 py-1.5 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {customizedStudents.length === 0 ? (
                      <div className="bg-slate-950/40 border border-dashed border-slate-700/80 rounded-2xl p-8 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                          <Clock className="w-6 h-6" />
                        </div>
                        <h5 className="font-bold text-slate-200 text-sm">
                          جميع الطلاب يتبعون حالياً الخطة العامة الموحدة للشعبة
                        </h5>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          لم يتم تعيين وقت استثنائي لأي طالب حتى الآن. إذا كان هناك طالب يحتاج موعداً أو مدة خاصة، يمكنك اختياره وتعيينه من الشريط أعلاه.
                        </p>
                      </div>
                    ) : filteredCustomizedStudents.length === 0 ? (
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400">
                        لا يوجد نتائج مطابقة للبحث "{customSearchFilter}".
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-700/80 shadow-lg">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-700">
                            <tr>
                              <th className="py-3 px-4">الطالب</th>
                              <th className="py-3 px-4">⏰ وقت البدء الخاص</th>
                              <th className="py-3 px-4">⏳ مدة الجلسة ونوعها</th>
                              <th className="py-3 px-4">🛡️ منع الدخول المبكر</th>
                              <th className="py-3 px-4">🔒 إجباري الدخول</th>
                              <th className="py-3 px-4 text-center">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                            {filteredCustomizedStudents.map((st) => (
                              <tr
                                key={st.studentId}
                                className={`hover:bg-slate-800/60 transition ${
                                  editingStudentId === st.studentId ? 'bg-amber-500/10' : ''
                                }`}
                              >
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                                      {(st.studentName || st.studentId).slice(0, 1)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-white text-xs">{st.studentName}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">#{st.studentId}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg font-mono font-bold inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDisplayTime(st.customStartTime)}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-200">
                                      {st.customSessionDuration || 60} دقيقة
                                    </span>
                                    <p className="text-[10px] text-slate-400">
                                      {st.customDurationType === 'from_start' ? 'من وقت البدء' : 'من تسجيل الدخول'}
                                    </p>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  {st.customPreventEarlyEntry ? (
                                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      مُفعّل 🛡️
                                    </span>
                                  ) : (
                                    <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                      غير مفعّل
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  {st.customForceLogin !== false ? (
                                    <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                                      <Lock className="w-3 h-3" />
                                      إجباري 🔒
                                    </span>
                                  ) : (
                                    <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                      اختياري
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleEditCustomStudent(st)}
                                      className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-slate-700 hover:border-amber-500/40 transition"
                                      title="تعديل هذا التخصيص"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setDeleteConfirmStudent({ studentId: st.studentId, studentName: st.studentName || st.studentId })}
                                      disabled={deletingStudentId === st.studentId}
                                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 hover:border-rose-500/40 transition disabled:opacity-50"
                                      title="إلغاء التخصيص والعودة للخطة العامة"
                                    >
                                      {deletingStudentId === st.studentId ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: TELEGRAM SETTINGS & NOTIFICATIONS PREP */}
            {activeTab === 'telegram' && (
              <motion.div
                key="telegram"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <TelegramHub
                  settings={settings}
                  onUpdateSettings={(newSettings) => setSettings(newSettings)}
                  allSchedules={allSchedules}
                  onUpdateScheduleStudentTelegram={handleUpdateScheduleStudentTelegram}
                  onDeleteStudentTelegram={handleDeleteStudentTelegram}
                  onSaveAll={handleSaveSettings}
                  isSaving={savingSettings}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Delete Confirmation Modal for Custom Student Schedule */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-right"
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h5 className="font-bold text-white text-sm">تأكيد إلغاء الموعد المخصص</h5>
                <p className="text-xs text-slate-400">العودة للخطة الافتراضية للشعبة</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              هل أنت متأكد من رغبتك في إلغاء التخصيص والمواعيد الخاصة للطالب{' '}
              <strong className="text-amber-300 font-bold font-sans">
                {deleteConfirmStudent.studentName}
              </strong>{' '}
              وإعادته لاتباع الإعدادات والمواعيد العامة للشعبة؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => executeDeleteCustomStudent(deleteConfirmStudent.studentId, deleteConfirmStudent.studentName)}
                disabled={deletingStudentId === deleteConfirmStudent.studentId}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {deletingStudentId === deleteConfirmStudent.studentId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>نعم، حذف وإعادة للخطة العامة</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
