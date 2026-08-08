import sceneStoreModelUrl from './curation_model/scene-popup-store.glb?url';
import sceneFittingModelUrl from './curation_model/scene-popup-fitting.glb?url';
import sceneStorageModelUrl from './curation_model/scene-popup-storage.glb?url';
import scenePhotoStudioModelUrl from './curation_model/scene-photostudio.glb?url';
import scenePhotoStudioMakeupModelUrl from './curation_model/scene-photostudio-makeup.glb?url';
import scenePartyRoomModelUrl from './curation_model/scene-partyroom.glb?url';
import scenePartyRoomRooftopModelUrl from './curation_model/scene-partyroom-rooftop.glb?url';
import sceneGalleryModelUrl from './curation_model/scene-gallery.glb?url';
import sceneGalleryLoungeModelUrl from './curation_model/scene-gallery-lounge.glb?url';
import sceneCafeModelUrl from './curation_model/scene-cafe.glb?url';
import sceneCafeTerraceModelUrl from './curation_model/scene-cafe-terrace.glb?url';
import { mapSpaceCategoryTag, type SpaceCategory } from '@/shared/utils/spaceCategory';

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
  category: SpaceCategory; // 공간 카테고리 (@/shared/utils/spaceCategory) 와의 연결 키
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

// 돌하우스 시점 공통 카메라 프리셋 (방 크기에 따라 minDistance/maxDistance만 조정)
const DOLLHOUSE_ANGLES = {
  minPolarAngle: 0.3,   // 거의 위에서
  maxPolarAngle: 1.4,   // 수평 살짝 위까지 (≈ π/2.2)
} as const;

/**
 * 팝업스토어 매물 (SpaceCategory.POPUP_STORE)
 * 창고 / 피팅룸 / 매장 전체 3개 장면이 링크 핫스팟으로 서로 연결된, 유일한 멀티룸 예시.
 */
export const popupStoreProperty: Property = {
  id: 'prop-sinsa-001',
  category: 'POPUP_STORE',
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
        ...DOLLHOUSE_ANGLES,
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
        ...DOLLHOUSE_ANGLES,
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
          description: '피팅룸 밖으로 나가는 문',
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
        ...DOLLHOUSE_ANGLES,
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
          label: '피팅룸 문',
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

/**
 * 쇼룸 매물 (SpaceCategory.SHOWROOM)
 * 통유리 채광 + 조명/배경지를 갖춰 화보 촬영·제품 전시 겸용으로 쓸 수 있는 촬영홀 1개 장면.
 */
export const photoStudioProperty: Property = {
  id: 'prop-sinsa-atelier-001',
  category: 'SHOWROOM',
  name: '신사 아뜰리에',
  area: '33㎡',
  address: '서울 강남구 압구정로 42길 15',
  description: '통유리로 자연광이 가득 들어오는 신사동 단독 화보촬영 스튜디오',
  coverImage: 'https://picsum.photos/seed/prop-sinsa-atelier-001-cover/800/600',
  defaultSceneId: 'scene-photostudio',
  ownerId: 'owner-2001',
  createdAt: '2026-01-12T09:00:00Z',
  scenes: [
    {
      id: 'scene-photostudio',
      name: '촬영홀',
      modelUrl: scenePhotoStudioModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-atelier-001-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-sinsa-atelier-001-1/1400/800',
        'https://picsum.photos/seed/prop-sinsa-atelier-001-2/1400/800',
        'https://picsum.photos/seed/prop-sinsa-atelier-001-3/1400/800',
      ],
      camera: {
        position: [6, 6, 6],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 13,
        ...DOLLHOUSE_ANGLES,
      },
      hotspots: [
        {
          id: 'h-window',
          position: [0, 1.4, -3.3],
          label: '통유리창',
          type: 'info',
          description: '자연광이 그대로 들어오는 대형 통유리창. 시간대별로 빛의 결이 달라짐.',
        },
        {
          id: 'h-backdrop',
          position: [-1.8, 1.2, -3.0],
          label: '배경지',
          type: 'info',
          description: '무지 배경지 롤. 색상 교체 문의는 호스트에게.',
        },
        {
          id: 'h-lights',
          position: [2.6, 1.2, -1.0],
          label: '조명 스탠드',
          type: 'info',
          description: '소프트박스 조명 2대, 각도/높이 조절 가능.',
        },
        {
          id: 'h-camera',
          position: [0.2, 1.0, 0.6],
          label: '카메라 삼각대',
          type: 'info',
          description: '기본 삼각대 비치. 카메라 바디는 직접 지참.',
        },
        {
          id: 'h-reflector',
          position: [2.6, 1.0, 1.6],
          label: '반사판',
          type: 'info',
          description: '역광 촬영 시 인물 보정용 반사판.',
        },
        {
          id: 'h-garment-rack',
          position: [-3.2, 1.3, 1.8],
          label: '의상 행거',
          type: 'info',
          description: '촬영 대기 의상을 걸어둘 수 있는 행거와 보조 스툴.',
        },
        {
          id: 'door-to-makeup',
          position: [-3.7, 1.0, 1.0],
          label: '메이크업룸 문',
          type: 'link',
          description: '메이크업룸으로 이동',
          targetSceneId: 'scene-photostudio-makeup',
        },
      ],
    },
    {
      id: 'scene-photostudio-makeup',
      name: '메이크업룸',
      modelUrl: scenePhotoStudioMakeupModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-atelier-001-makeup-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-sinsa-atelier-001-makeup-1/1400/800',
        'https://picsum.photos/seed/prop-sinsa-atelier-001-makeup-2/1400/800',
      ],
      camera: {
        position: [4.5, 4.5, 4.5],
        target: [0, 0.5, 0],
        minDistance: 3,
        maxDistance: 9,
        ...DOLLHOUSE_ANGLES,
      },
      hotspots: [
        {
          id: 'h-vanity-mirror',
          position: [1.6, 1.55, -2.15],
          label: '화장대 거울',
          type: 'info',
          description: '메이크업·헤어 정리를 위한 벽거울과 화장대.',
        },
        {
          id: 'h-garment-rack-2',
          position: [-1.3, 1.3, 1.2],
          label: '의상 보관 행거',
          type: 'info',
          description: '촬영 순서를 기다리는 의상을 걸어두는 행거.',
        },
        {
          id: 'h-side-table',
          position: [1.7, 0.5, 1.5],
          label: '소품 테이블',
          type: 'info',
          description: '소품·액세서리를 올려둘 수 있는 사이드 테이블.',
        },
        {
          id: 'door-to-photostudio',
          position: [-1.4, 1.0, -2.2],
          label: '촬영홀 문',
          type: 'link',
          description: '촬영홀로 이동',
          targetSceneId: 'scene-photostudio',
        },
      ],
    },
  ],
};

/**
 * 복합공간 매물 (SpaceCategory.COMPLEX_SPACE)
 * 빔프로젝터 + 주방 아일랜드를 갖춘 모임/파티 등 다목적 활용이 가능한 메인홀 1개 장면.
 */
export const partyRoomProperty: Property = {
  id: 'prop-sinsa-lounge-001',
  category: 'COMPLEX_SPACE',
  name: '신사 라운지홀',
  area: '50㎡',
  address: '서울 강남구 도산대로 108',
  description: '빔프로젝터와 넓은 주방 공간을 갖춘 모임 및 파티에 최적화된 라운지홀',
  coverImage: 'https://picsum.photos/seed/prop-sinsa-lounge-001-cover/800/600',
  defaultSceneId: 'scene-partyroom',
  ownerId: 'owner-2002',
  createdAt: '2026-02-03T09:00:00Z',
  scenes: [
    {
      id: 'scene-partyroom',
      name: '메인홀',
      modelUrl: scenePartyRoomModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-lounge-001-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-sinsa-lounge-001-1/1400/800',
        'https://picsum.photos/seed/prop-sinsa-lounge-001-2/1400/800',
        'https://picsum.photos/seed/prop-sinsa-lounge-001-3/1400/800',
      ],
      camera: {
        position: [7, 7, 7],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 15,
        ...DOLLHOUSE_ANGLES,
      },
      hotspots: [
        {
          id: 'h-screen',
          position: [1.6, 1.6, -3.7],
          label: '빔프로젝터 / 스크린',
          type: 'info',
          description: 'HDMI 연결만 하면 바로 사용 가능한 빔프로젝터와 스크린.',
        },
        {
          id: 'h-table',
          position: [0.6, 0.7, 0.4],
          label: '장테이블',
          type: 'info',
          description: '최대 6인이 함께 앉을 수 있는 장테이블.',
        },
        {
          id: 'h-kitchen',
          position: [3.3, 0.9, -2.6],
          label: '주방 아일랜드',
          type: 'info',
          description: '간단한 조리·세팅이 가능한 아일랜드형 주방.',
        },
        {
          id: 'h-speaker',
          position: [-3.4, 0.6, -3.2],
          label: '음향 스피커',
          type: 'info',
          description: '음악 재생용 스피커 2대 비치.',
        },
        {
          id: 'h-sofa',
          position: [-3.0, 0.5, 2.8],
          label: '라운지 소파',
          type: 'info',
          description: '편하게 담소를 나눌 수 있는 라운지 소파존.',
        },
        {
          id: 'door-to-rooftop',
          position: [-4.1, 1.0, -0.8],
          label: '루프탑 문',
          type: 'link',
          description: '루프탑으로 이동',
          targetSceneId: 'scene-partyroom-rooftop',
        },
      ],
    },
    {
      id: 'scene-partyroom-rooftop',
      name: '루프탑',
      modelUrl: scenePartyRoomRooftopModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-sinsa-lounge-001-rooftop-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-sinsa-lounge-001-rooftop-1/1400/800',
        'https://picsum.photos/seed/prop-sinsa-lounge-001-rooftop-2/1400/800',
      ],
      camera: {
        position: [6, 5, 6],
        target: [0, 0.4, 0],
        minDistance: 4,
        maxDistance: 14,
        minPolarAngle: 0.35,
        maxPolarAngle: 1.45,
      },
      hotspots: [
        {
          id: 'h-bbq',
          position: [-2.8, 0.6, -2.6],
          label: '바베큐 그릴',
          type: 'info',
          description: '가스 바베큐 그릴 비치, 사용 후 청소는 필수.',
        },
        {
          id: 'h-outdoor-table',
          position: [0.8, 0.75, 0.4],
          label: '야외 테이블',
          type: 'info',
          description: '최대 4인이 앉을 수 있는 야외 테이블 세트.',
        },
        {
          id: 'h-parasol',
          position: [0.8, 2.2, 0.4],
          label: '파라솔',
          type: 'info',
          description: '직사광선을 가려주는 대형 파라솔.',
        },
        {
          id: 'h-planter',
          position: [3.0, 0.6, -2.4],
          label: '화단',
          type: 'info',
          description: '조경용 화단, 사진 촬영 포인트로도 인기.',
        },
        {
          id: 'door-to-partyroom',
          position: [3.4, 1.0, 3.2],
          label: '메인홀 문',
          type: 'link',
          description: '메인홀로 이동',
          targetSceneId: 'scene-partyroom',
        },
      ],
    },
  ],
};

/**
 * 전시/갤러리 매물 (SpaceCategory.EXHIBITION_GALLERY)
 * 전시 벽면 + 트랙 조명을 갖춘 프라이빗 전시홀 1개 장면.
 */
export const galleryProperty: Property = {
  id: 'prop-hannam-gallery-001',
  category: 'EXHIBITION_GALLERY',
  name: '한남 갤러리룸',
  area: '40㎡',
  address: '서울 용산구 이태원로 55길 21',
  description: '모던하고 고급스러운 분위기의 한남동 프라이빗 갤러리룸',
  coverImage: 'https://picsum.photos/seed/prop-hannam-gallery-001-cover/800/600',
  defaultSceneId: 'scene-gallery',
  ownerId: 'owner-2006',
  createdAt: '2026-04-01T09:00:00Z',
  scenes: [
    {
      id: 'scene-gallery',
      name: '전시홀',
      modelUrl: sceneGalleryModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-hannam-gallery-001-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-hannam-gallery-001-1/1400/800',
        'https://picsum.photos/seed/prop-hannam-gallery-001-2/1400/800',
        'https://picsum.photos/seed/prop-hannam-gallery-001-3/1400/800',
      ],
      camera: {
        position: [6, 6, 6],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 12,
        ...DOLLHOUSE_ANGLES,
      },
      hotspots: [
        {
          id: 'h-exhibit-wall',
          position: [-3.55, 1.6, 0.2],
          label: '전시 벽면',
          type: 'info',
          description: '액자 3점을 걸 수 있는 메인 전시 벽면.',
        },
        {
          id: 'h-track-light',
          position: [0, 2.7, 0],
          label: '트랙 조명',
          type: 'info',
          description: '작품별 밝기 조절이 가능한 트랙 조명.',
        },
        {
          id: 'h-pedestal',
          position: [1.6, 0.9, -1.4],
          label: '전시 좌대',
          type: 'info',
          description: '조각·오브제 전시용 좌대 2개.',
        },
        {
          id: 'h-bench',
          position: [0, 0.4, 2.2],
          label: '벤치',
          type: 'info',
          description: '관람객이 잠시 앉아 작품을 감상할 수 있는 벤치.',
        },
        {
          id: 'door-to-lounge',
          position: [2.6, 1.1, -3.2],
          label: '라운지 문',
          type: 'link',
          description: '라운지로 이동',
          targetSceneId: 'scene-gallery-lounge',
        },
      ],
    },
    {
      id: 'scene-gallery-lounge',
      name: '라운지',
      modelUrl: sceneGalleryLoungeModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-hannam-gallery-001-lounge-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-hannam-gallery-001-lounge-1/1400/800',
        'https://picsum.photos/seed/prop-hannam-gallery-001-lounge-2/1400/800',
      ],
      camera: {
        position: [4.5, 4.5, 4.5],
        target: [0, 0.5, 0],
        minDistance: 3,
        maxDistance: 9,
        ...DOLLHOUSE_ANGLES,
      },
      hotspots: [
        {
          id: 'h-reception-desk',
          position: [-1.5, 0.95, -1.6],
          label: '안내 데스크',
          type: 'info',
          description: '방문객 응대 및 도록 배포용 안내 데스크.',
        },
        {
          id: 'h-lounge-sofa',
          position: [1.2, 0.5, 1.3],
          label: '라운지 소파',
          type: 'info',
          description: '관람 전후 잠시 쉬어갈 수 있는 소파존.',
        },
        {
          id: 'h-bookshelf',
          position: [-2.35, 0.8, 1.3],
          label: '도록 진열대',
          type: 'info',
          description: '전시 도록·카탈로그가 비치된 책장.',
        },
        {
          id: 'door-to-gallery',
          position: [1.6, 1.1, -2.4],
          label: '전시홀 문',
          type: 'link',
          description: '전시홀로 이동',
          targetSceneId: 'scene-gallery',
        },
      ],
    },
  ],
};

/**
 * 카페/식음료 매물 (SpaceCategory.CAFE_FNB)
 * 바 카운터 + 카페 테이블을 갖춘 카페홀 1개 장면.
 */
export const cafeProperty: Property = {
  id: 'prop-seongsu-cafe-001',
  category: 'CAFE_FNB',
  name: '성수 카페홀',
  area: '45㎡',
  address: '서울 성동구 연무장길 30',
  description: '바 카운터와 오픈 키친을 갖춘 카페/식음료 전용 공간',
  coverImage: 'https://picsum.photos/seed/prop-seongsu-cafe-001-cover/800/600',
  defaultSceneId: 'scene-cafe',
  ownerId: 'owner-2007',
  createdAt: '2026-05-10T09:00:00Z',
  scenes: [
    {
      id: 'scene-cafe',
      name: '카페홀',
      modelUrl: sceneCafeModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-seongsu-cafe-001-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-seongsu-cafe-001-1/1400/800',
        'https://picsum.photos/seed/prop-seongsu-cafe-001-2/1400/800',
      ],
      camera: {
        position: [6, 6, 6],
        target: [0, 0.5, 0],
        minDistance: 4,
        maxDistance: 12,
        ...DOLLHOUSE_ANGLES,
      },
      hotspots: [
        {
          id: 'h-bar-counter',
          position: [1.4, 1.0, -2.6],
          label: '바 카운터',
          type: 'info',
          description: '에스프레소 머신과 페이스트리 진열장이 있는 바 카운터.',
        },
        {
          id: 'h-menu-board',
          position: [1.4, 2.05, -3.3],
          label: '메뉴보드',
          type: 'info',
          description: '메뉴 교체가 자유로운 벽면 메뉴보드.',
        },
        {
          id: 'h-pendant-light',
          position: [1.4, 2.3, -1.8],
          label: '펜던트 조명',
          type: 'info',
          description: '카운터 위를 밝히는 펜던트 조명 3개.',
        },
        {
          id: 'h-cafe-table',
          position: [-1.6, 0.7, 1.4],
          label: '카페 테이블',
          type: 'info',
          description: '2인 좌석 카페 테이블 2개.',
        },
        {
          id: 'door-to-terrace',
          position: [-2.6, 1.05, -3.1],
          label: '테라스 문',
          type: 'link',
          description: '야외 테라스석으로 이동',
          targetSceneId: 'scene-cafe-terrace',
        },
      ],
    },
    {
      id: 'scene-cafe-terrace',
      name: '야외 테라스석',
      modelUrl: sceneCafeTerraceModelUrl,
      thumbnail: 'https://picsum.photos/seed/prop-seongsu-cafe-001-terrace-thumb/400/500',
      images: [
        'https://picsum.photos/seed/prop-seongsu-cafe-001-terrace-1/1400/800',
        'https://picsum.photos/seed/prop-seongsu-cafe-001-terrace-2/1400/800',
      ],
      camera: {
        position: [5.5, 4.5, 5.5],
        target: [0, 0.4, 0],
        minDistance: 3,
        maxDistance: 11,
        minPolarAngle: 0.35,
        maxPolarAngle: 1.45,
      },
      hotspots: [
        {
          id: 'h-patio-table',
          position: [-1.6, 0.7, -1.0],
          label: '야외 테이블',
          type: 'info',
          description: '2인 좌석 야외 테이블 2개.',
        },
        {
          id: 'h-planter',
          position: [-2.6, 0.6, 1.8],
          label: '화분',
          type: 'info',
          description: '테라스에 생기를 더하는 화분.',
        },
        {
          id: 'h-string-light',
          position: [-2.6, 1.8, -2.0],
          label: '조명끈',
          type: 'info',
          description: '저녁 시간대 분위기를 더하는 조명끈.',
        },
        {
          id: 'door-to-cafe',
          position: [2.75, 1.0, 2.3],
          label: '카페홀 문',
          type: 'link',
          description: '카페홀로 이동',
          targetSceneId: 'scene-cafe',
        },
      ],
    },
  ],
};

/** @/shared/utils/spaceCategory 의 5개 공간 카테고리(팝업스토어/전시·갤러리/복합공간/쇼룸/카페·식음료)에 대응하는 3D 큐레이션 매물 목록 */
export const mockProperties: Property[] = [
  popupStoreProperty,
  galleryProperty,
  partyRoomProperty,
  photoStudioProperty,
  cafeProperty,
];

/**
 * 공간 카테고리 라벨(ex. space.category === '팝업스토어')로 해당 카테고리의 3D 큐레이션 Property를 찾는다.
 * 매칭되는 매물이 없으면(ex. exploreSpaces의 목업 카드들) 팝업스토어 모델로 통일해서 보여준다.
 */
export function getPropertyByCategory(categoryLabel: string): Property | undefined {
  return (
    mockProperties.find((property) => mapSpaceCategoryTag(property.category) === categoryLabel) ??
    popupStoreProperty
  );
}

/** Property 안에서 특정 Scene을 찾는다. 없으면 defaultScene, 그마저 없으면 첫 Scene을 반환. */
export function getSceneById(property: Property, sceneId: string): Scene | undefined {
  return (
    property.scenes.find((scene) => scene.id === sceneId) ??
    property.scenes.find((scene) => scene.id === property.defaultSceneId) ??
    property.scenes[0]
  );
}
