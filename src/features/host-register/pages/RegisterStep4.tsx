import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import { STEPS, TIP_ITEMS } from "@/features/host-register/api/mock_register";

export const RegisterStep4 = () => {
  const isEdit = useRegisterStore((s) => s.isEdit);
  const navigate = useNavigate();
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  const isValid =
    form.buildingName.trim().length >= 4 &&
    form.description.trim().length >= 10;

  return (
    <div className="mx-auto flex w-full max-w-[826px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        {isEdit ? "공간 수정" : "공간 등록"}
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
          <h2 className="text-text-primary text-[28px] font-bold">상세 정보</h2>
          <p className="text-text-tertiary text-base font-medium">
            게스트가 공간의 매력을 충분히 느낄 수 있도록 상세히 적어주시면 예약
            확률이 높아집니다.
          </p>
        </div>

        {/* 공간명 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            공간명
          </span>
          <Input
            placeholder="예: 성수 000 건물"
            value={form.buildingName}
            onChange={(e) => setValues({ buildingName: e.target.value })}
            maxLength={20}
          />
        </div>
        {/* 공간 설명
            ⚠️ 공통 Textarea 없어 임시 구현 → 챈(4번)과 협의 예정
            mt-6: 피그마상 공간명↔공간 설명만 48px. 상위 컨테이너 gap-6(24px)에
            24px을 더해 이 한 쌍에만 적용한다 (다른 항목 간격은 그대로 24px) */}
        <div className="mt-6 flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            공간 설명
          </span>
          <div className="relative">
            <textarea
              rows={8}
              maxLength={1000}
              value={form.description}
              onChange={(e) => setValues({ description: e.target.value })}
              placeholder={
                "예: 성수역 도보 3분 거리입니다. 인테리어가 깔끔하여 전시회에 적합합니다.\n주변 상권이 좋아 유동인구가 많습니다"
              }
              className="text-text-primary border-border focus:border-primary w-full resize-none rounded-lg border bg-white px-4 py-3 text-lg font-medium transition-colors focus:outline-none"
            />
            {/* 글자수 카운트 (실제 반영) */}
            <span className="text-text-disabled pointer-events-none absolute right-4 bottom-3 text-lg font-medium">
              {form.description.length}/1000
            </span>
          </div>
        </div>
        {/* TIP 박스 */}
        <div className="bg-info-bg flex flex-col gap-2 rounded-lg p-4">
          <span className="text-primary-hover text-xl font-bold">
            TIP : 이렇게 적어보세요!
          </span>
          <ul className="text-text-secondary flex list-disc flex-col gap-1 ps-[30px] text-xl font-medium">
            {TIP_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬)
          TODO(2차): 유효성 검사 통과 시 활성화 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          size="nav"
          onClick={() => navigate("/host/register/step3")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          disabled={!isValid}
          onClick={() => navigate("/host/register/step5")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
