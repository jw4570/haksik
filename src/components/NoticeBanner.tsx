import React, { useState } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs text-neutral-500 hover:text-neutral-700 inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded"
        >
          <Info className="w-3.5 h-3.5" />
          <span>수요 예측 가이드 및 운영 기준 안내 보기</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 sm:p-4 text-xs text-amber-900 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              [식당 운영자 참고 안내] 학식 수요 예측 데이터 활용 기준
            </p>
            <p className="text-amber-800 leading-relaxed">
              본 시스템의 '예약 인원' 및 '관심 인원(먹을 예정)' 데이터는 학생 사전 선호도 기반의 조리 계획 참고 자료입니다.
              기상 상황(우천/한파), 당일 시험 기간 및 학사 행사 여부에 따라 실제 식수는 변동될 수 있으므로,
              안전 식수 산정 시 <strong>기본 예약량 + 관심 인원의 약 30~50%</strong>를 권장 조리치로 반영하세요.
              (엑셀 다운로드 파일 내에 계산된 권장 식재료 소요량이 자동 포함됩니다.)
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-amber-600 hover:text-amber-900 p-1 hover:bg-amber-100/60 rounded shrink-0"
          aria-label="닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
