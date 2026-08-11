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
import { useState, useId } from "react";
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
  // 글자수 안내를 상세 주소 입력과 묶기 위한 id
  const detailAddressHintId = useId();
  const isValid =
    form.buildingType !== "" &&
    form.address !== "" &&
    form.latitude !== null &&
    form.longitude !== null &&
    form.detailAddress.trim() !== "";

  return (
    // 좌우 여백은 MainLayout의 px-4/md:px-6에 mx-auto 여백이 더해져 만들어진다.
    // 여기서 px를 또 주면 모바일에서 16+16=32가 되므로 폭(max-w)만 단계별로 잡는다.
    //   모바일 360 : 본문 328 · 태블릿 768 : 본문 535 · 데스크톱 1024 : 본문 644
    // 세로: 위 134(모바일은 MainLayout py-8의 32 그대로), 아래 120/88에서 32를 뺀 값
    <div className="mx-auto flex w-full max-w-[535px] flex-col pt-0 pb-14 md:pt-[102px] md:pb-[88px] lg:max-w-[644px]">
      {/* 페이지 제목 (가운데) — 모바일 28 / md 이상 32 */}
      <h1 className="text-text-primary text-center text-[28px] font-bold md:text-[32px]">
        {isEdit ? "공간 수정" : "공간 등록"}
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 0 = 첫 단계.
          StepIndicator에 className prop이 없어 div로 감싸 간격을 준다.
          컴포넌트 안에 py-3(12)이 이미 있어 피그마 36 = mt-6(24) + 12.
          모바일은 20 = mt-2(8) + 12 */}
      <div className="mt-2 md:mt-6">
        <StepIndicator
          steps={STEPS}
          currentStep={0}
        />
      </div>

      {/* 섹션: 위치/구조 — 피그마 74 = mt-[62px] + 진행바 아래 py-3(12).
          모바일은 58 = mt-[46px] + 12 */}
      <div className="mt-[46px] flex flex-col md:mt-[62px]">
        <h2 className="text-text-primary border-border border-b pb-6 text-[24px] font-bold md:text-[28px]">
          위치/구조
        </h2>

        {/* 입력 필드 묶음 — 구분선 아래 28(mt-7), 필드 사이 48(gap-12).
            두 값이 달라 섹션 gap 하나로는 못 만들어 래퍼를 따로 둔다 */}
        <div className="mt-7 flex flex-col gap-12">
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
            {/* 칩 배치 — 모바일은 3열 그리드로 폭을 나눠 갖고(각 104), md 이상은 고정폭 줄바꿈.
                모바일에서 flex-wrap을 쓰면 Chip의 flex-1(basis 0) 때문에 6개가 한 줄에 다 눌려 들어간다.
                간격: 모바일 8 · 태블릿 20(165×3+20×2=535) · 데스크톱 8 */}
            <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-5 lg:gap-2">
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
            <span className="text-text-primary text-[22px] font-bold">
              주소
            </span>

            {/* 주소 찾기(다음 우편번호) — 시/구는 검색 결과로 자동 채움.
    입력창·안내문·[주소 찾기] 셋을 한 flex-wrap에 넣고 자리만 order로 바꾼다.
    안내문이 항상 입력창 바로 아래 오도록 DOM 순서는 입력창 → 안내문 → 버튼으로 둔다.

      데스크톱(1024) : [입력창 440][20][버튼 184] 한 줄 → 아래 줄에 안내문 (order 1·3·2)
      모바일         : [입력창 328] 한 줄 → 다음 줄에 [안내문 | 버튼 156]

      데스크톱(1024) : [입력창 440][20][버튼 184] 한 줄 → 아래 줄에 안내문 (order 1·3·2)
      모바일         : [입력창 328] 한 줄 → 다음 줄에 [안내문 | 주소 찾기]

    모바일은 입력창 아래 12(gap-y-3)에 안내문과 버튼이 같은 줄로 오고,
    md부터는 4(md:gap-y-1)로 좁히고 안내문만 아래 줄로 내려간다 */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3 md:items-start md:gap-x-5 md:gap-y-1">
              {/* w-full이 입력창에게 한 줄을 통째로 준다. md부터는 풀고 flex-1로 남는 폭을 먹는다 */}
              <div className="w-full md:order-1 md:w-auto md:flex-1">
                <Input
                  aria-label="주소"
                  placeholder="주소 찾기로 주소를 입력해주세요"
                  value={form.address}
                  readOnly
                  error={addrError}
                />
              </div>

              {/* 안내문 — 3단 모두 한 줄을 통째로 차지한다(w-full).
      모바일에서 버튼 옆에 끼우면 자리가 160밖에 안 나와 16px 원문이 두 줄로 접혔다.
      ps-5(20)는 Input 내부 px-5와 같은 값 — 안내문 첫 글자를 입력창 안 글자와 같은 세로선에 맞춘다.
      에러(Input 내부)와는 끝이 어긋나지만 둘은 동시에 뜨지 않는다.
      주소만 있고 좌표가 없으면 재검색을 유도한다 */}
              {!addrError && (
                <span className="text-text-secondary w-full ps-5 text-left text-base font-medium md:order-3">
                  {form.address !== "" &&
                  (form.latitude === null || form.longitude === null)
                    ? "주소를 다시 검색해주세요"
                    : "현재 서울 지역만 등록 가능합니다"}
                </span>
              )}

              {/* ml-auto: 에러가 떠서 안내문이 사라졌을 때도 버튼이 오른쪽에 남게 한다.
                  md부터는 입력창 바로 뒤에 붙어야 하므로 푼다 */}
              <Button
                variant="black"
                size="field"
                className="ml-auto md:order-2 md:ml-0"
                onClick={() => {
                  setAddrError("");
                  setIsAddrOpen(true);
                }}
              >
                주소 찾기
              </Button>
            </div>

            {/* 상세 주소 — 서버 SpaceCreateReq.addressDetail이 30자 제한.
    안내를 Input과 한 칸에 묶어 gap-1로 붙인다 (위 주소 안내문과 같은 간격).
    placeholder는 입력을 시작하면 사라지므로 이름은 aria-label로 고정하고,
    30자 제한 안내는 aria-describedby로 입력과 묶어 함께 읽히게 한다 */}
            <div className="flex flex-col gap-1">
              <Input
                aria-label="상세 주소"
                aria-describedby={detailAddressHintId}
                placeholder="상세 주소를 입력해주세요"
                value={form.detailAddress}
                onChange={(e) => setValues({ detailAddress: e.target.value })}
                maxLength={30}
              />
              <span
                id={detailAddressHintId}
                className="text-text-secondary text-right text-base font-medium"
              >
                {form.detailAddress.length}/30
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬) — 피그마 72 (진행바가 안 껴 있어 그대로 mt-18) */}
      <div className="mt-18 flex justify-end">
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
              detailAddress: "",
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
