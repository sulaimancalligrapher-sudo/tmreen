/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student } from '../types';
import { User, Lock, Loader2, AlertCircle, Smartphone, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  onLoginSuccess: (student: Student) => void;
  onOpenSettings: () => void;
  forcedMode?: 'student' | 'admin';
  onGoToStudentPage?: () => void;
  onGoToAdminPage?: () => void;
}

export default function LoginModal({
  onLoginSuccess,
  onOpenSettings,
  forcedMode,
  onGoToStudentPage,
  onGoToAdminPage,
}: LoginModalProps) {
  const [loginMode, setLoginMode] = useState<'student' | 'admin'>(forcedMode || 'student');
  
  // Student fields
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  // Admin fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setError('يرجى إدخال اسم ورقم الطالب أولاً!');
        return;
      }

      setLoading(true);
      const deviceId = generateDeviceId();

      // Get user geolocation if available
      let lat: number | null = null;
      let lng: number | null = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (geoErr) {
          console.warn('Geolocation access denied or timed out.', geoErr);
        }
      }

      try {
        const response = await callGasApi<{ success: boolean; name: string; id: string; message?: string }>(
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
          const student: Student = { name: response.name, id: response.id, isAdmin: false };
          localStorage.setItem('studentName', response.name);
          localStorage.setItem('studentId', response.id);
          onLoginSuccess(student);
        } else {
          setError(response.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
        }
      } catch (err: any) {
        setError(`خطأ في خادم الشيت: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Admin Login
      if (!adminUsername.trim() || !adminPassword.trim()) {
        setError('يرجى إدخال اسم مستخدم الإدارة وكلمة المرور!');
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
          setError(response.message || 'اسم المستخدم أو كلمة المرور غير صحيحة للإدارة.');
        }
      } catch (err: any) {
        setError(`خطأ في خادم الشيت: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden max-w-md w-full p-8 space-y-6 relative"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex bg-amber-50 p-4 rounded-full text-amber-500 mb-2">
            {loginMode === 'student' ? <User className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 text-slate-800" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {loginMode === 'student' ? 'بوابة الطالب الذكية' : 'بوابة المسؤولين والإدارة'}
          </h1>
          <p className="text-slate-500 text-sm">
            {loginMode === 'student' 
              ? 'يرجى تسجيل الدخول للبدء بالتمارين والاطلاع على تقريرك.'
              : 'قم بتسجيل الدخول للتحكم في الدروس والأسئلة وحسابات الطلاب.'}
          </p>
        </div>

        {/* Segmented control for login type (only if not forced to a single mode) */}
        {!forcedMode && (
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              type="button"
              onClick={() => { setLoginMode('student'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${loginMode === 'student' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
              تسجيل دخول الطلاب
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('admin'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${loginMode === 'admin' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
              بوابة الإدارة والتحكم
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
                  <label className="text-xs font-bold text-slate-700 block mr-1">اسم الطالب كاملاً</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="اسم المستخدم مثل: أحمد محمد"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">رقم الطالب (كود المرور)</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="الرقم التعريفي الخاص بك"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-right"
                    />
                  </div>
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
                  <label className="text-xs font-bold text-slate-700 block mr-1">اسم مستخدم الإدارة</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="اسم مستخدم المدير (مثال: admin)"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block mr-1">كلمة مرور المسؤول</label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="كلمة المرور الخاصة بك"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-left"
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
              className="bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl text-xs flex gap-2 items-center"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

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
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-3 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>حماية الأجهزة مفعّلة</span>
            </div>
          </div>

          {forcedMode === 'admin' && onGoToStudentPage && (
            <button
              type="button"
              onClick={onGoToStudentPage}
              className="text-slate-500 hover:text-slate-900 font-bold text-center transition pt-1 border-t border-slate-50"
            >
              الذهاب إلى صفحة تمارين الطلاب ←
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
