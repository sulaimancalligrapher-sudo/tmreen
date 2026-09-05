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
    openFile: {
      ar: '🔗 افتح الملف',
      en: '🔗 Open File',
      th: '🔗 เปิดไฟล์',
    },
    yesCompleted: {
      ar: 'نعم (مكتمل)',
      en: 'Yes (Completed)',
      th: 'ใช่ (เสร็จสมบูรณ์)',
    },
    noIncomplete: {
      ar: 'لا (غير مكتمل)',
      en: 'No (Incomplete)',
      th: 'ไม่ (ยังไม่เสร็จ)',
    },
  },

  encouragements: {
    image90: {
      ar: 'ممتاز! خط ورسم رائع وواضح جداً 🎨✨',
      en: 'Excellent! Wonderful, clear handwriting and drawing 🎨✨',
      th: 'ยอดเยี่ยมมาก! ลายมือและภาพวาดสวยงามและชัดเจนมาก 🎨✨',
    },
    image75: {
      ar: 'جيد جداً! خط جميل ومقروء 📝🌟',
      en: 'Very Good! Beautiful and legible handwriting 📝🌟',
      th: 'ดีมาก! ลายมือสวยงามและอ่านง่าย 📝🌟',
    },
    image50: {
      ar: 'جيد! أداء حسن وجاري التحسن ✏️👍',
      en: 'Good! Good performance and improving ✏️👍',
      th: 'ดี! ทำได้ดีและกำลังพัฒนาขึ้น ✏️👍',
    },
    imageUnder50: {
      ar: 'يحتاج لمزيد من التدريب على الكتابة ✏️💪',
      en: 'Needs more writing practice ✏️💪',
      th: 'ต้องฝึกฝนการเขียนเพิ่มเติม ✏️💪',
    },
    audio90: {
      ar: 'مبدع! نطق ومخارج حروف ممتازة وصوت واضح 🎙️✨',
      en: 'Creative! Excellent pronunciation, articulation, and clear voice 🎙️✨',
      th: 'สร้างสรรค์มาก! การออกเสียงและการออกอักขระยอดเยี่ยม เสียงชัดเจน 🎙️✨',
    },
    audio75: {
      ar: 'جيد جداً! قراءة وأداء صوتي ممتاز 🎧🌟',
      en: 'Very Good! Excellent reading and vocal performance 🎧🌟',
      th: 'ดีมาก! การอ่านและการแสดงออกทางเสียงยอดเยี่ยม 🎧🌟',
    },
    audio50: {
      ar: 'جيد! أداء صوتي حسن ويحتاج وضوح أكثر 🗣️👍',
      en: 'Good! Good vocal performance, needs more clarity 🗣️👍',
      th: 'ดี! การแสดงออกทางเสียงดี แต่ต้องการความชัดเจนมากขึ้น 🗣️👍',
    },
    audioUnder50: {
      ar: 'يحتاج لمزيد من التدريب والممارسة الصوتية 🎧💪',
      en: 'Needs more voice practice and training 🎧💪',
      th: 'ต้องฝึกฝนและซ้อมการใช้เสียงเพิ่มเติม 🎧💪',
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
    monitoringAdminTitle: {
      ar: 'لوحة المتابعة المباشرة - تسجيل دخول الإدارة',
      en: 'Live Monitoring - Admin Login',
      th: 'การติดตามแบบสด - เข้าสู่ระบบผู้ดูแล',
    },
    monitoringAdminSubtitle: {
      ar: 'يرجى تسجيل الدخول برقم واسم الإدارة للوصول إلى لوحة المتابعة المباشرة أونلاين.',
      en: 'Please log in with admin username and passcode to access the live monitoring dashboard.',
      th: 'กรุณาล็อกอินด้วยชื่อผู้ใช้และรหัสผ่านผู้ดูแลเพื่อเข้าถึงแดชบอร์ดติดตามแบบสด',
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
    studentLoginErrorInvalid: {
      ar: 'اسم أو رقم الطالب غير صحيح، يرجى التأكد والمحاولة مرة أخرى.',
      en: 'Student name or number is incorrect. Please verify and try again.',
      th: 'ชื่อหรือรหัสนักเรียนไม่ถูกต้อง โปรดตรวจสอบและลองอีกครั้ง',
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
    fillStudentNameAndId: {
      ar: 'يرجى إدخال اسم ورقم الطالب أولاً!',
      en: 'Please enter student name and ID first!',
      th: 'กรุณากรอกชื่อและรหัสนักเรียนก่อน!',
    },
    fillAdminCredentials: {
      ar: 'يرجى إدخال اسم مستخدم الإدارة وكلمة المرور!',
      en: 'Please enter admin username and password!',
      th: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านผู้ดูแล!',
    },
    loginFailedCheckData: {
      ar: 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.',
      en: 'Login failed. Please check your credentials.',
      th: 'การเข้าสู่ระบบล้มเหลว โปรดตรวจสอบข้อมูลของคุณ',
    },
    adminLoginInvalid: {
      ar: 'اسم المستخدم أو كلمة المرور غير صحيحة للإدارة.',
      en: 'Invalid admin username or password.',
      th: 'ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลไม่ถูกต้อง',
    },
    serverSheetError: {
      ar: 'خطأ في خادم الشيت:',
      en: 'Sheet server error:',
      th: 'ข้อผิดพลาดของเซิร์ฟเวอร์ Sheet:',
    },
    editGasServerUrl: {
      ar: 'تعديل رابط خادم الشيت',
      en: 'Edit Sheet Server URL',
      th: 'แก้ไข URL เซิร์ฟเวอร์ Sheet',
    },
    resetDefaultUrl: {
      ar: 'إعادة الضبط للافتراضي',
      en: 'Reset to default',
      th: 'รีเซ็ตเป็นค่าเริ่มต้น',
    },
    gasServerUrlSetup: {
      ar: 'إعداد رابط خادم Google Apps Script',
      en: 'Google Apps Script Server URL Setup',
      th: 'ตั้งค่า URL เซิร์ฟเวอร์ Google Apps Script',
    },
    gasServerUrlDesc: {
      ar: 'إذا أظهر الخادم خطأ 404، يرجى لصق رابط الـ Web App الجديد المنسوخ من مشروع Google Apps Script الخاص بك:',
      en: 'If the server shows 404 error, please paste the new Web App URL copied from your Google Apps Script project:',
      th: 'หากเซิร์ฟเวอร์แสดงข้อผิดพลาด 404 โปรดวาง URL ของ Web App ใหม่ที่คัดลอกมาจากโปรเจกต์ Google Apps Script ของคุณ:',
    },
    enterWebAppUrlFirst: {
      ar: 'يرجى إدخال رابط الـ Web App الخاص بك أولاً!',
      en: 'Please enter your Web App URL first!',
      th: 'โปรดป้อน URL ของ Web App ของคุณก่อน!',
    },
    testConnectionSuccess: {
      ar: 'تم اختبار الاتصال بالخادم بنجاح! الرابط يعمل بامتياز.',
      en: 'Server connection tested successfully! URL works perfectly.',
      th: 'ทดสอบการเชื่อมต่อเซิร์ฟเวอร์สำเร็จ! URL ทำงานได้อย่างสมบูรณ์',
    },
    testConnectionFailed: {
      ar: 'فشل الاتصال بهذا الرابط:',
      en: 'Connection failed to this URL:',
      th: 'การเชื่อมต่อไปยัง URL นี้ล้มเหลว:',
    },
    saveAndTestConnection: {
      ar: 'حفظ واختبار الاتصال',
      en: 'Save & Test Connection',
      th: 'บันทึกและทดสอบการเชื่อมต่อ',
    },
    defaultLabel: {
      ar: 'الافتراضي',
      en: 'Default',
      th: 'ค่าเริ่มต้น',
    },
    qrFormatMismatch: {
      ar: 'رمز QR لا يطابق صيغة الطالب (اسم|رقم)',
      en: 'QR code does not match student format (Name|ID)',
      th: 'รหัส QR ไม่ตรงกับรูปแบบนักเรียน (ชื่อ|รหัส)',
    },
    cameraAccessError: {
      ar: 'تعذر الوصول للكاميرا. يرجى التأكد من إعطاء الإذن أو تجربة رفع صورة QR.',
      en: 'Unable to access camera. Please check permissions or upload a QR image.',
      th: 'ไม่สามารถเข้าถึงกล้องได้ โปรดตรวจสอบการอนุญาตหรืออัปโหลดรูปภาพ QR',
    },
    noQrFoundInImage: {
      ar: 'لم يتم العثور على كود QR واضح في الصورة المرفوقة. يرجى اختيار صورة أوضح.',
      en: 'No clear QR code found in attached image. Please choose a clearer image.',
      th: 'ไม่พบคิวอาร์โค้ดที่ชัดเจนในภาพที่แนบมา โปรดเลือกภาพที่ชัดเจนขึ้น',
    },
    qrReadSuccessPrefix: {
      ar: 'تمت قراءة البيانات بنجاح:',
      en: 'Data read successfully:',
      th: 'อ่านข้อมูลสำเร็จ:',
    },
  },

  attendance: {
    earlyEntryBlockedBadge: {
      ar: 'نظام منع الدخول قبل الموعد مُفعّل',
      en: 'Early Entry Prevention Active',
      th: 'ระบบป้องกันการเข้าก่อนเวลาเปิดใช้งาน',
    },
    earlyEntryBlockedTitle: {
      ar: '🔒 موعد الحصة لم يبدأ بعد!',
      en: '🔒 Class time has not started yet!',
      th: '🔒 เวลาเรียนยังไม่เริ่มต้น!',
    },
    earlyEntryBlockedDesc: {
      ar: 'موعد بداية حصة اليوم هو الساعة {time}. يرجى الانتظار، وسيتم فتح التمارين تلقائياً عند حلول الموعد.',
      en: "Today's class start time is {time}. Please wait, exercises will unlock automatically when class starts.",
      th: 'เวลาเริ่มชั้นเรียนวันนี้คือ {time} โปรดรอ แบบฝึกหัดจะปลดล็อกโดยอัตโนมัติเมื่อถึงเวลา',
    },
    timeRemainingToClassStart: {
      ar: 'متبقي على فتح الحصة:',
      en: 'Time until class opens:',
      th: 'เวลาที่เหลือก่อนเปิดชั้นเรียน:',
    },
    forceLoginActiveBadge: {
      ar: 'نظام تسجيل الحضور الإجباري مفعّل',
      en: 'Mandatory Attendance System Active',
      th: 'เปิดใช้งานระบบการลงชื่อเข้าเรียนภาคบังคับ',
    },
    forceLoginTitle: {
      ar: '⏱️ يلزم تسجيل حضور الحصة لبدء التمارين والدروس',
      en: '⏱️ Punch-in required to start exercises and lessons',
      th: '⏱️ ต้องลงชื่อเข้าเรียนเพื่อเริ่มทำแบบฝึกหัดและบทเรียน',
    },
    forceLoginDesc: {
      ar: 'اضغط على زر تسجيل الحضور أدناه لتسجيل تواجدك في كشف الحضور وبدء الحصة المقررة لك اليوم وحل التمارين.',
      en: "Click the punch-in button below to mark your presence on the attendance sheet and begin today's scheduled class.",
      th: 'คลิกปุ่มลงชื่อเข้าเรียนด้านล่างเพื่อบันทึกการเข้าเรียนและเริ่มชั้นเรียนที่กำหนดในวันนี้',
    },
    punchInBtn: {
      ar: '🟢 تسجيل حضور ودخول الحصة الآن',
      en: '🟢 Punch In for Class Now',
      th: '🟢 ลงชื่อเข้าชั้นเรียนตอนนี้',
    },
    punchInSuccess: {
      ar: '🎉 تم تسجيل حضورك وبدء الحصة بنجاح! يمكنك الآن حل التمارين ومتابعة الدروس.',
      en: '🎉 Attendance recorded successfully! You can now solve exercises and follow lessons.',
      th: '🎉 บันทึกการเข้าเรียนสำเร็จแล้ว! คุณสามารถทำแบบฝึกหัดและเรียนบทเรียนได้แล้ว',
    },
    punchInWithDaySuccess: {
      ar: '🎉 أهلاً بك يا {name}.. تم تسجيل حضورك في اليوم {day} من البرنامج بنجاح! نتمنى لك علماً نافعاً وموفقاً. 🌟',
      en: '🎉 Welcome {name}.. Your attendance has been recorded for Day {day} of the program! Wishing you a blessed journey. 🌟',
      th: '🎉 ยินดีต้อนรับ {name}.. บันทึกการเข้าเรียนวันที่ {day} ของโปรแกรมสำเร็จแล้ว! ขอให้ประสบความสำเร็จในการเรียน 🌟',
    },
    punchInLocalSuccess: {
      ar: '✅ تم تسجيل الحضور محلياً بنجاح.',
      en: '✅ Attendance recorded locally.',
      th: '✅ บันทึกการเข้าเรียนในเครื่องสำเร็จ',
    },
    punchInRecorded: {
      ar: '✅ تم تسجيل حضور ودخول الحصة',
      en: '✅ Class punch-in recorded',
      th: '✅ บันทึกการลงชื่อเข้าเรียนเรียบร้อยแล้ว',
    },
    sessionActive: {
      ar: '🟢 الجلسة الحالية نشطة',
      en: '🟢 Current session is active',
      th: '🟢 เซสชันปัจจุบันกำลังทำงาน',
    },
    loginTimeLabel: {
      ar: 'توقيت الدخول:',
      en: 'Punch-in time:',
      th: 'เวลาที่เข้าสู่ระบบ:',
    },
    customTimeBadge: {
      ar: '⭐ موعدك الخاص:',
      en: '⭐ Your Custom Time:',
      th: '⭐ เวลาพิเศษของคุณ:',
    },
    attendanceLinkedNotice: {
      ar: 'حضورك مسجل ومربوط في كشف المعلم ولوحة المتابعة الحية.',
      en: 'Your attendance is logged in teacher records and live monitoring.',
      th: 'การเข้าเรียนของคุณได้รับการบันทึกในบันทึกของครูและระบบติดตามสด',
    },
    sessionRemainingTime: {
      ar: 'الوقت المتبقي للجلسة:',
      en: 'Session remaining time:',
      th: 'เวลาที่เหลือของเซสชัน:',
    },
    sessionExpired: {
      ar: 'انتهى وقت الحصة المحدد',
      en: 'Scheduled class time has expired',
      th: 'หมดเวลาชั้นเรียนที่กำหนดแล้ว',
    },
    sessionDurationExpired: {
      ar: 'انتهت مدة الجلسة',
      en: 'Session duration expired',
      th: 'หมดเวลาของเซสชันแล้ว',
    },
    timerStartsOnLogin: {
      ar: 'يبدأ العداد فور تسجيل الدخول',
      en: 'Timer starts upon punch-in',
      th: 'ตัวจับเวลาจะเริ่มเมื่อลงชื่อเข้าเรียน',
    },
    openSessionException: {
      ar: 'مفتوح (استثناء)',
      en: 'Open (Exception)',
      th: 'เปิดใช้งาน (ข้อยกเว้น)',
    },
    earlyEntryWarning: {
      ar: '🔒 موعد الحصة لم يبدأ بعد! تبدأ الحصة الساعة {time}',
      en: '🔒 Class time has not started yet! Class starts at {time}',
      th: '🔒 เวลาเรียนยังไม่เริ่ม! ชั้นเรียนจะเริ่มเวลา {time}',
    },
    classTimeExpiredWarning: {
      ar: '⚠️ انتهى الوقت المخصص للحصة المقررة اليوم.',
      en: "⚠️ Time allocated for today's scheduled class has ended.",
      th: '⚠️ หมดเวลาสำหรับชั้นเรียนที่กำหนดในวันนี้แล้ว',
    },
    inactivityTimeoutLabel: {
      ar: 'مهلة عدم النشاط التلقائية (Inactivity Timeout)',
      en: 'Inactivity Timeout (Auto Logout)',
      th: 'การหมดเวลาเมื่อไม่มีการใช้งาน (ออกจากระบบอัตโนมัติ)',
    },
    inactivityTimeoutDesc: {
      ar: 'تسجيل خروج الطالب تلقائياً عند انقطاع النشاط أو إغلاق الصفحة بعد انقضاء هذه المدة',
      en: 'Automatically logs out the student when activity stops or page closes after this duration',
      th: 'ออกจากระบบโดยอัตโนมัติเมื่อหยุดการใช้งานหรือปิดหน้าเว็บหลังจากครบกำหนดเวลานี้',
    },
    autoLoggedOutBadge: {
      ar: 'خروج تلقائي (انقطاع النشاط) ⚪',
      en: 'Auto Logged Out (Inactivity) ⚪',
      th: 'ออกจากระบบอัตโนมัติ (ไม่มีการใช้งาน) ⚪',
    },
    sessionResumedToast: {
      ar: 'تم استئناف جلسة حضورك بنجاح ✅',
      en: 'Your attendance session has been resumed successfully ✅',
      th: 'เซสชันการเข้าเรียนของคุณกลับมาทำงานต่อเรียบร้อยแล้ว ✅',
    },
    mustPunchInFirstBtn: {
      ar: 'سجل الحضور أولاً لبدء التمارين 🔓',
      en: 'Punch in first to unlock exercises 🔓',
      th: 'ลงชื่อเข้าเรียนก่อนเพื่อปลดล็อกแบบฝึกหัด 🔓',
    },
    classStartsAt: {
      ar: 'تبدأ الحصة الساعة {time}',
      en: 'Class starts at {time}',
      th: 'ชั้นเรียนเริ่มเวลา {time}',
    },
    classTimeExpired: {
      ar: 'انتهى وقت الحصة المقررة',
      en: 'Scheduled class time expired',
      th: 'หมดเวลาชั้นเรียนที่กำหนดแล้ว',
    },
    hoursShort: {
      ar: 'س',
      en: 'h',
      th: 'ชม.',
    },
    minutesShort: {
      ar: 'د',
      en: 'm',
      th: 'น.',
    },
    secondsShort: {
      ar: 'ث',
      en: 's',
      th: 'วิ',
    },
    closeAlert: {
      ar: 'إغلاق',
      en: 'Close',
      th: 'ปิด',
    },
  },

  monitoring: {
    liveMonitoringTitle: {
      ar: 'لوحة المتابعة المباشرة أونلاين',
      en: 'Live Online Monitoring Dashboard',
      th: 'แดชบอร์ดการติดตามออนไลน์แบบสด',
    },
    liveMonitoringDesc: {
      ar: 'متابعة دخول وخروج الطلاب وإنجاز الدروس في الوقت الفعلي',
      en: 'Track student logins, logouts, and lesson completions in real time',
      th: 'ติดตามการเข้าสู่ระบบ การออกจากระบบ และความคืบหน้าของบทเรียนแบบเรียลไทม์',
    },
    liveBadge: {
      ar: 'حي مباشر',
      en: 'Live',
      th: 'สด',
    },
    refreshNow: {
      ar: 'تحديث الآن',
      en: 'Refresh Now',
      th: 'รีเฟรชตอนนี้',
    },
    adminDashboardBtn: {
      ar: 'لوحة الإدارة',
      en: 'Admin Panel',
      th: 'แผงผู้ดูแล',
    },
    homeBtn: {
      ar: 'الرئيسية',
      en: 'Home',
      th: 'หน้าหลัก',
    },
    liveTab: {
      ar: 'لوحة المتابعة الحية',
      en: 'Live Monitoring',
      th: 'การติดตามสด',
    },
    settingsTab: {
      ar: 'إعدادات المتابعة والوقت',
      en: 'Monitoring & Time Settings',
      th: 'การตั้งค่าการติดตามและเวลา',
    },
    telegramTab: {
      ar: 'إعدادات وتنبيهات تليجرام (Telegram)',
      en: 'Telegram Settings',
      th: 'การตั้งค่า Telegram',
    },
    autoRefreshLabel: {
      ar: 'تحديث تلقائي (كل 15 ثانية)',
      en: 'Auto refresh (every 15s)',
      th: 'รีเฟรชอัตโนมัติ (ทุก 15 วินาที)',
    },
    lastRefreshLabel: {
      ar: 'آخر تحديث:',
      en: 'Last updated:',
      th: 'อัปเดตล่าสุด:',
    },
    fetchingMonitoringData: {
      ar: 'جاري جلب بيانات المتابعة الحية...',
      en: 'Fetching live monitoring data...',
      th: 'กำลังดึงข้อมูลการติดตามสด...',
    },
    fetchingMonitoringDesc: {
      ar: 'يتم قراءة جدول التخصيص وسجلات الحضور وإنجاز التمارين من الشيت سريعا',
      en: 'Reading schedule table, attendance logs, and exercise progress from sheet',
      th: 'กำลังอ่านตารางกำหนดเวลา บันทึกการเข้าเรียน และความคืบหน้าแบบฝึกหัดจากชีต',
    },
    activeNowMetric: {
      ar: '🟢 المتواجدون أونلاين الآن',
      en: '🟢 Active Online Now',
      th: '🟢 ใช้งานออนไลน์อยู่ในขณะนี้',
    },
    activeStudentsUnit: {
      ar: 'طلاب نشطون',
      en: 'Active students',
      th: 'นักเรียนที่ใช้งานอยู่',
    },
    activeStudentsDesc: {
      ar: 'متواجدون حالياً يتصفحون ويحلون التمارين',
      en: 'Currently online browsing and solving exercises',
      th: 'กำลังออนไลน์ เรียกดูและทำแบบฝึกหัด',
    },
    loggedOutMetric: {
      ar: '⚪ غادروا المنصة اليوم',
      en: '⚪ Left Platform Today',
      th: '⚪ ออกจากแพลตฟอร์มวันนี้',
    },
    loggedOutUnit: {
      ar: 'سجلوا خروجهم',
      en: 'Logged out',
      th: 'ออกจากระบบแล้ว',
    },
    loggedOutDesc: {
      ar: 'حضروا وسجلوا خروجهم بعد أداء الحصة',
      en: 'Attended and logged out after class',
      th: 'เข้าร่วมและออกจากระบบหลังเลิกเรียน',
    },
    completedMetric: {
      ar: '✅ أتموا دروس اليوم بنجاح',
      en: "✅ Completed Today's Lessons",
      th: '✅ ทำบทเรียนวันนี้เสร็จสมบูรณ์',
    },
    completedUnit: {
      ar: 'طلاب مكتملون',
      en: 'Completed students',
      th: 'นักเรียนที่ทำเสร็จแล้ว',
    },
    completedDesc: {
      ar: 'أنهوا حل تمارين وواجبات الحصة المقررة اليوم',
      en: 'Finished solving all exercises and assignments scheduled today',
      th: 'ทำแบบฝึกหัดและการบ้านทั้งหมดที่กำหนดในวันนี้เสร็จสิ้น',
    },
    absentMetric: {
      ar: '⚠️ غائبون / لم يدخلوا بعد',
      en: '⚠️ Absent / Not Logged In Yet',
      th: '⚠️ ขาดเรียน / ยังไม่ได้เข้าสู่ระบบ',
    },
    absentUnit: {
      ar: 'طلاب غائبون',
      en: 'Absent students',
      th: 'นักเรียนที่ขาดเรียน',
    },
    absentDesc: {
      ar: 'عندهم حصة دراسية مخصصة اليوم وحضورهم معلق',
      en: 'Have a scheduled class today with attendance pending',
      th: 'มีชั้นเรียนตามกำหนดในวันนี้แต่ยังไม่ได้ลงชื่อเข้าเรียน',
    },
    activeListTitle: {
      ar: '🟢 قائمة المتواجدين أونلاين الآن',
      en: '🟢 Online Students List',
      th: '🟢 รายชื่อนักเรียนที่ออนไลน์อยู่ในขณะนี้',
    },
    noActiveStudents: {
      ar: 'لا يوجد طلاب متواجدون أونلاين حالياً في هذه اللحظة.',
      en: 'No students currently online at the moment.',
      th: 'ขณะนี้ไม่มีนักเรียนออนไลน์',
    },
    loginLabel: {
      ar: 'دخول:',
      en: 'Login:',
      th: 'เข้าสู่ระบบ:',
    },
    lastActiveLabel: {
      ar: 'آخر نشاط:',
      en: 'Last active:',
      th: 'กิจกรรมล่าสุด:',
    },
    completedLessonsProgress: {
      ar: 'أنجز: {done} / {total}',
      en: 'Completed: {done} / {total}',
      th: 'ทำเสร็จแล้ว: {done} / {total}',
    },
    editCustomScheduleBtn: {
      ar: 'تعديل التوقيت',
      en: 'Edit Schedule',
      th: 'แก้ไขเวลา',
    },
    setCustomScheduleBtn: {
      ar: 'تخصيص توقيت',
      en: 'Customize Time',
      th: 'กำหนดเวลาเฉพาะ',
    },
    loggedOutListTitle: {
      ar: '⚪ قائمة الذين غادروا المنصة وسجلوا خروجهم',
      en: '⚪ Logged Out Students List',
      th: '⚪ รายชื่อนักเรียนที่ออกจากระบบแล้ว',
    },
    noLoggedOutStudents: {
      ar: 'لم يسجل أي طالب خروجه حتى الآن اليوم.',
      en: 'No student has logged out yet today.',
      th: 'ยังไม่มีนักเรียนออกจากระบบในวันนี้',
    },
    completedListTitle: {
      ar: '✅ قائمة الذين أتموا دروس اليوم بالكامل',
      en: '✅ Completed Students List',
      th: '✅ รายชื่อนักเรียนที่ทำบทเรียนครบถ้วน',
    },
    noCompletedStudents: {
      ar: 'لم يكمل أي طالب دروس اليوم حتى الآن.',
      en: 'No student has completed today\'s lessons yet.',
      th: 'ยังไม่มีนักเรียนคนใดทำบทเรียนวันนี้เสร็จ',
    },
    completedAllExercises: {
      ar: 'أتم جميع التمارين المقررة ({count} دروس)',
      en: 'Completed all scheduled exercises ({count} lessons)',
      th: 'ทำแบบฝึกหัดที่กำหนดทั้งหมดเสร็จแล้ว ({count} บทเรียน)',
    },
    completed100Pct: {
      ar: 'مكتمل 100% ✨',
      en: '100% Completed ✨',
      th: 'เสร็จสมบูรณ์ 100% ✨',
    },
    absentListTitle: {
      ar: '⚠️ قائمة الغائبين / المعلقين اليوم',
      en: '⚠️ Absent / Pending Students List',
      th: '⚠️ รายชื่อนักเรียนที่ขาดเรียน / รอดำเนินการ',
    },
    allStudentsAttendedMsg: {
      ar: '🎉 ممتاز! جميع الطلاب المقرر عليهم دراسة اليوم حضروا أو أتموا دروسهم.',
      en: '🎉 Excellent! All students scheduled for today have attended or completed their lessons.',
      th: '🎉 ยอดเยี่ยมมาก! นักเรียนทุกคนที่มีกำหนดเรียนในวันนี้ได้เข้าร่วมหรือทำบทเรียนเสร็จแล้ว',
    },
    requiredLessonsToday: {
      ar: 'مطلوب منه اليوم {count} دروس',
      en: 'Required today: {count} lessons',
      th: 'จำเป็นต้องเรียนวันนี้: {count} บทเรียน',
    },
    absentPendingBadge: {
      ar: 'معلق / غائب ⚠️',
      en: 'Pending / Absent ⚠️',
      th: 'รอดำเนินการ / ขาดเรียน ⚠️',
    },
  },

  attendanceSettings: {
    generalSettingsTitle: {
      ar: '🏛️ الإعدادات العامة لجميع الطلاب (الخطة الافتراضية للشعبة)',
      en: '🏛️ General Settings for All Students (Default Class Plan)',
      th: '🏛️ การตั้งค่าทั่วไปสำหรับนักเรียนทุกคน (แผนชั้นเรียนเริ่มต้น)',
    },
    generalSettingsSubtitle: {
      ar: 'تطبق هذه الخطة تلقائياً على كافة الطلاب ما لم يتم تخصيص وقت فردي لطالب محدد',
      en: 'Applied automatically to all students unless individual custom time is configured',
      th: 'มีผลกับนักเรียนทุกคนโดยอัตโนมัติเว้นแต่จะมีการกำหนดเวลาเฉพาะสำหรับนักเรียนแต่ละคน',
    },
    generalStartTimeLabel: {
      ar: '⏰ توقيت بداية الحصة العام:',
      en: '⏰ General Class Start Time:',
      th: '⏰ เวลาเริ่มชั้นเรียนทั่วไป:',
    },
    generalStartTimeDesc: {
      ar: 'وقت انطلاق الحصة الرسمي المعتمد للشعبة (مثال: 19:00 يعادل 7:00 مساءً)',
      en: 'Official start time approved for the section (e.g. 19:00 equals 7:00 PM)',
      th: 'เวลาเริ่มต้นอย่างเป็นทางการสำหรับชั้นเรียน (เช่น 19:00 คือ 19:00 น.)',
    },
    exceptionStudentsLabel: {
      ar: '👥 قائمة السماح بالدخول الاستثنائي (أسماء/أرقام الطلاب):',
      en: '👥 Exception Allowed Students (Names/IDs):',
      th: '👥 รายชื่อนักเรียนที่ได้รับข้อยกเว้น (ชื่อ/รหัส):',
    },
    exceptionStudentsPlaceholder: {
      ar: 'مثال: أحمد علي, 102, 105',
      en: 'e.g.: Ahmed Ali, 102, 105',
      th: 'เช่น: อะห์มัด อาลี, 102, 105',
    },
    exceptionStudentsDesc: {
      ar: 'فصل الأسماء أو الأرقام بفواصل لإعطاء هؤلاء الطلاب إمكانية الدخول المفتوح دون قيود',
      en: 'Separate names or IDs with commas to grant unrestricted access',
      th: 'คั่นชื่อหรือรหัสด้วยเครื่องหมายจุลภาคเพื่อให้เข้าถึงได้โดยไม่มีข้อจำกัด',
    },
    durationCalculationTitle: {
      ar: 'طريقة احتساب مدة الحصة العامة (اختر نوعاً واحداً للتفعيل):',
      en: 'Class Duration Calculation Method (Choose one to activate):',
      th: 'วิธีการคำนวณระยะเวลาชั้นเรียน (เลือกหนึ่งอย่างเพื่อเปิดใช้งาน):',
    },
    durationCalculationSubtitle: {
      ar: 'يتم تفعيل خيار واحد فقط لضبط العداد التنازلي ونهاية الجلسة لجميع الطلاب',
      en: 'Only one option is active to control countdown and session end for all students',
      th: 'เปิดใช้งานเพียงตัวเลือกเดียวเพื่อควบคุมการนับถอยหลังและสิ้นสุดเซสชันสำหรับนักเรียนทุกคน',
    },
    fromStartTimeOpt: {
      ar: '1️⃣ من بداية توقيت الحصة العام ({time})',
      en: '1️⃣ From General Class Start Time ({time})',
      th: '1️⃣ จากเวลาเริ่มต้นชั้นเรียนทั่วไป ({time})',
    },
    fromStudentLoginOpt: {
      ar: '2️⃣ من لحظة تسجيل دخول الطالب الفعلي',
      en: '2️⃣ From Actual Student Punch-In Time',
      th: '2️⃣ จากเวลาที่นักเรียนลงชื่อเข้าเรียนจริง',
    },
    activeNowBadge: {
      ar: 'مُفعّل الآن',
      en: 'Active Now',
      th: 'เปิดใช้งานแล้ว',
    },
    durationInMinutes: {
      ar: 'مدة الحصة بالدقائق:',
      en: 'Class duration in minutes:',
      th: 'ระยะเวลาชั้นเรียนเป็นนาที:',
    },
    fromStartTimeHelp: {
      ar: 'تنتهي الحصة للجميع عند حلول: وقت البدء + هذه المدة',
      en: 'Class ends for everyone at: Start time + this duration',
      th: 'ชั้นเรียนจะสิ้นสุดสำหรับทุกคนที่: เวลาเริ่มต้น + ระยะเวลานี้',
    },
    fromStudentLoginHelp: {
      ar: 'يبدأ العداد الفردي لكل طالب فور تسجيل دخوله للحصة وتستمر معه هذه المدة',
      en: 'Individual timer starts for each student upon login and lasts for this duration',
      th: 'ตัวจับเวลาส่วนบุคคลจะเริ่มสำหรับนักเรียนแต่ละคนเมื่อเข้าสู่ระบบและคงอยู่ตามระยะเวลานี้',
    },
    forceLoginToggleTitle: {
      ar: 'إجبار تسجيل الدخول للحصة:',
      en: 'Require Class Punch-In:',
      th: 'บังคับให้ลงชื่อเข้าเรียน:',
    },
    forceLoginToggleDesc: {
      ar: 'يلزم الطالب بالضغط على "تسجيل دخول الحصة" أولاً لفتح التمارين',
      en: 'Requires student to click "Punch In" first to unlock exercises',
      th: 'กำหนดให้นักเรียนต้องคลิก "ลงชื่อเข้าเรียน" ก่อนเพื่อปลดล็อกแบบฝึกหัด',
    },
    preventEarlyEntryToggleTitle: {
      ar: 'منع الدخول قبل الوقت المحدد:',
      en: 'Prevent Early Entry Before Start Time:',
      th: 'ป้องกันการเข้าก่อนเวลาที่กำหนด:',
    },
    preventEarlyEntryToggleDesc: {
      ar: 'قفل التمارين من بداية اليوم حتى موعد البدء العام ({time})',
      en: 'Lock exercises until general start time ({time})',
      th: 'ล็อกแบบฝึกหัดจนกว่าจะถึงเวลาเริ่มต้นทั่วไป ({time})',
    },
    timeRestrictedToggleTitle: {
      ar: 'التقيد بالوقت وقفل التمارين:',
      en: 'Time Restriction & Lock Exercises:',
      th: 'จำกัดเวลาและล็อกแบบฝึกหัด:',
    },
    timeRestrictedToggleDesc: {
      ar: 'عند انتهاء مدة الحصة، تقفل أزرار بدء الأنشطة والتمارين فقط',
      en: 'When session time expires, exercise start buttons are locked',
      th: 'เมื่อหมดเวลาเซสชัน ปุ่มเริ่มทำแบบฝึกหัดจะถูกล็อก',
    },
    saveGeneralSettingsBtn: {
      ar: 'حفظ الإعدادات العامة للشعبة',
      en: 'Save General Settings',
      th: 'บันทึกการตั้งค่าทั่วไป',
    },
  },

  studentOverrides: {
    studentOverridesTitle: {
      ar: '🎯 تخصيص مواعيد وإعدادات الطلاب الفردية (Student Overrides)',
      en: '🎯 Individual Student Custom Schedule & Overrides',
      th: '🎯 การกำหนดเวลาและการตั้งค่าเฉพาะสำหรับนักเรียนรายบุคคล',
    },
    studentOverridesSubtitle: {
      ar: 'تحديد توقيت أو مدة أو قواعد استثنائية لطالب محدد في ورقة StudentSchedule دون التأثير على بقية زملائه',
      en: 'Configure custom time, duration, or rules for a specific student without affecting classmates',
      th: 'กำหนดเวลา ระยะเวลา หรือกฎพิเศษสำหรับนักเรียนเฉพาะคนโดยไม่ส่งผลกระทบต่อเพื่อนร่วมชั้น',
    },
    customizedStudentsCount: {
      ar: 'طلاب مخصصين',
      en: 'Customized Students',
      th: 'นักเรียนที่กำหนดเวลาเฉพาะ',
    },
    editStudentOverride: {
      ar: 'تعديل تخصيص الطالب المحدد',
      en: 'Edit Selected Student Override',
      th: 'แก้ไขการกำหนดเวลาของนักเรียนที่เลือก',
    },
    quickAddOverride: {
      ar: 'شريط الإضافة / التخصيص السريع لطالب:',
      en: 'Quick Add / Student Override Bar:',
      th: 'แถบเพิ่ม / กำหนดเวลานักเรียนด่วน:',
    },
    cancelEditBtn: {
      ar: 'إلغاء التعديل والعودة للإضافة',
      en: 'Cancel Edit & Return to Add',
      th: 'ยกเลิกการแก้ไขและกลับสู่การเพิ่ม',
    },
    selectStudentLabel: {
      ar: 'الطالب:',
      en: 'Student:',
      th: 'นักเรียน:',
    },
    selectStudentPlaceholder: {
      ar: '-- اختر الطالب --',
      en: '-- Select Student --',
      th: '-- เลือกนักเรียน --',
    },
    customStartTimeLabel: {
      ar: '⏰ وقت البدء الخاص:',
      en: '⏰ Custom Start Time:',
      th: '⏰ เวลาเริ่มต้นเฉพาะ:',
    },
    customDurationLabel: {
      ar: '⏳ مدة الحصة (دقيقة):',
      en: '⏳ Class Duration (minutes):',
      th: '⏳ ระยะเวลาชั้นเรียน (นาที):',
    },
    customDurationTypeLabel: {
      ar: '⚙️ نوع الاحتساب:',
      en: '⚙️ Calculation Type:',
      th: '⚙️ ประเภทการคำนวณ:',
    },
    fromLoginOption: {
      ar: 'من لحظة تسجيل الدخول',
      en: 'From Punch-in Moment',
      th: 'จากช่วงเวลาที่ลงชื่อเข้าเรียน',
    },
    fromStartOption: {
      ar: 'من وقت البدء المحدد',
      en: 'From Specific Start Time',
      th: 'จากเวลาเริ่มต้นที่ระบุ',
    },
    preventEarlyEntryLabel: {
      ar: 'منع الدخول قبل الموعد:',
      en: 'Prevent Early Entry:',
      th: 'ป้องกันการเข้าก่อนเวลา:',
    },
    forceLoginLabel: {
      ar: 'إجباري تسجيل الدخول:',
      en: 'Mandatory Punch-in:',
      th: 'บังคับลงชื่อเข้าเรียน:',
    },
    enabled: {
      ar: 'مُفعّل',
      en: 'Enabled',
      th: 'เปิดใช้งาน',
    },
    disabled: {
      ar: 'معطل',
      en: 'Disabled',
      th: 'ปิดใช้งาน',
    },
    optional: {
      ar: 'اختياري',
      en: 'Optional',
      th: 'ทางเลือก',
    },
    updateStudentOverrideBtn: {
      ar: 'تحديث التخصيص للطالب',
      en: 'Update Student Override',
      th: 'อัปเดตการกำหนดเวลาของนักเรียน',
    },
    saveStudentOverrideBtn: {
      ar: '➕ حفظ تخصيص الطالب',
      en: '➕ Save Student Override',
      th: '➕ บันทึกการกำหนดเวลานักเรียน',
    },
    currentOverridesList: {
      ar: 'قائمة الطلاب الذين لديهم مواعيد مخصصة حالياً:',
      en: 'Currently Customized Students List:',
      th: 'รายชื่อนักเรียนที่มีการกำหนดเวลาเฉพาะในปัจจุบัน:',
    },
    searchStudentPlaceholder: {
      ar: 'بحث بالاسم أو الرقم...',
      en: 'Search by name or ID...',
      th: 'ค้นหาตามชื่อหรือรหัส...',
    },
    allStudentsFollowGeneralPlan: {
      ar: 'جميع الطلاب يتبعون حالياً الخطة العامة الموحدة للشعبة',
      en: 'All students currently follow the unified class plan',
      th: 'นักเรียนทุกคนในปัจจุบันปฏิบัติตามแผนรวมของชั้นเรียน',
    },
    noCustomOverridesDesc: {
      ar: 'لم يتم تعيين وقت استثنائي لأي طالب حتى الآن. إذا كان هناك طالب يحتاج موعداً أو مدة خاصة، يمكنك اختياره وتعيينه من الشريط أعلاه.',
      en: 'No custom times set yet. If a student requires a custom schedule, you can select and configure them above.',
      th: 'ยังไม่มีการตั้งเวลาพิเศษสำหรับนักเรียนคนใด หากมีนักเรียนที่ต้องการเวลาพิเศษ คุณสามารถเลือกและกำหนดได้จากแถบด้านบน',
    },
    noSearchResults: {
      ar: 'لا يوجد نتائج مطابقة للبحث',
      en: 'No results matching search',
      th: 'ไม่พบผลลัพธ์ที่ตรงกับการค้นหา',
    },
    colStudent: {
      ar: 'الطالب',
      en: 'Student',
      th: 'นักเรียน',
    },
    colCustomStartTime: {
      ar: '⏰ وقت البدء الخاص',
      en: '⏰ Custom Start Time',
      th: '⏰ เวลาเริ่มต้นเฉพาะ',
    },
    colCustomDuration: {
      ar: '⏳ مدة الجلسة ونوعها',
      en: '⏳ Session Duration & Type',
      th: '⏳ ระยะเวลาและประเภทเซสชัน',
    },
    colPreventEarlyEntry: {
      ar: '🛡️ منع الدخول المبكر',
      en: '🛡️ Prevent Early Entry',
      th: '🛡️ ป้องกันการเข้าก่อนเวลา',
    },
    colForceLogin: {
      ar: '🔒 إجباري الدخول',
      en: '🔒 Mandatory Punch-in',
      th: '🔒 บังคับลงชื่อเข้าเรียน',
    },
    colActions: {
      ar: 'الإجراءات',
      en: 'Actions',
      th: 'การดำเนินการ',
    },
    confirmDeleteOverride: {
      ar: 'هل أنت متأكد من إلغاء التخصيص للطالب وإعادته لاتباع الإعدادات العامة للشعبة؟',
      en: 'Are you sure you want to reset custom settings for this student back to general defaults?',
      th: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการกำหนดเวลาเฉพาะสำหรับนักเรียนคนนี้และกลับไปใช้การตั้งค่าทั่วไป?',
    },
    overrideDeletedSuccess: {
      ar: '✅ تم إلغاء تخصيص الطالب وإعادته للإعدادات العامة بنجاح.',
      en: '✅ Custom schedule for student removed successfully.',
      th: '✅ ยกเลิกการกำหนดเวลาเฉพาะสำหรับนักเรียนสำเร็จแล้ว',
    },
    overrideSavedSuccess: {
      ar: '✅ تم حفظ التخصيص الفردي للطالب بنجاح!',
      en: '✅ Custom schedule for student saved successfully!',
      th: '✅ บันทึกการกำหนดเวลาเฉพาะสำหรับนักเรียนสำเร็จแล้ว!',
    },
    editingStudentMsg: {
      ar: '✏️ جاري تعديل تخصيص الطالب:',
      en: '✏️ Editing override for:',
      th: '✏️ กำลังแก้ไขการกำหนดเวลาสำหรับ:',
    },
    editOverrideTitle: {
      ar: 'تعديل هذا التخصيص',
      en: 'Edit this override',
      th: 'แก้ไขการกำหนดเวลานี้',
    },
    deleteOverrideTitle: {
      ar: 'إلغاء التخصيص والعودة للخطة العامة',
      en: 'Delete override and return to general plan',
      th: 'ลบการกำหนดเวลาและกลับสู่แผนทั่วไป',
    },
  },

  telegram: {
    telegramSettingsTitle: {
      ar: 'منظومة ومركز إشعارات وتنبيهات تليجرام (Telegram Communication Hub)',
      en: 'Telegram Communication & Notification Hub',
      th: 'ศูนย์กลางการแจ้งเตือนและการสื่อสาร Telegram',
    },
    telegramSettingsSubtitle: {
      ar: 'إدارة شاملة لربط الطلاب والمعلمين والإدارة، إرسال الرسائل المباشرة، محرر القوالب ثلاثي اللغات، وصيغ الاستعلامات التفاعلية',
      en: 'Comprehensive management for connecting students, teachers & admins, direct messaging, trilingual templates, and interactive bot commands',
      th: 'การจัดการที่ครอบคลุมสำหรับการเชื่อมต่อนักเรียน ครู และผู้ดูแล ระบบส่งข้อความ เทมเพลต 3 ภาษา และคำสั่งบอทโต้ตอบ',
    },
    subTabSettings: {
      ar: '⚙️ إعدادات البوت والقناة الإدارية',
      en: '⚙️ Bot & Admin Channel Setup',
      th: '⚙️ ตั้งค่าบอทและช่องผู้ดูแล',
    },
    subTabDirectory: {
      ar: '👥 دليل ربط المستخدمين (معلمين وطلاب)',
      en: '👥 User Directory (Teachers & Students)',
      th: '👥 รายชื่อผู้ใช้ (ครูและนักเรียน)',
    },
    subTabDirectMessage: {
      ar: '✉️ مركز إرسال الرسائل والوسائط',
      en: '✉️ Direct Messaging & Media Center',
      th: '✉️ ศูนย์ส่งข้อความและสื่อ',
    },
    subTabTemplates: {
      ar: '📝 محرر القوالب متعدد اللغات',
      en: '📝 Multi-Language Templates Hub',
      th: '📝 ศูนย์เทมเพลตหลายภาษา',
    },
    subTabCommands: {
      ar: '💬 صيغ وقواعد الاستعلامات التفاعلية',
      en: '💬 Interactive Bot Commands',
      th: '💬 คำสั่งและการโต้ตอบของบอท',
    },
    botTokenLabel: {
      ar: 'رمز البوت الخاص (Telegram Bot Token):',
      en: 'Telegram Bot Token:',
      th: 'โทเค็นบอท Telegram:',
    },
    botTokenPlaceholder: {
      ar: 'مثال: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      en: 'e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      th: 'เช่น 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
    },
    botTokenDesc: {
      ar: 'رمز API المحصل من @BotFather على تليجرام',
      en: 'API Token obtained from @BotFather on Telegram',
      th: 'โทเค็น API ที่ได้จาก @BotFather บน Telegram',
    },
    testBotTokenBtn: {
      ar: 'فحص واختبار رمز البوت',
      en: 'Test Bot Token',
      th: 'ทดสอบโทเค็นบอท',
    },
    testingBot: {
      ar: 'جاري فحص البوت...',
      en: 'Testing bot...',
      th: 'กำลังทดสอบบอท...',
    },
    botConnectedSuccess: {
      ar: 'تم الاتصال بالبوت بنجاح: @{username}',
      en: 'Bot connected successfully: @{username}',
      th: 'เชื่อมต่อบอทสำเร็จ: @{username}',
    },
    chatIdLabel: {
      ar: 'معرف القناة / المجموعة الإدارية (Admin Telegram Chat ID):',
      en: 'Admin Channel / Group Chat ID:',
      th: 'รหัสแชทช่อง/กลุ่มผู้ดูแล:',
    },
    chatIdPlaceholder: {
      ar: 'مثال: 1001234567890- أو MyChannel@',
      en: 'e.g. -1001234567890 or @MyChannel',
      th: 'เช่น -1001234567890 หรือ @MyChannel',
    },
    chatIdDesc: {
      ar: 'معرّف الشات المطلوب إرسال إشعارات الإدارة العامة وتقارير الشعبة إليه',
      en: 'Chat ID to receive admin alerts, section summaries, and monitoring reports',
      th: 'รหัสแชทสำหรับรับการแจ้งเตือนของผู้ดูแล สรุปผลชั้นเรียน และรายงานการติดตาม',
    },
    sendTestAdminMsgBtn: {
      ar: 'إرسال رسالة تجريبية للقناة',
      en: 'Send Test Admin Message',
      th: 'ส่งข้อความทดสอบไปยังช่อง',
    },
    enableTelegramLabel: {
      ar: 'تفعيل إشعارات تليجرام التلقائية:',
      en: 'Enable Automatic Telegram Notifications:',
      th: 'เปิดใช้งานการแจ้งเตือน Telegram อัตโนมัติ:',
    },
    enableTelegramDesc: {
      ar: 'إرسال الإشعارات تلقائياً للتليجرام عند الدخول أو الإنجاز أو التنبيه',
      en: 'Send notifications automatically to Telegram on punch-in, completion, or alerts',
      th: 'ส่งการแจ้งเตือนไปยัง Telegram โดยอัตโนมัติเมื่อลงชื่อเข้าเรียน ทำเสร็จ หรือแจ้งเตือน',
    },
    // Teachers Directory
    teachersSectionTitle: {
      ar: '👨‍🏫 دليل الأساتذة والمعلمين (Teachers Directory)',
      en: '👨‍🏫 Teachers Directory',
      th: '👨‍🏫 รายชื่อครูและอาจารย์',
    },
    addTeacherBtn: {
      ar: '➕ إضافة معلم جديد',
      en: '➕ Add New Teacher',
      th: '➕ เพิ่มครูใหม่',
    },
    teacherName: {
      ar: 'اسم المعلم:',
      en: 'Teacher Name:',
      th: 'ชื่อครู:',
    },
    teacherRole: {
      ar: 'الدور / المادة:',
      en: 'Role / Subject:',
      th: 'บทบาท / วิชา:',
    },
    teacherChatId: {
      ar: 'معرف تيليجرام (Telegram ID):',
      en: 'Telegram Chat ID:',
      th: 'รหัสแชท Telegram:',
    },
    teacherPhone: {
      ar: 'رقم الهاتف (اختياري):',
      en: 'Phone (optional):',
      th: 'เบอร์โทรศัพท์ (ถ้ามี):',
    },
    // Students Directory
    studentsSectionTitle: {
      ar: '🎓 دليل ربط الطلاب وأولياء الأمور (Students Directory)',
      en: '🎓 Students & Guardians Directory',
      th: '🎓 รายชื่อนักเรียนและผู้ปกครอง',
    },
    studentChatIdCol: {
      ar: 'معرف تيليجرام الخاص للطالب',
      en: 'Student Telegram Chat ID',
      th: 'รหัสแชท Telegram ของนักเรียน',
    },
    preferredLangCol: {
      ar: 'لغة الإشعارات المفضلة',
      en: 'Preferred Notification Language',
      th: 'ภาษาการแจ้งเตือนที่ต้องการ',
    },
    sendTestToStudent: {
      ar: 'إرسال تجريبي للطالب',
      en: 'Send Test to Student',
      th: 'ส่งข้อความทดสอบให้นักเรียน',
    },
    // Direct Messaging Center
    directMessageTitle: {
      ar: '✉️ مركز إرسال الرسائل المباشرة والوسائط للطلاب والأساتذة',
      en: '✉️ Direct Messaging & Media Dispatch Center',
      th: '✉️ ศูนย์ส่งข้อความโดยตรงและสื่อสำหรับนักเรียนและครู',
    },
    recipientLabel: {
      ar: 'المستلم المستهدف:',
      en: 'Target Recipient:',
      th: 'ผู้รับเป้าหมาย:',
    },
    recipientAdminChannel: {
      ar: '🏛️ القناة / المجموعة الإدارية العامة',
      en: '🏛️ General Admin Channel / Group',
      th: '🏛️ ช่อง/กลุ่มทั่วไปของผู้ดูแล',
    },
    recipientAllStudents: {
      ar: '👥 جميع الطلاب المسجلين (تعميم جماعي)',
      en: '👥 All Registered Students (Broadcast)',
      th: '👥 นักเรียนที่ลงทะเบียนทุกคน (ประกาศทั่วไป)',
    },
    recipientAllTeachers: {
      ar: '👨‍🏫 جميع الأساتذة والمعلمين',
      en: '👨‍🏫 All Teachers',
      th: '👨‍🏫 ครูและอาจารย์ทุกคน',
    },
    recipientSpecificStudent: {
      ar: '🎓 طالب محدد...',
      en: '🎓 Specific Student...',
      th: '🎓 นักเรียนเฉพาะคน...',
    },
    recipientSpecificTeacher: {
      ar: '👨‍🏫 معلم محدد...',
      en: '👨‍🏫 Specific Teacher...',
      th: '👨‍🏫 ครูเฉพาะคน...',
    },
    messageContentLabel: {
      ar: 'نص الرسالة:',
      en: 'Message Content:',
      th: 'เนื้อหาข้อความ:',
    },
    messageContentPlaceholder: {
      ar: 'اكتب نص الرسالة هنا... يمكنك استخدام التنسيقات والروابط التفاعلية',
      en: 'Type message here... You can use formatting and interactive links',
      th: 'พิมพ์ข้อความที่นี่... คุณสามารถใช้การจัดรูปแบบและลิงก์แบบโต้ตอบได้',
    },
    mediaTypeLabel: {
      ar: 'نوع المرفق (اختياري):',
      en: 'Attachment Type (optional):',
      th: 'ประเภทไฟล์แนบ (ถ้ามี):',
    },
    mediaTypeNone: {
      ar: 'بدون مرفق (نص فقط)',
      en: 'No Attachment (Text Only)',
      th: 'ไม่มีไฟล์แนบ (ข้อความเท่านั้น)',
    },
    mediaTypePhoto: {
      ar: '🖼️ صورة (Photo)',
      en: '🖼️ Photo',
      th: '🖼️ รูปภาพ',
    },
    mediaTypeVideo: {
      ar: '🎬 فيديو (Video)',
      en: '🎬 Video',
      th: '🎬 วิดีโอ',
    },
    mediaTypeAudio: {
      ar: '🎙️ مقطع صوتي (Audio)',
      en: '🎙️ Audio',
      th: '🎙️ ไฟล์เสียง',
    },
    mediaTypeDocument: {
      ar: '📄 مستند / ملف PDF (Document)',
      en: '📄 Document / PDF',
      th: '📄 เอกสาร / PDF',
    },
    mediaUrlLabel: {
      ar: 'رابط الوسائط المرفقة (URL):',
      en: 'Media Attachment URL:',
      th: 'URL ไฟล์แนบสื่อ:',
    },
    mediaUrlPlaceholder: {
      ar: 'مثال: https://example.com/image.jpg أو رابط من Google Drive',
      en: 'e.g. https://example.com/image.jpg or Google Drive link',
      th: 'เช่น https://example.com/image.jpg หรือลิงก์ Google Drive',
    },
    sendDirectMessageBtn: {
      ar: '🚀 إرسال الرسالة الآن عبر تليجرام',
      en: '🚀 Send Message Now via Telegram',
      th: '🚀 ส่งข้อความทันทีผ่าน Telegram',
    },
    sendingMessage: {
      ar: 'جاري الإرسال...',
      en: 'Sending...',
      th: 'กำลังส่ง...',
    },
    messageSentSuccess: {
      ar: '✅ تم إرسال الرسالة بنجاح عبر تليجرام!',
      en: '✅ Message sent successfully via Telegram!',
      th: '✅ ส่งข้อความผ่าน Telegram สำเร็จแล้ว!',
    },
    // Templates Hub
    templatesTitle: {
      ar: '📝 محرر قوالب الرسائل الستة متعدد اللغات',
      en: '📝 Trilingual Templates Hub (6 Message Types)',
      th: '📝 ศูนย์เทมเพลต 3 ภาษา (6 ประเภทข้อความ)',
    },
    templatesHelp: {
      ar: 'يمكنك استخدام المتغيرات التلقائية: {{اسم_الطالب}}، {{رقم_الطالب}}، {{الوقت}}، {{الدرس}}، {{الدرجة}}، {{النجوم}}، {{الايام}}، {{المعلم}}',
      en: 'Available variables: {{اسم_الطالب}}, {{رقم_الطالب}}, {{الوقت}}, {{الدرس}}, {{الدرجة}}, {{النجوم}}, {{الايام}}, {{المعلم}}',
      th: 'ตัวแปรที่ใช้ได้: {{اسم_الطالب}}, {{رقم_الطالب}}, {{الوقت}}, {{الدرس}}, {{الدرجة}}, {{النجوم}}, {{الايام}}, {{المعلم}}',
    },
    langSelectAr: {
      ar: '🇸🇦 اللغة العربية',
      en: '🇸🇦 Arabic',
      th: '🇸🇦 ภาษาอาหรับ',
    },
    langSelectEn: {
      ar: '🇬🇧 English',
      en: '🇬🇧 English',
      th: '🇬🇧 ภาษาอังกฤษ',
    },
    langSelectTh: {
      ar: '🇹🇭 ภาษาไทย (Thai)',
      en: '🇹🇭 ภาษาไทย (Thai)',
      th: '🇹🇭 ภาษาไทย (Thai)',
    },
    templateWelcome: {
      ar: '👋 1. رسالة الترحيب وبداية التسجيل:',
      en: '👋 1. Welcome & Onboarding Message:',
      th: '👋 1. ข้อความต้อนรับและการลงทะเบียน:',
    },
    templatePreClass: {
      ar: '⏰ 2. رسالة التذكير قبل موعد الحصة:',
      en: '⏰ 2. Pre-class Reminder Message:',
      th: '⏰ 2. ข้อความเตือนความจำก่อนเริ่มชั้นเรียน:',
    },
    templateLogin: {
      ar: '🟢 3. رسالة إشعار تسجيل الحضور والدخول:',
      en: '🟢 3. Punch-in & Attendance Message:',
      th: '🟢 3. ข้อความแจ้งเตือนการลงชื่อเข้าเรียน:',
    },
    templateAbsent: {
      ar: '⚠️ 4. رسالة إنذار التأخر أو الغياب:',
      en: '⚠️ 4. Delay & Absence Alert Message:',
      th: '⚠️ 4. ข้อความแจ้งเตือนมาสายหรือขาดเรียน:',
    },
    templateComplete: {
      ar: '🎉 5. رسالة إكمال الدروس بنجاح:',
      en: '🎉 5. Lesson Completion Message:',
      th: '🎉 5. ข้อความแจ้งบทเรียนเสร็จสมบูรณ์:',
    },
    templateEvaluation: {
      ar: '⭐ 6. رسالة بطاقة التقييم وتأكيد الإجابات (من ConsolidatedEvaluations):',
      en: '⭐ 6. Evaluation Card & Score Confirmation (from ConsolidatedEvaluations):',
      th: '⭐ 6. บัตรประเมินและยืนยันคะแนน (จาก ConsolidatedEvaluations):',
    },
    templateAdminAlert: {
      ar: '📢 7. رسالة التعاميم والإعلانات الإدارية:',
      en: '📢 7. Admin Announcements & Broadcasts:',
      th: '📢 7. ประกาศและแถลงการณ์จากฝ่ายบริหาร:',
    },
    templateScheduleReminder: {
      ar: '📅 8. رسالة جدول الحصص والدروس المعتمدة:',
      en: '📅 8. Class Schedule & Assigned Lessons:',
      th: '📅 8. ตารางเรียนและบทเรียนที่กำหนด:',
    },
    templateTeacherAlert: {
      ar: '👨‍🏫 9. إشعار المعلم عند دخول أو تسليم الطالب:',
      en: '👨‍🏫 9. Teacher Notification on Student Action:',
      th: '👨‍🏫 9. แจ้งเตือนครูเมื่อนักเรียนเข้าสู่ระบบหรือส่งงาน:',
    },
    // Bot Commands
    botCommandsTitle: {
      ar: '💬 صيغ وقواعد الاستعلامات التفاعلية للبوت (Bot Commands)',
      en: '💬 Interactive Bot Commands & Query Rules',
      th: '💬 คำสั่งบอทโต้ตอบและกฎการสอบถาม',
    },
    botCommandsSubtitle: {
      ar: 'تحديد ردود البوت التلقائية عندما يرسل الطالب أمراً مثل /schedule أو /results أو /remaining باللغات الثلاث',
      en: 'Configure automatic responses when student queries /schedule, /results, or /remaining in 3 languages',
      th: 'กำหนดการตอบกลับอัตโนมัติเมื่อนักเรียนส่งคำสั่ง เช่น /schedule, /results หรือ /remaining ใน 3 ภาษา',
    },
    cmdScheduleLabel: {
      ar: '📅 أمر استعلام جدول الحصص (/schedule):',
      en: '📅 Schedule Query Command (/schedule):',
      th: '📅 คำสั่งสอบถามตารางเรียน (/schedule):',
    },
    cmdResultsLabel: {
      ar: '⭐ أمر استعلام النتائج والدرجات (/results):',
      en: '⭐ Results & Grades Query (/results):',
      th: '⭐ คำสั่งสอบถามผลการเรียนและคะแนน (/results):',
    },
    cmdRemainingLabel: {
      ar: '📚 أمر استعلام الدروس المتبقية (/remaining):',
      en: '📚 Remaining Lessons Query (/remaining):',
      th: '📚 คำสั่งสอบถามบทเรียนที่เหลือ (/remaining):',
    },
    saveTelegramSettingsBtn: {
      ar: '💾 حفظ كافة إعدادات وبوت وتوزيعات تليجرام',
      en: '💾 Save All Telegram Hub Settings & Directory',
      th: '💾 บันทึกการตั้งค่า Telegram Hub และรายชื่อทั้งหมด',
    },
  },

  home: {
    welcomeMessage: {
      ar: 'أهلاً بك في منصتك التعليمية',
      en: 'Welcome to your learning platform',
      th: 'ยินดีต้อนรับสู่แพลตฟอร์มการเรียนรู้ของคุณ',
    },
    welcomeDayMessageTemplate: {
      ar: 'أهلاً بك يا {name}.. تم تسجيل دخولك في اليوم {day} من البرنامج، نتمنى لك علماً نافعاً وموفقاً! 🌟',
      en: 'Welcome {name}.. You have logged in on Day {day} of the program. Wishing you a fruitful and blessed journey! 🌟',
      th: 'ยินดีต้อนรับ {name}.. คุณได้เข้าสู่ระบบในวันที่ {day} ของโปรแกรม ขอให้ประสบความสำเร็จในการเรียนรู้! 🌟',
    },
    welcomeRestDayMessageTemplate: {
      ar: 'أهلاً بك يا {name}.. اليوم استراحة ومراجعة بعد إنهاء اليوم {day} من البرنامج، نتمنى لك وقتاً ممتعاً! 🌟',
      en: 'Welcome {name}.. Today is a rest and review day after completing Day {day} of the program. Enjoy your time! 🌟',
      th: 'ยินดีต้อนรับ {name}.. วันนี้เป็นวันพักและทบทวนหลังจากจบวันที่ {day} ของโปรแกรม ขอให้มีความสุข! 🌟',
    },
    welcomeNotStartedMessageTemplate: {
      ar: 'أهلاً بك يا {name}.. يبدأ برنامجك الدراسي بتاريخ {date}، نتمنى لك رحلة تعليمية موفقة! 🌟',
      en: 'Welcome {name}.. Your study program starts on {date}. Wishing you a wonderful learning journey! 🌟',
      th: 'ยินดีต้อนรับ {name}.. โปรแกรมการเรียนของคุณจะเริ่มในวันที่ {date} ขอให้โชคดีในการเรียน! 🌟',
    },
    welcomeNoScheduleMessageTemplate: {
      ar: 'أهلاً بك يا {name}.. تم تسجيل دخولك بنجاح في المنصة التعليمية، نتمنى لك علماً نافعاً وموفقاً! 🌟',
      en: 'Welcome {name}.. You have successfully logged into the learning platform. Wishing you a fruitful journey! 🌟',
      th: 'ยินดีต้อนรับ {name}.. คุณได้เข้าสู่ระบบแพลตฟอร์มการเรียนรู้สำเร็จแล้ว ขอให้โชคดีในการเรียน! 🌟',
    },
    badgeStudyDay: {
      ar: 'اليوم {day} من البرنامج الدراسي 📚',
      en: 'Day {day} of the study program 📚',
      th: 'วันที่ {day} ของโปรแกรมการเรียน 📚',
    },
    badgeRestDay: {
      ar: 'يوم استراحة ومراجعة (اليوم {day}) 🌿',
      en: 'Rest & review day (Day {day}) 🌿',
      th: 'วันพักและทบทวน (วันที่ {day}) 🌿',
    },
    badgeNotStarted: {
      ar: 'يبدأ بتاريخ {date} ⏳',
      en: 'Starts on {date} ⏳',
      th: 'เริ่มวันที่ {date} ⏳',
    },
    badgeEducationalPlatform: {
      ar: 'المنظومة التعليمية 📚',
      en: 'Learning Platform 📚',
      th: 'แพลตฟอร์มการเรียนรู้ 📚',
    },
    dayOrdinalLabel: {
      ar: 'اليوم {day} 🎯',
      en: 'Day {day} 🎯',
      th: 'วันที่ {day} 🎯',
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
      ar: 'المجموعة الأولى (انقر أو اسحب للتوصيل)',
      en: 'Group 1 (Tap or drag to connect)',
      th: 'กลุ่มที่ 1 (แตะหรือลากเพื่อเชื่อมต่อ)',
    },
    groupTwoTargetInstruction: {
      ar: 'المجموعة الثانية (مستقبل الوصلة)',
      en: 'Group 2 (Target node)',
      th: 'กลุ่มที่ 2 (ปลายทางเชื่อมต่อ)',
    },
    selectedItemNotice: {
      ar: '✨ تم تحديد البطاقة! انقر الآن على الكلمة المقابلة في العمود الثاني لتوصيلها 🔗',
      en: '✨ Card selected! Now tap the matching card in the second column to connect 🔗',
      th: '✨ เลือกการ์ดแล้ว! แตะการ์ดที่ตรงกันในคอลัมน์ที่สองเพื่อเชื่อมต่อ 🔗',
    },
    cancelSelectionBtn: {
      ar: 'إلغاء التحديد ✕',
      en: 'Cancel ✕',
      th: 'ยกเลิก ✕',
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
      ar: '* يمكنك التوصيل بالسحب المباشر بين البطاقتين، أو بالنقر على بطاقة في العمود الأول ثم النقر على البطاقة المقابلة في العمود الثاني.',
      en: '* You can connect by dragging between cards, or by tapping a card in the first column then tapping the match in the second column.',
      th: '* คุณสามารถเชื่อมต่อโดยการลากระหว่างการ์ด หรือแตะการ์ดในคอลัมน์แรกแล้วแตะการ์ดที่ตรงกันในคอลัมน์ที่สอง',
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
    imageRating: {
      ar: 'تقييم درجة الصورة ⭐',
      en: 'Image Grade Rating ⭐',
      th: 'การประเมินคะแนนรูปภาพ ⭐',
    },
    audioRating: {
      ar: 'تقييم درجة الصوت ⭐',
      en: 'Audio Grade Rating ⭐',
      th: 'การประเมินคะแนนเสียง ⭐',
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
