export interface Space {
  id: number;
  name: string;
  description: string;
  address: string;
  pricePerDay: number;
  imageUrls: string[];
  hostId: number;
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
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalPrice: number;
}
