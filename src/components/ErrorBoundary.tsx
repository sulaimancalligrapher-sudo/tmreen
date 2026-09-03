/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ErrorInfo, ReactNode } from 'react';
import { RotateCcw, RefreshCw, ShieldAlert } from 'lucide-react';
import { resetApiUrlToDefault } from '../utils/api';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught runtime error in React tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndClean = () => {
    try {
      resetApiUrlToDefault();
      localStorage.removeItem('cached_general_data');
      localStorage.removeItem('cached_home_content');
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'حدث خطأ غير متوقع أثناء عرض الصفحة';

      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-slate-950"
        >
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="bg-rose-500/20 text-rose-400 p-3 rounded-2xl shrink-0 border border-rose-500/30">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  تعذر عرض الصفحة مؤقتاً
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  تم التقاط خطأ في معالجة البيانات، والمنصة جاهزة لإعادة الضبط بأمان.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-bold text-amber-400 block">
                تفاصيل الاستجابة / الخطأ:
              </span>
              <p className="text-xs font-mono text-rose-300 break-words leading-relaxed" dir="ltr">
                {errorMsg}
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200 leading-relaxed space-y-1">
              <p className="font-bold">💡 إرشاد سريع:</p>
              <p>
                إذا قمت مؤخراً بتغيير رابط الـ Web App، يرجى التأكد من أن الرابط منسوخ من (Deploy &gt; New deployment &gt; Anyone) وأنه غير خاص. يمكنك الضغط على الزر أدناه لاستعادة الرابط الافتراضي فوراً.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 min-w-[140px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs md:text-sm shadow-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleResetAndClean}
                className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs md:text-sm border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>استعادة الرابط ومسح الكاش</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
