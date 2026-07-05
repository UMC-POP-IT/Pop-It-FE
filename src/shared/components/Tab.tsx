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
  <div className="border-border flex w-full border-b">
    {tabs.map((tab, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeIndex === i
            ? "text-primary border-primary -mb-px border-b-2"
            : "text-text-secondary hover:text-text-primary"
        } `}
      >
        {tab.label}
        {tab.count !== undefined && <span className="ml-1">({tab.count})</span>}
      </button>
    ))}
  </div>
);

export default Tab;
