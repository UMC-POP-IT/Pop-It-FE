import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import FileUploadRow from "@/features/host-register/components/FileUploadRow";
import { useNavigate } from "react-router-dom";
import {
  HOST_STEPS,
  TAXPAYER_OPTIONS,
} from "@/features/host-register/api/mock_register";
import { useHostRegisterStore } from "@/store/registerStore";
import { useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import AddressSearchModal from "@/features/host-register/components/AddressSearchModal";
import {
  caretIndexAfterDigits,
  formatBusinessNumber,
} from "@/features/host-register/utils/format_business_number";
import { sanitizeNumber } from "@/shared/utils/sanitizeNumber";

export const HostRegisterStep1 = () => {
  const navigate = useNavigate();
  const form = useHostRegisterStore((s) => s.form);
  const setValues = useHostRegisterStore((s) => s.setValues);
  const [isAddrOpen, setIsAddrOpen] = useState(false);
  // 서버 규칙: 숫자 10자리 (스웨거 businessRegistrationNumber)
  // 입력을 시작한 뒤에만 문구를 띄운다 — 빈 칸에 빨간 글씨가 먼저 뜨면 거슬린다
  const businessNumberError =
    form.businessNumber !== "" && form.businessNumber.length !== 10
      ? "사업자등록번호는 숫자 10자리여야 합니다"
      : "";

  const isValid =
    form.taxpayerType !== "" &&
    form.businessNumber.length === 10 &&
    form.storeName.trim() !== "" &&
    form.businessAddress.trim() !== "" &&
    form.businessDetailAddress.trim() !== "" &&
    form.businessLicenseImage !== null;

  // 하이픈이 끼워지면 표시 문자열 길이가 바뀐다. React가 새 value를 DOM에 넣는 순간
  // 브라우저는 커서를 끝으로 보내므로, 가운데를 고치면 커서가 뒤로 튕긴다.
  // 입력 시점에 "커서 앞 숫자 개수"를 기억해뒀다가 렌더 직후 같은 자리로 되돌린다.
  const businessInputRef = useRef<HTMLInputElement | null>(null);
  const caretDigitsRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const input = businessInputRef.current;
    const digitsBeforeCaret = caretDigitsRef.current;
    // null이면 사업자번호 입력이 원인이 아닌 렌더 — 커서를 건드리지 않는다
    if (!input || digitsBeforeCaret === null) return;
    caretDigitsRef.current = null;
    const caret = caretIndexAfterDigits(input.value, digitsBeforeCaret);
    input.setSelectionRange(caret, caret);
  });

  // 과세자 카드 두 장의 DOM 참조. 화살표 키로 포커스를 직접 옮겨야 해서 필요하다
  const taxpayerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // 지금 tabIndex=0을 가질 카드. 아무것도 안 골랐으면 첫 카드가 진입점이 된다
  const selectedTaxpayerIndex = TAXPAYER_OPTIONS.findIndex(
    (opt) => opt.title === form.taxpayerType,
  );
  const tabbableTaxpayerIndex =
    selectedTaxpayerIndex >= 0 ? selectedTaxpayerIndex : 0;

  /**
   * radiogroup의 표준 키보드 동작.
   *
   * role="radio"를 붙이면 스크린리더는 "라디오 버튼"이라고 읽는다. 그런데 실제 조작은
   * 일반 버튼이라 Tab으로 하나씩 들어가야 했다. 읽히는 것과 되는 것이 어긋나면
   * 키보드 사용자는 안내받은 대로 눌렀는데 아무 일도 안 일어나는 상태가 된다.
   *
   * 네이티브 라디오 그룹은 이렇게 동작한다:
   *  - 그룹 전체가 Tab 한 번에 들어가고 나간다 (roving tabIndex — 그룹 안에서
   *    tabIndex=0인 항목은 항상 하나뿐이고 나머지는 -1)
   *  - 안에서는 ←→↑↓로 옮기고, 옮기는 순간 선택도 같이 바뀐다
   */
  const handleTaxpayerKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const isForward = e.key === "ArrowRight" || e.key === "ArrowDown";
    const isBackward = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!isForward && !isBackward) return;
    // 그대로 두면 ↓가 페이지를 스크롤한다
    e.preventDefault();
    const count = TAXPAYER_OPTIONS.length;
    // +count 후 나머지 — 첫 항목에서 ←를 눌러도 음수가 되지 않고 마지막으로 돈다
    const next = (index + (isForward ? 1 : -1) + count) % count;
    setValues({ taxpayerType: TAXPAYER_OPTIONS[next].title });
    taxpayerRefs.current[next]?.focus();
  };

  const handleBusinessNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value; // 브라우저가 방금 만든 값 (하이픈 포함)
    const caret = e.target.selectionStart ?? raw.length;
    businessInputRef.current = e.target;
    caretDigitsRef.current = sanitizeNumber(raw.slice(0, caret)).length;
    setValues({ businessNumber: sanitizeNumber(raw).slice(0, 10) });
  };

  return (
    // 좌우 여백은 MainLayout의 px-4/md:px-6에 mx-auto 여백이 더해져 만들어진다.
    // 여기서 px를 또 주면 모바일에서 16+16=32가 되므로 폭(max-w)만 단계별로 잡는다.
    //   모바일 360 : 16(main) → 본문 328 (max-w 안 걸림)
    //   태블릿 768 : 24(main) + (720-535)/2 = 116.5 → 본문 535
    //   데스크톱1024: 24(main) + (976-644)/2 = 190   → 본문 644
    // 세로: 위 여백은 피그마 134(모바일은 MainLayout py-8의 32를 그대로 씀),
    //       아래 여백은 110/88에서 py-8(32)을 뺀 값
    <div className="mx-auto flex w-full max-w-[535px] flex-col pt-0 pb-14 md:pt-[102px] md:pb-[78px] lg:max-w-[644px]">
      {/* 페이지 제목 (가운데) — 모바일 28 / md 이상 32 */}
      <h1 className="text-text-primary text-center text-[28px] font-bold md:text-[32px]">
        호스트 등록
      </h1>

      {/* 진행바 — 0 = 첫 번째 단계(사업자 정보).
          StepIndicator에 className prop이 없어 div로 감싸 간격을 준다.
          컴포넌트 안에 py-3(12)이 이미 있어 피그마 36 = mt-6(24) + 12.
          모바일은 20 = mt-2(8) + 12 */}
      <div className="mt-2 md:mt-6">
        <StepIndicator
          steps={HOST_STEPS}
          currentStep={0}
          spacing="compact"
        />
      </div>

      {/* 섹션: 사업자 정보 — 피그마 80 = mt-17(68) + 진행바 아래 py-3(12).
          모바일은 58 = mt-[46px] + 12 */}
      <div className="mt-[46px] flex flex-col md:mt-17">
        {/* 섹션 제목 + 안내문 — 제목은 모바일 24 / md 이상 28 */}
        <div className="border-border flex flex-col gap-1 border-b pb-8">
          <h2 className="text-text-primary text-[24px] font-bold md:text-[28px]">
            사업자 정보
          </h2>
          <p className="text-text-tertiary text-base font-medium">
            안전한 거래를 위해 사업자 정보가 필요합니다.
          </p>
        </div>

        {/* 입력 필드 묶음 — 구분선 아래 28(mt-7), 필드 사이 48(gap-12).
            두 값이 달라 섹션 gap 하나로는 못 만들어 래퍼를 따로 둔다 */}
        <div className="mt-7 flex flex-col gap-12">
          {/* 과세자 종류 (택1) — store 연결됨 */}
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-[22px] font-bold">
              과세자 종류
            </span>
            {/* 피그마: 카드 312×100 · padding 20 · 안쪽 gap 0 · align-items:flex-start · flex:1 0 0.
                flex:1 0 0 = 남는 폭을 반씩 채운다는 뜻이라 312는 고정값이 아니라 결과값이다
                (644 - gap 20 = 624, 반씩 312). 카드 사이 gap만 20으로 잡아주면 된다.

                높이 100 안쪽 계산: 테두리 1×2 + 패딩 20×2 = 42를 빼면 내용 58.
                제목·설명 둘 다 20px/140%(줄높이 28)라 28+28 = 56 — 두 줄이 딱 들어간다.
                여기에 gap을 주면 넘치므로 두 글자 사이는 붙여 둔다 */}
            <div
              // 모바일은 카드가 세로로 쌓인다 (간격 8) · md 이상은 가로 2단 (간격 20)
              className="flex flex-col gap-2 md:flex-row md:gap-5"
              role="radiogroup"
              aria-label="과세자 유형 선택"
            >
              {TAXPAYER_OPTIONS.map((opt, index) => {
                const isSelected = form.taxpayerType === opt.title;
                return (
                  <button
                    key={opt.title}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    ref={(el) => {
                      taxpayerRefs.current[index] = el;
                    }}
                    // 그룹 안에서 Tab이 멈추는 자리는 한 곳뿐이다.
                    // 나머지는 -1이라 Tab이 건너뛰고, 화살표 키로만 옮긴다
                    tabIndex={index === tabbableTaxpayerIndex ? 0 : -1}
                    onKeyDown={(e) => handleTaxpayerKeyDown(e, index)}
                    onClick={() => setValues({ taxpayerType: opt.title })}
                    className={`flex h-[100px] flex-1 flex-col items-start rounded-lg border p-5 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary-light"
                        : "border-border bg-white"
                    }`}
                  >
                    <span
                      className={`text-xl font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}
                    >
                      {opt.title}
                    </span>
                    {/* 피그마 title/title_m20 — 20px/500/140%.
                        text-xl이 20px에 줄높이 28px(=140%)이라 leading은 따로 안 준다.
                        선택 시 Blue/blue-300 — global_style.css에 --color-primary-300으로 추가했다 */}
                    <span
                      className={`text-xl font-medium ${isSelected ? "text-primary-300" : "text-text-secondary"}`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 사업자 등록 번호 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="business-number"
              className="text-text-primary text-[22px] font-bold"
            >
              사업자 등록 번호
            </label>
            <Input
              id="business-number"
              placeholder="000-00-00000"
              inputMode="numeric"
              value={formatBusinessNumber(form.businessNumber)}
              onChange={handleBusinessNumberChange}
              error={businessNumberError}
            />
          </div>

          {/* 사업자 등록증 사본 (파일 첨부) */}
          <FileUploadRow
            label="사업자 등록증 사본"
            placeholder="사업자 등록증 사본 파일을 첨부해주세요"
            hint="* JPG, PNG, PDF 최대 10MB"
            file={form.businessLicenseImage}
            onFileChange={(file) => setValues({ businessLicenseImage: file })}
          />

          {/* 상호명 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="business-name"
              className="text-text-primary text-[22px] font-bold"
            >
              상호명
            </label>
            <Input
              id="business-name"
              placeholder="예: (주) 홍따오기 컴퍼니"
              value={form.storeName}
              onChange={(e) => setValues({ storeName: e.target.value })}
            />
          </div>

          {/* 사업장 주소 + 주소 찾기 + 상세주소 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="business-address"
              className="text-text-primary text-[22px] font-bold"
            >
              사업장 주소
            </label>
            {/* 데스크톱(1024): 입력창 440 + gap 20 + 버튼 184 = 본문 644.
                모바일: 버튼이 아래로 내려가 오른쪽에 붙고 간격은 12 */}
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
              {/* 입력창이 남은 폭을 다 먹고 버튼은 고정폭.
                  모바일(flex-col)에서 flex-1을 쓰면 주축이 세로라 입력창 높이가 뭉개진다 */}
              <div className="w-full md:flex-1">
                <Input
                  id="business-address"
                  placeholder="주소 찾기로 주소를 입력해주세요"
                  value={form.businessAddress}
                  readOnly
                />
              </div>
              <Button
                variant="black"
                size="field"
                className="self-end md:self-auto"
                onClick={() => setIsAddrOpen(true)}
              >
                주소 찾기
              </Button>
            </div>
            <Input
              placeholder="상세 주소를 입력해주세요"
              aria-label="상세 주소"
              value={form.businessDetailAddress}
              onChange={(e) =>
                setValues({ businessDetailAddress: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬) — 피그마 모바일 56 / md 이상 80 */}
      <div className="mt-14 flex justify-end md:mt-20">
        <Button
          variant="primary"
          size="nav"
          disabled={!isValid}
          onClick={() => navigate("/host/host-register/step2")}
        >
          다음으로
        </Button>
      </div>

      <AddressSearchModal
        isOpen={isAddrOpen}
        onClose={() => setIsAddrOpen(false)}
        onComplete={({ address }) => setValues({ businessAddress: address })}
      />
    </div>
  );
};
