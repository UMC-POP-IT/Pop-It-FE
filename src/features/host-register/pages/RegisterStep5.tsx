import StepIndicator from "@/shared/components/StepIndicator";
import Button from "@/shared/components/Button";
import iconCamera from "@/assets/icons/icon_camera.svg";
import iconInfo from "@/assets/icons/icon_info.svg";

// 5단계 진행바 라벨 (Step1~4와 동일 — 현재 단계만 다름)
const STEPS = ["위치/구조", "거래 정보", "공간 정보", "상세 정보", "사진 등록"];

// 사진 촬영 가이드 안내 문구
const GUIDE_ITEMS = [
  "밝고 선명한 공간 사진을 권장합니다.",
  "공간의 전체적인 모습과 세부 시설이 잘 보이게 찍어주세요",
  "수평이 잘 맞은 사진이 게스트의 신뢰도를 높입니다.",
];

// 정적: 업로드된 사진 목업 (첫 장이 대표 사진)
// TODO: 실제 File[] 업로드 미리보기로 교체 (파일 input state / RHF 붙일 때)
const MOCK_PHOTOS = ["photo-1", "photo-2", "photo-3"];

export const RegisterStep5 = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
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
          <h2 className="text-text-primary text-lg font-bold">사진 등록</h2>
          <p className="text-text-secondary text-sm">
            공간의 사진을 등록해 주세요
          </p>
          <p className="text-text-secondary text-sm">
            최소 3장 이상의 사진을 등록해주세요. 첫 번째 사진이 대표 사진이
            됩니다.
          </p>
        </div>

        {/* 사진 업로더: 카메라 타일 + 업로드된 썸네일들 */}
        <div className="flex flex-wrap gap-3">
          {/* 업로드 버튼 타일 (카메라 아이콘 + 매수 카운트)
              정적: 파일 input은 숨김 처리만. TODO: onChange로 실제 업로드/미리보기 처리 */}
          <label
            aria-label="사진 추가"
            className="border-border text-text-secondary flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border"
          >
            <img
              src={iconCamera}
              alt=""
              className="h-6 w-6"
            />
            {/* 정적: 목업 매수 표시. TODO: 업로드 매수 실시간 카운팅 */}
            <span className="text-xs">{MOCK_PHOTOS.length}/10장</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
            />
          </label>

          {/* 업로드된 썸네일 (정적 목업) — 첫 장에 '대표사진' 뱃지
              TODO: MOCK_PHOTOS → 실제 업로드된 사진 미리보기(URL.createObjectURL)로 교체 */}
          {MOCK_PHOTOS.map((photo, i) => (
            <div
              key={photo}
              className="bg-tag-bg relative h-24 w-24 shrink-0 overflow-hidden rounded-lg"
            >
              {i === 0 && (
                <span className="bg-primary absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white">
                  대표사진
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 사진 촬영 가이드 박스 */}
        <div className="bg-tag-bg flex flex-col gap-2 rounded-lg p-4">
          <span className="text-text-primary flex items-center gap-1 text-sm font-bold">
            <img
              src={iconInfo}
              alt=""
              className="h-4 w-4"
            />
            사진 촬영 가이드
          </span>
          <ul className="text-text-secondary flex flex-col gap-1 text-sm">
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
        <Button variant="gray">이전</Button>
        <Button
          variant="primary"
          size="md"
        >
          완료
        </Button>
      </div>
    </div>
  );
};
