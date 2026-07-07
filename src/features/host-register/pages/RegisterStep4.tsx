import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";

// 5단계 진행바 라벨 (Step1과 동일 — 현재 단계만 다름)
const STEPS = ["위치/구조", "거래 정보", "공간 정보", "상세 정보", "사진 등록"];

//Tip 박스 안내 문구
const TIP_ITEMS = [
  "주변 교통 및 유동인구 특징",
  "추천하는 팝업/전시 업종",
  "공간 내 이용 가능한 가구 및 비품 정보",
  "입출입 절차 및 주의사항",
];

export const RegisterStep4 = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 1 = 네 번째 단계*/}
      <StepIndicator
        steps={STEPS}
        currentStep={3}
      />

      {/* 섹션: 상세 정보 */}
      <div className="flex flex-col gap-6">
        {/* 섹션 제목 + 안내문 */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-lg font-bold">상세 정보</h2>
          <p className="text-text-secondary text-sm">
            게스트가 공간의 매력을 충분히 느낄 수 있도록 상세히 적어주시면 예약
            확률이 높아집니다.
          </p>
        </div>

        {/* 공간명 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">공간명</span>
          <Input placeholder="예: 성수 000 건물" />
        </div>
        {/* 공간 설명
            ⚠️ 공통 Textarea 없어 임시 구현 → 챈(4번)과 협의 예정 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">공간 설명</span>
          <div className="relative">
            <textarea
              rows={8}
              maxLength={1000}
              placeholder={
                "예: 성수역 도보 3분 거리입니다. 인테리어가 깔끔하여 전시회에 적합합니다.\n주변 상권이 좋아 유동인구가 많습니다"
              }
              className="text-text-primary border-border focus:border-primary w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:outline-none"
            />
            {/* 정적: 글자수 0 고정. TODO: RHF 붙일 때 실제 카운팅 */}
            <span className="text-text-disabled pointer-events-none absolute right-4 bottom-3 text-xs">
              0/1000
            </span>
          </div>
        </div>
        {/* TIP 박스 */}
        <div className="bg-tag-bg flex flex-col gap-2 rounded-lg p-4">
          <span className="text-primary text-sm font-bold">
            TIP : 이렇게 적어보세요!
          </span>
          <ul className="text-text-secondary flex flex-col gap-1 text-sm">
            {TIP_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬)
          정적: 다음으로는 초기 비활성(회색) 상태.
          '이전'은 디자인상 회색 채움인데 공통 Button에 해당 variant 없어 outline 사용 → 챈(4번)과 협의 예정
          TODO: 유효성 검사 통과 시 활성화 + 단계 이동 (RHF 붙일 때) */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="md"
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
