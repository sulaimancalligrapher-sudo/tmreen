/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Default Google Apps Script Web App URL
// You can set this variable directly or set VITE_GAS_API_URL in Vercel environment variables
export const DEFAULT_GAS_API_URL = "https://script.google.com/macros/s/AKfycbzmN-1sHkNXkqjc6p5jG3XBTsDd99YYNbo7xFA1GyplcDlYKT82MueqdYWLu--xX8B3Kg/exec";

// Retrieve Google Apps Script Web App URL (LocalStorage > Environment Variable > Hardcoded Default)
export function getApiUrl(): string {
  const customUrl = localStorage.getItem('gas_api_url');
  if (customUrl && customUrl.trim().length > 0) {
    return customUrl.trim();
  }
  const envUrl = (import.meta as any).env?.VITE_GAS_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return DEFAULT_GAS_API_URL;
}

export function setApiUrl(url: string): void {
  const clean = url.trim();
  if (clean) {
    localStorage.setItem('gas_api_url', clean);
  } else {
    localStorage.removeItem('gas_api_url');
  }
}

export function resetApiUrlToDefault(): void {
  localStorage.removeItem('gas_api_url');
}

// Check if API URL is configured
export function isApiConfigured(): boolean {
  const url = getApiUrl();
  return url.length > 0 && (url.startsWith('https://script.google.com/') || url.includes('localhost'));
}

// In-Memory Cache for Read Operations
interface CacheEntry {
  timestamp: number;
  data: any;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 20000; // 20 seconds cache for GET-like actions

// Queue to limit concurrency to Google Apps Script (Max 6 simultaneous requests)
let activeRequestsCount = 0;
const MAX_CONCURRENT_REQUESTS = 6;
interface QueueItem {
  resolve: () => void;
  priority: boolean;
}
const requestQueue: QueueItem[] = [];

async function acquireSlot(priority = false): Promise<void> {
  if (activeRequestsCount < MAX_CONCURRENT_REQUESTS) {
    activeRequestsCount++;
    return;
  }
  return new Promise<void>((resolve) => {
    if (priority) {
      // Priority requests (like Admin login or user interactions) jump to the front of the queue
      requestQueue.unshift({ resolve, priority: true });
    } else {
      requestQueue.push({ resolve, priority: false });
    }
  });
}

function releaseSlot(): void {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) {
      activeRequestsCount++;
      next.resolve();
    }
  }
}

/**
 * Generic API Caller to Google Apps Script Web App with retry, timeout, concurrency limiting, and caching
 */
export async function callGasApi<T>(
  action: string,
  payload: Record<string, any> = {},
  options: { bypassCache?: boolean; retries?: number; timeoutMs?: number; priority?: boolean } = {}
): Promise<T> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('لم يتم تكوين رابط Google Apps Script بعد. يرجى تهيئة الاتصال من الإعدادات.');
  }

  const bypassCache = options.bypassCache ?? false;
  const isAuthAction = action === 'loginAdmin' || action === 'loginUser';
  const isPriority = options.priority ?? isAuthAction;
  const maxRetries = options.retries ?? (isAuthAction ? 2 : 1);
  const timeoutMs = options.timeoutMs ?? (isAuthAction ? 30000 : 45000);

  // Actions that can be safely cached for short duration
  const isReadOnlyAction = [
    'getData',
    'getHomeContent',
    'getStudentData',
    'getStudentVideoData',
    'getCorrectionData',
    'getWordsExerciseData',
    'getWaslExerciseData',
    'getWritingExerciseData',
    'getLessons',
    'getLessonsForAdmin',
    'getLetters',
    'getLessonsFromMatches',
    'getStudentsEvaluations',
    'getAllStudentsSchedule',
    'getPdfSettings',
    'getStudentFullReportData',
    'getStudentResults',
    'getLessonDetails',
    'getLiveMonitoringData'
  ].includes(action);

  const cacheKey = `${action}:${JSON.stringify(payload)}`;

  if (isReadOnlyAction && !bypassCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  await acquireSlot(isPriority);

  try {
    let lastError: Error | null = null;
    const targetUrl = url;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        // Wait before retrying (exponential backoff: 600ms, 1200ms)
        await new Promise((res) => setTimeout(res, attempt * 600));
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            action,
            ...payload,
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        const responseText = await response.text();

        if (!response.ok) {
          if (response.status === 404 || responseText.includes('404') || responseText.includes('找不到網頁')) {
            throw new Error('خطأ 404 (غير موجود): رابط خادم Google Apps Script غير متاح على خوادم غوغل. يرجى التأكد من اختيار (Deploy > New deployment > Web App) وضبط (Who has access: Anyone).');
          }
          throw new Error(`حالة الاستجابة: ${response.status} ${response.statusText}`);
        }

        let data: any;
        try {
          data = JSON.parse(responseText);
        } catch (jsonErr) {
          if (
            responseText.includes('404') ||
            responseText.includes('找不到網頁') ||
            responseText.includes('Unable to open file') ||
            responseText.includes('Google Drive') ||
            responseText.includes('doctype html') ||
            responseText.includes('DOCTYPE html')
          ) {
            throw new Error('خطأ 404 (الصفحة غير موجودة): الرابط يرجع صفحة خطأ من غوغل (الصفحة غير متاحة أو تتطلب إعادة النشر بصلاحية Anyone كإصدار جديد New Version).');
          }
          throw new Error('الاستجابة من الخادم ليست بصيغة JSON. يرجى التأكد من نشر السكريبت كـ Web App واختيار (Anyone/الجميع).');
        }

        if (data && data.error) {
          throw new Error(data.error);
        }

        if (isReadOnlyAction) {
          apiCache.set(cacheKey, { timestamp: Date.now(), data });
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timer);
        let msg = err.message || '';

        if (err.name === 'AbortError') {
          msg = `انتهت مهلة الاتصال بالخادم (${timeoutMs / 1000} ثانية). الخادم يستغرق وقتاً أطول من المتوقع.`;
        } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          msg = 'فشل الاتصال بالشبكة أو تم حظر الطلب (CORS/NetworkError). يرجى التأكد من صحة الرابط وأن نشر السكريبت بصلاحية "Anyone".';
        }
        lastError = new Error(msg);

        // If it's the last attempt, don't retry anymore
        if (attempt === maxRetries) {
          break;
        }
      }
    }

    throw lastError || new Error('فشل الاتصال بالخادم بعد عدة محاولات');
  } finally {
    releaseSlot();
  }
}

/**
 * Helper to transform any Google Drive link or standard image URL into a working thumbnail image URL.
 */
export function transformGoogleDriveImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|d\/|open\?id=|uc\?.*id=|thumbnail\?.*id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{20,})/i;
  const match = trimmed.match(driveRegex) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/i);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }

  return trimmed;
}
