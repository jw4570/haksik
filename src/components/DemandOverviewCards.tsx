import React from 'react';
import { MenuItem } from '../types/dining.ts';
import { Users, DollarSign, Clock, Carrot } from 'lucide-react';

interface DemandOverviewCardsProps {
  menus: MenuItem[];
}

export const DemandOverviewCards: React.FC<DemandOverviewCardsProps> = ({ menus }) => {
  const totalReserved = menus.reduce((acc, m) => acc + m.reservedCount, 0);
  const totalInterested = menus.reduce((acc, m) => acc + m.interestedCount, 0);
  // Estimated actual diners = reserved + (interested * 0.4)
  const totalEstimatedDiners = Math.round(totalReserved + totalInterested * 0.4);

  // Revenue calculation:
  const reservedRevenue = menus.reduce((acc, m) => acc + m.reservedCount * m.price, 0);
  const estimatedTotalRevenue = Math.round(
    menus.reduce((acc, m) => acc + (m.reservedCount + m.interestedCount * 0.4) * m.price, 0)
  );

  // Find most congested restaurant & menu
  const mostCongested = [...menus].sort(
    (a, b) => b.estimatedWaitMinutes - a.estimatedWaitMinutes
  )[0];

  // Calculate approximate meat and rice requirements for filtered items
  let totalRiceGrams = 0;
  let totalMeatGrams = 0;
  menus.forEach((item) => {
    const itemDiners = item.reservedCount + item.interestedCount * 0.4;
    item.mainIngredients.forEach((ing) => {
      if (ing.name.includes('쌀') || ing.name.includes('백미') || ing.name.includes('밥')) {
        totalRiceGrams += ing.amountPerServingGrams * itemDiners;
      }
      if (ing.category === '육류' || ing.name.includes('고기') || ing.name.includes('돈까스') || ing.name.includes('갈비')) {
        totalMeatGrams += ing.amountPerServingGrams * itemDiners;
      }
    });
  });

  const riceKg = (totalRiceGrams / 1000).toFixed(1);
  const meatKg = (totalMeatGrams / 1000).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1 */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium">총 식수 수요 예측</span>
          <Users className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {totalEstimatedDiners.toLocaleString()}
          </span>
          <span className="text-xs text-neutral-500">명 예상</span>
        </div>
        <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 tabular-nums">
          <span>확정 예약 {totalReserved.toLocaleString()}명</span>
          <span aria-hidden="true">·</span>
          <span>먹을 예정 {totalInterested.toLocaleString()}명</span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium">예상 식권 매출액</span>
          <DollarSign className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            ₩{estimatedTotalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 tabular-nums">
          <span>사전결제 ₩{reservedRevenue.toLocaleString()}</span>
          <span aria-hidden="true">·</span>
          <span>객단가 약 ₩{menus.length ? Math.round(menus.reduce((a, b) => a + b.price, 0) / menus.length).toLocaleString() : 0}</span>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium">피크타임 혼잡 주의</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {mostCongested ? `${mostCongested.estimatedWaitMinutes}분 대기` : '0분'}
          </span>
          <span className="text-xs font-medium text-amber-700">
            {mostCongested?.congestion || '여유'}
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-neutral-100 text-xs text-neutral-500 truncate">
          {mostCongested
            ? `${mostCongested.restaurantName} (${mostCongested.peakTime})`
            : '특이 혼잡 없음'}
        </div>
      </div>

      {/* Metric 4 */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium">주요 식재료 권장 준비량</span>
          <Carrot className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-xs text-neutral-500 block">쌀(백미)</span>
            <span className="text-lg font-bold text-neutral-900 tabular-nums">{riceKg} kg</span>
          </div>
          <div className="pl-3 border-l border-neutral-200">
            <span className="text-xs text-neutral-500 block">육류/단백질</span>
            <span className="text-lg font-bold text-neutral-900 tabular-nums">{meatKg} kg</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-neutral-100 text-xs text-neutral-500">
          예약+관심 가중치 자동 환산
        </div>
      </div>
    </div>
  );
};
