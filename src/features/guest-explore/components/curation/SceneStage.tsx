import { Suspense } from "react";
import { ContactShadows, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { Hotspot, Scene } from "@/features/guest-explore/api/mock_3dcuration";
import { HotspotMarker } from "./HotspotMarker";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import { PlaceholderRoom } from "./PlaceholderRoom";
import { RoomModel } from "./RoomModel";

interface SceneStageProps {
  scene: Scene;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onInteractionStart?: () => void;
}

/**
 * 하나의 Scene(방)을 3D로 그리는 단위. Scene이 바뀔 때마다 부모(CurationCanvas)에서
 * key={scene.id}로 리마운트시켜, 카메라/컨트롤을 매번 그 Scene의 camera 설정으로
 * 새로 초기화한다 (돌하우스 시점을 방마다 다르게 정의할 수 있게).
 */
export const SceneStage = ({ scene, selectedHotspotId, onSelectHotspot, onInteractionStart }: SceneStageProps) => {
  const { camera, modelUrl, hotspots } = scene;

  return (
    <>
      <PerspectiveCamera makeDefault fov={45} position={camera.position} />
      <OrbitControls
        target={camera.target}
        minDistance={camera.minDistance}
        maxDistance={camera.maxDistance}
        minPolarAngle={camera.minPolarAngle}
        maxPolarAngle={camera.maxPolarAngle}
        enablePan={false}
        onStart={onInteractionStart}
        makeDefault
      />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />

      <Suspense fallback={null}>
        <ModelErrorBoundary resetKey={modelUrl} fallback={<PlaceholderRoom />}>
          <RoomModel modelUrl={modelUrl} />
        </ModelErrorBoundary>
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={10} blur={2} far={4} />

      {hotspots.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          active={hotspot.id === selectedHotspotId}
          onSelect={onSelectHotspot}
        />
      ))}
    </>
  );
};
