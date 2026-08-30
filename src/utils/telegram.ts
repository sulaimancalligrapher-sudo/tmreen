/**
 * Telegram API & Notification Hub Utility
 * Supports direct Bot API integration, message interpolation, media dispatching,
 * and multi-language template processing.
 */

import { TeacherContact, TelegramBotCommandConfig, TelegramLanguageTemplates } from '../types';
import { callGasApi } from './api';

export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface SendTelegramOptions {
  token: string;
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  mediaUrl?: string;
  mediaType?: 'photo' | 'video' | 'audio' | 'document';
  replyMarkup?: TelegramInlineKeyboardMarkup | Record<string, any>;
  skipDeduplication?: boolean;
}

export interface TelegramTestResult {
  ok: boolean;
  botName?: string;
  username?: string;
  error?: string;
}

export const DEFAULT_TELEGRAM_TEMPLATES_AR: TelegramLanguageTemplates = {
  welcomePrompt: '👋 مرحباً بك في المنظومة التعليمية!\n\n📌 **لتسجيل وربط حسابك:** يرجى إرسال **رقم المشترك / المعرّف الخاص بك** الآن في رسالة هنا (مثال: `101`).',
  idVerifiedPrompt: '✅ تم التحقق من الحساب بنجاح!\n👤 المشترك: {{اسم_الطالب}} (#{{رقم_الطالب}})\n\n🌐 **يرجى اختيار لغة الإشعارات المفضلة لتلقي جميع الرسائل بها:**',
  regSuccess: '🎉 مرحباً بك يا {{اسم_الطالب}}!\nتم ربط حسابك (#{{رقم_الطالب}}) باللغة العربية بنجاح ✅\nستصلك إشعارات المواعيد، تأكيد الحضور، والتحديثات باللغة العربية هنا تلقائياً. 📚',
  linkedStudentPrompt: '👋 مرحباً بك يا {{اسم_الطالب}}!\nحسابك مربوط بنجاح بالرقم (#{{رقم_الطالب}}) ✅\n\n🌐 لتغيير لغة الإشعارات المفضلة، يمكنك الاختيار من الأزرار أدناه:',
  securityLinkedAlert: '⚠️ **تنبيه أمني:**\nهذا الحساب في تيليجرام مربوط بالفعل مع المشترك:\n👤 **{{اسم_الطالب}}** (الرقم: #{{رقم_الطالب}})\n\n⛔ لا يمكن ربط مشترك آخر من نفس هذا الحساب.\n📞 إذا كنت ترغب في تعديل أو فك الربط، يرجى التواصل مع الإدارة مباشرة.',
  deviceProtectionAlert: '⚠️ **تنبيه:**\nرقم الحساب (**#{{رقم_الطالب}}** - {{اسم_الطالب}}) مربوط مسبقاً بجهاز أو حساب تيليجرام آخر.\n\n🔒 لحماية خصوصية حسابك، لا يمكن ربطه بجهاز جديد تلقائياً.\n📞 لنقل الإشعارات لهذا الحساب، يرجى التواصل مع الإدارة لإعادة ضبط الربط.',
  studentNotFound: '⚠️ لم يتم العثور على حساب مسجل بالرقم أو الاسم: ({{المدخل}}).\nيرجى التأكد من كتابة رقم الحساب أو المعرف بشكل صحيح (مثال: 101).',
  welcome: 'مرحباً بك يا {{اسم_الطالب}} في المنظومة التعليمية 🌟\nرقم الحساب: {{رقم_الطالب}}\nأيام الجلسات المعتمدة: {{الايام}}\nموعد الحصة اليومية: {{الوقت}}\nنتمنى لك أوقاتاً مثمرة ورحلة تعليمية موفقة!',
  login: '🟢 تم تسجيل دخولك يا {{اسم_الطالب}} بنجاح ✅\nتوقيت الدخول: {{الوقت}}\nالدروس المقررة: {{الدرس}}\nحالة الحضور: في الموعد 🌿\nوفقك الله ونفع بك!',
  earlyEntryAllowed: '🌟 مرحباً بك يا {{اسم_الطالب}}!\nتم تسجيل حضورك مبكراً قبل موعد الحصة المقرر ({{الوقت}}) ⏰\nنقدر لك هذا الالتزام والحرص، ونتمنى لك جلسة تعليمية موفقة ومثمرة! 🌿',
  earlyEntryBlocked: '⏳ مرحباً بك يا {{اسم_الطالب}}:\nموعد جلستك المعتمد هو الساعة {{الوقت}} ⏰\nيرجى الدخول عند حلول الوقت المحدد للبدء بنجاح 📚',
  preClass: '⏰ تذكير بموعد الحصة:\nمرحباً بك يا {{اسم_الطالب}}، تبدأ حصتك اليوم الساعة {{الوقت}}.\nيرجى الاستعداد والتواجد في الموعد لمتابعة دروسك المقررة 📚',
  absent: '⚠️ تنبيه التأخر عن الحصة:\nمرحباً يا {{اسم_الطالب}}، حان موعد حصتك اليوم الساعة {{الوقت}} ولم يتم تسجيل دخولك بعد.\nيرجى الدخول للمنصة الآن لتجنب احتساب الغياب 🚨',
  earlyExit: '🚪 إشعار تسجيل الخروج المبكر:\nمرحباً يا {{اسم_الطالب}}، تم تسجيل خروجك في تمام الساعة {{الوقت_الفعلي}} قبل انتهاء وقت الحصة المقرر ({{وقت_الحصة}}).\nيرجى مراجعة الجدول لاستكمال الوقت المتبقي ⏳',
  regularExit: '👋 إشعار إنهاء الجلسة:\nمرحباً يا {{اسم_الطالب}}، تم إنهاء حصة اليوم وتسجيل الخروج في تمام الساعة {{الوقت}} ✅\nشكراً لالتزامك وحرصك، نلقاك في الحصة القادمة بإذن الله! 🌟',
  finalAbsent: '🚨 إشعار عدم الحضور:\nمرحباً يا {{اسم_الطالب}} (#{{رقم_الطالب}})، تم تسجيل عدم حضورك لحصة اليوم المقررة الساعة {{الوقت}}.\nيرجى التواصل مع المعلم أو الإدارة في حال وجود عذر أو لإعادة الجدولة 📞',
  complete: '🎉 تم إنجاز الدروس بنجاح يا {{اسم_الطالب}}:\nالدروس المكتملة: {{الدرس}}\nالتقييم: ممتاز ⭐⭐⭐⭐⭐\nشكراً لجهدك وحرصك المتميز!',
  evaluation: '⭐ بطاقة تقييم الدروس والتمارين:\nالمشترك: {{اسم_الطالب}}\nالدرس / التمرين: {{الدرس}}\nالدرجة: {{الدرجة}}%\nالتقييم: {{النجوم}}\nملاحظات: {{ملاحظات}}\nتقييم متميز، واصل تقدمك! 🏆',
  evaluationDetail: '📊 كشف تقييم ونتائج المشترك:\n👤 الاسم: {{اسم_الطالب}}\n\n📋 **تفاصيل تقييم المواضيع والتمارين المكتملة:**\n{{تقرير_الدرجات_المفصل}}\n\n🌟 إجمالي النجوم: {{النجوم}}\n🎯 متوسط الدرجات العام: {{الدرجة}}%\n📚 عدد الدروس المنجزة: {{المنجز}}\n\nبارك الله في جهودك وتميزك المستمر! 🌿',
  remainingLessons: '📚 الدروس والتمارين المتبقية في الخطة:\n👤 المشترك: {{اسم_الطالب}}\n\n⏳ **قائمة الدروس المتبقية للإنجاز:**\n{{قائمة_الدروس_المتبقية}}\n\n✅ تم إنجاز: {{المنجز}} درس\n🎯 المتبقي: {{المتبقي}} درس\nواصل همتك لتستحق وسام التفوق! 🏆',
  adminAlert: '📢 تعميم إداري:\n{{نص_التعميم}}\nالتاريخ: {{التاريخ}}\nمع تحيات إدارة المنظومة 🏛️',
  scheduleReminder: '📅 جدول جلساتك المعتمد:\nالمشترك: {{اسم_الطالب}}\nأيام الحضور: {{الايام}}\nوقت البدء: {{الوقت}}\nالدروس المقررة: {{الدروس}}\nتاريخ الانتهاء: {{تاريخ_الانتهاء}}',
  teacherAlert: '👨‍🏫 تنبيه للأستاذ {{المعلم}}:\nسجل المشترك {{اسم_الطالب}} دخوله وبدأ {{الدرس}} في تمام الساعة {{الوقت}}.',
};

export const DEFAULT_TELEGRAM_TEMPLATES_EN: TelegramLanguageTemplates = {
  welcomePrompt: '👋 Welcome to the Educational Platform!\n\n📌 **To link your account:** Please send your **Subscriber / ID number** in a message here (e.g. `101`).',
  idVerifiedPrompt: '✅ Account verified successfully!\n👤 Subscriber: {{student_name}} (#{{student_id}})\n\n🌐 **Please select your preferred notification language:**',
  regSuccess: '🎉 Welcome {{student_name}}!\nYour account (#{{student_id}}) has been successfully linked in English ✅\nYou will now receive class schedules, attendance alerts, and updates here. 📚',
  linkedStudentPrompt: '👋 Hello {{student_name}}!\nYour account is linked (#{{student_id}}) ✅\n\n🌐 To change your preferred notification language, select below:',
  securityLinkedAlert: '⚠️ **Security Alert:**\nThis Telegram account is already linked to ({{student_name}} - #{{student_id}}).\n⛔ Cannot link another subscriber. Please contact administration to reset.',
  deviceProtectionAlert: '⚠️ **Notice:**\nSubscriber ID (#{{student_id}} - {{student_name}}) is already linked to another Telegram account.\n🔒 For account security, it cannot be automatically linked to a new device. Please contact administration to reset.',
  studentNotFound: '⚠️ No registered account found for: ({{input}}). Please verify your ID number (e.g. 101).',
  welcome: 'Welcome {{student_name}} to the Educational Platform! 🌟\nAccount ID: {{student_id}}\nSchedule Days: {{days}}\nClass Start Time: {{time}}\nWe wish you a successful and rewarding learning journey!',
  login: '🟢 Welcome {{student_name}}, your login is confirmed ✅\nLogin Time: {{time}}\nAssigned Lessons: {{lesson}}\nStatus: Present On Time 🌿\nWishing you every success!',
  earlyEntryAllowed: '🌟 Welcome {{student_name}}!\nYou have checked in early before your scheduled class time ({{time}}) ⏰\nWe appreciate your dedication and punctuality! 🌿',
  earlyEntryBlocked: '⏳ Notice for {{student_name}}:\nYour scheduled session time is at ({{time}}) ⏰\nPlease join when the class starts to begin successfully 📚',
  preClass: '⏰ Upcoming Class Reminder:\nHello {{student_name}}, your class starts today at {{time}}.\nPlease be ready on time to join your session 📚',
  absent: '⚠️ Class Delay Alert:\nHello {{student_name}}, your class was scheduled today at {{time}} and login is not recorded yet.\nPlease log in now to avoid being marked absent 🚨',
  earlyExit: '🚪 Early Checkout Notice:\nHello {{student_name}}, checkout recorded at {{actual_time}} before scheduled session end ({{class_time}}).\nPlease review your schedule to complete remaining time ⏳',
  regularExit: '👋 Session Concluded:\nHello {{student_name}}, today\'s session completed and checked out at {{time}} ✅\nThank you for your commitment. See you in the next session! 🌟',
  finalAbsent: '🚨 Absence Notice:\nHello {{student_name}} (#{{student_id}}), absence has been recorded for today\'s session scheduled at {{time}}.\nPlease reach out to the teacher or administration if you have an excuse 📞',
  complete: '🎉 Lessons Completed Successfully, {{student_name}}:\nFinished Lessons: {{lesson}}\nRating: Outstanding ⭐⭐⭐⭐⭐\nThank you for your dedication!',
  evaluation: '⭐ Lesson & Exercise Evaluation:\nSubscriber: {{student_name}}\nExercise: {{lesson}}\nScore: {{score}}%\nRating: {{stars}}\nFeedback: {{notes}}\nGreat job, keep advancing! 🏆',
  evaluationDetail: '📊 Subscriber Evaluation & Performance Report:\n👤 Subscriber: {{student_name}}\n\n📋 **Detailed Completed Topics & Evaluations:**\n{{detailed_evaluations}}\n\n🌟 Total Stars: {{stars}}\n🎯 Overall Average Score: {{score}}%\n📚 Completed Lessons: {{completed_count}}\n\nGreat job, keep advancing! 🌿',
  remainingLessons: '📚 Remaining Lessons in Your Curriculum:\n👤 Subscriber: {{student_name}}\n\n⏳ **Pending Lessons List:**\n{{remaining_lessons_list}}\n\n✅ Completed: {{completed_count}} lessons\n🎯 Remaining: {{remaining_count}} lessons\nKeep going to earn your certificate! 🏆',
  adminAlert: '📢 Administrative Announcement:\n{{announcement_text}}\nDate: {{date}}\nRegards, Administration 🏛️',
  scheduleReminder: '📅 Your Assigned Schedule:\nSubscriber: {{student_name}}\nClass Days: {{days}}\nStart Time: {{time}}\nDaily Lessons: {{lessons_count}}\nCourse End: {{end_date}}',
  teacherAlert: '👨‍🏫 Teacher Alert ({{teacher_name}}):\nSubscriber {{student_name}} has logged in and started {{lesson}} at {{time}}.',
};

export const DEFAULT_TELEGRAM_TEMPLATES_TH: TelegramLanguageTemplates = {
  welcomePrompt: '👋 ยินดีต้อนรับสู่ระบบการเรียนรู้!\n\n📌 **เพื่อเชื่อมต่อบัญชี:** กรุณาส่ง **รหัสสมาชิก / รหัสประจำตัว** ของคุณในแชทนี้ (เช่น `101`)',
  idVerifiedPrompt: '✅ ตรวจสอบบัญชีเรียบร้อยแล้ว!\n👤 สมาชิก: {{student_name}} (#{{student_id}})\n\n🌐 **กรุณาเลือกภาษาสำหรับการแจ้งเตือน:**',
  regSuccess: '🎉 ยินดีต้อนรับคุณ {{student_name}}!\nบัญชีของคุณ (#{{student_id}}) ได้รับการเชื่อมต่อเป็นภาษาไทยเรียบร้อยแล้ว ✅\nคุณจะได้รับการแจ้งเตือนเวลาเรียนและตารางเรียนเป็นภาษาไทยที่นี่ 📚',
  linkedStudentPrompt: '👋 สวัสดีคุณ {{student_name}}!\nบัญชีของคุณเชื่อมต่อแล้ว (#{{student_id}}) ✅\n\n🌐 หากต้องการเปลี่ยนภาษาสำหรับการแจ้งเตือน กรุณาเลือกด้านล่าง:',
  securityLinkedAlert: '⚠️ **แจ้งเตือนความปลอดภัย:**\nบัญชี Telegram นี้เชื่อมต่อกับสมาชิก ({{student_name}} - #{{student_id}}) อยู่แล้ว\n⛔ ไม่สามารถเชื่อมต่อสมาชิกคนอื่นได้ กรุณาติดต่อฝ่ายบริหารเพื่อรีเซ็ต',
  deviceProtectionAlert: '⚠️ **แจ้งเตือน:**\nรหัสสมาชิก (#{{student_id}} - {{student_name}}) เชื่อมต่อกับอุปกรณ์อื่นอยู่แล้ว\n🔒 เพื่อความปลอดภัย กรุณาติดต่อฝ่ายบริหารเพื่อขอรีเซ็ตหรือเปลี่ยนอุปกรณ์',
  studentNotFound: '⚠️ ไม่พบข้อมูลบัญชีสำหรับรหัส: ({{input}})\nกรุณาตรวจสอบรหัสสมาชิกให้ถูกต้อง (เช่น 101)',
  welcome: 'ยินดีต้อนรับคุณ {{student_name}} สู่ระบบการเรียนรู้ 🌟\nรหัสสมาชิก: {{student_id}}\nวันเรียน: {{days}}\nเวลาเริ่มเรียน: {{time}}\nขอให้มีความสุขกับการเรียนรู้และประสบความสำเร็จ!',
  login: '🟢 ยินดีต้อนรับคุณ {{student_name}} บันทึกการเข้าสู่ระบบเรียบร้อย ✅\nเวลาเข้าสู่ระบบ: {{time}}\nบทเรียนวันนี้: {{lesson}}\nสถานะ: เข้าเรียนตรงเวลา 🌿\nขอให้ประสบความสำเร็จในการเรียน!',
  earlyEntryAllowed: '🌟 ยินดีต้อนรับคุณ {{student_name}}!\nคุณได้เข้าสู่ระบบล่วงหน้าก่อนเวลาเรียนที่กำหนด ({{time}}) ⏰\nขอชื่นชมในความตรงต่อเวลาและการเตรียมพร้อม! 🌿',
  earlyEntryBlocked: '⏳ แจ้งเตือนคุณ {{student_name}}:\nเวลาเรียนที่กำหนดคือ ({{time}}) ⏰\nกรุณาเข้าสู่ระบบเมื่อถึงเวลาเรียนที่กำหนด 📚',
  preClass: '⏰ แจ้งเตือนก่อนเริ่มคาบเรียน:\nสวัสดีคุณ {{student_name}} คาบเรียนของคุณจะเริ่มเวลา {{time}}\nกรุณาเตรียมตัวเข้าสู่ระบบตรงเวลา 📚',
  absent: '⚠️ แจ้งเตือนการเข้าเรียนล่าช้า:\nสวัสดีคุณ {{student_name}} ถึงเวลาเรียนของคุณแล้ว ({{time}}) แต่ยังไม่ได้เข้าสู่ระบบ\nกรุณาเข้าสู่ระบบทันทีเพื่อไม่ให้เสียสิทธิ์การเข้าเรียน 🚨',
  earlyExit: '🚪 แจ้งเตือนการออกจากระบบก่อนเวลา:\nขอแจ้งให้ทราบว่าคุณ {{student_name}} ได้ออกจากระบบเวลา {{actual_time}} ก่อนเวลาสิ้นสุดคาบเรียน ({{class_time}})\nกรุณาตรวจสอบตารางเรียนเพื่อติดตามบทเรียน ⏳',
  regularExit: '👋 สิ้นสุดคาบเรียนและออกจากระบบ:\nคุณ {{student_name}} ได้สิ้นสุดการเรียนวันนี้และออกจากระบบเวลา {{time}} ✅\nขอบคุณในความตั้งใจ แล้วพบกันในคาบเรียนถัดไป! 🌟',
  finalAbsent: '🚨 บันทึกการขาดเรียน:\nขอแจ้งให้ทราบว่าคุณ {{student_name}} (#{{student_id}}) ขาดเรียนในคาบเรียนวันนี้ เวลา: {{time}}\nกรุณาติดต่อคุณครูหรือฝ่ายบริหารหากมีเหตุจำเป็น 📞',
  complete: '🎉 ทำบทเรียนเสร็จสมบูรณ์ ยินดีด้วยคุณ {{student_name}}:\nบทเรียนที่สำเร็จ: {{lesson}}\nผลการประเมิน: ยอดเยี่ยมมาก ⭐⭐⭐⭐⭐\nขอบคุณในความมุ่งมั่นตั้งใจ!',
  evaluation: '⭐ ผลการประเมินและคะแนนแบบฝึกหัด:\nสมาชิก: {{student_name}}\nบทเรียน: {{lesson}}\nคะแนนที่ได้: {{score}}%\nผลประเมิน: {{stars}}\nความคิดเห็นครู: {{notes}}\nยอดเยี่ยมมาก พัฒนาต่อไปนะ! 🏆',
  evaluationDetail: '📊 รายงานผลการประเมินและคะแนนโดยละเอียด:\n👤 สมาชิก: {{student_name}}\n\n📋 **รายละเอียดหัวข้อและผลการเรียน:**\n{{detailed_evaluations}}\n\n🌟 ดาวรวมทั้งหมด: {{stars}}\n🎯 คะแนนเฉลี่ยสะสม: {{score}}%\n📚 บทเรียนที่สำเร็จ: {{completed_count}}\n\nยอดเยี่ยมมาก ขอให้ตั้งใจพัฒนาต่อไป! 🌿',
  remainingLessons: '📚 บทเรียนและแบบฝึกหัดที่เหลือในแผนการเรียน:\n👤 สมาชิก: {{student_name}}\n\n⏳ **รายการบทเรียนที่ต้องเรียนต่อ:**\n{{remaining_lessons_list}}\n\n✅ สำเร็จแล้ว: {{completed_count}} บท\n🎯 เหลืออีก: {{remaining_count}} บท\nตั้งใจต่อไปเพื่อรับใบประกาศนียบัตร! 🏆',
  adminAlert: '📢 ประกาศจากฝ่ายบริหาร:\n{{announcement_text}}\nวันที่: {{date}}\nด้วยความเคารพ จากฝ่ายบริหาร 🏛️',
  scheduleReminder: '📅 ตารางเรียนของคุณ:\nสมาชิก: {{student_name}}\nวันเรียน: {{days}}\nเวลาเริ่ม: {{time}}\nจำนวนบทเรียนต่อวัน: {{lessons_count}}\nสิ้นสุดวันที่: {{end_date}}',
  teacherAlert: '👨‍🏫 แจ้งเตือนคุณครู ({{teacher_name}}):\nสมาชิก {{student_name}} ได้เข้าสู่ระบบและเริ่มเรียน {{lesson}} เวลา {{time}}',
};

export const DEFAULT_TELEGRAM_BOT_COMMANDS: TelegramBotCommandConfig[] = [
  {
    id: 'cmd_loading',
    command: '/loading',
    buttonTextAr: '⏳ رسالة الانتظار والتحميل الفورية',
    buttonTextEn: '⏳ Instant Data Loading Notice',
    buttonTextTh: '⏳ ข้อความแจ้งเตือนกำลังโหลดข้อมูล',
    description: 'رسالة نصية ثابتة ترسل فورياً للمشترك عند الضغط على أي استعلام أو زر لتأكيد المعالجة ريثما تظهر النتائج المعتمدة',
    keywords: 'تحميل, انتظار, جاري, loading, wait',
    responseAr: '⏳ **جاري تحميل البيانات...**\n_يرجى الانتظار لحظات ريثما يتم تحضير النتائج المعتمدة..._',
    responseEn: '⏳ **Loading data...**\n_Please wait a moment while we fetch and prepare your report..._',
    responseTh: '⏳ **กำลังโหลดข้อมูล...**\n_กรุณารอสักครู่ กำลังจัดเตรียมข้อมูลที่อนุมัติ..._',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_master_menu',
    command: '/menu',
    buttonTextAr: '📋 لوحة الخدمات والخيارات الذكية',
    buttonTextEn: '📋 Smart Services Menu',
    buttonTextTh: '📋 เมนูบริการอัจฉริยะ',
    description: 'لوحة الخدمات التفاعلية الذكية المرفقة بالأزرار (تفتح عند إرسال: تفاصيل أو ت أو /menu)',
    keywords: 'تفاصيل, ت, menu, /menu, /services, خدمات, لوحة, รายละเอียด',
    responseAr: '📋 **لوحة الخدمات والخيارات الذكية للمشترك:**\n👤 **المشترك:** {{اسم_الطالب}} (#{{رقم_الطالب}})\n\n👇 **يرجى اختيار الخدمة المطلوبة بالنقر على الأزرار أدناه:**',
    responseEn: '📋 **Smart Services & Details Menu**\n👤 **Student:** {{student_name}} (#{{student_id}})\n\n👇 **Please choose an option from the buttons below:**',
    responseTh: '📋 **เมนูบริการและรายละเอียด**\n👤 **นักเรียน:** {{student_name}} (#{{student_id}})\n\n👇 **กรุณาเลือกบริการที่ต้องการจากปุ่มด้านล่าง:**',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك الدراسي' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_completed',
    command: '/completed',
    buttonTextAr: '✅ الدروس المكتملة',
    buttonTextEn: '✅ Completed Lessons',
    buttonTextTh: '✅ บทเรียนที่เสร็จสิ้น',
    description: 'كشف قائمة مواضيع الدروس والتمارين التي سجلت بحالة (اكتمل) في ورقة التقييمات',
    keywords: 'مكتمل, مكتملة, ك, تقييم, ن, نتائج, درجات, /completed, /results, /done, completed, เสร็จสิ้น',
    responseAr: '✅ **كشف الدروس المكتملة المعتمدة في المنظومة:**\n👤 **المشترك:** {{اسم_الطالب}} (#{{رقم_الطالب}})\n\n📊 **حالة الإنجاز:** أتممت ({{المنجز}}) درس من إجمالي ({{الدروس}}) درس\n\n📖 **قائمة الدروس المكتملة:**\n{{قائمة_الدروس_المكتملة}}\n\n✨ _هنيئاً لك هذا التقدم والاجتهاد المبارك! 🌿_\n\n💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_',
    responseEn: '✅ **Approved Completed Lessons in Official Curriculum:**\n👤 **Student:** {{student_name}} (#{{student_id}})\n\n📊 **Progress:** Completed ({{completed_count}}) of ({{total_lessons}}) lessons\n\n📖 **Completed Lessons List:**\n{{completed_lessons_list}}\n\n✨ _Congratulations on your progress and dedication! 🌿_\n\n💡 _To open services menu with buttons, type: ( details )_',
    responseTh: '✅ **บทเรียนที่เสร็จสิ้นแล้วตามหลักสูตรที่อนุมัติ:**\n👤 **นักเรียน:** {{student_name}} (#{{student_id}})\n\n📊 **ความคืบหน้า:** สำเร็จแล้ว ({{completed_count}}) จาก ({{total_lessons}}) บทเรียน\n\n📖 **รายชื่อบทเรียนที่เสร็จสิ้น:**\n{{completed_lessons_list}}\n\n✨ _ขอแสดงความยินดีกับความก้าวหน้าและการเรียนรู้! 🌿_\n\n💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك' },
      { tag: '{{قائمة_الدروس_المكتملة}}', label: 'قائمة عناوين الدروس المكتملة' },
      { tag: '{{المنجز}}', label: 'عدد الدروس المنجزة' },
      { tag: '{{الدروس}}', label: 'إجمالي الدروس المقررة' },
      { tag: '{{المتبقي}}', label: 'عدد الدروس المتبقية' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_remaining',
    command: '/remaining',
    buttonTextAr: '📚 الدروس المتبقية',
    buttonTextEn: '📚 Remaining Lessons',
    buttonTextTh: '📚 บทเรียนที่เหลือ',
    description: 'كشف قائمة مواضيع الدروس والتمارين المتبقية لإتمام الخطة التعليمية بنجاح',
    keywords: 'متبقي, باقي, ب, خطة, خطتي, باقيلي, /remaining, /left, /plan, remaining, left, บทเรียนที่เหลือ',
    responseAr: '📚 **خطة الدروس والتمارين المتبقية:**\n👤 **المشترك:** {{اسم_الطالب}} (#{{رقم_الطالب}})\n\n📊 **المتبقي لإتمام الخطة:** ({{المتبقي}}) درس\n\n📖 **قائمة الدروس المتبقية:**\n{{قائمة_الدروس_المتبقية}}\n\n✨ _نحثك على مواصلة الجد والمثابرة لإتمام خطتك بنجاح! 🌿_\n\n💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_',
    responseEn: '📚 **Remaining Lessons & Study Plan:**\n👤 **Student:** {{student_name}} (#{{student_id}})\n\n📊 **Remaining Lessons:** ({{remaining_count}}) lessons left\n\n📖 **Remaining Lessons List:**\n{{remaining_lessons_list}}\n\n✨ _Keep up the dedication to complete your curriculum! 🌿_\n\n💡 _To open services menu with buttons, type: ( details )_',
    responseTh: '📚 **แผนบทเรียนและแบบฝึกหัดที่เหลือ:**\n👤 **นักเรียน:** {{student_name}} (#{{student_id}})\n\n📊 **คงเหลือ:** ({{remaining_count}}) บทเรียน\n\n📖 **รายชื่อบทเรียนที่เหลือ:**\n{{remaining_lessons_list}}\n\n✨ _ขอเป็นกำลังใจให้ตั้งใจเรียนเพื่อสำเร็จตามแผน! 🌿_\n\n💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك' },
      { tag: '{{قائمة_الدروس_المتبقية}}', label: 'قائمة عناوين الدروس المتبقية' },
      { tag: '{{المتبقي}}', label: 'عدد الدروس المتبقية' },
      { tag: '{{المنجز}}', label: 'عدد الدروس المنجزة' },
      { tag: '{{الدروس}}', label: 'إجمالي الدروس المقررة' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_schedule',
    command: '/schedule',
    buttonTextAr: '📅 جدولي الدراسي المعتمد',
    buttonTextEn: '📅 My Official Schedule',
    buttonTextTh: '📅 ตารางเรียนที่อนุมัติ',
    description: 'بيانات الجدول المعتمد، أيام الحضور، توقيت الحصة، مدة الجلسة، وصلاحية الاشتراك',
    keywords: 'جدول, ج, جدولي, مواعيد, موعدي, حصة, توقيت, /schedule, /timetable, /time, schedule, ตารางเรียน',
    responseAr: '📅 **جدولك الدراسي يا {{اسم_الطالب}} (#{{رقم_الطالب}}) المعتمد**\n\n🗓️ **أيام الحضور المقررة:** {{أيام_الحضور}}\n⏰ **توقيت بدء الحصة:** {{وقت_البدء}}\n⏱️ **مدة الجلسة الدراسية:** {{مدة_الجلسة}} دقيقة ({{نوع_احتساب_المدة}})\n🚪 **حالة الدخول المبكر:** {{حالة_الدخول_المبكر}}\n📚 **معدل الدروس المقررة:** {{الدروس_الأسبوعية}} دروس أسبوعياً\n🚀 **تاريخ بدء الخطة:** {{تاريخ_البدء}}\n🏁 **تاريخ الانتهاء والصلاحية:** {{تاريخ_الانتهاء}}\n👨‍🏫 **المعلم المشرف:** {{المعلم}}',
    responseEn: '📅 **Official Approved Schedule for {{student_name}} (#{{student_id}})**\n\n🗓️ **Scheduled Days:** {{days}}\n⏰ **Class Start Time:** {{time}}\n⏱️ **Session Duration:** {{duration}} minutes ({{duration_type}})\n🚪 **Early Entry Status:** {{early_entry_status}}\n📚 **Target Lessons:** {{lessons_per_week}} lessons / week\n🚀 **Plan Start Date:** {{start_date}}\n🏁 **Expiry Date:** {{expiry_date}}\n👨‍🏫 **Assigned Teacher:** {{teacher_name}}',
    responseTh: '📅 **ตารางเรียนของ {{student_name}} (#{{student_id}})**\n\n🗓️ **วันเรียน:** {{days}}\n⏰ **เวลาเริ่มเรียน:** {{time}}\n⏱️ **ระยะเวลา:** {{duration}} นาที ({{duration_type}})\n🚪 **การเข้าก่อนเวลา:** {{early_entry_status}}\n📚 **จำนวนบทเรียน:** {{lessons_per_week}} บทต่อสัปดาห์\n🚀 **วันที่เริ่ม:** {{start_date}}\n🏁 **สิ้นสุดวันที่:** {{expiry_date}}\n👨‍🏫 **คุณครูผู้ดูแล:** {{teacher_name}}',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك' },
      { tag: '{{أيام_الحضور}}', label: 'أيام الحضور المقررة' },
      { tag: '{{وقت_البدء}}', label: 'توقيت بدء الحصة' },
      { tag: '{{مدة_الجلسة}}', label: 'مدة الجلسة بالدقائق' },
      { tag: '{{نوع_احتساب_المدة}}', label: 'طريقة احتساب المدة' },
      { tag: '{{حالة_الدخول_المبكر}}', label: 'إمكانية الدخول المبكر' },
      { tag: '{{الدروس_الأسبوعية}}', label: 'معدل الدروس أسبوعياً' },
      { tag: '{{تاريخ_البدء}}', label: 'تاريخ بدء الخطة' },
      { tag: '{{تاريخ_الانتهاء}}', label: 'تاريخ انتهاء الصلاحية' },
      { tag: '{{المعلم}}', label: 'اسم المعلم المشرف' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_teacher',
    command: '/teacher',
    buttonTextAr: '👨‍🏫 بيانات المعلم المشرف',
    buttonTextEn: '👨‍🏫 Teacher Contact',
    buttonTextTh: '👨‍🏫 ข้อมูลคุณครู',
    description: 'بيانات المعلم المعين للطالب، المادة، ورقم الهاتف المعتمد للتواصل والإشراف الأكاديمي',
    keywords: 'معلم, م, معلمي, استاذ, مشرف, مدرس, تواصل, /teacher, /contact, teacher, คุณครู',
    responseAr: '👨‍🏫 **بيانات المعلم المشرف والتواصل:**\n\n👤 **اسم المعلم:** {{المعلم}}\n📖 **الدور / المادة:** {{المادة}}\n📞 **هاتف التواصل:** {{الهاتف}}\n\n💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_',
    responseEn: '👨‍🏫 **Assigned Teacher & Contact Info:**\n\n👤 **Teacher:** {{teacher_name}}\n📖 **Role / Subject:** {{subject}}\n📞 **Contact:** {{phone}}\n\n💡 _To open services menu with buttons, type: ( details )_',
    responseTh: '👨‍🏫 **ข้อมูลคุณครูผู้ดูแลและการติดต่อ:**\n\n👤 **คุณครู:** {{teacher_name}}\n📖 **วิชา / หน้าที่:** {{subject}}\n📞 **เบอร์ติดต่อ:** {{phone}}\n\n💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{المعلم}}', label: 'اسم المعلم' },
      { tag: '{{المادة}}', label: 'المادة أو الدور الأكاديمي' },
      { tag: '{{الهاتف}}', label: 'هاتف التواصل مع المعلم' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_info',
    command: '/info',
    buttonTextAr: '👤 بيانات حساب المشترك',
    buttonTextEn: '👤 Student Account Profile',
    buttonTextTh: '👤 ข้อมูลบัญชีนักเรียน',
    description: 'بيانات الحساب الشخصي للطالب، الرقم الدراسي، لغة الإشعارات، ورقم هاتف ولي الأمر',
    keywords: 'بيانات, ح, حسابي, ملف, معلومات, رقمي, /info, /profile, /account, profile, ข้อมูล',
    responseAr: '👤 **بيانات المشترك وحالة التسجيل في المنظومة:**\n\n📌 **اسم الطالب:** {{اسم_الطالب}}\n🔢 **الرقم الدراسي:** #{{رقم_الطالب}}\n🌐 **لغة الإشعارات المفضلة:** {{اللغة}}\n📱 **هاتف ولي الأمر:** {{هاتف_ولي_الامر}}\n✅ **حالة الربط في تيليجرام:** {{حالة_الربط}}\n\n💡 _لفتح لوحة الخدمات والأزرار التفاعلية، أرسل كلمة: ( تفاصيل )_',
    responseEn: '👤 **Student Account & Registration Details:**\n\n📌 **Student Name:** {{student_name}}\n🔢 **Student ID:** #{{student_id}}\n🌐 **Preferred Language:** {{preferred_language}}\n📱 **Guardian Phone:** {{guardian_phone}}\n✅ **Telegram Status:** {{telegram_status}}\n\n💡 _To open services menu with buttons, type: ( details )_',
    responseTh: '👤 **ข้อมูลบัญชีและการลงทะเบียนของนักเรียน:**\n\n📌 **ชื่อนักเรียน:** {{student_name}}\n🔢 **รหัสนักเรียน:** #{{student_id}}\n🌐 **ภาษาที่เลือก:** {{preferred_language}}\n📱 **เบอร์ผู้ปกครอง:** {{guardian_phone}}\n✅ **สถานะ Telegram:** {{telegram_status}}\n\n💡 _เปิดเมนูบริการพร้อมปุ่มพิมพ์: ( รายละเอียด )_',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك الدراسي' },
      { tag: '{{اللغة}}', label: 'لغة الإشعارات المختارة' },
      { tag: '{{هاتف_ولي_الامر}}', label: 'هاتف ولي الأمر' },
      { tag: '{{حالة_الربط}}', label: 'حالة الربط بالتيليجرام' },
    ],
    enabled: true,
  },
  {
    id: 'cmd_lang',
    command: '/lang',
    buttonTextAr: '🌐 تغيير لغة الإشعارات',
    buttonTextEn: '🌐 Change Language',
    buttonTextTh: '🌐 เปลี่ยนภาษา',
    description: 'لوحة تغيير لغة إشعارات البوت التفاعلية للمشترك مع أزرار اللغات الثلاث (العربية / English / ภาษาไทย)',
    keywords: 'لغة, ل, لغات, تغيير اللغة, عربي, انجليزي, تايلندي, /lang, /language, lang, เปลี่ยนภาษา',
    responseAr: '🌐 **يرجى اختيار لغة الإشعارات والتنبيهات المفضلة لك:**\nستصلك جميع مواعيد الحصص والتقارير باللغة المختارة فوراً.',
    responseEn: '🌐 **Please choose your preferred notification language:**\nAll your schedules, lesson alerts, and reports will be sent in your chosen language.',
    responseTh: '🌐 **กรุณาเลือกภาษาสำหรับการแจ้งเตือนที่คุณต้องการ:**\nตารางเรียนและการแจ้งเตือนทั้งหมดจะส่งเป็นภาษาที่คุณเลือก',
    supportedVars: [
      { tag: '{{اسم_الطالب}}', label: 'اسم المشترك' },
      { tag: '{{رقم_الطالب}}', label: 'رقم المشترك الدراسي' },
    ],
    enabled: true,
  },
];

// In-memory deduplication cache: chat_id + text hash -> timestamp
const recentTelegramDispatches = new Map<string, number>();

export function clearTelegramDispatchCache(): void {
  recentTelegramDispatches.clear();
}

/**
 * Replace placeholders like {{اسم_الطالب}} or {{student_name}} with real values.
 */
export function interpolateTelegramTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  if (!template) return '';
  let result = template;

  const mapping: Record<string, string | number> = {};

  Object.entries(variables).forEach(([key, val]) => {
    const safeVal = val !== undefined && val !== null ? String(val) : '';
    mapping[key] = safeVal;

    // Common synonyms & Arabic variants
    if (key === 'studentName' || key === 'name' || key === 'اسم_الطالب' || key === 'اسم الطالب' || key === 'المشترك' || key === 'اسم_المشترك') {
      mapping['اسم_الطالب'] = safeVal;
      mapping['اسم الطالب'] = safeVal;
      mapping['المشترك'] = safeVal;
      mapping['اسم_المشترك'] = safeVal;
      mapping['student_name'] = safeVal;
      mapping['studentName'] = safeVal;
      mapping['name'] = safeVal;
    }
    if (key === 'studentId' || key === 'id' || key === 'رقم_الطالب' || key === 'رقم الطالب' || key === 'رقم_المشترك' || key === 'رقم المشترك' || key === 'الرقم_الدراسي') {
      mapping['رقم_الطالب'] = safeVal;
      mapping['رقم الطالب'] = safeVal;
      mapping['رقم_المشترك'] = safeVal;
      mapping['رقم المشترك'] = safeVal;
      mapping['الرقم_الدراسي'] = safeVal;
      mapping['student_id'] = safeVal;
      mapping['studentId'] = safeVal;
      mapping['id'] = safeVal;
    }
    if (key === 'time' || key === 'startTime' || key === 'الوقت' || key === 'وقت_البدء' || key === 'وقت البدء' || key === 'وقت_البداية' || key === 'وقت البداية' || key === 'start_time') {
      mapping['الوقت'] = safeVal;
      mapping['وقت_البدء'] = safeVal;
      mapping['وقت البدء'] = safeVal;
      mapping['وقت_البداية'] = safeVal;
      mapping['وقت البداية'] = safeVal;
      mapping['time'] = safeVal;
      mapping['startTime'] = safeVal;
      mapping['start_time'] = safeVal;
    }
    if (key === 'classTime' || key === 'class_time' || key === 'وقت_الحصة' || key === 'وقت الحصة') {
      mapping['وقت_الحصة'] = safeVal;
      mapping['وقت الحصة'] = safeVal;
      mapping['class_time'] = safeVal;
      mapping['classTime'] = safeVal;
    }
    if (key === 'actualTime' || key === 'actual_time' || key === 'الوقت_الفعلي' || key === 'الوقت الفعلي') {
      mapping['الوقت_الفعلي'] = safeVal;
      mapping['الوقت الفعلي'] = safeVal;
      mapping['actual_time'] = safeVal;
      mapping['actualTime'] = safeVal;
    }
    if (
      key === 'days' ||
      key === 'activeDays' ||
      key === 'الايام' ||
      key === 'الأيام' ||
      key === 'أيام_الحضور' ||
      key === 'ايام_الحضور' ||
      key === 'أيام الحضور' ||
      key === 'ايام الحضور' ||
      key === 'أيام_الاسبوع' ||
      key === 'ايام_الاسبوع' ||
      key === 'أيام الاسبوع' ||
      key === 'ايام الاسبوع'
    ) {
      mapping['الايام'] = safeVal;
      mapping['الأيام'] = safeVal;
      mapping['أيام_الحضور'] = safeVal;
      mapping['ايام_الحضور'] = safeVal;
      mapping['أيام الحضور'] = safeVal;
      mapping['ايام الحضور'] = safeVal;
      mapping['أيام_الاسبوع'] = safeVal;
      mapping['ايام_الاسبوع'] = safeVal;
      mapping['أيام الاسبوع'] = safeVal;
      mapping['ايام الاسبوع'] = safeVal;
      mapping['days'] = safeVal;
      mapping['activeDays'] = safeVal;
    }
    if (
      key === 'duration' ||
      key === 'sessionDuration' ||
      key === 'المدة' ||
      key === 'مدة_الجلسة' ||
      key === 'مدة الجلسة' ||
      key === 'مده_الجلسه' ||
      key === 'مده الجلسه' ||
      key === 'session_duration'
    ) {
      mapping['المدة'] = safeVal;
      mapping['مدة_الجلسة'] = safeVal;
      mapping['مدة الجلسة'] = safeVal;
      mapping['مده_الجلسه'] = safeVal;
      mapping['مده الجلسه'] = safeVal;
      mapping['duration'] = safeVal;
      mapping['session_duration'] = safeVal;
      mapping['sessionDuration'] = safeVal;
    }
    if (
      key === 'startDate' ||
      key === 'start_date' ||
      key === 'تاريخ_البدء' ||
      key === 'تاريخ البدء' ||
      key === 'تاريخ_البداية' ||
      key === 'تاريخ البداية'
    ) {
      mapping['تاريخ_البدء'] = safeVal;
      mapping['تاريخ البدء'] = safeVal;
      mapping['تاريخ_البداية'] = safeVal;
      mapping['تاريخ البداية'] = safeVal;
      mapping['start_date'] = safeVal;
      mapping['startDate'] = safeVal;
    }
    if (
      key === 'endDate' ||
      key === 'end_date' ||
      key === 'تاريخ_الانتهاء' ||
      key === 'تاريخ الانتهاء' ||
      key === 'expiryDate' ||
      key === 'expiry_date' ||
      key === 'تاريخ_الصلاحية' ||
      key === 'تاريخ الصلاحية' ||
      key === 'انتهاء_الصلاحية'
    ) {
      mapping['تاريخ_الانتهاء'] = safeVal;
      mapping['تاريخ الانتهاء'] = safeVal;
      mapping['تاريخ_الصلاحية'] = safeVal;
      mapping['تاريخ الصلاحية'] = safeVal;
      mapping['انتهاء_الصلاحية'] = safeVal;
      mapping['end_date'] = safeVal;
      mapping['endDate'] = safeVal;
      mapping['expiryDate'] = safeVal;
      mapping['expiry_date'] = safeVal;
    }
    if (key === 'lessons_count' || key === 'lessonsCount' || key === 'عدد_الدروس' || key === 'عدد الدروس' || key === 'lessons' || key === 'الدروس') {
      mapping['الدروس'] = safeVal;
      mapping['عدد_الدروس'] = safeVal;
      mapping['عدد الدروس'] = safeVal;
      mapping['lessons_count'] = safeVal;
      mapping['lessonsCount'] = safeVal;
      mapping['lessons'] = safeVal;
    }
    if (key === 'lesson' || key === 'topic' || key === 'الدرس') {
      mapping['الدرس'] = safeVal;
      mapping['الدروس'] = safeVal;
      mapping['lesson'] = safeVal;
    }
    if (key === 'score' || key === 'percentage' || key === 'الدرجة') {
      mapping['الدرجة'] = safeVal;
      mapping['score'] = safeVal;
    }
    if (key === 'stars' || key === 'النجوم') {
      mapping['النجوم'] = safeVal;
      mapping['stars'] = safeVal;
    }
    if (key === 'notes' || key === 'feedback' || key === 'ملاحظات') {
      mapping['ملاحظات'] = safeVal;
      mapping['notes'] = safeVal;
    }
    if (key === 'completed_lessons_list' || key === 'قائمة_الدروس_المكتملة' || key === 'completedLessonsList' || key === 'detailed_evaluations') {
      mapping['قائمة_الدروس_المكتملة'] = safeVal;
      mapping['completed_lessons_list'] = safeVal;
      mapping['completedLessonsList'] = safeVal;
      mapping['detailed_evaluations'] = safeVal;
    }
    if (key === 'total_lessons' || key === 'total_lessons_count' || key === 'إجمالي_الدروس' || key === 'totalLessons') {
      mapping['إجمالي_الدروس'] = safeVal;
      mapping['total_lessons'] = safeVal;
      mapping['total_lessons_count'] = safeVal;
    }
    if (key === 'teacherPhone' || key === 'phone' || key === 'هاتف_المعلم' || key === 'هاتف المعلم' || key === 'الهاتف') {
      mapping['هاتف_المعلم'] = safeVal;
      mapping['هاتف المعلم'] = safeVal;
      mapping['الهاتف'] = safeVal;
      mapping['phone'] = safeVal;
      mapping['teacherPhone'] = safeVal;
    }
    if (key === 'teacherRole' || key === 'subject' || key === 'المادة' || key === 'الدور') {
      mapping['المادة'] = safeVal;
      mapping['الدور'] = safeVal;
      mapping['subject'] = safeVal;
      mapping['teacherRole'] = safeVal;
    }
    if (
      key === 'durationType' ||
      key === 'duration_type' ||
      key === 'نوع_المدة' ||
      key === 'نوع المدة' ||
      key === 'نوع_احتساب_المدة' ||
      key === 'نوع احتساب المدة' ||
      key === 'نوع_احتساب_المده' ||
      key === 'طريقة_احتساب_المدة'
    ) {
      mapping['نوع_المدة'] = safeVal;
      mapping['نوع المدة'] = safeVal;
      mapping['نوع_احتساب_المدة'] = safeVal;
      mapping['نوع احتساب المدة'] = safeVal;
      mapping['نوع_احتساب_المده'] = safeVal;
      mapping['طريقة_احتساب_المدة'] = safeVal;
      mapping['duration_type'] = safeVal;
      mapping['durationType'] = safeVal;
    }
    if (
      key === 'earlyEntryStatus' ||
      key === 'early_entry_status' ||
      key === 'حالة_الدخول_المبكر' ||
      key === 'حالة الدخول المبكر' ||
      key === 'الدخول_المبكر' ||
      key === 'الدخول المبكر'
    ) {
      mapping['حالة_الدخول_المبكر'] = safeVal;
      mapping['حالة الدخول المبكر'] = safeVal;
      mapping['الدخول_المبكر'] = safeVal;
      mapping['الدخول المبكر'] = safeVal;
      mapping['early_entry_status'] = safeVal;
      mapping['earlyEntryStatus'] = safeVal;
    }
    if (
      key === 'lessonsPerWeek' ||
      key === 'lessons_per_week' ||
      key === 'معدل_الدروس' ||
      key === 'معدل الدروس' ||
      key === 'الدروس_الأسبوعية' ||
      key === 'الدروس_الاسبوعية' ||
      key === 'الدروس الأسبوعية' ||
      key === 'الدروس الاسبوعية' ||
      key === 'الدروس_الاسبوعيه'
    ) {
      mapping['معدل_الدروس'] = safeVal;
      mapping['معدل الدروس'] = safeVal;
      mapping['الدروس_الأسبوعية'] = safeVal;
      mapping['الدروس_الاسبوعية'] = safeVal;
      mapping['الدروس الأسبوعية'] = safeVal;
      mapping['الدروس الاسبوعية'] = safeVal;
      mapping['الدروس_الاسبوعيه'] = safeVal;
      mapping['lessons_per_week'] = safeVal;
      mapping['lessonsPerWeek'] = safeVal;
    }
    if (key === 'preferredLanguage' || key === 'preferred_language' || key === 'اللغة') {
      mapping['اللغة'] = safeVal;
      mapping['preferred_language'] = safeVal;
    }
    if (key === 'guardianPhone' || key === 'guardian_phone' || key === 'هاتف_ولي_الامر' || key === 'هاتف ولي الامر') {
      mapping['هاتف_ولي_الامر'] = safeVal;
      mapping['هاتف ولي الامر'] = safeVal;
      mapping['guardian_phone'] = safeVal;
    }
    if (key === 'telegramStatus' || key === 'telegram_status' || key === 'حالة_الربط' || key === 'حالة الربط') {
      mapping['حالة_الربط'] = safeVal;
      mapping['حالة الربط'] = safeVal;
      mapping['telegram_status'] = safeVal;
    }
    if (key === 'detailed_evaluations' || key === 'تقرير_الدرجات_المفصل' || key === 'detailedEvaluations') {
      mapping['تقرير_الدرجات_المفصل'] = safeVal;
      mapping['detailed_evaluations'] = safeVal;
      mapping['detailedEvaluations'] = safeVal;
    }
    if (key === 'remaining_lessons_list' || key === 'قائمة_الدروس_المتبقية' || key === 'remainingLessonsList') {
      mapping['قائمة_الدروس_المتبقية'] = safeVal;
      mapping['remaining_lessons_list'] = safeVal;
      mapping['remainingLessonsList'] = safeVal;
    }
    if (key === 'completed_count' || key === 'المنجز' || key === 'completedCount') {
      mapping['المنجز'] = safeVal;
      mapping['completed_count'] = safeVal;
      mapping['completedCount'] = safeVal;
    }
    if (key === 'remaining_count' || key === 'المتبقي' || key === 'remainingCount') {
      mapping['المتبقي'] = safeVal;
      mapping['remaining_count'] = safeVal;
      mapping['remainingCount'] = safeVal;
    }
    if (
      key === 'teacher' ||
      key === 'teacherName' ||
      key === 'teacher_name' ||
      key === 'المعلم' ||
      key === 'المعلم_المشرف' ||
      key === 'المعلم المشرف' ||
      key === 'اسم_المعلم' ||
      key === 'اسم المعلم' ||
      key === 'الاستاذ' ||
      key === 'الأستاذ'
    ) {
      mapping['المعلم'] = safeVal;
      mapping['المعلم_المشرف'] = safeVal;
      mapping['المعلم المشرف'] = safeVal;
      mapping['اسم_المعلم'] = safeVal;
      mapping['اسم المعلم'] = safeVal;
      mapping['الاستاذ'] = safeVal;
      mapping['الأستاذ'] = safeVal;
      mapping['teacher_name'] = safeVal;
      mapping['teacher'] = safeVal;
      mapping['teacherName'] = safeVal;
    }
    if (key === 'date' || key === 'التاريخ') {
      mapping['التاريخ'] = safeVal;
      mapping['date'] = safeVal;
    }
    if (key === 'input' || key === 'rawId') {
      mapping['المدخل'] = safeVal;
      mapping['input'] = safeVal;
    }
    if (key === 'announcement' || key === 'announcementText' || key === 'announcement_text') {
      mapping['نص_التعميم'] = safeVal;
      mapping['announcement_text'] = safeVal;
    }
    if (key === 'دقائق_التذكير' || key === 'reminderMinutes') {
      mapping['دقائق_التذكير'] = safeVal;
      mapping['reminder_minutes'] = safeVal;
    }
    if (key === 'دقائق_التأخر' || key === 'minutesLate') {
      mapping['دقائق_التأخر'] = safeVal;
      mapping['minutes_late'] = safeVal;
    }
  });

  Object.entries(mapping).forEach(([key, value]) => {
    const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Match both single brace {tag} and double brace {{tag}}
    const regex = new RegExp(`(?:{{|{)\\s*${escaped}\\s*(?:}}|})`, 'gi');
    result = result.replace(regex, String(value));
  });

  return result;
}

/**
 * Tests connection to Telegram Bot by calling getMe
 */
export async function testTelegramBotToken(token: string): Promise<TelegramTestResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { ok: false, error: 'الرجاء إدخال رمز البوت (Bot Token) أولاً' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`, {
      method: 'GET',
    });
    const data = await res.json();
    if (data.ok && data.result) {
      return {
        ok: true,
        botName: data.result.first_name || '',
        username: data.result.username || '',
      };
    } else {
      return {
        ok: false,
        error: data.description || 'فشل التحقق من الرمز بواسطة Telegram API',
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      error: `تعذر الاتصال بـ Telegram API: ${err.message || 'خطأ شبكة'}`,
    };
  }
}

/**
 * Extracts links (Markdown [Title](url) or plain URLs) and converts them into Telegram inline URL buttons.
 * Strips raw URLs from the message body so no ugly links appear in the text!
 */
export interface ExtractedButtonsResult {
  cleanText: string;
  replyMarkup?: {
    inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
}

export function extractUrlsAndBuildButtons(
  rawText: string,
  existingReplyMarkup?: any
): ExtractedButtonsResult {
  if (!rawText) {
    return { cleanText: '', replyMarkup: existingReplyMarkup };
  }

  let text = rawText;
  const extractedButtons: Array<{ text: string; url: string }> = [];

  // 1. Match Markdown link format: [Button Label](https://url)
  const mdRegex = /\[([^\]\n]+)\]\(((?:https?:\/\/)[^\s\)]+)\)/gi;
  let mdMatch;
  while ((mdMatch = mdRegex.exec(rawText)) !== null) {
    const label = mdMatch[1].trim();
    const url = mdMatch[2].trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      const btnText = label.startsWith('🔗') || label.startsWith('🌐') || label.startsWith('🚪') ? label : `🔗 ${label}`;
      extractedButtons.push({ text: btnText, url });
    }
  }
  // Remove markdown links from text
  text = text.replace(mdRegex, '');

  // 2. Match labeled URL lines like: "رابط الحصة: https://..." or "رابط الدخول: https://..." or "Zoom: https://..."
  const labeledUrlLineRegex = /^[ \t]*(?:(?:رابط|مجموعة|قناة|منصة|كشف|شهادة|زوم|حصتي|حصة|كلاس|دخول|لقاء|الرابط|link|zoom|meet|url)\s*[^:\n]*[:：]\s*)((?:https?:\/\/)[^\s\n]+)[ \t]*$/gim;
  let labeledMatch;
  while ((labeledMatch = labeledUrlLineRegex.exec(rawText)) !== null) {
    const fullLine = labeledMatch[0].trim();
    const url = labeledMatch[1].trim();
    if (!extractedButtons.some((b) => b.url === url)) {
      const labelPart = fullLine.replace(url, '').replace(/[:：\s]+$/, '').trim();
      const btnLabel = labelPart ? `🔗 ${labelPart}` : '🔗 فتح الرابط';
      extractedButtons.push({ text: btnLabel, url });
    }
  }
  text = text.replace(labeledUrlLineRegex, '');

  // 3. Match any remaining plain URLs
  const plainUrlRegex = /(https?:\/\/[^\s\)\n]+)/gi;
  let plainMatch;
  while ((plainMatch = plainUrlRegex.exec(text)) !== null) {
    const url = plainMatch[1].trim();
    if (!extractedButtons.some((b) => b.url === url)) {
      extractedButtons.push({ text: '🔗 فتح الرابط', url });
    }
  }
  text = text.replace(plainUrlRegex, '');

  // 4. Clean trailing punctuation or hanging "الرابط:" / "رابط:" labels leftover
  text = text.replace(/^[ \t]*(?:رابط|الرابط|link|url)\s*[:：]?[ \t]*$/gim, '');
  // Collapse excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  // If text became completely empty due to link extraction, provide a neat fallback
  if (!text) {
    text = '🔗 اضغط على الزر أدناه لفتح الرابط المرفق:';
  }

  // If no buttons were extracted, return original structure
  if (extractedButtons.length === 0) {
    return { cleanText: text || rawText, replyMarkup: existingReplyMarkup };
  }

  // Build inline_keyboard rows for extracted URL buttons (stacked neatly)
  const urlRows: Array<Array<{ text: string; url: string }>> = [];
  extractedButtons.forEach((btn) => {
    urlRows.push([{ text: btn.text, url: btn.url }]);
  });

  if (existingReplyMarkup && Array.isArray(existingReplyMarkup.inline_keyboard)) {
    return {
      cleanText: text,
      replyMarkup: {
        ...existingReplyMarkup,
        inline_keyboard: [...existingReplyMarkup.inline_keyboard, ...urlRows],
      },
    };
  }

  return {
    cleanText: text,
    replyMarkup: {
      inline_keyboard: urlRows,
    },
  };
}

/**
 * Sends a direct message or media message to a given Telegram Chat ID.
 * Supports both options object or (token, chatId, text) signature.
 */
export async function sendTelegramMessage(
  optionsOrToken: SendTelegramOptions | string,
  maybeChatId?: string,
  maybeText?: string,
  extraOptions?: Partial<SendTelegramOptions>
): Promise<{ ok: boolean; messageId?: number; error?: string; isDuplicateSuppressed?: boolean }> {
  let options: SendTelegramOptions;

  if (typeof optionsOrToken === 'string') {
    options = {
      token: optionsOrToken,
      chatId: maybeChatId || '',
      text: maybeText || '',
      ...extraOptions,
    };
  } else {
    options = optionsOrToken;
  }

  const { token, chatId, text, parseMode, mediaUrl, mediaType, replyMarkup, skipDeduplication } = options;

  const cleanToken = token?.trim();
  const cleanChatId = chatId?.trim();

  if (!cleanToken) {
    return { ok: false, error: 'رمز بوت تيليجرام غير محدد (Bot Token Missing)' };
  }
  if (!cleanChatId) {
    return { ok: false, error: 'معرف المستلم غير محدد (Chat ID Missing)' };
  }

  // Automatically extract any links from text and transform them into inline keyboard buttons
  const { cleanText, replyMarkup: finalReplyMarkup } = extractUrlsAndBuildButtons(text || '', replyMarkup);

  // Deduplication Check: Prevent rapid identical message to same chatId (unless skipDeduplication is requested)
  const dedupKey = `${cleanChatId}_${(cleanText || '').slice(0, 80)}`;
  const nowMs = Date.now();
  if (!skipDeduplication) {
    const lastSentTime = recentTelegramDispatches.get(dedupKey) || 0;
    if (nowMs - lastSentTime < 2500) {
      return { ok: true, messageId: -1, isDuplicateSuppressed: true };
    }
    recentTelegramDispatches.set(dedupKey, nowMs);
  }

  // Clean old deduplication entries (> 60s)
  if (recentTelegramDispatches.size > 200) {
    for (const [k, v] of recentTelegramDispatches.entries()) {
      if (nowMs - v > 60000) recentTelegramDispatches.delete(k);
    }
  }

  try {
    let endpoint = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    let payload: Record<string, any> = {
      chat_id: cleanChatId,
    };

    if (mediaUrl && mediaUrl.trim()) {
      const cleanMedia = mediaUrl.trim();
      const type = mediaType || 'photo';

      if (type === 'photo') {
        endpoint = `https://api.telegram.org/bot${cleanToken}/sendPhoto`;
        payload.photo = cleanMedia;
        payload.caption = cleanText;
      } else if (type === 'video') {
        endpoint = `https://api.telegram.org/bot${cleanToken}/sendVideo`;
        payload.video = cleanMedia;
        payload.caption = cleanText;
      } else if (type === 'audio') {
        endpoint = `https://api.telegram.org/bot${cleanToken}/sendAudio`;
        payload.audio = cleanMedia;
        payload.caption = cleanText;
      } else {
        endpoint = `https://api.telegram.org/bot${cleanToken}/sendDocument`;
        payload.document = cleanMedia;
        payload.caption = cleanText;
      }
    } else {
      payload.text = cleanText;
    }

    if (parseMode) {
      payload.parse_mode = parseMode;
    }

    if (finalReplyMarkup) {
      payload.reply_markup = finalReplyMarkup;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.ok && data.result) {
      return { ok: true, messageId: data.result.message_id };
    } else {
      return { ok: false, error: data.description || 'فشل إرسال الرسالة من تيليجرام' };
    }
  } catch (err: any) {
    return { ok: false, error: `خطأ في إرسال تليجرام: ${err.message}` };
  }
}

/**
 * Answers a Telegram callback query (from inline button click) to dismiss loading state
 */
export async function answerTelegramCallbackQuery(token: string, callbackQueryId: string, text?: string): Promise<boolean> {
  const cleanToken = token?.trim();
  if (!cleanToken || !callbackQueryId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || '',
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch (e) {
    return false;
  }
}

export interface TelegramSignupRecord {
  updateId: number;
  type: 'student' | 'teacher';
  id: string;
  chatId: string;
  username?: string;
  firstName?: string;
  lang?: 'ar' | 'en' | 'th';
}

export interface TelegramIncomingInteraction {
  updateId: number;
  chatId: string;
  text: string;
  username?: string;
  firstName?: string;
  isPlainStart?: boolean;
}

export interface TelegramCallbackSelection {
  updateId: number;
  callbackQueryId: string;
  chatId: string;
  data: string; // e.g. "lang_ar_101", "lang_en", "lang_th"
  username?: string;
  firstName?: string;
}

/**
 * Helper to normalize Arabic/Indic numerals and Thai numerals into standard 0-9 digits and trim whitespace
 */
export function normalizeDigitsAndText(str: string): string {
  if (!str) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let res = String(str).trim();
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(arabicDigits[i], String(i)).replaceAll(thaiDigits[i], String(i));
  }
  return res;
}

/**
 * Fetches recent bot updates to auto-link students and teachers via deep-link OR by sending their Student ID directly,
 * and handles interactive language button selection.
 */
export async function syncTelegramSignups(token: string): Promise<{
  ok: boolean;
  signups: TelegramSignupRecord[];
  plainStarts?: TelegramIncomingInteraction[];
  idSubmissions?: TelegramIncomingInteraction[];
  callbackQueries?: TelegramCallbackSelection[];
  highestUpdateId?: number;
  error?: string;
}> {
  const cleanToken = token?.trim();
  if (!cleanToken) {
    return { ok: false, signups: [], error: 'رمز البوت غير محدد' };
  }

  try {
    // Read last offset to avoid processing ancient messages if saved
    let offsetParam = '';
    const storageKey = `tg_update_offset_${cleanToken.slice(-8)}`;
    try {
      const lastOffset = localStorage.getItem(storageKey);
      if (lastOffset) {
        offsetParam = `?offset=${lastOffset}`;
      }
    } catch (e) {}

    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getUpdates${offsetParam}`, {
      method: 'GET',
    });
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result)) {
      return { ok: false, signups: [], error: data.description || 'فشل جلب التحديثات من تيليجرام' };
    }

    // Advance and commit offset immediately to Telegram server and localStorage so updates are never re-fetched
    let highestUpdateId = 0;
    if (data.result.length > 0) {
      highestUpdateId = Math.max(...data.result.map((u: any) => u.update_id || 0));
      if (highestUpdateId > 0) {
        try {
          localStorage.setItem(storageKey, String(highestUpdateId + 1));
        } catch (e) {}
        // Acknowledge to Telegram in background to clear server queue
        fetch(`https://api.telegram.org/bot${cleanToken}/getUpdates?offset=${highestUpdateId + 1}&limit=1`, { method: 'GET' }).catch(() => {});
      }
    }

    const signups: TelegramSignupRecord[] = [];
    const plainStarts: TelegramIncomingInteraction[] = [];
    const idSubmissions: TelegramIncomingInteraction[] = [];
    const callbackQueries: TelegramCallbackSelection[] = [];
    const seenIds = new Set<string>();
    const seenPlainStarts = new Set<string>();
    const seenCallbacks = new Set<string>();

    for (const update of data.result) {
      const updateId = update.update_id || 0;

      // 1. Check for button clicks (Callback Queries)
      if (update.callback_query) {
        const cq = update.callback_query;
        const cqId = String(cq.id);
        const chatId = String(cq.message?.chat?.id || cq.from?.id || '');
        const callbackData = String(cq.data || '').trim();
        const username = cq.from?.username;
        const firstName = cq.from?.first_name || '';

        if (chatId && callbackData && !seenCallbacks.has(cqId)) {
          seenCallbacks.add(cqId);
          callbackQueries.push({
            updateId,
            callbackQueryId: cqId,
            chatId,
            data: callbackData,
            username,
            firstName,
          });
        }
        continue;
      }

      const msg = update.message || update.edited_message;
      if (!msg || !msg.text || !msg.chat || !msg.chat.id) continue;

      const rawText = msg.text.trim();
      const text = normalizeDigitsAndText(rawText);
      const chatId = String(msg.chat.id);
      const username = msg.from?.username;
      const firstName = msg.from?.first_name || '';

      // Pattern 1: Teacher Deep-Link: /start teacher_101 or /start teacher-101
      const teacherMatch = text.match(/^\/start\s+teacher[_-]([a-zA-Z0-9_-]+)/i);
      if (teacherMatch && teacherMatch[1]) {
        const teacherId = teacherMatch[1].trim();
        const key = `teacher_${teacherId}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          signups.push({
            updateId,
            type: 'teacher',
            id: teacherId,
            chatId,
            username,
            firstName,
          });
        }
        continue;
      }

      // Pattern 2: One-Click Deep-Link: /start student_101 or /start student_101_en or /start 101 or /start 101_ar
      const studentMatch = text.match(/^\/start\s+(?:student[_-])?([a-zA-Z0-9_\u0600-\u06FF-]+)/i);
      if (studentMatch && studentMatch[1]) {
        let payload = studentMatch[1].trim();
        const lowerPayload = payload.toLowerCase();

        // If the payload is a generic start word (e.g. register, start, general, join), treat as plain start
        if (['register', 'reg', 'start', 'general', 'join', 'help', 'bot'].includes(lowerPayload)) {
          if (!seenPlainStarts.has(chatId)) {
            seenPlainStarts.add(chatId);
            plainStarts.push({
              updateId,
              chatId,
              text,
              username,
              firstName,
              isPlainStart: true,
            });
          }
          continue;
        }

        let lang: 'ar' | 'en' | 'th' | undefined = undefined;
        // Check if language suffix is embedded e.g. 101_ar or 101_en or 101_th
        const langSuffixMatch = payload.match(/^(.*)[_-](ar|en|th)$/i);
        if (langSuffixMatch) {
          payload = langSuffixMatch[1];
          lang = langSuffixMatch[2].toLowerCase() as 'ar' | 'en' | 'th';
        }

        const key = `student_${payload}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          signups.push({
            updateId,
            type: 'student',
            id: payload,
            chatId,
            username,
            firstName,
            lang,
          });
        }
        continue;
      }

      // Pattern 3: Plain /start without arguments or general start words
      if (/^\/start$/i.test(text) || text === 'ابدأ' || text.toLowerCase() === 'start') {
        if (!seenPlainStarts.has(chatId)) {
          seenPlainStarts.add(chatId);
          plainStarts.push({
            updateId,
            chatId,
            text,
            username,
            firstName,
            isPlainStart: true,
          });
        }
        continue;
      }

      // Pattern 4: General Commands & ID / Query Submissions
      // (Includes /menu, /details, /results, /remaining, /schedule, /teacher, /info, /lang, تفاصيل, ت, تقييم, ن, متبقي, ب, جدول, ج, معلم, م, بيانات, ح, لغة, ل, and student ID numbers)
      idSubmissions.push({
        updateId,
        chatId,
        text: rawText,
        username,
        firstName,
      });
    }

    return { ok: true, signups, plainStarts, idSubmissions, callbackQueries, highestUpdateId };
  } catch (err: any) {
    return { ok: false, signups: [], error: err.message };
  }
}

/**
 * Commits Telegram updates offset up to latest so deleted registrations are not immediately re-applied from history
 */
export async function acknowledgeTelegramUpdates(token: string): Promise<void> {
  const cleanToken = token?.trim();
  if (!cleanToken) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getUpdates`, { method: 'GET' });
    const data = await res.json();
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      const highestId = Math.max(...data.result.map((u: any) => u.update_id || 0));
      if (highestId > 0) {
        // Calling getUpdates with offset = highestId + 1 confirms receipt to Telegram server
        await fetch(`https://api.telegram.org/bot${cleanToken}/getUpdates?offset=${highestId + 1}`, { method: 'GET' });
        try {
          localStorage.setItem(`tg_update_offset_${cleanToken.slice(-8)}`, String(highestId + 1));
        } catch (e) {}
      }
    }
  } catch (e) {}
}

export interface TelegramUserRecord {
  studentName?: string;
  studentId: string;
  telegramChatId: string;
  preferredLanguage?: string;
  linkDate?: string;
}

/**
 * Passively and asynchronously records a student's Telegram registration to the Telegram_Users sheet in Google Sheets.
 * Completely non-blocking and fire-and-forget to avoid slowing down critical user flows.
 */
export function saveTelegramUserToSheetPassive(user: TelegramUserRecord): void {
  if (!user.studentId && !user.telegramChatId) return;

  const sId = String(user.studentId || '').trim();
  const dateKey = `student_telegram_linked_date_${sId}`;
  let linkDate = user.linkDate;
  if (!linkDate) {
    try {
      const storedDate = localStorage.getItem(dateKey);
      if (storedDate) {
        linkDate = storedDate;
      } else {
        const now = new Date();
        linkDate =
          now.getFullYear() +
          '-' +
          String(now.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(now.getDate()).padStart(2, '0') +
          ' ' +
          String(now.getHours()).padStart(2, '0') +
          ':' +
          String(now.getMinutes()).padStart(2, '0') +
          ':' +
          String(now.getSeconds()).padStart(2, '0');
        localStorage.setItem(dateKey, linkDate);
      }
    } catch (e) {}
  }

  // Format display language nicely
  let langDisplay = 'العربية (AR)';
  const l = (user.preferredLanguage || 'ar').toLowerCase();
  if (l === 'en' || l.includes('eng')) langDisplay = 'English (EN)';
  else if (l === 'th' || l.includes('thai') || l.includes('ไทย')) langDisplay = 'ภาษาไทย (TH)';

  // Passive, non-blocking asynchronous call to Google Apps Script
  callGasApi('recordTelegramUser', {
    studentName: user.studentName || `طالب ${sId}`,
    studentId: sId,
    telegramChatId: String(user.telegramChatId || '').trim(),
    preferredLanguage: langDisplay,
    linkDate,
  }).catch(() => {
    // Silent catch so it never interrupts or slows down student registration or bot polling
  });
}

/**
 * Synchronizes all registered student records to the Telegram_Users sheet.
 */
export async function syncAllTelegramUsersToSheet(
  schedules: { studentId: string; studentName?: string; telegramChatId?: string; preferredLanguage?: string }[]
): Promise<{ success: boolean; message?: string; total?: number }> {
  const validUsers = schedules
    .filter((s) => s.telegramChatId && String(s.telegramChatId).trim())
    .map((s) => {
      const sId = String(s.studentId || '').trim();
      let linkDate = '';
      try {
        linkDate = localStorage.getItem(`student_telegram_linked_date_${sId}`) || '';
      } catch (e) {}
      if (!linkDate) {
        const now = new Date();
        linkDate =
          now.getFullYear() +
          '-' +
          String(now.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(now.getDate()).padStart(2, '0') +
          ' ' +
          String(now.getHours()).padStart(2, '0') +
          ':' +
          String(now.getMinutes()).padStart(2, '0') +
          ':' +
          String(now.getSeconds()).padStart(2, '0');
        try {
          localStorage.setItem(`student_telegram_linked_date_${sId}`, linkDate);
        } catch (e) {}
      }

      let langDisplay = 'العربية (AR)';
      const l = (s.preferredLanguage || 'ar').toLowerCase();
      if (l === 'en' || l.includes('eng')) langDisplay = 'English (EN)';
      else if (l === 'th' || l.includes('thai') || l.includes('ไทย')) langDisplay = 'ภาษาไทย (TH)';

      return {
        studentName: s.studentName || `طالب ${sId}`,
        studentId: sId,
        telegramChatId: String(s.telegramChatId).trim(),
        preferredLanguage: langDisplay,
        linkDate,
      };
    });

  if (validUsers.length === 0) {
    return { success: false, message: 'لا يوجد مشتركون مربوطون بحسابات تيليجرام للمزامنة' };
  }

  return callGasApi<{ success: boolean; message?: string; total?: number }>('syncAllTelegramUsers', {
    usersList: validUsers,
  });
}


