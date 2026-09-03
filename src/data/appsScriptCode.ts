export const APPS_SCRIPT_CODE = `/**
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
    } else if (action === 'getStudentFullReportData') {
      result = getStudentFullReportData(request.studentId, request.studentName);
    } else if (action === 'syncConsolidatedEvaluations') {
      result = syncConsolidatedEvaluations(request.studentId, request.studentName);
    } else if (action === 'getStudentsEvaluations') {
      result = getStudentsEvaluations();
    } else if (action === 'getStudentConsolidatedEvaluation') {
      result = getStudentConsolidatedEvaluation(request.studentId, request.studentName);
    } else if (action === 'generateStudentConsolidatedPDF') {
      result = generateStudentConsolidatedPDF(request.studentId, request.studentName);
    } else if (action === 'generateStudentCertificatePDF') {
      result = generateStudentCertificatePDF(request.studentId, request.studentName);
    } else if (action === 'generateStudentBothPDFs') {
      result = generateStudentBothPDFs(request.studentId, request.studentName);
    } else if (action === 'getPdfSettings') {
      result = getPdfSettings();
    } else if (action === 'savePdfSettings') {
      result = savePdfSettings(request.pdfSettings);
    } else if (action === 'generateStudentPDF') {
      result = generateStudentPDF(request.studentId, 'student');
    } else if (action === 'getPdfControlForStudent') {
      result = getPdfControlForStudent(request.studentId);
    } else if (action === 'getHomeContent') {
      result = getHomeContent(request.username, request.isAdmin);
    } else if (action === 'saveHomeContent') {
      result = saveHomeContent(request.items, request.item, request.actionType, request.deletedIndex);
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
    } else if (action === 'getStudentSchedule') {
      result = getStudentSchedule(request.studentId);
    } else if (action === 'saveStudentCustomTime') {
      result = saveStudentCustomTime(request.studentId, request.customStartTime, request.customSessionDuration, request.customDurationType, request.customPreventEarlyEntry, request.customForceLogin);
    } else if (action === 'deleteStudentCustomTime') {
      result = deleteStudentCustomTime(request.studentId);
    } else if (action === 'getAttendanceSettings') {
      result = getAttendanceSettings();
    } else if (action === 'saveAttendanceSettings') {
      result = saveAttendanceSettings(request.settings);
    } else if (action === 'getLiveMonitoringData') {
      result = getLiveMonitoringData();
    } else if (action === 'logStudentPresence') {
      result = logStudentPresence(request.studentId, request.studentName, request.actionType);
    } else if (action === 'autoCheckInactivityTimeout') {
      result = autoCheckInactivityTimeout();
    } else if (action === 'processTelegramAlerts') {
      result = processScheduledTelegramNotifications();
    } else if (action === 'recordTelegramUser') {
      result = recordTelegramUser(request.studentName, request.studentId, request.telegramChatId, request.preferredLanguage, request.linkDate);
    } else if (action === 'syncAllTelegramUsers') {
      result = syncAllTelegramUsers(request.usersList);
    } else if (action === 'getTelegramUsers') {
      result = getTelegramUsers();
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
  var homeContentSheet = getSheetByNameFlexible(ss, 'Home_Content');
  
  var profileData = profileSheet ? profileSheet.getDataRange().getValues() : [];
  var contactData = contactSheet ? contactSheet.getDataRange().getValues() : [];
  var aboutData = aboutSheet ? aboutSheet.getDataRange().getValues() : [];
  var homeContentData = homeContentSheet ? homeContentSheet.getDataRange().getValues() : [];
  
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
    homeContent: homeContentData.slice(1),
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
    var tgInfo = { telegramChatId: '', preferredLanguage: 'ar' };
    try {
      tgInfo = getStudentTelegramFromDedicatedSheet(ss, studentId, studentName) || tgInfo;
    } catch (tgErr) {}
    
    var studentSched = null;
    try {
      studentSched = getStudentSchedule(studentId);
    } catch (schedErr) {}
    
    return {
      success: true,
      name: studentName,
      id: studentId,
      telegramChatId: tgInfo.telegramChatId || (studentSched && studentSched.telegramChatId) || '',
      preferredLanguage: tgInfo.preferredLanguage || (studentSched && studentSched.preferredLanguage) || 'ar',
      schedule: studentSched || null
    };
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
  try {
    syncConsolidatedEvaluations(studentId, studentName);
  } catch (err) {}
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
  
  try {
    syncConsolidatedEvaluations(studentId, studentName);
  } catch (err) {}
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
  try {
    syncConsolidatedEvaluations(studentId, studentName);
  } catch (err) {}
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
          var teacherNotes = corrData[r][20] ? corrData[r][20].toString().trim() : '';
          var picGrade = corrData[r][19] ? corrData[r][19].toString().trim() : '';
          var audioGrade = corrData[r][28] ? corrData[r][28].toString().trim() : '';
          var corrDate = corrData[r][26] ? corrData[r][26].toString().trim() : '';
          var isDone = (teacherNotes !== '' || picGrade !== '' || audioGrade !== '' || corrDate !== '');
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
    'رابط صورة الواجب',
    'رابط تسجيل الصوت',
    'درجات صورة الواجب',
    'درجات التسجيل الصوتي',
    'ملاحظات وتصحيح المعلم',
    'رابط صورة توضيحية',
    'تاريخ التصحيح',
    'تقييم درجة الصورة ⭐',
    'تقييم درجة الصوت ⭐'
  ];
  
  // Columns map to indexes in correction:
  // C (2): موضوع الدرس
  // E (4): رابط صورة الواجب
  // G (6): رابط تسجيل الصوت الخاص بالطالب
  // T (19): درجات صورة الواجب
  // AC (28): درجات التسجيل الصوتي
  // U (20): ملاحظات وتصحيح المعلم
  // V (21): رابط صورة توضيحية من المعلم
  // AA (26): تاريخ التصحيح
  var cols = [2, 4, 6, 19, 28, 20, 21, 26];
  
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

      var imgGradeVal = data[row][19];
      var audGradeVal = data[row][28];
      var imgEval = formatGradeToStars(imgGradeVal, 'image');
      var audEval = formatGradeToStars(audGradeVal, 'audio');

      rowData.push(imgEval);
      rowData.push(audEval);

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
  var certPdfUrl = '';
  var control = '';

  var pdfSheet = ss.getSheetByName('PDF');
  if (pdfSheet) {
    var pdfData = pdfSheet.getDataRange().getValues();
    for (var i = 1; i < pdfData.length; i++) {
      if (pdfData[i][1] && pdfData[i][1].toString().trim() === studentId.toString().trim()) {
        control = pdfData[i][2] ? pdfData[i][2].toString().trim() : '';
        certPdfUrl = pdfData[i][3] ? pdfData[i][3].toString().trim() : '';
        pdfUrl = pdfData[i][4] ? pdfData[i][4].toString().trim() : '';
        break;
      }
    }
  }

  return { 
    success: true, 
    control: control,
    pdfUrl: pdfUrl,
    certPdfUrl: certPdfUrl
  };
}

function getHomeContent(username, isAdmin) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Home_Content');
  if (!sheet) {
    try {
      sheet = ss.insertSheet('Home_Content');
      sheet.appendRow(['Type', 'Title', 'Content', 'Target_Student', 'Status']);
      sheet.appendRow(['إعلان', 'أهلاً بك في منصتنا التعليمية', 'مرحباً بجميع الطلاب المتميزين في هذا الفصل الدراسي', 'ALL', 'active']);
    } catch(e) {
      return [];
    }
  }

  var data = sheet.getDataRange().getValues();
  if (!data || data.length <= 1) return [];

  var result = [];
  var cleanUsername = username ? username.toString().trim().toLowerCase() : '';

  for (var i = 1; i < data.length; i++) {
    var rawType = data[i][0] ? data[i][0].toString().trim() : '';
    var title = data[i][1] ? data[i][1].toString().trim() : '';
    var content = data[i][2] ? data[i][2].toString().trim() : '';
    var targetStudent = data[i][3] ? data[i][3].toString().trim() : 'ALL';
    var status = data[i][4] ? data[i][4].toString().trim().toLowerCase() : 'active';

    if (!rawType && !title && !content) continue;

    // Normalize type string for student API output
    var lowerType = rawType.toLowerCase();
    var type = lowerType;
    if (lowerType === 'إعلان' || lowerType === 'اعلان') type = 'announcement';
    else if (lowerType === 'صورة' || lowerType === 'صور') type = 'photo';
    else if (lowerType === 'فيديو' || lowerType === 'مرئي') type = 'video';
    else if (lowerType === 'تعليمات' || lowerType === 'توجيه') type = 'instruction';
    else if (lowerType === 'رابط' || lowerType === 'روابط') type = 'link';
    else if (lowerType === 'درس' || lowerType === 'دروس' || lowerType === 'lesson' || lowerType === 'lesson_link' || lowerType === 'lesson link' || lowerType === 'رابط درس') type = 'lesson';

    if (!isAdmin) {
      // Status check for student view
      var isActive = (status === 'active' || status === 'نشط' || status === '' || status === '1' || status === 'true');
      if (!isActive) continue;

      // Target student check for student view
      var cleanTarget = targetStudent.toLowerCase();
      var isForUser = (cleanTarget === 'all' || cleanTarget === '' || cleanTarget === '-' || cleanTarget === cleanUsername || cleanTarget.indexOf(cleanUsername) !== -1 || cleanUsername.indexOf(cleanTarget) !== -1);
      if (!isForUser) continue;
    }

    result.push({
      type: isAdmin ? rawType : type,
      title: title,
      content: content,
      targetStudent: targetStudent,
      status: status,
      row: i + 1
    });
  }

  return result;
}

function saveHomeContent(items, item, actionType, deletedIndex) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Home_Content');
  if (!sheet) {
    sheet = ss.insertSheet('Home_Content');
    sheet.appendRow(['Type', 'Title', 'Content', 'Target_Student', 'Status']);
  }

  // Clear existing content rows (row 2 onwards)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, Math.max(sheet.getLastColumn(), 5)).clearContent();
  }

  // Write new items array
  if (items && Array.isArray(items) && items.length > 0) {
    var rowsToAppend = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (Array.isArray(it)) {
        rowsToAppend.push([
          it[0] || 'درس',
          it[1] || '',
          it[2] || '',
          it[3] || 'ALL',
          it[4] || 'active'
        ]);
      } else if (typeof it === 'object' && it !== null) {
        rowsToAppend.push([
          it.type || 'درس',
          it.title || '',
          it.content || '',
          it.targetStudent || 'ALL',
          it.status || 'active'
        ]);
      }
    }
    if (rowsToAppend.length > 0) {
      sheet.getRange(2, 1, rowsToAppend.length, 5).setValues(rowsToAppend);
    }
  }

  return { success: true, message: "تم حفظ محتوى الرئيسية بنجاح" };
}

function getSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) return {};
  var lastRow = Math.max(1, settingsSheet.getLastRow());
  var settingsData = settingsSheet.getRange("U1:V" + lastRow).getValues();
  var settings = {};
  for (var i = 1; i < settingsData.length; i++) {
    var key = settingsData[i][0] ? settingsData[i][0].toString().trim() : '';
    var value = settingsData[i][1] ? settingsData[i][1].toString().trim() : '';
    if (key && value) settings[key] = value;
  }
  return settings;
}

function getPdfSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) return null;
  var lastRow = Math.max(1, settingsSheet.getLastRow());
  var settingsData = settingsSheet.getRange("U1:V" + lastRow).getValues();
  
  var chunkCount = 0;
  var singleJson = '';
  var chunkMap = {};

  for (var i = 1; i < settingsData.length; i++) {
    var key = settingsData[i][0] ? settingsData[i][0].toString().trim() : '';
    var val = settingsData[i][1] ? settingsData[i][1].toString() : '';
    if (key === 'pdf_settings_json') {
      singleJson = val;
    } else if (key === 'pdf_settings_count') {
      chunkCount = parseInt(val, 10) || 0;
    } else if (key.indexOf('pdf_settings_chunk_') === 0) {
      var idx = parseInt(key.replace('pdf_settings_chunk_', ''), 10);
      if (!isNaN(idx)) {
        chunkMap[idx] = val;
      }
    }
  }

  var fullJsonStr = '';
  if (chunkCount > 0) {
    for (var c = 0; c < chunkCount; c++) {
      if (chunkMap[c] !== undefined) {
        fullJsonStr += chunkMap[c];
      }
    }
  } else if (singleJson) {
    fullJsonStr = singleJson;
  }

  if (fullJsonStr) {
    try {
      return JSON.parse(fullJsonStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function savePdfSettings(settingsObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('Settings');
    settingsSheet.appendRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Key', 'Value']);
  }
  var jsonStr = JSON.stringify(settingsObj || {});
  
  // Split into 30000-character chunks to prevent hitting Google Sheets 50k character cell limit
  var chunkSize = 30000;
  var chunks = [];
  for (var c = 0; c < jsonStr.length; c += chunkSize) {
    chunks.push(jsonStr.substring(c, c + chunkSize));
  }

  var lastRow = Math.max(1, settingsSheet.getLastRow());
  var settingsData = settingsSheet.getRange("U1:V" + lastRow).getValues();

  // Clear existing pdf_settings_json, pdf_settings_count, and pdf_settings_chunk_* rows
  for (var i = 1; i < settingsData.length; i++) {
    var k = settingsData[i][0] ? settingsData[i][0].toString().trim() : '';
    if (k === 'pdf_settings_json' || k === 'pdf_settings_count' || k.indexOf('pdf_settings_chunk_') === 0) {
      settingsSheet.getRange(i + 1, 21, 1, 2).clearContent();
    }
  }

  if (chunks.length === 1) {
    // Single chunk: write directly to pdf_settings_json
    var foundEmptyRow = -1;
    var freshLastRow = Math.max(1, settingsSheet.getLastRow());
    var freshData = settingsSheet.getRange("U1:V" + freshLastRow).getValues();
    for (var r = 1; r < freshData.length; r++) {
      if (!freshData[r][0] || freshData[r][0].toString().trim() === '') {
        foundEmptyRow = r + 1;
        break;
      }
    }
    if (foundEmptyRow !== -1) {
      settingsSheet.getRange(foundEmptyRow, 21, 1, 2).setValues([['pdf_settings_json', chunks[0]]]);
    } else {
      settingsSheet.appendRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pdf_settings_json', chunks[0]]);
    }
  } else {
    // Multiple chunks
    settingsSheet.appendRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pdf_settings_count', chunks.length]);
    for (var ch = 0; ch < chunks.length; ch++) {
      settingsSheet.appendRow(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'pdf_settings_chunk_' + ch, chunks[ch]]);
    }
  }

  return { success: true, message: "تم حفظ إعدادات الـ PDF والشهادات بنجاح" };
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
  var defSchedule = getStudentSchedule('DEFAULT_STUDENT');
  if (!schedule) {
    schedule = defSchedule || {
      studentId: 'DEFAULT_STUDENT',
      studentName: 'الإعدادات الافتراضية',
      startDate: '',
      activeDays: 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت',
      lessonsPerWeek: '3'
    };
  }
  
  if (schedule.studentId === 'DEFAULT_STUDENT') {
    defSchedule = null;
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
      '', // العمود I فاصل
      'تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع',
      'وقت البدء المخصص للطالب', 'مدة الحصة المخصصة للطالب', 'نوع احتساب المدة للطالب', 'منع الدخول المبكر للطالب', 'إجبار تسجيل الدخول للطالب'
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#f1f5f9');
    sheet.getRange(1, 10, 1, 6).setFontWeight('bold').setBackground('#e0e7ff');
    sheet.getRange(1, 16, 1, 5).setFontWeight('bold').setBackground('#fef3c7');
  } else {
    ensureColumns(sheet, 20);
    var firstRow = sheet.getRange(1, 1, 1, 20).getValues()[0];
    if (!firstRow[5] || firstRow[5].toString().trim() === '') {
      sheet.getRange(1, 6).setValue('أيام بقاء الدرس');
    }
    if (!firstRow[6] || firstRow[6].toString().trim() === '') {
      sheet.getRange(1, 7).setValue('تاريخ الإخفاء النهائي');
    }
    if (!firstRow[7] || firstRow[7].toString().trim() === '') {
      sheet.getRange(1, 8).setValue('تخصيص الامتحانات');
    }
    // الأعمدة العامة القديمة الأصلية (J1:O1)
    if (!firstRow[9] || firstRow[9].toString().trim() === '') {
      sheet.getRange("J1:O1").setValues([['تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع']]);
      sheet.getRange("J1:O1").setFontWeight('bold').setBackground('#e0e7ff');
    }
    // الأعمدة الجديدة الخاصة بأوقات الحصة الفردية (P1:T1)
    if (!firstRow[15] || firstRow[15].toString().trim() === '') {
      sheet.getRange("P1:T1").setValues([['وقت البدء المخصص للطالب', 'مدة الحصة المخصصة للطالب', 'نوع احتساب المدة للطالب', 'منع الدخول المبكر للطالب', 'إجبار تسجيل الدخول للطالب']]);
      sheet.getRange("P1:T1").setFontWeight('bold').setBackground('#fef3c7');
    } else if (!firstRow[19] || firstRow[19].toString().trim() === '') {
      sheet.getRange(1, 20).setValue('إجبار تسجيل الدخول للطالب');
      sheet.getRange(1, 20).setFontWeight('bold').setBackground('#fef3c7');
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
  
  ensureColumns(scheduleSheet, 19);
  
  // Always use J1:O1 (columns 10 to 15) for legacy default schedule
  var startCol = 10;
  var headersRange = scheduleSheet.getRange("J1:O1");
  var headers = headersRange.getValues()[0];
  if (!headers[0] || headers[0].toString().trim() === '') {
    headersRange.setValues([['تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع']]);
    headersRange.setFontWeight('bold').setBackground('#e0e7ff');
  }
  
  var defaultValues = scheduleSheet.getRange(2, startCol, 1, 6).getValues()[0];
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
  
  var isDefaultEmpty = (dStartDate === '' && (defaultValues[1] || '') === '' && (defaultValues[2] || '') === '');
  if (isDefaultEmpty) {
    scheduleSheet.getRange(2, startCol, 1, 6).setValues([['', 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت', '3', '', '', '']]);
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
  if (!studentId || studentId === 'admin_preview' || studentId === 'admin') {
    return null;
  }
  if (studentId.toString().trim() === 'DEFAULT_STUDENT') {
    return getDefaultSchedule();
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);
  
  var lastRow = scheduleSheet.getLastRow();
  if (lastRow < 2) return null;
  
  var maxCols = Math.max(scheduleSheet.getLastColumn(), 20);
  var data = scheduleSheet.getRange(2, 1, lastRow - 1, maxCols).getValues();
  var target = studentId.toString().trim().toLowerCase();
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var sId = row[0] ? row[0].toString().trim() : '';
    var sName = row[1] ? row[1].toString().trim() : '';
    if (sId.toLowerCase() === target || sName.toLowerCase() === target) {
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

      // Read Custom Time from P (col 16), Q (col 17), R (col 18), S (col 19), T (col 20)
      var customStartTime = '';
      var pVal = row[15]; // Column P (index 15)
      if (pVal !== null && pVal !== undefined && pVal !== '') {
        if (pVal instanceof Date || (typeof pVal === 'object' && pVal && pVal.getHours)) {
          var cHrs = ('0' + pVal.getHours()).slice(-2);
          var cMins = ('0' + pVal.getMinutes()).slice(-2);
          customStartTime = cHrs + ':' + cMins;
        } else {
          var sStr = pVal.toString().trim().replace(/^'+/, '');
          var tMatch = sStr.match(/(\d{1,2}:\d{2})/);
          if (tMatch) {
            var parts = tMatch[1].split(':');
            var hh = parts[0].length === 1 ? '0' + parts[0] : parts[0];
            customStartTime = hh + ':' + parts[1];
          } else {
            customStartTime = sStr;
          }
        }
      }

      var customSessionDuration = row[16] ? parseInt(row[16].toString().trim(), 10) : undefined;
      if (isNaN(customSessionDuration)) customSessionDuration = undefined;

      var customDurationTypeRaw = row[17] ? row[17].toString().trim() : '';
      var customDurationType = (customDurationTypeRaw.indexOf('دخول') !== -1 || customDurationTypeRaw === 'from_login') ? 'from_login' : (customDurationTypeRaw ? 'from_start' : undefined);

      var customPreventRaw = row[18] !== null && row[18] !== undefined ? row[18].toString().trim().toLowerCase() : '';
      var customPreventEarlyEntry = (customPreventRaw === 'نعم' || customPreventRaw === 'true' || customPreventRaw === '1' || customPreventRaw === 'مفعل' || customPreventRaw === 'مُفعّل') ? true : (customPreventRaw === 'لا' || customPreventRaw === 'false' || customPreventRaw === '0' || customPreventRaw === 'معطل' ? false : undefined);

      var customForceRaw = row[19] !== null && row[19] !== undefined ? row[19].toString().trim().toLowerCase() : '';
      var customForceLogin = (customForceRaw === 'نعم' || customForceRaw === 'true' || customForceRaw === '1' || customForceRaw === 'مفعل' || customForceRaw === 'مُفعّل') ? true : (customForceRaw === 'لا' || customForceRaw === 'false' || customForceRaw === '0' || customForceRaw === 'معطل' ? false : undefined);

      var tgChatId = '';
      var tgLang = 'ar';
      var tgSheet = getSheetByNameFlexible(ss, 'Telegram_Users');
      if (tgSheet && tgSheet.getLastRow() >= 2) {
        var tgData = tgSheet.getRange(2, 1, tgSheet.getLastRow() - 1, 4).getValues();
        for (var t = 0; t < tgData.length; t++) {
          var tId = tgData[t][1] ? tgData[t][1].toString().trim().toLowerCase() : '';
          var tName = tgData[t][0] ? tgData[t][0].toString().trim().toLowerCase() : '';
          if (tId === target || tName === target) {
            tgChatId = tgData[t][2] ? tgData[t][2].toString().trim() : '';
            var lRaw = tgData[t][3] ? tgData[t][3].toString().trim().toLowerCase() : '';
            if (lRaw.indexOf('en') !== -1 || lRaw.indexOf('eng') !== -1) tgLang = 'en';
            else if (lRaw.indexOf('th') !== -1 || lRaw.indexOf('ไทย') !== -1) tgLang = 'th';
            else tgLang = 'ar';
            break;
          }
        }
      }

      return {
        studentId: sId,
        studentName: sName,
        startDate: startDate.toString().trim(),
        activeDays: row[3] ? row[3].toString().trim() : '',
        lessonsPerWeek: row[4] ? row[4].toString().trim() : '3',
        daysToKeep: row[5] ? row[5].toString().trim() : '',
        expiryDate: expDate.toString().trim(),
        examOverrides: row[7] ? row[7].toString().trim() : '',
        customStartTime: customStartTime,
        customSessionDuration: customSessionDuration,
        customDurationType: customDurationType,
        customPreventEarlyEntry: customPreventEarlyEntry,
        customForceLogin: customForceLogin,
        telegramChatId: tgChatId,
        preferredLanguage: tgLang
      };
    }
  }
  return null;
}

function saveStudentCustomTime(studentId, customStartTime, customSessionDuration, customDurationType, customPreventEarlyEntry, customForceLogin) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);
  ensureColumns(scheduleSheet, 20);
  
  var lastRow = scheduleSheet.getLastRow();
  var foundRowIndex = -1;
  var target = (studentId || '').toString().trim();
  
  if (lastRow >= 2) {
    var data = scheduleSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      var sId = data[i][0] ? data[i][0].toString().trim() : '';
      var sName = data[i][1] ? data[i][1].toString().trim() : '';
      if (sId.toLowerCase() === target.toLowerCase() || sName.toLowerCase() === target.toLowerCase()) {
        foundRowIndex = i + 2;
        break;
      }
    }
  }
  
  // If not found in StudentSchedule, look up student in Settings and insert row!
  if (foundRowIndex === -1) {
    var settingsSheet = getSheetByNameFlexible(ss, 'Settings');
    var sNameFound = target;
    if (settingsSheet && settingsSheet.getLastRow() >= 2) {
      var uData = settingsSheet.getRange("Z2:AA" + settingsSheet.getLastRow()).getValues();
      for (var u = 0; u < uData.length; u++) {
        var uName = uData[u][0] ? uData[u][0].toString().trim() : '';
        var uId = uData[u][1] ? uData[u][1].toString().trim() : '';
        if (uId.toLowerCase() === target.toLowerCase() || uName.toLowerCase() === target.toLowerCase()) {
          sNameFound = uName;
          target = uId;
          break;
        }
      }
    }
    foundRowIndex = scheduleSheet.getLastRow() + 1;
    scheduleSheet.getRange(foundRowIndex, 1).setValue(target);
    scheduleSheet.getRange(foundRowIndex, 2).setValue(sNameFound);
  }
  
  var durTypeStr = customDurationType === 'from_login' ? 'من وقت الدخول' : 'من وقت البدء';
  var preventStr = (customPreventEarlyEntry === true || customPreventEarlyEntry === 'true' || customPreventEarlyEntry === 'نعم' || customPreventEarlyEntry === '1') ? 'نعم' : 'لا';
  var forceStr = (customForceLogin === true || customForceLogin === 'true' || customForceLogin === 'نعم' || customForceLogin === '1') ? 'نعم' : 'لا';
  
  var formattedTime = (customStartTime || '').toString().trim().replace(/^'+/, '');
  if (formattedTime.length === 4 && formattedTime.indexOf(':') === 1) {
    formattedTime = '0' + formattedTime;
  }
  
  // Save in Columns P, Q, R, S, T (16, 17, 18, 19, 20)
  scheduleSheet.getRange(foundRowIndex, 16).setValue(formattedTime ? "'" + formattedTime : '');
  scheduleSheet.getRange(foundRowIndex, 17).setValue(customSessionDuration || '');
  scheduleSheet.getRange(foundRowIndex, 18).setValue(durTypeStr);
  scheduleSheet.getRange(foundRowIndex, 19).setValue(preventStr);
  scheduleSheet.getRange(foundRowIndex, 20).setValue(forceStr);
  
  SpreadsheetApp.flush();
  return { success: true, message: 'تم حفظ التوقيت والإعدادات المخصصة للطالب بنجاح' };
}

function deleteStudentCustomTime(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);
  ensureColumns(scheduleSheet, 20);
  
  var lastRow = scheduleSheet.getLastRow();
  if (lastRow < 2) return { success: false, message: 'لا توجد بيانات طلاب في جدول المواعيد' };
  
  var data = scheduleSheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var foundRowIndex = -1;
  var target = (studentId || '').toString().trim();
  for (var i = 0; i < data.length; i++) {
    var sId = data[i][0] ? data[i][0].toString().trim() : '';
    var sName = data[i][1] ? data[i][1].toString().trim() : '';
    if (sId.toLowerCase() === target.toLowerCase() || sName.toLowerCase() === target.toLowerCase()) {
      foundRowIndex = i + 2;
      break;
    }
  }
  
  if (foundRowIndex === -1) {
    return { success: false, message: 'الطالب غير موجود في جدول المواعيد' };
  }
  
  // Clear Columns P, Q, R, S, T (16, 17, 18, 19, 20)
  scheduleSheet.getRange(foundRowIndex, 16, 1, 5).clearContent();
  SpreadsheetApp.flush();
  return { success: true, message: 'تم حذف التوقيت المخصص والعودة للإعدادات العامة' };
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
    var maxCols = Math.max(scheduleSheet.getLastColumn(), 20);
    scheduleRows = scheduleSheet.getRange(2, 1, lastScheduleRow - 1, maxCols).getValues();
    
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
        scheduleRows = scheduleSheet.getRange(2, 1, lastScheduleRow - 1, maxCols).getValues();
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
          expiryDate: row[6],
          customStartTime: row[15],
          customSessionDuration: row[16],
          customDurationType: row[17],
          customPreventEarlyEntry: row[18],
          customForceLogin: row[19]
        };
      }
    }
  }
  
  // 3. Find any new students in Settings that aren't in StudentSchedule, and add them
  var newRows = [];
  for (var sId in activeStudents) {
    if (sId === 'DEFAULT_STUDENT') continue;
    if (!existingSchedules[sId]) {
      newRows.push([sId, activeStudents[sId], '', 'الأحد، الثلاثاء، الخميس', '3', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    } else {
      if (existingSchedules[sId].studentName !== activeStudents[sId]) {
        var rowNum = existingSchedules[sId].rowNumber;
        scheduleSheet.getRange(rowNum, 2).setValue(activeStudents[sId]);
      }
    }
  }
  
  if (newRows.length > 0) {
    scheduleSheet.getRange(scheduleSheet.getLastRow() + 1, 1, newRows.length, 20).setValues(newRows);
    SpreadsheetApp.flush();
    lastScheduleRow = scheduleSheet.getLastRow();
    scheduleRows = scheduleSheet.getRange(2, 1, lastScheduleRow - 1, Math.max(scheduleSheet.getLastColumn(), 20)).getValues();
  }
  
  // 4. Return list of student schedules, starting with DEFAULT_STUDENT
  var list = [];
  list.push(getDefaultSchedule());
  
  var tgMap = {};
  var tgSheet = getSheetByNameFlexible(ss, 'Telegram_Users');
  if (tgSheet && tgSheet.getLastRow() >= 2) {
    var tgData = tgSheet.getRange(2, 1, tgSheet.getLastRow() - 1, 4).getValues();
    for (var t = 0; t < tgData.length; t++) {
      var tId = tgData[t][1] ? tgData[t][1].toString().trim().toLowerCase() : '';
      var tName = tgData[t][0] ? tgData[t][0].toString().trim().toLowerCase() : '';
      var tChatId = tgData[t][2] ? tgData[t][2].toString().trim() : '';
      var lRaw = tgData[t][3] ? tgData[t][3].toString().trim().toLowerCase() : '';
      var tLang = 'ar';
      if (lRaw.indexOf('en') !== -1 || lRaw.indexOf('eng') !== -1) tLang = 'en';
      else if (lRaw.indexOf('th') !== -1 || lRaw.indexOf('ไทย') !== -1) tLang = 'th';
      if (tId) tgMap[tId] = { chatId: tChatId, lang: tLang };
      if (tName) tgMap[tName] = { chatId: tChatId, lang: tLang };
    }
  }

  for (var k = 0; k < scheduleRows.length; k++) {
    var r = scheduleRows[k];
    var sId = r[0] ? r[0].toString().trim() : '';
    var sName = r[1] ? r[1].toString().trim() : '';
    
    if (sId === '' || sId === 'DEFAULT_STUDENT') continue;
    if (!sName && activeStudents[sId]) {
      sName = activeStudents[sId];
    }
    
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

    var customStartTime = '';
    var pVal = r[15]; // Column P (index 15)
    if (pVal !== null && pVal !== undefined && pVal !== '') {
      if (pVal instanceof Date || (typeof pVal === 'object' && pVal && pVal.getHours)) {
        var cHrs = ('0' + pVal.getHours()).slice(-2);
        var cMins = ('0' + pVal.getMinutes()).slice(-2);
        customStartTime = cHrs + ':' + cMins;
      } else {
        var sStr = pVal.toString().trim().replace(/^'+/, '');
        var tMatch = sStr.match(/(\d{1,2}:\d{2})/);
        if (tMatch) {
          var parts = tMatch[1].split(':');
          var hh = parts[0].length === 1 ? '0' + parts[0] : parts[0];
          customStartTime = hh + ':' + parts[1];
        } else {
          customStartTime = sStr;
        }
      }
    }

    var customSessionDuration = r[16] ? parseInt(r[16].toString().trim(), 10) : undefined;
    if (isNaN(customSessionDuration)) customSessionDuration = undefined;

    var customDurationTypeRaw = r[17] ? r[17].toString().trim() : '';
    var customDurationType = (customDurationTypeRaw.indexOf('دخول') !== -1 || customDurationTypeRaw === 'from_login') ? 'from_login' : (customDurationTypeRaw ? 'from_start' : undefined);

    var customPreventRaw = r[18] !== null && r[18] !== undefined ? r[18].toString().trim().toLowerCase() : '';
    var customPreventEarlyEntry = (customPreventRaw === 'نعم' || customPreventRaw === 'true' || customPreventRaw === '1' || customPreventRaw === 'مفعل' || customPreventRaw === 'مُفعّل') ? true : (customPreventRaw === 'لا' || customPreventRaw === 'false' || customPreventRaw === '0' || customPreventRaw === 'معطل' ? false : undefined);
    
    var customForceRaw = r[19] !== null && r[19] !== undefined ? r[19].toString().trim().toLowerCase() : '';
    var customForceLogin = (customForceRaw === 'نعم' || customForceRaw === 'true' || customForceRaw === '1' || customForceRaw === 'مفعل' || customForceRaw === 'مُفعّل') ? true : (customForceRaw === 'لا' || customForceRaw === 'false' || customForceRaw === '0' || customForceRaw === 'معطل' ? false : undefined);
    
    var tgInfo = tgMap[sId.toLowerCase()] || (sName ? tgMap[sName.toLowerCase()] : null) || {};

    list.push({
      studentId: sId,
      studentName: sName,
      startDate: sDate.toString().trim(),
      activeDays: r[3] ? r[3].toString().trim() : '',
      lessonsPerWeek: r[4] ? r[4].toString().trim() : '3',
      daysToKeep: r[5] ? r[5].toString().trim() : '',
      expiryDate: expDate.toString().trim(),
      examOverrides: r[7] ? r[7].toString().trim() : '',
      customStartTime: customStartTime,
      customSessionDuration: customSessionDuration,
      customDurationType: customDurationType,
      customPreventEarlyEntry: customPreventEarlyEntry,
      customForceLogin: customForceLogin,
      telegramChatId: tgInfo.chatId || '',
      preferredLanguage: tgInfo.lang || 'ar'
    });
  }
  return list;
}

function updateStudentSchedule(studentId, startDate, activeDays, lessonsPerWeek, daysToKeep, expiryDate, examOverrides) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = getOrCreateStudentScheduleSheet(ss);

  if (studentId === 'DEFAULT_STUDENT') {
    ensureColumns(scheduleSheet, 19);
    
    var startCol = 10; // Always J1:O1 for default schedule
    var headersRange = scheduleSheet.getRange("J1:O1");
    var headers = headersRange.getValues()[0];
    if (!headers[0] || headers[0].toString().trim() === '') {
      headersRange.setValues([['تاريخ البدء العام للجميع', 'أيام الدراسة العامة للجميع', 'عدد الدروس اليومية العامة للجميع', 'أيام بقاء الدرس العامة للجميع', 'تاريخ الإخفاء النهائي العام للجميع', 'تخصيص الامتحانات العام للجميع']]);
      headersRange.setFontWeight('bold').setBackground('#e0e7ff');
    }

    scheduleSheet.getRange(2, startCol).setValue(startDate || '');
    scheduleSheet.getRange(2, startCol + 1).setValue(activeDays || '');
    scheduleSheet.getRange(2, startCol + 2).setValue(lessonsPerWeek || '');
    scheduleSheet.getRange(2, startCol + 3).setValue(daysToKeep !== undefined && daysToKeep !== null ? daysToKeep : '');
    scheduleSheet.getRange(2, startCol + 4).setValue(expiryDate !== undefined && expiryDate !== null ? expiryDate : '');
    if (examOverrides !== undefined && examOverrides !== null) {
      scheduleSheet.getRange(2, startCol + 5).setValue(examOverrides);
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

function formatGradeToStars(val, type) {
  if (val === undefined || val === null) return '-';
  var str = val.toString().trim();
  if (!str || str === '-') return '-';
  var clean = str.replace('%', '').trim();
  var num = parseFloat(clean);
  if (isNaN(num)) return str;
  var pct = str.indexOf('%') !== -1 ? num : (num <= 10 ? num * 10 : num);
  var starsCount = Math.round((pct / 100) * 10);
  if (starsCount < 0) starsCount = 0;
  if (starsCount > 10) starsCount = 10;
  
  var stars = '';
  for (var i = 0; i < starsCount; i++) {
    stars += '⭐';
  }

  var text = '';
  if (type === 'image') {
    if (pct >= 90) text = 'ممتاز! خط ورسم رائع وواضح جداً 🎨✨';
    else if (pct >= 75) text = 'جيد جداً! خط جميل ومقروء 📝🌟';
    else if (pct >= 50) text = 'جيد! أداء حسن وجاري التحسن ✏️👍';
    else text = 'يحتاج لمزيد من التدريب على الكتابة ✏️💪';
  } else if (type === 'audio') {
    if (pct >= 90) text = 'مبدع! نطق ومخارج حروف ممتازة وصوت واضح 🎙️✨';
    else if (pct >= 75) text = 'جيد جداً! قراءة وأداء صوتي ممتاز 🎧🌟';
    else if (pct >= 50) text = 'جيد! أداء صوتي حسن ويحتاج وضوح أكثر 🗣️👍';
    else text = 'يحتاج لمزيد من التدريب والممارسة الصوتية 🎧💪';
  }

  return stars ? stars + ' (' + Math.round(pct) + '%) ' + text : str;
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
    'تقييم درجة الصورة ⭐',
    'تقييم درجة الصوت ⭐',
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
    var maxCols = Math.max(29, corrSheet.getLastColumn());
    var corrData = corrSheet.getRange(2, 1, corrSheet.getLastRow() - 1, maxCols).getValues();
    corrData.forEach(function(row) {
      var rowId = row[0] ? row[0].toString().trim() : '';
      var rowTopic = row[2] ? row[2].toString().trim() : '';
      if (rowId === studentId.toString().trim() && rowTopic !== '') {
        var picVal = row[19] !== undefined && row[19] !== null ? row[19].toString().trim() : '';
        var audioVal = row[28] !== undefined && row[28] !== null ? row[28].toString().trim() : '';
        var finalVal = row[20] !== undefined && row[20] !== null ? row[20].toString().trim() : '';
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

    var imgEval = formatGradeToStars(picGrade, 'image');
    var audEval = formatGradeToStars(audioGrade, 'audio');

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
      imgEval,               // Col 8: تقييم درجة الصورة ⭐
      audEval,               // Col 9: تقييم درجة الصوت ⭐
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
    'تقييم درجة الصورة ⭐',
    'تقييم درجة الصوت ⭐',
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'ConsolidatedEvaluations');
  if (!sheet) return { success: false, data: [] };
  if (sheet.getMaxColumns() < 22) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 22 - sheet.getMaxColumns());
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    try {
      syncConsolidatedEvaluations(studentId, studentName);
      lastRow = sheet.getLastRow();
      if (lastRow < 2) return { success: true, data: [] };
    } catch (e) {}
  }
  var data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  var filtered = data.filter(function(row) {
    return row[0].toString().trim() === studentId.toString().trim() && row[0].toString().trim() !== 'dummy';
  });
  
  if (filtered.length === 0 && studentId) {
    try {
      syncConsolidatedEvaluations(studentId, studentName);
      lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
        filtered = data.filter(function(row) {
          return row[0].toString().trim() === studentId.toString().trim() && row[0].toString().trim() !== 'dummy';
        });
      }
    } catch (e) {}
  }
  
  return { success: true, data: filtered };
}

function getStudentFullReportData(studentId, studentName) {
  var aReport = getStudentData(studentId);
  var vReport = getStudentVideoData(studentId);
  var cReport = getCorrectionData(studentId);
  var wReport = getWordsExerciseData(studentId);
  var waslReport = getWaslExerciseData(studentId);
  var writReport = getWritingExerciseData(studentId);
  var pdfControl = getPdfControlForStudent(studentId);
  var consolidated = getStudentConsolidatedEvaluation(studentId, studentName);

  return {
    success: true,
    aReport: aReport,
    vReport: vReport,
    cReport: cReport,
    wReport: wReport,
    waslReport: waslReport,
    writReport: writReport,
    pdfControl: pdfControl,
    consolidated: consolidated
  };
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

  // Load PDF Settings and PDF Sheet Row for Student (Images G:K, Texts L:U)
  var pdfSettings = getPdfSettings();
  var pdfSheet = ss.getSheetByName('PDF') || ss.insertSheet('PDF');
  var pdfDataValues = pdfSheet.getDataRange().getValues();
  var studentPdfRow = null;
  for (var pr = 1; pr < pdfDataValues.length; pr++) {
    if (pdfDataValues[pr][1] && pdfDataValues[pr][1].toString().trim() === studentId.toString().trim()) {
      studentPdfRow = pdfDataValues[pr];
      break;
    }
  }

  function getImageAsBase64(url) {
    if (!url || typeof url !== 'string') return '';
    var trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.indexOf('data:image') === 0) return trimmed;

    var imgId = '';
    if (trimmed.indexOf('/file/d/') !== -1) {
      var p1 = trimmed.split('/file/d/')[1];
      if (p1) imgId = p1.split('/')[0].split('?')[0].split('#')[0];
    } else if (trimmed.indexOf('id=') !== -1) {
      var p2 = trimmed.split('id=')[1];
      if (p2) imgId = p2.split('&')[0].split('#')[0];
    } else if (trimmed.indexOf('drive.google.com/uc?') !== -1) {
      var p3 = trimmed.split('id=')[1];
      if (p3) imgId = p3.split('&')[0].split('#')[0];
    } else if (trimmed.length > 20 && trimmed.indexOf('/') === -1 && trimmed.indexOf('.') === -1 && trimmed.indexOf(':') === -1) {
      imgId = trimmed;
    }

    if (imgId) {
      try {
        var file = DriveApp.getFileById(imgId);
        var blob = file.getBlob();
        var contentType = blob.getContentType() || 'image/png';
        var base64 = Utilities.base64Encode(blob.getBytes());
        return 'data:' + contentType + ';base64,' + base64;
      } catch (e) {}
    }

    if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
      try {
        var resp = UrlFetchApp.fetch(trimmed, { muteHttpExceptions: true });
        if (resp.getResponseCode() === 200) {
          var b = resp.getBlob();
          var cType = b.getContentType() || 'image/png';
          var b64 = Utilities.base64Encode(b.getBytes());
          return 'data:' + cType + ';base64,' + b64;
        }
      } catch (e2) {}
    }

    return trimmed;
  }
  var transformUrlForImg = getImageAsBase64;

  // Build Dynamic Variables Map
  var dynamicVars = {
    '{{اسم_الطالب}}': studentName,
    '{{اسم الطالب}}': studentName,
    '{{رقم_الطالب}}': studentId,
    '{{رقم الطالب}}': studentId,
    '{{تاريخ_اليوم}}': issueDate,
    '{{تاريخ اليوم}}': issueDate,
    '{{تاريخ_الإصدار}}': issueDate,
    '{{تاريخ الإصدار}}': issueDate
  };

  // Map Images G:K (Col index 6 to 10)
  var customSizes = (pdfSettings && pdfSettings.customImageSizes) || {};
  for (var imgI = 1; imgI <= 5; imgI++) {
    var colIdx = 6 + (imgI - 1);
    var rawImgUrl = (studentPdfRow && studentPdfRow[colIdx]) ? studentPdfRow[colIdx].toString().trim() : '';
    var tImgUrl = transformUrlForImg(rawImgUrl);
    var w = customSizes['img' + imgI + 'Width'] || '150px';
    var h = customSizes['img' + imgI + 'Height'] || 'auto';
    var imgHtml = tImgUrl ? '<img src="' + tImgUrl + '" style="max-width:100%; width:' + w + '; height:' + h + '; object-fit:contain; display:inline-block; vertical-align:middle; border-radius:8px;" />' : '';
    
    dynamicVars['{{صورة ' + imgI + '}}'] = imgHtml;
    dynamicVars['{{صورة' + imgI + '}}'] = imgHtml;
    dynamicVars['{{صورة_' + imgI + '}}'] = imgHtml;
  }

  // Map Texts L:U (Col index 11 to 20)
  for (var txtJ = 1; txtJ <= 10; txtJ++) {
    var txtColIdx = 11 + (txtJ - 1);
    var txtVal = (studentPdfRow && studentPdfRow[txtColIdx]) ? studentPdfRow[txtColIdx].toString().trim() : '';
    dynamicVars['{{نص ' + txtJ + '}}'] = txtVal;
    dynamicVars['{{نص' + txtJ + '}}'] = txtVal;
    dynamicVars['{{نص_' + txtJ + '}}'] = txtVal;
  }

  function replacePlaceholders(text, certObj) {
    if (!text) return '';
    var res = text;
    var currentVars = {};
    for (var k in dynamicVars) {
      if (dynamicVars.hasOwnProperty(k)) {
        currentVars[k] = dynamicVars[k];
      }
    }

    // Override {{صورة 1}}..{{صورة 5}} if certObj has customImageSizes defined
    var cSizes = (certObj && certObj.customImageSizes && (certObj.customImageSizes.img1Width || certObj.customImageSizes.img1Height))
      ? certObj.customImageSizes
      : ((pdfSettings && pdfSettings.customImageSizes) || {});

    for (var imgIdx = 1; imgIdx <= 5; imgIdx++) {
      var cIdx = 6 + (imgIdx - 1);
      var rUrl = (studentPdfRow && studentPdfRow[cIdx]) ? studentPdfRow[cIdx].toString().trim() : '';
      var tUrl = transformUrlForImg(rUrl);
      var widthVal = cSizes['img' + imgIdx + 'Width'] || '150px';
      var heightVal = cSizes['img' + imgIdx + 'Height'] || 'auto';
      var imgHtmlTag = tUrl ? '<img src="' + tUrl + '" style="max-width:100%; width:' + widthVal + '; height:' + heightVal + '; object-fit:contain; display:inline-block; vertical-align:middle; border-radius:8px;" />' : '';
      
      currentVars['{{صورة ' + imgIdx + '}}'] = imgHtmlTag;
      currentVars['{{صورة' + imgIdx + '}}'] = imgHtmlTag;
      currentVars['{{صورة_' + imgIdx + '}}'] = imgHtmlTag;
    }

    for (var key in currentVars) {
      if (currentVars.hasOwnProperty(key)) {
        res = res.split(key).join(currentVars[key] || '');
      }
    }
    return res;
  }

  var bgUrl = (pdfSettings && pdfSettings.backgroundUrl) ? transformUrlForImg(pdfSettings.backgroundUrl) : '';

  var htmlContent = '<html><head><meta charset="UTF-8">';
  htmlContent += '<style>';
  htmlContent += '@import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700;900&family=Sarabun:wght@400;700&display=swap");';
  htmlContent += '@page { size: A4; margin: 0; }';
  htmlContent += 'body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; margin: 0; padding: 0; color: #1e293b; background-color: transparent; }';
  htmlContent += '.report-wrapper { padding: 18mm 15mm; box-sizing: border-box; position: relative; background: transparent; }';
  htmlContent += '.header { text-align: center; border-bottom: 2px solid #64748b; padding-bottom: 12px; margin-bottom: 20px; }';
  htmlContent += '.header h1 { color: #0f172a; font-size: 24px; margin: 0 0 6px 0; font-weight: 800; }';
  htmlContent += '.header p { color: #475569; font-size: 14px; margin: 0; }';
  htmlContent += '.info-box { background-color: rgba(255, 255, 255, 0.45); border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 25px; }';
  htmlContent += '.info-box table { width: 100%; border-collapse: collapse; }';
  htmlContent += '.info-box td { padding: 6px; font-size: 13px; color: #1e293b; }';
  htmlContent += '.info-box td.label { font-weight: bold; color: #0f172a; width: 140px; }';
  htmlContent += '.section-header { font-size: 16px; font-weight: bold; color: #1e1b4b; background-color: rgba(241, 245, 249, 0.65); padding: 10px 14px; border-radius: 8px; margin-bottom: 15px; border-right: 5px solid #4f46e5; }';
  htmlContent += 'table.results-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: transparent; }';
  htmlContent += 'table.results-table thead { display: table-header-group; }';
  htmlContent += 'table.results-table tr { page-break-inside: avoid; background-color: transparent !important; }';
  htmlContent += 'table.results-table th { background-color: rgba(15, 23, 42, 0.92); color: #ffffff; padding: 11px 8px; font-size: 12px; font-weight: bold; text-align: center; border: 1px solid #0f172a; }';
  htmlContent += 'table.results-table td { padding: 9px 6px; font-size: 11px; text-align: center; border: 1px solid #cbd5e1; color: #0f172a; background-color: transparent !important; }';
  htmlContent += 'table.results-table tr:nth-child(even) td { background-color: transparent !important; }';
  htmlContent += '.badge-success { color: #15803d; font-weight: bold; background-color: rgba(240, 253, 244, 0.85); padding: 3px 8px; border-radius: 6px; border: 1px solid #bbf7d0; display: inline-block; }';
  htmlContent += '.badge-fail { color: #b91c1c; font-weight: bold; background-color: rgba(254, 242, 242, 0.85); padding: 3px 8px; border-radius: 6px; border: 1px solid #fecaca; display: inline-block; }';
  htmlContent += '.page-break { page-break-before: always; height: 18mm; display: block; clear: both; }';
  htmlContent += '.footer { text-align: center; margin-top: 30px; font-size: 11px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 15px; }';
  htmlContent += '.notes-card { background-color: rgba(255, 251, 235, 0.65); border: 1px solid #fde68a; border-radius: 12px; padding: 18px; color: #78350f; margin-top: 15px; }';
  htmlContent += '.notes-card-success { background-color: rgba(240, 253, 244, 0.65); border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; color: #14532d; margin-top: 15px; }';
  htmlContent += '</style>';
  htmlContent += '</head><body>';

  // Fixed Background Image Overlay (renders perfectly centered across full A4 canvas on every page)
  if (bgUrl) {
    htmlContent += '<img src="' + bgUrl + '" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: -1000; object-fit: cover; object-position: center center; margin: 0; padding: 0;" />';
  }

  // Filter valid image URLs and certificates
  var validImagesBefore = (pdfSettings && Array.isArray(pdfSettings.imagesBeforeTable))
    ? pdfSettings.imagesBeforeTable.filter(function(u) { return u && u.toString().trim().length > 0; })
    : [];
  var validImagesAfter = (pdfSettings && Array.isArray(pdfSettings.imagesAfterTable))
    ? pdfSettings.imagesAfterTable.filter(function(u) { return u && u.toString().trim().length > 0; })
    : [];
  var validCertificates = (pdfSettings && Array.isArray(pdfSettings.certificates))
    ? pdfSettings.certificates.filter(function(c) { return c && (c.subjectText || c.bodyText); })
    : [];

  // Interleaving logic for pages before table (images + certificates) based on pagePosition
  var totalPagesBeforeTable = validImagesBefore.length + validCertificates.length;
  var preTableSlots = [];
  for (var p = 0; p < totalPagesBeforeTable; p++) {
    preTableSlots.push(null);
  }

  // Sort certificates by requested pagePosition (1-based)
  var sortedCerts = validCertificates.slice().sort(function(a, b) {
    return (a.pagePosition || 1) - (b.pagePosition || 1);
  });

  // Assign certificates to slots according to pagePosition
  sortedCerts.forEach(function(cert) {
    var desiredIdx = Math.max(0, (cert.pagePosition || 1) - 1);
    if (desiredIdx >= totalPagesBeforeTable) {
      desiredIdx = totalPagesBeforeTable - 1;
    }
    // Find next available slot from desiredIdx
    var targetIdx = desiredIdx;
    while (targetIdx < totalPagesBeforeTable && preTableSlots[targetIdx] !== null) {
      targetIdx++;
    }
    if (targetIdx >= totalPagesBeforeTable) {
      targetIdx = desiredIdx;
      while (targetIdx >= 0 && preTableSlots[targetIdx] !== null) {
        targetIdx--;
      }
    }
    if (targetIdx >= 0 && targetIdx < totalPagesBeforeTable) {
      preTableSlots[targetIdx] = { type: 'certificate', data: cert };
    }
  });

  // Fill remaining empty slots with imagesBefore in order
  var imgIndex = 0;
  for (var slotIdx = 0; slotIdx < totalPagesBeforeTable; slotIdx++) {
    if (preTableSlots[slotIdx] === null) {
      if (imgIndex < validImagesBefore.length) {
        preTableSlots[slotIdx] = { type: 'image', data: validImagesBefore[imgIndex++] };
      }
    }
  }

  // Any remaining images (safety)
  while (imgIndex < validImagesBefore.length) {
    preTableSlots.push({ type: 'image', data: validImagesBefore[imgIndex++] });
  }

  // Render interleaved pre-table pages (Images and Certificates in correct sequence)
  preTableSlots.forEach(function(slot) {
    if (!slot) return;

    if (slot.type === 'image') {
      var tUrl = transformUrlForImg(slot.data);
      if (tUrl) {
        htmlContent += '<div style="width:100%; height:100vh; page-break-after:always; margin:0; padding:0; overflow:hidden; position:relative;">';
        htmlContent += '<img src="' + tUrl + '" style="width:100%; height:100%; object-fit:cover; display:block; margin:0; padding:0; border:none;" />';
        htmlContent += '</div>';
      }
    } else if (slot.type === 'certificate') {
      var cert = slot.data;
      var subject = cert.subjectText || 'شهادة شكر وتقدير';
      var subjectSize = cert.subjectFontSize || '26px';
      var subjectAlign = cert.subjectAlign || 'center';
      var subjectFont = cert.subjectFontFamily || 'Amiri';

      var bodyText = replacePlaceholders(cert.bodyText || '', cert);
      var bodySize = cert.bodyFontSize || '18px';
      var bodyAlign = cert.bodyAlign || 'center';
      var bodyFont = cert.bodyFontFamily || 'Tajawal';

      var padTop = cert.marginTop || '25mm';
      var padSide = cert.marginSide || '20mm';
      var padBottom = cert.marginBottom || '20mm';

      var bgImgUrl = getImageAsBase64(pdfSettings ? pdfSettings.backgroundUrl : '');

      htmlContent += '<div style="width:210mm; height:296mm; page-break-after:always; position:relative; box-sizing:border-box; overflow:hidden; margin:0; padding:0; background:#ffffff;">';

      // Layer 1: Global Background Image if configured
      if (bgImgUrl) {
        htmlContent += '<img src="' + bgImgUrl + '" style="position:absolute; top:0; left:0; width:210mm; height:296mm; z-index:1; object-fit:fill; margin:0; padding:0; border:none;" />';
      }

      // Layer 2: Frame Image Overlay if present
      if (cert.frameUrl) {
        var frameImgUrl = getImageAsBase64(cert.frameUrl);
        if (frameImgUrl) {
          htmlContent += '<img src="' + frameImgUrl + '" style="position:absolute; top:0; left:0; width:210mm; height:296mm; z-index:2; object-fit:fill; margin:0; padding:0; border:none;" />';
        }
      }

      // Layer 3: Foreground Content Wrapper
      htmlContent += '<div style="position:relative; z-index:5; width:100%; height:296mm; padding:' + padTop + ' ' + padSide + ' ' + padBottom + ' ' + padSide + '; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; background:transparent;">';

      htmlContent += '<div style="position:relative; z-index:2;">';
      htmlContent += '<div style="text-align:' + subjectAlign + '; font-size:' + subjectSize + '; font-family:' + subjectFont + ', serif; font-weight:bold; color:#0f172a; margin-bottom:12px;">' + subject + '</div>';
      htmlContent += '<div style="text-align:' + bodyAlign + '; font-size:' + bodySize + '; font-family:' + bodyFont + ', sans-serif; color:#0f172a; line-height:1.8; white-space:pre-line;">' + bodyText + '</div>';
      htmlContent += '</div>';

      // Signatures & Stamps
      if (cert.footerImageUrl) {
        var footerUrl = transformUrlForImg(cert.footerImageUrl);
        var footerH = cert.footerImageHeight || '120px';
        var footerAlign = cert.footerImageAlign || 'center';
        if (footerUrl) {
          htmlContent += '<div style="text-align:' + footerAlign + '; width:100%; margin-top:20px; position:relative; z-index:2;">';
          htmlContent += '<img src="' + footerUrl + '" style="max-width:100%; height:' + footerH + '; object-fit:contain; display:inline-block;" />';
          htmlContent += '</div>';
        }
      } else {
        var realSigs = Array.isArray(cert.signatures) ? cert.signatures.filter(function(s) { return s && (s.url || s.title); }) : [];
        var realStamps = Array.isArray(cert.stamps) ? cert.stamps.filter(function(st) { return st && (st.url || st.title); }) : [];

        if (realSigs.length > 0 || realStamps.length > 0) {
          htmlContent += '<div style="display:flex; justify-content:space-around; align-items:flex-end; margin-top:25px; padding-top:15px; border-top:1px solid #e2e8f0; text-align:center; position:relative; z-index:2;">';
          
          realSigs.forEach(function(sig) {
            var sigUrl = transformUrlForImg(sig.url);
            var w = sig.width || '120px';
            var h = sig.height || 'auto';
            htmlContent += '<div style="display:inline-block; margin:0 15px; text-align:center;">';
            if (sigUrl) {
              htmlContent += '<img src="' + sigUrl + '" style="width:' + w + '; height:' + h + '; object-fit:contain; display:block; margin:0 auto 5px auto;" />';
            }
            if (sig.title) {
              htmlContent += '<div style="font-size:12px; font-weight:bold; color:#334155;">' + sig.title + '</div>';
            }
            htmlContent += '</div>';
          });

          realStamps.forEach(function(stamp) {
            var stampUrl = transformUrlForImg(stamp.url);
            var w = stamp.width || '100px';
            var h = stamp.height || 'auto';
            htmlContent += '<div style="display:inline-block; margin:0 15px; text-align:center;">';
            if (stampUrl) {
              htmlContent += '<img src="' + stampUrl + '" style="width:' + w + '; height:' + h + '; object-fit:contain; display:block; margin:0 auto 5px auto;" />';
            }
            if (stamp.title) {
              htmlContent += '<div style="font-size:12px; font-weight:bold; color:#334155;">' + stamp.title + '</div>';
            }
            htmlContent += '</div>';
          });

          htmlContent += '</div>';
        }
      }

      htmlContent += '</div>'; // End foreground wrapper
      htmlContent += '</div>'; // End certificate page container
    }
  });

  // Start Report Wrapper for tables and text content
  htmlContent += '<div class="report-wrapper">';

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
  htmlContent += '<div class="section-header">1. جدول الدروس المرسلة والواجبات</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع</th>';
  htmlContent += '<th>تقييم درجة الصورة ⭐</th>';
  htmlContent += '<th>تقييم درجة الصوت ⭐</th>';
  htmlContent += '</tr></thead><tbody>';
  studentRecords.forEach(function(row) {
    var topic = row[2];
    var picEval = row[7] || '-';
    var audioEval = row[8] || '-';
    htmlContent += '<tr>';
    htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:30%;">' + topic + '</td>';
    htmlContent += '<td>' + picEval + '</td>';
    htmlContent += '<td>' + audioEval + '</td>';
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table>';

  // --- Page 2: جدول الدرجات والتركيز ---
  htmlContent += '<div class="page-break"></div>';
  htmlContent += buildMiniHeader();
  htmlContent += '<div class="section-header">2. جدول درجات الواجبات والتركيز</div>';
  htmlContent += '<table class="results-table"><thead><tr>';
  htmlContent += '<th>موضوع الدرس</th>';
  htmlContent += '<th>نتيجة اجابة الفيديو</th>';
  htmlContent += '<th>نتيجة اجابة الصوت</th>';
  htmlContent += '<th>النتيجة الكلية</th>';
  htmlContent += '<th>الدرجة النهائية</th>';
  htmlContent += '<th>تقييم النجوم ⭐</th>';
  htmlContent += '</tr></thead><tbody>';

  var corrReport = getCorrectionData(studentId);
  var corrRows = (corrReport && corrReport.success && corrReport.data) ? corrReport.data : [];

  if (corrRows.length > 0) {
    corrRows.forEach(function(cRow) {
      var topic = cRow[0] || '-';
      var videoRes = cRow[1] || '-';
      var audioRes = cRow[2] || '-';
      var totalRes = cRow[3] || '-';
      var finalGrade = formatPercentage(cRow[4]);
      var stars = getTenStars(finalGrade);

      htmlContent += '<tr>';
      htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:25%;">' + topic + '</td>';
      htmlContent += '<td>' + videoRes + '</td>';
      htmlContent += '<td>' + audioRes + '</td>';
      htmlContent += '<td>' + totalRes + '</td>';
      htmlContent += '<td style="font-weight:bold; color:#4f46e5;">' + finalGrade + '</td>';
      htmlContent += '<td style="letter-spacing:1px; font-size:11px;">' + stars + '</td>';
      htmlContent += '</tr>';
    });
  } else {
    studentRecords.forEach(function(row) {
      var topic = row[2];
      var picGrade = formatPercentage(row[4]);
      var audioGrade = formatPercentage(row[5]);
      var focusStatus = row[6] || '-';
      var stars = getTenStars(picGrade);
      htmlContent += '<tr>';
      htmlContent += '<td style="font-weight:bold; text-align:right; color:#0f172a; width:25%;">' + topic + '</td>';
      htmlContent += '<td>' + picGrade + '</td>';
      htmlContent += '<td>' + audioGrade + '</td>';
      htmlContent += '<td>' + focusStatus + '</td>';
      htmlContent += '<td style="font-weight:bold; color:#4f46e5;">' + picGrade + '</td>';
      htmlContent += '<td style="letter-spacing:1px; font-size:11px;">' + stars + '</td>';
      htmlContent += '</tr>';
    });
  }
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
  htmlContent += '</div>'; // End report-wrapper

  // Render Images After Table (A4 Full Pages, no margins)
  validImagesAfter.forEach(function(imgUrl) {
    var tUrl = transformUrlForImg(imgUrl);
    if (tUrl) {
      htmlContent += '<div style="width:100%; height:100vh; page-break-before:always; margin:0; padding:0; overflow:hidden; position:relative;">';
      htmlContent += '<img src="' + tUrl + '" style="width:100%; height:100%; object-fit:cover; display:block; margin:0; padding:0; border:none;" />';
      htmlContent += '</div>';
    }
  });

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

function generateStudentCertificatePDF(studentId, studentName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    syncConsolidatedEvaluations(studentId, studentName);
  } catch (e) {}

  var issueDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd');

  var pdfSettings = getPdfSettings();
  var pdfSheet = ss.getSheetByName('PDF') || ss.insertSheet('PDF');
  var pdfDataValues = pdfSheet.getDataRange().getValues();
  var studentPdfRow = null;
  for (var pr = 1; pr < pdfDataValues.length; pr++) {
    if (pdfDataValues[pr][1] && pdfDataValues[pr][1].toString().trim() === studentId.toString().trim()) {
      studentPdfRow = pdfDataValues[pr];
      break;
    }
  }

  function getImageAsBase64(url) {
    if (!url || typeof url !== 'string') return '';
    var trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.indexOf('data:image') === 0) return trimmed;

    var imgId = '';
    if (trimmed.indexOf('/file/d/') !== -1) {
      var p1 = trimmed.split('/file/d/')[1];
      if (p1) imgId = p1.split('/')[0].split('?')[0].split('#')[0];
    } else if (trimmed.indexOf('id=') !== -1) {
      var p2 = trimmed.split('id=')[1];
      if (p2) imgId = p2.split('&')[0].split('#')[0];
    } else if (trimmed.indexOf('drive.google.com/uc?') !== -1) {
      var p3 = trimmed.split('id=')[1];
      if (p3) imgId = p3.split('&')[0].split('#')[0];
    } else if (trimmed.length > 20 && trimmed.indexOf('/') === -1 && trimmed.indexOf('.') === -1 && trimmed.indexOf(':') === -1) {
      imgId = trimmed;
    }

    if (imgId) {
      try {
        var file = DriveApp.getFileById(imgId);
        var blob = file.getBlob();
        var contentType = blob.getContentType() || 'image/png';
        var base64 = Utilities.base64Encode(blob.getBytes());
        return 'data:' + contentType + ';base64,' + base64;
      } catch (e) {}
    }

    if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
      try {
        var resp = UrlFetchApp.fetch(trimmed, { muteHttpExceptions: true });
        if (resp.getResponseCode() === 200) {
          var b = resp.getBlob();
          var cType = b.getContentType() || 'image/png';
          var b64 = Utilities.base64Encode(b.getBytes());
          return 'data:' + cType + ';base64,' + b64;
        }
      } catch (e2) {}
    }

    return trimmed;
  }

  function replacePlaceholders(str, certObj) {
    if (!str) return '';
    var res = str;
    res = res.replace(/\{\{اسم_الطالب\}\}/g, studentName || '');
    res = res.replace(/\{\{اسم الطالب\}\}/g, studentName || '');
    res = res.replace(/\{\{رقم_الطالب\}\}/g, studentId || '');
    res = res.replace(/\{\{رقم الطالب\}\}/g, studentId || '');
    res = res.replace(/\{\{تاريخ_اليوم\}\}/g, issueDate || '');
    res = res.replace(/\{\{تاريخ اليوم\}\}/g, issueDate || '');
    res = res.replace(/\{\{تاريخ_الإصدار\}\}/g, issueDate || '');
    res = res.replace(/\{\{تاريخ الإصدار\}\}/g, issueDate || '');

    var customSizes = (certObj && certObj.customImageSizes && (certObj.customImageSizes.img1Width || certObj.customImageSizes.img1Height))
      ? certObj.customImageSizes
      : ((pdfSettings && pdfSettings.customImageSizes) || {});

    for (var i = 1; i <= 5; i++) {
      var imgColIndex = 5 + i;
      var rawImgUrl = (studentPdfRow && studentPdfRow[imgColIndex]) ? studentPdfRow[imgColIndex].toString().trim() : '';
      var imgUrl = getImageAsBase64(rawImgUrl);
      var w = customSizes['img' + i + 'Width'] || '150px';
      var h = customSizes['img' + i + 'Height'] || 'auto';
      var imgTag = imgUrl ? '<img src="' + imgUrl + '" style="max-width:100%; width:' + w + '; height:' + h + '; object-fit:contain; display:inline-block; vertical-align:middle; border-radius:8px; margin:5px;" />' : '';
      
      res = res.replace(new RegExp('\\{\\{صورة ' + i + '\\}\\}', 'g'), imgTag);
      res = res.replace(new RegExp('\\{\\{صورة' + i + '\\}\\}', 'g'), imgTag);
      res = res.replace(new RegExp('\\{\\{صورة_' + i + '\\}\\}', 'g'), imgTag);
    }

    for (var t = 1; t <= 10; t++) {
      var txtColIndex = 10 + t;
      var textVal = (studentPdfRow && studentPdfRow[txtColIndex]) ? studentPdfRow[txtColIndex].toString().trim() : '';
      
      res = res.replace(new RegExp('\\{\\{نص ' + t + '\\}\\}', 'g'), textVal);
      res = res.replace(new RegExp('\\{\\{نص' + t + '\\}\\}', 'g'), textVal);
      res = res.replace(new RegExp('\\{\\{نص_' + t + '\\}\\}', 'g'), textVal);
    }
    return res;
  }

  var validCertificates = (pdfSettings && Array.isArray(pdfSettings.certificates))
    ? pdfSettings.certificates.filter(function(c) { return c && (c.subjectText || c.bodyText || c.frameUrl || c.footerImageUrl); })
    : [];

  if (validCertificates.length === 0) {
    validCertificates = [{
      subjectText: 'شهادة شكر وتقدير واعتزاز',
      bodyText: 'نهنئ الطالب البطل: {{اسم_الطالب}}\\nعلى تفوقه والتزامه المتميز بالمركز.',
      subjectFontSize: '28px',
      bodyFontSize: '20px',
      marginTop: '25mm',
      marginSide: '20mm',
      marginBottom: '20mm'
    }];
  }

  // Sort certificates by requested pagePosition (1-based, e.g. Page 1 Arabic, Page 2 Thai)
  var sortedCerts = validCertificates.slice().sort(function(a, b) {
    return (a.pagePosition || 1) - (b.pagePosition || 1);
  });

  var bgImgUrl = getImageAsBase64(pdfSettings ? pdfSettings.backgroundUrl : '');

  var htmlContent = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">';
  htmlContent += '<style>';
  htmlContent += '@import url("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700;900&family=Sarabun:wght@400;700&display=swap");';
  htmlContent += '@page { size: A4 portrait; margin: 0; }';
  htmlContent += 'html, body { margin: 0; padding: 0; font-family: "Tajawal", "Sarabun", sans-serif; background-color: #ffffff; color: #0f172a; -webkit-print-color-adjust: exact; }';
  htmlContent += '</style></head><body>';

  sortedCerts.forEach(function(cert, cIdx) {
    var subject = cert.subjectText || 'شهادة شكر وتقدير';
    var subjectSize = cert.subjectFontSize || '26px';
    var subjectAlign = cert.subjectAlign || 'center';
    var subjectFont = cert.subjectFontFamily || 'Amiri';

    var bodyText = replacePlaceholders(cert.bodyText || '', cert);
    var bodySize = cert.bodyFontSize || '18px';
    var bodyAlign = cert.bodyAlign || 'center';
    var bodyFont = cert.bodyFontFamily || 'Tajawal';

    var padTop = cert.marginTop || '25mm';
    var padSide = cert.marginSide || '20mm';
    var padBottom = cert.marginBottom || '20mm';

    var isLast = cIdx === sortedCerts.length - 1;
    var pageBreakStyle = isLast ? '' : 'page-break-after: always;';

    htmlContent += '<div style="width: 210mm; height: 296mm; ' + pageBreakStyle + ' position: relative; box-sizing: border-box; overflow: hidden; margin: 0; padding: 0; background: #ffffff;">';

    // Layer 1: Global Background Image if configured
    if (bgImgUrl) {
      htmlContent += '<img src="' + bgImgUrl + '" style="position: absolute; top: 0; left: 0; width: 210mm; height: 296mm; z-index: 1; object-fit: fill; margin: 0; padding: 0; border: none;" />';
    }

    // Layer 2: Frame Image Overlay for this specific certificate page if set
    if (cert.frameUrl) {
      var frameImgUrl = getImageAsBase64(cert.frameUrl);
      if (frameImgUrl) {
        htmlContent += '<img src="' + frameImgUrl + '" style="position: absolute; top: 0; left: 0; width: 210mm; height: 296mm; z-index: 2; object-fit: fill; margin: 0; padding: 0; border: none;" />';
      }
    }

    // Layer 3: Foreground Content Wrapper
    htmlContent += '<div style="position: relative; z-index: 5; width: 100%; height: 296mm; padding: ' + padTop + ' ' + padSide + ' ' + padBottom + ' ' + padSide + '; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; background: transparent;">';

    // Title and Body Text
    htmlContent += '<div>';
    htmlContent += '<div style="text-align: ' + subjectAlign + '; font-size: ' + subjectSize + '; font-family: ' + subjectFont + ', serif; font-weight: bold; color: #0f172a; margin-bottom: 12px;">' + subject + '</div>';
    htmlContent += '<div style="text-align: ' + bodyAlign + '; font-size: ' + bodySize + '; font-family: ' + bodyFont + ', sans-serif; color: #0f172a; line-height: 1.8; white-space: pre-line;">' + bodyText + '</div>';
    htmlContent += '</div>';

    // Footer image OR Signatures & Stamps
    if (cert.footerImageUrl) {
      var footerUrl = getImageAsBase64(cert.footerImageUrl);
      var footerH = cert.footerImageHeight || '120px';
      var footerAlign = cert.footerImageAlign || 'center';
      if (footerUrl) {
        htmlContent += '<div style="text-align: ' + footerAlign + '; width: 100%; margin-top: 20px; position: relative; z-index: 5;">';
        htmlContent += '<img src="' + footerUrl + '" style="max-width: 100%; height: ' + footerH + '; object-fit: contain; display: inline-block;" />';
        htmlContent += '</div>';
      }
    } else {
      var realSigs = Array.isArray(cert.signatures) ? cert.signatures.filter(function(s) { return s && (s.url || s.title); }) : [];
      var realStamps = Array.isArray(cert.stamps) ? cert.stamps.filter(function(st) { return st && (st.url || st.title); }) : [];

      if (realSigs.length > 0 || realStamps.length > 0) {
        htmlContent += '<div style="display: flex; justify-content: space-around; align-items: flex-end; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; position: relative; z-index: 5;">';

        realSigs.forEach(function(sig) {
          var sigUrl = getImageAsBase64(sig.url);
          var w = sig.width || '120px';
          var h = sig.height || 'auto';
          htmlContent += '<div style="display: inline-block; margin: 0 15px; text-align: center;">';
          if (sigUrl) {
            htmlContent += '<img src="' + sigUrl + '" style="width: ' + w + '; height: ' + h + '; object-fit: contain; display: block; margin: 0 auto 5px auto;" />';
          }
          if (sig.title) {
            htmlContent += '<div style="font-size: 12px; font-weight: bold; color: #334155;">' + sig.title + '</div>';
          }
          htmlContent += '</div>';
        });

        realStamps.forEach(function(stamp) {
          var stampUrl = getImageAsBase64(stamp.url);
          var w = stamp.width || '100px';
          var h = stamp.height || 'auto';
          htmlContent += '<div style="display: inline-block; margin: 0 15px; text-align: center;">';
          if (stampUrl) {
            htmlContent += '<img src="' + stampUrl + '" style="width: ' + w + '; height: ' + h + '; object-fit: contain; display: block; margin: 0 auto 5px auto;" />';
          }
          if (stamp.title) {
            htmlContent += '<div style="font-size: 12px; font-weight: bold; color: #334155;">' + stamp.title + '</div>';
          }
          htmlContent += '</div>';
        });

        htmlContent += '</div>';
      }
    }

    htmlContent += '</div>'; // End foreground content wrapper
    htmlContent += '</div>'; // End certificate page container
  });

  htmlContent += '</body></html>';

  var htmlBlob = HtmlService.createHtmlOutput(htmlContent).getBlob();
  var pdfBlob = htmlBlob.getAs('application/pdf').setName('شهادة_الطالب_' + studentName.replace(/\s+/g, '_') + '_' + studentId + '.pdf');

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
  var certPdfUrl = pdfFile.getUrl();

  var foundRow = -1;
  var pdfData = pdfSheet.getDataRange().getValues();
  for (var i = 1; i < pdfData.length; i++) {
    if (pdfData[i][1] && pdfData[i][1].toString().trim() === studentId.toString().trim()) {
      foundRow = i + 1;
      break;
    }
  }

  var creationDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss');
  if (foundRow !== -1) {
    pdfSheet.getRange(foundRow, 4).setValue(certPdfUrl);
    pdfSheet.getRange(foundRow, 6).setValue(creationDate);
  } else {
    pdfSheet.appendRow([studentName, studentId, '', certPdfUrl, '', creationDate]);
  }

  return { success: true, certPdfUrl: certPdfUrl, pdfUrl: certPdfUrl };
}

function generateStudentBothPDFs(studentId, studentName) {
  var certRes = generateStudentCertificatePDF(studentId, studentName);
  var reportRes = generateStudentConsolidatedPDF(studentId, studentName);

  var certUrl = (certRes && certRes.certPdfUrl) ? certRes.certPdfUrl : ((certRes && certRes.pdfUrl) ? certRes.pdfUrl : '');
  var reportUrl = (reportRes && reportRes.pdfUrl) ? reportRes.pdfUrl : '';

  return {
    success: (certRes && certRes.success) || (reportRes && reportRes.success),
    certPdfUrl: certUrl,
    reportPdfUrl: reportUrl,
    pdfUrl: reportUrl,
    message: 'تم تصدير الشهادة والتقرير الشامل بنجاح'
  };
}

// ====================== ATTENDANCE & LIVE MONITORING SYSTEM ======================

function getOrCreateAttendanceSettingsSheet(ss) {
  var sheet = getSheetByNameFlexible(ss, 'AttendanceSettings');
  if (!sheet) {
    sheet = ss.insertSheet('AttendanceSettings');
    sheet.appendRow(['مفتاح الإعداد', 'القيمة']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#e2e8f0');
    
    var defaultSettings = [
      ['startTime', '19:00'],
      ['sessionDurationFromStart', '120'],
      ['sessionDurationFromLogin', '90'],
      ['forceLogin', 'false'],
      ['timeRestricted', 'false'],
      ['allowedExceptionStudents', ''],
      ['telegramToken', ''],
      ['telegramChatId', ''],
      ['telegramEnabled', 'false'],
      ['telegramTemplatePreClass', 'تذكير: تبدأ حصتك اليوم الساعة {{الوقت}}.'],
      ['telegramTemplateLogin', 'تم تسجيل دخول الطالب {{اسم_الطالب}} للحصة.'],
      ['telegramTemplateComplete', 'أنجز الطالب {{اسم_الطالب}} تمارين وواجبات اليوم بنجاح ✨.'],
      ['telegramTemplateAbsent', 'تنبيه: الطالب {{اسم_الطالب}} لم يسجل دخوله للحصة المقررة اليوم.'],
      ['telegramPreClassReminderMinutes', '15'],
      ['telegramLateAlertDelayMinutes', '10'],
      ['telegramLateAlertRepeatEnabled', 'true'],
      ['telegramLateAlertRepeatIntervalMinutes', '15'],
      ['telegramLateAlertMaxCount', '2'],
      ['telegramFinalAbsentTiming', 'end_of_session'],
      ['telegramNotifyTeacherDirectly', 'true']
    ];
    
    for (var i = 0; i < defaultSettings.length; i++) {
      sheet.appendRow(defaultSettings[i]);
    }
  }
  return sheet;
}

function getAttendanceSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateAttendanceSettingsSheet(ss);
  var data = sheet.getDataRange().getValues();
  
  var settingsMap = {
    startTime: '19:00',
    durationType: 'from_start',
    sessionDurationFromStart: 120,
    sessionDurationFromLogin: 90,
    forceLogin: false,
    timeRestricted: false,
    preventEarlyEntry: false,
    inactivityTimeoutMinutes: 10,
    allowedExceptionStudents: [],
    telegramToken: '',
    telegramChatId: '',
    telegramEnabled: false,
    telegramTemplatePreClass: 'تذكير: تبدأ حصتك اليوم الساعة {{الوقت}}.',
    telegramTemplateLogin: 'تم تسجيل دخول الطالب {{اسم_الطالب}} للحصة.',
    telegramTemplateComplete: 'أنجز الطالب {{اسم_الطالب}} تمارين وواجبات اليوم بنجاح ✨.',
    telegramTemplateAbsent: 'تنبيه: الطالب {{اسم_الطالب}} لم يسجل دخوله للحصة المقررة اليوم.',
    telegramPreClassReminderMinutes: 15,
    telegramLateAlertDelayMinutes: 10,
    telegramLateAlertRepeatEnabled: true,
    telegramLateAlertRepeatIntervalMinutes: 15,
    telegramLateAlertMaxCount: 2,
    telegramFinalAbsentTiming: 'end_of_session',
    telegramNotifyTeacherDirectly: true
  };
  
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0] ? data[i][0].toString().trim() : '';
    var rawVal = data[i][1];
    var val = rawVal !== undefined && rawVal !== null ? rawVal.toString().trim() : '';
    
    if (key === 'startTime') {
      if (rawVal instanceof Date || (typeof rawVal === 'object' && rawVal && rawVal.getHours)) {
        settingsMap.startTime = Utilities.formatDate(rawVal, Session.getScriptTimeZone(), 'HH:mm');
      } else {
        var timeStr = val.replace(/^'+/, '');
        var match = timeStr.match(/(\d{1,2}:\d{2})/);
        if (match) {
          var p = match[1].split(':');
          var hh = p[0].length === 1 ? '0' + p[0] : p[0];
          settingsMap.startTime = hh + ':' + p[1];
        } else {
          settingsMap.startTime = timeStr || '19:00';
        }
      }
    }
    else if (key === 'durationType') settingsMap.durationType = (val === 'from_login') ? 'from_login' : 'from_start';
    else if (key === 'sessionDurationFromStart') settingsMap.sessionDurationFromStart = parseInt(val, 10) || 120;
    else if (key === 'sessionDurationFromLogin') settingsMap.sessionDurationFromLogin = parseInt(val, 10) || 90;
    else if (key === 'forceLogin') settingsMap.forceLogin = (val === 'true');
    else if (key === 'timeRestricted') settingsMap.timeRestricted = (val === 'true');
    else if (key === 'preventEarlyEntry') settingsMap.preventEarlyEntry = (val === 'true');
    else if (key === 'inactivityTimeoutMinutes') settingsMap.inactivityTimeoutMinutes = parseInt(val, 10) || 10;
    else if (key === 'allowedExceptionStudents') settingsMap.allowedExceptionStudents = val ? val.split(',').map(function(s){ return s.trim(); }) : [];
    else if (key === 'telegramToken') settingsMap.telegramToken = val;
    else if (key === 'telegramChatId') settingsMap.telegramChatId = val;
    else if (key === 'telegramEnabled') settingsMap.telegramEnabled = (val === 'true');
    else if (key === 'telegramTemplatePreClass') settingsMap.telegramTemplatePreClass = val;
    else if (key === 'telegramTemplateLogin') settingsMap.telegramTemplateLogin = val;
    else if (key === 'telegramTemplateComplete') settingsMap.telegramTemplateComplete = val;
    else if (key === 'telegramTemplateAbsent') settingsMap.telegramTemplateAbsent = val;
    else if (key === 'telegramPreClassReminderMinutes') settingsMap.telegramPreClassReminderMinutes = parseInt(val, 10) || 15;
    else if (key === 'telegramLateAlertDelayMinutes') settingsMap.telegramLateAlertDelayMinutes = parseInt(val, 10) || 10;
    else if (key === 'telegramLateAlertRepeatEnabled') settingsMap.telegramLateAlertRepeatEnabled = (val !== 'false');
    else if (key === 'telegramLateAlertRepeatIntervalMinutes') settingsMap.telegramLateAlertRepeatIntervalMinutes = parseInt(val, 10) || 15;
    else if (key === 'telegramLateAlertMaxCount') settingsMap.telegramLateAlertMaxCount = parseInt(val, 10) || 2;
    else if (key === 'telegramFinalAbsentTiming') settingsMap.telegramFinalAbsentTiming = (val === 'end_of_day') ? 'end_of_day' : 'end_of_session';
    else if (key === 'telegramNotifyTeacherDirectly') settingsMap.telegramNotifyTeacherDirectly = (val !== 'false');
    else if (key === 'telegramAdminUserId') settingsMap.telegramAdminUserId = val;
    else if (key === 'telegramBotUsername') settingsMap.telegramBotUsername = val;
    else if (key === 'telegramGroups') {
      try { settingsMap.telegramGroups = JSON.parse(val); } catch(e) { settingsMap.telegramGroups = []; }
    }
    else if (key === 'telegramChannels') {
      try { settingsMap.telegramChannels = JSON.parse(val); } catch(e) { settingsMap.telegramChannels = []; }
    }
    else if (key === 'teachers') {
      try { settingsMap.teachers = JSON.parse(val); } catch(e) { settingsMap.teachers = []; }
    }
    else if (key === 'templatesAr') {
      try { settingsMap.templatesAr = JSON.parse(val); } catch(e) {}
    }
    else if (key === 'templatesEn') {
      try { settingsMap.templatesEn = JSON.parse(val); } catch(e) {}
    }
    else if (key === 'templatesTh') {
      try { settingsMap.templatesTh = JSON.parse(val); } catch(e) {}
    }
    else if (key === 'botCommands') {
      try { settingsMap.botCommands = JSON.parse(val); } catch(e) {}
    }
  }
  
  return { success: true, settings: settingsMap };
}

function saveAttendanceSettings(newSettings) {
  if (!newSettings) return { success: false, message: 'بيانات الإعدادات غير صالحة' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateAttendanceSettingsSheet(ss);
  
  var allowedStr = Array.isArray(newSettings.allowedExceptionStudents) ? newSettings.allowedExceptionStudents.join(',') : (newSettings.allowedExceptionStudents || '');
  
  var formattedStartTime = (newSettings.startTime || '19:00').trim();
  if (formattedStartTime.length === 4 && formattedStartTime.indexOf(':') === 1) {
    formattedStartTime = '0' + formattedStartTime;
  }
  
  var kvPairs = {
    startTime: "'" + formattedStartTime,
    durationType: newSettings.durationType || 'from_start',
    sessionDurationFromStart: (newSettings.sessionDurationFromStart || 120).toString(),
    sessionDurationFromLogin: (newSettings.sessionDurationFromLogin || 90).toString(),
    forceLogin: newSettings.forceLogin ? 'true' : 'false',
    timeRestricted: newSettings.timeRestricted ? 'true' : 'false',
    preventEarlyEntry: newSettings.preventEarlyEntry ? 'true' : 'false',
    inactivityTimeoutMinutes: (newSettings.inactivityTimeoutMinutes || 10).toString(),
    allowedExceptionStudents: allowedStr,
    telegramToken: newSettings.telegramToken || '',
    telegramChatId: newSettings.telegramChatId || '',
    telegramAdminUserId: newSettings.telegramAdminUserId || '',
    telegramBotUsername: newSettings.telegramBotUsername || '',
    telegramEnabled: newSettings.telegramEnabled ? 'true' : 'false',
    telegramTemplatePreClass: newSettings.telegramTemplatePreClass || '',
    telegramTemplateLogin: newSettings.telegramTemplateLogin || '',
    telegramTemplateComplete: newSettings.telegramTemplateComplete || '',
    telegramTemplateAbsent: newSettings.telegramTemplateAbsent || '',
    telegramPreClassReminderMinutes: (newSettings.telegramPreClassReminderMinutes || 15).toString(),
    telegramLateAlertDelayMinutes: (newSettings.telegramLateAlertDelayMinutes || 10).toString(),
    telegramLateAlertRepeatEnabled: newSettings.telegramLateAlertRepeatEnabled === false ? 'false' : 'true',
    telegramLateAlertRepeatIntervalMinutes: (newSettings.telegramLateAlertRepeatIntervalMinutes || 15).toString(),
    telegramLateAlertMaxCount: (newSettings.telegramLateAlertMaxCount || 2).toString(),
    telegramFinalAbsentTiming: newSettings.telegramFinalAbsentTiming || 'end_of_session',
    telegramNotifyTeacherDirectly: newSettings.telegramNotifyTeacherDirectly === false ? 'false' : 'true',
    telegramGroups: JSON.stringify(newSettings.telegramGroups || []),
    telegramChannels: JSON.stringify(newSettings.telegramChannels || []),
    teachers: JSON.stringify(newSettings.teachers || []),
    templatesAr: JSON.stringify(newSettings.templatesAr || {}),
    templatesEn: JSON.stringify(newSettings.templatesEn || {}),
    templatesTh: JSON.stringify(newSettings.templatesTh || {}),
    botCommands: JSON.stringify(newSettings.botCommands || [])
  };
  
  var data = sheet.getDataRange().getValues();
  var existingKeys = {};
  for (var i = 1; i < data.length; i++) {
    var k = data[i][0] ? data[i][0].toString().trim() : '';
    if (k) existingKeys[k] = i + 1; // row index
  }
  
  for (var key in kvPairs) {
    if (existingKeys[key]) {
      var cell = sheet.getRange(existingKeys[key], 2);
      cell.setNumberFormat('@');
      cell.setValue(kvPairs[key]);
    } else {
      sheet.appendRow([key, kvPairs[key]]);
    }
  }
  
  SpreadsheetApp.flush();
  return { success: true, message: 'تم حفظ إعدادات المتابعة وتليجرام بنجاح' };
}

function getOrCreateAttendanceLogsSheet(ss) {
  var sheet = getSheetByNameFlexible(ss, 'AttendanceLogs');
  if (!sheet) {
    sheet = ss.insertSheet('AttendanceLogs');
    sheet.appendRow(['التاريخ', 'رقم الطالب', 'اسم الطالب', 'وقت الدخول', 'آخر ظهور / الخروج', 'إجمالي الدقائق', 'الدروس المنجزة', 'حالة الحضور', 'ملاحظات']);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f1f5f9');
  }
  return sheet;
}

function logStudentPresence(studentId, studentName, actionType) {
  if (!studentId || studentId === 'admin_preview' || studentId === 'admin') {
    return { success: true, message: 'تجاهل مسؤول الإدارة' };
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateAttendanceLogsSheet(ss);
  
  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var nowTimeStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
  
  var lastRow = sheet.getLastRow();
  var foundRow = -1;
  var existingLoginTime = nowTimeStr;
  var existingTotalMinutes = 1;
  var existingStatus = '';
  
  if (lastRow >= 2) {
    var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    for (var i = 0; i < data.length; i++) {
      var rDate = data[i][0] ? (data[i][0] instanceof Date ? Utilities.formatDate(data[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd') : data[i][0].toString().trim()) : '';
      var rId = data[i][1] ? data[i][1].toString().trim() : '';
      if (rDate === todayStr && rId === studentId.toString().trim()) {
        foundRow = i + 2;
        existingLoginTime = data[i][3] ? data[i][3].toString() : nowTimeStr;
        existingTotalMinutes = data[i][5] ? parseInt(data[i][5], 10) || 1 : 1;
        existingStatus = data[i][7] ? data[i][7].toString() : '';
        break;
      }
    }
  }
  
  // Calculate total minutes spent in session
  var totalMinutes = existingTotalMinutes;
  try {
    var loginMatch = existingLoginTime.match(/(\d{1,2}):(\d{2})/);
    if (loginMatch) {
      var lh = parseInt(loginMatch[1], 10);
      var lm = parseInt(loginMatch[2], 10);
      var logDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lh, lm, 0);
      totalMinutes = Math.max(1, Math.round((now.getTime() - logDate.getTime()) / 60000));
    }
  } catch(e) {}
  
  var statusText = 'نشط 🟢';
  var notesText = 'متصل / نشط الآن';

  if (actionType === 'punch_in') {
    statusText = 'حاضر 🟢';
    notesText = 'تسجيل حضور ودخول الحصة';
  } else if (actionType === 'logout') {
    statusText = 'غادر / خرج ⚪';
    notesText = 'تسجيل خروج يدوي';
  } else if (actionType === 'page_close' || actionType === 'exit') {
    statusText = 'غادر / خرج ⚪';
    notesText = 'إغلاق الصفحة / مغادرة';
  } else if (actionType === 'timeout' || actionType === 'inactivity_logout') {
    statusText = 'غادر / خروج تلقائي ⚪';
    notesText = 'خروج تلقائي (انقطاع النشاط)';
  } else if (actionType === 'ping' || actionType === 'resume') {
    // Preserve 'حاضر 🟢' if student previously punched in
    if (existingStatus.indexOf('حاضر') !== -1) {
      statusText = 'حاضر 🟢';
    } else {
      statusText = 'نشط 🟢';
    }
    notesText = (actionType === 'resume') ? 'استئناف النشاط' : 'متصل بالجلسة الحية';
  }
  
  if (foundRow !== -1) {
    sheet.getRange(foundRow, 5).setValue(nowTimeStr); // update last active / exit time
    sheet.getRange(foundRow, 6).setValue(totalMinutes);
    sheet.getRange(foundRow, 8).setValue(statusText);
    sheet.getRange(foundRow, 9).setValue(notesText);
    if (statusText.indexOf('🟢') !== -1) {
      sheet.getRange(foundRow, 8).setBackground('#dcfce7').setFontColor('#15803d');
    } else {
      sheet.getRange(foundRow, 8).setBackground('#f8fafc').setFontColor('#64748b');
    }
  } else {
    sheet.appendRow([todayStr, studentId, studentName, nowTimeStr, nowTimeStr, totalMinutes, 0, statusText, notesText]);
    var newRow = sheet.getLastRow();
    if (statusText.indexOf('🟢') !== -1) {
      sheet.getRange(newRow, 8).setBackground('#dcfce7').setFontColor('#15803d');
    } else {
      sheet.getRange(newRow, 8).setBackground('#f8fafc').setFontColor('#64748b');
    }
  }
  
  return { success: true, message: 'تم تسجيل النشاط بنجاح' };
}

function sweepInactivityTimeouts(ss, timeoutMinutes) {
  var limitMinutes = parseInt(timeoutMinutes, 10) || 10;
  var sheet = getOrCreateAttendanceLogsSheet(ss);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  
  var now = new Date();
  var todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  var updatedCount = 0;
  
  for (var i = 0; i < data.length; i++) {
    var rDate = data[i][0] ? (data[i][0] instanceof Date ? Utilities.formatDate(data[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd') : data[i][0].toString().trim()) : '';
    if (rDate !== todayStr) continue;
    
    var currentStatus = data[i][7] ? data[i][7].toString() : '';
    // Only check active students marked with green
    var isActive = currentStatus.indexOf('🟢') !== -1 || currentStatus.indexOf('نشط') !== -1 || currentStatus.indexOf('حاضر') !== -1;
    if (!isActive) continue;
    
    var lastActiveRaw = data[i][4];
    var lastActiveStr = formatGasTimeValue(lastActiveRaw);
    if (!lastActiveStr) continue;
    
    var timeMatch = lastActiveStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      var h = parseInt(timeMatch[1], 10);
      var m = parseInt(timeMatch[2], 10);
      var s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      
      var lastActiveDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s);
      var diffMins = (now.getTime() - lastActiveDate.getTime()) / 60000;
      
      if (diffMins >= limitMinutes) {
        var rowIdx = i + 2;
        sheet.getRange(rowIdx, 8).setValue('غادر / خروج تلقائي ⚪').setBackground('#f8fafc').setFontColor('#64748b');
        sheet.getRange(rowIdx, 9).setValue('خروج تلقائي (انقطاع النشاط > ' + limitMinutes + ' د)');
        updatedCount++;
      }
    }
  }
  return updatedCount;
}

function autoCheckInactivityTimeout() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsRes = getAttendanceSettings();
  var timeout = (settingsRes && settingsRes.settings && settingsRes.settings.inactivityTimeoutMinutes) || 10;
  var count = sweepInactivityTimeouts(ss, timeout);
  return { success: true, sweptCount: count };
}

function formatGasTimeValue(val) {
  if (!val) return '';
  if (val instanceof Date || (typeof val === 'object' && val && val.getHours)) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'HH:mm:ss');
  }
  var str = val.toString().trim();
  var match = str.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
  if (match) {
    return match[1];
  }
  return str;
}

function getLiveMonitoringData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsRes = getAttendanceSettings();
  var settings = settingsRes.settings;
  var defSchedule = getDefaultSchedule();
  
  // 1. Gather all unique students from Settings (Z:AA) AND StudentSchedule (A:B)
  var studentsMap = {};
  
  var settingsSheet = getSheetByNameFlexible(ss, 'Settings');
  if (settingsSheet) {
    var sLastRow = settingsSheet.getLastRow();
    if (sLastRow >= 2) {
      var sData = settingsSheet.getRange(2, 26, sLastRow - 1, 2).getValues(); // Z: Name, AA: ID
      for (var i = 0; i < sData.length; i++) {
        var name = sData[i][0] ? sData[i][0].toString().trim() : '';
        var id = sData[i][1] ? sData[i][1].toString().trim() : '';
        if (id && id !== 'DEFAULT_STUDENT' && id !== 'dummy' && id !== 'admin' && id !== 'admin_preview') {
          studentsMap[id] = name || ('طالب ' + id);
        }
      }
    }
  }
  
  var schedSheet = getSheetByNameFlexible(ss, 'StudentSchedule');
  if (schedSheet) {
    var scLastRow = schedSheet.getLastRow();
    if (scLastRow >= 2) {
      var scData = schedSheet.getRange(2, 1, scLastRow - 1, 2).getValues();
      for (var j = 0; j < scData.length; j++) {
        var scId = scData[j][0] ? scData[j][0].toString().trim() : '';
        var scName = scData[j][1] ? scData[j][1].toString().trim() : '';
        if (scId && scId !== 'DEFAULT_STUDENT' && scId !== 'dummy' && scId !== 'admin' && scId !== 'admin_preview') {
          if (!studentsMap[scId] || !studentsMap[scId].trim()) {
            studentsMap[scId] = scName || ('طالب ' + scId);
          }
        }
      }
    }
  }
  
  var studentsList = [];
  for (var sIdKey in studentsMap) {
    studentsList.push({ id: sIdKey, name: studentsMap[sIdKey] });
  }
  
  var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var logsSheet = getOrCreateAttendanceLogsSheet(ss);
  
  // Sweep inactive students to ensure AttendanceLogs sheet is up-to-date
  var timeoutMinutes = (settings && settings.inactivityTimeoutMinutes) ? parseInt(settings.inactivityTimeoutMinutes, 10) : 10;
  try {
    sweepInactivityTimeouts(ss, timeoutMinutes);
  } catch (err) {}
  
  var logData = logsSheet.getLastRow() >= 2 ? logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 9).getValues() : [];
  
  var todayLogs = {};
  for (var l = 0; l < logData.length; l++) {
    var lDate = logData[l][0] ? (logData[l][0] instanceof Date ? Utilities.formatDate(logData[l][0], Session.getScriptTimeZone(), 'yyyy-MM-dd') : logData[l][0].toString().trim()) : '';
    var lId = logData[l][1] ? logData[l][1].toString().trim() : '';
    if (lDate === todayStr && lId) {
      todayLogs[lId] = {
        loginTime: formatGasTimeValue(logData[l][3]),
        lastActiveTime: formatGasTimeValue(logData[l][4]),
        minutes: logData[l][5] ? logData[l][5].toString() : '',
        completedCount: logData[l][6] ? parseInt(logData[l][6].toString().trim(), 10) || 0 : 0,
        status: logData[l][7] ? logData[l][7].toString() : '',
        notes: logData[l][8] ? logData[l][8].toString() : ''
      };
    }
  }
  
  var activeStudents = [];
  var completedStudents = [];
  var loggedOutStudents = [];
  var absentStudents = [];
  
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var currentDayOfWeek = today.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  
  for (var s = 0; s < studentsList.length; s++) {
    var st = studentsList[s];
    var schedule = getStudentSchedule(st.id);
    var effSchedule = getEffectiveScheduleForSheet(schedule, 'Questions');
    if (!effSchedule) {
      effSchedule = {
        startDate: defSchedule ? defSchedule.startDate : '',
        activeDays: defSchedule ? defSchedule.activeDays : 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت',
        lessonsPerWeek: defSchedule ? defSchedule.lessonsPerWeek : '3',
        expiryDate: defSchedule ? defSchedule.expiryDate : ''
      };
    }
    
    var scheduledDays = (effSchedule.activeDays && effSchedule.activeDays.trim() !== '') ? effSchedule.activeDays : ((defSchedule && defSchedule.activeDays) ? defSchedule.activeDays : 'الأحد، الاثنين، الثلاثاء، الأربعاء، الخميس، الجمعة، السبت');
    var lessonsPerDay = parseInt(effSchedule.lessonsPerWeek, 10) || (defSchedule ? parseInt(defSchedule.lessonsPerWeek, 10) : 3) || 3;
    
    // Check start date & expiry date
    var isStarted = true;
    var effStartDate = effSchedule.startDate || (defSchedule ? defSchedule.startDate : '') || '';
    if (effStartDate && effStartDate.trim() !== '') {
      var p = effStartDate.split('-');
      if (p.length === 3) {
        var sDate = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
        sDate.setHours(0, 0, 0, 0);
        if (today < sDate) {
          isStarted = false; // Not started yet
        }
      }
    }
    
    var isExpired = false;
    var effExpDate = effSchedule.expiryDate || (defSchedule ? defSchedule.expiryDate : '') || '';
    if (effExpDate && effExpDate.trim() !== '') {
      var expP = effExpDate.split('-');
      if (expP.length === 3) {
        var expDate = new Date(parseInt(expP[0], 10), parseInt(expP[1], 10) - 1, parseInt(expP[2], 10));
        expDate.setHours(0, 0, 0, 0);
        if (today > expDate) {
          isExpired = true; // Exceeded expiration
        }
      }
    }
    
    var activeDaysIndices = parseActiveDays(scheduledDays);
    var isTodayScheduled = isStarted && !isExpired && (activeDaysIndices.indexOf(currentDayOfWeek) !== -1);
    
    var userLog = todayLogs[st.id];
    var isUserLoggedOut = Boolean(userLog && (userLog.status.indexOf('غادر') !== -1 || userLog.status.indexOf('خرج') !== -1 || userLog.status.indexOf('⚪') !== -1));
    var completedCount = userLog ? (userLog.completedCount || 0) : 0;
    
    // Safety check for inactivity timeout directly
    if (userLog && userLog.lastActiveTime && !isUserLoggedOut) {
      var laMatch = userLog.lastActiveTime.match(/(\d{1,2}):(\d{2})/);
      if (laMatch) {
        var nowCheck = new Date();
        var laDate = new Date(nowCheck.getFullYear(), nowCheck.getMonth(), nowCheck.getDate(), parseInt(laMatch[1], 10), parseInt(laMatch[2], 10));
        var minsSinceActive = (nowCheck.getTime() - laDate.getTime()) / 60000;
        if (minsSinceActive >= timeoutMinutes) {
          isUserLoggedOut = true;
          userLog.status = 'غادر / خروج تلقائي ⚪';
          userLog.notes = 'خروج تلقائي (انقطاع النشاط > ' + timeoutMinutes + ' د)';
        }
      }
    }
    
    var noteText = isTodayScheduled ? 'يوم دراسة مقرر' : (!isStarted ? ('لم تبدأ الخطة بعد (' + effStartDate + ')') : (isExpired ? 'انتهت الخطة' : 'يوم راحة'));
    
    var customTimeObj = undefined;
    if (schedule && (schedule.customStartTime || schedule.customSessionDuration !== undefined || schedule.customPreventEarlyEntry !== undefined || schedule.customForceLogin !== undefined)) {
      customTimeObj = {
        startTime: schedule.customStartTime || '',
        sessionDuration: schedule.customSessionDuration,
        durationType: schedule.customDurationType,
        preventEarlyEntry: schedule.customPreventEarlyEntry,
        forceLogin: schedule.customForceLogin
      };
    }
    
    var studentStatusObj = {
      studentId: st.id,
      studentName: st.name,
      status: 'idle',
      loginTime: userLog ? userLog.loginTime : '',
      lastActiveTime: userLog ? userLog.lastActiveTime : '',
      completedLessonsCount: completedCount,
      totalRequiredLessons: lessonsPerDay,
      completedTopics: [],
      pendingTopics: [],
      notes: noteText,
      customTime: customTimeObj
    };
    
    if (userLog && completedCount >= lessonsPerDay && lessonsPerDay > 0) {
      studentStatusObj.status = 'completed';
      completedStudents.push(studentStatusObj);
    } else if (userLog && !isUserLoggedOut && userLog.lastActiveTime) {
      studentStatusObj.status = 'active';
      activeStudents.push(studentStatusObj);
    } else if (userLog && isUserLoggedOut) {
      studentStatusObj.status = 'logged_out';
      loggedOutStudents.push(studentStatusObj);
    } else if (isTodayScheduled) {
      studentStatusObj.status = 'absent';
      absentStudents.push(studentStatusObj);
    }
  }
  
  return {
    success: true,
    data: {
      settings: settings,
      activeStudents: activeStudents,
      loggedOutStudents: loggedOutStudents,
      completedStudents: completedStudents,
      absentStudents: absentStudents,
      lastRefreshed: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
    }
  };
}

function sendTelegramDirectMessageGas(token, chatId, text) {
  if (!token || !chatId || !text) return { ok: false };
  try {
    var url = 'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendMessage';
    var payload = {
      chat_id: String(chatId).trim(),
      text: text,
      parse_mode: 'HTML'
    };
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    return JSON.parse(response.getContentText());
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

function processScheduledTelegramNotifications() {
  var settingsRes = getAttendanceSettings();
  var settings = settingsRes.settings || {};
  if (!settings.telegramToken || settings.telegramEnabled === false) {
    return { success: false, message: 'Telegram bot token missing or disabled' };
  }

  var token = settings.telegramToken;
  var schedules = getAllStudentsSchedule();
  var liveData = getLiveMonitoringData();
  var activeIds = {};
  if (liveData && liveData.data) {
    (liveData.data.activeStudents || []).forEach(function(s) { 
      if (s.studentId) activeIds[s.studentId.toString().trim().toLowerCase()] = true; 
    });
    (liveData.data.completedStudents || []).forEach(function(s) { 
      if (s.studentId) activeIds[s.studentId.toString().trim().toLowerCase()] = true; 
    });
    (liveData.data.loggedOutStudents || []).forEach(function(s) { 
      if (s.studentId) activeIds[s.studentId.toString().trim().toLowerCase()] = true; 
    });
  }

  var now = new Date();
  var nowMinutes = now.getHours() * 60 + now.getMinutes();
  var preClassMins = Number(settings.telegramPreClassReminderMinutes) || 15;
  var lateDelayMins = Number(settings.telegramLateAlertDelayMinutes) || 10;
  var lateRepeatEnabled = settings.telegramLateAlertRepeatEnabled !== false;
  var lateRepeatInterval = Number(settings.telegramLateAlertRepeatIntervalMinutes) || 15;
  var lateMaxCount = Number(settings.telegramLateAlertMaxCount) || 2;
  var finalAbsentTiming = settings.telegramFinalAbsentTiming || 'end_of_session';
  var cache = CacheService.getScriptCache();
  var sentCount = 0;

  for (var i = 0; i < schedules.length; i++) {
    var s = schedules[i];
    var sId = s.studentId ? s.studentId.toString().trim() : '';
    var sName = s.studentName ? s.studentName.toString().trim() : 'المشترك';
    if (!sId || sId === 'DEFAULT_STUDENT' || sId === 'dummy' || sId === 'admin' || sId === 'admin_preview') continue;

    var targetChatId = s.telegramChatId || settings.telegramChatId;
    if (!targetChatId) continue;

    var startTimeStr = s.customStartTime || settings.startTime || '19:00';
    var parts = startTimeStr.split(':');
    var startMinutes = (parseInt(parts[0], 10) || 19) * 60 + (parseInt(parts[1], 10) || 0);
    var durationMins = Number(s.customSessionDuration) || Number(settings.sessionDurationFromStart) || 120;
    var endMinutes = startMinutes + durationMins;

    var hasAttended = Boolean(activeIds[sId.toLowerCase()] || (sName && activeIds[sName.toLowerCase()]));
    var todayDateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
    var preKey = 'tg_gas_pre_' + sId + '_' + todayDateStr + '_' + startTimeStr;
    var lateCountKey = 'tg_gas_late_cnt_' + sId + '_' + todayDateStr + '_' + startTimeStr;
    var lateTimeKey = 'tg_gas_late_tm_' + sId + '_' + todayDateStr + '_' + startTimeStr;
    var finalAbsentKey = 'tg_gas_abs_cnt_' + sId + '_' + todayDateStr + '_' + startTimeStr;

    var rawLang = s.preferredLanguage || 'ar';
    var lLow = rawLang.toString().toLowerCase().trim();
    var lang = 'ar';
    if (lLow.indexOf('en') !== -1 || lLow.indexOf('eng') !== -1) lang = 'en';
    else if (lLow.indexOf('th') !== -1 || lLow.indexOf('ไทย') !== -1 || lLow.indexOf('thai') !== -1) lang = 'th';
    else lang = 'ar';

    var interpolate = function(tpl) {
      if (!tpl) return '';
      return tpl
        .split('{{اسم_الطالب}}').join(sName)
        .split('{{student_name}}').join(sName)
        .split('{{studentName}}').join(sName)
        .split('{{رقم_الطالب}}').join(sId)
        .split('{{student_id}}').join(sId)
        .split('{{studentId}}').join(sId)
        .split('{{الوقت}}').join(startTimeStr)
        .split('{{وقت_الحصة}}').join(startTimeStr)
        .split('{{time}}').join(startTimeStr)
        .split('{{classTime}}').join(startTimeStr)
        .split('{{startTime}}').join(startTimeStr);
    };

    // 1. Pre-Class Reminder (قبل دخول الوقت)
    if (nowMinutes >= (startMinutes - preClassMins) && nowMinutes < startMinutes && !hasAttended) {
      if (!cache.get(preKey)) {
        var preTpl = '';
        if (lang === 'en') preTpl = (settings.templatesEn && settings.templatesEn.preClass) || '⏰ Upcoming Class Reminder:\\nHello {{student_name}}, your class starts today at {{time}}.\\nPlease be ready on time to join your session 📚';
        else if (lang === 'th') preTpl = (settings.templatesTh && settings.templatesTh.preClass) || '⏰ แจ้งเตือนก่อนเริ่มคาบเรียน:\\nสวัสดีคุณ {{student_name}} คาบเรียนของคุณจะเริ่มเวลา {{time}}\\nกรุณาเตรียมตัวเข้าสู่ระบบตรงเวลา 📚';
        else preTpl = (settings.templatesAr && settings.templatesAr.preClass) || '⏰ تذكير بموعد الحصة:\\nمرحباً بك يا {{اسم_الطالب}}، تبدأ حصتك اليوم الساعة {{الوقت}}.\\nيرجى الاستعداد والتواجد في الموعد لمتابعة دروسك المقررة 📚';

        var preMsg = interpolate(preTpl);
        sendTelegramDirectMessageGas(token, targetChatId, preMsg);
        cache.put(preKey, 'true', 21600);
        sentCount++;
      }
    }

    // 2. Late Alert (بعد دخول الوقت)
    if (nowMinutes >= (startMinutes + lateDelayMins) && nowMinutes < endMinutes && !hasAttended) {
      var currentLateCount = parseInt(cache.get(lateCountKey), 10) || 0;
      var lastLateMinutes = parseInt(cache.get(lateTimeKey), 10) || 0;
      var maxTotalLateSends = lateRepeatEnabled ? Math.max(1, lateMaxCount) : 1;

      var shouldSendLateGas = false;
      if (currentLateCount === 0) {
        shouldSendLateGas = true;
      } else if (lateRepeatEnabled && currentLateCount < maxTotalLateSends) {
        if ((nowMinutes - lastLateMinutes) >= lateRepeatInterval) {
          shouldSendLateGas = true;
        }
      }

      if (shouldSendLateGas) {
        var lateTpl = '';
        if (lang === 'en') lateTpl = (settings.templatesEn && settings.templatesEn.absent) || '⚠️ Class Delay Alert:\\nHello {{student_name}}, your class was scheduled today at {{time}} and login is not recorded yet.\\nPlease log in now to avoid being marked absent 🚨';
        else if (lang === 'th') lateTpl = (settings.templatesTh && settings.templatesTh.absent) || '⚠️ แจ้งเตือนการเข้าเรียนล่าช้า:\\nสวัสดีคุณ {{student_name}} ถึงเวลาเรียนของคุณแล้ว ({{time}}) แต่ยังไม่ได้เข้าสู่ระบบ\\nกรุณาเข้าสู่ระบบทันทีเพื่อไม่ให้เสียสิทธิ์การเข้าเรียน 🚨';
        else lateTpl = (settings.templatesAr && settings.templatesAr.absent) || '⚠️ تنبيه التأخر عن الحصة:\\nمرحباً يا {{اسم_الطالب}}، حان موعد حصتك اليوم الساعة {{الوقت}} ولم يتم تسجيل دخولك بعد.\\nيرجى الدخول للمنصة الآن لتجنب احتساب الغياب 🚨';

        var lateMsg = interpolate(lateTpl);
        sendTelegramDirectMessageGas(token, targetChatId, lateMsg);
        cache.put(lateCountKey, String(currentLateCount + 1), 21600);
        cache.put(lateTimeKey, String(nowMinutes), 21600);
        sentCount++;
      }
    }

    // 3. Final Absent Notification (إشعار الغياب النهائي بعد انتهاء الحصة)
    var isGasSessionEnded = finalAbsentTiming === 'end_of_session' ? (nowMinutes >= endMinutes) : (nowMinutes >= 23 * 60);
    if (isGasSessionEnded && !hasAttended) {
      if (!cache.get(finalAbsentKey)) {
        var absTpl = '';
        if (lang === 'en') absTpl = (settings.templatesEn && settings.templatesEn.finalAbsent) || '🚨 Absence Notice:\\nHello {{student_name}} (#{{student_id}}), absence has been recorded for the session scheduled today at {{time}}.\\nPlease reach out to the teacher or administration if you have an excuse 📞';
        else if (lang === 'th') absTpl = (settings.templatesTh && settings.templatesTh.finalAbsent) || '🚨 บันทึกการขาดเรียน:\\nขอแจ้งให้ทราบว่าคุณ {{student_name}} (#{{student_id}}) ขาดเรียนในคาบเรียนวันนี้ เวลา: {{time}}\\nกรุณาติดต่อคุณครูหรือฝ่ายบริหารหากมีเหตุจำเป็น 📞';
        else absTpl = (settings.templatesAr && settings.templatesAr.finalAbsent) || '🚨 إشعار عدم الحضور:\\nمرحباً يا {{اسم_الطالب}} (#{{رقم_الطالب}})، تم تسجيل عدم حضورك لحصة اليوم المقررة الساعة {{الوقت}}.\\nيرجى التواصل مع المعلم أو الإدارة في حال وجود عذر أو لإعادة الجدولة 📞';

        var absMsg = interpolate(absTpl);
        sendTelegramDirectMessageGas(token, targetChatId, absMsg);
        cache.put(finalAbsentKey, 'true', 21600);
        sentCount++;
      }
    }
  }

  return { success: true, sentCount: sentCount };
}

// ====================== TELEGRAM_USERS DEDICATED SHEET HANDLERS ======================

function getStudentTelegramFromDedicatedSheet(ss, studentId, studentName) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Telegram_Users');
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  var cleanId = (studentId || '').toString().trim().toLowerCase();
  var cleanName = (studentName || '').toString().trim().toLowerCase();
  if (!cleanId && !cleanName) return null;
  
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (var i = 0; i < data.length; i++) {
    var rName = data[i][0] ? data[i][0].toString().trim().toLowerCase() : '';
    var rId = data[i][1] ? data[i][1].toString().trim().toLowerCase() : '';
    var rChatId = data[i][2] ? data[i][2].toString().trim() : '';
    var rLangRaw = data[i][3] ? data[i][3].toString().trim().toLowerCase() : '';
    
    if ((cleanId && rId === cleanId) || (cleanName && rName === cleanName)) {
      var rLang = 'ar';
      if (rLangRaw.indexOf('en') !== -1 || rLangRaw.indexOf('eng') !== -1) rLang = 'en';
      else if (rLangRaw.indexOf('th') !== -1 || rLangRaw.indexOf('ไทย') !== -1 || rLangRaw.indexOf('thai') !== -1) rLang = 'th';
      else rLang = 'ar';
      
      return {
        telegramChatId: rChatId,
        preferredLanguage: rLang
      };
    }
  }
  return null;
}

function getOrCreateTelegramUsersSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Telegram_Users');
  var headers = ['اسم الطالب', 'رقم الطالب', 'Telegram Chat ID', 'اللغة الذي اختار الطالب', 'تاريخ الربط'];
  
  if (!sheet) {
    sheet = ss.insertSheet('Telegram_Users');
    sheet.appendRow(headers);
  } else {
    var lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      sheet.appendRow(headers);
    } else {
      var r1Data = sheet.getRange(1, 1, 1, Math.max(1, Math.min(5, sheet.getLastColumn() || 1))).getValues()[0];
      var firstCell = r1Data[0] ? r1Data[0].toString().trim() : '';
      var secondCell = r1Data[1] ? r1Data[1].toString().trim() : '';
      
      // If row 1 is not the header row (e.g. contains student data instead of titles)
      if (firstCell !== 'اسم الطالب' && secondCell !== 'رقم الطالب') {
        sheet.insertRowBefore(1);
        sheet.getRange(1, 1, 1, 5).setValues([headers]);
      }
    }
  }
  
  try {
    sheet.getRange(1, 1, 1, 5)
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  } catch (e) {}
  
  return sheet;
}

function formatPreferredLanguageText(lang) {
  if (!lang) return 'العربية (AR)';
  var l = lang.toString().trim().toLowerCase();
  if (l === 'ar' || l.indexOf('عرب') !== -1) return 'العربية (AR)';
  if (l === 'en' || l.indexOf('eng') !== -1) return 'English (EN)';
  if (l === 'th' || l.indexOf('ไทย') !== -1 || l.indexOf('thai') !== -1) return 'ภาษาไทย (TH)';
  return lang.toString().trim();
}

function recordTelegramUser(studentName, studentId, telegramChatId, preferredLanguage, linkDate) {
  if (!studentId && !telegramChatId) {
    return { success: false, message: 'معرف الطالب أو معرف تيليجرام مفقود' };
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateTelegramUsersSheet(ss);
  
  var now = new Date();
  var nowStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var effDate = linkDate || nowStr;
  var effLang = formatPreferredLanguageText(preferredLanguage);
  var cleanId = studentId ? studentId.toString().trim() : '';
  var cleanChatId = telegramChatId ? telegramChatId.toString().trim() : '';
  var cleanName = studentName ? studentName.toString().trim() : ('طالب ' + cleanId);
  
  var lastRow = sheet.getLastRow();
  var foundRow = -1;
  
  // Search strictly from row 2 onwards (Row 1 is headers)
  if (lastRow >= 2) {
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    for (var i = 0; i < data.length; i++) {
      var rName = data[i][0] ? data[i][0].toString().trim() : '';
      var rId = data[i][1] ? data[i][1].toString().trim() : '';
      var rChatId = data[i][2] ? data[i][2].toString().trim() : '';
      
      // Match by Student ID or Telegram Chat ID
      if ((cleanId && rId === cleanId) || (cleanChatId && rChatId === cleanChatId)) {
        foundRow = i + 2;
        // Keep initial link date if already present
        if (!linkDate && data[i][4]) {
          effDate = data[i][4] instanceof Date ? Utilities.formatDate(data[i][4], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : data[i][4].toString();
        }
        if (!studentName && rName) {
          cleanName = rName;
        }
        break;
      }
    }
  }
  
  if (foundRow >= 2) {
    sheet.getRange(foundRow, 1, 1, 5).setValues([[cleanName, cleanId, cleanChatId, effLang, effDate]]);
  } else {
    sheet.appendRow([cleanName, cleanId, cleanChatId, effLang, effDate]);
  }
  
  SpreadsheetApp.flush();
  return {
    success: true,
    message: 'تم تسجيل نسخة بيانات المشترك في ورقة Telegram_Users بنجاح',
    studentId: cleanId,
    telegramChatId: cleanChatId
  };
}

function syncAllTelegramUsers(usersList) {
  if (!Array.isArray(usersList) || usersList.length === 0) {
    return { success: false, message: 'قائمة المشتركين فارغة' };
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateTelegramUsersSheet(ss);
  
  var now = new Date();
  var defaultDateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  
  var lastRow = sheet.getLastRow();
  var existingMap = {};
  var existingDates = {};
  
  if (lastRow >= 2) {
    var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    for (var i = 0; i < data.length; i++) {
      var rId = data[i][1] ? data[i][1].toString().trim() : '';
      var rChatId = data[i][2] ? data[i][2].toString().trim() : '';
      var rDate = data[i][4] ? (data[i][4] instanceof Date ? Utilities.formatDate(data[i][4], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : data[i][4].toString()) : defaultDateStr;
      
      if (rId) {
        existingMap[rId] = i + 2;
        existingDates[rId] = rDate;
      }
      if (rChatId) {
        existingMap['chat_' + rChatId] = i + 2;
      }
    }
  }
  
  var updatedCount = 0;
  var appendedCount = 0;
  
  for (var u = 0; u < usersList.length; u++) {
    var item = usersList[u];
    var sId = item.studentId ? item.studentId.toString().trim() : '';
    var sChatId = item.telegramChatId ? item.telegramChatId.toString().trim() : '';
    var sName = item.studentName ? item.studentName.toString().trim() : ('طالب ' + sId);
    var sLang = formatPreferredLanguageText(item.preferredLanguage || item.preferredLang || item.lang);
    var sDate = item.linkDate || existingDates[sId] || defaultDateStr;
    
    if (!sId && !sChatId) continue;
    
    var targetRow = existingMap[sId] || (sChatId ? existingMap['chat_' + sChatId] : undefined);
    
    if (targetRow && targetRow >= 2) {
      sheet.getRange(targetRow, 1, 1, 5).setValues([[sName, sId, sChatId, sLang, sDate]]);
      updatedCount++;
    } else {
      sheet.appendRow([sName, sId, sChatId, sLang, sDate]);
      var newLastRow = sheet.getLastRow();
      if (sId) existingMap[sId] = newLastRow;
      if (sChatId) existingMap['chat_' + sChatId] = newLastRow;
      appendedCount++;
    }
  }
  
  SpreadsheetApp.flush();
  return {
    success: true,
    message: 'تمت مزامنة ورقة Telegram_Users بنجاح (' + (updatedCount + appendedCount) + ' مشترك)',
    updatedCount: updatedCount,
    appendedCount: appendedCount,
    total: usersList.length
  };
}

function getTelegramUsers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheetByNameFlexible(ss, 'Telegram_Users');
  if (!sheet || sheet.getLastRow() < 2) {
    return { success: true, users: [] };
  }
  
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  var users = [];
  for (var i = 0; i < data.length; i++) {
    var sName = data[i][0] ? data[i][0].toString().trim() : '';
    var sId = data[i][1] ? data[i][1].toString().trim() : '';
    if (sName === 'اسم الطالب' || sId === 'رقم الطالب') continue;
    if (!sName && !sId) continue;

    users.push({
      studentName: sName,
      studentId: sId,
      telegramChatId: data[i][2] ? data[i][2].toString().trim() : '',
      preferredLanguage: data[i][3] ? data[i][3].toString().trim() : 'العربية (AR)',
      linkDate: data[i][4] ? (data[i][4] instanceof Date ? Utilities.formatDate(data[i][4], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : data[i][4].toString().trim()) : ''
    });
  }
  
  return { success: true, users: users };
}
`;

