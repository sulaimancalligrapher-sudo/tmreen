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
  
  // App routing state
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Initial check on mounting
  useEffect(() => {
    // Check if student is already saved in localStorage
    const savedName = localStorage.getItem('studentName');
    const savedId = localStorage.getItem('studentId');

    if (savedName && savedId) {
      const isAdmin = savedId === 'admin';
      setStudent({ name: savedName, id: savedId, isAdmin });
      if (isAdmin) {
        setActiveScreen('admin');
      }
    }

    if (apiConfigured) {
      fetchGeneralMetadata();
    }
  }, [apiConfigured]);

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
    setActiveScreen('home');
  };

  const handleLoginSuccess = (loggedInStudent: Student) => {
    setStudent(loggedInStudent);
    if (loggedInStudent.isAdmin) {
      setActiveScreen('admin');
    } else {
      setActiveScreen('home');
    }
  };

  const handleOnboardingSuccess = () => {
    setApiConfigured(true);
    setActiveScreen('home');
  };

  // Render setup screen if Sheet connection URL is missing
  if (!apiConfigured || activeScreen === 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Onboarding
          onSuccess={handleOnboardingSuccess}
          onBack={apiConfigured ? () => setActiveScreen('home') : undefined}
        />
      </div>
    );
  }

  // Render login screen if student is not authenticated
  if (!student) {
    return (
      <LoginModal
        onLoginSuccess={handleLoginSuccess}
        onOpenSettings={() => setActiveScreen('onboarding')}
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
      case 'admin':
        return (
          <AdminDashboard
            onBackToHome={() => setActiveScreen('home')}
            onOpenConnectionSettings={() => setActiveScreen('onboarding')}
          />
        );
      default:
        return <HomeDashboard student={student} generalData={generalData} onSelectExercise={() => {}} onNavigateTo={(screen) => setActiveScreen(screen)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans" dir="rtl">
      {/* Top Professional Navigation Bar */}
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

            {student?.isAdmin && (
              <button
                onClick={() => setActiveScreen('admin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition ${
                  activeScreen === 'admin'
                    ? 'bg-slate-950 text-amber-400 shadow-lg'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                لوحة الإدارة
              </button>
            )}
          </nav>

          {/* User profile & controls */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 font-bold block">
                {student.isAdmin ? 'المسؤول الحالي:' : 'الطالب الحالي:'}
              </span>
              <span className="text-sm font-extrabold text-slate-900 block">{student.name}</span>
            </div>

            <div className="h-8 w-px bg-slate-100 hidden sm:block" />

            {student.isAdmin && (
              <button
                onClick={() => setActiveScreen('onboarding')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition"
                title="إعدادات الاتصال بالشيت"
              >
                <Settings className="w-5 h-5 shrink-0" />
              </button>
            )}

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
        {student?.isAdmin ? (
          <button
            onClick={() => setActiveScreen('admin')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              activeScreen === 'admin' ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            لوحة الإدارة
          </button>
        ) : (
          <button
            onClick={() => setActiveScreen('reports')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
              activeScreen === 'reports' ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            تقريري
          </button>
        )}
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
