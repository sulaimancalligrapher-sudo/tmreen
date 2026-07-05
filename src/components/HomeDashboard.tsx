/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { callGasApi } from '../utils/api';
import { Student, HoomWidget, ExerciseType, GeneralData } from '../types';
import {
  Sparkles,
  Compass,
  HelpCircle,
  Pencil,
  MoveLeft,
  Eye,
  Award,
  Gamepad2,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeDashboardProps {
  student: Student;
  generalData: GeneralData | null;
  onSelectExercise: (type: ExerciseType) => void;
  onNavigateTo: (page: string) => void;
}

// ==========================================
// 🌟 SUB-COMPONENT: Image Slideshow & Lightbox
// ==========================================
interface ImageSlideshowProps {
  images: string[];
  title: string;
}

function ImageSlideshow({ images, title }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const total = images.length;

  // Autoplay function
  useEffect(() => {
    if (total <= 1) return;
    
    autoplayTimer.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [total]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleLightboxNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % total);
    }
  };

  const handleLightboxPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + total) % total);
    }
  };

  if (total === 0) return null;

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm group">
      {/* Current Slide */}
      <div 
        className="relative h-56 md:h-64 flex items-center justify-center cursor-zoom-in overflow-hidden"
        onClick={() => openLightbox(currentIndex)}
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
        
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
            <Maximize2 className="w-3.5 h-3.5" />
            تكبير الصورة
          </div>
        </div>

        {/* Slides Counter Tag */}
        <span className="absolute top-3 right-3 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Slide Navigation Buttons */}
      {total > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition transform hover:scale-105"
            title="الصورة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition transform hover:scale-105"
            title="الصورة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-amber-400' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div 
              className="relative max-w-4xl w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute -top-12 left-0 bg-white/10 hover:bg-white/25 text-white p-2.5 rounded-full transition"
                title="إغلاق المعاينة"
              >
                <X className="w-6 h-6" />
              </button>

              {total > 1 && (
                <button
                  onClick={handleLightboxPrev}
                  className="absolute right-2 md:-right-16 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
                  title="السابق"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              <img
                src={images[lightboxIndex]}
                alt={`${title} - ${lightboxIndex + 1}`}
                className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
              />

              {total > 1 && (
                <button
                  onClick={handleLightboxNext}
                  className="absolute left-2 md:-left-16 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
                  title="التالي"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Lightbox status bar */}
            <div className="text-white text-xs font-bold mt-4 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
              {title} • {lightboxIndex + 1} من {total}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 📺 SUB-COMPONENT: Video Slideshow
// ==========================================
interface VideoSlideshowProps {
  videos: string[];
  title: string;
}

function VideoSlideshow({ videos, title }: VideoSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const total = videos.length;

  useEffect(() => {
    if (total <= 1) return;
    
    autoplayTimer.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);

    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [total]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Extract YouTube ID to show a high-res cover image
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

  const getEmbedUrl = (url: string) => {
    const id = getYoutubeId(url);
    if (id) {
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  if (total === 0) return null;

  const currentVideo = videos[currentIndex];
  const ytId = getYoutubeId(currentVideo);
  const coverUrl = ytId 
    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` 
    : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
      {/* Current Video Cover Card */}
      <div 
        className="relative h-56 md:h-64 flex items-center justify-center cursor-pointer overflow-hidden group"
        onClick={() => setActiveVideoUrl(currentVideo)}
      >
        <motion.img
          key={currentIndex}
          src={coverUrl}
          onError={(e) => {
            // fallback to medium quality if maxres doesn't exist
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          }}
          alt={`${title} video cover`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover filter brightness-[0.7] group-hover:scale-105 transition duration-300"
        />

        {/* Big play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-amber-500 text-slate-950 p-4 rounded-full hover:bg-amber-400 transition transform hover:scale-110 shadow-lg flex items-center justify-center">
            <Play className="w-6 h-6 fill-slate-950" />
          </div>
        </div>

        {/* Slide navigation counter */}
        <span className="absolute top-3 right-3 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
          فيديو {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Video navigation controls */}
      {total > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition transform hover:scale-105"
            title="الفيديو السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md transition transform hover:scale-105"
            title="الفيديو التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
          {videos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-amber-400' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Video Player overlay */}
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
              className="relative max-w-3xl w-full bg-white rounded-3xl p-4 md:p-6 shadow-2xl text-right space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
                  مشاهدة المقطع التوجيهي من المعلم
                </span>
                <button
                  onClick={() => setActiveVideoUrl(null)}
                  className="text-slate-400 hover:text-slate-600 font-extrabold text-lg p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-100 shadow">
                <iframe
                  src={getEmbedUrl(activeVideoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  title="المقطع التعليمي"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ==========================================
// 🏠 MAIN COMPONENT: HomeDashboard
// ==========================================
export default function HomeDashboard({ student, generalData, onSelectExercise, onNavigateTo }: HomeDashboardProps) {
  const [widgets, setWidgets] = useState<HoomWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  useEffect(() => {
    const fetchHoomData = async () => {
      try {
        setLoading(true);
        setError('');
        const rawHoom = await callGasApi<string[][]>('getHoomDataForStudent', {
          username: student.name,
        });

        if (rawHoom && rawHoom.length > 0) {
          const parsedWidgets: HoomWidget[] = rawHoom.map((row) => {
            const type = row[0] || 'بطاقة';
            const title = row[1] || '';
            const text = row[2] || '';
            
            // Parse images and videos from row[3] & row[4]
            const images = row[3]
              ? row[3]
                  .split('|')
                  .map((s) => s.trim())
                  .filter((s) => s && s !== '-')
              : [];
            const videos = row[4]
              ? row[4]
                  .split('|')
                  .map((s) => s.trim())
                  .filter((s) => s && s !== '-')
              : [];

            let buttons: Array<{ text: string; url: string }> = [];
            if (type === 'أزرار') {
              // Row 3 text buttons, Row 4 contains URLs
              const buttonTexts = row[3] ? row[3].split('|').map((s) => s.trim()) : [];
              const buttonUrls = row[4] ? row[4].split('|').map((s) => s.trim()) : [];
              const length = Math.min(buttonTexts.length, buttonUrls.length);
              for (let i = 0; i < length; i++) {
                buttons.push({ text: buttonTexts[i], url: buttonUrls[i] });
              }
            }

            return { type, title, text, media: images, videos, buttons };
          });

          setWidgets(parsedWidgets);
        }
      } catch (err: any) {
        console.warn('Hoom sheet error:', err);
        setError('لا يمكن جلب الإعلانات الترحيبية من ورقة HOOM حالياً.');
      } finally {
        setLoading(false);
      }
    };

    fetchHoomData();
  }, [student.name]);

  const handleLaunchButton = (url: string) => {
    if (!url || url === '#' || url === '-') return;
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noreferrer');
    } else if (url.startsWith('#')) {
      const page = url.substring(1);
      onNavigateTo(page);
    } else {
      onNavigateTo(url);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Dynamic Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-flex bg-amber-50 text-amber-700 px-3 py-0.5 rounded-full text-xs font-bold gap-1 items-center">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مرحباً بك يا بطل المتميز! 🌟</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-sans">
            أهلاً بك، {student.name}! 👋
          </h1>
          <p className="text-slate-500 text-sm max-w-xl">
            استعرض التوجيهات اليومية من معلّمك الموقّر، وتدرّب في منصتك الذكية لإتقان مهارات الضاد وقواعد الخط والوصل.
          </p>
        </div>

        {/* Primary Action */}
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigateTo('reports')}
            className="flex-1 md:flex-initial bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
          >
            تقرير أدائي اليومي 📊
          </button>
        </div>
      </div>

      {/* Profile quick action links */}
      {generalData?.header.buttons && generalData.header.buttons.some(btn => btn.buttonText && btn.buttonText !== 'زر بدون نص' && btn.buttonUrl !== '#' && btn.buttonUrl !== '-') && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-right">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-500" />
              روابط وتوجيهات سريعة من المشرف
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">انتقل مباشرة إلى الدروس الخارجية والموارد الإثرائية المخصصة لك بضغطة زر.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            {generalData.header.buttons.map((btn, idx) => {
              if (!btn.buttonText || btn.buttonText === 'زر بدون نص' || btn.buttonUrl === '#' || btn.buttonUrl === '-') return null;
              return (
                <button
                  key={idx}
                  onClick={() => handleLaunchButton(btn.buttonUrl)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition border border-slate-100 flex items-center gap-1 shadow-sm"
                >
                  🌐 {btn.buttonText}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🚀 SIMPLIFIED GATEWAY SECTION: Exercises & Activities */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1 text-center md:text-right">
            <div className="inline-flex bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3.5 py-1 rounded-full text-xs font-bold gap-1.5 items-center justify-center">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>بيئة تفاعلية ممتعة</span>
            </div>
            <h2 className="text-2xl font-black font-sans text-white">بوابة الألعاب والتمارين التفاعلية 🎮</h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              ادخل عالم ممارسة الضاد! رسم خطوط الحروف العربية بنسب دقيقة، مطابقة وتوصيل الكلمات بالصوت والصورة، وترتيب الأحرف لتكوين جمل لغوية صحيحة.
            </p>
          </div>

          <button
            onClick={() => setShowExerciseModal(true)}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition transform hover:scale-102 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 shrink-0"
          >
            استعراض وبدء الأنشطة والتمارين
            <MoveLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📢 Dynamic HOOM Widgets (Slideshow / Slide Show version) */}
      {widgets.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-sans border-b border-slate-100 pb-3 flex items-center gap-2">
            إعلانات وتوجيهات المعلم 📢
          </h2>

          <div className="space-y-6">
            {widgets.map((widget, i) => {
              if (widget.type === 'بطاقة' || widget.type === 'من نحن') {
                const hasMedia = widget.media.length > 0;
                const hasVideos = widget.videos.length > 0;

                return (
                  <div
                    key={i}
                    className="bg-white border border-slate-100/80 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col lg:flex-row gap-6 items-center hover:shadow-md transition"
                  >
                    <div className="flex-1 space-y-3 text-right">
                      <span className="inline-flex bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        توجيه مخصّص
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 font-sans">{widget.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {widget.text}
                      </p>
                    </div>

                    {/* Image or Video Slideshow container */}
                    {(hasMedia || hasVideos) && (
                      <div className="w-full lg:w-96 shrink-0 space-y-4">
                        {hasMedia && (
                          <ImageSlideshow images={widget.media} title={widget.title} />
                        )}
                        {hasVideos && (
                          <VideoSlideshow videos={widget.videos} title={widget.title} />
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              if (widget.type === 'أزرار') {
                return (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-100 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm"
                  >
                    <div className="space-y-1 text-right">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-amber-500" />
                        {widget.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{widget.text}</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {widget.buttons?.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLaunchButton(btn.url)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          🌐 {btn.text}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              if (widget.type === 'معرض صور') {
                return (
                  <div key={i} className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-slate-900">{widget.title}</h3>
                      <p className="text-slate-500 text-sm">{widget.text}</p>
                    </div>
                    
                    {/* Render slideshow for gallery images to avoid grid chaos */}
                    <ImageSlideshow images={widget.media} title={widget.title} />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm">جاري تحميل إعلانات المعلم...</span>
        </div>
      )}

      {/* ==========================================
          🚪 PREMIUM EXERCISES NAVIGATION MODAL
         ========================================== */}
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
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="text-right space-y-1">
                  <h3 className="text-xl font-black text-slate-900 font-sans flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-amber-500 fill-amber-500" />
                    بوابة التمارين اللغوية والألعاب التفاعلية 🎮
                  </h3>
                  <p className="text-xs text-slate-400">
                    اختر نوع التمرين أو اللعبة التفاعلية المناسبة وابدأ في تحدي نفسك للحصول على العلامة الكاملة.
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

              {/* Bento Grid layout for exercises inside modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Exercise 1: Drawing Calligraphy */}
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
                      <h4 className="text-base font-bold text-slate-900">تمرين محاكاة ورسم الخط</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        لوحة رسم ذكية لمطابقة دقة يدك في كتابة الخطوط العربية المحددة واستخراج الدرجات والمكافآت الفورية.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                    <span>افتح تمرين رسم الخط</span>
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                {/* Exercise 2: Word ordering / Gap Filling */}
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
                      <h4 className="text-base font-bold text-slate-900">ترتيب الحروف وملء الفراغات</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        اجمع الحروف لتكوين الكلمات، رتب الجمل اللغوية المبعثرة، واحلل المسابقات التفاعلية الممتعة.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sky-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                    <span>افتح تمارين الكلمات</span>
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>

                {/* Exercise 3: Line matching */}
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
                      <h4 className="text-base font-bold text-slate-900">تمرين التوصيل والمطابقة</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        ارسم خطوط تواصل تفاعلية جميلة ومطابقة الكلمات اللغوية بنظيرتها الصوتية المسجلة أو الصورة المناسبة.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-amber-600 font-bold text-xs mt-6 border-t border-slate-100/60 pt-3">
                    <span>افتح تمرين التوصيل</span>
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
