/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { callGasApi, isApiConfigured } from './utils/api';
import { Student, GeneralData, ExerciseType } from './types';

// Importing custom modular components
import Onboarding from './components/Onboarding';
import LoginModal from './components/LoginModal';
import HomeDashboard from './components/HomeDashboard';
import ExerciseDrawing from './components/ExerciseDrawing';
import ExerciseWords from './components/ExerciseWords';
import ExerciseMatching from './components/ExerciseMatching';
import ReportDashboard from './components/ReportDashboard';
import About from './components/About';
import AdminDashboard from './components/AdminDashboard';
import MonitoringDashboard from './components/MonitoringDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './context/LanguageContext';
import {
  sendTelegramMessage,
  interpolateTelegramTemplate,
  syncTelegramSignups,
  DEFAULT_TELEGRAM_TEMPLATES_AR,
  DEFAULT_TELEGRAM_TEMPLATES_EN,
  DEFAULT_TELEGRAM_TEMPLATES_TH,
} from './utils/telegram';
import { processTelegramBotUpdates } from './utils/telegramBotProcessor';
import {
  dispatchAttendanceTelegramNotification,
  checkAndDispatchAutomatedAlerts,
  resolveStudentTelegramChatId,
  isRealStudentRecord,
  registerStudentActivePresence,
  clearStudentActivePresence,
  normalizeStudentIdForMatching,
  normalizeArabicText,
} from './utils/telegramScheduler';

// Icons
import {
  Settings,
  LogOut,
  Home,
  FileText,
  HelpCircle,
  Database,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { t } = useLanguage();
  const [apiConfigured, setApiConfigured] = useState<boolean>(isApiConfigured());
  const [student, setStudent] = useState<Student | null>(null);
  const [generalData, setGeneralData] = useState<GeneralData | null>(null);
  
  // URL routing state: check if URL query has ?page=admin or ?page=monitoring
  const [pageParam, setPageParam] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'student';
  });

  const isAdminPage = pageParam === 'admin';
  const isMonitoringPage = pageParam === 'monitoring';

  // App routing state
  const [activeScreen, setActiveScreen] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    if (p === 'admin') return 'admin';
    if (p === 'monitoring') return 'monitoring';
    return 'home';
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Handle browser back/forward or popstate URL changes
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page') || 'student';
      setPageParam(p);
      if (p === 'admin') {
        setActiveScreen('admin');
      } else if (p === 'monitoring') {
        setActiveScreen('monitoring');
      } else {
        setActiveScreen('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ping student presence when student is logged in
  useEffect(() => {
    if (student && !student.isAdmin && apiConfigured) {
      const pingPresence = async () => {
        try {
          await callGasApi('logStudentPresence', {
            studentId: student.id,
            studentName: student.name,
            actionType: 'ping',
          });
        } catch (e) {
          // silent fail
        }
      };
      pingPresence();
      const interval = setInterval(pingPresence, 60000); // ping every 1 min
      return () => clearInterval(interval);
    }
  }, [student, apiConfigured]);

  const goToAdminPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'admin');
    window.history.pushState({}, '', url.toString());
    setPageParam('admin');
    setActiveScreen('admin');
  };

  const goToMonitoringPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'monitoring');
    window.history.pushState({}, '', url.toString());
    setPageParam('monitoring');
    setActiveScreen('monitoring');
  };

  const goToStudentPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    window.history.pushState({}, '', url.toString());
    setPageParam('student');
    setActiveScreen('home');
  };

  // Global Automated Background Telegram Scheduler Runner
  // Strictly restricted to Admin / Supervisor sessions (or monitoring dashboards) to prevent individual student logins from triggering school-wide broadcasts
  useEffect(() => {
    if (!apiConfigured) return;

    // Only run the central automated scheduler & Telegram Bot updates processor
    // when an Admin/Supervisor is active (or on Admin/Monitoring screens).
    // Individual students should NEVER run school-wide schedulers or bot pollers on their devices.
    const isSupervisorOrAdmin = Boolean(student?.isAdmin || activeScreen === 'admin' || activeScreen === 'monitoring');
    if (!isSupervisorOrAdmin) return;

    let lastSettingsFetchTime = 0;

    const fetchLatestSettingsAndLiveState = async () => {
      // Only fetch from GAS after a student or admin is logged in, keeping the GAS queue 100% free and instant for loginUser and loginAdmin
      if (!student) return;

      try {
        const [settingsRes, liveRes, schedulesRes] = await Promise.all([
          callGasApi<any>('getAttendanceSettings').catch(() => null),
          student?.isAdmin ? callGasApi<any>('getLiveMonitoringData').catch(() => null) : Promise.resolve(null),
          callGasApi<any>('getAllStudentsSchedule').catch(() => null),
        ]);

        const lastSavedAt = Number(localStorage.getItem('attendance_settings_saved_at')) || 0;
        const isRecentlySavedLocally = (Date.now() - lastSavedAt < 90000);

        if (settingsRes && typeof settingsRes === 'object' && !isRecentlySavedLocally) {
          const s = (settingsRes as any).data?.settings || (settingsRes as any).settings || settingsRes;
          localStorage.setItem('attendance_settings_cached', JSON.stringify(s));
        }

        const liveData = (liveRes as any)?.data || liveRes;
        if (liveData) {
          if (Array.isArray(liveData.activeStudents)) {
            localStorage.setItem('live_active_students_cached', JSON.stringify(liveData.activeStudents));
          }
          if (Array.isArray(liveData.completedStudents)) {
            localStorage.setItem('live_completed_students_cached', JSON.stringify(liveData.completedStudents));
          }
          if (Array.isArray(liveData.loggedOutStudents)) {
            localStorage.setItem('live_logged_out_students_cached', JSON.stringify(liveData.loggedOutStudents));
          }
          if (Array.isArray(liveData.absentStudents)) {
            localStorage.setItem('live_absent_students_cached', JSON.stringify(liveData.absentStudents));
          }
          if (liveData.settings && !isRecentlySavedLocally) {
            localStorage.setItem('attendance_settings_cached', JSON.stringify(liveData.settings));
          }
        }

        if (Array.isArray(schedulesRes) && schedulesRes.length > 0) {
          const mergedSchedules = schedulesRes.map((sched: any) => {
            const sKey = (sched.studentId || '').toLowerCase().trim();
            let localTelegram: any = null;
            try {
              const raw = localStorage.getItem(`student_telegram_${sched.studentId}`);
              if (raw) localTelegram = JSON.parse(raw);
            } catch (e) {}

            let resSched = { ...sched };
            if (localTelegram && localTelegram.telegramChatId && !resSched.telegramChatId) {
              resSched.telegramChatId = localTelegram.telegramChatId;
              if (localTelegram.preferredLang) resSched.preferredLanguage = localTelegram.preferredLang;
              if (localTelegram.guardianPhone) resSched.guardianPhone = localTelegram.guardianPhone;
            }

            // Check if there is an individual student custom sched override
            try {
              const rawCustom = localStorage.getItem(`student_custom_sched_${sched.studentId}`);
              if (rawCustom) {
                const parsed = JSON.parse(rawCustom);
                resSched = { ...resSched, ...parsed };
              }
            } catch (e) {}

            return resSched;
          });
          localStorage.setItem('all_schedules_cached', JSON.stringify(mergedSchedules));
        }
      } catch (e) {}
    };

    const runAutomatedScheduler = async () => {
      try {
        let rawSettings = localStorage.getItem('attendance_settings_cached');
        const nowMs = Date.now();
        // Throttle GAS fetches to once every 3 minutes (180,000ms) when a user/admin is logged in
        if (student && (!rawSettings || nowMs - lastSettingsFetchTime > 180000)) {
          lastSettingsFetchTime = nowMs;
          await fetchLatestSettingsAndLiveState();
          rawSettings = localStorage.getItem('attendance_settings_cached');
        }
        if (!rawSettings) return;
        const settings = JSON.parse(rawSettings);
        if (!settings?.telegramToken || (settings?.telegramEnabled === false && !settings?.telegramToken)) return;

        // Collect all available student schedules (filtering out default templates or admin records)
        const schedules: any[] = [];
        const seenKeys = new Set<string>();

        const addStudentScheduleIfNew = (item: any) => {
          const sId = String(item.studentId || item.id || '').trim();
          const sName = String(item.studentName || item.name || '').trim();
          if (!sId || !isRealStudentRecord(sId, sName)) return;

          const normId = normalizeStudentIdForMatching(sId);
          const normName = normalizeArabicText(sName);
          const primaryKey = normId || normName || sId;

          if (seenKeys.has(primaryKey) || (normName && seenKeys.has(normName)) || (normId && seenKeys.has(normId))) {
            return;
          }

          seenKeys.add(primaryKey);
          if (normId) seenKeys.add(normId);
          if (normName) seenKeys.add(normName);

          const directChatInfo = resolveStudentTelegramChatId(sId, sName, item.telegramChatId);

          schedules.push({
            studentId: sId,
            studentName: sName || 'المشترك',
            customStartTime: item.customStartTime || settings.startTime || '19:00',
            customSessionDuration: item.customSessionDuration || settings.sessionDurationFromStart || 120,
            telegramChatId: directChatInfo.chatId || item.telegramChatId,
            preferredLanguage: directChatInfo.lang || item.preferredLanguage || 'ar',
            assignedTeacherId: item.assignedTeacherId,
          });
        };

        // 1. Check all_schedules_cached
        try {
          const cachedSchedulesRaw = localStorage.getItem('all_schedules_cached');
          if (cachedSchedulesRaw) {
            const parsedList = JSON.parse(cachedSchedulesRaw);
            if (Array.isArray(parsedList)) {
              for (const item of parsedList) {
                addStudentScheduleIfNew(item);
              }
            }
          }
        } catch (e) {}

        // 2. Check individual student_custom_sched_ keys in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('student_custom_sched_')) {
            try {
              const val = localStorage.getItem(key);
              if (val) {
                const parsed = JSON.parse(val);
                addStudentScheduleIfNew({
                  ...parsed,
                  studentId: parsed.studentId || key.replace('student_custom_sched_', ''),
                });
              }
            } catch (e) {}
          }
        }

        // 3. If currently logged-in student exists, ensure their schedule is evaluated
        if (student && !student.isAdmin) {
          const sId = student.id;
          const sName = student.name;
          if (sId && isRealStudentRecord(sId, sName)) {
            const rawSched = localStorage.getItem(`student_custom_sched_${sId}`) || localStorage.getItem(`student_custom_sched_${sName}`);
            const parsed = rawSched ? JSON.parse(rawSched) : {};
            addStudentScheduleIfNew({
              studentId: sId,
              studentName: sName,
              customStartTime: parsed.customStartTime || settings.startTime || '19:00',
              customSessionDuration: parsed.customSessionDuration || settings.sessionDurationFromStart || 120,
              telegramChatId: parsed.telegramChatId || (student as any).telegramChatId,
              preferredLanguage: parsed.preferredLanguage || (student as any).preferredLanguage || 'ar',
              assignedTeacherId: parsed.assignedTeacherId || (student as any).assignedTeacherId,
            });
          }
        }

        if (schedules.length > 0) {
          await checkAndDispatchAutomatedAlerts(schedules, settings);
        }

        // Real-time Telegram Bot updates processor (Responds instantly to تفاصيل, /menu, /results, /remaining, etc.)
        if (settings.telegramToken && settings.telegramToken.trim()) {
          try {
            const updatesRes = await syncTelegramSignups(settings.telegramToken);
            if (updatesRes && updatesRes.ok) {
              await processTelegramBotUpdates({
                token: settings.telegramToken,
                settings,
                allSchedules: schedules,
                signups: updatesRes.signups,
                plainStarts: updatesRes.plainStarts,
                idSubmissions: updatesRes.idSubmissions,
                callbackQueries: updatesRes.callbackQueries,
                onUpdateScheduleStudentTelegram: (studentId, telegramChatId, lang) => {
                  try {
                    const rawCached = localStorage.getItem('all_schedules_cached');
                    if (rawCached) {
                      const list = JSON.parse(rawCached);
                      const sKey = String(studentId).toLowerCase().trim();
                      const updated = list.map((s: any) =>
                        s.studentId === studentId || (s.studentId && String(s.studentId).toLowerCase().trim() === sKey)
                          ? { ...s, telegramChatId, preferredLanguage: lang || s.preferredLanguage || 'ar' }
                          : s
                      );
                      localStorage.setItem('all_schedules_cached', JSON.stringify(updated));
                    }
                  } catch (e) {}
                },
              });
            }
          } catch (botErr) {}
        }
      } catch (err) {}
    };

    runAutomatedScheduler();
    const interval = setInterval(runAutomatedScheduler, 4000); // Fast check every 4s for real-time responsiveness
    return () => clearInterval(interval);
  }, [apiConfigured, student, activeScreen]);

  const handleLogout = () => {
    // Notify server of logout if student
    if (student && !student.isAdmin && apiConfigured) {
      try {
        callGasApi('logStudentPresence', {
          studentId: student.id,
          studentName: student.name,
          actionType: 'logout',
        }).catch(() => {});

        // Send automated Telegram Exit Notification with multi-target fallback
        const cachedSettingsRaw = localStorage.getItem('attendance_settings_cached');
        const cachedSchedRaw = localStorage.getItem(`student_custom_sched_${student.id}`);
        if (cachedSettingsRaw) {
          try {
            const parsedSettings = JSON.parse(cachedSettingsRaw);
            const parsedSched = cachedSchedRaw ? JSON.parse(cachedSchedRaw) : null;
            const startTimeStr = parsedSched?.customStartTime || parsedSettings?.startTime || '19:00';
            const durationMins = parsedSched?.customSessionDuration || parsedSettings?.sessionDurationFromStart || 120;
            
            const [sh, sm] = startTimeStr.split(':').map(Number);
            const startTotal = (sh || 0) * 60 + (sm || 0);
            const endTotal = startTotal + durationMins;

            const now = new Date();
            const nowTotal = now.getHours() * 60 + now.getMinutes();
            const isEarlyExit = nowTotal < endTotal;
            const eventType = isEarlyExit ? 'earlyExit' : 'regularExit';

            dispatchAttendanceTelegramNotification({
              eventType,
              student: {
                id: student.id,
                name: student.name,
                telegramChatId: parsedSched?.telegramChatId || (student as any).telegramChatId,
                preferredLanguage: parsedSched?.preferredLanguage,
              },
              settings: parsedSettings,
              customSchedule: parsedSched,
              extraVars: {
                classTime: startTimeStr,
              },
            }).catch(() => {});
          } catch (err) {}
        }
      } catch (e) {}
    }

    if (student?.id) {
      const todayIsoStr = new Date().toISOString().split('T')[0];
      try {
        clearStudentActivePresence(student.id, student.name);
        
        // Thoroughly clear all student entry and event deduplication locks
        const keysToCleanLs: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.includes(student.id) || (student.name && k.includes(student.name)))) {
            if (
              k.startsWith('tg_entry_notified_') ||
              k.startsWith('tg_event_dispatched_') ||
              k.startsWith('student_present_') ||
              k.startsWith('punchin_') ||
              k.startsWith('attendance_punch_in_')
            ) {
              keysToCleanLs.push(k);
            }
          }
        }
        keysToCleanLs.forEach((k) => localStorage.removeItem(k));

        const keysToCleanSs: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && (k.includes(student.id) || (student.name && k.includes(student.name)))) {
            if (
              k.startsWith('tg_entry_notified_') ||
              k.startsWith('tg_event_dispatched_') ||
              k.startsWith('student_active_session_')
            ) {
              keysToCleanSs.push(k);
            }
          }
        }
        keysToCleanSs.forEach((k) => sessionStorage.removeItem(k));
      } catch (e) {}
    }

    localStorage.removeItem('studentName');
    localStorage.removeItem('studentId');
    sessionStorage.removeItem('studentName');
    sessionStorage.removeItem('studentId');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminRole');

    // Clean URL query parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('studentName');
    url.searchParams.delete('studentId');
    url.searchParams.delete('name');
    url.searchParams.delete('id');
    url.searchParams.delete('code');
    url.searchParams.delete('sName');
    url.searchParams.delete('sId');
    window.history.pushState({}, '', url.toString());

    setStudent(null);
    if (isAdminPage) {
      setActiveScreen('admin');
    } else {
      setActiveScreen('home');
    }
  };

  const handleLoginSuccess = (loggedInStudent: Student) => {
    setStudent(loggedInStudent);
    if (loggedInStudent.isAdmin) {
      goToAdminPage();
    } else {
      goToStudentPage();
    }
  };

  const handleOnboardingSuccess = () => {
    setApiConfigured(true);
    if (isAdminPage) {
      setActiveScreen('admin');
    } else {
      setActiveScreen('home');
    }
  };

  // Render setup screen if Sheet connection URL is missing or requested
  if (!apiConfigured || activeScreen === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Onboarding
          onSuccess={handleOnboardingSuccess}
          onBack={apiConfigured ? () => setActiveScreen(isAdminPage ? 'admin' : 'home') : undefined}
        />
      </div>
    );
  }

  // ==========================================
  // ROUTE 0: MONITORING PAGE (?page=monitoring)
  // ==========================================
  if (isMonitoringPage || activeScreen === 'monitoring') {
    return (
      <MonitoringDashboard
        onBackToAdmin={goToAdminPage}
        onGoToStudentHome={goToStudentPage}
      />
    );
  }

  // ==========================================
  // ROUTE 1: ADMIN PAGE (?page=admin)
  // ==========================================
  if (isAdminPage) {
    // If not logged in as Admin, show Admin Login
    if (!student || !student.isAdmin) {
      return (
        <LoginModal
          forcedMode="admin"
          onLoginSuccess={handleLoginSuccess}
          onOpenSettings={() => setActiveScreen('onboarding')}
          onGoToStudentPage={goToStudentPage}
        />
      );
    }

    // Admin Logged-In Dedicated View
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans" dir="rtl">
        {/* Admin Header */}
        <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  لوحة تحكم الإدارة والمسؤولين
                </h1>
                <p className="text-xs text-slate-400">
                  {generalData?.header.mainTitle || 'منصة الضاد التعليمية'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="minimal" />

              <div className="text-right hidden sm:block pl-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">{t('common.currentAdmin', 'المسؤول الحالي:')}</span>
                <span className="text-xs font-bold text-amber-400 block">{student.name}</span>
              </div>

              <button
                onClick={goToMonitoringPage}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                title="فتح لوحة المتابعة المباشرة الأونلاين"
              >
                <Activity className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>لوحة المتابعة المباشرة 🟢</span>
              </button>

              <button
                onClick={() => setActiveScreen('onboarding')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="إعدادات الربط بالشيت"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">إعدادات الاتصال</span>
              </button>

              <button
                onClick={goToStudentPage}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>صفحة الطلاب</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 p-2 rounded-xl transition"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
          <AdminDashboard
            onBackToHome={goToStudentPage}
            onOpenConnectionSettings={() => setActiveScreen('onboarding')}
          />
        </main>
      </div>
    );
  }

  // ==========================================
  // ROUTE 2: STUDENT PAGE (Standard URL)
  // ==========================================
  // Render student login if not authenticated or if an admin account is saved on student URL
  if (!student || student.isAdmin) {
    return (
      <LoginModal
        forcedMode="student"
        onLoginSuccess={handleLoginSuccess}
        onOpenSettings={() => setActiveScreen('onboarding')}
        onGoToAdminPage={goToAdminPage}
      />
    );
  }

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <HomeDashboard
            student={student}
            generalData={generalData}
            onSelectExercise={(type) => {
              if (type === ExerciseType.DRAWING) setActiveScreen('drawing');
              else if (type === ExerciseType.WORDS) setActiveScreen('words');
              else if (type === ExerciseType.MATCHING) setActiveScreen('matching');
            }}
            onNavigateTo={(screen) => setActiveScreen(screen)}
          />
        );
      case 'drawing':
        return (
          <ExerciseDrawing
            student={student}
            onBack={() => setActiveScreen('home')}
            onSelectExercise={(type) => {
              if (type === ExerciseType.DRAWING) setActiveScreen('drawing');
              else if (type === ExerciseType.WORDS) setActiveScreen('words');
              else if (type === ExerciseType.MATCHING) setActiveScreen('matching');
            }}
          />
        );
      case 'words':
        return (
          <ExerciseWords
            student={student}
            onBack={() => setActiveScreen('home')}
            onSelectExercise={(type) => {
              if (type === ExerciseType.DRAWING) setActiveScreen('drawing');
              else if (type === ExerciseType.WORDS) setActiveScreen('words');
              else if (type === ExerciseType.MATCHING) setActiveScreen('matching');
            }}
          />
        );
      case 'matching':
        return (
          <ExerciseMatching
            student={student}
            onBack={() => setActiveScreen('home')}
            onSelectExercise={(type) => {
              if (type === ExerciseType.DRAWING) setActiveScreen('drawing');
              else if (type === ExerciseType.WORDS) setActiveScreen('words');
              else if (type === ExerciseType.MATCHING) setActiveScreen('matching');
            }}
          />
        );
      case 'reports':
        return <ReportDashboard student={student} />;
      case 'about':
        return <About data={generalData} />;
      default:
        return <HomeDashboard student={student} generalData={generalData} onSelectExercise={() => {}} onNavigateTo={(screen) => setActiveScreen(screen)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans" dir="rtl">
      {/* Top Professional Navigation Bar (Student View) */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            {generalData?.header.logoUrl ? (
              <img
                src={generalData.header.logoUrl}
                alt="شعار"
                className="w-10 h-10 object-contain rounded-lg"
              />
            ) : (
              <div className="bg-amber-500 text-slate-950 font-extrabold w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md">
                ض
              </div>
            )}
            <div className="text-right">
              <span className="font-extrabold text-slate-900 tracking-tight text-base md:text-lg block font-sans">
                {generalData?.header.mainTitle || 'منصة الضاد التعليمية'}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">
                {generalData?.header.description || 'تعلم وممارسة مهارات اللغة العربية'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex flex-wrap items-center gap-1 text-sm font-bold text-slate-600">
            <button
              onClick={() => setActiveScreen('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeScreen === 'home' || activeScreen === 'drawing' || activeScreen === 'words' || activeScreen === 'matching'
                  ? 'bg-amber-50 text-amber-700'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              {t('common.home', 'الرئيسية')}
            </button>
            <button
              onClick={() => setActiveScreen('reports')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeScreen === 'reports'
                  ? 'bg-amber-50 text-amber-700'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {t('common.myGrades', 'درجاتي')}
            </button>
            <button
              onClick={() => setActiveScreen('about')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                activeScreen === 'about'
                  ? 'bg-amber-50 text-amber-700'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              {t('common.info', 'معلومات')}
            </button>

            {/* Dynamic buttons from Profile Sheet */}
            {generalData?.header.buttons?.map((btn, idx) => {
              if (!btn.buttonText || btn.buttonText === 'زر بدون نص' || btn.buttonUrl === '#' || btn.buttonUrl === '-') return null;
              
              const handleLaunch = () => {
                const url = btn.buttonUrl;
                if (!url) return;
                if (url.startsWith('http')) {
                  try {
                    const urlObj = new URL(url, window.location.href);
                    if (student?.name && student?.id) {
                      urlObj.searchParams.set('studentName', student.name);
                      urlObj.searchParams.set('studentId', student.id);
                      urlObj.searchParams.set('name', student.name);
                      urlObj.searchParams.set('id', student.id);
                      urlObj.searchParams.set('code', student.id);
                    }
                    window.open(urlObj.toString(), '_blank', 'noreferrer');
                  } catch (e) {
                    window.open(url, '_blank', 'noreferrer');
                  }
                } else if (url.startsWith('#')) {
                  setActiveScreen(url.substring(1));
                } else {
                  setActiveScreen(url);
                }
              };

              return (
                <button
                  key={`header-dyn-${idx}`}
                  onClick={handleLaunch}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  {btn.buttonText}
                </button>
              );
            })}
          </nav>

          {/* User profile & controls */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 font-bold block">{t('common.currentStudent', 'الطالب الحالي:')}</span>
              <span className="text-sm font-extrabold text-slate-900 block">{student.name}</span>
            </div>

            <div className="h-8 w-px bg-slate-100 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2.5 rounded-xl transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 md:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Mobile Navbar */}
      <footer className="md:hidden sticky bottom-0 bg-white border-t border-slate-100 py-3 px-4 z-40 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveScreen('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeScreen === 'home' || activeScreen === 'drawing' || activeScreen === 'words' || activeScreen === 'matching'
              ? 'text-amber-600'
              : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          {t('common.home', 'الرئيسية')}
        </button>
        <button
          onClick={() => setActiveScreen('reports')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeScreen === 'reports' ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          {t('common.myReportMobile', 'تقريري')}
        </button>
        <button
          onClick={() => setActiveScreen('about')}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold transition ${
            activeScreen === 'about' ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          {t('common.info', 'معلومات')}
        </button>
      </footer>
    </div>
  );
}
