interface TabItem {
  label: string;
  count?: number;
}

interface TabProps {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  hideCountOnMobile?: boolean;
  /** true면 탭 폭이 min-w-[140px]로 고정되고, 다 안 들어가면 가로 스크롤된다 (Figma 5584:65776) */
  scrollable?: boolean;
}

const Tab = ({ tabs, activeIndex, onChange, hideCountOnMobile, scrollable }: TabProps) => (
  <div className={scrollable ? "flex w-full overflow-x-auto" : "flex w-full"}>
    {tabs.map((tab, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`text-text-primary flex h-[60px] items-center justify-center gap-2 border-b font-bold transition-colors ${
          scrollable
            ? "min-w-[140px] shrink-0 flex-1 px-3 text-base tracking-normal"
            : "flex-1 text-sm tracking-[-0.28px] md:text-xl md:tracking-normal"
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
