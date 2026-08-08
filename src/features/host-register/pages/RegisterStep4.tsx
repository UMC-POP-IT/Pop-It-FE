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
  // 공백을 전부 제거한 글자 수 (명세서 I103: 공간명 4자 이상은 공백 제외 기준)
  const nameLength = form.buildingName.replace(/\s/g, "").length;

  // 빈 칸일 때는 에러를 띄우지 않는다 — 입력 전부터 빨간 문구가 있으면 잘못한 것처럼 보인다
  const nameError =
    form.buildingName !== "" && nameLength < 4
      ? "공백 제외 4자 이상 입력해 주세요"
      : "";

  // 공간 설명은 명세서 I103 기준이 공백 제외가 아니라 단순 10자 이상이라 trim()을 유지한다
  const descriptionLength = form.description.trim().length;

  const descriptionError =
    form.description !== "" && descriptionLength < 10
      ? "10자 이상 입력해 주세요"
      : "";

  const isValid = nameLength >= 4 && descriptionLength >= 10;

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
            error={nameError}
          />
          {/* 에러가 뜰 땐 숨긴다 — 같은 자리에 두 줄이 겹치지 않게 (RegisterStep2 보증금과 동일한 방식) */}
          {!nameError && (
            <span className="text-text-secondary text-right text-base font-medium">
              공백 제외 4자 이상 ({nameLength}/20)
            </span>
          )}
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
              className={`text-text-primary w-full resize-none rounded-lg border bg-white px-4 py-3 text-lg font-medium transition-colors focus:outline-none ${
                descriptionError
                  ? "border-danger focus:border-danger"
                  : "border-border focus:border-primary"
              }`}
            />
            {/* 글자수 카운트 (실제 반영) */}
            <span className="text-text-disabled pointer-events-none absolute right-4 bottom-3 text-lg font-medium">
              {form.description.length}/1000
            </span>
          </div>
          {/* Input과 달리 textarea는 error prop이 없어 문구를 직접 그린다 (클래스는 Input.tsx와 동일).
      회색 안내는 두지 않는다 — 칸 안에 이미 글자수 카운터가 있어 안내가 두 줄로 겹친다 */}
          {descriptionError && (
            <span className="text-danger text-right text-base font-bold">
              {descriptionError}
            </span>
          )}
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
