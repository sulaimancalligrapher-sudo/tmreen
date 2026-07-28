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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [apiConfigured, setApiConfigured] = useState<boolean>(isApiConfigured());
  const [student, setStudent] = useState<Student | null>(null);
  const [generalData, setGeneralData] = useState<GeneralData | null>(null);
  
  // URL routing state: check if URL query has ?page=admin
  const [isAdminPage, setIsAdminPage] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'admin';
  });

  // App routing state
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Handle browser back/forward or popstate URL changes
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const isParamAdmin = params.get('page') === 'admin';
      setIsAdminPage(isParamAdmin);
      if (isParamAdmin) {
        setActiveScreen('admin');
      } else if (activeScreen === 'admin') {
        setActiveScreen('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeScreen]);

  // Initial check on mounting
  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    const savedId = localStorage.getItem('studentId');

    if (savedName && savedId) {
      const isAdmin = savedId === 'admin';
      setStudent({ name: savedName, id: savedId, isAdmin });
      if (isAdmin || isAdminPage) {
        setActiveScreen('admin');
      }
    }

    if (apiConfigured) {
      fetchGeneralMetadata();
    }
  }, [apiConfigured]);

  const goToAdminPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'admin');
    window.history.pushState({}, '', url.toString());
    setIsAdminPage(true);
    setActiveScreen('admin');
  };

  const goToStudentPage = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    window.history.pushState({}, '', url.toString());
    setIsAdminPage(false);
    setActiveScreen('home');
  };

  const fetchGeneralMetadata = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await callGasApi<GeneralData>('getData');
      setGeneralData(data);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل بيانات التكوين والملف التعريفي من الشيت.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentId');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminRole');
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
              <div className="text-right hidden sm:block pl-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">المسؤول الحالي:</span>
                <span className="text-xs font-bold text-amber-400 block">{student.name}</span>
              </div>

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
              الرئيسية
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
              درجاتي
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
              معلومات
            </button>

            {/* Dynamic buttons from Profile Sheet */}
            {generalData?.header.buttons?.map((btn, idx) => {
              if (!btn.buttonText || btn.buttonText === 'زر بدون نص' || btn.buttonUrl === '#' || btn.buttonUrl === '-') return null;
              
              const handleLaunch = () => {
                const url = btn.buttonUrl;
                if (!url) return;
                if (url.startsWith('http')) {
                  window.open(url, '_blank', 'noreferrer');
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
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 font-bold block">الطالب الحالي:</span>
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
          الرئيسية
        </button>
        <button
          onClick={() => setActiveScreen('reports')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeScreen === 'reports' ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          تقريري
        </button>
        <button
          onClick={() => setActiveScreen('about')}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold transition ${
            activeScreen === 'about' ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          معلومات
        </button>
      </footer>
    </div>
  );
}
