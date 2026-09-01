/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_OPTIONS, Language } from '../data/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LanguageSwitcherProps {
  variant?: 'header' | 'compact' | 'admin' | 'minimal';
}

export default function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { language, setLanguage, languageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-right dir-ltr" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition font-bold text-xs shadow-sm ${
          variant === 'admin'
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5'
            : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200 px-3 py-1.5 shadow'
        }`}
        title="تغيير اللغة / Select Language / เลือกภาษา"
      >
        <Globe className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
        <span className="text-base leading-none">{languageOption.flag}</span>
        <span className="font-bold">{languageOption.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1.5 w-48 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl p-1.5 z-50 space-y-1"
          >
            <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 text-center">
              اختر اللغة / Select Language
            </div>
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{opt.flag}</span>
                    <div className="text-right">
                      <div className="text-xs">{opt.nativeName}</div>
                      <div className="text-[10px] opacity-75 font-normal">{opt.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-300" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
