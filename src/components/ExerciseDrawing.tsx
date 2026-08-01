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
import { sound } from '../utils/soundHelper';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const [lessons, setLessons] = useState<DrawingLesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(-1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Selector and Switcher States
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'history'>('lessons');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [writingHistory, setWritingHistory] = useState<any>(null);
  const [drawingResults, setDrawingResults] = useState<any[]>([]);
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
  const [cancelCount, setCancelCount] = useState<number>(0);
  const [percentages, setPercentages] = useState<number[]>([]);
  const [stepDetails, setStepDetails] = useState<string[]>([]);
  const [lessonStarted, setLessonStarted] = useState<boolean>(false);
  const [isDirectionMode, setIsDirectionMode] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  
  // Timer states
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Validation modal
  const [resultModal, setResultModal] = useState<{ show: boolean; percentage: number; isSuccess: boolean } | null>(null);
  const [customAlert, setCustomAlert] = useState<{ message: string; title?: string; type?: 'error' | 'success' | 'info' } | null>(null);
  const [resettingLessonLabel, setResettingLessonLabel] = useState<string | null>(null);

  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokePointsRef = useRef<StrokePoint[]>([]);
  const autoCheckTimeoutRef = useRef<any>(null);

  const fetchDrawingResults = async () => {
    try {
      const data = await callGasApi<any[]>('getStudentResults', { studentId: student.id });
      setDrawingResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not fetch drawing results:', err);
    }
  };

  // Load drawing lessons
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        setLoading(true);
        const data = await callGasApi<DrawingLesson[]>('getLetters', { studentId: student.id });
        const cleanData = Array.isArray(data) ? data.filter(Boolean) : [];
        setLessons(cleanData);
        if (cleanData.length > 0) {
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
    fetchDrawingResults();
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

  const handleResetAndStart = async (lesson: DrawingLesson, originalIdx: number) => {
    try {
      setResettingLessonLabel(lesson.label);
      // 1. Call resetLesson4 to increment the retry counter and clear previous progress in Google Sheet
      await callGasApi('resetLesson4', { studentId: student.id, label: lesson.label });
      // 2. Fetch drawing results to refresh retry counter and check AH/AI values
      await fetchDrawingResults();
      // 3. Open the drawing session interface
      if (originalIdx >= 0) {
        setActiveLessonIndex(originalIdx);
        setActiveQuestionIndex(0);
        setCurrentStep(0);
        setStrokesPerStep([]);
        setCurrentRepetition(0);
        setRestartCount(0);
        setResultModal(null);
      }
    } catch (err) {
      console.error('Error resetting lesson:', err);
      setCustomAlert({
        message: t('exercises.resetLessonError', 'حدث خطأ أثناء إعادة تهيئة الدرس، يرجى المحاولة مجدداً يا بطل.'),
        type: 'error'
      });
    } finally {
      setResettingLessonLabel(null);
    }
  };

  const activeLesson = activeLessonIndex >= 0 ? lessons[activeLessonIndex] : null;
  const activeQuestion = activeLesson ? activeLesson.questions[activeQuestionIndex] : null;
  const currentMaxCancels = activeQuestion && typeof activeQuestion.maxCancels === 'number' ? activeQuestion.maxCancels : Infinity;
  const currentMaxRestarts = activeQuestion && typeof activeQuestion.maxRestarts === 'number' ? activeQuestion.maxRestarts : Infinity;

  const completedQuestionsSet = React.useMemo(() => {
    const set = new Set<string>();
    drawingResults.forEach((record) => {
      if (record && record.label && Array.isArray(record.answers)) {
        record.answers.forEach((ans) => {
          if (ans && ans.details && typeof ans.details === 'string') {
            const subLabel = ans.details.split('|')[0].trim();
            if (subLabel) {
              set.add(`${String(record.label).trim()} - ${subLabel}`);
            }
          }
        });
      }
    });
    return set;
  }, [drawingResults]);

  const isQuestionCompleted = React.useCallback((lessonLabel: string, subLabel: string, backendCompletedFlag?: boolean) => {
    if (backendCompletedFlag) return true;
    const lLabel = String(lessonLabel || '').trim();
    const sLabel = String(subLabel || '').trim();
    const fullLabel = `${lLabel} - ${sLabel}`;
    return completedQuestionsSet.has(fullLabel);
  }, [completedQuestionsSet]);

  // Combine active questions with completed scores to reconstruct the full history
  const fullLessonsList = React.useMemo(() => {
    if (!Array.isArray(lessons)) return [];
    return lessons
      .filter((lesson) => lesson !== null && lesson !== undefined)
      .map((lesson) => {
        // Reconstruct completed questions for this lesson from drawingResults
        const completedForThisLesson: any[] = [];
        drawingResults
          .filter((record) => record && record.label && String(record.label).trim() === String(lesson.label).trim())
          .forEach((record) => {
            if (Array.isArray(record.answers)) {
              record.answers.forEach((ans) => {
                if (ans && ans.details && typeof ans.details === 'string') {
                  const subLabel = ans.details.split('|')[0].trim();
                  if (subLabel) {
                    completedForThisLesson.push({
                      subLabel: subLabel,
                      imageUrls: [],
                      templateAlpha: 0.35,
                      requiredPercent: 65,
                      requiredPenSize: null,
                      requiredRepetitions: 1,
                      timeMinutes: 0,
                      drawType: 'normal',
                      allowUndo: true,
                      maxRestarts: Infinity,
                      maxCancels: Infinity,
                      isCompleted: true,
                    });
                  }
                }
              });
            }
          });

        // Map current questions with completion flag
        const activeQuestions = (lesson.questions || []).map((q) => ({
          ...q,
          isCompleted: isQuestionCompleted(lesson.label, q.subLabel, (q as any).isCompleted),
        }));

        // Merge avoiding duplicates
        const mergedQuestionsMap = new Map<string, any>();
        
        completedForThisLesson.forEach((q) => {
          if (q && q.subLabel) {
            mergedQuestionsMap.set(String(q.subLabel).trim(), q);
          }
        });
        
        activeQuestions.forEach((q) => {
          if (q && q.subLabel) {
            mergedQuestionsMap.set(String(q.subLabel).trim(), q);
          }
        });

        const allQuestions = Array.from(mergedQuestionsMap.values());

        const updatedQuestions = allQuestions.map((q) => ({
          ...q,
          isCompleted: q.isCompleted || isQuestionCompleted(lesson.label, q.subLabel, q.isCompleted),
        }));

        const isLessonCompleted = updatedQuestions.length > 0 && updatedQuestions.every((q) => q.isCompleted);

        return {
          ...lesson,
          questions: updatedQuestions,
          isCompleted: isLessonCompleted,
        };
      });
  }, [lessons, drawingResults, isQuestionCompleted]);

  const visibleLessons = React.useMemo(() => {
    if (!Array.isArray(fullLessonsList)) return [];
    if (showCompleted) {
      return fullLessonsList;
    }
    return fullLessonsList.filter((lesson) => lesson && !lesson.isCompleted);
  }, [fullLessonsList, showCompleted]);

  // Initializing or resetting a question
  useEffect(() => {
    if (!activeQuestion) return;

    if (autoCheckTimeoutRef.current) {
      clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }

    // Reset steps
    const stepsCount = activeQuestion.imageUrls.length;
    setCurrentStep(0);
    setStrokesPerStep(Array.from({ length: stepsCount }, () => []));
    setRestartCount(0);
    setCancelCount(0);
    setPercentages([]);
    setStepDetails([]);
    setLessonStarted(false);
    setIsDirectionMode(false);
    setStartPoint(null);
    setEndPoint(null);
    setCurrentRepetition(0);
    
    // Set pen size requirement
    if (activeQuestion.requiredPenSize !== null) {
      setPenSize(activeQuestion.requiredPenSize);
    } else {
      setPenSize(35);
    }

    // Timer setup (will be activated on Start/Start Challenge)
    if (activeQuestion.timeMinutes > 0) {
      setRemainingTime(activeQuestion.timeMinutes * 60);
    } else {
      setRemainingTime(0);
    }
    setIsTimerActive(false);

    setResultModal(null);
  }, [activeQuestion, activeQuestionIndex]);

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
    setCustomAlert({
      message: t('exercises.timeExpiredMsg', 'انتهى الوقت المسموح به لهذا التمرين يا بطل!'),
      type: 'error',
      title: t('exercises.timeExpiredTitle', 'انتهى الوقت')
    });
    
    // Fill remaining repetitions or steps with 0%
    const requiredRepetitions = activeQuestion!.requiredRepetitions || 1;
    const stepsCount = activeQuestion!.imageUrls.length;
    
    let nextPercentages = [...percentages];
    let nextDetails = [...stepDetails];
    
    if (stepsCount > 1) {
      const remainingSteps = stepsCount - percentages.length;
      for (let i = 0; i < remainingSteps; i++) {
        const idx = percentages.length + i + 1;
        nextDetails.push(t('exercises.stepFailedTimeout', 'خطوة {step}: فشل 0% (انتهى الوقت)').replace('{step}', String(idx)));
        nextPercentages.push(0);
      }
      const detailsString = `${activeQuestion!.subLabel}|${nextDetails.join(', ')}`;
      const avgPct = Math.round(nextPercentages.reduce((a, b) => a + b, 0) / stepsCount);
      submitFinalProgress(avgPct, detailsString, '');
    } else if (requiredRepetitions > 1) {
      const remainingReps = requiredRepetitions - percentages.length;
      for (let i = 0; i < remainingReps; i++) {
        const idx = percentages.length + i + 1;
        nextDetails.push(t('exercises.repFailedTimeout', 'التكرار {rep}: فشل 0% (انتهى الوقت)').replace('{rep}', String(idx)));
        nextPercentages.push(0);
      }
      const detailsString = `${activeQuestion!.subLabel}|${nextDetails.join(', ')}`;
      const avgPct = Math.round(nextPercentages.reduce((a, b) => a + b, 0) / requiredRepetitions);
      const repInfo = `${percentages.length} / ${requiredRepetitions}`;
      submitFinalProgress(avgPct, detailsString, repInfo);
    } else {
      const detailsString = `${activeQuestion!.subLabel}|${t('exercises.failedTimeoutStr', 'فشل 0% (انتهى الوقت)')}`;
      submitFinalProgress(0, detailsString, '');
    }
  };

  // Redraw canvas template and drawings when step/strokes change
  useEffect(() => {
    if (!activeQuestion) return;
    let isCurrent = true;

    const loadCalligraphyTemplates = async () => {
      const templateCanvas = templateCanvasRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      if (!templateCanvas || !hiddenCanvas) return;

      const tCtx = templateCanvas.getContext('2d');
      const hCtx = hiddenCanvas.getContext('2d');
      if (!tCtx || !hCtx) return;

      // Clear previous drawings
      tCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
      hCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);

      const imageUrls = activeQuestion!.imageUrls;
      if (imageUrls.length === 0) return;

      const drawImg = (url: string, ctx: CanvasRenderingContext2D, alpha: number, detectPoints = false) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
          img.onload = () => {
            if (!isCurrent) {
              resolve();
              return;
            }
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

            if (detectPoints) {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = img.width;
              tempCanvas.height = img.height;
              const tempCtx = tempCanvas.getContext('2d');
              if (tempCtx) {
                tempCtx.drawImage(img, 0, 0);
                try {
                  const imgData = tempCtx.getImageData(0, 0, img.width, img.height).data;
                  let sumStartX = 0, sumStartY = 0, countStart = 0;
                  let sumEndX = 0, sumEndY = 0, countEnd = 0;

                  for (let y = 0; y < img.height; y++) {
                    for (let x = 0; x < img.width; x++) {
                      const idx = (y * img.width + x) * 4;
                      const r = imgData[idx];
                      const g = imgData[idx + 1];
                      const b = imgData[idx + 2];
                      const a = imgData[idx + 3];

                      if (a > 30) {
                        // Vibrant Red dot centroid calculation
                        if (r > 180 && g < 100 && b < 100) {
                          sumEndX += x;
                          sumEndY += y;
                          countEnd++;
                        }
                        // Vibrant Green dot centroid calculation
                        if (g > 180 && r < 100 && b < 100) {
                          sumStartX += x;
                          sumStartY += y;
                          countStart++;
                        }
                      }
                    }
                  }

                  let sPt: { x: number; y: number } | null = null;
                  let ePt: { x: number; y: number } | null = null;

                  if (countStart > 0) {
                    const avgX = sumStartX / countStart;
                    const avgY = sumStartY / countStart;
                    sPt = { x: (avgX * w) / img.width + offsetX, y: (avgY * h) / img.height + offsetY };
                  }
                  if (countEnd > 0) {
                    const avgX = sumEndX / countEnd;
                    const avgY = sumEndY / countEnd;
                    ePt = { x: (avgX * w) / img.width + offsetX, y: (avgY * h) / img.height + offsetY };
                  }

                  if (sPt && ePt) {
                    setStartPoint(sPt);
                    setEndPoint(ePt);
                    setIsDirectionMode(true);
                  } else {
                    setStartPoint(null);
                    setEndPoint(null);
                    setIsDirectionMode(false);
                  }
                } catch (ex) {
                  console.warn("Failed to get image pixels for dot detection (possibly CORS):", ex);
                }
              }
            }
            resolve();
          };
          img.onerror = () => resolve();
        });
      };

      if (!isCurrent || !activeQuestion) return;

      if (activeQuestion.drawType === 'free') {
        let hiddenUrl = imageUrls[0];
        if (imageUrls.length > 1) {
          await drawImg(imageUrls[0], tCtx, 1.0);
          if (!isCurrent || !activeQuestion) return;
          hiddenUrl = imageUrls[1];
        }
        await drawImg(hiddenUrl, hCtx, 1.0, true);
      } else {
        // Composition mode: draw previous steps dimmed and active step fully
        for (let i = 0; i <= currentStep; i++) {
          if (!isCurrent || !activeQuestion) break;
          let alpha = i < currentStep ? activeQuestion.templateAlpha + 0.3 : activeQuestion.templateAlpha;
          if (alpha > 0.9) alpha = 0.9;
          await drawImg(imageUrls[i], tCtx, alpha);
          if (!isCurrent || !activeQuestion) return;
        }
        if (isCurrent && activeQuestion) {
          await drawImg(imageUrls[currentStep], hCtx, 1.0, true);
        }
      }
    };

    loadCalligraphyTemplates();

    return () => {
      isCurrent = false;
    };
  }, [activeQuestion, currentStep]);

  useEffect(() => {
    redrawAllStrokes();
  }, [strokesPerStep, currentStep, penType, nibAngle, isDirectionMode, startPoint, endPoint]);

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
    if (!lessonStarted) return;

    if (autoCheckTimeoutRef.current) {
      clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }

    const pos = getMousePos(e);
    isDrawingRef.current = true;
    currentStrokePointsRef.current = [{ x: pos.x, y: pos.y, pressure: pos.pressure }];

    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (penType === 'normal') {
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
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
      drawChiselSegment(ctx, lastPoint, { x: pos.x, y: pos.y, pressure: pos.pressure }, nibAngle, penSize, '#2563eb');
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

      const updatedStrokesForStep = [...(strokesPerStep[currentStep] || []), newStroke];

      setStrokesPerStep((prev) => {
        const next = [...prev];
        next[currentStep] = updatedStrokesForStep;
        return next;
      });

      // Verification Logic on Stroke Release
      if (isDirectionMode && startPoint && endPoint) {
        // 1. Immediately check if the very first stroke starts near the green dot
        const firstStroke = updatedStrokesForStep[0];
        const firstPoint = firstStroke ? firstStroke.points[0] : null;

        if (firstPoint) {
          const distFromStart = Math.hypot(firstPoint.x - startPoint.x, firstPoint.y - startPoint.y);
          if (distFromStart > 35) {
            sound.playError();
            setCustomAlert({
              message: t('exercises.startFromGreenDot', 'ابدأ من النقطة الخضراء يا بطل! 🟢'),
              type: 'error',
              title: t('exercises.directionWarningTitle', 'تنبيه الاتجاه')
            });
            // Reset strokes of this step to empty
            setStrokesPerStep((prev) => {
              const next = [...prev];
              next[currentStep] = [];
              return next;
            });
            isDrawingRef.current = false;
            currentStrokePointsRef.current = [];
            return;
          }
        }

        // 2. Check if the latest stroke (or any stroke) ends near the red dot 🔴
        const hasStrokeEndingNearRed = updatedStrokesForStep.some((stroke) => {
          const lp = stroke.points[stroke.points.length - 1];
          return lp && Math.hypot(lp.x - endPoint.x, lp.y - endPoint.y) <= 45;
        });

        if (hasStrokeEndingNearRed) {
          // Trigger the check drawing logic automatically!
          setTimeout(() => {
            handleCheckDrawing(updatedStrokesForStep);
          }, 150);
        } else {
          // Verify if they overshot or drew completely off-track
          const latestStroke = newStroke;
          const points = latestStroke.points;
          if (points.length > 5) {
            const lp = points[points.length - 1];
            const distFromEnd = Math.hypot(lp.x - endPoint.x, lp.y - endPoint.y);
            
            // 2a. Overshoot check: did they pass near red but ended far away?
            const passedNearRed = points.some(p => Math.hypot(p.x - endPoint.x, p.y - endPoint.y) <= 45);
            if (passedNearRed && distFromEnd > 55) {
              sound.playError();
              setCustomAlert({
                message: t('exercises.overshotRedDot', 'لقد تجاوزت النقطة الحمراء يا بطل! حاول التوقف عندها تماماً 🔴'),
                type: 'error',
                title: t('exercises.overshotTitle', 'تجاوز النقطة')
              });
              setStrokesPerStep((prev) => {
                const next = [...prev];
                next[currentStep] = [];
                return next;
              });
              isDrawingRef.current = false;
              currentStrokePointsRef.current = [];
              return;
            }

            // 2b. Off-track check: they drew a long stroke but didn't come near red
            const minDistanceToRed = Math.min(...points.map(p => Math.hypot(p.x - endPoint.x, p.y - endPoint.y)));
            if (points.length > 25 && minDistanceToRed > 75) {
              sound.playError();
              setCustomAlert({
                message: t('exercises.wrongPathWarning', 'انتبه لمسار الرسم والاتجاه الصحيح! تتبع النموذج بدقة واصل إلى النقطة الحمراء 🔴'),
                type: 'error',
                title: t('exercises.wrongPathTitle', 'مسار خاطئ')
              });
              setStrokesPerStep((prev) => {
                const next = [...prev];
                next[currentStep] = [];
                return next;
              });
              isDrawingRef.current = false;
              currentStrokePointsRef.current = [];
              return;
            }
          }
        }
      } else {
        if (autoCheckTimeoutRef.current) {
          clearTimeout(autoCheckTimeoutRef.current);
        }
        autoCheckTimeoutRef.current = setTimeout(() => {
          handleCheckDrawing(updatedStrokesForStep);
        }, 1500);
      }
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
          ctx.strokeStyle = '#2563eb';
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
            drawChiselSegment(ctx, points[i - 1], points[i], stroke.nibAngle, stroke.penSize, '#2563eb');
          }
        }
      });
    }

    // Draw start/end guide indicators if in direction mode
    if (isDirectionMode && startPoint && endPoint) {
      // Draw green start ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 15, 0, 2 * Math.PI);
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();

      // Label for start
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('exercises.startHereGuide', 'ابدأ من هنا 🟢'), startPoint.x, startPoint.y - 24);
      ctx.restore();

      // Draw red end ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 15, 0, 2 * Math.PI);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();

      // Label for end
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('exercises.endHereGuide', 'انتهِ هنا 🔴'), endPoint.x, endPoint.y - 24);
      ctx.restore();
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
    if (autoCheckTimeoutRef.current) {
      clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }
    if (restartCount >= currentMaxRestarts) {
      setCustomAlert({
        message: t('exercises.maxRestartsExceeded', 'لقد استنفدت الحد الأقصى لمحاولات إعادة الرسم المسموح بها في هذا التمرين!'),
        type: 'error',
        title: t('exercises.warningTitle', 'تنبيه')
      });
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
  const handleCheckDrawing = (strokesOverride?: Stroke[]) => {
    if (autoCheckTimeoutRef.current) {
      clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }

    const drawingCanvas = drawingCanvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!drawingCanvas || !hiddenCanvas) return;

    const dCtx = drawingCanvas.getContext('2d');
    const hCtx = hiddenCanvas.getContext('2d');
    if (!dCtx || !hCtx) return;

    const strokes = strokesOverride || strokesPerStep[currentStep] || [];
    if (strokes.length === 0) {
      setCustomAlert({
        message: t('exercises.pleaseDrawFirst', 'يرجى رسم الحرف أولاً يا بطل!'),
        type: 'info',
        title: t('exercises.warningTitle', 'تنبيه')
      });
      return;
    }

    // Direction Checking (Green to Red dot)
    if (isDirectionMode && startPoint && endPoint) {
      const firstStroke = strokes[0];
      const firstPoint = firstStroke ? firstStroke.points[0] : null;

      // Ensure the very first stroke starts at the green dot
      if (firstPoint && Math.hypot(firstPoint.x - startPoint.x, firstPoint.y - startPoint.y) > 35) {
        sound.playError();
        setCustomAlert({
          message: t('exercises.startFromGreenDot', 'ابدأ من النقطة الخضراء يا بطل! 🟢'),
          type: 'error',
          title: t('exercises.directionWarningTitle', 'تنبيه الاتجاه')
        });
        return;
      }

      // Check if at least one stroke ends near the red dot
      const hasStrokeEndingNearRed = strokes.some((stroke) => {
        const lp = stroke.points[stroke.points.length - 1];
        return lp && Math.hypot(lp.x - endPoint.x, lp.y - endPoint.y) <= 45;
      });

      if (!hasStrokeEndingNearRed) {
        sound.playError();
        setCustomAlert({
          message: t('exercises.stopAtRedDot', 'توقف عند النقطة الحمراء تماماً يا بطل! 🔴'),
          type: 'error',
          title: t('exercises.directionWarningTitle', 'تنبيه الاتجاه')
        });
        return;
      }
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
        // Check if drawing matches (blue stroke drawn on drawing canvas)
        const dr = dData[i];
        const dg = dData[i + 1];
        const db = dData[i + 2];
        const da = dData[i + 3];

        if (db > 150 && dr < 120 && da > 100) {
          coveredPixels++;
        }
      }
    }

    const percentage = templatePixels === 0 ? 0 : Math.round((coveredPixels / templatePixels) * 100);
    const isSuccess = percentage >= activeQuestion!.requiredPercent;

    if (isSuccess) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setResultModal({
      show: true,
      percentage,
      isSuccess,
    });
  };

  const handleCancelResult = () => {
    if (cancelCount >= currentMaxCancels) {
      setCustomAlert({
        message: t('exercises.maxCancelsExceeded', 'لقد استنفدت الحد الأقصى لمحاولات إلغاء الرسم!'),
        type: 'error',
        title: t('exercises.warningTitle', 'تنبيه')
      });
      // Ensure the modal closes so the user is not stuck forever
      setResultModal(null);
      return;
    }
    setCancelCount((prev) => prev + 1);
    setResultModal(null);
    setStrokesPerStep((prev) => {
      const next = [...prev];
      next[currentStep] = [];
      return next;
    });
  };

  const handleConfirmResult = () => {
    if (!resultModal) return;
    setResultModal(null);

    const stepsCount = activeQuestion!.imageUrls.length;
    const requiredRepetitions = activeQuestion!.requiredRepetitions || 1;

    // Save active percentage
    const nextPercentages = [...percentages, resultModal.percentage];
    setPercentages(nextPercentages);

    if (activeQuestion!.drawType === 'free') {
      const detailsString = `${activeQuestion!.subLabel}|${t('exercises.passedPctStr', 'نجح {pct}%').replace('{pct}', String(resultModal.percentage))}`;
      submitFinalProgress(resultModal.percentage, detailsString, '');
    } else if (stepsCount > 1) {
      // Step-by-step mode
      const nextDetails = [...stepDetails, t('exercises.stepPassedStr', 'خطوة {step}: نجح {pct}%').replace('{step}', String(currentStep + 1)).replace('{pct}', String(resultModal.percentage))].filter(Boolean);
      setStepDetails(nextDetails);

      if (currentStep < stepsCount - 1) {
        // Move to next step in the calligraphic sequence
        setCurrentStep((prev) => prev + 1);
      } else {
        // Completed last step, save to database
        const detailsString = `${activeQuestion!.subLabel}|${nextDetails.join(', ')}`;
        const avgPct = Math.round(nextPercentages.reduce((a, b) => a + b, 0) / stepsCount);
        submitFinalProgress(avgPct, detailsString, '');
      }
    } else if (requiredRepetitions > 1) {
      // Challenge Mode
      const repIdx = currentRepetition + 1;
      const nextDetails = [...stepDetails, t('exercises.repPassedStr', 'التكرار {rep}: نجح {pct}%').replace('{rep}', String(repIdx)).replace('{pct}', String(resultModal.percentage))].filter(Boolean);
      setStepDetails(nextDetails);

      if (repIdx < requiredRepetitions) {
        // Reset canvas for next repetition
        setStrokesPerStep(Array.from({ length: stepsCount }, () => []));
        setCurrentRepetition(repIdx);
        setCurrentStep(0);
      } else {
        const detailsString = `${activeQuestion!.subLabel}|${nextDetails.join(', ')}`;
        const avgPct = Math.round(nextPercentages.reduce((a, b) => a + b, 0) / requiredRepetitions);
        const repInfo = `${repIdx} / ${requiredRepetitions}`;
        submitFinalProgress(avgPct, detailsString, repInfo);
      }
    } else {
      // Single step, single repetition
      const detailsString = `${activeQuestion!.subLabel}|${t('exercises.passedPctStr', 'نجح {pct}%').replace('{pct}', String(resultModal.percentage))}`;
      submitFinalProgress(resultModal.percentage, detailsString, '');
    }
  };

  const submitFinalProgress = async (finalPct: number, detailsOverride?: string, repInfoOverride?: string) => {
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
          const watermark = `${t('exercises.watermarkStudentLabel', 'الطالب')}: ${student.name} | ${t('exercises.watermarkCalligraphyLabel', 'محاكاة خط')}: ${activeQuestion!.subLabel} | ${t('exercises.watermarkAccuracyLabel', 'دقة الأداء')}: ${finalPct}%`;
          mCtx.fillText(watermark, 480, 560);
          b64Image = mergedCanvas.toDataURL('image/png');
        }
      }

      const detailsStr = detailsOverride || `${activeQuestion!.subLabel} | ${t('exercises.passedPctStr', 'نجح {pct}%').replace('{pct}', String(finalPct))}`;
      const repInfo = repInfoOverride || `${currentRepetition + 1} / ${activeQuestion!.requiredRepetitions}`;

      await callGasApi('saveProgress', {
        studentId: student.id,
        studentName: student.name,
        label: activeLesson!.label,
        details: detailsStr,
        repetitionsCompleted: repInfo,
        finalPercentage: `${finalPct}%`,
        imageData: b64Image,
      });

      // Refresh completed status in real-time
      fetchDrawingResults();

      // Play victory chime sound
      sound.playSuccess();

      // Show motivational congratulations
      setCustomAlert({
        message: t('exercises.saveSuccessMsg', 'عظيم جداً يا بطل! تم حفظ أداء التمرين بنجاح بنسبة دقة {pct}%!').replace('{pct}', String(finalPct)),
        type: 'success',
        title: t('exercises.saveSuccessTitle', 'تم الحفظ بنجاح'),
        onClose: () => {
          // Jump to next calligraphy model in lesson if any
          if (activeQuestionIndex < activeLesson!.questions.length - 1) {
            setActiveQuestionIndex((prev) => prev + 1);
          } else {
            // Play magical lesson completion sound
            sound.playLessonComplete();
            setCustomAlert({
              message: t('exercises.allModelsCompletedMsg', 'تهانينا الكبيرة! لقد أتممت جميع نماذج الخط في هذا الدرس 🎉'),
              type: 'success',
              title: t('exercises.greatAchievementTitle', 'إنجاز رائع'),
              onClose: () => {
                setActiveLessonIndex(-1);
              }
            });
          }
        }
      });
    } catch (err: any) {
      setCustomAlert({
        message: t('exercises.saveErrorMsg', 'تعذر حفظ أدائك: {err}').replace('{err}', err.message),
        type: 'error',
        title: t('exercises.saveErrorTitle', 'خطأ في الحفظ')
      });
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
        <p className="text-slate-500 font-sans">{t('exercises.loadingCalligraphyCanvas', 'جاري تحميل لوحة محاكاة الخط العربي...')}</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 max-w-xl mx-auto space-y-4" dir="rtl">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{t('exercises.noCalligraphyExercises', 'لا توجد تمارين محاكاة خط مخصصة حالياً')}</h2>
        <p className="text-slate-500 text-sm">
          {t('exercises.noCalligraphyExercisesDesc', 'تأكد من إدراج نماذج خط وتفعيل التمارين في جدول البيانات (Questions-R) الخاص بالمعلم.')}
        </p>
        <button
          onClick={onBack}
          className="bg-slate-950 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition mt-2"
        >
          {t('exercises.backToHomeBtn', 'العودة للرئيسية 🏠')}
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
            <span className="text-xs text-emerald-600 font-bold block">{t('exercises.drawingSectionTitle', 'القسم الأول: محاكاة ورسم الخط')}</span>
            <h1 className="text-2xl font-black text-slate-900 font-sans">{t('exercises.drawingHeaderTitle', 'تمرين الرسم ومحاكاة الخط العربي ✍️')}</h1>
            <p className="text-slate-500 text-sm">
              {t('exercises.drawingHeaderDesc', 'لوحة رسم تفاعلية لقياس دقة كتابة الحروف والكلمات العربية مع تصحيح وتحليل ذكي مباشر للخط.')}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {onSelectExercise && (
              <button
                onClick={() => setShowSwitcher(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
              >
                <Gamepad2 className="w-4.5 h-4.5 text-amber-500" />
                {t('exercises.switchExerciseBtn', 'تبديل التمرين 🎮')}
              </button>
            )}
            <button
              onClick={onBack}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-sm"
            >
              {t('exercises.backToHomeBtn', 'العودة للرئيسية 🏠')}
            </button>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {/* Toggle Switch for Completed Lessons */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-right">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{t('exercises.filterDrawingLessonsTitle', 'تصفية قائمة دروس الخط')}</h4>
              <p className="text-[11px] text-slate-500">
                {t('exercises.filterLessonsDesc', 'يمكنك إخفاء الدروس التي أتممتها بالكامل للتركيز على الدروس الجديدة، أو إظهارها لمراجعتها وإعادة التدرب.')}
              </p>
            </div>
            <button
              onClick={() => {
                const newVal = !showCompleted;
                setShowCompleted(newVal);
                localStorage.setItem('draw_show_completed', String(newVal));
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 ${
                showCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {showCompleted ? t('exercises.hideCompletedLessons', 'إخفاء الدروس المكتملة 👁️‍🗨️') : t('exercises.showCompletedLessons', 'إظهار الدروس المكتملة 👁️')}
            </button>
          </div>

          {/* Lessons List - Sleek Vertical Stack */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-100">
            {visibleLessons.length > 0 ? (
              visibleLessons.map((lesson) => {
                const originalIdx = lessons.findIndex((l) => l && l.label === lesson.label);
                const completedCount = (lesson.questions || []).filter(q => q && q.isCompleted).length;
                const totalCount = (lesson.questions || []).length;
                
                return (
                  <div
                    key={lesson.label}
                    className={`flex flex-col sm:flex-row items-center justify-between p-5 hover:bg-slate-50/50 transition gap-4 text-right ${
                      lesson.isCompleted ? 'bg-emerald-50/20 border-r-4 border-r-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      <div className={`${lesson.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'} p-2.5 rounded-xl shrink-0`}>
                        <BookOpen className="w-5.5 h-5.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 font-sans text-base">
                            {lesson.label}
                          </h3>
                          {lesson.isCompleted && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                              {t('exercises.completedBadge', 'مكتمل ✅')}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs">
                          {t('exercises.modelsProgress', 'تم إنجاز {completed} من أصل {total} نموذج للرسم والخط ({pct}%)')
                            .replace('{completed}', String(completedCount))
                            .replace('{total}', String(totalCount))
                            .replace('{pct}', String(Math.round(totalCount === 0 ? 0 : (completedCount / totalCount) * 100)))}
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const drawingRecord = drawingResults.find((r) => r && r.label && String(r.label).trim() === String(lesson.label).trim());
                      const isResetAllowed = drawingRecord ? drawingRecord.allowReset !== 'لا' : true;
                      const isResettingThis = resettingLessonLabel === lesson.label;

                      return (
                        <button
                          disabled={(lesson.isCompleted && !isResetAllowed) || isResettingThis}
                          onClick={() => {
                            if (lesson.isCompleted) {
                              handleResetAndStart(lesson, originalIdx);
                            } else {
                              if (originalIdx >= 0) {
                                setActiveLessonIndex(originalIdx);
                                setActiveQuestionIndex(0);
                                setCurrentStep(0);
                                setStrokesPerStep([]);
                                setCurrentRepetition(0);
                                setRestartCount(0);
                                setResultModal(null);
                              }
                            }
                          }}
                          className={`font-black px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shrink-0 w-full sm:w-auto justify-center ${
                            isResettingThis
                              ? 'bg-slate-100 text-slate-500 cursor-wait'
                              : lesson.isCompleted
                                ? !isResetAllowed
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isResettingThis ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin shrink-0" />
                              <span>{t('exercises.initializing', 'جاري التهيئة...')}</span>
                            </>
                          ) : lesson.isCompleted ? (
                            !isResetAllowed ? t('exercises.completedAndLocked', 'مكتمل ومغلق 🔒') : t('exercises.reviewAndRedraw', 'مراجعة وإعادة الرسم 🔄')
                          ) : (
                            t('exercises.startLessonBtn', 'بدء الدرس والتدريب ✍️')
                          )}
                          {!isResettingThis && <ArrowRight className="w-4 h-4 rotate-180 shrink-0" />}
                        </button>
                      );
                    })()}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm font-bold">{t('exercises.noLessonsMatchingFilter', 'لا توجد دروس متوفرة مطابقة لخيار التصفية')}</p>
              </div>
            )}
          </div>
        </div>

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
            <span>{t('exercises.drawingSimulation', 'تمرين محاكاة الرسم')}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('exercises.modelLabel', 'نموذج:')} <span className="text-emerald-700 font-extrabold">{activeQuestion?.subLabel}</span>
          </h1>
        </div>

        {/* Dynamic Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Steps Progress */}
          {activeQuestion && (activeQuestion.imageUrls || []).length > 1 && (
            <div className="bg-amber-50 text-amber-800 border border-amber-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{t('exercises.stepLabel', 'الخطوة:')} {currentStep + 1} / {activeQuestion?.imageUrls?.length || 0}</span>
            </div>
          )}

          {onSelectExercise && (
            <button
              onClick={() => setShowSwitcher(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
            >
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              {t('exercises.switchExerciseBtn', 'تبديل التمرين 🎮')}
            </button>
          )}

          <button
            onClick={() => setActiveLessonIndex(-1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            {t('exercises.lessonsListBtn', 'قائمة الدروس 📁')}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls Panel (Left or Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Models list inside active lesson */}
          {activeLesson && (() => {
            const totalQuestions = activeLesson.questions.length;
            const completedQuestionsCount = activeLesson.questions.filter((q) =>
              isQuestionCompleted(activeLesson.label, q.subLabel, (q as any).isCompleted)
            ).length;

            // Split questions into rows of 5
            const questionRows: any[][] = [];
            for (let i = 0; i < totalQuestions; i += 5) {
              questionRows.push(activeLesson.questions.slice(i, i + 5).map((q, localIdx) => ({
                question: q,
                globalIndex: i + localIdx
              })));
            }

            return (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4" dir="rtl">
                <div className="border-b border-slate-50 pb-2.5">
                  <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                    <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
                    <span>
                      {t('exercises.lessonContains', 'هذا الدرس فيه ({total}) وقد تم ({completed})')
                        .replace('{total}', String(totalQuestions))
                        .replace('{completed}', String(completedQuestionsCount))}
                    </span>
                  </h3>
                </div>

                <div className="space-y-4 py-1">
                  {questionRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="relative flex items-center justify-between w-full px-2">
                      {/* Connection Line behind the circles for this row */}
                      {row.length > 1 && (
                        <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
                      )}

                      {row.map(({ question, globalIndex }) => {
                        const isQCompleted = isQuestionCompleted(activeLesson.label, question.subLabel, (question as any).isCompleted);
                        const isActive = globalIndex === activeQuestionIndex;

                        return (
                          <button
                            key={globalIndex}
                            onClick={() => {
                              setActiveQuestionIndex(globalIndex);
                              setLessonStarted(false);
                            }}
                            className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 focus:outline-none ${
                              isActive
                                ? 'bg-amber-50 border-4 border-amber-400 ring-4 ring-amber-400/20 text-amber-800 scale-110 shadow-md'
                                : isQCompleted
                                ? 'bg-emerald-500 border-2 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                                : 'bg-white border-2 border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                            title={question.subLabel}
                          >
                            {globalIndex + 1}
                            {isQCompleted && !isActive && (
                              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border border-white text-[8px]">
                                <Check className="w-2 h-2" strokeWidth={4} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Show currently active question label */}
                {activeQuestion && (
                  <div className="text-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50 text-xs font-black text-slate-700">
                    <span>{activeQuestionIndex + 1} - </span>
                    <span className="text-emerald-700">{activeQuestion.subLabel}</span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2 flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <PenTool className="w-4 h-4 text-emerald-600" />
                {t('exercises.penToolsTitle', 'أدوات وتخصيص قلم الرسم')}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeQuestion && activeQuestion.timeMinutes > 0 && (
                  <div className="bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-lg text-[11px] font-black flex items-center gap-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(remainingTime)}</span>
                  </div>
                )}
                {activeQuestion && activeQuestion.requiredRepetitions > 1 && (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-lg text-[11px] font-black flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('exercises.repetitionLabel', 'التكرار:')} {currentRepetition + 1} / {activeQuestion.requiredRepetitions}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Pen Type Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">{t('exercises.penTypeLabel', 'نوع القلم')}</label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPenType('normal')}
                    className={`flex-1 py-1 rounded-md font-bold transition text-center text-[11px] ${
                      penType === 'normal'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t('exercises.penRound', 'دائري')}
                  </button>
                  <button
                    onClick={() => setPenType('chisel')}
                    className={`flex-1 py-1 rounded-md font-bold transition text-center text-[11px] ${
                      penType === 'chisel'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t('exercises.penChisel', 'مائل')}
                  </button>
                </div>
              </div>

              {/* Quick Actions (Icons Only) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block">{t('exercises.quickActionsLabel', 'إجراءات سريعة')}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleUndo}
                    disabled={!activeQuestion?.allowUndo || (strokesPerStep[currentStep] || []).length === 0}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-100 disabled:opacity-40 text-slate-800 py-1 rounded-lg transition flex items-center justify-center"
                    title={t('exercises.undoStepTitle', 'تراجع خطوة')}
                  >
                    <Undo className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRestart}
                    disabled={activeQuestion && (currentMaxRestarts === 0 || restartCount >= currentMaxRestarts)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-100 disabled:opacity-40 text-slate-800 py-1 rounded-lg transition flex items-center justify-center"
                    title={t('exercises.retryTitle', 'إعادة المحاولة')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pen Size & Chisel Angle inputs (Compact Row) */}
            <div className={penType === 'chisel' ? "grid grid-cols-2 gap-3" : "w-full"}>
              {/* Pen Size Numeric Input Box */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span>{t('exercises.strokeThickness', 'سمك الخط')}</span>
                  <span className="font-mono text-emerald-700 text-[10px]">{penSize}px</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={penSize}
                    onChange={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 0;
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setPenSize(val);
                    }}
                    disabled={activeQuestion?.requiredPenSize !== null}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center font-bold font-mono text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 h-8"
                  />
                </div>
              </div>

              {/* Chisel Nib Angle Numeric Input Box */}
              {penType === 'chisel' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                    <span>{t('exercises.penAngle', 'زاوية ميل القلم')}</span>
                    <span className="font-mono text-emerald-700 text-[10px]">{nibAngle}°</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={nibAngle}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = 0;
                        if (val > 180) val = 180;
                        if (val < 0) val = 0;
                        setNibAngle(val);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-center font-bold font-mono text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-8"
                    />
                  </div>
                </div>
              )}
            </div>

            {activeQuestion?.requiredPenSize !== null && (
              <p className="text-[9px] text-amber-600 font-bold bg-amber-50/50 p-1.5 rounded-lg border border-amber-100 text-center">
                {t('exercises.penSizeLockedMsg', '* تم قفل السمك ({size}px) لتناسب هذا النموذج.').replace('{size}', String(activeQuestion?.requiredPenSize))}
              </p>
            )}
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
            {/* Start overlay when lesson not started */}
            {!lessonStarted && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 transition-all">
                <h3 className="text-white text-lg font-black mb-2">{t('exercises.drawingExerciseTitle', 'تمرين محاكاة ورسم الخط')}</h3>
                <p className="text-slate-300 text-xs max-w-[240px] mb-6 leading-relaxed">
                  {activeQuestion && activeQuestion.requiredRepetitions > 1 && activeQuestion.imageUrls.length === 1
                    ? t('exercises.challengeDesc', 'تحدي تكرار رسم النموذج لـ {reps} مرات متتالية بنسبة دقة لا تقل عن {pct}%.')
                        .replace('{reps}', String(activeQuestion.requiredRepetitions))
                        .replace('{pct}', String(activeQuestion.requiredPercent))
                    : t('exercises.stepByStepDesc', 'محاكاة رسم النموذج خطوة بخطوة بطريقة صحيحة ومتقنة.')}
                </p>
                <button
                  onClick={() => {
                    setLessonStarted(true);
                    if (activeQuestion && activeQuestion.timeMinutes > 0) {
                      setIsTimerActive(true);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-8 py-3 rounded-2xl shadow-lg transition active:scale-95 animate-pulse"
                >
                  {activeQuestion && activeQuestion.requiredRepetitions > 1 && activeQuestion.imageUrls.length === 1
                    ? t('exercises.startChallengeBtn', 'ابدأ التحدي! 🏆')
                    : t('exercises.startExerciseBtn', 'ابدأ التمرين ✍️')}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 w-full max-w-[500px]">
            <button
              onClick={() => setActiveLessonIndex(-1)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition"
            >
              {t('exercises.backToLessons', 'العودة للدروس 📂')}
            </button>
            <button
              onClick={handleCheckDrawing}
              disabled={saving || !lessonStarted}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('exercises.savingText', 'جاري الحفظ...')}
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {t('exercises.checkPerformanceBtn', 'تحقق الأداء ومطابقة الخط')}
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
                {resultModal.isSuccess ? t('exercises.greatJobHero', 'عمل رائع يا بطل! 🎉') : t('exercises.needMoreAccuracy', 'تحتاج إلى دقة أكثر! 💪')}
              </h3>
              <p className="text-sm text-slate-500">
                {t('exercises.accuracyAchieved', 'حققت دقة مطابقة بنسبة:')}{' '}
                <span className={`text-lg font-extrabold ${resultModal.isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {resultModal.percentage}%
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {t('exercises.requiredAccuracyInfo', 'النسبة المطلوبة للنجاح هي {pct}%').replace('{pct}', String(activeQuestion?.requiredPercent))}
              </p>
              {(!resultModal.isSuccess && cancelCount >= currentMaxCancels) && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100 mt-2">
                  {currentMaxCancels === 0 
                    ? t('exercises.noRedrawAllowedTeacher', '⚠️ خيار إعادة محاولة الرسم غير متاح في هذا التمرين بطلب من المعلم. يجب عليك حفظ النتيجة والاستمرار.')
                    : t('exercises.maxCancelsReachedWarning', '⚠️ لقد استنفدت الحد الأقصى لمحاولات إلغاء الرسم المسموح بها! يجب عليك الاستمرار بالنتيجة الحالية ومتابعة الأداء.')}
                </p>
              )}
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
              {(!resultModal.isSuccess && cancelCount < currentMaxCancels) && (
                <button
                  onClick={handleCancelResult}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition text-sm"
                >
                  {t('exercises.closeAndRetryBtn', 'إغلاق والمحاولة مجدداً')}
                </button>
              )}
              {(resultModal.isSuccess || cancelCount >= currentMaxCancels) && (
                <button
                  onClick={handleConfirmResult}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md"
                >
                  {resultModal.isSuccess ? t('exercises.confirmAndContinue', 'موافق والاستمرار 🌟') : t('exercises.saveAndContinue', 'حفظ النتيجة والاستمرار ⚠️')}
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

      {/* Custom alert notification modal */}
      {customAlert && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 text-center max-w-sm w-full space-y-6 shadow-2xl"
          >
            {customAlert.type === 'error' ? (
              <div className="inline-flex bg-rose-50 p-4 rounded-full text-rose-600">
                <AlertTriangle className="w-10 h-10" />
              </div>
            ) : customAlert.type === 'success' ? (
              <div className="inline-flex bg-emerald-50 p-4 rounded-full text-emerald-600">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="inline-flex bg-blue-50 p-4 rounded-full text-blue-600">
                <BookOpenCheck className="w-10 h-10" />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 font-sans">
                {customAlert.title || (customAlert.type === 'error' ? t('exercises.warningHeroTitle', 'تنبيه يا بطل! ⚠️') : t('exercises.warningTitle', 'تنبيه'))}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {customAlert.message}
              </p>
            </div>

            <button
              onClick={() => {
                const onCloseCallback = customAlert.onClose;
                setCustomAlert(null);
                if (onCloseCallback) onCloseCallback();
              }}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition text-sm shadow-md active:scale-98"
            >
              {t('exercises.okBtn', 'موافق 👍')}
            </button>
          </motion.div>
        </div>
      )}

      {/* Saving Progress Fullscreen Locked Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 p-8 text-center max-w-sm w-full space-y-6 shadow-2xl"
          >
            <div className="inline-flex bg-amber-50 p-5 rounded-full text-amber-600 animate-pulse">
              <PenTool className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 font-sans">
                {t('exercises.savingFullTitle', 'جاري حفظ خطك الجميل... ✍️✨')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {t('exercises.savingFullDesc', 'يرجى الانتظار بضع ثوانٍ يا بطل، نقوم الآن بتسجيل أدائك المميز وحفظه في لوحة الإنجازات الخاصة بك.')}
              </p>
              <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                {t('exercises.doNotTouchScreen', '⚠️ يرجى عدم لمس الشاشة أو الخروج من الصفحة حتى يكتمل الحفظ!')}
              </p>
            </div>

            {/* Spinner Progress bar */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-xs font-bold text-amber-600 tracking-wider animate-pulse font-mono">{t('exercises.connectingServerSavingImage', 'جاري الاتصال بالسيرفر وحفظ الصورة...')}</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
