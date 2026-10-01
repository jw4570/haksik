import * as XLSX from 'xlsx';

export interface OrderRecord {
  id: string;
  date: string;
  restaurant: string;
  mealType: string;
  menuName: string;
  price: number;
  orderType: '예약' | '먹을 예정';
  rating: number;
  congestion: string;
  note: string;
  submittedAt: string;
}

export interface MenuSummaryRecord {
  date: string;
  restaurant: string;
  mealType: string;
  menuName: string;
  price: number;
  reservedCount: number;
  interestedCount: number;
  totalEstimated: number;
  avgRating: number;
  congestion: string;
}

export function computeMenuSummaries(records: OrderRecord[]): MenuSummaryRecord[] {
  const map: Record<string, {
    date: string;
    restaurant: string;
    mealType: string;
    menuName: string;
    price: number;
    reservedCount: number;
    interestedCount: number;
    ratings: number[];
  }> = {};

  records.forEach((r) => {
    const key = `${r.date}_${r.restaurant}_${r.mealType}_${r.menuName}`;
    if (!map[key]) {
      map[key] = {
        date: r.date,
        restaurant: r.restaurant,
        mealType: r.mealType,
        menuName: r.menuName,
        price: r.price,
        reservedCount: 0,
        interestedCount: 0,
        ratings: [],
      };
    }
    if (r.orderType === '예약') {
      map[key].reservedCount += 1;
    } else {
      map[key].interestedCount += 1;
    }
    if (r.rating > 0) {
      map[key].ratings.push(r.rating);
    }
  });

  return Object.values(map).map((item) => {
    const avgRating = item.ratings.length > 0
      ? Number((item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1))
      : 4.5;
    const totalEstimated = Math.round(item.reservedCount + item.interestedCount * 0.4);

    let congestion = '여유';
    if (item.reservedCount >= 50 || totalEstimated >= 70) {
      congestion = '혼잡';
    } else if (item.reservedCount >= 25 || totalEstimated >= 35) {
      congestion = '보통';
    }

    return {
      date: item.date,
      restaurant: item.restaurant,
      mealType: item.mealType,
      menuName: item.menuName,
      price: item.price,
      reservedCount: item.reservedCount,
      interestedCount: item.interestedCount,
      totalEstimated,
      avgRating,
      congestion,
    };
  });
}

export function exportRecordsToExcel(records: OrderRecord[], filenamePrefix = '학식_주문수요_엑셀') {
  const wb = XLSX.utils.book_new();

  // 1. Individual Submissions Sheet
  const rows1 = records.map((r, i) => ({
    'No': i + 1,
    '날짜': r.date,
    '식당': r.restaurant,
    '끼니': r.mealType,
    '메뉴': r.menuName,
    '가격(원)': r.price,
    '구분': r.orderType,
    '별점': r.rating,
    '예상 혼잡도': r.congestion,
    '한줄 메모': r.note || '-',
    '접수 시각': r.submittedAt,
  }));
  const ws1 = XLSX.utils.json_to_sheet(rows1);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 16 },
    { wch: 8 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
    { wch: 22 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '실시간_주문접수내역');

  // 2. Summary Sheet (as requested in user prompt)
  const summaries = computeMenuSummaries(records);
  const rows2 = summaries.map((s, i) => ({
    'No': i + 1,
    '날짜': s.date,
    '식당': s.restaurant,
    '끼니': s.mealType,
    '메뉴': s.menuName,
    '가격(원)': s.price,
    '예약 인원': s.reservedCount,
    '관심 인원': s.interestedCount,
    '총 예상 식수': s.totalEstimated,
    '평균 별점': s.avgRating,
    '예상 혼잡도': s.congestion,
  }));
  const ws2 = XLSX.utils.json_to_sheet(rows2);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 16 },
    { wch: 8 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, '식당별_수요집계표');

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  XLSX.writeFile(wb, `${filenamePrefix}_${todayStr}.xlsx`);
}

export function exportRecordsToCSV(records: OrderRecord[], filenamePrefix = '학식_주문수요_엑셀') {
  const summaries = computeMenuSummaries(records);
  const headers = ['날짜', '식당', '끼니', '메뉴', '가격', '예약 인원', '관심 인원', '총 예상 식수', '평균 별점', '예상 혼잡도'];
  const rows = summaries.map((s) => [
    s.date,
    s.restaurant,
    s.mealType,
    s.menuName,
    s.price,
    s.reservedCount,
    s.interestedCount,
    s.totalEstimated,
    s.avgRating,
    s.congestion,
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  link.href = url;
  link.download = `${filenamePrefix}_${todayStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
