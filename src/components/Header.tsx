import React from 'react';
import { Download, PlusCircle, Upload, Utensils, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  activeView: 'admin' | 'student';
  onViewChange: (view: 'admin' | 'student') => void;
  onOpenAddModal: () => void;
  onOpenUploadModal: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenIngredientModal: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  dates: string[];
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onOpenAddModal,
  onOpenUploadModal,
  onExportExcel,
  onExportCSV,
  onOpenIngredientModal,
  selectedDate,
  onDateChange,
  dates,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onViewChange('admin');
            }}
            className="text-lg font-bold tracking-tight text-neutral-900 flex items-center gap-2 hover:text-emerald-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Utensils className="w-4 h-4" />
            </div>
            <span>학식 운영·수요 관리</span>
          </a>

          {/* Date Selector */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-neutral-200">
            <label htmlFor="date-select" className="text-xs font-medium text-neutral-500 shrink-0">
              기준 일자
            </label>
            <select
              id="date-select"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border-0 rounded-md py-1 px-2.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">전체 일자 조회</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === '2026-10-12' ? '(시뮬레이션 예시)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone 2: Navigation Links / View Switcher */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onViewChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'admin'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>운영자 대시보드</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'student'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>학생 사전예약·관심 뷰</span>
          </button>

          <button
            type="button"
            onClick={onOpenIngredientModal}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <span>식재료 소요량 산출</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors whitespace-nowrap"
            title="메뉴 일괄 엑셀 등록"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>엑셀 업로드</span>
          </button>

          <div className="inline-flex rounded-md shadow-xs">
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-l-md transition-colors whitespace-nowrap"
              title="MS 엑셀(.xlsx) 파일로 내보내기"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>엑셀(XLSX) 다운로드</span>
            </button>
            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-y border-r border-emerald-300 rounded-r-md transition-colors whitespace-nowrap"
              title="UTF-8 BOM CSV 파일 다운로드"
            >
              CSV
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>메뉴 추가</span>
          </button>
        </div>
      </div>
    </header>
  );
};
