import { useState } from "react";

interface FileUploadRowProps {
  label: string;
  placeholder: string;
  hint: string;
}

// 파일 첨부 행 (사업자등록증 사본 / 통장 사본 공용)
// 파일 선택 시 파일명 표시. (실제 서버 업로드는 2차 API 때)
const FileUploadRow = ({ label, placeholder, hint }: FileUploadRowProps) => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-primary text-sm font-bold">{label}</span>
      <div className="flex gap-2">
        {/* 선택된 파일명 표시 영역*/}
        <div
          className={`border-border flex flex-1 items-center rounded-lg border bg-tag-bg px-4 py-2.5 text-sm ${file ? "text-text-primary" : "text-text-disabled"}`}
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
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
      </div>
      <span className="text-text-disabled text-xs">{hint}</span>
    </div>
  );
};

export default FileUploadRow;
