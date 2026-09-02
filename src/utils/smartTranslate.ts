/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Common Smart Translation dictionary for Educational & School vocabulary
 */
const smartVocabMap: Record<string, { en: string; th: string }> = {
  // Common phrases
  'مرحبا': { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  'أهلا': { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  'مرحباً': { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  'أهلاً': { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  'أهلاً بك': { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  'مرحباً بك': { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  'تذكير هام': { en: 'Important Reminder', th: 'การแจ้งเตือนสำคัญ' },
  'تذكير': { en: 'Reminder', th: 'การแจ้งเตือน' },
  'تنبيه': { en: 'Notice / Alert', th: 'ประกาศเตือน' },
  'إعلان': { en: 'Announcement', th: 'ประกาศ' },
  'إعلانات': { en: 'Announcements', th: 'ประกาศ' },
  'تعليمات': { en: 'Instructions', th: 'คำแนะนำ' },
  'توجيهات': { en: 'Guidelines', th: 'แนวปฏิบัติ' },
  'درس': { en: 'Lesson', th: 'บทเรียน' },
  'دروس': { en: 'Lessons', th: 'บทเรียน' },
  'واجب': { en: 'Homework', th: 'การบ้าน' },
  'اختبار': { en: 'Test / Exam', th: 'แบบทดสอบ' },
  'امتحان': { en: 'Examination', th: 'การสอบ' },
  'طالب': { en: 'Student', th: 'นักเรียน' },
  'طلاب': { en: 'Students', th: 'นักเรียน' },
  'الدروس والتمارين': { en: 'Lessons & Exercises', th: 'บทเรียนและแบบฝึกหัด' },
  'تمارين': { en: 'Exercises', th: 'แบบฝึกหัด' },
  'أنشطة': { en: 'Activities', th: 'กิจกรรม' },
  'تقارير': { en: 'Reports', th: 'รายงาน' },
  'تقارير الإنجاز': { en: 'Progress Reports', th: 'รายงานความก้าวหน้า' },
  'حالة الإنجاز': { en: 'Completion Status', th: 'สถานะการทำสำเร็จ' },
  'دروس جديدة': { en: 'New lessons', th: 'บทเรียนใหม่' },
  'دروس قديمة': { en: 'Previous lessons', th: 'บทเรียนที่ผ่านมา' },
  'الدروس المتبقية': { en: 'Remaining lessons', th: 'บทเรียนที่เหลือ' },
  'يرجى الانتباه': { en: 'Please pay attention', th: 'โปรดใส่ใจ' },
  'شكرا لكم': { en: 'Thank you', th: 'ขอบคุณครับ/ค่ะ' },
  'شكراً لكم': { en: 'Thank you', th: 'ขอบคุณครับ/ค่ะ' },
  'بالتوفيق والنجاح': { en: 'Best wishes and success', th: 'ขอให้ประสบความสำเร็จ' },
  'الرسم والتلوين': { en: 'Drawing & Coloring', th: 'การวาดรูปและระบายสี' },
  'توصيل الكلمات': { en: 'Word Matching', th: 'การจับคู่คำ' },
  'تركيب الكلمات': { en: 'Word Construction', th: 'การประกอบคำ' },
  'القرآن الكريم': { en: 'The Holy Quran', th: 'อัลกุรอาน' },
  'اللغة العربية': { en: 'Arabic Language', th: 'ภาษาอาหรับ' },
};

/**
 * Translates Arabic text into English and Thai
 * 1. Uses smart dictionary matching for exact/sub phrase mapping
 * 2. Uses free Google Translate REST API for live high-quality dynamic translation
 */
export async function smartTranslateText(arabicText: string): Promise<{ en: string; th: string }> {
  const clean = arabicText ? arabicText.trim() : '';
  if (!clean) {
    return { en: '', th: '' };
  }

  // Check direct dictionary match first
  if (smartVocabMap[clean]) {
    return {
      en: smartVocabMap[clean].en,
      th: smartVocabMap[clean].th,
    };
  }

  try {
    // Free Google Translate single-lookup endpoint for English
    const enPromise = fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(clean)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && Array.isArray(data[0])) {
          return data[0].map((item: any) => item[0]).join('');
        }
        return '';
      })
      .catch(() => '');

    // Free Google Translate single-lookup endpoint for Thai
    const thPromise = fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=th&dt=t&q=${encodeURIComponent(clean)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && Array.isArray(data[0])) {
          return data[0].map((item: any) => item[0]).join('');
        }
        return '';
      })
      .catch(() => '');

    const [enRes, thRes] = await Promise.all([enPromise, thPromise]);

    return {
      en: enRes || clean,
      th: thRes || clean,
    };
  } catch (err) {
    console.warn('Smart translation fallback triggered:', err);
    return {
      en: clean,
      th: clean,
    };
  }
}
