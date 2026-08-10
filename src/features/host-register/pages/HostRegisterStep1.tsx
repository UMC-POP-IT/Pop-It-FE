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
import { useState } from "react";
import AddressSearchModal from "@/features/host-register/components/AddressSearchModal";

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
    form.businessLicenseImage !== null;

  return (
    <div className="mx-auto flex w-full max-w-[826px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        호스트 등록
      </h1>

      {/* 진행바 — 0 = 첫 번째 단계(사업자 정보) */}
      <StepIndicator
        steps={HOST_STEPS}
        currentStep={0}
        spacing="compact"
      />

      {/* 섹션: 사업자 정보 */}
      <div className="flex flex-col gap-6">
        {/* 섹션 제목 + 안내문 */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-[28px] font-bold">
            사업자 정보
          </h2>
          <p className="text-text-tertiary text-base font-medium">
            안전한 거래를 위해 사업자 정보가 필요합니다.
          </p>
        </div>

        {/* 과세자 등록 (택1) — store 연결됨 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            과세자 등록
          </span>
          <div
            className="grid grid-cols-2 gap-3"
            role="radiogroup"
            aria-label="과세자 유형 선택"
          >
            {TAXPAYER_OPTIONS.map((opt) => {
              const isSelected = form.taxpayerType === opt.title;
              return (
                <button
                  key={opt.title}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setValues({ taxpayerType: opt.title })}
                  className={`flex flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                >
                  <span
                    className={`text-xl font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}
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
            className="text-text-primary text-[22px] font-bold"
          >
            사업자 등록 번호
          </label>
          <Input
            id="business-number"
            placeholder="000-00-00000"
            inputMode="numeric"
            value={form.businessNumber}
            onChange={(e) =>
              setValues({
                businessNumber: e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 10),
              })
            }
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
          {/* 피그마: 입력창 590 + gap 20 + 버튼 184 = 본문 794 */}
          <div className="flex items-start gap-5">
            {/* 입력창이 남은 폭을 다 먹고 버튼은 고정폭 */}
            <div className="flex-1">
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

      {/* 다음으로 버튼 (우측 정렬) */}
      <div className="flex justify-end">
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
