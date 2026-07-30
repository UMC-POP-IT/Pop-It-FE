import { apiFetch } from "@/shared/utils/apiClient";
import type { ApiHostReservation, ApiMySpace, ReservationStatus } from "@/types";

interface HostReservationsResult {
  reservations: ApiHostReservation[];
  hasNext: boolean;
  nextCursor: number | null;
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
  imageUrls: string[];
}

export async function fetchHostReservations(params?: {
  status?: string;
  cursor?: number;
  size?: number;
}): Promise<HostReservationsResult> {
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
  return apiFetch(`/api/v1/reservations/${reservationId}/approve`, {
    method: "POST",
  });
}

export async function rejectReservation(
  reservationId: number,
): Promise<ReservationActionResult> {
  return apiFetch(`/api/v1/reservations/${reservationId}/reject`, {
    method: "POST",
  });
}

export async function approveCheckout(
  reservationId: number,
): Promise<ReservationActionResult> {
  return apiFetch(`/api/v1/reservations/${reservationId}/checkout/approve`, {
    method: "POST",
  });
}

export async function fetchCheckoutPhotos(
  reservationId: number,
): Promise<string[]> {
  const result = await apiFetch<CheckoutPhotosResult>(
    `/api/v1/reservations/${reservationId}/checkout-images`,
  );
  return result.imageUrls ?? [];
}

export async function fetchMySpaces(params?: {
  page?: number;
  size?: number;
}): Promise<MySpacesResult> {
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  const qs = query.toString();
  return apiFetch<MySpacesResult>(
    `/api/v1/spaces/my${qs ? `?${qs}` : ""}`,
  );
}

export async function deleteSpace(spaceId: number): Promise<void> {
  await apiFetch(`/api/v1/spaces/${spaceId}`, { method: "DELETE" });
}
