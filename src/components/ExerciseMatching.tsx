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
import { useLanguage } from '../context/LanguageContext';

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
          <span className="text-[10px] text-slate-500 font-bold">جاري تحميل الصورة...</span>
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
          ⚠️ تعذر تحميل الصورة
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

  // Soft, clean sound when a connection is made
  public static playConnect(volume: number = 0.8) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Play a short pleasant rising chime
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

  // Harmonious, cheerful sound when all connected items are correct
  public static playSuccess(volume: number = 0.8) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Arpeggio of major triad (C major: C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
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

  // Soft warning double-beep sound when there are errors
  public static playFailure(volume: number = 0.8) {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const beeps = [0, 0.12];

      beeps.forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth'; // Slightly buzzy but softened by lowpass
        osc.frequency.setValueAtTime(180, now + delay); // low warning tone

        // Lowpass filter to make it gentle and less harsh
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

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getParsedCorrectMatches(q: MatchQuestion | null): Record<string, string[]> {
  if (!q || !q.correctMatches) return {};
  if (typeof q.correctMatches === 'string') {
    try {
      return JSON.parse(q.correctMatches);
    } catch (e) {
      console.error("Error parsing correctMatches:", e);
      return {};
    }
  }
  return q.correctMatches as unknown as Record<string, string[]>;
}

export default function ExerciseMatching({ student, onBack, onSelectExercise }: ExerciseMatchingProps) {
  const { t } = useLanguage();
  const [lessons, setLessons] = useState<MatchLesson[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(-1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Lesson statuses (isCompleted, retriesUsed)
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, { isCompleted: boolean; retriesUsed: number }>>({});
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [retryingLesson, setRetryingLesson] = useState<string | null>(null);

  // Game state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeResults, setActiveResults] = useState<string>('');
  const [checked, setChecked] = useState(false);
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null);
  const [loadingAudioSrc, setLoadingAudioSrc] = useState<string | null>(null);
  const [detectedMediaType, setDetectedMediaType] = useState<Record<string, 'audio' | 'image' | 'text'>>({});
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

  const getItemRenderType = (item: { type: string; value: string }): 'audio' | 'image' | 'text' => {
    const val = item.value ? item.value.trim() : '';
    if (!val) return 'text';

    // 1. If type has been dynamically detected or explicitly mapped, use it FIRST!
    if (detectedMediaType[val]) {
      return detectedMediaType[val];
    }

    // 2. Check for explicit hash overrides inside the value itself
    const lowercaseVal = val.toLowerCase();
    if (lowercaseVal.includes('#audio')) return 'audio';
    if (lowercaseVal.includes('#image')) return 'image';
    if (lowercaseVal.includes('#text')) return 'text';

    // 3. Fall back to rawType check - if explicitly specified in database, ALWAYS trust it!
    const lowercaseType = item.type ? item.type.toLowerCase().trim() : '';
    if (lowercaseType === 'audio' || lowercaseType === 'صوت') return 'audio';
    if (lowercaseType === 'image' || lowercaseType === 'صورة') return 'image';
    if (lowercaseType === 'text' || lowercaseType === 'نص') return 'text';

    // 4. Fall back to determineTypeFromUrl
    const determined = determineTypeFromUrl(val);
    if (determined !== 'unknown') return determined;

    // 5. Default heuristics for URLs
    if (val.startsWith('http://') || val.startsWith('https://')) {
      if (val.includes('drive.google.com') || val.includes('docs.google.com')) {
        return 'audio'; // default Google Drive to audio initially
      }
      return 'image';
    }

    return 'text';
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
    const trimmed = stripUrlHash(url.trim());
    const id = getGoogleDriveId(trimmed);
    
    if (id) {
      // Use Google Drive's public thumbnail URL directly (high-quality sz=w1200) - loads instantly and bypasses proxy!
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
    }
    return trimmed;
  };

  useEffect(() => {
    if (!activeQuestion) return;

    const itemsToCheck = [
      ...activeQuestion.leftItems,
      ...activeQuestion.shuffledRight
    ];

    itemsToCheck.forEach(item => {
      const url = item.value ? item.value.trim() : '';
      if (!url) return;
      if (detectedMediaType[url]) return;

      // Prioritize explicit item types immediately to prevent unnecessary HEAD requests
      const rawType = item.type ? item.type.toLowerCase().trim() : '';
      if (rawType === 'audio' || rawType === 'صوت') {
        setDetectedMediaType(prev => ({ ...prev, [url]: 'audio' }));
        return;
      }
      if (rawType === 'image' || rawType === 'صورة') {
        setDetectedMediaType(prev => ({ ...prev, [url]: 'image' }));
        return;
      }
      if (rawType === 'text' || rawType === 'نص') {
        setDetectedMediaType(prev => ({ ...prev, [url]: 'text' }));
        return;
      }

      const determined = determineTypeFromUrl(url);
      if (determined !== 'unknown') {
        setDetectedMediaType(prev => ({ ...prev, [url]: determined }));
        return;
      }

      // If it's a web URL but we don't know the type, fetch HEAD to inspect Content-Type
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
              // If it's a valid URL, default to audio rather than raw text link
              setDetectedMediaType(prev => ({ ...prev, [url]: 'audio' }));
            }
          })
          .catch(() => {
            setDetectedMediaType(prev => ({ ...prev, [url]: 'audio' }));
          });
      }
    });
  }, [activeQuestion, activeQuestionIndex, activeLessonIndex]);

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

    const lefts: ClientLeftItem[] = activeQuestion.leftItems.map((item, idx) => {
      const parsed = getItemTypeAndValue(item.type, item.value);
      return {
        id: (idx + 1).toString(),
        item: parsed
      };
    });

    const rights: ClientRightItem[] = activeQuestion.shuffledRight.map((item, idx) => {
      const parsed = getItemTypeAndValue(item.type, item.value);
      return {
        id: activeQuestion.rightIds[idx],
        item: parsed
      };
    });

    setShuffledLeftItems(shuffleArray(lefts));
    setShuffledRightItems(shuffleArray(rights));
  }, [activeQuestionIndex, activeLessonIndex, lessons, activeQuestion]);

  const fetchMatchingLessons = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await callGasApi<MatchLesson[]>('getLessonsFromMatches', { studentId: student.id });
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

    const correctMatches = getParsedCorrectMatches(activeQuestion);

    // Render active drag line
    if (dragStartPos.current && currentLinePos) {
      ctx.beginPath();
      ctx.moveTo(dragStartPos.current.x, dragStartPos.current.y);
      ctx.lineTo(currentLinePos.x, currentLinePos.y);
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
        SoundEffects.playConnect(volume);
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
  }, [connections, activeQuestion, checked, volume]);

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

  const stripUrlHash = (url: string): string => {
    if (!url) return '';
    const hashIdx = url.indexOf('#');
    return hashIdx !== -1 ? url.substring(0, hashIdx) : url;
  };

  const getItemTypeAndValue = (rawType: string, value: string): { type: 'audio' | 'image' | 'text'; value: string } => {
    const trimmed = value ? value.trim() : '';
    if (!trimmed) return { type: 'text', value: '' };

    const lowercase = trimmed.toLowerCase();
    
    // 1. Check for explicit hash overrides inside the value itself (Highest priority!)
    if (lowercase.includes('#audio')) {
      return { type: 'audio', value: stripUrlHash(trimmed) };
    }
    if (lowercase.includes('#image')) {
      return { type: 'image', value: stripUrlHash(trimmed) };
    }
    if (lowercase.includes('#text')) {
      return { type: 'text', value: stripUrlHash(trimmed) };
    }

    // 2. Check if rawType from spreadsheet is explicitly specified
    if (rawType) {
      const rt = rawType.toLowerCase().trim();
      if (rt === 'audio' || rt === 'صوت') {
        return { type: 'audio', value: trimmed };
      }
      if (rt === 'image' || rt === 'صورة') {
        return { type: 'image', value: trimmed };
      }
      if (rt === 'text' || rt === 'نص') {
        return { type: 'text', value: trimmed };
      }
    }

    // 3. If it's a web URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Check audio extensions
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
        return { type: 'audio', value: trimmed };
      }

      // Check image extensions
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
        return { type: 'image', value: trimmed };
      }

      // Check Google Drive audio indicators.
      // Since Google Drive audio is extremely common for matching and might not have audio extensions,
      // we default any other Google Drive link to audio unless it has an image extension above.
      if (
        lowercase.includes('drive.google.com') ||
        lowercase.includes('docs.google.com') ||
        lowercase.includes('/uc?id=') ||
        lowercase.includes('export=download')
      ) {
        return { type: 'audio', value: trimmed };
      }

      // By default, if it's a URL but didn't match anything else, we can fallback to image
      return { type: 'image', value: trimmed };
    }

    // 4. Otherwise, treat as pure text
    return { type: 'text', value: trimmed };
  };

  const isAudioUrl = (url: string): boolean => {
    return getItemTypeAndValue('', url).type === 'audio';
  };

  const normalizeAudioUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = stripUrlHash(url.trim());
    const id = getGoogleDriveId(trimmed);
    
    if (id) {
      return `/api/proxy-audio?id=${id}`;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return `/api/proxy-audio?url=${encodeURIComponent(trimmed)}`;
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
      setLoadingAudioSrc(null);
      return;
    }

    // If another audio is playing, stop it first
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    setPlayingAudioSrc(url);
    setLoadingAudioSrc(url);
    const audio = new Audio(normalizedUrl);
    audio.volume = volume;
    currentAudioRef.current = audio;

    audio.addEventListener('playing', () => {
      setLoadingAudioSrc(null);
    });

    audio.play().catch(err => {
      console.error("Error playing audio:", err);
      if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        alert("تنبيه: تعذر تشغيل الملف الصوتي من Google Drive.\nيرجى التأكد من أن الملف الصوتي مشترك بصيغة 'أي شخص لديه الرابط' (Anyone with the link can view) في حساب Google Drive الخاص بك.");
      }
      setPlayingAudioSrc(null);
      setLoadingAudioSrc(null);
      currentAudioRef.current = null;
    });

    audio.addEventListener('error', (e) => {
      console.error("Audio error event:", e);
      if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        alert("تنبيه: تعذر تحميل أو تشغيل الملف الصوتي من Google Drive.\nيرجى التأكد من أن الملف الصوتي مشترك بصيغة 'أي شخص لديه الرابط' (Anyone with the link can view) في حساب Google Drive الخاص بك وأن الرابط صحيح.");
      }
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

  const handleCheckMatches = async () => {
    if (!activeQuestion) return;

    const correctMatches = getParsedCorrectMatches(activeQuestion);
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

    if (errors === 0) {
      SoundEffects.playSuccess(volume);
    } else {
      SoundEffects.playFailure(volume);
    }

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
        <p className="text-slate-500 font-sans">{t('exercises.loadingMatchingExercise', 'جاري تحميل تمرين التوصيل والمطابقة...')}</p>
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
          {t('exercises.backToHomeBtn', 'العودة للرئيسية 🏠')}
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
            <span className="text-xs text-amber-600 font-bold block">{t('exercises.matchingSectionTitle', 'القسم الثالث: المطابقة والتوصيل')}</span>
            <h1 className="text-2xl font-black text-slate-900 font-sans">{t('exercises.matchingHeaderTitle', 'تمارين التوصيل والمطابقة الذكية 🔗')}</h1>
            <p className="text-slate-500 text-sm">
              {t('exercises.matchingHeaderDesc', 'اختر أحد الدروس المخصصة أدناه للبدء بتمرين التوصيل اللغوي الذكي ومطابقة العناصر بالصوت والصورة.')}
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

        {/* Toggle Switch for Completed Lessons */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-3 text-right">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{t('exercises.filterMatchingLessonsTitle', 'تصفية قائمة دروس التوصيل')}</h4>
            <p className="text-[11px] text-slate-500">
              {t('exercises.filterLessonsDesc', 'يمكنك إخفاء الدروس التي أتممتها بالكامل للتركيز على الدروس الجديدة، أو إظهارها لمراجعتها وإعادة التدرب.')}
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
            {showCompleted ? t('exercises.hideCompletedLessons', 'إخفاء الدروس المكتملة 👁️‍🗨️') : t('exercises.showCompletedLessons', 'إظهار الدروس المكتملة 👁️')}
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
                            t('exercises.retryBtn', '🔄 إعادة المحاولة')
                          )}
                          <span className="text-[10px] opacity-75">({remainingRetries} {t('exercises.remaining', 'متبقي')})</span>
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
                          {t('exercises.openLessonBtn', 'فتح الدرس')}
                          <ArrowRight className="w-4 h-4 rotate-180 shrink-0" />
                        </button>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1 shadow-2xs">
                          {t('exercises.completedBadge', 'مكتمل ✅')}
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
                {shuffledLeftItems.map(({ id, item }) => {
                  const renderType = getItemRenderType(item);
                  return (
                    <div
                      key={id}
                      data-id={id}
                      onMouseDown={(e) => handleStartDraw(e, id)}
                      onTouchStart={(e) => handleStartDraw(e, id)}
                      className={getLeftCardClassName(id)}
                    >
                      {renderType === 'audio' ? (
                        <button
                          onClick={() => handlePlayAudio(item.value)}
                          className="play-btn bg-slate-900 text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition min-w-[75px] justify-center"
                        >
                          {loadingAudioSrc === item.value ? (
                            <>
                              <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                              <span className="text-[10px]">تحميل...</span>
                            </>
                          ) : playingAudioSrc === item.value ? (
                            '⏸️ إيقاف'
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                              <span>▶️ استمع</span>
                            </>
                          )}
                        </button>
                      ) : renderType === 'image' ? (
                        <ImageWithLoader src={normalizeImageUrl(item.value)} alt="مرفق" className="max-h-20 md:max-h-24 object-contain rounded-lg" />
                      ) : (
                        item.value
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right node cards */}
              <div ref={rightItemsContainerRef} className="space-y-6 flex flex-col justify-center">
                <span className="text-[10px] md:text-xs font-bold text-slate-400 block mb-2">المجموعة الثانية (مستقبل الوصلة)</span>
                {shuffledRightItems.map(({ id, item }) => {
                  const renderType = getItemRenderType(item);
                  return (
                    <div
                      key={id}
                      data-id={id}
                      className={getRightCardClassName(id)}
                    >
                      {renderType === 'audio' ? (
                        <button
                          onClick={() => handlePlayAudio(item.value)}
                          className="play-btn bg-slate-900 text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition min-w-[75px] justify-center"
                        >
                          {loadingAudioSrc === item.value ? (
                            <>
                              <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                              <span className="text-[10px]">تحميل...</span>
                            </>
                          ) : playingAudioSrc === item.value ? (
                            '⏸️ إيقاف'
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                              <span>▶️ استمع</span>
                            </>
                          )}
                        </button>
                      ) : renderType === 'image' ? (
                        <ImageWithLoader src={normalizeImageUrl(item.value)} alt="مرفق" className="max-h-20 md:max-h-24 object-contain rounded-lg" />
                      ) : (
                        item.value
                      )}
                    </div>
                  );
                })}
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
                    const correctMatches = getParsedCorrectMatches(activeQuestion);
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
                    const correctMatches = getParsedCorrectMatches(activeQuestion);
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
