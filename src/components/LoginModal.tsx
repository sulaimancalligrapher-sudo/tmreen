/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student } from '../types';
import { User, Lock, Loader2, AlertCircle, MapPin, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginModalProps {
  onLoginSuccess: (student: Student) => void;
  onOpenSettings: () => void;
}

export default function LoginModal({ onLoginSuccess, onOpenSettings }: LoginModalProps) {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
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
    if (!studentName.trim() || !studentId.trim()) {
      setError('يرجى إدخال اسم ورقم الطالب أولاً!');
      return;
    }

    setLoading(true);
    setError('');

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
        const student: Student = { name: response.name, id: response.id };
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
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">بوابة الطالب الذكية</h1>
          <p className="text-slate-500 text-sm">
            يرجى تسجيل الدخول للبدء بالتمارين والاطلاع على تقريرك.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span>حماية الأجهزة مفعلة</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-amber-600 hover:text-amber-500 font-bold transition decoration-dotted underline underline-offset-4"
          >
            إعدادات الربط بالشيت
          </button>
        </div>
      </motion.div>
    </div>
  );
}
