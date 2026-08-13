import React, { useState, useEffect } from 'react';
import { callGasApi, transformGoogleDriveImageUrl } from '../utils/api';
import { PdfSettings, CertificateConfig, SignatureConfig, StampConfig } from '../types';
import {
  Award,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileText,
  HelpCircle,
  Sparkles,
  Sliders,
  Type,
  Layers,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink
} from 'lucide-react';

export const defaultPdfSettings: PdfSettings = {
  backgroundUrl: '',
  imagesBeforeTable: [],
  imagesAfterTable: [],
  customImageSizes: {
    img1Width: '150px', img1Height: 'auto',
    img2Width: '150px', img2Height: 'auto',
    img3Width: '150px', img3Height: 'auto',
    img4Width: '150px', img4Height: 'auto',
    img5Width: '150px', img5Height: 'auto',
  },
  certificates: [
    {
      id: 'cert_1',
      pagePosition: 3,
      subjectText: 'شهادة شكر وتقدير واعتزاز',
      subjectFontSize: '26px',
      subjectAlign: 'center',
      subjectFontFamily: 'Amiri',
      bodyText: 'تتقدم إدارة المنصة بخالص الشكر والتقدير للبطل المتميز:\n★ {{اسم_الطالب}} ★\nوذلك لتميزه واجتهاده العالي في أداء الدروس والواجبات المدرسية بالكامل.\nمتمنين له دوام التوفيق والنجاح والدراسات المتميزة.',
      bodyFontSize: '18px',
      bodyAlign: 'center',
      bodyFontFamily: 'Tajawal',
      frameUrl: '',
      marginTop: '25mm',
      marginSide: '20mm',
      marginBottom: '20mm',
      footerImageUrl: '',
      footerImageHeight: '120px',
      footerImageAlign: 'center',
      signatures: [],
      stamps: []
    }
  ]
};

export default function PdfSettingsManager() {
  const [settings, setSettings] = useState<PdfSettings>(defaultPdfSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeCertTab, setActiveCertTab] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(true);

  useEffect(() => {
    fetchPdfSettings();
  }, []);

  const fetchPdfSettings = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const data = await callGasApi<PdfSettings | null>('getPdfSettings');
      if (data && typeof data === 'object') {
        setSettings({
          backgroundUrl: data.backgroundUrl || '',
          imagesBeforeTable: Array.isArray(data.imagesBeforeTable) ? data.imagesBeforeTable : [],
          imagesAfterTable: Array.isArray(data.imagesAfterTable) ? data.imagesAfterTable : [],
          customImageSizes: {
            img1Width: data.customImageSizes?.img1Width || '150px',
            img1Height: data.customImageSizes?.img1Height || 'auto',
            img2Width: data.customImageSizes?.img2Width || '150px',
            img2Height: data.customImageSizes?.img2Height || 'auto',
            img3Width: data.customImageSizes?.img3Width || '150px',
            img3Height: data.customImageSizes?.img3Height || 'auto',
            img4Width: data.customImageSizes?.img4Width || '150px',
            img4Height: data.customImageSizes?.img4Height || 'auto',
            img5Width: data.customImageSizes?.img5Width || '150px',
            img5Height: data.customImageSizes?.img5Height || 'auto',
          },
          certificates: Array.isArray(data.certificates) && data.certificates.length > 0
            ? data.certificates
            : defaultPdfSettings.certificates
        });
      }
    } catch (err) {
      console.error('Error fetching PDF settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await callGasApi<{ success: boolean; message?: string }>('savePdfSettings', {
        pdfSettings: settings
      }, { timeoutMs: 35000 });
      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'تم حفظ إعدادات PDF والشهادات بنجاح' });
      } else {
        setMessage({ type: 'error', text: res?.message || 'تعذر حفظ الإعدادات' });
      }
    } catch (err: any) {
      console.error('Error saving PDF settings:', err);
      setMessage({ type: 'error', text: err?.message ? `حدث خطأ أثناء حفظ الإعدادات: ${err.message}` : 'حدث خطأ أثناء حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('هل أنت تأكد من إعادة جميع إعدادات الـ PDF والشهادات إلى القيم الافتراضية؟')) {
      setSettings(defaultPdfSettings);
      setMessage({ type: 'success', text: 'تمت إعادة الإعدادات إلى القيم الافتراضية. لا تنس الضغط على حفظ.' });
    }
  };

  // Helper for imagesBeforeTable
  const addImageBefore = () => {
    setSettings(prev => ({
      ...prev,
      imagesBeforeTable: [...prev.imagesBeforeTable, '']
    }));
  };

  const updateImageBefore = (index: number, val: string) => {
    setSettings(prev => {
      const updated = [...prev.imagesBeforeTable];
      updated[index] = val;
      return { ...prev, imagesBeforeTable: updated };
    });
  };

  const removeImageBefore = (index: number) => {
    setSettings(prev => ({
      ...prev,
      imagesBeforeTable: prev.imagesBeforeTable.filter((_, i) => i !== index)
    }));
  };

  // Helper for imagesAfterTable
  const addImageAfter = () => {
    setSettings(prev => ({
      ...prev,
      imagesAfterTable: [...prev.imagesAfterTable, '']
    }));
  };

  const updateImageAfter = (index: number, val: string) => {
    setSettings(prev => {
      const updated = [...prev.imagesAfterTable];
      updated[index] = val;
      return { ...prev, imagesAfterTable: updated };
    });
  };

  const removeImageAfter = (index: number) => {
    setSettings(prev => ({
      ...prev,
      imagesAfterTable: prev.imagesAfterTable.filter((_, i) => i !== index)
    }));
  };

  // Certificates helpers
  const addCertificate = () => {
    const newCert: CertificateConfig = {
      id: 'cert_' + Date.now(),
      pagePosition: settings.certificates.length + 3,
      frameUrl: '',
      marginTop: '25mm',
      marginSide: '20mm',
      marginBottom: '20mm',
      footerImageUrl: '',
      footerImageHeight: '120px',
      footerImageAlign: 'center',
      subjectText: 'شهادة جديدة',
      subjectFontSize: '24px',
      subjectAlign: 'center',
      subjectFontFamily: 'Amiri',
      bodyText: 'نص الشهادة للبطل: {{اسم_الطالب}}',
      bodyFontSize: '16px',
      bodyAlign: 'center',
      bodyFontFamily: 'Tajawal',
      signatures: [],
      stamps: []
    };
    setSettings(prev => ({
      ...prev,
      certificates: [...prev.certificates, newCert]
    }));
    setActiveCertTab(settings.certificates.length);
  };

  const removeCertificate = (certIndex: number) => {
    if (settings.certificates.length <= 1) {
      alert('يجب الإبقاء على شهادة واحدة على الأقل');
      return;
    }
    if (window.confirm('هل أنت تأكد من حذف هذه الشهادة؟')) {
      setSettings(prev => ({
        ...prev,
        certificates: prev.certificates.filter((_, i) => i !== certIndex)
      }));
      setActiveCertTab(Math.max(0, certIndex - 1));
    }
  };

  const updateCertField = (certIndex: number, field: keyof CertificateConfig, val: any) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      certs[certIndex] = { ...certs[certIndex], [field]: val };
      return { ...prev, certificates: certs };
    });
  };

  // Insert placeholder into certificate bodyText
  const insertPlaceholderToCertBody = (certIndex: number, placeholder: string) => {
    const currentText = settings.certificates[certIndex]?.bodyText || '';
    updateCertField(certIndex, 'bodyText', currentText + ' ' + placeholder);
  };

  // Signatures helpers
  const addSignature = (certIndex: number) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      const curSigs = certs[certIndex].signatures || [];
      const newSig: SignatureConfig = {
        id: 'sig_' + Date.now(),
        url: '',
        title: 'توقيع إضافي',
        width: '110px',
        height: 'auto'
      };
      certs[certIndex] = { ...certs[certIndex], signatures: [...curSigs, newSig] };
      return { ...prev, certificates: certs };
    });
  };

  const updateSignature = (certIndex: number, sigIndex: number, field: keyof SignatureConfig, val: string) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      const sigs = [...certs[certIndex].signatures];
      sigs[sigIndex] = { ...sigs[sigIndex], [field]: val };
      certs[certIndex] = { ...certs[certIndex], signatures: sigs };
      return { ...prev, certificates: certs };
    });
  };

  const removeSignature = (certIndex: number, sigIndex: number) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      certs[certIndex] = {
        ...certs[certIndex],
        signatures: certs[certIndex].signatures.filter((_, i) => i !== sigIndex)
      };
      return { ...prev, certificates: certs };
    });
  };

  // Stamps helpers
  const addStamp = (certIndex: number) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      const curStamps = certs[certIndex].stamps || [];
      const newStamp: StampConfig = {
        id: 'stamp_' + Date.now(),
        url: '',
        title: 'ختم إضافي',
        width: '100px',
        height: 'auto'
      };
      certs[certIndex] = { ...certs[certIndex], stamps: [...curStamps, newStamp] };
      return { ...prev, certificates: certs };
    });
  };

  const updateStamp = (certIndex: number, stampIndex: number, field: keyof StampConfig, val: string) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      const stamps = [...certs[certIndex].stamps];
      stamps[stampIndex] = { ...stamps[stampIndex], [field]: val };
      certs[certIndex] = { ...certs[certIndex], stamps: stamps };
      return { ...prev, certificates: certs };
    });
  };

  const removeStamp = (certIndex: number, stampIndex: number) => {
    setSettings(prev => {
      const certs = [...prev.certificates];
      certs[certIndex] = {
        ...certs[certIndex],
        stamps: certs[certIndex].stamps.filter((_, i) => i !== stampIndex)
      };
      return { ...prev, certificates: certs };
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm my-6">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="font-bold text-slate-700">جاري تحميل إعدادات الـ PDF والشهادات...</p>
      </div>
    );
  }

  const currentCert = settings.certificates[activeCertTab] || settings.certificates[0];

  return (
    <div className="space-y-8 font-sans text-slate-800" dir="rtl">
      {/* Top Banner / Actions Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>لوحة التحكم المتقدمة بالتقارير والشهادات</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">إعدادات PDF والشهادات الاحترافية</h2>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl leading-relaxed">
              قم بتخصيص صور الأغلفة العامة، الصفحات التمهيدية والختامية، والشهادات المخصصة مع التوافق التام مع الكلمات المفتاحية الذكية في شيت الطالب.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetDefault}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>الافتراضي</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* Section 1: General Background & Cover Pages */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">1. خلفية وأغلفة ملف الـ PDF العامة (قياس A4)</h3>
            <p className="text-xs text-slate-500">إضافة صور خلفية موحدة أو صور قبل وبعد الجداول لتنسيق الملف بالشكل الكامل.</p>
          </div>
        </div>

        {/* Background Image URL */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            رابط صورة الخلفية العامة لجميع صفحات الـ PDF (رابط Google Drive أو رابط مباشر):
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={settings.backgroundUrl || ''}
              onChange={e => setSettings({ ...settings, backgroundUrl: e.target.value })}
              placeholder="https://drive.google.com/file/d/... أو رابط صورة مباشر"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {settings.backgroundUrl && (
              <a
                href={transformGoogleDriveImageUrl(settings.backgroundUrl)}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-600 text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Eye className="w-4 h-4 text-teal-600" />
                <span>معاينة</span>
              </a>
            )}
          </div>
        </div>

        {/* Images Before Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>روابط صور قبل الجداول (أغلفة / صفحات افتتاحية - ملء ورقة A4):</span>
            </label>
            <button
              onClick={addImageBefore}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صورة قبل الجدول</span>
            </button>
          </div>

          {settings.imagesBeforeTable.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              لا توجد صور مضافة قبل الجدول. اضغط زر الإضافة أعلاه لإدراج غلاف أو صورة افتتاحية.
            </div>
          ) : (
            <div className="space-y-2">
              {settings.imagesBeforeTable.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-black text-slate-400 w-6 text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={e => updateImageBefore(idx, e.target.value)}
                    placeholder="رابط صورة قبل الجدول..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {imgUrl && (
                    <img
                      src={transformGoogleDriveImageUrl(imgUrl)}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                    />
                  )}
                  <button
                    onClick={() => removeImageBefore(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images After Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>روابط صور بعد الجداول (صفحات ختامية / ملاحق - ملء ورقة A4):</span>
            </label>
            <button
              onClick={addImageAfter}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-teal-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صورة بعد الجدول</span>
            </button>
          </div>

          {settings.imagesAfterTable.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              لا توجد صور مضافة بعد الجدول. اضغط زر الإضافة أعلاه لإدراج صفحة ختامية أو ملحق.
            </div>
          ) : (
            <div className="space-y-2">
              {settings.imagesAfterTable.map((imgUrl, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-black text-slate-400 w-6 text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={e => updateImageAfter(idx, e.target.value)}
                    placeholder="رابط صورة بعد الجدول..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {imgUrl && (
                    <img
                      src={transformGoogleDriveImageUrl(imgUrl)}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                    />
                  )}
                  <button
                    onClick={() => removeImageAfter(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Certificates Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">2. إدارة وتخصيص الشهادات والتقديرات</h3>
              <p className="text-xs text-slate-500">إضافة شهادة أو أكثر (مثل شهادة عربي / إنجليزي / تقدير إضافي) مع التحكم بأحجام صورها وبمكان ظهورها والخطوط والتواقيع.</p>
            </div>
          </div>

          <button
            onClick={addCertificate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة شهادة جديدة</span>
          </button>
        </div>

        {/* Certificate Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
          {settings.certificates.map((cert, cIdx) => (
            <button
              key={cert.id || cIdx}
              onClick={() => setActiveCertTab(cIdx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                activeCertTab === cIdx
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>{cert.subjectText || `شهادة #${cIdx + 1}`}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-mono">
                صـ {cert.pagePosition || 3}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Certificate Editor */}
        {currentCert && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-indigo-950">إعدادات الشهادة النشطة (#{activeCertTab + 1})</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">رقم الصفحة للشهادة:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={currentCert.pagePosition || 3}
                    onChange={e => updateCertField(activeCertTab, 'pagePosition', parseInt(e.target.value) || 1)}
                    className="w-16 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-center font-bold text-indigo-900"
                  />
                </div>
              </div>

              {settings.certificates.length > 1 && (
                <button
                  onClick={() => removeCertificate(activeCertTab)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذه الشهادة</span>
                </button>
              )}
            </div>

            {/* Certificate Frame Image Configuration */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>إطار الشهادة الخاص (صورة مفرغة PNG تظهر كـ Frame فوق خلفية الملف):</span>
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">رابط صورة إطار الشهادة المفرغة (PNG):</label>
                <input
                  type="text"
                  value={currentCert.frameUrl || ''}
                  onChange={e => updateCertField(activeCertTab, 'frameUrl', e.target.value)}
                  placeholder="ضع رابط صورة الإطار المفرغة PNG هنا..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">عند إضافة صورة إطار، يتم تغطية كامل ورقة الشهادة بالإطار المفرغ فوق الخلفية وتكون النصوص بداخله.</p>
              </div>
            </div>

            {/* Certificate Spacing / Margins Configuration */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>التحكم في هوامش ومسافات نص الشهادة (لإبعاد النص عن حدود الإطار):</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الهامش العلوي (Top):</label>
                  <input
                    type="text"
                    value={currentCert.marginTop || '25mm'}
                    onChange={e => updateCertField(activeCertTab, 'marginTop', e.target.value)}
                    placeholder="مثلاً: 25mm أو 40px"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الهوامش الجانبية (Sides):</label>
                  <input
                    type="text"
                    value={currentCert.marginSide || '20mm'}
                    onChange={e => updateCertField(activeCertTab, 'marginSide', e.target.value)}
                    placeholder="مثلاً: 20mm أو 30px"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">الهامش السفلي (Bottom):</label>
                  <input
                    type="text"
                    value={currentCert.marginBottom || '20mm'}
                    onChange={e => updateCertField(activeCertTab, 'marginBottom', e.target.value)}
                    placeholder="مثلاً: 20mm أو 30px"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Per-Certificate Custom Image Sizes for {{صورة 1}} to {{صورة 5}} */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-200/50 pb-2">
                <Sliders className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-black text-amber-950">
                  التحكم بحجم الصور المتغيرة {'{{صورة 1}}'} إلى {'{{صورة 5}}'} المخصصة لهاته الشهادة:
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                تخصيص أبعاد وعرض وارتفاع الصور المستدعاة من أرقام الشيت لهذه الشهادة تحديداً. يمكنك جعل الصور كبيرة في هذه الشهادة وصغيرة في شهادات أخرى.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(num => {
                  const wKey = `img${num}Width` as keyof typeof currentCert.customImageSizes;
                  const hKey = `img${num}Height` as keyof typeof currentCert.customImageSizes;
                  const certSizes = currentCert.customImageSizes || settings.customImageSizes || {};
                  const currentWidth = certSizes[wKey] || '150px';
                  const currentHeight = certSizes[hKey] || 'auto';

                  const updateCertImgSize = (key: string, val: string) => {
                    const updatedCerts = [...settings.certificates];
                    const targetC = updatedCerts[activeCertTab];
                    const existingSizes = targetC.customImageSizes || { ...settings.customImageSizes };
                    updatedCerts[activeCertTab] = {
                      ...targetC,
                      customImageSizes: {
                        ...existingSizes,
                        [key]: val
                      }
                    };
                    setSettings({ ...settings, certificates: updatedCerts });
                  };

                  return (
                    <div key={num} className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-xs space-y-2">
                      <div className="text-xs font-black text-amber-900 flex items-center justify-between">
                        <span>صورة {num}</span>
                        <span className="text-[10px] text-amber-600 font-mono">{`{{صورة ${num}}}`}</span>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">العرض (Width):</label>
                        <input
                          type="text"
                          value={currentWidth}
                          onChange={e => updateCertImgSize(`img${num}Width`, e.target.value)}
                          placeholder="150px أو 100%"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">الارتفاع (Height):</label>
                        <input
                          type="text"
                          value={currentHeight}
                          onChange={e => updateCertImgSize(`img${num}Height`, e.target.value)}
                          placeholder="auto أو 180px"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Configuration */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-600" />
                <span>عنوان / موضوع الشهادة:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">نص الموضوع:</label>
                  <input
                    type="text"
                    value={currentCert.subjectText || ''}
                    onChange={e => updateCertField(activeCertTab, 'subjectText', e.target.value)}
                    placeholder="مثلاً: شهادة شكر وتقدير واعتزاز"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">حجم الخط:</label>
                  <select
                    value={currentCert.subjectFontSize || '26px'}
                    onChange={e => updateCertField(activeCertTab, 'subjectFontSize', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="20px">20px - صغير</option>
                    <option value="24px">24px - متوسط</option>
                    <option value="26px">26px - قياسي</option>
                    <option value="32px">32px - كبير</option>
                    <option value="40px">40px - كبير جداً</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">المحاذاة:</label>
                  <select
                    value={currentCert.subjectAlign || 'center'}
                    onChange={e => updateCertField(activeCertTab, 'subjectAlign', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="center">وسط (Center)</option>
                    <option value="right">يمين (Right)</option>
                    <option value="left">يسار (Left)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Certificate Body Content */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>نص محتوى الشهادة (يقبل السطور المترادفة والكلمات المفتاحية الذكية):</span>
                </h4>

                {/* Quick Insert Placeholders Bar */}
                <div className="flex flex-wrap gap-1">
                  {['{{اسم_الطالب}}', '{{نص 1}}', '{{صورة 1}}', '{{تاريخ_الإصدار}}'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => insertPlaceholderToCertBody(activeCertTab, tag)}
                      className="px-2 py-0.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-md text-[10px] font-bold font-mono transition"
                      title="إدراج في نص الشهادة"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={5}
                value={currentCert.bodyText || ''}
                onChange={e => updateCertField(activeCertTab, 'bodyText', e.target.value)}
                placeholder="تكتب نص الشهادة هنا... يدعم أسطر متعددة واستبدال تلقائي لـ {{اسم_الطالب}} و {{نص 1}} و {{صورة 1}}..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-indigo-500"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">حجم خط النص:</label>
                  <select
                    value={currentCert.bodyFontSize || '18px'}
                    onChange={e => updateCertField(activeCertTab, 'bodyFontSize', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px - قياسي</option>
                    <option value="20px">20px</option>
                    <option value="22px">22px</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">محاذاة النص:</label>
                  <select
                    value={currentCert.bodyAlign || 'center'}
                    onChange={e => updateCertField(activeCertTab, 'bodyAlign', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="center">وسط (Center)</option>
                    <option value="right">يمين (Right)</option>
                    <option value="left">يسار (Left)</option>
                    <option value="justify">ضبط كامل (Justify)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع الخط:</label>
                  <select
                    value={currentCert.bodyFontFamily || 'Tajawal'}
                    onChange={e => updateCertField(activeCertTab, 'bodyFontFamily', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="Tajawal">تجوال (Tajawal)</option>
                    <option value="Amiri">الأميري (Amiri)</option>
                    <option value="Cairo">القاهرة (Cairo)</option>
                    <option value="Segoe UI">Segoe UI / Arial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Image / Signatures & Stamp Integrated Image */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>صورة الجزء السفلي للشهادة (التواقيع والختم المدمجة في صورة واحدة):</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">رابط صورة الجزء السفلي (توقيع وختم مدمج):</label>
                  <input
                    type="text"
                    value={currentCert.footerImageUrl || ''}
                    onChange={e => updateCertField(activeCertTab, 'footerImageUrl', e.target.value)}
                    placeholder="ضع رابط صورة الجزء السفلي المدمجة..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ارتفاع الصورة (الارتفاع):</label>
                  <input
                    type="text"
                    value={currentCert.footerImageHeight || '120px'}
                    onChange={e => updateCertField(activeCertTab, 'footerImageHeight', e.target.value)}
                    placeholder="مثلاً: 120px أو 150px"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Live Certificate Preview Box */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>معاينة حية لشكل الشهادة (نموذج توضيحي للطالب البطل: أحمد):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Page #{currentCert.pagePosition || 3}</span>
              </div>

              <div className="w-full flex justify-center py-4 bg-slate-950/60 rounded-xl overflow-x-auto">
                <div
                  className="bg-white text-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-between w-full max-w-[440px] aspect-[1/1.414] border border-slate-200/90 rounded-sm my-2 transition-all"
                  style={{
                    paddingTop: currentCert.marginTop || '25px',
                    paddingRight: currentCert.marginSide || '20px',
                    paddingLeft: currentCert.marginSide || '20px',
                    paddingBottom: currentCert.marginBottom || '20px',
                  }}
                  dir="rtl"
                >
                {/* Background image preview if present */}
                {settings.backgroundUrl && (
                  <img
                    src={transformGoogleDriveImageUrl(settings.backgroundUrl)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none z-0"
                  />
                )}

                {/* Frame image preview if present */}
                {currentCert.frameUrl && (
                  <img
                    src={transformGoogleDriveImageUrl(currentCert.frameUrl)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                  />
                )}

                <div className="relative z-10 text-center space-y-4">
                  <h3
                    style={{
                      fontSize: currentCert.subjectFontSize || '26px',
                      textAlign: currentCert.subjectAlign || 'center',
                      fontFamily: currentCert.subjectFontFamily || 'Amiri',
                      fontWeight: 'bold',
                      color: '#0f172a'
                    }}
                  >
                    {currentCert.subjectText || 'شهادة شكر وتقدير واعتزاز'}
                  </h3>

                  <div
                    style={{
                      fontSize: currentCert.bodyFontSize || '18px',
                      textAlign: currentCert.bodyAlign || 'center',
                      fontFamily: currentCert.bodyFontFamily || 'Tajawal',
                      whiteSpace: 'pre-line',
                      color: '#334155',
                      lineHeight: '1.8'
                    }}
                  >
                    {(currentCert.bodyText || '').replace(/\{\{اسم_الطالب\}\}/g, 'أحمد العتيبي').replace(/\{\{رقم_الطالب\}\}/g, '1024')}
                  </div>
                </div>

                {/* Bottom Image / Signatures Row */}
                {currentCert.footerImageUrl ? (
                  <div className="relative z-10 text-center mt-6">
                    <img
                      src={transformGoogleDriveImageUrl(currentCert.footerImageUrl)}
                      alt="التواقيع والختم المدمجة"
                      style={{ height: currentCert.footerImageHeight || '120px' }}
                      className="inline-block max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : ((currentCert.signatures && currentCert.signatures.some(s => s.url || s.title)) || (currentCert.stamps && currentCert.stamps.some(st => st.url || st.title))) ? (
                  <div className="relative z-10 flex items-end justify-around mt-8 pt-6 border-t border-slate-200/80 text-center">
                    {(currentCert.signatures || []).filter(s => s.url || s.title).map((sig, idx) => (
                      <div key={sig.id || idx} className="flex flex-col items-center">
                        {sig.url && (
                          <img
                            src={transformGoogleDriveImageUrl(sig.url)}
                            alt=""
                            style={{ width: sig.width || '110px', height: sig.height || 'auto' }}
                            className="object-contain mb-1"
                            loading="lazy"
                          />
                        )}
                        {sig.title && <span className="text-[11px] font-bold text-slate-800">{sig.title}</span>}
                      </div>
                    ))}

                    {(currentCert.stamps || []).filter(st => st.url || st.title).map((stamp, idx) => (
                      <div key={stamp.id || idx} className="flex flex-col items-center">
                        {stamp.url && (
                          <img
                            src={transformGoogleDriveImageUrl(stamp.url)}
                            alt=""
                            style={{ width: stamp.width || '90px', height: stamp.height || 'auto' }}
                            className="object-contain mb-1"
                            loading="lazy"
                          />
                        )}
                        {stamp.title && <span className="text-[11px] font-bold text-slate-800">{stamp.title}</span>}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Section 4: Smart Placeholders Guide */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">دليل الكلمات المفتاحية الذكية لاستبدال بيانات الطالب تلقائياً</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-mono text-emerald-400 font-bold">{`{{اسم_الطالب}}`} أو {`{{اسم الطالب}}`}</span>
            <p className="text-slate-300">يستبدل تلقائياً باسم الطالب من ورقة النتائج والـ PDF.</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-mono text-emerald-400 font-bold">{`{{رقم_الطالب}}`} أو {`{{رقم الطالب}}`}</span>
            <p className="text-slate-300">يستبدل برقم هوية/معرف الطالب (ID).</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-mono text-amber-400 font-bold">{`{{نص 1}}`} إلى {`{{نص 10}}`}</span>
            <p className="text-slate-300">يجلب القيمة المكتوبة في الأعمدة L إلى U في ورقة <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">PDF</code> الخاصة بالطالب.</p>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
            <span className="font-mono text-teal-400 font-bold">{`{{صورة 1}}`} إلى {`{{صورة 5}}`}</span>
            <p className="text-slate-300">يعرض الصورة المرفوعة في الأعمدة G إلى K في ورقة <code className="bg-slate-900 px-1 py-0.5 rounded text-teal-300">PDF</code> بالحجم المخصص المقابل.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
