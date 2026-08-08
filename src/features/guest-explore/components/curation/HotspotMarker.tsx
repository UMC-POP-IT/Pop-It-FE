import { Html } from "@react-three/drei";
import type { Hotspot } from "@/features/guest-explore/api/mock_3dcuration";

interface HotspotMarkerProps {
  hotspot: Hotspot;
  active: boolean;
  onSelect: (hotspot: Hotspot) => void;
}

export const HotspotMarker = ({ hotspot, active, onSelect }: HotspotMarkerProps) => {
  const isLink = hotspot.type === "link";

  return (
    <Html position={hotspot.position} center distanceFactor={8} zIndexRange={[10, 0]} occlude={false}>
      <button
        type="button"
        aria-pressed={active}
        aria-label={isLink ? `${hotspot.label} · 다른 공간으로 이동` : hotspot.label}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(hotspot);
        }}
        className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-md transition-colors ${
          active
            ? "border-primary bg-primary text-white"
            : isLink
              ? "border-primary bg-primary text-white hover:bg-primary-hover"
              : "border-primary/40 bg-white/95 text-primary hover:bg-primary-light"
        }`}
      >
        {isLink ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 shrink-0"
            aria-hidden
          >
            <path d="M3 12h15" />
            <path d="m12 6 6 6-6 6" />
            <path d="M21 4v16" />
          </svg>
        ) : (
          <span
            className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-primary"}`}
            aria-hidden
          />
        )}
        {hotspot.label}
      </button>
    </Html>
  );
};
