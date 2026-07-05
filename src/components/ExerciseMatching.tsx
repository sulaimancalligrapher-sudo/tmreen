/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student, MatchLesson, MatchQuestion, ExerciseType } from '../types';
import { ChevronRight, CheckCircle, Volume2, RotateCcw, Check, Sparkles, AlertTriangle, ArrowRight, Compass, BookOpen, Gamepad2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import ExerciseSwitcherModal from './ExerciseSwitcherModal';

interface ExerciseMatchingProps {
  student: Student;
  onBack: () => void;
  onSelectExercise?: (type: ExerciseType) => void;
}

interface Connection {
  leftId: string; // 1-based index (string)
  rightId: string; // e.g. 'a', 'b', 'c'
}

export default function ExerciseMatching({ student, onBack, onSelectExercise }: ExerciseMatchingProps) {
  const [lessons, setLessons] = useState<MatchLesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(-1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Game state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeResults, setActiveResults] = useState<string>('');
  const [checked, setChecked] = useState(false);
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);

  // Line Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftItemsContainerRef = useRef<HTMLDivElement | null>(null);
  const rightItemsContainerRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const dragStartId = useRef<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [currentLinePos, setCurrentLinePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetchMatchingLessons();
  }, []);

  const fetchMatchingLessons = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await callGasApi<MatchLesson[]>('getLessonsFromMatches');
      setLessons(data);
      if (data.length > 0) {
        setActiveLessonIndex(-1); // Landing on Lesson list dashboard first!
      }
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل تمارين وصل الكلمات.');
    } finally {
      setLoading(false);
    }
  };

  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : null;
  const activeQuestion = activeLesson ? activeLesson.questions[activeQuestionIndex] : null;

  // Redraw canvas connections on resize or state changes
  useEffect(() => {
    if (!activeQuestion) return;
    drawConnections();
    
    // Add window resize listener to keep lines aligned
    window.addEventListener('resize', drawConnections);
    return () => window.removeEventListener('resize', drawConnections);
  }, [connections, activeQuestion, checked]);

  const drawConnections = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas sizing based on active dimensions of container
    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const correctMatches = activeQuestion ? JSON.parse(activeQuestion.correctMatches) : {};

    // Render active drag line
    if (dragStartPos.current && currentLinePos.current) {
      ctx.beginPath();
      ctx.moveTo(dragStartPos.current.x, dragStartPos.current.y);
      ctx.lineTo(currentLinePos.current.x, currentLinePos.current.y);
      ctx.strokeStyle = '#94a3b8'; // neutral slate
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]); // clear dash
    }

    // Render all connected lines
    connections.forEach((conn) => {
      const leftEl = leftItemsContainerRef.current?.querySelector(`[data-id="${conn.leftId}"]`);
      const rightEl = rightItemsContainerRef.current?.querySelector(`[data-id="${conn.rightId}"]`);

      if (leftEl && rightEl) {
        const rectLeft = leftEl.getBoundingClientRect();
        const rectRight = rightEl.getBoundingClientRect();
        const rectContainer = container.getBoundingClientRect();

        const x1 = rectLeft.left + rectLeft.width / 2 - rectContainer.left;
        const y1 = rectLeft.top + rectLeft.height / 2 - rectContainer.top;
        const x2 = rectRight.left + rectRight.width / 2 - rectContainer.left;
        const y2 = rectRight.top + rectRight.height / 2 - rectContainer.top;

        // Color coding
        let strokeColor = '#3b82f6'; // default Blue
        if (checked && activeLesson) {
          const isCorrect = correctMatches[conn.leftId]?.includes(conn.rightId);
          if (activeLesson.colorControl === 'نعم') {
            strokeColor = isCorrect ? '#10b981' : '#ef4444'; // Green/Red
          }
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3.5;
        ctx.stroke();
      }
    });
  };

  // Touch and Mouse Event Helpers
  const handleStartDraw = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, leftId: string) => {
    // Avoid interfering with audio volume or audio play trigger buttons
    if ((e.target as HTMLElement).closest('.play-btn')) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rectContainer = canvas.parentElement?.getBoundingClientRect();
    const targetEl = e.currentTarget.getBoundingClientRect();

    if (!rectContainer) return;

    const startX = targetEl.left + targetEl.width / 2 - rectContainer.left;
    const startY = targetEl.top + targetEl.height / 2 - rectContainer.top;

    drawingRef.current = true;
    dragStartId.current = leftId;
    dragStartPos.current = { x: startX, y: startY };
  };

  const handleDraw = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!drawingRef.current || !dragStartPos.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rectContainer = canvas.parentElement?.getBoundingClientRect();
    if (!rectContainer) return;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const curX = clientX - rectContainer.left;
    const curY = clientY - rectContainer.top;

    setCurrentLinePos({ x: curX, y: curY });
    drawConnections();
  };

  const handleEndDraw = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    let clientX = 0;
    let clientY = 0;

    if ('changedTouches' in e) {
      if (e.changedTouches.length === 0) return;
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Identify which right item the pointer was released on
    const rightElements = rightItemsContainerRef.current?.querySelectorAll('[data-id]');
    let targetRightId: string | null = null;

    rightElements?.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        targetRightId = (el as HTMLElement).dataset.id || null;
      }
    });

    if (dragStartId.current && targetRightId) {
      const lid = dragStartId.current;
      const rid = targetRightId;

      setConnections((prev) => {
        // Discard any existing lines starting from this same left node
        const filtered = prev.filter((c) => c.leftId !== lid);
        return [...filtered, { leftId: lid, rightId: rid }];
      });
    }

    dragStartId.current = null;
    dragStartPos.current = null;
    setCurrentLinePos(null);
    drawConnections();
  };

  const handlePlayAudio = (url: string) => {
    if (playingAudioSrc === url) {
      setPlayingAudioSrc(null);
      return;
    }

    setPlayingAudioSrc(url);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play();
    audio.addEventListener('ended', () => {
      setPlayingAudioSrc(null);
    });
  };

  const handleCheckMatches = async () => {
    if (!activeQuestion) return;

    const correctMatches = JSON.parse(activeQuestion.correctMatches);
    let correctCount = 0;

    connections.forEach((conn) => {
      if (correctMatches[conn.leftId]?.includes(conn.rightId)) {
        correctCount++;
      }
    });

    const total = Object.keys(correctMatches).length;
    const errors = total - correctCount;
    const resultText = `الصحيح: ${correctCount} و الخطأ: ${errors}`;

    setActiveResults(resultText);
    setChecked(true);

    // Save score to Google Sheets
    setSaving(true);
    try {
      // Build a full score compilation matching original results parameter
      const resultsArray = new Array(10).fill('');
      resultsArray[activeQuestionIndex] = resultText;

      await callGasApi('saveAnswers', {
        studentId: student.id,
        studentName: student.name,
        lessonName: activeLesson!.lessonName,
        results: resultsArray,
        numQuestions: activeLesson!.questions.length,
      });

    } catch (err: any) {
      alert(`خطأ في حفظ النتائج: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAnswers = () => {
    setConnections([]);
    setActiveResults('');
    setChecked(false);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < activeLesson!.questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setConnections([]);
      setActiveResults('');
      setChecked(false);
    } else {
      alert('تهانينا! لقد أنهيت جميع تمارين التوصيل في هذا الدرس بنجاح 🎉');
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" dir="rtl">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-sans">جاري تحميل تمرين التوصيل والمطابقة...</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 max-w-xl mx-auto space-y-4" dir="rtl">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">لا توجد مواضيع توصيل مفعلة حالياً</h2>
        <p className="text-slate-500 text-sm">
          تأكد من ملء ورقة (Matches) ببيانات التوصيل في ملف الإكسل الخاص بالمعلم.
        </p>
        <button
          onClick={onBack}
          className="bg-slate-950 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition mt-2"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // --- 1. RENDER LESSON SELECTOR SCREEN ---
  if (activeLessonIndex === -1) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6 text-right animate-fadeIn" dir="rtl">
        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-1.5">
            <span className="text-xs text-amber-600 font-bold block">القسم الثالث: المطابقة والتوصيل</span>
            <h1 className="text-2xl font-black text-slate-900 font-sans">تمارين التوصيل والمطابقة الذكية 🔗</h1>
            <p className="text-slate-500 text-sm">
              اختر أحد الدروس المخصصة أدناه للبدء بتمرين التوصيل اللغوي الذكي ومطابقة العناصر بالصوت والصورة.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {onSelectExercise && (
              <button
                onClick={() => setShowSwitcher(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
              >
                <Gamepad2 className="w-4.5 h-4.5 text-amber-500" />
                تبديل التمرين 🎮
              </button>
            )}
            <button
              onClick={onBack}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
            >
              العودة للرئيسية 🏠
            </button>
          </div>
        </div>

        {/* Lessons List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4 text-right">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl w-fit">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">الموضوع {idx + 1}</span>
                  <h3 className="font-bold text-slate-900 font-sans text-lg">{lesson.lessonName}</h3>
                </div>

                {/* Lesson info badges */}
                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                  <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl">
                    📁 {lesson.questions.length} تمرينات توصيل
                  </span>
                  <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl">
                    🎨 ألوان النتيجة: {lesson.colorControl === 'نعم' ? 'مفعلة' : 'معطلة'}
                  </span>
                  {lesson.retryAllowed === 'نعم' && (
                    <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl">
                      🔄 تصفير الإجابات: متاح
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveLessonIndex(idx);
                  setActiveQuestionIndex(0);
                  setConnections([]);
                  setActiveResults('');
                  setChecked(false);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-xl text-sm mt-6 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                ابدأ التمرين الآن
                <ArrowRight className="w-4 h-4 rotate-180 shrink-0" />
              </button>
            </div>
          ))}
        </div>

        {/* Floating Exercise Switcher Modal */}
        {onSelectExercise && (
          <ExerciseSwitcherModal
            isOpen={showSwitcher}
            onClose={() => setShowSwitcher(false)}
            onSelectExercise={onSelectExercise}
            currentExercise={ExerciseType.MATCHING}
          />
        )}
      </div>
    );
  }

  // --- 2. RENDER ACTIVE LESSON GAMEPLAY VIEW ---
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-right animate-fadeIn" dir="rtl">
      {/* Sub-header navigation details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1.5">
            <button
              onClick={() => setActiveLessonIndex(-1)}
              className="font-bold text-amber-600 hover:underline cursor-pointer"
            >
              {activeLesson?.lessonName}
            </button>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span>تمرين وصل الكلمة</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            تمرين: <span className="text-amber-600 font-extrabold">المطابقة والتوصيل</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {onSelectExercise && (
            <button
              onClick={() => setShowSwitcher(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              تبديل التمرين 🎮
            </button>
          )}
          <button
            onClick={() => setActiveLessonIndex(-1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition"
          >
            رجوع لقائمة الدروس 📂
          </button>
          <button
            onClick={onBack}
            className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
          >
            الرئيسية 🏠
          </button>
        </div>
      </div>

      {activeQuestion && (
        <div className="space-y-6">
          {/* Question instructions prompt */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between">
            <p className="text-slate-800 font-sans text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {activeQuestion.questionText}
            </p>
            <span className="text-xs font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-xl">
              تمرين {activeQuestionIndex + 1} من {activeLesson?.questions.length}
            </span>
          </div>

          {/* Interactive Line-matching canvas container */}
          <div className="relative border border-slate-100 rounded-3xl bg-white shadow-md p-8 min-h-[400px] select-none">
            {/* Overlay line-drawing canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

            {/* Layout Grid columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-20">
              {/* Left node cards */}
              <div ref={leftItemsContainerRef} className="space-y-6 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 block mb-2">المجموعة الأولى (انقر واسحب للتوصيل)</span>
                {activeQuestion.leftItems.map((item, idx) => (
                  <div
                    key={idx}
                    data-id={idx + 1}
                    onMouseDown={(e) => handleStartDraw(e, (idx + 1).toString())}
                    onTouchStart={(e) => handleStartDraw(e, (idx + 1).toString())}
                    onMouseMove={handleDraw}
                    onTouchMove={handleDraw}
                    onMouseUp={handleEndDraw}
                    onTouchEnd={handleEndDraw}
                    className="bg-slate-50 hover:bg-slate-100/80 active:scale-105 border border-slate-200/80 rounded-2xl p-4 cursor-pointer text-center font-bold text-lg shadow-sm hover:shadow-md transition relative flex items-center justify-center min-h-[70px]"
                  >
                    {item.type === 'audio' ? (
                      <button
                        onClick={() => handlePlayAudio(item.value)}
                        className="play-btn bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        {playingAudioSrc === item.value ? '⏸️ جاري التشغيل' : '▶️ استمع للصوت'}
                      </button>
                    ) : item.type === 'image' ? (
                      <img src={item.value} alt="مرفق" className="max-h-24 object-contain rounded-lg" />
                    ) : (
                      item.value
                    )}
                  </div>
                ))}
              </div>

              {/* Right node cards */}
              <div ref={rightItemsContainerRef} className="space-y-6 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 block mb-2">المجموعة الثانية (مستقبل الوصلة)</span>
                {activeQuestion.shuffledRight.map((item, idx) => (
                  <div
                    key={idx}
                    data-id={activeQuestion.rightIds[idx]}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center font-bold text-lg shadow-sm min-h-[70px] flex items-center justify-center relative"
                  >
                    {item.type === 'audio' ? (
                      <button
                        onClick={() => handlePlayAudio(item.value)}
                        className="play-btn bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        {playingAudioSrc === item.value ? '⏸️ جاري التشغيل' : '▶️ استمع للصوت'}
                      </button>
                    ) : item.type === 'image' ? (
                      <img src={item.value} alt="مرفق" className="max-h-24 object-contain rounded-lg" />
                    ) : (
                      item.value
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audio volume sliders */}
          {(activeQuestion.leftItems.some((i) => i.type === 'audio') ||
            activeQuestion.shuffledRight.some((i) => i.type === 'audio')) && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 w-fit">
              <span className="text-xs font-bold text-slate-600">درجة الصوت:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-32 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          )}

          {/* Action dashboard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div>
              {checked ? (
                <div className="text-emerald-700 font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  نتيجة التوصيل: {activeResults}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-sans">
                  * اضغط على أي بطاقة في العمود الأيمن واسحب الخط نحو المطابقة الصحيحة في العمود الأيسر.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {checked ? (
                <>
                  <button
                    onClick={handleResetAnswers}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-1 shadow-sm"
                  >
                    التالي
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCheckMatches}
                  disabled={saving || connections.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-sm transition flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  التحقق من التوصيل
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Exercise Switcher Modal */}
      {onSelectExercise && (
        <ExerciseSwitcherModal
          isOpen={showSwitcher}
          onClose={() => setShowSwitcher(false)}
          onSelectExercise={onSelectExercise}
          currentExercise={ExerciseType.MATCHING}
        />
      )}
    </div>
  );
}
