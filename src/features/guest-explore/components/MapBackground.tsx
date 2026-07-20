/**
 * 공간 탐색 지도 / 공간 상세 지도에서 공통으로 사용하는 배경 일러스트
 * 카카오 지도 SDK 로딩 전/키 미설정 시 fallback 화면으로 사용
 */
const MapBackground = () => (
  <svg
    viewBox="0 0 1000 600"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="h-full w-full"
  >
    <rect
      width="1000"
      height="600"
      fill="#eef1f4"
    />

    {/* 도로 */}
    <g
      stroke="#dfe3e8"
      strokeWidth="2"
    >
      <line
        x1="0"
        y1="90"
        x2="1000"
        y2="60"
      />
      <line
        x1="0"
        y1="220"
        x2="1000"
        y2="190"
      />
      <line
        x1="0"
        y1="360"
        x2="1000"
        y2="400"
      />
      <line
        x1="0"
        y1="500"
        x2="1000"
        y2="540"
      />
      <line
        x1="120"
        y1="0"
        x2="90"
        y2="600"
      />
      <line
        x1="320"
        y1="0"
        x2="300"
        y2="600"
      />
      <line
        x1="560"
        y1="0"
        x2="600"
        y2="600"
      />
      <line
        x1="780"
        y1="0"
        x2="820"
        y2="600"
      />
    </g>

    {/* 강 */}
    <path
      d="M -50 120 C 150 160, 250 260, 420 300 C 600 340, 750 420, 1050 520"
      fill="none"
      stroke="#bcdcf5"
      strokeWidth="60"
      strokeLinecap="round"
    />

    {/* 공원 */}
    <rect
      x="60"
      y="380"
      width="140"
      height="110"
      rx="24"
      fill="#cfe8cf"
    />
    <rect
      x="800"
      y="60"
      width="150"
      height="90"
      rx="24"
      fill="#cfe8cf"
    />
    <circle
      cx="860"
      cy="470"
      r="55"
      fill="#cfe8cf"
    />
  </svg>
);

export default MapBackground;
