/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { callGasApi } from '../utils/api';
import { Student, OrderingLessonTopic, OrderingQuestion, ExerciseType } from '../types';
import { ArrowRight, RotateCcw, Check, Sparkles, AlertCircle, Volume2, Image as ImageIcon, CheckCircle, HelpCircle, Gamepad2, BookOpen, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import ExerciseSwitcherModal from './ExerciseSwitcherModal';

interface ExerciseWordsProps {
  student: Student;
  onBack: () => void;
  onSelectExercise?: (type: ExerciseType) => void;
}

export default function ExerciseWords({ student, onBack, onSelectExercise }: ExerciseWordsProps) {
  const [topics, setTopics] = useState<OrderingLessonTopic[]>([]);
  const [activeTopicRow, setActiveTopicRow] = useState<number | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<OrderingQuestion | null>(null);

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

  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
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
      setError(err.message || 'تعذر تحميل دروس تركيب الكلمات.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (rowNum: number) => {
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
          alert('تهانينا الكبيرة يا بطل! لقد أتممت جميع أسئلة هذا الدرس بنجاح! 🎉');
          setActiveTopicRow(null);
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
        setError('لا توجد أسئلة نشطة في هذا الدرس حالياً.');
      }
    } catch (err: any) {
      setError(err.message || 'فشل جلب سؤال جديد.');
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
      }
    } else {
      // Classic arrange layout
      setShuffledLetters((prev) =>
        prev.map((item) => (item.id === id ? { ...item, used: true } : item))
      );
      setSelectedLetterIds((prev) => [...prev, id]);
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
      alert('يرجى ترتيب الحروف وملء الفراغات أولاً يا بطل!');
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

      // Record answers score in sheets database
      await callGasApi('recordAnswer', {
        studentId: student.id,
        studentName: student.name,
        topic: activeQuestion!.topic,
        questionIndex: activeQuestion!.index,
        isCorrect: match,
      });

    } catch (err: any) {
      alert(`خطأ أثناء تسجيل الإجابة: ${err.message}`);
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

  const handleResetTopic = async (rowNum: number, topicName: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في إعادة المحاولة وتصفير تقدمك في موضوع "${topicName}"؟`)) {
      return;
    }

    try {
      setLoading(true);
      await callGasApi('resetLesson', { studentId: student.id, topic: topicName });
      alert('تمت تصفير تقدم الدرس بنجاح!');
      fetchLessonTopics();
    } catch (err: any) {
      alert(`خطأ أثناء تصفير التقدم: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const normalizeAudioUrl = (url: string): string => {
    if (!url) return '';
    // Strip hash or trailing #audio if present
    const cleanUrl = url.split('#')[0].trim();
    const id = getGoogleDriveId(cleanUrl);
    
    if (id) {
      // Direct high-performance Google Drive stream/download link that bypasses any local proxies
      return `https://docs.google.com/uc?export=download&id=${id}`;
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
              <span className="text-xs text-amber-600 font-bold block">القسم الثاني: تركيب الكلمات والجمل</span>
              <h1 className="text-2xl font-black text-slate-900 font-sans">تمرين ترتيب الحروف والكلمات 🔤</h1>
              <p className="text-slate-500 text-xs">
                اختر درساً مناسباً من القائمة أدناه للبدء بحل تمارين تجميع الحروف، ترتيب الجمل والتركيب اللغوي الممتع.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {onSelectExercise && (
                <button
                  onClick={() => setShowSwitcher(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-500" />
                  تبديل التمرين 🎮
                </button>
              )}
              <button
                onClick={onBack}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                الرئيسية 🏠
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-500">جاري تحميل المواضيع والدروس...</span>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
              {topics.map((topic, idx) => (
                <div
                  key={idx}
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
                          مكتمل
                        </span>
                        {topic.allowReset && (
                          <button
                            onClick={() => handleResetTopic(topic.row, topic.topic)}
                            className="bg-slate-900 text-white font-bold p-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                            title="إعادة الدرس والتصفير"
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
                        فتح الدرس
                        <ArrowRight className="w-4 h-4 shrink-0 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 text-right animate-fadeIn" dir="rtl">
      {/* Gameplay Header */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-xs text-amber-600 font-bold block mb-1">القسم الثاني: تركيب الكلمات</span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans">{activeQuestion?.topic}</h1>
        </div>
        
        <div className="flex gap-2 shrink-0">
          {onSelectExercise && (
            <button
              onClick={() => setShowSwitcher(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              تبديل التمرين 🎮
            </button>
          )}
          <button
            onClick={() => setActiveTopicRow(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
          >
            رجوع للدروس 📂
          </button>
          <button
            onClick={onBack}
            className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
          >
            الرئيسية 🏠
          </button>
        </div>
      </div>

      {questionLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-slate-100 shadow-md">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-sans">جاري تحميل السؤال التالي...</p>
        </div>
      ) : activeQuestion ? (
        <div className="space-y-6">
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
                          <span>جاري تحميل الصوت...</span>
                        </>
                      ) : playingAudioSrc === url ? (
                        <span>⏸️ إيقاف الصوت</span>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 text-amber-400" />
                          <span>استمع للمقطع الصوتي 🔊</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="inline-flex bg-white p-2 rounded-2xl shadow-md border border-slate-100">
                    <img
                      src={normalizeImageUrl(url)}
                      alt="مرفق السؤال"
                      className="max-h-48 object-contain rounded-xl max-w-xs cursor-zoom-in"
                      onClick={() => window.open(normalizeImageUrl(url), '_blank')}
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
                  تم تجميع الكلمة بخط متصل ممتاز! 🏅
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
                        {l.val === '-' ? 'مسافة ␣' : l.val}
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
              <p className="text-xs font-bold text-slate-500">اختر الحروف بترتيبها الصحيح لتجميع الكلمة:</p>
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
                    {l.val === '-' ? 'مسافة ␣' : l.val}
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
                  أحسنت الإجابة يا عبقري! يمكنك الانتقال للموديل التالي.
                </div>
              )}
              {isCorrectAnswer === false && (
                <div className="space-y-1">
                  <div className="text-rose-800 font-bold flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    محاولة غير موفقة! حاول مرة أخرى بالضغط على زر تصفير.
                  </div>
                  {showAnswerHint && (
                    <div className="text-xs text-amber-800 font-sans">
                      * الإجابة الصحيحة هي: <strong>{activeQuestion.correct.join(' أو ')}</strong>
                    </div>
                  )}
                </div>
              )}
              {isCorrectAnswer === null && (
                <div className="text-slate-500 text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  رتب الحروف بالكامل ثم اضغط على زر تحقق لتسجيل الإجابة.
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
                      إعادة المحاولة
                    </button>
                  )}
                  {activeQuestion.showCorrectAnswer === 'نعم' && !isCorrectAnswer && !showAnswerHint && (
                    <button
                      onClick={() => setShowAnswerHint(true)}
                      className="bg-amber-100 text-amber-900 font-bold px-4 py-3 rounded-xl text-sm transition"
                    >
                      عرض الإجابة الصحيحة
                    </button>
                  )}
                  {/* Next Question Loader */}
                  {(isCorrectAnswer || activeQuestion.condition === 'نعم') && (
                    <button
                      onClick={() => loadQuestionForTopic(activeTopicRow, activeQuestion.index)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-amber-500/10 flex items-center gap-1"
                    >
                      سؤال جديد
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
                  تحقق من إجابتي
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
    </div>
  );
}
