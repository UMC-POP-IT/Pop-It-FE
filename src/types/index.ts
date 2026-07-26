/* 일 단위 가격. 주/월 단가는 화면에서 day 기준으로 계산해서 노출한다. */
export interface Cost {
  day: number;
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
  // 카카오맵 표시용 좌표. 공간 탐색/상세 API 응답에는 항상 포함되지만,
  // 지도를 쓰지 않는 기존 목업(찜한 공간, 예약 내역 등)과의 호환을 위해 optional로 둠.
  latitude?: number; // 위도
  longitude?: number; // 경도
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
