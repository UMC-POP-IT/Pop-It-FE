interface TabItem {
  label: string;
  count?: number;
}

interface TabProps {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const Tab = ({ tabs, activeIndex, onChange }: TabProps) => (
  <div className="flex w-full">
    {tabs.map((tab, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`text-text-primary flex h-[60px] flex-1 items-center justify-center gap-2 border-b text-xl font-bold transition-colors ${
          activeIndex === i
            ? "border-primary-hover border-b-2"
            : "border-[#c5c5c5]"
        } `}
      >
        {tab.label}
        {tab.count !== undefined && <span>({tab.count})</span>}
      </button>
    ))}
  </div>
);

export default Tab;
