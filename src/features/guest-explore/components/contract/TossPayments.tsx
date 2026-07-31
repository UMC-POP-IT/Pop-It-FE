import { useEffect, useRef, useState } from "react";
import Button from "@/shared/components/Button";
import { GetPresignedURL, PaymentRequest, SubmitSignature, UploadFileToPresignedURL } from "@/features/guest-explore/api/my_reservation_api";

export const TOSS_PENDING_PAYMENT_KEY = "toss_pending_payment";

// Toss 결제창 취소/실패 후 재시도 시 같은 계약에 대해 동일한 Idempotency-Key를 재사용해,
// PaymentRequest가 매 시도마다 새 미결제 레코드를 만들지 않도록 한다.
// (서버가 동일 Idempotency-Key 재요청 시 기존 PENDING 결제를 반환/재사용한다는 전제)
const getOrCreateIdempotencyKey = (reservationId: number): string => {
  const storageKey = `toss_idempotency_key_${reservationId}`;
  const existingKey = sessionStorage.getItem(storageKey);
  if (existingKey) return existingKey;

  const newKey = crypto.randomUUID().replace(/-/g, "_");
  sessionStorage.setItem(storageKey, newKey);
  return newKey;
};

interface TossPaymentRequestOptions {
  method: "CARD";
  amount: { currency: "KRW"; value: number };
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string;
  card: {
    useEscrow: boolean;
    flowMode: "DEFAULT";
    useCardPoint: boolean;
    useAppCardOnly: boolean;
  };
}

interface TossPayment {
  requestPayment: (options: TossPaymentRequestOptions) => Promise<void>;
}

interface TossPaymentsInstance {
  payment: (options: { customerKey: string }) => TossPayment;
}

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const TOSS_SDK_SRC = "https://js.tosspayments.com/v2/standard";
const CUSTOMER_KEY = "popit"

interface TossPaymentsProps {
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string;
  disabled: boolean;
  reservationId: number;
  getSignatureBlob: () => Promise<Blob | null>;
}

const TossPayments = ({
  customerEmail,
  customerName,
  customerMobilePhone,
  disabled,
  reservationId,
  getSignatureBlob,
}: TossPaymentsProps) => {
  const paymentRef = useRef<TossPayment | null>(null);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initPayment = () => {
      if (!window.TossPayments) return;
      const tossPayments = window.TossPayments(import.meta.env.VITE_TOSS_PAYMENTS_CLIENT_KEY);
      paymentRef.current = tossPayments.payment({ customerKey: CUSTOMER_KEY });
      setIsSdkReady(true);
    };

    if (window.TossPayments) {
      initPayment();
      return;
    }

    const script = document.createElement("script");
    script.src = TOSS_SDK_SRC;
    script.async = true;
    script.onload = initPayment;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  const handlePayment = async () => {
    if (!paymentRef.current || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const signatureBlob = await getSignatureBlob();
      if (!signatureBlob) throw new Error("서명 이미지를 생성하지 못했습니다.");

      const { uploads } = await GetPresignedURL({
        uploadType: "SIGNATURE",
        files: [{ contentType: "image/png" }],
      });
      if (uploads.length === 0) throw new Error("서명 업로드용 URL을 발급받지 못했습니다.");
      const [{ presignedUrl, fileUrl }] = uploads;

      const signatureFile = new File([signatureBlob], `signature_${reservationId}.png`, { type: "image/png" });
      await UploadFileToPresignedURL(presignedUrl, signatureFile);
      const { contractId } = await SubmitSignature(reservationId, { signatureUrl: fileUrl });

      // 결제를 요청하기 전에 서버에 orderId, amount를 먼저 생성/저장
      // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 막기 위해, 이후 requestPayment에는
      // 이 응답값(서버가 확정한 금액/주문정보)만 사용한다.
      const idempotencyKey = getOrCreateIdempotencyKey(reservationId);
      const { paymentId, orderId, orderName, amount } = await PaymentRequest(contractId, idempotencyKey);

      // Toss v2 CARD 결제는 페이지 전체를 successUrl/failUrl로 리다이렉트시키므로,
      // 이 시점 이후 코드는 결제가 승인 창으로 넘어가기 전 취소/에러가 난 경우에만 실행된다.
      // 실제 결제 승인은 리다이렉트 후 진입하는 결과 페이지에서 처리한다.
      sessionStorage.setItem(TOSS_PENDING_PAYMENT_KEY, JSON.stringify({ paymentId }));

      await paymentRef.current.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName,
        // 성공/실패 모두 예약 목록 페이지로 돌아오며, tossPayment 마커로 결제 리다이렉트임을 식별해
        // MainLayout의 TossPaymentResultHandler가 결과 모달을 띄운다.
        successUrl: `${window.location.origin}/reservations?tossPayment=1`,
        failUrl: `${window.location.origin}/reservations?tossPayment=1`,
        customerEmail,
        customerName,
        customerMobilePhone,
        card: {
          useEscrow: true,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (error) {
      sessionStorage.removeItem(TOSS_PENDING_PAYMENT_KEY);
      console.error(error);
      alert("서명 저장 또는 결제 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      disabled={disabled || !isSdkReady || isSubmitting}
      className="w-40"
      variant="primary"
      size="md"
      onClick={handlePayment}
    >
      {isSubmitting ? "처리 중..." : "작성 완료"}
    </Button>
  );
};

export default TossPayments;
