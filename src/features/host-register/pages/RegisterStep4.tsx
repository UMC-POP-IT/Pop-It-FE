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
  // 공간명 20자 상한을 스크린리더에 알리는 sr-only 문구의 id (아래 span 주석 참고)
  const nameLimitId = useId();

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
            {/* span이 아니라 label + htmlFor다. span은 바로 아래 Input과 아무 관계가 없어
                스크린리더가 이 칸을 "편집"이라고만 읽는다 (무엇을 넣는 칸인지 알 수 없다).
                HostRegisterStep1의 사업자 등록 번호와 같은 방식 */}
            <label
              htmlFor="building-name"
              className="text-text-primary text-[22px] font-bold"
            >
              공간명
            </label>
            {/* 20자 상한을 스크린리더에만 알린다. 화면에는 우측 카운터(7/20)가 있지만
                그건 aria-hidden이고(한 글자마다 "7 슬래시 20"을 읽으면 방해만 된다),
                maxLength는 HTML-AAM에서 ARIA로 매핑되지 않아 어떤 스크린리더도 읽지
                않는다. 이 문구가 없으면 입력이 20자에서 멈추는 이유를 알 수 없다.
                sr-only라 시안에는 영향이 없다 */}
            <span
              id={nameLimitId}
              className="sr-only"
            >
              최대 20자
            </span>
            <Input
              id="building-name"
              aria-describedby={nameLimitId}
              placeholder="예: 성수 000 건물"
              value={form.buildingName}
              onChange={(e) => setValues({ buildingName: e.target.value })}
              maxLength={20}
              error={nameError}
              // 글자수 카운터와 에러가 Input의 같은 메시지 슬롯을 나눠 쓴다.
              // 예전엔 카운터를 Input 밖에 두고 {!nameError && ...}로 교대시켰는데,
              // 부모 gap-2(8)와 Input 내부 gap-1(4)이 달라 에러가 뜰 때마다 4px씩 튀었다.
              // counter는 우측 정렬 + aria-hidden이 Input 안에서 처리된다 — 정렬을
              // 호출부에서 정하지 않는 이유는 Input.tsx의 메시지 슬롯 주석 참고
              counter={`${form.buildingName.length}/20`}
            />
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
              {/* Input과 달리 textarea는 error prop이 없어 문구를 직접 그린다
              (색·크기·굵기는 Input.tsx의 오류 문구와 같은 값을 맞춰 둔 것이고,
               클래스 문자열 자체는 Input 쪽이 슬롯 구조를 갖게 되면서 갈라졌다).
              회색 안내는 두지 않는다 — 칸 안에 0/1000 카운터가 있고, 10자 미만이면 어차피
              이 빨간 문구가 떠서 요건이 전달된다.
              단 노드는 조건부로 넣었다 빼지 않는다. 신뢰할 수 없는 건 '이미 있던 노드에
              role·aria-live 속성을 나중에 붙이는' 경우다(엔진에 따라 등록을 놓친다).
              내용을 가진 채로 삽입되는 role="alert"도 표준 alert 패턴이라 대개 낭독되지만,
              폼 안에서 방식이 갈리면 어느 쪽이 맞는지 알 수 없어 이 화면들은 전부
              '항상 마운트 + 내용만 갱신'으로 통일했다 (이슈 #306 리뷰 반영).
              이슈 #306: 예전엔 비었을 때 empty:hidden으로 죽였는데, display:none은
              자리도 같이 없애서 10자 미만을 칠 때마다 아래 TIP 박스와 버튼이 28px씩
              움직였다. min-h-6(24px = 한 줄)으로 자리를 미리 잡아 둔다 */}
              <span
                id={descriptionHintId}
                aria-live="polite"
                className="text-danger min-h-6 text-left text-base font-bold"
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
