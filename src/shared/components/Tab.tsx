interface TabItem {
  label: string;
  count?: number;
}

interface TabProps {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  hideCountOnMobile?: boolean;
  /** 768px 미만에서 탭이 더 이상 좁아지지 않고(768px 기준 크기 유지) 대신 좌우로 터치 스크롤되게 한다 */
  scrollOnMobile?: boolean;
}

const Tab = ({ tabs, activeIndex, onChange, hideCountOnMobile, scrollOnMobile }: TabProps) => (
  <div
    className={`flex w-full ${
      scrollOnMobile
        ? "max-[768px]:overflow-x-auto max-[768px]:snap-x max-[768px]:snap-mandatory max-[768px]:[scrollbar-width:none] max-[768px]:[-ms-overflow-style:none] max-[768px]:[&::-webkit-scrollbar]:hidden"
        : ""
    }`}
  >
    {tabs.map((tab, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`text-text-primary flex h-[60px] items-center justify-center gap-2 border-b text-sm font-bold tracking-[-0.28px] transition-colors md:text-xl md:tracking-normal ${
          scrollOnMobile ? "max-[768px]:min-w-[153px] max-[768px]:flex-none max-[768px]:snap-start md:flex-1" : "flex-1"
        } ${
          activeIndex === i
            ? "border-primary-hover border-b-2"
            : "border-[#c5c5c5]"
        } `}
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
