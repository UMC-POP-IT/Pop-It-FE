interface TabItem {
  label: string;
  count?: number;
}

interface TabProps {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  hideCountOnMobile?: boolean;
}

const Tab = ({ tabs, activeIndex, onChange, hideCountOnMobile }: TabProps) => (
  <div className="flex w-full">
    {tabs.map((tab, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`text-text-primary flex h-[60px] flex-1 items-center justify-center gap-2 border-b text-sm font-bold tracking-[-0.28px] transition-colors md:text-xl md:tracking-normal ${
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
