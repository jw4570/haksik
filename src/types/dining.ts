export type MealType = '조식' | '중식' | '석식';

export type CongestionLevel = '여유' | '보통' | '혼잡' | '매우 혼잡';

export type MenuCategory = '한식' | '일식/양식' | '중식/아시안' | '간편식/분식' | '샐러드/간편';

export interface IngredientRequirement {
  name: string;
  amountPerServingGrams: number;
  category: '곡류' | '육류' | '채소류' | '수산물' | '양념/가공';
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
  tag?: string;
}

export interface MenuItem {
  id: string;
  date: string; // YYYY-MM-DD
  restaurantId: string;
  restaurantName: string;
  mealType: MealType;
  name: string;
  price: number;
  category: MenuCategory;
  caloriesKcal: number;
  mainIngredients: IngredientRequirement[];
  reservedCount: number;
  interestedCount: number; // '먹을 예정' 인원
  rating: number;
  reviewCount: number;
  reviews: ReviewItem[];
  peakTime: string; // e.g. "12:10 ~ 12:40"
  estimatedWaitMinutes: number;
  congestion: CongestionLevel;
  isSoldOut: boolean;
  stockPrepared: number; // 준비 수량
  leftoverPercent: number; // 잔여/잔반 예측률 (%)
  soldOutTime?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  seats: number;
  operatingHours: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  contact: string;
}

export interface DailyDemandSummary {
  totalReservations: number;
  totalInterested: number;
  totalEstimatedDiners: number;
  totalEstimatedRevenue: number;
  mostPopularMenu: string;
  highestCongestionCafeteria: string;
}
