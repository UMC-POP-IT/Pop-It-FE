interface TabItem {
  label: string;
  count?: number;
}

interface TabProps {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  hideCountOnMobile?: boolean;
  /** true면 탭 폭이 min-w-[140px]로 고정되고, 모든 화면에서 가로 스크롤된다 (HostReservationPage 용) */
  scrollable?: boolean;
  /** 768px 미만에서 탭이 더 이상 좁아지지 않고 좌우 터치 스크롤되게 한다 */
  scrollOnMobile?: boolean;
}

const Tab = ({ tabs, activeIndex, onChange, hideCountOnMobile, scrollable, scrollOnMobile }: TabProps) => (
  <div
    className={`flex w-full ${
      scrollable
        ? "overflow-x-auto"
        : scrollOnMobile
          ? "max-[768px]:overflow-x-auto max-[768px]:snap-x max-[768px]:snap-mandatory max-[768px]:[scrollbar-width:none] max-[768px]:[-ms-overflow-style:none] max-[768px]:[&::-webkit-scrollbar]:hidden"
          : ""
    }`}
  >
    {tabs.map((tab, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`text-text-primary flex h-[60px] items-center justify-center gap-2 border-b font-bold transition-colors ${
          scrollable
            ? "min-w-[140px] shrink-0 flex-1 px-3 text-base tracking-normal"
            : scrollOnMobile
              ? "text-sm tracking-[-0.28px] md:text-xl md:tracking-normal max-[768px]:min-w-[153px] max-[768px]:flex-none max-[768px]:snap-start md:flex-1"
              : "flex-1 text-sm tracking-[-0.28px] md:text-xl md:tracking-normal"
        } ${
          activeIndex === i
            ? "border-primary-hover border-b-2"
            : "border-[#c5c5c5]"
        }`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={hideCountOnMobile ? "hidden md:inline" : undefined}>
            ({tab.count})
          </span>
        )}
      </button>
    ))}
  </div>
);

export default Tab;
