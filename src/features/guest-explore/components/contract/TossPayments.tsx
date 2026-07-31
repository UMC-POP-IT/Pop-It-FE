import { useEffect, useRef, useState } from "react";
import Button from "@/shared/components/Button";
import { GetPresignedURL, SubmitSignature, UploadFileToPresignedURL } from "@/features/guest-explore/api/my_reservation_api";


interface TossPaymentRequestOptions {
  method: "CARD";
  amount: { currency: "KRW"; value: number };
  orderId: string;
  orderName: string;
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
  amount: number;
  orderId: string; // 고유 주문번호
  orderName: string; // 주문명
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string;
  disabled: boolean;
  reservationId: number;
  getSignatureBlob: () => Promise<Blob | null>;
  onComplete: (bothSigned: boolean) => void;
}

const TossPayments = ({
  amount,
  orderId,
  orderName,
  customerEmail,
  customerName,
  customerMobilePhone,
  disabled,
  reservationId,
  getSignatureBlob,
  onComplete
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
      const [{ presignedUrl, fileUrl }] = uploads;

      const signatureFile = new File([signatureBlob], `signature_${reservationId}.png`, { type: "image/png" });
      await UploadFileToPresignedURL(presignedUrl, signatureFile);
      const { bothSigned } = await SubmitSignature(reservationId, { signatureUrl: fileUrl });

      // 결제를 요청하기 전에 orderId, amount를 서버에 저장
      // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도
      // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
      await paymentRef.current.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName,
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

      onComplete(bothSigned); // 결제 결과 받은 뒤에만 호출하도록
    } catch (error) {
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
