# POP-IT (팝잇) 🛍️

> 비어있는 공간을, 더 가치있는 공간으로
**단기 임대 전용 플랫폼 — POP UP 잇다**
> 

방치된 유휴 공간(상가, 스튜디오, 사무실 등)을 단기로 필요한 사람과 연결해주는 매칭 플랫폼입니다. AI 맞춤 추천, 3D/360 공간 큐레이션, 에스크로 기반 안전 거래 시스템을 통해 임대인과 임차인 모두에게 안전하고 편리한 단기 공간 매칭 경험을 제공합니다.

---

## 📌 프로젝트 소개

- **소속**: UMC 10th
- **분야**: 서비스 기획 / 프론트엔드 개발

### 문제 배경

서울 주요 대학가 상권의 평균 공실률은 12.3%, 평균 공실 지속 기간은 4개월 이상입니다. 비싼 상권에서의 장기 계약 부담은 임차인에게 큰 허들이 되고, 결국 계약 포기율 68%로 이어지며 임대인은 공간을 방치할 수밖에 없는 악순환이 반복됩니다. **POP-IT**은 장기 계약 전까지의 빈 시간을 활용해 임대인의 손실을 최소화하고, 임차인에게는 부담 없는 조건의 도전 환경을 제공합니다.

---

## 👥 팀원 및 프론트엔드 역할 분담

| 역할 | 담당자 | 담당 기능 |
| --- | --- | --- |
| 1번 | 강민경 | 공간탐색, 공간 상세, 찜하기 |
| 2번 | 고태현 | AI 맞춤추천, 3D/360 공간 큐레이션, 나의 예약 |
| 3번 | 이수빈 | 공간 등록 (5단계 플로우) |
| 4번 | 임채은 | 내 공간 관리, 게스트 소통, 공통 레이아웃/디자인시스템 |

> 4명 모두 디자인 확정 → 화면설계서 기반 병렬 개발을 진행하며, 디자인/백엔드 개발과 함께 진행됩니다.
> 

---

## 🛠️ 기술 스택

| 분류 | 스택 |
| --- | --- |
| Language | TypeScript |
| Library/Framework | React, Vite |
| Styling | (예: Tailwind CSS / styled-components) |
| State Management | (예: React Query, Zustand) |
| Form | (예: react-hook-form) |
| 3D/360 | Three.js, @react-three/fiber, @react-three/drei |
| 협업 도구 | GitHub, Notion, Figma |
| 배포 | (예: Vercel) |

---

## 📁 폴더 구조

```
src/
├── app/                      # 앱 진입점, 라우터, 전역 Provider
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
│
├── shared/                   # 공통 디자인 시스템 & 레이아웃
│   ├── components/           # Button, Card, Badge, Input, Modal 등
│   ├── layout/               # Header, Footer, ModeToggle, PageWrapper
│   ├── styles/               # 색상/폰트/spacing 토큰
│   ├── hooks/                # 공통 hooks
│   └── utils/                # 공통 함수
│
├── features/                 # 기능(도메인) 단위 폴더
│   ├── guest-explore/        # 공간탐색 / 상세 / 찜
│   ├── guest-recommend/      # AI추천 / 3D 큐레이션 / 예약
│   ├── host-register/        # 공간 등록 5단계
│   └── host-manage/          # 내공간관리 / 게스트소통
│
├── types/                    # 전역 타입 정의
├── assets/                   # 이미지, 아이콘
└── main.tsx
```

각 `features/*` 폴더는 `components/`, `pages/`, `hooks/`, `api/` 하위 구조를 동일하게 가지며, 담당자별로 폴더가 분리되어 있어 작업 충돌을 최소화합니다.

---

## 🌿 브랜치 전략

- `main` : 배포 브랜치 (항상 배포 가능한 상태 유지)
- `dev` : 통합 개발 브랜치
- `feature/{기능명}` : 기능 단위 작업 브랜치
    
    예) `feature/guest-explore`, `feature/host-register`, `feature/3d-viewer`
    

**작업 흐름**: `feature/*` 브랜치에서 작업 → `dev`로 PR → 리뷰 후 머지 → 일정 주기로 `dev` → `main` 머지

---

## 📝 커밋 컨벤션

```
[타입] 작업 내용 요약

예시:
feat: 공간탐색 필터 UI 구현
fix: 찜하기 버튼 클릭 오류 수정
style: 공통 버튼 컴포넌트 스타일 수정
refactor: API 호출 로직 분리
docs: README 업데이트
chore: 패키지 설치 및 설정
```

| 타입 | 설명 |
| --- | --- |
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| style | 스타일/마크업 변경 (로직 변경 없음) |
| refactor | 코드 리팩토링 |
| docs | 문서 수정 |
| chore | 빌드/설정 등 기타 변경 |

---

## 🔀 PR 컨벤션

- 작업 시작 전 이슈 생성 → 해당 이슈 기준으로 브랜치 생성
- PR 제목: `[타입] 작업 내용`
- PR 본문에 작업 내용, 스크린샷(UI 변경 시), 관련 이슈 번호(`closes #이슈번호`) 포함
- 최소 1인 이상 리뷰 후 머지
- 머지 방식: Squash and Merge 권장

---

## 🚀 실행 방법

```bash
# 저장소 클론
git clone https://github.com/{팀저장소}/pop-it-frontend.git
cd pop-it-frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

---

## 🗺️ 화면 목록 및 플로우

### 게스트 모드

```
로그인 → AI 맞춤추천 / 공간탐색
   → 공간 상세 (3D 큐레이션 포함)
   → 찜하기 / 예약 요청
   → 본인인증 → 전자계약 → 에스크로 결제
   → 나의 예약 (사용예정 / 사용중 / 지난예약)
```

### 호스트 모드

```
모드전환(게스트 ↔ 호스트)
   → 공간 등록 (위치/구조 → 거래정보 → 공간정보 → 상세정보 → 사진등록)
   → 내 공간 관리 (등록된 공간 / 예약관리: 승인대기·이용중·이용완료)
   → 게스트 소통
```

| 화면 이름 | 페이지 ID | 진입 경로 | 담당자 |
| --- | --- | --- | --- |
| 로그인/회원가입 | LoginPage | 최초 진입 | 임채은 |
| AI 맞춤추천 | RecommendPage | 로그인 후 메인 | 고태현 |
| 공간탐색 | ExplorePage | 메인 탭 | 강민경 |
| 공간 상세 | DetailPage | 리스트 클릭 | 강민경 |
| 3D 큐레이션 | SpaceViewPage | 상세 내 진입 | 고태현 |
| 나의 예약 | MyReservationPage | 메인 탭 | 고태현 |
| 공간 등록 (1~5단계) | RegisterStep1~5 | 호스트 모드 진입 | 이수빈 |
| 내 공간 관리 | MySpacePage | 호스트 모드 | 임채은 |
| 게스트 소통 | ChatPage | 내공간관리 내 | 임채은 |

---

## 📋 협업 그라운드 룰

| 구분 | 규칙 |
| --- | --- |
| 커뮤니케이션 | 변경사항은 Notion 또는 GitHub Issue로 공유 |
| 일정 | 작업 지연 시 사전 공유 |
| Git | 작업 전 브랜치 생성 및 PR 필수 |
| 코드 스타일 | ESLint/Prettier 설정 준수 |

자세한 트러블슈팅 기록, 공용 컴포넌트 관리, 개발 일정, KPT 회고는 팀 노션 페이지에서 관리합니다.