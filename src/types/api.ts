// 백엔드 공통 응답 봉투 - 모든 API가 이 형태로 감싸서 보낸다
// 실제 데이터는 result 안에 들어있음
export interface PopitResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}
