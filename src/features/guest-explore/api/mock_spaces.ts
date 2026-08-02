import { Space } from "@/types";
// import { isUsing } from "../components/ReservationCard";

// /** 예약 내역 */
// export interface Reservation {
//   id: number; // 예약 고유 ID (백엔드 예약 취소/조회 등 API 호출 시 식별자로 사용)
//   isApproved: boolean; // 승인 여부 (완료: true, 대기: false)
//   isContracted: boolean; // 계약 완료 여부 (승인 후 계약까지 마쳐야 "사용 중"으로 전환)
//   space: Space; // 예약한 공간 정보
//   total_cost: number; // 총 금액 (원 단위)
//   start: DateInfo; // 시작 날짜
//   end: DateInfo; // 마감 날짜
//   isDone: boolean; // 마감 여부
//   isPhotoVerified?: boolean; // 퇴실 사진 인증 완료 여부 (isDone === true 인 경우에만 의미 있음)
//   isPhotoRejected?: boolean; // 퇴실 사진 인증 거절 여부 (isDone === true && isPhotoVerified === false 인 경우에만 의미 있음)
// }

// /** 날짜 */
// export interface DateInfo {
//   year: number;
//   month: number;
//   day: number;
//   day_type: '월' | '화' | '수' | '목' | '금' | '토' | '일';
// }

// ============================================================
// a. ExplorePage
// ============================================================

/**
 * AI 맞춤형 공간 (캐러셀) - AiRecommendSpace.tsx / RealTimeRecommendSpace.tsx
 *
 * 공간 상세페이지(SpaceDetailPage)로 이동했을 때도 정상 렌더링되도록
 * ExploreSpaceDetail과 동일한 형태(카테고리/면적/시설정보/좌표 포함)로 정의한다.
 * (#126: 카드 클릭 시 "공간 정보를 찾을 수 없어요" 노출되던 버그 수정)
 */
export const recommendSpaces: ExploreSpaceDetail[] = [
  {
    id: 1001,
    hostId: 2001,
    imageUrls: [
      'https://picsum.photos/seed/space1001/400/300',
      'https://picsum.photos/seed/space1001b/400/300',
    ],
    heartCount: 128,
    name: '신사 아뜰리에',
    address: '서울 강남구 압구정로 42길 15',
    cost: { day: 80000 },
    keywords: ['자연광', '통유리', '화보촬영', '단독공간'],
    description: '통유리로 자연광이 가득 들어오는 신사동 단독 화보촬영 스튜디오입니다.',
    createdAt: '2026-01-12T09:00:00.000Z',
    category: '화보촬영',
    area: 33,
    facilities: ['통유리', '자연광 조명', '탈의실'],
    spaceInfo: ['단독공간', '주차 가능'],
    latitude: 37.5227,
    longitude: 127.0286,
  },
  {
    id: 1002,
    hostId: 2002,
    imageUrls: [
      'https://picsum.photos/seed/space1002/400/300',
      'https://picsum.photos/seed/space1002b/400/300',
    ],
    heartCount: 342,
    name: '신사 라운지홀',
    address: '서울 강남구 도산대로 108',
    cost: { day: 80000 },
    keywords: ['모임', '파티룸', '빔프로젝터', '주차가능'],
    description: '빔프로젝터와 넓은 주차 공간을 갖춘 모임 및 파티에 최적화된 라운지홀입니다.',
    createdAt: '2026-02-03T09:00:00.000Z',
    category: '파티룸',
    area: 50,
    facilities: ['빔프로젝터', '음향시설', '주방'],
    spaceInfo: ['주차 가능', '최대 30인'],
    latitude: 37.5219,
    longitude: 127.0233,
  },
  {
    id: 1003,
    hostId: 2003,
    imageUrls: [
      'https://picsum.photos/seed/space1003/400/300',
      'https://picsum.photos/seed/space1003b/400/300',
    ],
    heartCount: 87,
    name: '신사 하우스',
    address: '서울 강남구 논현로 175길 32',
    cost: { day: 90000 },
    keywords: ['루프탑', '야외', '바베큐', '뷰맛집'],
    description: '루프탑에서 바베큐를 즐기며 도심 야경을 감상할 수 있는 하우스입니다.',
    createdAt: '2026-02-20T09:00:00.000Z',
    category: '루프탑',
    area: 80,
    facilities: ['바베큐 그릴', '야외 테이블', '조명'],
    spaceInfo: ['야외 공간', '주차 가능'],
    latitude: 37.5175,
    longitude: 127.0246,
  },
  {
    id: 1004,
    hostId: 2004,
    imageUrls: [
      'https://picsum.photos/seed/space1004/400/300',
      'https://picsum.photos/seed/space1004b/400/300',
    ],
    heartCount: 215,
    name: '신사 미팅랩',
    address: '서울 강남구 강남대로 152길 8',
    cost: { day: 60000 },
    keywords: ['회의실', '화이트보드', '조용한', '역세권'],
    description: '역세권에 위치한 조용하고 아늑한 소규모 회의 및 스터디 공간입니다.',
    createdAt: '2026-03-05T09:00:00.000Z',
    category: '회의실',
    area: 20,
    facilities: ['화이트보드', '와이파이', '모니터'],
    spaceInfo: ['역세권', '최대 8인'],
    latitude: 37.5165,
    longitude: 127.0224,
  },
  {
    id: 1005,
    hostId: 2005,
    imageUrls: [
      'https://picsum.photos/seed/space1005/400/300',
      'https://picsum.photos/seed/space1005b/400/300',
    ],
    heartCount: 64,
    name: '성수 브릭스튜디오',
    address: '서울 성동구 연무장길 45',
    cost: { day: 100000 },
    keywords: ['노출콘크리트', '넓은공간', '전시', '팝업스토어'],
    description: '노출콘크리트 인테리어가 매력적인 성수동 전시 및 팝업스토어 전용 공간입니다.',
    createdAt: '2026-03-18T09:00:00.000Z',
    category: '팝업스토어',
    area: 66,
    facilities: ['노출콘크리트 인테리어', '대형 쇼윈도우', '조명'],
    spaceInfo: ['전시 특화', '넓은 공간'],
    latitude: 37.5446,
    longitude: 127.0559,
  },
  {
    id: 1006,
    hostId: 2006,
    imageUrls: [
      'https://picsum.photos/seed/space1006/400/300',
      'https://picsum.photos/seed/space1006b/400/300',
    ],
    heartCount: 176,
    name: '한남 갤러리룸',
    address: '서울 용산구 이태원로 55길 21',
    cost: { day: 120000 },
    keywords: ['모던', '고급', '갤러리', '프라이빗'],
    description: '모던하고 고급스러운 분위기의 한남동 프라이빗 갤러리룸입니다.',
    createdAt: '2026-04-01T09:00:00.000Z',
    category: '갤러리',
    area: 40,
    facilities: ['조명 시스템', '전시 벽면', '음향시설'],
    spaceInfo: ['프라이빗', '최대 20인'],
    latitude: 37.5347,
    longitude: 127.0011,
  },
];

// ============================================================
// b. SpaceDetailPage
// ============================================================

/**
 * 공간 탐색(목록) + 공간 상세에서 함께 쓰는 확장 타입
 * (공간 상세 화면설계서 기준으로 목록용 Space에는 없는 필드를 추가)
 */
export interface ExploreSpaceDetail extends Space {
  category: string; // 카테고리 태그 (ex. 팝업스토어)
  area: number; // 전용면적 (m²)
  // 공간 등록 시 일 단가만 입력받으므로 주/월 단가는 cost.day 기준으로 계산해서 노출
  // (주 단가 = cost.day * 7, 월 단가 = cost.day * 30, 표시부는 ExploreDetailInfo 참고)
  facilities: string[]; // 시설정보
  spaceInfo: string[]; // 공간정보
  // 공간 탐색/상세 응답에는 항상 포함되는 값이라 여기서는 필수로 좁혀서 사용
  latitude: number;
  longitude: number;
}

/**
 * 지도 목업용 좌표 스캐터 헬퍼
 * TODO: 백엔드 연동 후 API 응답의 latitude/longitude 값으로 교체
 */
const GANGNAM_STATION = { lat: 37.4979, lng: 127.0276 };

export const scatterCoordinate = (index: number) => ({
  latitude: GANGNAM_STATION.lat + (((index * 37) % 21) - 10) * 0.0012,
  longitude: GANGNAM_STATION.lng + (((index * 53) % 21) - 10) * 0.0012,
});

/**
 * 공간 탐색(목록) + 공간 상세 - ExploreSpace.tsx / SpaceDetailPage.tsx
 * TODO: 백엔드 연동 전까지 Figma 화면설계서 목업 값을 그대로 사용 (모든 카드가 동일한 값)
 */
export const exploreSpaces: ExploreSpaceDetail[] = Array.from(
  { length: 36 },
  (_, index) => ({
    id: index + 1,
    hostId: 1,
    name: "신사 어반빌딩",
    address: "서울 강남구 역삼동 130-5",
    imageUrls: [
      `https://picsum.photos/seed/explore${index + 1}main/692/372`,
      `https://picsum.photos/seed/explore${index + 1}sub1/240/180`,
      `https://picsum.photos/seed/explore${index + 1}sub2/240/180`,
      `https://picsum.photos/seed/explore${index + 1}sub3/240/180`,
      `https://picsum.photos/seed/explore${index + 1}sub4/240/180`,
    ],
    heartCount: 20,
    keywords: ["키워드", "키워드"],
    // 등록 시 일 단가만 입력받음 - 주/월 단가는 ExploreDetailInfo에서 cost.day 기준으로 계산
    cost: {
      day: 700000,
    },
    category: "팝업스토어",
    area: 66,
    description:
      "강남역 도보 3분 거리의 1층 코너 매장입니다.\n유동인구가 매우 많으며, 대형 쇼윈도우가 있어 팝업 스토어에 최적화되어 있습니다.",
    facilities: ["에어컨", "에어컨", "에어컨"], // TODO: 실제 시설 데이터 연동 전까지 Figma 목업 값 그대로 사용
    spaceInfo: ["에어컨", "에어컨", "에어컨"],
    createdAt: "2026-07-01T00:00:00.000Z",
    ...scatterCoordinate(index),
  }),
);

// ============================================================
// c. MyReservationPage
// ============================================================

/** 내가 찜한 공간 (Space 타입 그대로 이용) */
export const likedSpaces: Space[] = [
  {
    id: 1002,
    hostId: 2002,
    imageUrls: [
      'https://picsum.photos/seed/space1002/400/300',
      'https://picsum.photos/seed/space1002b/400/300',
    ],
    heartCount: 342,
    name: '신사 라운지홀',
    address: '서울 강남구 도산대로 108',
    cost: { day: 80000 },
    keywords: ['모임', '파티룸', '빔프로젝터', '주차가능'],
    description: '빔프로젝터와 넓은 주차 공간을 갖춘 모임 및 파티에 최적화된 라운지홀입니다.',
    createdAt: '2026-02-03T09:00:00.000Z',
  },
  {
    id: 1005,
    hostId: 2005,
    imageUrls: [
      'https://picsum.photos/seed/space1005/400/300',
      'https://picsum.photos/seed/space1005b/400/300',
    ],
    heartCount: 64,
    name: '성수 브릭스튜디오',
    address: '서울 성동구 연무장길 45',
    cost: { day: 100000 },
    keywords: ['노출콘크리트', '넓은공간', '전시', '팝업스토어'],
    description: '노출콘크리트 인테리어가 매력적인 성수동 전시 및 팝업스토어 전용 공간입니다.',
    createdAt: '2026-03-18T09:00:00.000Z',
  },
  {
    id: 1006,
    hostId: 2006,
    imageUrls: [
      'https://picsum.photos/seed/space1006/400/300',
      'https://picsum.photos/seed/space1006b/400/300',
    ],
    heartCount: 176,
    name: '한남 갤러리룸',
    address: '서울 용산구 이태원로 55길 21',
    cost: { day: 120000 },
    keywords: ['모던', '고급', '갤러리', '프라이빗'],
    description: '모던하고 고급스러운 분위기의 한남동 프라이빗 갤러리룸입니다.',
    createdAt: '2026-04-01T09:00:00.000Z',
  },
];

// /**
//  * 내 예약 내역
//  *
//  * [상태 분류 기준]
//  *  - isDone === true                                     → 지난 예약
//  *  - isApproved === true  && isContracted === true       → 사용 중
//  *  - isApproved === true  && isContracted === false      → 예약 예정 (승인 완료 · 계약 대기)
//  *  - isApproved === false                                 → 예약 예정 (승인 대기)
//  */
// export const reservations: Reservation[] = [
//   // 예약 예정 (승인 완료 · 계약 대기 → 계약 하기 버튼 노출)
//   {
//     id: 1,
//     isApproved: true,
//     isContracted: false,
//     space: {
//       id: 1006,
//       hostId: 2006,
//       imageUrls: [
//         'https://picsum.photos/seed/space1006/400/300',
//         'https://picsum.photos/seed/space1006b/400/300',
//       ],
//       heartCount: 176,
//       name: '한남 갤러리룸',
//       address: '서울 용산구 이태원로 55길 21',
//       cost: { day: 120000 },
//       keywords: ['모던', '고급', '갤러리', '프라이빗'],
//       description: '모던하고 고급스러운 분위기의 한남동 프라이빗 갤러리룸입니다.',
//       createdAt: '2026-04-01T09:00:00.000Z',
//     },
//     total_cost: 360000,
//     start: { year: 2026, month: 7, day: 10, day_type: '금' },
//     end: { year: 2026, month: 7, day: 12, day_type: '일' },
//     isDone: false,
//   },
//   // 예약 예정 (승인 대기)
//   {
//     id: 2,
//     isApproved: false,
//     isContracted: false,
//     space: {
//       id: 1002,
//       hostId: 2002,
//       imageUrls: [
//         'https://picsum.photos/seed/space1002/400/300',
//         'https://picsum.photos/seed/space1002b/400/300',
//       ],
//       heartCount: 342,
//       name: '신사 라운지홀',
//       address: '서울 강남구 도산대로 108',
//       cost: { day: 80000 },
//       keywords: ['모임', '파티룸', '빔프로젝터', '주차가능'],
//       description: '빔프로젝터와 넓은 주차 공간을 갖춘 모임 및 파티에 최적화된 라운지홀입니다.',
//       createdAt: '2026-02-03T09:00:00.000Z',
//     },
//     total_cost: 240000,
//     start: { year: 2026, month: 7, day: 18, day_type: '토' },
//     end: { year: 2026, month: 7, day: 20, day_type: '월' },
//     isDone: false,
//   },
//   {
//     id: 3,
//     isApproved: false,
//     isContracted: false,
//     space: {
//       id: 1006,
//       hostId: 2006,
//       imageUrls: [
//         'https://picsum.photos/seed/space1006/400/300',
//         'https://picsum.photos/seed/space1006b/400/300',
//       ],
//       heartCount: 176,
//       name: '한남 갤러리룸',
//       address: '서울 용산구 이태원로 55길 21',
//       cost: { day: 120000 },
//       keywords: ['모던', '고급', '갤러리', '프라이빗'],
//       description: '모던하고 고급스러운 분위기의 한남동 프라이빗 갤러리룸입니다.',
//       createdAt: '2026-04-01T09:00:00.000Z',
//     },
//     total_cost: 120000,
//     start: { year: 2026, month: 7, day: 25, day_type: '토' },
//     end: { year: 2026, month: 7, day: 25, day_type: '토' },
//     isDone: false,
//   },
//   // 계약 완료 (승인 완료 + 계약 완료, 계약 기간 전)
//   {
//     id: 4,
//     isApproved: true,
//     isContracted: true,
//     space: {
//       id: 1005,
//       hostId: 2005,
//       imageUrls: [
//         'https://picsum.photos/seed/space1009/400/300',
//         'https://picsum.photos/seed/space1009b/400/300',
//       ],
//       heartCount: 64,
//       name: '임시 장소',
//       address: '서울 성동구 연무장길 45',
//       cost: { day: 100000 },
//       keywords: ['노출콘크리트', '넓은공간', '전시', '팝업스토어'],
//       description: '노출콘크리트 인테리어가 매력적인 성수동 전시 및 팝업스토어 전용 공간입니다.',
//       createdAt: '2026-03-18T09:00:00.000Z',
//     },
//     total_cost: 300000,
//     start: { year: 2026, month: 6, day: 30, day_type: '화' },
//     end: { year: 2026, month: 7, day: 7, day_type: '금' },
//     isDone: false,
//   },
//   // 사용 중 (승인 완료 + 계약 완료, 계약 기간 내)
//   {
//     id: 5,
//     isApproved: true,
//     isContracted: true,
//     space: {
//       id: 1005,
//       hostId: 2005,
//       imageUrls: [
//         'https://picsum.photos/seed/space1005/400/300',
//         'https://picsum.photos/seed/space1005b/400/300',
//       ],
//       heartCount: 64,
//       name: '성수 브릭스튜디오',
//       address: '서울 성동구 연무장길 45',
//       cost: { day: 100000 },
//       keywords: ['노출콘크리트', '넓은공간', '전시', '팝업스토어'],
//       description: '노출콘크리트 인테리어가 매력적인 성수동 전시 및 팝업스토어 전용 공간입니다.',
//       createdAt: '2026-03-18T09:00:00.000Z',
//     },
//     total_cost: 300000,
//     start: { year: 2026, month: 6, day: 30, day_type: '화' },
//     end: { year: 2026, month: 7, day: 11, day_type: '금' },
//     isDone: false,
//   },
//   // 지난 예약 (마감 완료)
//   {
//     id: 6,
//     isApproved: true,
//     isContracted: true,
//     space: {
//       id: 1004,
//       hostId: 2004,
//       imageUrls: [
//         'https://picsum.photos/seed/space1004/400/300',
//         'https://picsum.photos/seed/space1004b/400/300',
//       ],
//       heartCount: 215,
//       name: '신사 미팅랩',
//       address: '서울 강남구 강남대로 152길 8',
//       cost: { day: 60000 },
//       keywords: ['회의실', '화이트보드', '조용한', '역세권'],
//       description: '역세권에 위치한 조용하고 아늑한 소규모 회의 및 스터디 공간입니다.',
//       createdAt: '2026-03-05T09:00:00.000Z',
//     },
//     total_cost: 60000,
//     start: { year: 2026, month: 6, day: 12, day_type: '금' },
//     end: { year: 2026, month: 6, day: 12, day_type: '금' },
//     isDone: true,
//     isPhotoVerified: false,
//   },
//   {
//     id: 7,
//     isApproved: true,
//     isContracted: true,
//     space: {
//       id: 1001,
//       hostId: 2001,
//       imageUrls: [
//         'https://picsum.photos/seed/space1001/400/300',
//         'https://picsum.photos/seed/space1001b/400/300',
//       ],
//       heartCount: 128,
//       name: '신사 아뜰리에',
//       address: '서울 강남구 압구정로 42길 15',
//       cost: { day: 80000 },
//       keywords: ['자연광', '통유리', '화보촬영', '단독공간'],
//       description: '통유리로 자연광이 가득 들어오는 신사동 단독 화보촬영 스튜디오입니다.',
//       createdAt: '2026-01-12T09:00:00.000Z',
//     },
//     total_cost: 160000,
//     start: { year: 2026, month: 5, day: 24, day_type: '토' },
//     end: { year: 2026, month: 5, day: 25, day_type: '일' },
//     isDone: true,
//     isPhotoVerified: true,
//   },
//   {
//     id: 8,
//     isApproved: true,
//     isContracted: true,
//     space: {
//       id: 1001,
//       hostId: 2001,
//       imageUrls: [
//         'https://picsum.photos/seed/space1001/400/300',
//         'https://picsum.photos/seed/space1001b/400/300',
//       ],
//       heartCount: 128,
//       name: '신사 아뜰리에',
//       address: '서울 강남구 압구정로 42길 15',
//       cost: { day: 80000 },
//       keywords: ['자연광', '통유리', '화보촬영', '단독공간'],
//       description: '통유리로 자연광이 가득 들어오는 신사동 단독 화보촬영 스튜디오입니다.',
//       createdAt: '2026-01-12T09:00:00.000Z',
//     },
//     total_cost: 160000,
//     start: { year: 2026, month: 5, day: 24, day_type: '토' },
//     end: { year: 2026, month: 5, day: 25, day_type: '일' },
//     isDone: true,
//     isPhotoVerified: false,
//     isPhotoRejected: true,
//   },
// ];

// // ------------------------------------------------------------
// // (참고) 예약 상태 계산 헬퍼
// // ------------------------------------------------------------

// export type ReservationStatus = '예약 예정' | '승인 완료' | '계약 완료' | '사용 중' | '지난 예약';

// export function getReservationStatus(r: Reservation): ReservationStatus {
//   if (r.isDone) return '지난 예약';
//   if (r.isApproved && r.isContracted){
//     if (isUsing(r.start, r.end))
//       return '사용 중';
//     return '계약 완료';
//   }
//   if (r.isApproved) return '승인 완료';
//   return '예약 예정';
// }

// // ------------------------------------------------------------
// // (참고) 예약 취소 API
// // ------------------------------------------------------------

// /**
//  * 예약을 취소한다.
//  * TODO: 실제 백엔드 연동 시 아래 mock 구현을 fetch/axios 기반 API 호출로 교체
//  * (예: DELETE /reservations/{id}). 호출부(컴포넌트)는 이 함수의 시그니처만
//  * 신뢰하므로 내부 구현을 바꿔도 호출부 수정은 필요 없다.
//  *
//  * exported `reservations` 배열은 여러 컴포넌트/테스트가 공유하는 참조이므로
//  * 여기서 직접 splice하지 않는다. 취소 성공 여부만 반환(실패 시 throw)하고,
//  * 실제 목록 갱신은 호출부(MyReservationList)의 로컬 state에서 처리한다.
//  */
// export async function cancelReservation(id: number): Promise<void> {
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   const exists = reservations.some((r) => r.id === id);
//   if (!exists) throw new Error("Reservation not found");
// }
