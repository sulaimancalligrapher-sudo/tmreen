/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { callGasApi } from '../utils/api';
import { Student } from '../types';
import StudentScheduleCard, { StudentSchedule } from './StudentScheduleCard';
import ReportDashboard from './ReportDashboard';
import {
  Database,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowRight,
  UserCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Volume2,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sliders,
  Calendar,
  FileText,
  Download,
  FolderDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onOpenConnectionSettings?: () => void;
}

interface AdminUser {
  username: string;
  role: string;
}

interface LessonListItem {
  name: string;
  row: number;
}

interface LessonsData {
  questionsLessons: LessonListItem[];
  matchesLessons: LessonListItem[];
  drawingLessons: LessonListItem[];
}

export default function AdminDashboard({ onBackToHome, onOpenConnectionSettings }: AdminDashboardProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [lessons, setLessons] = useState<LessonsData>({
    questionsLessons: [],
    matchesLessons: [],
    drawingLessons: []
  });
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState('');

  // Editing state
  const [activeTab, setActiveTab] = useState<'words' | 'matching' | 'drawing' | 'students' | 'reports'>('words');
  const [isEditing, setIsEditing] = useState(false);
  const [editingLessonType, setEditingLessonType] = useState<'words' | 'matching' | 'drawing'>('words');
  const [originalLessonName, setOriginalLessonName] = useState('');

  // Student scheduling state
  const [studentSchedules, setStudentSchedules] = useState<StudentSchedule[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Consolidated evaluation and report states
  const [evaluations, setEvaluations] = useState<{ headers: string[]; data: any[][] }>({ headers: [], data: [] });
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [syncingStudentId, setSyncingStudentId] = useState<string | null>(null);
  const [generatingStudentPdfId, setGeneratingStudentPdfId] = useState<string | null>(null);
  const [bulkPdfGenerating, setBulkPdfGenerating] = useState(false);
  const [showBulkPdfConfirmModal, setShowBulkPdfConfirmModal] = useState(false);
  const [skipExistingPdfs, setSkipExistingPdfs] = useState(true);
  const [bulkPdfProgress, setBulkPdfProgress] = useState<{ current: number; total: number; currentStudentName: string }>({ current: 0, total: 0, currentStudentName: '' });
  const [selectedReportStudentId, setSelectedReportStudentId] = useState<string | null>(null);
  const [selectedReportStudent, setSelectedReportStudent] = useState<StudentSchedule | null>(null);
  const [studentSavedPdfUrl, setStudentSavedPdfUrl] = useState<string>('');
  const [loadingPdfUrl, setLoadingPdfUrl] = useState(false);
  const [reportLessonFilter, setReportLessonFilter] = useState('');
  const [reportCompletionFilter, setReportCompletionFilter] = useState<'all' | 'completed' | 'not_started' | 'partial'>('all');

  // Custom student exam/lesson overrides modal state
  const [customizingStudent, setCustomizingStudent] = useState<StudentSchedule | null>(null);
  const [overrideData, setOverrideData] = useState<any>({});
  const [savingOverrides, setSavingOverrides] = useState(false);
  const [overridesActiveTab, setOverridesActiveTab] = useState<'words' | 'matching' | 'drawing'>('words');

  // New States for requested features:
  const [showDefaultInstructions, setShowDefaultInstructions] = useState(false);
  const [showDefaultSettingsModal, setShowDefaultSettingsModal] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<StudentSchedule | null>(null);

  // Words Form State (Questions)
  const [wordsName, setWordsName] = useState('');
  const [wordsShowCorrect, setWordsShowCorrect] = useState('نعم');
  const [wordsCondition, setWordsCondition] = useState('لا');
  const [wordsRetryCond, setWordsRetryCond] = useState('نعم');
  const [wordsResetCond, setWordsResetCond] = useState('نعم');
  const [wordsMaxResets, setWordsMaxResets] = useState('9999');
  const [wordsTotalToAnswer, setWordsTotalToAnswer] = useState('10');
  const [wordsFullScore, setWordsFullScore] = useState('10');
  const [wordsQuestions, setWordsQuestions] = useState<any[]>([]);

  // Matching Form State (Matches)
  const [matchingName, setMatchingName] = useState('');
  const [matchingNextControl, setMatchingNextControl] = useState('نعم');
  const [matchingRetryControl, setMatchingRetryControl] = useState('نعم');
  const [matchingColor, setMatchingColor] = useState('نعم');
  const [matchingUndo, setMatchingUndo] = useState('نعم');
  const [matchingRetryAllowed, setMatchingRetryAllowed] = useState('لا');
  const [matchingMaxRetries, setMatchingMaxRetries] = useState('0');
  const [matchingTotalExpected, setMatchingTotalExpected] = useState('10');
  const [matchingMaxGrade, setMatchingMaxGrade] = useState('10');
  const [matchingQuestions, setMatchingQuestions] = useState<any[]>([]);

  // Drawing Form State (Questions-R)
  const [drawingName, setDrawingName] = useState('');
  const [drawingFullScore, setDrawingFullScore] = useState('10');
  const [drawingResetAllowed, setDrawingResetAllowed] = useState('نعم');
  const [drawingMaxResets, setDrawingMaxResets] = useState('9999');
  const [drawingQuestions, setDrawingQuestions] = useState<any[]>([]);

  // Shared lesson schedule state
  const [lessonShowDate, setLessonShowDate] = useState('');
  const [lessonHideDate, setLessonHideDate] = useState('');
  const [lessonStatus, setLessonStatus] = useState('');

  // Accordion inside form
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deleteConfirmLesson, setDeleteConfirmLesson] = useState<{ type: 'words' | 'matching' | 'drawing'; lessonName: string } | null>(null);

  useEffect(() => {
    // Check if admin is saved in session
    const savedAdmin = sessionStorage.getItem('adminUser');
    const savedRole = sessionStorage.getItem('adminRole');
    if (savedAdmin && savedRole) {
      setAdmin({ username: savedAdmin, role: savedRole });
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchLessons();
    }
  }, [admin]);

  useEffect(() => {
    if (admin && activeTab === 'reports') {
      fetchStudentSchedules();
      fetchEvaluations();
    }
  }, [admin, activeTab]);

  const fetchEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const res = await callGasApi<any>('getStudentsEvaluations');
      if (res && res.success) {
        setEvaluations({
          headers: res.headers || [],
          data: res.data || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  const handleSyncStudent = async (studentId: string, studentName: string) => {
    try {
      setSyncingStudentId(studentId);
      const res = await callGasApi<any>('syncConsolidatedEvaluations', { studentId, studentName });
      if (res && res.success) {
        alert('تم مزامنة وتقييم الطالب بنجاح!');
        fetchEvaluations();
      } else {
        alert('فشل تحديث مزامنة التقييمات.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء المزامنة: ${err.message}`);
    } finally {
      setSyncingStudentId(null);
    }
  };

  const handleGenerateStudentConsolidatedPDF = async (studentId: string, studentName: string) => {
    try {
      setGeneratingStudentPdfId(studentId);
      const res = await callGasApi<{ success: boolean; pdfUrl?: string; message?: string }>('generateStudentConsolidatedPDF', { studentId, studentName });
      if (res && res.success && res.pdfUrl) {
        alert('تم توليد التقرير التقييمي الشامل (PDF) بنجاح وحفظه على جوجل درايف!');
        window.open(res.pdfUrl, '_blank');
      } else {
        alert(res.message || 'فشل توليد ملف الـ PDF حالياً.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء استخراج ملف الـ PDF: ${err.message}`);
    } finally {
      setGeneratingStudentPdfId(null);
    }
  };

  const handleSelectReportStudent = async (student: StudentSchedule) => {
    setSelectedReportStudent(student);
    setStudentSavedPdfUrl('');
    setLoadingPdfUrl(true);
    try {
      const response = await callGasApi<{ success: boolean; control: string; pdfUrl?: string }>('getPdfControlForStudent', {
        studentId: student.studentId
      });
      if (response && response.success && response.pdfUrl) {
        setStudentSavedPdfUrl(response.pdfUrl);
      }
    } catch (err) {
      console.warn('Failed to fetch student saved PDF url:', err);
    } finally {
      setLoadingPdfUrl(false);
    }
  };

  const handleGenerateStudentReportPDF = async (student: StudentSchedule) => {
    try {
      setGeneratingStudentPdfId(student.studentId);
      const res = await callGasApi<{ success: boolean; pdfUrl?: string; message?: string }>('generateStudentConsolidatedPDF', { 
        studentId: student.studentId, 
        studentName: student.studentName 
      });
      if (res && res.success && res.pdfUrl) {
        setStudentSavedPdfUrl(res.pdfUrl);
        alert('تم توليد التقرير التقييمي الشامل (PDF) بنجاح وحفظه على جوجل درايف!\n\nيمكنك الآن النقر على زر "فتح وتحميل ملف الـ PDF" الأخضر في الأسفل للفتح والتحميل.');
        try {
          window.open(res.pdfUrl, '_blank');
        } catch (e) {
          console.warn('Popup blocked:', e);
        }
      } else {
        alert(res.message || 'فشل توليد ملف الـ PDF حالياً.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء استخراج ملف الـ PDF: ${err.message}`);
    } finally {
      setGeneratingStudentPdfId(null);
    }
  };

  const handleGenerateBulkPdfs = async () => {
    let activeStudents = studentSchedules.filter(s => s.studentId !== 'DEFAULT_STUDENT');
    if (!activeStudents || activeStudents.length === 0) {
      try {
        setLoadingStudents(true);
        const data = await callGasApi<StudentSchedule[]>('getAllStudentsSchedule');
        if (data && Array.isArray(data)) {
          setStudentSchedules(data);
          activeStudents = data.filter(s => s.studentId !== 'DEFAULT_STUDENT');
        }
      } catch (err) {
        console.error('Error loading students for bulk export:', err);
      } finally {
        setLoadingStudents(false);
      }
    }

    if (!activeStudents || activeStudents.length === 0) {
      alert('لا يوجد طلاب مسجلين للتصدير حالياً.');
      return;
    }

    setShowBulkPdfConfirmModal(true);
  };

  const executeBulkPdfExport = async () => {
    setShowBulkPdfConfirmModal(false);
    const activeStudents = studentSchedules.filter(s => s.studentId !== 'DEFAULT_STUDENT');
    if (!activeStudents || activeStudents.length === 0) return;

    setBulkPdfGenerating(true);
    setBulkPdfProgress({ current: 0, total: activeStudents.length, currentStudentName: '' });

    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (let i = 0; i < activeStudents.length; i++) {
      const student = activeStudents[i];
      const displayName = student.studentName || student.studentId;
      setBulkPdfProgress({ current: i + 1, total: activeStudents.length, currentStudentName: displayName });

      // If smart skip is enabled, check if student already has a saved PDF URL
      if (skipExistingPdfs) {
        try {
          const checkRes = await callGasApi<{ success: boolean; pdfUrl?: string }>('getPdfControlForStudent', {
            studentId: student.studentId
          });
          if (checkRes && checkRes.pdfUrl && checkRes.pdfUrl.trim().length > 0) {
            skippedCount++;
            continue; // Skip re-generating
          }
        } catch (checkErr) {
          console.warn('Could not check existing PDF for student:', student.studentId, checkErr);
        }
      }

      try {
        const res = await callGasApi<{ success: boolean; pdfUrl?: string; message?: string }>('generateStudentConsolidatedPDF', {
          studentId: student.studentId,
          studentName: student.studentName
        });
        if (res && res.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    setBulkPdfGenerating(false);
    alert(`🎉 اكتملت عملية التصدير الجماعي للتقارير بنجاح!\n\n✅ تم إنشاء وتجديد: ${successCount} ملف PDF\n⏩ تم تخطيهم (موجودين مسبقاً): ${skippedCount} طالب\n❌ تعذر معالجة: ${failCount} طالب`);

    if (selectedReportStudent) {
      handleSelectReportStudent(selectedReportStudent);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoadingLessons(true);
      setLessonsError('');
      const data = await callGasApi<any>('getLessonsForAdmin');
      if (data && data.success) {
        setLessons({
          questionsLessons: data.questionsLessons || [],
          matchesLessons: data.matchesLessons || [],
          drawingLessons: data.drawingLessons || []
        });
      } else {
        setLessonsError(data.message || 'فشل تحميل قائمة التمارين.');
      }
    } catch (err: any) {
      setLessonsError(`فشل جلب التمارين: ${err.message}`);
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchStudentSchedules = async () => {
    try {
      setLoadingStudents(true);
      const data = await callGasApi<StudentSchedule[]>('getAllStudentsSchedule');
      setStudentSchedules(data || []);
    } catch (err: any) {
      console.error('Failed to fetch student schedules:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleUpdateStudentSchedule = async (studentId: string, startDate: string, activeDays: string, lessonsPerWeek: string, daysToKeep: string, expiryDate: string) => {
    try {
      setSavingStudentId(studentId);
      const response = await callGasApi<any>('updateStudentSchedule', {
        studentId,
        startDate,
        activeDays,
        lessonsPerWeek,
        daysToKeep,
        expiryDate
      });
      if (response && response.success) {
        setStudentSchedules(prev => prev.map(s => {
          if (s.studentId === studentId) {
            return { ...s, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate };
          }
          return s;
        }));
        alert('تم حفظ إعدادات جدولة الطالب بنجاح!');
      } else {
        alert(response.message || 'فشل حفظ إعدادات جدولة الطالب.');
      }
    } catch (err: any) {
      alert(`خطأ في حفظ البيانات: ${err.message}`);
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleOpenExamOverridesModal = (student: StudentSchedule) => {
    setCustomizingStudent(student);
    setOverridesActiveTab('words');
    
    // Parse existing overrides
    let parsed: Record<string, any> = {};
    if (student.examOverrides) {
      try {
        parsed = JSON.parse(student.examOverrides);
      } catch (e) {
        console.error("Failed to parse student's exam overrides", e);
      }
    }
    
    // Ensure structure
    const initialData: Record<string, any> = {
      Questions: {},
      Matches: {},
      'Questions-R': {},
      sectionSchedules: {
        Questions: { useCustom: false, startDate: '', activeDays: '', lessonsPerWeek: '3', daysToKeep: '', expiryDate: '' },
        Matches: { useCustom: false, startDate: '', activeDays: '', lessonsPerWeek: '3', daysToKeep: '', expiryDate: '' },
        'Questions-R': { useCustom: false, startDate: '', activeDays: '', lessonsPerWeek: '3', daysToKeep: '', expiryDate: '' }
      }
    };
    
    // Copy any parsed data over
    if (parsed) {
      if (parsed.Questions) initialData.Questions = parsed.Questions;
      if (parsed.Matches) initialData.Matches = parsed.Matches;
      if (parsed['Questions-R']) initialData['Questions-R'] = parsed['Questions-R'];
      if (parsed.sectionSchedules) {
        initialData.sectionSchedules = {
          ...initialData.sectionSchedules,
          ...parsed.sectionSchedules
        };
      }
    }
    
    setOverrideData(initialData);
  };

  const handleSaveExamOverrides = async () => {
    if (!customizingStudent) return;
    try {
      setSavingOverrides(true);
      const studentId = customizingStudent.studentId;
      const jsonStr = JSON.stringify(overrideData);
      
      const response = await callGasApi<any>('updateStudentSchedule', {
        studentId,
        startDate: customizingStudent.startDate,
        activeDays: customizingStudent.activeDays,
        lessonsPerWeek: customizingStudent.lessonsPerWeek,
        daysToKeep: customizingStudent.daysToKeep || '',
        expiryDate: customizingStudent.expiryDate || '',
        examOverrides: jsonStr
      });
      
      if (response && response.success) {
        // Update local student schedules state
        setStudentSchedules(prev => prev.map(s => {
          if (s.studentId === studentId) {
            return { ...s, examOverrides: jsonStr };
          }
          return s;
        }));
        alert('تم حفظ تخصيصات الامتحانات والدروس للطالب بنجاح!');
        setCustomizingStudent(null);
      } else {
        alert(response.message || 'فشل حفظ تخصيصات الامتحانات.');
      }
    } catch (err: any) {
      alert(`خطأ في حفظ التخصيصات: ${err.message}`);
    } finally {
      setSavingOverrides(false);
    }
  };

  const handleOverrideStatusChange = (sheetName: string, lessonName: string, status: string) => {
    setOverrideData(prev => ({
      ...prev,
      [sheetName]: {
        ...prev[sheetName],
        [lessonName]: {
          ...(prev[sheetName]?.[lessonName] || { showDate: '', hideDate: '' }),
          status
        }
      }
    }));
  };

  const handleOverrideDateChange = (sheetName: string, lessonName: string, field: 'showDate' | 'hideDate', value: string) => {
    setOverrideData(prev => ({
      ...prev,
      [sheetName]: {
        ...prev[sheetName],
        [lessonName]: {
          ...(prev[sheetName]?.[lessonName] || { status: 'تاريخ مخصص' }),
          [field]: value
        }
      }
    }));
  };

  const handleSectionScheduleChange = (sheetName: string, field: string, value: any) => {
    setOverrideData(prev => {
      const sectionSchedules = prev.sectionSchedules || {};
      const currentSection = sectionSchedules[sheetName] || {
        useCustom: false,
        startDate: '',
        activeDays: '',
        lessonsPerWeek: '3',
        daysToKeep: '',
        expiryDate: ''
      };
      
      return {
        ...prev,
        sectionSchedules: {
          ...sectionSchedules,
          [sheetName]: {
            ...currentSection,
            [field]: value
          }
        }
      };
    });
  };

  useEffect(() => {
    if (admin && activeTab === 'students') {
      fetchStudentSchedules();
    }
  }, [admin, activeTab]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('يرجى إدخال اسم المستخدم وكلمة المرور للإدارة!');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await callGasApi<any>('loginAdmin', {
        username: loginUsername.trim(),
        password: loginPassword.trim()
      });
      if (response && response.success) {
        setAdmin({ username: response.username, role: response.role });
        sessionStorage.setItem('adminUser', response.username);
        sessionStorage.setItem('adminRole', response.role);
      } else {
        setLoginError(response.message || 'بيانات الدخول غير صحيحة.');
      }
    } catch (err: any) {
      setLoginError(`خطأ في خادم الشيت: ${err.message}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminRole');
    setAdmin(null);
  };

  // Delete Lesson
  const handleDeleteLesson = (type: 'words' | 'matching' | 'drawing', lessonName: string) => {
    setDeleteConfirmLesson({ type, lessonName });
  };

  const executeDeleteLesson = async () => {
    if (!deleteConfirmLesson) return;
    const { type, lessonName } = deleteConfirmLesson;
    const sheetName = type === 'words' ? 'Questions' : type === 'matching' ? 'Matches' : 'Questions-R';
    try {
      setLoadingLessons(true);
      setDeleteConfirmLesson(null);
      const res = await callGasApi<any>('deleteLesson', { sheetName, lessonName });
      if (res && res.success) {
        alert('تم حذف الدرس بنجاح!');
        fetchLessons();
      } else {
        alert(res.message || 'حدث خطأ أثناء حذف الدرس.');
      }
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Words Form Actions
  const initNewWordsLesson = () => {
    setOriginalLessonName('');
    setWordsName('');
    setWordsShowCorrect('نعم');
    setWordsCondition('لا');
    setWordsRetryCond('نعم');
    setWordsResetCond('نعم');
    setWordsMaxResets('9999');
    setWordsTotalToAnswer('10');
    setWordsFullScore('10');
    setWordsQuestions([{ question: '', media: '', letters: [''], correct: [''] }]);
    setOpenQuestionIndex(0);
    setEditingLessonType('words');
    setLessonShowDate('');
    setLessonHideDate('');
    setLessonStatus('');
    setIsEditing(true);
  };

  const addWordsQuestion = () => {
    if (wordsQuestions.length >= 20) {
      alert('الحد الأقصى للأسئلة هو 20 سؤالاً.');
      return;
    }
    setWordsQuestions([...wordsQuestions, { question: '', media: '', letters: [''], correct: [''] }]);
    setOpenQuestionIndex(wordsQuestions.length);
  };

  const removeWordsQuestion = (idx: number) => {
    if (wordsQuestions.length <= 1) return;
    const updated = wordsQuestions.filter((_, i) => i !== idx);
    setWordsQuestions(updated);
    setOpenQuestionIndex(Math.max(0, idx - 1));
  };

  // Matching Form Actions
  const initNewMatchingLesson = () => {
    setOriginalLessonName('');
    setMatchingName('');
    setMatchingNextControl('نعم');
    setMatchingRetryControl('نعم');
    setMatchingColor('نعم');
    setMatchingUndo('نعم');
    setMatchingRetryAllowed('لا');
    setMatchingMaxRetries('0');
    setMatchingTotalExpected('10');
    setMatchingMaxGrade('10');
    setMatchingQuestions([{ questionText: '', leftString: '', rightString: '' }]);
    setOpenQuestionIndex(0);
    setEditingLessonType('matching');
    setLessonShowDate('');
    setLessonHideDate('');
    setLessonStatus('');
    setIsEditing(true);
  };

  const addMatchingQuestion = () => {
    if (matchingQuestions.length >= 10) {
      alert('الحد الأقصى للأسئلة هو 10 أسئلة.');
      return;
    }
    setMatchingQuestions([...matchingQuestions, { questionText: '', leftString: '', rightString: '' }]);
    setOpenQuestionIndex(matchingQuestions.length);
  };

  const removeMatchingQuestion = (idx: number) => {
    if (matchingQuestions.length <= 1) return;
    const updated = matchingQuestions.filter((_, i) => i !== idx);
    setMatchingQuestions(updated);
    setOpenQuestionIndex(Math.max(0, idx - 1));
  };

  // Drawing Form Actions
  const initNewDrawingLesson = () => {
    setOriginalLessonName('');
    setDrawingName('');
    setDrawingFullScore('10');
    setDrawingResetAllowed('نعم');
    setDrawingMaxResets('9999');
    setDrawingQuestions([{
      subLabel: '',
      imageUrls: [''],
      // individual sliders
      opacity: 0.35,
      requiredPercent: 65,
      penSize: 5,
      repetitions: 1,
      timeLimit: 0,
      drawType: 'normal',
      allowUndo: true,
      maxRestarts: 'Infinity',
      maxCancels: 'Infinity'
    }]);
    setOpenQuestionIndex(0);
    setEditingLessonType('drawing');
    setLessonShowDate('');
    setLessonHideDate('');
    setLessonStatus('');
    setIsEditing(true);
  };

  const addDrawingQuestion = () => {
    if (drawingQuestions.length >= 10) {
      alert('الحد الأقصى للأسئلة هو 10 أسئلة.');
      return;
    }
    setDrawingQuestions([...drawingQuestions, {
      subLabel: '',
      imageUrls: [''],
      opacity: 0.35,
      requiredPercent: 65,
      penSize: 5,
      repetitions: 1,
      timeLimit: 0,
      drawType: 'normal',
      allowUndo: true,
      maxRestarts: 'Infinity',
      maxCancels: 'Infinity'
    }]);
    setOpenQuestionIndex(drawingQuestions.length);
  };

  const removeDrawingQuestion = (idx: number) => {
    if (drawingQuestions.length <= 1) return;
    const updated = drawingQuestions.filter((_, i) => i !== idx);
    setDrawingQuestions(updated);
    setOpenQuestionIndex(Math.max(0, idx - 1));
  };

  // Editing Existing Lesson (Load details from Sheet)
  const handleEditLesson = async (type: 'words' | 'matching' | 'drawing', lessonName: string) => {
    try {
      setLoadingLessons(true);
      setOriginalLessonName(lessonName);
      setEditingLessonType(type);

      if (type === 'words') {
        // Fetch Questions sheet lessons list or details. Wait, we can fetch all details using active GAS getLessons
        // Or getLessonsFromMatches, or getLetters. Let's retrieve all questions and find ours.
        if (type === 'words') {
          // We can call getLessons or implement custom fetcher. Wait! We have `getRandomWord` on the backend which returns all questions of a row!
          // Let's find the row number first.
          const found = lessons.questionsLessons.find(l => l.name === lessonName);
          if (found) {
            // Call GAS to get random word but we can fetch the questions
            const res = await callGasApi<any>('getRandomWord', {
              previousIndex: -1,
              rowNumber: found.row,
              studentId: 'admin_preview' // dummy student to trigger loading all question details
            });
            if (res && res.topic) {
              setWordsName(res.topic);
              setWordsShowCorrect(res.showCorrectAnswer || 'نعم');
              setWordsCondition(res.condition || 'عشوائي');
              setWordsRetryCond(res.retryCondition || 'مباشر');
              
              // Find reset config
              const lessonList = await callGasApi<any[]>('getLessons', { studentId: 'admin_preview' });
              const matchL = lessonList.find(l => l.topic === lessonName);
              if (matchL) {
                setWordsResetCond(matchL.allowReset ? 'نعم' : 'لا');
                setWordsMaxResets(matchL.maxResets.toString());
              }

              // Load all questions from that row by requesting indices
              // We can construct the wordsQuestions from total questions
              const tempQs = [];
              // Let's fetch all questions sequentially or directly.
              // Wait, instead of sequential fetch, let's write a backend action 'getWordsLessonDetails' in GAS!
              // That is MUCH cleaner! Let's do a quick fetch of the row using a custom request.
              // Wait! We can fetch the raw profile/data or just load them if we write a cleaner handler.
              // Yes, we will implement 'getWordsLessonDetails', 'getMatchingLessonDetails', 'getDrawingLessonDetails' on the GAS backend!
              // Let's prepare a simple fetch details call.
              const detailsRes = await callGasApi<any>('getLessonDetails', { type, lessonName });
              if (detailsRes && detailsRes.success) {
                const ld = detailsRes.lessonData;
                setWordsName(ld.lessonName);
                setWordsShowCorrect(ld.showCorrectAnswer);
                setWordsCondition(ld.condition);
                setWordsRetryCond(ld.retryCondition);
                setWordsResetCond(ld.resetCondition);
                setWordsMaxResets(ld.maxResets.toString());
                setWordsTotalToAnswer(ld.totalQuestionsToAnswer.toString());
                setWordsFullScore(ld.fullScore.toString());
                setWordsQuestions(ld.questions);
                setLessonShowDate(ld.showDate || '');
                setLessonHideDate(ld.hideDate || '');
                setLessonStatus(ld.status || '');
              } else {
                alert('فشل جلب تفاصيل الدرس من السيرفر. سنقوم بفتح نموذج فارغ.');
                initNewWordsLesson();
                setWordsName(lessonName);
              }
            }
          }
        }
      } else if (type === 'matching') {
        const detailsRes = await callGasApi<any>('getLessonDetails', { type, lessonName });
        if (detailsRes && detailsRes.success) {
          const ld = detailsRes.lessonData;
          setMatchingName(ld.lessonName);
          setMatchingNextControl(ld.nextControl);
          setMatchingRetryControl(ld.retryControl);
          setMatchingColor(ld.colorControl);
          setMatchingUndo(ld.undoControl);
          setMatchingRetryAllowed(ld.retryAllowed);
          setMatchingMaxRetries(ld.maxRetries.toString());
          setMatchingTotalExpected(ld.totalExpectedCorrect.toString());
          setMatchingMaxGrade(ld.maxGrade.toString());
          setMatchingQuestions(ld.questions);
          setLessonShowDate(ld.showDate || '');
          setLessonHideDate(ld.hideDate || '');
          setLessonStatus(ld.status || '');
        } else {
          alert('فشل جلب تفاصيل الدرس من السيرفر.');
          initNewMatchingLesson();
          setMatchingName(lessonName);
        }
      } else if (type === 'drawing') {
        const detailsRes = await callGasApi<any>('getLessonDetails', { type, lessonName });
        if (detailsRes && detailsRes.success) {
          const ld = detailsRes.lessonData;
          setDrawingName(ld.lessonName);
          setDrawingFullScore(ld.fullScore.toString());
          setDrawingResetAllowed(ld.resetAllowed);
          setDrawingMaxResets(ld.maxResets.toString());
          setDrawingQuestions(ld.questions);
          setLessonShowDate(ld.showDate || '');
          setLessonHideDate(ld.hideDate || '');
          setLessonStatus(ld.status || '');
        } else {
          alert('فشل جلب تفاصيل الدرس من السيرفر.');
          initNewDrawingLesson();
          setDrawingName(lessonName);
        }
      }

      setIsEditing(true);
    } catch (err: any) {
      alert(`فشل تحميل الدرس للتعديل: ${err.message}`);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Submit Form
  const handleSubmitWords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordsName.trim()) {
      alert('يرجى كتابة اسم موضوع الدرس!');
      return;
    }
    
    // Validation
    for (let i = 0; i < wordsQuestions.length; i++) {
      const q = wordsQuestions[i];
      if (!q.question.trim()) {
        alert(`السؤال رقم ${i + 1} يفتقد إلى نص السؤال!`);
        return;
      }
      if (q.letters.filter((l: string) => l.trim() !== '').length === 0) {
        alert(`السؤال رقم ${i + 1} يجب أن يحتوي على حرف واحد متاح على الأقل!`);
        return;
      }
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const lessonData = {
        lessonName: wordsName.trim(),
        originalName: originalLessonName,
        showCorrectAnswer: wordsShowCorrect,
        condition: wordsCondition,
        retryCondition: wordsRetryCond,
        resetCondition: wordsResetCond,
        maxResets: parseInt(wordsMaxResets) || 9999,
        totalQuestionsToAnswer: parseInt(wordsTotalToAnswer) || wordsQuestions.length,
        fullScore: parseInt(wordsFullScore) || 10,
        showDate: lessonShowDate,
        hideDate: lessonHideDate,
        questions: wordsQuestions.map(q => ({
          question: q.question.trim(),
          media: q.media.trim(),
          letters: q.letters.map((l: string) => l.trim()).filter((l: string) => l !== ''),
          correct: q.correct.map((c: string) => c.trim()).filter((c: string) => c !== '')
        }))
      };

      const response = await callGasApi<any>('addOrUpdateLessonWords', { lessonData });
      if (response && response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsEditing(false);
          setSubmitSuccess(false);
          fetchLessons();
        }, 1500);
      } else {
        alert(response.message || 'فشل حفظ التعديلات.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء الحفظ: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchingName.trim()) {
      alert('يرجى كتابة اسم الدرس!');
      return;
    }

    for (let i = 0; i < matchingQuestions.length; i++) {
      const q = matchingQuestions[i];
      if (!q.questionText.trim()) {
        alert(`السؤال رقم ${i + 1} يفتقد إلى نص السؤال الرئيسي!`);
        return;
      }
      if (!q.leftString.trim()) {
        alert(`العناصر اليمين للسؤال رقم ${i + 1} مطلوبة!`);
        return;
      }
      if (!q.rightString.trim()) {
        alert(`العناصر اليسار للسؤال رقم ${i + 1} مطلوبة!`);
        return;
      }
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const lessonData = {
        lessonName: matchingName.trim(),
        originalName: originalLessonName,
        nextControl: matchingNextControl,
        retryControl: matchingRetryControl,
        colorControl: matchingColor,
        undoControl: matchingUndo,
        retryAllowed: matchingRetryAllowed,
        maxRetries: parseInt(matchingMaxRetries) || 0,
        totalExpectedCorrect: parseInt(matchingTotalExpected) || 0,
        maxGrade: parseFloat(matchingMaxGrade) || 10,
        showDate: lessonShowDate,
        hideDate: lessonHideDate,
        questions: matchingQuestions.map(q => ({
          questionText: q.questionText.trim(),
          leftString: q.leftString.trim(),
          rightString: q.rightString.trim()
        }))
      };

      const response = await callGasApi<any>('addOrUpdateLessonMatching', { lessonData });
      if (response && response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsEditing(false);
          setSubmitSuccess(false);
          fetchLessons();
        }, 1500);
      } else {
        alert(response.message || 'فشل حفظ التعديلات.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء الحفظ: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDrawing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawingName.trim()) {
      alert('يرجى كتابة اسم درس الرسم والكتابة!');
      return;
    }

    for (let i = 0; i < drawingQuestions.length; i++) {
      const q = drawingQuestions[i];
      if (!q.subLabel.trim()) {
        alert(`الكلمة الفرعية للسؤال رقم ${i + 1} مطلوبة!`);
        return;
      }
      if (q.imageUrls.filter((img: string) => img.trim() !== '').length === 0) {
        alert(`السؤال رقم ${i + 1} يحتاج إلى رابط صورة قالب حرف واحد على الأقل!`);
        return;
      }
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Serialize settingsStr for each drawing question
      // A:opacity,B:percent,C:pensize,D:repetitions,E:timeLimit,F:drawType,G:allowUndo,H:maxRestarts,I:maxCancels
      const questionsSerialized = drawingQuestions.map(q => {
        const settingsArr = [
          `A:${q.opacity}`,
          `B:${q.requiredPercent}`,
          `C:${q.penSize || ''}`,
          `D:${q.repetitions}`,
          `E:${q.timeLimit}`,
          `F:${q.drawType}`,
          `G:${q.allowUndo ? 'YES' : 'NO'}`,
          `H:${q.maxRestarts}`,
          `I:${q.maxCancels}`
        ];
        return {
          subLabel: q.subLabel.trim(),
          imageUrls: q.imageUrls.map((u: string) => u.trim()).filter((u: string) => u !== ''),
          settingsStr: settingsArr.join(',')
        };
      });

      const lessonData = {
        lessonName: drawingName.trim(),
        originalName: originalLessonName,
        fullScore: parseFloat(drawingFullScore) || 10,
        resetAllowed: drawingResetAllowed,
        maxResets: parseInt(drawingMaxResets) || 9999,
        showDate: lessonShowDate,
        hideDate: lessonHideDate,
        questions: questionsSerialized
      };

      const response = await callGasApi<any>('addOrUpdateLessonDrawing', { lessonData });
      if (response && response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsEditing(false);
          setSubmitSuccess(false);
          fetchLessons();
        }, 1500);
      } else {
        alert(response.message || 'فشل حفظ التعديلات.');
      }
    } catch (err: any) {
      alert(`خطأ أثناء الحفظ: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Render Admin Login Modal if not authenticated
  if (!admin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 max-w-md w-full space-y-6 text-right"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex bg-slate-900 text-amber-500 p-4 rounded-full mb-2 shadow-lg">
              <Database className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-sans">بوابة الإدارة والتحكم</h1>
            <p className="text-slate-500 text-sm">
              قم بتسجيل الدخول كمسؤول لإضافة وتعديل وحذف الأسئلة والتمارين مباشرة.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block mr-1">اسم مستخدم الإدارة</label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserCheck className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="مثال: admin"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-left"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block mr-1">كلمة مرور المسؤول</label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl py-3.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-left"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl text-xs flex gap-2 items-center">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold py-3.5 rounded-xl transition shadow-xl flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  جاري التحقق...
                </>
              ) : (
                'تسجيل الدخول للإدارة'
              )}
            </button>
          </form>

          <button
            onClick={onBackToHome}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs"
          >
            العودة لبوابة الطلاب
          </button>
        </motion.div>
      </div>
    );
  }

  // If Admin is authenticated and Editing form is open
  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8 text-right" dir="rtl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full block w-max mb-1">
              {editingLessonType === 'words' ? 'ترتيب الكلمات' : editingLessonType === 'matching' ? 'توصيل العناصر' : 'الكتابة والرسم'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 font-sans">
              {originalLessonName ? `تعديل درس: ${originalLessonName}` : 'إنشاء درس جديد وموضوع مخصص'}
            </h2>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            <ArrowRight className="w-4 h-4" />
            إلغاء والعودة
          </button>
        </div>

        {/* 1. Words Lesson Creator (Questions Sheet) */}
        {editingLessonType === 'words' && (
          <form onSubmit={handleSubmitWords} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-bold text-slate-700 block mr-1">موضوع الدرس (اسم الدرس الكلي)</label>
                <input
                  type="text"
                  value={wordsName}
                  onChange={(e) => setWordsName(e.target.value)}
                  placeholder="مثال: ترتيب حروف الكلمات الثلاثية"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">إظهار الإجابة الصحيحة للطفل؟</label>
                <select
                  value={wordsShowCorrect}
                  onChange={(e) => setWordsShowCorrect(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (إظهار زر الحل عند العجز)</option>
                  <option value="لا">لا (إخفاء زر الحل)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">إتاحة الانتقال للسؤال التالي عند الخطأ؟ (CE)</label>
                <select
                  value={wordsCondition}
                  onChange={(e) => setWordsCondition(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (يمكنه الانتقال للسؤال التالي حتى لو الإجابة خاطئة)</option>
                  <option value="لا">لا (يجب عليه محاولة الإجابة بشكل صحيح أولاً)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">إظهار زر إعادة المحاولة عند الخطأ؟ (CF)</label>
                <select
                  value={wordsRetryCond}
                  onChange={(e) => setWordsRetryCond(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (يظهر زر إعادة المحاولة للطفل)</option>
                  <option value="لا">لا (يُخفى زر إعادة المحاولة عند الخطأ)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">إتاحة إعادة المحاولة للدرس ككل؟</label>
                <select
                  value={wordsResetCond}
                  onChange={(e) => setWordsResetCond(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (يمكنه تصفير الدرس وإعادة الحل)</option>
                  <option value="لا">لا (ممنوع الإعادة)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الحد الأقصى للإعادات</label>
                <input
                  type="number"
                  value={wordsMaxResets}
                  onChange={(e) => setWordsMaxResets(e.target.value)}
                  placeholder="مثال: 3"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الحد الأدنى للأسئلة المنجزة (CI)</label>
                <input
                  type="number"
                  value={wordsTotalToAnswer}
                  onChange={(e) => setWordsTotalToAnswer(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الدرجة الكاملة القصوى للدرس (CJ)</label>
                <input
                  type="number"
                  value={wordsFullScore}
                  onChange={(e) => setWordsFullScore(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                  required
                />
              </div>
              <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 font-sans">جدولة ظهور الدرس (مرنة)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">تاريخ ظهور السؤال (بدء العرض)</label>
                    <input
                      type="datetime-local"
                      value={lessonShowDate}
                      onChange={(e) => setLessonShowDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                    />
                    <span className="text-[10px] text-slate-500 mr-1 block">اتركه فارغاً للظهور الفوري الدائم</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">تاريخ إخفاء السؤال (نهاية العرض)</label>
                    <input
                      type="datetime-local"
                      value={lessonHideDate}
                      onChange={(e) => setLessonHideDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                    />
                    <span className="text-[10px] text-slate-500 mr-1 block">اتركه فارغاً لعدم الاختفاء أبداً</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">حالة السؤال الحالية</label>
                    <div className="h-[46px] flex items-center pr-3 bg-slate-100 rounded-xl border border-slate-200">
                      {lessonStatus ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          lessonStatus === 'ظهور' ? 'bg-emerald-100 text-emerald-800' :
                          lessonStatus === 'انتظار' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {lessonStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-sans">تلقائي (سيتم حسابها عند الحفظ)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions list Accordion */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-950 font-sans">أسئلة الدرس ({wordsQuestions.length})</h3>
                <button
                  type="button"
                  onClick={addWordsQuestion}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  إضافة سؤال جديد
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {wordsQuestions.map((q, qIdx) => {
                  const isOpen = openQuestionIndex === qIdx;
                  return (
                    <div key={`q-words-${qIdx}`} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div
                        onClick={() => setOpenQuestionIndex(isOpen ? null : qIdx)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs">
                            {qIdx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-800">
                            {q.question || `سؤال جديد فارغ #${qIdx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWordsQuestion(qIdx);
                            }}
                            disabled={wordsQuestions.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">نص السؤال / الإرشاد للطفل</label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...wordsQuestions];
                                  updated[qIdx].question = e.target.value;
                                  setWordsQuestions(updated);
                                }}
                                placeholder="مثال: رتب أحرف الكلمة التي تعبر عن الصورة"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">رابط الصوت أو الصورة المرافقة (اختياري)</label>
                              <input
                                type="text"
                                value={q.media}
                                onChange={(e) => {
                                  const updated = [...wordsQuestions];
                                  updated[qIdx].media = e.target.value;
                                  setWordsQuestions(updated);
                                }}
                                placeholder="رابط Google Drive أو أي خادم ملفات"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">الحروف المتاحة المبعثرة (مفصولة بمسافة واحدة)</label>
                              <input
                                type="text"
                                value={q.letters ? q.letters.join(' ') : ''}
                                onChange={(e) => {
                                  const updated = [...wordsQuestions];
                                  updated[qIdx].letters = e.target.value.split(/\s+/);
                                  setWordsQuestions(updated);
                                }}
                                placeholder="مثال: ك ت ا ب"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">الإجابة الصحيحة كاملة (مفصولة بفاصلة أو بنمط الملء)</label>
                              <input
                                type="text"
                                value={q.correct ? q.correct.join(',') : ''}
                                onChange={(e) => {
                                  const updated = [...wordsQuestions];
                                  updated[qIdx].correct = e.target.value.split(',');
                                  setWordsQuestions(updated);
                                }}
                                placeholder="مثال: ك,ت,ا,ب أو للدرس الناقص: |ب|ـيت"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Words Buttons */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ والرفع إلى الشيت...
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    تم الحفظ بنجاح!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ ونشر التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 2. Matching Lesson Creator (Matches Sheet) */}
        {editingLessonType === 'matching' && (
          <form onSubmit={handleSubmitMatching} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-bold text-slate-700 block mr-1">اسم الدرس (Matches)</label>
                <input
                  type="text"
                  value={matchingName}
                  onChange={(e) => setMatchingName(e.target.value)}
                  placeholder="مثال: توصيل الكلمات بصورها"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">تحكم التنقل للورقة التالية (نعم / لا)</label>
                <select
                  value={matchingNextControl}
                  onChange={(e) => setMatchingNextControl(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (يسمح بالتالي دائماً)</option>
                  <option value="لا">لا (الانتقال مشروط بإجابة كاملة صحيحة)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">تحكم إعادة المحاولة للسؤال (نعم / لا)</label>
                <select
                  value={matchingRetryControl}
                  onChange={(e) => setMatchingRetryControl(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (تفعيل زر إعادة المحاولة داخل السؤال)</option>
                  <option value="لا">لا (إلغاء زر إعادة المحاولة داخل السؤال)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">تلوين الخطوط بالصحيح والخاطئ (التحكم باللون)</label>
                <select
                  value={matchingColor}
                  onChange={(e) => setMatchingColor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (تلوين الخطوط أخضر/أحمر للتغذية الراجعة)</option>
                  <option value="لا">لا (خطوط زرقاء موحدة دائماً)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">السماح بالتراجع للطفل؟</label>
                <select
                  value={matchingUndo}
                  onChange={(e) => setMatchingUndo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم (يوجد زر تراجع)</option>
                  <option value="لا">لا (ممنوع التراجع)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">هل إعادة محاولة الدرس بالكامل مسموحة؟</label>
                <select
                  value={matchingRetryAllowed}
                  onChange={(e) => setMatchingRetryAllowed(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم</option>
                  <option value="لا">لا</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الحد الأقصى لإعادات الدرس</label>
                <input
                  type="number"
                  value={matchingMaxRetries}
                  onChange={(e) => setMatchingMaxRetries(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">مجموع العناصر الصحيحة المطلوبة (AL)</label>
                <input
                  type="number"
                  value={matchingTotalExpected}
                  onChange={(e) => setMatchingTotalExpected(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الدرجة القصوى للدرس (AM)</label>
                <input
                  type="number"
                  step="0.1"
                  value={matchingMaxGrade}
                  onChange={(e) => setMatchingMaxGrade(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                  required
                />
              </div>
              <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 font-sans">جدولة ظهور الدرس (مرنة)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">تاريخ ظهور السؤال (بدء العرض)</label>
                    <input
                      type="datetime-local"
                      value={lessonShowDate}
                      onChange={(e) => setLessonShowDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                    />
                    <span className="text-[10px] text-slate-500 mr-1 block">اتركه فارغاً للظهور الفوري الدائم</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">تاريخ إخفاء السؤال (نهاية العرض)</label>
                    <input
                      type="datetime-local"
                      value={lessonHideDate}
                      onChange={(e) => setLessonHideDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                    />
                    <span className="text-[10px] text-slate-500 mr-1 block">اتركه فارغاً لعدم الاختفاء أبداً</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">حالة السؤال الحالية</label>
                    <div className="h-[46px] flex items-center pr-3 bg-slate-100 rounded-xl border border-slate-200">
                      {lessonStatus ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          lessonStatus === 'ظهور' ? 'bg-emerald-100 text-emerald-800' :
                          lessonStatus === 'انتظار' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {lessonStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-sans">تلقائي (سيتم حسابها عند الحفظ)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matching questions list Accordion */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-950 font-sans">أسئلة التوصيل ({matchingQuestions.length})</h3>
                <button
                  type="button"
                  onClick={addMatchingQuestion}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  إضافة سؤال توصيل
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {matchingQuestions.map((q, qIdx) => {
                  const isOpen = openQuestionIndex === qIdx;
                  return (
                    <div key={`q-matching-${qIdx}`} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div
                        onClick={() => setOpenQuestionIndex(isOpen ? null : qIdx)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs">
                            {qIdx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-800">
                            {q.questionText || `سؤال توصيل جديد #${qIdx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMatchingQuestion(qIdx);
                            }}
                            disabled={matchingQuestions.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/20">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">نص إرشاد السؤال (الظاهر في الأعلى للطفل)</label>
                              <input
                                type="text"
                                value={q.questionText}
                                onChange={(e) => {
                                  const updated = [...matchingQuestions];
                                  updated[qIdx].questionText = e.target.value;
                                  setMatchingQuestions(updated);
                                }}
                                placeholder="مثال: صل الكلمة بالصورة واللفظ المناسب"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700 block mr-1">عناصر اليمين (مفصولة بشرطة '-')</label>
                                  <span className="text-[10px] text-slate-400 font-bold">يمكن استخدام #image أو #audio</span>
                                </div>
                                <textarea
                                  value={q.leftString}
                                  onChange={(e) => {
                                    const updated = [...matchingQuestions];
                                    updated[qIdx].leftString = e.target.value;
                                    setMatchingQuestions(updated);
                                  }}
                                  placeholder="أحمد - رابط_صورة#image - رابط_صوت#audio"
                                  rows={2}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-700 block mr-1">مجموعات اليسار المتطابقة (مفصولة بشرطة '-' وبداخلها '|')</label>
                                  <span className="text-[10px] text-slate-400 font-bold">مثال: عنصر1 | عنصر2</span>
                                </div>
                                <textarea
                                  value={q.rightString}
                                  onChange={(e) => {
                                    const updated = [...matchingQuestions];
                                    updated[qIdx].rightString = e.target.value;
                                    setMatchingQuestions(updated);
                                  }}
                                  placeholder="تفاحة - ولد#image|بنت#image - صوت1#audio|صوت2#audio"
                                  rows={2}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition font-mono"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Matching Buttons */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ والنشر...
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    تم الحفظ بنجاح!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ ونشر التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 3. Drawing/Writing Lesson Creator (Questions-R Sheet) */}
        {editingLessonType === 'drawing' && (
          <form onSubmit={handleSubmitDrawing} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-1 md:col-span-4">
                <label className="text-xs font-bold text-slate-700 block mr-1">اسم موضوع الدرس العام (مثال: تعليم حرف الألف)</label>
                <input
                  type="text"
                  value={drawingName}
                  onChange={(e) => setDrawingName(e.target.value)}
                  placeholder="مثال: كتابة الحروف بأشكالها"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الدرجة الكاملة الكلية للدرس (AG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={drawingFullScore}
                  onChange={(e) => setDrawingFullScore(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">إتاحة إعادة تصفير المحاولة؟ (AH)</label>
                <select
                  value={drawingResetAllowed}
                  onChange={(e) => setDrawingResetAllowed(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                >
                  <option value="نعم">نعم</option>
                  <option value="لا">لا</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block mr-1">الحد الأقصى للإعادات (AI)</label>
                <input
                  type="number"
                  value={drawingMaxResets}
                  onChange={(e) => setDrawingMaxResets(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                />
              </div>
              <div className="md:col-span-4 border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 font-sans">جدولة ظهور الدرس (مرنة)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">تاريخ ظهور السؤال (بدء العرض)</label>
                    <input
                      type="datetime-local"
                      value={lessonShowDate}
                      onChange={(e) => setLessonShowDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                    />
                    <span className="text-[10px] text-slate-500 mr-1 block">اتركه فارغاً للظهور الفوري الدائم</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">تاريخ إخفاء السؤال (نهاية العرض)</label>
                    <input
                      type="datetime-local"
                      value={lessonHideDate}
                      onChange={(e) => setLessonHideDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                    />
                    <span className="text-[10px] text-slate-500 mr-1 block">اتركه فارغاً لعدم الاختفاء أبداً</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block mr-1">حالة السؤال الحالية</label>
                    <div className="h-[46px] flex items-center pr-3 bg-slate-100 rounded-xl border border-slate-200">
                      {lessonStatus ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          lessonStatus === 'ظهور' ? 'bg-emerald-100 text-emerald-800' :
                          lessonStatus === 'انتظار' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {lessonStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-sans">تلقائي (سيتم حسابها عند الحفظ)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawing questions list Accordion */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-950 font-sans">كلمات وحروف الرسم ({drawingQuestions.length})</h3>
                <button
                  type="button"
                  onClick={addDrawingQuestion}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  إضافة تمرين كتابة ورسم
                </button>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {drawingQuestions.map((q, qIdx) => {
                  const isOpen = openQuestionIndex === qIdx;
                  return (
                    <div key={`q-drawing-${qIdx}`} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div
                        onClick={() => setOpenQuestionIndex(isOpen ? null : qIdx)}
                        className={`p-4 flex items-center justify-between cursor-pointer transition ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs">
                            {qIdx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-800">
                            {q.subLabel || `تمرين كتابة ورسم جديد #${qIdx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDrawingQuestion(qIdx);
                            }}
                            disabled={drawingQuestions.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/20 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">الكلمة أو الحرف المستهدف للكتابة</label>
                              <input
                                type="text"
                                value={q.subLabel}
                                onChange={(e) => {
                                  const updated = [...drawingQuestions];
                                  updated[qIdx].subLabel = e.target.value;
                                  setDrawingQuestions(updated);
                                }}
                                placeholder="مثال: أَرَاسَ"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700 block mr-1">روابط صور قالب التتبع (مفصولة بفواصل منقوطة ';')</label>
                              <input
                                type="text"
                                value={q.imageUrls ? q.imageUrls.join(';') : ''}
                                onChange={(e) => {
                                  const updated = [...drawingQuestions];
                                  updated[qIdx].imageUrls = e.target.value.split(';');
                                  setDrawingQuestions(updated);
                                }}
                                placeholder="رابط مباشر للصورة القالب"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left font-mono"
                              />
                            </div>
                          </div>

                          <div className="border-t border-slate-200/60 pt-3 mt-1 space-y-3">
                            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <Settings className="w-4 h-4 text-amber-500" />
                              إعدادات ومعايير التحقق التقني للرسم (تلقائياً)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">درجة شفافية قالب الحرف الخلفي (A)</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="0.1"
                                    max="0.9"
                                    step="0.05"
                                    value={q.opacity}
                                    onChange={(e) => {
                                      const updated = [...drawingQuestions];
                                      updated[qIdx].opacity = parseFloat(e.target.value);
                                      setDrawingQuestions(updated);
                                    }}
                                    className="flex-1 accent-amber-500"
                                  />
                                  <span className="font-bold w-10 text-left">{q.opacity}</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">النسبة المئوية المطلوبة لاكتمال الخط (B)</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="30"
                                    max="100"
                                    step="5"
                                    value={q.requiredPercent}
                                    onChange={(e) => {
                                      const updated = [...drawingQuestions];
                                      updated[qIdx].requiredPercent = parseInt(e.target.value);
                                      setDrawingQuestions(updated);
                                    }}
                                    className="flex-1 accent-amber-500"
                                  />
                                  <span className="font-bold w-10 text-left">{q.requiredPercent}%</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">حجم سن قلم الكتابة المطلوب (C)</label>
                                <input
                                  type="number"
                                  value={q.penSize || ''}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].penSize = e.target.value ? parseInt(e.target.value) : null;
                                    setDrawingQuestions(updated);
                                  }}
                                  placeholder="فارغ لاختياره تلقائياً"
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">التكرارات المطلوبة للرسم (D)</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={q.repetitions}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].repetitions = parseInt(e.target.value) || 1;
                                    setDrawingQuestions(updated);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">الحد الزمني بالدقائق (E) - 0 بلا حدود</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={q.timeLimit}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].timeLimit = parseFloat(e.target.value) || 0;
                                    setDrawingQuestions(updated);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">نوع الرسم (F)</label>
                                <select
                                  value={q.drawType}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].drawType = e.target.value;
                                    setDrawingQuestions(updated);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                                >
                                  <option value="normal">تتبع القالب العادي (normal)</option>
                                  <option value="free">كتابة حرة كاملة (free)</option>
                                </select>
                              </div>

                              <div className="space-y-1 flex items-center gap-2 pt-5">
                                <input
                                  type="checkbox"
                                  id={`allowUndo-${qIdx}`}
                                  checked={q.allowUndo}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].allowUndo = e.target.checked;
                                    setDrawingQuestions(updated);
                                  }}
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-200"
                                />
                                <label htmlFor={`allowUndo-${qIdx}`} className="text-[11px] font-bold text-slate-700 block cursor-pointer">
                                  السماح بالتراجع خطوة (G)
                                </label>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">الحد الأقصى لإعادات مسح الكلمة (H)</label>
                                <input
                                  type="text"
                                  value={q.maxRestarts}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].maxRestarts = e.target.value;
                                    setDrawingQuestions(updated);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] text-slate-500 block">الحد الأقصى للإلغاءات (I)</label>
                                <input
                                  type="text"
                                  value={q.maxCancels}
                                  onChange={(e) => {
                                    const updated = [...drawingQuestions];
                                    updated[qIdx].maxCancels = e.target.value;
                                    setDrawingQuestions(updated);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-left"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Drawing Buttons */}
            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ والنشر...
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    تم الحفظ بنجاح!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ ونشر التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Admin Dashboard Main List Portal
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8 text-right" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold text-slate-400 block">بوابة الإدارة النشطة</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans mt-1">لوحة تحكم إعداد التمارين</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            أهلاً بك يا <span className="font-bold text-slate-800">{admin.username}</span> ({admin.role}). تحكم بجميع الأسئلة والتمارين من هنا دون دخول للشيت.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenConnectionSettings && (
            <button
              onClick={onOpenConnectionSettings}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-indigo-100 shadow-sm"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              إعدادات الربط والاتصال
            </button>
          )}
          <button
            onClick={fetchLessons}
            disabled={loadingLessons}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-100"
            title="تحديث قائمة البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLessons ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition"
          >
            خروج من الإدارة
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            العودة للواجهة الرئيسية
          </button>
        </div>
      </div>

      {/* Tabs configuration */}
      <div className="flex flex-wrap border-b border-slate-100 mb-6 font-bold text-sm gap-y-2">
        <button
          onClick={() => setActiveTab('words')}
          className={`pb-4 px-4 border-b-2 transition ${activeTab === 'words' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          تمارين الكلمات ({lessons.questionsLessons.length})
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`pb-4 px-4 border-b-2 transition ${activeTab === 'matching' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          تمارين توصيل ({lessons.matchesLessons.length})
        </button>
        <button
          onClick={() => setActiveTab('drawing')}
          className={`pb-4 px-4 border-b-2 transition ${activeTab === 'drawing' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          تمارين الكتابة ({lessons.drawingLessons.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-4 px-4 border-b-2 transition ${activeTab === 'students' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          تخصيص
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 px-4 border-b-2 transition ${activeTab === 'reports' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          تقارير وتقييم
        </button>
      </div>

      {/* Tabs content rendering */}
      {lessonsError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl text-xs flex gap-2 items-center mb-6">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{lessonsError}</span>
        </div>
      )}

      {loadingLessons ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-slate-400 text-xs font-bold">جاري تحميل بيانات التمارين من Google Sheets...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Tab: Words */}
          {activeTab === 'words' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">الموضوعات المسجلة حالياً في ورقة Questions</span>
                <button
                  onClick={initNewWordsLesson}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  إضافة موضوع درس كلمات جديد
                </button>
              </div>

              {lessons.questionsLessons.length === 0 ? (
                <div className="py-10 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm">
                  لا توجد دروس حالية في ورقة Questions. ابدأ بإضافة أول درس!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lessons.questionsLessons.map((item, idx) => (
                    <div key={`words-list-${idx}`} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-lg">صف {item.row}</span>
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditLesson('words', item.name)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                          title="تعديل تفاصيل وأسئلة الدرس"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson('words', item.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="حذف الدرس نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Matching */}
          {activeTab === 'matching' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">الدروس المسجلة حالياً في ورقة Matches</span>
                <button
                  onClick={initNewMatchingLesson}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  إضافة درس توصيل جديد
                </button>
              </div>

              {lessons.matchesLessons.length === 0 ? (
                <div className="py-10 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm">
                  لا توجد دروس حالية في ورقة Matches. ابدأ بإضافة أول درس!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lessons.matchesLessons.map((item, idx) => (
                    <div key={`matching-list-${idx}`} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-lg">صف {item.row}</span>
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditLesson('matching', item.name)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                          title="تعديل تفاصيل التوصيل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson('matching', item.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="حذف الدرس"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Drawing */}
          {activeTab === 'drawing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">الدروس المسجلة حالياً في ورقة Questions-R</span>
                <button
                  onClick={initNewDrawingLesson}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  إضافة درس كتابة ورسم جديد
                </button>
              </div>

              {lessons.drawingLessons.length === 0 ? (
                <div className="py-10 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm">
                  لا توجد دروس حالية في ورقة Questions-R. ابدأ بإضافة أول درس!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lessons.drawingLessons.map((item, idx) => (
                    <div key={`drawing-list-${idx}`} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-lg">صف {item.row}</span>
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditLesson('drawing', item.name)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                          title="تعديل تتبع الحروف"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson('drawing', item.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="حذف الدرس"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

          {/* Active Tab: Students */}
          {activeTab === 'students' && (() => {
            const defaultSchedule = studentSchedules.find(s => s.studentId === 'DEFAULT_STUDENT');
            const regularSchedules = studentSchedules.filter(s => s.studentId !== 'DEFAULT_STUDENT');

            return (
              <div className="space-y-6">
                {/* Global Default Configuration Panel as requested */}
                {!loadingStudents && defaultSchedule && (
                  <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50/80 border border-indigo-100 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-right">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl shrink-0">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <h3 className="font-extrabold text-indigo-950 text-sm sm:text-base">
                          الإعدادات الافتراضية العامة لجميع الطلاب
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          تُطبق تلقائياً على كل الطلاب لتوفير الجهد، ما لم تقم بتخصيص جدول منفرد لطالب محدد.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      {/* Button 1: Info Instructions Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setShowDefaultInstructions(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition border border-indigo-100 font-bold text-xs"
                      >
                        💡 كيف تعمل الإعدادات؟
                      </button>

                      {/* Button 2: Global Config Settings Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setShowDefaultSettingsModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-bold text-xs shadow-md shadow-indigo-600/10"
                      >
                        <Sliders className="w-4 h-4" />
                        تعديل الإعدادات العامة للكل
                      </button>
                    </div>
                  </div>
                )}

                {/* Regular Students list */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="text-right">
                      <h4 className="font-bold text-slate-800 text-sm">قائمة الطلاب وجدولتهم الخاصة</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">انقر على اسم أي طالب لعرض وتعديل بطاقة جدولته الخاصة ومواعيد دروسه</p>
                    </div>
                    <input
                      type="text"
                      placeholder="البحث عن طالب بالاسم أو الرقم..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none w-full max-w-xs text-right font-sans"
                    />
                  </div>

                  {loadingStudents ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                      <p className="text-slate-400 text-xs font-bold">جاري جلب قائمة الطلاب وجدولاتهم...</p>
                    </div>
                  ) : (() => {
                    const filteredRegularSchedules = regularSchedules.filter(s => 
                      s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) || 
                      s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
                    );

                    if (filteredRegularSchedules.length === 0) {
                      return (
                        <div className="py-10 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm">
                          لا توجد بيانات طلاب حالية في ورقة Settings.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredRegularSchedules.map((student) => (
                          <button
                            key={student.studentId}
                            type="button"
                            onClick={() => setSelectedStudentForDetails(student)}
                            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50/40 hover:border-amber-300 border border-slate-100 rounded-2xl cursor-pointer transition text-right w-full group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm group-hover:bg-amber-100 transition">
                                {student.studentName.charAt(0)}
                              </div>
                              <div className="text-right">
                                <div className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-amber-950 transition">{student.studentName}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">رقم الطالب: {student.studentId}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                student.startDate 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                {student.startDate ? 'جدولة مخصصة' : 'يتبع الافتراضي'}
                              </span>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition rotate-180 shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

      {/* Active Tab: Reports */}
      {activeTab === 'reports' && selectedReportStudent && (
        <div className="space-y-6 text-right animate-fade-in">
          {/* Header Card for student reports details */}
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectedReportStudent(null)}
                className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl transition border border-slate-200 shadow-sm shrink-0"
                title="الرجوع لقائمة الطلاب"
              >
                <ArrowRight className="w-5 h-5 font-bold" />
              </button>
              <div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full border border-indigo-100">بطاقة الطالب التقييمية</span>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-xl mt-1">
                  {selectedReportStudent.studentName}
                </h3>
                <p className="text-slate-400 text-xs font-mono mt-0.5">
                  رقم الطالب: {selectedReportStudent.studentId}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSyncStudent(selectedReportStudent.studentId, selectedReportStudent.studentName)}
                disabled={syncingStudentId === selectedReportStudent.studentId}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl transition font-extrabold text-xs disabled:opacity-50"
                title="تحديث ورقة ConsolidatedEvaluations ببيانات الطالب"
              >
                {syncingStudentId === selectedReportStudent.studentId ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-700" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                تحديث الشيت المجمع (Sync Sheet)
              </button>
              <button
                type="button"
                onClick={() => handleGenerateStudentReportPDF(selectedReportStudent)}
                disabled={generatingStudentPdfId === selectedReportStudent.studentId}
                className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl transition font-extrabold text-xs shadow-md shadow-amber-200/50 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {generatingStudentPdfId === selectedReportStudent.studentId ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                عمل ملف بي دي اف (PDF)
              </button>
            </div>
          </div>

          {/* Saved PDF Link Display on the student card */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">🔗 رابط ملف التقرير المرفق (PDF)</h4>
            {loadingPdfUrl ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>جاري البحث عن روابط PDF سابقة للطالب...</span>
              </div>
            ) : studentSavedPdfUrl ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl text-right">
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100/60 px-2 py-0.5 rounded-full">جاهز للتحميل 🏆</span>
                  <p className="text-[11px] text-slate-600 mt-1 truncate max-w-md font-sans" dir="ltr">{studentSavedPdfUrl}</p>
                </div>
                <a
                  href={studentSavedPdfUrl}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0 font-sans"
                >
                  <Eye className="w-4 h-4" />
                  فتح وتحميل ملف الـ PDF
                </a>
              </div>
            ) : (
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-center text-slate-400 text-xs">
                لا يوجد تقرير PDF محفوظ ومسجل في الشيت حالياً لهذا الطالب. اضغط على زر "عمل ملف بي دي اف" في الأعلى لإنشاء الرابط وحفظه.
              </div>
            )}
          </div>

          {/* Embedded 6-table student assessment dashboard */}
          <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-sm">
            <ReportDashboard student={{ id: selectedReportStudent.studentId, name: selectedReportStudent.studentName }} />
          </div>
        </div>
      )}

      {activeTab === 'reports' && !selectedReportStudent && (
        <div className="space-y-6 text-right animate-fade-in">
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                تقارير وتقييم الطلاب الشاملة 📊
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                اختر أي طالب بطل من القائمة بالأسفل لفتح وعرض جداول التقييم الستة الشاملة واستخراج ملف التقرير PDF.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={handleGenerateBulkPdfs}
                disabled={bulkPdfGenerating || loadingStudents}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition disabled:opacity-50 shrink-0"
                title="توليد ملفات PDF الشاملة لجميع الطلاب دفعة واحدة وتحديث روابطها في شيت PDF"
              >
                <FolderDown className="w-4 h-4" />
                تصدير PDF لجميع الطلاب (دفعة واحدة)
              </button>
              <input
                type="text"
                placeholder="البحث عن طالب بالاسم أو الرقم..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none w-full md:w-64 text-right font-sans"
              />
            </div>
          </div>

          {loadingStudents ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-slate-400 text-xs font-bold">جاري تحميل قائمة الطلاب الأبطال...</p>
            </div>
          ) : (() => {
            const regularSchedules = studentSchedules.filter(s => s.studentId !== 'DEFAULT_STUDENT');
            const filteredStudents = regularSchedules.filter(s => 
              s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) || 
              s.studentId.toLowerCase().includes(studentSearch.toLowerCase())
            );

            if (filteredStudents.length === 0) {
              return (
                <div className="py-12 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm">
                  لا توجد نتائج مطابقة لبحثك عن الطلاب.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <button
                    key={student.studentId}
                    type="button"
                    onClick={() => handleSelectReportStudent(student)}
                    className="flex items-center justify-between p-5 bg-white hover:bg-amber-50/30 hover:border-amber-300 border border-slate-100 rounded-3xl cursor-pointer transition text-right w-full group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base group-hover:bg-amber-100 transition">
                        {student.studentName.charAt(0)}
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-amber-950 transition">{student.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">رقم الطالب: {student.studentId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 group-hover:bg-amber-100/50 px-3 py-1.5 rounded-xl transition">
                      <span>عرض التقييم الشامل</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </div>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Lessons */}
      {deleteConfirmLesson && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 max-w-md w-full space-y-6 text-right"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex bg-rose-50 text-rose-500 p-4 rounded-full mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">تأكيد حذف الدرس</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                هل أنت متأكد من حذف درس <span className="font-bold text-rose-600">"{deleteConfirmLesson.lessonName}"</span> بالكامل من الشيت؟
                <br />
                <span className="text-xs text-rose-500 font-semibold">(لا يمكن التراجع عن هذا الإجراء وسيتم مسح جميع بياناته نهائياً)</span>
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={executeDeleteLesson}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-5 rounded-2xl transition text-sm shadow-md shadow-rose-200"
              >
                نعم، احذف نهائياً
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmLesson(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-2xl transition text-sm"
              >
                تراجع وإلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Exam and Lesson Overrides Modal */}
      {customizingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 max-w-4xl w-full space-y-6 text-right flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setCustomizingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
              <div>
                <h3 className="text-xl font-bold text-slate-900">تخصيص مواعيد الامتحانات والدروس</h3>
                <p className="text-slate-500 text-xs mt-1">الطالب: <span className="font-bold text-indigo-600">{customizingStudent.studentName}</span> (رقم: {customizingStudent.studentId})</p>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 pb-1 gap-2">
              <button
                type="button"
                onClick={() => setOverridesActiveTab('words')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition ${
                  overridesActiveTab === 'words'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                التمارين والأسئلة ({lessons.questionsLessons.length})
              </button>
              <button
                type="button"
                onClick={() => setOverridesActiveTab('matching')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition ${
                  overridesActiveTab === 'matching'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                التوصيل والمطابقة ({lessons.matchesLessons.length})
              </button>
              <button
                type="button"
                onClick={() => setOverridesActiveTab('drawing')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition ${
                  overridesActiveTab === 'drawing'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                الكتابة والرسم ({lessons.drawingLessons.length})
              </button>
            </div>

            {/* Lessons overrides list */}
            <div className="flex-1 overflow-y-auto min-h-0 py-2 space-y-3 pl-2 scrollbar-thin">
              {(() => {
                const sheetName = overridesActiveTab === 'words' ? 'Questions' : overridesActiveTab === 'matching' ? 'Matches' : 'Questions-R';
                const sSch = (overrideData.sectionSchedules && overrideData.sectionSchedules[sheetName]) || {
                  useCustom: false,
                  startDate: '',
                  activeDays: '',
                  lessonsPerWeek: '3',
                  daysToKeep: '',
                  expiryDate: ''
                };

                const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                const getSelectedDays = (dayString: string) => {
                  if (!dayString) return [];
                  return dayString.split(/[,،]/).map(d => d.trim()).filter(Boolean);
                };

                const toggleSectionDay = (day: string) => {
                  const selected = getSelectedDays(sSch.activeDays || '');
                  let newSelected: string[];
                  if (selected.includes(day)) {
                    newSelected = selected.filter(d => d !== day);
                  } else {
                    newSelected = daysOfWeek.filter(d => selected.includes(d) || d === day);
                  }
                  handleSectionScheduleChange(sheetName, 'activeDays', newSelected.join(', '));
                };

                const currentLessons = overridesActiveTab === 'words' ? lessons.questionsLessons : overridesActiveTab === 'matching' ? lessons.matchesLessons : lessons.drawingLessons;

                return (
                  <>
                    {/* Custom Section Scheduling Card */}
                    <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100 rounded-3xl p-5 mb-5 text-right space-y-4">
                      <div className="flex flex-col sm:flex-row-reverse sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Sliders className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-slate-800 text-sm">الجدولة المتسلسلة التلقائية لهذا القسم</h4>
                        </div>
                        <div className="flex items-center gap-2 justify-start">
                          <select
                            value={sSch.useCustom ? 'custom' : 'general'}
                            onChange={(e) => handleSectionScheduleChange(sheetName, 'useCustom', e.target.value === 'custom')}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="general">اتباع الجدولة العامة للطالب</option>
                            <option value="custom">تخصيص جدولة مستقلة لهذا القسم</option>
                          </select>
                        </div>
                      </div>

                      {sSch.useCustom ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-indigo-50/50 pt-4 text-right">
                          {/* Start Date */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ بدء الدراسة للقسم</label>
                            <input
                              type="date"
                              value={sSch.startDate || ''}
                              onChange={(e) => handleSectionScheduleChange(sheetName, 'startDate', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Lessons count per day */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">الدروس اليومية للقسم</label>
                            <input
                              type="number"
                              min="1"
                              value={sSch.lessonsPerWeek || '3'}
                              onChange={(e) => handleSectionScheduleChange(sheetName, 'lessonsPerWeek', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Days to Keep Lesson */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">بقاء الدرس بالقسم (أيام)</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="البقاء دائماً"
                              value={sSch.daysToKeep || ''}
                              onChange={(e) => handleSectionScheduleChange(sheetName, 'daysToKeep', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Expiry Date */}
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ الإخفاء النهائي للقسم</label>
                            <input
                              type="date"
                              value={sSch.expiryDate || ''}
                              onChange={(e) => handleSectionScheduleChange(sheetName, 'expiryDate', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Active Days */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">أيام الدراسة النشطة للقسم</label>
                            <div className="flex flex-wrap gap-1 justify-end mb-2">
                              {daysOfWeek.map((day) => {
                                const isSelected = getSelectedDays(sSch.activeDays || '').includes(day);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleSectionDay(day)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition border ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                            <input
                              type="text"
                              placeholder="السبت، الثلاثاء..."
                              value={sSch.activeDays || ''}
                              onChange={(e) => handleSectionScheduleChange(sheetName, 'activeDays', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs flex flex-row-reverse items-center justify-between bg-white border border-slate-100 p-3 rounded-2xl">
                          <span className="font-medium text-right leading-relaxed">
                            يتبع هذا القسم حالياً الجدولة العامة للطالب: تاريخ البدء: <span className="font-mono text-indigo-600 font-bold">{customizingStudent.startDate || 'غير محدد'}</span> | أيام الدراسة: <span className="font-bold text-indigo-600">{customizingStudent.activeDays || 'كل الأيام'}</span> | الدروس اليومية: <span className="font-bold text-indigo-600">{customizingStudent.lessonsPerWeek} دروس</span>
                          </span>
                          <span className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold">افتراضي</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-4 mb-2">
                      <h4 className="font-bold text-slate-800 text-sm mb-1">استثناءات وحالة الدروس الفردية</h4>
                      <p className="text-slate-400 text-[10px]">تخصيص حالة أو تاريخ ظهور/إخفاء لدرس معين بذاته في هذا القسم (مثال للامتحانات أو مراجعة مخصصة)</p>
                    </div>

                    {currentLessons.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-xs">
                        لا توجد دروس مضافة في هذه الورقة حالياً.
                      </div>
                    ) : (
                      currentLessons.map((lesson) => {
                        const o = overrideData[sheetName]?.[lesson.name] || { status: '', showDate: '', hideDate: '' };
                        return (
                          <div key={lesson.row} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                            {/* Right: Lesson Details */}
                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-800">{lesson.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">الصف رقم {lesson.row} في الورقة</p>
                            </div>

                            {/* Left: Override Options */}
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Custom Dates Inputs */}
                              {o.status === 'تاريخ مخصص' && (
                                <div className="flex items-center gap-2 bg-white border border-slate-100 p-1.5 rounded-xl">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 pr-1">تاريخ الإخفاء</span>
                                    <input
                                      type="date"
                                      value={o.hideDate || ''}
                                      onChange={(e) => handleOverrideDateChange(sheetName, lesson.name, 'hideDate', e.target.value)}
                                      className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 pr-1">تاريخ الظهور</span>
                                    <input
                                      type="date"
                                      value={o.showDate || ''}
                                      onChange={(e) => handleOverrideDateChange(sheetName, lesson.name, 'showDate', e.target.value)}
                                      className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Status dropdown */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-slate-400 pr-1">الحالة المخصصة</span>
                                <select
                                  value={o.status || ''}
                                  onChange={(e) => handleOverrideStatusChange(sheetName, lesson.name, e.target.value)}
                                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                  <option value="">الوضع الافتراضي للشيت</option>
                                  <option value="عرض دائماً">إظهار دائماً للطالب</option>
                                  <option value="إخفاء دائماً">إخفاء دائماً عن الطالب</option>
                                  <option value="تاريخ مخصص">تخصيص تاريخ (ظهور/إخفاء)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setCustomizingStudent(null)}
                disabled={savingOverrides}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveExamOverrides}
                disabled={savingOverrides}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
              >
                {savingOverrides ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري حفظ التخصيص...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ تخصيص الامتحانات</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Instructions Modal as requested */}
      {showDefaultInstructions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-indigo-100 shadow-2xl p-6 max-w-lg w-full space-y-6 text-right"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                onClick={() => setShowDefaultInstructions(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-1.5 justify-end">
                <span>💡 كيف تعمل الإعدادات الافتراضية؟</span>
              </h3>
            </div>
            
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50 text-indigo-950">
                <strong>الهدف الرئيسي:</strong> توفير الوقت والجهد بضبط إعدادات موحدة تُطبّق تلقائياً على الجميع بدلاً من التعديل لكل طالب على حدة.
              </div>
              <p>
                1. <strong className="text-indigo-950">المرونة التامة والاستثناءات:</strong> أي حقل تتركه فارغاً في جدول المواعيد للطلاب، سيقوم النظام تلقائياً باعتماد القيمة الافتراضية المحددة في الإعدادات العامة.
              </p>
              <p>
                2. <strong className="text-indigo-950">جدولة التمارين المتسلسلة للجميع:</strong> يمكنك تحديد خطة دراسية وجدولة زمنية (الكلمات، التوصيل، الرسم) لتطبق على الجميع بدفعة واحدة!
              </p>
              <p>
                3. <strong className="text-indigo-950">التخصيص الفردي المفرّد:</strong> إذا كان هناك طالب يحتاج إلى معاملة خاصة أو أيام دراسة مختلفة، يكفي النقر على اسمه وتعديل بطاقته الخاصة، وستلغي القيم المخصصة له وحده القيم الافتراضية العامة.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDefaultInstructions(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
              >
                فهمت ذلك 👍
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Global Default Settings Modal as requested */}
      {showDefaultSettingsModal && (() => {
        const defaultSchedule = studentSchedules.find(s => s.studentId === 'DEFAULT_STUDENT');
        return defaultSchedule ? (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-indigo-100 shadow-2xl p-6 max-w-xl w-full space-y-4 text-right flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setShowDefaultSettingsModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
                <h3 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <span>الإعدادات الافتراضية العامة لجميع الطلاب</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1">
                <StudentScheduleCard
                  schedule={defaultSchedule}
                  onSave={async (studentId, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate) => {
                    await handleUpdateStudentSchedule(studentId, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate);
                  }}
                  onOpenExamOverrides={handleOpenExamOverridesModal}
                  isSaving={savingStudentId === 'DEFAULT_STUDENT'}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowDefaultSettingsModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        ) : null;
      })()}

      {/* Selected Student Details Modal as requested */}
      {selectedStudentForDetails && (() => {
        const defaultSchedule = studentSchedules.find(s => s.studentId === 'DEFAULT_STUDENT');
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 max-w-xl w-full space-y-4 text-right flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  onClick={() => setSelectedStudentForDetails(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                    {selectedStudentForDetails.studentName.charAt(0)}
                  </div>
                  <span>جدولة وتخصيص الطالب: {selectedStudentForDetails.studentName}</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1">
                <StudentScheduleCard
                  schedule={selectedStudentForDetails}
                  defaultSchedule={defaultSchedule}
                  onSave={async (id, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate) => {
                    await handleUpdateStudentSchedule(id, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate);
                    // Update state of local item so change is reflected immediately
                    setStudentSchedules(prev => prev.map(s => s.studentId === id ? { ...s, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate } : s));
                    setSelectedStudentForDetails(prev => prev ? { ...prev, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate } : null);
                  }}
                  onOpenExamOverrides={(sch) => {
                    handleOpenExamOverridesModal(sch);
                    setSelectedStudentForDetails(null); // Close detail modal and open exam override
                  }}
                  isSaving={savingStudentId === selectedStudentForDetails.studentId}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedStudentForDetails(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  إغلاق التفاصيل
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Bulk PDF Generation Confirmation Modal */}
      {showBulkPdfConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <FolderDown className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                تصدير PDF لجميع الطلاب 📁
              </h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                هل تريد البدء في تصدير وتوليد ملفات الـ PDF التقييمية لجميع الطلاب الأبطال المسجلين (عددهم <span className="font-extrabold text-emerald-600 font-sans text-sm">{studentSchedules.filter(s => s.studentId !== 'DEFAULT_STUDENT').length}</span> طالب)؟
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>سيتم إنشاء وتحديث ملف PDF لكل طالب منفرد</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>حفظ الرابط المباشر في ورقة PDF لتسهيل الوصول</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تتم المعالجة تتابعياً لتفادي أي مهلة زمنية</span>
              </div>

              <label className="flex items-center gap-2.5 pt-2 border-t border-slate-200 mt-2 cursor-pointer font-extrabold text-slate-800">
                <input
                  type="checkbox"
                  checked={skipExistingPdfs}
                  onChange={(e) => setSkipExistingPdfs(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-emerald-700">تخطي الطلاب الذين تمت المتابعة وإنشاء PDF لهم مسبقاً (الاستئناف المباشر)</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={executeBulkPdfExport}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition"
              >
                تأكيد وتوليد الآن 🚀
              </button>
              <button
                type="button"
                onClick={() => setShowBulkPdfConfirmModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk PDF Generation Progress Overlay */}
      {bulkPdfGenerating && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">جاري تصدير ملفات الـ PDF الشاملة 🚀</h3>
              <p className="text-slate-500 text-xs mt-1">
                جاري تجميع درجات وتقييمات الطلاب واستخراج ملفات الـ PDF وحفظها في جوجل درايف...
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>نسبة الإنجاز:</span>
                <span className="font-sans text-emerald-600 font-extrabold text-sm">
                  {Math.round((bulkPdfProgress.current / Math.max(bulkPdfProgress.total, 1)) * 100)}% ({bulkPdfProgress.current} من {bulkPdfProgress.total})
                </span>
              </div>
              
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round((bulkPdfProgress.current / Math.max(bulkPdfProgress.total, 1)) * 100)}%` }}
                />
              </div>

              <div className="pt-1 text-right">
                <p className="text-xs text-slate-600 font-bold truncate">
                  الطالب الحالي: <span className="text-indigo-600 font-extrabold">{bulkPdfProgress.currentStudentName}</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-amber-700 font-bold bg-amber-50 p-3 rounded-xl border border-amber-100">
              💡 معالجة الطلاب تتم تتابعياً لضمان الدقة وعدم تجاوز مهلة جوجل، يرجى عدم إغلاق هذه النافذة.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
