/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student } from '../types';
import { FileText, Download, CheckCircle, AlertTriangle, Table, Award, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

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

export default function ReportDashboard({ student }: ReportDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all_a');
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfBtn, setShowPdfBtn] = useState(false);

  // Table states
  const [allAData, setAllAData] = useState<TableData | null>(null);
  const [allVData, setAllVData] = useState<TableData | null>(null);
  const [correctionData, setCorrectionData] = useState<TableData | null>(null);
  const [wordsData, setWordsData] = useState<TableData | null>(null);
  const [waslData, setWaslData] = useState<TableData | null>(null);
  const [writingData, setWritingData] = useState<TableData | null>(null);

  useEffect(() => {
    fetchAllReports();
    checkPdfControl();
  }, [student.id]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      // Execute parallel calls to retrieve reports
      const [aReport, vReport, cReport, wReport, waslReport, writReport] = await Promise.all([
        callGasApi<TableData>('getStudentData', { studentId: student.id }),
        callGasApi<TableData>('getStudentVideoData', { studentId: student.id }),
        callGasApi<TableData>('getCorrectionData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
        callGasApi<TableData>('getWordsExerciseData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
        callGasApi<TableData>('getWaslExerciseData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
        callGasApi<TableData>('getWritingExerciseData', { studentId: student.id }).catch(() => ({ headers: [], data: [], success: false })),
      ]);

      setAllAData(aReport);
      setAllVData(vReport);
      setCorrectionData(cReport);
      setWordsData(wReport);
      setWaslData(waslReport);
      setWritingData(writReport);
    } catch (err) {
      console.error('Error fetching report tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPdfControl = async () => {
    try {
      const response = await callGasApi<{ success: boolean; control: string }>('getPdfControlForStudent', {
        studentId: student.id,
      });

      if (response.success) {
        const control = response.control.trim();
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

  const handleGeneratePDF = async () => {
    setPdfGenerating(true);
    setPdfUrl(null);
    try {
      const response = await callGasApi<{ success: boolean; pdfUrl?: string; message?: string }>(
        'generateStudentPDF',
        { studentId: student.id }
      );

      if (response.success && response.pdfUrl) {
        setPdfUrl(response.pdfUrl);
        alert('تم إنشاء التقرير الموحد بصيغة PDF وحفظه في حساب جوجل درايف بنجاح! 🚀');
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
      case 'all_a':
        return allAData;
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
            <span>دفتر الدرجات الفوري</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            تقرير الأداء اللغوي الشامل للطالب
          </h1>
          <p className="text-slate-500 text-sm">
            أهلاً {student.name}! استعرض درجاتك، تقييمات المدرس، ونقاط تركيزك، وقم باستخراج الشهادة بصيغة PDF.
          </p>
        </div>

        {/* Generate PDF button controlled by settings */}
        {showPdfBtn && (
          <button
            onClick={handleGeneratePDF}
            disabled={pdfGenerating}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-2xl text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-600/10 shrink-0"
          >
            {pdfGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                جاري توليد الـ PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                استخراج التقرير الرسمي (PDF)
              </>
            )}
          </button>
        )}
      </div>

      {pdfUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between gap-4"
        >
          <div className="text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            جاهز للتحميل! يمكنك الآن تنزيل ملف التقرير الموحد الخاص بك.
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            فتح الملف المستخرج
          </a>
        </motion.div>
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
          النهائي (المرسل)
        </button>
        <button
          onClick={() => setActiveTab('all_v')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'all_v'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          تركيز الفيديو
        </button>
        <button
          onClick={() => setActiveTab('correction')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'correction'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          درجات التركيز
        </button>
        <button
          onClick={() => setActiveTab('words')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'words'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          تمارين الكلمات
        </button>
        <button
          onClick={() => setActiveTab('wasl')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'wasl'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          تمارين الوصل
        </button>
        <button
          onClick={() => setActiveTab('writing')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'writing'
              ? 'bg-slate-950 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          تمارين الكتابة
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm">جاري جلب تقارير الدرجات المباشرة...</span>
          </div>
        ) : currentTable && currentTable.success ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                  {currentTable.headers.map((h, index) => (
                    <th key={index} className="p-4 md:p-5 whitespace-nowrap text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentTable.data.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                    {row.map((cell, cIdx) => {
                      // Formatting yes/no color tags in ALL-A
                      const cellTrim = String(cell || '').trim();
                      let content: React.ReactNode = cell;

                      // Check if it's a URL
                      if (cellTrim.startsWith('http')) {
                        content = (
                          <a
                            href={cellTrim}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            🔗 افتح الملف
                          </a>
                        );
                      } else if (cellTrim === 'Yes' || cellTrim === 'YES') {
                        content = (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                            نعم (مكتمل)
                          </span>
                        );
                      } else if (cellTrim === 'No' || cellTrim === 'NO') {
                        content = (
                          <span className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-full text-xs font-bold">
                            لا (غير مكتمل)
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-900">لا توجد بيانات مسجلة حالياً في هذا القسم</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {currentTable?.message || 'يبدو أنك لم تبدأ بحل أي واجبات أو أنشطة في هذا البند بعد يا بطل.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
