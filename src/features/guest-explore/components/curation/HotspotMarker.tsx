import { Html } from "@react-three/drei";
import type { Hotspot } from "@/features/guest-explore/api/mock_3dcuration";

interface HotspotMarkerProps {
  hotspot: Hotspot;
  active: boolean;
  onSelect: (hotspot: Hotspot) => void;
}

export const HotspotMarker = ({ hotspot, active, onSelect }: HotspotMarkerProps) => {
  return (
    <Html position={hotspot.position} center distanceFactor={8} zIndexRange={[10, 0]} occlude={false}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(hotspot);
        }}
        className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-md transition-colors ${
          active
            ? "border-primary bg-primary text-white"
            : "border-primary/40 bg-white/95 text-primary hover:bg-primary-light"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-primary"}`}
          aria-hidden
        />
        {hotspot.label}
      </button>
    </Html>
  );
};
