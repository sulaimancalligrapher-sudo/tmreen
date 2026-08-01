/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { callGasApi, transformGoogleDriveImageUrl } from '../utils/api';
import { Student, HomeContentItem, ExerciseType, GeneralData } from '../types';
import {
  Sparkles,
  Compass,
  MoveLeft,
  Gamepad2,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Maximize2,
  ExternalLink,
  Megaphone,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  Info,
  UserCheck,
  Globe,
  GraduationCap,
  Tv,
  Bell,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface HomeDashboardProps {
  student: Student;
  generalData: GeneralData | null;
  onSelectExercise: (type: ExerciseType) => void;
  onNavigateTo: (page: string) => void;
}

// ==========================================
// 📸 SUB-COMPONENT: Photo Slideshow
// ==========================================
interface PhotoSlideshowProps {
  photos: HomeContentItem[];
  onOpenLightbox: (index: number) => void;
}

function PhotoSlideshow({ photos, onOpenLightbox }: PhotoSlideshowProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) return null;

  const current = photos[currentIndex] || photos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          {t('home.photoGalleryTitle', 'معرض الصور (سلايدشو) 🖼️')}
        </h2>
        {photos.length > 1 && (
          <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full border border-indigo-100">
            {currentIndex + 1} من {photos.length}
          </span>
        )}
      </div>

      {/* Main Slideshow Player */}
      <div 
        className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 group aspect-[16/9] max-h-[420px] flex items-center justify-center cursor-zoom-in"
        onClick={() => onOpenLightbox(currentIndex)}
      >
        <img
          src={transformGoogleDriveImageUrl(current.content)}
          alt={current.title || 'صورة'}
          className="w-full h-full object-contain transition duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800';
          }}
        />

        {/* Title overlay */}
        {current.title && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 sm:p-6 text-right">
            <p className="text-white font-extrabold text-sm sm:text-base">{current.title}</p>
          </div>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(currentIndex);
          }}
          className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-2xl backdrop-blur border border-white/20 opacity-90 hover:opacity-100 transition shadow-lg flex items-center gap-1.5 text-xs font-bold"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline">تكبير الشاشة</span>
        </button>

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white p-3 rounded-full transition backdrop-blur border border-white/20 shadow-xl"
              title="الصورة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white p-3 rounded-full transition backdrop-blur border border-white/20 shadow-xl"
              title="الصورة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {photos.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-16 w-24 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                idx === currentIndex
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-md'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={transformGoogleDriveImageUrl(p.content)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 🎥 SUB-COMPONENT: Video Gallery Slideshow
// ==========================================
interface VideoSlideshowProps {
  videos: HomeContentItem[];
  onPlayVideo: (url: string) => void;
  getYoutubeId: (url: string) => string;
  isDirectVideo: (url: string) => boolean;
}

function VideoSlideshow({ videos, onPlayVideo, getYoutubeId, isDirectVideo }: VideoSlideshowProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (videos.length === 0) return null;

  const current = videos[currentIndex] || videos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const ytId = getYoutubeId(current.content);
  const coverUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl font-bold text-slate-900 font-sans flex items-center gap-2">
          <VideoIcon className="w-5 h-5 text-rose-500" />
          {t('home.videoGalleryTitle', 'المقاطع المرئية والتعليمية 🎥')}
        </h2>
        {videos.length > 1 && (
          <span className="text-xs font-extrabold bg-rose-50 text-rose-700 px-3.5 py-1 rounded-full border border-rose-100">
            {currentIndex + 1} من {videos.length}
          </span>
        )}
      </div>

      {/* Video Main Slide Player Box */}
      <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800 aspect-[16/9] max-h-[420px] flex items-center justify-center group">
        {isDirectVideo(current.content) ? (
          <video
            src={current.content}
            preload="metadata"
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img
            src={coverUrl}
            alt={current.title || 'فيديو'}
            className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 transition duration-300"
          />
        )}

        {/* Play Overlay Button */}
        <button
          onClick={() => onPlayVideo(current.content)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group cursor-pointer"
        >
          <div className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-5 rounded-full shadow-2xl group-hover:scale-110 transition flex items-center justify-center gap-2">
            <Play className="w-8 h-8 fill-slate-950" />
          </div>
        </button>

        {/* Title overlay */}
        {current.title && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 sm:p-6 text-right pointer-events-none">
            <p className="text-white font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" />
              {current.title}
            </p>
          </div>
        )}

        {/* Navigation Arrows */}
        {videos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-white p-3 rounded-full transition backdrop-blur border border-white/20 shadow-xl"
              title="المقطع السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-white p-3 rounded-full transition backdrop-blur border border-white/20 shadow-xl"
              title="المقطع التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Video Thumbnails Strip */}
      {videos.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {videos.map((v, idx) => {
            const vYtId = getYoutubeId(v.content);
            const vCover = vYtId
              ? `https://img.youtube.com/vi/${vYtId}/hqdefault.jpg`
              : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-16 w-28 rounded-2xl overflow-hidden border-2 transition shrink-0 bg-slate-900 ${
                  idx === currentIndex
                    ? 'border-rose-500 ring-2 ring-rose-500/30 scale-105 shadow-md'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                {isDirectVideo(v.content) ? (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center text-amber-400">
                    <VideoIcon className="w-6 h-6" />
                  </div>
                ) : (
                  <img src={vCover} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
interface LightboxModalProps {
  images: Array<{ url: string; title: string }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function LightboxModal({ images, currentIndex, onClose, onNavigate }: LightboxModalProps) {
  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="relative max-w-4xl w-full flex flex-col items-center justify-center space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 left-0 bg-white/10 hover:bg-white/25 text-white p-2.5 rounded-full transition"
            title="إغلاق المعاينة"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative flex items-center justify-center w-full">
            <img
              src={transformGoogleDriveImageUrl(currentImage.url)}
              alt={currentImage.title}
              className="max-h-[75vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
                  className="absolute right-3 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition border border-white/20 backdrop-blur shadow-lg"
                  title="الصورة السابقة"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={() => onNavigate((currentIndex + 1) % images.length)}
                  className="absolute left-3 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition border border-white/20 backdrop-blur shadow-lg"
                  title="الصورة التالية"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentImage.title && (
              <div className="text-white text-sm font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-center">
                {currentImage.title}
              </div>
            )}
            {images.length > 1 && (
              <div className="text-amber-300 text-xs font-extrabold bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                {currentIndex + 1} من {images.length}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================
// 🏠 MAIN COMPONENT: HomeDashboard
// ==========================================
export default function HomeDashboard({ student, generalData, onSelectExercise, onNavigateTo }: HomeDashboardProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<HomeContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [activeEnlargedImage, setActiveEnlargedImage] = useState<{ url: string; title: string } | null>(null);
  const [activeWebLessonFrame, setActiveWebLessonFrame] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        // Try to load cached content for instant display without slowness
        const cacheKey = `cached_home_content_${student.id || student.name || 'ALL'}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached);
            if (Array.isArray(parsedCache) && parsedCache.length > 0) {
              setItems(parsedCache);
              setLoading(false);
            }
          } catch (e) {}
        } else {
          setLoading(true);
        }

        setError('');
        const rawData = await callGasApi<any>('getHomeContent', {
          username: student.name || (student as any).studentName || student.id || (student as any).studentId || '',
          isAdmin: true
        });

        let parsedItems: HomeContentItem[] = [];

        if (Array.isArray(rawData)) {
          const tempList: HomeContentItem[] = [];

          rawData.forEach((item: any) => {
            let type = '';
            let title = '';
            let rawContent = '';
            let targetStudent = 'ALL';
            let status = 'active';

            let rawTypeStr = '';
            if (Array.isArray(item)) {
              rawTypeStr = (item[0] || '').toString().trim();
              title = (item[1] || '').toString().trim();
              rawContent = (item[2] || '').toString().trim();
              targetStudent = (item[3] || 'ALL').toString().trim();
              status = (item[4] || 'active').toString().trim();
            } else if (typeof item === 'object' && item !== null) {
              rawTypeStr = (item.type || '').toString().trim();
              title = (item.title || '').toString().trim();
              rawContent = (item.content || '').toString().trim();
              targetStudent = (item.targetStudent || item.Target_Student || 'ALL').toString().trim();
              status = (item.status || item.Status || 'active').toString().trim();
            }

            const cleanType = rawTypeStr.toLowerCase();
            if (cleanType === 'إعلان' || cleanType === 'اعlan' || cleanType === 'اعلان' || cleanType === 'announcement') type = 'announcement';
            else if (cleanType === 'صورة' || cleanType === 'صور' || cleanType === 'photo' || cleanType === 'image') type = 'photo';
            else if (cleanType === 'فيديو' || cleanType === 'مرئي' || cleanType === 'video') type = 'video';
            else if (cleanType === 'تعليمات' || cleanType === 'توجيه' || cleanType === 'instruction') type = 'instruction';
            else if (cleanType === 'رابط' || cleanType === 'روابط' || cleanType === 'link') type = 'link';
            else if (cleanType === 'درس' || cleanType === 'دروس' || cleanType === 'lesson' || cleanType === 'lesson_link' || cleanType === 'lesson link' || cleanType === 'رابط درس') type = 'lesson';
            else type = cleanType || 'announcement';

            if (!title && !rawContent) return;

            // Split multiple URLs separated by commas or linebreaks for photos, videos, links or lessons
            if ((type === 'photo' || type === 'video' || type === 'link' || type === 'lesson') && (rawContent.includes(',') || rawContent.includes('\n'))) {
              const parts = rawContent.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
              if (parts.length > 1) {
                parts.forEach((partUrl, subIdx) => {
                  tempList.push({
                    type,
                    title: parts.length > 1 ? `${title} (${subIdx + 1})` : title,
                    content: partUrl,
                    targetStudent,
                    status,
                  });
                });
                return;
              }
            }

            tempList.push({
              type,
              title,
              content: rawContent,
              targetStudent,
              status,
            });
          });

          // Extra safety check for student targeting
          const studentName = (student.name || (student as any).studentName || '').toLowerCase().trim();
          const studentId = (student.id || (student as any).studentId || '').toLowerCase().trim();

          parsedItems = tempList.filter((i) => {
            const statusStr = (i.status || 'active').toLowerCase().trim();
            if (statusStr === 'hidden' || statusStr === 'مخفي' || statusStr === 'inactive' || statusStr === 'غير نشط') {
              return false;
            }

            const rawTarget = (i.targetStudent || 'ALL').trim();
            const lowerTarget = rawTarget.toLowerCase();
            if (lowerTarget === 'all' || lowerTarget === '' || lowerTarget === '-') return true;

            // Check if EXCEPTION / EXCLUDE mode
            if (
              lowerTarget.startsWith('except:') ||
              lowerTarget.startsWith('all_except:') ||
              lowerTarget.startsWith('استثناء:') ||
              lowerTarget.startsWith('!')
            ) {
              const excludedList = lowerTarget
                .replace(/^(except:|all_except:|استثناء:|!)/i, '')
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

              const isExcluded = excludedList.some((ex) => {
                if (!ex) return false;
                if (studentName && (ex === studentName || ex.includes(studentName) || studentName.includes(ex))) return true;
                if (studentId && (ex === studentId || ex.includes(studentId) || studentId.includes(ex))) return true;
                return false;
              });

              return !isExcluded;
            }

            // Standard INCLUDE mode
            const targets = lowerTarget.split(',').map((t) => t.trim()).filter(Boolean);
            return targets.some((t) => {
              if (studentName && (t === studentName || t.includes(studentName) || studentName.includes(t))) return true;
              if (studentId && (t === studentId || t.includes(studentId) || studentId.includes(t))) return true;
              return false;
            });
          });
        }

        setItems(parsedItems);
        // Save to cache for instant load next time
        try {
          const cacheKey = `cached_home_content_${student.id || student.name || 'ALL'}`;
          localStorage.setItem(cacheKey, JSON.stringify(parsedItems));
        } catch (e) {}
      } catch (err: any) {
        console.warn('Home_Content fetch error:', err);
        setError('تعذر جلب بيانات ورقة Home_Content حالياً.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, [student.name, student.id]);

  const getAuthenticatedUrl = (rawUrl: string): string => {
    if (!rawUrl || !rawUrl.startsWith('http')) return rawUrl;
    try {
      const urlObj = new URL(rawUrl, window.location.href);
      if (student?.name && student?.id) {
        urlObj.searchParams.set('studentName', student.name);
        urlObj.searchParams.set('studentId', student.id);
        urlObj.searchParams.set('name', student.name);
        urlObj.searchParams.set('id', student.id);
        urlObj.searchParams.set('code', student.id);
        urlObj.searchParams.set('sName', student.name);
        urlObj.searchParams.set('sId', student.id);
      }
      return urlObj.toString();
    } catch (e) {
      return rawUrl;
    }
  };

  const handleLaunchButton = (url: string) => {
    if (!url || url === '#' || url === '-') return;
    if (url.startsWith('http')) {
      const authUrl = getAuthenticatedUrl(url);
      window.open(authUrl, '_blank', 'noreferrer');
    } else if (url.startsWith('#')) {
      const page = url.substring(1);
      onNavigateTo(page);
    } else {
      onNavigateTo(url);
    }
  };

  // Helper YouTube ID extractor
  const getYoutubeId = (url: string) => {
    if (!url) return '';
    let id = '';
    if (url.includes('v=')) {
      id = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('embed/')) {
      id = url.split('embed/')[1].split('?')[0];
    }
    return id;
  };

  const isDirectVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.ogg') ||
      lower.includes('/releases/download/') ||
      lower.includes('.mp4?') ||
      lower.includes('video/mp4')
    );
  };

  const getEmbedUrl = (url: string) => {
    const id = getYoutubeId(url);
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  // Group items by type
  const lessonItems = items.filter((i) => i.type === 'lesson' || i.type === 'درس');
  const announcementsAndInstructions = items.filter(
    (i) => i.type === 'announcement' || i.type === 'instruction' || i.type === 'إعلان' || i.type === 'اعلان' || i.type === 'تعليمات'
  );
  const photoItems = items.filter((i) => i.type === 'photo' || i.type === 'صورة' || i.type === 'صور');
  const videoItems = items.filter((i) => i.type === 'video' || i.type === 'فيديو' || i.type === 'مرئي');
  const linkItems = items.filter((i) => i.type === 'link' || i.type === 'رابط' || i.type === 'روابط');

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Dynamic Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-flex bg-amber-50 text-amber-700 px-3 py-0.5 rounded-full text-xs font-bold gap-1 items-center">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('home.welcomeBadge', 'مرحباً بك يا بطل المتميز! 🌟')}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-sans">
            {t('home.welcomeStudent', 'أهلاً بك،')} {student.name}! 👋
          </h1>
          <p className="text-slate-500 text-sm max-w-xl">
            {t('home.welcomeDesc', 'استعرض الإعلانات والتوجيهات الخاصة بك، وتدرّب في منصتك الذكية لإتقان مهارات اللغة العربية وقواعد الخط.')}
          </p>
        </div>

        {/* Primary Action */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigateTo('reports')}
            className="flex-1 md:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
          >
            {t('home.myPerformanceReport', 'تقرير أدائي اليومي 📊')}
          </button>
        </div>
      </div>

      {/* 🎬 FEATURED LESSON LINKS (روابط الدروس التعليمية - شكل مدمج وأنيق) */}
      {lessonItems.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-4 md:p-5 text-white shadow-lg relative overflow-hidden border border-emerald-400/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-2.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-300" />
                <h2 className="font-extrabold text-sm md:text-base text-white">{t('home.lessonLinksTitle', 'روابط الدروس التعليمية 📚')}</h2>
              </div>
              <span className="bg-white/20 backdrop-blur text-amber-200 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('home.ssoActiveStudent', 'الدخول الموحد مفعّل تلقائياً بالطالب:')} <strong>{student.name}</strong></span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {lessonItems.map((item, idx) => {
                const isVideo =
                  item.content.includes('youtube.com') ||
                  item.content.includes('youtu.be') ||
                  item.content.includes('embed') ||
                  isDirectVideo(item.content);
                const isPersonalized =
                  item.targetStudent && item.targetStudent.toUpperCase() !== 'ALL';

                return (
                  <div
                    key={idx}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 transition flex flex-col justify-between gap-2.5 group hover:border-white/30 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-xl text-amber-300 shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <h3 className="font-extrabold text-white text-xs sm:text-sm font-sans group-hover:text-amber-200 transition line-clamp-2">
                          {item.title || 'رابط الدرس التعليمي'}
                        </h3>
                      </div>
                      {isPersonalized && (
                        <span className="bg-amber-400/20 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30 shrink-0">
                          خاص
                        </span>
                      )}
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row gap-1.5">
                      {isVideo ? (
                        <button
                          onClick={() => setActiveVideoUrl(item.content)}
                          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{t('home.watchVideoLessonBtn', 'مشاهدة دروس الفيديو')}</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleLaunchButton(item.content)}
                            className="flex-1 bg-white hover:bg-emerald-50 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-[11px] transition flex items-center justify-center gap-1 shadow-md active:scale-95"
                            title="فتح بصفحة جديدة وتمرير كود الطالب تلقائياً"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{t('home.openDirectLinkBtn', 'فتح الرابط (دخول مباشر)')}</span>
                          </button>
                          <button
                            onClick={() =>
                              setActiveWebLessonFrame({
                                url: getAuthenticatedUrl(item.content),
                                title: item.title || 'رابط الدرس التعليمي',
                              })
                            }
                            className="bg-emerald-950/60 hover:bg-emerald-950 text-white font-extrabold px-2.5 py-1.5 rounded-xl text-[11px] transition flex items-center justify-center gap-1 border border-white/20 active:scale-95"
                            title="معاينة الدرس مباشرة داخل منصتك"
                          >
                            <Maximize2 className="w-3 h-3 text-amber-300" />
                            <span>{t('home.viewInPlatformBtn', 'عرض بالمنصة')}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 GATEWAY SECTION: Exercises (تمارين الدروس) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1 text-center md:text-right">
            <div className="inline-flex bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3.5 py-1 rounded-full text-xs font-bold gap-1.5 items-center justify-center">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{t('home.funExercisesBadge', 'تمارين ممتعة وتفاعلية')}</span>
            </div>
            <h2 className="text-2xl font-black font-sans text-white">{t('home.lessonExercisesTitle', 'تمارين الدروس 🎮')}</h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              {t('home.lessonExercisesDesc', 'تمارين تساعدك على الكتابة من رسم الحروف والكلمات، وتمارين ممتعة تساعد الذاكرة وتثبت المعلومات.')}
            </p>
          </div>

          <button
            onClick={() => setShowExerciseModal(true)}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition transform hover:scale-102 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 shrink-0"
          >
            {t('home.startActivitiesBtn', 'استعراض وبدء الأنشطة والتمارين')}
            <MoveLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🔔 REMINDER BAR: Lesson reminder alert for new and pending lessons */}
      <div className="bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-orange-50/90 border border-amber-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl shrink-0 shadow-sm">
            <Bell className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-amber-950 text-sm block">
              {t('home.importantReminderTitle', 'تذكير هام بالدروس والتمارين 📌')}
            </span>
            <p className="text-amber-900/80 text-xs mt-0.5 leading-relaxed font-bold">
              {t('home.importantReminderDesc', 'تذكير: لديك دروس جديدة ودروس قديمة لم تحل بعد! يمكنك متابعة حالة إنجازك والدروس المتبقية من قسم التقارير.')}
            </p>
          </div>
        </div>

        {onNavigateTo && (
          <button
            onClick={() => onNavigateTo('reports')}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>{t('home.goToReportsBtn', 'انتقال للتقارير')}</span>
          </button>
        )}
      </div>

      {/* 📢 SECTION 1: Announcements & Guidelines (إعلانات وتوجيهات) */}
      {announcementsAndInstructions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-sans border-b border-slate-100 pb-3 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            {t('home.announcementsAndGuidelinesTitle', 'الإعلانات والتعليمات التوجيهية 📢')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcementsAndInstructions.map((item, idx) => {
              const isPersonalized = item.targetStudent && item.targetStudent.toUpperCase() !== 'ALL';

              let textContent = item.content || '';
              let attachedImage = '';

              if (textContent.includes('||IMAGE||')) {
                const parts = textContent.split('||IMAGE||');
                textContent = parts[0].trim();
                attachedImage = transformGoogleDriveImageUrl(parts[1].trim());
              } else {
                const driveRegex = /(https?:\/\/(?:drive\.google\.com|lh3\.googleusercontent\.com)[^\s]+)/i;
                const match = textContent.match(driveRegex);
                if (match) {
                  attachedImage = transformGoogleDriveImageUrl(match[0]);
                  if (textContent.trim() === match[0].trim()) {
                    textContent = '';
                  } else {
                    textContent = textContent.replace(match[0], '').trim();
                  }
                }
              }

              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border shadow-sm space-y-3 transition hover:shadow-md ${
                    isPersonalized
                      ? 'bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-amber-200/80'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        isPersonalized
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isPersonalized ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          {t('home.personalizedForYou', 'مخصص لك يا')} {student.name}
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3" />
                          {t('home.publicAnnouncement', 'إعلان عام للجميع')}
                        </>
                      )}
                    </span>

                    {(item.type === 'instruction' || item.type === 'تعليمات') && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                        {t('home.instructionsAndGuidance', 'تعليمات وتوجيهات')}
                      </span>
                    )}
                  </div>

                  {item.title && (
                    <h3 className="text-base font-extrabold text-slate-900 font-sans">
                      {item.title}
                    </h3>
                  )}

                  {textContent && (
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {textContent}
                    </p>
                  )}

                  {attachedImage && (
                    <div
                      className="mt-3 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-50 cursor-pointer group hover:border-amber-400 transition"
                      onClick={() => setActiveEnlargedImage({ url: attachedImage, title: item.title || 'صورة شارحة' })}
                    >
                      <img
                        src={attachedImage}
                        alt={item.title || 'صورة شارحة'}
                        className="w-full max-h-80 object-contain bg-slate-900/5 group-hover:scale-[1.01] transition duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="p-2 text-center text-[11px] font-bold text-slate-600 bg-slate-100/80 flex items-center justify-center gap-1.5 border-t border-slate-200/50">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>اضغط هنا لتكبير صورة الشرح 🔍</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🖼️ SECTION 2: Photo Gallery (معرض الصور سلايدشو) */}
      {photoItems.length > 0 && (
        <PhotoSlideshow
          photos={photoItems}
          onOpenLightbox={(idx) => setActiveLightboxIndex(idx)}
        />
      )}

      {/* 🎥 SECTION 3: Video Gallery (المقاطع المرئية وسلايدشو) */}
      {videoItems.length > 0 && (
        <VideoSlideshow
          videos={videoItems}
          onPlayVideo={(url) => setActiveVideoUrl(url)}
          getYoutubeId={getYoutubeId}
          isDirectVideo={isDirectVideo}
        />
      )}

      {/* 🔗 SECTION 4: External Links (الروابط الخاصة والصفحات) */}
      {linkItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-sans border-b border-slate-100 pb-3 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-sky-500" />
            {t('home.externalLinksTitle', 'الروابط والصفحات الخارجية 🔗')}
          </h2>

          <div className="flex flex-wrap gap-3">
            {linkItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleLaunchButton(item.content)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl text-xs transition shadow-sm flex items-center gap-2 hover:scale-[1.02]"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span>{item.title || 'فتح الرابط'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no items exist */}
      {!loading && items.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 space-y-2 shadow-sm">
          <Info className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-600">لا توجد إعلانات أو محتويات صادرة في ورقة Home_Content حالياً.</p>
          <p className="text-xs text-slate-400">يمكن للمعلم إضافة محتوى في جدول Google Sheet برمز النوع (announcement / photo / video / instruction / link / lesson).</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm font-bold">{t('home.fetchingHomeContent', 'جاري جلب المحتوى من ورقة Home_Content...')}</span>
        </div>
      )}

      {/* Lightbox Modal for Photo Gallery Slideshow */}
      {activeLightboxIndex !== null && photoItems.length > 0 && (
        <LightboxModal
          images={photoItems.map((p) => ({ url: p.content, title: p.title }))}
          currentIndex={activeLightboxIndex}
          onClose={() => setActiveLightboxIndex(null)}
          onNavigate={(newIdx) => setActiveLightboxIndex(newIdx)}
        />
      )}

      {/* Video Player Modal (Supports both MP4 Direct files & YouTube Embeds) */}
      <AnimatePresence>
        {activeVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setActiveVideoUrl(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl p-4 md:p-6 shadow-2xl text-right space-y-4 border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
                  مشاهدة المقطع المرئي / الدرس
                </span>
                <button
                  onClick={() => setActiveVideoUrl(null)}
                  className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow flex items-center justify-center">
                {isDirectVideo(activeVideoUrl) ? (
                  <video
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    متصفحك لا يدعم تشغيل هذا المقطع مباشرة.
                  </video>
                ) : (
                  <iframe
                    src={getEmbedUrl(activeVideoUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title="المقطع التعليمي"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web Lesson Embedded Frame Modal */}
      <AnimatePresence>
        {activeWebLessonFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4"
            onClick={() => setActiveWebLessonFrame(null)}
          >
            <div 
              className="relative max-w-6xl w-full h-[90vh] bg-slate-900 rounded-3xl p-4 md:p-6 shadow-2xl text-right flex flex-col space-y-4 border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-base">
                      {activeWebLessonFrame.title}
                    </h3>
                    <p className="text-xs text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>تم ربط حساب الطالب ({student.name}) تلقائياً مع الرابط</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(activeWebLessonFrame.url, '_blank', 'noreferrer')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    title="فتح في نافذة تبويب جديدة"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">فتح بنوافذ خارجية</span>
                  </button>
                  <button
                    onClick={() => setActiveWebLessonFrame(null)}
                    className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full rounded-2xl overflow-hidden bg-white border border-slate-800 shadow relative">
                <iframe
                  src={activeWebLessonFrame.url}
                  className="w-full h-full border-0"
                  title={activeWebLessonFrame.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚪 EXERCISES NAVIGATION MODAL */}
      <AnimatePresence>
        {showExerciseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowExerciseModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 relative border border-slate-100 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="text-right space-y-1">
                  <h3 className="text-xl font-black text-slate-900 font-sans flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-amber-500 fill-amber-500" />
                    {t('home.lessonExercisesTitle', 'تمارين الدروس 🎮')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('exercises.chooseExerciseTypeDesc', 'اختر نوع التمرين المناسب وابدأ في التدرب واكتساب النقاط والشارات!')}
                  </p>
                </div>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition"
                  title="إغلاق البوابة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer group"
                  onClick={() => {
                    onSelectExercise(ExerciseType.DRAWING);
                    setShowExerciseModal(false);
                  }}
                >
                  <div className="space-y-4 text-right">
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit group-hover:bg-emerald-100 transition">
                      <i className="fas fa-pen-nib text-xl" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">{t('exercises.drawingExerciseTitle', 'تمرين محاكاة ورسم الخط')}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {t('exercises.drawingExerciseCardDesc', 'لوحة رسم ذكية لمطابقة دقة يدك في كتابة الخطوط العربية المحددة واستخراج الدرجات والمكافآت الفورية.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                    <span>{t('exercises.openDrawingExercise', 'افتح تمرين رسم الخط')}</span>
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer group"
                  onClick={() => {
                    onSelectExercise(ExerciseType.WORDS);
                    setShowExerciseModal(false);
                  }}
                >
                  <div className="space-y-4 text-right">
                    <div className="bg-sky-50 text-sky-600 p-3 rounded-xl w-fit group-hover:bg-sky-100 transition">
                      <i className="fas fa-sort-alpha-down text-xl" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">{t('exercises.wordsExerciseTitle', 'ترتيب الحروف وملء الفراغات')}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {t('exercises.wordsExerciseCardDesc', 'اجمع الحروف لتكوين الكلمات، رتب الجمل اللغوية المبعثرة، واحلل المسابقات التفاعلية الممتعة.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sky-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                    <span>{t('exercises.openWordsExercise', 'افتح تمارين الكلمات')}</span>
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer group"
                  onClick={() => {
                    onSelectExercise(ExerciseType.MATCHING);
                    setShowExerciseModal(false);
                  }}
                >
                  <div className="space-y-4 text-right">
                    <div className="bg-amber-50 text-amber-600 p-3 rounded-xl w-fit group-hover:bg-amber-100 transition">
                      <i className="fas fa-project-diagram text-xl" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-900">{t('exercises.matchingExerciseTitle', 'تمرين التوصيل والمطابقة')}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {t('exercises.matchingExerciseCardDesc', 'ارسم خطوط تواصل تفاعلية جميلة ومطابقة الكلمات اللغوية بنظيرتها الصوتية المسجلة أو الصورة المناسبة.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-amber-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                    <span>{t('exercises.openMatchingExercise', 'افتح تمرين التوصيل')}</span>
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 Enlarged Attached Image Modal */}
      <AnimatePresence>
        {activeEnlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
            onClick={() => setActiveEnlargedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full flex flex-col items-center justify-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveEnlargedImage(null)}
                className="absolute -top-12 left-0 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full transition"
                title="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative flex flex-col items-center justify-center w-full space-y-3">
                <img
                  src={activeEnlargedImage.url}
                  alt={activeEnlargedImage.title}
                  className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl bg-slate-900"
                />
                {activeEnlargedImage.title && (
                  <p className="text-white font-extrabold text-sm sm:text-base text-center bg-black/60 px-4 py-1.5 rounded-xl border border-white/10">
                    {activeEnlargedImage.title}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
