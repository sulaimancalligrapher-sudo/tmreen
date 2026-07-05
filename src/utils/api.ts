/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Retrieve Google Apps Script Web App URL from localStorage
export function getApiUrl(): string {
  return localStorage.getItem('gas_api_url') || '';
}

export function setApiUrl(url: string): void {
  localStorage.setItem('gas_api_url', url.trim());
}

// Check if API URL is configured
export function isApiConfigured(): boolean {
  const url = getApiUrl();
  return url.length > 0 && (url.startsWith('https://script.google.com/') || url.includes('localhost'));
}

/**
 * Generic API Caller to Google Apps Script Web App
 */
export async function callGasApi<T>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('لم يتم تكوين رابط Google Apps Script بعد. يرجى تهيئة الاتصال من الإعدادات.');
  }

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain', // GAS doPost requires text/plain or no-cors sometimes to avoid pre-flight options
    },
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`فشل الاتصال بالخادم: ${response.statusText}`);
  }

  const data = await response.json();
  if (data && data.error) {
    throw new Error(data.error);
  }
  return data as T;
}
