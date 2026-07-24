import type { DateInfo } from "@/features/guest-explore/api/mock_spaces";

export const formatDate = (d: DateInfo) =>
  `${d.year}.${String(d.month).padStart(2, "0")}.${String(d.day).padStart(2, "0")} (${d.day_type})`;
