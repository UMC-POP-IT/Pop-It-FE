import { useState, type ChangeEvent } from "react";
import { validateFile } from "@/features/host-register/api/upload_api";

interface FileUploadRowProps {
  label: string;
  placeholder: string;
  hint: string;
  file: File | null; // 부모가 들고 있는 현재 파일 (없으면 null)
  onFileChange: (file: File | null) => void; // 파일이 바뀌면 부모에게 알림
}

// 파일 첨부 행 (사업자등록증 사본 / 통장 사본 공용)
// 파일 선택 시 파일명 표시. (실제 서버 업로드는 2차 API 때)
const FileUploadRow = ({
  label,
  placeholder,
  hint,
  file,
  onFileChange,
}: FileUploadRowProps) => {
  const [error, setError] = useState(""); // 검사 실패 사유 (빈 문자열이면 정상)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    e.target.value = ""; // 같은 파일을 다시 골라도 onChange가 뜨도록 비워둔다

    if (!selected) return; // 선택창을 취소한 경우 — 기존 파일을 그대로 둔다

    const message = validateFile(selected);
    if (message) {
      setError(message);
      onFileChange(null); // 잘못된 파일이 제출되지 않도록 이전 파일까지 비운다
      return;
    }

    setError("");
    onFileChange(selected);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-primary text-[22px] font-bold">{label}</span>
      {/* 데스크톱(1024): 표시 영역 440 + gap 20 + 버튼 184 = 본문 644 (주소 찾기 행과 동일).
          모바일: 버튼이 아래로 내려가 오른쪽에 붙고 간격은 12 */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-5">
        {/* 선택된 파일명 표시 영역 — 높이·여백·글자는 공통 Input과 맞춘다 */}
        {/* min-w-0 + truncate: 파일명은 길이 제한이 없다. 이게 없으면 flex 항목이
            내용 크기 아래로 줄지 않아 옆의 파일 찾기 버튼을 밀어내거나 행을 넘친다 */}
        <div
          title={file ? file.name : undefined}
          // 모바일(flex-col)에서는 flex-1을 쓰면 안 된다 — 주축이 세로로 바뀌어
          // flex-basis:0%가 h-14(56)를 덮어써 칸이 납작해진다. 폭은 w-full로 채운다
          className={`border-divider bg-tag-bg flex h-14 w-full min-w-0 items-center truncate rounded-lg border px-5 text-lg font-medium md:w-auto md:flex-1 ${file ? "text-text-primary" : "text-text-disabled"}`}
        >
          {file ? file.name : placeholder}
        </div>

        {/* 파일 찾기 버튼: hidden input을 감싸야 해서 공통 Button 대신 label로 구현한다.
            대신 Button의 variant="black" + size="field"와 같은 값을 직접 맞춰 둔다 */}
        <label
          aria-label={`${label} 파일 찾기`}
          // 모바일 156 / 데스크톱 184 — Button size="nav"과 같은 규격.
          // self-end: 세로로 내려올 때 오른쪽 끝에 붙인다 (시안)
          className="bg-text-primary flex h-14 w-[156px] shrink-0 cursor-pointer items-center justify-center self-end rounded-lg text-xl font-bold whitespace-nowrap text-white transition-colors hover:bg-gray-800 md:w-[184px] md:self-auto"
        >
          파일 찾기
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </div>
      {/* 검사 실패 시에만 새 요소로 나타나야 스크린 리더가 읽어준다 */}
      {/* 모바일은 버튼 아래 오른쪽에 붙는다 — 위 gap-2(8)에 mt-1(4)을 더해 피그마 12를 만든다.
          md 이상은 왼쪽 정렬에 간격 8 그대로 */}
      {error ? (
        <span
          role="alert"
          className="text-danger mt-1 text-right text-base font-bold md:mt-0 md:text-left"
        >
          {error}
        </span>
      ) : (
        <span className="text-text-secondary mt-1 text-right text-base font-medium md:mt-0 md:text-left">
          {hint}
        </span>
      )}
    </div>
  );
};

export default FileUploadRow;
