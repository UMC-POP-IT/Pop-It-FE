import { useId } from "react";
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

  // 오류 문구를 textarea와 묶기 위한 id (스크린리더가 입력 이름 뒤에 이어서 읽게)
  const descriptionHintId = useId();

  return (
    // 여백·폭 규격은 RegisterStep1과 동일 (본문 328/535/644, 위 134 / 아래 120·88)
    <div className="mx-auto flex w-full max-w-[535px] flex-col pt-0 pb-14 md:pt-[102px] md:pb-[88px] lg:max-w-[644px]">
      {/* 페이지 제목 (가운데) — 모바일 28 / md 이상 32 */}
      <h1 className="text-text-primary text-center text-[28px] font-bold md:text-[32px]">
        {isEdit ? "공간 수정" : "공간 등록"}
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 3 = 네 번째 단계.
          StepIndicator에 className prop이 없어 div로 감싸 간격을 준다.
          컴포넌트 안에 py-3(12)이 이미 있어 피그마 36 = mt-6(24) + 12.
          모바일은 20 = mt-2(8) + 12 */}
      <div className="mt-2 md:mt-6">
        <StepIndicator
          steps={STEPS}
          currentStep={3}
        />
      </div>

      {/* 섹션: 상세 정보 — 피그마 74 = mt-[62px] + 진행바 아래 py-3(12).
          모바일은 58 = mt-[46px] + 12 */}
      <div className="mt-[46px] flex flex-col md:mt-[62px]">
        {/* 섹션 제목 + 안내문 — 안내문↔구분선은 이미 피그마 24(pb-6) */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-[24px] font-bold md:text-[28px]">
            상세 정보
          </h2>
          <p className="text-text-tertiary text-base font-medium">
            게스트가 공간의 매력을 충분히 느낄 수 있도록 상세히 적어주시면 예약
            확률이 높아집니다.
          </p>
        </div>

        {/* 입력 필드 묶음 — 구분선 아래 28(mt-7), 필드 사이 48(gap-12).
            두 값이 달라 섹션 gap 하나로는 못 만들어 래퍼를 따로 둔다 */}
        <div className="mt-7 flex flex-col gap-12">
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
                {form.buildingName.length}/20
              </span>
            )}
          </div>

          {/* 공간 설명 + TIP 박스 — 이 둘 사이만 피그마 24라 48(gap-12) 밖으로 묶는다.
              공간명↔공간 설명은 바깥 gap-12가 그대로 48을 준다 */}
          <div className="flex flex-col gap-6">
            {/* 공간 설명
            ⚠️ 공통 Textarea 없어 임시 구현 → 챈(4번)과 협의 예정 */}
            <div className="flex flex-col gap-2">
              <span className="text-text-primary text-[22px] font-bold">
                공간 설명
              </span>
              <div className="relative">
                {/* 위 <span>공간 설명</span>은 textarea와 연결되지 않은 순수 텍스트라
                aria-label로 이름을 따로 준다. placeholder는 입력을 시작하면
                사라지는 값이라 이름으로 삼기에 불안정하다 */}
                <textarea
                  rows={8}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) => setValues({ description: e.target.value })}
                  aria-label="공간 설명"
                  aria-invalid={descriptionError !== ""}
                  aria-describedby={descriptionHintId}
                  placeholder={
                    "예: 성수역 도보 3분 거리입니다. 인테리어가 깔끔하여 전시회에 적합합니다.\n주변 상권이 좋아 유동인구가 많습니다"
                  }
                  // 피그마 text/text_m18 — 18px/500/140%, placeholder는 Grey/grey-300(#AAA).
                  // #AAA는 --color-text-placeholder 토큰과 같은 값이다
                  className={`text-text-primary placeholder:text-text-placeholder w-full resize-none rounded-lg border bg-white px-4 py-3 text-lg leading-[1.4] font-medium transition-colors focus:outline-none ${
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
              회색 안내는 두지 않는다 — 칸 안에 0/1000 카운터가 있고, 10자 미만이면 어차피
              이 빨간 문구가 떠서 요건이 전달된다.
              단 노드는 조건부로 넣었다 빼지 않는다 — 라이브 영역은 '있던 요소의 내용이
              바뀔 때' 읽어주므로, 요소가 새로 생기면 스크린리더가 놓친다.
              비었을 때는 empty:hidden으로 죽여 gap-2만큼의 빈 줄이 생기지 않게 한다 */}
              <span
                id={descriptionHintId}
                aria-live="polite"
                className="text-danger text-left text-base font-bold empty:hidden"
              >
                {descriptionError}
              </span>
            </div>

            {/* TIP 박스 — 안쪽 여백 모바일 20 / md 이상 16 */}
            <div className="bg-info-bg flex flex-col gap-2 rounded-lg p-5 md:p-4">
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
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬) — 피그마 72 (3단 공통).
          버튼 사이는 모바일 16 / md 이상 8
          TODO(2차): 유효성 검사 통과 시 활성화 */}
      <div className="mt-18 flex justify-end gap-4 md:gap-2">
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
