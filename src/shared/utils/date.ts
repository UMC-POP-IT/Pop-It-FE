const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// dateStr: "YYYY-MM-DD"
export const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${DAY_NAMES[d.getDay()]})`;
};

/**
 * Date → "YYYY-MM-DD" (로컬 날짜 그대로, 타임존 변환 없음).
 * 예약/탐색 API 요청 등 서버로 날짜를 보낼 때 공통으로 쓰는 포맷터.
 */
export const toApiDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
