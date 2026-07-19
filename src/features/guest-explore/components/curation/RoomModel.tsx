import { useGLTF } from "@react-three/drei";

interface RoomModelProps {
  modelUrl: string;
}

/**
 * .glb 모델 로더. useGLTF는 Suspense와 함께 동작하며, 로드 실패 시 렌더링 중
 * 에러를 throw하므로 반드시 ModelErrorBoundary + Suspense로 감싸서 사용해야 한다.
 */
export const RoomModel = ({ modelUrl }: RoomModelProps) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} dispose={null} />;
};
