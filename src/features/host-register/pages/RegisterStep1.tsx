import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import iconOwner from "@/assets/icons/icon_owner.svg";
import Chip from "@/shared/components/Chip";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import {
  STEPS,
  BUILDING_TYPES,
} from "@/features/host-register/api/mock_register";
import { useState } from "react";
import AddressSearchModal from "@/features/host-register/components/AddressSearchModal";
import { useKakaoLoader } from "@/shared/hooks/useKakaoLoader";
import { geocodeAddress } from "@/shared/utils/geocodeAddress";

export const RegisterStep1 = () => {
  const isEdit = useRegisterStore((s) => s.isEdit);
  // 단계 간 값 유지용 store (뒤로 와도 선택/입력 유지)
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  const navigate = useNavigate();
  const [isAddrOpen, setIsAddrOpen] = useState(false);
  const [addrError, setAddrError] = useState(""); // 서울 외 지역 선택 시 에러
  const { isLoaded, error: kakaoError } = useKakaoLoader(); // 카카오 SDK 로드 (좌표 변환에 필요)
  const isValid =
    form.buildingType !== "" &&
    form.address !== "" &&
    form.latitude !== null &&
    form.longitude !== null &&
    form.detailAddress.trim() !== "";

  return (
    <div className="mx-auto flex w-full max-w-[826px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        {isEdit ? "공간 수정" : "공간 등록"}
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

          {/* 주소 찾기(다음 우편번호) — 시/구는 검색 결과로 자동 채움
    피그마: 입력창 590 + gap 20 + 버튼 184 = 본문 794 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-5">
              <div className="flex-1">
                <Input
                  aria-label="주소"
                  placeholder="주소 찾기로 주소를 입력해주세요"
                  value={form.address}
                  readOnly
                  error={addrError}
                />
              </div>
              <Button
                variant="black"
                size="field"
                onClick={() => {
                  setAddrError("");
                  setIsAddrOpen(true);
                }}
              >
                주소 찾기
              </Button>
            </div>

            {/* 안내문은 행 바깥에 둬서 전체 폭(794) 오른쪽 끝에 맞춘다 — 아래 상세 주소 카운터와 같은 선.
      에러(Input 내부, 590 칸)와는 끝이 어긋나지만 둘은 동시에 뜨지 않는다.
      주소만 있고 좌표가 없으면 재검색을 유도한다 */}
            {!addrError && (
              <span className="text-text-secondary text-right text-base font-medium">
                {form.address !== "" &&
                (form.latitude === null || form.longitude === null)
                  ? "주소를 다시 검색해주세요"
                  : "현재 서울 지역만 등록 가능합니다"}
              </span>
            )}
          </div>

          {/* 상세 주소 — 서버 SpaceCreateReq.addressDetail이 30자 제한.
    안내를 Input과 한 칸에 묶어 gap-1로 붙인다 (위 주소 안내문과 같은 간격) */}
          <div className="flex flex-col gap-1">
            <Input
              placeholder="상세 주소를 입력해주세요"
              value={form.detailAddress}
              onChange={(e) => setValues({ detailAddress: e.target.value })}
              maxLength={30}
            />
            <span className="text-text-secondary text-right text-base font-medium">
              {form.detailAddress.length}/30
            </span>
          </div>
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬)*/}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="nav"
          disabled={!isValid}
          onClick={() => navigate("/host/register/step2")}
        >
          다음으로
        </Button>
      </div>

      <AddressSearchModal
        isOpen={isAddrOpen}
        onClose={() => setIsAddrOpen(false)}
        onComplete={async ({ address, sido, sigungu }) => {
          //주소가 무효가 되면 좌표도 반드시 함께 비운다 (이전 좌표 잔류 방지)
          const clearAddress = () =>
            setValues({
              address: "",
              city: "",
              district: "",
              latitude: null,
              longitude: null,
            });

          // 서울 외 지역 → 빨간 에러 + 기존 주소값 비우기 (유효성 우회 방지)
          if (!sido.startsWith("서울")) {
            setAddrError("서울 외 지역은 선택하실 수 없습니다");
            clearAddress();
            return;
          }
          //지도 SDK 로드 전이면 변환 불가
          if (!isLoaded) {
            setAddrError(
              kakaoError
                ? "지도 서비스를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요"
                : "지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요",
            );
            clearAddress();
            return;
          }

          const coordinate = await geocodeAddress(address);
          if (!coordinate) {
            setAddrError(
              "주소의 좌표를 찾지 못했습니다. 다른 주소로 검색해주세요",
            );
            clearAddress();
            return;
          }
          setAddrError("");
          setValues({
            address,
            city: sido,
            district: sigungu,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });
        }}
      />
    </div>
  );
};
