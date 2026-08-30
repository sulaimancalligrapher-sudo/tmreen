import React, { useState, useEffect, useRef } from 'react';
import { AttendanceSettings, StudentSchedule, TeacherContact, TelegramLanguageTemplates, TelegramBotCommandConfig } from '../types';
import {
  testTelegramBotToken,
  sendTelegramMessage,
  answerTelegramCallbackQuery,
  interpolateTelegramTemplate,
  syncTelegramSignups,
  acknowledgeTelegramUpdates,
  clearTelegramDispatchCache,
  DEFAULT_TELEGRAM_TEMPLATES_AR,
  DEFAULT_TELEGRAM_TEMPLATES_EN,
  DEFAULT_TELEGRAM_TEMPLATES_TH,
  DEFAULT_TELEGRAM_BOT_COMMANDS,
  syncAllTelegramUsersToSheet,
  saveTelegramUserToSheetPassive,
} from '../utils/telegram';
import {
  dispatchAttendanceTelegramNotification,
  clearAllTelegramNotificationMemory,
  clearStudentActivePresence,
  dispatchTeacherPreClassBriefing,
  dispatchTeacherMidClassSnapshot,
  dispatchTeacherPostSessionWrapup,
  isRealStudentRecord,
  checkAndDispatchAutomatedAlerts,
  AutomatedSchedulerResult,
  SchedulerStudentDiagnostic,
} from '../utils/telegramScheduler';
import {
  isMasterMenuQuery,
  isEvaluationResultsQuery,
  isRemainingLessonsQuery,
  isScheduleQuery,
  isTeacherQuery,
  isStudentInfoQuery,
  sendStudentMasterMenu,
  sendStudentEvaluationReport,
  sendStudentRemainingLessonsReport,
  sendStudentScheduleReport,
  sendStudentTeacherReport,
  sendStudentInfoReport,
  buildStudentMasterMenuKeyboard,
} from '../utils/telegramEvaluationHelper';
import { processTelegramBotUpdates } from '../utils/telegramBotProcessor';
import {
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  Check,
  Globe,
  Radio,
  FileText,
  MessageSquare,
  Sparkles,
  Bot,
  Image,
  Video,
  Mic,
  FileCode,
  UserCheck,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  BellRing,
  QrCode,
  Copy,
  Lock,
  Hash,
  Share2,
  Info,
  Link,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  Filter,
  Layers,
  Clock,
  Timer,
  Play,
  Sliders,
  Calendar,
  Zap,
  TrendingUp,
  LogIn,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TemplateDefinitionItem {
  key: keyof TelegramLanguageTemplates;
  category: 'registration' | 'attendance' | 'evaluation' | 'security' | 'teacher_admin';
  categoryLabel: string;
  categoryBadge: string;
  title: string;
  shortDesc: string;
  description: string;
  iconName: string;
  supportedVars: { tag: string; label: string }[];
  sampleVars: Record<string, string | number>;
}

export const TEMPLATE_DEFINITIONS: TemplateDefinitionItem[] = [
  {
    key: 'welcomePrompt',
    category: 'registration',
    categoryLabel: 'رسائل البداية والتسجيل',
    categoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    title: '1. رسالة الترحيب الأولى وطلب الرقم الدراسي',
    shortDesc: 'تظهر للطالب الجديد عند إرسال /start لإرشاده بإرسال رقمه',
    description: 'الرسالة الترحيبية الأولى التي تظهر للطالب أو ولي الأمر عند فتح البوت لأول مرة والضغط على زر البدء /start لطلب إرسال رقمه الدراسي.',
    iconName: 'Sparkles',
    supportedVars: [],
    sampleVars: {},
  },
  {
    key: 'idVerifiedPrompt',
    category: 'registration',
    categoryLabel: 'رسائل البداية والتسجيل',
    categoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    title: '2. تأكيد الرقم ودعوة اختيار لغة الإشعارات',
    shortDesc: 'تأكيد اسم الطالب وعرض أزرار اختيار اللغة (🇸🇦 / 🇬🇧 / 🇹🇭)',
    description: 'تصل الطالب فور إدخاله لرقم دراسي صحيح ومطابق لكشوف المدرسة؛ تؤكد اسمه ورقمه وتدعوه لاختيار لغة الإشعارات عبر الأزرار التفاعلية.',
    iconName: 'CheckCircle2',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{رقم_الطالب}}', label: 'الرقم الدراسي' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101' },
  },
  {
    key: 'regSuccess',
    category: 'registration',
    categoryLabel: 'رسائل البداية والتسجيل',
    categoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    title: '3. رسالة إتمام التسجيل والربط النهائي',
    shortDesc: 'تأكيد تفعيل الحساب باللغة المختارة (دون تكرار أزرار اللغات)',
    description: 'الرسالة الختامية التي تصل الطالب بعد النقر على لغته المفضلة لتأكيد ربط حسابه وتفعيل استلام الإشعارات بلغته المختارة.',
    iconName: 'Check',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{رقم_الطالب}}', label: 'الرقم الدراسي' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101' },
  },
  {
    key: 'linkedStudentPrompt',
    category: 'registration',
    categoryLabel: 'رسائل البداية والتسجيل',
    categoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    title: '4. رسالة الطالب المربوط وتغيير اللغة (/lang)',
    shortDesc: 'تظهر للطالب المربوط مسبقاً عند الدخول أو طلب تغيير اللغة',
    description: 'تظهر للطالب الذي تم ربط حسابه مسبقاً عند فتح البوت مجدداً أو كتابة أمر /lang لتغيير لغة الإشعارات المفضلة عبر الأزرار.',
    iconName: 'RefreshCw',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{رقم_الطالب}}', label: 'الرقم الدراسي' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101' },
  },
  {
    key: 'studentNotFound',
    category: 'registration',
    categoryLabel: 'رسائل البداية والتسجيل',
    categoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    title: '5. تنبيه عدم العثور على الرقم الدراسي',
    shortDesc: 'إشعار الخطأ عند إدخال رقم أو اسم غير مسجل في الكشف',
    description: 'يتم إرسالها تلقائياً إذا قام المستخدم بإدخال رقم دراسي غير مطابق لأي طالب مسجل في كشف المدرسة لإرشاده بالتصحيح.',
    iconName: 'AlertCircle',
    supportedVars: [
      { tag: '{{المدخل}}', label: 'الرقم أو النص المدخل' },
    ],
    sampleVars: { input: '999' },
  },
  {
    key: 'welcome',
    category: 'registration',
    categoryLabel: 'رسائل البداية والتسجيل',
    categoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    title: '6. رسالة الترحيب الشاملة بالخطة والجدول',
    shortDesc: 'رسالة الترحيب المفصلة بالجدول ومواعيد الحصص',
    description: 'رسالة الترحيب الكاملة التي تتضمن تفاصيل الجدول الدراسي الكامل ومواعيد الحصص المعتمدة.',
    iconName: 'Sparkles',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{رقم_الطالب}}', label: 'الرقم الدراسي' },
      { tag: '{{الايام}}', label: 'الأيام المعتمدة' },
      { tag: '{{الوقت}}', label: 'وقت الحصة' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101', days: 'الأحد - الثلاثاء - الخميس', time: '19:00' },
  },
  {
    key: 'securityLinkedAlert',
    category: 'security',
    categoryLabel: 'تنبيهات الحماية والأمان',
    categoryBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    title: '7. تنبيه أمني - الحساب مربوط مسبقاً بطالب آخر',
    shortDesc: 'منع اختلاط بيانات الطلاب من نفس حساب التيليجرام',
    description: 'حماية أمنية صارمة: تظهر عند محاولة شخص مسجل بجهاز تيليجرام إدخال رقم طالب ثانٍ لمنع تداخل الحسابات وضمان الخصوصية.',
    iconName: 'Shield',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب المربوط' },
      { tag: '{{رقم_الطالب}}', label: 'رقم حسابه' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101' },
  },
  {
    key: 'deviceProtectionAlert',
    category: 'security',
    categoryLabel: 'تنبيهات الحماية والأمان',
    categoryBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    title: '8. تنبيه حماية - رقم الطالب مربوط بجهاز آخر',
    shortDesc: 'منع سرقة الحسابات أو ربطها من أجهزة مجهولة',
    description: 'حماية خصوصية: تظهر عند محاولة جهاز غريب إدخال رقم طالب مربوط مسبقاً بجهاز آخر، وتوجهه لمراجعة الإدارة لإعادة التعيين.',
    iconName: 'Lock',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{رقم_الطالب}}', label: 'الرقم الدراسي' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101' },
  },
  {
    key: 'preClass',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '9. رسالة التذكير قبل موعد الحصة',
    shortDesc: 'تنبيه الطالب للاستعداد قبل بداية الحصة بوقت كافٍ',
    description: 'تذكير مسبق يُرسل تلقائياً قبل موعد الحصة المعتمدة (مثلاً قبل 15 دقيقة) لتجهيز الطالب والدخول في الوقت المحدد.',
    iconName: 'BellRing',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت}}', label: 'موعد الحصة' },
    ],
    sampleVars: { studentName: 'أحمد علي', time: '19:00' },
  },
  {
    key: 'earlyEntryAllowed',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '10. رسالة دخول مبكر (مسموح بالدخول)',
    shortDesc: 'تشجيع وتحية الطالب عند دخوله مبكراً قبل موعد الحصة',
    description: 'تُرسل تشجيعاً للطالب إذا دخل المنصة التعليمية قبل موعد الحصة عندما يكون خيار الدخول المبكر مسموحاً.',
    iconName: 'Sparkles',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت}}', label: 'توقيت الحصة المقرر' },
    ],
    sampleVars: { studentName: 'أحمد علي', time: '19:00' },
  },
  {
    key: 'earlyEntryBlocked',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '11. رسالة دخول مبكر (ممنوع قبل الوقت)',
    shortDesc: 'توجيه بالانتظار حتى حلول الموعد المحدد للحصة',
    description: 'تُرسل لتنبيه الطالب إذا حاول الدخول قبل موعد الحصة وكان خيار منع الدخول المبكر مفعلاً مع توضيح وقت الحصة المحدد.',
    iconName: 'AlertCircle',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت}}', label: 'موعد الحصة المحدد' },
    ],
    sampleVars: { studentName: 'أحمد علي', time: '19:00' },
  },
  {
    key: 'login',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '12. إشعار تسجيل الحضور والدخول (في الموعد)',
    shortDesc: 'تأكيد دخول الطالب بالموعد وبدء الحصة والدعاء له',
    description: 'إشعار فوري يُرسل للطالب فور فتح المنصة وتسجيل الدخول لبدء الحصة المقررة بالموعد المعتمد.',
    iconName: 'BellRing',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{رقم_الطالب}}', label: 'الرقم الدراسي' },
      { tag: '{{الوقت}}', label: 'توقيت الدخول' },
      { tag: '{{الدرس}}', label: 'الدروس المقررة' },
    ],
    sampleVars: { studentName: 'أحمد علي', studentId: '101', time: '19:00', lesson: 'القرآن الكريم والتجويد' },
  },
  {
    key: 'absent',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '13. رسالة إنذار التأخر عن الحصة',
    shortDesc: 'تنبيه عاجل عند انقضاء مهلة البداية دون تسجيل الدخول',
    description: 'إنذار يُرسل للطالب بعد انقضاء مهلة البداية (مثلاً بعد 10 دقائق) دون تسجيل دخوله للحصة، ويمكن تكرارها حسب الإعدادات.',
    iconName: 'AlertCircle',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت}}', label: 'وقت الحصة' },
    ],
    sampleVars: { studentName: 'أحمد علي', time: '19:00' },
  },
  {
    key: 'earlyExit',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '14. إشعار تسجيل خروج مبكر قبل انتهاء الحصة',
    shortDesc: 'إشعار بمغادرة الطالب للمنصة قبل نهاية وقت الحصة المقرر',
    description: 'يُرسل للطالب عند تسجيل الخروج قبل انقضاء المدة الزمنية المعتمدة للحصة لتنبيهه بأنه غادر مبكراً.',
    iconName: 'AlertCircle',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت_الفعلي}}', label: 'وقت الخروج الفعلي' },
      { tag: '{{وقت_الحصة}}', label: 'وقت الحصة المقرر' },
    ],
    sampleVars: { studentName: 'أحمد علي', actualTime: '19:40', classTime: '19:00 - 21:00' },
  },
  {
    key: 'regularExit',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '15. إشعار إنهاء الحصة وتسجيل الخروج النظامي',
    shortDesc: 'تأكيد إتمام الحصة وتسجيل الخروج بعد انقضاء وقتها',
    description: 'يُرسل للطالب عند تسجيل خروجه بعد إتمام الحصة وانقضاء وقتها المعتمد بنجاح.',
    iconName: 'CheckCircle2',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت_الفعلي}}', label: 'وقت الخروج' },
    ],
    sampleVars: { studentName: 'أحمد علي', actualTime: '21:00' },
  },
  {
    key: 'finalAbsent',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    title: '16. إشعار الغياب النهائي عن الحصة',
    shortDesc: 'إشعار نهائي عند عدم حضور الطالب طوال فترة الحصة أو اليوم',
    description: 'يُرسل عند انتهاء وقت الحصة بالكامل أو بنهاية اليوم دون تسجيل دخول الطالب، ويسجل الطالب كغائب.',
    iconName: 'AlertCircle',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الوقت}}', label: 'وقت الحصة' },
      { tag: '{{التاريخ}}', label: 'تاريخ الحصة' },
    ],
    sampleVars: { studentName: 'أحمد علي', time: '19:00', date: new Date().toLocaleDateString('ar-SA') },
  },
  {
    key: 'complete',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '17. رسالة إكمال التمارين اليومية بنجاح',
    shortDesc: 'إشعار تشجيعي بإنهاء جميع دروس وتمارين اليوم',
    description: 'رسالة تشجيعية فورية تُرسل عند إكمال الطالب لجميع التمارين والمطابقات المقررة لحصته اليومية.',
    iconName: 'Sparkles',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الدرس}}', label: 'الدروس المنجزة' },
    ],
    sampleVars: { studentName: 'أحمد علي', lesson: 'تمارين الحفظ والمطابقة' },
  },
  {
    key: 'evaluation',
    category: 'evaluation',
    categoryLabel: 'التقييم والنتائج',
    categoryBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    title: '18. بطاقة التقييم وتأكيد الإجابات (الموجزة)',
    shortDesc: 'بطاقة نتائج التمارين والدرجات والنجوم وملاحظات المعلم',
    description: 'بطاقة تقرير الأداء التلقائية التي تتضمن نسبة الإنجاز والدرجة المحققة والنجوم وملاحظات المعلم.',
    iconName: 'Sparkles',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الدرس}}', label: 'الدرس/التمرين' },
      { tag: '{{الدرجة}}', label: 'النسبة %' },
      { tag: '{{النجوم}}', label: 'النجوم' },
      { tag: '{{ملاحظات}}', label: 'ملاحظات المعلم' },
    ],
    sampleVars: { studentName: 'أحمد علي', lesson: 'تجويد سورة النبأ', score: '98', stars: '5', notes: 'أداء متميز وإتقان رائع!' },
  },
  {
    key: 'evaluationDetail',
    category: 'evaluation',
    categoryLabel: 'التقييم والنتائج',
    categoryBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    title: '19. تقرير الدرجات والتقييم المفصل (عند طلب: تقييم / ن / results)',
    shortDesc: 'كشف تفصيلي بالدروس المنجزة والنسبة والنجوم والأزرار التفاعلية',
    description: 'يُرسل تلقائياً عند طلب الاستعلام برمز (تقييم أو ن أو results أو بالضغط على زر التقييم) متضمناً قائمة الدروس المنجزة والنسب ومجموع النجوم.',
    iconName: 'Sparkles',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{تقرير_الدرجات_المفصل}}', label: 'تفاصيل الدروس والنسب والنجوم' },
      { tag: '{{الدرجة}}', label: 'متوسط الدرجات %' },
      { tag: '{{النجوم}}', label: 'إجمالي النجوم' },
      { tag: '{{المنجز}}', label: 'عدد الدروس المنجزة' },
    ],
    sampleVars: {
      studentName: 'أحمد علي',
      detailed_evaluations: '⭐ سورة الفاتحة (100% - 5 نجوم)\n⭐ سورة النبأ (95% - 5 نجوم)\n⭐ أحكام النون الساكنة (90% - 4 نجوم)',
      score: '95',
      stars: '14',
      completed_count: '3',
    },
  },
  {
    key: 'remainingLessons',
    category: 'evaluation',
    categoryLabel: 'التقييم والنتائج',
    categoryBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    title: '20. تقرير الدروس المتبقية (عند طلب: متبقي / ب / remaining)',
    shortDesc: 'قائمة الدروس والتمارين المتبقية التي لم ينجزها الطالب بعد',
    description: 'يُرسل عند طلب الاستعلام برمز (متبقي أو ب أو remaining أو بالضغط على زر المتبقي) لتشجيع الطالب على إنهاء خطته التعليمية.',
    iconName: 'FileText',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{قائمة_الدروس_المتبقية}}', label: 'قائمة الدروس المتبقية' },
      { tag: '{{المنجز}}', label: 'الدروس المنجزة' },
      { tag: '{{المتبقي}}', label: 'عدد الدروس المتبقية' },
    ],
    sampleVars: {
      studentName: 'أحمد علي',
      remaining_lessons_list: '⏳ سورة النازعات\n⏳ سورة عبس\n⏳ التجويد العملي',
      completed_count: '3',
      remaining_count: '3',
    },
  },
  {
    key: 'scheduleReminder',
    category: 'attendance',
    categoryLabel: 'إشعارات الحصص والحضور',
    categoryBadge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    title: '21. رسالة جدول الحصص والدروس المعتمد',
    shortDesc: 'تفاصيل الخطة الدراسية وأيام الحضور ووقت البدء',
    description: 'تتضمن مواعيد الحصص المعتمدة وأيام الحضور الأسبوعية ومقدار الدروس اليومية وتاريخ الانتهاء.',
    iconName: 'FileText',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الايام}}', label: 'أيام الحضور' },
      { tag: '{{الوقت}}', label: 'وقت البدء' },
      { tag: '{{الدروس}}', label: 'عدد الدروس' },
      { tag: '{{تاريخ_الانتهاء}}', label: 'تاريخ الانتهاء' },
    ],
    sampleVars: { studentName: 'أحمد علي', days: 'الأحد - الثلاثاء - الخميس', time: '19:00', lessons_count: '2', end_date: '2026-12-31' },
  },
  {
    key: 'teacherAlert',
    category: 'teacher_admin',
    categoryLabel: 'المعلم والإدارة',
    categoryBadge: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    title: '22. إشعار المعلم المباشر بغياب أو دخول الطالب',
    shortDesc: 'تنبيه مباشر في تيليجرام المعلم الخاص',
    description: 'إشعار مباشر يصل إلى حساب المعلم المسؤول فور دخول طالبه أو غيابه أو عند انتهائه من تسليم الواجبات.',
    iconName: 'UserCheck',
    supportedVars: [
      { tag: '{{المعلم}}', label: 'اسم المعلم' },
      { tag: '{{اسم_الطالب}}', label: 'اسم الطالب' },
      { tag: '{{الدرس}}', label: 'الدرس' },
      { tag: '{{الوقت}}', label: 'الوقت' },
    ],
    sampleVars: { teacherName: 'الشيخ عبد الرحمن', studentName: 'أحمد علي', lesson: 'سورة الملك', time: '19:05' },
  },
  {
    key: 'adminAlert',
    category: 'teacher_admin',
    categoryLabel: 'المعلم والإدارة',
    categoryBadge: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    title: '23. رسالة التعميم الإداري العام',
    shortDesc: 'صيغة بث التعاميم الإدارية للقنوات والمجموعات',
    description: 'قالب الرسائل الإدارية والتعاميم الموحدة التي يتم بثها للمجموعات أو القنوات الرسمية.',
    iconName: 'Radio',
    supportedVars: [
      { tag: '{{نص_التعميم}}', label: 'نص التعميم' },
      { tag: '{{التاريخ}}', label: 'التاريخ' },
    ],
    sampleVars: { announcementText: 'نحيطكم علماً بأن إجازة منتصف الفصل ستبدأ يوم الخميس القادم.', date: new Date().toLocaleDateString('ar-SA') },
  },
];

interface TelegramHubProps {
  settings: AttendanceSettings;
  onUpdateSettings: (settings: AttendanceSettings) => void;
  allSchedules: StudentSchedule[];
  onUpdateScheduleStudentTelegram: (studentId: string, telegramChatId: string, preferredLang?: 'ar' | 'en' | 'th', phone?: string) => void;
  onDeleteStudentTelegram?: (studentId: string) => void;
  onSaveAll: (customSettingsToSave?: AttendanceSettings) => Promise<void>;
  isSaving: boolean;
}

export default function TelegramHub({
  settings,
  onUpdateSettings,
  allSchedules,
  onUpdateScheduleStudentTelegram,
  onDeleteStudentTelegram,
  onSaveAll,
  isSaving,
}: TelegramHubProps) {
  // Sub-tab Navigation
  const [subTab, setSubTab] = useState<'bot_setup' | 'automation_timing' | 'templates' | 'directory' | 'direct_messages' | 'bot_commands'>('bot_setup');

  // Directory: Teachers State
  const [teachers, setTeachers] = useState<TeacherContact[]>(() => {
    return settings.teachers && Array.isArray(settings.teachers) ? settings.teachers : [];
  });
  const [newTeacherName, setNewTeacherName] = useState<string>('');
  const [newTeacherRole, setNewTeacherRole] = useState<string>('معلم المادة');
  const [newTeacherChatId, setNewTeacherChatId] = useState<string>('');
  const [newTeacherPhone, setNewTeacherPhone] = useState<string>('');
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Directory: Students Search Filter
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Bot Testing State
  const [showBotToken, setShowBotToken] = useState<boolean>(false);
  const [testingBot, setTestingBot] = useState<boolean>(false);
  const [botTestResult, setBotTestResult] = useState<{ ok: boolean; message: string; username?: string } | null>(null);
  const [syncingSignups, setSyncingSignups] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncingUsersSheet, setSyncingUsersSheet] = useState<boolean>(false);
  const [usersSheetSyncFeedback, setUsersSheetSyncFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Keep a ref of allSchedules & teachers & settings to prevent stale closures in interval
  const allSchedulesRef = useRef(allSchedules);
  allSchedulesRef.current = allSchedules;
  const teachersRef = useRef(teachers);
  teachersRef.current = teachers;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onUpdateScheduleStudentTelegramRef = useRef(onUpdateScheduleStudentTelegram);
  onUpdateScheduleStudentTelegramRef.current = onUpdateScheduleStudentTelegram;
  const onUpdateSettingsRef = useRef(onUpdateSettings);
  onUpdateSettingsRef.current = onUpdateSettings;

  // Delete Confirmation Modal State (Custom In-App Dialog)
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<{ id: string; name: string } | null>(null);

  // Local student schedules state to reflect edits/deletions immediately in the UI
  const [localSchedules, setLocalSchedules] = useState<StudentSchedule[]>(() => {
    if (allSchedules && allSchedules.length > 0) return allSchedules;
    try {
      const cached = localStorage.getItem('all_schedules_cached');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (allSchedules && allSchedules.length > 0) {
      setLocalSchedules(allSchedules);
    }
  }, [allSchedules]);

  // Ignored / explicitly unlinked student IDs to prevent auto-poller from re-linking old getUpdates
  const ignoredStudentIdsRef = useRef<Set<string>>(new Set());

  // Initialize ignored set from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('telegram_unlinked_students');
      if (stored) {
        ignoredStudentIdsRef.current = new Set(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Background Auto-Poller for Telegram Signups (Supports One-Click DeepLinks AND General ID Chatting)
  const greetedChatsRef = useRef<Set<string>>(new Set());
  const processedUpdateIdsRef = useRef<Set<number>>(new Set());
  const processedCallbacksRef = useRef<Set<string>>(new Set());
  const lastActionTimestampRef = useRef<Map<string, number>>(new Map());
  const chatLanguagePrefRef = useRef<Map<string, 'ar' | 'en' | 'th'>>(new Map());

  useEffect(() => {
    if (!settings.telegramToken || !autoSyncEnabled) return;

    let isSubscribed = true;

    const runSilentSync = async () => {
      const token = settingsRef.current.telegramToken;
      if (!token) return;

      try {
        const res = await syncTelegramSignups(token);
        if (!isSubscribed || !res.ok) return;

        let newlyLinkedCount = 0;
        const currentSchedules = allSchedulesRef.current && allSchedulesRef.current.length > 0
          ? allSchedulesRef.current
          : localSchedules;

        // If schedules are completely empty yet (still loading on initial mount), skip processing this cycle
        if (currentSchedules.length === 0) return;

        // Refresh ignored list
        try {
          const currentUnlinkedRaw = localStorage.getItem('telegram_unlinked_students');
          if (currentUnlinkedRaw) {
            ignoredStudentIdsRef.current = new Set(JSON.parse(currentUnlinkedRaw));
          }
        } catch (e) {}

        // Process all updates via Central Master Bot Processor
        await processTelegramBotUpdates({
          token,
          settings: settingsRef.current,
          allSchedules: currentSchedules,
          signups: res.signups,
          plainStarts: res.plainStarts,
          idSubmissions: res.idSubmissions,
          callbackQueries: res.callbackQueries,
          onUpdateScheduleStudentTelegram: (studentId, chatId, lang) => {
            onUpdateScheduleStudentTelegramRef.current(studentId, chatId, lang);
            newlyLinkedCount++;
          },
          onUpdateTeacherTelegram: (teacherId, chatId) => {
            setTeachers((prev) => {
              const updated = prev.map((t) => (t.id === teacherId ? { ...t, telegramChatId: chatId } : t));
              onUpdateSettings({ ...settingsRef.current, teachers: updated });
              return updated;
            });
          },
        });

        if (newlyLinkedCount > 0) {
          setSyncFeedback(`✨ تم الربط التلقائي الفوري لـ (${newlyLinkedCount}) حساب جديد في تيليجرام!`);
        }
      } catch (e) {
        // silent fail on network fluctuation
      }
    };

    // Run immediately once, then every 5 seconds
    runSilentSync();
    const interval = setInterval(runSilentSync, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [settings.telegramToken, autoSyncEnabled]);

  // Admin Test Msg State
  const [sendingAdminTest, setSendingAdminTest] = useState<boolean>(false);
  const [adminTestResult, setAdminTestResult] = useState<string>('');

  // Private Admin User ID Test State
  const [sendingPrivateAdminTest, setSendingPrivateAdminTest] = useState<boolean>(false);
  const [privateAdminTestResult, setPrivateAdminTestResult] = useState<string>('');

  // Telegram Groups State
  const [groups, setGroups] = useState<{ id: string; name: string; chatId: string; type: 'teachers' | 'students' | 'general'; description?: string }[]>(() => {
    return settings.telegramGroups && Array.isArray(settings.telegramGroups) ? settings.telegramGroups : [];
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupChatId, setNewGroupChatId] = useState('');
  const [newGroupType, setNewGroupType] = useState<'teachers' | 'students' | 'general'>('general');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // Telegram Channels State
  const [channels, setChannels] = useState<{ id: string; name: string; chatId: string; accessType: 'public' | 'private'; description?: string }[]>(() => {
    return settings.telegramChannels && Array.isArray(settings.telegramChannels) ? settings.telegramChannels : [];
  });
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelChatId, setNewChannelChatId] = useState('');
  const [newChannelAccessType, setNewChannelAccessType] = useState<'public' | 'private'>('public');
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);

  // Student/Teacher QR & Direct Link Share Modal
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    type: 'student' | 'teacher';
    id: string;
    name: string;
    currentChatId?: string;
  } | null>(null);
  const [showGeneralShareModal, setShowGeneralShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBroadcastMsg, setCopiedBroadcastMsg] = useState(false);
  const [copiedGeneralMsg, setCopiedGeneralMsg] = useState(false);

  // Direct Messaging Center State
  const [targetType, setTargetType] = useState<'admin_channel' | 'all_students' | 'all_teachers' | 'specific_student' | 'specific_teacher'>('admin_channel');
  const [selectedTargetStudentId, setSelectedTargetStudentId] = useState<string>('');
  const [selectedTargetTeacherId, setSelectedTargetTeacherId] = useState<string>('');
  const [directMessageText, setDirectMessageText] = useState<string>('');
  const [mediaType, setMediaType] = useState<'none' | 'photo' | 'video' | 'audio' | 'document'>('none');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [sendingDirect, setSendingDirect] = useState<boolean>(false);
  const [directSendLog, setDirectSendLog] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Template Hub State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<keyof TelegramLanguageTemplates>('welcomePrompt');
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'registration' | 'attendance' | 'evaluation' | 'security' | 'teacher_admin'>('all');
  const [previewSimulatorLang, setPreviewSimulatorLang] = useState<'ar' | 'en' | 'th'>('ar');
  const [copiedTemplateLang, setCopiedTemplateLang] = useState<'ar' | 'en' | 'th' | null>(null);
  const [templateSavedToast, setTemplateSavedToast] = useState<boolean>(false);

  const [templatesAr, setTemplatesAr] = useState<TelegramLanguageTemplates>(() => ({
    ...DEFAULT_TELEGRAM_TEMPLATES_AR,
    ...(settings.templatesAr || {}),
    preClass: settings.telegramTemplatePreClass || DEFAULT_TELEGRAM_TEMPLATES_AR.preClass,
    login: settings.telegramTemplateLogin || DEFAULT_TELEGRAM_TEMPLATES_AR.login,
    complete: settings.telegramTemplateComplete || DEFAULT_TELEGRAM_TEMPLATES_AR.complete,
    absent: settings.telegramTemplateAbsent || DEFAULT_TELEGRAM_TEMPLATES_AR.absent,
  }));
  const [templatesEn, setTemplatesEn] = useState<TelegramLanguageTemplates>(() => ({
    ...DEFAULT_TELEGRAM_TEMPLATES_EN,
    ...(settings.templatesEn || {}),
  }));
  const [templatesTh, setTemplatesTh] = useState<TelegramLanguageTemplates>(() => ({
    ...DEFAULT_TELEGRAM_TEMPLATES_TH,
    ...(settings.templatesTh || {}),
  }));

  // Sync templates refs on render
  const templatesArRef = useRef(templatesAr);
  templatesArRef.current = templatesAr;
  const templatesEnRef = useRef(templatesEn);
  templatesEnRef.current = templatesEn;
  const templatesThRef = useRef(templatesTh);
  templatesThRef.current = templatesTh;

  // Helper to read initial or cached setting
  const getInitialTimingSetting = <T,>(key: keyof AttendanceSettings, fallback: T): T => {
    if (settings[key] !== undefined && settings[key] !== null) {
      return settings[key] as unknown as T;
    }
    try {
      const cached = localStorage.getItem('attendance_settings_cached');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed[key] !== undefined && parsed[key] !== null) {
          return parsed[key] as unknown as T;
        }
      }
    } catch (e) {}
    return fallback;
  };

  // Timing & Repetition Control State
  const [preClassMinutes, setPreClassMinutes] = useState<number>(() => getInitialTimingSetting('telegramPreClassReminderMinutes', 15));
  const [lateDelayMinutes, setLateDelayMinutes] = useState<number>(() => getInitialTimingSetting('telegramLateAlertDelayMinutes', 10));
  const [lateRepeatEnabled, setLateRepeatEnabled] = useState<boolean>(() => getInitialTimingSetting('telegramLateAlertRepeatEnabled', true));
  const [lateRepeatInterval, setLateRepeatInterval] = useState<number>(() => getInitialTimingSetting('telegramLateAlertRepeatIntervalMinutes', 15));
  const [lateMaxCount, setLateMaxCount] = useState<number>(() => getInitialTimingSetting('telegramLateAlertMaxCount', 2));
  const [finalAbsentTiming, setFinalAbsentTiming] = useState<'end_of_session' | 'end_of_day'>(() => getInitialTimingSetting('telegramFinalAbsentTiming', 'end_of_session'));
  const [notifyTeacherDirectly, setNotifyTeacherDirectly] = useState<boolean>(() => getInitialTimingSetting('telegramNotifyTeacherDirectly', true));
  const [teacherDigestEnabled, setTeacherDigestEnabled] = useState<boolean>(() => getInitialTimingSetting('telegramTeacherDigestEnabled', true));
  const [teacherPreClassDigest, setTeacherPreClassDigest] = useState<boolean>(() => getInitialTimingSetting('telegramTeacherPreClassDigest', true));
  const [teacherMidClassDigest, setTeacherMidClassDigest] = useState<boolean>(() => getInitialTimingSetting('telegramTeacherMidClassDigest', true));
  const [teacherPostSessionDigest, setTeacherPostSessionDigest] = useState<boolean>(() => getInitialTimingSetting('telegramTeacherPostSessionDigest', true));

  // Teacher Digest Testing Feedback State
  const [testingDigestType, setTestingDigestType] = useState<'preClass' | 'midClass' | 'postSession' | null>(null);
  const [digestTestFeedback, setDigestTestFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Synchronize timing states when settings prop updates
  useEffect(() => {
    if (settings.telegramPreClassReminderMinutes !== undefined && settings.telegramPreClassReminderMinutes !== null) {
      setPreClassMinutes(settings.telegramPreClassReminderMinutes);
    }
    if (settings.telegramLateAlertDelayMinutes !== undefined && settings.telegramLateAlertDelayMinutes !== null) {
      setLateDelayMinutes(settings.telegramLateAlertDelayMinutes);
    }
    if (settings.telegramLateAlertRepeatEnabled !== undefined && settings.telegramLateAlertRepeatEnabled !== null) {
      setLateRepeatEnabled(settings.telegramLateAlertRepeatEnabled !== false);
    }
    if (settings.telegramLateAlertRepeatIntervalMinutes !== undefined && settings.telegramLateAlertRepeatIntervalMinutes !== null) {
      setLateRepeatInterval(settings.telegramLateAlertRepeatIntervalMinutes);
    }
    if (settings.telegramLateAlertMaxCount !== undefined && settings.telegramLateAlertMaxCount !== null) {
      setLateMaxCount(settings.telegramLateAlertMaxCount);
    }
    if (settings.telegramFinalAbsentTiming !== undefined && settings.telegramFinalAbsentTiming !== null) {
      setFinalAbsentTiming(settings.telegramFinalAbsentTiming);
    }
    if (settings.telegramNotifyTeacherDirectly !== undefined && settings.telegramNotifyTeacherDirectly !== null) {
      setNotifyTeacherDirectly(settings.telegramNotifyTeacherDirectly !== false);
    }
    if (settings.telegramTeacherDigestEnabled !== undefined && settings.telegramTeacherDigestEnabled !== null) {
      setTeacherDigestEnabled(settings.telegramTeacherDigestEnabled !== false);
    }
    if (settings.telegramTeacherPreClassDigest !== undefined && settings.telegramTeacherPreClassDigest !== null) {
      setTeacherPreClassDigest(settings.telegramTeacherPreClassDigest !== false);
    }
    if (settings.telegramTeacherMidClassDigest !== undefined && settings.telegramTeacherMidClassDigest !== null) {
      setTeacherMidClassDigest(settings.telegramTeacherMidClassDigest !== false);
    }
    if (settings.telegramTeacherPostSessionDigest !== undefined && settings.telegramTeacherPostSessionDigest !== null) {
      setTeacherPostSessionDigest(settings.telegramTeacherPostSessionDigest !== false);
    }
  }, [
    settings.telegramPreClassReminderMinutes,
    settings.telegramLateAlertDelayMinutes,
    settings.telegramLateAlertRepeatEnabled,
    settings.telegramLateAlertRepeatIntervalMinutes,
    settings.telegramLateAlertMaxCount,
    settings.telegramFinalAbsentTiming,
    settings.telegramNotifyTeacherDirectly,
    settings.telegramTeacherDigestEnabled,
    settings.telegramTeacherPreClassDigest,
    settings.telegramTeacherMidClassDigest,
    settings.telegramTeacherPostSessionDigest,
  ]);

  // Simulator / Test Trigger State
  const [simulatedClassTime, setSimulatedClassTime] = useState<string>('19:00');
  const [simulatedDuration, setSimulatedDuration] = useState<number>(120);
  const [testStudentId, setTestStudentId] = useState<string>('');
  const [testEventType, setTestEventType] = useState<keyof TelegramLanguageTemplates>('preClass');
  const [testSending, setTestSending] = useState<boolean>(false);
  const [testFeedback, setTestFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [timingSavedToast, setTimingSavedToast] = useState<boolean>(false);
  const [botCommandsSavedToast, setBotCommandsSavedToast] = useState<boolean>(false);

  // Bot Commands State
  const [botCommands, setBotCommands] = useState<TelegramBotCommandConfig[]>(() => {
    try {
      const customList = Array.isArray(settings.botCommands) ? settings.botCommands : [];
      const existingMap = new Map<string, TelegramBotCommandConfig>();
      customList.forEach((c) => {
        if (c && typeof c === 'object') {
          if (c.id) existingMap.set(c.id, c);
          if (c.command) existingMap.set(c.command, c);
        }
      });
      return DEFAULT_TELEGRAM_BOT_COMMANDS.map((def) => {
        const found = (def.id && existingMap.get(def.id)) || (def.command && existingMap.get(def.command));
        if (found) {
          let responseAr = found.responseAr;
          // Auto-migrate cmd_schedule to the updated rich format if it has legacy placeholders
          if (def.id === 'cmd_schedule' && responseAr) {
            if (
              responseAr.includes('{{الايام}}') ||
              responseAr.includes('{{الوقت}}') ||
              responseAr.includes('{{المدة}}') ||
              responseAr.includes('{{نوع_المدة}}') ||
              responseAr.includes('{{معدل_الدروس}}') ||
              !responseAr.includes('{{أيام_الحضور}}') ||
              !responseAr.includes('{{وقت_البدء}}') ||
              !responseAr.includes('{{مدة_الجلسة}}')
            ) {
              responseAr = def.responseAr;
            }
          }
          return {
            ...def,
            ...found,
            responseAr: responseAr || def.responseAr,
            supportedVars: def.supportedVars, // Always provide complete dynamic variable tags
          };
        }
        return { ...def };
      });
    } catch (e) {
      return DEFAULT_TELEGRAM_BOT_COMMANDS;
    }
  });

  useEffect(() => {
    if (settings.botCommands && Array.isArray(settings.botCommands) && settings.botCommands.length > 0) {
      try {
        const existingMap = new Map<string, TelegramBotCommandConfig>();
        settings.botCommands.forEach((c) => {
          if (c && typeof c === 'object') {
            if (c.id) existingMap.set(c.id, c);
            if (c.command) existingMap.set(c.command, c);
          }
        });
        setBotCommands(
          DEFAULT_TELEGRAM_BOT_COMMANDS.map((def) => {
            const found = (def.id && existingMap.get(def.id)) || (def.command && existingMap.get(def.command));
            if (found) {
              let responseAr = found.responseAr;
              if (def.id === 'cmd_schedule' && responseAr) {
                if (
                  responseAr.includes('{{الايام}}') ||
                  responseAr.includes('{{الوقت}}') ||
                  responseAr.includes('{{المدة}}') ||
                  responseAr.includes('{{نوع_المدة}}') ||
                  responseAr.includes('{{معدل_الدروس}}') ||
                  !responseAr.includes('{{أيام_الحضور}}') ||
                  !responseAr.includes('{{وقت_البدء}}') ||
                  !responseAr.includes('{{مدة_الجلسة}}')
                ) {
                  responseAr = def.responseAr;
                }
              }
              return {
                ...def,
                ...found,
                responseAr: responseAr || def.responseAr,
                supportedVars: def.supportedVars,
              };
            }
            return { ...def };
          })
        );
      } catch (e) {}
    }
  }, [settings.botCommands]);

  // Test Bot Connection
  const handleTestBot = async () => {
    setTestingBot(true);
    setBotTestResult(null);
    try {
      const res = await testTelegramBotToken(settings.telegramToken);
      if (res.ok) {
        if (res.username) {
          onUpdateSettings({
            ...settings,
            telegramBotUsername: res.username,
          });
        }
        setBotTestResult({
          ok: true,
          message: `✅ تم التحقق والاتصال بالبوت بنجاح: ${res.botName} (@${res.username})`,
          username: res.username,
        });
      } else {
        setBotTestResult({
          ok: false,
          message: `❌ ${res.error || 'فشل الاتصال بالبوت'}`,
        });
      }
    } catch (err: any) {
      setBotTestResult({
        ok: false,
        message: `❌ خطأ في الاتصال: ${err.message}`,
      });
    } finally {
      setTestingBot(false);
    }
  };

  // Sync / Auto-discover new Telegram users who clicked Start
  const handleSyncSignups = async () => {
    if (!settings.telegramToken) {
      setSyncFeedback('⚠️ يرجى إدخال وفحص رمز البوت أولاً.');
      return;
    }
    setSyncingSignups(true);
    setSyncFeedback(null);
    try {
      const res = await syncTelegramSignups(settings.telegramToken);
      if (!res.ok) {
        setSyncFeedback(`❌ فشل الفحص: ${res.error}`);
        return;
      }
      if (!res.signups || res.signups.length === 0) {
        setSyncFeedback('ℹ️ لم يتم العثور على تسجيلات جديدة حتى الآن. تأكد من قيام الطالب أو المعلم بالضغط على رابط البوت والنقر على زر "Start / ابدأ" في تيليجرام.');
        return;
      }

      let linkedStudents = 0;
      let linkedTeachers = 0;

      const getWelcomeSuccessText = (studentName: string, lang: 'ar' | 'en' | 'th', studentId: string) => {
        if (lang === 'en') {
          return `🎉 Welcome, ${studentName}!\nYour account (#${studentId}) has been successfully linked ✅\nYou will now receive all attendance alerts, class schedules, and reports in English here. 📚`;
        } else if (lang === 'th') {
          return `🎉 ยินดีต้อนรับ ${studentName}!\nบัญชีของคุณ (รหัสนักเรียน #${studentId}) ได้รับการเชื่อมต่อเรียบร้อยแล้ว ✅\nคุณจะได้รับการแจ้งเตือนการเข้าเรียนและตารางเรียนเป็นภาษาไทยที่นี่ 📚`;
        } else {
          return `🎉 مرحباً بك يا ${studentName}!\nتم ربط حسابك (#${studentId}) في المنظومة التعليمية بنجاح ✅\nستصلك إشعارات الحضور ومواعيد الحصص والتقارير باللغة العربية هنا تلقائياً. 📚`;
        }
      };

      const buildLangKeyboard = (targetStudentId?: string) => ({
        inline_keyboard: [
          [
            { text: '🇸🇦 العربية', callback_data: targetStudentId ? `lang_ar_${targetStudentId}` : 'lang_ar' },
            { text: '🇬🇧 English', callback_data: targetStudentId ? `lang_en_${targetStudentId}` : 'lang_en' },
            { text: '🇹🇭 ภาษาไทย', callback_data: targetStudentId ? `lang_th_${targetStudentId}` : 'lang_th' },
          ],
        ],
      });

      // 0. Callback Queries (Language button clicks)
      if (res.callbackQueries && res.callbackQueries.length > 0) {
        for (const cq of res.callbackQueries) {
          const match = cq.data.match(/^lang_(ar|en|th)(?:_(.+))?$/i);
          if (match) {
            const selectedLang = match[1].toLowerCase() as 'ar' | 'en' | 'th';
            const targetId = match[2]?.trim();

            chatLanguagePrefRef.current.set(cq.chatId, selectedLang);
            try {
              localStorage.setItem(`tg_chat_lang_${cq.chatId}`, selectedLang);
            } catch (e) {}

            const student = targetId
              ? allSchedules.find((s) => String(s.studentId).trim() === targetId || s.studentName.trim() === targetId)
              : allSchedules.find((s) => s.telegramChatId === cq.chatId);

            if (student) {
              onUpdateScheduleStudentTelegram(
                student.studentId,
                cq.chatId,
                selectedLang,
                student.guardianPhone
              );
              linkedStudents++;
              answerTelegramCallbackQuery(settings.telegramToken, cq.callbackQueryId, `Language updated: ${selectedLang.toUpperCase()}`).catch(() => {});
              sendTelegramMessage({
                token: settings.telegramToken,
                chatId: cq.chatId,
                text: getWelcomeSuccessText(student.studentName, selectedLang, student.studentId),
              }).catch(() => {});
            } else {
              answerTelegramCallbackQuery(settings.telegramToken, cq.callbackQueryId, `Language set: ${selectedLang.toUpperCase()}`).catch(() => {});
              let promptMsg = '';
              if (selectedLang === 'en') {
                promptMsg = `🌐 **English language selected 🇬🇧**\n\n📌 To complete linking your account, please send your **Student ID** now in a message here (e.g. \`101\`).`;
              } else if (selectedLang === 'th') {
                promptMsg = `🌐 **เลือกภาษาไทยเรียบร้อยแล้ว 🇹🇭**\n\n📌 เพื่อเสร็จสิ้นการเชื่อมต่อบัญชี กรุณาส่ง **รหัสนักเรียน** ของคุณในแชทนี้ (เช่น \`101\`)`;
              } else {
                promptMsg = `🌐 **تم اختيار اللغة العربية 🇸🇦**\n\n📌 لتسجيل وربط حسابك، يرجى إرسال **رقمك الدراسي** الآن في رسالة هنا (مثال: \`101\`).`;
              }
              sendTelegramMessage({
                token: settings.telegramToken,
                chatId: cq.chatId,
                text: promptMsg,
              }).catch(() => {});
            }
          }
        }
      }

      // 1. One-click deep link signups
      if (res.signups && res.signups.length > 0) {
        for (const item of res.signups) {
          if (item.type === 'student') {
            const student = allSchedules.find(
              (s) => String(s.studentId).trim() === String(item.id).trim() || s.studentName.trim() === item.id.trim()
            );
            if (student) {
              // Security Check 1: Is this Telegram chat already linked to ANOTHER student?
              const linkedExisting = allSchedules.find((s) => s.telegramChatId === item.chatId);
              if (linkedExisting && String(linkedExisting.studentId).trim() !== String(student.studentId).trim()) {
                sendTelegramMessage({
                  token: settings.telegramToken,
                  chatId: item.chatId,
                  text: `⚠️ **تنبيه أمني:**\nهذا الحساب في تيليجرام مربوط بالفعل مع الطالب:\n👤 **${linkedExisting.studentName}** (الرقم: #${linkedExisting.studentId})\n\n⛔ لا يمكن ربط طالب آخر من نفس الحساب. إذا كنت بحاجة لنقل الحساب أو إعادة التعيين، يرجى التواصل مع إدارة المدرسة.\n\n⚠️ **Security Alert:**\nThis Telegram account is already linked to (${linkedExisting.studentName} - #${linkedExisting.studentId}). Cannot link another student. Please contact school administration.`,
                }).catch(() => {});
                continue;
              }

              // Security Check 2: Is the target student already linked to a DIFFERENT Telegram chat?
              if (student.telegramChatId && student.telegramChatId !== item.chatId) {
                sendTelegramMessage({
                  token: settings.telegramToken,
                  chatId: item.chatId,
                  text: `⚠️ **تنبيه:**\nالرقم الدراسي (**#${student.studentId}** - ${student.studentName}) مربوط مسبقاً بجهاز/حساب تيليجرام آخر.\n\n🔒 لحماية خصوصية بيانات الطالب، لا يمكن ربطه تلقائياً بجهاز جديد.\n📞 إذا كنت ولي الأمر أو الطالب وترغب بنقل الحساب لهذا الجهاز، يرجى التواصل مع إدارة المدرسة لإعادة تعيين الربط.\n\n⚠️ **Notice:**\nStudent ID (#${student.studentId}) is already linked to another device. Please contact school administration to reset.`,
                }).catch(() => {});
                continue;
              }

              const finalLang: 'ar' | 'en' | 'th' = item.lang || (student.preferredLanguage as any) || 'ar';
              if (student.telegramChatId !== item.chatId || (item.lang && student.preferredLanguage !== item.lang)) {
                onUpdateScheduleStudentTelegram(
                  student.studentId,
                  item.chatId,
                  finalLang,
                  student.guardianPhone
                );
                linkedStudents++;
              }

              if (item.lang) {
                sendTelegramMessage({
                  token: settings.telegramToken,
                  chatId: item.chatId,
                  text: getWelcomeSuccessText(student.studentName, finalLang, student.studentId),
                }).catch(() => {});
              } else {
                sendTelegramMessage({
                  token: settings.telegramToken,
                  chatId: item.chatId,
                  text: `✅ تم التحقق من الحساب بنجاح! / Verified Successfully! / ตรวจสอบบัญชีเรียบร้อยแล้ว\n👤 الطالب / Student: ${student.studentName} (#${student.studentId})\n\n🌐 **يرجى اختيار لغة الإشعارات المفضلة لتلقي جميع الرسائل بها:**\n🌐 **Please select your preferred language for all future notifications:**\n🌐 **กรุณาเลือกภาษาสำหรับการแจ้งเตือนทั้งหมด:**`,
                  replyMarkup: buildLangKeyboard(student.studentId),
                }).catch(() => {});
              }
            }
          } else if (item.type === 'teacher') {
            const teacherIndex = teachers.findIndex((t) => String(t.id).trim() === String(item.id).trim());
            if (teacherIndex >= 0 && teachers[teacherIndex].telegramChatId !== item.chatId) {
              const updated = [...teachers];
              updated[teacherIndex].telegramChatId = item.chatId;
              setTeachers(updated);
              onUpdateSettings({ ...settings, teachers: updated });
              linkedTeachers++;
              sendTelegramMessage({
                token: settings.telegramToken,
                chatId: item.chatId,
                text: `👨‍🏫 مرحباً بك يا أستاذ ${updated[teacherIndex].name}!\nتم ربط حسابك في المنظومة التعليمية بنجاح بنقرة واحدة ✅`,
              }).catch(() => {});
            }
          }
        }
      }

      // 2. ID Submissions
      if (res.idSubmissions && res.idSubmissions.length > 0) {
        for (const sub of res.idSubmissions) {
          const rawId = String(sub.text).trim();
          const normalizedTarget = rawId.toLowerCase();
          const cleanNumericTarget = rawId.replace(/\D/g, '');

          const student = allSchedules.find((s) => {
            const sId = String(s.studentId || '').trim().toLowerCase();
            const sName = String(s.studentName || '').trim().toLowerCase();
            if (sId === normalizedTarget || sName === normalizedTarget) return true;
            if (cleanNumericTarget && sId.replace(/\D/g, '') === cleanNumericTarget) return true;
            if (cleanNumericTarget && sId.replace(/^0+/, '') === cleanNumericTarget.replace(/^0+/, '')) return true;
            if (normalizedTarget.length >= 3 && (sName.includes(normalizedTarget) || normalizedTarget.includes(sName))) return true;
            return false;
          });

          // Security Check 1: Is this Telegram chat already linked to a student?
          const linkedExisting = allSchedules.find((s) => s.telegramChatId === sub.chatId);
          if (linkedExisting) {
            if (student && String(linkedExisting.studentId).trim() === String(student.studentId).trim()) {
              sendTelegramMessage({
                token: settings.telegramToken,
                chatId: sub.chatId,
                text: `✅ مرحباً ${linkedExisting.studentName}!\nحسابك مربوط بالفعل بالرقم (#${linkedExisting.studentId}) ✅\n\n🌐 لتغيير لغة الإشعارات المفضلة، يمكنك الاختيار أدناه:\n🌐 To change preferred notification language, select below:\n🌐 กรุณาเลือกภาษาสำหรับการแจ้งเตือน:`,
                replyMarkup: buildLangKeyboard(linkedExisting.studentId),
              }).catch(() => {});
            } else {
              sendTelegramMessage({
                token: settings.telegramToken,
                chatId: sub.chatId,
                text: `⚠️ **تنبيه أمني:**\nهذا الحساب في تيليجرام مربوط بالفعل مع الطالب:\n👤 **${linkedExisting.studentName}** (الرقم: #${linkedExisting.studentId})\n\n⛔ لا يمكن تسجيل أو ربط طالب آخر من نفس هذه المحادثة.\n📞 إذا كنت ترغب في نقل الحساب أو فك الربط، يرجى التواصل مع إدارة المدرسة مباشرة.\n\n⚠️ **Security Alert:**\nThis Telegram account is already linked to (${linkedExisting.studentName} - #${linkedExisting.studentId}). Cannot link another student. Please contact school administration to reset.`,
              }).catch(() => {});
            }
            continue;
          }

          if (!student) {
            sendTelegramMessage({
              token: settings.telegramToken,
              chatId: sub.chatId,
              text: `⚠️ لم يتم العثور على طالب بالرقم أو الاسم: (${rawId}).\nيرجى التأكد من كتابة الرقم الدراسي المسجل في كشف المدرسة بشكل صحيح (مثال: 101).\n\n⚠️ Student (${rawId}) not found. Please verify your school ID number (e.g. 101).`,
            }).catch(() => {});
            continue;
          }

          // Security Check 2: Is the target student already linked to a DIFFERENT Telegram chat?
          if (student.telegramChatId && student.telegramChatId !== sub.chatId) {
            sendTelegramMessage({
              token: settings.telegramToken,
              chatId: sub.chatId,
              text: `⚠️ **تنبيه:**\nالرقم الدراسي (**#${student.studentId}** - ${student.studentName}) مربوط مسبقاً بجهاز/حساب تيليجرام آخر.\n\n🔒 لحماية خصوصية بيانات الطالب، لا يمكن ربطه تلقائياً بجهاز جديد.\n📞 إذا كنت ولي الأمر أو الطالب وترغب في نقل الإشعارات لهذا الجهاز، يرجى التواصل مع إدارة المدرسة لإعادة تعيين الربط.\n\n⚠️ **Notice:**\nStudent ID (#${student.studentId}) is already linked to another Telegram account. Please contact school administration to reset.`,
            }).catch(() => {});
            continue;
          }

          const currentLang: 'ar' | 'en' | 'th' = (student.preferredLanguage as any) || 'ar';
          onUpdateScheduleStudentTelegram(
            student.studentId,
            sub.chatId,
            currentLang,
            student.guardianPhone
          );
          linkedStudents++;

          // Send 3-language confirmation with interactive Language Selection buttons
          sendTelegramMessage({
            token: settings.telegramToken,
            chatId: sub.chatId,
            text: `✅ تم التحقق من الحساب بنجاح! / Verified Successfully! / ตรวจสอบบัญชีเรียบร้อยแล้ว\n👤 الطالب / Student: ${student.studentName} (#${student.studentId})\n\n🌐 **يرجى اختيار لغة الإشعارات المفضلة لتلقي جميع الرسائل بها:**\n🌐 **Please select your preferred language for all future notifications:**\n🌐 **กรุณาเลือกภาษาสำหรับการแจ้งเตือนทั้งหมด:**`,
            replyMarkup: buildLangKeyboard(student.studentId),
          }).catch(() => {});
        }
      }

      // 3. Plain Start Replies
      if (res.plainStarts && res.plainStarts.length > 0) {
        for (const p of res.plainStarts) {
          const linkedStudent = allSchedules.find((s) => s.telegramChatId === p.chatId);
          if (linkedStudent) {
            sendTelegramMessage({
              token: settings.telegramToken,
              chatId: p.chatId,
              text: `👋 مرحباً ${linkedStudent.studentName}!\nحسابك مربوط بالرقم (#${linkedStudent.studentId}) ✅\n\n🌐 لتغيير لغة الإشعارات المفضلة، يمكنك الاختيار أدناه:\n🌐 To change preferred notification language, select below:\n🌐 กรุณาเลือกภาษาสำหรับการแจ้งเตือน:`,
              replyMarkup: buildLangKeyboard(linkedStudent.studentId),
            }).catch(() => {});
          } else {
            sendTelegramMessage({
              token: settings.telegramToken,
              chatId: p.chatId,
              text: `👋 مرحباً بك في بوت الإشعارات المدرسية!\nWelcome to the School Notification Bot!\nยินดีต้อนรับสู่ระบบแจ้งเตือนของโรงเรียน!\n\n📌 **لتسجيل وربط حسابك:** أرسل **رقمك الدراسي** الآن في رسالة هنا (مثال: \`101\`).\n📌 **To link your account:** Please send your **Student ID** now in a message here (e.g. \`101\`).\n📌 **เพื่อเชื่อมต่อบัญชี:** กรุณาส่ง **รหัสนักเรียน** ของคุณในแชทนี้ (เช่น \`101\`).`,
            }).catch(() => {});
          }
        }
      }

      const totalLinked = linkedStudents + linkedTeachers;
      if (totalLinked > 0) {
        setSyncFeedback(`🎉 تم ربط وتحديث (${totalLinked}) حسابات بنجاح (${linkedStudents} طلاب + ${linkedTeachers} معلمين)!`);
      } else {
        setSyncFeedback(`ℹ️ تم فحص تحديثات البوت بنجاح. جميع الحسابات المكتشفة مسجلة مسبقاً أو لم ترسل رقماً بعد.`);
      }
    } catch (err: any) {
      setSyncFeedback(`❌ خطأ أثناء المزامنة: ${err.message}`);
    } finally {
      setSyncingSignups(false);
    }
  };

  // Send Test to Admin Channel
  const handleSendAdminTest = async () => {
    if (!settings.telegramToken || !settings.telegramChatId) {
      setAdminTestResult('⚠️ يرجى إدخال رمز البوت ومعرّف القناة أولاً.');
      return;
    }
    setSendingAdminTest(true);
    setAdminTestResult('');
    try {
      const res = await sendTelegramMessage({
        token: settings.telegramToken,
        chatId: settings.telegramChatId,
        text: `🏛️ تجربة إرسال ناجحة من المنصة التعليمية الذكية.\nالتوقيت: ${new Date().toLocaleTimeString('ar-SA')}\nالنظام متصل وجاهز لإرسال الإشعارات والتقارير! ✨`,
      });
      if (res.ok) {
        setAdminTestResult('✅ تم إرسال الرسالة التجريبية إلى القناة الإدارية بنجاح!');
      } else {
        setAdminTestResult(`❌ فشل الإرسال: ${res.error}`);
      }
    } catch (err: any) {
      setAdminTestResult(`❌ خطأ: ${err.message}`);
    } finally {
      setSendingAdminTest(false);
    }
  };

  // Send Test to Private Admin User ID
  const handleSendPrivateAdminTest = async () => {
    if (!settings.telegramToken || !settings.telegramAdminUserId) {
      setPrivateAdminTestResult('⚠️ يرجى إدخال رمز البوت ومعرّف الإداري الشخصي أولاً.');
      return;
    }
    setSendingPrivateAdminTest(true);
    setPrivateAdminTestResult('');
    try {
      const res = await sendTelegramMessage({
        token: settings.telegramToken,
        chatId: settings.telegramAdminUserId,
        text: `👑 مرحباً بك أيها المشرف الإداري،\nتم اختبار اتصال حسابك الشخصي المباشر بنجاح! ستصلك التقارير الحساسة والإشعارات الإدارية الخاصة هنا. 🔒`,
      });
      if (res.ok) {
        setPrivateAdminTestResult('✅ تم إرسال الرسالة بنجاح إلى حسابك الشخصي كإداري!');
      } else {
        setPrivateAdminTestResult(`❌ فشل الإرسال للخاص: ${res.error}`);
      }
    } catch (err: any) {
      setPrivateAdminTestResult(`❌ خطأ: ${err.message}`);
    } finally {
      setSendingPrivateAdminTest(false);
    }
  };

  // Add Group Handler
  const handleAddGroup = () => {
    if (!newGroupName.trim() || !newGroupChatId.trim()) {
      alert('يرجى كتابة اسم المجموعة ومعرف الشات الخاص بها');
      return;
    }
    const updated = [
      ...groups,
      {
        id: `grp_${Date.now()}`,
        name: newGroupName.trim(),
        chatId: newGroupChatId.trim(),
        type: newGroupType,
      },
    ];
    setGroups(updated);
    setNewGroupName('');
    setNewGroupChatId('');
    setNewGroupType('general');
    setShowAddGroupModal(false);
    onUpdateSettings({ ...settings, telegramGroups: updated });
  };

  // Delete Group Handler
  const handleDeleteGroup = (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مجموعة (${name})؟`)) return;
    const updated = groups.filter((g) => g.id !== id);
    setGroups(updated);
    onUpdateSettings({ ...settings, telegramGroups: updated });
  };

  // Add Channel Handler
  const handleAddChannel = () => {
    if (!newChannelName.trim() || !newChannelChatId.trim()) {
      alert('يرجى كتابة اسم القناة ومعرف الشات الخاص بها');
      return;
    }
    const updated = [
      ...channels,
      {
        id: `chn_${Date.now()}`,
        name: newChannelName.trim(),
        chatId: newChannelChatId.trim(),
        accessType: newChannelAccessType,
      },
    ];
    setChannels(updated);
    setNewChannelName('');
    setNewChannelChatId('');
    setNewChannelAccessType('public');
    setShowAddChannelModal(false);
    onUpdateSettings({ ...settings, telegramChannels: updated });
  };

  // Delete Channel Handler
  const handleDeleteChannel = (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف قناة (${name})؟`)) return;
    const updated = channels.filter((c) => c.id !== id);
    setChannels(updated);
    onUpdateSettings({ ...settings, telegramChannels: updated });
  };

  // Add / Edit Teacher
  const handleSaveTeacher = () => {
    if (!newTeacherName.trim() || !newTeacherChatId.trim()) {
      alert('يرجى إدخال اسم المعلم ومعرّف تيليجرام');
      return;
    }

    let updated: TeacherContact[];
    if (editingTeacherId) {
      updated = teachers.map((t) =>
        t.id === editingTeacherId
          ? {
              ...t,
              name: newTeacherName.trim(),
              role: newTeacherRole.trim() || 'معلم المادة',
              telegramChatId: newTeacherChatId.trim(),
              phone: newTeacherPhone.trim(),
            }
          : t
      );
      setEditingTeacherId(null);
    } else {
      const newT: TeacherContact = {
        id: `teacher_${Date.now()}`,
        name: newTeacherName.trim(),
        role: newTeacherRole.trim() || 'معلم المادة',
        telegramChatId: newTeacherChatId.trim(),
        phone: newTeacherPhone.trim(),
        enabled: true,
      };
      updated = [...teachers, newT];
    }

    setTeachers(updated);
    setNewTeacherName('');
    setNewTeacherRole('معلم المادة');
    setNewTeacherChatId('');
    setNewTeacherPhone('');

    onUpdateSettings({
      ...settings,
      teachers: updated,
    });
  };

  // Delete Teacher
  const handleDeleteTeacher = (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المعلم (${name}) من دليل التيليجرام؟`)) return;
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    onUpdateSettings({
      ...settings,
      teachers: updated,
    });
  };

  // Send Test to a Single Teacher
  const handleSendTestToTeacher = async (teacher: TeacherContact) => {
    if (!settings.telegramToken) {
      alert('يرجى حفظ رمز البوت (Bot Token) أولاً');
      return;
    }
    const res = await sendTelegramMessage({
      token: settings.telegramToken,
      chatId: teacher.telegramChatId,
      text: `👨‍🏫 مرحباً أستاذ ${teacher.name}،\nتم فحص اتصال حسابك بالمنصة التعليمية بنجاح! ستصلك إشعارات وتنبيهات حضور طلابك هنا. 🌟`,
    });
    if (res.ok) {
      alert(`✅ تم إرسال رسالة تجريبية بنجاح إلى المعلم (${teacher.name})`);
    } else {
      alert(`❌ فشل الإرسال: ${res.error}`);
    }
  };

  // Send Test to a Single Student
  const handleSendTestToStudent = async (student: StudentSchedule) => {
    if (!settings.telegramToken) {
      alert('يرجى إدخال وحفظ رمز البوت أولاً');
      return;
    }
    if (!student.telegramChatId) {
      alert('لم يتم تعيين Telegram Chat ID لهذا الطالب');
      return;
    }
    const res = await sendTelegramMessage({
      token: settings.telegramToken,
      chatId: student.telegramChatId,
      text: `🎓 مرحباً بك يا ${student.studentName}،\nتم ربط حسابك في تيليجرام بالمنصة التعليمية بنجاح! ستصلك هنا مواعيد حصصك ودرجاتك وشهاداتك. 🌟`,
    });
    if (res.ok) {
      alert(`✅ تم إرسال رسالة تجريبية بنجاح للطالب (${student.studentName})`);
    } else {
      alert(`❌ فشل الإرسال: ${res.error}`);
    }
  };

  // Manual Sync to Telegram_Users Google Sheet
  const handleSyncUsersSheet = async () => {
    setSyncingUsersSheet(true);
    setUsersSheetSyncFeedback(null);
    try {
      const res = await syncAllTelegramUsersToSheet(allSchedules);
      if (res.success) {
        setUsersSheetSyncFeedback({
          ok: true,
          message: res.message || `✅ تمت مزامنة (${res.total || 0}) من حسابات الطلاب إلى ورقة Telegram_Users بنجاح!`,
        });
      } else {
        setUsersSheetSyncFeedback({
          ok: false,
          message: res.message || '⚠️ تعذرت المزامنة مع ورقة Google Sheets.',
        });
      }
    } catch (err: any) {
      setUsersSheetSyncFeedback({
        ok: false,
        message: '❌ خطأ في الاتصال: ' + (err.message || 'تعذر الإرسال'),
      });
    } finally {
      setSyncingUsersSheet(false);
    }
  };

  // Direct Messaging Dispatcher
  const handleSendDirectMessage = async () => {
    if (!settings.telegramToken) {
      setDirectSendLog({ type: 'error', text: 'رمز البوت غير متوفر، يرجى ضبطه في تبويب إعدادات البوت.' });
      return;
    }
    if (!directMessageText.trim()) {
      setDirectSendLog({ type: 'error', text: 'يرجى كتابة نص الرسالة أولاً.' });
      return;
    }

    setSendingDirect(true);
    setDirectSendLog({ type: 'info', text: 'جاري تجهيز وإرسال الرسائل...' });

    try {
      const targets: { chatId: string; name: string }[] = [];

      if (targetType === 'admin_channel') {
        if (!settings.telegramChatId) {
          throw new Error('معرّف القناة الإدارية غير محدد.');
        }
        targets.push({ chatId: settings.telegramChatId, name: 'القناة الإدارية' });
      } else if (targetType === 'all_students') {
        allSchedules.forEach((st) => {
          if (st.telegramChatId && st.telegramChatId.trim()) {
            targets.push({ chatId: st.telegramChatId.trim(), name: st.studentName || st.studentId });
          }
        });
        if (targets.length === 0) {
          throw new Error('لا يوجد طلاب مسجل لديهم Telegram Chat ID في الدليل.');
        }
      } else if (targetType === 'all_teachers') {
        teachers.forEach((t) => {
          if (t.enabled && t.telegramChatId && t.telegramChatId.trim()) {
            targets.push({ chatId: t.telegramChatId.trim(), name: t.name });
          }
        });
        if (targets.length === 0) {
          throw new Error('لا يوجد معلمون مسجلون بمعرفات تيليجرام نشطة.');
        }
      } else if (targetType === 'specific_student') {
        const found = allSchedules.find((s) => s.studentId === selectedTargetStudentId);
        if (!found || !found.telegramChatId) {
          throw new Error('يرجى اختيار طالب لديه Telegram Chat ID صالح.');
        }
        targets.push({ chatId: found.telegramChatId.trim(), name: found.studentName || found.studentId });
      } else if (targetType === 'specific_teacher') {
        const found = teachers.find((t) => t.id === selectedTargetTeacherId);
        if (!found || !found.telegramChatId) {
          throw new Error('يرجى اختيار معلم لديه Telegram Chat ID صالح.');
        }
        targets.push({ chatId: found.telegramChatId.trim(), name: found.name });
      }

      let successCount = 0;
      let failCount = 0;

      for (const target of targets) {
        const customizedText = interpolateTelegramTemplate(directMessageText, {
          studentName: target.name,
          date: new Date().toLocaleDateString('ar-SA'),
          time: new Date().toLocaleTimeString('ar-SA'),
        });

        const res = await sendTelegramMessage({
          token: settings.telegramToken,
          chatId: target.chatId,
          text: customizedText,
          mediaUrl: mediaType !== 'none' ? mediaUrl : undefined,
          mediaType: mediaType !== 'none' ? mediaType : undefined,
        });

        if (res.ok) successCount++;
        else failCount++;
      }

      if (successCount > 0 && failCount === 0) {
        setDirectSendLog({
          type: 'success',
          text: `🎉 تم إرسال الرسالة بنجاح إلى جميع المستهدفين (${successCount} مستلم)!`,
        });
        setDirectMessageText('');
        setMediaUrl('');
      } else if (successCount > 0 && failCount > 0) {
        setDirectSendLog({
          type: 'info',
          text: `تم الإرسال لـ ${successCount} مستلم، وتعذر الإرسال لـ ${failCount} مستلم.`,
        });
      } else {
        setDirectSendLog({
          type: 'error',
          text: `❌ فشل إرسال الرسائل لجميع المستلمين. تأكد من صحة معرفات المحادثات (Chat IDs).`,
        });
      }
    } catch (err: any) {
      setDirectSendLog({
        type: 'error',
        text: `❌ خطأ: ${err.message}`,
      });
    } finally {
      setSendingDirect(false);
    }
  };

  // Save Timing Settings handler
  const handleSaveTimingSettings = async () => {
    const updated: AttendanceSettings = {
      ...settings,
      telegramEnabled: Boolean(settings.telegramToken && settings.telegramEnabled !== false),
      telegramPreClassReminderMinutes: Number(preClassMinutes) || 15,
      telegramLateAlertDelayMinutes: Number(lateDelayMinutes) || 10,
      telegramLateAlertRepeatEnabled: lateRepeatEnabled !== false,
      telegramLateAlertRepeatIntervalMinutes: Number(lateRepeatInterval) || 15,
      telegramLateAlertMaxCount: Number(lateMaxCount) || 2,
      telegramFinalAbsentTiming: finalAbsentTiming || 'end_of_session',
      telegramNotifyTeacherDirectly: notifyTeacherDirectly !== false,
      telegramTeacherDigestEnabled: teacherDigestEnabled !== false,
      telegramTeacherPreClassDigest: teacherPreClassDigest !== false,
      telegramTeacherMidClassDigest: teacherMidClassDigest !== false,
      telegramTeacherPostSessionDigest: teacherPostSessionDigest !== false,
    };
    onUpdateSettings(updated);
    try {
      localStorage.setItem('attendance_settings_cached', JSON.stringify(updated));
    } catch (e) {}
    setTimingSavedToast(true);
    setTimeout(() => setTimingSavedToast(false), 3500);
    if (onSaveAll) {
      await onSaveAll(updated);
    }
  };

  // Test Pre-Class Teacher Briefing Digest
  const handleTestTeacherBriefing = async () => {
    if (!settings.telegramToken) {
      setDigestTestFeedback({ ok: false, message: '⚠️ يرجى ضبط وتفعيل توكن البوت أولاً.' });
      return;
    }
    clearTelegramDispatchCache();
    setTestingDigestType('preClass');
    setDigestTestFeedback(null);
    try {
      const res = await dispatchTeacherPreClassBriefing({
        settings: { ...settings, teachers },
        schedules: localSchedules,
        classTime: simulatedClassTime || settings.startTime || '19:00',
        reminderMinutes: preClassMinutes,
      });
      if (res.ok) {
        setDigestTestFeedback({ ok: true, message: '✅ تم إرسال تقرير ما قبل الحصة المجمّع بنجاح إلى حساب المعلم والإدارة!' });
      } else {
        setDigestTestFeedback({ ok: false, message: `❌ ${res.error || 'تعذر إرسال التقرير'}` });
      }
    } catch (e: any) {
      setDigestTestFeedback({ ok: false, message: `❌ خطأ: ${e.message}` });
    } finally {
      setTestingDigestType(null);
    }
  };

  // Test Mid-Class Teacher Snapshot Digest
  const handleTestTeacherSnapshot = async () => {
    if (!settings.telegramToken) {
      setDigestTestFeedback({ ok: false, message: '⚠️ يرجى ضبط وتفعيل توكن البوت أولاً.' });
      return;
    }
    clearTelegramDispatchCache();
    setTestingDigestType('midClass');
    setDigestTestFeedback(null);
    try {
      const res = await dispatchTeacherMidClassSnapshot({
        settings: { ...settings, teachers },
        schedules: localSchedules,
        classTime: simulatedClassTime || settings.startTime || '19:00',
      });
      if (res.ok) {
        setDigestTestFeedback({ ok: true, message: '✅ تم إرسال تقرير الحضور والغياب اللحظي المجمّع بنجاح إلى المعلم والإدارة!' });
      } else {
        setDigestTestFeedback({ ok: false, message: `❌ ${res.error || 'تعذر إرسال التقرير'}` });
      }
    } catch (e: any) {
      setDigestTestFeedback({ ok: false, message: `❌ خطأ: ${e.message}` });
    } finally {
      setTestingDigestType(null);
    }
  };

  // Test Post-Session Teacher Wrap-Up Digest
  const handleTestTeacherWrapup = async () => {
    if (!settings.telegramToken) {
      setDigestTestFeedback({ ok: false, message: '⚠️ يرجى ضبط وتفعيل توكن البوت أولاً.' });
      return;
    }
    clearTelegramDispatchCache();
    setTestingDigestType('postSession');
    setDigestTestFeedback(null);
    try {
      const res = await dispatchTeacherPostSessionWrapup({
        settings: { ...settings, teachers },
        schedules: localSchedules,
        classTime: simulatedClassTime || settings.startTime || '19:00',
      });
      if (res.ok) {
        setDigestTestFeedback({ ok: true, message: '✅ تم إرسال التقرير الختامي الشامل للحصة بنجاح إلى المعلم والإدارة!' });
      } else {
        setDigestTestFeedback({ ok: false, message: `❌ ${res.error || 'تعذر إرسال التقرير'}` });
      }
    } catch (e: any) {
      setDigestTestFeedback({ ok: false, message: `❌ خطأ: ${e.message}` });
    } finally {
      setTestingDigestType(null);
    }
  };

  // Test Trigger Automated Notification
  const handleTestTriggerNotification = async () => {
    if (!settings.telegramToken) {
      setTestFeedback({
        ok: false,
        message: '⚠️ يرجى إدخال وتفعيل توكن بوت التيليجرام أولاً.',
      });
      return;
    }

    clearTelegramDispatchCache();

    const realStudents = localSchedules.filter((s) => isRealStudentRecord(s.studentId, s.studentName));
    const targetStudent =
      realStudents.find((s) => s.studentId === testStudentId) ||
      realStudents.find((s) => s.telegramChatId && s.telegramChatId.trim()) ||
      realStudents[0] || {
        studentId: '101',
        studentName: 'حامد',
        telegramChatId: settings.telegramChatId || '',
        customStartTime: simulatedClassTime || settings.startTime || '19:00',
      };

    setTestSending(true);
    setTestFeedback(null);

    try {
      const nowTimeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
      const res = await dispatchAttendanceTelegramNotification({
        eventType: testEventType,
        student: {
          id: targetStudent.studentId,
          name: targetStudent.studentName || 'الطالب',
          telegramChatId: targetStudent.telegramChatId || settings.telegramChatId,
          preferredLanguage: targetStudent.preferredLanguage,
          assignedTeacherId: targetStudent.assignedTeacherId,
        },
        settings: {
          ...settings,
          templatesAr,
          templatesEn,
          templatesTh,
          teachers,
        },
        customSchedule: targetStudent,
        extraVars: {
          classTime: targetStudent.customStartTime || settings.startTime || simulatedClassTime || '19:00',
          minutesLate: String(lateDelayMinutes),
          دقائق_التأخر: String(lateDelayMinutes),
          دقائق_التذكير: String(preClassMinutes),
          lesson: 'درس تجريبي (Live Test)',
          score: '100',
          stars: '5',
          notes: 'اختبار محاكاة توقيت الإرسال التلقائي',
        },
        forceSend: true,
      });

      if (res.sentToStudent || res.sentToTeacher || res.sentToAdmin || res.sentToChannelsCount > 0) {
        const dests = [
          res.sentToStudent ? `الطالب [${targetStudent.studentName}]` : '',
          res.sentToTeacher ? 'المعلم' : '',
          res.sentToAdmin ? 'شات الإدارة' : '',
          res.sentToChannelsCount > 0 ? `${res.sentToChannelsCount} قناة/مجموعة` : '',
        ].filter(Boolean).join(' + ');

        setTestFeedback({
          ok: true,
          message: `🎉 تم إرسال رسالة (${testEventType}) بنجاح إلى: ${dests}!`,
        });
      } else {
        setTestFeedback({
          ok: false,
          message: `❌ تعذر الإرسال: ${res.errors.join(', ') || 'تأكد من معرفات المحادثة وصلاحيات البوت.'}`,
        });
      }
    } catch (e: any) {
      setTestFeedback({
        ok: false,
        message: `❌ خطأ في الإرسال: ${e.message}`,
      });
    } finally {
      setTestSending(false);
    }
  };

  // Clear Memory Feedback State
  const [clearMemoryFeedback, setClearMemoryFeedback] = useState<string | null>(null);

  // Live Automated Scheduler Diagnostic Console States
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerDiagnosticResult, setSchedulerDiagnosticResult] = useState<AutomatedSchedulerResult | null>(null);
  const [simulatedEngineTime, setSimulatedEngineTime] = useState<string>(settings.startTime || '19:00');
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Run Automated Scheduler Diagnostics Handler
  const handleRunSchedulerDiagnostics = async (isSimulated = false) => {
    if (!settings.telegramToken) {
      setDiagnosticFeedback({
        ok: false,
        message: '⚠️ يرجى إدخال وتفعيل توكن بوت التيليجرام أولاً.',
      });
      return;
    }

    setSchedulerRunning(true);
    setDiagnosticFeedback(null);
    clearTelegramDispatchCache();

    try {
      const activeHubSettings: AttendanceSettings = {
        ...settings,
        startTime: settings.startTime || '19:00',
        telegramPreClassReminderMinutes: Number(preClassMinutes) || 15,
        telegramLateAlertDelayMinutes: Number(lateDelayMinutes) || 10,
        telegramLateAlertRepeatEnabled: lateRepeatEnabled !== false,
        telegramLateAlertRepeatIntervalMinutes: Number(lateRepeatInterval) || 15,
        telegramLateAlertMaxCount: Number(lateMaxCount) || 2,
        telegramFinalAbsentTiming: finalAbsentTiming || 'end_of_session',
        telegramNotifyTeacherDirectly: notifyTeacherDirectly !== false,
        templatesAr,
        templatesEn,
        templatesTh,
        teachers,
      };

      const result = await checkAndDispatchAutomatedAlerts(
        localSchedules,
        activeHubSettings,
        {
          simulatedTime: isSimulated ? simulatedEngineTime : undefined,
          forceSend: true,
          skipLocks: true,
        }
      );

      setSchedulerDiagnosticResult(result);
      if (result.dispatchedCount > 0) {
        setDiagnosticFeedback({
          ok: true,
          message: `🎉 نجح الفحص والإرسال: تم إطلاق ${result.dispatchedCount} إشعار/تقرير آلي بنجاح إلى تيليجرام!`,
        });
      } else {
        setDiagnosticFeedback({
          ok: true,
          message: `ℹ️ اكتمل الفحص: لم تنطبق شروط الإرسال على التوقيت الحالي (${isSimulated ? simulatedEngineTime : 'الوقت الحقيقي'}). راجع جدول التشخيص التفصيلي أدناه.`,
        });
      }
    } catch (e: any) {
      setDiagnosticFeedback({
        ok: false,
        message: `❌ خطأ أثناء تشغيل محرك المجدول: ${e.message}`,
      });
    } finally {
      setSchedulerRunning(false);
    }
  };

  // Clear Memory Handler (Consolidated Unified Action)
  const handleClearAllMemory = () => {
    const res = clearAllTelegramNotificationMemory();
    setClearMemoryFeedback(`✅ تم تصفير ذاكرة التنبيهات وأقفال الإرسال السابقة بنجاح (${res.clearedCount} قفل/سجل). تم الإبقاء على حسابات الطلاب وربط تيليجرام وسجلات الحضور سليمة 100%! يمكنك الآن إعادة تجربة إرسال الرسائل واختبار التوقيت فوراً. 🚀`);
    setTimeout(() => {
      setClearMemoryFeedback(null);
    }, 6000);
  };

  // Save All Settings handler
  const handleSaveAllHub = async () => {
    const updated: AttendanceSettings = {
      ...settings,
      telegramAdminUserId: settings.telegramAdminUserId,
      telegramGroups: groups,
      telegramChannels: channels,
      teachers: teachers,
      templatesAr: templatesAr,
      templatesEn: templatesEn,
      templatesTh: templatesTh,
      botCommands: botCommands,
      telegramTemplatePreClass: templatesAr.preClass,
      telegramTemplateLogin: templatesAr.login,
      telegramTemplateComplete: templatesAr.complete,
      telegramTemplateAbsent: templatesAr.absent,
      telegramPreClassReminderMinutes: Number(preClassMinutes) || 15,
      telegramLateAlertDelayMinutes: Number(lateDelayMinutes) || 10,
      telegramLateAlertRepeatEnabled: lateRepeatEnabled !== false,
      telegramLateAlertRepeatIntervalMinutes: Number(lateRepeatInterval) || 15,
      telegramLateAlertMaxCount: Number(lateMaxCount) || 2,
      telegramFinalAbsentTiming: finalAbsentTiming || 'end_of_session',
      telegramNotifyTeacherDirectly: notifyTeacherDirectly !== false,
    };
    onUpdateSettings(updated);
    try {
      localStorage.setItem('attendance_settings_cached', JSON.stringify(updated));
    } catch (e) {}
    if (onSaveAll) {
      await onSaveAll(updated);
    }
  };

  // Save Bot Commands Handler with Visual Feedback
  const handleSaveBotCommands = async () => {
    await handleSaveAllHub();
    setBotCommandsSavedToast(true);
    setTimeout(() => {
      setBotCommandsSavedToast(false);
    }, 4000);
  };

  // Stats Counters
  const linkedStudentsCount = localSchedules.filter((s) => s.studentId !== 'DEFAULT_STUDENT' && s.telegramChatId && s.telegramChatId.trim()).length;
  const linkedTeachersCount = teachers.filter((t) => t.telegramChatId && t.telegramChatId.trim()).length;

  const filteredStudents = localSchedules.filter((s) => {
    if (s.studentId === 'DEFAULT_STUDENT') return false;
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (s.studentName && s.studentName.toLowerCase().includes(q)) || s.studentId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Summary & Sub-Tabs Navigation */}
      <div className="bg-slate-900/80 border border-slate-700/90 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>منظومة ومركز إشعارات وتنبيهات تليجرام</span>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                    Smart Telegram Hub
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  ربط الطلاب والأساتذة والإدارة • إرسال مباشر بالوسائط • قوالب ثلاثية اللغات • ردود واستعلامات تفاعلية
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges & Clear Memory Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleClearAllMemory}
              title="تصفير ومسح أقفال وسجلات الإرسال السابقة فقط لإعادة التجربة واختبار التوقيت مجدداً دون مساس بحسابات الطلاب أو الحضور"
              className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold transition shadow-sm hover:shadow active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>🧹 تصفير ذاكرة الإرسال للاختبار</span>
            </button>

            <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="text-[11px]">
                <span className="text-slate-400">طلاب مربوطون: </span>
                <strong className="text-emerald-400 font-bold">{linkedStudentsCount}</strong> / {allSchedules.length}
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <div className="text-[11px]">
                <span className="text-slate-400">أساتذة: </span>
                <strong className="text-amber-400 font-bold">{linkedTeachersCount}</strong>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${settings.telegramEnabled ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
              <div className="text-[11px]">
                <span className="text-slate-400">حالة البوت: </span>
                <strong className={settings.telegramEnabled ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                  {settings.telegramEnabled ? 'مُفعّل تلقائياً 🟢' : 'معطل ⚪'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Memory Feedback Banner */}
        {clearMemoryFeedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{clearMemoryFeedback}</span>
            </div>
            <button
              onClick={() => setClearMemoryFeedback(null)}
              className="text-emerald-400 hover:text-emerald-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sub-Navigation Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setSubTab('bot_setup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'bot_setup'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>1. إعدادات البوت والقناة الإدارية</span>
          </button>

          <button
            onClick={() => setSubTab('automation_timing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'automation_timing'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <Timer className="w-4 h-4 text-amber-300" />
            <span>2. ⏱️ ضبط توقيت وتكرار الرسائل</span>
          </button>

          <button
            onClick={() => setSubTab('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. محرر القوالب ثلاثي اللغات (AR/EN/TH)</span>
          </button>

          <button
            onClick={() => setSubTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. دليل ربط المعلمين والطلاب ({linkedStudentsCount + linkedTeachersCount})</span>
          </button>

          <button
            onClick={() => setSubTab('direct_messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'direct_messages'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>5. مركز إرسال الرسائل والوسائط</span>
          </button>

          <button
            onClick={() => setSubTab('bot_commands')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'bot_commands'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>6. الاستعلامات التفاعلية (/schedule ...)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: BOT SETUP & ADMIN CHANNELS/GROUPS */}
      {subTab === 'bot_setup' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-xl"
        >
          <div className="border-b border-slate-800 pb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>إعدادات البوت والربط المتقدم (إدارة، مجموعات، قنوات عامة وخاصة)</span>
            </h4>
            <p className="text-xs text-slate-400">
              قم بإعداد رمز البوت، معرّف الإداري الشخصي، مجموعات المعلمين والطلاب، والقنوات العامة والخاصة
            </p>
          </div>

          {/* Core Configuration: Bot Token & Admin Private ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Bot Token Field */}
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 block">
                  1️⃣ 🔑 رمز البوت الخاص (Telegram Bot Token):
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBotToken(!showBotToken)}
                    className="text-slate-400 hover:text-indigo-300 text-[11px] flex items-center gap-1 transition px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
                    title={showBotToken ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showBotToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showBotToken ? 'إخفاء' : 'إظهار'}</span>
                  </button>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">أساسي</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showBotToken ? 'text' : 'password'}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  value={settings.telegramToken || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, telegramToken: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-400">
                  رمز API الممنوح من @BotFather (يُحفظ تلقائياً في المتصفح)
                </p>
                <button
                  type="button"
                  onClick={handleTestBot}
                  disabled={testingBot || !settings.telegramToken}
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingBot ? 'animate-spin' : ''}`} />
                  <span>فحص صحة الرمز</span>
                </button>
              </div>

              {/* Bot Username field */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">
                    🤖 اسم مستخدم البوت في تيليجرام (Bot Username):
                  </label>
                  {settings.telegramBotUsername && (
                    <a
                      href={`https://t.me/${settings.telegramBotUsername.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                    >
                      <span>@{settings.telegramBotUsername.replace(/^@/, '')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className="bg-slate-900 border border-slate-700 text-slate-400 px-3 py-2 rounded-xl text-xs font-mono select-none flex items-center">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. MySmartSchool_bot"
                    value={(settings.telegramBotUsername || '').replace(/^@/, '')}
                    onChange={(e) => onUpdateSettings({ ...settings, telegramBotUsername: e.target.value.replace(/^@/, '').trim() })}
                    className="flex-1 bg-slate-900 border border-slate-700 text-emerald-300 px-3 py-2 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  يُستخدم اسم المستخدم هذا لتوليد روابط التسجيل الفوري (One-Click) ورموز QR للطلاب والمعلمين.
                </p>
              </div>

              {botTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    botTestResult.ok
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {botTestResult.message}
                </div>
              )}
            </div>

            {/* 2. Private Admin User ID */}
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 block">
                  2️⃣ 👑 معرّف الإداري الشخصي (Private User ID):
                </label>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">خاص ومباشر</span>
              </div>
              <input
                type="text"
                placeholder="مثال رقمي: 123456789"
                value={settings.telegramAdminUserId || ''}
                onChange={(e) => onUpdateSettings({ ...settings, telegramAdminUserId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-400">
                  معرّفك الرقمي في تيليجرام (من بوت @userinfobot)
                </p>
                <button
                  type="button"
                  onClick={handleSendPrivateAdminTest}
                  disabled={sendingPrivateAdminTest || !settings.telegramToken || !settings.telegramAdminUserId}
                  className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingPrivateAdminTest ? 'animate-spin' : ''}`} />
                  <span>إرسال تجريبي للإداري</span>
                </button>
              </div>
              {privateAdminTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    privateAdminTestResult.startsWith('✅')
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {privateAdminTestResult}
                </div>
              )}
              {/* Helpful instructions for Admin User ID */}
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-amber-300/90 block">⚠️ ملاحظة هامة لنجاح الإرسال للخاص:</span>
                <p>1. تأكد من فتح محادثة مع البوت الخاص بك والضغط على <b className="text-white">/start</b> أولاً (تيليجرام يمنع البوت من مراسلة أي شخص لم يبدأ محادثة معه).</p>
                <p>2. للحصول على معرفك الرقمي الخاص، أرسل أي رسالة لبوت <b className="text-indigo-300 font-mono">@userinfobot</b> أو <b className="text-indigo-300 font-mono">@getidsbot</b> وانسخ الرقم (Id: 123456789).</p>
              </div>
            </div>
          </div>

          {/* Section 3: Groups Management (Teachers / Students Groups) */}
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>3️⃣ مجموعات تيليجرام (Groups / Supergroups):</span>
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  المجموعات تتيح النقاش والتفاعل بين الأعضاء (مثل قروب المعلمين، قروب الطلاب، وقروب أولياء الأمور)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGroupModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مجموعة</span>
              </button>
            </div>

            {/* Groups List */}
            {groups.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">لا توجد مجموعات مضافة حالياً. اضغط على زر "إضافة مجموعة" للربط.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groups.map((grp) => (
                  <div key={grp.id} className="bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl space-y-2 relative group hover:border-emerald-500/50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          grp.type === 'teachers'
                            ? 'bg-amber-500/20 text-amber-300'
                            : grp.type === 'students'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-700 text-slate-200'
                        }`}>
                          {grp.type === 'teachers' ? '👨‍🏫 قروب المعلمين' : grp.type === 'students' ? '🎓 قروب الطلاب' : '🌐 قروب عام'}
                        </span>
                        <h6 className="font-bold text-white text-xs mt-1">{grp.name}</h6>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(grp.id, grp.name)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="حذف المجموعة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 select-all">
                      {grp.chatId}
                    </div>
                    <button
                      onClick={async () => {
                        if (!settings.telegramToken) {
                          alert('يرجى حفظ رمز البوت أولاً');
                          return;
                        }
                        const res = await sendTelegramMessage({
                          token: settings.telegramToken,
                          chatId: grp.chatId,
                          text: `🔔 تجربة إرسال لمجموعة (${grp.name}) عبر المنصة التعليمية الذكية! ✨`,
                        });
                        alert(res.ok ? `✅ تم الإرسال لمجموعة (${grp.name}) بنجاح!` : `❌ فشل الإرسال: ${res.error}`);
                      }}
                      className="w-full text-center py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>فحص الإرسال للمجموعة</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Channels Management (Public & Private Channels) */}
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>4️⃣ قنوات تيليجرام (Public & Private Channels):</span>
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  القنوات مخصصة لبث الإعلانات والتعاميم من طرف واحد (الإدارة) لعدد غير محدود من المشتركين
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddChannelModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قناة</span>
              </button>
            </div>

            {/* Channels Explanation Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex gap-2">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">القناة العامة (Public):</span>
                  <p className="text-slate-400 text-[11px]">لها رابط عام (مثل t.me/MySchool) ويمكن لأي شخص البحث عنها والانضمام. معرفها عادة @channelName.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200">القناة الخاصة (Private):</span>
                  <p className="text-slate-400 text-[11px]">لا تظهر في البحث وتتطلب رابط دعوة خاص. معرفها يكون رقمي بصيغة (مثل -1001234567890).</p>
                </div>
              </div>
            </div>

            {/* Channels List */}
            {channels.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">لا توجد قنوات مضافة حالياً. اضغط على زر "إضافة قناة" للربط.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {channels.map((chn) => (
                  <div key={chn.id} className="bg-slate-900 border border-slate-700/80 p-3.5 rounded-xl space-y-2 relative group hover:border-purple-500/50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit ${
                          chn.accessType === 'public'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {chn.accessType === 'public' ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          <span>{chn.accessType === 'public' ? 'قناة عامة' : 'قناة خاصة'}</span>
                        </span>
                        <h6 className="font-bold text-white text-xs mt-1">{chn.name}</h6>
                      </div>
                      <button
                        onClick={() => handleDeleteChannel(chn.id, chn.name)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="حذف القناة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-purple-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 select-all">
                      {chn.chatId}
                    </div>
                    <button
                      onClick={async () => {
                        if (!settings.telegramToken) {
                          alert('يرجى حفظ رمز البوت أولاً');
                          return;
                        }
                        const res = await sendTelegramMessage({
                          token: settings.telegramToken,
                          chatId: chn.chatId,
                          text: `📢 إشعار بث تجريبي لقناة (${chn.name}) من المنصة التعليمية الذكية! ✨`,
                        });
                        alert(res.ok ? `✅ تم النشر في قناة (${chn.name}) بنجاح!` : `❌ فشل الإرسال: ${res.error}\n(تأكد من ترقية البوت لمشرف في القناة)`);
                      }}
                      className="w-full text-center py-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>نشر رسالة تجريبية للقناة</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global Notification Switch */}
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-indigo-400" />
                <h5 className="font-bold text-white text-sm">تفعيل إشعارات وتنبيهات تليجرام التلقائية بالمنصة:</h5>
              </div>
              <p className="text-xs text-slate-400">
                إرسال الإشعارات تلقائياً عند تسجيل الدخول، إنجاز التمارين، بطاقات التقييم، وتنبيهات الغياب
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.telegramEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, telegramEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </motion.div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h5 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>إضافة مجموعة تيليجرام جديدة</span>
              </h5>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم المجموعة:</label>
                <input
                  type="text"
                  placeholder="مثال: قروب معلمي الرياضيات أو قروب شعبة A"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">نوع المجموعة المستهدفة:</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="teachers">👨‍🏫 مجموعة المعلمين (Teachers Group)</option>
                  <option value="students">🎓 مجموعة الطلاب (Students Group)</option>
                  <option value="general">🌐 مجموعة عامة / أولياء أمور (General)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">معرّف الشات (Group Chat ID):</label>
                <input
                  type="text"
                  placeholder="مثال: -1001987654321"
                  value={newGroupChatId}
                  onChange={(e) => setNewGroupChatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-mono px-3 py-2 rounded-xl text-xs focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 تلميح: أضف البوت إلى المجموعة ثم أضف بوت @getidsbot لمعرفة ID المجموعة (يبدأ بسالب -).
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddGroup}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold transition shadow-lg"
              >
                حفظ وإضافة المجموعة
              </button>
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Channel Modal */}
      {showAddChannelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h5 className="font-bold text-white text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>إضافة قناة تيليجرام جديدة</span>
              </h5>
              <button
                onClick={() => setShowAddChannelModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم القناة:</label>
                <input
                  type="text"
                  placeholder="مثال: قناة الإعلانات الرسمية أو قناة الأوائل"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">نوع القناة (عامة / خاصة):</label>
                <select
                  value={newChannelAccessType}
                  onChange={(e) => setNewChannelAccessType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="public">🌐 قناة عامة (Public Channel - بمعرّف @name)</option>
                  <option value="private">🔒 قناة خاصة (Private Channel - برقم -100...)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">معرّف القناة (Channel ID / Username):</label>
                <input
                  type="text"
                  placeholder={newChannelAccessType === 'public' ? 'مثال: @MySchoolChannel' : 'مثال: -1001876543210'}
                  value={newChannelChatId}
                  onChange={(e) => setNewChannelChatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-purple-300 font-mono px-3 py-2 rounded-xl text-xs focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 تلميح: تأكد من إضافة البوت كـ "مشرف" (Admin) في القناة مع صلاحية نشر الرسائل.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddChannel}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-xs font-bold transition shadow-lg"
              >
                حفظ وإضافة القناة
              </button>
              <button
                type="button"
                onClick={() => setShowAddChannelModal(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: AUTOMATION TIMING & REPETITION */}
      {subTab === 'automation_timing' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header & Quick Action */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />
                <span>مركز التحكم في توقيت وتكرار الرسائل التلقائية</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Smart Automation Timing
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                التحكم الكامل في مواعيد إطلاق التذكيرات المسبقة، إنذارات التأخر، فترات التكرار الذكي، الغياب النهائي، وتنبيهات المعلم المباشر.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleClearAllMemory}
                title="تصفير ومسح سجلات الإرسال السابقة فقط لتجربة التوقيت وإرسال الرسائل مجدداً دون مساس بحسابات الطلاب"
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>🧹 تصفير ذاكرة الإرسال للاختبار</span>
              </button>

              <button
                type="button"
                onClick={handleSaveTimingSettings}
                disabled={isSaving}
                className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-600/30 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ إعدادات التوقيت الآن'}</span>
              </button>
            </div>
          </div>

          {timingSavedToast && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✅ تم حفظ وتحديث جميع إعدادات التوقيت والتكرار بنجاح!</span>
            </div>
          )}

          {/* Grid of 4 Main Timing Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 1: PRE-CLASS REMINDER */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">1. تذكير ما قبل موعد الحصة</h5>
                      <span className="text-[11px] text-blue-400 font-semibold">Pre-Class Reminder Timing</span>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/40 font-mono">
                    قبل {preClassMinutes} دقيقة
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يتم إرسال رسالة تذكيرية للطالب على تيليجرام قبل حلول موعد الحصة المعتمد لتجهيز نفسه وحضور الدرس في وقته.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">دقائق التذكير المسبق قبل الحصة:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={preClassMinutes || ''}
                      onChange={(e) => setPreClassMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="15"
                      className="w-full bg-slate-950 border border-slate-700 text-blue-300 text-sm font-mono font-bold px-3 py-2 rounded-xl focus:border-blue-500 focus:outline-none text-left"
                    />
                    <span className="text-xs text-slate-400 font-bold shrink-0">دقيقة قبل الحصة</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 القالب المستخدم: <strong className="text-blue-300">1. تذكير ما قبل الحصة (preClass)</strong>
                </p>
              </div>
            </div>

            {/* CARD 2: LATE WARNING & SMART REPETITION */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">2. إنذار التأخر عن الحصة والتكرار</h5>
                      <span className="text-[11px] text-amber-400 font-semibold">Late Alert & Repetition</span>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/40 font-mono">
                    بعد {lateDelayMinutes} د
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  إذا بدأ وقت الحصة ولم يسجل الطالب دخوله، يتم إرسال إنذار التأخر الأول ثم تكراره إذا لم يدخل.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">مهلة إرسال الإنذار الأول بعد البدء:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={lateDelayMinutes || ''}
                      onChange={(e) => setLateDelayMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="10"
                      className="w-full bg-slate-950 border border-slate-700 text-amber-300 text-sm font-mono font-bold px-3 py-2 rounded-xl focus:border-amber-500 focus:outline-none text-left"
                    />
                    <span className="text-xs text-slate-400 font-bold shrink-0">دقائق بعد البدء</span>
                  </div>
                </div>

                {/* Repetition Toggle & Settings */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lateRepeatEnabled}
                        onChange={(e) => setLateRepeatEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-700"
                      />
                      <span>تفعيل تكرار إنذار التأخر إذا لم يدخل</span>
                    </label>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${lateRepeatEnabled ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                      {lateRepeatEnabled ? 'مُفعّل 🔁' : 'مُعطّل'}
                    </span>
                  </div>

                  {lateRepeatEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">الفاصل بين كل تكرار (بالدقائق):</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="720"
                            value={lateRepeatInterval || ''}
                            onChange={(e) => setLateRepeatInterval(Math.max(1, parseInt(e.target.value) || 1))}
                            placeholder="15"
                            className="w-full bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg focus:border-amber-500 focus:outline-none text-left"
                          />
                          <span className="text-[10px] text-slate-400 shrink-0">دقيقة</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">الحد الأقصى لعدد التكرارات:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={lateMaxCount || ''}
                            onChange={(e) => setLateMaxCount(Math.max(1, parseInt(e.target.value) || 1))}
                            placeholder="2"
                            className="w-full bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg focus:border-amber-500 focus:outline-none text-left"
                          />
                          <span className="text-[10px] text-slate-400 shrink-0">مرات</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 3: FINAL ABSENCE NOTIFICATION */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">3. إشعار الغياب النهائي</h5>
                      <span className="text-[11px] text-rose-400 font-semibold">Final Absence Alert</span>
                    </div>
                  </div>
                  <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/40 font-mono">
                    {finalAbsentTiming === 'end_of_session' ? 'نهاية الحصة' : 'نهاية اليوم'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  إذا انقضت الحصة دون تسجيل دخول الطالب، يتم إرسال إشعار الغياب النهائي الرسمي وتسجيل الحالة في التقرير.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">توقيت إرسال إشعار الغياب النهائي:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFinalAbsentTiming('end_of_session')}
                    className={`p-3 rounded-xl text-xs font-bold border transition text-right flex flex-col gap-1 ${
                      finalAbsentTiming === 'end_of_session'
                        ? 'bg-rose-600/20 text-rose-200 border-rose-500 shadow-md'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">فور انتهاء وقت الحصة</span>
                      {finalAbsentTiming === 'end_of_session' && <Check className="w-4 h-4 text-rose-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400">مثال: بعد انتهاء مدة الدرس المعتمدة (120 دقيقة)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFinalAbsentTiming('end_of_day')}
                    className={`p-3 rounded-xl text-xs font-bold border transition text-right flex flex-col gap-1 ${
                      finalAbsentTiming === 'end_of_day'
                        ? 'bg-rose-600/20 text-rose-200 border-rose-500 shadow-md'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">عند نهاية اليوم الدراسي</span>
                      {finalAbsentTiming === 'end_of_day' && <Check className="w-4 h-4 text-rose-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400">إرسال التقرير الإجمالي للغياب ليلاً (الساعة 23:59)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  💡 القالب المستخدم: <strong className="text-rose-300">10. إشعار الغياب النهائي عن الحصة (finalAbsent)</strong>
                </p>
              </div>
            </div>

            {/* CARD 4: TEACHER CONSOLIDATED DIGEST REPORTS */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">4. تقارير المعلم المجمّعة الذكية (3 تقارير شاملة)</h5>
                      <span className="text-[11px] text-purple-400 font-semibold">Teacher Consolidated Digest Reports</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-bold ${teacherDigestEnabled ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                    {teacherDigestEnabled ? 'مُفعّل 📊' : 'معطل ⚪'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تجميع إشعارات الحصة للمعلم في (3 رسائل تقريرية منظمة) بدلاً من إرسال رسائل فردية متناثرة لكل مشترك لمنع إزعاج المعلم.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                {/* Main Toggle */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherDigestEnabled}
                      onChange={(e) => setTeacherDigestEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                    />
                    <span>تفعيل نظام التقارير المجمّعة للمعلم والإدارة</span>
                  </label>
                  <span className="text-[10px] text-purple-300 font-mono">3 Smart Reports</span>
                </div>

                {teacherDigestEnabled && (
                  <div className="space-y-2">
                    {/* Report 1: Pre-Class Briefing */}
                    <div className="bg-slate-950/90 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teacherPreClassDigest}
                            onChange={(e) => setTeacherPreClassDigest(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                          />
                          <span>1️⃣ تقرير ما قبل الحصة (قائمة المشتركين)</span>
                        </label>
                        <p className="text-[10px] text-slate-400">تذكير بالموعد وقائمة بأسماء جميع المشتركين لتلك الساعة</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTeacherBriefing}
                        disabled={testingDigestType !== null}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 disabled:opacity-50"
                      >
                        {testingDigestType === 'preClass' ? 'جاري الإرسال...' : '🚀 تجربة'}
                      </button>
                    </div>

                    {/* Report 2: Mid-Class Roll Call */}
                    <div className="bg-slate-950/90 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teacherMidClassDigest}
                            onChange={(e) => setTeacherMidClassDigest(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-700"
                          />
                          <span>2️⃣ تقرير الحضور والغياب اللحظي</span>
                        </label>
                        <p className="text-[10px] text-slate-400">رسالة واحدة توضح الحاضرين والمتأخرين مع وقت الدخول</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTeacherSnapshot}
                        disabled={testingDigestType !== null}
                        className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 disabled:opacity-50"
                      >
                        {testingDigestType === 'midClass' ? 'جاري الإرسال...' : '🚀 تجربة'}
                      </button>
                    </div>

                    {/* Report 3: Post-Session Wrapup */}
                    <div className="bg-slate-950/90 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teacherPostSessionDigest}
                            onChange={(e) => setTeacherPostSessionDigest(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                          />
                          <span>3️⃣ التقرير الختامي الشامل للحصة</span>
                        </label>
                        <p className="text-[10px] text-slate-400">إجمالي الحاضرين وإجمالي الغائبين ونسبة الالتزام</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTeacherWrapup}
                        disabled={testingDigestType !== null}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 disabled:opacity-50"
                      >
                        {testingDigestType === 'postSession' ? 'جاري الإرسال...' : '🚀 تجربة'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Digest Test Feedback Banner */}
                {digestTestFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      digestTestFeedback.ok
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {digestTestFeedback.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                    <span>{digestTestFeedback.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 5: EARLY ENTRY & EXIT BEHAVIOR OVERVIEW */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h5 className="text-sm font-bold text-white">5. قواعد رسائل الدخول المبكر والخروج الذكي</h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <LogIn className="w-4 h-4" />
                  <span>دخول مبكر (مسموح)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  إذا دخل الطالب قبل الموعد وكان الدخول مسموحاً، تصله رسالة تشجيع وترحيب لحرصه واهتمامه المبكر.
                </p>
                <span className="text-[10px] text-emerald-300/80 font-mono block">قالب: earlyEntryAllowed</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  <span>دخول مبكر (ممنوع)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  إذا حاول الطالب الدخول قبل الوقت وكان الدخول المبكر ممنوعاً، تصله رسالة بالانتظار حتى حلول وقته.
                </p>
                <span className="text-[10px] text-amber-300/80 font-mono block">قالب: earlyEntryBlocked</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <LogOut className="w-4 h-4" />
                  <span>خروج مبكر</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  إذا سجّل الطالب خروجاً قبل انقضاء كامل مدة الحصة، يُرسل إشعار مغادرة مبكرة مع تنبيه بالاستكمال.
                </p>
                <span className="text-[10px] text-amber-300/80 font-mono block">قالب: earlyExit</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>خروج نظامي</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  عند تسجيل الخروج بعد انتهاء مدة الحصة النظامية، تصله رسالة تحية وإشادة بإتمام الدرس بنجاح.
                </p>
                <span className="text-[10px] text-blue-300/80 font-mono block">قالب: regularExit</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE TIMELINE SIMULATOR */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <h5 className="text-sm font-bold text-white">محاكي المخطط الزمني الذكي للرسائل (Timeline Simulation)</h5>
                  <p className="text-xs text-slate-400">
                    رؤية تسلسل إطلاق الرسائل التلقائية لحصة افتراضية وفق الإعدادات المعتمدة أعلاه
                  </p>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-slate-400">موعد البدء:</span>
                  <input
                    type="time"
                    value={simulatedClassTime}
                    onChange={(e) => setSimulatedClassTime(e.target.value)}
                    className="bg-transparent text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-slate-400">المدة:</span>
                  <select
                    value={simulatedDuration}
                    onChange={(e) => setSimulatedDuration(Number(e.target.value))}
                    className="bg-transparent text-amber-300 font-bold focus:outline-none"
                  >
                    <option value={60} className="bg-slate-900">60 دقيقة</option>
                    <option value={90} className="bg-slate-900">90 دقيقة</option>
                    <option value={120} className="bg-slate-900">120 دقيقة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Graphic Nodes */}
            <div className="relative py-4">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 rounded hidden md:block"></div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {/* Node 1: Pre-Class */}
                <div className="bg-slate-950 border border-blue-500/40 p-4 rounded-xl space-y-2 relative shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                      {(() => {
                        const [h, m] = simulatedClassTime.split(':').map(Number);
                        const total = (h * 60 + m) - preClassMinutes;
                        const safeTotal = total < 0 ? total + 1440 : total;
                        const rh = Math.floor(safeTotal / 60);
                        const rm = safeTotal % 60;
                        return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
                      })()}
                    </span>
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <h6 className="text-xs font-bold text-white">⏰ تذكير ما قبل الحصة</h6>
                  <p className="text-[10px] text-slate-400">
                    قبل {preClassMinutes} دقيقة من الحصة لإعلام الطالب بالاستعداد.
                  </p>
                </div>

                {/* Node 2: Start Time */}
                <div className="bg-slate-950 border border-emerald-500/40 p-4 rounded-xl space-y-2 relative shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      {simulatedClassTime}
                    </span>
                    <LogIn className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h6 className="text-xs font-bold text-white">🔔 موعد بدء الحصة</h6>
                  <p className="text-[10px] text-slate-400">
                    عند تسجيل الدخول في الموعد تصله رسالة التأكيد والترحيب (login).
                  </p>
                </div>

                {/* Node 3: Late Alert 1 */}
                <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-xl space-y-2 relative shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                      {(() => {
                        const [h, m] = simulatedClassTime.split(':').map(Number);
                        const total = (h * 60 + m) + lateDelayMinutes;
                        const safeTotal = total >= 1440 ? total - 1440 : total;
                        const rh = Math.floor(safeTotal / 60);
                        const rm = safeTotal % 60;
                        return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
                      })()}
                    </span>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h6 className="text-xs font-bold text-white">⚠️ إنذار التأخر الأول</h6>
                  <p className="text-[10px] text-slate-400">
                    بعد {lateDelayMinutes} دقائق إذا لم يسجل دخوله (+ إشعار المعلم).
                  </p>
                </div>

                {/* Node 4: Repeated Late Alert */}
                <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-xl space-y-2 relative shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                      {(() => {
                        const [h, m] = simulatedClassTime.split(':').map(Number);
                        const total = (h * 60 + m) + lateDelayMinutes + (lateRepeatInterval * 1);
                        const safeTotal = total >= 1440 ? total - 1440 : total;
                        const rh = Math.floor(safeTotal / 60);
                        const rm = safeTotal % 60;
                        return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
                      })()}
                    </span>
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                  </div>
                  <h6 className="text-xs font-bold text-white">🔁 تكرار إنذار التأخر</h6>
                  <p className="text-[10px] text-slate-400">
                    {lateRepeatEnabled ? `تكرار كل ${lateRepeatInterval} دقيقة (حتى ${lateMaxCount} مرات)` : 'مُعطل حالياً'}
                  </p>
                </div>

                {/* Node 5: Final Absent */}
                <div className="bg-slate-950 border border-rose-500/40 p-4 rounded-xl space-y-2 relative shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">
                      {finalAbsentTiming === 'end_of_session' ? (
                        (() => {
                          const [h, m] = simulatedClassTime.split(':').map(Number);
                          const total = (h * 60 + m) + simulatedDuration;
                          const safeTotal = total >= 1440 ? total - 1440 : total;
                          const rh = Math.floor(safeTotal / 60);
                          const rm = safeTotal % 60;
                          return `${String(rh).padStart(2, '0')}:${String(rm).padStart(2, '0')}`;
                        })()
                      ) : '23:59'}
                    </span>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <h6 className="text-xs font-bold text-white">❌ إشعار الغياب النهائي</h6>
                  <p className="text-[10px] text-slate-400">
                    {finalAbsentTiming === 'end_of_session' ? 'فور انتهاء وقت الحصة المقرر' : 'في نهاية اليوم الدراسي'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE TEST TRIGGER TOOL */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                <div>
                  <h5 className="text-sm font-bold text-white">أداة التجربة والاختبار الفوري للبوت (Live Notification Trigger)</h5>
                  <p className="text-xs text-slate-400">
                    اختبر وصول أي نوع من الرسائل الآلية للطلاب أو المعلم أو الإدارة فورياً للتحقق من الصياغة
                  </p>
                </div>
              </div>
            </div>

            {clearMemoryFeedback && (
              <div className="p-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{clearMemoryFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اختر الطالب للتجربة:</label>
                <select
                  value={testStudentId}
                  onChange={(e) => setTestStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- جميع الطلاب الحقيقيين --</option>
                  {localSchedules.filter((s) => isRealStudentRecord(s.studentId, s.studentName)).map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      👤 {s.studentName || s.studentId} (#{s.studentId}) {s.telegramChatId ? '• [مربوط]' : '• [الشات العام]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">نوع الرسالة الآلية المراد اختبارها:</label>
                <select
                  value={testEventType}
                  onChange={(e) => setTestEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-300 text-xs px-3 py-2 rounded-xl focus:border-amber-500 focus:outline-none"
                >
                  <option value="preClass">1. تذكير ما قبل الحصة (preClass)</option>
                  <option value="earlyEntryAllowed">2. دخول مبكر مسموح تشجيعي (earlyEntryAllowed)</option>
                  <option value="earlyEntryBlocked">3. دخول مبكر ممنوع بالانتظار (earlyEntryBlocked)</option>
                  <option value="login">4. تأكيد دخول الحصة في الموعد (login)</option>
                  <option value="absent">5. إنذار التأخر عن الحصة (absent)</option>
                  <option value="earlyExit">6. إشعار خروج مبكر (earlyExit)</option>
                  <option value="regularExit">7. إشعار خروج نظامي (regularExit)</option>
                  <option value="finalAbsent">8. إشعار الغياب النهائي (finalAbsent)</option>
                  <option value="teacherAlert">9. إشعار المعلم المباشر (teacherAlert)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleTestTriggerNotification}
                  disabled={testSending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{testSending ? 'جارٍ إرسال التجربة...' : '🚀 إرسال تجربة فورية الآن'}</span>
                </button>
              </div>
            </div>

            {testFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  testFeedback.ok
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                }`}
              >
                {testFeedback.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                <span>{testFeedback.message}</span>
              </div>
            )}
          </div>

          {/* REAL-TIME AUTOMATED SCHEDULER DIAGNOSTIC & SIMULATION CONSOLE */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-base font-black text-white">مركز التشخيص والمراقبة الحية للمجدول الآلي</h5>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30">
                      Live Engine & Simulator
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تحليل فوري دقيق لحسابات توقيت الحصص، ونوافذ الإرسال، وتتبع أسباب انطلاق أو توقف كل إشعار
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300">
                <span className="text-slate-500 font-sans text-[11px]">🕒 وقت النظام الآن:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-500 font-sans text-[11px]">⏰ بداية الحصة:</span>
                <span className="font-bold text-amber-400 text-sm">{settings.startTime || '19:00'}</span>
              </div>
            </div>

            {/* Time Windows Visual Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-blue-950/40 border border-blue-800/40 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-blue-300 font-bold">
                  <span>1️⃣ نافذة تذكير ما قبل الحصة</span>
                  <span>-15 دقيقة</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تنطلق فقط قبل وقت الحصة المحدد وتتوقف فور بداية الحصة
                </p>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/40 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>2️⃣ مهلة الحضور المسموحة</span>
                  <span>أول 10 دقائق</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  فترة سماح طبيعية لدخول الطلاب دون احتساب تأخر
                </p>
              </div>

              <div className="bg-rose-950/40 border border-rose-800/40 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>3️⃣ نافذة إنذار التأخر</span>
                  <span>بعد 10 دقائق</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تنطلق للطلاب الغائبين حتى نهاية الحصة
                </p>
              </div>

              <div className="bg-purple-950/40 border border-purple-800/40 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span>4️⃣ التقرير الختامي والغياب</span>
                  <span>بعد ساعتين</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  إشعار الغياب النهائي والتقرير الشامل للمعلم والإدارة
                </p>
              </div>
            </div>

            {/* Interactive Trigger & Simulation Controls */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Real Time Run */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRunSchedulerDiagnostics(false)}
                    disabled={schedulerRunning}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${schedulerRunning ? 'animate-spin' : ''}`} />
                    <span>⚡ تشغيل وفحص المجدول الآلي بالوقت الحقيقي الحالي</span>
                  </button>
                </div>

                <div className="hidden lg:block w-px h-8 bg-slate-800"></div>

                {/* Simulation Time Run */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-xs font-bold text-slate-300">🧪 توقيت المحاكاة:</label>
                    <input
                      type="time"
                      value={simulatedEngineTime}
                      onChange={(e) => setSimulatedEngineTime(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-amber-300 text-xs px-3 py-1.5 rounded-lg font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRunSchedulerDiagnostics(true)}
                    disabled={schedulerRunning}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>تشغيل محاكاة بتوقيت [{simulatedEngineTime}]</span>
                  </button>
                </div>
              </div>

              {diagnosticFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    diagnosticFeedback.ok
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {diagnosticFeedback.ok ? <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{diagnosticFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Diagnostic Results Breakdown Table */}
            {schedulerDiagnosticResult && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h6 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>📊 تقرير التشخيص التفصيلي للطلاب في هذا الفحص:</span>
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-[11px]">
                      {schedulerDiagnosticResult.studentDiagnostics.length} طالب مفحوص
                    </span>
                  </h6>
                  {schedulerDiagnosticResult.simulatedTimeUsed && (
                    <span className="text-[11px] text-amber-400 font-mono">
                      (تم الاحتساب بناءً على توقيت محاكاة: {schedulerDiagnosticResult.simulatedTimeUsed})
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3">الطالب</th>
                        <th className="p-3">الموعد المعتمد</th>
                        <th className="p-3">حالة الحضور</th>
                        <th className="p-3">النطاق الزمني الحالي</th>
                        <th className="p-3">الإجراء والنتيجة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {schedulerDiagnosticResult.studentDiagnostics.map((st) => (
                        <tr key={st.studentId} className="hover:bg-slate-800/30 transition">
                          <td className="p-3 font-bold text-white">
                            <span>{st.studentName}</span>
                            <span className="text-slate-500 font-mono text-[11px] mr-1.5">(#{st.studentId})</span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-amber-300 font-bold">{st.classStartTime}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {st.source === 'custom' ? '🎯 جدول خاص بالطالب' : '🏛️ الخطة العامة للشعبة'}
                            </span>
                          </td>
                          <td className="p-3">
                            {st.hasPunchedIn ? (
                              <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                                ✅ حاضر ومسجل
                              </span>
                            ) : (
                              <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                                ❌ لم يسجل دخوله
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                                st.statusColor === 'emerald'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : st.statusColor === 'blue'
                                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                  : st.statusColor === 'amber'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : st.statusColor === 'rose'
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {st.currentWindow === 'pre_class'
                                ? '🔔 نافذة ما قبل الحصة'
                                : st.currentWindow === 'in_session_on_time'
                                ? '⏳ في مهلة البداية'
                                : st.currentWindow === 'late_warning'
                                ? '🚨 نافذة تنبيه التأخر'
                                : st.currentWindow === 'session_ended'
                                ? '🏁 نهاية الحصة'
                                : 'خارج النطاق'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">
                            <span>{st.actionTaken}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Execution Logs */}
                {schedulerDiagnosticResult.logs && schedulerDiagnosticResult.logs.length > 0 && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>سجل إشعارات المحرك المباشرة:</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-0.5 max-h-32 overflow-y-auto">
                      {schedulerDiagnosticResult.logs.map((lg, idx) => (
                        <div key={idx} className="text-slate-400">
                          {lg}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
      {subTab === 'directory' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* SECTION A: TEACHERS DIRECTORY */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>دليل الأساتذة والمعلمين (Teachers Directory)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  ربط حسابات التيليجرام الخاصة بالمعلمين لإشعارهم بحضور طلابهم وإنجازاتهم
                </p>
              </div>
            </div>

            {/* Add / Edit Teacher Box */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>{editingTeacherId ? 'تعديل بيانات المعلم:' : 'إضافة معلم جديد للدليل:'}</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">اسم المعلم:</label>
                  <input
                    type="text"
                    placeholder="مثال: أ. محمد الخالد"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">الدور / المادة:</label>
                  <input
                    type="text"
                    placeholder="مثال: معلم الخط العربي"
                    value={newTeacherRole}
                    onChange={(e) => setNewTeacherRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Telegram Chat ID:</label>
                  <input
                    type="text"
                    placeholder="مثال: 987654321 أو @TeacherUser"
                    value={newTeacherChatId}
                    onChange={(e) => setNewTeacherChatId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">رقم الهاتف (اختياري):</label>
                  <input
                    type="text"
                    placeholder="+966..."
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {editingTeacherId && (
                  <button
                    onClick={() => {
                      setEditingTeacherId(null);
                      setNewTeacherName('');
                      setNewTeacherRole('معلم المادة');
                      setNewTeacherChatId('');
                      setNewTeacherPhone('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                  >
                    إلغاء
                  </button>
                )}
                <button
                  onClick={handleSaveTeacher}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingTeacherId ? 'تحديث المعلم' : '➕ حفظ المعلم بالدليل'}</span>
                </button>
              </div>
            </div>

            {/* Teachers Table */}
            {teachers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
                لم يتم إضافة معلمين في دليل التيليجرام بعد. يمكنك إضافة أول معلم من النموذج أعلاه.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">اسم المعلم</th>
                      <th className="py-2.5 px-4">الدور / المادة</th>
                      <th className="py-2.5 px-4">معرف تيليجرام (Chat ID)</th>
                      <th className="py-2.5 px-4">الهاتف</th>
                      <th className="py-2.5 px-4 text-center">الإجراءات والرسائل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                    {teachers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                            {t.name.slice(0, 1)}
                          </div>
                          <span>{t.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{t.role}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">{t.telegramChatId}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{t.phone || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setShareModalData({
                                  isOpen: true,
                                  type: 'teacher',
                                  id: t.id,
                                  name: t.name,
                                  currentChatId: t.telegramChatId,
                                });
                              }}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                              title="توليد رابط الربط السريع ورمز QR ونشر الرسالة"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>رابط / QR</span>
                            </button>
                            <button
                              onClick={() => handleSendTestToTeacher(t)}
                              className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                              title="إرسال تجريبي للمعلم"
                            >
                              <Send className="w-3 h-3" />
                              <span>فحص</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingTeacherId(t.id);
                                setNewTeacherName(t.name);
                                setNewTeacherRole(t.role);
                                setNewTeacherChatId(t.telegramChatId);
                                setNewTeacherPhone(t.phone || '');
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t.id, t.name)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION B: STUDENTS & GUARDIANS DIRECTORY */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>دليل ربط الطلاب وأولياء الأمور (Students Telegram Directory)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  تحديد معرف التيليجرام الخاص بكل طالب ولغة الإشعارات المفضلة (العربية / ไทย / English)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* General Link for all students broadcast button */}
                <button
                  type="button"
                  onClick={() => setShowGeneralShareModal(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
                  title="توليد رابط ورسالة عامة لجميع الطلاب للتسجيل برقم الطالب"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>📢 رابط التسجيل العام (بالرقم)</span>
                </button>

                {/* Live Auto Sync Badge & Manual Trigger */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-400 font-bold">ربط مباشر فوري (نشط)</span>
                </div>

                <button
                  type="button"
                  onClick={handleSyncSignups}
                  disabled={syncingSignups || !settings.telegramToken}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  title="فحص الرسائل الجديدة يدوياً"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingSignups ? 'animate-spin' : ''}`} />
                  <span>{syncingSignups ? 'جاري الفحص...' : 'فحص فوري يدوي'}</span>
                </button>

                {/* Search Bar */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث باسم الطالب أو رقمه..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 text-white pr-9 pl-3 py-1.5 rounded-xl text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Telegram_Users Sheet Sync Banner */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-xs">
                      ورقة النسخ الاحتياطي في جوجل شيت: <span className="font-mono text-emerald-400">Telegram_Users</span>
                    </h5>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      نسخة سلبية مستقلة (Passive Copy)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    يتم تسجيل بيانات الطلاب ومعرفات تيليجرام ولغاتهم تلقائياً في ورقة مستقلة بالشيت بعد التسجيل كنسخة مرجعية دون التأثير على سرعة أو عمليات النظام.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncUsersSheet}
                  disabled={syncingUsersSheet}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/40 disabled:opacity-50"
                  title="مزامنة وتصدير كافة الطلاب المربوطين حالياً إلى ورقة Telegram_Users"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingUsersSheet ? 'animate-spin' : ''}`} />
                  <span>{syncingUsersSheet ? 'جارٍ التصدير للشيت...' : 'تحديث ومزامنة ورقة Telegram_Users'}</span>
                </button>
              </div>
            </div>

            {/* Users Sheet Sync Alert Feedback */}
            {usersSheetSyncFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                  usersSheetSyncFeedback.ok
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {usersSheetSyncFeedback.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{usersSheetSyncFeedback.message}</span>
                </div>
                <button onClick={() => setUsersSheetSyncFeedback(null)} className="text-slate-400 hover:text-white p-1">
                  ✕
                </button>
              </div>
            )}

            {/* Sync Feedback Alert */}
            {syncFeedback && (
              <div className="p-3 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center justify-between">
                <span>{syncFeedback}</span>
                <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-white p-1">
                  ✕
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">الطالب</th>
                    <th className="py-2.5 px-4">معرف تيليجرام الخاص (Chat ID / Username)</th>
                    <th className="py-2.5 px-4">لغة الإشعارات المفضلة</th>
                    <th className="py-2.5 px-4 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {filteredStudents.map((st) => (
                    <tr key={st.studentId} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                            {(st.studentName || st.studentId).slice(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{st.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">#{st.studentId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. 123456789 or @username"
                            value={st.telegramChatId || ''}
                            onChange={(e) =>
                              onUpdateScheduleStudentTelegram(
                                st.studentId,
                                e.target.value,
                                st.preferredLanguage,
                                st.guardianPhone
                              )
                            }
                            className="w-full sm:w-56 bg-slate-950 border border-slate-700 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none"
                          />
                          {st.telegramChatId && st.telegramChatId.trim() ? (
                            <span className="shrink-0 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>مربوط</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full">
                              غير مربوط
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={st.preferredLanguage || 'ar'}
                          onChange={(e) =>
                            onUpdateScheduleStudentTelegram(
                              st.studentId,
                              st.telegramChatId || '',
                              e.target.value as 'ar' | 'en' | 'th',
                              st.guardianPhone
                            )
                          }
                          className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="ar">🇸🇦 العربية (AR)</option>
                          <option value="en">🇬🇧 English (EN)</option>
                          <option value="th">🇹🇭 ภาษาไทย (TH)</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setShareModalData({
                                isOpen: true,
                                type: 'student',
                                id: st.studentId,
                                name: st.studentName,
                                currentChatId: st.telegramChatId,
                              });
                            }}
                            className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            title="توليد رابط التسجيل بنقرة واحدة ورمز QR ورسالة الواتساب/اللاين"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>رابط / QR</span>
                          </button>
                          <button
                            onClick={() => handleSendTestToStudent(st)}
                            disabled={!st.telegramChatId || !st.telegramChatId.trim()}
                            className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="إرسال رسالة فحص تجريبية للطالب"
                          >
                            <Send className="w-3 h-3" />
                            <span>فحص</span>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmStudent({
                                id: st.studentId,
                                name: st.studentName || st.studentId,
                              });
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-700 hover:border-rose-500/40 transition"
                            title="حذف تسجيل التيليجرام وفك الربط"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB-TAB 3: DIRECT MESSAGING & MEDIA DISPATCH CENTER */}
      {subTab === 'direct_messages' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-xl"
        >
          <div className="border-b border-slate-800 pb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              <span>مركز إرسال الرسائل المباشرة والوسائط (Direct Messaging & Media Center)</span>
            </h4>
            <p className="text-xs text-slate-400">
              إرسال رسائل خاصة أو جماعية مع إمكانية إرفاق روابط صور، فيديوهات، أو تسجيلات صوتية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Configuration Form */}
            <div className="md:col-span-2 space-y-4">
              {/* Target Picker */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  🎯 اختر المستلم المستهدف للرسالة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetType('admin_channel')}
                    className={`p-3 rounded-xl text-xs font-bold text-right border transition flex items-center gap-2 ${
                      targetType === 'admin_channel'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>🏛️ القناة / المجموعة الإدارية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('all_students')}
                    className={`p-3 rounded-xl text-xs font-bold text-right border transition flex items-center gap-2 ${
                      targetType === 'all_students'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>👥 جميع الطلاب المسجلين (تعميم)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('all_teachers')}
                    className={`p-3 rounded-xl text-xs font-bold text-right border transition flex items-center gap-2 ${
                      targetType === 'all_teachers'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>👨‍🏫 جميع الأساتذة والمعلمين</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('specific_student')}
                    className={`p-3 rounded-xl text-xs font-bold text-right border transition flex items-center gap-2 ${
                      targetType === 'specific_student'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>🎓 طالب محدد...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('specific_teacher')}
                    className={`p-3 rounded-xl text-xs font-bold text-right border transition flex items-center gap-2 ${
                      targetType === 'specific_teacher'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>👨‍🏫 معلم محدد...</span>
                  </button>
                </div>

                {/* Specific Student Selector */}
                {targetType === 'specific_student' && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">حدد الطالب المراد مراسلته:</label>
                    <select
                      value={selectedTargetStudentId}
                      onChange={(e) => setSelectedTargetStudentId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">-- اختر الطالب --</option>
                      {allSchedules.map((s) => (
                        <option key={s.studentId} value={s.studentId}>
                          {s.studentName || s.studentId} ({s.telegramChatId ? '🟢 متصل' : '⚪ غير مربوط'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specific Teacher Selector */}
                {targetType === 'specific_teacher' && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">حدد المعلم المراد مراسلته:</label>
                    <select
                      value={selectedTargetTeacherId}
                      onChange={(e) => setSelectedTargetTeacherId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">-- اختر المعلم --</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">نص الرسالة:</label>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>إدراج متغير:</span>
                    <button
                      type="button"
                      onClick={() => setDirectMessageText((prev) => prev + ' {{اسم_الطالب}} ')}
                      className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-amber-300"
                    >
                      اسم الطالب
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirectMessageText((prev) => prev + ' {{الوقت}} ')}
                      className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-indigo-300"
                    >
                      الوقت
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder="اكتب نص الرسالة هنا..."
                  value={directMessageText}
                  onChange={(e) => setDirectMessageText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl text-xs focus:border-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Media Attachment Row */}
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  📎 إرفاق وسائط (صورة / فيديو / صوت):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'none', label: 'بدون مرفق', icon: null },
                    { id: 'photo', label: 'صورة (Photo)', icon: Image },
                    { id: 'video', label: 'فيديو (Video)', icon: Video },
                    { id: 'audio', label: 'صوت (Audio)', icon: Mic },
                    { id: 'document', label: 'مستند (PDF)', icon: FileCode },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMediaType(m.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                          mediaType === m.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {mediaType !== 'none' && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      رابط الملف المرفق (Direct URL or Google Drive link):
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.png أو رابط وسائط..."
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleSendDirectMessage}
                disabled={sendingDirect || !directMessageText.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black py-3 px-6 rounded-xl text-sm shadow-xl shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingDirect ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>🚀 إرسال الرسالة الآن عبر تليجرام</span>
              </button>

              {directSendLog && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold ${
                    directSendLog.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : directSendLog.type === 'error'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {directSendLog.text}
                </div>
              )}
            </div>

            {/* Right: Live Preview Box */}
            <div className="space-y-3">
              <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>معاينة حية لشكل الرسالة على تيليجرام:</span>
                </div>
                <div className="bg-[#17212b] border border-slate-700/60 rounded-2xl p-4 text-white text-xs font-sans space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-indigo-400">🤖 البوت التعليمي</span>
                    <span>الآن</span>
                  </div>

                  {mediaType !== 'none' && mediaUrl && (
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 p-2 text-center text-[10px] text-slate-400">
                      📎 مرفق: [{mediaType.toUpperCase()}]
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-slate-100 leading-relaxed font-arabic">
                    {directMessageText
                      ? interpolateTelegramTemplate(directMessageText, {
                          studentName: 'أحمد علي',
                          time: '19:00',
                          date: new Date().toLocaleDateString('ar-SA'),
                        })
                      : 'اكتب نص الرسالة في الحقل لمعاينتها هنا...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* SUB-TAB 4: MULTI-LANGUAGE TEMPLATES HUB (MASTER-DETAIL + SEARCH) */}
      {subTab === 'templates' && (() => {
        const activeDef = TEMPLATE_DEFINITIONS.find((t) => t.key === selectedTemplateKey) || TEMPLATE_DEFINITIONS[0];

        const filteredTemplates = TEMPLATE_DEFINITIONS.filter((tpl) => {
          const matchesCategory = templateCategoryFilter === 'all' || tpl.category === templateCategoryFilter;
          if (!matchesCategory) return false;

          if (!templateSearchQuery.trim()) return true;
          const q = templateSearchQuery.trim().toLowerCase();

          const titleMatch = tpl.title.toLowerCase().includes(q);
          const descMatch = tpl.description.toLowerCase().includes(q) || tpl.shortDesc.toLowerCase().includes(q);
          const keyMatch = tpl.key.toLowerCase().includes(q);
          const arTextMatch = (templatesAr[tpl.key] || '').toLowerCase().includes(q);
          const enTextMatch = (templatesEn[tpl.key] || '').toLowerCase().includes(q);
          const thTextMatch = (templatesTh[tpl.key] || '').toLowerCase().includes(q);
          const varMatch = tpl.supportedVars.some((v) => v.tag.toLowerCase().includes(q) || v.label.toLowerCase().includes(q));

          return titleMatch || descMatch || keyMatch || arTextMatch || enTextMatch || thTextMatch || varMatch;
        });

        const categoryCounts = {
          all: TEMPLATE_DEFINITIONS.length,
          registration: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'registration').length,
          attendance: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'attendance').length,
          evaluation: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'evaluation').length,
          security: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'security').length,
          teacher_admin: TEMPLATE_DEFINITIONS.filter((t) => t.category === 'teacher_admin').length,
        };

        const renderTplIcon = (name: string, className = 'w-4 h-4') => {
          switch (name) {
            case 'Sparkles': return <Sparkles className={className} />;
            case 'CheckCircle2': return <CheckCircle2 className={className} />;
            case 'Check': return <Check className={className} />;
            case 'RefreshCw': return <RefreshCw className={className} />;
            case 'AlertCircle': return <AlertCircle className={className} />;
            case 'Shield': return <Shield className={className} />;
            case 'Lock': return <Lock className={className} />;
            case 'BellRing': return <BellRing className={className} />;
            case 'FileText': return <FileText className={className} />;
            case 'UserCheck': return <UserCheck className={className} />;
            case 'Radio': return <Radio className={className} />;
            default: return <FileText className={className} />;
          }
        };

        const handleCopyText = (lang: 'ar' | 'en' | 'th', text: string) => {
          navigator.clipboard.writeText(text);
          setCopiedTemplateLang(lang);
          setTimeout(() => setCopiedTemplateLang(null), 2000);
        };

        const handleSaveTemplates = async () => {
          const updated: AttendanceSettings = {
            ...settings,
            templatesAr: templatesAr,
            templatesEn: templatesEn,
            templatesTh: templatesTh,
            telegramTemplatePreClass: templatesAr.preClass,
            telegramTemplateLogin: templatesAr.login,
            telegramTemplateComplete: templatesAr.complete,
            telegramTemplateAbsent: templatesAr.absent,
            telegramPreClassReminderMinutes: Number(preClassMinutes) || 15,
            telegramLateAlertDelayMinutes: Number(lateDelayMinutes) || 10,
            telegramLateAlertRepeatEnabled: lateRepeatEnabled !== false,
            telegramLateAlertRepeatIntervalMinutes: Number(lateRepeatInterval) || 15,
            telegramLateAlertMaxCount: Number(lateMaxCount) || 2,
            telegramFinalAbsentTiming: finalAbsentTiming || 'end_of_session',
            telegramNotifyTeacherDirectly: notifyTeacherDirectly !== false,
          };
          onUpdateSettings(updated);
          try {
            localStorage.setItem('attendance_settings_cached', JSON.stringify(updated));
          } catch (e) {}
          if (onSaveAll) {
            await onSaveAll(updated);
          }
          setTemplateSavedToast(true);
          setTimeout(() => setTemplateSavedToast(false), 3000);
        };

        const handleUpdateTemplateText = (lang: 'ar' | 'en' | 'th', key: keyof TelegramLanguageTemplates, val: string) => {
          if (lang === 'ar') {
            const next = { ...templatesAr, [key]: val };
            setTemplatesAr(next);
            onUpdateSettings({
              ...settings,
              templatesAr: next,
              telegramTemplatePreClass: next.preClass,
              telegramTemplateLogin: next.login,
              telegramTemplateComplete: next.complete,
              telegramTemplateAbsent: next.absent,
            });
          } else if (lang === 'en') {
            const next = { ...templatesEn, [key]: val };
            setTemplatesEn(next);
            onUpdateSettings({
              ...settings,
              templatesEn: next,
            });
          } else if (lang === 'th') {
            const next = { ...templatesTh, [key]: val };
            setTemplatesTh(next);
            onUpdateSettings({
              ...settings,
              templatesTh: next,
            });
          }
        };

        const handleResetThisTemplate = (key: keyof TelegramLanguageTemplates) => {
          const defaultAr = DEFAULT_TELEGRAM_TEMPLATES_AR[key] || '';
          const defaultEn = DEFAULT_TELEGRAM_TEMPLATES_EN[key] || '';
          const defaultTh = DEFAULT_TELEGRAM_TEMPLATES_TH[key] || '';

          const nextAr = { ...templatesAr, [key]: defaultAr };
          const nextEn = { ...templatesEn, [key]: defaultEn };
          const nextTh = { ...templatesTh, [key]: defaultTh };

          setTemplatesAr(nextAr);
          setTemplatesEn(nextEn);
          setTemplatesTh(nextTh);

          onUpdateSettings({
            ...settings,
            templatesAr: nextAr,
            templatesEn: nextEn,
            templatesTh: nextTh,
            telegramTemplatePreClass: nextAr.preClass,
            telegramTemplateLogin: nextAr.login,
            telegramTemplateComplete: nextAr.complete,
            telegramTemplateAbsent: nextAr.absent,
          });
        };

        const handleResetAll = () => {
          if (!window.confirm('هل أنت متأكد من استعادة كافة القوالب الافتراضية لجميع اللغات الثلاث؟')) return;
          setTemplatesAr(DEFAULT_TELEGRAM_TEMPLATES_AR);
          setTemplatesEn(DEFAULT_TELEGRAM_TEMPLATES_EN);
          setTemplatesTh(DEFAULT_TELEGRAM_TEMPLATES_TH);
          onUpdateSettings({
            ...settings,
            templatesAr: DEFAULT_TELEGRAM_TEMPLATES_AR,
            templatesEn: DEFAULT_TELEGRAM_TEMPLATES_EN,
            templatesTh: DEFAULT_TELEGRAM_TEMPLATES_TH,
            telegramTemplatePreClass: DEFAULT_TELEGRAM_TEMPLATES_AR.preClass,
            telegramTemplateLogin: DEFAULT_TELEGRAM_TEMPLATES_AR.login,
            telegramTemplateComplete: DEFAULT_TELEGRAM_TEMPLATES_AR.complete,
            telegramTemplateAbsent: DEFAULT_TELEGRAM_TEMPLATES_AR.absent,
          });
        };

        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header & Global Actions */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileText className="w-5 h-5" />
                    </span>
                    <h4 className="text-base font-bold text-white">
                      4. محرر قوالب الرسائل ثلاثي اللغات (🇸🇦 AR / 🇬🇧 EN / 🇹🇭 TH)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 pr-9">
                    تحكم مركزي شامل بكافة رسائل التسجيل والبداية، إشعارات الحضور، الإنذارات، والتقارير باللغات الثلاث معاً.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                    title="استعادة النصوص الافتراضية لكافة القوالب"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>استعادة كافة الافتراضيات</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTemplates}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                      templateSavedToast
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {templateSavedToast ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم حفظ القوالب بنجاح ✅</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Bar & Category Filter Row */}
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    placeholder="ابحث في قوالب الرسائل (بالاسم، بالنص، أو بالمتغيرات مثل: اسم_الطالب، رقم_الطالب، الحضور)..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-10 pl-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  {templateSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTemplateSearchQuery('')}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      templateCategoryFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>الكل</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">{categoryCounts.all}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('registration')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      templateCategoryFilter === 'registration'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>📝 رسائل البداية والتسجيل</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">{categoryCounts.registration}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('attendance')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      templateCategoryFilter === 'attendance'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>⏰ إشعارات الحصص والحضور</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">{categoryCounts.attendance}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('evaluation')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      templateCategoryFilter === 'evaluation'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>⭐ بطاقات التقييم</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">{categoryCounts.evaluation}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('security')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      templateCategoryFilter === 'security'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>🛡️ تنبيهات الأمان</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">{categoryCounts.security}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateCategoryFilter('teacher_admin')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      templateCategoryFilter === 'teacher_admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>👨‍🏫 المعلم والإدارة</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">{categoryCounts.teacher_admin}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MASTER-DETAIL WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* MASTER LIST: Template Titles (Right Column) */}
              <div className="lg:col-span-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>قائمة الرسائل ({filteredTemplates.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">انقر للتركيز والتعديل</span>
                </div>

                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <Search className="w-6 h-6 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-400">لا توجد قوالب تطابق البحث</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateSearchQuery('');
                        setTemplateCategoryFilter('all');
                      }}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
                    {filteredTemplates.map((tpl) => {
                      const isSelected = tpl.key === activeDef.key;
                      const arPreview = (templatesAr[tpl.key] || '').replace(/\n+/g, ' ');

                      return (
                        <button
                          key={tpl.key}
                          type="button"
                          onClick={() => setSelectedTemplateKey(tpl.key)}
                          className={`w-full text-right p-3.5 rounded-xl border transition-all relative group flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tpl.categoryBadge}`}>
                              {tpl.categoryLabel}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                <Check className="w-3 h-3" />
                                <span>محدد</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-start gap-2 pt-0.5">
                            <span className={`mt-0.5 p-1 rounded-lg shrink-0 ${isSelected ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-500 bg-slate-800'}`}>
                              {renderTplIcon(tpl.iconName, 'w-3.5 h-3.5')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                {tpl.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {tpl.shortDesc}
                              </p>
                              {arPreview && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 font-mono mt-1 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800/60">
                                  {arPreview}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DETAIL PANEL: 3 Languages Focus Cards (Left Column) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Active Template Context Card */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${activeDef.categoryBadge}`}>
                          {activeDef.categoryLabel}
                        </span>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          {renderTplIcon(activeDef.iconName, 'w-4 h-4 text-indigo-400')}
                          <span>{activeDef.title}</span>
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {activeDef.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResetThisTemplate(activeDef.key)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-rose-300 bg-slate-800/80 hover:bg-rose-950/30 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5 self-start sm:self-center shrink-0"
                      title="استعادة النص الافتراضي لهذا القالب فقط باللغات الثلاث"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>استعادة هذا القالب</span>
                    </button>
                  </div>

                  {/* Supported Dynamic Variables */}
                  {activeDef.supportedVars && activeDef.supportedVars.length > 0 && (
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>المتغيرات المدعومة في هذا القالب (تُستبدل تلقائياً ببيانات الطالب عند الإرسال):</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {activeDef.supportedVars.map((v) => (
                          <div
                            key={v.tag}
                            className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-2.5 py-1 rounded-lg"
                          >
                            <code className="text-xs font-mono font-bold text-amber-300">{v.tag}</code>
                            <span className="text-[10px] text-slate-400">({v.label})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3 SIMULTANEOUS LANGUAGE EDITORS */}
                  <div className="space-y-5 pt-2">
                    {/* 1. ARABIC (🇸🇦) */}
                    <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇸🇦</span>
                          <span className="text-xs font-bold text-emerald-400">النص باللغة العربية (Arabic)</span>
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {(templatesAr[activeDef.key] || '').length} حرف
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeDef.supportedVars.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1">
                              {activeDef.supportedVars.map((v) => (
                                <button
                                  key={v.tag}
                                  type="button"
                                  onClick={() => {
                                    const cur = templatesAr[activeDef.key] || '';
                                    handleUpdateTemplateText('ar', activeDef.key, cur + (cur ? ' ' : '') + v.tag);
                                  }}
                                  className="text-[10px] font-mono bg-slate-900 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded transition"
                                  title={`إدراج ${v.label} في النص العربي`}
                                >
                                  + {v.tag}
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyText('ar', templatesAr[activeDef.key] || '')}
                            className="text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 transition flex items-center gap-1"
                          >
                            {copiedTemplateLang === 'ar' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTemplateLang === 'ar' ? 'تم النسخ' : 'نسخ'}</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={templatesAr[activeDef.key] || ''}
                        onChange={(e) => handleUpdateTemplateText('ar', activeDef.key, e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 text-white p-3 rounded-lg text-xs leading-relaxed focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition font-arabic"
                        placeholder="اكتب نص الرسالة باللغة العربية هنا..."
                      />
                    </div>

                    {/* 2. ENGLISH (🇬🇧) */}
                    <div className="bg-slate-950/80 border border-blue-500/30 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇬🇧</span>
                          <span className="text-xs font-bold text-blue-400">النص باللغة الإنجليزية (English)</span>
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {(templatesEn[activeDef.key] || '').length} chars
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeDef.supportedVars.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1">
                              {activeDef.supportedVars.map((v) => (
                                <button
                                  key={v.tag}
                                  type="button"
                                  onClick={() => {
                                    const cur = templatesEn[activeDef.key] || '';
                                    handleUpdateTemplateText('en', activeDef.key, cur + (cur ? ' ' : '') + v.tag);
                                  }}
                                  className="text-[10px] font-mono bg-slate-900 hover:bg-blue-950/60 text-blue-300 hover:text-blue-200 border border-blue-500/30 px-2 py-0.5 rounded transition"
                                  title={`Insert ${v.label} in English message`}
                                >
                                  + {v.tag}
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyText('en', templatesEn[activeDef.key] || '')}
                            className="text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 transition flex items-center gap-1"
                          >
                            {copiedTemplateLang === 'en' ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTemplateLang === 'en' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        dir="ltr"
                        value={templatesEn[activeDef.key] || ''}
                        onChange={(e) => handleUpdateTemplateText('en', activeDef.key, e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 text-white p-3 rounded-lg text-xs leading-relaxed focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition font-sans text-left"
                        placeholder="Write English message text here..."
                      />
                    </div>

                    {/* 3. THAI (🇹🇭) */}
                    <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇹🇭</span>
                          <span className="text-xs font-bold text-amber-400">النص باللغة التايلاندية (ภาษาไทย - Thai)</span>
                          <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {(templatesTh[activeDef.key] || '').length} ตัวอักษร
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeDef.supportedVars.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1">
                              {activeDef.supportedVars.map((v) => (
                                <button
                                  key={v.tag}
                                  type="button"
                                  onClick={() => {
                                    const cur = templatesTh[activeDef.key] || '';
                                    handleUpdateTemplateText('th', activeDef.key, cur + (cur ? ' ' : '') + v.tag);
                                  }}
                                  className="text-[10px] font-mono bg-slate-900 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded transition"
                                  title={`Insert ${v.label} in Thai message`}
                                >
                                  + {v.tag}
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyText('th', templatesTh[activeDef.key] || '')}
                            className="text-[11px] text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 transition flex items-center gap-1"
                          >
                            {copiedTemplateLang === 'th' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTemplateLang === 'th' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        dir="ltr"
                        value={templatesTh[activeDef.key] || ''}
                        onChange={(e) => handleUpdateTemplateText('th', activeDef.key, e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 text-white p-3 rounded-lg text-xs leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition font-sans text-left"
                        placeholder="พิมพ์ข้อความภาษาไทยที่นี่..."
                      />
                    </div>
                  </div>
                </div>

                {/* LIVE TELEGRAM CHAT SIMULATOR */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-xs font-bold text-white">
                        📱 محاكي ومعاينة حية لشكل الرسالة في تطبيق تيليجرام
                      </h4>
                    </div>

                    {/* Language Switcher for Preview */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setPreviewSimulatorLang('ar')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          previewSimulatorLang === 'ar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🇸🇦 العربية</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSimulatorLang('en')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          previewSimulatorLang === 'en' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🇬🇧 English</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewSimulatorLang('th')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          previewSimulatorLang === 'th' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🇹🇭 ภาษาไทย</span>
                      </button>
                    </div>
                  </div>

                  {/* Telegram Bubble Mockup */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="max-w-md mx-auto bg-[#182533] border border-[#2b3c4e] rounded-2xl rounded-tr-sm p-4 text-xs shadow-lg space-y-3">
                      {/* Bot Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px]">
                            🤖
                          </div>
                          <div>
                            <span className="font-bold text-sky-400 text-xs">
                              {settings.telegramBotUsername ? `@${settings.telegramBotUsername}` : 'البوت التعليمي الذكي'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Bot • المنظومة التعليمية</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">اليوم</span>
                      </div>

                      {/* Rendered Text */}
                      <div
                        dir={previewSimulatorLang === 'ar' ? 'rtl' : 'ltr'}
                        className={`text-slate-100 leading-relaxed whitespace-pre-wrap ${previewSimulatorLang === 'ar' ? 'font-arabic text-right' : 'font-sans text-left'}`}
                      >
                        {(() => {
                          const raw =
                            previewSimulatorLang === 'ar'
                              ? templatesAr[activeDef.key] || DEFAULT_TELEGRAM_TEMPLATES_AR[activeDef.key]
                              : previewSimulatorLang === 'en'
                              ? templatesEn[activeDef.key] || DEFAULT_TELEGRAM_TEMPLATES_EN[activeDef.key]
                              : templatesTh[activeDef.key] || DEFAULT_TELEGRAM_TEMPLATES_TH[activeDef.key];

                          return interpolateTelegramTemplate(raw, activeDef.sampleVars);
                        })()}
                      </div>

                      {/* Interactive Buttons Simulation if applicable */}
                      {(activeDef.key === 'idVerifiedPrompt' || activeDef.key === 'linkedStudentPrompt') && (
                        <div className="pt-2 border-t border-slate-700/40 space-y-1">
                          <p className="text-[10px] text-slate-400 text-center font-sans">
                            [الأزرار التفاعلية المرفقة أسفل الرسالة]:
                          </p>
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            <button type="button" className="bg-[#242f3d] hover:bg-[#2e3b4d] text-sky-300 py-1.5 rounded text-[11px] font-bold border border-slate-700 text-center">
                              🇸🇦 العربية
                            </button>
                            <button type="button" className="bg-[#242f3d] hover:bg-[#2e3b4d] text-sky-300 py-1.5 rounded text-[11px] font-bold border border-slate-700 text-center">
                              🇬🇧 English
                            </button>
                            <button type="button" className="bg-[#242f3d] hover:bg-[#2e3b4d] text-sky-300 py-1.5 rounded text-[11px] font-bold border border-slate-700 text-center">
                              🇹🇭 ภาษาไทย
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Footer Time & Checks */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                        <span>19:00</span>
                        <span className="text-sky-400 font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* SUB-TAB 6: INTERACTIVE BOT COMMANDS & DETAILS MENU */}
      {subTab === 'bot_commands' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-xl"
        >
          {/* Header & Quick Action Bar */}
          <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>6. صيغ وقواعد الاستعلامات التفاعلية وأزرار التفاصيل (Bot Commands & Details Menu)</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تخصيص ردود البوت التلقائية ونصوص الأزرار التفاعلية باللغات الثلاث (العربية 🇸🇦 / الإنجليزية 🇬🇧 / التايلاندية 🇹🇭) لتسهيل التعديل مع دعم المتغيرات الحية الذكية.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {botCommandsSavedToast && (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fadeIn shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>✅ تم الحفظ بنجاح!</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من استعادة كافة نصوص الأزرار والردود الافتراضية للاستعلامات التفاعلية؟')) {
                    setBotCommands([...DEFAULT_TELEGRAM_BOT_COMMANDS]);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="استعادة النصوص الافتراضية المعتمدة لجميع الأزرار والردود"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>استعادة الافتراضي</span>
              </button>

              <button
                type="button"
                onClick={handleSaveBotCommands}
                disabled={isSaving}
                className={`${
                  botCommandsSavedToast
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                } px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-50`}
              >
                {botCommandsSavedToast ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>تم الحفظ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                    <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ صيغ وأزرار الاستعلامات'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Info & Link-to-Button Guide Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-200">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">💡 عمل الاستعلامات التفاعلية والردود:</span>
                <p>
                  عندما يرسل الطالب كلمة (<strong>تفاصيل</strong>) أو (<strong>/menu</strong>) أو يضغط على أي زر، يرسل البوت التقرير المخصص أدناه بلغته المفضلة مع استبدال المتغيرات الحية مثل <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">{"{{اسم_الطالب}}"}</code> تلقائياً.
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-200">
              <Link className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block">🔗 ميزة تحويل الروابط إلى أزرار تلقائياً (Link to Button):</span>
                <p className="leading-relaxed">
                  يمكنك وضع أي رابط في أي مربع نص (سواء رابط مباشر مثل <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono">https://zoom.us/...</code> أو بصيغة زر <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono">[اسم الزر](https://...)</code>).
                  <strong className="text-white block mt-1">✨ سيقوم البوت تلقائياً بإخفاء الرابط من نص الرسالة وإضافته كزر أنيق ومباشر ملاصق للرسالة في تيليجرام دون أن يظهر أي رابط مشوه!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Commands List Cards */}
          <div className="space-y-6">
            {botCommands.map((cmd, idx) => (
              <div
                key={cmd.command || cmd.id || idx}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl space-y-4 shadow-md transition"
              >
                {/* Command Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-lg font-mono font-bold text-xs">
                      {cmd.command}
                    </span>
                    <span className="text-sm font-bold text-white">{cmd.description}</span>
                    {cmd.keywords && (
                      <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        الكلمات المفتاحية: {Array.isArray(cmd.keywords) ? cmd.keywords.slice(0, 4).join(', ') : String(cmd.keywords).split(',').slice(0, 4).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCmd = DEFAULT_TELEGRAM_BOT_COMMANDS.find((d) => d.id === cmd.id || d.command === cmd.command);
                        if (defaultCmd) {
                          const updated = [...botCommands];
                          updated[idx] = { ...defaultCmd };
                          setBotCommands(updated);
                          alert(`تم استعادة القالب المعتمد الافتراضي للأمر (${cmd.command}) بنجاح!`);
                        }
                      }}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 font-sans"
                      title="استعادة نص القالب المعتمد الافتراضي لهذا الأمر"
                    >
                      <RotateCcw className="w-3 h-3 text-indigo-400" />
                      <span>استعادة القالب الأصلي</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-400">
                      {cmd.enabled ? 'مُفعّل 🟢' : 'معطل ⚪'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cmd.enabled}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].enabled = e.target.checked;
                          setBotCommands(updated);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Section A: 3-Language Button Labels */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>عنوان الزر في لوحة المفاتيح التفاعلية (Button Labels):</span>
                    </span>
                    <span className="text-[10px] text-slate-400">يظهر النص على الزر بحسب لغة الطالب المحددة</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">🇸🇦 نص الزر بالعربية:</label>
                      <input
                        type="text"
                        value={cmd.buttonTextAr || ''}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].buttonTextAr = e.target.value;
                          setBotCommands(updated);
                        }}
                        placeholder="مثال: 🌟 1. الدروس المكتملة"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">🇬🇧 Button Text (English):</label>
                      <input
                        type="text"
                        value={cmd.buttonTextEn || ''}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].buttonTextEn = e.target.value;
                          setBotCommands(updated);
                        }}
                        placeholder="e.g. 🌟 1. Completed Lessons"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">🇹🇭 ข้อความปุ่ม (Thai):</label>
                      <input
                        type="text"
                        value={cmd.buttonTextTh || ''}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].buttonTextTh = e.target.value;
                          setBotCommands(updated);
                        }}
                        placeholder="e.g. 🌟 1. บทเรียนที่เสร็จสิ้น"
                        className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs font-semibold focus:border-indigo-500 focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: 3-Language Response Templates */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    💬 نص الرد أو التقرير المرسل باللغات الثلاث (Response Templates):
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">🇸🇦 الرد بالعربية:</label>
                      <textarea
                        rows={7}
                        value={cmd.responseAr || ''}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].responseAr = e.target.value;
                          setBotCommands(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">🇬🇧 Response (English):</label>
                      <textarea
                        rows={7}
                        value={cmd.responseEn || ''}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].responseEn = e.target.value;
                          setBotCommands(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none leading-relaxed font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">🇹🇭 คำตอบ (Thai):</label>
                      <textarea
                        rows={7}
                        value={cmd.responseTh || ''}
                        onChange={(e) => {
                          const updated = [...botCommands];
                          updated[idx].responseTh = e.target.value;
                          setBotCommands(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none leading-relaxed font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Supported Dynamic Variables & Link Helpers */}
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      📌 المتغيرات الحية المدعومة وأزرار الروابط (انقر للنسخ أو الإدراج):
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const linkSnippet = '\n\n[🚪 دخول الحصة المباشرة](https://zoom.us/j/123456789)';
                        const updated = [...botCommands];
                        updated[idx].responseAr = (updated[idx].responseAr || '') + linkSnippet;
                        setBotCommands(updated);
                        alert('تمت إضافة زر رابط تجريبي إلى نص الرد بالعربية!');
                      }}
                      className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition"
                      title="إضافة صيغة زر رابط إلى نص الرسالة"
                    >
                      <Link className="w-3 h-3 text-emerald-400" />
                      <span>+ إضافة زر رابط [اسم الزر](الرابط)</span>
                    </button>
                  </div>

                  {cmd.supportedVars && cmd.supportedVars.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cmd.supportedVars.map((v: any, vIdx: number) => {
                        const rawTag = v.tag || (v.key ? `{{${v.key}}}` : `{var_${vIdx}}`);
                        const labelText = v.label || v.labelAr || v.labelEn || v.key || '';
                        return (
                          <button
                            key={v.key || v.tag || vIdx}
                            type="button"
                            onClick={() => {
                              try {
                                navigator.clipboard.writeText(rawTag);
                              } catch (e) {}
                              const updated = [...botCommands];
                              const currentText = updated[idx].responseAr || '';
                              updated[idx].responseAr = currentText ? `${currentText} ${rawTag}` : rawTag;
                              setBotCommands(updated);
                            }}
                            className="bg-slate-950 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/50 text-indigo-300 px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                            title="انقر لنسخ المتغير وإدراجه مباشرة في النص"
                          >
                            <span className="font-bold text-indigo-200">{rawTag}</span>
                            {labelText && <span className="text-slate-400 font-sans text-[10px]">({labelText})</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Persistent Global Save Button at Bottom */}
      <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>يتم حفظ وتحديث كافة قوالب التيليجرام ودليل المعلمين والطلاب في ملف Google Sheets وسجلات النظام.</span>
        </div>
        <button
          onClick={handleSaveAllHub}
          disabled={isSaving}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black px-8 py-3 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'جاري حفظ التغييرات...' : '💾 حفظ كافة إعدادات وبوت وتوزيعات تليجرام'}</span>
        </button>
      </div>

      {/* SHARE / QR / ONE-CLICK REGISTRATION MODAL */}
      {shareModalData && shareModalData.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  shareModalData.type === 'student' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">
                    {shareModalData.type === 'student' ? 'ربط حساب الطالب بنقرة واحدة (One-Click)' : 'ربط حساب المعلم بالبوت'}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    {shareModalData.name} (#{shareModalData.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShareModalData(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Generated Deep Link & QR Preview */}
            {(() => {
              // Deep Link logic:
              // Telegram bot deep link format: https://t.me/<bot_username>?start=<payload>
              const botUsername = (settings.telegramBotUsername || '').replace(/^@/, '').trim();
              const startPayload = `${shareModalData.type}_${shareModalData.id}`;
              const directLink = botUsername ? `https://t.me/${botUsername}?start=${startPayload}` : '';
              const directLinkAr = botUsername ? `https://t.me/${botUsername}?start=${startPayload}_ar` : '';
              const directLinkEn = botUsername ? `https://t.me/${botUsername}?start=${startPayload}_en` : '';
              const directLinkTh = botUsername ? `https://t.me/${botUsername}?start=${startPayload}_th` : '';
              
              const qrImageUrl = directLink
                ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(directLink)}&color=059669`
                : '';

              const broadcastTemplate = directLink
                ? `مرحباً ${shareModalData.name} 🌟،\n\nيرجى تفعيل استلام إشعارات الحضور ومواعيد الحصص والشهادات عبر التيليجرام بنقرة واحدة:\n🔗 رابط التسجيل واختيار اللغة: ${directLink}\n\n🇬🇧 English Link: ${directLinkEn}\n🇹🇭 ลิงก์ภาษาไทย: ${directLinkTh}\n\n(عند فتح الرابط، اضغط على زر Start / ابدأ فقط وسيتم ربط حسابك تلقائياً ✅)`
                : `يرجى ضبط اسم مستخدم البوت أولاً لتوليد الرابط التلقائي.`;

              return (
                <div className="space-y-4 text-xs">
                  {/* Warning if bot username is missing */}
                  {!botUsername ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>يرجى تحديد اسم مستخدم البوت (Bot Username):</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        لإنشاء روابط التسجيل المباشرة بنقرة واحدة، أدخل معرّف البوت (من @BotFather) أو اضغط على فحص الرمز:
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-slate-900 border border-slate-700 text-slate-400 px-3 py-1.5 rounded-xl font-mono flex items-center">@</span>
                        <input
                          type="text"
                          placeholder="مثال: EduAttendSmartBot"
                          onChange={(e) => {
                            const val = e.target.value.replace(/^@/, '').trim();
                            onUpdateSettings({ ...settings, telegramBotUsername: val });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-xl font-mono text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleTestBot}
                          className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
                        >
                          جلب تلقائي
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* QR & Visual Presentation */}
                  {directLink && (
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-md">
                        <img
                          src={qrImageUrl}
                          alt="Telegram Direct Registration QR"
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                      <div className="space-y-1.5 text-right flex-1">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          ✨ تسجيل ذاتي فوري بنقرة واحدة
                        </span>
                        <h6 className="font-bold text-white text-xs">امسح الكود عبر كاميرا الجوال</h6>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          بمجرد مسح الكود أو النقر على الرابط، يفتح تيليجرام على البوت <b className="text-emerald-300 font-mono">@{botUsername}</b> مباشرة، ويكفي الضغط على زر <b className="text-white font-mono">Start / ابدأ</b> ليكتمل التسجيل.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. Direct Clickable Link */}
                  {directLink && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        1️⃣ الرابط المباشر الخاص (Direct Deep-Link):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={directLink}
                          className="flex-1 bg-slate-950 border border-slate-700 text-emerald-300 px-3 py-2 rounded-xl font-mono text-[11px] select-all focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(directLink);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط العام'}</span>
                        </button>
                      </div>

                      {/* Language Specific Fast Links */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-400">روابط لغات محددة مسبقاً:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(directLinkAr);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition"
                        >
                          🇸🇦 عربي مباشر
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(directLinkEn);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition"
                        >
                          🇬🇧 English Direct
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(directLinkTh);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition"
                        >
                          🇹🇭 ไทยตรง
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Ready-to-send WhatsApp / Line Message */}
                  {directLink && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300 block">
                          2️⃣ رسالة جاهزة للإرسال عبر (WhatsApp / LINE / SMS):
                        </label>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(broadcastTemplate);
                            setCopiedBroadcastMsg(true);
                            setTimeout(() => setCopiedBroadcastMsg(false), 2000);
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          {copiedBroadcastMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedBroadcastMsg ? 'تم نسخ الرسالة!' : 'نسخ نص الرسالة بالكامل'}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={4}
                        value={broadcastTemplate}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-300 p-2.5 rounded-xl text-[11px] leading-relaxed select-all focus:outline-none"
                      />
                    </div>
                  )}

                  {/* 3. Real-time Sync & Manual Fallback Section */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">
                        🔄 بعد قيام الطالب بالضغط على الرابط والنقر على (Start):
                      </span>
                      <button
                        type="button"
                        onClick={handleSyncSignups}
                        disabled={syncingSignups || !settings.telegramToken}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingSignups ? 'animate-spin' : ''}`} />
                        <span>{syncingSignups ? 'جاري الفحص...' : 'فحص ومزامنة التسجيل الآن'}</span>
                      </button>
                    </div>

                    {/* Manual Chat ID Fallback & Unlink */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <label className="text-[10px] text-slate-400 block">
                        أو يمكنك تعديل/إدخال معرف الشات يدوياً (Chat ID):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={shareModalData.currentChatId || ''}
                          id="modalManualChatIdInput"
                          placeholder="مثال: 987654321"
                          className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-mono focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('modalManualChatIdInput') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              if (shareModalData.type === 'student') {
                                onUpdateScheduleStudentTelegram(shareModalData.id, input.value.trim());
                              } else {
                                const idx = teachers.findIndex((t) => t.id === shareModalData.id);
                                if (idx >= 0) {
                                  const updated = [...teachers];
                                  updated[idx].telegramChatId = input.value.trim();
                                  setTeachers(updated);
                                  onUpdateSettings({ ...settings, teachers: updated });
                                }
                              }
                              setSyncFeedback('✅ تم حفظ وربط معرّف التيليجرام بنجاح!');
                              setShareModalData(null);
                            } else {
                              alert('يرجى كتابة رقم المعرف أولاً');
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                        >
                          حفظ المعرف
                        </button>
                      </div>

                      {shareModalData.currentChatId && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const sId = shareModalData.id;
                              const sName = shareModalData.name;
                              setShareModalData(null);
                              if (shareModalData.type === 'student') {
                                setDeleteConfirmStudent({ id: sId, name: sName });
                              } else {
                                handleDeleteTeacher(sId, sName);
                              }
                            }}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>إلغاء ربط وحذف تسجيل التيليجرام</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close & Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setShareModalData(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-bold transition"
                    >
                      إغلاق النافذة
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* GENERAL REGISTRATION MODAL (Broadcast to all students with Bot Link + Student ID Instruction) */}
      {showGeneralShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">
                    رابط ومنشور التسجيل العام للطلاب (بالرقم الدراسي)
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    رابط عام موحد يُنشر في المجموعات أو القنوات ليسجل كل طالب برقم حسابه
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGeneralShareModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {(() => {
              const botUsername = (settings.telegramBotUsername || '').replace(/^@/, '').trim();
              const generalBotLink = botUsername ? `https://t.me/${botUsername}` : '';
              const qrImageUrl = generalBotLink
                ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generalBotLink)}&color=059669`
                : '';

              const generalBroadcastMessage = generalBotLink
                ? `📢 السادة أولياء الأمور والطلاب الأعزاء،\n\nيرجى الانضمام وتفعيل استلام إشعارات الحضور ومواعيد الحصص والتقارير المدرسية اليومية عبر التيليجرام 🌟\n\n📌 خطوات الربط والتفعيل في ثوانٍ:\n1️⃣ اضغط على رابط البوت:\n🔗 ${generalBotLink}\n\n2️⃣ اضغط على زر (Start / ابدأ).\n3️⃣ أرسل "الرقم الدراسي للطالب" في رسالة للبوت (مثال: 101).\n\n✅ سيتعرف البوت على الطالب فوراً ويؤكد عملية الربط بنجاح!`
                : `يرجى ضبط اسم مستخدم البوت أولاً لتوليد الرابط العام.`;

              return (
                <div className="space-y-4 text-xs">
                  {/* Warning if bot username is missing */}
                  {!botUsername ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>يرجى تحديد اسم مستخدم البوت (Bot Username):</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        لإنشاء الرابط العام للبوت، أدخل معرّف البوت (من @BotFather) أو اضغط على فحص الرمز:
                      </p>
                      <div className="flex gap-2">
                        <span className="bg-slate-900 border border-slate-700 text-slate-400 px-3 py-1.5 rounded-xl font-mono flex items-center">@</span>
                        <input
                          type="text"
                          placeholder="مثال: EduAttendSmartBot"
                          onChange={(e) => {
                            const val = e.target.value.replace(/^@/, '').trim();
                            onUpdateSettings({ ...settings, telegramBotUsername: val });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 text-white px-3 py-1.5 rounded-xl font-mono text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleTestBot}
                          className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
                        >
                          جلب تلقائي
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* QR & Visual Presentation */}
                  {generalBotLink && (
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                        <img
                          src={qrImageUrl}
                          alt="Telegram General Bot Registration QR"
                          className="w-24 h-24 object-contain"
                        />
                      </div>
                      <div className="space-y-1 text-right flex-1">
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                          🌟 رابط عام لجميع الطلاب
                        </span>
                        <h6 className="font-bold text-white text-xs">طريقة العمل:</h6>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          يفتح الطالب البوت <b className="text-emerald-300 font-mono">@{botUsername}</b> ثم يرسل <b className="text-amber-300 font-bold">رقمه الدراسي المسجل</b> فيتعرف عليه النظام ويربطه لحظياً.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. General Bot Link */}
                  {generalBotLink && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        1️⃣ الرابط العام للبوت (General Link):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generalBotLink}
                          className="flex-1 bg-slate-950 border border-slate-700 text-emerald-300 px-3 py-2 rounded-xl font-mono text-[11px] select-all focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generalBotLink);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Ready-to-send Broadcast Message */}
                  {generalBotLink && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300 block">
                          2️⃣ منشور ورسالة جاهزة للنشر في المجموعات وأولياء الأمور:
                        </label>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generalBroadcastMessage);
                            setCopiedGeneralMsg(true);
                            setTimeout(() => setCopiedGeneralMsg(false), 2000);
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          {copiedGeneralMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedGeneralMsg ? 'تم نسخ المنشور!' : 'نسخ نص المنشور'}</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={6}
                        value={generalBroadcastMessage}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-300 p-2.5 rounded-xl text-[11px] leading-relaxed select-all focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setShowGeneralShareModal(false)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl font-bold transition"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CUSTOM IN-APP DELETE / UNLINK CONFIRMATION DIALOG (Works 100% in all iFrames) */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">تأكيد حذف تسجيل التيليجرام</h4>
                <p className="text-xs text-slate-400">إلغاء ربط الحساب ومسح المعرّف</p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3">
              <p>
                حدد نوع الحذف الذي ترغب به للطالب{' '}
                <span className="font-bold text-white">({deleteConfirmStudent.name})</span>:
              </p>
              
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300 block">1. إلغاء الربط (مع إمكانية إعادة الربط لاحقاً):</span>
                    <span className="text-slate-400 text-[10px]">
                      يمسح معرف التيليجرام الحالي، ويسمح للطالب بالضغط على رابط البوت أو QR للتسجيل من جديد في أي وقت.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-300 block">2. حذف نهائي وحظر إعادة الربط التلقائي:</span>
                    <span className="text-slate-400 text-[10px]">
                      يمسح المعرف ويحظر استلام التحديثات أو إعادة الربط التلقائي من البوت لهذا الطالب.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="order-3 sm:order-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>

              {/* OPTION 1: Soft Unlink (Can Re-Link) */}
              <button
                type="button"
                onClick={async () => {
                  const studentId = deleteConfirmStudent.id;
                  const studentName = deleteConfirmStudent.name;

                  // 1. Advance Telegram update offset so old messages aren't re-read immediately
                  if (settings.telegramToken) {
                    await acknowledgeTelegramUpdates(settings.telegramToken);
                  }

                  // 2. Remove from ignored list if it was there so they CAN re-link in the future
                  ignoredStudentIdsRef.current.delete(String(studentId).trim());
                  try {
                    localStorage.setItem(
                      'telegram_unlinked_students',
                      JSON.stringify(Array.from(ignoredStudentIdsRef.current))
                    );
                  } catch (e) {}

                  // 3. Completely purge student presence records and deduplication keys
                  clearStudentActivePresence(studentId, studentName);
                  try {
                    const todayIso = new Date().toISOString().split('T')[0];
                    localStorage.removeItem(`tg_entry_notified_${studentId}_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_login_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_earlyEntryAllowed_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_earlyExit_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_regularExit_${todayIso}`);
                    localStorage.removeItem(`student_telegram_${studentId}`);
                  } catch (e) {}

                  // 4. Immediately update local state in current component for instant UI refresh
                  setLocalSchedules((prev) =>
                    prev.map((s) => (s.studentId === studentId ? { ...s, telegramChatId: '' } : s))
                  );

                  // 5. Trigger delete/unlink callback to parent
                  if (onDeleteStudentTelegram) {
                    onDeleteStudentTelegram(studentId);
                  } else {
                    const st = allSchedules.find((s) => s.studentId === studentId);
                    onUpdateScheduleStudentTelegram(studentId, '', st?.preferredLanguage, st?.guardianPhone);
                  }

                  setSyncFeedback(`🔄 تم إلغاء ربط تيليجرام للطالب (${studentName}) وتصفية سجلات تواجده - يمكنه إعادة الربط في أي وقت.`);
                  setDeleteConfirmStudent(null);
                }}
                className="order-1 sm:order-2 flex-1 bg-amber-600/90 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إلغاء ربط (يمكن إعادة التسجيل)</span>
              </button>

              {/* OPTION 2: Permanent Block / Hard Delete */}
              <button
                type="button"
                onClick={async () => {
                  const studentId = deleteConfirmStudent.id;
                  const studentName = deleteConfirmStudent.name;

                  // 1. Advance Telegram update offset
                  if (settings.telegramToken) {
                    await acknowledgeTelegramUpdates(settings.telegramToken);
                  }

                  // 2. Add to blocked/ignored set permanently
                  ignoredStudentIdsRef.current.add(String(studentId).trim());
                  try {
                    localStorage.setItem(
                      'telegram_unlinked_students',
                      JSON.stringify(Array.from(ignoredStudentIdsRef.current))
                    );
                  } catch (e) {}

                  // 3. Completely purge student presence records and deduplication keys
                  clearStudentActivePresence(studentId, studentName);
                  try {
                    const todayIso = new Date().toISOString().split('T')[0];
                    localStorage.removeItem(`tg_entry_notified_${studentId}_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_login_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_earlyEntryAllowed_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_earlyExit_${todayIso}`);
                    localStorage.removeItem(`tg_event_dispatched_${studentId}_regularExit_${todayIso}`);
                    localStorage.removeItem(`student_telegram_${studentId}`);
                  } catch (e) {}

                  // 4. Immediately update local state
                  setLocalSchedules((prev) =>
                    prev.map((s) => (s.studentId === studentId ? { ...s, telegramChatId: '' } : s))
                  );

                  // 5. Trigger delete callback
                  if (onDeleteStudentTelegram) {
                    onDeleteStudentTelegram(studentId);
                  } else {
                    const st = allSchedules.find((s) => s.studentId === studentId);
                    onUpdateScheduleStudentTelegram(studentId, '', st?.preferredLanguage, st?.guardianPhone);
                  }

                  setSyncFeedback(`⛔ تم الحذف النهائي وتصفية السجلات وحظر الربط التلقائي للطالب (${studentName}).`);
                  setDeleteConfirmStudent(null);
                }}
                className="order-2 sm:order-3 flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف نهائي (حظر الربط)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
