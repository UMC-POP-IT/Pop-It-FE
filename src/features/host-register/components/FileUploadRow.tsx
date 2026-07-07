interface FileUploadRowProps {
  label: string;
  placeholder: string;
  hint: string;
}

// 파일 첨부 행 (사업자등록증 사본 / 통장 사본 공용)
// 정적: 파일명 표시 영역은 placeholder만 노출. TODO: 실제 선택 파일명 표시 + 업로드 처리
const FileUploadRow = ({ label, placeholder, hint }: FileUploadRowProps) => (
  <div className="flex flex-col gap-2">
    <span className="text-text-primary text-sm font-bold">{label}</span>
    <div className="flex gap-2">
      {/* 선택된 파일명 표시 영역 (정적) */}
      <div className="border-border text-text-disabled flex flex-1 items-center rounded-lg border bg-white px-4 py-2.5 text-sm">
        {placeholder}
      </div>
      {/* 파일 찾기 버튼: 공통 Button에 검정 variant가 없어 label+hidden input으로 임시 구현 → 챈(4번)과 협의 예정
          ⚠️ 디자인엔 '다음으로'로 표기됐으나 파일 선택 버튼이라 '파일 찾기'로 표기함 (디자인 확인 필요) */}
      <label
        aria-label={`${label} 파일 찾기`}
        className="bg-text-primary flex shrink-0 cursor-pointer items-center rounded-lg px-5 text-sm font-medium whitespace-nowrap text-white"
      >
        파일 찾기
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
        />
      </label>
    </div>
    <span className="text-text-disabled text-xs">{hint}</span>
  </div>
);

export default FileUploadRow;
