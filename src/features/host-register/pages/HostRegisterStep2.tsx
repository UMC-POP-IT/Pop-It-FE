import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import FileUploadRow from "@/features/host-register/components/FileUploadRow";
import Select from "@/shared/components/Select";
import { useNavigate } from "react-router-dom";
import {
  HOST_STEPS,
  BANK_OPTIONS,
} from "@/features/host-register/api/mock_register";
import { useHostRegisterStore } from "@/store/registerStore";

export const HostRegisterStep2 = () => {
  const navigate = useNavigate();
  const form = useHostRegisterStore((s) => s.form);
  const setValues = useHostRegisterStore((s) => s.setValues);
  //최종 제출 (Mock: 콘솔 출력, 실제 POST /hosts는 2차)
  const handleSubmit = () => {
    if (import.meta.env.DEV) console.log("호스트 등록 제출 데이터", form);
    navigate("/host/host-register/complete");
  };
  const isValid =
  form.bankName !== "" &&
  form.accountNumber !== "" &&
  form.accountHolder !== "";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        호스트 등록
      </h1>

      {/* 진행바 — 1 = 두 번째 단계(계좌 정보) */}
      <StepIndicator
        steps={HOST_STEPS}
        currentStep={1}
      />

      {/* 섹션: 정산 계좌 정보 */}
      <div className="flex flex-col gap-6">
        {/* 섹션 제목 + 안내문 */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-lg font-bold">
            정산 계좌 정보
          </h2>
          <p className="text-text-secondary text-sm">
            정산 및 세금계산서 발행에 사용됩니다.
          </p>
        </div>

        {/* 통장 사본 (파일 첨부) */}
        <FileUploadRow
          label="통장 사본"
          placeholder="통장 사본 파일을 첨부해주세요"
          hint="* JPG, PNG, PDF 최대 10MB"
        />

        {/* 은행 (공통 select) */}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="bank"
            className="text-text-primary text-sm font-bold"
          >
            은행
          </label>
          <Select
            id="bank"
            options={BANK_OPTIONS.map((bank) => ({ value: bank, label: bank }))}
            value={form.bankName}
            onChange={(e) => setValues({ bankName: e.target.value })}
            placeholder="은행을 선택해주세요"
          />
        </div>

        {/* 정산 입금 계좌 번호 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="account-number"
            className="text-text-primary text-sm font-bold"
          >
            정산 입금 계좌 번호
          </label>
          <Input
            id="account-number"
            placeholder="- 없이 숫자만 입력"
            value={form.accountNumber}
            onChange={(e) => setValues({ accountNumber: e.target.value.replace(/[^0-9]/g, "") })}
          />
        </div>

        {/* 예금주 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="account-holder"
            className="text-text-primary text-sm font-bold"
          >
            예금주
          </label>
          <Input
            id="account-holder"
            placeholder="예금주 이름을 입력해주세요"
            value={form.accountHolder}
            onChange={(e) => setValues({ accountHolder: e.target.value })}
          />
          <span className="text-text-disabled text-xs">
            * 사업자 등록증(대표자명)과 일치해야 합니다.
          </span>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬)
          TODO(2차): 유효성 검사 통과 시 활성화 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="gray"
          onClick={() => navigate("/host/host-register/step1")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
