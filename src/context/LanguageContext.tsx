/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  LANGUAGE_OPTIONS,
  TranslationDictionary,
  defaultTranslations,
  LanguageOption,
} from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageOption: LanguageOption;
  t: (keyPath: string, fallback?: string) => string;
  translationsDict: TranslationDictionary;
  updateTranslationsDict: (newDict: TranslationDictionary) => void;
  resetTranslationsDict: () => void;
}

const STORAGE_LANG_KEY = 'app_language_code';
const STORAGE_I18N_OVERRIDES_KEY = 'app_i18n_dictionary_overrides';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language;
    return saved && ['ar', 'en', 'th'].includes(saved) ? saved : 'ar';
  });

  const [translationsDict, setTranslationsDict] = useState<TranslationDictionary>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_I18N_OVERRIDES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with defaults so newly added keys are always present
        const merged = { ...defaultTranslations };
        Object.keys(parsed).forEach((sec) => {
          if (!merged[sec]) merged[sec] = {};
          Object.keys(parsed[sec]).forEach((k) => {
            merged[sec][k] = { ...merged[sec][k], ...parsed[sec][k] };
          });
        });
        return merged;
      }
    } catch (e) {
      console.warn('Failed to parse i18n overrides from localStorage:', e);
    }
    return defaultTranslations;
  });

  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  // Update HTML document attributes when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = currentOption.dir;
    localStorage.setItem(STORAGE_LANG_KEY, language);
  }, [language, currentOption.dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const updateTranslationsDict = (newDict: TranslationDictionary) => {
    setTranslationsDict(newDict);
    try {
      localStorage.setItem(STORAGE_I18N_OVERRIDES_KEY, JSON.stringify(newDict));
    } catch (e) {
      console.error('Failed to save translation overrides:', e);
    }
  };

  const resetTranslationsDict = () => {
    setTranslationsDict(defaultTranslations);
    localStorage.removeItem(STORAGE_I18N_OVERRIDES_KEY);
  };

  /**
   * Helper function t('section.key')
   * Example: t('common.appName')
   */
  const t = (keyPath: string, fallback?: string): string => {
    if (!keyPath) return fallback || '';
    const parts = keyPath.split('.');
    if (parts.length < 2) return fallback || keyPath;

    const [section, key] = parts;
    const secObj = translationsDict[section];
    if (secObj && secObj[key]) {
      const val = secObj[key][language];
      if (val !== undefined && val !== '') {
        return val;
      }
      // Fallback to Arabic if current language translation is missing
      if (secObj[key]['ar']) {
        return secObj[key]['ar'];
      }
    }

    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languageOption: currentOption,
        t,
        translationsDict,
        updateTranslationsDict,
        resetTranslationsDict,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
