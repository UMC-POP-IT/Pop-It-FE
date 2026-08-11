import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
}

/**
 * 모바일(360~767) 전용 바텀시트. 피그마 모바일 화면 3곳(공간유형/지역 필터,
 * 날짜 캘린더)에서 공통으로 쓰는 패턴을 하나의 컴포넌트로 뽑았다 - 드래그
 * 핸들(Rectangle 86, 40×4px) + 흰 배경 rounded-t-[20px] 패널 + 반투명
 * 백드롭. 실제 드래그 제스처(손가락으로 끌어서 닫기)는 피그마에 모션
 * 데이터가 없어 구현하지 않았고, 백드롭 클릭/Escape/각 사용처의 자체 액션
 * (옵션 선택, 확인 버튼 등)으로만 닫힌다.
 *
 * Modal.tsx와 같은 useDialogA11y를 재사용해서 포커스 트랩/Escape 닫기/닫힌
 * 뒤 트리거로 포커스 복원 동작을 그대로 맞춘다. body 바깥(document.body)에
 * 포탈로 그려서 HeroSearchBar 등 부모의 z-index/overflow 제약과 무관하게
 * 항상 화면 최상단에 뜨게 한다.
 */
const BottomSheet = ({ isOpen, onClose, ariaLabel, children }: BottomSheetProps) => {
  const initialFocusRef = useRef<HTMLDivElement>(null);
  const dialogRef = useDialogA11y<HTMLDivElement>({
    isOpen,
    onClose,
    initialFocusRef,
  });

  // 시트가 열려있는 동안 배경 스크롤을 막는다(안 막으면 리스트를 스크롤하려다
  // 뒤에 깔린 페이지가 같이 스크롤되는 이중 스크롤이 생긴다).
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="relative flex max-h-[80vh] flex-col rounded-t-[20px] bg-white shadow-[0px_-4px_10px_rgba(0,0,0,0.1)]"
      >
        <div ref={initialFocusRef} tabIndex={-1} className="sr-only" />
        <div className="flex shrink-0 items-center justify-center py-3">
          <span aria-hidden="true" className="h-1 w-10 shrink-0 rounded-full bg-[#999999]" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {/* iOS Home Indicator 세이프 에어리어 - 실제 기기의 하단 제스처 바 영역만큼
            비워둔다(피그마의 "Home Indicator" 목업 레이어와 동일한 취지). */}
        <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>,
    document.body,
  );
};

export default BottomSheet;
