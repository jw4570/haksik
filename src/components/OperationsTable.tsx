import React, { useState, useMemo } from 'react';
import { MenuItem, Restaurant } from '../types/dining.ts';
import {
  Search,
  Filter,
  ArrowUpDown,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckSquare,
  Square,
  UtensilsCrossed,
} from 'lucide-react';

interface OperationsTableProps {
  menus: MenuItem[];
  restaurants: Restaurant[];
  selectedDate: string;
  onToggleSoldOut: (id: string) => void;
  onDeleteMenu: (id: string) => void;
  onEditMenu: (item: MenuItem) => void;
  onExportSelectedToExcel: (selectedItems: MenuItem[]) => void;
  onExportSelectedToCSV: (selectedItems: MenuItem[]) => void;
}

type SortField = 'date' | 'price' | 'reserved' | 'interested' | 'rating' | 'wait';
type SortOrder = 'asc' | 'desc';

export const OperationsTable: React.FC<OperationsTableProps> = ({
  menus,
  restaurants,
  selectedDate,
  onToggleSoldOut,
  onDeleteMenu,
  onEditMenu,
  onExportSelectedToExcel,
  onExportSelectedToCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('ALL');
  const [selectedMeal, setSelectedMeal] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SOLDOUT' | 'CONGESTED'>('ALL');
  const [sortField, setSortField] = useState<SortField>('reserved');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered menu items
  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      // Date filter
      if (selectedDate !== 'ALL' && item.date !== selectedDate) return false;

      // Restaurant filter
      if (selectedRestaurant !== 'ALL' && item.restaurantId !== selectedRestaurant) return false;

      // Meal filter
      if (selectedMeal !== 'ALL' && item.mealType !== selectedMeal) return false;

      // Status filter
      if (statusFilter === 'ACTIVE' && item.isSoldOut) return false;
      if (statusFilter === 'SOLDOUT' && !item.isSoldOut) return false;
      if (
        statusFilter === 'CONGESTED' &&
        item.congestion !== '혼잡' &&
        item.congestion !== '매우 혼잡'
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesIngredient = item.mainIngredients.some((ing) =>
          ing.name.toLowerCase().includes(query)
        );
        const matchesRestaurant = item.restaurantName.toLowerCase().includes(query);
        if (!matchesName && !matchesIngredient && !matchesRestaurant) return false;
      }

      return true;
    });
  }, [menus, selectedDate, selectedRestaurant, selectedMeal, statusFilter, searchQuery]);

  // Sorted items
  const sortedMenus = useMemo(() => {
    return [...filteredMenus].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case 'date':
          valA = a.date;
          valB = b.date;
          break;
        case 'price':
          valA = a.price;
          valB = b.price;
          break;
        case 'reserved':
          valA = a.reservedCount;
          valB = b.reservedCount;
          break;
        case 'interested':
          valA = a.interestedCount;
          valB = b.interestedCount;
          break;
        case 'rating':
          valA = a.rating;
          valB = b.rating;
          break;
        case 'wait':
          valA = a.estimatedWaitMinutes;
          valB = b.estimatedWaitMinutes;
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredMenus, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedMenus.length && sortedMenus.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedMenus.map((m) => m.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedItemsList = useMemo(() => {
    return menus.filter((m) => selectedIds.has(m.id));
  }, [menus, selectedIds]);

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
      {/* Table Filter Controls */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="메뉴명, 주재료(돼지고기, 쌀), 식당 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Restaurant Filter */}
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="text-xs bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">전체 식당 ({menus.length}건)</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Meal Filter */}
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="text-xs bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">전체 끼니</option>
              <option value="조식">조식</option>
              <option value="중식">중식</option>
              <option value="석식">석식</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">판매중</option>
              <option value="SOLDOUT">품절만</option>
              <option value="CONGESTED">혼잡 메뉴만</option>
            </select>
          </div>
        </div>

        {/* Selection Action Bar */}
        <div className="flex items-center justify-between pt-1 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">
              총 {sortedMenus.length}건 메뉴
            </span>
            {selectedIds.size > 0 && (
              <span className="text-emerald-700 font-medium">
                · {selectedIds.size}개 항목 선택됨
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 ? (
              <button
                type="button"
                onClick={() => onExportSelectedToExcel(selectedItemsList)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded hover:bg-emerald-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>선택 {selectedIds.size}건 엑셀 내보내기</span>
              </button>
            ) : (
              <span className="text-neutral-400">
                행을 체크하여 원하는 항목만 엑셀로 내보낼 수 있습니다
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-100/70 text-neutral-600 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-neutral-500 hover:text-neutral-800"
                  aria-label="전체 선택"
                >
                  {selectedIds.size > 0 && selectedIds.size === sortedMenus.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th
                onClick={() => handleSort('date')}
                className="py-2.5 px-3 cursor-pointer hover:bg-neutral-200/60 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>날짜</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">식당</th>
              <th className="py-2.5 px-2 text-center whitespace-nowrap">끼니</th>
              <th className="py-2.5 px-3 min-w-[160px]">메뉴명</th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-neutral-200/60 whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>가격</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('reserved')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-neutral-200/60 whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>예약 인원</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('interested')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-neutral-200/60 whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>관심 (먹을예정)</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rating')}
                className="py-2.5 px-3 text-center cursor-pointer hover:bg-neutral-200/60 whitespace-nowrap"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>별점/리뷰</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">예상 혼잡도</th>
              <th
                onClick={() => handleSort('wait')}
                className="py-2.5 px-3 cursor-pointer hover:bg-neutral-200/60 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>혼잡시간(대기)</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">상태/품절관리</th>
              <th className="py-2.5 px-3 min-w-[140px] whitespace-nowrap">식재료 추정치</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {sortedMenus.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UtensilsCrossed className="w-8 h-8 text-neutral-300" />
                    <p className="font-medium text-neutral-700">해당 조건의 학식 메뉴가 없습니다</p>
                    <p className="text-xs text-neutral-400">
                      필터 조건을 변경하거나 우측 상단의 '메뉴 추가' 버튼을 눌러 새 메뉴를 등록하세요.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedMenus.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const expectedDiners = Math.round(
                  item.reservedCount + item.interestedCount * 0.4
                );

                // Main ingredient summary
                const mainIng = item.mainIngredients[0];
                const mainIngKg = mainIng
                  ? ((mainIng.amountPerServingGrams * expectedDiners) / 1000).toFixed(1)
                  : '-';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50/80 transition-colors ${
                      isSelected ? 'bg-emerald-50/50' : ''
                    } ${item.isSoldOut ? 'opacity-65 bg-neutral-50' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(item.id)}
                        className="text-neutral-400 hover:text-neutral-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 tabular-nums font-medium text-neutral-800 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Restaurant */}
                    <td className="py-3 px-3 font-medium text-neutral-900 whitespace-nowrap">
                      {item.restaurantName}
                    </td>

                    {/* Meal Type */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className="text-neutral-700 font-medium">
                        {item.mealType}
                      </span>
                    </td>

                    {/* Menu Name & Subtitle */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.isSoldOut && (
                          <span className="text-[10px] font-bold text-rose-600 border border-rose-300 px-1 py-0.2 rounded">
                            품절
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {item.category} · {item.caloriesKcal} kcal · 준비 {item.stockPrepared}인분
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-medium text-neutral-900 tabular-nums whitespace-nowrap">
                      ₩{item.price.toLocaleString()}
                    </td>

                    {/* Reservations */}
                    <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap font-bold text-neutral-900">
                      {item.reservedCount.toLocaleString()}명
                    </td>

                    {/* Interested ("먹을 예정") */}
                    <td className="py-3 px-3 text-right tabular-nums whitespace-nowrap text-neutral-600">
                      <span className="text-emerald-700 font-medium">
                        {item.interestedCount.toLocaleString()}명
                      </span>
                      <span className="block text-[10px] text-neutral-400">
                        (총 예상 {expectedDiners}명)
                      </span>
                    </td>

                    {/* Rating & Reviews */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 font-semibold text-neutral-900 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 tabular-nums">
                        ({item.reviewCount}개 리뷰)
                      </span>
                    </td>

                    {/* Congestion */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          item.congestion === '매우 혼잡'
                            ? 'text-rose-700'
                            : item.congestion === '혼잡'
                            ? 'text-amber-700'
                            : item.congestion === '보통'
                            ? 'text-blue-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {item.congestion === '혼잡' || item.congestion === '매우 혼잡' ? (
                          <AlertCircle className="w-3 h-3 shrink-0" />
                        ) : (
                          <CheckCircle className="w-3 h-3 shrink-0" />
                        )}
                        <span>{item.congestion}</span>
                      </span>
                    </td>

                    {/* Peak Time & Wait */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-neutral-700">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span className="tabular-nums">{item.peakTime}</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 tabular-nums">
                        약 {item.estimatedWaitMinutes}분 대기
                      </span>
                    </td>

                    {/* Status & Sold-out Toggle */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleSoldOut(item.id)}
                        className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                          item.isSoldOut
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {item.isSoldOut ? '품절 해제' : '품절 처리'}
                      </button>
                    </td>

                    {/* Ingredient requirement estimate */}
                    <td className="py-3 px-3 text-xs text-neutral-600 whitespace-nowrap">
                      {mainIng ? (
                        <div>
                          <span className="font-medium text-neutral-800">{mainIng.name}</span>
                          <span className="block text-[11px] text-neutral-500 tabular-nums">
                            {mainIngKg} kg 소요
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditMenu(item)}
                          className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMenu(item.id)}
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary Row */}
      {sortedMenus.length > 0 && (
        <div className="p-3 bg-neutral-100/70 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs text-neutral-600 tabular-nums gap-3">
          <div className="flex items-center gap-4">
            <span>
              선택/표시 중인 메뉴: <strong>{sortedMenus.length}</strong>종
            </span>
            <span>
              총 예약 합계:{' '}
              <strong className="text-neutral-900">
                {sortedMenus.reduce((acc, m) => acc + m.reservedCount, 0).toLocaleString()}
              </strong>
              명
            </span>
            <span>
              총 관심(먹을예정):{' '}
              <strong className="text-emerald-700">
                {sortedMenus.reduce((acc, m) => acc + m.interestedCount, 0).toLocaleString()}
              </strong>
              명
            </span>
          </div>
          <div className="text-neutral-500">
            * 엑셀(XLSX) 다운로드 시 조리실 발주 기준 수식이 자동 서식화되어 전달됩니다.
          </div>
        </div>
      )}
    </div>
  );
};
