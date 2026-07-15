import { useEffect, useRef, useState } from "react";
import Button from "@/shared/components/Button";

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

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
  amount: number;
  orderId: string; // 고유 주문번호
  orderName: string; // 주문명
  customerEmail: string;
  customerName: string;
  customerMobilePhone: string;
  onComplete: () => void;
}

const TossPayments = ({
  amount,
  orderId,
  orderName,
  customerEmail,
  customerName,
  customerMobilePhone,
  onComplete
}: TossPaymentsProps) => {
  const paymentRef = useRef<TossPayment | null>(null);
  const [isSdkReady, setIsSdkReady] = useState(false);

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
    if (!paymentRef.current) return;

    // 결제를 요청하기 전에 orderId, amount를 서버에 저장
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도
    // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
    await paymentRef.current.requestPayment({
      method: "CARD",
      amount: { currency: "KRW", value: amount },
      orderId,
      orderName,
      successUrl: `${window.location.origin}/success`,
      failUrl: `${window.location.origin}/fail`,
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
  };

  return (
    <Button className="w-40" variant="primary" size="md" onClick={() => {handlePayment(); onComplete();}}>
        작성 완료
    </Button>
  );
};

export default TossPayments;
