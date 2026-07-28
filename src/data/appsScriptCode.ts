/**
 * Google Apps Script API For Arabic Learning Hub
 * Code.gs
 */

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
    } else {
      result = { error: "Unknown API action: " + action };
    }
  } catch (error) {
    result = { error: error.toString(), stack: error.stack };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
