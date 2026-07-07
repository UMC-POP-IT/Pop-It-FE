/* 일/월/년 단위 가격 */
export interface Cost {
  day: number;
  month: number;
  year: number;
}
export interface Space {
  id: number;
  hostId: number;
  imageUrls: string[]; // 이미지 URL 배열, 첫 번째 이미지는 대표 이미지로 사용
  heartCount: number; // 좋아요 개수
  name: string; // 건물명
  address: string; // 주소
  cost: Cost; // 일/월/년(연) 별 가격
  keywords: string[]; // 키워드들
  description: string; // 공간 설명
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: "GUEST" | "HOST";
  profileImageUrl?: string;
}

export interface Reservation {
  id: number;
  spaceId: number;
  guestId: number;
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "IN_USE" | "COMPLETED";
  totalPrice: number;
}
