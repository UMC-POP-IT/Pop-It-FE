import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import FileUploadRow from "@/features/host-register/components/FileUploadRow";
import { useNavigate } from "react-router-dom";

// 호스트 등록 2단계 진행바 라벨
const STEPS = ["사업자 정보", "계좌 정보"];

// 과세자 유형 (택1)
// TODO: 문구·기준 금액은 디자인/실제 세법 기준 확인
const TAXPAYER_OPTIONS = [
  { title: "개인사업자 - 간이과세자", desc: "연 매출 8,000만원 미만" },
  { title: "개인사업자 - 일반과세자", desc: "연 매출 8,000만원 이상" },
];

export const HostRegisterStep1 = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        호스트 등록
      </h1>

      {/* 진행바 — 0 = 첫 번째 단계(사업자 정보) */}
      <StepIndicator
        steps={STEPS}
        currentStep={0}
      />

      {/* 섹션: 사업자 정보 */}
      <div className="flex flex-col gap-6">
        {/* 섹션 제목 + 안내문 */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-lg font-bold">사업자 정보</h2>
          <p className="text-text-secondary text-sm">
            안전한 거래를 위해 사업자 정보가 필요합니다.
          </p>
        </div>

        {/* 과세자 등록 (택1)
            정적: 첫 번째 카드 선택 상태로 표시. TODO: 실제 선택 로직 (RHF) */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">
            과세자 등록
          </span>
          <div
            className="grid grid-cols-2 gap-3"
            role="radiogroup"
            aria-label="과세자 유형 선택"
          >
            {TAXPAYER_OPTIONS.map((opt, i) => {
              const isSelected = i === 0;
              return (
                <button
                  key={opt.title}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`flex flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${isSelected ? "text-primary" : "text-text-primary"}`}
                  >
                    {opt.title}
                  </span>
                  <span className="text-text-secondary text-xs">
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
            className="text-text-primary text-sm font-bold"
          >
            사업자 등록 번호
          </label>
          <Input
            id="business-number"
            placeholder="000-00-00000"
          />
        </div>

        {/* 사업자 등록증 사본 (파일 첨부) */}
        <FileUploadRow
          label="사업자 등록증 사본"
          placeholder="사업자 등록증 사본 파일을 첨부해주세요"
          hint="* JPG, PNG, PDF 최대 10MB"
        />

        {/* 상호명 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="business-name"
            className="text-text-primary text-sm font-bold"
          >
            상호명
          </label>
          <Input
            id="business-name"
            placeholder="예: OO 갤러리, 카페 등"
          />
        </div>

        {/* 사업장 주소 + 주소 찾기 + 상세주소 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="business-address"
            className="text-text-primary text-sm font-bold"
          >
            사업장 주소
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="business-address"
                placeholder="주소를 검색해주세요"
              />
            </div>
            {/*TODO: 주소 검색 API(다음 우편번호 등) 연결 */}
            <Button
              variant="black"
              size="md"
            >
              주소 찾기
            </Button>
          </div>
          <Input
            placeholder="상세 주소를 입력해주세요"
            aria-label="상세 주소"
          />
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬)
          정적: 활성 상태로 표시. TODO: 유효성 검사 통과 시 활성화 + step2 이동 */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/host/host-register/step2")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
