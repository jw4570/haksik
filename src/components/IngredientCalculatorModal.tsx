import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { MenuItem } from '../types/dining.ts';
import { X, Carrot, Download, Scale, ShoppingCart } from 'lucide-react';

interface IngredientCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  menus: MenuItem[];
}

interface AggregatedIngredient {
  name: string;
  category: string;
  totalGrams: number;
  totalKg: number;
  menuSources: string[];
}

export const IngredientCalculatorModal: React.FC<IngredientCalculatorModalProps> = ({
  isOpen,
  onClose,
  menus,
}) => {
  // Safety margin percentage slider (e.g. +0%, +10%, +20% for unexpected walk-in diners)
  const [safetyBufferPercent, setSafetyBufferPercent] = useState<number>(10);

  if (!isOpen) return null;

  // Aggregate ingredients
  const ingredientMap: Record<string, AggregatedIngredient> = {};

  menus.forEach((item) => {
    // Estimated diners = reservedCount + (interestedCount * 0.4)
    const baseDiners = item.reservedCount + item.interestedCount * 0.4;
    const finalDiners = baseDiners * (1 + safetyBufferPercent / 100);

    item.mainIngredients.forEach((ing) => {
      const requiredGrams = ing.amountPerServingGrams * finalDiners;
      if (!ingredientMap[ing.name]) {
        ingredientMap[ing.name] = {
          name: ing.name,
          category: ing.category,
          totalGrams: 0,
          totalKg: 0,
          menuSources: [],
        };
      }
      ingredientMap[ing.name].totalGrams += requiredGrams;
      ingredientMap[ing.name].totalKg = Number((ingredientMap[ing.name].totalGrams / 1000).toFixed(2));
      if (!ingredientMap[ing.name].menuSources.includes(item.name)) {
        ingredientMap[ing.name].menuSources.push(item.name);
      }
    });
  });

  const ingredientList = Object.values(ingredientMap).sort((a, b) => b.totalKg - a.totalKg);

  const handleExportIngredientExcel = () => {
    const exportData = ingredientList.map((ing, idx) => ({
      '연번': idx + 1,
      '품목명': ing.name,
      '분류': ing.category,
      '소요 중량(kg)': ing.totalKg,
      '안전버퍼': `+${safetyBufferPercent}%`,
      '해당 메뉴': ing.menuSources.join(', '),
      '비고': '학식 수요예측 자동환산',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 10 },
      { wch: 14 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '식재료_발주계획');
    XLSX.writeFile(wb, `학식_식재료_발주소요량_${Date.now()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                식재료 소요량 예측 계산기
              </h3>
              <p className="text-xs text-neutral-500">
                사전 예약 {menus.reduce((a, b) => a + b.reservedCount, 0)}명 + 관심 인원 기반 조리 소요량
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Buffer Control */}
          <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-neutral-900 block">
                당일 현장 추가 식수 안전 버퍼율
              </span>
              <span className="text-neutral-500">
                예상치 못한 현장 식권 구매자를 위한 여유 발주율을 설정합니다.
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[0, 10, 20, 30].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSafetyBufferPercent(rate)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    safetyBufferPercent === rate
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  +{rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Ingredient Table */}
          <div className="border border-neutral-200 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">품목명</th>
                  <th className="py-2.5 px-3">분류</th>
                  <th className="py-2.5 px-3 text-right">소요량(kg)</th>
                  <th className="py-2.5 px-3">관련 메뉴</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {ingredientList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-500">
                      등록된 식재료 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  ingredientList.map((ing) => (
                    <tr key={ing.name} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        {ing.name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        {ing.category}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 tabular-nums">
                        {ing.totalKg} kg
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 text-[11px] truncate max-w-xs">
                        {ing.menuSources.join(', ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            총 {ingredientList.length}종의 원재료 필요량 집계 완료
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded bg-white hover:bg-neutral-50"
            >
              닫기
            </button>
            <button
              onClick={handleExportIngredientExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>식재료 발주서 엑셀 내보내기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
