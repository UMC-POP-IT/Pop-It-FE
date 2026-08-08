import arrowLeft from "@/features/guest-explore/icons/arrow_left.svg";
import arrowRight from "@/features/guest-explore/icons/arrow_right.svg";

export const ScrollButton = ({
  direction,
  topOffset,
  onClick,
}: {
  direction: "prev" | "next";
  /** 카드 이미지 영역 세로 중앙까지의 픽셀 거리 */
  topOffset: number;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전 공간 보기" : "다음 공간 보기"}
      onClick={onClick}
      style={{ top: topOffset }}
      className={`border-border absolute ${
        direction === "prev" ? "-left-4" : "-right-4"
      } z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[12px] border bg-white shadow-md cursor-pointer`}
    >
      <img
        src={direction === "prev" ? arrowLeft : arrowRight}
        alt=""
        className="h-8 w-8"
      />
    </button>
  );
}
