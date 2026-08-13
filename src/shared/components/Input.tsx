import { type InputHTMLAttributes, useId } from "react";

/**
 * 메시지 슬롯 계약 (이슈 #306)
 *
 * 입력칸 아래 '한 칸'에 오류·회색 안내·글자수가 순서대로 자리를 양보한다.
 * 그 칸은 비어 있어도 높이를 예약해서, 입력 중 문구가 떴다 사라져도 아래
 * 컨텐츠가 움직이지 않는다.
 *
 * 슬롯이 생기는 조건은 `error`·`hint`·`counter` 중 하나라도 **prop으로 전달된 것**
 * 이다(값이 빈 문자열이어도 전달했으면 생긴다). 셋 다 안 넘기면 슬롯 자체가 없다.
 *
 * 그래서 호출부가 지켜야 할 규칙은 하나다 —
 * **오류가 뜰 수 있는 칸이면, 정상일 때도 `error`를 빈 문자열로 넘겨야 한다.**
 * 예: `error={depositError}` (`depositError`가 정상일 때 `""`)
 *
 * 조건부로 `error={hasError ? msg : undefined}`처럼 넘기면 정상 상태에서 슬롯이
 * 사라져 예약이 풀리고, 오류가 뜨는 순간 아래가 밀린다. 이 화면들의 검증 값은
 * 모두 `""`를 반환하도록 만들어 두었으니 그대로 넘기면 된다.
 *
 * 반대로 검증 오류가 없는 칸(상호명·계좌번호·층수 등)은 셋 다 넘기지 않아
 * 빈 줄이 생기지 않는다. 의도한 동작이므로 그대로 두면 된다.
 *
 *
 * 라이브 영역 규칙 (host-register 폼 전체 공통)
 *
 * 1. 라이브 영역은 **항상 마운트**한다. 노드를 조건부로 넣었다 빼거나 role·aria-live
 *    속성을 나중에 붙이면 보조기술이 등록을 놓칠 수 있다. 노드는 남기고 내용만 바꾼다.
 *    (비어 있을 때 높이가 0이 되도록 gap 대신 empty:mt-0 같은 방식을 쓰거나,
 *     min-h로 자리를 예약한다 — 어느 쪽이든 정상 상태 레이아웃은 그대로 유지한다.)
 * 2. 급함의 정도로 role을 고른다.
 *    - `aria-live="polite"` : 타이핑 중 바뀌는 검증 문구, 화면 진입 직후의 로딩·조회
 *      결과. assertive면 한 글자마다 낭독을 끊는다. (이 컴포넌트, 면적, 공간 설명,
 *      시설 목록, 파일 첨부, 사진 제외 안내, 호스트 등록 완료)
 *    - `role="alert"` (= assertive) : 사용자가 버튼을 눌러 발생한 한 번짜리 결과.
 *      기다리던 응답이라 끊을 낭독이 없고 즉시 알리는 편이 낫다.
 *      (제출 실패 문구, 달력에서 선택 불가 날짜를 탭했을 때)
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** 오류 문구. 있으면 hint·counter를 가리고 이 문구만 보인다.
   *  오류가 뜰 수 있는 칸이면 정상일 때도 ""로 넘겨야 슬롯이 예약된다 (위 계약 참고) */
  error?: string;
  /** 오류가 없을 때 같은 자리에 보여줄 회색 안내 (예: "최대 100만원 설정 가능").
   *  진짜 안내이므로 aria-describedby로 입력과 묶여 읽힌다 */
  hint?: string;
  /** 오류가 없을 때 우측에 보여줄 글자수 카운터 (예: "5/30").
   *  hint와 달리 aria-hidden이다 — 한 글자 칠 때마다 "5 슬래시 30"이 낭독되면
   *  소리로는 뜻도 없고 방해만 된다.
   *  주의: maxLength는 HTML-AAM에서 어떤 ARIA 속성으로도 매핑되지 않아 NVDA·JAWS·
   *  VoiceOver 모두 읽지 않는다. 상한을 알려야 하는 칸은 aria-label이나 hint로
   *  "최대 N자"를 따로 넣는다 — 이 컴포넌트가 대신 해주지 않는다.
   *  hint와 함께 넘기면 한 줄에 [hint ... counter]로 나란히 놓인다 */
  counter?: string;
  /** 메시지 슬롯 예약 줄 수. 좁은 칸(2단 그리드 등)에서 문구가 두 줄로
   *  접히면 2를 준다 — 모바일만 두 줄분, md 이상은 한 줄분을 예약한다.
   *
   *  주의: 호출부 주석의 "실측 N px = 한 줄" 값들은 모두 SUIT Variable이 적용된
   *  상태 기준이다. 이 폰트는 global_style.css가 jsdelivr에서 런타임에 받아오므로,
   *  CDN이 막히거나 로드 전이면 폴백(ui-sans-serif/system-ui)으로 그려지고 폭이
   *  14~17% 넓어져 한 줄 전제가 뒤집힌다. 문구를 새로 넣거나 줄일 때는 여유를
   *  넉넉히 두는 편이 안전하다 (폰트 자체 호스팅은 shared/styles 영역이라 별건) */
  messageLines?: 1 | 2;
}

const Input = ({
  label,
  error,
  hint,
  counter,
  messageLines = 1,
  className = "",
  id,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) => {
  // 메시지(오류 또는 회색 안내)와 입력칸을 잇는 id — 한 화면에 Input이 여러 개여도 안 겹친다
  const messageId = useId();
  // 바깥에서 id를 안 주면 여기서 만들어 label과 input을 잇는다
  const generatedId = useId();
  const inputId = id ?? generatedId;
  // 에러든 회색 안내든 '메시지 슬롯'을 쓰겠다고 선언한 호출자에게만 슬롯을 만든다.
  // error에 ""가 들어와도(= 지금은 정상) 슬롯은 미리 잡아둬야 문구가 뜰 때 아래가 안 밀린다.
  // 그래서 검사는 반드시 `!== undefined`다 — if (error)로 하면 ""가 falsy라 슬롯이 사라진다.
  // 아예 prop을 안 넘긴 칸(상호명·층수 등)은 슬롯을 만들지 않아 빈 줄이 생기지 않는다
  const hasMessageSlot =
    error !== undefined || hint !== undefined || counter !== undefined;
  // 호출자가 준 설명 id와 메시지 id를 둘 다 살린다 (한쪽이 다른 쪽을 지우지 않게).
  // aria-describedby는 id를 공백으로 여러 개 나열할 수 있다.
  const describedByIds =
    [describedBy, hasMessageSlot ? messageId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-text-primary text-sm font-medium"
        >
          {label}
        </label>
      )}
      {/* props를 먼저 펼친다 — 아래 접근성 속성이 호출자 값에 덮이지 않도록 */}
      <input
        {...props}
        id={inputId}
        // 컴포넌트가 아는 오류가 우선. 오류가 없을 때만 호출자 값을 따른다
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedByIds}
        // 정상 상태의 focus는 테두리 색만 바꾼다 — ring을 쓰면 1px 테두리 바깥에 2px 링이
        // 더 그려져 default보다 두꺼워 보인다 (디자인 기준: 두께 유지, 색만 변경).
        // 오류 상태는 테두리가 이미 danger 색이라 색만 바꾸면 포커스 전후가 똑같아져
        // 키보드로 이동했을 때 어느 칸에 있는지 알 수 없다. 그래서 여기만 ring을 남긴다
        className={`text-text-primary placeholder:text-text-placeholder h-14 w-full rounded-lg border bg-white px-5 text-lg font-medium transition-colors focus:outline-none ${error ? "border-danger focus:ring-danger focus:ring-2" : "border-divider focus:border-primary"} ${props.disabled ? "bg-bg cursor-not-allowed opacity-40" : ""} ${className} `}
      />
      {/* 메시지 슬롯 — 오류/회색 안내/카운터가 같은 한 칸을 나눠 쓴다.
          비어 있어도 노드는 남기고 min-h으로 높이를 예약해서, 입력 중 문구가 떴다
          사라져도 아래 컨텐츠가 움직이지 않게 한다 (이슈 #306).

          예약 높이는 messageLines로만 정한다 — 예전엔 messageClassName으로 임의
          클래스를 받았는데, 기본값 min-h-6과 호출자의 min-h-12가 같은 property를
          다투게 되고 승자는 Tailwind가 CSS에 찍는 순서(숫자 오름차순)가 정한다.
          지금은 우연히 큰 값이 이기지만, 슬롯을 줄이려고 min-h-4를 넘기면 아무
          경고 없이 무시되고 화면만 틀린다. 유니온 prop이면 그 경우가 아예 없다.

          정렬도 마찬가지로 열어두지 않는다 — 좌측(오류·안내) / 우측(카운터)이
          내용의 성격으로 정해지므로 컴포넌트가 소유한다 */}
      {hasMessageSlot && (
        <span
          id={messageId}
          // flex 한 줄로 둔다 — hint와 counter를 같이 넘기면 예전 구조(카운터가 block)
          // 에서는 아래로 쌓여 두 줄이 되고, min-h는 바닥만 막으므로 예약을 넘겨
          // "밀림 방지" prop이 밀림을 만들었다. 나란히 놓으면 그 함정이 없다.
          // items-start: 오류가 두 줄일 때 카운터가 세로 가운데로 내려가지 않게
          // text-left를 명시한다 — 이게 없으면 좌측 정렬이 조상 상속에 달려서,
          // 누가 래퍼에 text-center를 붙이는 순간 폼 전체 오류 문구가 조용히
          // 가운데로 간다. 왼쪽 정렬은 #241에서 확정한 결정이라 여기서 소유한다.
          // counter의 text-right는 자손이라 이걸 덮는 게 아니라 자기 것만 정한다
          className={`flex items-start text-left text-base ${
            messageLines === 2 ? "min-h-12 md:min-h-6" : "min-h-6"
          }`}
        >
          {/* 슬롯과 함께 마운트되고 한 번도 토글되지 않는 라이브 영역.
              예전에는 role={error ? "alert" : undefined}로 role을 켰다 껐는데,
              그러면 텍스트와 live 속성이 같은 커밋에서 동시에 생겨 보조기술
              입장에서는 '기존 영역의 내용 변경'이 아니라 '새 alert 삽입'이 된다
              (Safari+VoiceOver가 동적으로 붙은 live 영역을 특히 잘 놓친다).
              polite인 이유 — alert은 assertive라 "1000"을 칠 때 중간값에서
              오류가 뜨면 타이핑 중 낭독을 끊는다. 검증 문구는 polite가 맞다.
              여기엔 오류만 넣는다 — 회색 안내·카운터는 낭독 대상이 아니다 */}
          <span
            aria-live="polite"
            className="text-danger font-bold"
          >
            {error}
          </span>
          {!error && hint && (
            <span className="text-text-secondary font-medium">{hint}</span>
          )}
          {!error && counter && (
            <span
              aria-hidden="true"
              // ms-auto가 우측 정렬을 만든다 — 카운터만 있을 때도(flex 항목이 하나)
              // 오른쪽 끝에 붙고, hint와 함께 있으면 [hint ... counter]가 된다.
              // shrink-0: 앞의 hint가 길어도 "12/30"이 줄바꿈되지 않게
              className="text-text-secondary ms-auto shrink-0 font-medium"
            >
              {counter}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default Input;
