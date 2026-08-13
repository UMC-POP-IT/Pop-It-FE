/** 호스트 등록(게스트 → 호스트 전환) 흐름의 시작 경로. 하위에 step1/step2/complete가 붙는다. */
export const HOST_REGISTER_PATH = "/host/host-register";

/**
 * 지금 경로가 호스트 등록 흐름 안인지 (#302).
 *
 * 이 흐름에서는 헤더 nav([내 공간]·[예약 관리])와 모바일 하단 탭바를 감추고,
 * 그에 맞춰 Footer의 탭바 보정 여백도 뺀다. 세 곳이 같은 판단을 해야 해서
 * 문자열과 판정 방식을 여기 한 곳에만 둔다 - 파일마다 따로 쓰면 조용히 어긋난다.
 *
 * 맨 startsWith를 쓰지 않는 이유: "/host/host-register-help" 같은 경로가 나중에
 * 생기면 접두사만으로는 이 흐름으로 오인해 nav가 사라진다. 경로 경계(/)까지 본다.
 */
export const isHostRegisterPath = (pathname: string) =>
  pathname === HOST_REGISTER_PATH ||
  pathname.startsWith(`${HOST_REGISTER_PATH}/`);
