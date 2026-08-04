import { useEffect } from "react";
import { MyReservationList } from "../components/MyReservationList";
import { WishedSpace } from "../components/WishedSpace";
import { useAuthStore } from "@/store/authStore";
import Button from "@/shared/components/Button";

export const MyReservationPage = () => {
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);

  // 헤더의 "나의 예약" 클릭과 동일한 가드: 로그인 없이 주소창으로 직접 들어와도
  // 찜 목록/예약 내역을 조회하지 않고 로그인을 유도한다.
  useEffect(() => {
    if (!user) openLoginModal({ type: "navigate", path: "/reservations" });
  }, [user, openLoginModal]);

  if (!user) {
    return (
      <div className="mt-20 flex flex-col items-center gap-4 py-12">
        <p className="text-text-primary text-lg font-medium">로그인이 필요한 페이지예요</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openLoginModal({ type: "navigate", path: "/reservations" })}
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <>
      <WishedSpace />
      <MyReservationList />
    </>
  );
};
