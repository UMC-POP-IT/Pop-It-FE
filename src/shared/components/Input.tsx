import { type InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({
  label,
  error,
  className = "",
  id,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) => {
  // 오류 문구와 입력칸을 잇는 id — 한 화면에 Input이 여러 개여도 안 겹친다
  const errorId = useId();
  // 바깥에서 id를 안 주면 여기서 만들어 label과 input을 잇는다
  const generatedId = useId();
  const inputId = id ?? generatedId;
  // 호출자가 준 설명 id와 오류 id를 둘 다 살린다 (한쪽이 다른 쪽을 지우지 않게).
  // aria-describedby는 id를 공백으로 여러 개 나열할 수 있다.
  const describedByIds =
    [describedBy, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

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
        className={`text-text-primary placeholder:text-text-placeholder h-14 w-full rounded-lg border bg-white px-5 text-lg font-medium transition-colors focus:ring-2 focus:outline-none ${error ? "border-danger focus:ring-danger" : "border-divider focus:border-primary focus:ring-primary"} ${props.disabled ? "bg-bg cursor-not-allowed opacity-40" : ""} ${className} `}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-danger text-left text-base font-bold"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
