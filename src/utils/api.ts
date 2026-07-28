/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Default Google Apps Script Web App URL
// You can set this variable directly or set VITE_GAS_API_URL in Vercel environment variables
export const DEFAULT_GAS_API_URL = "https://script.google.com/macros/s/AKfycbzTvj2elKZ0Dsec8xd1w01wBLA6SBHjJjiQbFiHtI3i1tAg3wpIDE3UwD1FM3NKYcZkog/exec";

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
