# POP-IT (팝잇)

> 비어있는 공간을, 더 가치있는 공간으로
**단기 임대 전용 플랫폼 — POP UP 잇다**
> 

방치된 유휴 공간(상가, 스튜디오, 사무실 등)을 단기로 필요한 사람과 연결해주는 매칭 플랫폼입니다. AI 맞춤 추천, 3D 큐레이션, 에스크로 기반 안전 거래 시스템을 통해 임대인과 임차인 모두에게 안전하고 편리한 단기 공간 매칭 경험을 제공합니다.

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
| 1번 | 강민경 | 공간탐색, 공간 상세(호스트, 게스트 모두), 프론트엔드 배포|
| 2번 | 고태현 | 공간 탐색 - AI 맞춤형 공간 / 실시간 추천 공간, 3D 큐레이션, 나의 예약, 찜하기 |
| 3번 | 이수빈 | 공간 등록 (5단계 플로우), 호스트 등록 (2단계 플로우) |
| 4번 | 임채은 | 로그인, 내 공간 관리, 공통 컴포넌트/디자인시스템 |

> 4명 모두 디자인 확정 → 화면설계서 기반 병렬 개발을 진행하며, 디자인/백엔드 개발과 함께 진행됩니다.
> 

---

## 🛠️ 기술 스택

| 분류 | 스택 |
| --- | --- |
| Language | TypeScript |
| Library/Framework | React 19, React Router 7, Vite 6 |
| Styling | Tailwind CSS 4, @toss/tds-mobile |
| State Management | Zustand 5 |
| 지도 | Kakao Maps JavaScript SDK |
| 3D 큐레이션 | Three.js, @react-three/fiber, @react-three/drei |
| 결제/본인인증 | PortOne(@portone/browser-sdk), TossPayments |
| 패키지 매니저 | pnpm, npm |
| Lint/Format | ESLint, Prettier (+ prettier-plugin-tailwindcss) |
| 협업 도구 | GitHub, Notion, Figma |
| 리뷰 봇 | coderabbitai, copilot |
| 배포 | Vercel |

---

## 📁 폴더 구조

``` text
src/
├── app/                       # 앱 진입점, 라우터
│   ├── App.tsx
│   └── router.tsx
│
├── shared/                    # 공통 디자인 시스템 & 컴포넌트
│   ├── components/            # 공통 컴포넌트 (Button, Badge, Chip, Input, Select, Modal, SpaceCard 등)
│   ├── layout/                # Header, Footer, Banner, MainLayout, AuthLayout
│   ├── styles/                # 색상/폰트/spacing 토큰
│   ├── hooks/                 # 공통 hooks (ex. useKakaoLoader)
│   └── utils/                 # 공통 함수
│
├── features/                  # 기능(도메인) 단위 폴더
│   ├── auth/                  # 로그인
│   │   ├── api/ hooks/ pages/
│   ├── guest-explore/         # 공간탐색 · AI/실시간 추천 · 상세 · 찜 · 예약 · 계약/결제 · 3D 큐레이션
│   │   ├── api/                    # mock 데이터, curation_model
│   │   ├── components/             # 탐색·상세·찜·예약 리스트/카드/지도 등
│   │   │   ├── contract/           # 본인인증, 전자계약 서명, 결제(Toss/PortOne) 모달
│   │   │   └── curation/           # 3D 큐레이션 (룸 뷰어) (Three.js Scene, Hotspot 등)
│   │   ├── hooks/ icons/ pages/
│   ├── guest-recommend/       # 현재는 guest-explore에 통합되어 있으며, 별도 폴더는 추후 정리 예정
│   ├── host-register/         # 공간 등록 5단계 / 호스트 전환 등록 2단계
│   │   ├── api/ components/ hooks/ pages/ steps/
│   └── host-manage/           # 내 공간 관리 · 예약 관리(호스트) · 게스트 계약/결제
│       ├── api/ components/(contract/) hooks/ pages/ utils/
│
├── store/                     # 전역 상태 (Zustand): auth, register, space, wish
├── types/                     # 전역 타입 정의 (kakao-maps 등)
├── assets/                    # 이미지, 아이콘
└── main.tsx
```

각 `features/*` 폴더는 담당자별로 분리되어 있으며 `components/`, `pages/`, `hooks/`, `api/` 하위 구조를 기본으로 갖되, 기능 성격에 따라 `steps/`, `utils/`, `contract/`, `curation/` 같은 하위 폴더를 추가로 둡니다. `guest-recommend`는 초기 설계 시 분리했던 폴더지만, 실제 개발은 `guest-explore` 안(AiRecommendSpace, RealTimeRecommendSpace, curation/)에서 함께 진행되고 있습니다.

---

## 🌿 브랜치 컨벤션

- `main` : 배포 브랜치 (항상 배포 가능한 상태 유지)
- `dev` : 통합 개발 브랜치
- `feat/이슈번호-기능명` : 기능 단위 작업 브랜치
    
    예) `feat/3-guest-explore`, `feat/4-host-register`, `feat/5-3d-viewer`
    

**작업 흐름**: `feat/*` 브랜치에서 작업 → `dev`로 PR → 리뷰 후 머지 → 일정 주기로 `dev` → `main` 머지

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

그 외는 생략
```

| 타입 | 설명 |
| --- | --- |
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| style | 스타일/마크업 변경 (로직 변경 없음) |
| refactor | 코드 리팩토링 |
| docs | 문서 수정 |
| chore | 빌드/설정 등 기타 변경 |
| ci | CI/CD 설정 (Github actions 등) |
| deploy | 배포 (dev -> main으로 merge 할 때) |
| perf | 성능 개선 (쿼리 최적화, 동시성 개선 등) |
| test | 테스트 추가/수정 |

---

## 🔀 PR 컨벤션

- 작업 시작 전 이슈 생성 → 해당 이슈 기준으로 브랜치 생성
- PR 제목: `타입: 작업 내용 (#이슈번호)`
- PR 본문에 작업 내용, 스크린샷(UI 변경 시), 관련 이슈 번호(`closes #이슈번호`) 포함
- 최소 1인 이상 리뷰 후 머지
- 머지 방식: Squash and Merge 권장

---

## 🚀 실행 방법

```bash
# 저장소 클론
git clone https://github.com/UMC-POP-IT/Pop-It-FE.git
cd Pop-It-FE

# 패키지 설치 (pnpm 사용)
pnpm install

# 환경변수 설정 (.env)
# 아래 값을 채운 .env 파일을 프로젝트 루트에 생성합니다.
VITE_TOSS_PAYMENTS_CLIENT_KEY=   # TossPayments 결제 클라이언트 키
VITE_PORTONE_STORE_ID=           # PortOne 본인인증/결제 스토어 ID
VITE_PORTONE_CHANNEL_KEY=        # PortOne 채널 키
VITE_KAKAO_JS_KEY=               # Kakao Maps JavaScript SDK 앱 키

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프리뷰 (빌드 결과 로컬 확인)
pnpm preview

# 린트 / 포맷
pnpm lint
pnpm format
```

---

## 🗺️ 화면 목록 및 플로우

### 게스트 모드

```
로그인 (/login)
   → 홈 (/, AI 맞춤추천 + 실시간 추천 + 공간탐색 리스트)
   → 공간 상세 (/spaces/:spaceId)
        → 3D 큐레이션 (/spaces/:spaceId/view)
        → 찜하기
        → 예약 요청 → 본인인증 → 전자계약(서명) → 결제(TossPayments/PortOne)
   → 나의 예약 (/reservations, 사용예정 / 사용중 / 지난예약)
```

### 호스트 모드

```
호스트 등록 (/host/host-register → step1 → step2 → complete, 게스트 → 호스트 전환)
   → 공간 등록 (/host/register → step2 → step3 → step4 → step5)
   → 내 공간 관리 (/host/spaces → /host/spaces/:spaceId)
   → 예약 관리 (/host/reservations, 승인대기 · 이용중 · 이용완료)
```

| 화면 이름 | 컴포넌트/페이지 | 라우트 | 담당자 |
| --- | --- | --- | --- |
| 로그인 | LoginPage | `/login` | 임채은 |
| 홈 (추천+탐색) | HomePage → AiRecommendSpace, RealTimeRecommendSpace, ExploreSpace | `/` | 고태현 / 강민경 |
| 공간 탐색 | ExplorePage | `/explore` | 강민경 |
| 공간 상세 | SpaceDetailPage | `/spaces/:spaceId` | 강민경 |
| 3D 큐레이션 | SpaceViewPage (CurationViewer) | `/spaces/:spaceId/view` | 고태현 |
| 전자계약/결제 | ContractModal, Authentication, SignatureBoard, PaymentModal, TossPayments | 공간 상세 내 모달 | 강민경 |
| 나의 예약 | MyReservationPage | `/reservations` | 고태현 |
| 공간 등록 (1~5단계) | RegisterStep1~5 | `/host/register/step2 ~ /host/register/step5` | 이수빈 |
| 호스트 등록 (1~2단계) | HostRegisterStart, HostRegisterStep1~2, HostRegisterComplete | `/host/host-register/step1`, `/host/host-register/step2`, `/host/host-register/complete` | 이수빈 |
| 내 공간 관리 | MySpacePage, HostSpaceDetailPage | `/host/spaces`, `/host/spaces/:spaceId` | 임채은 |
| 예약 관리(호스트) | HostReservationPage | `/host/reservations` | 임채은 |

---

## 📋 협업 그라운드 룰

| 구분 | 규칙 |
| --- | --- |
| 커뮤니케이션 | 변경사항은 Notion 또는 GitHub Issue로 공유 |
| 일정 | 작업 지연 시 사전 공유 |
| Git | 작업 전 브랜치 생성 및 PR 필수 |
| Git | PR 작성 꼼꼼히 (Assignees, labels 등 꼼꼼히 체크) |
| Git | PR merge 전 절차 필히 준수 ~ kakaotalk 참고 |
| 코드 스타일 | ESLint/Prettier 설정 준수 |

자세한 트러블슈팅 기록, 공용 컴포넌트 관리, 개발 일정, KPT 회고는 팀 노션 페이지에서 관리합니다.
