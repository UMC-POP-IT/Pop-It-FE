import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import iconOwner from "@/assets/icons/icon_owner.svg";
import Chip from "@/shared/components/Chip";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import { STEPS } from "@/features/host-register/api/mock_register";
import { useState } from "react";
import AddressSearchModal from "@/features/host-register/components/AddressSearchModal";

// 건물 유형 칩 선택지 (피그마 기준)
const BUILDING_TYPES = [
  "대형 사무실",
  "중소형 사무실",
  "오피스텔 형",
  "단지내 상가",
  "일반 상가",
  "복합 상가",
];

export const RegisterStep1 = () => {
  // 단계 간 값 유지용 store (뒤로 와도 선택/입력 유지)
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  const navigate = useNavigate();
  const [isAddrOpen, setIsAddrOpen] = useState(false);
  const [addrError, setAddrError] = useState(""); // 서울 외 지역 선택 시 에러
  return (
    <div className="mx-auto flex w-full max-w-[794px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 0 = 첫 단계 */}
      <StepIndicator
        steps={STEPS}
        currentStep={0}
      />

      {/* 섹션: 위치/구조 */}
      <div className="flex flex-col gap-6">
        <h2 className="text-text-primary border-border border-b pb-2 text-[28px] font-bold">
          위치/구조
        </h2>

        {/* 등록자 유형 — 원형 아이콘 + 라벨*/}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            등록자 유형
          </span>
          <img
            src={iconOwner}
            alt="소유자"
            className="size-[112px]"
          />
        </div>

        {/* 건물 유형 — 칩 버튼 (여러 개 중 택1)
            공통 Chip으로 수정 완료 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            건물 유형
          </span>
          <div className="flex flex-wrap gap-2">
            {BUILDING_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={type === form.buildingType}
                onClick={() => setValues({ buildingType: type })}
              />
            ))}
          </div>
        </div>

        {/* 주소 */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-[22px] font-bold">주소</span>

          {/* 주소 찾기(다음 우편번호) — 시/구는 검색 결과로 자동 채움 */}
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                placeholder="주소 찾기로 주소를 입력해주세요"
                value={form.address}
                readOnly
                error={addrError}
              />
            </div>
            <Button
              variant="black"
              size="nav"
              className="text-xl! font-bold!"
              onClick={() => setIsAddrOpen(true)}
            >
              주소 찾기
            </Button>
          </div>
          {/* 안내문 (에러 없을 때만) */}
          {!addrError && (
            <span className="text-text-placeholder text-base font-bold">
              현재 서울 지역만 등록 가능합니다
            </span>
          )}

          {/* 상세 주소 */}
          <Input
            placeholder="상세 주소를 입력해주세요"
            value={form.detailAddress}
            onChange={(e) => setValues({ detailAddress: e.target.value })}
          />
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬)
          TODO(2차): 필수항목 유효성 검사 통과 시 활성화 */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="nav"
          onClick={() => navigate("/host/register/step2")}
        >
          다음으로
        </Button>
      </div>

      <AddressSearchModal
        isOpen={isAddrOpen}
        onClose={() => setIsAddrOpen(false)}
        onComplete={({ address, sido, sigungu }) => {
          // 서울 외 지역 → 빨간 에러, 저장 안 함
          if (sido !== "서울") {
            setAddrError("서울 외 지역은 선택하실 수 없습니다");
            return;
          }
          setAddrError("");
          setValues({ address, city: sido, district: sigungu });
        }}
      />
    </div>
  );
};
