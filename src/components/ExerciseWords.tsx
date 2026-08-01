/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { callGasApi } from '../utils/api';
import { Student, OrderingLessonTopic, OrderingQuestion, ExerciseType } from '../types';
import { ArrowRight, RotateCcw, Check, Sparkles, AlertCircle, Volume2, Image as ImageIcon, CheckCircle, HelpCircle, Gamepad2, BookOpen, Compass, X, ZoomIn, ZoomOut, XCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';
import ExerciseSwitcherModal from './ExerciseSwitcherModal';
import { useLanguage } from '../context/LanguageContext';

interface ExerciseWordsProps {
  student: Student;
  onBack: () => void;
  onSelectExercise?: (type: ExerciseType) => void;
}

function ImageWithLoader({ 
  src, 
  alt, 
  className, 
  onClick 
}: { 
  src: string; 
  alt: string; 
  className: string; 
  onClick?: () => void;
}) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [src]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[60px]">
      {loading && (
        <div className="flex flex-col items-center justify-center py-2 px-3 animate-pulse">
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-1"></span>
          <span className="text-[10px] text-slate-500 font-bold">{t('exercises.loadingImage', 'جاري تحميل الصورة...')}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'absolute opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        onClick={onClick}
      />
      {error && (
        <div className="text-[10px] text-rose-500 font-bold p-1.5 bg-rose-50 border border-rose-100 rounded-lg">
          {t('exercises.failedToLoadImage', '⚠️ تعذر تحميل الصورة')}
        </div>
      )}
    </div>
  );
}

class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft, clean sound when a letter/word is picked
  public static playConnect(volume: number = 0.8) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Sound effect error:", e);
    }
  }

  // Harmonious, cheerful sound when the user spells/orders correctly
  public static playSuccess(volume: number = 0.8) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C major triad
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2 * volume, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn("Sound effect error:", e);
    }
  }

  // Soft warning double-beep sound when spelling is incorrect
  public static playFailure(volume: number = 0.8) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const beeps = [0, 0.12];

      beeps.forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now + delay);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now + delay);

        gain.gain.setValueAtTime(0.12 * volume, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });
    } catch (e) {
      console.warn("Sound effect error:", e);
    }
  }
}

export default function ExerciseWords({ student, onBack, onSelectExercise }: ExerciseWordsProps) {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<OrderingLessonTopic[]>([]);
  const [activeTopicRow, setActiveTopicRow] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<OrderingQuestion | null>(null);
  const [isLessonCompletedScreen, setIsLessonCompletedScreen] = useState<boolean>(false);
  const [completedStats, setCompletedStats] = useState<{ total: number; answered: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Exercise gameplay states
  const [shuffledLetters, setShuffledLetters] = useState<{ id: string; val: string; used: boolean }[]>([]);
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [activeCompletionBlanks, setActiveCompletionBlanks] = useState<string[]>([]); // for completion blank indexing
  const [activeCompletionBlankIds, setActiveCompletionBlankIds] = useState<string[]>([]); // map each blank to its selected letter ID
  const [showAnswerHint, setShowAnswerHint] = useState<boolean>(false);
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null);
  const [loadingAudioSrc, setLoadingAudioSrc] = useState<string | null>(null);
  const [detectedMediaType, setDetectedMediaType] = useState<Record<string, 'audio' | 'image'>>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [resettingTopic, setResettingTopic] = useState<{ row: number; topic: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Fetch letters/topics
  useEffect(() => {
    fetchLessonTopics();
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
  }, [activeQuestion, activeTopicRow]);

  const determineTypeFromUrl = (url: string): 'audio' | 'image' | 'text' | 'unknown' => {
    if (!url) return 'text';
    const trimmed = url.trim();
    const lowercase = trimmed.toLowerCase();
    
    if (lowercase.includes('#audio')) return 'audio';
    if (lowercase.includes('#image')) return 'image';
    if (lowercase.includes('#text')) return 'text';
    
    // If it is a google drive thumbnail or has sz=, it's definitely an image
    if (lowercase.includes('thumbnail?id=') || lowercase.includes('&sz=') || lowercase.includes('?sz=')) {
      return 'image';
    }

    if (
      lowercase.endsWith('.mp3') ||
      lowercase.endsWith('.wav') ||
      lowercase.endsWith('.ogg') ||
      lowercase.endsWith('.m4a') ||
      lowercase.endsWith('.aac') ||
      lowercase.includes('.mp3?') ||
      lowercase.includes('.wav?') ||
      lowercase.includes('.ogg?') ||
      lowercase.includes('.m4a?') ||
      lowercase.includes('.aac?')
    ) {
      return 'audio';
    }
    
    if (
      lowercase.endsWith('.png') ||
      lowercase.endsWith('.jpg') ||
      lowercase.endsWith('.jpeg') ||
      lowercase.endsWith('.gif') ||
      lowercase.endsWith('.webp') ||
      lowercase.endsWith('.svg') ||
      lowercase.includes('.png?') ||
      lowercase.includes('.jpg?') ||
      lowercase.includes('.jpeg?') ||
      lowercase.includes('.gif?') ||
      lowercase.includes('.webp?') ||
      lowercase.includes('.svg?')
    ) {
      return 'image';
    }
    
    return 'unknown';
  };

  const getGoogleDriveId = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    let id = '';
    const isGoogleDrive = trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
    if (isGoogleDrive) {
      if (trimmed.includes('/file/d/')) {
        id = trimmed.split('/file/d/')[1].split('/')[0].split('?')[0].split('#')[0];
      } else if (trimmed.includes('open?id=')) {
        id = trimmed.split('open?id=')[1].split('&')[0].split('#')[0];
      } else if (trimmed.includes('id=')) {
        id = trimmed.split('id=')[1].split('&')[0].split('#')[0];
      }
    } else if (trimmed.match(/^[a-zA-Z0-9_-]{25,110}$/)) {
      id = trimmed;
    }
    return id;
  };

  const stripUrlHash = (url: string): string => {
    if (!url) return '';
    return url.split('#')[0].trim();
  };

  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = stripUrlHash(url.trim());
    const id = getGoogleDriveId(trimmed);
    
    if (id) {
      // Use Google Drive's public thumbnail URL directly (high-quality sz=w1200) - loads instantly and bypasses proxy!
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    }
    return trimmed;
  };

  useEffect(() => {
    if (!activeQuestion || !activeQuestion.media) return;
    const url = activeQuestion.media.trim();
    if (!url) return;
    if (detectedMediaType[url]) return;

    const determined = determineTypeFromUrl(url);
    if (determined !== 'unknown') {
      setDetectedMediaType(prev => ({ ...prev, [url]: determined === 'audio' ? 'audio' : 'image' }));
      return;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const normalized = normalizeAudioUrl(url);
      fetch(normalized, { method: 'HEAD' })
        .then(res => {
          const ct = res.headers.get('content-type') || '';
          if (ct.startsWith('image/')) {
            setDetectedMediaType(prev => ({ ...prev, [url]: 'image' }));
          } else if (ct.startsWith('audio/')) {
            setDetectedMediaType(prev => ({ ...prev, [url]: 'audio' }));
          } else {
            setDetectedMediaType(prev => ({ ...prev, [url]: 'image' })); // Default fallback to image in words spelling
          }
        })
        .catch(() => {
          setDetectedMediaType(prev => ({ ...prev, [url]: 'image' }));
        });
    }
  }, [activeQuestion, activeQuestion?.media]);

  const fetchLessonTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await callGasApi<OrderingLessonTopic[]>('getLessons', { studentId: student.id });
      setTopics(data);
    } catch (err: any) {
      setError(err.message || t('exercises.failedToLoadWordLessons', 'تعذر تحميل دروس تركيب الكلمات.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (rowNum: number) => {
    setIsLessonCompletedScreen(false);
    setCompletedStats(null);
    setActiveTopicRow(rowNum);
    loadQuestionForTopic(rowNum, undefined);
  };

  const loadQuestionForTopic = async (rowNum: number, previousIdx: number | undefined) => {
    try {
      setQuestionLoading(true);
      setError('');
      setChecked(false);
      setIsCorrectAnswer(null);
      setSelectedLetterIds([]);
      setShowAnswerHint(false);

      const data = await callGasApi<OrderingQuestion | null>('getRandomWord', {
        rowNumber: rowNum,
        studentId: student.id,
        previousIndex: previousIdx,
      });

      if (data) {
        if ('completed' in data && (data as any).completed) {
          showNotification(t('exercises.answeredAllQuestionsSuccess', 'تم الإجابة على جميع الأسئلة بامتياز! 🎉'), 'success');
          setIsLessonCompletedScreen(true);
          if ('totalQuestions' in data && (data as any).totalQuestions !== undefined) {
            setCompletedStats({
              total: (data as any).totalQuestions,
              answered: (data as any).answeredQuestions !== undefined ? (data as any).answeredQuestions : (data as any).totalQuestions
            });
          }
          fetchLessonTopics();
          return;
        }

        setActiveQuestion(data);
        
        // Prepare discrete letters pool with unique IDs for React key mapping
        const pool = data.letters.map((l, idx) => ({
          id: `letter_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          val: l,
          used: false,
        }));
        
        // Shuffle pool
        setShuffledLetters(pool.sort(() => Math.random() - 0.5));

        // If completion mode, initialize blanks state
        if (data.type === 'completion') {
          // Blanks mapped to indices
          const blanksCount = (data.displayText.match(/\.\.\./g) || []).length;
          setActiveCompletionBlanks(Array(blanksCount).fill(''));
          setActiveCompletionBlankIds(Array(blanksCount).fill(''));
        }
      } else {
        setError(t('exercises.noActiveQuestionsInLesson', 'لا توجد أسئلة نشطة في هذا الدرس حالياً.'));
      }
    } catch (err: any) {
      setError(err.message || t('exercises.failedToFetchNewQuestion', 'فشل جلب سؤال جديد.'));
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleLetterClick = (id: string, val: string) => {
    if (checked) return;

    if (activeQuestion?.type === 'completion') {
      // Find first empty blank slot
      const firstEmptyIdx = activeCompletionBlanks.findIndex((b) => b === '');
      if (firstEmptyIdx !== -1) {
        const updated = [...activeCompletionBlanks];
        updated[firstEmptyIdx] = val;
        setActiveCompletionBlanks(updated);

        const updatedIds = [...activeCompletionBlankIds];
        updatedIds[firstEmptyIdx] = id;
        setActiveCompletionBlankIds(updatedIds);

        setShuffledLetters((prev) =>
          prev.map((item) => (item.id === id ? { ...item, used: true } : item))
        );
        SoundEffects.playConnect(0.85);
      }
    } else {
      // Classic arrange layout
      setShuffledLetters((prev) =>
        prev.map((item) => (item.id === id ? { ...item, used: true } : item))
      );
      setSelectedLetterIds((prev) => [...prev, id]);
      SoundEffects.playConnect(0.85);
    }
  };

  const handleRemoveAnswerLetter = (id: string, indexInAnswer: number) => {
    if (checked) return;

    setShuffledLetters((prev) =>
      prev.map((item) => (item.id === id ? { ...item, used: false } : item))
    );

    if (activeQuestion?.type === 'completion') {
      const updated = [...activeCompletionBlanks];
      updated[indexInAnswer] = '';
      setActiveCompletionBlanks(updated);

      const updatedIds = [...activeCompletionBlankIds];
      updatedIds[indexInAnswer] = '';
      setActiveCompletionBlankIds(updatedIds);
    } else {
      setSelectedLetterIds((prev) => prev.filter((item) => item !== id));
    }
    SoundEffects.playConnect(0.55);
  };

  const getUserAnswerText = (): string => {
    if (!activeQuestion) return '';

    if (activeQuestion.type === 'completion') {
      // Reconstruct user's filled text
      let text = activeQuestion.displayText;
      activeCompletionBlanks.forEach((blankVal) => {
        text = text.replace('...', blankVal || '...');
      });
      return text;
    } else {
      // Standard arrangement concatenation
      const items = selectedLetterIds.map((id) => shuffledLetters.find((l) => l.id === id)?.val || '');
      return items.join('');
    }
  };

  const handleCheckAnswer = async () => {
    const answer = getUserAnswerText();
    if (!answer.trim() || answer.includes('...')) {
      showNotification(t('exercises.arrangeAndFillFirst', 'يرجى ترتيب الحروف وملء الفراغات أولاً يا بطل!'), 'error');
      return;
    }

    setRecording(true);
    try {
      // Verify correct matches from dynamic list
      let cleanUser = answer.trim().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      let match = false;

      for (let correctAns of activeQuestion!.correct) {
        let cleanCorrect = correctAns.trim().replace(/\s+/g, ' ').trim();
        if (cleanUser === cleanCorrect) {
          match = true;
          break;
        }
      }

      setIsCorrectAnswer(match);
      setChecked(true);

      // Play sound effects depending on matching state
      if (match) {
        SoundEffects.playSuccess(0.85);
      } else {
        SoundEffects.playFailure(0.85);
      }

      // Record answers score in sheets database
      await callGasApi('recordAnswer', {
        studentId: student.id,
        studentName: student.name,
        topic: activeQuestion!.topic,
        questionIndex: activeQuestion!.index,
        isCorrect: match,
      });

    } catch (err: any) {
      showNotification(`${t('exercises.errorRecordingAnswer', 'خطأ أثناء تسجيل الإجابة:')} ${err.message}`, 'error');
    } finally {
      setRecording(false);
    }
  };

  const handleRetry = () => {
    setChecked(false);
    setIsCorrectAnswer(null);
    setSelectedLetterIds([]);
    
    // Clear pool used state
    setShuffledLetters((prev) => prev.map((item) => ({ ...item, used: false })));

    if (activeQuestion?.type === 'completion') {
      const blanksCount = (activeQuestion.displayText.match(/\.\.\./g) || []).length;
      setActiveCompletionBlanks(Array(blanksCount).fill(''));
      setActiveCompletionBlankIds(Array(blanksCount).fill(''));
    }
  };

  const handleResetTopic = (rowNum: number, topicName: string) => {
    setResettingTopic({ row: rowNum, topic: topicName });
  };

  const executeResetTopic = async () => {
    if (!resettingTopic) return;
    try {
      setResetLoading(true);
      await callGasApi('resetLesson', { studentId: student.id, topic: resettingTopic.topic });
      showNotification(t('exercises.lessonProgressResetSuccess', 'تم تصفير تقدم الدرس بنجاح! 🔄'), 'success');
      setResettingTopic(null);
      fetchLessonTopics();
    } catch (err: any) {
      showNotification(`${t('exercises.errorResettingProgress', 'خطأ أثناء تصفير التقدم:')} ${err.message}`, 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const normalizeAudioUrl = (url: string): string => {
    if (!url) return '';
    // Strip hash or trailing #audio if present
    const cleanUrl = url.split('#')[0].trim();
    const id = getGoogleDriveId(cleanUrl);
    
    if (id) {
      return `/api/proxy-audio?id=${id}`;
    }
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return `/api/proxy-audio?url=${encodeURIComponent(cleanUrl)}`;
    }
    return cleanUrl;
  };

  const playAudioMedia = (url: string) => {
    const normalizedUrl = normalizeAudioUrl(url);

    if (playingAudioSrc === url) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingAudioSrc(null);
      setLoadingAudioSrc(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    setPlayingAudioSrc(url);
    setLoadingAudioSrc(url);
    const audio = new Audio(normalizedUrl);
    audio.volume = 0.8;
    currentAudioRef.current = audio;

    audio.addEventListener('playing', () => {
      setLoadingAudioSrc(null);
    });

    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
      setPlayingAudioSrc(null);
      setLoadingAudioSrc(null);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error event:', e);
      setPlayingAudioSrc(null);
      setLoadingAudioSrc(null);
      currentAudioRef.current = null;
    });

    audio.addEventListener('ended', () => {
      setPlayingAudioSrc(null);
      setLoadingAudioSrc(null);
      currentAudioRef.current = null;
    });
  };

  if (activeTopicRow === null) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-right animate-fadeIn" dir="rtl">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs text-amber-600 font-bold block">{t('exercises.wordsSectionTitle', 'القسم الثاني: تركيب الكلمات والجمل')}</span>
              <h1 className="text-2xl font-black text-slate-900 font-sans">{t('exercises.wordsHeaderTitle', 'تمرين ترتيب الحروف والكلمات 🔤')}</h1>
              <p className="text-slate-500 text-xs">
                {t('exercises.wordsHeaderDesc', 'اختر درساً مناسباً من القائمة أدناه للبدء بحل تمارين تجميع الحروف، ترتيب الجمل والتركيب اللغوي الممتع.')}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {onSelectExercise && (
                <button
                  onClick={() => setShowSwitcher(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-500" />
                  {t('exercises.switchExerciseBtn', 'تبديل التمرين 🎮')}
                </button>
              )}
              <button
                onClick={onBack}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                {t('exercises.backToHomeBtn', 'الرئيسية 🏠')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-500">{t('exercises.loadingTopicsAndLessons', 'جاري تحميل المواضيع والدروس...')}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Toggle Switch for Completed Lessons */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-right">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{t('exercises.filterWordsLessonsTitle', 'تصفية قائمة دروس ترتيب الكلمات')}</h4>
                  <p className="text-[11px] text-slate-500">
                    {t('exercises.filterLessonsDesc', 'يمكنك إخفاء الدروس التي أتممتها بالكامل للتركيز على الدروس الجديدة، أو إظهارها لمراجعتها وإعادة التدرب.')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !showCompleted;
                    setShowCompleted(newVal);
                    localStorage.setItem('words_show_completed', String(newVal));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 ${
                    showCompleted
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {showCompleted ? t('exercises.hideCompletedLessons', 'إخفاء الدروس المكتملة 👁️‍🗨️') : t('exercises.showCompletedLessons', 'إظهار الدروس المكتملة 👁️')}
                </button>
              </div>

              {/* Topics List */}
              <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
                {topics.filter((topic) => {
                  return showCompleted ? true : !topic.isCompleted;
                }).length > 0 ? (
                  topics
                    .filter((topic) => {
                      return showCompleted ? true : !topic.isCompleted;
                    })
                    .map((topic) => (
                      <div
                        key={topic.row}
                        className="flex items-center justify-between p-4 md:p-5 hover:bg-slate-50/75 transition gap-4 text-right"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-slate-900 font-sans text-base md:text-lg">
                            {topic.topic}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {topic.isCompleted ? (
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t('exercises.completedBadge', 'مكتمل ✅')}
                              </span>
                              {topic.allowReset && (
                                <button
                                  onClick={() => handleResetTopic(topic.row, topic.topic)}
                                  className="bg-slate-900 text-white font-bold p-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                                  title={t('exercises.resetLessonAndZero', 'إعادة الدرس والتصفير')}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSelectTopic(topic.row)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs md:text-sm transition flex items-center gap-1.5 shadow-sm"
                            >
                              {t('exercises.openLessonBtn', 'فتح الدرس')}
                              <ArrowRight className="w-4 h-4 shrink-0 rotate-180" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-slate-500 gap-2">
                    <Compass className="w-10 h-10 text-slate-300 animate-bounce" />
                    <span className="font-bold text-sm">{t('exercises.noLessonsToShow', 'لا توجد دروس لعرضها هنا حالياً.')}</span>
                    <p className="text-xs text-slate-400 max-w-xs">
                      {t('exercises.allLessonsCompletedNotice', 'جميع الدروس في هذه القائمة مكتملة! يمكنك تفعيل خيار "إظهار الدروس المكتملة" لمراجعتها.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Switcher Modal */}
        {onSelectExercise && (
          <ExerciseSwitcherModal
            isOpen={showSwitcher}
            onClose={() => setShowSwitcher(false)}
            onSelectExercise={onSelectExercise}
            currentExercise={ExerciseType.WORDS}
          />
        )}

        {/* Custom Confirmation Reset Modal */}
        {resettingTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" dir="rtl">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl flex flex-col items-center text-center gap-4">
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl">
                <AlertCircle className="w-8 h-8 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-lg">{t('exercises.areYouSure', 'هل أنت متأكد؟')}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {t('exercises.resetConfirmDesc', 'هل ترغب في إعادة المحاولة وتصفير تقدمك في موضوع "{topic}"؟ سيتم مسح جميع الإجابات السابقة لهذا الدرس.').replace('{topic}', resettingTopic.topic)}
                </p>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  disabled={resetLoading}
                  onClick={executeResetTopic}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-300 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  {resetLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>{t('exercises.resettingProgress', 'جاري التصفير...')}</span>
                    </>
                  ) : (
                    t('exercises.yesResetBtn', 'نعم، أعد التصفير 🔄')
                  )}
                </button>
                
                <button
                  disabled={resetLoading}
                  onClick={() => setResettingTopic(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  {t('exercises.cancelEmojiBtn', 'إلغاء ❌')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 text-right animate-fadeIn" dir="rtl">
      {/* Gameplay Header */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-xs text-amber-600 font-bold block mb-1">{t('exercises.sectionTwoWordComposition', 'القسم الثاني: تركيب الكلمات')}</span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans">{activeQuestion?.topic}</h1>
        </div>
        
        <div className="flex gap-2 shrink-0">
          {onSelectExercise && (
            <button
              onClick={() => setShowSwitcher(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              {t('exercises.switchExerciseBtn', 'تبديل التمرين 🎮')}
            </button>
          )}
          <button
            onClick={() => setActiveTopicRow(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
          >
            {t('exercises.backToLessonsBtn', 'رجوع للدروس 📂')}
          </button>
          <button
            onClick={onBack}
            className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
          >
            {t('exercises.backToHomeBtn', 'الرئيسية 🏠')}
          </button>
        </div>
      </div>

      {questionLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-slate-100 shadow-md">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-sans">{t('exercises.loadingNextQuestion', 'جاري تحميل السؤال التالي...')}</p>
        </div>
      ) : isLessonCompletedScreen ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl text-center space-y-6 max-w-2xl mx-auto animate-fadeIn">
          <div className="inline-flex bg-emerald-50 text-emerald-600 p-5 rounded-3xl shadow-sm border border-emerald-100 mb-2">
            <CheckCircle className="w-16 h-16 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans leading-tight">
              {t('exercises.allQuestionsAnswered', 'تم الإجابة على جميع الأسئلة! 🎉')}
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              {t('exercises.allQuestionsAnsweredDesc', 'تم الإجابة على كل الأسئلة بنجاح، ويرجى انتظار تسجيل الإجابات والدرجات بدقة في قاعدة البيانات.')}
            </p>
          </div>

          {completedStats && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-w-sm mx-auto space-y-3">
              <span className="text-xs font-bold text-slate-400 block">{t('exercises.lessonCompletionStats', 'إحصائيات إنجاز الدرس')}</span>
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 font-sans">
                <span>{t('exercises.totalQuestionsLabel', 'إجمالي الأسئلة:')}</span>
                <span className="text-slate-900">{completedStats.total}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 font-sans">
                <span>{t('exercises.completedQuestionsLabel', 'الأسئلة المكتملة:')}</span>
                <span className="text-emerald-600 font-extrabold">
                  {t('exercises.xOfY', '{answered} من {total}')
                    .replace('{answered}', String(completedStats.answered))
                    .replace('{total}', String(completedStats.total))}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(completedStats.answered / completedStats.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                setIsLessonCompletedScreen(false);
                setActiveTopicRow(null);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-2xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {t('exercises.backToLessonsList', 'العودة لقائمة الدروس 📂')}
            </button>
            <button
              onClick={onBack}
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition cursor-pointer"
            >
              {t('exercises.backToHomeBtn', 'الرئيسية 🏠')}
            </button>
          </div>
        </div>
      ) : activeQuestion ? (
        <div className="space-y-6">
          {/* Progress Indicator */}
          {activeQuestion.totalQuestions !== undefined && activeQuestion.totalQuestions > 0 ? (
            <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="text-slate-700 font-bold text-xs md:text-sm">
                  {t('exercises.answeredQuestionsLabel', 'الأسئلة المجاب عليها:')}{' '}
                  <span className="text-amber-600 font-extrabold">{activeQuestion.answeredQuestions || 0}</span>{' '}
                  {t('exercises.ofWord', 'من')}{' '}
                  <span className="text-slate-800 font-extrabold">{activeQuestion.totalQuestions}</span>
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 shrink-0 font-mono">
                  {Math.round(((activeQuestion.answeredQuestions || 0) / activeQuestion.totalQuestions) * 100)}%
                </span>
                <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${((activeQuestion.answeredQuestions || 0) / activeQuestion.totalQuestions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/40 border border-amber-100/60 p-3.5 rounded-2xl text-amber-800 text-xs text-right leading-relaxed flex items-start gap-2.5">
              <span className="text-sm shrink-0">💡</span>
              <p>
                <strong>{t('exercises.importantNote', 'ملاحظة هامة:')}</strong> {t('exercises.gasScriptNote', 'لمشاهدة شريط تقدم الدرس وعدد الأسئلة والأسئلة المجاب عليها هنا، يرجى نسخ كود Google Apps Script الموحد من صفحة التهيئة (الربط) في لوحة التحكم وتحديثه في مشروع الـ Script الخاص بك وإعادة نشره كإصدار جديد.')}
              </p>
            </div>
          )}

          {/* Question Text Box */}
          <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl text-center space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed font-serif whitespace-pre-line">
              {activeQuestion.question}
            </h2>

            {/* Render audio or image Media attachment */}
            {activeQuestion.media.trim() && (() => {
              const url = activeQuestion.media.trim();
              const isAudio = detectedMediaType[url] === 'audio' || 
                (detectedMediaType[url] === undefined && (
                  !!url.toLowerCase().match(/\.(mp3|wav|ogg|m4a)/i) ||
                  url.toLowerCase().includes('#audio')
                ));
              
              if (isAudio) {
                return (
                  <div className="inline-flex">
                    <button
                      onClick={() => playAudioMedia(url)}
                      className="bg-slate-950 text-white font-bold px-6 py-3 rounded-2xl hover:bg-slate-800 transition flex items-center gap-2 shadow cursor-pointer min-w-[200px] justify-center"
                    >
                      {loadingAudioSrc === url ? (
                        <>
                          <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                          <span>{t('exercises.loadingAudio', 'جاري تحميل الصوت...')}</span>
                        </>
                      ) : playingAudioSrc === url ? (
                        <span>{t('exercises.stopAudio', '⏸️ إيقاف الصوت')}</span>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 text-amber-400" />
                          <span>{t('exercises.listenAudio', 'استمع للمقطع الصوتي 🔊')}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="inline-flex bg-white p-2 rounded-2xl shadow-md border border-slate-100">
                    <ImageWithLoader
                      src={normalizeImageUrl(url)}
                      alt={t('exercises.questionAttachmentAlt', 'مرفق السؤال')}
                      className="max-h-48 object-contain rounded-xl max-w-xs cursor-zoom-in"
                      onClick={() => setLightboxImage(normalizeImageUrl(url))}
                    />
                  </div>
                );
              }
            })()}
          </div>

          {/* Connected Cursive Display Output Area */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-10 text-center shadow-lg relative overflow-hidden">
            <div className="absolute left-4 top-4 text-[10px] text-slate-500 font-mono tracking-wider">
              DISPLAY OUTPUT WINDOW
            </div>

            {/* Conditional joined layout */}
            {isCorrectAnswer === true ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2 py-4"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-amber-400 tracking-normal font-serif leading-loose">
                  {getUserAnswerText().replace(/-/g, ' ')}
                </div>
                <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {t('exercises.wordAssembledCursive', 'تم تجميع الكلمة بخط متصل ممتاز! 🏅')}
                </div>
              </motion.div>
            ) : (
              /* Active Block arrangement builder */
              <div className="flex flex-wrap items-center justify-center gap-2 py-6 min-h-[90px] border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-4">
                {activeQuestion.type === 'completion' ? (
                  /* Completion gaps view */
                  <div className="flex flex-wrap items-center justify-center gap-2 text-2xl md:text-3xl font-serif">
                    {(() => {
                      let blankGlobalIdx = 0;
                      return activeQuestion.displayText.split(' ').map((word, wIdx) => (
                        <div key={wIdx} className="inline-flex items-baseline gap-1">
                          {word.split('...').map((part, pIdx, arr) => {
                            const isBlank = pIdx < arr.length - 1;
                            const currentBlankIdx = isBlank ? blankGlobalIdx++ : -1;
                            return (
                              <React.Fragment key={pIdx}>
                                <span className="text-slate-200">{part}</span>
                                {isBlank && (
                                  <span
                                    onClick={() => {
                                      const id = activeCompletionBlankIds[currentBlankIdx];
                                      if (id) handleRemoveAnswerLetter(id, currentBlankIdx);
                                    }}
                                    className={`inline-block border-b-2 border-amber-500 px-3 min-w-[40px] text-center cursor-pointer transition ${
                                      activeCompletionBlanks[currentBlankIdx]
                                        ? 'text-rose-400 font-bold'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {activeCompletionBlanks[currentBlankIdx] || '...'}
                                  </span>
                                )}
                              </React.Fragment>
                            );
                          })}
                          {wIdx < activeQuestion.displayText.split(' ').length - 1 && <span className="w-3" />}
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  /* Standard arrangement blocks */
                  selectedLetterIds.map((id, index) => {
                    const l = shuffledLetters.find((item) => item.id === id);
                    if (!l) return null;
                    return (
                      <motion.div
                        key={id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={() => handleRemoveAnswerLetter(id, index)}
                        className={`px-4 py-2.5 rounded-xl font-bold font-serif text-lg md:text-xl shadow cursor-pointer select-none ${
                          l.val === '-'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-amber-500 text-slate-950 border border-transparent'
                        }`}
                      >
                        {l.val === '-' ? t('exercises.spaceLabel', 'مسافة ␣') : l.val}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Letter Choice Pool */}
          {!checked && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <p className="text-xs font-bold text-slate-500">{t('exercises.chooseLettersInstruction', 'اختر الحروف بترتيبها الصحيح لتجميع الكلمة:')}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {shuffledLetters.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleLetterClick(l.id, l.val)}
                    disabled={l.used}
                    className={`px-4 py-3 rounded-xl font-bold font-serif text-lg md:text-xl shadow select-none transition ${
                      l.used
                        ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed scale-95'
                        : l.val === '-'
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-110'
                    }`}
                  >
                    {l.val === '-' ? t('exercises.spaceLabel', 'مسافة ␣') : l.val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback & Actions Dashboard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3">
              {isCorrectAnswer === true && (
                <div className="text-emerald-700 font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  {t('exercises.greatAnswerGenius', 'أحسنت الإجابة يا عبقري! يمكنك الانتقال للموديل التالي.')}
                </div>
              )}
              {isCorrectAnswer === false && (
                <div className="space-y-1">
                  <div className="text-rose-800 font-bold flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    {t('exercises.unsuccessfulTry', 'محاولة غير موفقة! حاول مرة أخرى بالضغط على زر تصفير.')}
                  </div>
                  {showAnswerHint && (
                    <div className="text-xs text-amber-800 font-sans">
                      * {t('exercises.correctAnswerIs', 'الإجابة الصحيحة هي:')} <strong>{activeQuestion.correct.join(` ${t('exercises.orWord', 'أو')} `)}</strong>
                    </div>
                  )}
                </div>
              )}
              {isCorrectAnswer === null && (
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  {t('exercises.arrangeLettersAndCheck', 'رتب الحروف بالكامل ثم اضغط على زر تحقق لتسجيل الإجابة.')}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {checked ? (
                <>
                  {activeQuestion.retryCondition === 'نعم' && !isCorrectAnswer && (
                    <button
                      onClick={handleRetry}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t('exercises.retryBtn', 'إعادة المحاولة')}
                    </button>
                  )}
                  {activeQuestion.showCorrectAnswer === 'نعم' && !isCorrectAnswer && !showAnswerHint && (
                    <button
                      onClick={() => setShowAnswerHint(true)}
                      className="bg-amber-100 text-amber-900 font-bold px-4 py-3 rounded-xl text-sm transition"
                    >
                      {t('exercises.showCorrectAnswerBtn', 'عرض الإجابة الصحيحة')}
                    </button>
                  )}
                  {/* Next Question Loader */}
                  {(isCorrectAnswer || activeQuestion.condition === 'نعم') && (
                    <button
                      onClick={() => loadQuestionForTopic(activeTopicRow, activeQuestion.index)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-amber-500/10 flex items-center gap-1"
                    >
                      {t('exercises.newQuestionBtn', 'سؤال جديد')}
                      <ArrowRight className="w-4 h-4 shrink-0 rotate-180" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleCheckAnswer}
                  disabled={recording}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  {t('exercises.checkMyAnswerBtn', 'تحقق من إجابتي')}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Switcher Modal */}
      {onSelectExercise && (
        <ExerciseSwitcherModal
          isOpen={showSwitcher}
          onClose={() => setShowSwitcher(false)}
          onSelectExercise={onSelectExercise}
          currentExercise={ExerciseType.WORDS}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fadeIn select-none"
          dir="rtl"
        >
          {/* Header Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={() => {
                setLightboxImage(null);
                setZoomScale(1);
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition shadow-md flex items-center justify-center"
              title={t('exercises.close', 'إغلاق')}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg">
              <button
                onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 4))}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                title={t('exercises.zoomIn', 'تكبير')}
              >
                <ZoomIn className="w-4 h-4" />
                <span>{t('exercises.zoomIn', 'تكبير')}</span>
              </button>
              
              <button
                onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                title={t('exercises.zoomOut', 'تصغير')}
              >
                <ZoomOut className="w-4 h-4" />
                <span>{t('exercises.zoomOut', 'تصغير')}</span>
              </button>

              <button
                onClick={() => setZoomScale(1)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition text-xs font-bold"
                title={t('exercises.resetZoom', 'إعادة تعيين 🔄')}
              >
                {t('exercises.resetZoom', 'إعادة تعيين 🔄')}
              </button>

              <span className="text-white/80 text-xs px-2 font-mono" dir="ltr">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>
          </div>

          {/* Image Container */}
          <div className="w-full h-full flex items-center justify-center overflow-auto mt-16 pb-8">
            <div className="max-w-full max-h-full flex items-center justify-center p-8">
              <img
                src={lightboxImage}
                alt={t('exercises.lightboxPreviewAlt', 'معاينة الصورة مكبرة')}
                className="max-w-[90vw] max-h-[75vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 ease-out"
                style={{ 
                  transform: `scale(${zoomScale})`,
                  cursor: zoomScale > 1 ? 'grab' : 'zoom-in'
                }}
              />
            </div>
          </div>
          
          <div className="absolute bottom-4 text-center text-white/60 text-xs font-medium pointer-events-none">
            {t('exercises.zoomControlsNotice', 'يمكنك استخدام أدوات التحكم في الأعلى لتكبير وتصغير الصورة')}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] max-w-sm w-full px-4 animate-fadeIn">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-right backdrop-blur-md ${
            notification.type === 'success' 
              ? 'bg-emerald-500/95 border-emerald-400 text-white shadow-emerald-500/10' 
              : notification.type === 'error'
              ? 'bg-rose-500/95 border-rose-400 text-white shadow-rose-500/10'
              : 'bg-slate-800/95 border-slate-700 text-white shadow-slate-950/20'
          }`} dir="rtl">
            <div className="bg-white/20 p-2 rounded-xl shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : notification.type === 'error' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs md:text-sm font-bold flex-1 leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
