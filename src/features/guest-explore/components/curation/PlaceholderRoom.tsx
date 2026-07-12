import "@react-three/fiber";
import { DoubleSide } from "three";

/**
 * .glb 모델을 아직 준비하지 못했거나(목업 URL) 로드에 실패했을 때 보여주는 자리표시 공간.
 * 핫스팟 좌표가 대략 원점 기준 ±3m 범위에 찍혀 있으므로, 그 범위를 감싸는
 * 바닥 + 벽 2면을 세워 돌하우스 뷰의 공간감만 대신 제공한다.
 */
export const PlaceholderRoom = () => {
  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#e9e5df" />
      </mesh>

      {/* 뒤쪽 벽 */}
      <mesh position={[0, 2, -4]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f5f2ec" side={DoubleSide} />
      </mesh>

      {/* 왼쪽 벽 */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#f0ede7" side={DoubleSide} />
      </mesh>

      {/* 바닥 그리드 라인 (공간감용) */}
      <gridHelper args={[8, 8, "#cfcabf", "#dcd7cd"]} position={[0, 0.001, 0]} />
    </group>
  );
};
