/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Default Google Apps Script Web App URL
// You can set this variable directly or set VITE_GAS_API_URL in Vercel environment variables
export const DEFAULT_GAS_API_URL = "https://script.google.com/macros/s/AKfycbwUm-285QCFSB40pDMf8g_HZEgIwmwrm-wOGawxtp3vs2KEqmhM_9tvCfK3coLRsl_p3g/exec";

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
  localStorage.setItem('gas_api_url', url.trim());
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
const CACHE_TTL_MS = 15000; // 15 seconds short cache for GET-like actions

// Simple Queue to limit concurrency to Google Apps Script (Max 2 simultaneous requests)
let activeRequestsCount = 0;
const MAX_CONCURRENT_REQUESTS = 2;
const requestQueue: (() => void)[] = [];

async function acquireSlot(): Promise<void> {
  if (activeRequestsCount < MAX_CONCURRENT_REQUESTS) {
    activeRequestsCount++;
    return;
  }
  return new Promise<void>((resolve) => {
    requestQueue.push(() => {
      activeRequestsCount++;
      resolve();
    });
  });
}

function releaseSlot(): void {
  activeRequestsCount--;
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

/**
 * Generic API Caller to Google Apps Script Web App with retry, timeout, concurrency limiting, and caching
 */
export async function callGasApi<T>(
  action: string,
  payload: Record<string, any> = {},
  options: { bypassCache?: boolean; retries?: number; timeoutMs?: number } = {}
): Promise<T> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('لم يتم تكوين رابط Google Apps Script بعد. يرجى تهيئة الاتصال من الإعدادات.');
  }

  const bypassCache = options.bypassCache ?? false;
  const maxRetries = options.retries ?? 2;
  const timeoutMs = options.timeoutMs ?? 15000;

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
    'getLetters',
    'getLessonsFromMatches',
    'getStudentsEvaluations'
  ].includes(action);

  const cacheKey = `${action}:${JSON.stringify(payload)}`;

  if (isReadOnlyAction && !bypassCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  await acquireSlot();

  try {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        // Wait before retrying (exponential backoff: 600ms, 1200ms)
        await new Promise((res) => setTimeout(res, attempt * 600));
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
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

        if (!response.ok) {
          throw new Error(`حالة الاستجابة: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
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
          msg = 'انتهت مهلة الاتصال بالخادم (استغرق الخادم وقتاً أطول من المتوقع)';
        } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          msg = 'فشل الاتصال بالشبكة أو انقطع الاتصال بخادم Google Apps Script';
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
