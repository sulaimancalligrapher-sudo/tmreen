/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Save, Loader2, CheckCircle2, Sliders } from 'lucide-react';

export interface StudentSchedule {
  studentId: string;
  studentName: string;
  startDate: string;
  activeDays: string;
  lessonsPerWeek: string; // This represents lessons per active day in the new logic
  daysToKeep?: string;
  expiryDate?: string;
  examOverrides?: string;
}

interface StudentScheduleCardProps {
  schedule: StudentSchedule;
  defaultSchedule?: StudentSchedule;
  onSave: (studentId: string, startDate: string, activeDays: string, lessonsPerWeek: string, daysToKeep: string, expiryDate: string) => Promise<void>;
  onOpenExamOverrides?: (schedule: StudentSchedule) => void;
  isSaving: boolean;
  key?: React.Key;
}

export default function StudentScheduleCard({ schedule, defaultSchedule, onSave, onOpenExamOverrides, isSaving }: StudentScheduleCardProps) {
  const [startDate, setStartDate] = useState(schedule.startDate || '');
  const [activeDays, setActiveDays] = useState(schedule.activeDays || '');
  const [lessonsPerWeek, setLessonsPerWeek] = useState(schedule.lessonsPerWeek || '3');
  const [daysToKeep, setDaysToKeep] = useState(schedule.daysToKeep || '');
  const [expiryDate, setExpiryDate] = useState(schedule.expiryDate || '');
  const [isChanged, setIsChanged] = useState(false);

  // Sync state if props change (e.g. after successful save)
  useEffect(() => {
    setStartDate(schedule.startDate || '');
    setActiveDays(schedule.activeDays || '');
    setLessonsPerWeek(schedule.lessonsPerWeek || '3');
    setDaysToKeep(schedule.daysToKeep || '');
    setExpiryDate(schedule.expiryDate || '');
    setIsChanged(false);
  }, [schedule]);

  const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const getSelectedDaysList = () => {
    if (!activeDays) return [];
    return activeDays.split(/[,،]/).map(d => d.trim()).filter(Boolean);
  };

  const toggleDay = (day: string) => {
    const selected = getSelectedDaysList();
    let newSelected: string[];
    if (selected.includes(day)) {
      newSelected = selected.filter(d => d !== day);
    } else {
      // Keep order of standard week
      newSelected = daysOfWeek.filter(d => selected.includes(d) || d === day);
    }
    setActiveDays(newSelected.join(', '));
    setIsChanged(true);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setIsChanged(true);
  };

  const handleLessonsChange = (val: number) => {
    if (val < 1) return;
    setLessonsPerWeek(val.toString());
    setIsChanged(true);
  };

  const handleSave = async () => {
    await onSave(schedule.studentId, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate);
    setIsChanged(false);
  };

  const selectedDays = getSelectedDaysList();
  const isDefaultConfig = schedule.studentId === 'DEFAULT_STUDENT';

  return (
    <div 
      id={`student-schedule-card-${schedule.studentId}`} 
      className={`p-5 border rounded-3xl bg-white shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 ${
        isDefaultConfig 
          ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/20 to-white' 
          : 'border-slate-100'
      }`}
    >
      {/* Student Info Header */}
      <div className="flex items-start justify-between">
        <div className="text-right">
          <h3 className="font-bold text-slate-800 text-base">{schedule.studentName}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {isDefaultConfig ? 'سيتم تطبيق هذه الجدولة تلقائياً على أي طالب لم يتم تحديد جدولة خاصة له' : `رقم الطالب: ${schedule.studentId}`}
          </p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
          isDefaultConfig 
            ? 'bg-indigo-100 text-indigo-700' 
            : startDate 
            ? 'bg-emerald-50 text-emerald-600' 
            : 'bg-amber-50 text-amber-600'
        }`}>
          {isDefaultConfig ? 'الإعدادات العامة للجميع' : startDate ? 'جدولة مخصصة' : 'يتبع الإعدادات الافتراضية'}
        </span>
      </div>

      <div className="border-t border-slate-50 my-2"></div>

      {/* Settings Grid */}
      <div className="space-y-4 text-right">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-end gap-1">
            <span>تاريخ بدء الدراسة</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-right"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            {isDefaultConfig 
              ? 'تاريخ بدء الدراسة الافتراضي لجميع الطلاب' 
              : startDate 
              ? 'تاريخ بدء الدراسة المخصص لهذا الطالب' 
              : `الافتراضي الحالي للكل: ${defaultSchedule?.startDate || 'غير محدد'}`
            }
          </p>
        </div>

        {/* Active Days */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-end gap-1">
            <span>أيام الدراسة النشطة</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
          </label>
          {/* Day Toggles */}
          <div className="flex flex-wrap gap-1 justify-end mb-2">
            {daysOfWeek.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-900 border-amber-500'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="السبت، الأحد..."
            value={activeDays}
            onChange={(e) => {
              setActiveDays(e.target.value);
              setIsChanged(true);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-right"
          />
          {!isDefaultConfig && !activeDays && (
            <p className="text-[10px] text-amber-600 mt-1">
              الافتراضي الحالي للكل: {defaultSchedule?.activeDays || 'كل الأيام'}
            </p>
          )}
        </div>

        {/* Lessons Per Day */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleLessonsChange(parseInt(lessonsPerWeek || '3') - 1)}
                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition"
              >
                -
              </button>
              <input
                type="text"
                value={lessonsPerWeek}
                onChange={(e) => {
                  setLessonsPerWeek(e.target.value);
                  setIsChanged(true);
                }}
                placeholder={isDefaultConfig ? '3' : defaultSchedule?.lessonsPerWeek || '3'}
                className="w-10 text-center text-xs font-mono font-bold text-slate-800 bg-transparent border-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleLessonsChange(parseInt(lessonsPerWeek || '3') + 1)}
                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition"
              >
                +
              </button>
            </div>
            <span className="text-xs font-bold text-slate-500">عدد الدروس اليومية</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            {isDefaultConfig 
              ? 'عدد الدروس اليومية الافتراضي للجميع' 
              : lessonsPerWeek 
              ? 'عدد دروس الطالب المخصصة في اليوم الدراسي' 
              : `الافتراضي الحالي للكل: ${defaultSchedule?.lessonsPerWeek || '3'} دروس`
            }
          </p>
        </div>

        {/* Days to Keep Lesson */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder={isDefaultConfig ? "البقاء دائماً" : `الافتراضي للكل: ${defaultSchedule?.daysToKeep || 'دائماً'}`}
                value={daysToKeep}
                onChange={(e) => {
                  setDaysToKeep(e.target.value);
                  setIsChanged(true);
                }}
                className="w-44 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-right"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">أيام بقاء الدرس</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            عدد الأيام لظهور الدرس قبل إخفائه (فارغ للبقاء للأبد أو لاتباع الافتراضي)
          </p>
        </div>

        {/* Global Expiry Date */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  setIsChanged(true);
                }}
                className="w-44 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-right"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">تاريخ الإخفاء النهائي</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            تاريخ إخفاء جميع دروس هذا القسم بشكل كامل ونهائي
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col gap-2">
        {onOpenExamOverrides && (
          <button
            type="button"
            onClick={() => onOpenExamOverrides(schedule)}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border ${
              isDefaultConfig 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
            }`}
          >
            <Sliders className={`w-3.5 h-3.5 ${isDefaultConfig ? 'text-white' : 'text-indigo-500'}`} />
            <span>{isDefaultConfig ? 'الجدولة الخاصة لتمارين الكل (الكلمات/التوصيل/الرسم)' : 'تخصيص الامتحانات والدروس للطالب'}</span>
          </button>
        )}
        <button
          type="button"
          disabled={isSaving || (!isChanged && startDate === schedule.startDate && activeDays === schedule.activeDays && lessonsPerWeek === schedule.lessonsPerWeek && daysToKeep === (schedule.daysToKeep || '') && expiryDate === (schedule.expiryDate || ''))}
          onClick={handleSave}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            isSaving
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : isChanged
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>حفظ الإعدادات</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
