import { APPS_SCRIPT_CODE } from "../data/appsScriptCode";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { callGasApi, setApiUrl, getApiUrl, resetApiUrlToDefault, DEFAULT_GAS_API_URL } from '../utils/api';
import { Database, Key, CheckCircle, Copy, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onSuccess: () => void;
  onBack?: () => void;
  showBackOnly?: boolean;
}

export default function Onboarding({ onSuccess, onBack, showBackOnly = false }: OnboardingProps) {
  const [url, setUrl] = useState(getApiUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTestConnection = async () => {
    if (!url.trim().startsWith('https://script.google.com/')) {
      setTestResult({
        success: false,
        message: 'رابط غير صالح! يجب أن يبدأ الرابط بـ https://script.google.com/',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    setApiUrl(url);

    try {
      // Test the URL with a dummy action like getData
      await callGasApi('getData');
      setTestResult({
        success: true,
        message: 'تم الاتصال بقاعدة البيانات بنجاح! الرابط صالح للعمل.',
      });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `فشل الاتصال: تأكد من نشر الـ Web App وتعيين الوصول لـ "Anyone" (أي شخص).\nتفاصيل الخطأ: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveOnly = () => {
    setApiUrl(url);
    onSuccess();
  };

  const copyAppsScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
      >
        <div className="bg-slate-900 p-6 md:p-10 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-sans">
                  إعدادات الربط والاتصال
                </h1>
                <p className="text-slate-400 text-sm md:text-base mt-1">
                  ربط المنصة التعليمية بقاعدة بيانات Google Sheets بشكل مجاني وآمن بالكامل.
                </p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* Main Input Form */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              رابط خدمة الويب (Apps Script URL)
            </h2>
            <p className="text-sm text-slate-600">
              أدخل رابط الـ Web App الذي حصلت عليه بعد نشر الكود في بيئة Google Apps Script:
            </p>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                dir="ltr"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !url.trim()}
                  className="bg-slate-950 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2 min-w-[130px]"
                >
                  {testing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الفحص...
                    </>
                  ) : (
                    'فحص الاتصال'
                  )}
                </button>
                <button
                  onClick={handleSaveOnly}
                  disabled={!url.trim()}
                  className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition"
                >
                  حفظ فقط
                </button>
                <button
                  onClick={() => {
                    resetApiUrlToDefault();
                    setUrl(getApiUrl());
                    setTestResult({
                      success: true,
                      message: 'تم استعادة الرابط الافتراضي بنجاح.'
                    });
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-3 rounded-xl transition flex items-center gap-1 text-xs"
                  title="استعادة الرابط الافتراضي المعتمد"
                >
                  <RotateCcw className="w-4 h-4" />
                  الافتراضي
                </button>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-xs text-amber-900 leading-relaxed font-sans space-y-1">
              <span className="font-bold block text-amber-950">💡 نصيحة للتشغيل التلقائي على جميع الأجهزة (Vercel):</span>
              <p>
                لكي يفتح الموقع مباشرة على كافة الجوالات والأجهزة دون مطالبات بإدخال الرابط، يمكنك وضع متغيّر البيئة <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">VITE_GAS_API_URL</code> برابط الـ Apps Script في إعدادات مشروعك بـ Vercel، أو تحديث قيمة <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">DEFAULT_GAS_API_URL</code> داخل ملف <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">src/utils/api.ts</code>.
              </p>
            </div>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm flex gap-2.5 items-start ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
                <span className="whitespace-pre-line leading-relaxed">{testResult.message}</span>
              </motion.div>
            )}
          </div>

          {/* Guide / Tutorial */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              خطوات تهيئة الاتصال خطوة بخطوة 🚀
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700">
              <div className="space-y-2.5">
                <div className="bg-slate-900 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shadow">
                  1
                </div>
                <h3 className="font-bold text-slate-900">إنشاء مشروع Apps Script</h3>
                <p className="leading-relaxed">
                  افتح جدول البيانات (Google Sheet) الخاص بك، واضغط على <strong>Extensions</strong> ثم <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-900 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shadow">
                  2
                </div>
                <h3 className="font-bold text-slate-900">لصق وحفظ كود الاتصال</h3>
                <p className="leading-relaxed">
                  احذف جميع الأكواد الموجودة والصق كود الـ Apps Script الموحد بالأسفل، ثم احفظ المشروع.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-900 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shadow">
                  3
                </div>
                <h3 className="font-bold text-slate-900">نشر كـ Web App</h3>
                <p className="leading-relaxed">
                  اضغط على <strong>Deploy</strong> ثم <strong>New Deployment</strong>. اختر <strong>Web App</strong>. اضبط الوصول إلى <strong>Anyone</strong> واضغط <strong>Deploy</strong>، ثم انسخ الرابط والصقه بالأعلى.
                </p>
              </div>
            </div>
          </div>

          {/* Code Showcase Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                كود Google Apps Script الموحد (`Code.gs`)
              </h3>
              <button
                onClick={copyAppsScriptCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ!' : 'نسخ الكود بالكامل'}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-950">
              <pre className="p-4 overflow-x-auto text-left text-xs font-mono text-slate-300 max-h-[300px] leading-relaxed">
                {APPS_SCRIPT_CODE}
              </pre>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
