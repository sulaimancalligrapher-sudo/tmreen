/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student } from '../types';
import { FileText, Download, CheckCircle, AlertTriangle, Table, Award, Loader2, RefreshCw, Star, ListChecks } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface ReportDashboardProps {
  student: Student;
}

type TabType = 'all_a' | 'all_v' | 'correction' | 'words' | 'wasl' | 'writing';

interface TableData {
  headers: string[];
  data: string[][];
  success: boolean;
  message?: string;
}

interface ReminderItem {
  topic: string;
  words: { summary: string; pct: string; isDone: boolean };
  wasl: { summary: string; pct: string; isDone: boolean };
  writing: { summary: string; pct: string; isDone: boolean };
  homework: { status: string; isDone: boolean };
  isCompleted: boolean;
}

interface ReminderData {
  success: boolean;
  todayLessons: ReminderItem[];
  pendingLessons: ReminderItem[];
  completedLessons: ReminderItem[];
  message?: string;
}

const HEADER_MAP: Record<string, string> = {
  'موضوع الدرس': 'tableHeaders.lessonTopic',
  'صورة الواجب': 'tableHeaders.homeworkImage',
  'رابط صورة الواجب': 'tableHeaders.homeworkImage',
  'تسجيل صوت': 'tableHeaders.audioRecord',
  'رابط تسجيل الصوت': 'tableHeaders.audioRecord',
  'تصحيح': 'tableHeaders.correction',
  'ملاحظات وتصحيح المعلم': 'tableHeaders.correction',
  'درجات الصورة': 'tableHeaders.imageGrades',
  'درجات صورة الواجب': 'tableHeaders.imageGrades',
  'درجات الصوت': 'tableHeaders.audioGrades',
  'درجات التسجيل الصوتي': 'tableHeaders.audioGrades',
  'اضافة صورة': 'tableHeaders.addImage',
  'رابط صورة توضيحية': 'tableHeaders.addImage',
  'اضافة فيديو': 'tableHeaders.addVideo',
  'رابط فيديو شرح/تصحيح': 'tableHeaders.addVideo',
  'اضافة صوت': 'tableHeaders.addAudio',
  'رابط تسجيل صوتي توضيحي': 'tableHeaders.addAudio',
  'تاريخ التصحيح': 'tableHeaders.correctionDate',
  'التقييم والنجوم ⭐': 'tableHeaders.ratingAndStars',
  'تقييم درجة الصورة ⭐': 'tableHeaders.imageRating',
  'تقييم درجة الصوت ⭐': 'tableHeaders.audioRating',
  'تقييم درجة الصورة': 'tableHeaders.imageRating',
  'تقييم درجة الصوت': 'tableHeaders.audioRating',
  'نتائج اجابة الفيديو': 'tableHeaders.videoAnswersResult',
  'نتائج اجابة الصوت': 'tableHeaders.audioAnswersResult',
  'النتيجة الكلية': 'tableHeaders.totalResult',
  'الدرجة النهائية': 'tableHeaders.finalGrade',
  'النتيجة والتفاصيل': 'tableHeaders.resultAndDetails',
  'النسبة المئوية': 'tableHeaders.percentage',
  'آخر تحديث': 'tableHeaders.lastUpdate',
  'عدد المحاولات': 'tableHeaders.attemptsCount',
  'عدد الجمل المكتملة': 'tableHeaders.completedSentencesCount',
};

export default function ReportDashboard({ student }: ReportDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('all_a');
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [certGenerating, setCertGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [certPdfUrl, setCertPdfUrl] = useState<string | null>(null);
  const [showPdfBtn, setShowPdfBtn] = useState(false);

  // Table states
  const [allAData, setAllAData] = useState<ReminderData | null>(null);
  const [selectedLessonTopic, setSelectedLessonTopic] = useState<string | null>(null);
  const [allVData, setAllVData] = useState<TableData | null>(null);
  const [correctionData, setCorrectionData] = useState<TableData | null>(null);
  const [wordsData, setWordsData] = useState<TableData | null>(null);
  const [waslData, setWaslData] = useState<TableData | null>(null);
  const [writingData, setWritingData] = useState<TableData | null>(null);

  useEffect(() => {
    fetchAllReports();
  }, [student.id]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const fullReport = await callGasApi<any>('getStudentFullReportData', {
        studentId: student.id,
        studentName: student.name,
      });

      if (fullReport && fullReport.success) {
        if (fullReport.aReport) {
          setAllAData(fullReport.aReport);
          if (fullReport.aReport.success) {
            if (fullReport.aReport.todayLessons && fullReport.aReport.todayLessons.length > 0) {
              setSelectedLessonTopic(fullReport.aReport.todayLessons[0].topic);
            } else if (fullReport.aReport.pendingLessons && fullReport.aReport.pendingLessons.length > 0) {
              setSelectedLessonTopic(fullReport.aReport.pendingLessons[0].topic);
            } else if (fullReport.aReport.completedLessons && fullReport.aReport.completedLessons.length > 0) {
              setSelectedLessonTopic(fullReport.aReport.completedLessons[0].topic);
            }
          }
        }
        if (fullReport.vReport) setAllVData(fullReport.vReport);
        if (fullReport.cReport) setCorrectionData(fullReport.cReport);
        if (fullReport.wReport) setWordsData(fullReport.wReport);
        if (fullReport.waslReport) setWaslData(fullReport.waslReport);
        if (fullReport.writReport) setWritingData(fullReport.writReport);

        if (fullReport.pdfControl && fullReport.pdfControl.success) {
          const control = (fullReport.pdfControl.control || '').trim();
          if (control === 'نعم') {
            setShowPdfBtn(true);
          } else if (control === 'لا' || !control) {
            setShowPdfBtn(false);
          } else {
            const releaseDate = new Date(control);
            if (!isNaN(releaseDate.getTime())) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              setShowPdfBtn(releaseDate <= today);
            }
          }
        }
      } else {
        await fetchLegacyReports();
      }
    } catch (err) {
      console.error('Error fetching full report data:', err);
      await fetchLegacyReports();
    } finally {
      setLoading(false);
    }
  };

  const fetchLegacyReports = async () => {
    try {
      const [aReport, vReport] = await Promise.all([
        callGasApi<ReminderData>('getStudentData', { studentId: student.id }).catch(() => null),
        callGasApi<TableData>('getStudentVideoData', { studentId: student.id }).catch(() => null),
      ]);

      if (aReport) {
        setAllAData(aReport);
        if (aReport.success) {
          if (aReport.todayLessons && aReport.todayLessons.length > 0) {
            setSelectedLessonTopic(aReport.todayLessons[0].topic);
          } else if (aReport.pendingLessons && aReport.pendingLessons.length > 0) {
            setSelectedLessonTopic(aReport.pendingLessons[0].topic);
          } else if (aReport.completedLessons && aReport.completedLessons.length > 0) {
            setSelectedLessonTopic(aReport.completedLessons[0].topic);
          }
        }
      }
      if (vReport) {
        setAllVData(vReport);
      }

      const [cReport, wReport, waslReport, writReport] = await Promise.all([
        callGasApi<TableData>('getCorrectionData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
        callGasApi<TableData>('getWordsExerciseData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
        callGasApi<TableData>('getWaslExerciseData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
        callGasApi<TableData>('getWritingExerciseData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
      ]);

      setCorrectionData(cReport);
      setWordsData(wReport);
      setWaslData(waslReport);
      setWritingData(writReport);
      await checkPdfControl();
    } catch (err) {
      console.error('Error in fetchLegacyReports:', err);
    }
  };

  const checkPdfControl = async () => {
    try {
      const response = await callGasApi<{ success: boolean; control: string; pdfUrl?: string; certPdfUrl?: string }>('getPdfControlForStudent', {
        studentId: student.id,
      });

      if (response.success) {
        if (response.pdfUrl) setPdfUrl(response.pdfUrl);
        if (response.certPdfUrl) setCertPdfUrl(response.certPdfUrl);

        const control = response.control ? response.control.trim() : '';
        if (control === 'نعم') {
          setShowPdfBtn(true);
        } else if (control === 'لا' || !control) {
          setShowPdfBtn(false);
        } else {
          // It might be a release date
          const releaseDate = new Date(control);
          if (!isNaN(releaseDate.getTime())) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setShowPdfBtn(releaseDate <= today);
          }
        }
      }
    } catch (err) {
      console.warn('Could not retrieve PDF button guards:', err);
    }
  };

  const handleGenerateCertPDF = async () => {
    setCertGenerating(true);
    try {
      const response = await callGasApi<{ success: boolean; certPdfUrl?: string; message?: string }>(
        'generateStudentCertificatePDF',
        { studentId: student.id, studentName: student.name }
      );

      if (response.success && response.certPdfUrl) {
        setCertPdfUrl(response.certPdfUrl);
        alert('تم إنشاء الشهادة المخصصة بصيغة PDF وحفظها بنجاح! 🏆');
      } else {
        alert(response.message || 'فشل توليد ملف الشهادة حالياً.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء إنشاء الشهادة: ${err.message}`);
    } finally {
      setCertGenerating(false);
    }
  };

  const handleGenerateFullPDF = async () => {
    setPdfGenerating(true);
    try {
      const response = await callGasApi<{ success: boolean; pdfUrl?: string; message?: string }>(
        'generateStudentConsolidatedPDF',
        { studentId: student.id, studentName: student.name }
      );

      if (response.success && response.pdfUrl) {
        setPdfUrl(response.pdfUrl);
        alert('تم إنشاء التقرير الشامل بصيغة PDF وحفظه بنجاح! 🚀');
      } else {
        alert(response.message || 'فشل توليد ملف الـ PDF حالياً.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء إنشاء الـ PDF: ${err.message}`);
    } finally {
      setPdfGenerating(false);
    }
  };

  const getActiveTableData = (): TableData | null => {
    switch (activeTab) {
      case 'all_v':
        return allVData;
      case 'correction':
        return correctionData;
      case 'words':
        return wordsData;
      case 'wasl':
        return waslData;
      case 'writing':
        return writingData;
      default:
        return null;
    }
  };

  const currentTable = getActiveTableData();

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Sub-header Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-flex bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full text-xs font-bold gap-1 items-center">
            <Award className="w-3.5 h-3.5" />
            <span>{t('reports.instantGradebook', 'دفتر الدرجات الفوري')}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {t('reports.comprehensiveReportTitle', 'تقرير الأداء اللغوي الشامل للطالب')}
          </h1>
          <p className="text-slate-500 text-sm">
            {t('reports.reportWelcomeDesc', 'أهلاً {name}! استعرض درجاتك، تقييمات المدرس، ونقاط تركيزك، وقم باستخراج الشهادة والتقرير بصيغة PDF.').replace('{name}', student.name)}
          </p>
        </div>

        {/* Generate PDF buttons controlled by settings */}
        {showPdfBtn && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleGenerateCertPDF}
              disabled={certGenerating}
              className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              {certGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  جاري استخراج الشهادة...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  استخراج الشهادة فقط (PDF)
                </>
              )}
            </button>
            <button
              onClick={handleGenerateFullPDF}
              disabled={pdfGenerating}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-600/10"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  جاري استخراج التقرير...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  استخراج التقرير الشامل (PDF)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Download Banners */}
      {(certPdfUrl || pdfUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certPdfUrl && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="text-amber-950 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600 shrink-0" />
                <span>شهادتك المخصصة جاهزة!</span>
              </div>
              <a
                href={certPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                فتح الشهادة (PDF)
              </a>
            </motion.div>
          )}

          {pdfUrl && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>التقرير الشامل جاهز للتحميل!</span>
              </div>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                فتح التقرير الشامل (PDF)
              </a>
            </motion.div>
          )}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        <button
          onClick={() => setActiveTab('all_a')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'all_a'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('reports.tabReminder', 'تذكير')}
        </button>
        <button
          onClick={() => setActiveTab('all_v')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'all_v'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('reports.tabSentLessons', 'الدروس المرسلة')}
        </button>
        <button
          onClick={() => setActiveTab('correction')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'correction'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('reports.tabFocusGrades', 'درجات التركيز')}
        </button>
        <button
          onClick={() => setActiveTab('words')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'words'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('reports.tabWordExercises', 'تمارين الكلمات')}
        </button>
        <button
          onClick={() => setActiveTab('wasl')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'wasl'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('reports.tabMatchingExercises', 'تمارين الوصل')}
        </button>
        <button
          onClick={() => setActiveTab('writing')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'writing'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('reports.tabWritingExercises', 'تمارين الكتابة')}
        </button>
      </div>

      {/* Main Table Card or Reminders View */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm">{t('reports.fetchingLiveGrades', 'جاري جلب تقارير الدرجات المباشرة...')}</span>
          </div>
        ) : activeTab === 'all_a' ? (
          (() => {
            const todayLessons = allAData?.todayLessons || [];
            const pendingLessons = allAData?.pendingLessons || [];
            const completedLessons = allAData?.completedLessons || [];

            return (
              <div className="p-6 md:p-8 space-y-8">
                {/* Header intro */}
                <div className="bg-slate-50 border border-slate-100/70 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-right">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </span>
                      {t('reports.smartReminderList', 'قائمة التذكير والمتابعة الذكية')}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {t('reports.smartReminderDesc', 'استعرض دروسك اليومية، الدروس السابقة غير المكتملة، وتابع إنجازاتك من خلال النقر على أي درس لعرض بطاقة تفاصيله الفورية والنجوم المكتسبة مباشرة تحته!')}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 bg-indigo-50 text-indigo-800 text-xs font-extrabold px-3.5 py-1.5 rounded-2xl border border-indigo-100">
                    <span>{t('reports.totalScheduledLessons', 'إجمالي الدروس المجدولة:')} {todayLessons.length + pendingLessons.length + completedLessons.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* 1. Today's Lesson Column */}
                  <div className="bg-white border border-slate-100/80 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <h4 className="font-extrabold text-slate-900 text-sm">{t('reports.todayScheduledLesson', 'درس اليوم مقرر')}</h4>
                    </div>
                    <div className="space-y-3.5">
                      {todayLessons.length === 0 ? (
                        <div className="bg-slate-50/50 border border-slate-100/60 text-slate-400 rounded-2xl p-6 text-center text-xs">
                          لا يوجد درس مقرر لليوم يا بطل!
                        </div>
                      ) : (
                        todayLessons.map((lesson) => {
                          const isSelected = selectedLessonTopic === lesson.topic;
                          return (
                            <div key={lesson.topic} className="space-y-2.5">
                              <button
                                onClick={() => setSelectedLessonTopic(isSelected ? null : lesson.topic)}
                                className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? "border-amber-400 ring-4 ring-amber-400/15 bg-amber-50/30" 
                                    : "border-amber-100/80 hover:border-amber-200/80 bg-amber-50/10 hover:bg-amber-50/20"
                                } cursor-pointer`}
                              >
                                <span className="font-bold text-slate-900 text-xs md:text-sm truncate leading-none">{lesson.topic}</span>
                                <span className="text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                                  {t('reports.todayScheduledBadge', 'درس اليوم 🌟')}
                                </span>
                              </button>

                              {isSelected && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-slate-50/70 border border-slate-150/60 rounded-2xl p-4 space-y-4 shadow-inner">
                                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                                      <TaskStatus label="تمارين الكلمات" isDone={lesson.words.isDone} summary={lesson.words.summary} pct={lesson.words.pct} />
                                      <TaskStatus label="تمارين الوصل" isDone={lesson.wasl.isDone} summary={lesson.wasl.summary} pct={lesson.wasl.pct} />
                                      <TaskStatus label="تمارين الكتابة" isDone={lesson.writing.isDone} summary={lesson.writing.summary} pct={lesson.writing.pct} />
                                      <TaskStatus label="الواجب والتصحيح" isDone={lesson.homework.isDone} summary={lesson.homework.status} />
                                    </div>
                                    
                                    {(() => {
                                      const parsePctVal = (p: string) => {
                                        const clean = String(p || '').replace('%', '').trim();
                                        const num = parseInt(clean);
                                        return isNaN(num) ? 0 : num;
                                      };
                                      const wordsPct = parsePctVal(lesson.words.pct);
                                      const waslPct = parsePctVal(lesson.wasl.pct);
                                      const writingPct = parsePctVal(lesson.writing.pct);
                                      const homeworkPct = lesson.homework.isDone ? 100 : 0;
                                      const lessonAvg = Math.round((wordsPct + waslPct + writingPct + homeworkPct) / 4);

                                      return (
                                        <div className="pt-2.5 border-t border-slate-200/50">
                                          <CompactStarsRating percentage={lessonAvg} />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 2. Unfinished Lessons Column */}
                  <div className="bg-white border border-slate-100/80 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <h4 className="font-extrabold text-slate-900 text-sm">{t('reports.pendingUnfinishedLessons', 'دروس غير مكتملة')}</h4>
                    </div>
                    <div className="space-y-3.5">
                      {pendingLessons.length === 0 ? (
                        <div className="bg-emerald-50/40 border border-emerald-100/50 text-emerald-800 rounded-2xl p-6 text-center text-xs font-bold">
                          رائع جداً! لا توجد دروس سابقة معلقة، أنت بطل ومجتهد دائماً! 🎉👏
                        </div>
                      ) : (
                        pendingLessons.map((lesson) => {
                          const isSelected = selectedLessonTopic === lesson.topic;
                          return (
                            <div key={lesson.topic} className="space-y-2.5">
                              <button
                                onClick={() => setSelectedLessonTopic(isSelected ? null : lesson.topic)}
                                className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? "border-rose-400 ring-4 ring-rose-400/15 bg-rose-50/30" 
                                    : "border-rose-100/80 hover:border-rose-200/80 bg-rose-50/10 hover:bg-rose-50/20"
                                } cursor-pointer`}
                              >
                                <span className="font-bold text-slate-900 text-xs md:text-sm truncate leading-none">{lesson.topic}</span>
                                <span className="text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 shrink-0">
                                  {t('reports.needsCompletionBadge', 'بحاجة لإكمال ⚠️')}
                                </span>
                              </button>

                              {isSelected && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-slate-50/70 border border-slate-150/60 rounded-2xl p-4 space-y-4 shadow-inner">
                                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                                      <TaskStatus label="تمارين الكلمات" isDone={lesson.words.isDone} summary={lesson.words.summary} pct={lesson.words.pct} />
                                      <TaskStatus label="تمارين الوصل" isDone={lesson.wasl.isDone} summary={lesson.wasl.summary} pct={lesson.wasl.pct} />
                                      <TaskStatus label="تمارين الكتابة" isDone={lesson.writing.isDone} summary={lesson.writing.summary} pct={lesson.writing.pct} />
                                      <TaskStatus label="الواجب والتصحيح" isDone={lesson.homework.isDone} summary={lesson.homework.status} />
                                    </div>
                                    
                                    {(() => {
                                      const parsePctVal = (p: string) => {
                                        const clean = String(p || '').replace('%', '').trim();
                                        const num = parseInt(clean);
                                        return isNaN(num) ? 0 : num;
                                      };
                                      const wordsPct = parsePctVal(lesson.words.pct);
                                      const waslPct = parsePctVal(lesson.wasl.pct);
                                      const writingPct = parsePctVal(lesson.writing.pct);
                                      const homeworkPct = lesson.homework.isDone ? 100 : 0;
                                      const lessonAvg = Math.round((wordsPct + waslPct + writingPct + homeworkPct) / 4);

                                      return (
                                        <div className="pt-2.5 border-t border-slate-200/50">
                                          <CompactStarsRating percentage={lessonAvg} />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 3. Completed Lessons Column */}
                  <div className="bg-white border border-slate-100/80 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <h4 className="font-extrabold text-slate-900 text-sm">{t('reports.completedLessonsTitle', 'الدروس المكتملة')}</h4>
                    </div>
                    <div className="space-y-3.5">
                      {completedLessons.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-slate-500 text-sm">
                          {t('reports.noLessonsCompletedYet', 'لم يتم إكمال أي دروس بالكامل حتى الآن. استمر بالدراسة والحل لتراها هنا يا بطل!')}
                        </div>
                      ) : (
                        completedLessons.map((lesson) => {
                          const isSelected = selectedLessonTopic === lesson.topic;
                          return (
                            <div key={lesson.topic} className="space-y-2.5">
                              <button
                                onClick={() => setSelectedLessonTopic(isSelected ? null : lesson.topic)}
                                className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? "border-emerald-400 ring-4 ring-emerald-400/15 bg-emerald-50/30" 
                                    : "border-emerald-100/80 hover:border-emerald-200/80 bg-emerald-50/10 hover:bg-emerald-50/20"
                                } cursor-pointer`}
                              >
                                <span className="font-bold text-slate-900 text-xs md:text-sm truncate leading-none">{lesson.topic}</span>
                                <span className="text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                                  {t('exercises.completedBadge', 'مكتمل ✅')}
                                </span>
                              </button>

                              {isSelected && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="bg-slate-50/70 border border-slate-150/60 rounded-2xl p-4 space-y-4 shadow-inner">
                                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                                      <TaskStatus label="تمارين الكلمات" isDone={lesson.words.isDone} summary={lesson.words.summary} pct={lesson.words.pct} />
                                      <TaskStatus label="تمارين الوصل" isDone={lesson.wasl.isDone} summary={lesson.wasl.summary} pct={lesson.wasl.pct} />
                                      <TaskStatus label="تمارين الكتابة" isDone={lesson.writing.isDone} summary={lesson.writing.summary} pct={lesson.writing.pct} />
                                      <TaskStatus label="الواجب والتصحيح" isDone={lesson.homework.isDone} summary={lesson.homework.status} />
                                    </div>
                                    
                                    {(() => {
                                      const parsePctVal = (p: string) => {
                                        const clean = String(p || '').replace('%', '').trim();
                                        const num = parseInt(clean);
                                        return isNaN(num) ? 0 : num;
                                      };
                                      const wordsPct = parsePctVal(lesson.words.pct);
                                      const waslPct = parsePctVal(lesson.wasl.pct);
                                      const writingPct = parsePctVal(lesson.writing.pct);
                                      const homeworkPct = lesson.homework.isDone ? 100 : 0;
                                      const lessonAvg = Math.round((wordsPct + waslPct + writingPct + homeworkPct) / 4);

                                      return (
                                        <div className="pt-2.5 border-t border-slate-200/50">
                                          <CompactStarsRating percentage={lessonAvg} />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : currentTable && currentTable.success ? (
          (() => {
            const showExtraRatingColumn = !currentTable.headers.some(h => h.includes('⭐') || h.includes('تقييم') || h.includes('نجوم'));
            return (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                        {currentTable.headers.map((h, index) => {
                          const key = HEADER_MAP[h.trim()];
                          const headerText = key ? t(key, h) : h;
                          return (
                            <th key={index} className="p-4 md:p-5 whitespace-nowrap text-right">
                              {headerText}
                            </th>
                          );
                        })}
                        {showExtraRatingColumn && (
                          <th className="p-4 md:p-5 whitespace-nowrap text-center bg-indigo-50/40 text-indigo-950 font-black">
                            {t('tableHeaders.ratingAndStars', 'التقييم والنجوم ⭐')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentTable.data.map((row, rIdx) => {
                        const rowPct = getRowPercentage(row, currentTable.headers);
                        return (
                          <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                            {row.map((cell, cIdx) => {
                              const cellTrim = String(cell || '').trim();
                              const colHeader = (currentTable.headers[cIdx] || '').toLowerCase();
                              let content: React.ReactNode = cell;

                              if (cellTrim.startsWith('http')) {
                                content = (
                                  <a
                                    href={cellTrim}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                                  >
                                    {t('common.openFile', '🔗 افتح الملف')}
                                  </a>
                                );
                              } else if (cellTrim.includes('⭐') || colHeader.includes('تقييم')) {
                                const translatedText = (() => {
                                  let res = cellTrim;
                                  if (res.includes('ممتاز! خط ورسم رائع وواضح جداً 🎨✨')) {
                                    res = res.replace('ممتاز! خط ورسم رائع وواضح جداً 🎨✨', t('encouragements.image90', 'ممتاز! خط ورسم رائع وواضح جداً 🎨✨'));
                                  } else if (res.includes('جيد جداً! خط جميل ومقروء 📝🌟')) {
                                    res = res.replace('جيد جداً! خط جميل ومقروء 📝🌟', t('encouragements.image75', 'جيد جداً! خط جميل ومقروء 📝🌟'));
                                  } else if (res.includes('جيد! أداء حسن وجاري التحسن ✏️👍')) {
                                    res = res.replace('جيد! أداء حسن وجاري التحسن ✏️👍', t('encouragements.image50', 'جيد! أداء حسن وجاري التحسن ✏️👍'));
                                  } else if (res.includes('يحتاج لمزيد من التدريب على الكتابة ✏️💪')) {
                                    res = res.replace('يحتاج لمزيد من التدريب على الكتابة ✏️💪', t('encouragements.imageUnder50', 'يحتاج لمزيد من التدريب على الكتابة ✏️💪'));
                                  } else if (res.includes('مبدع! نطق ومخارج حروف ممتازة وصوت واضح 🎙️✨')) {
                                    res = res.replace('مبدع! نطق ومخارج حروف ممتازة وصوت واضح 🎙️✨', t('encouragements.audio90', 'مبدع! نطق ومخارج حروف ممتازة وصوت واضح 🎙️✨'));
                                  } else if (res.includes('جيد جداً! قراءة وأداء صوتي ممتاز 🎧🌟')) {
                                    res = res.replace('جيد جداً! قراءة وأداء صوتي ممتاز 🎧🌟', t('encouragements.audio75', 'جيد جداً! قراءة وأداء صوتي ممتاز 🎧🌟'));
                                  } else if (res.includes('جيد! أداء صوتي حسن ويحتاج وضوح أكثر 🗣️👍')) {
                                    res = res.replace('جيد! أداء صوتي حسن ويحتاج وضوح أكثر 🗣️👍', t('encouragements.audio50', 'جيد! أداء صوتي حسن ويحتاج وضوح أكثر 🗣️👍'));
                                  } else if (res.includes('يحتاج لمزيد من التدريب والممارسة الصوتية 🎧💪')) {
                                    res = res.replace('يحتاج لمزيد من التدريب والممارسة الصوتية 🎧💪', t('encouragements.audioUnder50', 'يحتاج لمزيد من التدريب والممارسة الصوتية 🎧💪'));
                                  }
                                  return res;
                                })();

                                content = (
                                  <span className="inline-flex items-center gap-1.5 bg-amber-50/90 text-amber-900 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold leading-relaxed max-w-xs shadow-xs">
                                    {translatedText}
                                  </span>
                                );
                              } else if (cellTrim === 'Yes' || cellTrim === 'YES' || cellTrim === 'نعم') {
                                content = (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {t('common.yesCompleted', 'نعم (مكتمل)')}
                                  </span>
                                );
                              } else if (cellTrim === 'No' || cellTrim === 'NO' || cellTrim === 'لا') {
                                content = (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {t('common.noIncomplete', 'لا (غير مكتمل)')}
                                  </span>
                                );
                              } else if (cellTrim === '') {
                                content = <span className="text-slate-300">-</span>;
                              }

                              return (
                                <td key={cIdx} className="p-4 md:p-5 whitespace-normal leading-relaxed">
                                  {content}
                                </td>
                              );
                            })}
                            {showExtraRatingColumn && (
                              <td className="p-4 md:p-5 text-center whitespace-nowrap min-w-[180px] bg-indigo-50/5">
                                <CompactStarsRating percentage={rowPct} />
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Stars rating and custom encouragement footer for standard tables */}
                <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/10">
                  <StarsRating percentage={calculateTableAverage(currentTable)} />
                </div>
              </div>
            );
          })()
        ) : (
          <div className="p-16 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-900">{t('reports.noDataInSection', 'لا توجد بيانات مسجلة حالياً في هذا القسم')}</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {currentTable?.message || t('reports.noDataInSectionDesc', 'يبدو أنك لم تبدأ بحل أي واجبات أو أنشطة في هذا البند بعد يا بطل.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskStatus({ label, isDone, summary, pct }: { label: string; isDone: boolean; summary: string; pct?: string }) {
  return (
    <div className="flex flex-col p-2.5 bg-white border border-slate-100 rounded-xl space-y-1 text-right shadow-sm">
      <span className="text-slate-400 font-bold text-[10px]">{label}</span>
      <div className="flex items-center justify-between gap-1.5 mt-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-emerald-500' : 'bg-rose-400'}`} />
        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[100px] text-left" title={summary}>
          {summary || '-'}
        </span>
      </div>
      {pct && (
        <span className={`text-[9px] font-bold ${isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
          النسبة: {pct}
        </span>
      )}
    </div>
  );
}

function calculateTableAverage(table: TableData | null): number {
  if (!table || !table.data || table.data.length === 0) return 0;
  
  const pctColIndexes: number[] = [];
  table.headers.forEach((h, index) => {
    const headerLower = h.toLowerCase();
    if (
      headerLower.includes('النسبة') || 
      headerLower.includes('درجة') || 
      headerLower.includes('درجات') || 
      headerLower.includes('نسبة') || 
      headerLower.includes('score') || 
      headerLower.includes('percent')
    ) {
      pctColIndexes.push(index);
    }
  });

  let sum = 0;
  let count = 0;

  table.data.forEach((row) => {
    if (pctColIndexes.length > 0) {
      pctColIndexes.forEach((idx) => {
        const val = row[idx];
        if (val !== undefined && val !== null && val !== '') {
          const valStr = String(val).trim();
          const cleanVal = valStr.replace('%', '').trim();
          const parsed = parseFloat(cleanVal);
          if (!isNaN(parsed)) {
            if (valStr.indexOf('%') === -1 && parsed <= 1 && parsed > 0) {
              sum += parsed * 100;
            } else {
              sum += parsed;
            }
            count++;
          }
        }
      });
    } else {
      row.forEach((cell) => {
        const cellStr = String(cell || '').trim();
        if (cellStr.includes('%')) {
          const cleanVal = cellStr.replace('%', '').trim();
          const parsed = parseFloat(cleanVal);
          if (!isNaN(parsed)) {
            sum += parsed;
            count++;
          }
        }
      });
    }
  });

  if (count > 0) {
    return Math.round(sum / count);
  }
  
  let yesCount = 0;
  let totalCellCount = 0;
  table.data.forEach((row) => {
    row.forEach((cell) => {
      const cellStr = String(cell || '').trim().toLowerCase();
      if (cellStr === 'yes' || cellStr === 'نعم' || cellStr === 'مكتمل' || cellStr === 'تم') {
        yesCount++;
      }
      if (cellStr !== '') {
        totalCellCount++;
      }
    });
  });

  if (totalCellCount > 0 && yesCount > 0) {
    return Math.round((yesCount / totalCellCount) * 100);
  }

  return 0;
}

function StarsRating({ percentage }: { percentage: number }) {
  const { t } = useLanguage();
  const activeStars = Math.round((percentage / 100) * 10);
  
  let encouragement = '';
  if (percentage >= 95) {
    encouragement = t('reports.evalStar10', 'مستوى مبهر جداً! أداء متكامل وإتقان تام للدروس والتمارين. استمر في التميز والنجاح يا بطل! 👑🏆🌟');
  } else if (percentage >= 85) {
    encouragement = t('reports.evalStar9', 'أداء رائع وممتاز! مهارات لغوية متفوقة وحل دقيق. أحسنت صنعاً وتستحق التقدير! 👏⭐🎖️');
  } else if (percentage >= 75) {
    encouragement = t('reports.evalStar8', 'ممتاز جداً! درجات عالية تدل على فهم متميز وحرص كبير على الاستمرار والتفوق. 👍✨🚀');
  } else if (percentage >= 60) {
    encouragement = t('reports.evalStar6', 'جيد جداً! خطوت خطوات ممتازة وبإمكانك تحقيق المزيد بالمزيد من التدرب والتركيز. 💪😊📈');
  } else if (percentage >= 50) {
    encouragement = t('reports.evalStar5', 'جيد! فهم مقبول ولكن تحتاج لمزيد من المراجعة والتركيز لتصل إلى درجات القمة اللغوية. ✊📚📝');
  } else if (percentage > 0) {
    encouragement = t('reports.evalStar1', 'بداية طيبة! استمر بالمحاولة والتعلم بانتظام فكل تدريب تحله يجعلك أكثر تميزاً وذكاءً. 🏃‍♂️🧭✨');
  } else {
    encouragement = t('reports.evalStar0', 'لم تبدأ حل التمارين في هذا القسم بعد. نحن واثقون من قدرتك الفائقة على تحقيق العلامة الكاملة بمجرد البدء! 🚀🎯💫');
  }

  return (
    <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5 md:p-6 text-center space-y-3.5 shadow-sm">
      <div className="text-slate-400 font-bold text-xs">{t('reports.evalRatingAndStars', 'تقييم الأداء والنجوم المكتسبة')}</div>
      
      <div className="flex items-center justify-center gap-1.5 flex-row-reverse">
        {Array.from({ length: 10 }).map((_, i) => {
          const isActive = i < activeStars;
          return (
            <Star
              key={i}
              className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-300 ${
                isActive 
                  ? 'text-amber-500 fill-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)] scale-110' 
                  : 'text-slate-300 stroke-[1.5]'
              }`}
            />
          );
        })}
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200/50">
          <span>{t('reports.percentageAchieved', 'النسبة المحققة:')} {percentage}%</span>
          <span className="text-[10px]">{t('reports.starsCountLabel', '({stars}/10 نجوم)').replace('{stars}', String(activeStars))}</span>
        </div>
        <p className="text-slate-700 font-bold text-xs md:text-sm leading-relaxed max-w-xl mx-auto pt-1">
          {encouragement}
        </p>
      </div>
    </div>
  );
}

function getRowPercentage(row: string[], headers: string[]): number {
  if (!row || row.length === 0) return 0;
  
  const pctColIndexes: number[] = [];
  headers.forEach((h, index) => {
    const headerLower = h.toLowerCase();
    if (
      headerLower.includes('النسبة') || 
      headerLower.includes('درجة') || 
      headerLower.includes('درجات') || 
      headerLower.includes('نسبة') || 
      headerLower.includes('score') || 
      headerLower.includes('percent') ||
      headerLower.includes('تصحيح') ||
      headerLower.includes('علامة')
    ) {
      pctColIndexes.push(index);
    }
  });

  let sum = 0;
  let count = 0;

  if (pctColIndexes.length > 0) {
    pctColIndexes.forEach((idx) => {
      const val = row[idx];
      if (val !== undefined && val !== null && val !== '') {
        const valStr = String(val).trim();
        const cleanVal = valStr.replace('%', '').trim();
        const parsed = parseFloat(cleanVal);
        if (!isNaN(parsed)) {
          if (valStr.indexOf('%') === -1 && parsed <= 1 && parsed > 0) {
            sum += parsed * 100;
          } else {
            sum += parsed;
          }
          count++;
        }
      }
    });
  }

  if (count > 0) {
    return Math.round(sum / count);
  }

  let yesCount = 0;
  let totalCellCount = 0;
  row.forEach((cell) => {
    const cellStr = String(cell || '').trim().toLowerCase();
    if (cellStr.includes('%')) {
      const cleanVal = cellStr.replace('%', '').trim();
      const parsed = parseFloat(cleanVal);
      if (!isNaN(parsed)) {
        sum += parsed;
        count++;
      }
    } else if (cellStr === 'yes' || cellStr === 'نعم' || cellStr === 'مكتمل' || cellStr === 'تم') {
      yesCount++;
      totalCellCount++;
    } else if (cellStr === 'no' || cellStr === 'لا' || cellStr === 'غير مكتمل') {
      totalCellCount++;
    }
  });

  if (count > 0) {
    return Math.round(sum / count);
  }

  if (totalCellCount > 0) {
    return Math.round((yesCount / totalCellCount) * 100);
  }

  return 0;
}

function CompactStarsRating({ percentage }: { percentage: number }) {
  const { t } = useLanguage();
  const activeStars = Math.round((percentage / 100) * 10);
  
  let encouragement = '';
  if (percentage >= 95) {
    encouragement = t('reports.compactStar10', 'مستوى مذهل وإتقان كامل! 👑🏆');
  } else if (percentage >= 85) {
    encouragement = t('reports.compactStar9', 'أداء رائع وممتاز جداً! ⭐👏');
  } else if (percentage >= 75) {
    encouragement = t('reports.compactStar8', 'ممتاز، فهم متميز للغاية! 👍✨');
  } else if (percentage >= 60) {
    encouragement = t('reports.compactStar6', 'جيد جداً، واصل التقدم والتركيز! 🚀📈');
  } else if (percentage >= 50) {
    encouragement = t('reports.compactStar5', 'جيد، ولديك القدرة على الأفضل! 😊💪');
  } else if (percentage > 0) {
    encouragement = t('reports.compactStar1', 'محاولة طيبة، استمر في التميز! 🏃‍♂️🎯');
  } else {
    encouragement = t('reports.compactStar0', 'بانتظار البدء لتحقيق العلامة الكاملة! 💫');
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-indigo-50/20 border border-indigo-100/40 rounded-2xl text-center space-y-1 shadow-sm">
      <div className="flex items-center justify-center gap-0.5 flex-row-reverse">
        {Array.from({ length: 10 }).map((_, i) => {
          const isActive = i < activeStars;
          return (
            <Star
              key={i}
              className={`w-3.5 h-3.5 transition-all duration-300 ${
                isActive 
                  ? 'text-amber-500 fill-amber-400 drop-shadow-[0_1px_2px_rgba(245,158,11,0.2)] scale-105' 
                  : 'text-slate-200 stroke-[1.5]'
              }`}
            />
          );
        })}
      </div>
      <div className="text-[10px] md:text-[11px] font-bold text-slate-700 leading-tight">
        {encouragement} <span className="text-indigo-600 font-extrabold">({percentage}%)</span>
      </div>
    </div>
  );
}
