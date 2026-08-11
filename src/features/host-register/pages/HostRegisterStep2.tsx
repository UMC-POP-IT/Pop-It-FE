import { useState } from "react";
import { uploadFiles } from "@/features/host-register/api/upload_api";
import { toHostRequest } from "@/features/host-register/utils/to_host_request";
import { registerHost } from "@/features/host-register/api/host_api";
import { reissueToken, getMyHost } from "@/shared/utils/oauth";
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
import { sanitizeNumber } from "@/shared/utils/sanitizeNumber";
import { useAuthStore } from "@/store/authStore";

export const HostRegisterStep2 = () => {
  const navigate = useNavigate();
  const form = useHostRegisterStore((s) => s.form);
  const setValues = useHostRegisterStore((s) => s.setValues);
  const setHostStatus = useAuthStore((s) => s.setHostStatus);
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 (중복 클릭 방지)
  const [submitError, setSubmitError] = useState(""); // 실패 사유

  /**
   * 토큰에 role이 박혀 있어(ROLE_GUEST) 새 토큰을 받아야 호스트 권한이 반영된다.
   * 등록 자체는 이미 끝났으므로 재발급이 실패해도 흐름을 막지 않는다.
   */
  const refreshRole = async () => {
    try {
      await reissueToken();
    } catch (error) {
      console.error("토큰 재발급 실패 — 다시 로그인하면 반영됩니다:", error);
    }
  };

  /**
   * 최종 제출: 서류 업로드 → 서버 형식 변환 → 호스트 등록
   * 서버 응답을 받은 뒤에만 상태를 바꾸고 완료 화면으로 넘어간다.
   */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // isValid가 막고 있지만, 서버에 null을 보낼 수 없어 여기서 한 번 더 확인한다
    if (!form.businessLicenseImage || !form.bankbookImage) {
      setSubmitError("사업자등록증과 통장 사본을 모두 첨부해주세요");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // ① 서류 두 장 업로드 — 넘긴 순서대로 URL이 돌아온다
      const [businessLicenseUrl, bankbookCopyUrl] = await uploadFiles(
        [form.businessLicenseImage, form.bankbookImage],
        "HOST_DOCUMENT",
      );

      // ② 폼 → 서버 형식
      const request = toHostRequest(form, businessLicenseUrl, bankbookCopyUrl);

      // ③ 등록
      await registerHost(request);

      // ④ 새 토큰을 받아 role을 갱신한다
      await refreshRole();

      setHostStatus("registered");
      navigate("/host/host-register/complete");
    } catch (error) {
      const status = (error as { status?: number }).status;
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다";

      if (status === 409) {
        // 409는 두 가지를 뜻할 수 있다.
        // - 이 계정이 이미 호스트 → 완료 화면으로 보내 같은 제출을 반복하지 않게 한다
        // - HOST409_2: 사업자등록번호가 다른 계정에 쓰임 → 등록 실패, 사유를 띄운다
        // 코드 문자열에 기대지 않도록 서버에 실제 호스트 여부를 직접 묻는다.
        // getMyHost()는 404(미등록)만 null로 주고 그 외 오류는 던지므로,
        // 조회 실패를 null로 뭉뚱그리지 않고 별도 값으로 구분한다.
        const host = await getMyHost().catch((lookupError: unknown) => {
          console.error(
            "호스트 등록 실패(409) 후 호스트 조회 실패:",
            lookupError,
          );
          return "LOOKUP_FAILED" as const;
        });

        if (host === "LOOKUP_FAILED") {
          // 등록됐는지 미등록인지 알 수 없다. 완료 화면으로 보내면 이후 호스트 요청이
          // 전부 403이 나면서 원인을 알 수 없게 되므로 여기서 멈춘다.
          setSubmitError(
            "등록 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요",
          );
          return;
        }

        if (host) {
          setHostStatus("registered");
          await refreshRole(); // 이 브라우저 토큰의 role이 낡았을 수 있다
          navigate("/host/host-register/complete");
          return;
        }

        // 미등록인데 409 → 사업자등록번호가 다른 계정에 이미 쓰였다
        console.error("호스트 등록 실패(사업자등록번호 중복):", message);
        setSubmitError(
          "이미 등록된 사업자등록번호입니다. 1단계로 돌아가 사업자등록번호를 다시 확인해주세요",
        );
        return;
      }

      console.error("호스트 등록 실패:", message);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    form.bankName !== "" &&
    form.accountNumber !== "" &&
    form.accountHolder.trim() !== "" &&
    form.bankbookImage !== null;

  return (
    // 여백·폭 규격은 HostRegisterStep1과 동일 (본문 328/535/644).
    // 두 화면이 한 흐름이라 폭이 다르면 [다음으로]를 누르는 순간 본문이 튄다.
    <div className="mx-auto flex w-full max-w-[535px] flex-col pt-0 pb-14 md:pt-[102px] md:pb-[78px] lg:max-w-[644px]">
      {/* 페이지 제목 (가운데) — 모바일 28 / md 이상 32 */}
      <h1 className="text-text-primary text-center text-[28px] font-bold md:text-[32px]">
        호스트 등록
      </h1>

      {/* 진행바 — 1 = 두 번째 단계(계좌 정보).
          StepIndicator에 className prop이 없어 div로 감싸 간격을 준다.
          컴포넌트 안에 py-3(12)이 이미 있어 피그마 36 = mt-6(24) + 12.
          모바일은 20 = mt-2(8) + 12 */}
      <div className="mt-2 md:mt-6">
        <StepIndicator
          steps={HOST_STEPS}
          currentStep={1}
          spacing="compact"
        />
      </div>

      {/* 섹션: 정산 계좌 정보 — 피그마 80 = mt-17(68) + 진행바 아래 py-3(12).
          모바일은 58 = mt-[46px] + 12 */}
      <div className="mt-[46px] flex flex-col md:mt-17">
        {/* 섹션 제목 + 안내문 — 제목은 모바일 24 / md 이상 28 */}
        <div className="border-border flex flex-col gap-1 border-b pb-8">
          <h2 className="text-text-primary text-[24px] font-bold md:text-[28px]">
            정산 계좌 정보
          </h2>
          <p className="text-text-tertiary text-base font-medium">
            정산 및 세금계산서 발행에 사용됩니다.
          </p>
        </div>

        {/* 입력 필드 묶음 — 구분선 아래 28(mt-7), 필드 사이 48(gap-12).
            두 값이 달라 섹션 gap 하나로는 못 만들어 래퍼를 따로 둔다 */}
        <div className="mt-7 flex flex-col gap-12">
          {/* 통장 사본 (파일 첨부) */}
          <FileUploadRow
            label="통장 사본"
            placeholder="통장 사본 파일을 첨부해주세요"
            hint="* JPG, PNG, PDF 최대 10MB"
            file={form.bankbookImage}
            onFileChange={(file) => setValues({ bankbookImage: file })}
          />

          {/* 은행 (공통 select) */}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="bank"
              className="text-text-primary text-[22px] font-bold"
            >
              은행
            </label>
            <Select
              id="bank"
              options={BANK_OPTIONS.map((bank) => ({
                value: bank,
                label: bank,
              }))}
              value={form.bankName}
              onChange={(bankName) => setValues({ bankName })}
              placeholder="은행을 선택해주세요"
            />
          </div>

          {/* 정산 입금 계좌 번호 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="account-number"
              className="text-text-primary text-[22px] font-bold"
            >
              정산 입금 계좌 번호
            </label>
            <Input
              id="account-number"
              placeholder="- 없이 숫자만 입력"
              value={form.accountNumber}
              onChange={(e) =>
                setValues({ accountNumber: sanitizeNumber(e.target.value) })
              }
            />
          </div>

          {/* 예금주 — 서버 HostRegisterReq.accountHolder가 20자 제한 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="account-holder"
              className="text-text-primary text-[22px] font-bold"
            >
              예금주
            </label>
            <Input
              id="account-holder"
              placeholder="예금주 이름을 입력해주세요"
              value={form.accountHolder}
              onChange={(e) => setValues({ accountHolder: e.target.value })}
              maxLength={20}
            />
            <div className="flex items-start justify-between gap-2">
              {/* 360에서 이 문구가 옆 카운터(0/20)와 한 줄을 나눠 쓰면 자리가 280밖에 안 나와
                  16px으로는 마지막 글자 하나가 다음 줄로 넘어간다. 모바일만 14px로 줄여 한 줄에 담는다 */}
              <span className="text-text-secondary text-left text-sm font-medium md:text-base">
                * 사업자 등록증(대표자명)과 일치해야 합니다.
              </span>
              <span className="text-text-secondary shrink-0 text-right text-base font-medium">
                {form.accountHolder.length}/20
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 오류 문구 + 버튼을 한 묶음으로 감싼다 — 문구가 떴다 사라져도
          섹션 아래 간격이 항상 고정된다 (모바일 56 / md 이상 80) */}
      <div className="mt-14 flex flex-col items-end gap-2 md:mt-20">
        {submitError && (
          <span
            role="alert"
            className="text-danger text-base font-bold"
          >
            {submitError}
          </span>
        )}

        {/* 이전 / 다음으로 버튼 (우측 정렬) — 버튼 사이 모바일 16 / md 이상 8 */}
        <div className="flex gap-4 md:gap-2">
          <Button
            variant="secondary"
            size="nav"
            onClick={() => navigate("/host/host-register/step1")}
          >
            이전
          </Button>
          <Button
            variant="primary"
            size="nav"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "등록 중..." : "다음으로"}
          </Button>
        </div>
      </div>
    </div>
  );
};
