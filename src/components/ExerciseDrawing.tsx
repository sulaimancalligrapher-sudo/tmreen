/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student, DrawingLesson, DrawingQuestion, ExerciseType } from '../types';
import { ChevronRight, Undo, RotateCcw, Check, Sparkles, Clock, Layers, PenTool, CheckCircle, AlertTriangle, BookOpen, Gamepad2, ArrowLeft, ArrowRight, History, Award, BookOpenCheck } from 'lucide-react';
import { motion } from 'motion/react';
import ExerciseSwitcherModal from './ExerciseSwitcherModal';

interface ExerciseDrawingProps {
  student: Student;
  onBack: () => void;
  onSelectExercise?: (type: ExerciseType) => void;
}

interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: StrokePoint[];
  penType: 'normal' | 'chisel';
  nibAngle: number;
  penSize: number;
}

export default function ExerciseDrawing({ student, onBack, onSelectExercise }: ExerciseDrawingProps) {
  const [lessons, setLessons] = useState<DrawingLesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(-1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Selector and Switcher States
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'history'>('lessons');
  const [writingHistory, setWritingHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Pen configuration
  const [penType, setPenType] = useState<'normal' | 'chisel'>('normal');
  const [penSize, setPenSize] = useState<number>(35);
  const [nibAngle, setNibAngle] = useState<number>(125);
  
  // Drawing states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [strokesPerStep, setStrokesPerStep] = useState<Stroke[][]>([]);
  const [currentRepetition, setCurrentRepetition] = useState<number>(0);
  const [restartCount, setRestartCount] = useState<number>(0);
  
  // Timer states
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Validation modal
  const [resultModal, setResultModal] = useState<{ show: boolean; percentage: number; isSuccess: boolean } | null>(null);

  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokePointsRef = useRef<StrokePoint[]>([]);

  // Load drawing lessons
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        setLoading(true);
        const data = await callGasApi<DrawingLesson[]>('getLetters', { studentId: student.id });
        setLessons(data);
        if (data.length > 0) {
          setActiveLessonIndex(-1); // Lands on selector first!
        }
      } catch (err: any) {
        setError(err.message || 'فشل تحميل دروس محاكاة الخط.');
      } finally {
        setLoading(false);
      }
    };
    fetchLetters();
    fetchWritingHistory();
  }, [student.id]);

  const fetchWritingHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await callGasApi('getWritingExerciseData', { studentId: student.id });
      setWritingHistory(data);
    } catch (err) {
      console.warn('Could not fetch writing scores:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : null;
  const activeQuestion = activeLesson ? activeLesson.questions[activeQuestionIndex] : null;

  // Initializing or resetting a question
  useEffect(() => {
    if (!activeQuestion) return;

    // Reset steps
    const stepsCount = activeQuestion.imageUrls.length;
    setCurrentStep(0);
    setStrokesPerStep(Array.from({ length: stepsCount }, () => []));
    setRestartCount(0);
    setCurrentRepetition(0);
    
    // Set pen size requirement
    if (activeQuestion.requiredPenSize !== null) {
      setPenSize(activeQuestion.requiredPenSize);
    } else {
      setPenSize(35);
    }

    // Timer setup
    if (activeQuestion.timeMinutes > 0) {
      setRemainingTime(activeQuestion.timeMinutes * 60);
      setIsTimerActive(true);
    } else {
      setRemainingTime(0);
      setIsTimerActive(false);
    }

    setResultModal(null);
  }, [activeQuestion]);

  // Handle countdown timer
  useEffect(() => {
    if (!isTimerActive || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, remainingTime]);

  const handleTimeExpired = () => {
    setIsTimerActive(false);
    alert('انتهى الوقت المسموح به لهذا التمرين يا بطل!');
    // Trigger submission as zero if incomplete
    submitFinalProgress(0, 'انتهى الوقت مسبقاً');
  };

  // Redraw canvas template and drawings when step/strokes change
  useEffect(() => {
    if (!activeQuestion) return;
    loadCalligraphyTemplates();
  }, [activeQuestion, currentStep]);

  useEffect(() => {
    redrawAllStrokes();
  }, [strokesPerStep, currentStep, penType, nibAngle]);

  const loadCalligraphyTemplates = async () => {
    const templateCanvas = templateCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!templateCanvas || !hiddenCanvas) return;

    const tCtx = templateCanvas.getContext('2d');
    const hCtx = hiddenCanvas.getContext('2d');
    if (!tCtx || !hCtx) return;

    // Clear previous drawing
    tCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
    hCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

    const imageUrls = activeQuestion!.imageUrls;
    if (imageUrls.length === 0) return;

    // Draw previous steps semi-transparently, and active step fully
    const drawImg = (url: string, ctx: CanvasRenderingContext2D, alpha: number) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        // Use a secure proxy to avoid Canvas CORS restrictions on Vercel/Vite
        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
        img.onload = () => {
          const cw = templateCanvas.width;
          const ch = templateCanvas.height;
          const ratio = img.width / img.height;
          let w = cw * 0.92;
          let h = w / ratio;
          if (h > ch * 0.92) {
            h = ch * 0.92;
            w = h * ratio;
          }
          const offsetX = (cw - w) / 2;
          const offsetY = (ch - h) / 2 + 10;

          ctx.globalAlpha = alpha;
          ctx.drawImage(img, offsetX, offsetY, w, h);
          ctx.globalAlpha = 1.0;
          resolve();
        };
        img.onerror = () => resolve(); // continue on error
      });
    };

    if (activeQuestion!.drawType === 'free') {
      let hiddenUrl = imageUrls[0];
      if (imageUrls.length > 1) {
        await drawImg(imageUrls[0], tCtx, 1.0);
        hiddenUrl = imageUrls[1];
      }
      await drawImg(hiddenUrl, hCtx, 1.0);
    } else {
      // Composition mode: draw previous steps dimmed
      for (let i = 0; i <= currentStep; i++) {
        let alpha = i < currentStep ? activeQuestion!.templateAlpha + 0.3 : activeQuestion!.templateAlpha;
        if (alpha > 0.9) alpha = 0.9;
        await drawImg(imageUrls[i], tCtx, alpha);
      }
      // Hidden canvas always gets the target step for overlap calculation
      await drawImg(imageUrls[currentStep], hCtx, 1.0);
    }
  };

  // Drawing Canvas Actions
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 1 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;
    let pressure = 1;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0, pressure: 1 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.touches[0].force !== undefined) {
        pressure = e.touches[0].force || 1;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: pressure,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getMousePos(e);
    isDrawingRef.current = true;
    currentStrokePointsRef.current = [{ x: pos.x, y: pos.y, pressure: pos.pressure }];

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (penType === 'normal') {
      ctx.beginPath();
      ctx.strokeStyle = '#e74c3c';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = penSize;
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const pos = getMousePos(e);
    const lastPoint = currentStrokePointsRef.current[currentStrokePointsRef.current.length - 1];
    currentStrokePointsRef.current.push({ x: pos.x, y: pos.y, pressure: pos.pressure });

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (penType === 'normal') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (penType === 'chisel') {
      drawChiselSegment(ctx, lastPoint, { x: pos.x, y: pos.y, pressure: pos.pressure }, nibAngle, penSize, '#e74c3c');
    }
  };

  const stopDrawing = () => {
    if (isDrawingRef.current && currentStrokePointsRef.current.length > 1) {
      const newStroke: Stroke = {
        points: [...currentStrokePointsRef.current],
        penType,
        nibAngle,
        penSize,
      };

      setStrokesPerStep((prev) => {
        const next = [...prev];
        next[currentStep] = [...(next[currentStep] || []), newStroke];
        return next;
      });
    }
    isDrawingRef.current = false;
    currentStrokePointsRef.current = [];
  };

  const drawChiselSegment = (
    ctx: CanvasRenderingContext2D,
    p0: StrokePoint,
    p1: StrokePoint,
    angleDeg: number,
    baseWidth: number,
    color: string
  ) => {
    const ang = (angleDeg * Math.PI) / 180.0;
    const nibU = { x: Math.cos(ang), y: Math.sin(ang) };
    const pressure0 = p0.pressure || 1;
    const pressure1 = p1.pressure || 1;

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / 1.0));

    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const x0 = p0.x + dx * t0;
      const y0 = p0.y + dy * t0;
      const x1 = p0.x + dx * t1;
      const y1 = p0.y + dy * t1;

      const pr = pressure0 * (1 - t0) + pressure1 * t0;
      const w = baseWidth * pr;
      const half = w / 2;

      const left0 = { x: x0 + nibU.x * half, y: y0 + nibU.y * half };
      const right0 = { x: x0 - nibU.x * half, y: y0 - nibU.y * half };
      const left1 = { x: x1 + nibU.x * half, y: y1 + nibU.y * half };
      const right1 = { x: x1 - nibU.x * half, y: y1 - nibU.y * half };

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(left0.x, left0.y);
      ctx.lineTo(left1.x, left1.y);
      ctx.lineTo(right1.x, right1.y);
      ctx.lineTo(right0.x, right0.y);
      ctx.closePath();
      ctx.fill();
    }
  };

  const redrawAllStrokes = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes recorded in the current step and previous steps
    for (let s = 0; s <= currentStep; s++) {
      const strokes = strokesPerStep[s] || [];
      strokes.forEach((stroke) => {
        const points = stroke.points;
        if (points.length < 2) return;

        if (stroke.penType === 'normal') {
          ctx.beginPath();
          ctx.strokeStyle = '#e74c3c';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = stroke.penSize;
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        } else if (stroke.penType === 'chisel') {
          for (let i = 1; i < points.length; i++) {
            drawChiselSegment(ctx, points[i - 1], points[i], stroke.nibAngle, stroke.penSize, '#e74c3c');
          }
        }
      });
    }
  };

  const handleUndo = () => {
    if (!activeQuestion!.allowUndo) return;
    setStrokesPerStep((prev) => {
      const next = [...prev];
      if (next[currentStep] && next[currentStep].length > 0) {
        next[currentStep] = next[currentStep].slice(0, -1);
      }
      return next;
    });
  };

  const handleRestart = () => {
    if (restartCount >= activeQuestion!.maxRestarts) {
      alert('لقد استنفدت الحد الأقصى لمحاولات إعادة الرسم!');
      return;
    }
    setRestartCount((prev) => prev + 1);
    setStrokesPerStep((prev) => {
      const next = [...prev];
      next[currentStep] = [];
      return next;
    });
  };

  // Compare Drawn Overlay with Hidden Mask Template
  const handleCheckDrawing = () => {
    const drawingCanvas = drawingCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!drawingCanvas || !hiddenCanvas) return;

    const dCtx = drawingCanvas.getContext('2d');
    const hCtx = hiddenCanvas.getContext('2d');
    if (!dCtx || !hCtx) return;

    const strokes = strokesPerStep[currentStep] || [];
    if (strokes.length === 0) {
      alert('يرجى رسم الحرف أولاً يا بطل!');
      return;
    }

    const hData = hCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height).data;
    const dData = dCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height).data;

    let templatePixels = 0;
    let coveredPixels = 0;

    for (let i = 0; i < hData.length; i += 4) {
      const r = hData[i];
      const g = hData[i + 1];
      const b = hData[i + 2];
      const a = hData[i + 3];

      // Detect dark mask pixel
      if (r + g + b < 450 && a > 50) {
        templatePixels++;
        // Check if drawing matches (red stroke drawn on drawing canvas)
        const dr = dData[i];
        const dg = dData[i + 1];
        const db = dData[i + 2];
        const da = dData[i + 3];

        if (dr > 180 && dg < 100 && db < 100 && da > 120) {
          coveredPixels++;
        }
      }
    }

    const percentage = templatePixels === 0 ? 0 : Math.round((coveredPixels / templatePixels) * 100);
    const isSuccess = percentage >= activeQuestion!.requiredPercent;

    setResultModal({
      show: true,
      percentage,
      isSuccess,
    });
  };

  const handleConfirmResult = () => {
    if (!resultModal) return;
    setResultModal(null);

    const stepsCount = activeQuestion!.imageUrls.length;

    if (currentStep < stepsCount - 1) {
      // Move to next step in the calligraphic sequence
      setCurrentStep((prev) => prev + 1);
    } else {
      // Completed last step, save to database
      submitFinalProgress(resultModal.percentage);
    }
  };

  const submitFinalProgress = async (finalPct: number, reason: string = '') => {
    setSaving(true);
    try {
      const templateCanvas = templateCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;

      let b64Image = '';
      if (templateCanvas && drawingCanvas) {
        // Compile template model + drawing together into a single PNG snapshot for the teacher
        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = 500;
        mergedCanvas.height = 580;
        const mCtx = mergedCanvas.getContext('2d');
        if (mCtx) {
          mCtx.fillStyle = 'white';
          mCtx.fillRect(0, 0, 500, 580);
          mCtx.drawImage(templateCanvas, 0, 0);
          mCtx.drawImage(drawingCanvas, 0, 0);

          // Render metadata watermark on student image
          mCtx.font = '16px Amiri';
          mCtx.fillStyle = '#1e293b';
          mCtx.textAlign = 'right';
          const watermark = `الطالب: ${student.name} | محاكاة خط: ${activeQuestion!.subLabel} | دقة الأداء: ${finalPct}%`;
          mCtx.fillText(watermark, 480, 560);
          b64Image = mergedCanvas.toDataURL('image/png');
        }
      }

      const detailsStr = reason ? `${activeQuestion!.subLabel} | ${reason}` : `${activeQuestion!.subLabel} | نجح ${finalPct}%`;
      const repInfo = `${currentRepetition + 1} / ${activeQuestion!.requiredRepetitions}`;

      await callGasApi('saveProgress', {
        studentId: student.id,
        studentName: student.name,
        label: activeLesson!.label,
        details: detailsStr,
        repetitionsCompleted: repInfo,
        finalPercentage: `${finalPct}%`,
        imageData: b64Image,
      });

      // Show motivational congratulations
      alert(`عظيم جداً يا بطل! تم حفظ أداء التمرين بنجاح بنسبة دقة ${finalPct}%!`);

      // Check if more repetitions are required
      if (currentRepetition < activeQuestion!.requiredRepetitions - 1) {
        setCurrentRepetition((prev) => prev + 1);
        // Clear strokes for next repetition
        setStrokesPerStep(Array.from({ length: activeQuestion!.imageUrls.length }, () => []));
        setCurrentStep(0);
      } else {
        // Jump to next calligraphy model in lesson if any
        if (activeQuestionIndex < activeLesson!.questions.length - 1) {
          setActiveQuestionIndex((prev) => prev + 1);
        } else {
          alert('تهانينا الكبيرة! لقد أتممت جميع نماذج الخط في هذا الدرس 🎉');
          onBack();
        }
      }
    } catch (err: any) {
      alert(`تعذر حفظ أدائك: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" dir="rtl">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-sans">جاري تحميل لوحة محاكاة الخط العربي...</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 max-w-xl mx-auto space-y-4" dir="rtl">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">لا توجد تمارين محاكاة خط مخصصة حالياً</h2>
        <p className="text-slate-500 text-sm">
          تأكد من إدراج نماذج خط وتفعيل التمارين في جدول البيانات (Questions-R) الخاص بالمعلم.
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
      <div className="max-w-6xl mx-auto p-4 space-y-6 text-right animate-fadeIn" dir="rtl">
        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-1.5">
            <span className="text-xs text-emerald-600 font-bold block">القسم الأول: محاكاة ورسم الخط</span>
            <h1 className="text-2xl font-black text-slate-900 font-sans">تمرين الرسم ومحاكاة الخط العربي ✍️</h1>
            <p className="text-slate-500 text-sm">
              لوحة رسم تفاعلية لقياس دقة كتابة الحروف والكلمات العربية مع تصحيح وتحليل ذكي مباشر للخط.
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

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-100 pb-px gap-6">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`pb-4 text-sm font-bold transition relative ${
              activeTab === 'lessons' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            الدروس المتوفرة ({lessons.length})
            {activeTab === 'lessons' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchWritingHistory();
            }}
            className={`pb-4 text-sm font-bold transition relative flex items-center gap-1 ${
              activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            سجل درجاتي بالخط والخطوط
            {activeTab === 'history' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'lessons' ? (
          /* Lessons List Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4 text-right">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold">الدرس {idx + 1}</span>
                    <h3 className="font-bold text-slate-900 font-sans text-lg">{lesson.label}</h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl">
                      📝 {lesson.questions.length} حروف ونماذج خطية
                    </span>
                    <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-xl">
                      🎯 دقة القياس: ذكية
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveLessonIndex(idx);
                    setActiveQuestionIndex(0);
                    setCurrentStep(0);
                    setStrokesPerStep([]);
                    setCurrentRepetition(0);
                    setRestartCount(0);
                    setResultModal(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-3 rounded-xl text-sm mt-6 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  بدء محاكاة الخط العربي
                  <ArrowRight className="w-4 h-4 rotate-180 shrink-0" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* History logs tab */
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                <span className="text-xs">جاري جلب سجل درجاتك...</span>
              </div>
            ) : writingHistory && writingHistory.data && writingHistory.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right text-slate-600" dir="rtl">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase">
                      {writingHistory.headers.map((header: string, i: number) => (
                        <th key={i} className="px-4 py-3 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {writingHistory.data.map((row: string[], rowIdx: number) => (
                      <tr key={rowIdx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        {row.map((cell: string, cellIdx: number) => (
                          <td key={cellIdx} className="px-4 py-3.5 font-sans font-medium text-slate-700">
                            {cellIdx === 3 ? (
                              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-lg border border-emerald-100">
                                {cell}
                              </span>
                            ) : cellIdx === 4 ? (
                              <span className="bg-amber-50 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-lg border border-amber-100">
                                ⭐ {cell}
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Award className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold">لا يوجد سجل درجات مسجل بعد لهذا التمرين</p>
                <p className="text-xs">ابدأ بحل التمارين وحقّق نسبة الدقة المطلوبة ليتم حفظ درجاتك في النظام.</p>
              </div>
            )}
          </div>
        )}

        {/* Switcher Modal */}
        {onSelectExercise && (
          <ExerciseSwitcherModal
            isOpen={showSwitcher}
            onClose={() => setShowSwitcher(false)}
            onSelectExercise={onSelectExercise}
            currentExercise={ExerciseType.DRAWING}
          />
        )}
      </div>
    );
  }

  // --- 2. RENDER ACTIVE LESSON GAMEPLAY VIEW ---
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-right animate-fadeIn" dir="rtl">
      {/* Exercise Sub-header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1.5">
            <button
              onClick={() => setActiveLessonIndex(-1)}
              className="font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              {activeLesson?.label}
            </button>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span>تمرين محاكاة الرسم</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            نموذج: <span className="text-emerald-700 font-extrabold">{activeQuestion?.subLabel}</span>
          </h1>
        </div>

        {/* Dynamic Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timer Display */}
          {activeQuestion && activeQuestion.timeMinutes > 0 && (
            <div className="bg-rose-50 text-rose-800 border border-rose-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>الوقت المتبقي: {formatTimer(remainingTime)}</span>
            </div>
          )}

          {/* Repetition Progress */}
          {activeQuestion && activeQuestion.requiredRepetitions > 1 && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>التكرار: {currentRepetition + 1} / {activeQuestion.requiredRepetitions}</span>
            </div>
          )}

          {/* Steps Progress */}
          {activeQuestion && activeQuestion.imageUrls.length > 1 && (
            <div className="bg-amber-50 text-amber-800 border border-amber-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>الخطوة: {currentStep + 1} / {activeQuestion.imageUrls.length}</span>
            </div>
          )}

          {onSelectExercise && (
            <button
              onClick={() => setShowSwitcher(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
            >
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              تبديل التمرين 🎮
            </button>
          )}

          <button
            onClick={() => setActiveLessonIndex(-1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            قائمة الدروس 📁
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls Panel (Left or Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-2 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-emerald-600" />
              أدوات وتخصيص قلم الرسم
            </h3>

            {/* Pen Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">نوع سن القلم</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPenType('normal')}
                  className={`py-3 rounded-xl border text-sm font-bold transition ${
                    penType === 'normal'
                      ? 'bg-slate-950 text-white border-transparent'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  قلم عادي (دائري)
                </button>
                <button
                  onClick={() => setPenType('chisel')}
                  className={`py-3 rounded-xl border text-sm font-bold transition ${
                    penType === 'chisel'
                      ? 'bg-slate-950 text-white border-transparent'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  قلم مائل (خط عربي)
                </button>
              </div>
            </div>

            {/* Pen Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>سمك خط الرسم</span>
                <span className="font-mono text-emerald-700">{penSize} بكسل</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={penSize}
                onChange={(e) => setPenSize(parseInt(e.target.value))}
                disabled={activeQuestion?.requiredPenSize !== null}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              {activeQuestion?.requiredPenSize !== null && (
                <p className="text-[10px] text-amber-600 font-bold">
                  * تم قفل السمك إلى {activeQuestion?.requiredPenSize} بكسل لتناسب هذا النموذج.
                </p>
              )}
            </div>

            {/* Chisel Nib Angle (Chisel pen mode only) */}
            {penType === 'chisel' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>زاوية ميل القلم</span>
                  <span className="font-mono text-emerald-700">{nibAngle}° درجة</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={nibAngle}
                  onChange={(e) => setNibAngle(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleUndo}
                disabled={!activeQuestion?.allowUndo || (strokesPerStep[currentStep] || []).length === 0}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Undo className="w-4 h-4" />
                تراجع خطوة
              </button>
              <button
                onClick={handleRestart}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة المحاولة
              </button>
            </div>
          </div>

          {/* Tutorial / Help box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              كيف تحقق أعلى نسبة أداء؟
            </h4>
            <p>1. قم بمحاكاة النموذج المضيء بالخلفية بشكل متقن ومحكم تماماً.</p>
            <p>2. استخدم سن القلم المائل لمحاكاة خط الثلث أو الرقعة بطريقة تحاكي أصل الحرف.</p>
            <p>3. تجنب الاستعجال واحسب مسار الكتابة لتجاوز دقة {activeQuestion?.requiredPercent}% كحد أدنى.</p>
          </div>
        </div>

        {/* Calligraphy Canvas Workspace */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          <div className="relative w-[340px] h-[394px] md:w-[500px] md:h-[580px] bg-white rounded-3xl border-8 border-slate-900 shadow-xl overflow-hidden shrink-0 select-none">
            {/* Template layer */}
            <canvas
              ref={templateCanvasRef}
              width="500"
              height="580"
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {/* Invisible comparison mask layer */}
            <canvas
              ref={hiddenCanvasRef}
              width="500"
              height="580"
              className="absolute inset-0 w-full h-full pointer-events-none hidden"
            />
            {/* Active drawing Layer */}
            <canvas
              ref={drawingCanvasRef}
              width="500"
              height="580"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
          </div>

          <div className="flex gap-3 mt-6 w-full max-w-[500px]">
            <button
              onClick={() => setActiveLessonIndex(-1)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition"
            >
              العودة للدروس 📂
            </button>
            <button
              onClick={handleCheckDrawing}
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  تحقق الأداء ومطابقة الخط
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay overlap checking results Modal */}
      {resultModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 text-center max-w-sm w-full space-y-6"
          >
            {resultModal.isSuccess ? (
              <div className="inline-flex bg-emerald-50 p-4 rounded-full text-emerald-600 mb-2">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="inline-flex bg-rose-50 p-4 rounded-full text-rose-600 mb-2">
                <AlertTriangle className="w-10 h-10" />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                {resultModal.isSuccess ? 'عمل رائع يا بطل! 🎉' : 'تحتاج إلى دقة أكثر! 💪'}
              </h3>
              <p className="text-sm text-slate-500">
                حققت دقة مطابقة بنسبة:{' '}
                <span className={`text-lg font-extrabold ${resultModal.isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {resultModal.percentage}%
                </span>
              </p>
              <p className="text-xs text-slate-400">
                النسبة المطلوبة للنجاح هي {activeQuestion?.requiredPercent}%
              </p>
            </div>

            {/* Progress Visual Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  resultModal.isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${resultModal.percentage}%` }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResultModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition text-sm"
              >
                إغلاق والمحاولة مجدداً
              </button>
              {resultModal.isSuccess && (
                <button
                  onClick={handleConfirmResult}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md"
                >
                  استمر للخطوة التالية
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Switcher Modal */}
      {onSelectExercise && (
        <ExerciseSwitcherModal
          isOpen={showSwitcher}
          onClose={() => setShowSwitcher(false)}
          onSelectExercise={onSelectExercise}
          currentExercise={ExerciseType.DRAWING}
        />
      )}
    </div>
  );
}
