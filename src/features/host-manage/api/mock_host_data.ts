// 호스트 센터 목업 데이터

export interface MockGuestInfo {
  id: number;
  nickname: string;
  avatarInitial: string;
  businessDescription: string; // 예약 신청 시 작성한 사업 설명
}

export interface MockHostSpace {
  id: number;
  name: string;
  address: string;
  area: string; // 면적
  category: string;
  cost: { hour: number; day: number };
  imageUrls: string[];
  description: string;
  facilities: string[];
  spaceInfo: string[];
  registeredAt: string;
  status: "REGISTERED" | "PENDING_REVIEW";
}

export interface HostReservation {
  id: number;
  spaceId: number;
  guestId: number;
  startDate: string;
  endDate: string;
  status:
    | "PENDING" // 승인 대기
    | "APPROVED" // 계약 대기 (승인 완료)
    | "CONTRACTED" // 계약 완료
    | "IN_USE" // 사용 중
    | "COMPLETED" // 사용 완료
    | "CANCELLED"; // 거절/취소
  totalPrice: number;
  checkoutPhotoUrls?: string[]; // 사용 완료 시 게스트가 등록한 퇴실 사진
}

// 호스트가 등록한 공간들
export const mockHostSpaces: MockHostSpace[] = [
  {
    id: 1,
    name: "신사 어반빌딩",
    address: "서울 강남구 역삼동 130-3",
    area: "66m²",
    category: "팝업스토어",
    cost: { hour: 80000, day: 700000 },
    imageUrls: [],
    description:
      "강남역 도보 3분 거리의 1층 코너 매장입니다.\n유동인구가 매우 많으며, 대형 쇼윈도우가 있어 팝업 스토어에 최적화되어 있습니다.",
    facilities: ["에어컨", "에어컨", "에어컨"],
    spaceInfo: ["에어컨", "에어컨", "에어컨"],
    registeredAt: "2026-06-23",
    status: "REGISTERED",
  },
  {
    id: 2,
    name: "홍대 루프탑 스튜디오",
    address: "서울 마포구 와우산로 44",
    area: "82m²",
    category: "팝업스토어",
    cost: { hour: 60000, day: 500000 },
    imageUrls: [],
    description:
      "홍대입구역 도보 5분 루프탑 공간입니다. 자연채광이 풍부하고 개방감이 넘칩니다.",
    facilities: ["에어컨", "와이파이", "주차"],
    spaceInfo: ["1층", "CCTV", "엘리베이터"],
    registeredAt: "2026-06-23",
    status: "REGISTERED",
  },
  {
    id: 3,
    name: "을지로 갤러리 공간",
    address: "서울 중구 을지로 56",
    area: "120m²",
    category: "갤러리",
    cost: { hour: 100000, day: 900000 },
    imageUrls: [],
    description:
      "을지로 감성 갤러리 공간입니다. 화이트톤 인테리어로 전시·팝업에 최적화되어 있습니다.",
    facilities: ["에어컨", "조명", "음향"],
    spaceInfo: ["2층", "화물 엘리베이터"],
    registeredAt: "2026-06-23",
    status: "REGISTERED",
  },
  {
    id: 4,
    name: "성수 복합문화공간",
    address: "서울 성동구 성수이로 45",
    area: "200m²",
    category: "복합문화",
    cost: { hour: 150000, day: 1200000 },
    imageUrls: [],
    description:
      "성수동 대형 복합문화공간입니다. 1·2층 전체 운영 가능하며 식음료 판매 허가 완료 공간입니다.",
    facilities: ["에어컨", "와이파이", "주차", "주방"],
    spaceInfo: ["1~2층", "CCTV", "화물 엘리베이터"],
    registeredAt: "2026-06-23",
    status: "REGISTERED",
  },
];

// 게스트 정보
export const mockGuests: Record<number, MockGuestInfo> = {
  10: {
    id: 10,
    nickname: "홍따오기",
    avatarInitial: "홍",
    businessDescription:
      "국내 신진 디자이너 브랜드 '모던하우스'의 첫 오프라인 팝업 스토어입니다. 의류 및 액세서리 판매 예정입니다.",
  },
  11: {
    id: 11,
    nickname: "김팝업",
    avatarInitial: "김",
    businessDescription:
      "K-뷰티 브랜드 '글로우랩'의 신제품 런칭 팝업입니다. 스킨케어 체험 및 판매를 진행할 예정입니다.",
  },
  12: {
    id: 12,
    nickname: "이아트",
    avatarInitial: "이",
    businessDescription:
      "독립 작가 그룹 '레드서클'의 연합 전시회입니다. 회화·설치·영상 작품 20여 점을 선보입니다.",
  },
  13: {
    id: 13,
    nickname: "박플래그",
    avatarInitial: "박",
    businessDescription:
      "라이프스타일 편집숍 '오브젝트'의 시즌 플래그십 스토어입니다. 홈데코·소품 판매 예정입니다.",
  },
};

// 호스트 관점 예약 목록
export const mockHostReservations: HostReservation[] = [
  {
    id: 101,
    spaceId: 1,
    guestId: 10,
    startDate: "2026-06-23",
    endDate: "2026-06-23",
    status: "PENDING",
    totalPrice: 25000000,
  },
  {
    id: 102,
    spaceId: 2,
    guestId: 11,
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    status: "PENDING",
    totalPrice: 2500000,
  },
  {
    id: 103,
    spaceId: 3,
    guestId: 12,
    startDate: "2026-07-10",
    endDate: "2026-07-15",
    status: "PENDING",
    totalPrice: 4500000,
  },
  {
    id: 104,
    spaceId: 1,
    guestId: 10,
    startDate: "2026-06-23",
    endDate: "2026-06-23",
    status: "APPROVED", // 계약 대기
    totalPrice: 25000000,
  },
  {
    id: 105,
    spaceId: 2,
    guestId: 11,
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    status: "CONTRACTED", // 계약 완료
    totalPrice: 2500000,
  },
  {
    id: 106,
    spaceId: 3,
    guestId: 12,
    startDate: "2026-07-10",
    endDate: "2026-07-15",
    status: "CONTRACTED", // 계약 완료
    totalPrice: 4500000,
  },
  {
    id: 107,
    spaceId: 1,
    guestId: 13,
    startDate: "2026-06-20",
    endDate: "2026-06-25",
    status: "IN_USE", // 사용 중
    totalPrice: 25000000,
  },
  {
    id: 108,
    spaceId: 2,
    guestId: 10,
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    status: "COMPLETED", // 사용 완료 (퇴실 사진 등록됨)
    totalPrice: 2500000,
    checkoutPhotoUrls: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
      "https://images.unsplash.com/photo-1497366754035-f200581393ab?w=800",
      "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=800",
    ],
  },
  {
    id: 109,
    spaceId: 3,
    guestId: 11,
    startDate: "2026-05-20",
    endDate: "2026-05-25",
    status: "COMPLETED", // 사용 완료 (퇴실 사진 미등록)
    totalPrice: 4500000,
  },
];
