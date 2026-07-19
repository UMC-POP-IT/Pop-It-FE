import { useEffect, useRef, useState } from "react";
import SignatureCanvas, { type SignatureBoardHandle } from "./SignatureCanvas";

interface SignatureBoardProps {
  onIsSigned: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignatureBoard = ({onIsSigned}: SignatureBoardProps) => {
  const boardRef = useRef<SignatureBoardHandle>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    onIsSigned(!isEmpty);
  }, [isEmpty]);

  const handleClear = () => {
    boardRef.current?.clear();
    setStatus("idle");
  };

  const handleUndo = () => {
    boardRef.current?.undo();
    setStatus("idle");
  };

  // const handleSubmit = async () => {
  //   if (boardRef.current?.isEmpty()) return;

  //   setStatus("submitting");
  //   try {
  //     const blob = await boardRef.current?.toBlob("#ffffff");
  //     if (!blob) throw new Error("서명 이미지를 생성하지 못했습니다.");

  //     const form = new FormData();
  //     form.append("signature", blob, "signature.png");

  //     const response = await fetch(SIGNATURE_UPLOAD_URL, {
  //       method: "POST",
  //       body: form,
  //     });
  //     if (!response.ok) throw new Error("서명 저장에 실패했습니다.");

  //     setStatus("success");
  //   } catch (error) {
  //     console.error(error);
  //     setStatus("error");
  //   }
  // };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-text-primary text-xl font-bold">계약 전자 서명</div>
      <div className="text-text-secondary">서명란 (아래에 서명해주세요)</div>

      <div className="border-border bg-contract-guide-bg relative h-80 rounded-lg border">
        {isEmpty && (
          <span className="text-border pointer-events-none absolute inset-0 flex items-center justify-center text-2xl">
            전자 서명
          </span>
        )}
        <SignatureCanvas
          ref={boardRef}
          className="h-full w-full touch-none"
          onChange={(empty) => {
            setIsEmpty(empty);
            setStatus("idle");
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleUndo}
            disabled={isEmpty}
            className="text-text-secondary text-sm underline disabled:opacity-40"
          >
            실행 취소
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="text-text-secondary text-sm underline disabled:opacity-40"
          >
            지우기
          </button>
        </div>

        {/* <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isEmpty || status === "submitting"}
        >
          {status === "submitting" ? "저장 중..." : "서명 저장"}
        </Button> */}
      </div>

      {status === "success" && <span className="text-primary text-sm">서명이 저장되었습니다.</span>}
      {status === "error" && (
        <span className="text-danger text-sm">서명 저장에 실패했습니다. 다시 시도해주세요.</span>
      )}
    </div>
  );
};

export default SignatureBoard;
