import React, { useState, useEffect, useMemo } from 'react';
import {
  OrderRecord,
  computeMenuSummaries,
  exportRecordsToExcel,
  exportRecordsToCSV,
} from './utils/simpleExcel.ts';
import {
  Download,
  Send,
  Trash2,
  Star,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';

const STORAGE_KEY = 'campus_dining_orders_apple_v1';

// Preset standard menus for quick autofill
const PRESET_MENUS = [
  { name: '제육덮밥', price: 5500, restaurant: '학생회관 식당', mealType: '중식' },
  { name: '얼큰순두부찌개', price: 5000, restaurant: '학생회관 식당', mealType: '중식' },
  { name: '통등심 치즈돈가스', price: 6500, restaurant: '생활관(기숙사) 식당', mealType: '중식' },
  { name: '든든 간장계란밥', price: 3500, restaurant: '학생회관 식당', mealType: '조식' },
  { name: '뚝배기 소불고기 백반', price: 6000, restaurant: '제2학생회관 식당', mealType: '중식' },
  { name: '등심 돈까스마요덮밥', price: 5800, restaurant: '학생회관 식당', mealType: '석식' },
];

const generateInitialRecords = (): OrderRecord[] => {
  const records: OrderRecord[] = [];

  // Seed user's 10/12 제육덮밥 example: 82 reservations + 45 interest
  for (let i = 0; i < 82; i++) {
    records.push({
      id: `seed-1012-res-${i}`,
      date: '10/12',
      restaurant: '학생회관 식당',
      mealType: '중식',
      menuName: '제육덮밥',
      price: 5500,
      orderType: '예약',
      rating: 4.6,
      congestion: '혼잡',
      note: i === 0 ? '불향 가득하고 고기 양 많음' : '',
      submittedAt: `2026-10-12 11:${String(10 + (i % 45)).padStart(2, '0')}`,
    });
  }
  for (let i = 0; i < 45; i++) {
    records.push({
      id: `seed-1012-int-${i}`,
      date: '10/12',
      restaurant: '학생회관 식당',
      mealType: '중식',
      menuName: '제육덮밥',
      price: 5500,
      orderType: '먹을 예정',
      rating: 4.6,
      congestion: '혼잡',
      note: '점심시간 방문 예정',
      submittedAt: `2026-10-12 11:${String(20 + (i % 40)).padStart(2, '0')}`,
    });
  }

  for (let i = 0; i < 48; i++) {
    records.push({
      id: `seed-dorm-1-${i}`,
      date: '10/12',
      restaurant: '생활관(기숙사) 식당',
      mealType: '중식',
      menuName: '통등심 치즈돈가스',
      price: 6500,
      orderType: i < 35 ? '예약' : '먹을 예정',
      rating: 4.8,
      congestion: '보통',
      note: '치즈 늘어나는 돈까스',
      submittedAt: `2026-10-12 11:30`,
    });
  }

  for (let i = 0; i < 30; i++) {
    records.push({
      id: `seed-second-1-${i}`,
      date: '10/12',
      restaurant: '제2학생회관 식당',
      mealType: '중식',
      menuName: '뚝배기 소불고기 백반',
      price: 6000,
      orderType: i < 22 ? '예약' : '먹을 예정',
      rating: 4.4,
      congestion: '보통',
      note: '',
      submittedAt: `2026-10-12 11:40`,
    });
  }

  for (let i = 0; i < 25; i++) {
    records.push({
      id: `seed-bf-1-${i}`,
      date: '10/12',
      restaurant: '학생회관 식당',
      mealType: '조식',
      menuName: '든든 간장계란밥',
      price: 3500,
      orderType: '예약',
      rating: 4.7,
      congestion: '여유',
      note: '아침 식사용',
      submittedAt: `2026-10-12 08:20`,
    });
  }

  return records;
};

export default function App() {
  const [records, setRecords] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return generateInitialRecords();
  });

  // Form State
  const [formDate, setFormDate] = useState('10/12');
  const [formRestaurant, setFormRestaurant] = useState('학생회관 식당');
  const [formMeal, setFormMeal] = useState('중식');
  const [formMenu, setFormMenu] = useState('제육덮밥');
  const [formPrice, setFormPrice] = useState(5500);
  const [formType, setFormType] = useState<'예약' | '먹을 예정'>('예약');
  const [formRating, setFormRating] = useState(5);
  const [formNote, setFormNote] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // View state
  const [viewTab, setViewTab] = useState<'summary' | 'log'>('summary');
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');
  const [mealFilter, setMealFilter] = useState('ALL');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  // Summaries
  const summaries = useMemo(() => {
    const list = computeMenuSummaries(records);
    return list.filter((item) => {
      if (restaurantFilter !== 'ALL' && item.restaurant !== restaurantFilter) return false;
      if (mealFilter !== 'ALL' && item.mealType !== mealFilter) return false;
      return true;
    });
  }, [records, restaurantFilter, mealFilter]);

  // Filtered log items
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      if (restaurantFilter !== 'ALL' && item.restaurant !== restaurantFilter) return false;
      if (mealFilter !== 'ALL' && item.mealType !== mealFilter) return false;
      return true;
    });
  }, [records, restaurantFilter, mealFilter]);

  const handleSelectPreset = (preset: typeof PRESET_MENUS[0]) => {
    setFormMenu(preset.name);
    setFormPrice(preset.price);
    setFormRestaurant(preset.restaurant);
    setFormMeal(preset.mealType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMenu.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newRecord: OrderRecord = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: formDate.trim() || '10/12',
      restaurant: formRestaurant,
      mealType: formMeal,
      menuName: formMenu.trim(),
      price: Number(formPrice) || 5000,
      orderType: formType,
      rating: formRating,
      congestion: formType === '예약' ? '혼잡' : '보통',
      note: formNote.trim(),
      submittedAt: `${formDate} ${timeStr}`,
    };

    setRecords((prev) => [newRecord, ...prev]);
    setToastMessage(`‘${formMenu}’ ${formType} 등록 완료`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setFormNote('');
  };

  const handleResetData = () => {
    if (window.confirm('기본 샘플 데이터로 복원하시겠습니까?')) {
      const init = generateInitialRecords();
      setRecords(init);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
    }
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const totalReservations = records.filter((r) => r.orderType === '예약').length;
  const totalInterested = records.filter((r) => r.orderType === '먹을 예정').length;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col antialiased selection:bg-[#0071E3]/20 selection:text-[#0071E3]">
      {/* Dynamic Island Style Capsule Toast */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1D1D1F]/90 text-white backdrop-blur-xl px-5 py-2.5 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.24)] border border-white/10 flex items-center gap-2.5 text-[13px] font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <span>{toastMessage}</span>
          <span className="text-white/40">·</span>
          <span className="text-[#34C759] text-[12px]">엑셀 시트 동기화</span>
        </div>
      )}

      {/* Apple macOS/iOS Style Header */}
      <header className="sticky top-0 z-30 apple-glass border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">
                학식 수요 관리
              </span>
              <span className="text-[12px] text-[#86868B] ml-2 hidden sm:inline">
                스마트 오더 & 엑셀 시트
              </span>
            </div>
          </div>

          {/* Segmented Control (Tabs) */}
          <div className="bg-black/[0.05] p-1 rounded-full flex items-center text-[12px] font-medium">
            <button
              type="button"
              onClick={() => setViewTab('summary')}
              className={`px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                viewTab === 'summary'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              수요 집계표
            </button>
            <button
              type="button"
              onClick={() => setViewTab('log')}
              className={`px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                viewTab === 'log'
                  ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              실시간 로그 ({records.length})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetData}
              className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-full transition-colors hidden sm:flex"
              title="데이터 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => exportRecordsToCSV(records)}
              className="px-3 py-1.5 text-[12px] font-medium text-[#1D1D1F] bg-black/[0.04] hover:bg-black/[0.08] rounded-full transition-colors"
            >
              CSV
            </button>

            <button
              type="button"
              onClick={() => exportRecordsToExcel(records)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-full shadow-[0_1px_2px_rgba(0,113,227,0.3)] transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>엑셀 다운로드</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Input Form Card (Apple Card Style) */}
          <div className="lg:col-span-4 apple-card p-6 space-y-5 sticky top-20">
            <div>
              <h2 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">
                주문 및 관심 접수
              </h2>
              <p className="text-[13px] text-[#86868B] mt-0.5">
                제출 즉시 엑셀 데이터로 동기화됩니다.
              </p>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-2">
                인기 메뉴 바로 선택
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_MENUS.map((p) => {
                  const isSelected = formMenu === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`text-[12px] px-3 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1D1D1F] text-white font-medium shadow-xs'
                          : 'bg-[#F5F5F7] text-[#515154] hover:bg-[#E8E8ED]'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Web Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
              {/* Type Switcher (Segmented Pill) */}
              <div>
                <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1.5">
                  신청 유형
                </label>
                <div className="bg-[#F5F5F7] p-1 rounded-xl flex items-center">
                  <button
                    type="button"
                    onClick={() => setFormType('예약')}
                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                      formType === '예약'
                        ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    사전 식권 예약
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('먹을 예정')}
                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                      formType === '먹을 예정'
                        ? 'bg-white text-[#0071E3] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    먹을 예정 (관심)
                  </button>
                </div>
              </div>

              {/* Date & Meal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                    날짜
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="10/12"
                    required
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3.5 py-2 text-[13px] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                    끼니
                  </label>
                  <div className="relative">
                    <select
                      value={formMeal}
                      onChange={(e) => setFormMeal(e.target.value)}
                      className="w-full appearance-none bg-[#F5F5F7] border-0 rounded-xl px-3.5 py-2 text-[13px] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3] transition-all font-medium pr-8"
                    >
                      <option value="조식">조식</option>
                      <option value="중식">중식</option>
                      <option value="석식">석식</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Restaurant */}
              <div>
                <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                  식당
                </label>
                <div className="relative">
                  <select
                    value={formRestaurant}
                    onChange={(e) => setFormRestaurant(e.target.value)}
                    className="w-full appearance-none bg-[#F5F5F7] border-0 rounded-xl px-3.5 py-2 text-[13px] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3] transition-all font-medium pr-8"
                  >
                    <option value="학생회관 식당">학생회관 식당</option>
                    <option value="생활관(기숙사) 식당">생활관(기숙사) 식당</option>
                    <option value="제2학생회관 식당">제2학생회관 식당</option>
                    <option value="교수·교직원회관">교수·교직원회관</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Menu & Price */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                    메뉴명
                  </label>
                  <input
                    type="text"
                    value={formMenu}
                    onChange={(e) => setFormMenu(e.target.value)}
                    placeholder="제육덮밥"
                    required
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3.5 py-2 text-[13px] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                    가격(원)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    required
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3.5 py-2 text-[13px] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3] transition-all tabular-nums font-medium"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1.5">
                  만족도 평가
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= formRating
                            ? 'fill-[#FF9F0A] text-[#FF9F0A]'
                            : 'text-[#E5E5EA]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-semibold text-[#1D1D1F] text-[13px] ml-1 tabular-nums">
                    {formRating}.0
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-1">
                  메모 (선택)
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="예: 불향 가득하고 고기 양 많음"
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3.5 py-2 text-[13px] text-[#1D1D1F] focus:bg-white focus:ring-2 focus:ring-[#0071E3] transition-all"
                />
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-xl shadow-[0_2px_8px_rgba(0,113,227,0.25)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>제출 및 엑셀 반영</span>
              </button>
            </form>
          </div>

          {/* Right: Apple Numbers Style Spreadsheet View */}
          <div className="lg:col-span-8 apple-card overflow-hidden flex flex-col">
            {/* Top Sheet Toolbar */}
            <div className="p-4 sm:p-5 border-b border-black/[0.06] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
                  <span>
                    {viewTab === 'summary' ? '메뉴별 실시간 수요 집계표' : '개별 접수 상세 로그'}
                  </span>
                  <span className="text-[11px] font-medium bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded-full">
                    실시간 연동
                  </span>
                </h3>
                <p className="text-[12px] text-[#86868B] mt-0.5">
                  엑셀(XLSX) 및 CSV 형식으로 언제든 바로 내보낼 수 있습니다.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2 text-[12px]">
                <div className="relative">
                  <select
                    value={restaurantFilter}
                    onChange={(e) => setRestaurantFilter(e.target.value)}
                    className="appearance-none bg-[#F5F5F7] text-[#1D1D1F] border-0 rounded-lg px-3 py-1.5 pr-7 focus:ring-2 focus:ring-[#0071E3] font-medium"
                  >
                    <option value="ALL">전체 식당</option>
                    <option value="학생회관 식당">학생회관 식당</option>
                    <option value="생활관(기숙사) 식당">생활관 식당</option>
                    <option value="제2학생회관 식당">제2학생회관 식당</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#86868B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={mealFilter}
                    onChange={(e) => setMealFilter(e.target.value)}
                    className="appearance-none bg-[#F5F5F7] text-[#1D1D1F] border-0 rounded-lg px-3 py-1.5 pr-7 focus:ring-2 focus:ring-[#0071E3] font-medium"
                  >
                    <option value="ALL">전체 끼니</option>
                    <option value="조식">조식</option>
                    <option value="중식">중식</option>
                    <option value="석식">석식</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#86868B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* TAB 1: Menu Summary Table */}
            {viewTab === 'summary' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F7] text-[#86868B] text-[11px] font-semibold tracking-tight border-b border-black/[0.04]">
                      <th className="py-2.5 px-4 whitespace-nowrap">날짜</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">식당</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">끼니</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">메뉴</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">가격</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap font-bold text-[#1D1D1F]">
                        예약 인원
                      </th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">관심 인원</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">총 예상 식수</th>
                      <th className="py-2.5 px-3 text-center whitespace-nowrap">평점</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">예상 혼잡도</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {summaries.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-[#86868B] text-[13px]">
                          조건에 일치하는 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      summaries.map((item) => {
                        const isHighlight =
                          item.menuName === '제육덮밥' && item.date === '10/12';

                        return (
                          <tr
                            key={`${item.date}-${item.restaurant}-${item.menuName}`}
                            className={`hover:bg-black/[0.02] transition-colors ${
                              isHighlight ? 'bg-[#0071E3]/[0.03]' : ''
                            }`}
                          >
                            <td className="py-3 px-4 tabular-nums font-medium text-[#1D1D1F]">
                              {item.date}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#1D1D1F]">
                              {item.restaurant}
                            </td>
                            <td className="py-3 px-3 text-center text-[#6E6E73]">
                              {item.mealType}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#1D1D1F]">
                              {item.menuName}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-[#1D1D1F] tabular-nums">
                              ₩{item.price.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums font-bold text-[#0071E3]">
                              {item.reservedCount}명
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums text-[#86868B]">
                              {item.interestedCount}명
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums font-semibold text-[#1D1D1F]">
                              {item.totalEstimated}명
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1 font-semibold text-[#FF9F0A] tabular-nums text-[12px]">
                                <Star className="w-3.5 h-3.5 fill-[#FF9F0A] text-[#FF9F0A]" />
                                {item.avgRating}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                  item.congestion === '혼잡'
                                    ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                    : item.congestion === '보통'
                                    ? 'bg-[#FF9500]/10 text-[#FF9500]'
                                    : 'bg-[#34C759]/10 text-[#34C759]'
                                }`}
                              >
                                {item.congestion}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TAB 2: Individual Log */
              <div className="overflow-x-auto max-h-[520px]">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead className="sticky top-0 bg-[#F5F5F7] text-[#86868B] text-[11px] font-semibold tracking-tight border-b border-black/[0.04] z-10">
                    <tr>
                      <th className="py-2.5 px-4">No</th>
                      <th className="py-2.5 px-4">날짜</th>
                      <th className="py-2.5 px-4">식당</th>
                      <th className="py-2.5 px-2 text-center">끼니</th>
                      <th className="py-2.5 px-4">메뉴</th>
                      <th className="py-2.5 px-4 text-right">가격</th>
                      <th className="py-2.5 px-3">구분</th>
                      <th className="py-2.5 px-2 text-center">별점</th>
                      <th className="py-2.5 px-4">메모</th>
                      <th className="py-2.5 px-4">접수시각</th>
                      <th className="py-2.5 px-3 text-center">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-16 text-center text-[#86868B]">
                          데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.slice(0, 100).map((r, i) => (
                        <tr key={r.id} className="hover:bg-black/[0.02] transition-colors">
                          <td className="py-2.5 px-4 text-[#86868B] tabular-nums text-[12px]">
                            {i + 1}
                          </td>
                          <td className="py-2.5 px-4 tabular-nums font-medium text-[#1D1D1F]">
                            {r.date}
                          </td>
                          <td className="py-2.5 px-4 text-[#1D1D1F]">{r.restaurant}</td>
                          <td className="py-2.5 px-2 text-center text-[#6E6E73]">{r.mealType}</td>
                          <td className="py-2.5 px-4 font-semibold text-[#1D1D1F]">{r.menuName}</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-[#1D1D1F]">
                            ₩{r.price.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                r.orderType === '예약'
                                  ? 'bg-[#0071E3]/10 text-[#0071E3]'
                                  : 'bg-[#34C759]/10 text-[#34C759]'
                              }`}
                            >
                              {r.orderType}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-[12px] font-medium text-[#FF9F0A]">
                            {r.rating > 0 ? `★ ${r.rating}` : '-'}
                          </td>
                          <td className="py-2.5 px-4 text-[#86868B] text-[12px] truncate max-w-[130px]">
                            {r.note || '-'}
                          </td>
                          <td className="py-2.5 px-4 text-[#86868B] text-[11px] tabular-nums whitespace-nowrap">
                            {r.submittedAt}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(r.id)}
                              className="text-[#86868B] hover:text-[#FF3B30] p-1 rounded-full transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Apple Numbers Style Status Bar */}
            <div className="p-4 bg-[#F5F5F7] border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#6E6E73] gap-2">
              <div className="flex items-center gap-3 tabular-nums">
                <span>
                  전체 접수: <strong className="text-[#1D1D1F]">{records.length}건</strong>
                </span>
                <span className="text-black/20">|</span>
                <span>
                  사전 예약: <strong className="text-[#0071E3]">{totalReservations}명</strong>
                </span>
                <span className="text-black/20">|</span>
                <span>
                  먹을 예정: <strong className="text-[#34C759]">{totalInterested}명</strong>
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => exportRecordsToExcel(records)}
                  className="font-semibold text-[#0071E3] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>엑셀 파일(.xlsx)로 내보내기</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer Note */}
        <div className="text-center pt-4 pb-2 text-[12px] text-[#86868B]">
          <span>캠퍼스 학식 운영 관리 시스템</span>
          <span className="mx-2">·</span>
          <span>Apple 스타일의 미니멀 UI 및 실시간 엑셀 내보내기 지원</span>
        </div>
      </main>
    </div>
  );
}
