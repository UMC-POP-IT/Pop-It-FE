import { useId } from "react";
import Chip from "@/shared/components/Chip";
import type { FacilityItem } from "@/features/host-register/api/facility_api";

interface FacilityChipGroupProps {
  /** 그룹 제목 (냉난방 / 보안 / 기타) */
  label: string;
  /** 서버에서 받은 시설 목록 */
  items: FacilityItem[];
  /** 현재 선택된 시설 ID 목록 */
  selectedIds: number[];
  onToggle: (facilityId: number) => void;
}

/** 시설 칩 그룹 — 화면엔 이름(name)을 보여주고, 값으론 facilityId를 다룬다 */
const FacilityChipGroup = ({
  label,
  items,
  selectedIds,
  onToggle,
}: FacilityChipGroupProps) => {
  // 이 컴포넌트가 여러 번 렌더링돼 id가 겹치지 않도록 고유 id 생성
  const labelId = useId();

  return (
    <div
      className="flex flex-col gap-2"
      role="group"
      aria-labelledby={labelId}
    >
      <span
        id={labelId}
        className="text-text-tertiary text-xl font-bold"
      >
        {label}
      </span>
      {/* 열 수와 간격만 정하면 폭은 그리드가 나눠 준다 (모바일·태블릿 3열, 데스크톱 4열) */}
      <div className="grid grid-cols-3 gap-2 md:gap-5 lg:grid-cols-4 lg:gap-2">
        {items.map((item) => (
          <Chip
            key={item.facilityId}
            label={item.name}
            selected={selectedIds.includes(item.facilityId)}
            onClick={() => onToggle(item.facilityId)}
          />
        ))}
      </div>
    </div>
  );
};

export default FacilityChipGroup;
