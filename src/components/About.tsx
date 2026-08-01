/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GeneralData } from '../types';
import { HelpCircle, Phone, Info, Globe, Sparkles, ExternalLink, Video, Image, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface AboutProps {
  data: GeneralData | null;
}

interface CardMedia {
  imageUrl?: string;
  videoUrl?: string;
}

interface ParsedCard {
  type: string;
  title: string;
  text: string;
  mediaPairs: CardMedia[];
  galleryItems: string[];
  buttonUrl: string;
}

export default function About({ data }: AboutProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'about' | 'contact'>('about');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-500 text-right" dir="rtl">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-sm">{t('about.loadingAboutInfo', 'جاري جلب المعلومات التعريفية...')}</span>
      </div>
    );
  }

  // Parse a sheet row into a structured card object
  const parseCardRow = (row: string[]): ParsedCard | null => {
    if (!row || row.length < 3) return null;
    const type = row[0] ? row[0].trim() : '';
    const title = row[1] ? row[1].trim() : '';
    const text = row[2] ? row[2].trim() : '';

    if (!type && !title && !text) return null;

    const mediaPairs: CardMedia[] = [];
    // Parse media pairs from columns 3 to 12 (D to M in Sheet, indexes 3 to 12)
    for (let j = 3; j <= 11; j += 2) {
      const img = row[j] ? row[j].trim() : '';
      const vid = row[j + 1] ? row[j + 1].trim() : '';
      if ((img && img !== '-') || (vid && vid !== '-')) {
        mediaPairs.push({
          imageUrl: img && img !== '-' ? img : undefined,
          videoUrl: vid && vid !== '-' ? vid : undefined,
        });
      }
    }

    // Parse comma-separated gallery items in Column D (index 3) for gallery types
    let galleryItems: string[] = [];
    if (type === 'معرض صور' && row[3]) {
      galleryItems = row[3]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && s !== '-');
    }

    const buttonUrl = row[13] && row[13] !== '-' ? row[13].trim() : '';

    return { type, title, text, mediaPairs, galleryItems, buttonUrl };
  };

  // 1. Parse About Cards (row 1 onwards in data.about)
  const aboutCards = data.about
    .map(parseCardRow)
    .filter((card): card is ParsedCard => card !== null);

  // 2. Parse Contact Cards (row 10 onwards in data.contact, which corresponds to index 8 of data.contact)
  const contactCards = data.contact.slice(8)
    .map(parseCardRow)
    .filter((card): card is ParsedCard => card !== null);

  const socialLinks = data.contact[0] || [];

  const handleOpenLink = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noreferrer');
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 text-right" dir="rtl">
      {/* Tab Switcher */}
      <div className="flex justify-center border-b border-slate-200 pb-1">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'about'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-4 h-4 text-amber-500" />
            {t('about.whoWeAreTab', 'من نحن والتعريف بالمنصة')}
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-4 h-4 text-amber-500" />
            {t('about.contactSupportTab', 'اتصل بنا وقنوات الدعم')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'about' ? (
          <motion.div
            key="about-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="text-center space-y-2 max-w-xl mx-auto pb-4">
              <h1 className="text-2xl font-extrabold text-slate-900 font-sans">{t('about.aboutPlatformHeader', 'معلومات عن المنصة 🌸')}</h1>
              <p className="text-slate-500 text-sm">
                {t('about.aboutPlatformDesc', 'تعلّم، تدرّب، وارتقِ بمستواك في مهارات اللغة العربية والخطوط بمناهج إثرائية وتطبيقات تفاعلية.')}
              </p>
            </div>

            {/* Render Cards */}
            {aboutCards.length > 0 ? (
              <div className="space-y-6">
                {aboutCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                          {card.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                          {card.text}
                        </p>
                      </div>
                    </div>

                    {/* Render media pairs */}
                    {card.mediaPairs.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {card.mediaPairs.map((pair, pIdx) => (
                          <div key={pIdx} className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 group shadow-sm min-h-[140px] flex items-center justify-center">
                            {pair.imageUrl && (
                              <img
                                src={pair.imageUrl}
                                alt="مرفق إعلامي"
                                className="w-full h-40 object-cover group-hover:scale-105 transition duration-300 cursor-zoom-in"
                                onClick={() => pair.imageUrl && window.open(pair.imageUrl, '_blank')}
                              />
                            )}

                            {pair.videoUrl && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <button
                                  onClick={() => setSelectedVideo(pair.videoUrl || '')}
                                  className="bg-amber-500 text-slate-950 p-3 rounded-full hover:bg-amber-400 transition transform hover:scale-110 shadow-lg"
                                >
                                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render action button */}
                    {card.buttonUrl && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenLink(card.buttonUrl)}
                          className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          فتح الرابط الإثرائي للمحتوى
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center text-slate-400 text-sm">
                لم يقم المشرف بإضافة بطاقات تعريفية لورقة About بعد.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="contact-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Social Links Banner */}
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white text-center space-y-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">تواصل مباشر وقنوات الدعم 📞</h2>
                <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                  نحن هنا للإجابة على جميع استفساراتكم وملاحظاتكم الإيجابية لمساعدتكم في الارتقاء بمستواكم اللغوي.
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex justify-center flex-wrap gap-3 text-sm font-medium z-10 relative">
                  {socialLinks[0] && socialLinks[0] !== '-' && (
                    <a
                      href={socialLinks[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition text-xs border border-slate-700/50 shadow"
                    >
                      <Globe className="w-4 h-4 text-amber-500" />
                      قناة الفيسبوك
                    </a>
                  )}
                  {socialLinks[1] && socialLinks[1] !== '-' && (
                    <a
                      href={socialLinks[1]}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition text-xs border border-slate-700/50 shadow"
                    >
                      <Globe className="w-4 h-4 text-amber-500" />
                      حساب إنستغرام
                    </a>
                  )}
                  {socialLinks[2] && socialLinks[2] !== '-' && (
                    <a
                      href={socialLinks[2]}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition text-xs border border-slate-700/50 shadow"
                    >
                      <Globe className="w-4 h-4 text-amber-500" />
                      منصة يوتيوب
                    </a>
                  )}
                  {socialLinks[3] && socialLinks[3] !== '-' && (
                    <a
                      href={socialLinks[3]}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition text-xs border border-slate-700/50 shadow"
                    >
                      <Globe className="w-4 h-4 text-amber-500" />
                      قناة لاين (Line)
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Render Contact Cards */}
            {contactCards.length > 0 ? (
              <div className="space-y-6">
                {contactCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="space-y-2 text-right">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                        {card.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {card.text}
                      </p>
                    </div>

                    {/* Gallery list check */}
                    {card.type === 'معرض صور' && card.galleryItems.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {card.galleryItems.map((item, gIdx) => {
                          const isVid = item.includes('youtube.com') || item.includes('youtu.be');
                          return (
                            <div key={gIdx} className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group shadow-sm h-24 flex items-center justify-center">
                              {isVid ? (
                                <>
                                  <img
                                    src={`https://img.youtube.com/vi/${item.replace(/.*v=/, '').replace(/&.*/, '')}/0.jpg`}
                                    alt="معاينة فيديو"
                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <button
                                      onClick={() => setSelectedVideo(item)}
                                      className="bg-amber-500 text-slate-950 p-2 rounded-full hover:bg-amber-400 transition shadow"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <img
                                  src={item}
                                  alt="صورة معرض"
                                  className="w-full h-full object-cover group-hover:scale-105 transition cursor-zoom-in"
                                  onClick={() => window.open(item, '_blank')}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Standard Card Media pairs */}
                    {card.type !== 'معرض صور' && card.mediaPairs.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {card.mediaPairs.map((pair, pIdx) => (
                          <div key={pIdx} className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 group shadow-sm min-h-[140px] flex items-center justify-center">
                            {pair.imageUrl && (
                              <img
                                src={pair.imageUrl}
                                alt="مرفق تواصل"
                                className="w-full h-40 object-cover group-hover:scale-105 transition duration-300 cursor-zoom-in"
                                onClick={() => pair.imageUrl && window.open(pair.imageUrl, '_blank')}
                              />
                            )}

                            {pair.videoUrl && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <button
                                  onClick={() => setSelectedVideo(pair.videoUrl || '')}
                                  className="bg-amber-500 text-slate-950 p-3 rounded-full hover:bg-amber-400 transition transform hover:scale-110 shadow-lg"
                                >
                                  <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render action button */}
                    {card.buttonUrl && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleOpenLink(card.buttonUrl)}
                          className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          زيارة الموقع أو الرابط المرفق
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center text-slate-400 text-sm">
                لم يقم المشرف بإضافة بطاقات تواصل لورقة Contact بعد.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Video Overlay Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 md:p-6 max-w-3xl w-full relative shadow-2xl space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm">📺 استعراض الفيديو التوضيحي</span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-lg p-1"
              >
                &times;
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-100">
              <iframe
                src={getEmbedUrl(selectedVideo)}
                className="w-full h-full"
                allowFullScreen
                title="فيديو توضيحي"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
