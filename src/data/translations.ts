/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ar' | 'en' | 'th';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'الإنجليزية', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'th', name: 'التايلاندية', nativeName: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
];

export interface TranslationDictionary {
  [section: string]: {
    [key: string]: {
      ar: string;
      en: string;
      th: string;
    };
  };
}

export const defaultTranslations: TranslationDictionary = {
  common: {
    appName: {
      ar: 'منصة الضاد التعليمية',
      en: 'Al-Dhad Educational Platform',
      th: 'แพลตฟอร์มการศึกษาอัล-ฎอด',
    },
    welcome: {
      ar: 'مرحباً بك',
      en: 'Welcome',
      th: 'ยินดีต้อนรับ',
    },
    back: {
      ar: 'رجوع',
      en: 'Back',
      th: 'ย้อนกลับ',
    },
    home: {
      ar: 'الرئيسية',
      en: 'Home',
      th: 'หน้าหลัก',
    },
    save: {
      ar: 'حفظ',
      en: 'Save',
      th: 'บันทึก',
    },
    cancel: {
      ar: 'إلغاء',
      en: 'Cancel',
      th: 'ยกเลิก',
    },
    close: {
      ar: 'إغلاق',
      en: 'Close',
      th: 'ปิด',
    },
    loading: {
      ar: 'جاري التحميل...',
      en: 'Loading...',
      th: 'กำลังโหลด...',
    },
    error: {
      ar: 'حدث خطأ',
      en: 'An error occurred',
      th: 'เกิดข้อผิดพลาด',
    },
    success: {
      ar: 'تم بنجاح',
      en: 'Successful',
      th: 'สำเร็จแล้ว',
    },
    search: {
      ar: 'بحث...',
      en: 'Search...',
      th: 'ค้นหา...',
    },
    login: {
      ar: 'تسجيل الدخول',
      en: 'Login',
      th: 'เข้าสู่ระบบ',
    },
    logout: {
      ar: 'تسجيل الخروج',
      en: 'Logout',
      th: 'ออกจากระบบ',
    },
    admin: {
      ar: 'إدارة المنصة',
      en: 'Admin Panel',
      th: 'ระบบจัดการ',
    },
    language: {
      ar: 'اللغة',
      en: 'Language',
      th: 'ภาษา',
    },
    myGrades: {
      ar: 'درجاتي',
      en: 'My Grades',
      th: 'คะแนนของฉัน',
    },
    info: {
      ar: 'معلومات',
      en: 'Info',
      th: 'ข้อมูล',
    },
    currentStudent: {
      ar: 'الطالب الحالي:',
      en: 'Current Student:',
      th: 'นักเรียนปัจจุบัน:',
    },
    currentAdmin: {
      ar: 'المسؤول الحالي:',
      en: 'Current Admin:',
      th: 'ผู้ดูแลปัจจุบัน:',
    },
    myReportMobile: {
      ar: 'تقريري',
      en: 'My Report',
      th: 'รายงานของฉัน',
    },
  },

  header: {
    studentPortal: {
      ar: 'بوابة الطالب',
      en: 'Student Portal',
      th: 'พอร์ทัลนักเรียน',
    },
    dailyReportBtn: {
      ar: 'التقرير اليومي',
      en: 'Daily Report',
      th: 'รายงานประจำวัน',
    },
    lessonLinks: {
      ar: 'روابط الدروس',
      en: 'Lesson Links',
      th: 'ลิงก์บทเรียน',
    },
    exercises: {
      ar: 'التمارين التفاعلية',
      en: 'Interactive Exercises',
      th: 'แบบฝึกหัดแบบโต้ตอบ',
    },
    switchLanguage: {
      ar: 'تغيير اللغة',
      en: 'Change Language',
      th: 'เปลี่ยนภาษา',
    },
  },

  login: {
    studentPortalTitle: {
      ar: 'بوابة الطالب الذكية',
      en: 'Smart Student Portal',
      th: 'พอร์ทัลนักเรียนอัจฉริยะ',
    },
    adminPortalTitle: {
      ar: 'بوابة المسؤولين والإدارة',
      en: 'Admin & Management Portal',
      th: 'พอร์ทัลผู้ดูแลและระบบ',
    },
    studentSubtitle: {
      ar: 'يرجى تسجيل الدخول للبدء بالتمارين والاطلاع على تقريرك.',
      en: 'Please log in to start exercises and view your report.',
      th: 'กรุณาล็อกอินเพื่อเริ่มทำแบบฝึกหัดและดูรายงานของคุณ',
    },
    adminSubtitle: {
      ar: 'قم بتسجيل الدخول للتحكم في الدروس والأسئلة وحسابات الطلاب.',
      en: 'Log in to manage lessons, questions, and student accounts.',
      th: 'ล็อกอินเพื่อจัดการบทเรียน คำถาม และบัญชีนักเรียน',
    },
    studentLoginTitle: {
      ar: 'تسجيل دخول الطلاب',
      en: 'Student Login',
      th: 'เข้าสู่ระบบสำหรับนักเรียน',
    },
    adminLoginTitle: {
      ar: 'بوابة الإدارة والتحكم',
      en: 'Admin & Control Portal',
      th: 'พอร์ทัลผู้ดูแลและควบคุม',
    },
    studentNameLabel: {
      ar: 'اسم الطالب كاملاً',
      en: 'Full Student Name',
      th: 'ชื่อ-นามสกุลนักเรียน',
    },
    studentNamePlaceholder: {
      ar: 'اسم المستخدم مثل: أحمد محمد',
      en: 'Username e.g.: Ahmed Mohamed',
      th: 'ชื่อผู้ใช้ เช่น: อะห์มัด มูฮัมหมัด',
    },
    studentIdLabel: {
      ar: 'رقم الطالب (كود المرور)',
      en: 'Student Number (Passcode)',
      th: 'รหัสนักเรียน (รหัสผ่าน)',
    },
    studentIdPlaceholder: {
      ar: 'الرقم التعريفي الخاص بك',
      en: 'Your Identification Number',
      th: 'รหัสประจำตัวของคุณ',
    },
    adminUsernameLabel: {
      ar: 'اسم مستخدم الإدارة',
      en: 'Admin Username',
      th: 'ชื่อผู้ใช้ผู้ดูแล',
    },
    adminUsernamePlaceholder: {
      ar: 'اسم مستخدم المدير (مثال: admin)',
      en: 'Admin username (e.g. admin)',
      th: 'ชื่อผู้ใช้ผู้ดูแล (เช่น admin)',
    },
    adminPasswordLabel: {
      ar: 'كلمة مرور المسؤول',
      en: 'Admin Password',
      th: 'รหัสผ่านผู้ดูแล',
    },
    adminPasswordPlaceholder: {
      ar: 'كلمة المرور الخاصة بك',
      en: 'Your password',
      th: 'รหัสผ่านของคุณ',
    },
    scanQrCameraBtn: {
      ar: 'مسح بطاقة الطالب (QR Code) بالكاميرا',
      en: 'Scan Student Card (QR Code) with Camera',
      th: 'สแกนบัตรนักเรียน (QR Code) ด้วยกล้อง',
    },
    loginSubmit: {
      ar: 'تسجيل الدخول',
      en: 'Log In',
      th: 'เข้าสู่ระบบ',
    },
    loggingIn: {
      ar: 'جاري تسجيل الدخول...',
      en: 'Logging in...',
      th: 'กำลังเข้าสู่ระบบ...',
    },
    deviceProtectionActive: {
      ar: 'حماية الأجهزة مفعّلة',
      en: 'Device protection enabled',
      th: 'เปิดใช้งานการปกป้องอุปกรณ์',
    },
    goToStudentExercises: {
      ar: 'الذهاب إلى صفحة تمارين الطلاب ←',
      en: 'Go to Student Exercises page ←',
      th: 'ไปยังหน้าแบบฝึกหัดนักเรียน ←',
    },
    qrReaderTitle: {
      ar: 'قارئ بطاقة الطالب الذكية',
      en: 'Smart Student Card Reader',
      th: 'เครื่องอ่านบัตรนักเรียนอัจฉริยะ',
    },
    qrReaderDesc: {
      ar: 'امسح كود QR الخاص بك للتسجيل التلقائي',
      en: 'Scan your QR code for automatic login',
      th: 'สแกนคิวอาร์โค้ดของคุณเพื่อเข้าสู่ระบบอัตโนมัติ',
    },
    qrInstruction: {
      ar: 'وجه كاميرا جهازك نحو كود QR المكتوب بالصيغة:',
      en: 'Point your camera at the QR code formatted as:',
      th: 'ส่องกล้องไปที่คิวอาร์โค้ดในรูปแบบ:',
    },
    startCameraNow: {
      ar: 'تشغيل الكاميرا الآن',
      en: 'Start Camera Now',
      th: 'เปิดกล้องทันที',
    },
    stopCamera: {
      ar: 'إيقاف الكاميرا',
      en: 'Stop Camera',
      th: 'ปิดกล้อง',
    },
    liveCamera: {
      ar: 'الكاميرا المباشرة',
      en: 'Live Camera',
      th: 'กล้องสด',
    },
    uploadQrImage: {
      ar: 'رفع صورة الـ QR',
      en: 'Upload QR Image',
      th: 'อัปโหลดรูปภาพ QR',
    },
    nameNumberFormat: {
      ar: 'الاسم|الرقم',
      en: 'Name|ID',
      th: 'ชื่อ|รหัส',
    },
    scanQrBtn: {
      ar: 'مسح بطاقة الطالب (QR Code)',
      en: 'Scan Student QR Code',
      th: 'สแกนคิวอาร์โค้ดนักเรียน',
    },
    scanCamera: {
      ar: 'تشغيل الكاميرا',
      en: 'Start Camera',
      th: 'เปิดกล้อง',
    },
    qrSuccess: {
      ar: 'تمت قراءة البيانات بنجاح',
      en: 'Data scanned successfully',
      th: 'สแกนข้อมูลสำเร็จ',
    },
    loginAsAdmin: {
      ar: 'الدخول كمشرف',
      en: 'Login as Admin',
      th: 'เข้าสู่ระบบผู้ดูแล',
    },
    loginAsStudent: {
      ar: 'الدخول كطالب',
      en: 'Login as Student',
      th: 'เข้าสู่ระบบนักเรียน',
    },
  },

  home: {
    welcomeMessage: {
      ar: 'أهلاً بك في منصتك التعليمية',
      en: 'Welcome to your learning platform',
      th: 'ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้ของคุณ',
    },
    welcomeBadge: {
      ar: 'مرحباً بك يا بطل المتميز! 🌟',
      en: 'Welcome distinguished champion! 🌟',
      th: 'ยินดีต้อนรับแชมเปี้ยนผู้โดดเด่น! 🌟',
    },
    welcomeStudent: {
      ar: 'أهلاً بك،',
      en: 'Welcome,',
      th: 'ยินดีต้อนรับ,',
    },
    welcomeDesc: {
      ar: 'استعرض الإعلانات والتوجيهات الخاصة بك، وتدرّب في منصتك الذكية لإتقان مهارات اللغة العربية وقواعد الخط.',
      en: 'Review your announcements and guidelines, and practice on your smart platform to master Arabic language skills and calligraphy rules.',
      th: 'ดูประกาศและคำแนะนำของคุณ และฝึกฝนในแพลตฟอร์มอัจฉริยะเพื่อเชี่ยวชาญทักษะภาษาอาหรับและหลักลายมือเขียน',
    },
    myPerformanceReport: {
      ar: 'تقرير أدائي اليومي 📊',
      en: 'My Daily Performance Report 📊',
      th: 'รายงานผลงานประจำวันของฉัน 📊',
    },
    lessonLinksTitle: {
      ar: 'روابط الدروس التعليمية 📚',
      en: 'Educational Lesson Links 📚',
      th: 'ลิงก์บทเรียนการเรียนรู้ 📚',
    },
    ssoActiveNotice: {
      ar: 'الدخول الموحد مفعّل تلقائياً بالطالب:',
      en: 'Unified Single Sign-On active for:',
      th: 'ระบบเข้าสู่ระบบแบบรวมศูนย์เปิดใช้งานสำหรับ:',
    },
    ssoActiveStudent: {
      ar: 'الدخول الموحد مفعّل تلقائياً بالطالب:',
      en: 'Unified SSO active automatically for student:',
      th: 'การเข้าสู่ระบบแบบรวมศูนย์เปิดใช้งานสำหรับนักเรียน:',
    },
    watchVideoLessonBtn: {
      ar: 'مشاهدة دروس الفيديو',
      en: 'Watch Video Lessons',
      th: 'ดูวิดีโอบทเรียน',
    },
    openDirectLinkBtn: {
      ar: 'فتح الرابط (دخول مباشر)',
      en: 'Open Link (Direct Access)',
      th: 'เปิดลิงก์ (เข้าถึงโดยตรง)',
    },
    viewInPlatformBtn: {
      ar: 'عرض بالمنصة',
      en: 'View in Platform',
      th: 'ดูในแพลตฟอร์ม',
    },
    funExercisesBadge: {
      ar: 'تمارين ممتعة وتفاعلية',
      en: 'Fun & Interactive Exercises',
      th: 'แบบฝึกหัดที่สนุกและโต้ตอบได้',
    },
    lessonExercisesTitle: {
      ar: 'تمارين الدروس 🎮',
      en: 'Lesson Exercises 🎮',
      th: 'แบบฝึกหัดบทเรียน 🎮',
    },
    lessonExercisesDesc: {
      ar: 'تمارين تساعدك على الكتابة من رسم الحروف والكلمات، وتمارين ممتعة تساعد الذاكرة وتثبت المعلومات.',
      en: 'Exercises that help you write letters and words, and fun memory-building activities that reinforce learning.',
      th: 'แบบฝึกหัดที่ช่วยให้คุณเขียนตัวอักษรและคำศัพท์ พร้อมกิจกรรมจำง่ายเพื่อเสริมความรู้',
    },
    startActivitiesBtn: {
      ar: 'استعراض وبدء الأنشطة والتمارين',
      en: 'Explore & Start Activities',
      th: 'เรียกดูและเริ่มทำกิจกรรม',
    },
    importantReminderTitle: {
      ar: 'تذكير هام بالدروس والتمارين 📌',
      en: 'Important Lesson & Exercise Reminder 📌',
      th: 'การแจ้งเตือนสำคัญเกี่ยวกับบทเรียนและแบบฝึกหัด 📌',
    },
    importantReminderDesc: {
      ar: 'تذكير: لديك دروس جديدة ودروس قديمة لم تحل بعد! يمكنك متابعة حالة إنجازك والدروس المتبقية من قسم التقارير.',
      en: 'Reminder: You have new and pending lessons to complete! Check your progress and remaining lessons in the Reports section.',
      th: 'คำเตือน: คุณมีบทเรียนใหม่และบทเรียนเก่าที่ยังไม่ได้ทำ! สามารถติดตามความก้าวหน้าได้ในส่วนรายงาน',
    },
    goToReportsBtn: {
      ar: 'انتقال للتقارير',
      en: 'Go to Reports',
      th: 'ไปยังรายงาน',
    },
    announcementsAndGuidelinesTitle: {
      ar: 'الإعلانات والتعليمات التوجيهية 📢',
      en: 'Announcements & Guidelines 📢',
      th: 'ประกาศและคำแนะนำ 📢',
    },
    photoGalleryTitle: {
      ar: 'معرض الصور (سلايدشو) 🖼️',
      en: 'Photo Gallery (Slideshow) 🖼️',
      th: 'แกลเลอรีรูปภาพ (สไลด์โชว์) 🖼️',
    },
    videoGalleryTitle: {
      ar: 'المقاطع المرئية والتعليمية 🎥',
      en: 'Video & Educational Clips 🎥',
      th: 'วิดีโอและคลิปการเรียนรู้ 🎥',
    },
    fetchingHomeContent: {
      ar: 'جاري جلب المحتوى من ورقة Home_Content...',
      en: 'Fetching content from Home_Content sheet...',
      th: 'กำลังดึงเนื้อหาจากแผ่น Home_Content...',
    },
    externalLinksTitle: {
      ar: 'الروابط والصفحات الخارجية 🔗',
      en: 'External Links & Pages 🔗',
      th: 'ลิงก์และหน้าภายนอก 🔗',
    },
    studentScheduleTitle: {
      ar: 'الجدول والتقييم اليومي للطالب',
      en: 'Daily Schedule & Evaluation',
      th: 'ตารางเรียนและการประเมินประจำวัน',
    },
    openDirectLink: {
      ar: 'فتح الرابط (دخول مباشر)',
      en: 'Open Link (Direct Access)',
      th: 'เปิดลิงก์ (เข้าถึงโดยตรง)',
    },
    openInPlatform: {
      ar: 'عرض بالمنصة',
      en: 'View in Platform',
      th: 'ดูในแพลตฟอร์ม',
    },
    watchVideoLesson: {
      ar: 'مشاهدة الدرس',
      en: 'Watch Lesson',
      th: 'ชมบทเรียน',
    },
    exercisesCardTitle: {
      ar: 'التمارين والأنشطة التفاعلية ✏️',
      en: 'Interactive Exercises & Activities ✏️',
      th: 'แบบฝึกหัดและกิจกรรมแบบโต้ตอบ ✏️',
    },
    exercisesCardDesc: {
      ar: 'ممارسة التوصيل، كتابة الكلمات والخط العربي بكل سهولة',
      en: 'Practice matching, word spelling, and Arabic calligraphy easily',
      th: 'ฝึกการจับคู่ การคัดคำ และลายมือเขียนภาษาอาหรับอย่างง่ายดาย',
    },
    startExerciseBtn: {
      ar: 'بدء التمارين الآن',
      en: 'Start Exercises Now',
      th: 'เริ่มทำแบบฝึกหัดทันที',
    },
    announcementsTitle: {
      ar: 'الإعلانات والتنبيهات 📢',
      en: 'Announcements & Alerts 📢',
      th: 'ประกาศและการแจ้งเตือน 📢',
    },
    instructionsTitle: {
      ar: 'التعليمات والإرشادات 💡',
      en: 'Instructions & Guidelines 💡',
      th: 'คำแนะนำและแนวทางปฏิบัติ 💡',
    },
    publicAnnouncement: {
      ar: 'إعلان عام للجميع',
      en: 'Public Announcement for Everyone',
      th: 'ประกาศสาธารณะสำหรับทุกคน',
    },
    instructionsAndGuidance: {
      ar: 'تعليمات وتوجيهات',
      en: 'Instructions & Guidance',
      th: 'คำแนะนำและแนวทางปฏิบัติ',
    },
    personalizedForYou: {
      ar: 'مخصص لك يا',
      en: 'Dedicated to you,',
      th: 'จัดทำขึ้นเฉพาะสำหรับคุณ',
    },
  },

  exercises: {
    chooseExerciseTypeDesc: {
      ar: 'اختر نوع التمرين المناسب وابدأ في التدرب واكتساب النقاط والشارات!',
      en: 'Choose the suitable exercise type and start practicing to earn points and badges!',
      th: 'เลือกประเภทแบบฝึกหัดที่เหมาะสมและเริ่มฝึกฝนเพื่อสะสมคะแนนและตราสัญลักษณ์!',
    },
    drawingExerciseTitle: {
      ar: 'تمرين محاكاة ورسم الخط',
      en: 'Calligraphy & Drawing Exercise',
      th: 'แบบฝึกหัดเขียนพู่กันและคัดลายมือ',
    },
    drawingExerciseCardDesc: {
      ar: 'لوحة رسم ذكية لمطابقة دقة يدك في كتابة الخطوط العربية المحددة واستخراج الدرجات والمكافآت الفورية.',
      en: 'Smart drawing board to match your hand accuracy in writing selected Arabic scripts with instant scoring and rewards.',
      th: 'กระดานวาดภาพอัจฉริยะเพื่อเทียบความแม่นยำของลายมืออาหรับพร้อมคะแนนและรางวัลทันที',
    },
    openDrawingExercise: {
      ar: 'افتح تمرين رسم الخط',
      en: 'Open Calligraphy Exercise',
      th: 'เปิดแบบฝึกหัดเขียนคัดลายมือ',
    },
    wordsExerciseTitle: {
      ar: 'ترتيب الحروف وملء الفراغات',
      en: 'Letter Ordering & Fill-in-Blanks',
      th: 'การเรียงตัวอักษรและเติมคำในช่องว่าง',
    },
    wordsExerciseCardDesc: {
      ar: 'اجمع الحروف لتكوين الكلمات، رتب الجمل اللغوية المبعثرة، واحلل المسابقات التفاعلية الممتعة.',
      en: 'Combine letters to form words, arrange scrambled sentences, and solve fun interactive quizzes.',
      th: 'รวมตัวอักษรเพื่อสร้างคำ เรียงประโยคที่สลับกัน และแก้ควิซแบบโต้ตอบที่สนุกสนาน',
    },
    openWordsExercise: {
      ar: 'افتح تمارين الكلمات',
      en: 'Open Word Exercises',
      th: 'เปิดแบบฝึกหัดคำศัพท์',
    },
    matchingExerciseTitle: {
      ar: 'تمرين التوصيل والمطابقة',
      en: 'Matching & Connection Exercise',
      th: 'แบบฝึกหัดจับคู่และโยงเส้น',
    },
    matchingExerciseCardDesc: {
      ar: 'ارسم خطوط تواصل تفاعلية جميلة ومطابقة الكلمات اللغوية بنظيرتها الصوتية المسجلة أو الصورة المناسبة.',
      en: 'Draw interactive connection lines to match words with recorded audio or relevant images.',
      th: 'โยงเส้นจับคู่ระหว่างคำศัพท์กับเสียงหรือรูปภาพที่เกี่ยวข้อง',
    },
    openMatchingExercise: {
      ar: 'افتح تمرين التوصيل',
      en: 'Open Matching Exercise',
      th: 'เปิดแบบฝึกหัดจับคู่',
    },

    drawingSectionTitle: {
      ar: 'القسم الأول: محاكاة ورسم الخط',
      en: 'Section 1: Calligraphy Simulation & Drawing',
      th: 'ส่วนที่ 1: การฝึกเขียนพู่กันและคัดลายมือ',
    },
    drawingHeaderTitle: {
      ar: 'تمرين الرسم ومحاكاة الخط العربي ✍️',
      en: 'Arabic Calligraphy Simulation Exercise ✍️',
      th: 'แบบฝึกหัดเขียนพู่กันและลายมือภาษาอาหรับ ✍️',
    },
    drawingHeaderDesc: {
      ar: 'لوحة رسم تفاعلية لقياس دقة كتابة الحروف والكلمات العربية مع تصحيح وتحليل ذكي مباشر للخط.',
      en: 'Interactive drawing board to measure Arabic writing accuracy with smart real-time correction and analysis.',
      th: 'กระดานวาดภาพแบบโต้ตอบเพื่อวัดความแม่นยำในการเขียนตัวอักษรและคำศัพท์ภาษาอาหรับพร้อมการวิเคราะห์อัจฉริยะ',
    },
    switchExerciseBtn: {
      ar: 'تبديل التمرين 🎮',
      en: 'Switch Exercise 🎮',
      th: 'เปลี่ยนแบบฝึกหัด 🎮',
    },
    backToHomeBtn: {
      ar: 'العودة للرئيسية 🏠',
      en: 'Back to Home 🏠',
      th: 'กลับสู่หน้าหลัก 🏠',
    },
    filterDrawingLessonsTitle: {
      ar: 'تصفية قائمة دروس الخط',
      en: 'Filter Calligraphy Lessons',
      th: 'กรองรายการบทเรียนคัดลายมือ',
    },
    filterLessonsDesc: {
      ar: 'يمكنك إخفاء الدروس التي أتممتها بالكامل للتركيز على الدروس الجديدة، أو إظهارها لمراجعتها وإعادة التدرب.',
      en: 'Hide completed lessons to focus on new ones, or show them for review and practice.',
      th: 'ซ่อนบทเรียนที่ทำเสร็จแล้วเพื่อมุ่งเน้นบทเรียนใหม่ หรือแสดงบทเรียนเพื่อทบทวน',
    },
    showCompletedLessons: {
      ar: 'إظهار الدروس المكتملة 👁️',
      en: 'Show Completed Lessons 👁️',
      th: 'แสดงบทเรียนที่เสร็จสมบูรณ์ 👁️',
    },
    hideCompletedLessons: {
      ar: 'إخفاء الدروس المكتملة 👁️‍🗨️',
      en: 'Hide Completed Lessons 👁️‍🗨️',
      th: 'ซ่อนบทเรียนที่เสร็จสมบูรณ์ 👁️‍🗨️',
    },
    startLessonBtn: {
      ar: 'بدء الدرس والتدريب ✍️',
      en: 'Start Lesson & Practice ✍️',
      th: 'เริ่มบทเรียนและฝึกฝน ✍️',
    },
    openLessonBtn: {
      ar: 'فتح الدرس',
      en: 'Open Lesson',
      th: 'เปิดบทเรียน',
    },

    wordsSectionTitle: {
      ar: 'القسم الثاني: تركيب الكلمات والجمل',
      en: 'Section 2: Word & Sentence Composition',
      th: 'ส่วนที่ 2: การผสมคำและประโยค',
    },
    wordsHeaderTitle: {
      ar: 'تمرين ترتيب الحروف والكلمات 🔤',
      en: 'Letter & Word Ordering Exercise 🔤',
      th: 'แบบฝึกหัดเรียงตัวอักษรและคำศัพท์ 🔤',
    },
    wordsHeaderDesc: {
      ar: 'اختر درساً مناسباً من القائمة أدناه للبدء بحل تمارين تجميع الحروف، ترتيب الجمل والتركيب اللغوي الممتع.',
      en: 'Choose a suitable lesson from the list below to solve letter grouping, sentence ordering, and fun composition exercises.',
      th: 'เลือกบทเรียนที่เหมาะสมเพื่อเริ่มแก้แบบฝึกหัดจัดกลุ่มตัวอักษร การเรียงประโยค และการผสมคำ',
    },
    filterWordsLessonsTitle: {
      ar: 'تصفية قائمة دروس ترتيب الكلمات',
      en: 'Filter Word Ordering Lessons',
      th: 'กรองรายการบทเรียนเรียงคำศัพท์',
    },

    matchingSectionTitle: {
      ar: 'القسم الثالث: المطابقة والتوصيل',
      en: 'Section 3: Matching & Connection',
      th: 'ส่วนที่ 3: การจับคู่และโยงเส้น',
    },
    matchingHeaderTitle: {
      ar: 'تمارين التوصيل والمطابقة الذكية 🔗',
      en: 'Smart Matching & Connection Exercises 🔗',
      th: 'แบบฝึกหัดจับคู่และโยงเส้นอัจฉริยะ 🔗',
    },
    matchingHeaderDesc: {
      ar: 'اختر أحد الدروس المخصصة أدناه للبدء بتمرين التوصيل اللغوي الذكي ومطابقة العناصر بالصوت والصورة.',
      en: 'Choose a dedicated lesson below to start smart matching of items with audio and visuals.',
      th: 'เลือกบทเรียนที่กำหนดไว้เพื่อเริ่มการจับคู่อัจฉริยะด้วยเสียงและรูปภาพ',
    },
    filterMatchingLessonsTitle: {
      ar: 'تصفية قائمة دروس التوصيل',
      en: 'Filter Matching Lessons',
      th: 'กรองรายการบทเรียนจับคู่',
    },
    currentExerciseBadge: {
      ar: 'الحالي',
      en: 'Current',
      th: 'ปัจจุบัน',
    },
    youAreInThisExercise: {
      ar: 'أنت في هذا التمرين حالياً',
      en: 'You are currently in this exercise',
      th: 'คุณอยู่ในแบบฝึกหัดนี้ในปัจจุบัน',
    },
    interactiveExercisesPortal: {
      ar: 'بوابة التمارين اللغوية والألعاب التفاعلية 🎮',
      en: 'Language Exercises & Interactive Games Portal 🎮',
      th: 'พอร์ทัลแบบฝึกหัดภาษาและเกมแบบโต้ตอบ 🎮',
    },
    interactiveExercisesPortalDesc: {
      ar: 'اختر نوع التمرين أو اللعبة التفاعلية المناسبة وابدأ في تحدي نفسك للحصول على العلامة الكاملة.',
      en: 'Choose the suitable exercise or interactive game and challenge yourself for a full score.',
      th: 'เลือกแบบฝึกหัดหรือเกมแบบโต้ตอบที่เหมาะสมเพื่อท้าทายตัวเองและทำคะแนนเต็ม',
    },
    selectExerciseType: {
      ar: 'اختر نوع التمرين التفاعلي',
      en: 'Select Interactive Exercise Type',
      th: 'เลือกประเภทแบบฝึกหัดโต้ตอบ',
    },
    wordsExercise: {
      ar: 'تمرين ترتيب وتعبئة الكلمات',
      en: 'Word Ordering & Completion',
      th: 'การจัดเรียงและการเติมคำ',
    },
    wordsExerciseDesc: {
      ar: 'ترتيب الحروف أو تعبئة الفراغ لإكمال الكلمة الصحيحة',
      en: 'Arrange letters or fill gaps to complete correct words',
      th: 'เรียงตัวอักษรหรือเติมคำในช่องว่างให้ถูกต้อง',
    },
    matchingExercise: {
      ar: 'تمرين التوصيل بالخطوط',
      en: 'Line Matching Exercise',
      th: 'แบบฝึกหัดโยงเส้นจับคู่',
    },
    matchingExerciseDesc: {
      ar: 'توصيل العناصر بالخطوط الملونة بين القائمة اليمنى واليسرى',
      en: 'Connect right and left items using colored lines',
      th: 'โยงเส้นจับคู่ระหว่างรายการซ้ายและขวาด้วยเส้นสี',
    },
    drawingExercise: {
      ar: 'تمرين الرسم والخط العربي',
      en: 'Calligraphy & Drawing Exercise',
      th: 'แบบฝึกหัดเขียนพู่กันและวาดภาพ',
    },
    drawingExerciseDesc: {
      ar: 'ممارسة الرسم والكتابة التفاعلية فوق القوالب المحددة',
      en: 'Interactive calligraphy practice on predefined templates',
      th: 'ฝึกเขียนลายมืออาหรับบนเทมเพลตที่กำหนด',
    },
    checkAnswer: {
      ar: 'تحقق من الإجابة',
      en: 'Check Answer',
      th: 'ตรวจคำตอบ',
    },
    nextQuestion: {
      ar: 'السؤال التالي',
      en: 'Next Question',
      th: 'คำถามถัดไป',
    },
    prevQuestion: {
      ar: 'السؤال السابق',
      en: 'Previous Question',
      th: 'คำถามก่อนหน้า',
    },
    retryExercise: {
      ar: 'إعادة المحاولة',
      en: 'Retry Exercise',
      th: 'ลองใหม่อีกครั้ง',
    },
    clearCanvas: {
      ar: 'مسح اللوحة',
      en: 'Clear Canvas',
      th: 'ล้างกระดาน',
    },
    undoLine: {
      ar: 'تراجع عن آخر خط',
      en: 'Undo Last Line',
      th: 'เลิกทำเส้นล่าสุด',
    },
    finalResult: {
      ar: 'النتيجة النهائية',
      en: 'Final Result',
      th: 'ผลลัพธ์สุดท้าย',
    },
    score: {
      ar: 'الدرجة',
      en: 'Score',
      th: 'คะแนน',
    },
    excellentJob: {
      ar: 'أحسنت! إجابة ممتازة 🎉',
      en: 'Great job! Excellent answer 🎉',
      th: 'เก่งมาก! คำตอบยอดเยี่ยม 🎉',
    },
    tryAgain: {
      ar: 'حاول مرة أخرى 😃',
      en: 'Try again 😃',
      th: 'ลองใหม่อีกครั้ง 😃',
    },
    reviewAndRedraw: {
      ar: 'مراجعة وإعادة الرسم 🔄',
      en: 'Review & Redraw 🔄',
      th: 'ทบทวนและวาดใหม่ 🔄',
    },
    loadingCalligraphyCanvas: {
      ar: 'جاري تحميل لوحة محاكاة الخط العربي...',
      en: 'Loading Arabic calligraphy canvas...',
      th: 'กำลังโหลดผืนผ้าใบจำลองการเขียนพู่กันอาหรับ...',
    },
    resetLessonError: {
      ar: 'حدث خطأ أثناء إعادة تهيئة الدرس، يرجى المحاولة مجدداً يا بطل.',
      en: 'An error occurred while resetting the lesson, please try again hero.',
      th: 'เกิดข้อผิดพลาดขณะรีเซ็ตบทเรียน โปรดลองอีกครั้ง',
    },
    timeExpiredMsg: {
      ar: 'انتهى الوقت المسموح به لهذا التمرين يا بطل!',
      en: 'Allowed time for this exercise has expired, hero!',
      th: 'หมดเวลาสำหรับแบบฝึกหัดนี้แล้ว!',
    },
    timeExpiredTitle: {
      ar: 'انتهى الوقت',
      en: 'Time Expired',
      th: 'หมดเวลา',
    },
    stepFailedTimeout: {
      ar: 'خطوة {step}: فشل 0% (انتهى الوقت)',
      en: 'Step {step}: Failed 0% (Time Expired)',
      th: 'ขั้นตอนที่ {step}: ล้มเหลว 0% (หมดเวลา)',
    },
    repFailedTimeout: {
      ar: 'التكرار {rep}: فشل 0% (انتهى الوقت)',
      en: 'Repetition {rep}: Failed 0% (Time Expired)',
      th: 'การซ้ำที่ {rep}: ล้มเหลว 0% (หมดเวลา)',
    },
    failedTimeoutStr: {
      ar: 'فشل 0% (انتهى الوقت)',
      en: 'Failed 0% (Time Expired)',
      th: 'ล้มเหลว 0% (หมดเวลา)',
    },
    stepPassedStr: {
      ar: 'خطوة {step}: نجح {pct}%',
      en: 'Step {step}: Passed {pct}%',
      th: 'ขั้นตอนที่ {step}: ผ่าน {pct}%',
    },
    repPassedStr: {
      ar: 'التكرار {rep}: نجح {pct}%',
      en: 'Repetition {rep}: Passed {pct}%',
      th: 'การซ้ำที่ {rep}: ผ่าน {pct}%',
    },
    passedPctStr: {
      ar: 'نجح {pct}%',
      en: 'Passed {pct}%',
      th: 'ผ่าน {pct}%',
    },
    startFromGreenDot: {
      ar: 'ابدأ من النقطة الخضراء يا بطل! 🟢',
      en: 'Start from the green dot, hero! 🟢',
      th: 'เริ่มจากจุดสีเขียว! 🟢',
    },
    directionWarningTitle: {
      ar: 'تنبيه الاتجاه',
      en: 'Direction Warning',
      th: 'แจ้งเตือนทิศทาง',
    },
    overshotRedDot: {
      ar: 'لقد تجاوزت النقطة الحمراء يا بطل! حاول التوقف عندها تماماً 🔴',
      en: 'You overshot the red dot, hero! Try stopping right at it 🔴',
      th: 'คุณเลยจุดสีแดงไปแล้ว! พยายามหยุดที่จุดนั้นพอดี 🔴',
    },
    overshotTitle: {
      ar: 'تجاوز النقطة',
      en: 'Overshot Point',
      th: 'เลยจุดกำหนด',
    },
    wrongPathWarning: {
      ar: 'انتبه لمسار الرسم والاتجاه الصحيح! تتبع النموذج بدقة واصل إلى النقطة الحمراء 🔴',
      en: 'Pay attention to the drawing path! Follow the template carefully to the red dot 🔴',
      th: 'สังเกตเส้นทางลากเส้น! ทำตามแม่แบบอย่างระมัดระวังไปยังจุดสีแดง 🔴',
    },
    wrongPathTitle: {
      ar: 'مسار خاطئ',
      en: 'Wrong Path',
      th: 'เส้นทางไม่ถูกต้อง',
    },
    startHereGuide: {
      ar: 'ابدأ من هنا 🟢',
      en: 'Start here 🟢',
      th: 'เริ่มตรงนี้ 🟢',
    },
    endHereGuide: {
      ar: 'انتهِ هنا 🔴',
      en: 'End here 🔴',
      th: 'สิ้นสุดตรงนี้ 🔴',
    },
    maxRestartsExceeded: {
      ar: 'لقد استنفدت الحد الأقصى لمحاولات إعادة الرسم المسموح بها في هذا التمرين!',
      en: 'You have reached the maximum redraw attempts allowed for this exercise!',
      th: 'คุณใช้โควตารีเซ็ตวาดใหม่ครบกำหนดแล้ว!',
    },
    warningTitle: {
      ar: 'تنبيه',
      en: 'Warning',
      th: 'คำเตือน',
    },
    warningHeroTitle: {
      ar: 'تنبيه يا بطل! ⚠️',
      en: 'Warning, Hero! ⚠️',
      th: 'คำเตือน! ⚠️',
    },
    pleaseDrawFirst: {
      ar: 'يرجى رسم الحرف أولاً يا بطل!',
      en: 'Please draw the character first, hero!',
      th: 'โปรดวาดตัวอักษรก่อน!',
    },
    stopAtRedDot: {
      ar: 'توقف عند النقطة الحمراء تماماً يا بطل! 🔴',
      en: 'Stop right at the red dot, hero! 🔴',
      th: 'หยุดที่จุดสีแดงพอดี! 🔴',
    },
    maxCancelsExceeded: {
      ar: 'لقد استنفدت الحد الأقصى لمحاولات إلغاء الرسم!',
      en: 'You have reached the maximum cancel attempts allowed!',
      th: 'คุณใช้โควตายกเลิกการวาดครบกำหนดแล้ว!',
    },
    watermarkStudentLabel: {
      ar: 'الطالب',
      en: 'Student',
      th: 'นักเรียน',
    },
    watermarkCalligraphyLabel: {
      ar: 'محاكاة خط',
      en: 'Calligraphy',
      th: 'การเขียนพู่กัน',
    },
    watermarkAccuracyLabel: {
      ar: 'دقة الأداء',
      en: 'Accuracy',
      th: 'ความแม่นยำ',
    },
    saveSuccessMsg: {
      ar: 'عظيم جداً يا بطل! تم حفظ أداء التمرين بنجاح بنسبة دقة {pct}%!',
      en: 'Great job, hero! Exercise performance saved successfully with {pct}% accuracy!',
      th: 'ยอดเยี่ยมมาก! บันทึกผลงานสำเร็จด้วยความแม่นยำ {pct}%',
    },
    saveSuccessTitle: {
      ar: 'تم الحفظ بنجاح',
      en: 'Saved Successfully',
      th: 'บันทึกสำเร็จ',
    },
    allModelsCompletedMsg: {
      ar: 'تهانينا الكبيرة! لقد أتممت جميع نماذج الخط في هذا الدرس 🎉',
      en: 'Huge congratulations! You completed all calligraphy models in this lesson 🎉',
      th: 'ยินดีด้วย! คุณทำแบบฝึกหัดเขียนพู่กันครบทุกแบบในบทเรียนนี้แล้ว 🎉',
    },
    greatAchievementTitle: {
      ar: 'إنجاز رائع',
      en: 'Great Achievement',
      th: 'ความสำเร็จที่ยิ่งใหญ่',
    },
    saveErrorMsg: {
      ar: 'تعذر حفظ أدائك: {err}',
      en: 'Could not save performance: {err}',
      th: 'ไม่สามารถบันทึกผลงาน: {err}',
    },
    saveErrorTitle: {
      ar: 'خطأ في الحفظ',
      en: 'Save Error',
      th: 'ข้อผิดพลาดในการบันทึก',
    },
    modelsProgress: {
      ar: 'تم إنجاز {completed} من أصل {total} نموذج للرسم والخط ({pct}%)',
      en: 'Completed {completed} of {total} drawing models ({pct}%)',
      th: 'ทำสำเร็จแล้ว {completed} จาก {total} รูปแบบ ({pct}%)',
    },
    initializing: {
      ar: 'جاري التهيئة...',
      en: 'Initializing...',
      th: 'กำลังเริ่มต้น...',
    },
    noLessonsMatchingFilter: {
      ar: 'لا توجد دروس متوفرة مطابقة لخيار التصفية',
      en: 'No lessons available matching the current filter',
      th: 'ไม่มีบทเรียนที่ตรงกับตัวกรอง',
    },
    drawingSimulation: {
      ar: 'تمرين محاكاة الرسم',
      en: 'Drawing Simulation Exercise',
      th: 'แบบฝึกหัดจำลองการวาด',
    },
    modelLabel: {
      ar: 'نموذج:',
      en: 'Model:',
      th: 'รูปแบบ:',
    },
    stepLabel: {
      ar: 'الخطوة:',
      en: 'Step:',
      th: 'ขั้นตอน:',
    },
    lessonsListBtn: {
      ar: 'قائمة الدروس 📁',
      en: 'Lessons List 📁',
      th: 'รายการบทเรียน 📁',
    },
    lessonContains: {
      ar: 'هذا الدرس فيه ({total}) وقد تم ({completed})',
      en: 'This lesson has ({total}) models, completed ({completed})',
      th: 'บทเรียนนี้มี ({total}) รูปแบบ ทำเสร็จแล้ว ({completed})',
    },
    penToolsTitle: {
      ar: 'أدوات وتخصيص قلم الرسم',
      en: 'Drawing Pen Tools & Customization',
      th: 'เครื่องมือและปรับแต่งพู่กันวาด',
    },
    repetitionLabel: {
      ar: 'التكرار:',
      en: 'Repetition:',
      th: 'การซ้ำ:',
    },
    penTypeLabel: {
      ar: 'نوع القلم',
      en: 'Pen Type',
      th: 'ประเภทพู่กัน',
    },
    penRound: {
      ar: 'دائري',
      en: 'Round',
      th: 'หัวกลม',
    },
    penChisel: {
      ar: 'مائل',
      en: 'Chisel',
      th: 'หัวตัด/ตัดเฉียง',
    },
    quickActionsLabel: {
      ar: 'إجراءات سريعة',
      en: 'Quick Actions',
      th: 'การดำเนินการด่วน',
    },
    undoStepTitle: {
      ar: 'تراجع خطوة',
      en: 'Undo step',
      th: 'เลิกทำขั้นตอน',
    },
    strokeThickness: {
      ar: 'سمك الخط',
      en: 'Line Thickness',
      th: 'ความหนาของเส้น',
    },
    penAngle: {
      ar: 'زاوية ميل القلم',
      en: 'Pen Angle',
      th: 'มุมพู่กัน',
    },
    penSizeLockedMsg: {
      ar: '* تم قفل السمك ({size}px) لتناسب هذا النموذج.',
      en: '* Thickness locked ({size}px) to fit this model.',
      th: '* ล็อกความหนาไว้ที่ ({size}px) เพื่อความเหมาะสม',
    },
    challengeDesc: {
      ar: 'تحدي تكرار رسم النموذج لـ {reps} مرات متتالية بنسبة دقة لا تقل عن {pct}%.',
      en: 'Repeat drawing model challenge for {reps} consecutive times with at least {pct}% accuracy.',
      th: 'ท้าทายวาดซ้ำ {reps} ครั้งติดต่อกัน ด้วยความแม่นยำไม่ต่ำกว่า {pct}%',
    },
    stepByStepDesc: {
      ar: 'محاكاة رسم النموذج خطوة بخطوة بطريقة صحيحة ومتقنة.',
      en: 'Simulate drawing the model step by step accurately and properly.',
      th: 'จำลองการวาดทีละขั้นตอนอย่างถูกต้องและประณีต',
    },
    startChallengeBtn: {
      ar: 'ابدأ التحدي! 🏆',
      en: 'Start Challenge! 🏆',
      th: 'เริ่มคำท้าทาย! 🏆',
    },
    startExerciseBtn: {
      ar: 'ابدأ التمرين ✍️',
      en: 'Start Exercise ✍️',
      th: 'เริ่มแบบฝึกหัด ✍️',
    },
    backToLessons: {
      ar: 'العودة للدروس 📂',
      en: 'Back to Lessons 📂',
      th: 'กลับสู่รายการบทเรียน 📂',
    },
    checkPerformanceBtn: {
      ar: 'تحقق الأداء ومطابقة الخط',
      en: 'Check Calligraphy & Matching Performance',
      th: 'ตรวจสอบประสิทธิภาพและการเทียบเคียง',
    },
    savingText: {
      ar: 'جاري الحفظ...',
      en: 'Saving...',
      th: 'กำลังบันทึก...',
    },
    greatJobHero: {
      ar: 'عمل رائع يا بطل! 🎉',
      en: 'Great job, hero! 🎉',
      th: 'เก่งมาก! 🎉',
    },
    needMoreAccuracy: {
      ar: 'تحتاج إلى دقة أكثر! 💪',
      en: 'Needs more accuracy! 💪',
      th: 'ต้องการความแม่นยำเพิ่มขึ้น! 💪',
    },
    accuracyAchieved: {
      ar: 'حققت دقة مطابقة بنسبة:',
      en: 'Achieved matching accuracy of:',
      th: 'ทำความแม่นยำได้:',
    },
    requiredAccuracyInfo: {
      ar: 'النسبة المطلوبة للنجاح هي {pct}%',
      en: 'Required percentage for success is {pct}%',
      th: 'เกณฑ์คะแนนที่ต้องการคือ {pct}%',
    },
    noRedrawAllowedTeacher: {
      ar: '⚠️ خيار إعادة محاولة الرسم غير متاح في هذا التمرين بطلب من المعلم. يجب عليك حفظ النتيجة والاستمرار.',
      en: '⚠️ Redraw option is not available in this exercise by teacher\'s request. You must save score and continue.',
      th: '⚠️ ไม่อนุญาตให้ลองใหม่ตามคำสั่งของผู้สอน คุณต้องบันทึกคะแนนและดำเนินการต่อ',
    },
    maxCancelsReachedWarning: {
      ar: '⚠️ لقد استنفدت الحد الأقصى لمحاولات إلغاء الرسم المسموح بها! يجب عليك الاستمرار بالنتيجة الحالية ومتابعة الأداء.',
      en: '⚠️ You have reached the maximum allowed drawing cancel attempts! You must proceed with current result.',
      th: '⚠️ คุณใช้โควตายกเลิกเต็มจำนวนแล้ว คุณต้องดำเนินการต่อด้วยผลลัพธ์ปัจจุบัน',
    },
    closeAndRetryBtn: {
      ar: 'إغلاق والمحاولة مجدداً',
      en: 'Close & Retry',
      th: 'ปิดและลองใหม่',
    },
    confirmAndContinue: {
      ar: 'موافق والاستمرار 🌟',
      en: 'Confirm & Continue 🌟',
      th: 'ตกลงและดำเนินการต่อ 🌟',
    },
    saveAndContinue: {
      ar: 'حفظ النتيجة والاستمرار ⚠️',
      en: 'Save Result & Continue ⚠️',
      th: 'บันทึกและดำเนินการต่อ ⚠️',
    },
    okBtn: {
      ar: 'موافق 👍',
      en: 'OK 👍',
      th: 'ตกลง 👍',
    },
    savingFullTitle: {
      ar: 'جاري حفظ خطك الجميل... ✍️✨',
      en: 'Saving your beautiful handwriting... ✍️✨',
      th: 'กำลังบันทึกตัวลายมือที่สวยงามของคุณ... ✍️✨',
    },
    savingFullDesc: {
      ar: 'يرجى الانتظار بضع ثوانٍ يا بطل، نقوم الآن بتسجيل أدائك المميز وحفظه في لوحة الإنجازات الخاصة بك.',
      en: 'Please wait a few seconds hero, we are recording your performance into your achievements dashboard.',
      th: 'โปรดรอสักครู่ เรากำลังบันทึกผลงานของคุณลงในกระดานความสำเร็จ',
    },
    doNotTouchScreen: {
      ar: '⚠️ يرجى عدم لمس الشاشة أو الخروج من الصفحة حتى يكتمل الحفظ!',
      en: '⚠️ Please do not touch the screen or leave the page until saving completes!',
      th: '⚠️ โปรดอย่าแตะหน้าจอหรือออกจากหน้านี้จนกว่าจะบันทึกเสร็จสิ้น!',
    },
    connectingServerSavingImage: {
      ar: 'جاري الاتصال بالسيرفر وحفظ الصورة...',
      en: 'Connecting to server and saving image...',
      th: 'กำลังเชื่อมต่อเซิร์ฟเวอร์และบันทึกรูปภาพ...',
    },
    noCalligraphyExercises: {
      ar: 'لا توجد تمارين محاكاة خط مخصصة حالياً',
      en: 'No custom calligraphy exercises available currently',
      th: 'ไม่มีแบบฝึกหัดจำลองการเขียนพู่กันในขณะนี้',
    },
    noCalligraphyExercisesDesc: {
      ar: 'تأكد من إدراج نماذج خط وتفعيل التمارين في جدول البيانات (Questions-R) الخاص بالمعلم.',
      en: 'Make sure calligraphy samples are added and enabled in the teacher\'s spreadsheet (Questions-R).',
      th: 'ตรวจสอบให้แน่ใจว่าได้เพิ่มตัวอย่างอักษรและเปิดใช้งานแบบฝึกหัดในสเปรดชีตครู (Questions-R)',
    },
    loadingTopicsAndLessons: {
      ar: 'جاري تحميل المواضيع والدروس...',
      en: 'Loading topics and lessons...',
      th: 'กำลังโหลดหัวข้อและบทเรียน...',
    },
    completedAndLocked: {
      ar: 'مكتمل ومغلق 🔒',
      en: 'Completed & Locked 🔒',
      th: 'เสร็จสมบูรณ์และล็อก 🔒',
    },
    loadingMatchingExercise: {
      ar: 'جاري تحميل تمرين التوصيل والمطابقة...',
      en: 'Loading matching exercise...',
      th: 'กำลังโหลดแบบฝึกหัดจับคู่...',
    },
    retryBtn: {
      ar: '🔄 إعادة المحاولة',
      en: '🔄 Retry',
      th: '🔄 ลองใหม่อีกครั้ง',
    },
    remaining: {
      ar: 'متبقي',
      en: 'remaining',
      th: 'เหลืออยู่',
    },
    completedBadge: {
      ar: 'مكتمل ✅',
      en: 'Completed ✅',
      th: 'เสร็จสมบูรณ์ ✅',
    },
    ofWord: {
      ar: 'من',
      en: 'of',
      th: 'จาก',
    },
    xOfY: {
      ar: '{answered} من {total}',
      en: '{answered} of {total}',
      th: '{answered} จาก {total}',
    },
    backToLessonsList: {
      ar: 'العودة لقائمة الدروس 📂',
      en: 'Back to Lessons List 📂',
      th: 'กลับสู่รายการบทเรียน 📂',
    },
    loadingImage: {
      ar: 'جاري تحميل الصورة...',
      en: 'Loading image...',
      th: 'กำลังโหลดรูปภาพ...',
    },
    failedToLoadImage: {
      ar: '⚠️ تعذر تحميل الصورة',
      en: '⚠️ Failed to load image',
      th: '⚠️ ไม่สามารถโหลดรูปภาพได้',
    },
    failedToLoadWordLessons: {
      ar: 'تعذر تحميل دروس تركيب الكلمات.',
      en: 'Failed to load word ordering lessons.',
      th: 'ไม่สามารถโหลดบทเรียนเรียงคำได้',
    },
    answeredAllQuestionsSuccess: {
      ar: 'تم الإجابة على جميع الأسئلة بامتياز! 🎉',
      en: 'All questions answered with excellence! 🎉',
      th: 'ตอบคำถามครบทุกข้ออย่างยอดเยี่ยม! 🎉',
    },
    noActiveQuestionsInLesson: {
      ar: 'لا توجد أسئلة نشطة في هذا الدرس حالياً.',
      en: 'No active questions in this lesson currently.',
      th: 'ไม่มีคำถามที่เปิดใช้งานในบทเรียนนี้ขณะนี้',
    },
    failedToFetchNewQuestion: {
      ar: 'فشل جلب سؤال جديد.',
      en: 'Failed to fetch new question.',
      th: 'ดึงคำถามใหม่ไม่สำเร็จ',
    },
    arrangeAndFillFirst: {
      ar: 'يرجى ترتيب الحروف وملء الفراغات أولاً يا بطل!',
      en: 'Please arrange letters and fill gaps first, hero!',
      th: 'โปรดเรียงตัวอักษรและเติมคำในช่องว่างก่อนนะฮีโร่!',
    },
    errorRecordingAnswer: {
      ar: 'خطأ أثناء تسجيل الإجابة:',
      en: 'Error recording answer:',
      th: 'เกิดข้อผิดพลาดขณะบันทึกคำตอบ:',
    },
    lessonProgressResetSuccess: {
      ar: 'تم تصفير تقدم الدرس بنجاح! 🔄',
      en: 'Lesson progress reset successfully! 🔄',
      th: 'รีเซ็ตความคืบหน้าของบทเรียนเรียบร้อยแล้ว! 🔄',
    },
    errorResettingProgress: {
      ar: 'خطأ أثناء تصفير التقدم:',
      en: 'Error resetting progress:',
      th: 'เกิดข้อผิดพลาดขณะรีเซ็ตความคืบหน้า:',
    },
    loadingAudio: {
      ar: 'جاري تحميل الصوت...',
      en: 'Loading audio...',
      th: 'กำลังโหลดเสียง...',
    },
    stopAudio: {
      ar: '⏸️ إيقاف الصوت',
      en: '⏸️ Stop Audio',
      th: '⏸️ หยุดเสียง',
    },
    listenAudio: {
      ar: 'استمع للمقطع الصوتي 🔊',
      en: 'Listen to audio 🔊',
      th: 'ฟังคลิปเสียง 🔊',
    },
    questionAttachmentAlt: {
      ar: 'مرفق السؤال',
      en: 'Question attachment',
      th: 'ไฟล์แนบคำถาม',
    },
    wordAssembledCursive: {
      ar: 'تم تجميع الكلمة بخط متصل ممتاز! 🏅',
      en: 'Word assembled in excellent connected script! 🏅',
      th: 'ประสมคำด้วยลายมืออาหรับได้อย่างยอดเยี่ยม! 🏅',
    },
    spaceLabel: {
      ar: 'مسافة ␣',
      en: 'Space ␣',
      th: 'เว้นวรรค ␣',
    },
    chooseLettersInstruction: {
      ar: 'اختر الحروف بترتيبها الصحيح لتجميع الكلمة:',
      en: 'Select letters in correct order to form the word:',
      th: 'เลือกตัวอักษรตามลำดับที่ถูกต้องเพื่อประสมคำ:',
    },
    greatAnswerGenius: {
      ar: 'أحسنت الإجابة يا عبقري! يمكنك الانتقال للموديل التالي.',
      en: 'Great answer genius! You can move to the next model.',
      th: 'เก่งมากอัจฉริยะ! คุณสามารถไปยังโมเดลถัดไปได้',
    },
    unsuccessfulTry: {
      ar: 'محاولة غير موفقة! حاول مرة أخرى بالضغط على زر تصفير.',
      en: 'Unsuccessful attempt! Try again by clicking retry.',
      th: 'พยายามใหม่นะ! ลองอีกครั้งโดยคลิกรีเซ็ต',
    },
    correctAnswerIs: {
      ar: '* الإجابة الصحيحة هي:',
      en: '* The correct answer is:',
      th: '* คำตอบที่ถูกต้องคือ:',
    },
    orWord: {
      ar: 'أو',
      en: 'or',
      th: 'หรือ',
    },
    arrangeLettersAndCheck: {
      ar: 'رتب الحروف بالكامل ثم اضغط على زر تحقق لتسجيل الإجابة.',
      en: 'Arrange all letters then press check to submit answer.',
      th: 'เรียงตัวอักษรให้ครบแล้วกดปุ่มตรวจเพื่อบันทึกคำตอบ',
    },
    showCorrectAnswerBtn: {
      ar: 'عرض الإجابة الصحيحة',
      en: 'Show Correct Answer',
      th: 'แสดงคำตอบที่ถูกต้อง',
    },
    newQuestionBtn: {
      ar: 'سؤال جديد',
      en: 'New Question',
      th: 'คำถามใหม่',
    },
    checkMyAnswerBtn: {
      ar: 'تحقق من إجابتي',
      en: 'Check My Answer',
      th: 'ตรวจคำตอบของฉัน',
    },
    resetLessonAndZero: {
      ar: 'إعادة الدرس والتصفير',
      en: 'Reset Lesson Progress',
      th: 'รีเซ็ตและเริ่มบทเรียนใหม่',
    },
    noLessonsToShow: {
      ar: 'لا توجد دروس لعرضها هنا حالياً.',
      en: 'No lessons available to display here currently.',
      th: 'ไม่มีบทเรียนที่จะแสดงที่นี่ในขณะนี้',
    },
    allLessonsCompletedNotice: {
      ar: 'جميع الدروس في هذه القائمة مكتملة! يمكنك تفعيل خيار "إظهار الدروس المكتملة" لمراجعتها.',
      en: 'All lessons in this list are completed! You can enable "Show completed lessons" to review them.',
      th: 'บทเรียนทั้งหมดในรายการนี้เสร็จสมบูรณ์แล้ว! คุณสามารถเปิดใช้งานตัวเลือก "แสดงบทเรียนที่เสร็จสมบูรณ์" เพื่อทบทวนได้',
    },
    areYouSure: {
      ar: 'هل أنت متأكد؟',
      en: 'Are you sure?',
      th: 'คุณแน่ใจหรือไม่?',
    },
    resetConfirmDesc: {
      ar: 'هل ترغب في إعادة المحاولة وتصفير تقدمك في موضوع "{topic}"؟ سيتم مسح جميع الإجابات السابقة لهذا الدرس.',
      en: 'Would you like to retry and reset your progress in topic "{topic}"? All previous answers for this lesson will be cleared.',
      th: 'คุณต้องการรีเซ็ตความคืบหน้าในหัวข้อ "{topic}" หรือไม่? คำตอบก่อนหน้าทั้งหมดสำหรับบทเรียนนี้จะถูกลบออก',
    },
    resettingProgress: {
      ar: 'جاري التصفير...',
      en: 'Resetting...',
      th: 'กำลังรีเซ็ต...',
    },
    yesResetBtn: {
      ar: 'نعم، أعد التصفير 🔄',
      en: 'Yes, Reset 🔄',
      th: 'ใช่ รีเซ็ตเลย 🔄',
    },
    cancelEmojiBtn: {
      ar: 'إلغاء ❌',
      en: 'Cancel ❌',
      th: 'ยกเลิก ❌',
    },
    sectionTwoWordComposition: {
      ar: 'القسم الثاني: تركيب الكلمات',
      en: 'Section Two: Word Composition',
      th: 'ส่วนที่สอง: การประสมคำ',
    },
    backToLessonsBtn: {
      ar: 'رجوع للدروس 📂',
      en: 'Back to Lessons 📂',
      th: 'กลับสู่บทเรียน 📂',
    },
    loadingNextQuestion: {
      ar: 'جاري تحميل السؤال التالي...',
      en: 'Loading next question...',
      th: 'กำลังโหลดคำถามถัดไป...',
    },
    allQuestionsAnswered: {
      ar: 'تم الإجابة على جميع الأسئلة! 🎉',
      en: 'All questions answered! 🎉',
      th: 'ตอบคำถามเรียบร้อยแล้วทุกข้อ! 🎉',
    },
    allQuestionsAnsweredDesc: {
      ar: 'تم الإجابة على كل الأسئلة بنجاح، ويرجى انتظار تسجيل الإجابات والدرجات بدقة في قاعدة البيانات.',
      en: 'All questions answered successfully. Please wait while grades are recorded into database.',
      th: 'ตอบคำถามทุกข้อสำเร็จแล้ว โปรดรอการบันทึกคะแนนลงในฐานข้อมูล',
    },
    lessonCompletionStats: {
      ar: 'إحصائيات إنجاز الدرس',
      en: 'Lesson Completion Statistics',
      th: 'สถิติความสำเร็จของบทเรียน',
    },
    totalQuestionsLabel: {
      ar: 'إجمالي الأسئلة:',
      en: 'Total Questions:',
      th: 'คำถามทั้งหมด:',
    },
    completedQuestionsLabel: {
      ar: 'الأسئلة المكتملة:',
      en: 'Completed Questions:',
      th: 'คำถามที่เสร็จแล้ว:',
    },
    answeredQuestionsLabel: {
      ar: 'الأسئلة المجاب عليها:',
      en: 'Answered Questions:',
      th: 'คำถามที่ตอบแล้ว:',
    },
    importantNote: {
      ar: 'ملاحظة هامة:',
      en: 'Important Note:',
      th: 'หมายเหตุสำคัญ:',
    },
    gasScriptNote: {
      ar: 'لمشاهدة شريط تقدم الدرس وعدد الأسئلة والأسئلة المجاب عليها هنا، يرجى نسخ كود Google Apps Script الموحد من صفحة التهيئة (الربط) في لوحة التحكم وتحديثه في مشروع الـ Script الخاص بك وإعادة نشره كإصدار جديد.',
      en: 'To see lesson progress bar and stats here, please copy the unified Google Apps Script code from integration setup page in dashboard and update your script project.',
      th: 'หากต้องการดูแถบความก้าวหน้าและสถิติบทเรียน โปรดคัดลอกโค้ด Google Apps Script รวมจากหน้าตั้งค่าการเชื่อมต่อในแผงควบคุมและอัปเดตในโครงการสคริปต์ของคุณ',
    },
    zoomIn: {
      ar: 'تكبير',
      en: 'Zoom In',
      th: 'ขยาย',
    },
    zoomOut: {
      ar: 'تصغير',
      en: 'Zoom Out',
      th: 'ย่อ',
    },
    resetZoom: {
      ar: 'إعادة تعيين 🔄',
      en: 'Reset 🔄',
      th: 'รีเซ็ต 🔄',
    },
    close: {
      ar: 'إغلاق',
      en: 'Close',
      th: 'ปิด',
    },
    lightboxPreviewAlt: {
      ar: 'معاينة الصورة مكبرة',
      en: 'Enlarged image preview',
      th: 'ตัวอย่างรูปภาพขยาย',
    },
    zoomControlsNotice: {
      ar: 'يمكنك استخدام أدوات التحكم في الأعلى لتكبير وتصغير الصورة',
      en: 'You can use controls above to zoom in and out of the image',
      th: 'คุณสามารถใช้การควบคุมด้านบนเพื่อขยายและย่อรูปภาพได้',
    },
    failedToLoadMatchingLessons: {
      ar: 'تعذر تحميل تمارين وصل الكلمات.',
      en: 'Failed to load word matching exercises.',
      th: 'ไม่สามารถโหลดแบบฝึกหัดจับคู่คำได้',
    },
    googleDriveAudioWarning1: {
      ar: "تنبيه: تعذر تشغيل الملف الصوتي من Google Drive.\nيرجى التأكد من أن الملف الصوتي مشترك بصيغة 'أي شخص لديه الرابط' (Anyone with the link can view) في حساب Google Drive الخاص بك.",
      en: "Warning: Unable to play audio from Google Drive.\nPlease make sure the audio file is shared as 'Anyone with the link can view' in your Google Drive.",
      th: "คำเตือน: ไม่สามารถเล่นไฟล์เสียงจาก Google Drive ได้\nโปรดตรวจสอบว่าไฟล์เสียงแชร์แบบ 'ทุกคนที่มีลิงก์สามารถดูได้' ใน Google Drive ของคุณ",
    },
    googleDriveAudioWarning2: {
      ar: "تنبيه: تعذر تحميل أو تشغيل الملف الصوتي من Google Drive.\nيرجى التأكد من أن الملف الصوتي مشترك بصيغة 'أي شخص لديه الرابط' (Anyone with the link can view) في حساب Google Drive الخاص بك وأن الرابط صحيح.",
      en: "Warning: Unable to load or play audio from Google Drive.\nPlease make sure the audio file is shared as 'Anyone with the link can view' in your Google Drive and the link is correct.",
      th: "คำเตือน: ไม่สามารถโหลดหรือเล่นไฟล์เสียงจาก Google Drive ได้\nโปรดตรวจสอบว่าไฟล์เสียงแชร์แบบ 'ทุกคนที่มีลิงก์สามารถดูได้' ใน Google Drive ของคุณและลิงก์ถูกต้อง",
    },
    matchingResultSummary: {
      ar: 'الصحيح: {correct} و الخطأ: {errors}',
      en: 'Correct: {correct} and Wrong: {errors}',
      th: 'ถูกต้อง: {correct} และ ผิด: {errors}',
    },
    errorSavingResults: {
      ar: 'خطأ في حفظ النتائج:',
      en: 'Error saving results:',
      th: 'เกิดข้อผิดพลาดในการบันทึกผลลัพธ์:',
    },
    errorResettingLesson: {
      ar: 'خطأ في إعادة تهيئة الدرس:',
      en: 'Error re-initializing lesson:',
      th: 'เกิดข้อผิดพลาดในการเริ่มต้นบทเรียนใหม่:',
    },
    congratsFinishedMatchingExercise: {
      ar: 'تهانينا! لقد أنهيت جميع تمارين التوصيل في هذا الدرس بنجاح 🎉',
      en: 'Congratulations! You have completed all matching exercises in this lesson successfully 🎉',
      th: 'ยินดีด้วย! คุณทำแบบฝึกหัดจับคู่ทั้งหมดในบทเรียนนี้สำเร็จแล้ว 🎉',
    },
    noMatchingTopicsActive: {
      ar: 'لا توجد مواضيع توصيل مفعلة حالياً',
      en: 'No matching topics currently active',
      th: 'ไม่มีหัวข้อการจับคู่ที่เปิดใช้งานในขณะนี้',
    },
    fillMatchesSheetNotice: {
      ar: 'تأكد من ملء ورقة (Matches) ببيانات التوصيل في ملف الإكسل الخاص بالمعلم.',
      en: 'Make sure to fill the (Matches) sheet with matching data in the teacher\'s Excel file.',
      th: 'โปรดตรวจสอบว่าได้กรอกแผ่นงาน (Matches) ด้วยข้อมูลการจับคู่ในไฟล์ Excel ของครูแล้ว',
    },
    completedExerciseNotice: {
      ar: 'تم إكمال هذا التمرين بنجاح!',
      en: 'This exercise has been completed successfully!',
      th: 'แบบฝึกหัดนี้เสร็จสมบูรณ์แล้ว!',
    },
    attemptsUsed: {
      ar: 'المحاولات المستخدمة: {used} من {max}',
      en: 'Attempts used: {used} of {max}',
      th: 'ความพยายามที่ใช้: {used} จาก {max}',
    },
    allMatchingCompletedNotice: {
      ar: 'جميع التمارين المتاحة مكتملة حالياً! انقر على زر "إظهار الدروس المكتملة" لعرضها ومراجعتها.',
      en: 'All available exercises are currently completed! Click "Show completed lessons" to view and review them.',
      th: 'แบบฝึกหัดทั้งหมดที่ใช้ได้เสร็จสมบูรณ์แล้ว! คลิก "แสดงบทเรียนที่เสร็จสมบูรณ์" เพื่อดูและทบทวน',
    },
    matchWordExercise: {
      ar: 'تمرين وصل الكلمة',
      en: 'Word Matching Exercise',
      th: 'แบบฝึกหัดจับคู่คำ',
    },
    matchingAndConnecting: {
      ar: 'المطابقة والتوصيل',
      en: 'Matching & Connecting',
      th: 'การจับคู่และการเชื่อมโยง',
    },
    groupOneConnectInstruction: {
      ar: 'المجموعة الأولى (انقر واسحب للتوصيل)',
      en: 'Group 1 (Click & drag to connect)',
      th: 'กลุ่มที่ 1 (คลิกและลากเพื่อเชื่อมต่อ)',
    },
    groupTwoTargetInstruction: {
      ar: 'المجموعة الثانية (مستقبل الوصلة)',
      en: 'Group 2 (Target node)',
      th: 'กลุ่มที่ 2 (ปลายทางเชื่อมต่อ)',
    },
    loadingEllipsis: {
      ar: 'تحميل...',
      en: 'Loading...',
      th: 'กำลังโหลด...',
    },
    stopAudioShort: {
      ar: '⏸️ إيقاف',
      en: '⏸️ Stop',
      th: '⏸️ หยุด',
    },
    listenAudioShort: {
      ar: '▶️ استمع',
      en: '▶️ Listen',
      th: '▶️ ฟัง',
    },
    audioVolumeLabel: {
      ar: 'درجة الصوت:',
      en: 'Volume:',
      th: 'ระดับเสียง:',
    },
    attachmentAlt: {
      ar: 'مرفق',
      en: 'Attachment',
      th: 'ไฟล์แนบ',
    },
    matchingResultLabel: {
      ar: 'نتيجة التوصيل:',
      en: 'Matching result:',
      th: 'ผลลัพธ์การจับคู่:',
    },
    nextLockedNotice: {
      ar: '🔒 الانتقال للسؤال التالي مغلق. يجب تكرار المحاولة والحصول على درجة كاملة (بدون أخطاء) للمتابعة.',
      en: '🔒 Moving to next question is locked. You must retry and achieve a perfect score (zero errors) to proceed.',
      th: '🔒 การไปยังคำถามถัดไปถูกล็อกไว้ คุณต้องลองใหม่และได้คะแนนเต็ม (ไม่มีข้อผิดพลาด) เพื่อดำเนินการต่อ',
    },
    connectInstructionPrompt: {
      ar: '* اضغط على أي بطاقة في العمود الأيمن واسحب الخط نحو المطابقة الصحيحة في العمود الأيسر.',
      en: '* Click any card in the right column and drag the line towards the correct match in the left column.',
      th: '* คลิกการ์ดใดก็ได้ในคอลัมน์ขวาแล้วลากเส้นไปยังคำตอบที่ถูกต้องในคอลัมน์ซ้าย',
    },
    undoBtn: {
      ar: 'تراجع',
      en: 'Undo',
      th: 'เลิกทำ',
    },
    checkMatchingBtn: {
      ar: 'التحقق من التوصيل',
      en: 'Verify Matching',
      th: 'ตรวจการจับคู่',
    },
    exerciseXOfY: {
      ar: 'تمرين {index} من {total}',
      en: 'Exercise {index} of {total}',
      th: 'แบบฝึกหัดที่ {index} จาก {total}',
    },
    nextBtn: {
      ar: 'التالي',
      en: 'Next',
      th: 'ถัดไป',
    },
    exerciseHeaderPrefix: {
      ar: 'تمرين:',
      en: 'Exercise:',
      th: 'แบบฝึกหัด:',
    },
    retryBtnText: {
      ar: 'إعادة المحاولة',
      en: 'Retry',
      th: 'ลองใหม่อีกครั้ง',
    },
  },

  reports: {
    instantGradebook: {
      ar: 'دفتر الدرجات الفوري',
      en: 'Instant Gradebook',
      th: 'สมุดบันทึกคะแนนทันที',
    },
    comprehensiveReportTitle: {
      ar: 'تقرير الأداء اللغوي الشامل للطالب',
      en: 'Comprehensive Language Performance Report for Student',
      th: 'รายงานผลการเรียนรู้ภาษาแบบครอบคลุมของนักเรียน',
    },
    reportWelcomeDesc: {
      ar: 'أهلاً {name}! استعرض درجاتك، تقييمات المدرس، ونقاط تركيزك، وقم باستخراج الشهادة بصيغة PDF.',
      en: 'Welcome {name}! Review your grades, teacher evaluations, and focus points, and export your PDF certificate.',
      th: 'ยินดีต้อนรับ {name}! ดูคะแนน การประเมินของครู และจุดเน้นย้ำของคุณ พร้อมส่งออกใบรับรอง PDF',
    },
    smartReminderList: {
      ar: 'قائمة التذكير والمتابعة الذكية',
      en: 'Smart Reminder & Follow-up List',
      th: 'รายการแจ้งเตือนและติดตามอัจฉริยะ',
    },
    smartReminderDesc: {
      ar: 'استعرض دروسك اليومية، الدروس السابقة غير المكتملة، وتابع إنجازاتك من خلال النقر على أي درس لعرض بطاقة تفاصيله الفورية والنجوم المكتسبة مباشرة تحته!',
      en: 'Review your daily lessons, unfinished past lessons, and track achievements by clicking any lesson to see instant details and earned stars!',
      th: 'ดูบทเรียนประจำวัน บทเรียนก่อนคนที่ยังไม่เสร็จ และติดตามความก้าวหน้าโดยคลิกที่บทเรียนเพื่อดูรายละเอียดและดาวที่ได้รับ!',
    },
    totalScheduledLessons: {
      ar: 'إجمالي الدروس المجدولة:',
      en: 'Total Scheduled Lessons:',
      th: 'บทเรียนที่กำหนดไว้ทั้งหมด:',
    },
    todayScheduledLesson: {
      ar: 'درس اليوم مقرر',
      en: 'Today\'s Scheduled Lesson',
      th: 'บทเรียนที่กำหนดในวันนี้',
    },
    pendingUnfinishedLessons: {
      ar: 'دروس غير مكتملة',
      en: 'Unfinished Lessons',
      th: 'บทเรียนที่ยังไม่เสร็จ',
    },
    completedLessonsTitle: {
      ar: 'الدروس المكتملة',
      en: 'Completed Lessons',
      th: 'บทเรียนที่เสร็จสมบูรณ์',
    },
    fetchingLiveGrades: {
      ar: 'جاري جلب تقارير الدرجات المباشرة...',
      en: 'Fetching live grade reports...',
      th: 'กำลังดึงรายงานคะแนนสด...',
    },
    todayScheduledBadge: {
      ar: 'درس اليوم 🌟',
      en: 'Today\'s Lesson 🌟',
      th: 'บทเรียนวันนี้ 🌟',
    },
    needsCompletionBadge: {
      ar: 'بحاجة لإكمال ⚠️',
      en: 'Needs Completion ⚠️',
      th: 'ต้องทำให้เสร็จ ⚠️',
    },
    noLessonsCompletedYet: {
      ar: 'لم يتم إكمال أي دروس بالكامل حتى الآن. استمر بالدراسة والحل لتراها هنا يا بطل!',
      en: 'No lessons fully completed yet. Keep studying and solving to see them here, hero!',
      th: 'ยังไม่มีบทเรียนที่เสร็จสมบูรณ์เลย พยายามเรียนรู้และแก้ปัญหาเพื่อดูได้ที่นี่นะฮีโร่!',
    },
    noDataInSection: {
      ar: 'لا توجد بيانات مسجلة حالياً في هذا القسم',
      en: 'No data recorded in this section currently',
      th: 'ไม่มีข้อมูลบันทึกไว้ในส่วนนี้ในขณะนี้',
    },
    noDataInSectionDesc: {
      ar: 'يبدو أنك لم تبدأ بحل أي واجبات أو أنشطة في هذا البند بعد يا بطل.',
      en: 'Looks like you haven\'t started solving any assignments or activities in this section yet, hero.',
      th: 'ดูเหมือนว่าคุณยังไม่ได้เริ่มทำแบบฝึกหัดหรือกิจกรรมในส่วนนี้เลยนะฮีโร่',
    },
    tabReminder: {
      ar: 'تذكير',
      en: 'Reminder',
      th: 'การแจ้งเตือน',
    },
    tabSentLessons: {
      ar: 'الدروس المرسلة',
      en: 'Sent Lessons',
      th: 'บทเรียนที่ส่งแล้ว',
    },
    tabFocusGrades: {
      ar: 'درجات التركيز',
      en: 'Focus Grades',
      th: 'คะแนนความตั้งใจ',
    },
    tabWordExercises: {
      ar: 'تمارين الكلمات',
      en: 'Word Exercises',
      th: 'แบบฝึกหัดคำศัพท์',
    },
    tabMatchingExercises: {
      ar: 'تمارين الوصل',
      en: 'Matching Exercises',
      th: 'แบบฝึกหัดจับคู่',
    },
    tabWritingExercises: {
      ar: 'تمارين الكتابة',
      en: 'Writing Exercises',
      th: 'แบบฝึกหัดการเขียน',
    },
    evalRatingAndStars: {
      ar: 'تقييم الأداء والنجوم المكتسبة',
      en: 'Performance Evaluation & Stars Earned',
      th: 'การประเมินประสิทธิภาพและดาวที่ได้รับ',
    },
    percentageAchieved: {
      ar: 'النسبة المحققة:',
      en: 'Achieved Score:',
      th: 'คะแนนที่ทำได้:',
    },
    starsCountLabel: {
      ar: '({stars}/10 نجوم)',
      en: '({stars}/10 stars)',
      th: '({stars}/10 ดาว)',
    },
    evalStar10: {
      ar: 'مستوى مبهر جداً! أداء متكامل وإتقان تام للدروس والتمارين. استمر في التميز والنجاح يا بطل! 👑🏆🌟',
      en: 'Amazing level! Complete performance and total mastery of lessons and exercises. Keep excelling, hero! 👑🏆🌟',
      th: 'ระดับที่น่าทึ่งมาก! ประสิทธิภาพสมบูรณ์แบบและการเชี่ยวชาญบทเรียนและแบบฝึกหัดอย่างเต็มที่ ตั้งใจต่อไปนะฮีโร่! 👑🏆🌟',
    },
    evalStar9: {
      ar: 'أداء رائع وممتاز! مهارات لغوية متفوقة وحل دقيق. أحسنت صنعاً وتستحق التقدير! 👏⭐🎖️',
      en: 'Wonderful & excellent performance! Superior language skills and precise answers. Great job! 👏⭐🎖️',
      th: 'ยอดเยี่ยมมาก! ทักษะทางภาษาที่เหนือชั้นและการตอบอย่างแม่นยำ ทำได้ดีมาก! 👏⭐🎖️',
    },
    evalStar8: {
      ar: 'ممتاز جداً! درجات عالية تدل على فهم متميز وحرص كبير على الاستمرار والتفوق. 👍✨🚀',
      en: 'Very excellent! High scores showing outstanding comprehension and great dedication. 👍✨🚀',
      th: 'ดีเยี่ยมมาก! คะแนนสูงแสดงถึงความเข้าใจที่ยอดเยี่ยมและความทุ่มเท 👍✨🚀',
    },
    evalStar6: {
      ar: 'جيد جداً! خطوت خطوات ممتازة وبإمكانك تحقيق المزيد بالمزيد من التدرب والتركيز. 💪😊📈',
      en: 'Very good! You took great steps and can achieve even more with more practice. 💪😊📈',
      th: 'ดีมาก! คุณทำได้ดีมากและสามารถทำได้ดียิ่งขึ้นด้วยการฝึกฝน 💪😊📈',
    },
    evalStar5: {
      ar: 'جيد! فهم مقبول ولكن تحتاج لمزيد من المراجعة والتركيز لتصل إلى درجات القمة اللغوية. ✊📚📝',
      en: 'Good! Acceptable understanding, but you need more review and focus to reach the top scores. ✊📚📝',
      th: 'ดี! ความเข้าใจอยู่ในระดับที่ยอมรับได้ แต่ต้องทบทวนและมีสماธิมากขึ้นเพื่อไปให้ถึงคะแนนสูงสุด ✊📚📝',
    },
    evalStar1: {
      ar: 'بداية طيبة! استمر بالمحاولة والتعلم بانتظام فكل تدريب تحله يجعلك أكثر تميزاً وذكاءً. 🏃‍♂️🧭✨',
      en: 'Good start! Keep trying and learning regularly; every exercise makes you wiser and better. 🏃‍♂️🧭✨',
      th: 'การเริ่มต้นที่ดี! พยายามและเรียนรู้อย่างสม่ำเสมอ ทุกแบบฝึกหัดจะทำให้คุณเก่งขึ้น 🏃‍♂️🧭✨',
    },
    evalStar0: {
      ar: 'لم تبدأ حل التمارين في هذا القسم بعد. نحن واثقون من قدرتك الفائقة على تحقيق العلامة الكاملة بمجرد البدء! 🚀🎯💫',
      en: 'You haven\'t started solving exercises in this section yet. We are confident in your ability to score full marks once you start! 🚀🎯💫',
      th: 'คุณยังไม่ได้เริ่มทำแบบฝึกหัดในส่วนนี้ เรามั่นใจในความสามารถของคุณที่จะทำคะแนนเต็มเมื่อคุณเริ่ม! 🚀🎯💫',
    },
    compactStar10: {
      ar: 'مستوى مذهل وإتقان كامل! 👑🏆',
      en: 'Stunning level & complete mastery! 👑🏆',
      th: 'ระดับที่น่าทึ่งและความเชี่ยวชาญสมบูรณ์แบบ! 👑🏆',
    },
    compactStar9: {
      ar: 'أداء رائع وممتاز جداً! ⭐👏',
      en: 'Wonderful & excellent performance! ⭐👏',
      th: 'ผลงานที่ยอดเยี่ยมและดีมาก! ⭐👏',
    },
    compactStar8: {
      ar: 'ممتاز، فهم متميز للغاية! 👍✨',
      en: 'Excellent, outstanding understanding! 👍✨',
      th: 'ยอดเยี่ยม ความเข้าใจที่โดดเด่นมาก! 👍✨',
    },
    compactStar6: {
      ar: 'جيد جداً، واصل التقدم والتركيز! 🚀📈',
      en: 'Very good, keep progressing and focusing! 🚀📈',
      th: 'ดีมาก ก้าวหน้าต่อไปและมีสماธิ! 🚀📈',
    },
    compactStar5: {
      ar: 'جيد، ولديك القدرة على الأفضل! 😊💪',
      en: 'Good, you have the potential for better! 😊💪',
      th: 'ดี คุณมีศักยภาพที่จะทำได้ดียิ่งขึ้น! 😊💪',
    },
    compactStar1: {
      ar: 'محاولة طيبة، استمر في التميز! 🏃‍♂️🎯',
      en: 'Good attempt, keep striving for excellence! 🏃‍♂️🎯',
      th: 'ความพยายามที่ดี ตั้งใจสร้างผลงานที่ยอดเยี่ยมต่อไป! 🏃‍♂️🎯',
    },
    compactStar0: {
      ar: 'بانتظار البدء لتحقيق العلامة الكاملة! 💫',
      en: 'Waiting to start achieving full marks! 💫',
      th: 'กำลังรอให้เริ่มเพื่อคว้าคะแนนเต็ม! 💫',
    },
    studentReportTitle: {
      ar: 'تقرير تقييم الطالب اليومي',
      en: 'Daily Student Evaluation Report',
      th: 'รายงานการประเมินนักเรียนประจำวัน',
    },
    studentNameLabel: {
      ar: 'اسم الطالب:',
      en: 'Student Name:',
      th: 'ชื่อนักเรียน:',
    },
    studentIdLabel: {
      ar: 'رقم الطالب:',
      en: 'Student ID:',
      th: 'รหัสนักเรียน:',
    },
    dateLabel: {
      ar: 'التاريخ:',
      en: 'Date:',
      th: 'วันที่:',
    },
    evaluationSummary: {
      ar: 'ملخص التقييم والنتائج',
      en: 'Evaluation & Score Summary',
      th: 'สรุปการประเมินและคะแนน',
    },
    printReport: {
      ar: 'طباعة التقرير',
      en: 'Print Report',
      th: 'พิมพ์รายงาน',
    },
  },

  admin: {
    dashboardTitle: {
      ar: 'لوحة التحكم وإدارة النظام',
      en: 'System Control & Admin Dashboard',
      th: 'แผงควบคุมและจัดการระบบ',
    },
    tabWords: {
      ar: 'تمارين الكلمات',
      en: 'Word Exercises',
      th: 'แบบฝึกหัดคำศัพท์',
    },
    tabMatching: {
      ar: 'تمارين التوصيل',
      en: 'Matching Exercises',
      th: 'แบบฝึกหัดจับคู่',
    },
    tabDrawing: {
      ar: 'تمارين الرسم والخط',
      en: 'Drawing Exercises',
      th: 'แบบฝึกหัดการเขียน',
    },
    tabHomeContent: {
      ar: 'محتوى الرئيسية والدروس',
      en: 'Home & Lesson Content',
      th: 'เนื้อหาหน้าหลักและบทเรียน',
    },
    tabStudents: {
      ar: 'سجل وجدول الطلاب',
      en: 'Student Records & Schedule',
      th: 'บันทึกและตารางเรียนนักเรียน',
    },
    tabReports: {
      ar: 'التقارير الشاملة',
      en: 'Comprehensive Reports',
      th: 'รายงาน 종합',
    },
    tabTranslations: {
      ar: 'إدارة اللغات والنصوص (i18n)',
      en: 'Language & Translation Manager',
      th: 'การจัดการภาษาและข้อความ',
    },
    translationManagerSubtitle: {
      ar: 'تعديل جميع النصوص والرسائل في النظام للغات الثلاث (العربية، الإنجليزية، التايلاندية)',
      en: 'Customize all system labels and messages for 3 languages (Arabic, English, Thai)',
      th: 'แก้ไขข้อความและข้อความทั้งหมดในระบบสำหรับ 3 ภาษา (อาหรับ อังกฤษ ไทย)',
    },
    saveTranslationsBtn: {
      ar: 'حفظ التعديلات على اللغات',
      en: 'Save Language Changes',
      th: 'บันทึกการเปลี่ยนแปลงภาษา',
    },
    resetTranslationsBtn: {
      ar: 'إعادة النصوص الافتراضية',
      en: 'Reset to Default Texts',
      th: 'รีเซ็ตเป็นข้อความเริ่มต้น',
    },
    searchKeyPlaceholder: {
      ar: 'ابحث عن نص أو مفتاح...',
      en: 'Search string or key...',
      th: 'ค้นหาข้อความหรือคีย์...',
    },
    arabicCol: {
      ar: 'النص العربي 🇸🇦',
      en: 'Arabic Text 🇸🇦',
      th: 'ข้อความภาษาอาหรับ 🇸🇦',
    },
    englishCol: {
      ar: 'النص الإنكليزي 🇬🇧',
      en: 'English Text 🇬🇧',
      th: 'ข้อความภาษาอังกฤษ 🇬🇧',
    },
    thaiCol: {
      ar: 'النص التايلاندي 🇹🇭',
      en: 'Thai Text 🇹🇭',
      th: 'ข้อความภาษาไทย 🇹🇭',
    },
    sectionFilter: {
      ar: 'تصفية حسب القسم:',
      en: 'Filter by Section:',
      th: 'กรองตามส่วน:',
    },
    allSections: {
      ar: 'جميع الأقسام',
      en: 'All Sections',
      th: 'ทุกส่วน',
    },
    translationSavedSuccess: {
      ar: 'تم حفظ تعديلات النصوص والترجمة بنجاح!',
      en: 'Translations saved successfully!',
      th: 'บันทึกการแปลสำเร็จแล้ว!',
    },
    translationResetSuccess: {
      ar: 'تمت إعادة القاموس إلى النصوص الافتراضية.',
      en: 'Translations reset to defaults.',
      th: 'รีเซ็ตการแปลเป็นค่าเริ่มต้นแล้ว',
    },
  },

  tableHeaders: {
    lessonTopic: {
      ar: 'موضوع الدرس',
      en: 'Lesson Topic',
      th: 'หัวข้อบทเรียน',
    },
    homeworkImage: {
      ar: 'صورة الواجب',
      en: 'Homework Image',
      th: 'รูปภาพการบ้าน',
    },
    audioRecord: {
      ar: 'تسجيل صوت',
      en: 'Audio Recording',
      th: 'การบันทึกเสียง',
    },
    correction: {
      ar: 'تصحيح',
      en: 'Correction',
      th: 'การตรวจงาน',
    },
    imageGrades: {
      ar: 'درجات الصورة',
      en: 'Image Grades',
      th: 'คะแนนรูปภาพ',
    },
    audioGrades: {
      ar: 'درجات الصوت',
      en: 'Audio Grades',
      th: 'คะแนนเสียง',
    },
    addImage: {
      ar: 'اضافة صورة',
      en: 'Add Image',
      th: 'เพิ่มรูปภาพ',
    },
    addVideo: {
      ar: 'اضافة فيديو',
      en: 'Add Video',
      th: 'เพิ่มวيدีโอ',
    },
    addAudio: {
      ar: 'اضافة صوت',
      en: 'Add Audio',
      th: 'เพิ่มเสียง',
    },
    correctionDate: {
      ar: 'تاريخ التصحيح',
      en: 'Correction Date',
      th: 'วันที่ตรวจงาน',
    },
    ratingAndStars: {
      ar: 'التقييم والنجوم ⭐',
      en: 'Rating & Stars ⭐',
      th: 'การประเมินและดาว ⭐',
    },
    videoAnswersResult: {
      ar: 'نتائج اجابة الفيديو',
      en: 'Video Answer Results',
      th: 'ผลคำตอบวิดีโอ',
    },
    audioAnswersResult: {
      ar: 'نتائج اجابة الصوت',
      en: 'Audio Answer Results',
      th: 'ผลคำตอบเสียง',
    },
    totalResult: {
      ar: 'النتيجة الكلية',
      en: 'Total Result',
      th: 'ผลลัพธ์รวม',
    },
    finalGrade: {
      ar: 'الدرجة النهائية',
      en: 'Final Grade',
      th: 'คะแนนสุทธิ',
    },
    resultAndDetails: {
      ar: 'النتيجة والتفاصيل',
      en: 'Score & Details',
      th: 'คะแนนและรายละเอียด',
    },
    percentage: {
      ar: 'النسبة المئوية',
      en: 'Percentage',
      th: 'เปอร์เซ็นต์',
    },
    lastUpdate: {
      ar: 'آخر تحديث',
      en: 'Last Update',
      th: 'อัปเดตล่าสุด',
    },
    attemptsCount: {
      ar: 'عدد المحاولات',
      en: 'Number of Attempts',
      th: 'จำนวนครั้งที่พยายาม',
    },
    completedSentencesCount: {
      ar: 'عدد الجمل المكتملة',
      en: 'Completed Sentences',
      th: 'จำนวนประโยคที่เสร็จสมบูรณ์',
    },
  },

  about: {
    whoWeAreTab: {
      ar: 'من نحن والتعريف بالمنصة',
      en: 'About Us & Platform Info',
      th: 'เกี่ยวกับเราและข้อมูลแพลตฟอร์ม',
    },
    contactSupportTab: {
      ar: 'اتصل بنا وقنوات الدعم',
      en: 'Contact Us & Support Channels',
      th: 'ติดต่อเราและช่องทางการสนับสนุน',
    },
    aboutPlatformHeader: {
      ar: 'معلومات عن المنصة 🌸',
      en: 'Platform Information 🌸',
      th: 'ข้อมูลเกี่ยวกับแพลตฟอร์ม 🌸',
    },
    aboutPlatformDesc: {
      ar: 'تعلّم، تدرّب، وارتقِ بمستواك في مهارات اللغة العربية والخطوط بمناهج إثرائية وتطبيقات تفاعلية.',
      en: 'Learn, practice, and elevate your Arabic language and calligraphy skills with enriched curricula and interactive apps.',
      th: 'เรียนรู้ ฝึกฝน และยกระดับทักษะภาษาอาหรับและอักษรวิจิตรของคุณด้วยหลักสูตรเสริมและแอปแบบโต้ตอบ',
    },
    loadingAboutInfo: {
      ar: 'جاري جلب المعلومات التعريفية...',
      en: 'Fetching platform information...',
      th: 'กำลังดึงข้อมูลแพลตฟอร์ม...',
    },
  },
};
