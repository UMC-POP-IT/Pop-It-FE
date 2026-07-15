import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type SignatureBoardHandle = {
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
  toDataURL: (background?: string) => string | null;
  toBlob: (background?: string) => Promise<Blob | null>;
};

type Point = { x: number; y: number };

interface SignatureCanvasProps {
  className?: string;
  onChange?: (isEmpty: boolean) => void;
}

// 실제 서명이 그려진 캔버스는 배경이 투명하므로, 내보내기 시점에
// 별도 캔버스에 배경색을 먼저 채우고 그 위에 서명을 합성해서 반환한다.
const composeCanvas = (source: HTMLCanvasElement, background?: string) => {
  const output = document.createElement("canvas");
  output.width = source.width;
  output.height = source.height;

  const ctx = output.getContext("2d")!;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, output.width, output.height);
  }
  ctx.drawImage(source, 0, 0);
  return output;
};

const SignatureCanvas = forwardRef<SignatureBoardHandle, SignatureCanvasProps>(
  ({ className, onChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // 서명은 획(stroke) 단위 점 배열의 배열로 저장한다.
    // undo/clear 시 이 배열을 기준으로 캔버스를 다시 그리기 때문에,
    // 캔버스 픽셀 자체가 아니라 이 데이터가 "진짜" 서명 상태다.
    const strokesRef = useRef<Point[][]>([]);
    const drawingRef = useRef(false);

    const getContext = () => canvasRef.current?.getContext("2d") ?? null;

    // strokesRef에 저장된 모든 획을 처음부터 다시 그린다.
    // undo/clear처럼 이미 그려진 픽셀을 부분적으로 지울 수 없는 동작에서 사용한다.
    const redraw = () => {
      const canvas = canvasRef.current;
      const ctx = getContext();

      if (!canvas || !ctx) return;

      const ratio = window.devicePixelRatio || 1;

      ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      
      strokesRef.current.forEach((stroke) => {
        if (stroke.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        stroke.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      });
    };

    // 레티나 등 고해상도 화면에서 선이 흐릿하게 보이지 않도록,
    // CSS 크기(width/height)와 별개로 실제 캔버스 픽셀 수를
    // devicePixelRatio만큼 키우고 ctx.scale로 좌표계를 원래대로 맞춰준다.
    //
    // mount 시 한 번만 측정하면, 이후 (반응형 클래스 변경, HMR 등으로)
    // 실제 CSS 높이/너비가 바뀌었을 때 캔버스 버퍼 크기가 그대로 남아
    // 좌표계가 어긋나 포인터 위치와 그려지는 위치가 어긋난다.
    // ResizeObserver로 실제 렌더 크기 변화를 계속 반영한다.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const applySize = () => {
        const ctx = getContext();
        if (!ctx) return;
        const ratio = window.devicePixelRatio || 1;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        // ctx.scale은 호출될 때마다 누적되므로, setTransform으로 매번 절대값으로 고정한다.
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 2.5;
        redraw();
      };

      applySize();

      const observer = new ResizeObserver(applySize);
      observer.observe(canvas);
      return () => observer.disconnect();
    }, []);

    // 포인터 이벤트의 화면 좌표(clientX/Y)를 캔버스 내부 좌표로 변환한다.
    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      // setPointerCapture: 손가락/펜이 캔버스 밖으로 살짝 나가도
      // pointermove 이벤트를 계속 이 캔버스로 받기 위함.
      canvasRef.current?.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      // 새 획 시작 — 점 하나짜리 배열을 strokes에 추가한다.
      strokesRef.current.push([getPoint(e)]);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const point = getPoint(e);
      const currentStroke = strokesRef.current[strokesRef.current.length - 1];
      currentStroke.push(point);

      // 전체를 redraw()하지 않고, 직전 점과 현재 점만 이어 그려서
      // 매 이동마다 캔버스 전체를 다시 그리는 비용을 피한다.
      const ctx = getContext();
      if (ctx && currentStroke.length >= 2) {
        const prev = currentStroke[currentStroke.length - 2];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    };

    // 펜을 떼거나(pointerup) 캔버스 밖으로 나가거나(pointerleave)
    // 취소된(pointercancel) 경우 모두 이 함수로 획 그리기를 종료한다.
    const finishStroke = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      onChange?.(strokesRef.current.length === 0);
    };

    // 부모 컴포넌트가 ref로 clear/undo/isEmpty/toDataURL/toBlob을
    // 직접 호출할 수 있도록 노출한다.
    useImperativeHandle(ref, () => ({
      clear: () => {
        strokesRef.current = [];
        redraw();
        onChange?.(true);
      },
      // 가장 최근 획 하나만 제거하고 나머지 획들로 다시 그린다.
      undo: () => {
        strokesRef.current.pop();
        redraw();
        onChange?.(strokesRef.current.length === 0);
      },
      isEmpty: () => strokesRef.current.length === 0,
      // 서명 이미지를 PNG data URL로 반환 (예: 미리보기 <img src=... />).
      toDataURL: (background) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return composeCanvas(canvas, background).toDataURL("image/png");
      },
      // toDataURL과 동일한 이미지를 서버 업로드 등에 쓰기 좋은 Blob으로 반환.
      toBlob: (background) => {
        const canvas = canvasRef.current;
        if (!canvas) return Promise.resolve(null);
        return new Promise((resolve) => {
          composeCanvas(canvas, background).toBlob((blob) => resolve(blob), "image/png");
        });
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className={className}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      />
    );
  },
);

SignatureCanvas.displayName = "SignatureCanvas";

export default SignatureCanvas;
