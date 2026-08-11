import Button from "@/shared/components/Button";
import { GetPaymentInfoResponse } from "../api/my_reservation_api";

// 360~767px(모바일)에서 767px(태블릿) 크기 배치를 유지한 채 버튼이 자연스럽게 줄어들다가 768px부터는 Button의 기본 sm 크기(h-10/px-6/text-base)로 수렴한다.
// 대부분의 라벨은 짧아서 767 느낌(16px에 가깝게)을 최대한 유지할 수 있는 여유 있는 하한(13px/8px)을 쓴다 -
// 360px 기준 모바일 grid-cols-2 버튼 폭(78px)에서 "거절된 사진"(둘째로 긴 라벨)까지 줄바꿈 없이 들어가는 값.
const FLUID_BUTTON_CLASS =
  "!h-[clamp(36px,_32.47px_+_0.98vw,_40px)] !px-[clamp(8px,_-6.11px_+_3.92vw,_24px)] !text-[clamp(13px,_10.35px_+_0.735vw,_16px)] whitespace-nowrap";

// "호스트 승인 대기중..."만 유독 길어서 위 FLUID_BUTTON_CLASS 하한으로는 78px 폭에서 줄바꿈이 난다.
// 이 라벨일 때만 훨씬 낮은 하한(9px/0px)을 써서 줄바꿈 없이 들어가는 한도 내 최댓값으로 역산한 값이다 - 임의로 줄이지 말 것.
const FLUID_BUTTON_CLASS_LONG =
  "!h-[clamp(36px,_32.47px_+_0.98vw,_40px)] !px-[clamp(0px,_-21.17px_+_5.882vw,_24px)] !text-[clamp(9px,_2.83px_+_1.716vw,_16px)] whitespace-nowrap";

interface ReservationCardActionsProps {
  spaceId: number;
  isDone: boolean;
  needsPhotoVerification: boolean;
  isPhotoRejected: boolean;
  isAwaitingHostApproval: boolean;
  showCancel: boolean;
  showContract: boolean;
  isPaymentInfoError: boolean;
  paymentInfo: GetPaymentInfoResponse | null;
  onSpaceDetail: () => void;
  onPhotoVerify: () => void;
  onShowRejectedPhoto: () => void;
  onCancelReservation: () => void;
  onSignPayment: () => void;
}

export const ReservationCardButtons = ({
  isDone,
  needsPhotoVerification,
  isPhotoRejected,
  isAwaitingHostApproval,
  showCancel,
  showContract,
  isPaymentInfoError,
  paymentInfo,
  onSpaceDetail,
  onPhotoVerify,
  onShowRejectedPhoto,
  onCancelReservation,
  onSignPayment,
}: ReservationCardActionsProps) => {
  return (
    <div className="flex w-full flex-shrink-0 flex-col items-start justify-end gap-2 min-[1024px]:h-[190px] min-[1024px]:w-auto min-[1024px]:items-end">
      {needsPhotoVerification &&
        (isPhotoRejected ?
          <span className="self-start text-left text-red-400 text-[clamp(12px,_10.24px_+_0.49vw,_14px)] whitespace-pre-wrap">{"호스트가 퇴실 승인을\n거절했습니다 다시 인증해주세요"}</span> :
          <span className="self-start text-primary text-[clamp(12px,_10.24px_+_0.49vw,_14px)] min-[1024px]:self-end">사진 인증이 필요합니다 (필수)</span>
        )}
      {showContract && isPaymentInfoError && (
        <span className="self-start text-red-400 text-[clamp(12px,_10.24px_+_0.49vw,_14px)] min-[1024px]:self-end">결제 정보를 불러오지 못했습니다</span>
      )}
      <div className="grid w-full grid-cols-2 items-center gap-1 [&>*:last-child:nth-child(odd):not(:only-child)]:col-span-2 min-[768px]:flex min-[768px]:w-auto">
        {isDone &&
          (needsPhotoVerification ? (
            <>
              <Button variant="primary" size="sm" className={FLUID_BUTTON_CLASS} onClick={onPhotoVerify}>
                사진 인증
              </Button>
              {isPhotoRejected && (
                <Button variant="secondary" size="sm" className={FLUID_BUTTON_CLASS} onClick={onShowRejectedPhoto}>
                  거절된 사진
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className={isAwaitingHostApproval ? FLUID_BUTTON_CLASS_LONG : FLUID_BUTTON_CLASS}
              disabled
            >
              {isAwaitingHostApproval ? "호스트 승인 대기중..." : "인증 완료"}
            </Button>
          ))}
        <Button variant="secondary" size="sm" className={FLUID_BUTTON_CLASS} onClick={onSpaceDetail}>
          공간 상세
        </Button>
        {showCancel && (
          <Button variant="cancel" size="sm" className={FLUID_BUTTON_CLASS} onClick={onCancelReservation}>
            예약 취소
          </Button>
        )}
        {showContract && (
          <Button variant="primary" size="sm" className={FLUID_BUTTON_CLASS} disabled={!paymentInfo} onClick={onSignPayment}>
            계약 하기
          </Button>
        )}
      </div>
    </div>
  );
};
