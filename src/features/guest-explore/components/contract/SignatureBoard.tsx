import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import SignatureCanvas, { type SignatureBoardHandle as SignatureCanvasHandle } from "./SignatureCanvas";

export type SignatureBoardRef = {
  getSignatureBlob: () => Promise<Blob | null>;
};

interface SignatureBoardProps {
  onIsSigned: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignatureBoard = forwardRef<SignatureBoardRef, SignatureBoardProps>(({ onIsSigned }, ref) => {
  const boardRef = useRef<SignatureCanvasHandle>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    onIsSigned(!isEmpty);
  }, [isEmpty]);

  useImperativeHandle(ref, () => ({
    getSignatureBlob: () => {
      if (boardRef.current?.isEmpty()) return Promise.resolve(null);
      return boardRef.current?.toBlob("#ffffff") ?? Promise.resolve(null);
    },
  }));

  const handleClear = () => {
    boardRef.current?.clear();
  };

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
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="text-text-secondary text-sm underline disabled:opacity-40"
          >
            지우기
          </button>
        </div>
      </div>
    </div>
  );
});

SignatureBoard.displayName = "SignatureBoard";

export default SignatureBoard;