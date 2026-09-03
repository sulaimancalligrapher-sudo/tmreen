/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TranslationDictionary, defaultTranslations } from '../data/translations';
import {
  Globe,
  Save,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminTranslationManager() {
  const { translationsDict, updateTranslationsDict, resetTranslationsDict, t } = useLanguage();

  const SECTION_INFO: Record<string, { labelAr: string; icon: string }> = {
    attendance: { labelAr: '⏱️ تسجيل الحضور والجلسات الحية (attendance)', icon: '⏱️' },
    home: { labelAr: '🏠 الصفحة الرئيسية ولوحة الطالب (home)', icon: '🏠' },
    exercises: { labelAr: '✏️ التمارين والأنشطة والمهام (exercises)', icon: '✏️' },
    telegram: { labelAr: '📢 إشعارات ورسائل تليجرام (telegram)', icon: '📢' },
    monitoring: { labelAr: '📡 المتابعة اللحظية للكشف (monitoring)', icon: '📡' },
    reports: { labelAr: '📊 التقارير ومتابعة الإنجاز (reports)', icon: '📊' },
    admin: { labelAr: '⚙️ لوحة الإدارة والمعلم (admin)', icon: '⚙️' },
    auth: { labelAr: '🔐 تسجيل الدخول والمصادقة (auth)', icon: '🔐' },
    common: { labelAr: '🌐 الكلمات العامة والأزرار (common)', icon: '🌐' },
  };

  // Working local state of translations for editing (merged with defaultTranslations to ensure all keys exist)
  const [editedDict, setEditedDict] = useState<TranslationDictionary>(() => {
    const base: TranslationDictionary = JSON.parse(JSON.stringify(defaultTranslations));
    const current = translationsDict || {};
    Object.keys(current).forEach((sec) => {
      if (!base[sec]) base[sec] = {};
      Object.keys(current[sec] || {}).forEach((k) => {
        base[sec][k] = { ...base[sec][k], ...current[sec][k] };
      });
    });
    return base;
  });
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');

  // Add new translation item state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSection, setNewSection] = useState<string>('common');
  const [newKey, setNewKey] = useState<string>('');
  const [newAr, setNewAr] = useState<string>('');
  const [newEn, setNewEn] = useState<string>('');
  const [newTh, setNewTh] = useState<string>('');

  const sectionsList = ['all', ...Object.keys(editedDict)];

  const handleFieldChange = (section: string, key: string, lang: 'ar' | 'en' | 'th', value: string) => {
    setEditedDict((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[section]) next[section] = {};
      if (!next[section][key]) next[section][key] = { ar: '', en: '', th: '' };
      next[section][key][lang] = value;
      return next;
    });
  };

  const handleSaveAll = () => {
    updateTranslationsDict(editedDict);
    setSaveSuccessMsg(t('admin.translationSavedSuccess', 'تم حفظ تعديلات النصوص والترجمة بنجاح!'));
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل أنت تأكد من رغبتك في استعادة جميع النصوص الافتراضية للنظام؟')) {
      resetTranslationsDict();
      setEditedDict(JSON.parse(JSON.stringify(defaultTranslations)));
      setResetSuccessMsg(t('admin.translationResetSuccess', 'تمت إعادة القاموس إلى النصوص الافتراضية.'));
      setTimeout(() => setResetSuccessMsg(''), 3000);
    }
  };

  const handleAddNewKey = () => {
    if (!newKey.trim()) return;
    const cleanKey = newKey.trim().replace(/\s+/g, '_');
    
    setEditedDict((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[newSection]) next[newSection] = {};
      next[newSection][cleanKey] = {
        ar: newAr || cleanKey,
        en: newEn || cleanKey,
        th: newTh || cleanKey,
      };
      return next;
    });

    setNewKey('');
    setNewAr('');
    setNewEn('');
    setNewTh('');
    setShowAddModal(false);
  };

  const handleDeleteKey = (section: string, key: string) => {
    if (window.confirm(`هل تريد حذف المفتاح ${section}.${key}؟`)) {
      setEditedDict((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        if (next[section] && next[section][key]) {
          delete next[section][key];
        }
        return next;
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editedDict, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `translations_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed === 'object') {
          setEditedDict(parsed);
          updateTranslationsDict(parsed);
          alert('تم استيراد ملف القاموس والترجمة بنجاح!');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON الخاص بالترجمة.');
      }
    };
    reader.readAsText(file);
  };

  // Filter items
  const filteredRows: Array<{ section: string; key: string; ar: string; en: string; th: string }> = [];

  Object.keys(editedDict).forEach((sec) => {
    if (selectedSection !== 'all' && selectedSection !== sec) return;

    Object.keys(editedDict[sec]).forEach((k) => {
      const item = editedDict[sec][k];
      const search = searchTerm.toLowerCase();

      const secInfo = SECTION_INFO[sec]?.labelAr || '';
      const matchKey = k.toLowerCase().includes(search) || sec.toLowerCase().includes(search) || secInfo.toLowerCase().includes(search);
      const matchAr = (item.ar || '').toLowerCase().includes(search);
      const matchEn = (item.en || '').toLowerCase().includes(search);
      const matchTh = (item.th || '').toLowerCase().includes(search);

      if (!search || matchKey || matchAr || matchEn || matchTh) {
        filteredRows.push({
          section: sec,
          key: k,
          ar: item.ar || '',
          en: item.en || '',
          th: item.th || '',
        });
      }
    });
  });

  return (
    <div className="space-y-6 text-right">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-2xl border border-amber-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                <span>{t('admin.tabTranslations', 'إدارة اللغات والنصوص (i18n)')}</span>
                <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  🇸🇦 🇬🇧 🇹🇭 3 Languages
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {t('admin.translationManagerSubtitle', 'تعديل جميع النصوص والرسائل في النظام للغات الثلاث (العربية، الإنجليزية، التايلاندية)')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSaveAll}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{t('admin.saveTranslationsBtn', 'حفظ التعديلات على اللغات')}</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95"
            title="إعادة النصوص الافتراضية"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.resetTranslationsBtn', 'إعادة الافتراضي')}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة نص جديد</span>
          </button>

          <button
            onClick={handleExportJson}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl text-xs transition border border-slate-700 active:scale-95"
            title="تصدير ملف القاموس JSON"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>

          <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl text-xs transition border border-slate-700 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4 text-emerald-400" />
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Success Messages */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </motion.div>
        )}

        {resetSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-amber-500/20 border border-amber-500/40 text-amber-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{resetSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-bold whitespace-nowrap">
              {t('admin.sectionFilter', 'تصفية حسب القسم:')}
            </span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 outline-none focus:border-indigo-500 transition max-w-xs"
            >
              <option value="all">🌟 {t('admin.allSections', 'جميع الأقسام')}</option>
              {Object.keys(editedDict).map((sec) => (
                <option key={sec} value={sec}>
                  {SECTION_INFO[sec]?.labelAr || sec}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.searchKeyPlaceholder', 'ابحث عن نص أو كلمة (مثل: حضور، يلزم، وقت)...')}
              className="w-full bg-slate-800 text-white text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-700 outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="w-full flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-bold ml-1">أقسام سريعة:</span>
          <button
            type="button"
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedSection === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            جميع الأقسام
          </button>
          {Object.keys(editedDict).map((sec) => {
            const info = SECTION_INFO[sec] || { labelAr: sec, icon: '📁' };
            const count = Object.keys(editedDict[sec] || {}).length;
            const isSelected = selectedSection === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.labelAr.split(' ')[1] || sec}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-900/20 text-slate-950 font-black' : 'bg-slate-700 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Translation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-1/6">القسم والمفتاح (Section.Key)</th>
                <th className="p-3.5 w-1/4 text-emerald-400">🇸🇦 العربية (Arabic)</th>
                <th className="p-3.5 w-1/4 text-cyan-400">🇬🇧 الإنجليزية (English)</th>
                <th className="p-3.5 w-1/4 text-amber-400">🇹🇭 التايلاندية (Thai)</th>
                <th className="p-3.5 w-12 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                    لم يتم العثور على أية نصوص تطابق البحث.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={`${row.section}.${row.key}`} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-mono text-[11px] text-slate-400 dir-ltr text-left">
                      <span className="text-amber-300 font-bold">{row.section}</span>.{row.key}
                    </td>

                    {/* Arabic Input */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={row.ar}
                        onChange={(e) => handleFieldChange(row.section, row.key, 'ar', e.target.value)}
                        className="w-full bg-slate-950 text-emerald-300 text-xs font-bold rounded-xl p-2 border border-slate-800 focus:border-emerald-500 outline-none transition resize-y"
                      />
                    </td>

                    {/* English Input */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={row.en}
                        onChange={(e) => handleFieldChange(row.section, row.key, 'en', e.target.value)}
                        className="w-full bg-slate-950 text-cyan-300 text-xs rounded-xl p-2 border border-slate-800 focus:border-cyan-500 outline-none transition resize-y dir-ltr"
                      />
                    </td>

                    {/* Thai Input */}
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={row.th}
                        onChange={(e) => handleFieldChange(row.section, row.key, 'th', e.target.value)}
                        className="w-full bg-slate-950 text-amber-300 text-xs rounded-xl p-2 border border-slate-800 focus:border-amber-500 outline-none transition resize-y dir-ltr"
                      />
                    </td>

                    {/* Delete action */}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleDeleteKey(row.section, row.key)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition"
                        title="حذف هذا النص"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Key Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>إضافة مفتاح نص جديد للنظام</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">القسم (Section):</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800"
                  >
                    {Object.keys(editedDict).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">اسم المفتاح بالإنكليزية (e.g. newButtonTitle):</label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="myCustomLabel"
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 font-mono text-xs dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 mb-1">النص العربي 🇸🇦:</label>
                  <input
                    type="text"
                    value={newAr}
                    onChange={(e) => setNewAr(e.target.value)}
                    placeholder="النص بالعربية..."
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 mb-1">النص الإنكليزي 🇬🇧:</label>
                  <input
                    type="text"
                    value={newEn}
                    onChange={(e) => setNewEn(e.target.value)}
                    placeholder="English text..."
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 mb-1">النص التايلاندي 🇹🇭:</label>
                  <input
                    type="text"
                    value={newTh}
                    onChange={(e) => setNewTh(e.target.value)}
                    placeholder="ข้อความภาษาไทย..."
                    className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 dir-ltr"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddNewKey}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow"
                >
                  إضافة الآن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
