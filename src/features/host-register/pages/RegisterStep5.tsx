import StepIndicator from "@/shared/components/StepIndicator";
import Button from "@/shared/components/Button";
import iconCamera from "@/assets/icons/icon_camera.svg";
import iconInfo from "@/assets/icons/icon_info.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from "@/shared/components/Modal";

// 5단계 진행바 라벨 (Step1~4와 동일 — 현재 단계만 다름)
const STEPS = ["위치/구조", "거래 정보", "공간 정보", "상세 정보", "사진 등록"];

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
          {/* 업로드 버튼 타일 (카메라 아이콘 + 매수 카운트)
              정적: 파일 input은 숨김 처리만. TODO: onChange로 실제 업로드/미리보기 처리 */}
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
                  ...Array.from(e.target.files ?? []),
                ])
              }
              className="hidden"
            />
          </label>

          {/* photos 실제 이미지 */}
          {photos.map((photo, i) => (
            <div
              key={i}
              className="bg-tag-bg border-divider relative size-[144px] shrink-0 overflow-hidden rounded-lg border-2"
            >
              <img
                src={URL.createObjectURL(photo)}
                alt=""
                className="h-full w-full object-cover"
              />

              {/* 삭제 버튼 (왼쪽 위) — 해당 사진만 배열에서 제거 */}
              <button
                type="button"
                aria-label="사진 삭제"
                onClick={() =>
                  setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-xs text-white"
              >
                ×
              </button>

              {i === 0 && (
                <span className="bg-primary-light text-primary absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-xl font-medium whitespace-nowrap">
                  대표사진
                </span>
              )}
            </div>
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
          정적: 목업 사진 3장 기준이라 '완료' 활성 상태로 표시.
          TODO: 실제 업로드 3장 이상일 때만 활성화 + 최종 제출(POST /spaces) 연결 */}
      <div className="flex justify-end gap-2">
        <Modal
          isOpen={modal === "confirm"}
          title="공간을 등록 하시겠습니까?"
          cancelLabel="돌아가기"
          confirmLabel="공간 등록하기"
          onCancel={() => setModal(null)}
          onConfirm={() => setModal("success")}
        />
        <Modal
          isOpen={modal === "success"}
          title="공간이 성공적으로 등록되었습니다!"
          confirmLabel="확인"
          singleButton
          showCheckIcon
          onCancel={() => navigate("/host/spaces")}
          onConfirm={() => navigate("/host/spaces")}
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
          onClick={() => setModal("confirm")}
        >
          완료
        </Button>
      </div>
    </div>
  );
};
