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
