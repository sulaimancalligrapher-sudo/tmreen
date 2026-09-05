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
  variant?: 'header' | 'compact' | 'admin' | 'minimal' | 'iconOnly';
}

export default function LanguageSwitcher({ variant = 'header' }: LanguageSwitcherProps) {
  const { language, setLanguage, languageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [horizontalAlign, setHorizontalAlign] = useState<'right' | 'left'>('right');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownWidth = 200;
      const spaceOnRight = window.innerWidth - rect.left;
      const spaceOnLeft = rect.right;

      // If button is close to the right edge or not enough space on the right
      if (spaceOnRight < dropdownWidth) {
        setHorizontalAlign('right');
      } else if (spaceOnLeft < dropdownWidth) {
        setHorizontalAlign('left');
      } else {
        // Automatically position towards the screen center based on button location
        setHorizontalAlign(rect.left > window.innerWidth / 2 ? 'right' : 'left');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      return () => window.removeEventListener('resize', updateDropdownPosition);
    }
  }, [isOpen, languageOption.dir]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-center rounded-xl transition font-bold text-xs shadow-sm cursor-pointer ${
          variant === 'iconOnly'
            ? 'w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs'
            : variant === 'admin'
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 gap-2'
            : 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200 px-3 py-1.5 shadow gap-2'
        }`}
        title="تغيير اللغة / Select Language / เลือกภาษา"
      >
        {variant === 'iconOnly' ? (
          <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
        ) : (
          <>
            <Globe className="w-4 h-4 text-emerald-600 dark:text-amber-400 shrink-0" />
            <span className="text-base leading-none">{languageOption.flag}</span>
            <span className="font-bold">{languageOption.nativeName}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${horizontalAlign === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-48 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl p-1.5 z-50 space-y-1`}
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{opt.flag}</span>
                    <div className="text-right">
                      <div className="text-xs font-bold">{opt.nativeName}</div>
                      <div className="text-[10px] opacity-75 font-normal">{opt.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-300 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
