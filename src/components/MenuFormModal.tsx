import React, { useState, useEffect } from 'react';
import { MenuItem, Restaurant, MealType, MenuCategory, CongestionLevel } from '../types/dining.ts';
import { X, Utensils } from 'lucide-react';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menu: MenuItem) => void;
  restaurants: Restaurant[];
  editingMenu: MenuItem | null;
}

export const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  restaurants,
  editingMenu,
}) => {
  const [date, setDate] = useState<string>('2026-10-12');
  const [restaurantId, setRestaurantId] = useState<string>('rest-student-union');
  const [mealType, setMealType] = useState<MealType>('중식');
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<number>(5500);
  const [category, setCategory] = useState<MenuCategory>('한식');
  const [caloriesKcal, setCaloriesKcal] = useState<number>(750);
  const [stockPrepared, setStockPrepared] = useState<number>(200);
  const [peakTime, setPeakTime] = useState<string>('12:15 ~ 12:45');
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState<number>(15);
  const [congestion, setCongestion] = useState<CongestionLevel>('보통');
  const [ingredientName, setIngredientName] = useState<string>('돼지고기(전지)');
  const [ingredientGrams, setIngredientGrams] = useState<number>(150);

  useEffect(() => {
    if (editingMenu) {
      setDate(editingMenu.date);
      setRestaurantId(editingMenu.restaurantId);
      setMealType(editingMenu.mealType);
      setName(editingMenu.name);
      setPrice(editingMenu.price);
      setCategory(editingMenu.category);
      setCaloriesKcal(editingMenu.caloriesKcal);
      setStockPrepared(editingMenu.stockPrepared);
      setPeakTime(editingMenu.peakTime);
      setEstimatedWaitMinutes(editingMenu.estimatedWaitMinutes);
      setCongestion(editingMenu.congestion);
      if (editingMenu.mainIngredients.length > 0) {
        setIngredientName(editingMenu.mainIngredients[0].name);
        setIngredientGrams(editingMenu.mainIngredients[0].amountPerServingGrams);
      }
    } else {
      setName('');
      setPrice(5500);
      setIngredientName('돼지고기(전지)');
      setIngredientGrams(150);
      setStockPrepared(200);
      setEstimatedWaitMinutes(15);
      setCongestion('보통');
    }
  }, [editingMenu, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedRest = restaurants.find((r) => r.id === restaurantId);
    const restaurantName = matchedRest ? matchedRest.name : '학생회관 식당';

    const itemToSave: MenuItem = {
      id: editingMenu ? editingMenu.id : `menu-${Date.now()}`,
      date,
      restaurantId,
      restaurantName,
      mealType,
      name: name.trim(),
      price: Number(price) || 5000,
      category,
      caloriesKcal: Number(caloriesKcal) || 700,
      mainIngredients: [
        {
          name: ingredientName.trim() || '주원료',
          amountPerServingGrams: Number(ingredientGrams) || 150,
          category: '육류',
        },
        { name: '백미(쌀)', amountPerServingGrams: 130, category: '곡류' },
      ],
      reservedCount: editingMenu ? editingMenu.reservedCount : 0,
      interestedCount: editingMenu ? editingMenu.interestedCount : 0,
      rating: editingMenu ? editingMenu.rating : 4.5,
      reviewCount: editingMenu ? editingMenu.reviewCount : 0,
      reviews: editingMenu ? editingMenu.reviews : [],
      peakTime,
      estimatedWaitMinutes: Number(estimatedWaitMinutes) || 10,
      congestion,
      isSoldOut: editingMenu ? editingMenu.isSoldOut : false,
      stockPrepared: Number(stockPrepared) || 200,
      leftoverPercent: editingMenu ? editingMenu.leftoverPercent : 3.0,
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">
              {editingMenu ? '학식 메뉴 정보 수정' : '새 학식 메뉴 등록'}
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">식당 선택</label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="w-full border border-neutral-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">끼니</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full border border-neutral-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="조식">조식 (아침)</option>
                <option value="중식">중식 (점심)</option>
                <option value="석식">석식 (저녁)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">제공 일자</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-neutral-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              >
              </input>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">분류/카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MenuCategory)}
                className="w-full border border-neutral-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="한식">한식</option>
                <option value="일식/양식">일식/양식</option>
                <option value="중식/아시안">중식/아시안</option>
                <option value="간편식/분식">간편식/분식</option>
                <option value="샐러드/간편">샐러드/간편</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">메뉴명</label>
            <input
              type="text"
              placeholder="예: 제육덮밥, 통등심 치즈돈가스, 뚝배기 불고기"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-neutral-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">가격 (원)</label>
              <input
                type="number"
                step="100"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full border border-neutral-300 rounded-md p-2 tabular-nums focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">칼로리 (kcal)</label>
              <input
                type="number"
                value={caloriesKcal}
                onChange={(e) => setCaloriesKcal(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-md p-2 tabular-nums focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">준비 수량 (인분)</label>
              <input
                type="number"
                value={stockPrepared}
                onChange={(e) => setStockPrepared(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-md p-2 tabular-nums focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">예상 피크 시간대</label>
              <input
                type="text"
                placeholder="예: 12:15 ~ 12:45"
                value={peakTime}
                onChange={(e) => setPeakTime(e.target.value)}
                className="w-full border border-neutral-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">예상 대기시간 (분)</label>
              <input
                type="number"
                value={estimatedWaitMinutes}
                onChange={(e) => setEstimatedWaitMinutes(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-md p-2 tabular-nums focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
            <span className="font-semibold text-neutral-800 block">
              주요 식재료 (수요 예측 및 발주 자동계산용)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-neutral-500 text-[11px] block">재료명</label>
                <input
                  type="text"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  placeholder="예: 돼지고기, 닭다리살"
                  className="w-full border border-neutral-300 rounded p-1.5 bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-neutral-500 text-[11px] block">1인분 소요량 (g)</label>
                <input
                  type="number"
                  value={ingredientGrams}
                  onChange={(e) => setIngredientGrams(Number(e.target.value))}
                  placeholder="150"
                  className="w-full border border-neutral-300 rounded p-1.5 bg-white text-xs tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded bg-white hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded shadow-xs"
            >
              {editingMenu ? '수정사항 저장' : '새 메뉴 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
