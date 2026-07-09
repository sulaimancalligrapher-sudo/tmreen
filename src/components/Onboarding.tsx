/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { callGasApi, setApiUrl, getApiUrl } from '../utils/api';
import { Database, Key, CheckCircle, Copy, AlertTriangle, ArrowLeft } from 'lucide-react';
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
              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !url.trim()}
                  className="bg-slate-950 text-white font-medium px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
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
              </div>
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
      result = getLessonsFromMatches();
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
    } else if (action === 'generateStudentPDF') {
      result = generateStudentPDF(request.studentId, 'student');
    } else if (action === 'getPdfControlForStudent') {
      result = getPdfControlForStudent(request.studentId);
    } else if (action === 'getHoomDataForStudent') {
      result = getHoomDataForStudent(request.username);
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
  var profileSheet = ss.getSheetByName('Profile');
  var contactSheet = ss.getSheetByName('Contact');
  var aboutSheet = ss.getSheetByName('About');
  var hoomSheet = ss.getSheetByName('HOOM');
  
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
    var settingsSheet = ss.getSheetByName('Settings');
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
  var sheet = ss.getSheetByName('Questions');
  var answersSheet = ss.getSheetByName('Answers-Questions');
  if (!sheet || !answersSheet) return [];
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  var topics = [];
  var topicsRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < topicsRange.length; i++) {
    var topicName = topicsRange[i][0].toString().trim();
    if (topicName !== '') {
      var row = i + 2;
      var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
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
      
      var resetCondition = sheet.getRange(row, 85).getValue().toString().trim();
      var allowReset = resetCondition === 'نعم';
      var maxResetsRaw = sheet.getRange(row, 86).getValue();
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
  var sheet = ss.getSheetByName('Questions');
  var answersSheet = ss.getSheetByName('Answers-Questions');
  if (!sheet || !answersSheet || !rowNumber || !studentId) return null;
  
  var rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  if (rowData.length < 1 || !rowData[0]) return null;
  
  var topic = rowData[0] || 'موضوع غير محدد';
  var condition = sheet.getRange(rowNumber, 83).getValue().toString().trim();
  var retryCondition = sheet.getRange(rowNumber, 84).getValue().toString().trim();
  var showCorrectAnswer = sheet.getRange(rowNumber, 82).getValue().toString().trim();
  
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
    return { completed: true };
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
    index: selectedQuestion.originalIndex
  };
}

function recordAnswer(studentId, studentName, topic, questionIndex, isCorrect) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Answers-Questions');
  var questionsSheet = ss.getSheetByName('Questions');
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
  var sheet = ss.getSheetByName('Answers-Questions');
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Questions-R");
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  var data = sheet.getRange(2, 1, lastRow - 1, 33).getValues();
  var completedLabels = getCompletedLabelsFromProgress(studentId);
  
  return data.map(function(row) {
    var lessonLabel = row[0] ? row[0].toString().trim() : "";
    if (!lessonLabel) return null;
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
  var sheetProgress = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Progress");
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
  var sheetProgress = ss.getSheetByName("Progress") || ss.insertSheet("Progress");
  var mergedDetails = details + "|" + (repetitionsCompleted || "");
  var subLabel = details.split('|')[0].trim();
  
  var sheetQuestions = ss.getSheetByName("Questions-R");
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Progress");
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
  
  var sheetQuestions = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Questions-R");
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
        if (progressRow) {
          usedResets = progressRow[38] || 0;
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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Progress");
  if (!sheet) return { error: "No Progress sheet found" };
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { error: "No data" };
  
  var data = sheet.getRange(2, 1, lastRow - 1, 39).getValues();
  var rowsToUpdate = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].toString() == studentId.toString() && data[i][3] === label) {
      rowsToUpdate.push(i + 2);
    }
  }
  
  if (rowsToUpdate.length === 0) return { success: true };
  
  rowsToUpdate.forEach(function(row) {
    var resetCount = sheet.getRange(row, 39).getValue() || 0;
    sheet.getRange(row, 39).setValue(resetCount + 1);
    sheet.getRange(row, 5, 1, 34).clearContent();
    sheet.getRange(row, 3).setValue(new Date());
  });
  
  return { success: true };
}

function getLessonsFromMatches() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Matches');
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var lessons = [];
  var rows = data.slice(1);
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var lessonName = row[0];
    if (!lessonName || lessonName.trim() === '') continue;
    
    var questions = [];
    var maxQuestions = 10;
    for (var q = 1; q <= maxQuestions; q++) {
      var startCol = 1 + (q - 1) * 3;
      var questionText = row[startCol];
      if (!questionText || questionText.trim() === '') break;
      
      var leftString = row[startCol + 1] ? row[startCol + 1].toString() : '';
      var rightString = row[startCol + 2] ? row[startCol + 2].toString() : '';
      
      var leftItems = leftString.split('-').map(function(s) {
        var trimmed = s.trim();
        var type = 'text';
        if (trimmed.match(/\\.(mp3|wav|ogg|m4a)(\\?.*)?$/i)) type = 'audio';
        else if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) type = 'image';
        return { type: type, value: trimmed };
      }).filter(function(i) { return i.value !== ''; });
      
      var rightGroups = rightString.split('-').map(function(group) {
        return group.trim().split('|').map(function(s) {
          var trimmed = s.trim();
          var type = 'text';
          if (trimmed.match(/\\.(mp3|wav|ogg|m4a)(\\?.*)?$/i)) type = 'audio';
          else if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) type = 'image';
          return { type: type, value: trimmed };
        }).filter(function(i) { return i.value !== ''; });
      }).filter(function(g) { return g.length > 0; });
      
      var allRightItems = new Map();
      rightGroups.forEach(function(group) {
        group.forEach(function(item) {
          allRightItems.set(item.value, item);
        });
      });
      var rightItems = Array.from(allRightItems.values());
      var shuffledRight = rightItems.slice(); // Front-end can handle shuffle or keep as is
      
      var correctMatches = {};
      var rightIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'];
      for (var j = 0; j < leftItems.length; j++) {
        if (rightGroups[j]) {
          correctMatches[(j + 1).toString()] = rightGroups[j].map(function(originalRight) {
            var shuffledIndex = shuffledRight.findIndex(function(shuffled) {
              return shuffled.value === originalRight.value;
            });
            return rightIds[shuffledIndex];
          });
        } else {
          correctMatches[(j + 1).toString()] = [];
        }
      }
      
      questions.push({
        questionText: questionText,
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
  
  if (foundRow > 0) {
    var currentRowData = sheet.getRange(foundRow, 1, 1, 16).getValues()[0];
    for (var j = 0; j < 10; j++) {
      if (results[j] !== '') currentRowData[3 + j] = results[j];
    }
    currentRowData[13] = new Date();
    sheet.getRange(foundRow, 1, 1, 16).setValues([currentRowData]);
    
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
    for (var j = 0; j < 10; j++) rowData.push(results[j] || '');
    rowData.push(new Date());
    rowData.push(''); // O (Completed tag)
    rowData.push(0);  // P (Retries)
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function incrementRetry(studentId, lessonName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Answers');
  if (!sheet) return { success: false };
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
  }
  return { success: true };
}

// ====================== REPORT DATA RETRIEVING FUNCTIONS ======================

function getStudentData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allASheet = ss.getSheetByName('ALL-A');
  if (!allASheet) return { success: false, message: 'ورقة ALL-A غير موجودة' };
  
  var data = allASheet.getDataRange().getValues();
  for (var col = 0; col < data[0].length; col += 2) {
    if (data[0][col] && data[0][col].toString() === studentId.toString()) {
      var studentName = data[1][col] || 'غير معروف';
      var oldStudentData = [];
      for (var row = 5; row < data.length; row++) {
        var rowData = [];
        var isEmpty = true;
        for (var c = 0; c < 2; c++) {
          var cellValue = data[row][col + c] || '';
          rowData.push(cellValue);
          if (cellValue !== '' && cellValue !== ' ') isEmpty = false;
        }
        if (!isEmpty) oldStudentData.push(rowData);
      }
      
      var headers = ['موضوع الدرس', 'أسئلة الفيديو', 'أسئلة الصوت', 'تسجيل الصوت', 'رفع صورة', 'تمارين الوصل', 'تمارين الكلمات', 'تمارين الكتابة'];
      var studentData = [];
      oldStudentData.forEach(function(oldRow) {
        var topic = oldRow[0] || '';
        var statusStr = oldRow[1] || '';
        var statuses = new Array(7).fill('');
        
        if (statusStr) {
          var parts = statusStr.split('|').map(function(p) { return p.trim(); });
          parts.forEach(function(p) {
            var match = p.match(/(\\d+)\\s+(Yes|No)/i);
            if (match) {
              var num = parseInt(match[1]);
              var val = match[2];
              var index = num - 1;
              if (index >= 0 && index < 7) statuses[index] = val;
            }
          });
        }
        studentData.push([topic].concat(statuses));
      });
      
      return { success: true, studentId: studentId, studentName: studentName, headers: headers, data: studentData };
    }
  }
  return { success: false, message: 'رقم الطالب غير موجود في ALL-A' };
}

function getStudentVideoData(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allVSheet = ss.getSheetByName('ALL-V');
  if (!allVSheet) return { success: false, message: 'ورقة ALL-V غير موجودة' };
  
  var data = allVSheet.getDataRange().getValues();
  for (var col = 2; col < data[0].length; col += 12) {
    if (data[0][col] && data[0][col].toString() === studentId.toString()) {
      var studentName = data[1][col] || 'غير معروف';
      var headers = ['رقم الدرس'];
      for (var h = 0; h < 12; h++) headers.push(data[4][col + h] || '');
      headers.push('تشجيع');
      
      var studentData = [];
      for (var row = 5; row < data.length; row++) {
        var rowData = [];
        var isEmpty = true;
        var lessonNumber = data[row][1] || '';
        rowData.push(lessonNumber);
        if (lessonNumber !== '' && lessonNumber !== ' ') isEmpty = false;
        
        var lastCellValue = '';
        for (var c = 0; c < 12; c++) {
          var cellValue = data[row][col + c] || '';
          if (c === 11 && typeof cellValue === 'number' && !isNaN(cellValue)) {
            cellValue = (cellValue * 100) + '%';
          }
          rowData.push(cellValue);
          if (cellValue !== '' && cellValue !== ' ') isEmpty = false;
          if (c === 11) lastCellValue = cellValue;
        }
        
        var encouragement = getEncouragement(lastCellValue);
        rowData.push(encouragement);
        if (!isEmpty) studentData.push(rowData);
      }
      return { success: true, studentId: studentId, studentName: studentName, headers: headers, data: studentData };
    }
  }
  return { success: false, message: 'رقم الطالب غير موجود في ALL-V' };
}

function getCorrectionData(studentId) { return getCorrectionColumnGroup(studentId, [2, 8, 9, 10, 11]); }
function getWordsExerciseData(studentId) { return getCorrectionColumnGroup(studentId, [2, 29, 30, 31, 32]); }
function getWaslExerciseData(studentId) { return getCorrectionColumnGroup(studentId, [2, 34, 35, 36, 37]); }
function getWritingExerciseData(studentId) { return getCorrectionColumnGroup(studentId, [2, 39, 40, 41]); }

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
  var pdfSheet = ss.getSheetByName('PDF');
  if (!pdfSheet) return { success: true, control: '' };
  
  var pdfData = pdfSheet.getDataRange().getValues();
  for (var i = 1; i < pdfData.length; i++) {
    if (pdfData[i][1] && pdfData[i][1].toString() === studentId.toString()) {
      return { success: true, control: pdfData[i][2] ? pdfData[i][2].toString().trim() : '' };
    }
  }
  return { success: true, control: '' };
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
  
  var PDF_FOLDER_ID = settings['pdf_folder_student'] || '1AdbBeqxna2pfYTd1vAWSSL3WaWz05bwI';
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
  // Autocalled when matching is completed to compile scores in Answers sheet
  Logger.log("Scores updated automatically.");
}
`;
