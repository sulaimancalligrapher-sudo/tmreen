/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Gamepad2, MoveLeft, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExerciseType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ExerciseSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (type: ExerciseType) => void;
  currentExercise: ExerciseType;
}

export default function ExerciseSwitcherModal({
  isOpen,
  onClose,
  onSelectExercise,
  currentExercise,
}: ExerciseSwitcherModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 relative border border-slate-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="text-right space-y-1">
                <h3 className="text-xl font-black text-slate-900 font-sans flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-amber-500 fill-amber-500" />
                  {t('exercises.interactiveExercisesPortal', 'بوابة التمارين اللغوية والألعاب التفاعلية 🎮')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('exercises.interactiveExercisesPortalDesc', 'اختر نوع التمرين أو اللعبة التفاعلية المناسبة وابدأ في تحدي نفسك للحصول على العلامة الكاملة.')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition"
                title="إغلاق البوابة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bento Grid layout for exercises inside modal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Exercise 1: Drawing Calligraphy */}
              <motion.div
                whileHover={{ y: -4 }}
                className={`bg-slate-50 hover:bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer group ${
                  currentExercise === ExerciseType.DRAWING ? 'border-emerald-500/40 bg-emerald-50/10' : 'border-slate-100'
                }`}
                onClick={() => {
                  if (currentExercise !== ExerciseType.DRAWING) {
                    onSelectExercise(ExerciseType.DRAWING);
                  }
                  onClose();
                }}
              >
                <div className="space-y-4 text-right">
                  <div className={`p-3 rounded-xl w-fit transition ${
                    currentExercise === ExerciseType.DRAWING ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                  }`}>
                    ✍️
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {t('exercises.drawingExerciseTitle', 'تمرين محاكاة ورسم الخط')}
                      {currentExercise === ExerciseType.DRAWING && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-bold">{t('exercises.currentExerciseBadge', 'الحالي')}</span>
                      )}
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t('exercises.drawingExerciseCardDesc', 'لوحة رسم ذكية لمطابقة دقة يدك في كتابة الخطوط العربية المحددة واستخراج الدرجات والمكافآت الفورية.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-emerald-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                  <span>{currentExercise === ExerciseType.DRAWING ? t('exercises.youAreInThisExercise', 'أنت في هذا التمرين حالياً') : t('exercises.openDrawingExercise', 'افتح تمرين رسم الخط')}</span>
                  <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Exercise 2: Word ordering / Gap Filling */}
              <motion.div
                whileHover={{ y: -4 }}
                className={`bg-slate-50 hover:bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer group ${
                  currentExercise === ExerciseType.WORDS ? 'border-sky-500/40 bg-sky-50/10' : 'border-slate-100'
                }`}
                onClick={() => {
                  if (currentExercise !== ExerciseType.WORDS) {
                    onSelectExercise(ExerciseType.WORDS);
                  }
                  onClose();
                }}
              >
                <div className="space-y-4 text-right">
                  <div className={`p-3 rounded-xl w-fit transition ${
                    currentExercise === ExerciseType.WORDS ? 'bg-sky-100 text-sky-700' : 'bg-sky-50 text-sky-600 group-hover:bg-sky-100'
                  }`}>
                    🔤
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {t('exercises.wordsExerciseTitle', 'ترتيب الحروف وملء الفراغات')}
                      {currentExercise === ExerciseType.WORDS && (
                        <span className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-bold">{t('exercises.currentExerciseBadge', 'الحالي')}</span>
                      )}
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t('exercises.wordsExerciseCardDesc', 'اجمع الحروف لتكوين الكلمات، رتب الجمل اللغوية المبعثرة، واحلل المسابقات التفاعلية الممتعة.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sky-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                  <span>{currentExercise === ExerciseType.WORDS ? t('exercises.youAreInThisExercise', 'أنت في هذا التمرين حالياً') : t('exercises.openWordsExercise', 'افتح تمارين الكلمات')}</span>
                  <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </motion.div>

              {/* Exercise 3: Line matching */}
              <motion.div
                whileHover={{ y: -4 }}
                className={`bg-slate-50 hover:bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer group ${
                  currentExercise === ExerciseType.MATCHING ? 'border-amber-500/40 bg-amber-50/10' : 'border-slate-100'
                }`}
                onClick={() => {
                  if (currentExercise !== ExerciseType.MATCHING) {
                    onSelectExercise(ExerciseType.MATCHING);
                  }
                  onClose();
                }}
              >
                <div className="space-y-4 text-right">
                  <div className={`p-3 rounded-xl w-fit transition ${
                    currentExercise === ExerciseType.MATCHING ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                  }`}>
                    🔗
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {t('exercises.matchingExerciseTitle', 'تمرين التوصيل والمطابقة')}
                      {currentExercise === ExerciseType.MATCHING && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold">{t('exercises.currentExerciseBadge', 'الحالي')}</span>
                      )}
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t('exercises.matchingExerciseCardDesc', 'ارسم خطوط تواصل تفاعلية جميلة ومطابقة الكلمات اللغوية بنظيرتها الصوتية المسجلة أو الصورة المناسبة.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-amber-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                  <span>{currentExercise === ExerciseType.MATCHING ? t('exercises.youAreInThisExercise', 'أنت في هذا التمرين حالياً') : t('exercises.openMatchingExercise', 'افتح تمرين التوصيل')}</span>
                  <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </motion.div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
