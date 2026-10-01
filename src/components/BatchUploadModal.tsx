import React, { useState } from 'react';
import { MenuItem } from '../types/dining.ts';
import { parseUploadedFile, downloadTemplateFile } from '../utils/excelExport.ts';
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle } from 'lucide-react';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMenus: (newMenus: MenuItem[], replaceAll: boolean) => void;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onImportMenus,
}) => {
  const [parsedItems, setParsedItems] = useState<Partial<MenuItem>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [replaceAll, setReplaceAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const items = await parseUploadedFile(file);
      if (items.length === 0) {
        setErrorMessage('파일 내에 유효한 메뉴 데이터 행이 없습니다.');
      } else {
        setParsedItems(items);
      }
    } catch (err: any) {
      setErrorMessage(
        '파일을 분석하는 도중 오류가 발생했습니다. 양식을 다시 확인해 주세요: ' +
          (err?.message || '')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;

    // Convert partial items into fully typed MenuItems
    const completeItems: MenuItem[] = parsedItems.map((p, idx) => ({
      id: p.id || `menu-imported-${Date.now()}-${idx}`,
      date: p.date || new Date().toISOString().slice(0, 10),
      restaurantId: p.restaurantId || 'rest-student-union',
      restaurantName: p.restaurantName || '학생회관 식당',
      mealType: p.mealType || '중식',
      name: p.name || '미지정 메뉴',
      price: p.price || 5000,
      category: p.category || '한식',
      caloriesKcal: p.caloriesKcal || 650,
      mainIngredients: p.mainIngredients || [
        { name: '주원료', amountPerServingGrams: 150, category: '육류' },
        { name: '백미', amountPerServingGrams: 130, category: '곡류' },
      ],
      reservedCount: p.reservedCount || 0,
      interestedCount: p.interestedCount || 0,
      rating: p.rating || 4.5,
      reviewCount: p.reviewCount || 0,
      reviews: p.reviews || [],
      peakTime: p.peakTime || '12:15 ~ 12:45',
      estimatedWaitMinutes: p.estimatedWaitMinutes || 10,
      congestion: p.congestion || '보통',
      isSoldOut: false,
      stockPrepared: p.stockPrepared || 150,
      leftoverPercent: 3.0,
    }));

    onImportMenus(completeItems, replaceAll);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setParsedItems([]);
    setFileName('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                식당 메뉴 일괄 엑셀 등록
              </h3>
              <p className="text-xs text-neutral-500">
                Excel (.xlsx) 또는 CSV 파일을 업로드하여 메뉴를 대량 등록합니다
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Template Download Section */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-md flex items-center justify-between gap-4">
            <div className="text-xs text-emerald-900">
              <span className="font-semibold block">양식 템플릿 파일 다운로드</span>
              <span>
                날짜, 식당, 끼니, 메뉴명, 가격이 포함된 기본 서식을 먼저 다운로드 받아 작성하세요.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => downloadTemplateFile('xlsx')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>엑셀(.xlsx) 양식</span>
              </button>
              <button
                type="button"
                onClick={() => downloadTemplateFile('csv')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* File Dropzone */}
          {parsedItems.length === 0 ? (
            <label className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/40 hover:bg-emerald-50/20">
              <FileSpreadsheet className="w-10 h-10 text-neutral-400 mb-2" />
              <span className="text-xs font-semibold text-neutral-800">
                작성한 엑셀(XLSX) 또는 CSV 파일을 선택하세요
              </span>
              <span className="text-[11px] text-neutral-500 mt-1">
                또는 여기로 파일을 끌어다 놓으세요
              </span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-neutral-800">{fileName}</span>
                  <span className="text-neutral-500">
                    ({parsedItems.length}개 메뉴 인식 완료)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-neutral-500 hover:text-neutral-800 text-xs underline"
                >
                  다른 파일 올리기
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-neutral-200 rounded-md overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-700 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">날짜</th>
                      <th className="py-2 px-3">식당</th>
                      <th className="py-2 px-3">끼니</th>
                      <th className="py-2 px-3">메뉴</th>
                      <th className="py-2 px-3 text-right">가격</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-2 px-3 tabular-nums">{item.date}</td>
                        <td className="py-2 px-3">{item.restaurantName}</td>
                        <td className="py-2 px-3">{item.mealType}</td>
                        <td className="py-2 px-3 font-medium text-neutral-900">{item.name}</td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          ₩{item.price?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Replace or Append mode */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="replace-mode"
                  checked={replaceAll}
                  onChange={(e) => setReplaceAll(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="replace-mode" className="text-neutral-700 font-medium">
                  기존 전체 메뉴를 지우고 이 파일 데이터로 완전히 교체합니다 (미체크 시 추가)
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded bg-white hover:bg-neutral-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={parsedItems.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-xs"
          >
            {isProcessing ? '처리 중...' : `총 ${parsedItems.length}건 메뉴 대시보드 반영`}
          </button>
        </div>
      </div>
    </div>
  );
};
