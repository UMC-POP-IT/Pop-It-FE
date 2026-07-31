import { apiFetch } from "@/shared/utils/apiClient";
import type { ApiHostReservation, ApiMySpace, ReservationStatus } from "@/types";

// ─── 개발용 Mock ──────────────────────────────────────────────────────────────
const DEV_MOCK = import.meta.env.DEV;

const mockReservations: ApiHostReservation[] = [
  {
    reservationId: 101,
    status: "PENDING_APPROVAL",
    startDate: "2026-08-10",
    endDate: "2026-08-20",
    usagePurpose: "국내 신진 디자이너 브랜드 팝업 스토어",
    totalPrice: 7000000,
    isPhotoVerified: false,
    space: { spaceId: 1, buildingName: "신사 어반빌딩", address: "서울 강남구 역삼동 130-3", thumbnailUrl: "" },
    guest: { userId: 10, nickname: "홍따오기" },
  },
  {
    reservationId: 104,
    status: "APPROVED",
    startDate: "2026-08-05",
    endDate: "2026-08-12",
    usagePurpose: "라이프스타일 편집숍 시즌 플래그십 스토어",
    totalPrice: 8400000,
    isPhotoVerified: false,
    space: { spaceId: 4, buildingName: "성수 복합문화공간", address: "서울 성동구 성수이로 45", thumbnailUrl: "" },
    guest: { userId: 13, nickname: "박플래그" },
  },
  {
    reservationId: 106,
    status: "CONTRACT_COMPLETED",
    startDate: "2026-08-01",
    endDate: "2026-08-08",
    usagePurpose: "독립 작가 그룹 연합 전시회",
    totalPrice: 4000000,
    isPhotoVerified: false,
    space: { spaceId: 2, buildingName: "홍대 루프탑 스튜디오", address: "서울 마포구 와우산로 44", thumbnailUrl: "" },
    guest: { userId: 12, nickname: "이아트" },
  },
  {
    reservationId: 108,
    status: "IN_USE",
    startDate: "2026-07-20",
    endDate: "2026-07-31",
    usagePurpose: "홈데코·소품 판매 플래그십",
    totalPrice: 7700000,
    isPhotoVerified: false,
    space: { spaceId: 1, buildingName: "신사 어반빌딩", address: "서울 강남구 역삼동 130-3", thumbnailUrl: "" },
    guest: { userId: 13, nickname: "박플래그" },
  },
  {
    reservationId: 110,
    status: "USAGE_COMPLETED",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    usagePurpose: "인디 뮤지션 팝업 음반 판매전",
    totalPrice: 3200000,
    isPhotoVerified: true,
    space: { spaceId: 2, buildingName: "홍대 루프탑 스튜디오", address: "서울 마포구 와우산로 44", thumbnailUrl: "" },
    guest: { userId: 11, nickname: "김팝업" },
  },
  {
    reservationId: 111,
    status: "CHECKOUT_COMPLETED",
    startDate: "2026-06-10",
    endDate: "2026-06-15",
    usagePurpose: "K-뷰티 브랜드 신제품 런칭 팝업",
    totalPrice: 5400000,
    isPhotoVerified: true,
    space: { spaceId: 3, buildingName: "을지로 갤러리 공간", address: "서울 중구 을지로 56", thumbnailUrl: "" },
    guest: { userId: 12, nickname: "이아트" },
  },
];

const mockSpaces: ApiMySpace[] = [
  { spaceId: 1, buildingName: "신사 어반빌딩", thumbnailUrl: "", registeredAt: "2026-06-23" },
  { spaceId: 2, buildingName: "홍대 루프탑 스튜디오", thumbnailUrl: "", registeredAt: "2026-06-23" },
  { spaceId: 3, buildingName: "을지로 갤러리 공간", thumbnailUrl: "", registeredAt: "2026-06-23" },
];
// ─────────────────────────────────────────────────────────────────────────────

interface HostReservationsResult {
  reservations: ApiHostReservation[];
  hasNext: boolean;
  nextCursor: string | null;
}

interface MySpacesResult {
  spaces: ApiMySpace[];
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
}

interface ReservationActionResult {
  reservationId: number;
  status: ReservationStatus;
}

interface CheckoutPhotosResult {
  photoUrls: string[];
}

export async function fetchHostReservations(params?: {
  status?: string;
  cursor?: string;
  size?: number;
}): Promise<HostReservationsResult> {
  if (DEV_MOCK) return { reservations: mockReservations, hasNext: false, nextCursor: null };
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.cursor != null) query.set("cursor", String(params.cursor));
  if (params?.size != null) query.set("size", String(params.size));
  const qs = query.toString();
  return apiFetch<HostReservationsResult>(
    `/api/v1/reservations/host${qs ? `?${qs}` : ""}`,
  );
}

export async function approveReservation(
  reservationId: number,
): Promise<ReservationActionResult> {
  if (DEV_MOCK) return { reservationId, status: "APPROVED" };
  return apiFetch(`/api/v1/reservations/${reservationId}/approve`, {
    method: "POST",
  });
}

export async function rejectReservation(
  reservationId: number,
): Promise<ReservationActionResult> {
  if (DEV_MOCK) return { reservationId, status: "CANCELLED" };
  return apiFetch(`/api/v1/reservations/${reservationId}/reject`, {
    method: "POST",
  });
}

export async function approveCheckout(
  reservationId: number,
): Promise<ReservationActionResult> {
  if (DEV_MOCK) return { reservationId, status: "CHECKOUT_COMPLETED" };
  return apiFetch(`/api/v1/reservations/${reservationId}/checkout/approve`, {
    method: "POST",
  });
}

export async function rejectCheckout(
  reservationId: number,
): Promise<ReservationActionResult> {
  if (DEV_MOCK) return { reservationId, status: "USAGE_COMPLETED" };
  return apiFetch(`/api/v1/reservations/${reservationId}/checkout/reject`, {
    method: "POST",
  });
}

const MOCK_PHOTO_URLS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
];

export async function fetchCheckoutPhotos(
  reservationId: number,
): Promise<string[]> {
  if (DEV_MOCK) return MOCK_PHOTO_URLS;
  const result = await apiFetch<CheckoutPhotosResult>(
    `/api/v1/reservations/${reservationId}/checkout-images`,
  );
  return result.photoUrls ?? [];
}

export async function fetchMySpaces(params?: {
  page?: number;
  size?: number;
}): Promise<MySpacesResult> {
  if (DEV_MOCK) return { spaces: mockSpaces, totalCount: mockSpaces.length, currentPage: 0, hasNext: false };
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  const qs = query.toString();
  return apiFetch<MySpacesResult>(
    `/api/v1/spaces/my${qs ? `?${qs}` : ""}`,
  );
}

export async function deleteSpace(spaceId: number): Promise<void> {
  if (DEV_MOCK) return;
  await apiFetch(`/api/v1/spaces/${spaceId}`, { method: "DELETE" });
}

