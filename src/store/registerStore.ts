import { create } from "zustand";

// 공간 등록 폼 데이터 (5단계 전체를 보관) — 화면 입력값 저장용
// (전송용 형식/enum 변환은 2차 API 연동 때)
export interface SpaceRegisterForm {
  // Step1 위치/구조
  ownerType: string;
  buildingType: string;
  city: string;
  district: string;
  address: string;
  detailAddress: string;
  // Step2 거래정보
  deposit: string;
  priceDay: string;
  startDate: string;
  endDate: string;
  // Step3 공간정보
  usage: string;
  spaceStructure: string;
  area: string;
  floorType: string;
  floor: string;
  hasParking: boolean | null;
  facilityIds: number[];
  // Step4 상세정보
  buildingName: string; // 공간명
  description: string;
  // Step5 사진
  photoList: File[];
}

interface RegisterState {
  form: SpaceRegisterForm;
  isEdit: boolean;
  editSpaceId: number | null; // 수정 중인 공간 id (등록 모드면 null)
  setValues: (values: Partial<SpaceRegisterForm>) => void;
  setEdit: (isEdit: boolean, spaceId?: number | null) => void;
  reset: () => void;
}

// 처음엔 전부 빈 값
const initialForm: SpaceRegisterForm = {
  ownerType: "소유자",
  buildingType: "",
  city: "",
  district: "",
  address: "",
  detailAddress: "",
  deposit: "",
  priceDay: "",
  startDate: "",
  endDate: "",
  usage: "",
  spaceStructure: "",
  area: "",
  floorType: "",
  floor: "",
  hasParking: null,
  facilityIds: [],
  buildingName: "",
  description: "",
  photoList: [],
};

export const useRegisterStore = create<RegisterState>((set) => ({
  form: initialForm,
  isEdit: false,
  editSpaceId: null,
  // 넘어온 값만 기존 form에 덮어씀 (나머지는 그대로)
  setValues: (values) =>
    set((state) => ({ form: { ...state.form, ...values } })),
  setEdit: (isEdit, spaceId = null) => set({ isEdit, editSpaceId: spaceId }),
  // 전부 초기화 (등록 완료 후 / 새 공간 등록 진입 시)
  reset: () => set({ form: initialForm, isEdit: false, editSpaceId: null }),
}));

// ─────────────────────────────────────────────
// 호스트 등록 폼 (2단계) 보관함
// ─────────────────────────────────────────────
export interface HostRegisterForm {
  // Step1 사업자 정보
  taxpayerType: string;
  businessNumber: string;
  businessLicenseImage: File | null; // 사업자등록증 사본
  storeName: string;
  businessAddress: string;
  businessDetailAddress: string;
  // Step2 정산 계좌
  bankbookImage: File | null; // 통장 사본
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface HostRegisterState {
  form: HostRegisterForm;
  setValues: (values: Partial<HostRegisterForm>) => void;
  reset: () => void;
}

const initialHostForm: HostRegisterForm = {
  taxpayerType: "",
  businessNumber: "",
  businessLicenseImage: null,
  storeName: "",
  businessAddress: "",
  businessDetailAddress: "",
  bankbookImage: null,
  bankName: "",
  accountNumber: "",
  accountHolder: "",
};

export const useHostRegisterStore = create<HostRegisterState>((set) => ({
  form: initialHostForm,
  setValues: (values) =>
    set((state) => ({ form: { ...state.form, ...values } })),
  reset: () => set({ form: initialHostForm }),
}));
