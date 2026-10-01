import * as XLSX from 'xlsx';
import { MenuItem } from '../types/dining.ts';

export function formatMenuItemsForExport(items: MenuItem[]) {
  return items.map((item, index) => {
    // Calculate primary ingredients total (g -> kg) based on reservation + interested factor
    // Expected actual diners = reservedCount + (interestedCount * 0.4)
    const expectedDiners = Math.round(item.reservedCount + item.interestedCount * 0.4);
    const mainIngredientsSummary = item.mainIngredients
      .map(
        (ing) =>
          `${ing.name}: ${((ing.amountPerServingGrams * expectedDiners) / 1000).toFixed(1)}kg`
      )
      .join(', ');

    return {
      '연번': index + 1,
      '날짜': item.date,
      '식당': item.restaurantName,
      '끼니': item.mealType,
      '메뉴': item.name,
      '가격': item.price,
      '예약 인원': item.reservedCount,
      '관심 인원(먹을예정)': item.interestedCount,
      '총 예상 식수(명)': expectedDiners,
      '평균 별점': Number(item.rating.toFixed(1)),
      '리뷰 수': item.reviewCount,
      '예상 혼잡도': item.congestion,
      '혼잡 시간대': item.peakTime,
      '예상 대기시간(분)': item.estimatedWaitMinutes,
      '품절 여부': item.isSoldOut ? '품절' : '정상 판매중',
      '준비 수량': item.stockPrepared,
      '예상 잔반/잔여율(%)': `${item.leftoverPercent}%`,
      '식재료 소요 추정(kg)': mainIngredientsSummary || '일반 조리',
    };
  });
}

export function exportMenuItemsToExcel(items: MenuItem[], filenamePrefix = '학식_수요운영리포트') {
  const data = formatMenuItemsForExport(items);
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for comfortable Excel readability
  worksheet['!cols'] = [
    { wch: 6 },  // 연번
    { wch: 12 }, // 날짜
    { wch: 16 }, // 식당
    { wch: 8 },  // 끼니
    { wch: 24 }, // 메뉴
    { wch: 10 }, // 가격
    { wch: 10 }, // 예약 인원
    { wch: 14 }, // 관심 인원
    { wch: 12 }, // 총 예상 식수
    { wch: 10 }, // 평균 별점
    { wch: 8 },  // 리뷰 수
    { wch: 12 }, // 예상 혼잡도
    { wch: 16 }, // 혼잡 시간대
    { wch: 14 }, // 예상 대기시간
    { wch: 12 }, // 품절 여부
    { wch: 10 }, // 준비 수량
    { wch: 14 }, // 예상 잔반/잔여율
    { wch: 36 }, // 식재료 소요 추정
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '학식수요_운영리포트');

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const finalFilename = `${filenamePrefix}_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}

export function exportMenuItemsToCSV(items: MenuItem[], filenamePrefix = '학식_수요운영리포트') {
  const data = formatMenuItemsForExport(items);
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = (row as any)[header] ?? '';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  // UTF-8 BOM \uFEFF ensures Excel in Korean Windows/Mac opens without garbled text
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTemplateFile(type: 'xlsx' | 'csv' = 'xlsx') {
  const templateSample = [
    {
      '날짜': '2026-10-14',
      '식당': '학생회관 식당',
      '끼니': '중식',
      '메뉴': '소고기미역국 백반',
      '가격': 5000,
      '카테고리': '한식',
      '준비수량': 200,
      '혼잡시간대': '12:15 ~ 12:45',
      '예상대기시간(분)': 10,
    },
    {
      '날짜': '2026-10-14',
      '식당': '제2학생회관 식당',
      '끼니': '중식',
      '메뉴': '수제치킨마요덮밥',
      '가격': 5500,
      '카테고리': '일식/양식',
      '준비수량': 180,
      '혼잡시간대': '12:10 ~ 12:40',
      '예상대기시간(분)': 15,
    },
  ];

  if (type === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(templateSample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '메뉴등록_양식');
    XLSX.writeFile(wb, '학식_메뉴일괄등록_양식.xlsx');
  } else {
    const headers = Object.keys(templateSample[0]);
    const rows = templateSample.map((r) =>
      headers.map((h) => `"${(r as any)[h]}"`).join(',')
    );
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '학식_메뉴일괄등록_양식.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export async function parseUploadedFile(file: File): Promise<Partial<MenuItem>[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

  return rawRows.map((row, idx) => {
    const date = row['날짜'] || new Date().toISOString().slice(0, 10);
    const restaurantName = row['식당'] || '학생회관 식당';
    const mealType = row['끼니'] || '중식';
    const name = row['메뉴'] || `신규 메뉴 ${idx + 1}`;
    const price = Number(row['가격']) || 5000;
    const category = row['카테고리'] || '한식';
    const stockPrepared = Number(row['준비수량'] || row['준비 수량']) || 150;
    const peakTime = row['혼잡시간대'] || row['혼잡 시간대'] || '12:15 ~ 12:45';
    const wait = Number(row['예상대기시간(분)'] || row['예상대기시간']) || 10;

    return {
      id: `imported-${Date.now()}-${idx}`,
      date: String(date).trim(),
      restaurantName: String(restaurantName).trim(),
      restaurantId: String(restaurantName).includes('생활관')
        ? 'rest-dormitory'
        : String(restaurantName).includes('제2')
        ? 'rest-second-union'
        : String(restaurantName).includes('교수') || String(restaurantName).includes('교직원')
        ? 'rest-faculty'
        : 'rest-student-union',
      mealType: mealType as any,
      name: String(name).trim(),
      price,
      category: category as any,
      caloriesKcal: 680,
      mainIngredients: [
        { name: '주원료 식재료', amountPerServingGrams: 150, category: '육류' },
        { name: '백미(쌀)', amountPerServingGrams: 130, category: '곡류' },
      ],
      reservedCount: 0,
      interestedCount: 0,
      rating: 4.5,
      reviewCount: 0,
      reviews: [],
      peakTime,
      estimatedWaitMinutes: wait,
      congestion: '보통',
      isSoldOut: false,
      stockPrepared,
      leftoverPercent: 3.5,
    };
  });
}
