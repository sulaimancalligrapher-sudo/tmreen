/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { callGasApi, setApiUrl, getApiUrl, resetApiUrlToDefault, DEFAULT_GAS_API_URL } from '../utils/api';
import { Database, Key, CheckCircle, Copy, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onSuccess: () => void;
  onBack?: () => void;
  showBackOnly?: boolean;
}

export default function Onboarding({ onSuccess, onBack, showBackOnly = false }: OnboardingProps) {
  const [url, setUrl] = useState(getApiUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTestConnection = async () => {
    if (!url.trim().startsWith('https://script.google.com/')) {
      setTestResult({
        success: false,
        message: 'رابط غير صالح! يجب أن يبدأ الرابط بـ https://script.google.com/',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    setApiUrl(url);

    try {
      // Test the URL with a dummy action like getData
      await callGasApi('getData');
      setTestResult({
        success: true,
        message: 'تم الاتصال بقاعدة البيانات بنجاح! الرابط صالح للعمل.',
      });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `فشل الاتصال: تأكد من نشر الـ Web App وتعيين الوصول لـ "Anyone" (أي شخص).\nتفاصيل الخطأ: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveOnly = () => {
    setApiUrl(url);
    onSuccess();
  };

  const copyAppsScriptCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden"
      >
        <div className="bg-slate-900 p-6 md:p-10 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-400">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-sans">
                  إعدادات الربط والاتصال
                </h1>
                <p className="text-slate-400 text-sm md:text-base mt-1">
                  ربط المنصة التعليمية بقاعدة بيانات Google Sheets بشكل مجاني وآمن بالكامل.
                </p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* Main Input Form */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              رابط خدمة الويب (Apps Script URL)
            </h2>
            <p className="text-sm text-slate-600">
              أدخل رابط الـ Web App الذي حصلت عليه بعد نشر الكود في بيئة Google Apps Script:
            </p>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                dir="ltr"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !url.trim()}
                  className="bg-slate-950 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2 min-w-[130px]"
                >
                  {testing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الفحص...
                    </>
                  ) : (
                    'فحص الاتصال'
                  )}
                </button>
                <button
                  onClick={handleSaveOnly}
                  disabled={!url.trim()}
                  className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition"
                >
                  حفظ فقط
                </button>
                <button
                  onClick={() => {
                    resetApiUrlToDefault();
                    setUrl(getApiUrl());
                    setTestResult({
                      success: true,
                      message: 'تم استعادة الرابط الافتراضي بنجاح.'
                    });
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-3 rounded-xl transition flex items-center gap-1 text-xs"
                  title="استعادة الرابط الافتراضي المعتمد"
                >
                  <RotateCcw className="w-4 h-4" />
                  الافتراضي
                </button>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-xs text-amber-900 leading-relaxed font-sans space-y-1">
              <span className="font-bold block text-amber-950">💡 نصيحة للتشغيل التلقائي على جميع الأجهزة (Vercel):</span>
              <p>
                لكي يفتح الموقع مباشرة على كافة الجوالات والأجهزة دون مطالبات بإدخال الرابط، يمكنك وضع متغيّر البيئة <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">VITE_GAS_API_URL</code> برابط الـ Apps Script في إعدادات مشروعك بـ Vercel، أو تحديث قيمة <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">DEFAULT_GAS_API_URL</code> داخل ملف <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">src/utils/api.ts</code>.
              </p>
            </div>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm flex gap-2.5 items-start ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
                <span className="whitespace-pre-line leading-relaxed">{testResult.message}</span>
              </motion.div>
            )}
          </div>

          {/* Guide / Tutorial */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              خطوات تهيئة الاتصال خطوة بخطوة 🚀
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700">
              <div className="space-y-2.5">
                <div className="bg-slate-900 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shadow">
                  1
                </div>
                <h3 className="font-bold text-slate-900">إنشاء مشروع Apps Script</h3>
                <p className="leading-relaxed">
                  افتح جدول البيانات (Google Sheet) الخاص بك، واضغط على <strong>Extensions</strong> ثم <strong>Apps Script</strong>.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-900 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shadow">
                  2
                </div>
                <h3 className="font-bold text-slate-900">لصق وحفظ كود الاتصال</h3>
                <p className="leading-relaxed">
                  احذف جميع الأكواد الموجودة والصق كود الـ Apps Script الموحد بالأسفل، ثم احفظ المشروع.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="bg-slate-900 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm shadow">
                  3
                </div>
                <h3 className="font-bold text-slate-900">نشر كـ Web App</h3>
                <p className="leading-relaxed">
                  اضغط على <strong>Deploy</strong> ثم <strong>New Deployment</strong>. اختر <strong>Web App</strong>. اضبط الوصول إلى <strong>Anyone</strong> واضغط <strong>Deploy</strong>، ثم انسخ الرابط والصقه بالأعلى.
                </p>
              </div>
            </div>
          </div>

          {/* Code Showcase Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                كود Google Apps Script الموحد (`Code.gs`)
              </h3>
              <button
                onClick={copyAppsScriptCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ!' : 'نسخ الكود بالكامل'}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-950">
              <pre className="p-4 overflow-x-auto text-left text-xs font-mono text-slate-300 max-h-[300px] leading-relaxed">
                {APPS_SCRIPT_CODE}
              </pre>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const APPS_SCRIPT_CODE = `/**
 * Google Apps Script API For Arabic Learning Hub
 * Deploy as Web App:
 * - Execute as: Me (your Google account)
 * - Who has access: Anyone (required for custom web apps)
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var request;
  try {
    request = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid JSON format" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var action = request.action;
  var result = {};
  
  try {
    if (action === 'getData') {
      result = getData();
    } else if (action === 'loginUser') {
      result = loginUser(request.studentName, request.studentId, request.deviceId, request.lat, request.lng);
    } else if (action === 'getLessons') {
      result = getLessons(request.studentId);
    } else if (action === 'getRandomWord') {
      result = getRandomWord(request.previousIndex, request.rowNumber, request.studentId);
    } else if (action === 'recordAnswer') {
      result = recordAnswer(request.studentId, request.studentName, request.topic, request.questionIndex, request.isCorrect);
    } else if (action === 'resetLesson') {
      result = resetLesson(request.studentId, request.topic);
    } else if (action === 'getLetters') {
      result = getLetters(request.studentId);
    } else if (action === 'saveProgress') {
      result = saveProgress(request.studentId, request.studentName, request.label, request.details, request.repetitionsCompleted, request.finalPercentage, request.imageData);
    } else if (action === 'getStudentResults') {
      result = getStudentResults(request.studentId);
    } else if (action === 'resetLesson4') {
      result = resetLesson4(request.studentId, request.label);
    } else if (action === 'getLessonsFromMatches') {
      result = getLessonsFromMatches(request.studentId);
    } else if (action === 'getAllStudentsSchedule') {
      result = getAllStudentsSchedule();
    } else if (action === 'updateStudentSchedule') {
      result = updateStudentSchedule(request.studentId, request.startDate, request.activeDays, request.lessonsPerWeek, request.daysToKeep, request.expiryDate, request.examOverrides);
    } else if (action === 'getLessonStatus') {
      result = getLessonStatus(request.studentId, request.lessonName);
    } else if (action === 'saveAnswers') {
      result = saveAnswers(request.studentId, request.studentName, request.lessonName, request.results, request.numQuestions);
    } else if (action === 'incrementRetry') {
      result = incrementRetry(request.studentId, request.lessonName);
    } else if (action === 'getStudentData') {
      result = getStudentData(request.studentId);
    } else if (action === 'getStudentVideoData') {
      result = getStudentVideoData(request.studentId);
    } else if (action === 'getCorrectionData') {
      result = getCorrectionData(request.studentId);
    } else if (action === 'getWordsExerciseData') {
      result = getWordsExerciseData(request.studentId);
    } else if (action === 'getWaslExerciseData') {
      result = getWaslExerciseData(request.studentId);
    } else if (action === 'getWritingExerciseData') {
      result = getWritingExerciseData(request.studentId);
    } else if (action === 'syncConsolidatedEvaluations') {
      result = syncConsolidatedEvaluations(request.studentId, request.studentName);
    } else if (action === 'getStudentsEvaluations') {
      result = getStudentsEvaluations();
    } else if (action === 'getStudentConsolidatedEvaluation') {
      result = getStudentConsolidatedEvaluation(request.studentId, request.studentName);
    } else if (action === 'generateStudentConsolidatedPDF') {
      result = generateStudentConsolidatedPDF(request.studentId, request.studentName);
    } else if (action === 'generateStudentPDF') {
      result = generateStudentPDF(request.studentId, 'student');
    } else if (action === 'getPdfControlForStudent') {
      result = getPdfControlForStudent(request.studentId);
    } else if (action === 'getHoomDataForStudent') {
      result = getHoomDataForStudent(request.username);
    } else if (action === 'loginAdmin') {
      result = loginAdmin(request.username, request.password);
    } else if (action === 'getLessonsForAdmin') {
      result = getLessonsForAdmin();
    } else if (action === 'getLessonDetails') {
      result = getLessonDetails(request.type, request.lessonName);
    } else if (action === 'addOrUpdateLessonWords') {
      result = addOrUpdateLessonWords(request.lessonData);
    } else if (action === 'addOrUpdateLessonMatching') {
      result = addOrUpdateLessonMatching(request.lessonData);
    } else if (action === 'addOrUpdateLessonDrawing') {
      result = addOrUpdateLessonDrawing(request.lessonData);
    } else if (action === 'deleteLesson') {
      result = deleteLesson(request.sheetName, request.lessonName);
    } else {
      result = { error: "Unknown API action: " + action };
    }
  } catch (error) {
    result = { error: error.toString(), stack: error.stack };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================== CORE APPS SCRIPT DATABASE HANDLERS ======================

function getData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var profileSheet = getSheetByNameFlexible(ss, 'Profile');
  var contactSheet = getSheetByNameFlexible(ss, 'Contact');
  var aboutSheet = getSheetByNameFlexible(ss, 'About');
  var hoomSheet = getSheetByNameFlexible(ss, 'HOOM');
  
  var profileData = profileSheet ? profileSheet.getDataRange().getValues() : [];
  var contactData = contactSheet ? contactSheet.getDataRange().getValues() : [];
  var aboutData = aboutSheet ? aboutSheet.getDataRange().getValues() : [];
  var hoomData = hoomSheet ? hoomSheet.getDataRange().getValues() : [];
  
  var buttonsData = [];
  for (var i = 11; i <= 15; i++) {
    buttonsData.push({
      buttonText: profileData[i] && profileData[i][1] ? profileData[i][1].toString().trim() : 'زر بدون نص',
      buttonUrl: profileData[i] && profileData[i][2] ? profileData[i][2].toString().trim() : '#'
    });
  }
  
  var headerData = {
    logoUrl: profileData[9] && profileData[9][2] ? profileData[9][2].toString().trim() : '',
    mainTitle: profileData[9] && profileData[9][1] ? profileData[9][1].toString().trim() : '',
    description: profileData[10] && profileData[10][1] ? profileData[10][1].toString().trim() : '',
    buttons: buttonsData
  };
  
  return {
    profile: profileData.slice(1),
    contact: contactData.slice(1),
    about: aboutData.slice(1),
    hoom: hoomData.slice(1),
    header: headerData
  };
}

function loginUser(studentName, studentId, deviceId, lat, lng) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var settingsSheet = getSheetByNameFlexible(ss, 'Settings');
    if (!settingsSheet) {
      return { success: false, message: 'ورقة Settings غير موجودة' };
    }
    
    var usersRange = settingsSheet.getRange("Z2:AX" + settingsSheet.getLastRow());
    var usersData = usersRange.getValues();
    var userRow = -1;
    for (var i = 0; i < usersData.length; i++) {
      if (usersData[i][0].toString().trim() === studentName.trim() && usersData[i][1].toString().trim() === studentId.trim()) {
        userRow = i + 2;
        break;
      }
    }
    if (userRow === -1) {
      return { success: false, message: 'اسم أو رقم الطالب غير صحيح' };
    }
    
    var status = settingsSheet.getRange(userRow, 28).getValue().toString().trim();
    if (status === 'لا' || status === 'false') {
      return { success: false, message: 'تم منع الدخول لهذا الطالب' };
    }
    
    var deviceColumns = [
      {locationCol: 30, deviceCol: 31},
      {locationCol: 32, deviceCol: 33},
      {locationCol: 34, deviceCol: 35},
      {locationCol: 36, deviceCol: 37},
      {locationCol: 38, deviceCol: 39},
      {locationCol: 40, deviceCol: 41},
      {locationCol: 42, deviceCol: 43},
      {locationCol: 44, deviceCol: 45},
      {locationCol: 46, deviceCol: 47},
      {locationCol: 48, deviceCol: 49}
    ];
    
    var allowedDevices = parseInt(settingsSheet.getRange(userRow, 29).getValue()) || 1;
    allowedDevices = Math.min(allowedDevices, 10);
    
    var deviceIndex = -1;
    for (var j = 0; j < allowedDevices; j++) {
      var currentDeviceId = settingsSheet.getRange(userRow, deviceColumns[j].deviceCol).getValue().toString().trim();
      if (currentDeviceId === deviceId) {
        deviceIndex = j;
        break;
      }
    }
    
    var registeredCount = 0;
    for (var j = 0; j < allowedDevices; j++) {
      if (settingsSheet.getRange(userRow, deviceColumns[j].deviceCol).getValue().toString().trim() !== '') {
        registeredCount++;
      }
    }
    
    if (deviceIndex === -1) {
      if (registeredCount >= allowedDevices) {
        return { success: false, message: 'تم تجاوز عدد الأجهزة المسموحة لك يا بطل.' };
      }
      for (var j = 0; j < allowedDevices; j++) {
        if (settingsSheet.getRange(userRow, deviceColumns[j].deviceCol).getValue().toString().trim() === '') {
          deviceIndex = j;
          break;
        }
      }
    }
    
    var location = 'غير متاح';
    if (lat && lng) {
      try {
        var geocoder = Maps.newGeocoder().reverseGeocode(lat, lng);
        if (geocoder.results && geocoder.results.length > 0) {
          location = geocoder.results[0].formatted_address;
        }
      } catch (geoErr) {
        location = lat + ", " + lng;
      }
    }
    
    if (deviceIndex !== -1) {
      settingsSheet.getRange(userRow, deviceColumns[deviceIndex].locationCol).setValue(location);
      settingsSheet.getRange(userRow, deviceColumns[deviceIndex].deviceCol).setValue(deviceId);
    }
    
    SpreadsheetApp.flush();
    return { success: true, name: studentName, id: studentId };
  } catch (e) {
    return { success: false, message: 'حدث خطأ في عملية تسجيل الدخول: ' + e.toString() };
  }
}

function getLessons(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Questions');
  var answersSheet = getSheetByNameFlexible(ss, 'Answers-Questions');
  if (!sheet || !answersSheet) return [];
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  ensureColumns(sheet, 91);
  
  var schedule = getStudentSchedule(studentId);
  var effSchedule = getEffectiveScheduleForSheet(schedule, 'Questions');
  var globalExpired = false;
  if (effSchedule && effSchedule.expiryDate && effSchedule.expiryDate.trim() !== '') {
    var expParts = effSchedule.expiryDate.split('-');
    if (expParts.length === 3) {
      var expiryDateObj = new Date(parseInt(expParts[0]), parseInt(expParts[1]) - 1, parseInt(expParts[2]));
      expiryDateObj.setHours(0, 0, 0, 0);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today >= expiryDateObj) {
        globalExpired = true;
      }
    }
  }
  if (globalExpired) {
    return [];
  }

  var unlockedCount = 99999;
  var daysToKeep = 99999;
  if (effSchedule && effSchedule.startDate !== '') {
    unlockedCount = getUnlockedCount(effSchedule.startDate, effSchedule.activeDays, effSchedule.lessonsPerWeek, new Date());
    if (effSchedule.daysToKeep && effSchedule.daysToKeep.toString().trim() !== '') {
      daysToKeep = parseInt(effSchedule.daysToKeep) || 99999;
    }
  }
  var activeLessonCount = 0;
  
  var topics = [];
  var topicsRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < topicsRange.length; i++) {
    var topicName = topicsRange[i][0].toString().trim();
    if (topicName !== '') {
      var row = i + 2;
      var rowData = sheet.getRange(row, 1, 1, 91).getValues()[0];
      
      // Check Show Date, Hide Date and status
      var showDateVal = rowData[88] || '';
      var hideDateVal = rowData[89] || '';
      var currentStatusVal = rowData[90] || '';
      var status = getOrUpdateStatus(sheet, row, 91, showDateVal, hideDateVal, currentStatusVal);
      status = getStudentLessonStatus(schedule, 'Questions', topicName, status);
      
      if (status !== 'ظهور') {
        continue; // Skip this lesson for the student!
      }
      
      var hasOverride = false;
      if (schedule && schedule.examOverrides) {
        try {
          var ov = JSON.parse(schedule.examOverrides);
          if (ov && ov['Questions'] && ov['Questions'][topicName]) {
            hasOverride = true;
          }
        } catch (e) {}
      }
      var isExamLesson = (showDateVal.toString().trim() !== '' || hideDateVal.toString().trim() !== '' || hasOverride);
      
      if (effSchedule && effSchedule.startDate !== '') {
        if (!isExamLesson) {
          activeLessonCount++;
          if (activeLessonCount > unlockedCount) {
            continue; // Skip because it exceeds the unlocked limit!
          }
          
          if (daysToKeep !== 99999) {
            var lessonsPerDay = parseInt(effSchedule.lessonsPerWeek) || 3;
            var activeDayIndexForLesson = Math.ceil(activeLessonCount / lessonsPerDay);
            var unlockDate = getActiveStudyDayDate(effSchedule.startDate, effSchedule.activeDays, activeDayIndexForLesson);
            if (unlockDate) {
              var today = new Date();
              today.setHours(0, 0, 0, 0);
              var diffMs = today.getTime() - unlockDate.getTime();
              var diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
              if (diffDays >= daysToKeep) {
                continue; // Skip because the display duration of this lesson has expired!
              }
            }
          }
        }
      }
      
      var questions = [];
      for (var q = 1; q <= 20; q++) {
        var startIndex = 1 + (q - 1) * 4;
        var questionText = rowData[startIndex] || '';
        if (questionText.toString().trim() === '') break;
        questions.push({ question: questionText, originalIndex: q - 1 });
      }
      var numQuestions = questions.length;
      var isCompleted = false;
      var usedResets = 0;
      
      if (numQuestions > 0) {
        var foundRow = -1;
        var answersLastRow = answersSheet.getLastRow();
        if (answersLastRow >= 2) {
          var ids = answersSheet.getRange(2, 1, answersLastRow - 1, 1).getValues();
          var topicsInAnswers = answersSheet.getRange(2, 3, answersLastRow - 1, 1).getValues();
          for (var j = 0; j < ids.length; j++) {
            if (ids[j][0].toString().trim() === studentId.toString().trim() && topicsInAnswers[j][0].toString().trim() === topicName.trim()) {
              foundRow = j + 2;
              break;
            }
          }
        }
        if (foundRow !== -1) {
          var answerData = answersSheet.getRange(foundRow, 4, 1, 20).getValues()[0];
          var numAnswers = answerData.filter(function(v) { return v.toString().trim() !== ''; }).length;
          if (numAnswers >= numQuestions) {
            isCompleted = true;
          }
          usedResets = answersSheet.getRange(foundRow, 25).getValue() || 0;
        }
      }
      
      var resetCondition = rowData[84] ? rowData[84].toString().trim() : 'نعم';
      var allowReset = resetCondition === 'نعم';
      var maxResetsRaw = rowData[85];
      var maxResets = (typeof maxResetsRaw === 'number' && maxResetsRaw > 0) ? maxResetsRaw : 0;
      
      topics.push({
        row: row,
        topic: topicName,
        isCompleted: isCompleted,
        allowReset: allowReset,
        maxResets: maxResets,
        usedResets: usedResets
      });
    }
  }
  return topics;
}

function getRandomWord(previousIndex, rowNumber, studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Questions');
  var answersSheet = getSheetByNameFlexible(ss, 'Answers-Questions');
  if (!sheet || !answersSheet || !rowNumber || !studentId) return null;
  
  var rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (rowData.length < 1 || !rowData[0]) return null;
  
  var topic = rowData[0] || 'موضوع غير محدد';
  var condition = sheet.getRange(rowNumber, 83).getValue().toString().trim() || 'لا';
  var retryCondition = sheet.getRange(rowNumber, 84).getValue().toString().trim() || 'نعم';
  var showCorrectAnswer = sheet.getRange(rowNumber, 82).getValue().toString().trim() || 'نعم';
  
  var allQuestions = [];
  for (var q = 1; q <= 20; q++) {
    var startIndex = 1 + (q - 1) * 4;
    var questionText = rowData[startIndex] || '';
    if (questionText.toString().trim() === '') break;
    
    var media = rowData[startIndex + 1] || '';
    var lettersRaw = rowData[startIndex + 2] || '';
    var correctRaw = rowData[startIndex + 3] || lettersRaw || '';
    
    var type = 'arrange';
    var displayText = '';
    var correct = correctRaw.toString().split(',').map(function(c) { return c.trim(); }).filter(function(c) { return c !== ''; });
    
    if (correctRaw.toString().includes('|') && /\\|[^|]+\\|/.test(correctRaw.toString())) {
      type = 'completion';
      displayText = correctRaw.toString().replace(/\\|[^|]+\\|/g, '...');
      var fullCorrect = correctRaw.toString().replace(/\\|([^|]+)\\|/g, '$1');
      correct = fullCorrect.split(',').map(function(c) { return c.trim(); }).filter(function(c) { return c !== ''; });
    }
    
    allQuestions.push({
      question: questionText,
      media: media,
      letters: lettersRaw.toString().split(/\\s+/).filter(function(l) { return l.trim() !== ''; }),
      correct: correct,
      displayText: displayText,
      type: type,
      originalIndex: q - 1
    });
  }
  
  if (allQuestions.length === 0) return null;
  
  var answeredIndices = [];
  var foundRow = -1;
  var lastRowAnswers = answersSheet.getLastRow();
  if (lastRowAnswers >= 2) {
    var ids = answersSheet.getRange(2, 1, lastRowAnswers - 1, 1).getValues();
    var topicsInAnswers = answersSheet.getRange(2, 3, lastRowAnswers - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0].toString().trim() === studentId.toString().trim() && topicsInAnswers[i][0].toString().trim() === topic.trim()) {
        foundRow = i + 2;
        break;
      }
    }
  }
  
  if (foundRow !== -1) {
    var answerData = answersSheet.getRange(foundRow, 4, 1, 20).getValues()[0];
    answerData.forEach(function(value, idx) {
      if (value.toString().trim() !== '') {
        answeredIndices.push(idx);
      }
    });
  }
  
  var availableQuestions = allQuestions.filter(function(q) { return !answeredIndices.includes(q.originalIndex); });
  if (availableQuestions.length === 0) {
    return {
      completed: true,
      totalQuestions: allQuestions.length,
      answeredQuestions: answeredIndices.length
    };
  }
  
  var randomAvailableIdx = Math.floor(Math.random() * availableQuestions.length);
  var selectedOriginalIndex = availableQuestions[randomAvailableIdx].originalIndex;
  
  if (previousIndex !== undefined && availableQuestions.length > 1) {
    while (selectedOriginalIndex === previousIndex) {
      randomAvailableIdx = Math.floor(Math.random() * availableQuestions.length);
      selectedOriginalIndex = availableQuestions[randomAvailableIdx].originalIndex;
    }
  }
  
  var selectedQuestion = availableQuestions[randomAvailableIdx];
  return {
    topic: topic,
    question: selectedQuestion.question,
    media: selectedQuestion.media,
    letters: selectedQuestion.letters,
    correct: selectedQuestion.correct,
    displayText: selectedQuestion.displayText,
    type: selectedQuestion.type,
    condition: condition,
    retryCondition: retryCondition,
    showCorrectAnswer: showCorrectAnswer,
    index: selectedQuestion.originalIndex,
    totalQuestions: allQuestions.length,
    answeredQuestions: answeredIndices.length
  };
}

function recordAnswer(studentId, studentName, topic, questionIndex, isCorrect) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Answers-Questions');
  var questionsSheet = getSheetByNameFlexible(ss, 'Questions');
  if (!sheet || !questionsSheet) return 'Error: Sheets missing';
  
  var lastRow = sheet.getLastRow();
  var resultText = isCorrect ? 'صحيح' : 'خاطئ';
  var resultColumn = 4 + questionIndex;
  
  var foundRow = -1;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var topics = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0].toString().trim() === studentId.toString().trim() && topics[i][0].toString().trim() === topic.trim()) {
        foundRow = i + 2;
        break;
      }
    }
  }
  
  var targetRow;
  if (foundRow !== -1) {
    targetRow = foundRow;
    sheet.getRange(targetRow, resultColumn).setValue(resultText);
  } else {
    var newRow = [studentId, studentName, topic];
    for (var j = 1; j <= 20; j++) newRow.push('');
    newRow.push(''); // X: Timestamp
    newRow.push(0);  // Y: usedResets
    newRow.push(''); // Z
    newRow.push(''); // AA
    newRow.push(''); // AB
    
    sheet.appendRow(newRow);
    targetRow = sheet.getLastRow();
    sheet.getRange(targetRow, resultColumn).setValue(resultText);
    sheet.getRange(targetRow, 24).setValue(new Date());
    
    var questionsLastRow = questionsSheet.getLastRow();
    if (questionsLastRow >= 2) {
      var questionsTopics = questionsSheet.getRange(2, 1, questionsLastRow - 1, 1).getValues();
      var matchingRow = -1;
      for (var k = 0; k < questionsTopics.length; k++) {
        if (questionsTopics[k][0].toString().trim() === topic.trim()) {
          matchingRow = k + 2;
          break;
        }
      }
      if (matchingRow !== -1) {
        var ciValue = questionsSheet.getRange(matchingRow, 87).getValue();
        var cjValue = questionsSheet.getRange(matchingRow, 88).getValue();
        sheet.getRange(targetRow, 29).setValue(ciValue); // AC
        sheet.getRange(targetRow, 30).setValue(cjValue); // AD
      }
    }
  }
  
  var answerData = sheet.getRange(targetRow, 4, 1, 20).getValues()[0];
  var correctCount = answerData.filter(function(v) { return v.toString().trim() === 'صحيح'; }).length;
  var wrongCount = answerData.filter(function(v) { return v.toString().trim() === 'خاطئ'; }).length;
  sheet.getRange(targetRow, 28).setValue("الصحيح: " + correctCount + " و الخطأ: " + wrongCount);
  
  var numAnswers = answerData.filter(function(v) { return v.toString().trim() !== ''; }).length;
  var totalQuestions = sheet.getRange(targetRow, 29).getValue() || 0;
  if (numAnswers >= totalQuestions && totalQuestions > 0) {
    var fullMark = sheet.getRange(targetRow, 30).getValue() || 0;
    if (fullMark > 0) {
      var percentage = Math.round((correctCount / totalQuestions) * 100) + "%";
      sheet.getRange(targetRow, 31).setValue(percentage); // AE
    }
  }
  return 'Recorded';
}

function resetLesson(studentId, topic) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Answers-Questions');
  if (!sheet) return 'Error: Sheets missing';
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'No data';
  
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var topicsInSheet = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0].toString().trim() === studentId.toString().trim() && topicsInSheet[i][0].toString().trim() === topic.trim()) {
      var rowToUpdate = i + 2;
      var usedResets = sheet.getRange(rowToUpdate, 25).getValue() || 0;
      sheet.getRange(rowToUpdate, 25).setValue(usedResets + 1);
      sheet.getRange(rowToUpdate, 4, 1, 20).clearContent();
      sheet.getRange(rowToUpdate, 28).clearContent();
      sheet.getRange(rowToUpdate, 31).clearContent();
      return 'Reset successful';
    }
  }
  return 'No record found';
}

function getLetters(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, "Questions-R");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  ensureColumns(sheet, 38);
  
  var data = sheet.getRange(2, 1, lastRow - 1, 38).getValues();
  var completedLabels = getCompletedLabelsFromProgress(studentId);
  
  var schedule = getStudentSchedule(studentId);
  var effSchedule = getEffectiveScheduleForSheet(schedule, 'Questions-R');
  var globalExpired = false;
  if (effSchedule && effSchedule.expiryDate && effSchedule.expiryDate.trim() !== '') {
    var expParts = effSchedule.expiryDate.split('-');
    if (expParts.length === 3) {
      var expiryDateObj = new Date(parseInt(expParts[0]), parseInt(expParts[1]) - 1, parseInt(expParts[2]));
      expiryDateObj.setHours(0, 0, 0, 0);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today >= expiryDateObj) {
        globalExpired = true;
      }
    }
  }
  if (globalExpired) {
    return [];
  }

  var unlockedCount = 99999;
  var daysToKeep = 99999;
  if (effSchedule && effSchedule.startDate !== '') {
    unlockedCount = getUnlockedCount(effSchedule.startDate, effSchedule.activeDays, effSchedule.lessonsPerWeek, new Date());
    if (effSchedule.daysToKeep && effSchedule.daysToKeep.toString().trim() !== '') {
      daysToKeep = parseInt(effSchedule.daysToKeep) || 99999;
    }
  }
  var activeLessonCount = 0;
  
  return data.map(function(row, idx) {
    var lessonLabel = row[0] ? row[0].toString().trim() : "";
    if (!lessonLabel) return null;
    
    // Check Show Date, Hide Date and status
    var showDateVal = row[35] || '';
    var hideDateVal = row[36] || '';
    var currentStatusVal = row[37] || '';
    var rowNum = idx + 2;
    var status = getOrUpdateStatus(sheet, rowNum, 38, showDateVal, hideDateVal, currentStatusVal);
    status = getStudentLessonStatus(schedule, 'Questions-R', lessonLabel, status);
    
    if (status !== 'ظهور') {
      return null; // Skip this lesson for the student!
    }
    
    var hasOverride = false;
    if (schedule && schedule.examOverrides) {
      try {
        var ov = JSON.parse(schedule.examOverrides);
        if (ov && ov['Questions-R'] && ov['Questions-R'][lessonLabel]) {
          hasOverride = true;
        }
      } catch (e) {}
    }
    var isExamLesson = (showDateVal.toString().trim() !== '' || hideDateVal.toString().trim() !== '' || hasOverride);
    
    if (effSchedule && effSchedule.startDate !== '') {
      if (!isExamLesson) {
        activeLessonCount++;
        if (activeLessonCount > unlockedCount) {
          return null; // Skip because it exceeds the unlocked limit!
        }
        
        if (daysToKeep !== 99999) {
          var lessonsPerDay = parseInt(effSchedule.lessonsPerWeek) || 3;
          var activeDayIndexForLesson = Math.ceil(activeLessonCount / lessonsPerDay);
          var unlockDate = getActiveStudyDayDate(effSchedule.startDate, effSchedule.activeDays, activeDayIndexForLesson);
          if (unlockDate) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var diffMs = today.getTime() - unlockDate.getTime();
            var diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
            if (diffDays >= daysToKeep) {
              return null; // Skip because the display duration of this lesson has expired!
            }
          }
        }
      }
    }
    
    var questions = [];
    for (var i = 0; i < 10; i++) {
      var textCol = 1 + i * 3;
      var imageCol = textCol + 1;
      var settingsCol = textCol + 2;
      var subLabel = row[textCol] ? row[textCol].toString().trim() : "";
      if (!subLabel) continue;
      
      // Do not skip completed questions to allow reviewing and retrying them in the lessons list
      var fullLabel = lessonLabel + " - " + subLabel;
      
      var imageUrls = row[imageCol]
        ? row[imageCol].toString().trim().split(/[;؛,]/).map(function(p) { return normalizeDriveUrl(p.trim()); }).filter(function(u) { return u !== ""; })
        : [];
        
      var settingsStr = row[settingsCol] ? row[settingsCol].toString().trim() : "";
      var settings = {};
      
      if (settingsStr.includes(':')) {
        settingsStr.split(',').forEach(function(part) {
          var sParts = part.split(':');
          if (sParts.length === 2) {
            settings[sParts[0].trim().toUpperCase()] = sParts[1].trim();
          }
        });
      } else {
        var oldSettings = settingsStr.split(',');
        settings['A'] = oldSettings[0];
        settings['B'] = oldSettings[1];
        settings['C'] = oldSettings[2];
        settings['D'] = oldSettings[3];
        settings['E'] = oldSettings[4];
        settings['F'] = oldSettings[5];
        settings['G'] = oldSettings[6];
        settings['H'] = oldSettings[7];
        settings['I'] = oldSettings[8];
      }
      
      questions.push({
        subLabel: subLabel,
        imageUrls: imageUrls,
        templateAlpha: settings['A'] ? parseFloat(settings['A']) : 0.35,
        requiredPercent: settings['B'] ? parseFloat(settings['B']) : 65,
        requiredPenSize: settings['C'] ? parseInt(settings['C']) : null,
        requiredRepetitions: settings['D'] ? parseInt(settings['D']) : 1,
        timeMinutes: settings['E'] ? parseFloat(settings['E']) : 0,
        drawType: settings['F'] ? settings['F'].toString().trim() : "normal",
        allowUndo: settings['G'] ? settings['G'].toString().trim().toUpperCase() !== "NO" : true,
        maxRestarts: settings['H'] ? (settings['H'].trim() === 'Infinity' ? 9999 : parseInt(settings['H'].trim())) : 9999,
        maxCancels: settings['I'] ? (settings['I'].trim() === 'Infinity' ? 9999 : parseInt(settings['I'].trim())) : 9999
      });
    }
    if (questions.length === 0) return null;
    return {
      label: lessonLabel,
      questions: questions
    };
  }).filter(function(l) { return l !== null; });
}

function getCompletedLabelsFromProgress(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetProgress = getSheetByNameFlexible(ss, "Progress");
  if (!sheetProgress) return [];
  var lastRow = sheetProgress.getLastRow();
  if (lastRow < 2) return [];
  var data = sheetProgress.getRange(2, 1, lastRow - 1, 38).getValues();
  var completed = [];
  data.forEach(function(row) {
    if (row[0].toString() == studentId.toString()) {
      var lessonLabel = row[3] ? row[3].toString().trim() : "";
      if (!lessonLabel) return;
      for (var i = 0; i < 10; i++) {
        var detailsCol = 4 + i * 3;
        var details = row[detailsCol] ? row[detailsCol].toString().trim() : "";
        if (details) {
          var subLabel = details.split('|')[0].trim();
          completed.push(lessonLabel + " - " + subLabel);
        }
      }
    }
  });
  return completed;
}

function saveProgress(studentId, studentName, label, details, repetitionsCompleted, finalPercentage, imageData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetProgress = getSheetByNameFlexible(ss, "Progress") || ss.insertSheet("Progress");
  ensureColumns(sheetProgress, 39);
  var mergedDetails = details + "|" + (repetitionsCompleted || "");
  var subLabel = details.split('|')[0].trim();
  
  var sheetQuestions = getSheetByNameFlexible(ss, "Questions-R");
  if (!sheetQuestions) return { error: "No Questions-R" };
  
  var dataQuestions = sheetQuestions.getDataRange().getValues();
  var questionIndex = -1;
  var totalQuestions = 0;
  var fullScore = 0;
  
  for (var r = 1; r < dataQuestions.length; r++) {
    if (dataQuestions[r][0] && dataQuestions[r][0].toString().trim() === label.trim()) {
      for (var q = 0; q < 10; q++) {
        var sub = dataQuestions[r][1 + q * 3] ? dataQuestions[r][1 + q * 3].toString().trim() : "";
        if (sub) totalQuestions++;
        if (sub === subLabel) questionIndex = q + 1;
      }
      fullScore = dataQuestions[r][32] ? parseFloat(dataQuestions[r][32]) : 0;
      break;
    }
  }
  
  if (questionIndex === -1) return { error: "Question not found" };
  var colStart = 5 + (questionIndex - 1) * 3;
  
  var imageUrl = "";
  if (imageData) {
    try {
      var blob = Utilities.newBlob(Utilities.base64Decode(imageData.split(',')[1]), 'image/png', studentName + "_" + label + "_" + Date.now() + ".png");
      var settings = getSettings();
      var folderId = settings['pdf_folder_student'] || '1Le2VcEWTh3MWmCYsQzSeAbDVbAmGBYXh';
      var folder = DriveApp.getFolderById(folderId);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      imageUrl = file.getUrl();
    } catch (err) {
      imageUrl = "Error uploading image to drive: " + err.toString();
    }
  }
  
  var lastRow = sheetProgress.getLastRow();
  var dataProgress = lastRow > 0 ? sheetProgress.getRange(1, 1, lastRow, 4).getValues() : [];
  var rowIndex = -1;
  
  for (var r = 1; r < dataProgress.length; r++) {
    if (dataProgress[r][0].toString() == studentId.toString() && dataProgress[r][3] === label) {
      rowIndex = r + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    sheetProgress.appendRow([studentId || "غير معروف", studentName || "غير معروف", new Date(), label]);
    rowIndex = sheetProgress.getLastRow();
  }
  
  sheetProgress.getRange(rowIndex, colStart).setValue(mergedDetails);
  sheetProgress.getRange(rowIndex, colStart + 1).setValue(finalPercentage);
  sheetProgress.getRange(rowIndex, colStart + 2).setValue(imageUrl);
  
  var rowData = sheetProgress.getRange(rowIndex, 1, 1, 38).getValues()[0];
  var answered = 0;
  var finalScore = 0;
  var scorePerQuestion = totalQuestions > 0 ? fullScore / totalQuestions : 0;
  
  for (var i = 0; i < 10; i++) {
    var detailsCol = 4 + i * 3;
    var detailsCell = rowData[detailsCol];
    var percentCell = rowData[detailsCol + 1];
    if (detailsCell && detailsCell.toString().trim() !== "") {
      answered++;
      var percStr = percentCell ? percentCell.toString().trim() : "0";
      var perc = parseFloat(percStr.replace('%', '')) || 0;
      if (perc < 1 && perc > 0) perc *= 100;
      finalScore += (perc / 100) * scorePerQuestion;
    }
  }
  
  var missing = totalQuestions - answered;
  sheetProgress.getRange(rowIndex, 36).setValue(answered + "/" + missing);
  sheetProgress.getRange(rowIndex, 37).setValue(fullScore);
  var finalPercent = fullScore > 0 ? (finalScore / fullScore) * 100 : 0;
  sheetProgress.getRange(rowIndex, 38).setValue(finalPercent.toFixed(1) + "%");
  
  return { success: true };
}

function getStudentResults(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, "Progress");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  var data = sheet.getRange(2, 1, lastRow - 1, 39).getValues();
  var results = [];
  
  data.forEach(function(row) {
    if (row[0].toString() == studentId.toString()) {
      var lessonLabel = row[3] ? row[3].toString().trim() : "";
      if (!lessonLabel) return;
      var answers = [];
      for (var i = 0; i < 10; i++) {
        var detailsCol = 4 + i * 3;
        var details = row[detailsCol] ? row[detailsCol].toString().trim() : "";
        if (details) {
          var percentage = row[detailsCol + 1] || "";
          var imageUrl = row[detailsCol + 2] || "";
          answers.push({ details: details, percentage: percentage, imageUrl: imageUrl });
        }
      }
      var finalPercent = row[37] || "0%";
      results.push({
        label: lessonLabel,
        answers: answers,
        finalPercent: finalPercent
      });
    }
  });
  
  var sheetQuestions = getSheetByNameFlexible(ss, "Questions-R");
  if (sheetQuestions) {
    var questionsData = sheetQuestions.getRange(2, 1, sheetQuestions.getLastRow() - 1, 35).getValues();
    results.forEach(function(result) {
      var matchingRow = questionsData.find(function(row) { return row[0] && row[0].toString().trim() === result.label.trim(); });
      if (matchingRow) {
        var ahValue = matchingRow[33] ? matchingRow[33].toString().trim().toLowerCase() : "";
        var maxResets = 9999;
        var aiValue = matchingRow[34];
        if (aiValue !== null && aiValue !== "" && !isNaN(parseInt(aiValue))) {
          maxResets = parseInt(aiValue);
        }
        
        var usedResets = 0;
        var progressRow = data.find(function(r) { return r[0].toString() == studentId.toString() && r[3] === result.label; });
        if (progressRow && progressRow[38] !== undefined && progressRow[38] !== "") {
          usedResets = parseInt(progressRow[38]) || 0;
        }
        
        var allowFromAH = ahValue !== "لا";
        var allowFromLimit = usedResets < maxResets;
        result.allowReset = (allowFromAH && allowFromLimit) ? "نعم" : "لا";
      } else {
        result.allowReset = "لا";
      }
    });
  }
  return results;
}

function resetLesson4(studentId, label) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, "Progress");
  if (!sheet) return { error: "No Progress sheet found" };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { error: "No data" };
  
  if (sheet.getLastColumn() < 39) {
    sheet.insertColumnsAfter(sheet.getLastColumn(), 39 - sheet.getLastColumn());
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 39).getValues();
  var rowsToUpdate = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].toString() == studentId.toString() && data[i][3] === label) {
      rowsToUpdate.push(i + 2);
    }
  }
  
  if (rowsToUpdate.length === 0) return { success: true };
  
  rowsToUpdate.forEach(function(row) {
    var resetCount = parseInt(sheet.getRange(row, 39).getValue()) || 0;
    sheet.getRange(row, 39).setValue(resetCount + 1);
    sheet.getRange(row, 5, 1, 34).clearContent();
    sheet.getRange(row, 3).setValue(new Date());
  });
  
  return { success: true };
}

function getLessonsFromMatches(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Matches');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  ensureColumns(sheet, 42);
  
  var schedule = getStudentSchedule(studentId);
  var effSchedule = getEffectiveScheduleForSheet(schedule, 'Matches');
  var globalExpired = false;
  if (effSchedule && effSchedule.expiryDate && effSchedule.expiryDate.trim() !== '') {
    var expParts = effSchedule.expiryDate.split('-');
    if (expParts.length === 3) {
      var expiryDateObj = new Date(parseInt(expParts[0]), parseInt(expParts[1]) - 1, parseInt(expParts[2]));
      expiryDateObj.setHours(0, 0, 0, 0);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (today >= expiryDateObj) {
        globalExpired = true;
      }
    }
  }
  if (globalExpired) {
    return [];
  }

  var unlockedCount = 99999;
  var daysToKeep = 99999;
  if (effSchedule && effSchedule.startDate !== '') {
    unlockedCount = getUnlockedCount(effSchedule.startDate, effSchedule.activeDays, effSchedule.lessonsPerWeek, new Date());
    if (effSchedule.daysToKeep && effSchedule.daysToKeep.toString().trim() !== '') {
      daysToKeep = parseInt(effSchedule.daysToKeep) || 99999;
    }
  }
  var activeLessonCount = 0;

  var data = sheet.getRange(1, 1, lastRow, 42).getValues();
  var lessons = [];
  var rows = data.slice(1);
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var lessonName = row[0];
    if (!lessonName || lessonName.trim() === '') continue;
    
    // Check Show Date, Hide Date and status
    var showDateVal = row[39] || '';
    var hideDateVal = row[40] || '';
    var currentStatusVal = row[41] || '';
    var rowNum = r + 2;
    var status = getOrUpdateStatus(sheet, rowNum, 42, showDateVal, hideDateVal, currentStatusVal);
    status = getStudentLessonStatus(schedule, 'Matches', lessonName, status);
    
    if (status !== 'ظهور') {
      continue; // Skip this lesson for the student!
    }
    
    var hasOverride = false;
    if (schedule && schedule.examOverrides) {
      try {
        var ov = JSON.parse(schedule.examOverrides);
        if (ov && ov['Matches'] && ov['Matches'][lessonName]) {
          hasOverride = true;
        }
      } catch (e) {}
    }
    var isExamLesson = (showDateVal.toString().trim() !== '' || hideDateVal.toString().trim() !== '' || hasOverride);
    
    if (effSchedule && effSchedule.startDate !== '') {
      if (!isExamLesson) {
        activeLessonCount++;
        if (activeLessonCount > unlockedCount) {
          continue; // Skip because it exceeds the unlocked limit!
        }
        
        if (daysToKeep !== 99999) {
          var lessonsPerDay = parseInt(effSchedule.lessonsPerWeek) || 3;
          var activeDayIndexForLesson = Math.ceil(activeLessonCount / lessonsPerDay);
          var unlockDate = getActiveStudyDayDate(effSchedule.startDate, effSchedule.activeDays, activeDayIndexForLesson);
          if (unlockDate) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var diffMs = today.getTime() - unlockDate.getTime();
            var diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
            if (diffDays >= daysToKeep) {
              continue; // Skip because the display duration of this lesson has expired!
            }
          }
        }
      }
    }
    
    var questions = [];
    var maxQuestions = 10;
    for (var q = 1; q <= maxQuestions; q++) {
      var startCol = 1 + (q - 1) * 3;
      var questionText = row[startCol];
      var questionTextStr = (questionText !== undefined && questionText !== null) ? questionText.toString().trim() : '';
      
      var leftString = row[startCol + 1] ? row[startCol + 1].toString() : '';
      var rightString = row[startCol + 2] ? row[startCol + 2].toString() : '';
      
      if (leftString.trim() === '' && rightString.trim() === '') {
        continue;
      }
      
      var leftItems = safeSplitMatches(leftString).map(function(val) {
        return getItemTypeAndValueGAS(val);
      }).filter(function(i) { return i.value !== ''; });
      
      var rightGroups = safeSplitMatches(rightString).map(function(group) {
        return group.split('|').map(function(val) {
          return getItemTypeAndValueGAS(val);
        }).filter(function(i) { return i.value !== ''; });
      }).filter(function(g) { return g.length > 0; });
      
      var rightItems = [];
      var rightValuesObj = {};
      for (var rg = 0; rg < rightGroups.length; rg++) {
        var group = rightGroups[rg];
        for (var gi = 0; gi < group.length; gi++) {
          var item = group[gi];
          if (!rightValuesObj[item.value]) {
            rightValuesObj[item.value] = true;
            rightItems.push(item);
          }
        }
      }
      var shuffledRight = rightItems.slice();
      
      var correctMatches = {};
      var rightIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'];
      for (var j = 0; j < leftItems.length; j++) {
        if (rightGroups[j]) {
          correctMatches[(j + 1).toString()] = [];
          for (var ri = 0; ri < rightGroups[j].length; ri++) {
            var originalRight = rightGroups[j][ri];
            var shuffledIndex = -1;
            for (var si = 0; si < shuffledRight.length; si++) {
              if (shuffledRight[si].value === originalRight.value) {
                shuffledIndex = si;
                break;
              }
            }
            if (shuffledIndex !== -1) {
              correctMatches[(j + 1).toString()].push(rightIds[shuffledIndex]);
            }
          }
        } else {
          correctMatches[(j + 1).toString()] = [];
        }
      }
      
      questions.push({
        questionText: questionTextStr,
        leftItems: leftItems,
        shuffledRight: shuffledRight,
        rightIds: rightIds.slice(0, shuffledRight.length),
        correctMatches: JSON.stringify(correctMatches)
      });
    }
    
    lessons.push({
      lessonName: lessonName,
      questions: questions,
      nextControl: row[31] ? row[31].toString().trim() : '',
      retryControl: row[32] ? row[32].toString().trim() : '',
      colorControl: row[33] ? row[33].toString().trim() : '',
      undoControl: row[34] ? row[34].toString().trim() : '',
      retryAllowed: row[35] ? row[35].toString().trim() : 'لا',
      maxRetries: row[36] ? parseInt(row[36]) : 0
    });
  }
  return lessons;
}

function getLessonStatus(studentId, lessonName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Answers');
  if (!sheet) return { isCompleted: false, retriesUsed: 0 };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowId = data[i][0] ? data[i][0].toString().trim() : '';
    var rowLesson = data[i][2] ? data[i][2].toString().trim() : '';
    if (rowId === studentId.trim() && rowLesson === lessonName.trim()) {
      var completion = data[i][14] ? data[i][14].toString().trim() : '';
      var retriesUsed = data[i][15] ? parseInt(data[i][15]) : 0;
      return { isCompleted: completion === 'تم', retriesUsed: retriesUsed };
    }
  }
  return { isCompleted: false, retriesUsed: 0 };
}

function saveAnswers(studentId, studentName, lessonName, results, numQuestions) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Answers');
  if (!sheet) return { success: false };
  ensureColumns(sheet, 20);
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    var rowId = data[i][0] ? data[i][0].toString().trim() : '';
    var rowLesson = data[i][2] ? data[i][2].toString().trim() : '';
    if (rowId === studentId.trim() && rowLesson === lessonName.trim()) {
      foundRow = i + 1;
      break;
    }
  }
  
  var consolidatedAnswers = [];
  var currentRowData = null;

  if (foundRow > 0) {
    currentRowData = sheet.getRange(foundRow, 1, 1, 16).getValues()[0];
    for (var j = 0; j < 10; j++) {
      var resultVal = '';
      if (results && results[j] !== undefined && results[j] !== null) {
        resultVal = results[j].toString().trim();
      }
      if (resultVal !== '') {
        currentRowData[3 + j] = resultVal;
      }
      consolidatedAnswers.push(currentRowData[3 + j] || '');
    }
  } else {
    for (var j = 0; j < 10; j++) {
      var resultVal = '';
      if (results && results[j] !== undefined && results[j] !== null) {
        resultVal = results[j].toString().trim();
      }
      consolidatedAnswers.push(resultVal);
    }
  }
  
  // Calculate totalCorrect and totalWrong from consolidatedAnswers array
  var totalCorrect = 0;
  var totalWrong = 0;
  for (var i = 0; i < consolidatedAnswers.length; i++) {
    var score = parseScore(consolidatedAnswers[i]);
    totalCorrect += score.correct;
    totalWrong += score.wrong;
  }

  // Fetch AL (totalExpectedCorrect) and AM (maxGrade) from Matches sheet
  var matchesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Matches');
  var totalExpectedCorrect = 0;
  var maxGrade = 10;
  if (matchesSheet) {
    var matchesData = matchesSheet.getDataRange().getValues();
    for (var m = 1; m < matchesData.length; m++) {
      var rowName = matchesData[m][0] ? matchesData[m][0].toString().trim() : '';
      if (rowName === lessonName.trim()) {
        // AL is Column 38 (0-indexed: 37)
        var alVal = matchesData[m][37];
        if (alVal !== undefined && alVal !== '') {
          totalExpectedCorrect = parseInt(alVal) || 0;
        }
        // AM is Column 39 (0-indexed: 38)
        var amVal = matchesData[m][38];
        if (amVal !== undefined && amVal !== '') {
          maxGrade = parseFloat(amVal) || 0;
        }
        break;
      }
    }
  }

  var percentage = totalExpectedCorrect > 0 ? (totalCorrect / totalExpectedCorrect) * 100 : 0;

  if (foundRow > 0 && currentRowData) {
    currentRowData[13] = new Date();
    sheet.getRange(foundRow, 1, 1, 16).setValues([currentRowData]);
    
    // Write Q (17), R (18), S (19), T (20)
    sheet.getRange(foundRow, 17).setValue(totalCorrect + " صحيحة و " + totalWrong + " خطأ");
    sheet.getRange(foundRow, 18).setValue(totalExpectedCorrect);
    sheet.getRange(foundRow, 19).setValue(maxGrade);
    sheet.getRange(foundRow, 20).setValue(percentage.toFixed(1) + "%");
    
    var allCompleted = true;
    for (var k = 0; k < numQuestions; k++) {
      if (currentRowData[3 + k] === '') {
        allCompleted = false;
        break;
      }
    }
    if (allCompleted) {
      sheet.getRange(foundRow, 15).setValue('تم');
      حساب_الصحيح_والخطأ_وجلب_الدروس_والنسبة();
    } else {
      sheet.getRange(foundRow, 15).clearContent();
    }
  } else {
    var rowData = [studentId, studentName, lessonName];
    for (var j = 0; j < 10; j++) rowData.push(consolidatedAnswers[j] || '');
    rowData.push(new Date());
    rowData.push(''); // O (Completed tag)
    rowData.push(0);  // P (Retries)
    rowData.push(totalCorrect + " صحيحة و " + totalWrong + " خطأ"); // Q (17)
    rowData.push(totalExpectedCorrect); // R (18)
    rowData.push(maxGrade); // S (19)
    rowData.push(percentage.toFixed(1) + "%"); // T (20)
    
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function incrementRetry(studentId, lessonName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Answers');
  if (!sheet) return { success: false };
  ensureColumns(sheet, 20);
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim() === studentId.trim() && data[i][2].toString().trim() === lessonName.trim()) {
      foundRow = i + 1;
      break;
    }
  }
  if (foundRow > 0) {
    sheet.getRange(foundRow, 4, 1, 10).clearContent();
    sheet.getRange(foundRow, 14).setValue(new Date());
    sheet.getRange(foundRow, 15).clearContent();
    var retriesUsed = sheet.getRange(foundRow, 16).getValue() || 0;
    sheet.getRange(foundRow, 16).setValue(retriesUsed + 1);
    
    // Clear Q, R, S, T when retrying
    sheet.getRange(foundRow, 17, 1, 4).clearContent();
  }
  return { success: true };
}

// ====================== REPORT DATA RETRIEVING FUNCTIONS ======================

function getStudentData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var questionsSheet = ss.getSheetByName('Questions');
  if (!questionsSheet) return { success: false, message: 'ورقة Questions غير موجودة' };
  
  var schedule = getStudentSchedule(studentId);
  var effSchedule = getEffectiveScheduleForSheet(schedule, 'Questions');
  
  var unlockedCount = 99999;
  var daysToKeep = 99999;
  if (effSchedule && effSchedule.startDate !== '') {
    unlockedCount = getUnlockedCount(effSchedule.startDate, effSchedule.activeDays, effSchedule.lessonsPerWeek, new Date());
    if (effSchedule.daysToKeep && effSchedule.daysToKeep.toString().trim() !== '') {
      daysToKeep = parseInt(effSchedule.daysToKeep) || 99999;
    }
  }
  
  // Get all topics
  var lastRow = questionsSheet.getLastRow();
  if (lastRow < 2) return { success: true, todayLessons: [], pendingLessons: [], completedLessons: [] };
  
  var topicsRange = questionsSheet.getRange(2, 1, lastRow - 1, 91).getValues();
  var unlockedLessons = [];
  var activeLessonCount = 0;
  
  for (var i = 0; i < topicsRange.length; i++) {
    var rowData = topicsRange[i];
    var topicName = rowData[0] ? rowData[0].toString().trim() : '';
    if (topicName !== '') {
      var row = i + 2;
      var showDateVal = rowData[88] || '';
      var hideDateVal = rowData[89] || '';
      var currentStatusVal = rowData[90] || '';
      
      var status = getOrUpdateStatus(questionsSheet, row, 91, showDateVal, hideDateVal, currentStatusVal);
      status = getStudentLessonStatus(schedule, 'Questions', topicName, status);
      
      if (status !== 'ظهور') {
        continue;
      }
      
      var hasOverride = false;
      if (schedule && schedule.examOverrides) {
        try {
          var ov = JSON.parse(schedule.examOverrides);
          if (ov && ov['Questions'] && ov['Questions'][topicName]) {
            hasOverride = true;
          }
        } catch (e) {}
      }
      var isExamLesson = (showDateVal.toString().trim() !== '' || hideDateVal.toString().trim() !== '' || hasOverride);
      
      if (effSchedule && effSchedule.startDate !== '') {
        if (!isExamLesson) {
          activeLessonCount++;
          if (activeLessonCount > unlockedCount) {
            continue;
          }
          if (daysToKeep !== 99999) {
            var lessonsPerDay = parseInt(effSchedule.lessonsPerWeek) || 3;
            var activeDayIndexForLesson = Math.ceil(activeLessonCount / lessonsPerDay);
            var unlockDate = getActiveStudyDayDate(effSchedule.startDate, effSchedule.activeDays, activeDayIndexForLesson);
            if (unlockDate) {
              var today = new Date();
              today.setHours(0, 0, 0, 0);
              var diffMs = today.getTime() - unlockDate.getTime();
              var diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
              if (diffDays >= daysToKeep) {
                continue;
              }
            }
          }
        }
      }
      unlockedLessons.push(topicName);
    }
  }
  
  // Now we have the list of unlocked lesson names. Let's get status maps!
  // Answers-Questions (Words)
  var wordsMap = {};
  var aqSheet = ss.getSheetByName('Answers-Questions');
  if (aqSheet) {
    var aqData = aqSheet.getDataRange().getValues();
    for (var r = 1; r < aqData.length; r++) {
      var rId = aqData[r][0] ? aqData[r][0].toString().trim() : '';
      if (rId === studentId.toString().trim()) {
        var topic = aqData[r][2] ? aqData[r][2].toString().trim() : '';
        if (topic) {
          var pct = formatPercentage(aqData[r][30]);
          var isDone = (pct === '100%');
          wordsMap[topic] = { summary: aqData[r][27] ? aqData[r][27].toString().trim() : 'لم يبدأ', pct: pct, isDone: isDone };
        }
      }
    }
  }
  
  // Answers (Wasl)
  var waslMap = {};
  var aSheet = ss.getSheetByName('Answers');
  if (aSheet) {
    var aData = aSheet.getDataRange().getValues();
    for (var r = 1; r < aData.length; r++) {
      var rId = aData[r][0] ? aData[r][0].toString().trim() : '';
      if (rId === studentId.toString().trim()) {
        var topic = aData[r][2] ? aData[r][2].toString().trim() : '';
        if (topic) {
          var pct = formatPercentage(aData[r][19]);
          var isDone = (pct === '100%' || aData[r][14].toString().trim() === 'تم');
          waslMap[topic] = { summary: aData[r][16] ? aData[r][16].toString().trim() : 'لم يبدأ', pct: pct, isDone: isDone };
        }
      }
    }
  }
  
  // Progress (Writing)
  var progMap = {};
  var pSheet = ss.getSheetByName('Progress');
  if (pSheet) {
    var pData = pSheet.getDataRange().getValues();
    for (var r = 1; r < pData.length; r++) {
      var rId = pData[r][0] ? pData[r][0].toString().trim() : '';
      if (rId === studentId.toString().trim()) {
        var topic = pData[r][3] ? pData[r][3].toString().trim() : '';
        if (topic) {
          var pct = formatPercentage(pData[r][37]);
          var isDone = (pct === '100%');
          progMap[topic] = { summary: pData[r][35] ? pData[r][35].toString().trim() : 'لم يبدأ', pct: pct, isDone: isDone };
        }
      }
    }
  }
  
  // correction (Homework)
  var hwMap = {};
  var corrSheet = ss.getSheetByName('correction');
  if (corrSheet) {
    var corrData = corrSheet.getDataRange().getValues();
    for (var r = 1; r < corrData.length; r++) {
      var rId = corrData[r][0] ? corrData[r][0].toString().trim() : '';
      if (rId === studentId.toString().trim()) {
        var topic = corrData[r][2] ? corrData[r][2].toString().trim() : '';
        if (topic) {
          var correctedText = corrData[r][21] ? corrData[r][21].toString().trim() : '';
          var isDone = (correctedText !== '');
          hwMap[topic] = { status: isDone ? 'تم التصحيح والتقييم' : 'بانتظار التصحيح', isDone: isDone };
        }
      }
    }
  }
  
  // Now categorize lessons
  var todayLessons = [];
  var pendingLessons = [];
  var completedLessons = [];
  
  // Let's decide which is today's lesson:
  // Since they are listed chronologically, the last one in unlockedLessons is today's lesson.
  var todayCount = 1; // normally 1 lesson is today's lesson
  if (effSchedule && effSchedule.lessonsPerWeek) {
    var parsedLPD = parseInt(effSchedule.lessonsPerWeek);
    if (!isNaN(parsedLPD) && parsedLPD > 1) {
      todayCount = parsedLPD;
    }
  }
  // Clamp todayCount to unlocked count
  if (todayCount > unlockedLessons.length) todayCount = unlockedLessons.length;
  
  for (var k = 0; k < unlockedLessons.length; k++) {
    var topic = unlockedLessons[k];
    
    var wInfo = wordsMap[topic] || { summary: 'لم يبدأ', pct: '0%', isDone: false };
    var waInfo = waslMap[topic] || { summary: 'لم يبدأ', pct: '0%', isDone: false };
    var prInfo = progMap[topic] || { summary: 'لم يبدأ', pct: '0%', isDone: false };
    var hInfo = hwMap[topic] || { status: 'لم يرسل بعد', isDone: false };
    
    var isLessonDone = wInfo.isDone && waInfo.isDone && prInfo.isDone && hInfo.isDone;
    
    var lessonObj = {
      topic: topic,
      words: wInfo,
      wasl: waInfo,
      writing: prInfo,
      homework: hInfo,
      isCompleted: isLessonDone
    };
    
    // Check if this belongs to today's lessons (the last ones in unlocked array)
    if (k >= unlockedLessons.length - todayCount) {
      todayLessons.push(lessonObj);
    } else {
      if (isLessonDone) {
        completedLessons.push(lessonObj);
      } else {
        pendingLessons.push(lessonObj);
      }
    }
  }
  
  return {
    success: true,
    todayLessons: todayLessons,
    pendingLessons: pendingLessons,
    completedLessons: completedLessons
  };
}

function getStudentVideoData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var correctionSheet = ss.getSheetByName('correction');
  if (!correctionSheet) return { success: false, message: 'ورقة correction غير موجودة' };
  
  var data = correctionSheet.getDataRange().getDisplayValues();
  if (data.length < 1) return { success: false, message: 'الورقة فارغة' };
  
  var headers = [
    'موضوع الدرس',
    'صورة الواجب',
    'تسجيل صوت',
    'تصحيح',
    'درجات الصورة',
    'درجات الصوت',
    'اضافة صورة',
    'اضافة فيديو',
    'اضافة صوت',
    'تاريخ التصحيح'
  ];
  
  // Columns map to indexes in correction:
  // C (2), E (4), G (6), V (21), U (20), W (22), X (23), Y (24), Z (25), AA (26)
  var cols = [2, 4, 6, 21, 20, 22, 23, 24, 25, 26];
  
  var studentData = [];
  var studentName = 'غير معروف';
  
  for (var row = 1; row < data.length; row++) {
    if (data[row][0] && data[row][0].toString().trim() === studentId.toString().trim()) {
      if (data[row][1]) {
        studentName = data[row][1].toString().trim();
      }
      var rowData = cols.map(function(c) {
        var val = data[row][c];
        return val !== undefined && val !== null ? val.toString().trim() : '';
      });
      studentData.push(rowData);
    }
  }
  
  if (studentData.length === 0) {
    return { success: false, message: 'لا توجد دروس مرسلة مسجلة لهذا الطالب في ورقة التصحيح' };
  }
  
  return { success: true, studentId: studentId, studentName: studentName, headers: headers, data: studentData };
}

function getCorrectionData(studentId) { return getCorrectionColumnGroup(studentId, [2, 8, 9, 10, 11]); }

function formatPercentage(val) {
  if (val === undefined || val === null || val === '') return '0%';
  var str = val.toString().trim();
  if (str.indexOf('%') !== -1) return str;
  var num = parseFloat(str);
  if (isNaN(num)) return '0%';
  if (num <= 1.0) {
    return Math.round(num * 100) + '%';
  } else {
    return Math.round(num) + '%';
  }
}

function getWordsExerciseData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Answers-Questions');
  if (!sheet) return { success: false, message: 'ورقة Answers-Questions غير موجودة' };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: true, headers: ['موضوع الدرس', 'النتيجة والتفاصيل', 'النسبة المئوية', 'آخر تحديث'], data: [] };
  
  var maxCols = Math.max(31, sheet.getLastColumn());
  var data = sheet.getRange(2, 1, lastRow - 1, maxCols).getValues();
  var studentData = [];
  
  data.forEach(function(row) {
    var rowId = row[0] ? row[0].toString().trim() : '';
    if (rowId === studentId.toString().trim()) {
      var topic = row[2] ? row[2].toString().trim() : '';
      var summary = row[27] ? row[27].toString().trim() : 'لم يبدأ';
      var pct = formatPercentage(row[30]);
      var lastUpdated = '';
      if (row[23] instanceof Date) {
        var d = row[23];
        lastUpdated = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
      } else {
        lastUpdated = row[23] ? row[23].toString() : '';
      }
      studentData.push([topic, summary, pct, lastUpdated]);
    }
  });
  
  return {
    success: true,
    headers: ['موضوع الدرس', 'النتيجة والتفاصيل', 'النسبة المئوية', 'آخر تحديث'],
    data: studentData
  };
}

function getWaslExerciseData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Answers');
  if (!sheet) return { success: false, message: 'ورقة Answers غير موجودة' };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: true, headers: ['موضوع الدرس', 'النتيجة والتفاصيل', 'النسبة المئوية', 'عدد المحاولات', 'آخر تحديث'], data: [] };
  
  var maxCols = Math.max(20, sheet.getLastColumn());
  var data = sheet.getRange(2, 1, lastRow - 1, maxCols).getValues();
  var studentData = [];
  
  data.forEach(function(row) {
    var rowId = row[0] ? row[0].toString().trim() : '';
    if (rowId === studentId.toString().trim()) {
      var topic = row[2] ? row[2].toString().trim() : '';
      var summary = row[16] ? row[16].toString().trim() : 'لم يبدأ';
      var pct = formatPercentage(row[19]);
      var retries = row[15] !== undefined ? row[15].toString().trim() : '0';
      var lastUpdated = '';
      if (row[13] instanceof Date) {
        var d = row[13];
        lastUpdated = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
      } else {
        lastUpdated = row[13] ? row[13].toString() : '';
      }
      studentData.push([topic, summary, pct, retries, lastUpdated]);
    }
  });
  
  return {
    success: true,
    headers: ['موضوع الدرس', 'النتيجة والتفاصيل', 'النسبة المئوية', 'عدد المحاولات', 'آخر تحديث'],
    data: studentData
  };
}

function getWritingExerciseData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Progress');
  if (!sheet) return { success: false, message: 'ورقة Progress غير موجودة' };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: true, headers: ['موضوع الدرس', 'عدد الجمل المكتملة', 'النسبة المئوية', 'آخر تحديث'], data: [] };
  
  var maxCols = Math.max(38, sheet.getLastColumn());
  var data = sheet.getRange(2, 1, lastRow - 1, maxCols).getValues();
  var studentData = [];
  
  data.forEach(function(row) {
    var rowId = row[0] ? row[0].toString().trim() : '';
    if (rowId === studentId.toString().trim()) {
      var topic = row[3] ? row[3].toString().trim() : '';
      var summary = row[35] ? row[35].toString().trim() : '0/0';
      var pct = formatPercentage(row[37]);
      var lastUpdated = '';
      if (row[2] instanceof Date) {
        var d = row[2];
        lastUpdated = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
      } else {
        lastUpdated = row[2] ? row[2].toString() : '';
      }
      studentData.push([topic, summary, pct, lastUpdated]);
    }
  });
  
  return {
    success: true,
    headers: ['موضوع الدرس', 'عدد الجمل المكتملة', 'النسبة المئوية', 'آخر تحديث'],
    data: studentData
  };
}

function getCorrectionColumnGroup(studentId, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var correctionSheet = ss.getSheetByName('correction');
  if (!correctionSheet) return { success: false, message: 'ورقة correction غير موجودة' };
  
  var data = correctionSheet.getDataRange().getDisplayValues();
  if (data.length < 1) return { success: false, message: 'الورقة فارغة' };
  
  var headers = cols.map(function(c, i) {
    if (i === 0) return 'موضوع الدرس';
    return data[0][c] || '';
  });
  
  var studentData = [];
  for (var row = 1; row < data.length; row++) {
    if (data[row][0] && data[row][0].toString().trim() === studentId.toString().trim()) {
      var rowData = cols.map(function(c) { return data[row][c] || ''; });
      studentData.push(rowData);
    }
  }
  if (studentData.length === 0) return { success: false, message: 'لا توجد بيانات لهذا الطالب' };
  return { success: true, studentId: studentId, headers: headers, data: studentData };
}

function getEncouragement(percentageStr) {
  percentageStr = String(percentageStr || '').trim();
  if (!percentageStr) return '';
  var percentage = parseFloat(percentageStr.replace('%', ''));
  if (isNaN(percentage)) return '';
  
  if (percentage >= 100) return 'ممتاز! تركيز كامل 👏 ⭐⭐⭐⭐⭐';
  if (percentage >= 80) return 'جيد جداً! استمر في التركيز 👍 ⭐⭐⭐⭐';
  if (percentage >= 50) return 'جيد، لكن يمكن تحسين التركيز 😊 ⭐⭐⭐';
  if (percentage >= 20) return 'حاول التركيز أكثر في المرة القادمة 💪 ⭐⭐';
  return 'لا بأس، ابدأ من جديد وتركز جيداً 🌟 ⭐';
}

function getPdfControlForStudent(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pdfUrl = '';
  var control = '';

  var pdfSheet = ss.getSheetByName('PDF');
  if (pdfSheet) {
    var pdfData = pdfSheet.getDataRange().getValues();
    for (var i = 1; i < pdfData.length; i++) {
      if (pdfData[i][1] && pdfData[i][1].toString().trim() === studentId.toString().trim()) {
        control = pdfData[i][2] ? pdfData[i][2].toString().trim() : '';
        pdfUrl = pdfData[i][4] ? pdfData[i][4].toString().trim() : '';
        break;
      }
    }
  }

  return { 
    success: true, 
    control: control,
    pdfUrl: pdfUrl
  };
}

function getHoomDataForStudent(username) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoomSheet = ss.getSheetByName('HOOM');
  if (!hoomSheet) return [];
  var hoomData = hoomSheet.getDataRange().getValues();
  
  var startCol = -1;
  for (var col = 0; col < hoomData[0].length; col += 5) {
    if (hoomData[0][col] && hoomData[0][col].toString().trim() === username) {
      startCol = col;
      break;
    }
  }
  if (startCol === -1) return [];
  
  var studentData = [];
  for (var row = 5; row < hoomData.length; row++) {
    var rowData = [];
    var isEmpty = true;
    for (var c = 0; c < 5; c++) {
      var cellValue = hoomData[row][startCol + c] ? hoomData[row][startCol + c].toString().trim() : '';
      rowData.push(cellValue);
      if (cellValue !== '') isEmpty = false;
    }
    if (!isEmpty) studentData.push(rowData);
  }
  return studentData;
}

function getSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) return {};
  var settingsData = settingsSheet.getRange("U1:V" + settingsSheet.getLastRow()).getValues();
  var settings = {};
  for (var i = 1; i < settingsData.length; i++) {
    var key = settingsData[i][0] ? settingsData[i][0].toString().trim() : '';
    var value = settingsData[i][1] ? settingsData[i][1].toString().trim() : '';
    if (key && value) settings[key] = value;
  }
  return settings;
}

function generateStudentPDF(studentId, source) {
  // Generates complete PDF reports using templates in Google Drive
  var settings = getSettings();
  var TEMPLATE_DOC_ID = settings['template_doc_student'] || '1zQX1UBOPXn1w6CC0qAIFMS5aAk9JZJ199T1g_Kfs12w';
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aData = getStudentData(studentId);
  var vData = getStudentVideoData(studentId);
  
  if (!aData.success && !vData.success) {
    return { success: false, message: 'لا توجد بيانات لإنشاء التقرير للطالب' };
  }
  
  var studentName = aData.success ? aData.studentName : vData.studentName;
  var templateFile = DriveApp.getFileById(TEMPLATE_DOC_ID);
  var tempFile = templateFile.makeCopy('تقرير مؤقت - ' + studentId + ' - ' + studentName);
  var tempDocId = tempFile.getId();
  var doc = DocumentApp.openById(tempDocId);
  var body = doc.getBody();
  
  body.replaceText('{{studentName}}', studentName);
  body.replaceText('{{studentId}}', studentId);
  body.replaceText('{{creationDate}}', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd'));
  
  doc.saveAndClose();
  
  var pdfName = 'تقرير_الطالب_' + studentName.replace(/\\s+/g, '_') + '_' + studentId + '.pdf';
  var pdfBlob = DriveApp.getFileById(tempDocId).getBlob().getAs('application/pdf').setName(pdfName);
  
  var PDF_FOLDER_ID = settings['pdf_folder_student'] || '1EVR179MPDGGC2-2tdjtfhiX-7doE7cXH';
  var folder = DriveApp.getFolderById(PDF_FOLDER_ID);
  var pdfFile = folder.createFile(pdfBlob);
  var pdfUrl = pdfFile.getUrl();
  
  var pdfSheet = ss.getSheetByName('PDF') || ss.insertSheet('PDF');
  var pdfData = pdfSheet.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < pdfData.length; i++) {
    if (pdfData[i][1] && pdfData[i][1].toString() === studentId.toString()) {
      foundRow = i + 1;
      break;
    }
  }
  
  var creationDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss');
  if (foundRow !== -1) {
    pdfSheet.getRange(foundRow, 5).setValue(pdfUrl);
    pdfSheet.getRange(foundRow, 6).setValue(creationDate);
  } else {
    var newRow = [studentName, studentId, '', '', pdfUrl, creationDate];
    pdfSheet.appendRow(newRow);
  }
  
  DriveApp.getFileById(tempDocId).setTrashed(true);
  return { success: true, pdfUrl: pdfUrl };
}

function normalizeDriveUrl(url) {
  if (!url) return "";
  url = url.trim();
  var id = "";
  if (url.includes('/file/d/')) {
    id = url.split('/file/d/')[1].split('/')[0].split('?')[0];
  } else if (url.includes('open?id=')) {
    id = url.split('open?id=')[1].split('&')[0];
  } else if (url.includes('drive.google.com/uc?id=')) {
    return url;
  }
  if (id) {
    return "https://drive.google.com/uc?id=" + id + "&export=view";
  }
  return url;
}

function حساب_الصحيح_والخطأ_وجلب_الدروس_والنسبة() {
  Logger.log("Scores updated automatically.");
}

// ====================== NEW ADMIN CONTROLLER FUNCTIONS ======================

function loginAdmin(username, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var adminsSheet = getSheetByNameFlexible(ss, 'Admins');
  if (!adminsSheet) {
    adminsSheet = ss.insertSheet('Admins');
    adminsSheet.appendRow(['Username', 'Password', 'Role', 'Created Date']);
    adminsSheet.appendRow(['admin', 'admin123', 'مدير', new Date()]);
    SpreadsheetApp.flush();
  }
  var data = adminsSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowUser = data[i][0] ? data[i][0].toString().trim() : '';
    var rowPass = data[i][1] ? data[i][1].toString().trim() : '';
    var rowRole = data[i][2] ? data[i][2].toString().trim() : '';
    if (rowUser.toLowerCase() === username.trim().toLowerCase() && rowPass === password.trim()) {
      return { success: true, username: rowUser, role: rowRole };
    }
  }
  return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة للإدارة' };
}

function getLessonsForAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var qSheet = getSheetByNameFlexible(ss, 'Questions');
  var mSheet = getSheetByNameFlexible(ss, 'Matches');
  var qrSheet = getSheetByNameFlexible(ss, 'Questions-R');
  
  var qLessons = [];
  if (qSheet) {
    var qData = qSheet.getDataRange().getValues();
    for (var i = 1; i < qData.length; i++) {
      if (qData[i][0] && qData[i][0].toString().trim() !== '') {
        qLessons.push({ name: qData[i][0].toString().trim(), row: i + 1 });
      }
    }
  }
  
  var mLessons = [];
  if (mSheet) {
    var mData = mSheet.getDataRange().getValues();
    for (var i = 1; i < mData.length; i++) {
      if (mData[i][0] && mData[i][0].toString().trim() !== '') {
        mLessons.push({ name: mData[i][0].toString().trim(), row: i + 1 });
      }
    }
  }
  
  var qrLessons = [];
  if (qrSheet) {
    var qrData = qrSheet.getDataRange().getValues();
    for (var i = 1; i < qrData.length; i++) {
      if (qrData[i][0] && qrData[i][0].toString().trim() !== '') {
        qrLessons.push({ name: qrData[i][0].toString().trim(), row: i + 1 });
      }
    }
  }
  
  return {
    success: true,
    questionsLessons: qLessons,
    matchesLessons: mLessons,
    drawingLessons: qrLessons
  };
}

function getLessonDetails(type, lessonName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (type === 'words') {
    var sheet = getSheetByNameFlexible(ss, 'Questions');
    if (!sheet) return { success: false, message: 'ورقة Questions غير موجودة' };
    ensureColumns(sheet, 91);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === lessonName.trim()) {
        var rowData = data[i];
        var questions = [];
        for (var q = 1; q <= 20; q++) {
          var startIndex = 1 + (q - 1) * 4;
          var questionText = rowData[startIndex] || '';
          if (questionText.toString().trim() === '') break;
          
          var media = rowData[startIndex + 1] || '';
          var lettersRaw = rowData[startIndex + 2] || '';
          var correctRaw = rowData[startIndex + 3] || '';
          
          questions.push({
            question: questionText,
            media: media,
            letters: lettersRaw.toString().split(/\\s+/).filter(function(l) { return l.trim() !== ''; }),
            correct: correctRaw.toString().split(',').map(function(c) { return c.trim(); }).filter(function(c) { return c !== ''; })
          });
        }
        
        return {
          success: true,
          lessonData: {
            lessonName: lessonName,
            showCorrectAnswer: rowData[81] ? rowData[81].toString().trim() : 'نعم',
            condition: rowData[82] ? rowData[82].toString().trim() : 'لا',
            retryCondition: rowData[83] ? rowData[83].toString().trim() : 'نعم',
            resetCondition: rowData[84] ? rowData[84].toString().trim() : 'نعم',
            maxResets: rowData[85] !== undefined ? rowData[85] : 9999,
            totalQuestionsToAnswer: rowData[86] !== undefined ? rowData[86] : questions.length,
            fullScore: rowData[87] !== undefined ? rowData[87] : 10,
            showDate: rowData[88] ? rowData[88].toString().trim() : '',
            hideDate: rowData[89] ? rowData[89].toString().trim() : '',
            status: rowData[90] ? rowData[90].toString().trim() : '',
            questions: questions
          }
        };
      }
    }
  } else if (type === 'matching') {
    var sheet = getSheetByNameFlexible(ss, 'Matches');
    if (!sheet) return { success: false, message: 'ورقة Matches غير موجودة' };
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { success: false, message: 'لا توجد بيانات' };
    ensureColumns(sheet, 42);
    var data = sheet.getRange(1, 1, lastRow, 42).getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === lessonName.trim()) {
        var rowData = data[i];
        var questions = [];
        for (var q = 1; q <= 10; q++) {
          var startCol = 1 + (q - 1) * 3;
          var questionText = rowData[startCol] || '';
          
          var leftString = rowData[startCol + 1] ? rowData[startCol + 1].toString() : '';
          var rightString = rowData[startCol + 2] ? rowData[startCol + 2].toString() : '';
          
          if (leftString.trim() === '' && rightString.trim() === '') {
            continue;
          }
          
          questions.push({
            questionText: questionText.toString().trim(),
            leftString: leftString,
            rightString: rightString
          });
        }
        
        return {
          success: true,
          lessonData: {
            lessonName: lessonName,
            nextControl: rowData[31] ? rowData[31].toString().trim() : 'تلقائي',
            retryControl: rowData[32] ? rowData[32].toString().trim() : 'مباشر',
            colorControl: rowData[33] ? rowData[33].toString().trim() : '#3b82f6',
            undoControl: rowData[34] ? rowData[34].toString().trim() : 'نعم',
            retryAllowed: rowData[35] ? rowData[35].toString().trim() : 'لا',
            maxRetries: rowData[36] !== undefined ? rowData[36] : 0,
            totalExpectedCorrect: rowData[37] !== undefined ? rowData[37] : 0,
            maxGrade: rowData[38] !== undefined ? rowData[38] : 10,
            showDate: rowData[39] ? rowData[39].toString().trim() : '',
            hideDate: rowData[40] ? rowData[40].toString().trim() : '',
            status: rowData[41] ? rowData[41].toString().trim() : '',
            questions: questions
          }
        };
      }
    }
  } else if (type === 'drawing') {
    var sheet = getSheetByNameFlexible(ss, 'Questions-R');
    if (!sheet) return { success: false, message: 'ورقة Questions-R غير موجودة' };
    ensureColumns(sheet, 38);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === lessonName.trim()) {
        var rowData = data[i];
        var questions = [];
        for (var q = 0; q < 10; q++) {
          var textCol = 1 + q * 3;
          var subLabel = rowData[textCol] ? rowData[textCol].toString().trim() : "";
          if (!subLabel) break;
          
          var imageUrls = rowData[textCol + 1] ? rowData[textCol + 1].toString().split(/[;؛,]/).map(function(u) { return u.trim(); }) : [];
          var settingsStr = rowData[textCol + 2] ? rowData[textCol + 2].toString().trim() : "";
          
          var settings = {};
          if (settingsStr.includes(':')) {
            settingsStr.split(',').forEach(function(part) {
              var sParts = part.split(':');
              if (sParts.length === 2) {
                settings[sParts[0].trim().toUpperCase()] = sParts[1].trim();
              }
            });
          } else {
            var oldSettings = settingsStr.split(',');
            settings['A'] = oldSettings[0];
            settings['B'] = oldSettings[1];
            settings['C'] = oldSettings[2];
            settings['D'] = oldSettings[3];
            settings['E'] = oldSettings[4];
            settings['F'] = oldSettings[5];
            settings['G'] = oldSettings[6];
            settings['H'] = oldSettings[7];
            settings['I'] = oldSettings[8];
          }
          
          questions.push({
            subLabel: subLabel,
            imageUrls: imageUrls,
            opacity: settings['A'] ? parseFloat(settings['A']) : 0.35,
            requiredPercent: settings['B'] ? parseFloat(settings['B']) : 65,
            penSize: settings['C'] ? parseInt(settings['C']) : null,
            repetitions: settings['D'] ? parseInt(settings['D']) : 1,
            timeLimit: settings['E'] ? parseFloat(settings['E']) : 0,
            drawType: settings['F'] ? settings['F'].toString().trim() : "normal",
            allowUndo: settings['G'] ? settings['G'].toString().trim().toUpperCase() !== "NO" : true,
            maxRestarts: settings['H'] ? settings['H'].toString().trim() : "Infinity",
            maxCancels: settings['I'] ? settings['I'].toString().trim() : "Infinity"
          });
        }
        
        return {
          success: true,
          lessonData: {
            lessonName: lessonName,
            fullScore: rowData[32] ? parseFloat(rowData[32]) : 10,
            resetAllowed: rowData[33] ? rowData[33].toString().trim() : 'نعم',
            maxResets: rowData[34] !== undefined ? rowData[34] : 9999,
            showDate: rowData[35] ? rowData[35].toString().trim() : '',
            hideDate: rowData[36] ? rowData[36].toString().trim() : '',
            status: rowData[37] ? rowData[37].toString().trim() : '',
            questions: questions
          }
        };
      }
    }
  }
  return { success: false, message: 'الدرس غير موجود' };
}

function addOrUpdateLessonWords(lessonData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Questions');
  if (!sheet) {
    sheet = ss.insertSheet('Questions');
  }
  if (sheet.getLastRow() === 0) {
    var headers = ['Lesson Name'];
    for (var q = 1; q <= 20; q++) {
      headers.push('Q' + q + ' Question', 'Q' + q + ' Media', 'Q' + q + ' Letters', 'Q' + q + ' Correct');
    }
    headers.push('Show Correct', 'Condition', 'Retry Condition', 'Reset Condition', 'Max Resets', 'Total Questions', 'Full Score', 'تاريخ ظهور السؤال', 'تاريخ اخفاء السؤال', 'حالة السؤال');
    sheet.appendRow(headers);
  }
  ensureColumns(sheet, 91);
  
  var lessonName = lessonData.lessonName ? lessonData.lessonName.toString().trim() : '';
  var originalName = lessonData.originalName ? lessonData.originalName.toString().trim() : '';
  if (lessonName === '') return { success: false, message: 'اسم الدرس مطلوب' };
  
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  var searchNameClean = cleanString(originalName !== '' ? originalName : lessonName);
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && cleanString(data[i][0]) === searchNameClean) {
      foundRow = i + 1;
      break;
    }
  }
  
  var rowData = new Array(91).fill('');
  rowData[0] = lessonName;
  
  var questions = lessonData.questions || [];
  for (var q = 0; q < 20; q++) {
    var startIdx = 1 + q * 4;
    if (q < questions.length) {
      rowData[startIdx] = questions[q].question || '';
      rowData[startIdx + 1] = questions[q].media || '';
      rowData[startIdx + 2] = questions[q].letters ? questions[q].letters.join(' ') : '';
      rowData[startIdx + 3] = questions[q].correct ? questions[q].correct.join(',') : '';
    } else {
      rowData[startIdx] = '';
      rowData[startIdx + 1] = '';
      rowData[startIdx + 2] = '';
      rowData[startIdx + 3] = '';
    }
  }
  
  rowData[81] = lessonData.showCorrectAnswer || 'نعم';
  rowData[82] = lessonData.condition || 'لا';
  rowData[83] = lessonData.retryCondition || 'نعم';
  rowData[84] = lessonData.resetCondition || 'نعم';
  
  // Safe parsing to avoid NaN issues
  rowData[85] = (lessonData.maxResets !== undefined && lessonData.maxResets !== null && !isNaN(parseInt(lessonData.maxResets))) ? parseInt(lessonData.maxResets) : 9999;
  rowData[86] = (lessonData.totalQuestionsToAnswer !== undefined && lessonData.totalQuestionsToAnswer !== null && !isNaN(parseInt(lessonData.totalQuestionsToAnswer))) ? parseInt(lessonData.totalQuestionsToAnswer) : questions.length;
  rowData[87] = (lessonData.fullScore !== undefined && lessonData.fullScore !== null && !isNaN(parseInt(lessonData.fullScore))) ? parseInt(lessonData.fullScore) : 10;
  
  rowData[88] = lessonData.showDate || '';
  rowData[89] = lessonData.hideDate || '';
  rowData[90] = calculateLessonStatus(lessonData.showDate, lessonData.hideDate);
  
  var targetRow = foundRow;
  if (targetRow === -1) {
    var firstEmptyRow = -1;
    for (var r = 1; r < data.length; r++) {
      if (!data[r][0] || data[r][0].toString().trim() === '') {
        firstEmptyRow = r + 1;
        break;
      }
    }
    if (firstEmptyRow !== -1) {
      targetRow = firstEmptyRow;
    } else {
      targetRow = data.length + 1;
    }
  }
  
  sheet.getRange(targetRow, 1, 1, 91).setValues([rowData]);
  
  SpreadsheetApp.flush();
  Logger.log('Saved Word Lesson ' + lessonName + ' to sheet ' + sheet.getName() + ' at row ' + targetRow);
  return { success: true, message: 'تم حفظ درس الكلمات بنجاح', row: targetRow };
}

function addOrUpdateLessonMatching(lessonData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Matches');
  if (!sheet) {
    sheet = ss.insertSheet('Matches');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Lesson Name', 'Q1 Text', 'Q1 Left', 'Q1 Right', 'Q2 Text', 'Q2 Left', 'Q2 Right', 'Q3 Text', 'Q3 Left', 'Q3 Right', 'Q4 Text', 'Q4 Left', 'Q4 Right', 'Q5 Text', 'Q5 Left', 'Q5 Right', 'Q6 Text', 'Q6 Left', 'Q6 Right', 'Q7 Text', 'Q7 Left', 'Q7 Right', 'Q8 Text', 'Q8 Left', 'Q8 Right', 'Q9 Text', 'Q9 Left', 'Q9 Right', 'Q10 Text', 'Q10 Left', 'Q10 Right', 'Next Control', 'Retry Control', 'Color Control', 'Undo Control', 'Retry Allowed', 'Max Retries', 'Expected Correct', 'Max Grade', 'تاريخ ظهور السؤال', 'تاريخ اخفاء السؤال', 'حالة السؤال']);
  }
  ensureColumns(sheet, 42);
  
  var lessonName = lessonData.lessonName ? lessonData.lessonName.toString().trim() : '';
  var originalName = lessonData.originalName ? lessonData.originalName.toString().trim() : '';
  if (lessonName === '') return { success: false, message: 'اسم الدرس مطلوب' };
  
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  var searchNameClean = cleanString(originalName !== '' ? originalName : lessonName);
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && cleanString(data[i][0]) === searchNameClean) {
      foundRow = i + 1;
      break;
    }
  }
  
  var rowData = new Array(42).fill('');
  rowData[0] = lessonName;
  
  var questions = lessonData.questions || [];
  for (var q = 0; q < 10; q++) {
    var startIdx = 1 + q * 3;
    if (q < questions.length) {
      rowData[startIdx] = questions[q].questionText || '';
      rowData[startIdx + 1] = questions[q].leftString || '';
      rowData[startIdx + 2] = questions[q].rightString || '';
    } else {
      rowData[startIdx] = '';
      rowData[startIdx + 1] = '';
      rowData[startIdx + 2] = '';
    }
  }
  
  rowData[31] = lessonData.nextControl || 'نعم';
  rowData[32] = lessonData.retryControl || 'نعم';
  rowData[33] = lessonData.colorControl || 'نعم';
  rowData[34] = lessonData.undoControl || 'نعم';
  rowData[35] = lessonData.retryAllowed || 'لا';
  
  // Safe parsing to avoid NaN issues
  rowData[36] = (lessonData.maxRetries !== undefined && lessonData.maxRetries !== null && !isNaN(parseInt(lessonData.maxRetries))) ? parseInt(lessonData.maxRetries) : 0;
  rowData[37] = (lessonData.totalExpectedCorrect !== undefined && lessonData.totalExpectedCorrect !== null && !isNaN(parseInt(lessonData.totalExpectedCorrect))) ? parseInt(lessonData.totalExpectedCorrect) : 0;
  rowData[38] = (lessonData.maxGrade !== undefined && lessonData.maxGrade !== null && !isNaN(parseFloat(lessonData.maxGrade))) ? parseFloat(lessonData.maxGrade) : 10;
  
  rowData[39] = lessonData.showDate || '';
  rowData[40] = lessonData.hideDate || '';
  rowData[41] = calculateLessonStatus(lessonData.showDate, lessonData.hideDate);
  
  var targetRow = foundRow;
  if (targetRow === -1) {
    var firstEmptyRow = -1;
    for (var r = 1; r < data.length; r++) {
      if (!data[r][0] || data[r][0].toString().trim() === '') {
        firstEmptyRow = r + 1;
        break;
      }
    }
    if (firstEmptyRow !== -1) {
      targetRow = firstEmptyRow;
    } else {
      targetRow = data.length + 1;
    }
  }
  
  sheet.getRange(targetRow, 1, 1, 42).setValues([rowData]);
  
  SpreadsheetApp.flush();
  Logger.log('Saved Matching Lesson ' + lessonName + ' to sheet ' + sheet.getName() + ' at row ' + targetRow);
  return { success: true, message: 'تم حفظ درس التوصيل بنجاح', row: targetRow };
}

function addOrUpdateLessonDrawing(lessonData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Questions-R');
  if (!sheet) {
    sheet = ss.insertSheet('Questions-R');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Lesson Name', 'Q1 SubLabel', 'Q1 ImageUrls', 'Q1 Settings', 'Q2 SubLabel', 'Q2 ImageUrls', 'Q2 Settings', 'Q3 SubLabel', 'Q3 ImageUrls', 'Q3 Settings', 'Q4 SubLabel', 'Q4 ImageUrls', 'Q4 Settings', 'Q5 SubLabel', 'Q5 ImageUrls', 'Q5 Settings', 'Q6 SubLabel', 'Q6 ImageUrls', 'Q6 Settings', 'Q7 SubLabel', 'Q7 ImageUrls', 'Q7 Settings', 'Q8 SubLabel', 'Q8 ImageUrls', 'Q8 Settings', 'Q9 SubLabel', 'Q9 ImageUrls', 'Q9 Settings', 'Q10 SubLabel', 'Q10 ImageUrls', 'Q10 Settings', 'Empty', 'Full Score', 'Reset Allowed', 'Max Resets', 'تاريخ ظهور السؤال', 'تاريخ اخفاء السؤال', 'حالة السؤال']);
  }
  ensureColumns(sheet, 38);
  
  var lessonName = lessonData.lessonName ? lessonData.lessonName.toString().trim() : '';
  var originalName = lessonData.originalName ? lessonData.originalName.toString().trim() : '';
  if (lessonName === '') return { success: false, message: 'اسم الدرس مطلوب' };
  
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  var searchNameClean = cleanString(originalName !== '' ? originalName : lessonName);
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && cleanString(data[i][0]) === searchNameClean) {
      foundRow = i + 1;
      break;
    }
  }
  
  var rowData = new Array(38).fill('');
  rowData[0] = lessonName;
  
  var questions = lessonData.questions || [];
  for (var q = 0; q < 10; q++) {
    var startIdx = 1 + q * 3;
    if (q < questions.length) {
      rowData[startIdx] = questions[q].subLabel || '';
      rowData[startIdx + 1] = questions[q].imageUrls ? questions[q].imageUrls.join(';') : '';
      rowData[startIdx + 2] = questions[q].settingsStr || '';
    } else {
      rowData[startIdx] = '';
      rowData[startIdx + 1] = '';
      rowData[startIdx + 2] = '';
    }
  }
  
  rowData[31] = '';
  rowData[32] = lessonData.fullScore !== undefined ? parseFloat(lessonData.fullScore) : 10;
  rowData[33] = lessonData.resetAllowed || 'نعم';
  rowData[34] = lessonData.maxResets !== undefined ? parseInt(lessonData.maxResets) : 9999;
  
  rowData[35] = lessonData.showDate || '';
  rowData[36] = lessonData.hideDate || '';
  rowData[37] = calculateLessonStatus(lessonData.showDate, lessonData.hideDate);
  
  var targetRow = foundRow;
  if (targetRow === -1) {
    var firstEmptyRow = -1;
    for (var r = 1; r < data.length; r++) {
      if (!data[r][0] || data[r][0].toString().trim() === '') {
        firstEmptyRow = r + 1;
        break;
      }
    }
    if (firstEmptyRow !== -1) {
      targetRow = firstEmptyRow;
    } else {
      targetRow = data.length + 1;
    }
  }
  
  sheet.getRange(targetRow, 1, 1, 38).setValues([rowData]);
  
  SpreadsheetApp.flush();
  Logger.log('Saved Drawing Lesson ' + lessonName + ' to sheet ' + sheet.getName() + ' at row ' + targetRow);
  return { success: true, message: 'تم حفظ درس الرسم بنجاح', row: targetRow };
}

function deleteLesson(sheetName, lessonName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, sheetName);
  if (!sheet) return { success: false, message: 'الورقة غير موجودة' };
  
  var data = sheet.getDataRange().getValues();
  var lessonNameClean = cleanString(lessonName);
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && cleanString(data[i][0]) === lessonNameClean) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, message: 'الدرس غير موجود في ورقة ' + sheetName };
}

function ensureColumns(sheet, requiredColumns) {
  try {
    var maxCols = sheet.getMaxColumns();
    if (maxCols < requiredColumns) {
      sheet.insertColumnsAfter(maxCols, requiredColumns - maxCols);
    }
  } catch (err) {
    Logger.log("Error in ensureColumns: " + err.toString());
  }
}

function cleanString(str) {
  if (!str) return '';
  return str.toString()
    .replace(/[\\s\u00a0\u200b]+/g, ' ')
    .trim();
}

function parseScore(resText) {
  if (!resText) return { correct: 0, wrong: 0 };
  var str = resText.toString().trim();
  if (str === '') return { correct: 0, wrong: 0 };

  // Normalize Arabic-Indic digits to standard English digits
  var arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  for (var d = 0; d < 10; d++) {
    str = str.replace(new RegExp(arabicDigits[d], 'g'), d);
  }

  var correct = 0;
  var wrong = 0;

  // استخدام تعبير منتظم مبني بشكل آمن جداً لمنع أي مشاكل في سقوط الباك سلاش أثناء النسخ
  var numbers = [];
  var match;
  var re = new RegExp('\\\\d+', 'g');
  while ((match = re.exec(str)) !== null) {
    numbers.push(parseInt(match[0]) || 0);
  }

  // البحث الدقيق عن الكلمات المفتاحية
  var correctMatch = str.match(new RegExp('(?:الصحيح|صحيح|صحيحة)\\\\s*[:\\\\s-]*\\\\s*(\\\\d+)', 'i'));
  var wrongMatch = str.match(new RegExp('(?:الخطأ|الخطا|خطأ|خاطئ|خاطئة)\\\\s*[:\\\\s-]*\\\\s*(\\\\d+)', 'i'));

  if (correctMatch) {
    correct = parseInt(correctMatch[1]) || 0;
  }
  if (wrongMatch) {
    wrong = parseInt(wrongMatch[1]) || 0;
  }

  // احتياطي: إذا لم يتم العثور على الكلمات المفتاحية بشكل مباشر ولكن توجد أرقام
  if (!correctMatch && !wrongMatch) {
    if (numbers.length >= 2) {
      correct = numbers[0];
      wrong = numbers[1];
    } else if (numbers.length === 1) {
      correct = numbers[0];
      wrong = 0;
    }
  }

  return { correct: correct, wrong: wrong };
}

function getSheetByNameFlexible(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  
  var searchName = name.toLowerCase().trim();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().toLowerCase().trim();
    if (sName === searchName) {
      return sheets[i];
    }
    // Arabic variations mappings
    if (name === 'Matches' && (sName === 'توصيل' || sName === 'التوصيل' || sName === 'matches' || sName === 'ورقة Matches' || sName === 'ورقة التوصيل')) {
      return sheets[i];
    }
    if (name === 'Questions' && (sName === 'الأسئلة' || sName === 'الاسئلة' || sName === 'الاسئله' || sName === 'الكلمات' || sName === 'questions' || sName === 'ورقة Questions' || sName === 'ورقة الاسئلة')) {
      return sheets[i];
    }
    if (name === 'Questions-R' && (sName === 'questions-r' || sName === 'الرسم' || sName === 'كتابة' || sName === 'الكتابة' || sName === 'كتابة ورسم' || sName === 'ورقة Questions-R' || sName === 'ورقة الرسم')) {
      return sheets[i];
    }
    if (name === 'Answers-Questions' && (sName === 'answers-questions' || sName === 'إجابات الأسئلة' || sName === 'اجابات الاسئلة' || sName === 'إجابات الكلمات' || sName === 'اجابات الكلمات')) {
      return sheets[i];
    }
    if (name === 'Progress' && (sName === 'progress' || sName === 'التقدم' || sName === 'تقدم الطلاب' || sName === 'النتائج')) {
      return sheets[i];
    }
    if (name === 'Admins' && (sName === 'admins' || sName === 'المشرفين' || sName === 'المسؤولين' || sName === 'الحسابات')) {
      return sheets[i];
    }
  }
  return null;
}

function safeSplitMatches(str) {
  if (!str) return [];
  var stringVal = str.toString();
  
  var urlRegex = new RegExp("https?:\\\\/\\\\/[a-zA-Z0-9\\\\-._~:\\\\/?#\\\\[\\\\]@!$&'()*+,;=%]+", 'g');
  var urls = [];
  var match;
  while ((match = urlRegex.exec(stringVal)) !== null) {
    urls.push(match[0]);
  }
  
  var tempStr = stringVal;
  for (var i = 0; i < urls.length; i++) {
    tempStr = tempStr.replace(urls[i], '___URL_' + i + '___');
  }
  
  var parts = tempStr.split('-');
  
  return parts.map(function(part) {
    var trimmed = part.trim();
    for (var i = 0; i < urls.length; i++) {
      trimmed = trimmed.replace('___URL_' + i + '___', urls[i]);
    }
    return trimmed;
  }).filter(function(p) { return p !== ''; });
}

function getItemTypeAndValueGAS(value) {
  var trimmed = value ? value.toString().trim() : '';
  if (!trimmed) return { type: 'text', value: '' };

  var lowercase = trimmed.toLowerCase();
  
  if (lowercase.indexOf('#audio') !== -1) {
    return { type: 'audio', value: stripUrlHashGAS(trimmed) };
  }
  if (lowercase.indexOf('#image') !== -1) {
    return { type: 'image', value: stripUrlHashGAS(trimmed) };
  }
  if (lowercase.indexOf('#text') !== -1) {
    return { type: 'text', value: stripUrlHashGAS(trimmed) };
  }

  if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
    if (
      lowercase.indexOf('.mp3') !== -1 ||
      lowercase.indexOf('.wav') !== -1 ||
      lowercase.indexOf('.ogg') !== -1 ||
      lowercase.indexOf('.m4a') !== -1 ||
      lowercase.indexOf('.aac') !== -1
    ) {
      return { type: 'audio', value: trimmed };
    }

    if (
      lowercase.indexOf('.png') !== -1 ||
      lowercase.indexOf('.jpg') !== -1 ||
      lowercase.indexOf('.jpeg') !== -1 ||
      lowercase.indexOf('.gif') !== -1 ||
      lowercase.indexOf('.webp') !== -1 ||
      lowercase.indexOf('.svg') !== -1
    ) {
      return { type: 'image', value: trimmed };
    }

    if (
      lowercase.indexOf('drive.google.com') !== -1 ||
      lowercase.indexOf('docs.google.com') !== -1 ||
      lowercase.indexOf('/uc?id=') !== -1 ||
      lowercase.indexOf('export=download') !== -1
    ) {
      return { type: 'audio', value: trimmed };
    }

    return { type: 'image', value: trimmed };
  }

  return { type: 'text', value: trimmed };
}

function stripUrlHashGAS(url) {
  if (!url) return '';
  var hashIdx = url.indexOf('#');
  return hashIdx !== -1 ? url.substring(0, hashIdx) : url;
}

function calculateLessonStatus(showDateVal, hideDateVal) {
  var now = new Date();
  
  var showDate = null;
  if (showDateVal && showDateVal !== '') {
    showDate = new Date(showDateVal);
  }
  var hideDate = null;
  if (hideDateVal && hideDateVal !== '') {
    hideDate = new Date(hideDateVal);
  }
  
  // If date conversions fail (invalid dates), treat as null
  if (showDate && isNaN(showDate.getTime())) showDate = null;
  if (hideDate && isNaN(hideDate.getTime())) hideDate = null;
  
  if (!showDate && !hideDate) {
    return "ظهور";
  }
  
  if (showDate && !hideDate) {
    if (now < showDate) {
      return "انتظار";
    } else {
      return "ظهور";
    }
  }
  
  if (!showDate && hideDate) {
    if (now > hideDate) {
      return "اخفاء";
    } else {
      return "ظهور";
    }
  }
  
  // Both dates are present
  if (now < showDate) {
    return "انتظار";
  } else if (now > hideDate) {
    return "اخفاء";
  } else {
    return "ظهور";
  }
}

function getOrUpdateStatus(sheet, row, statusCol, showDateVal, hideDateVal, currentStatusVal) {
  var computed = calculateLessonStatus(showDateVal, hideDateVal);
  var current = currentStatusVal ? currentStatusVal.toString().trim() : '';
  if (computed !== current) {
    sheet.getRange(row, statusCol).setValue(computed);
  }
  return computed;
}

function getStudentLessonStatus(schedule, sheetName, lessonName, defaultStatus) {
  if (!schedule || !schedule.examOverrides) {
    return defaultStatus;
  }
  try {
    var overridesObj = JSON.parse(schedule.examOverrides);
    if (overridesObj && overridesObj[sheetName] && overridesObj[sheetName][lessonName]) {
      var override = overridesObj[sheetName][lessonName];
      if (override.status && override.status.trim() !== '') {
        var st = override.status.trim();
        if (st === 'عرض دائماً' || st === 'ظهور') {
          return 'ظهور';
        }
        if (st === 'إخفاء دائماً' || st === 'اخفاء' || st === 'إخفاء') {
          return 'اخفاء';
        }
      }
      
      var showStr = override.showDate || '';
      var hideStr = override.hideDate || '';
      if (showStr.trim() !== '' || hideStr.trim() !== '') {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (showStr.trim() !== '') {
          var parts = showStr.split('-');
          if (parts.length === 3) {
            var showDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            showDate.setHours(0, 0, 0, 0);
            if (today < showDate) {
              return 'لم يحن الوقت';
            }
          }
        }
        if (hideStr.trim() !== '') {
          var parts = hideStr.split('-');
          if (parts.length === 3) {
            var hideDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            hideDate.setHours(0, 0, 0, 0);
            if (today >= hideDate) {
              return 'اخفاء';
            }
          }
        }
        return 'ظهور';
      }
    }
  } catch (e) {
    // ignore
  }
  return defaultStatus;
}

function getEffectiveScheduleForSheet(schedule, sheetName) {
  if (!schedule) return null;
  
  var defSchedule = null;
  if (schedule.studentId !== 'DEFAULT_STUDENT') {
    defSchedule = getStudentSchedule('DEFAULT_STUDENT');
  }
  
  var getVal = function(primary, fallback, defVal) {
    if (primary !== undefined && primary !== null && primary.toString().trim() !== '') {
      return primary.toString().trim();
    }
    if (fallback !== undefined && fallback !== null && fallback.toString().trim() !== '') {
      return fallback.toString().trim();
    }
    return defVal || '';
  };
  
  var effective = {
    startDate: getVal(schedule.startDate, defSchedule ? defSchedule.startDate : null, ''),
    activeDays: getVal(schedule.activeDays, defSchedule ? defSchedule.activeDays : null, 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت'),
    lessonsPerWeek: getVal(schedule.lessonsPerWeek, defSchedule ? defSchedule.lessonsPerWeek : null, '3'),
    daysToKeep: getVal(schedule.daysToKeep, defSchedule ? defSchedule.daysToKeep : null, ''),
    expiryDate: getVal(schedule.expiryDate, defSchedule ? defSchedule.expiryDate : null, '')
  };
  
  var customSection = null;
  
  // Check student's own sectionSchedules first
  if (schedule.examOverrides) {
    try {
      var ov = JSON.parse(schedule.examOverrides);
      if (ov && ov.sectionSchedules && ov.sectionSchedules[sheetName]) {
        customSection = ov.sectionSchedules[sheetName];
      }
    } catch (e) {}
  }
  
  // If not customizing, check default student's sectionSchedules
  if ((!customSection || !customSection.useCustom) && defSchedule && defSchedule.examOverrides) {
    try {
      var defOv = JSON.parse(defSchedule.examOverrides);
      if (defOv && defOv.sectionSchedules && defOv.sectionSchedules[sheetName]) {
        var defCustomSection = defOv.sectionSchedules[sheetName];
        if (defCustomSection && defCustomSection.useCustom) {
          customSection = defCustomSection;
        }
      }
    } catch (e) {}
  }
  
  if (customSection && customSection.useCustom) {
    var defCustomSection = null;
    if (defSchedule && defSchedule.examOverrides) {
      try {
        var defOv = JSON.parse(defSchedule.examOverrides);
        if (defOv && defOv.sectionSchedules) {
          defCustomSection = defOv.sectionSchedules[sheetName];
        }
      } catch (e) {}
    }
    
    var getSecVal = function(primary, secondary, fallback, defVal) {
      if (primary !== undefined && primary !== null && primary.toString().trim() !== '') {
        return primary.toString().trim();
      }
      if (secondary !== undefined && secondary !== null && secondary.toString().trim() !== '') {
        return secondary.toString().trim();
      }
      if (fallback !== undefined && fallback !== null && fallback.toString().trim() !== '') {
        return fallback.toString().trim();
      }
      return defVal || '';
    };
    
    effective.startDate = getSecVal(customSection.startDate, defCustomSection ? defCustomSection.startDate : null, effective.startDate, '');
    effective.activeDays = getSecVal(customSection.activeDays, defCustomSection ? defCustomSection.activeDays : null, effective.activeDays, 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت');
    effective.lessonsPerWeek = getSecVal(customSection.lessonsPerWeek, defCustomSection ? defCustomSection.lessonsPerWeek : null, effective.lessonsPerWeek, '3');
    effective.daysToKeep = getSecVal(customSection.daysToKeep, defCustomSection ? defCustomSection.daysToKeep : null, effective.daysToKeep, '');
    effective.expiryDate = getSecVal(customSection.expiryDate, defCustomSection ? defCustomSection.expiryDate : null, effective.expiryDate, '');
  }
  
  return effective;
}

function getArabicDayIndex(dayStr) {
  var d = dayStr.trim();
  if (d.indexOf('أحد') !== -1 || d.indexOf('الاحد') !== -1 || d.indexOf('الأحد') !== -1) return 0;
  if (d.indexOf('اثنين') !== -1 || d.indexOf('الاثنين') !== -1 || d.indexOf('الأثنين') !== -1) return 1;
  if (d.indexOf('ثلاثاء') !== -1 || d.indexOf('الثلاثاء') !== -1) return 2;
  if (d.indexOf('أربعاء') !== -1 || d.indexOf('الاربعاء') !== -1 || d.indexOf('الأربعاء') !== -1) return 3;
  if (d.indexOf('خميس') !== -1 || d.indexOf('الخميس') !== -1) return 4;
  if (d.indexOf('جمعة') !== -1 || d.indexOf('الجمعة') !== -1) return 5;
  if (d.indexOf('سبت') !== -1 || d.indexOf('السبت') !== -1) return 6;
  return -1;
}

function parseActiveDays(activeDaysStr) {
  if (!activeDaysStr || activeDaysStr.trim() === '') {
    return [0, 2, 4]; // Default: Sun, Tue, Thu
  }
  var parts = activeDaysStr.split(/[,،]/);
  var days = [];
  for (var i = 0; i < parts.length; i++) {
    var idx = getArabicDayIndex(parts[i]);
    if (idx !== -1) {
      days.push(idx);
    }
  }
  if (days.length === 0) {
    return [0, 2, 4];
  }
  return days;
}

function getActiveStudyDayDate(startDateStr, activeDaysStr, activeDayIndex) {
  if (!startDateStr || startDateStr.trim() === '') return null;
  var parts = startDateStr.split('-');
  if (parts.length !== 3) return null;
  var date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  
  var activeDays = parseActiveDays(activeDaysStr);
  var count = 0;
  var tempDate = new Date(date.getTime());
  
  var limit = 0;
  while (limit < 5000) {
    var dayOfWeek = tempDate.getDay();
    if (activeDays.indexOf(dayOfWeek) !== -1) {
      count++;
      if (count === activeDayIndex) {
        return tempDate;
      }
    }
    tempDate.setTime(tempDate.getTime() + 24 * 3600 * 1000);
    limit++;
  }
  return null;
}

function getUnlockedCount(startDateStr, activeDaysStr, lessonsPerDayStr, now) {
  if (!startDateStr || startDateStr.trim() === '') {
    return 99999;
  }
  
  var parts = startDateStr.split('-');
  if (parts.length !== 3) return 99999;
  var startDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(startDate.getTime())) return 99999;
  
  // Set times to midnight to compare days accurately
  startDate.setHours(0, 0, 0, 0);
  var currentDate = now ? new Date(now) : new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  if (currentDate < startDate) {
    return 0; // Not started yet!
  }
  
  var activeDays = parseActiveDays(activeDaysStr);
  var lessonsPerDay = parseInt(lessonsPerDayStr) || 3;
  
  // Count active days passed from startDate to currentDate (inclusive)
  var activeDaysPassed = 0;
  var tempDate = new Date(startDate.getTime());
  
  // Limit to 2000 days to prevent any infinite loops
  var limit = 0;
  while (tempDate <= currentDate && limit < 2000) {
    var dayOfWeek = tempDate.getDay();
    if (activeDays.indexOf(dayOfWeek) !== -1) {
      activeDaysPassed++;
    }
    tempDate.setTime(tempDate.getTime() + 24 * 3600 * 1000);
    limit++;
  }
  
  return activeDaysPassed * lessonsPerDay;
}

function getOrCreateStudentScheduleSheet(ss) {
  var sheet = getSheetByNameFlexible(ss, 'StudentSchedule');
  if (!sheet) {
    sheet = ss.insertSheet('StudentSchedule');
    sheet.appendRow([
      'رقم الطالب', 'اسم الطالب', 'تاريخ البدء', 'أيام الدراسة', 'عدد الدروس اليومية', 'أيام بقاء الدرس', 'تاريخ الإخفاء النهائي', 'تخصيص الامتحانات', 
      '', 'تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f1f5f9');
    sheet.getRange(1, 10, 1, 6).setFontWeight('bold').setBackground('#e0e7ff');
  } else {
    ensureColumns(sheet, 15);
    var firstRow = sheet.getRange(1, 1, 1, 15).getValues()[0];
    if (!firstRow[5] || firstRow[5].toString().trim() === '') {
      sheet.getRange(1, 6).setValue('أيام بقاء الدرس');
    }
    if (!firstRow[6] || firstRow[6].toString().trim() === '') {
      sheet.getRange(1, 7).setValue('تاريخ الإخفاء النهائي');
    }
    if (!firstRow[7] || firstRow[7].toString().trim() === '') {
      sheet.getRange(1, 8).setValue('تخصيص الامتحانات');
    }
    if (!firstRow[9] || firstRow[9].toString().trim() === '') {
      sheet.getRange("J1:O1").setValues([['تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع']]);
      sheet.getRange("J1:O1").setFontWeight('bold').setBackground('#e0e7ff');
    }
  }
  return sheet;
}

function saveSetting(key, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) return;
  var lastRow = settingsSheet.getLastRow();
  var settingsData = lastRow >= 1 ? settingsSheet.getRange("U1:V" + lastRow).getValues() : [];
  var foundRow = -1;
  for (var i = 0; i < settingsData.length; i++) {
    if (settingsData[i][0] && settingsData[i][0].toString().trim() === key) {
      foundRow = i + 1;
      break;
    }
  }
  if (foundRow !== -1) {
    settingsSheet.getRange(foundRow, 22).setValue(value || '');
  } else {
    var nextRow = Math.max(lastRow + 1, 2);
    settingsSheet.getRange(nextRow, 21).setValue(key);
    settingsSheet.getRange(nextRow, 22).setValue(value || '');
  }
}

function getDefaultSchedule() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);
  
  ensureColumns(scheduleSheet, 15);
  
  // Ensure default headers are set in J1:O1 if empty
  var headersRange = scheduleSheet.getRange("J1:O1");
  var headers = headersRange.getValues()[0];
  if (!headers[0] || headers[0].toString().trim() === '') {
    headersRange.setValues([['تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع']]);
    headersRange.setFontWeight('bold').setBackground('#e0e7ff');
  }
  
  var defaultValues = scheduleSheet.getRange("J2:O2").getValues()[0];
  var dStartDate = defaultValues[0] || '';
  if (dStartDate instanceof Date) {
    var dYr = dStartDate.getFullYear();
    var dMo = ('0' + (dStartDate.getMonth() + 1)).slice(-2);
    var dDy = ('0' + dStartDate.getDate()).slice(-2);
    dStartDate = dYr + '-' + dMo + '-' + dDy;
  }
  
  var dExpiryDate = defaultValues[4] || '';
  if (dExpiryDate instanceof Date) {
    var deYr = dExpiryDate.getFullYear();
    var deMo = ('0' + (dExpiryDate.getMonth() + 1)).slice(-2);
    var deDy = ('0' + dExpiryDate.getDate()).slice(-2);
    dExpiryDate = deYr + '-' + deMo + '-' + deDy;
  }
  
  // If J2:O2 are completely empty, initialize them with sensible defaults so they're visible
  var isDefaultEmpty = (dStartDate === '' && (defaultValues[1] || '') === '' && (defaultValues[2] || '') === '');
  if (isDefaultEmpty) {
    scheduleSheet.getRange("J2:O2").setValues([['', 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت', '3', '', '', '']]);
    dStartDate = '';
    defaultValues[1] = 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت';
    defaultValues[2] = '3';
    defaultValues[3] = '';
    dExpiryDate = '';
    defaultValues[5] = '';
  }
  
  return {
    studentId: 'DEFAULT_STUDENT',
    studentName: 'الإعدادات الافتراضية العامة لجميع الطلاب',
    startDate: dStartDate.toString().trim(),
    activeDays: defaultValues[1] ? defaultValues[1].toString().trim() : 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت',
    lessonsPerWeek: defaultValues[2] ? defaultValues[2].toString().trim() : '3',
    daysToKeep: defaultValues[3] ? defaultValues[3].toString().trim() : '',
    expiryDate: dExpiryDate.toString().trim(),
    examOverrides: defaultValues[5] ? defaultValues[5].toString().trim() : ''
  };
}

function getStudentSchedule(studentId) {
  if (!studentId || studentId === 'admin_preview') {
    return null;
  }
  if (studentId.toString().trim() === 'DEFAULT_STUDENT') {
    return getDefaultSchedule();
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);
  
  var lastRow = scheduleSheet.getLastRow();
  if (lastRow < 2) return null;
  
  var data = scheduleSheet.getRange(2, 1, lastRow - 1, 8).getValues();
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var sId = row[0] ? row[0].toString().trim() : '';
    if (sId === studentId.toString().trim()) {
      var startDate = row[2] || '';
      if (startDate instanceof Date) {
        var yr = startDate.getFullYear();
        var mo = ('0' + (startDate.getMonth() + 1)).slice(-2);
        var dy = ('0' + startDate.getDate()).slice(-2);
        startDate = yr + '-' + mo + '-' + dy;
      }
      var expDate = row[6] || '';
      if (expDate instanceof Date) {
        var eYr = expDate.getFullYear();
        var eMo = ('0' + (expDate.getMonth() + 1)).slice(-2);
        var eDy = ('0' + expDate.getDate()).slice(-2);
        expDate = eYr + '-' + eMo + '-' + eDy;
      }
      return {
        startDate: startDate.toString().trim(),
        activeDays: row[3] ? row[3].toString().trim() : '',
        lessonsPerWeek: row[4] ? row[4].toString().trim() : '3',
        daysToKeep: row[5] ? row[5].toString().trim() : '',
        expiryDate: expDate.toString().trim(),
        examOverrides: row[7] ? row[7].toString().trim() : ''
      };
    }
  }
  return null;
}

function getAllStudentsSchedule() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = getSheetByNameFlexible(ss, 'Settings');
  if (!settingsSheet) return [];
  
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);
  
  // 1. Get all students from Settings sheet (Z: Name, AA: ID)
  var lastSettingsRow = settingsSheet.getLastRow();
  var activeStudents = {};
  if (lastSettingsRow >= 2) {
    var usersData = settingsSheet.getRange("Z2:AA" + lastSettingsRow).getValues();
    for (var i = 0; i < usersData.length; i++) {
      var sName = usersData[i][0] ? usersData[i][0].toString().trim() : '';
      var sId = usersData[i][1] ? usersData[i][1].toString().trim() : '';
      if (sId !== '' && sName !== '') {
        activeStudents[sId] = sName;
      }
    }
  }
  
  // 2. Get current student schedules from StudentSchedule sheet
  var lastScheduleRow = scheduleSheet.getLastRow();
  var existingSchedules = {};
  var scheduleRows = [];
  var deletedAny = false;
  
  if (lastScheduleRow >= 2) {
    scheduleRows = scheduleSheet.getRange(2, 1, lastScheduleRow - 1, 8).getValues();
    
    // Clean up any old DEFAULT_STUDENT row in the sheet
    for (var j = scheduleRows.length - 1; j >= 0; j--) {
      if (scheduleRows[j][0] && scheduleRows[j][0].toString().trim() === 'DEFAULT_STUDENT') {
        scheduleSheet.deleteRow(j + 2);
        deletedAny = true;
      }
    }
    
    if (deletedAny) {
      SpreadsheetApp.flush();
      lastScheduleRow = scheduleSheet.getLastRow();
      if (lastScheduleRow >= 2) {
        scheduleRows = scheduleSheet.getRange(2, 1, lastScheduleRow - 1, 8).getValues();
      } else {
        scheduleRows = [];
      }
    }
    
    for (var j = 0; j < scheduleRows.length; j++) {
      var row = scheduleRows[j];
      var sId = row[0] ? row[0].toString().trim() : '';
      if (sId !== '' && sId !== 'DEFAULT_STUDENT') {
        existingSchedules[sId] = {
          rowNumber: j + 2,
          studentName: row[1] ? row[1].toString().trim() : '',
          startDate: row[2],
          activeDays: row[3] ? row[3].toString().trim() : '',
          lessonsPerWeek: row[4] ? row[4].toString().trim() : '3',
          daysToKeep: row[5] ? row[5].toString().trim() : '',
          expiryDate: row[6]
        };
      }
    }
  }
  
  // 3. Find any new students in Settings that aren't in StudentSchedule, and add them
  var newRows = [];
  for (var sId in activeStudents) {
    if (sId === 'DEFAULT_STUDENT') continue;
    if (!existingSchedules[sId]) {
      newRows.push([sId, activeStudents[sId], '', 'الأحد، الثلاثاء، الخميس', '3', '', '', '']);
    } else {
      if (existingSchedules[sId].studentName !== activeStudents[sId]) {
        var rowNum = existingSchedules[sId].rowNumber;
        scheduleSheet.getRange(rowNum, 2).setValue(activeStudents[sId]);
      }
    }
  }
  
  if (newRows.length > 0) {
    scheduleSheet.getRange(scheduleSheet.getLastRow() + 1, 1, newRows.length, 8).setValues(newRows);
    SpreadsheetApp.flush();
    lastScheduleRow = scheduleSheet.getLastRow();
    scheduleRows = scheduleSheet.getRange(2, 1, lastScheduleRow - 1, 8).getValues();
  }
  
  // 4. Return list of student schedules, starting with DEFAULT_STUDENT
  var list = [];
  list.push(getDefaultSchedule());
  
  for (var k = 0; k < scheduleRows.length; k++) {
    var r = scheduleRows[k];
    var sId = r[0] ? r[0].toString().trim() : '';
    var sName = r[1] ? r[1].toString().trim() : '';
    
    if (sId === '' || sId === 'DEFAULT_STUDENT') continue;
    if (!activeStudents[sId]) continue;
    
    var sDate = r[2] || '';
    if (sDate instanceof Date) {
      var yr = sDate.getFullYear();
      var mo = ('0' + (sDate.getMonth() + 1)).slice(-2);
      var dy = ('0' + sDate.getDate()).slice(-2);
      sDate = yr + '-' + mo + '-' + dy;
    }
    
    var expDate = r[6] || '';
    if (expDate instanceof Date) {
      var eYr = expDate.getFullYear();
      var eMo = ('0' + (expDate.getMonth() + 1)).slice(-2);
      var eDy = ('0' + expDate.getDate()).slice(-2);
      expDate = eYr + '-' + eMo + '-' + eDy;
    }
    
    list.push({
      studentId: sId,
      studentName: sName,
      startDate: sDate.toString().trim(),
      activeDays: r[3] ? r[3].toString().trim() : '',
      lessonsPerWeek: r[4] ? r[4].toString().trim() : '3',
      daysToKeep: r[5] ? r[5].toString().trim() : '',
      expiryDate: expDate.toString().trim(),
      examOverrides: r[7] ? r[7].toString().trim() : ''
    });
  }
  return list;
}

function updateStudentSchedule(studentId, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate, examOverrides) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);

  if (studentId === 'DEFAULT_STUDENT') {
    ensureColumns(scheduleSheet, 15);
    
    // Ensure default headers are written
    var headersRange = scheduleSheet.getRange("J1:O1");
    var headers = headersRange.getValues()[0];
    if (!headers[0] || headers[0].toString().trim() === '') {
      headersRange.setValues([['تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع']]);
      headersRange.setFontWeight('bold').setBackground('#e0e7ff');
    }

    scheduleSheet.getRange(2, 10).setValue(startDate || '');
    scheduleSheet.getRange(2, 11).setValue(activeDays || '');
    scheduleSheet.getRange(2, 12).setValue(lessonsPerWeek || '');
    scheduleSheet.getRange(2, 13).setValue(daysToKeep !== undefined && daysToKeep !== null ? daysToKeep : '');
    scheduleSheet.getRange(2, 14).setValue(expiryDate !== undefined && expiryDate !== null ? expiryDate : '');
    if (examOverrides !== undefined && examOverrides !== null) {
      scheduleSheet.getRange(2, 15).setValue(examOverrides);
    }
    SpreadsheetApp.flush();
    return { success: true, message: 'تم تحديث الإعدادات الافتراضية بنجاح' };
  }

  var lastRow = scheduleSheet.getLastRow();
  if (lastRow < 2) return { success: false, message: 'لا توجد بيانات طلاب في جدول المواعيد' };
  
  var ids = scheduleSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var foundRowIndex = -1;
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0].toString().trim() === studentId.toString().trim()) {
      foundRowIndex = i + 2;
      break;
    }
  }
  
  if (foundRowIndex === -1) {
    return { success: false, message: 'الطالب غير موجود في جدول المواعيد' };
  }
  
  ensureColumns(scheduleSheet, 8);
  
  scheduleSheet.getRange(foundRowIndex, 3).setValue(startDate || '');
  scheduleSheet.getRange(foundRowIndex, 4).setValue(activeDays || '');
  scheduleSheet.getRange(foundRowIndex, 5).setValue(lessonsPerWeek || '');
  scheduleSheet.getRange(foundRowIndex, 6).setValue(daysToKeep !== undefined && daysToKeep !== null ? daysToKeep : '');
  scheduleSheet.getRange(foundRowIndex, 7).setValue(expiryDate !== undefined && expiryDate !== null ? expiryDate : '');
  if (examOverrides !== undefined && examOverrides !== null) {
    scheduleSheet.getRange(foundRowIndex, 8).setValue(examOverrides);
  }
  
  SpreadsheetApp.flush();
  return { success: true, message: 'تم تحديث جدولة الطالب بنجاح' };
}

function getTenStars(percentageStr) {
  if (percentageStr === undefined || percentageStr === null || percentageStr === '') return '☆☆☆☆☆☆☆☆☆☆';
  var str = String(percentageStr).replace('%', '').trim();
  var num = parseFloat(str);
  if (isNaN(num)) return '☆☆☆☆☆☆☆☆☆☆';
  if (num < 0) num = 0;
  if (num > 100) num = 100;
  var filledCount = Math.round(num / 10);
  var result = '';
  for (var i = 0; i < 10; i++) {
    if (i < filledCount) {
      result += '⭐';
    } else {
      result += '☆';
    }
  }
  return result;
}

function syncConsolidatedEvaluations(studentId, studentName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
  
  var CONSOLIDATED_HEADERS = [
    'رقم الطالب',
    'اسم الطالب',
    'موضوع الدرس',
    'حالة الدروس المرسلة',
    'درجات الصورة',
    'درجات الصوت',
    'حالة درجات التركيز',
    'الدرجة النهائية',
    'التقييم بالنجوم',
    'حالة تمارين الكلمات',
    'تفاصيل الكلمات',
    'النسبة المئوية للكلمات',
    'التقييم بالنجوم للكلمات',
    'حالة تمارين الوصل',
    'تفاصيل الوصل',
    'النسبة المئوية للوصل',
    'التقييم بالنجوم للوصل',
    'حالة تمارين الكتابة',
    'تفاصيل الكتابة',
    'النسبة المئوية للكتابة',
    'التقييم بالنجوم للكتابة',
    'حالة الموضوع'
  ];

  if (!sheet) {
    sheet = ss.insertSheet('ConsolidatedEvaluations');
  }

  // Ensure sheet has at least 22 columns
  if (sheet.getMaxColumns() < 22) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 22 - sheet.getMaxColumns());
  }

  // Always update row 1 headers with the latest 22-column structure
  sheet.getRange(1, 1, 1, 22).setValues([CONSOLIDATED_HEADERS]);
  sheet.getRange(1, 1, 1, 22).setFontWeight('bold').setBackground('#f1f5f9');

  // Get all active lesson names from definition sheets
  var lessonsSet = {};
  
  var qSheet = getSheetByNameFlexible(ss, 'Questions');
  if (qSheet && qSheet.getLastRow() >= 2) {
    var qData = qSheet.getRange(2, 1, qSheet.getLastRow() - 1, 1).getValues();
    qData.forEach(function(row) { if (row[0]) lessonsSet[row[0].toString().trim()] = true; });
  }
  
  var mSheet = getSheetByNameFlexible(ss, 'Matches');
  if (mSheet && mSheet.getLastRow() >= 2) {
    var mData = mSheet.getRange(2, 1, mSheet.getLastRow() - 1, 1).getValues();
    mData.forEach(function(row) { if (row[0]) lessonsSet[row[0].toString().trim()] = true; });
  }
  
  var qrSheet = getSheetByNameFlexible(ss, 'Questions-R');
  if (qrSheet && qrSheet.getLastRow() >= 2) {
    var qrData = qrSheet.getRange(2, 1, qrSheet.getLastRow() - 1, 1).getValues();
    qrData.forEach(function(row) { if (row[0]) lessonsSet[row[0].toString().trim()] = true; });
  }
  
  var lessonNames = Object.keys(lessonsSet);
  if (lessonNames.length === 0) return { success: false, message: 'لم يتم العثور على أي دروس.' };

  // Load student records from correction (Homework / Focus grades / Sent lessons)
  var corrMap = {};
  var corrSheet = getSheetByNameFlexible(ss, 'correction');
  if (corrSheet && corrSheet.getLastRow() >= 2) {
    var maxCols = Math.max(23, corrSheet.getLastColumn());
    var corrData = corrSheet.getRange(2, 1, corrSheet.getLastRow() - 1, maxCols).getValues();
    corrData.forEach(function(row) {
      var rowId = row[0] ? row[0].toString().trim() : '';
      var rowTopic = row[2] ? row[2].toString().trim() : '';
      if (rowId === studentId.toString().trim() && rowTopic !== '') {
        var picVal = row[20] !== undefined && row[20] !== null ? row[20].toString().trim() : '';
        var audioVal = row[22] !== undefined && row[22] !== null ? row[22].toString().trim() : '';
        var finalVal = row[21] !== undefined && row[21] !== null ? row[21].toString().trim() : '';
        var fg = formatPercentage(finalVal || picVal || audioVal || '100%');
        corrMap[rowTopic] = {
          sentStatus: 'تم',
          picGrade: picVal || '-',
          audioGrade: audioVal || '-',
          finalGrade: fg,
          hasFocus: (picVal !== '' || audioVal !== '' || finalVal !== '')
        };
      }
    });
  }

  // Load student records from Answers-Questions (AB=27, AE=30)
  var wordsMap = {};
  var aqSheet = getSheetByNameFlexible(ss, 'Answers-Questions');
  if (aqSheet && aqSheet.getLastRow() >= 2) {
    var maxCols = Math.max(31, aqSheet.getLastColumn());
    var aqData = aqSheet.getRange(2, 1, aqSheet.getLastRow() - 1, maxCols).getValues();
    aqData.forEach(function(row) {
      var rowId = row[0] ? row[0].toString().trim() : '';
      var rowTopic = row[2] ? row[2].toString().trim() : '';
      if (rowId === studentId.toString().trim() && rowTopic !== '') {
        wordsMap[rowTopic] = {
          summary: row[27] ? row[27].toString().trim() : '',
          pct: formatPercentage(row[30])
        };
      }
    });
  }

  // Load student records from Answers (Q=16, T=19)
  var waslMap = {};
  var aSheet = getSheetByNameFlexible(ss, 'Answers');
  if (aSheet && aSheet.getLastRow() >= 2) {
    var maxCols = Math.max(20, aSheet.getLastColumn());
    var aData = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, maxCols).getValues();
    aData.forEach(function(row) {
      var rowId = row[0] ? row[0].toString().trim() : '';
      var rowTopic = row[2] ? row[2].toString().trim() : '';
      if (rowId === studentId.toString().trim() && rowTopic !== '') {
        waslMap[rowTopic] = {
          summary: row[16] ? row[16].toString().trim() : '',
          pct: formatPercentage(row[19])
        };
      }
    });
  }

  // Load student records from Progress (AJ=35, AL=37)
  var progMap = {};
  var pSheet = getSheetByNameFlexible(ss, 'Progress');
  if (pSheet && pSheet.getLastRow() >= 2) {
    var maxCols = Math.max(38, pSheet.getLastColumn());
    var pData = pSheet.getRange(2, 1, pSheet.getLastRow() - 1, maxCols).getValues();
    pData.forEach(function(row) {
      var rowId = row[0] ? row[0].toString().trim() : '';
      var rowTopic = row[3] ? row[3].toString().trim() : '';
      if (rowId === studentId.toString().trim() && rowTopic !== '') {
        progMap[rowTopic] = {
          summary: row[35] ? row[35].toString().trim() : '',
          pct: formatPercentage(row[37])
        };
      }
    });
  }

  // Read existing rows from row 2 onwards in memory
  var lastRow = sheet.getLastRow();
  var existingRows = [];
  if (lastRow >= 2) {
    existingRows = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  }

  var rowMap = {};
  existingRows.forEach(function(row, idx) {
    if (row[0] && row[2]) {
      var key = row[0].toString().trim() + '||' + row[2].toString().trim();
      rowMap[key] = idx;
    }
  });

  lessonNames.forEach(function(lessonName) {
    var c = corrMap[lessonName] || { sentStatus: 'لم', picGrade: '-', audioGrade: '-', finalGrade: '0%', hasFocus: false };
    var w = wordsMap[lessonName] || { summary: '-', pct: '0%' };
    var ws = waslMap[lessonName] || { summary: '-', pct: '0%' };
    var p = progMap[lessonName] || { summary: '-', pct: '0%' };

    var sentStatus = c.sentStatus; // 'تم' or 'لم'
    var picGrade = c.picGrade;
    var audioGrade = c.audioGrade;
    var focusStatus = c.hasFocus ? 'تم' : 'لم';
    var finalGrade = c.finalGrade;
    var focusStars = getTenStars(finalGrade);

    var wordsSummary = (w.summary && w.summary !== '-' && w.summary !== 'لم يبدأ') ? w.summary : '-';
    var wordsStatus = (wordsSummary !== '-') ? 'تم' : 'لم';
    var wordsPct = w.pct || '0%';
    var wordsStars = getTenStars(wordsPct);

    var waslSummary = (ws.summary && ws.summary !== '-' && ws.summary !== 'لم يبدأ') ? ws.summary : '-';
    var waslStatus = (waslSummary !== '-') ? 'تم' : 'لم';
    var waslPct = ws.pct || '0%';
    var waslStars = getTenStars(waslPct);

    var writingSummary = (p.summary && p.summary !== '-' && p.summary !== '0/0' && p.summary !== 'لم يبدأ') ? p.summary : '-';
    var writingStatus = (writingSummary !== '-') ? 'تم' : 'لم';
    var writingPct = p.pct || '0%';
    var writingStars = getTenStars(writingPct);

    // Topic completion status calculates based on submission (Sent + Words + Wasl + Writing)
    var isTopicCompleted = (sentStatus === 'تم' && wordsStatus === 'تم' && waslStatus === 'تم' && writingStatus === 'تم');
    var topicStatus = isTopicCompleted ? 'اكتمل' : 'لم يكتمل';

    var rowKey = studentId.toString().trim() + '||' + lessonName;

    var rowValues = [
      studentId,             // Col 1
      studentName,           // Col 2
      lessonName,            // Col 3
      sentStatus,            // Col 4
      picGrade,              // Col 5
      audioGrade,            // Col 6
      focusStatus,           // Col 7
      finalGrade,            // Col 8
      focusStars,            // Col 9
      wordsStatus,           // Col 10
      wordsSummary,          // Col 11
      wordsPct,              // Col 12
      wordsStars,            // Col 13
      waslStatus,            // Col 14
      waslSummary,           // Col 15
      waslPct,               // Col 16
      waslStars,             // Col 17
      writingStatus,         // Col 18
      writingSummary,        // Col 19
      writingPct,            // Col 20
      writingStars,          // Col 21
      topicStatus            // Col 22
    ];

    if (rowMap[rowKey] !== undefined) {
      existingRows[rowMap[rowKey]] = rowValues;
    } else {
      existingRows.push(rowValues);
      rowMap[rowKey] = existingRows.length - 1;
    }
  });

  // Single bulk write operation for all rows!
  if (existingRows.length > 0) {
    sheet.getRange(2, 1, existingRows.length, 22).setValues(existingRows);
  }

  return { success: true };
}

function getStudentsEvaluations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
  if (!sheet) {
    // Call sync with dummy to create sheet and headers
    syncConsolidatedEvaluations('dummy', 'dummy');
    sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
  }
  
  if (sheet && sheet.getMaxColumns() < 22) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 22 - sheet.getMaxColumns());
  }

  // 1. Get all active students from Settings sheet Z:AA
  var settingsSheet = getSheetByNameFlexible(ss, 'Settings');
  var activeStudents = [];
  if (settingsSheet) {
    var lastSettingsRow = settingsSheet.getLastRow();
    if (lastSettingsRow >= 2) {
      var usersData = settingsSheet.getRange("Z2:AA" + lastSettingsRow).getValues();
      for (var i = 0; i < usersData.length; i++) {
        var sName = usersData[i][0] ? usersData[i][0].toString().trim() : '';
        var sId = usersData[i][1] ? usersData[i][1].toString().trim() : '';
        if (sId !== '' && sName !== '' && sId !== 'DEFAULT_STUDENT') {
          activeStudents.push({ id: sId, name: sName });
        }
      }
    }
  }

  // 2. See who is already in ConsolidatedEvaluations
  var lastRow = sheet ? sheet.getLastRow() : 0;
  var studentsInEvaluations = {};
  if (sheet && lastRow >= 2) {
    var existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    existingIds.forEach(function(row) {
      if (row[0]) {
        studentsInEvaluations[row[0].toString().trim()] = true;
      }
    });
  }

  // 3. For any active student NOT in ConsolidatedEvaluations, run a sync!
  var syncedAny = false;
  activeStudents.forEach(function(student) {
    if (!studentsInEvaluations[student.id] && student.id !== 'dummy') {
      try {
        syncConsolidatedEvaluations(student.id, student.name);
        syncedAny = true;
      } catch (e) {
        Logger.log('Error syncing student ' + student.id + ': ' + e.message);
      }
    }
  });

  if (syncedAny) {
    SpreadsheetApp.flush();
    sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
    if (sheet && sheet.getMaxColumns() < 22) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 22 - sheet.getMaxColumns());
    }
    lastRow = sheet ? sheet.getLastRow() : 0;
  }

  var DEFAULT_HEADERS = [
    'رقم الطالب',
    'اسم الطالب',
    'موضوع الدرس',
    'حالة الدروس المرسلة',
    'درجات الصورة',
    'درجات الصوت',
    'حالة درجات التركيز',
    'الدرجة النهائية',
    'التقييم بالنجوم',
    'حالة تمارين الكلمات',
    'تفاصيل الكلمات',
    'النسبة المئوية للكلمات',
    'التقييم بالنجوم للكلمات',
    'حالة تمارين الوصل',
    'تفاصيل الوصل',
    'النسبة المئوية للوصل',
    'التقييم بالنجوم للوصل',
    'حالة تمارين الكتابة',
    'تفاصيل الكتابة',
    'النسبة المئوية للكتابة',
    'التقييم بالنجوم للكتابة',
    'حالة الموضوع'
  ];

  if (!sheet || lastRow < 2) {
    return { success: true, headers: DEFAULT_HEADERS, data: [] };
  }

  var headers = sheet.getRange(1, 1, 1, 22).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  
  // Filter out dummy data if any
  data = data.filter(function(row) {
    return row[0].toString().trim() !== 'dummy';
  });

  return { success: true, headers: headers, data: data };
}

function getStudentConsolidatedEvaluation(studentId, studentName) {
  try {
    syncConsolidatedEvaluations(studentId, studentName);
  } catch (e) {}
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
  if (!sheet) return { success: false, data: [] };
  if (sheet.getMaxColumns() < 22) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 22 - sheet.getMaxColumns());
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: true, data: [] };
  var data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  var filtered = data.filter(function(row) {
    return row[0].toString().trim() === studentId.toString().trim() && row[0].toString().trim() !== 'dummy';
  });
  
  return { success: true, data: filtered };
}

function generateStudentConsolidatedPDF(studentId, studentName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    syncConsolidatedEvaluations(studentId, studentName);
  } catch (e) {}
  
  var sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
  if (!sheet) return { success: false, message: 'لا توجد ورقة بيانات تقييم' };
  if (sheet.getMaxColumns() < 22) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 22 - sheet.getMaxColumns());
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: false, message: 'لا توجد بيانات مسجلة للطالب' };
  
  var data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  var studentRecords = data.filter(function(row) {
    return row[0].toString().trim() === studentId.toString().trim();
  });
  
  if (studentRecords.length === 0) {
    return { success: false, message: 'لم يتم العثور على أي نتائج مسجلة لهذا الطالب' };
  }
  
  var issueDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd');

  var htmlContent = '<html><head><meta charset="UTF-8">';
  htmlContent += '<style>';
  htmlContent += 'body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; padding: 20px; color: #1e293b; background-color: #ffffff; }';
  htmlContent += '.header { text-align: center; border-bottom: 3px double #cbd5e1; padding-bottom: 15px; margin-bottom: 20px; }';
  htmlContent += '.header h1 { color: #0f172a; font-size: 24px; margin: 0 0 6px 0; font-weight: 800; }';
  htmlContent += '.header p { color: #64748b; font-size: 14px; margin: 0; }';
  htmlContent += '.info-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 25px; }';
  htmlContent += '.info-box table { width: 100%; border-collapse: collapse; }';
  htmlContent += '.info-box td { padding: 6px; font-size: 13px; color: #334155; }';
  htmlContent += '.info-box td.label { font-weight: bold; color: #0f172a; width: 140px; }';
  htmlContent += '.section-header { font-size: 16px; font-weight: bold; color: #1e1b4b; background-color: #f1f5f9; padding: 10px 14px; border-radius: 8px; margin-bottom: 15px; border-right: 5px solid #4f46e5; }';
  htmlContent += 'table.results-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }';
  htmlContent += 'table.results-table th { background-color: #0f172a; color: #ffffff; padding: 10px 6px; font-size: 11px; font-weight: bold; text-align: center; border: 1px solid #0f172a; }';
  htmlContent += 'table.results-table td { padding: 9px 6px; font-size: 11px; text-align: center; border: 1px solid #cbd5e1; color: #334155; }';
  htmlContent += 'table.results-table tr:nth-child(even) { background-color: #f8fafc; }';
  htmlContent += '.badge-success { color: #15803d; font-weight: bold; background-color: #f0fdf4; padding: 3px 8px; border-radius: 6px; border: 1px solid #bbf7d0; display: inline-block; }';
  htmlContent += '.badge-fail { color: #b91c1c; font-weight: bold; background-color: #fef2f2; padding: 3px 8px; border-radius: 6px; border: 1px solid #fecaca; display: inline-block; }';
  htmlContent += '.page-break { page-break-before: always; }';
  htmlContent += '.footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }';
  htmlContent += '.notes-card { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; color: #92400e; margin-top: 15px; }';
  htmlContent += '.notes-card-success { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; color: #166534; margin-top: 15px; }';
  htmlContent += '</style>';
  htmlContent += '</head><body>';
  
  // Header Block template helper
  function buildMiniHeader() {
    var h = '<div class="header">';
    h += '<h1>التقرير التقييمي الشامل والدرجات للمرحلة الدراسية</h1>';
    h += '<p>منصة اللغة العربية التفاعلية للأطفال</p>';
    h += '</div>';
    h += '<div class="info-box"><table>';
    h += '<tr><td class="label">اسم الطالب البطل:</td><td>' + studentName + '</td><td class="label">تاريخ الإصدار:</td><td>' + issueDate + '</td></tr>';
    h += '<tr><td class="label">رقم الطالب (ID):</td><td>' + studentId + '</td><td class="label">عدد الدروس:</td><td>' + studentRecords.length + ' درس</td></tr>';
    h += '</table></div>';
    return h;
  }

  function formatPercentage(val) {
    if (val === null || val === undefined || val === '') return '0%';
    var str = val.toString().trim();
    if (str === '-' || str === '0') return '0%';
    if (str.indexOf('%') !== -1) {
      var parsedPct = parseFloat(str.replace('%', '').trim());
      if (!isNaN(parsedPct)) return Math.round(parsedPct) + '%';
      return str;
    }
    var num = parseFloat(str);
    if (isNaN(num)) return str;
    if (num > 0 && num <= 1) {
      num = Math.round(num * 100);
    } else {
      num = Math.round(num);
    }
    return num + '%';
  }

  // --- Page 1: جدول الدروس المرسلة ---
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">1. جدول الدروس المرسلة</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع</th>';
  htmlContent += '<th>درجات الصورة</th>';
  htmlContent += '<th>درجات الصوت</th>';
  htmlContent += '</tr></thead><tbody>';
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var pic = row[4] || '-';
    var audio = row[5] || '-';
    htmlContent += '<tr>';
    htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:40%;">' + topic + '</td>';
    htmlContent += '<td>' + pic + '</td>';
    htmlContent += '<td>' + audio + '</td>';
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table>';

  // --- Page 2: جدول التركيز في الدروس ---
  htmlContent += '<div class="page-break"></div>';
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">2. جدول التركيز في الدروس</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع</th>';
  htmlContent += '<th>الدرجة النهائية</th>';
  htmlContent += '<th>تقييم النجوم</th>';
  htmlContent += '</tr></thead><tbody>';
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var finalGrade = formatPercentage(row[7]);
    var stars = row[8] || '☆☆☆☆☆☆☆☆☆☆';
    htmlContent += '<tr>';
    htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:40%;">' + topic + '</td>';
    htmlContent += '<td style="font-weight:bold; color:#4f46e5;">' + finalGrade + '</td>';
    htmlContent += '<td style="letter-spacing:1px; font-size:11px;">' + stars + '</td>';
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table>';

  // --- Page 3: جدول تمارين الكلمات ---
  htmlContent += '<div class="page-break"></div>';
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">3. جدول تمارين الكلمات</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع</th>';
  htmlContent += '<th>تفاصيل</th>';
  htmlContent += '<th>الدرجة النهائية</th>';
  htmlContent += '<th>تقييم النجوم</th>';
  htmlContent += '</tr></thead><tbody>';
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var details = row[10] || '-';
    var finalGrade = formatPercentage(row[11]);
    var stars = row[12] || '☆☆☆☆☆☆☆☆☆☆';
    htmlContent += '<tr>';
    htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:30%;">' + topic + '</td>';
    htmlContent += '<td>' + details + '</td>';
    htmlContent += '<td style="font-weight:bold; color:#4f46e5;">' + finalGrade + '</td>';
    htmlContent += '<td style="letter-spacing:1px; font-size:11px;">' + stars + '</td>';
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table>';

  // --- Page 4: جدول تمارين الوصل ---
  htmlContent += '<div class="page-break"></div>';
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">4. جدول تمارين الوصل</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع</th>';
  htmlContent += '<th>تفاصيل</th>';
  htmlContent += '<th>الدرجة النهائية</th>';
  htmlContent += '<th>تقييم النجوم</th>';
  htmlContent += '</tr></thead><tbody>';
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var details = row[14] || '-';
    var finalGrade = formatPercentage(row[15]);
    var stars = row[16] || '☆☆☆☆☆☆☆☆☆☆';
    htmlContent += '<tr>';
    htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:30%;">' + topic + '</td>';
    htmlContent += '<td>' + details + '</td>';
    htmlContent += '<td style="font-weight:bold; color:#4f46e5;">' + finalGrade + '</td>';
    htmlContent += '<td style="letter-spacing:1px; font-size:11px;">' + stars + '</td>';
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table>';

  // --- Page 5: جدول تمارين الكتابة ---
  htmlContent += '<div class="page-break"></div>';
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">5. جدول تمارين الكتابة</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع</th>';
  htmlContent += '<th>تفاصيل</th>';
  htmlContent += '<th>الدرجة النهائية</th>';
  htmlContent += '<th>تقييم النجوم</th>';
  htmlContent += '</tr></thead><tbody>';
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var details = row[18] || '-';
    var finalGrade = formatPercentage(row[19]);
    var stars = row[20] || '☆☆☆☆☆☆☆☆☆☆';
    htmlContent += '<tr>';
    htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:30%;">' + topic + '</td>';
    htmlContent += '<td>' + details + '</td>';
    htmlContent += '<td style="font-weight:bold; color:#4f46e5;">' + finalGrade + '</td>';
    htmlContent += '<td style="letter-spacing:1px; font-size:11px;">' + stars + '</td>';
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table>';

  // --- Page 6: قسم التوصيات والملاحظات ---
  htmlContent += '<div class="page-break"></div>';
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">6. قسم التوصيات والملاحظات</div>';

  var incompleteList = [];
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var sent = row[3];
    var words = row[9];
    var wasl = row[13];
    var writing = row[17];
    var topicStatus = row[21];
    if (topicStatus !== 'اكتمل' || sent !== 'تم' || words !== 'تم' || wasl !== 'تم' || writing !== 'تم') {
      var missingParts = [];
      if (sent !== 'تم') missingParts.push('إرسال الواجب');
      if (words !== 'تم') missingParts.push('تمارين الكلمات');
      if (wasl !== 'تم') missingParts.push('تمارين الوصل');
      if (writing !== 'تم') missingParts.push('تمارين الكتابة');
      incompleteList.push({
        topic: topic,
        missingStr: missingParts.join(' ، ')
      });
    }
  });

  if (incompleteList.length > 0) {
    htmlContent += '<div class="notes-card">';
    htmlContent += '<h3 style="margin-top:0; color:#92400e; font-size:15px; font-weight:bold;">⚠️ تنبيه: توجد دروس بحاجة لإكمال تسليم الواجبات أو التمارين التفاعلية:</h3>';
    htmlContent += '<ul style="margin:10px 0 0 0; padding-right:20px; font-size:13px; line-height:1.8;">';
    incompleteList.forEach(function(item) {
      htmlContent += '<li><strong>درس (' + item.topic + '):</strong> يرجى إكمال [' + item.missingStr + '].</li>';
    });
    htmlContent += '</ul></div>';
  } else {
    htmlContent += '<div class="notes-card-success">';
    htmlContent += '<h3 style="margin-top:0; color:#166534; font-size:15px; font-weight:bold;">🎉 تهانينا المتميزة!</h3>';
    htmlContent += '<p style="margin:5px 0 0 0; font-size:13px; line-height:1.6;">لقد قام الطالب البطل بإكمال جميع الواجبات والتمارين لكافة الدروس المقررة بنجاح وبصورة مكتملة 100%.</p>';
    htmlContent += '</div>';
  }

  htmlContent += '<div class="footer">';
  htmlContent += 'تم إنتاج هذا الملف التقييمي تلقائياً بواسطة منصة اللغة العربية للأطفال، وهو معتمد رسمياً لدى إدارة المتابعة.';
  htmlContent += '</div>';
  htmlContent += '</body></html>';
  
  var htmlBlob = HtmlService.createHtmlOutput(htmlContent).getBlob();
  var pdfBlob = htmlBlob.getAs('application/pdf').setName('تقرير_تقييم_شامل_' + studentName.replace(/\s+/g, '_') + '_' + studentId + '.pdf');
  
  var settings = getSettings();
  var PDF_FOLDER_ID = settings['pdf_folder_student'] || '1EVR179MPDGGC2-2tdjtfhiX-7doE7cXH';
  var folder;
  try {
    folder = DriveApp.getFolderById(PDF_FOLDER_ID);
  } catch (e) {
    folder = DriveApp.getRootFolder();
  }
  var pdfFile = folder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var pdfUrl = pdfFile.getUrl();
  
  var pdfSheet = ss.getSheetByName('PDF') || ss.insertSheet('PDF');
  var pdfData = pdfSheet.getDataRange().getValues();
  var foundRow = -1;
  for (var i = 1; i < pdfData.length; i++) {
    if (pdfData[i][1] && pdfData[i][1].toString().trim() === studentId.toString().trim()) {
      foundRow = i + 1;
      break;
    }
  }
  
  var creationDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss');
  if (foundRow !== -1) {
    pdfSheet.getRange(foundRow, 5).setValue(pdfUrl);
    pdfSheet.getRange(foundRow, 6).setValue(creationDate);
  } else {
    pdfSheet.appendRow([studentName, studentId, '', '', pdfUrl, creationDate]);
  }
  
  return { success: true, pdfUrl: pdfUrl };
}
`;

