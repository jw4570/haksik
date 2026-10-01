import React, { useState } from 'react';
import { MenuItem, Restaurant, MealType } from '../types/dining.ts';
import { Heart, Utensils, Star, Check, Sparkles, Clock, MessageSquare, ArrowLeft } from 'lucide-react';

interface StudentSimulationViewProps {
  menus: MenuItem[];
  restaurants: Restaurant[];
  selectedDate: string;
  onReserve: (menuId: string) => void;
  onToggleInterest: (menuId: string) => void;
  onAddReview: (menuId: string, rating: number, comment: string, tag: string) => void;
  onSwitchToAdmin: () => void;
}

export const StudentSimulationView: React.FC<StudentSimulationViewProps> = ({
  menus,
  restaurants,
  selectedDate,
  onReserve,
  onToggleInterest,
  onAddReview,
  onSwitchToAdmin,
}) => {
  const [selectedRestId, setSelectedRestId] = useState<string>('ALL');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('중식');
  const [userInterests, setUserInterests] = useState<Set<string>>(new Set());
  const [userReservations, setUserReservations] = useState<Set<string>>(new Set());
  const [reviewModalMenu, setReviewModalMenu] = useState<MenuItem | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('가성비 최고');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3000);
  };

  const handleInterestClick = (menu: MenuItem) => {
    onToggleInterest(menu.id);
    const next = new Set(userInterests);
    if (next.has(menu.id)) {
      next.delete(menu.id);
      showToast(`'${menu.name}' 관심 목록에서 제외되었습니다.`);
    } else {
      next.add(menu.id);
      showToast(`'${menu.name}' 먹을 예정(관심) 등록 완료! 운영자 대시보드에 집계되었습니다.`);
    }
    setUserInterests(next);
  };

  const handleReserveClick = (menu: MenuItem) => {
    if (menu.isSoldOut) return;
    onReserve(menu.id);
    const next = new Set(userReservations);
    next.add(menu.id);
    setUserReservations(next);
    showToast(`🎉 '${menu.name}' 사전 식권 예약 완료! 예약 인원이 +1 증가했습니다.`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalMenu) return;
    onAddReview(reviewModalMenu.id, ratingScore, reviewComment.trim() || '맛있게 먹었습니다!', selectedTag);
    showToast(`'${reviewModalMenu.name}' 별점 및 리뷰가 등록되었습니다.`);
    setReviewModalMenu(null);
    setReviewComment('');
  };

  const filteredMenus = menus.filter((m) => {
    if (selectedDate !== 'ALL' && m.date !== selectedDate) return false;
    if (selectedRestId !== 'ALL' && m.restaurantId !== selectedRestId) return false;
    if (m.mealType !== selectedMeal) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-lg shadow-lg border border-neutral-700 flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Hero Banner for Student Simulation */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-700/80 text-emerald-100">
            <span>학생 전용 사전 수요조사 & 예약 모바일/웹 뷰</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            오늘 학식 뭐 먹지? 미리 찜하고 사전 예약하세요!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            학생 여러분이 <strong>'먹을 예정'</strong> 또는 <strong>'사전 식권 예약'</strong>을 누르면,
            식당 조리실에 실시간으로 집계되어 <strong>품절 방지 및 대기 시간 단축</strong>에 바로 반영됩니다.
          </p>

          <div className="pt-2">
            <button
              onClick={onSwitchToAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-emerald-950 hover:bg-emerald-50 rounded-md shadow-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>운영자 대시보드(엑셀 리포트)로 복귀하여 실시간 데이터 확인</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs: Meal type & Restaurant */}
      <div className="space-y-3 bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
        {/* Meal Selector */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <span className="text-xs font-bold text-neutral-800">끼니 선택</span>
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md">
            {(['조식', '중식', '석식'] as MealType[]).map((meal) => (
              <button
                key={meal}
                type="button"
                onClick={() => setSelectedMeal(meal)}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  selectedMeal === meal
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>
        </div>

        {/* Cafeteria Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedRestId('ALL')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
              selectedRestId === 'ALL'
                ? 'bg-emerald-700 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            전체 식당 보기
          </button>
          {restaurants.map((rest) => (
            <button
              key={rest.id}
              type="button"
              onClick={() => setSelectedRestId(rest.id)}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                selectedRestId === rest.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {rest.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMenus.length === 0 ? (
          <div className="col-span-full py-16 text-center text-neutral-500 bg-white rounded-lg border border-neutral-200 p-8">
            <Utensils className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
            <p className="font-semibold text-neutral-700">해당 시간대에 운영 중인 메뉴가 없습니다.</p>
            <p className="text-xs text-neutral-400 mt-1">다른 끼니(조식/중식/석식)나 식당을 선택해 보세요.</p>
          </div>
        ) : (
          filteredMenus.map((menu) => {
            const hasInterest = userInterests.has(menu.id);
            const hasReserved = userReservations.has(menu.id);

            return (
              <div
                key={menu.id}
                className={`bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-neutral-300 transition-all ${
                  menu.isSoldOut ? 'opacity-70' : ''
                }`}
              >
                <div className="p-5 space-y-3">
                  {/* Top Bar on Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {menu.restaurantName}
                      </span>
                      <h4 className="text-base font-bold text-neutral-900 mt-1">
                        {menu.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-neutral-900 tabular-nums">
                        ₩{menu.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Sub Info */}
                  <div className="flex items-center gap-3 text-xs text-neutral-500 tabular-nums">
                    <span>{menu.category}</span>
                    <span>·</span>
                    <span>{menu.caloriesKcal} kcal</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {menu.rating.toFixed(1)} ({menu.reviewCount})
                    </span>
                  </div>

                  {/* Congestion Notice */}
                  <div className="bg-neutral-50 p-2.5 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>예상 대기시간</span>
                      </span>
                      <span className="font-semibold tabular-nums text-neutral-900">
                        약 {menu.estimatedWaitMinutes}분 ({menu.congestion})
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      혼잡 피크: {menu.peakTime}
                    </div>
                  </div>

                  {/* Real-time Demand Ticker */}
                  <div className="pt-1 flex items-center justify-between text-xs text-neutral-600 tabular-nums">
                    <span>
                      사전 예약 <strong>{menu.reservedCount}명</strong>
                    </span>
                    <span>
                      먹을 예정(찜) <strong className="text-emerald-700">{menu.interestedCount}명</strong>
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-neutral-50/70 border-t border-neutral-100 flex items-center gap-2">
                  {/* Interest Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleInterestClick(menu)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                      hasInterest
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        hasInterest ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                      }`}
                    />
                    <span>{hasInterest ? '먹을 예정 ✓' : '먹을 예정'}</span>
                  </button>

                  {/* Direct Reservation Button */}
                  <button
                    type="button"
                    disabled={menu.isSoldOut}
                    onClick={() => handleReserveClick(menu)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                      menu.isSoldOut
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : hasReserved
                        ? 'bg-emerald-800 text-white'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>
                      {menu.isSoldOut
                        ? '품절됨'
                        : hasReserved
                        ? '예약 완료 +1'
                        : '사전 식권 예약'}
                    </span>
                  </button>

                  {/* Review Button */}
                  <button
                    type="button"
                    onClick={() => setReviewModalMenu(menu)}
                    className="p-2 text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                    title="별점 및 리뷰 남기기"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {reviewModalMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900">
                '{reviewModalMenu.name}' 별점 & 리뷰 작성
              </h3>
              <button
                onClick={() => setReviewModalMenu(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-2">만족도 별점</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingScore(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingScore
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-neutral-800 ml-2 text-sm">{ratingScore}점</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">한줄 평가 태그</label>
                <div className="flex flex-wrap gap-1.5">
                  {['가성비 최고', '고기 양 많음', '국물 따뜻함', '웨이팅 주의', '다시 먹고 싶음', '조기 품절 주의'].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          selectedTag === tag
                            ? 'bg-neutral-900 text-white font-medium'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">상세 리뷰 (선택)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="맛, 위생, 조리 상태 등에 대한 솔직한 후기를 남겨주세요."
                  rows={3}
                  className="w-full border border-neutral-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setReviewModalMenu(null)}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-600 hover:bg-neutral-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium shadow-xs"
                >
                  리뷰 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
