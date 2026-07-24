import StepIndicator from "@/shared/components/StepIndicator";
import Button from "@/shared/components/Button";
import iconCamera from "@/assets/icons/icon_camera.svg";
import iconInfo from "@/assets/icons/icon_info.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from "@/shared/components/Modal";
import { useRegisterStore } from "@/store/registerStore";
import { STEPS } from "@/features/host-register/api/mock_register";

// 사진 촬영 가이드 안내 문구
const GUIDE_ITEMS = [
  "밝고 선명한 공간 사진을 권장합니다.",
  "공간의 전체적인 모습과 세부 시설이 잘 보이게 찍어주세요",
  "수평이 잘 맞은 사진이 게스트의 신뢰도를 높입니다.",
];

export const RegisterStep5 = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState<"confirm" | "success" | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const form = useRegisterStore((s) => s.form);
  const reset = useRegisterStore((s) => s.reset);

  // 최종 제출 (지금은 Mock: 콘솔 출력. 실제 POST /spaces는 2차 API 때)
  const handleSubmit = () => {
    if (import.meta.env.DEV) console.log("공간 등록 제출 데이터:", form);
    setModal("success");
  };
  // 성공 확인 → 보관함 비우고 '내 공간'으로 이동
  const handleDone = () => {
    reset();
    navigate("/host/spaces");
  };

  return (
    <div className="mx-auto flex w-full max-w-[794px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 — 4 = 다섯 번째 단계(사진 등록, 마지막) */}
      <StepIndicator
        steps={STEPS}
        currentStep={4}
      />

      {/* 섹션: 사진 등록 */}
      <div className="flex flex-col gap-6">
        {/* 섹션 제목 + 안내문 */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-[28px] font-bold">사진 등록</h2>
          <p className="text-text-primary text-[22px] font-bold">
            공간의 사진을 등록해 주세요
          </p>
          <p className="text-text-tertiary text-xl font-medium">
            최소 3장 이상의 사진을 등록해주세요. 첫 번째 사진이 대표 사진이
            됩니다.
          </p>
        </div>

        {/* 사진 업로더: 카메라 타일 + 업로드된 썸네일들 */}
        <div className="flex flex-wrap gap-[18.5px]">
          {/* 업로드 버튼 타일 (카메라 아이콘 + 매수 카운트) */}
          <label
            aria-label="사진 추가"
            className="border-divider text-text-tertiary flex size-[144px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2"
          >
            <img
              src={iconCamera}
              alt=""
              className="h-10 w-10"
            />
            {/* 업로드 매수 실시간 카운트 (챈 디자인 크기 + 내 photos 값) */}
            <span className="text-xl font-medium">{photos.length}/10장</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setPhotos((prev) => [
                  ...prev,
                  ...Array.from(e.target.files ?? []).slice(
                    0,
                    Math.max(0, 10 - prev.length),
                  ),
                ])
              }
              className="sr-only"
            />
          </label>

          {/* 업로드된 사진 썸네일 (미리보기 URL 관리는 PhotoThumbnail 내부에서) */}
          {photos.map((photo, i) => (
            <PhotoThumbnail
              key={i}
              photo={photo}
              isFirst={i === 0}
              onRemove={() =>
                setPhotos((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          ))}
        </div>

        {/* 사진 촬영 가이드 박스 */}
        <div className="bg-tag-bg flex flex-col gap-2 rounded-lg p-4">
          <span className="text-primary-hover flex items-center gap-1 text-xl font-bold">
            <img
              src={iconInfo}
              alt=""
              className="h-6 w-6"
            />
            사진 촬영 가이드
          </span>
          <ul className="text-text-secondary flex list-disc flex-col gap-1 ps-[30px] text-xl font-medium">
            {GUIDE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 이전 / 완료 버튼 (우측 정렬)
          TODO(2차): 사진 3장 이상일 때만 활성화(유효성) + 최종 제출(POST /spaces) */}
      <div className="flex justify-end gap-2">
        <Modal
          isOpen={modal === "confirm"}
          title="공간을 등록 하시겠습니까?"
          cancelLabel="돌아가기"
          confirmLabel="공간 등록하기"
          onCancel={() => setModal(null)}
          onConfirm={handleSubmit}
        />
        <Modal
          isOpen={modal === "success"}
          title="공간이 성공적으로 등록되었습니다!"
          confirmLabel="확인"
          singleButton
          showCheckIcon
          onCancel={handleDone}
          onConfirm={handleDone}
        />

        <Button
          variant="gray"
          size="nav"
          onClick={() => navigate("/host/register/step4")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          disabled={photos.length < 3}
          onClick={() => setModal("confirm")}
        >
          완료
        </Button>
      </div>
    </div>
  );
};

// 사진 썸네일 — 미리보기 URL을 한 번만 만들고 정리(revoke)까지 관리 (메모리 누수 방지)
const PhotoThumbnail = ({
  photo,
  isFirst,
  onRemove,
}: {
  photo: File;
  isFirst: boolean;
  onRemove: () => void;
}) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo);
    setUrl(objectUrl);
    // 뒷정리: 언마운트 / photo 변경 시 URL 해제 (메모리 누수 방지)
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="bg-tag-bg border-divider relative size-[144px] shrink-0 overflow-hidden rounded-lg border-2">
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
      />

      {/* 삭제 버튼 (왼쪽 위) */}
      <button
        type="button"
        aria-label="사진 삭제"
        onClick={onRemove}
        className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-xs text-white"
      >
        ×
      </button>

      {isFirst && (
        <span className="bg-primary-light text-primary absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-xl font-medium whitespace-nowrap">
          대표사진
        </span>
      )}
    </div>
  );
};
