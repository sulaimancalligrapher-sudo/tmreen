/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student, MatchLesson, MatchQuestion, ExerciseType, LeftItem, ShuffledRightItem } from '../types';
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

interface ClientLeftItem {
  id: string; // stable original 1-based index (string) e.g., "1", "2"
  item: LeftItem;
}

interface ClientRightItem {
  id: string; // stable original letter ID e.g., "a", "b"
  item: ShuffledRightItem;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ExerciseMatching({ student, onBack, onSelectExercise }: ExerciseMatchingProps) {
  const [lessons, setLessons] = useState<MatchLesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(-1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Lesson statuses (isCompleted, retriesUsed)
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, { isCompleted: boolean; retriesUsed: number }>>({});
  const [showCompleted, setShowCompleted] = useState<boolean>(() => {
    return localStorage.getItem('match_show_completed') !== 'false';
  });
  const [retryingLesson, setRetryingLesson] = useState<string | null>(null);

  // Game state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeResults, setActiveResults] = useState<string>('');
  const [checked, setChecked] = useState(false);
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.8);
  const [lessonAnswers, setLessonAnswers] = useState<string[]>(new Array(10).fill(''));

  // Client-side shuffled items
  const [shuffledLeftItems, setShuffledLeftItems] = useState<ClientLeftItem[]>([]);
  const [shuffledRightItems, setShuffledRightItems] = useState<ClientRightItem[]>([]);

  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : null;
  const activeQuestion = activeLesson ? activeLesson.questions[activeQuestionIndex] : null;

  // Audio & Line Drawing State
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftItemsContainerRef = useRef<HTMLDivElement | null>(null);
  const rightItemsContainerRef = useRef<HTMLDivElement | null>(null);
  const drawingRef = useRef(false);
  const dragStartId = useRef<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [currentLinePos, setCurrentLinePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetchMatchingLessons();
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setPlayingAudioSrc(null);
  }, [activeQuestionIndex, activeLessonIndex]);

  useEffect(() => {
    if (!activeQuestion) {
      setShuffledLeftItems([]);
      setShuffledRightItems([]);
      return;
    }

    const lefts: ClientLeftItem[] = activeQuestion.leftItems.map((item, idx) => ({
      id: (idx + 1).toString(),
      item
    }));

    const rights: ClientRightItem[] = activeQuestion.shuffledRight.map((item, idx) => ({
      id: activeQuestion.rightIds[idx],
      item
    }));

    setShuffledLeftItems(shuffleArray(lefts));
    setShuffledRightItems(shuffleArray(rights));
  }, [activeQuestionIndex, activeLessonIndex, lessons, activeQuestion]);

  const fetchMatchingLessons = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await callGasApi<MatchLesson[]>('getLessonsFromMatches');
      setLessons(data);
      if (data.length > 0) {
        setActiveLessonIndex(-1); // Landing on Lesson list dashboard first!
        
        // Fetch statuses in parallel for all loaded matching lessons
        const statuses: Record<string, { isCompleted: boolean; retriesUsed: number }> = {};
        await Promise.all(
          data.map(async (lesson) => {
            try {
              const status = await callGasApi<{ isCompleted: boolean; retriesUsed: number }>('getLessonStatus', {
                studentId: student.id,
                lessonName: lesson.lessonName,
              });
              statuses[lesson.lessonName] = status;
            } catch (e) {
              console.error("Error fetching status for Matching Lesson:", lesson.lessonName, e);
              statuses[lesson.lessonName] = { isCompleted: false, retriesUsed: 0 };
            }
          })
        );
        setLessonStatuses(statuses);
      }
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل تمارين وصل الكلمات.');
    } finally {
      setLoading(false);
    }
  };

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

  // Global drag-and-drop / connection drawing listeners
  useEffect(() => {
    if (!activeQuestion) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!drawingRef.current || !dragStartPos.current) return;

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

    const handleGlobalEnd = (e: MouseEvent | TouchEvent) => {
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

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [connections, activeQuestion, checked]);

  // Touch and Mouse Event Helpers to start connection
  const handleStartDraw = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, leftId: string) => {
    // Avoid interfering with audio volume or audio play trigger buttons
    if ((e.target as HTMLElement).closest('.play-btn')) return;

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
    setCurrentLinePos({ x: startX, y: startY });
  };

  const isAudioUrl = (url: string): boolean => {
    if (!url) return false;
    const lowercase = url.toLowerCase().trim();
    return (
      lowercase.endsWith('.mp3') ||
      lowercase.endsWith('.wav') ||
      lowercase.endsWith('.ogg') ||
      lowercase.endsWith('.m4a') ||
      lowercase.includes('drive.google.com') ||
      lowercase.includes('/uc?id=')
    );
  };

  const normalizeAudioUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    let id = '';
    if (trimmed.includes('/file/d/')) {
      id = trimmed.split('/file/d/')[1].split('/')[0].split('?')[0];
    } else if (trimmed.includes('open?id=')) {
      id = trimmed.split('open?id=')[1].split('&')[0];
    } else if (trimmed.includes('drive.google.com/uc?id=')) {
      return trimmed;
    }
    if (id) {
      return `https://drive.google.com/uc?id=${id}&export=download`;
    }
    return trimmed;
  };

  const handlePlayAudio = (url: string) => {
    const normalizedUrl = normalizeAudioUrl(url);
    // If the same audio is playing, stop it
    if (playingAudioSrc === url) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingAudioSrc(null);
      return;
    }

    // If another audio is playing, stop it first
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    setPlayingAudioSrc(url);
    const audio = new Audio(normalizedUrl);
    audio.volume = volume;
    currentAudioRef.current = audio;

    audio.play().catch(err => console.error("Error playing audio:", err));

    audio.addEventListener('ended', () => {
      setPlayingAudioSrc(null);
      currentAudioRef.current = null;
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
      const updatedAnswers = [...lessonAnswers];
      updatedAnswers[activeQuestionIndex] = resultText;
      setLessonAnswers(updatedAnswers);

      await callGasApi('saveAnswers', {
        studentId: student.id,
        studentName: student.name,
        lessonName: activeLesson!.lessonName,
        results: updatedAnswers,
        numQuestions: activeLesson!.questions.length,
      });

    } catch (err: any) {
      alert(`خطأ في حفظ النتائج: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUndoLastConnection = () => {
    if (connections.length > 0) {
      setConnections((prev) => prev.slice(0, -1));
    }
  };

  const handleResetAnswers = () => {
    setConnections([]);
    setActiveResults('');
    setChecked(false);
  };

  const handleRetryLesson = async (lessonName: string, lessonIndex: number) => {
    try {
      setRetryingLesson(lessonName);
      await callGasApi('incrementRetry', { studentId: student.id, lessonName });
      
      // Refresh local statuses
      const status = await callGasApi<{ isCompleted: boolean; retriesUsed: number }>('getLessonStatus', {
        studentId: student.id,
        lessonName,
      });
      setLessonStatuses((prev) => ({ ...prev, [lessonName]: status }));
      
      // Start the lesson
      setActiveLessonIndex(lessonIndex);
      setActiveQuestionIndex(0);
      setConnections([]);
      setActiveResults('');
      setChecked(false);
      setLessonAnswers(new Array(10).fill(''));
    } catch (err: any) {
      alert(`خطأ في إعادة تهيئة الدرس: ${err.message}`);
    } finally {
      setRetryingLesson(null);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < activeLesson!.questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setConnections([]);
      setActiveResults('');
      setChecked(false);
    } else {
      alert('تهانينا! لقد أنهيت جميع تمارين التوصيل في هذا الدرس بنجاح 🎉');
      setActiveLessonIndex(-1);
      fetchMatchingLessons();
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

        {/* Toggle Switch for Completed Lessons */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-right">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">تصفية قائمة دروس التوصيل</h4>
            <p className="text-[11px] text-slate-500">
              يمكنك إخفاء الدروس التي أتممتها بالكامل للتركيز على الدروس الجديدة، أو إظهارها لمراجعتها وإعادة التدرب.
            </p>
          </div>
          <button
            onClick={() => {
              const newVal = !showCompleted;
              setShowCompleted(newVal);
              localStorage.setItem('match_show_completed', String(newVal));
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 ${
              showCompleted
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {showCompleted ? 'إخفاء الدروس المكتملة 👁️‍🗨️' : 'إظهار الدروس المكتملة 👁️'}
          </button>
        </div>

        {/* Lessons List - Sleek Vertical Stack */}
        <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {lessons.filter((lesson) => {
            const status = lessonStatuses[lesson.lessonName];
            const isCompleted = status?.isCompleted ?? false;
            return showCompleted ? true : !isCompleted;
          }).length > 0 ? (
            lessons
              .filter((lesson) => {
                const status = lessonStatuses[lesson.lessonName];
                const isCompleted = status?.isCompleted ?? false;
                return showCompleted ? true : !isCompleted;
              })
              .map((lesson) => {
                const originalIdx = lessons.findIndex((l) => l.lessonName === lesson.lessonName);
                const status = lessonStatuses[lesson.lessonName];
                const isCompleted = status?.isCompleted ?? false;
                const retriesUsed = status?.retriesUsed ?? 0;
                const remainingRetries = lesson.maxRetries - retriesUsed;
                const showRetryBtn = isCompleted && lesson.retryAllowed === 'نعم' && remainingRetries > 0;

                return (
                  <div
                    key={originalIdx}
                    className={`flex flex-col sm:flex-row items-center justify-between p-4 md:p-5 hover:bg-slate-50/75 transition gap-4 text-right ${
                      isCompleted ? 'bg-emerald-50/25 border-r-4 border-r-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className={`${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-600'} p-2.5 rounded-xl shrink-0`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-slate-900 font-sans text-base md:text-lg flex items-center gap-2 flex-wrap">
                          {lesson.lessonName}
                        </h3>
                        {isCompleted && (
                          <p className="text-[11px] text-emerald-600 font-sans">
                            تم إكمال هذا التمرين بنجاح! 
                            {lesson.retryAllowed === 'نعم' && ` المحاولات المستخدمة: ${retriesUsed} من ${lesson.maxRetries}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      {showRetryBtn && (
                        <button
                          disabled={retryingLesson === lesson.lessonName}
                          onClick={() => handleRetryLesson(lesson.lessonName, originalIdx)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition flex items-center gap-1.5 shadow-xs shrink-0"
                        >
                          {retryingLesson === lesson.lessonName ? (
                            <div className="w-4 h-4 border-2 border-amber-900/50 border-t-amber-900 rounded-full animate-spin" />
                          ) : (
                            '🔄 إعادة المحاولة'
                          )}
                          <span className="text-[10px] opacity-75">({remainingRetries} متبقي)</span>
                        </button>
                      )}

                      {!isCompleted ? (
                        <button
                          onClick={() => {
                            setActiveLessonIndex(originalIdx);
                            setActiveQuestionIndex(0);
                            setConnections([]);
                            setActiveResults('');
                            setChecked(false);
                            setLessonAnswers(new Array(10).fill(''));
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs md:text-sm transition flex items-center gap-1.5 shadow-sm shrink-0"
                        >
                          فتح الدرس
                          <ArrowRight className="w-4 h-4 rotate-180 shrink-0" />
                        </button>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1 shadow-2xs">
                          مكتمل ✅
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-8 text-center text-slate-400 font-sans text-sm">
              جميع التمارين المتاحة مكتملة حالياً! انقر على زر "إظهار الدروس المكتملة" لعرضها ومراجعتها.
            </div>
          )}
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

  const getLeftCardClassName = (id: string) => {
    const isLeftConnected = connections.some((c) => c.leftId === id);
    const baseClasses = "active:scale-105 border rounded-2xl p-2.5 md:p-4 cursor-pointer text-center font-bold text-sm md:text-lg shadow-sm hover:shadow-md transition duration-350 relative flex items-center justify-center min-h-[70px]";
    
    if (checked && activeLesson) {
      const connection = connections.find((c) => c.leftId === id);
      const correctMatches = activeQuestion ? JSON.parse(activeQuestion.correctMatches) : {};
      const isCorrect = connection && correctMatches[id]?.includes(connection.rightId);
      
      if (activeLesson.colorControl === 'نعم') {
        return isCorrect 
          ? `${baseClasses} bg-emerald-50/90 border-emerald-400 text-emerald-950 font-black shadow-emerald-100/50`
          : `${baseClasses} bg-rose-50/90 border-rose-400 text-rose-950 font-black shadow-rose-100/50`;
      } else {
        return `${baseClasses} bg-blue-50/90 border-blue-400 text-blue-950 font-black shadow-blue-100/50`;
      }
    }

    if (isLeftConnected) {
      return `${baseClasses} bg-amber-50/95 border-amber-400 text-amber-950 ring-2 ring-amber-400/30 shadow-amber-50/50`;
    }

    return `${baseClasses} bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800`;
  };

  const getRightCardClassName = (id: string) => {
    const isRightConnected = connections.some((c) => c.rightId === id);
    const baseClasses = "border rounded-2xl p-2.5 md:p-4 text-center font-bold text-sm md:text-lg shadow-sm min-h-[70px] flex items-center justify-center relative transition duration-350";

    if (checked && activeLesson) {
      const connection = connections.find((c) => c.rightId === id);
      const correctMatches = activeQuestion ? JSON.parse(activeQuestion.correctMatches) : {};
      const isCorrect = connection && correctMatches[connection.leftId]?.includes(id);

      if (activeLesson.colorControl === 'نعم') {
        return isCorrect
          ? `${baseClasses} bg-emerald-50/90 border-emerald-400 text-emerald-950 font-black shadow-emerald-100/50`
          : `${baseClasses} bg-rose-50/90 border-rose-400 text-rose-950 font-black shadow-rose-100/50`;
      } else {
        return `${baseClasses} bg-blue-50/90 border-blue-400 text-blue-950 font-black shadow-blue-100/50`;
      }
    }

    if (isRightConnected) {
      return `${baseClasses} bg-amber-50/95 border-amber-400 text-amber-950 ring-2 ring-amber-400/30 shadow-amber-50/50`;
    }

    return `${baseClasses} bg-slate-50 border-slate-200/80 text-slate-800`;
  };

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
          <div className="relative border border-slate-100 rounded-3xl bg-white shadow-md p-3 md:p-8 min-h-[400px] select-none">
            {/* Overlay line-drawing canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />

            {/* Layout Grid columns - Keep side-by-side on mobile */}
            <div className="grid grid-cols-2 gap-4 md:gap-20 relative z-20">
              {/* Left node cards */}
              <div ref={leftItemsContainerRef} className="space-y-6 flex flex-col justify-center">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 block mb-2">المجموعة الأولى (انقر واسحب للتوصيل)</span>
                {shuffledLeftItems.map(({ id, item }) => (
                  <div
                    key={id}
                    data-id={id}
                    onMouseDown={(e) => handleStartDraw(e, id)}
                    onTouchStart={(e) => handleStartDraw(e, id)}
                    className={getLeftCardClassName(id)}
                  >
                    {item.type === 'audio' || isAudioUrl(item.value) ? (
                      <button
                        onClick={() => handlePlayAudio(item.value)}
                        className="play-btn bg-slate-900 text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                        {playingAudioSrc === item.value ? '⏸️ إيقاف' : '▶️ استمع'}
                      </button>
                    ) : item.type === 'image' ? (
                      <img src={item.value} alt="مرفق" className="max-h-20 md:max-h-24 object-contain rounded-lg" />
                    ) : (
                      item.value
                    )}
                  </div>
                ))}
              </div>

              {/* Right node cards */}
              <div ref={rightItemsContainerRef} className="space-y-6 flex flex-col justify-center">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 block mb-2">المجموعة الثانية (مستقبل الوصلة)</span>
                {shuffledRightItems.map(({ id, item }) => (
                  <div
                    key={id}
                    data-id={id}
                    className={getRightCardClassName(id)}
                  >
                    {item.type === 'audio' || isAudioUrl(item.value) ? (
                      <button
                        onClick={() => handlePlayAudio(item.value)}
                        className="play-btn bg-slate-900 text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                        {playingAudioSrc === item.value ? '⏸️ إيقاف' : '▶️ استمع'}
                      </button>
                    ) : item.type === 'image' ? (
                      <img src={item.value} alt="مرفق" className="max-h-20 md:max-h-24 object-contain rounded-lg" />
                    ) : (
                      item.value
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audio volume sliders */}
          {(activeQuestion.leftItems.some((i) => i.type === 'audio' || isAudioUrl(i.value)) ||
            activeQuestion.shuffledRight.some((i) => i.type === 'audio' || isAudioUrl(i.value))) && (
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
                <div className="flex flex-col gap-1 text-right">
                  <div className="text-emerald-700 font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    نتيجة التوصيل: {activeResults}
                  </div>
                  {(() => {
                    const correctMatches = JSON.parse(activeQuestion.correctMatches);
                    let correctCount = 0;
                    connections.forEach((conn) => {
                      if (correctMatches[conn.leftId]?.includes(conn.rightId)) {
                        correctCount++;
                      }
                    });
                    const total = Object.keys(correctMatches).length;
                    const errors = total - correctCount;
                    const isPerfect = errors === 0;
                    const allowNext = (activeLesson?.nextControl === 'نعم') || (activeLesson?.nextControl === 'لا' && isPerfect);
                    
                    if (!allowNext) {
                      return (
                        <span className="text-rose-600 font-bold text-xs flex items-center gap-1">
                          🔒 الانتقال للسؤال التالي مغلق. يجب تكرار المحاولة والحصول على درجة كاملة (بدون أخطاء) للمتابعة.
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-sans">
                  * اضغط على أي بطاقة في العمود الأيمن واسحب الخط نحو المطابقة الصحيحة في العمود الأيسر.
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {checked ? (
                <>
                  {activeLesson?.retryControl === 'نعم' && (
                    <button
                      onClick={handleResetAnswers}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      إعادة المحاولة
                    </button>
                  )}
                  {(() => {
                    const correctMatches = JSON.parse(activeQuestion.correctMatches);
                    let correctCount = 0;
                    connections.forEach((conn) => {
                      if (correctMatches[conn.leftId]?.includes(conn.rightId)) {
                        correctCount++;
                      }
                    });
                    const total = Object.keys(correctMatches).length;
                    const errors = total - correctCount;
                    const isPerfect = errors === 0;
                    const allowNext = (activeLesson?.nextControl === 'نعم') || (activeLesson?.nextControl === 'لا' && isPerfect);
                    
                    return (
                      <button
                        disabled={!allowNext}
                        onClick={handleNextQuestion}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-1 shadow-sm ${
                          allowNext
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        }`}
                      >
                        التالي
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                    );
                  })()}
                </>
              ) : (
                <>
                  {activeLesson?.undoControl === 'نعم' && (
                    <button
                      onClick={handleUndoLastConnection}
                      disabled={connections.length === 0}
                      className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm transition flex items-center gap-1 shadow-2xs animate-fadeIn"
                    >
                      <RotateCcw className="w-4 h-4 rotate-90" />
                      تراجع
                    </button>
                  )}
                  <button
                    onClick={handleCheckMatches}
                    disabled={saving || connections.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-sm transition flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-4 h-4" />
                    التحقق من التوصيل
                  </button>
                </>
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
