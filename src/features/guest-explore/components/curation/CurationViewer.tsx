import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import type { Hotspot, Property } from "@/features/guest-explore/api/mock_3dcuration";
import { getSceneById } from "@/features/guest-explore/api/mock_3dcuration";
import { SceneStage } from "./SceneStage";

interface CurationViewerProps {
  property: Property;
}

/**
 * "둘러보기 B" — 3D 모델(.glb)을 돌하우스 시점(OrbitControls)으로 회전/줌하며
 * 핫스팟을 클릭해 정보를 확인하거나 다른 Scene(방)으로 이동하는 뷰어.
 */
export const CurationViewer = ({ property }: CurationViewerProps) => {
  const [currentSceneId, setCurrentSceneId] = useState(property.defaultSceneId);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentScene = useMemo(
    () => getSceneById(property, currentSceneId),
    [property, currentSceneId],
  );

  const handleSelectHotspot = (hotspot: Hotspot) => {
    if (hotspot.type === "link" && hotspot.targetSceneId) {
      setCurrentSceneId(hotspot.targetSceneId);
      setSelectedHotspot(null);
      setHasInteracted(false);
      return;
    }
    setSelectedHotspot((prev) => (prev?.id === hotspot.id ? null : hotspot));
  };

  const handleSelectScene = (sceneId: string) => {
    setCurrentSceneId(sceneId);
    setSelectedHotspot(null);
    setHasInteracted(false);
  };

  if (!currentScene) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
        표시할 3D 장면이 없습니다.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#eceae4]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#eceae4"]} />
        <SceneStage
          key={currentScene.id}
          scene={currentScene}
          selectedHotspotId={selectedHotspot?.id ?? null}
          onSelectHotspot={handleSelectHotspot}
          onInteractionStart={() => setHasInteracted(true)}
        />
      </Canvas>
      <Loader
        containerStyles={{ background: "rgba(236, 234, 228, 0.9)" }}
        innerStyles={{ width: "160px" }}
        barStyles={{ background: "var(--color-primary)" }}
        dataStyles={{ color: "var(--color-text-primary)", fontSize: "12px" }}
      />

      {/* 첫 조작 전까지 뜨는 안내 오버레이. pointer-events-none이라 드래그는 그대로 캔버스로 전달됨 */}
      {!hasInteracted && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center gap-3 bg-transparent px-8 py-6 text-center text-white">
            <svg
              viewBox="0 0 40 40"
              className="h-9 w-9"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="20" cy="20" r="5" />
              <path d="M20 13 L20 8 M16 8 L20 4 L24 8" />
              <path d="M20 27 L20 32 M16 32 L20 36 L24 32" />
              <path d="M13 20 L8 20 M8 16 L4 20 L8 24" />
              <path d="M27 20 L32 20 M32 16 L36 20 L32 24" />
            </svg>
            <p className="text-sm leading-relaxed">
              실측 데이터를 기반으로 한 인터랙티브 3D 미리보기입니다.
              <br />
              드래그하여 회전해보세요.
            </p>
          </div>
        </div>
      )}

      {/* 장면(방) 전환 탭 */}
      {property.scenes.length > 1 && !selectedHotspot && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <div className="flex gap-1 rounded-full bg-white/95 p-1 shadow-lg">
            {property.scenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSelectScene(scene.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  scene.id === currentScene.id
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-tag-bg"
                }`}
              >
                {scene.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 핫스팟 정보 바텀시트 */}
      {selectedHotspot && (
        <div className="absolute inset-x-0 bottom-0 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-text-primary">{selectedHotspot.label}</p>
              {selectedHotspot.description && (
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {selectedHotspot.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedHotspot(null)}
              aria-label="닫기"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tag-bg text-text-tertiary"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
