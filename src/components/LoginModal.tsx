/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { callGasApi, getApiUrl, setApiUrl, resetApiUrlToDefault, DEFAULT_GAS_API_URL } from '../utils/api';
import { Student } from '../types';
import { User, Lock, Loader2, AlertCircle, Smartphone, ShieldAlert, QrCode, Camera, Upload, X, CheckCircle2, Sparkles, Globe, Settings, RefreshCw, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface LoginModalProps {
  onLoginSuccess: (student: Student) => void;
  onOpenSettings: () => void;
  forcedMode?: 'student' | 'admin';
  onGoToStudentPage?: () => void;
  onGoToAdminPage?: () => void;
  title?: string;
  subtitle?: string;
}

export default function LoginModal({
  onLoginSuccess,
  onOpenSettings,
  forcedMode,
  onGoToStudentPage,
  onGoToAdminPage,
  title,
  subtitle,
}: LoginModalProps) {
  const { t } = useLanguage();
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>(forcedMode || 'student');
  
  // Student fields
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  // Admin fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // GAS Server URL State
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  const [customGasUrl, setCustomGasUrl] = useState('');
  const [testingUrl, setTestingUrl] = useState(false);
  const [urlStatusMsg, setUrlStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (showUrlEditor) {
      setCustomGasUrl(getApiUrl());
    }
  }, [showUrlEditor]);

  const handleSaveAndTestUrl = async (urlToSave?: string) => {
    const target = (urlToSave !== undefined ? urlToSave : customGasUrl).trim();
    if (!target) {
      setUrlStatusMsg({ type: 'error', text: t('login.enterWebAppUrlFirst', 'يرجى إدخال رابط الـ Web App الخاص بك أولاً!') });
      return;
    }
    setTestingUrl(true);
    setUrlStatusMsg(null);
    try {
      setApiUrl(target);
      await callGasApi('getData', {}, { bypassCache: true, timeoutMs: 15000 });
      setUrlStatusMsg({ type: 'success', text: t('login.testConnectionSuccess', 'تم اختبار الاتصال بالخادم بنجاح! الرابط يعمل بامتياز.') });
      setError('');
      setTimeout(() => {
        setShowUrlEditor(false);
        setUrlStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      setUrlStatusMsg({ type: 'error', text: `${t('login.testConnectionFailed', 'فشل الاتصال بهذا الرابط:')} ${err.message}` });
    } finally {
      setTestingUrl(false);
    }
  };

  const handleResetUrlDefault = async () => {
    resetApiUrlToDefault();
    const defaultUrl = DEFAULT_GAS_API_URL;
    setCustomGasUrl(defaultUrl);
    await handleSaveAndTestUrl(defaultUrl);
  };

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [qrScanSuccessMsg, setQrScanSuccessMsg] = useState('');
  const [qrScanErrorMsg, setQrScanErrorMsg] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse QR Code content
  const handleDecodedQr = (decodedText: string) => {
    console.log('Decoded QR code:', decodedText);
    setError('');
    setQrScanErrorMsg('');

    let name = '';
    let id = '';

    const text = decodedText.trim();

    // Case 1: Pipe separated like "سليمان|1002"
    if (text.includes('|')) {
      const parts = text.split('|');
      name = parts[0]?.trim() || '';
      id = parts[1]?.trim() || '';
    } 
    // Case 2: URL query params like "http://...?studentName=سليمان&studentId=1002"
    else if (text.startsWith('http://') || text.startsWith('https://')) {
      try {
        const url = new URL(text);
        name =
          url.searchParams.get('studentName') ||
          url.searchParams.get('name') ||
          url.searchParams.get('student') ||
          url.searchParams.get('sName') ||
          '';
        id =
          url.searchParams.get('studentId') ||
          url.searchParams.get('id') ||
          url.searchParams.get('code') ||
          url.searchParams.get('sId') ||
          '';
      } catch (e) {
        console.warn('URL parse error:', e);
      }
    } 
    // Case 3: JSON string
    else if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const obj = JSON.parse(text);
        name = obj.name || obj.studentName || '';
        id = obj.id || obj.studentId || obj.code || '';
      } catch (e) {
        console.warn('JSON parse error:', e);
      }
    } 
    // Case 4: Comma or Colon separated
    else if (text.includes(',')) {
      const parts = text.split(',');
      name = parts[0]?.trim() || '';
      id = parts[1]?.trim() || '';
    } else if (text.includes(':')) {
      const parts = text.split(':');
      name = parts[0]?.trim() || '';
      id = parts[1]?.trim() || '';
    }

    if (name && id) {
      setStudentName(name);
      setStudentId(id);
      setQrScanSuccessMsg(`${t('login.qrReadSuccessPrefix', 'تمت قراءة البيانات بنجاح:')} ${name} (${id})`);
      
      stopCamera();

      setTimeout(() => {
        setShowQrModal(false);
        setQrScanSuccessMsg('');
      }, 1200);
    } else {
      setQrScanErrorMsg(`${t('login.qrFormatMismatch', 'رمز QR لا يطابق صيغة الطالب (اسم|رقم)')}: "${text}"`);
    }
  };

  const startCamera = async () => {
    setQrScanErrorMsg('');
    setQrScanSuccessMsg('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-container');
      }
      setIsScanningCamera(true);

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleDecodedQr(decodedText);
        },
        () => {
          // parse errors are normal while scanning
        }
      );
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setIsScanningCamera(false);
      setQrScanErrorMsg(t('login.cameraAccessError', 'تعذر الوصول للكاميرا. يرجى التأكد من إعطاء الإذن أو تجربة رفع صورة QR.'));
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
      setIsScanningCamera(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrScanErrorMsg('');
    setQrScanSuccessMsg('');

    try {
      const html5Qr = new Html5Qrcode('qr-reader-file-temp');
      const decodedText = await html5Qr.scanFile(file, true);
      handleDecodedQr(decodedText);
    } catch (err) {
      console.error('Error scanning file:', err);
      setQrScanErrorMsg(t('login.noQrFoundInImage', 'لم يتم العثور على كود QR واضح في الصورة المرفوقة. يرجى اختيار صورة أوضح.'));
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-login if parameters are present in the URL or stored in session
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pName =
      params.get('studentName') ||
      params.get('name') ||
      params.get('student') ||
      params.get('sName') ||
      params.get('user');
    const pId =
      params.get('studentId') ||
      params.get('id') ||
      params.get('code') ||
      params.get('sId') ||
      params.get('pass');

    if (pName && pId && loginMode === 'student') {
      const decodedName = decodeURIComponent(pName).trim();
      const decodedId = decodeURIComponent(pId).trim();
      localStorage.setItem('studentName', decodedName);
      localStorage.setItem('studentId', decodedId);
      sessionStorage.setItem('studentName', decodedName);
      sessionStorage.setItem('studentId', decodedId);
      onLoginSuccess({ name: decodedName, id: decodedId, isAdmin: false });
    }
  }, [loginMode, onLoginSuccess]);

  const generateDeviceId = (): string => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMode === 'student') {
      if (!studentName.trim() || !studentId.trim()) {
        setError(t('login.fillStudentNameAndId', 'يرجى إدخال اسم ورقم الطالب أولاً!'));
        return;
      }

      setLoading(true);
      const deviceId = generateDeviceId();

      // Fast non-blocking geolocation check (200ms max)
      let lat: number | null = null;
      let lng: number | null = null;

      if (navigator.geolocation) {
        try {
          const position = await Promise.race([
            new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 200, maximumAge: 300000 });
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Geo timeout')), 200))
          ]);
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (geoErr) {
          // Non-blocking geo check
        }
      }

      try {
        const response = await callGasApi<{
          success: boolean;
          name: string;
          id: string;
          telegramChatId?: string;
          preferredLanguage?: string;
          schedule?: any;
          message?: string;
        }>(
          'loginUser',
          {
            studentName: studentName.trim(),
            studentId: studentId.trim(),
            deviceId,
            lat,
            lng,
          }
        );

        if (response.success) {
          const student: Student = {
            name: response.name,
            id: response.id,
            isAdmin: false,
            telegramChatId: response.telegramChatId,
            preferredLanguage: response.preferredLanguage || 'ar',
          } as any;
          localStorage.setItem('studentName', response.name);
          localStorage.setItem('studentId', response.id);

          if (response.telegramChatId) {
            localStorage.setItem(`student_telegram_${response.id}`, JSON.stringify({
              telegramChatId: response.telegramChatId,
              preferredLanguage: response.preferredLanguage || 'ar'
            }));
            localStorage.setItem(`student_telegram_${response.name}`, JSON.stringify({
              telegramChatId: response.telegramChatId,
              preferredLanguage: response.preferredLanguage || 'ar'
            }));
          }

          if (response.schedule) {
            localStorage.setItem(`student_custom_sched_${response.id}`, JSON.stringify(response.schedule));
            localStorage.setItem(`student_custom_sched_${response.name}`, JSON.stringify(response.schedule));
          }

          onLoginSuccess(student);
        } else {
          setError(response.message || t('login.loginFailedCheckData', 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.'));
        }
      } catch (err: any) {
        setError(`${t('login.serverSheetError', 'خطأ في خادم الشيت:')} ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Admin Login
      if (!adminUsername.trim() || !adminPassword.trim()) {
        setError(t('login.fillAdminCredentials', 'يرجى إدخال اسم مستخدم الإدارة وكلمة المرور!'));
        return;
      }

      setLoading(true);

      try {
        const response = await callGasApi<{ success: boolean; username: string; role: string; message?: string }>(
          'loginAdmin',
          {
            username: adminUsername.trim(),
            password: adminPassword.trim(),
          }
        );

        if (response.success) {
          const student: Student = { name: response.username, id: 'admin', isAdmin: true };
          localStorage.setItem('studentName', response.username);
          localStorage.setItem('studentId', 'admin');
          sessionStorage.setItem('adminUser', response.username);
          sessionStorage.setItem('adminRole', response.role);
          onLoginSuccess(student);
        } else {
          setError(response.message || t('login.adminLoginInvalid', 'اسم المستخدم أو كلمة المرور غير صحيحة للإدارة.'));
        }
      } catch (err: any) {
        setError(`${t('login.serverSheetError', 'خطأ في خادم الشيت:')} ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper to ensure input scrolls into view smoothly above mobile virtual keyboard
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.target;
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 280);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 overflow-y-auto pt-4 pb-28 sm:py-8 overscroll-contain" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl sm:shadow-2xl overflow-visible max-w-md w-full p-4 sm:p-8 space-y-4 sm:space-y-6 relative my-auto"
      >
        {/* Header: Customized specifically for mobile (vertical stack: Icon -> Title -> Subtitle -> Language Switcher) while preserving Desktop/Tablet */}
        <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
          {/* Top Row for Desktop & Tablet ONLY (Language Switcher in corner) */}
          <div className="w-full hidden sm:flex justify-between items-center -mb-6">
            <div className="w-10 h-10" />
            <LanguageSwitcher variant="minimal" />
          </div>

          {/* 1. Icon (الأيقونة) */}
          <div className="inline-flex bg-amber-50 p-3.5 sm:p-4 rounded-full text-amber-500 shadow-xs">
            {loginMode === 'student' ? <User className="w-7 h-7 sm:w-8 sm:h-8" /> : <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-slate-800" />}
          </div>

          {/* 2. Main Title (العنوان الرئيسي) */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-tight px-1 leading-snug w-full">
            {title || (loginMode === 'student'
              ? t('login.studentPortalTitle', 'بوابة الطالب الذكية')
              : t('login.adminPortalTitle', 'بوابة المسؤولين والإدارة'))}
          </h1>

          {/* 3. Subtitle / Description (الوصف للعنوان) */}
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-md px-1">
            {subtitle || (loginMode === 'student' 
              ? t('login.studentSubtitle', 'يرجى تسجيل الدخول للبدء بالتمارين والاطلاع على تقريرك.')
              : t('login.adminSubtitle', 'قم بتسجيل الدخول للتحكم في الدروس والأسئلة وحسابات الطلاب.'))}
          </p>

          {/* 4. Language Switcher for Mobile ONLY (زر تغيير اللغة بالجوال تحته مباشرة) */}
          <div className="flex sm:hidden justify-center pt-1 pb-0.5">
            <LanguageSwitcher variant="minimal" />
          </div>
        </div>

        {/* Segmented control for login type (only if not forced to a single mode) */}
        {!forcedMode && (
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              type="button"
              onClick={() => { setLoginMode('student'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${loginMode === 'student' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {t('login.studentLoginTitle', 'تسجيل دخول الطلاب')}
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('admin'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${loginMode === 'admin' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {t('login.adminLoginTitle', 'بوابة الإدارة والتحكم')}
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <AnimatePresence mode="wait">
            {loginMode === 'student' ? (
              <motion.div
                key="student-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">{t('login.studentNameLabel', 'اسم الطالب كاملاً')}</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder={t('login.studentNamePlaceholder', 'اسم المستخدم مثل: أحمد محمد')}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition scroll-mt-16"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">{t('login.studentIdLabel', 'رقم الطالب (كود المرور)')}</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder={t('login.studentIdPlaceholder', 'الرقم التعريفي الخاص بك')}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-right scroll-mt-16"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQrModal(true);
                      setQrScanErrorMsg('');
                      setQrScanSuccessMsg('');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700 shadow-md active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>{t('login.scanQrCameraBtn', 'مسح بطاقة الطالب (QR Code) بالكاميرا')}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admin-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">{t('login.adminUsernameLabel', 'اسم مستخدم الإدارة')}</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder={t('login.adminUsernamePlaceholder', 'اسم مستخدم المدير (مثال: admin)')}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-left scroll-mt-16"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">{t('login.adminPasswordLabel', 'كلمة مرور المسؤول')}</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder={t('login.adminPasswordPlaceholder', 'كلمة المرور الخاصة بك')}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-left scroll-mt-16"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl text-xs space-y-2.5"
            >
              <div className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed font-bold">{error}</span>
              </div>
              {loginMode === 'admin' && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlEditor(true)}
                    className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-2.5 py-1.5 rounded-lg border border-rose-200 shadow-xs transition flex items-center gap-1.5 shrink-0"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('login.editGasServerUrl', 'تعديل رابط خادم الشيت')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetUrlDefault}
                    className="text-rose-700 hover:text-rose-900 hover:underline text-[11px] font-bold"
                  >
                    {t('login.resetDefaultUrl', 'إعادة الضبط للافتراضي')}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* GAS Server URL Drawer (Admin Only) */}
          <AnimatePresence>
            {showUrlEditor && loginMode === 'admin' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 text-slate-100 p-4 rounded-2xl space-y-3 text-xs border border-slate-800 shadow-xl overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Link2 className="w-4 h-4" />
                    <span>{t('login.gasServerUrlSetup', 'إعداد رابط خادم Google Apps Script')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlEditor(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {t('login.gasServerUrlDesc', 'إذا أظهر الخادم خطأ 404، يرجى لصق رابط الـ Web App الجديد المنسوخ من مشروع Google Apps Script الخاص بك:')}
                </p>

                <div className="space-y-1">
                  <input
                    type="url"
                    value={customGasUrl}
                    onChange={(e) => setCustomGasUrl(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full bg-slate-950 border border-slate-700 text-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-left scroll-mt-16"
                  />
                </div>

                {urlStatusMsg && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    urlStatusMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  }`}>
                    {urlStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{urlStatusMsg.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={testingUrl}
                    onClick={() => handleSaveAndTestUrl()}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    {testingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{t('login.saveAndTestConnection', 'حفظ واختبار الاتصال')}</span>
                  </button>
                  <button
                    type="button"
                    disabled={testingUrl}
                    onClick={handleResetUrlDefault}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1"
                    title={t('login.resetDefaultUrl', 'إعادة الضبط للرابط الافتراضي')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('login.defaultLabel', 'الافتراضي')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
              loginMode === 'student' 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-950/10'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('login.loggingIn', 'جاري تسجيل الدخول...')}
              </>
            ) : (
              t('login.loginSubmit', 'تسجيل الدخول')
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>{t('login.deviceProtectionActive', 'حماية الأجهزة مفعّلة')}</span>
            </div>
          </div>

          {forcedMode === 'admin' && onGoToStudentPage && (
            <button
              type="button"
              onClick={onGoToStudentPage}
              className="text-slate-500 hover:text-slate-900 font-bold text-center transition pt-1 border-t border-slate-50"
            >
              {t('login.goToStudentExercises', 'الذهاب إلى صفحة تمارين الطلاب ←')}
            </button>
          )}
        </div>
      </motion.div>

      {/* Hidden container for file-based QR scanning */}
      <div id="qr-reader-file-temp" className="hidden" />

      {/* QR Code Reader Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => {
              stopCamera();
              setShowQrModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{t('login.qrReaderTitle', 'قارئ بطاقة الطالب الذكية')}</h3>
                    <p className="text-xs text-slate-400">{t('login.qrReaderDesc', 'امسح كود QR الخاص بك للتسجيل التلقائي')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowQrModal(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Camera Scanner View Area */}
              <div className="space-y-3">
                <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-slate-700 flex flex-col items-center justify-center">
                  <div id="qr-reader-container" className="w-full h-full" />

                  {!isScanningCamera && !qrScanSuccessMsg && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3 bg-slate-950/90">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <Camera className="w-7 h-7" />
                      </div>
                      <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                        {t('login.qrInstruction', 'وجه كاميرا جهازك نحو كود QR المكتوب بالصيغة:')} <br />
                        <span className="font-mono text-amber-300 bg-slate-900 px-2 py-0.5 rounded dir-ltr inline-block mt-1">{t('login.nameNumberFormat', 'الاسم|الرقم')}</span>
                      </p>
                      <button
                        onClick={startCamera}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t('login.startCameraNow', 'تشغيل الكاميرا الآن')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Status & Messages */}
                {qrScanSuccessMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{qrScanSuccessMsg}</span>
                  </motion.div>
                )}

                {qrScanErrorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{qrScanErrorMsg}</span>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                {isScanningCamera ? (
                  <button
                    onClick={stopCamera}
                    className="bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-rose-200 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>{t('login.stopCamera', 'إيقاف الكاميرا')}</span>
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('login.liveCamera', 'الكاميرا المباشرة')}</span>
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{t('login.uploadQrImage', 'رفع صورة الـ QR')}</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
