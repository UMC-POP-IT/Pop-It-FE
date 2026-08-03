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
      <span className="text-text-primary text-sm font-bold">{label}</span>
      <div className="flex gap-2">
        {/* 선택된 파일명 표시 영역*/}
        <div
          className={`border-border bg-tag-bg flex flex-1 items-center rounded-lg border px-4 py-2.5 text-sm ${file ? "text-text-primary" : "text-text-disabled"}`}
        >
          {file ? file.name : placeholder}
        </div>

        {/* 파일 찾기 버튼: 공통 Button에 검정 variant가 없어 label+hidden input으로 임시 구현 → 챈(4번)과 협의 예정*/}
        <label
          aria-label={`${label} 파일 찾기`}
          className="bg-text-primary flex shrink-0 cursor-pointer items-center rounded-lg px-5 text-sm font-medium whitespace-nowrap text-white"
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
      {error ? (
        <span
          role="alert"
          className="text-danger text-xs"
        >
          {error}
        </span>
      ) : (
        <span className="text-text-disabled text-xs">{hint}</span>
      )}
    </div>
  );
};

export default FileUploadRow;
