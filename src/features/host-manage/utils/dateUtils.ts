export const formatHostDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
};

export const getDurationDays = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};
