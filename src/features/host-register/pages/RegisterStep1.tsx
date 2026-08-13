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
            {/* 칩 배치 — 열 수와 간격만 정하면 폭은 그리드가 나눠 준다.
                모바일·태블릿 3열, 데스크톱 4열 (건물 유형 6개 = 4 + 2).
                간격: 모바일 8(→104) · 태블릿 20(→165) · 데스크톱 8(→155) */}
            <div className="grid grid-cols-3 gap-2 md:gap-5 lg:grid-cols-4 lg:gap-2">
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
    [입력창+안내문] 묶음과 [주소 찾기] 버튼을 한 flex-wrap에 넣는다.

      데스크톱(1024) : [입력창 440][20][버튼 184] 한 줄, 안내문은 입력창 바로 아래
      모바일         : [입력창 328] 한 줄 → 다음 줄 오른쪽에 [주소 찾기 156]

    md:items-start — 입력창 묶음이 안내문 때문에 버튼보다 키가 커서(56 vs 84), 버튼을
    입력창과 같은 위쪽 선에 맞춘다. 지금은 이게 없어도 버튼이 위에 붙는데, align-items
    기본값 stretch가 '교차축 크기가 auto일 때만' 늘리기 때문이다 — Button size="field"가
    h-14를 갖고 있어 stretch가 flex-start처럼 동작한다. 즉 버튼이 고정 높이를 잃는 순간
    84px로 늘어난다. 그 의존을 없애려고 명시해 둔다.
    items-center / md:gap-y-1 / order-*는 안내문이 이 컨테이너의 형제였을 때 필요했던 값이라
    지웠다 — 자식이 둘뿐이고 각 줄에 하나씩 놓여 정렬·행간격·순서가 모두 무의미하다 */}
            <div className="flex flex-wrap gap-x-3 gap-y-3 md:items-start md:gap-x-5">
              {/* w-full이 입력창에게 한 줄을 통째로 준다. md부터는 풀고 flex-1로 남는 폭을 먹는다.

      안내문·에러가 Input의 메시지 슬롯 하나를 나눠 쓴다. 예전엔 안내문을 이 flex-wrap의
      형제(order-3)로 두고 {!addrError && ...}로 교대시켰는데, 두 요소가 서로 다른
      부모(= 다른 gap)에 있어 에러가 뜰 때 줄 높이가 달라지고 아래 상세 주소·버튼이
      밀렸다 (이슈 #306).
      들여쓰기(ps-5)는 넣지 않는다 — 이 칸만 20px 들여쓰면 다른 페이지의 오류 문구와
      왼쪽 끝이 어긋난다. 들여쓸지 말지는 폼 전체가 같이 정할 일이다.
      주소만 있고 좌표가 없으면 재검색을 유도한다 */}
              <div className="w-full md:w-auto md:flex-1">
                <Input
                  aria-label="주소"
                  placeholder="주소 찾기로 주소를 입력해주세요"
                  value={form.address}
                  readOnly
                  error={addrError}
                  hint={
                    form.address !== "" &&
                    (form.latitude === null || form.longitude === null)
                      ? "주소를 다시 검색해주세요"
                      : "현재 서울 지역만 등록 가능합니다"
                  }
                />
              </div>

              {/* ml-auto: 모바일에서 입력창이 한 줄을 통째로 쓰므로 다음 줄로 내려온
                  버튼을 오른쪽에 붙인다. md부터는 입력창 바로 뒤에 붙어야 하므로 푼다 */}
              <Button
                variant="black"
                size="field"
                className="ml-auto md:ml-0"
                onClick={() => {
                  setAddrError("");
                  setIsAddrOpen(true);
                }}
              >
                주소 찾기
              </Button>
            </div>

            {/* 상세 주소 — 서버 SpaceCreateReq.addressDetail이 30자 제한.
    글자수는 hint가 아니라 counter로 넘긴다 — counter는 aria-hidden이라 스크린리더가
    "상세 주소, 편집, 5 슬래시 30"처럼 뜻 없는 소리를 한 글자마다 읽지 않는다.
    대신 30자 상한을 aria-label에 넣었다 — maxLength는 HTML-AAM에서 ARIA 속성으로
    매핑되지 않아 NVDA·JAWS·VoiceOver 어느 쪽도 읽지 않으므로, 이 문구가 없으면
    입력이 30자에서 조용히 멈추는 이유를 알 수 없다. 화면에는 영향이 없다.
    placeholder는 입력을 시작하면 사라지므로 이름은 aria-label로 고정한다 */}
            <Input
              aria-label="상세 주소 (최대 30자)"
              placeholder="상세 주소를 입력해주세요"
              value={form.detailAddress}
              onChange={(e) => setValues({ detailAddress: e.target.value })}
              maxLength={30}
              counter={`${form.detailAddress.length}/30`}
            />
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
            // 이슈 #306: 메시지 슬롯이 한 줄(24px)만 예약하므로 문구가 두 줄로 접히면
            // 그만큼 아래가 다시 밀린다. 모바일 주소 칸 가용 폭 308px / SUIT 16px 기준
            // 한 줄에 들어가는 길이로 줄였다 (실측: 284.9px / 292.2px)
            setAddrError(
              kakaoError
                ? "지도를 불러오지 못했어요. 새로고침 해주세요"
                : "지도 준비 중이에요. 잠시 후 다시 시도해주세요",
            );
            clearAddress();
            return;
          }

          const coordinate = await geocodeAddress(address);
          if (!coordinate) {
            // "좌표"는 구현 용어다 — 건물을 등록하는 호스트는 좌표가 아니라 주소로
            // 생각하므로 geocoding 실패라는 사실을 사용자 언어로 번역한다.
            // 한 줄 유지 (실측 260.6px < 308px, 여유 47.4px)
            setAddrError("위치를 찾을 수 없어요. 다시 검색해주세요");
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
