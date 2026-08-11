import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Button from "@/shared/components/Button";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import cloudIcon from "@/assets/icons/logo_cloud.svg";

interface PhotoVerificationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onComplete: (files: File[]) => void;
}

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes: number) => `${Math.round(bytes / (1024 * 1024))}MB`;

const PhotoVerificationModal = ({ isOpen, isSubmitting, onClose, onComplete }: PhotoVerificationModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const validFiles = newFiles.filter((f) => f.size <= MAX_FILE_SIZE);
    if (validFiles.length === 0) return;
    setFiles((prev) => [...prev, ...validFiles].slice(0, MAX_PHOTOS));
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // e.target.files 를 즉시 배열로 옮겨두지 않으면, 아래 value 초기화가
    // setFiles 콜백(지연 실행)이 참조 중인 FileList까지 비워버려 선택한 파일이 누락될 수 있음
    const selected = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    addFiles(selected);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // 이미질 파일만 가능하게끔 필터링
    const imageFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    addFiles(imageFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose: handleClose });

  const handleComplete = () => {
    onComplete(files);
    setFiles([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} aria-hidden={true} />
      <div
        ref={dialogRef}
        className="relative z-10 flex max-h-[85vh] w-full max-w-[590px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h3 id={titleId} className="text-text-primary text-xl font-bold">퇴실 사진 인증</h3>
              <span className="text-text-secondary text-sm">
                퇴실 상태 확인을 위해 최소 {MIN_PHOTOS}장 이상의 사진을 등록해주세요
              </span>
            </div>
            <button onClick={handleClose} aria-label="닫기" className="text-text-tertiary shrink-0">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-border flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-10"
          >
            <img src={cloudIcon} width={55.99} height={42} alt="" aria-hidden="true" />
            <span className="text-text-primary text-md font-semibold">이미지를 여기로 드래그하여 업로드하세요</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="sr-only"
            />
            <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
              파일 선택
            </Button>
          </div>

          <span className="text-primary text-sm font-medium">
            <span>{files.length}장</span>
            <span className="text-text-secondary">/{MAX_PHOTOS}장</span>
          </span>

          {files.length > 0 && (
            <div className="border-border divide-border flex flex-col divide-y border-b">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-tag-bg h-10 w-10 shrink-0 rounded" />
                    <div className="flex flex-col">
                      <span className="text-text-primary text-sm font-medium">{file.name}</span>
                      <span className="text-text-tertiary text-xs">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveFile(index)} aria-label={`${file.name} 삭제`} className="text-text-tertiary shrink-0 px-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-info-bg flex flex-col gap-2 rounded-lg p-3">
            <div className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" className="text-primary" strokeWidth="1.5" />
                <path d="M12 11v5.5M12 8v.5" stroke="currentColor" className="text-primary" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-primary text-sm font-medium">사진 촬영 가이드</span>
            </div>
            <ul className="text-text-secondary list-disc pl-5 text-sm">
              <li>밝고 흔들림 없이 선명하게 촬영해주세요.</li>
              <li>공간 전체가 확인되도록 여러 방향에서 촬영하는 것을 권장합니다.</li>
              <li>바닥, 주방, 화장실 등 청소 완료 상태를 함께 포함해 주시기 바랍니다.</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" size="md" disabled={files.length < MIN_PHOTOS || isSubmitting} onClick={handleComplete} className="h-[56px] w-[184px]">
              {isSubmitting ? "업로드 중..." : "완료"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoVerificationModal;
