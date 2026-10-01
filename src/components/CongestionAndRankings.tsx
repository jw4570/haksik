import React from 'react';
import { MenuItem, Restaurant } from '../types/dining.ts';
import { Star, Flame, Trophy, Clock, AlertTriangle } from 'lucide-react';

interface CongestionAndRankingsProps {
  menus: MenuItem[];
  restaurants: Restaurant[];
}

export const CongestionAndRankings: React.FC<CongestionAndRankingsProps> = ({
  menus,
  restaurants,
}) => {
  // Sort top 5 popular menus (by reservation + interest)
  const topPopularMenus = [...menus]
    .sort((a, b) => b.reservedCount * 1.5 + b.interestedCount - (a.reservedCount * 1.5 + a.interestedCount))
    .slice(0, 5);

  // Sort top 5 highest rated menus
  const topRatedMenus = [...menus]
    .filter((m) => m.reviewCount >= 5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Sold out or high-waste risk menus
  const soldOutOrRiskMenus = menus.filter(
    (m) => m.isSoldOut || m.leftoverPercent > 5.0 || m.congestion === '매우 혼잡'
  );

  // Congestion profile simulation for lunch hours (11:30 ~ 13:30)
  const timeSlots = [
    { time: '11:30', label: '11:30~12:00', load: 35, level: '여유' },
    { time: '12:00', label: '12:00~12:30', load: 88, level: '혼잡 (피크)' },
    { time: '12:30', label: '12:30~13:00', load: 72, level: '보통~혼잡' },
    { time: '13:00', label: '13:00~13:30', load: 40, level: '여유' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Congestion & Estimated Wait Time Overview */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-neutral-900">
                식당별 혼잡 시간대 및 대기 예측
              </h3>
            </div>
            <span className="text-[11px] text-neutral-500">실시간 좌석회전율 기반</span>
          </div>

          <div className="mt-4 space-y-4">
            {restaurants.map((rest) => {
              const restMenus = menus.filter((m) => m.restaurantId === rest.id);
              const maxWait = restMenus.reduce(
                (max, m) => Math.max(max, m.estimatedWaitMinutes),
                0
              );
              const hasCongested = restMenus.some(
                (m) => m.congestion === '혼잡' || m.congestion === '매우 혼잡'
              );

              return (
                <div key={rest.id} className="text-xs">
                  <div className="flex items-center justify-between font-medium text-neutral-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span>{rest.name}</span>
                      <span className="text-[11px] text-neutral-400 font-normal">
                        ({rest.seats}석)
                      </span>
                    </span>
                    <span className="tabular-nums font-semibold text-neutral-900">
                      최대 {maxWait > 0 ? `${maxWait}분` : '5분 미만'} 대기
                    </span>
                  </div>

                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        hasCongested ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(20, maxWait * 3.8))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                    <span>중식 피크: {rest.operatingHours.lunch}</span>
                    <span className={hasCongested ? 'text-amber-700 font-medium' : 'text-emerald-700'}>
                      {hasCongested ? '12:10~12:40 혼잡 예상' : '원활한 이용 가능'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-100">
            <span className="text-[11px] font-medium text-neutral-500 block mb-2">
              중식 시간대별 평균 혼잡 지수
            </span>
            <div className="grid grid-cols-4 gap-1 text-center">
              {timeSlots.map((slot) => (
                <div key={slot.time} className="bg-neutral-50 p-1.5 rounded text-[10px]">
                  <div className="font-semibold text-neutral-700">{slot.time}</div>
                  <div
                    className={`mt-1 font-bold ${
                      slot.load > 75 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {slot.load}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Menu Popularity & Satisfaction Ranking */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-neutral-900">
              메뉴별 인기 & 만족도 순위
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500">예약 + 관심 합산</span>
        </div>

        <div className="mt-4 space-y-3">
          {topPopularMenus.map((menu, idx) => (
            <div
              key={menu.id}
              className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 flex items-center justify-center font-bold rounded text-[11px] ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-900'
                      : idx === 1
                      ? 'bg-neutral-200 text-neutral-800'
                      : idx === 2
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-neutral-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <span>{menu.name}</span>
                    <span className="text-[11px] font-normal text-neutral-400">
                      ({menu.restaurantName})
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span>₩{menu.price.toLocaleString()}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-medium">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                      {menu.rating.toFixed(1)} ({menu.reviewCount})
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-neutral-900 tabular-nums block">
                  {(menu.reservedCount + menu.interestedCount).toLocaleString()}명
                </span>
                <span className="text-[10px] text-neutral-400">
                  예약 {menu.reservedCount} · 찜 {menu.interestedCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Leftover, Waste & Sold Out Operational Notes */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-neutral-900">
              품절 및 잔반·재고 변동 기록
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500">운영 리포트 연계</span>
        </div>

        <div className="mt-4 space-y-3">
          {soldOutOrRiskMenus.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              현재 품절 또는 잔반 주의 품목이 없습니다.
            </div>
          ) : (
            soldOutOrRiskMenus.slice(0, 4).map((menu) => (
              <div
                key={menu.id}
                className="p-2.5 border border-neutral-200/80 rounded-md text-xs space-y-1.5 bg-neutral-50/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">{menu.name}</span>
                  {menu.isSoldOut ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                      조기 품절
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      수요 집중 ({menu.congestion})
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>
                    준비 {menu.stockPrepared}인분 중 확정 예약 {menu.reservedCount}인분
                  </span>
                  <span className="tabular-nums">잔여율 약 {menu.leftoverPercent}%</span>
                </div>

                {menu.reviews.length > 0 && (
                  <div className="text-[11px] text-neutral-600 bg-white p-1.5 rounded border border-neutral-100 italic">
                    "{menu.reviews[0].comment}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-900">
          <p className="font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-emerald-700" />
            <span>식재료 발주 검토 팁</span>
          </p>
          <p className="mt-0.5 text-emerald-800">
            인기 1위 메뉴는 조기 품절 방지를 위해 기본 준비 수량 대비 +15% 증량 발주가 권장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
