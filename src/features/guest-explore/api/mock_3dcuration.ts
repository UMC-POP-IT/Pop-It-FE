import sceneStoreModelUrl from './curation_model/scene-store.glb?url';
import sceneFittingModelUrl from './curation_model/scene-fitting.glb?url';
import sceneStorageModelUrl from './curation_model/scene-storage.glb?url';

/** 장면 위의 정보/이동 핫스팟 */
export interface Hotspot {
  id: string;
  position: [number, number, number]; // 3D 월드 좌표 [x, y, z] (단위: m)
  label: string;
  type: 'info' | 'link';
  description?: string;     // type === 'info' 일 때 설명
  targetSceneId?: string;   // type === 'link' 일 때 이동할 장면
}

/** orbit 카메라 초기 설정 */
export interface SceneCamera {
  position: [number, number, number]; // 카메라 위치
  target: [number, number, number];   // 바라보는 지점 (보통 방 중앙)
  minDistance?: number;                // 줌인 한계
  maxDistance?: number;                // 줌아웃 한계
  minPolarAngle?: number;              // 위에서 내려다보는 각도 하한 (rad)
  maxPolarAngle?: number;              // 수평선 아래로 못 내려가게 제한 (rad)
}

/** 하나의 3D 공간 (= 방 하나) */
export interface Scene {
  id: string;
  name: string;
  modelUrl: string;   // .glb 모델 URL (Gaussian splat이면 .ply/.splat)
  thumbnail: string;
  images: string[];   // 이 장면을 여러 각도에서 찍은 2D 사진들 (3D 모델 로드 전/실패 시 대체용 갤러리)
  camera: SceneCamera;
  hotspots: Hotspot[];
}

/** 건물(매물) 단위 — 건물주가 업로드하는 묶음 */
export interface Property {
  id: string;
  spaceId: number;      // ExplorePage 등에서 쓰는 Space.id 와의 연결 키
  name: string;
  area: string;         // "66㎡"
  address: string;
  description?: string;
  coverImage: string;
  defaultSceneId: string;
  scenes: Scene[];
  ownerId: string;
  createdAt: string;    // ISO 8601
}

export const mockProperty: Property = {
  id: 'prop-sinsa-001',
  spaceId: 1001, // '신사 아뜰리에' (mock_spaces.ts) 와 연결
  name: '신사 어반빌딩',
  area: '66㎡',
  address: '서울특별시 강남구 신사동 ○○-○',
  description: '미니멀 무드의 의류 편집숍 공간',
  coverImage: 'https://picsum.photos/seed/prop-sinsa-001-cover/800/600',
  defaultSceneId: 'scene-store',
  ownerId: 'owner-12',
  createdAt: '2026-06-30T09:00:00Z',
  scenes: [
    {
      id: 'scene-storage',
      name: '창고',
      modelUrl: sceneStorageModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-001-storage-thumb/400/500',
      images: [],
      camera: {
        position: [6, 6, 6],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 12,
        minPolarAngle: 0.3,   // 거의 위에서
        maxPolarAngle: 1.4,   // 수평 살짝 위까지 (≈ π/2.2)
      },
      hotspots: [
        {
          id: 'h-shelf',
          position: [-1.0, 1.3, -0.5],
          label: '창고 선반',
          type: 'info',
          description: '재고 물품 보관 용도, 박스 몇 개 쌓여있으니 건들지 않았으면 함.',
        }, 
        {
          id: 'h-curtain',
          position: [1.3, 1, 1.2],
          label: '서랍장',
          type: 'info',
          description: '절대 건들지 마시오',
        }, 
        {
          id: 'door-to-store',
          position: [0.5, 1, -2.],
          label: '창고 문',
          type: 'link',
          description: '창고 밖으로 나가는 문',
          targetSceneId: 'scene-store'
        }, 
      ]
    },
    {
      id: 'scene-fitting',
      name: '피팅 룸',
      modelUrl: sceneFittingModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-001-fitting-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-sinsa-001-fitting-1/1400/800',
        'https://picsum.photos/seed/prop-sinsa-001-fitting-2/1400/800',
        'https://picsum.photos/seed/prop-sinsa-001-fitting-3/1400/800',
        'https://picsum.photos/seed/prop-sinsa-001-fitting-4/1400/800',
      ],
      camera: {
        position: [6, 6, 6],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 12,
        minPolarAngle: 0.3,   // 거의 위에서
        maxPolarAngle: 1.4,   // 수평 살짝 위까지 (≈ π/2.2)
      },
      hotspots: [
        {
          id: 'h-curtain',
          position: [0, 1, 1.0],
          label: '커튼',
          type: 'info',
          description: '옷 갈아입으실 때 이용하시면 됩니다.',
        }, 
        {
          id: 'h-built-in-table',
          position: [1.0 , 0.5, -1.5],
          label: '빌트인 테이블',
          type: 'info',
          description: '옷 갈아입으실 때, 본인 소지품 놓아주시면 됩니다.',
        },
        {
          id: 'h-built-in-hanger',
          position: [1.0 , 1.7, -1.5],
          label: '빌트인 행거',
          type: 'info',
          description: '본인이 입고 온 외투 걸어놓아주시면 됩니다.',
        },
        {
          id: 'h-whole-body-mirror',
          position: [-1.0 , 1.0, 0],
          label: '전신 거울',
          type: 'info',
          description: '전신 거울',
        },
        {
          id: 'door-to-store',
          position: [-0.5, 1.0, -1.5],
          label: '피팅룸 문',
          type: 'link',
          description: '피팅 룸 밖으로 나가는 문',
          targetSceneId: 'scene-store'
        }
        // 다른 방이 생기면 link 타입으로 연결
        // { id: 'h-to-storage', position: [...], label: '창고로', type: 'link', targetSceneId: 'scene-storage' }
      ],
    },
    {
      id: 'scene-store',
      name: '매장 전체',
      modelUrl: sceneStoreModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-001-store-thumb/400/300',
      images: [
        'https://picsum.photos/seed/prop-sinsa-001-store-1/1200/800',
        'https://picsum.photos/seed/prop-sinsa-001-store-2/1200/800',
        'https://picsum.photos/seed/prop-sinsa-001-store-3/1200/800',
        'https://picsum.photos/seed/prop-sinsa-001-store-4/1200/800',
      ],
      // 돌하우스 느낌: 비스듬히 위에서 내려다보고, 수평선 아래로는 못 내려가게
      camera: {
        position: [6, 6, 6],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 12,
        minPolarAngle: 0.3,   // 거의 위에서
        maxPolarAngle: 1.4,   // 수평 살짝 위까지 (≈ π/2.2)
      },
      hotspots: [
        {
          id: 'h-counter',
          position: [-1.5, 1.0, -0.5],
          label: '계산대 / POS',
          type: 'info',
          description: '태블릿 POS가 설치된 카운터',
        },
        {
          id: 'h-rack-wall',
          position: [1.0, 1.7, -3.5],
          label: '벽면 의류 행거',
          type: 'info',
          description: '약 30벌 정도 걸어놓을 수 있음.',
        },
        {
          id: 'h-lounge',
          position: [1.0, 0.5, 1.5],
          label: '라운지',
          type: 'info',
          description: '암체어 2 + 원형 테이블 + 러그',
        },
        {
          id: 'h-mirror',
          position: [-3.5, 1.0, -1.5],
          label: '전신 거울',
          type: 'info',
          description: '전신 거울'
        },
        {
          id: 'h-shelf',
          position: [3.0, 1.5, -0.5],
          label: '진열 선반',
          type: 'info',
          description: '식물·소품 디스플레이 용도 (ex. 화분)',
        },
        {
          id: 'door-to-fitting',
          position: [-3, 1, 1.5],
          label: '피팅 룸 문',
          type: 'link',
          description: '피팅 룸으로 향하는 문',
          targetSceneId: 'scene-fitting'
        },
        {
          id: 'door-to-storage',
          position: [-3, 1, -3.5],
          label: '창고 문',
          type: 'link',
          description: '창고로 향하는 문',
          targetSceneId: 'scene-storage'
        }
        // 다른 방이 생기면 link 타입으로 연결
        // { id: 'h-to-storage', position: [...], label: '창고로', type: 'link', targetSceneId: 'scene-storage' }
      ],
    },
    // 피팅룸·창고 등은 같은 형태로 scene 추가
  ],
};

export const mockProperties: Property[] = [mockProperty];

/** Space.id(spaceId) 로 해당 공간의 3D 큐레이션 Property를 찾는다. */
export function getPropertyBySpaceId(spaceId: number): Property | undefined {
  return mockProperties.find((property) => property.spaceId === spaceId);
}

/** Property 안에서 특정 Scene을 찾는다. 없으면 defaultScene, 그마저 없으면 첫 Scene을 반환. */
export function getSceneById(property: Property, sceneId: string): Scene | undefined {
  return (
    property.scenes.find((scene) => scene.id === sceneId) ??
    property.scenes.find((scene) => scene.id === property.defaultSceneId) ??
    property.scenes[0]
  );
}
