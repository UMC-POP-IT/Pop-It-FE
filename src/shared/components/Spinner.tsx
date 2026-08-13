interface SpinnerProps {
  className?: string;
  /** 스크린 리더 안내 문구. 화면에는 스피너만 보이고 별도 텍스트는 노출하지 않는다. */
  "aria-label"?: string;
}

/**
 * 최소한의 원형 스피너. 데이터 요청이 delayMs(useDelayedLoading 참고) 이상
 * 걸릴 때만 잠깐 노출되는 용도라, 배경 박스나 안내 문구 없이 스피너 하나만
 * 그린다(#275 - 회색 박스·"불러오는 중이에요" 문구 노출 제거).
 */
const Spinner = ({
  className = "",
  "aria-label": ariaLabel = "불러오는 중",
}: SpinnerProps) => (
  <div
    role="status"
    aria-label={ariaLabel}
    className={`border-tag-bg border-t-primary size-8 animate-spin rounded-full border-4 ${className}`}
  />
);

export default Spinner;
