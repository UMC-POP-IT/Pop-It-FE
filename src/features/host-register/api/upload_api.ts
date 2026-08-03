import { apiFetch } from "@/shared/utils/apiClient";

/**
 * 업로드 종류 — 스웨거 PresignedUrlReq.uploadType 중 이 파트에서 쓰는 값만.
 * shared 의 UploadType 은 스웨거에 없는 값(BUSINESS_LICENSE·BANKBOOK 등)이라 쓰지 않는다.
 */
export type UploadType = "SPACE_IMAGE" | "HOST_DOCUMENT";

/** 서버가 허용하는 파일 형식 (스웨거 UploadFileInfoReq.contentType) */
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/** File.type이 비어 있을 때 확장자로 보완하기 위한 표 */
const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

/**
 * 파일의 MIME type.
 * 브라우저가 OS에서 확장자를 못 찾으면 File.type을 빈 문자열로 준다.
 * 검사·presigned 발급·S3 업로드가 모두 이 함수를 써야 한다.
 * (발급 때 알린 contentType과 업로드 때 보내는 Content-Type이 다르면
 *  S3가 403 SignatureDoesNotMatch로 거절한다)
 */
const getContentType = (file: File): string => {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_CONTENT_TYPE[extension] ?? "";
};

/** 한 번에 발급 가능한 최대 개수 (스웨거 PresignedUrlReq.files.maxItems) */
const MAX_FILES = 10;

/** 파일 한 개 최대 크기 (화면 안내문 "최대 10MB" 기준) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 파일 한 개를 검사한다.
 * 문제가 없으면 null, 있으면 사용자에게 보여줄 문구를 돌려준다.
 * throw 하지 않는 이유: 파일을 고르는 순간 화면에 문구로 띄워야 해서.
 */
export const validateFile = (file: File): string | null => {
  if (!ALLOWED_CONTENT_TYPES.includes(getContentType(file))) {
    return "JPG, PNG, PDF 파일만 첨부할 수 있습니다";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "파일 크기는 10MB 이하여야 합니다";
  }
  return null;
};

interface PresignedUrlListRes {
  uploads: { presignedUrl: string; fileUrl: string }[];
}

/**
 * ① 업로드할 주소 발급받기
 * POST /uploads/presigned-url
 *
 * 다른 API와 달리 /api/v1 접두어가 없다 (스웨거 기준, 41개 중 이것만).
 */
const getPresignedUrls = (uploadType: UploadType, files: File[]) =>
  apiFetch<PresignedUrlListRes>("/uploads/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      uploadType,
      files: files.map((file) => ({ contentType: getContentType(file) })),
    }),
  });

/**
 * ② 발급받은 주소로 S3에 직접 올리기
 * 우리 서버가 아니라 S3로 가는 요청이라 apiFetch(토큰·봉투 처리)를 쓰지 않는다.
 */
const uploadToS3 = async (presignedUrl: string, file: File) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": getContentType(file) },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`파일 업로드에 실패했습니다 (${res.status}): ${file.name}`);
  }
};

/**
 * 파일 여러 개를 올리고 저장된 주소 목록을 돌려준다.
 * 반환 순서는 넘긴 순서와 같다 (공간 사진의 첫 장 = 대표사진).
 */
export const uploadFiles = async (
  files: File[],
  uploadType: UploadType,
): Promise<string[]> => {
  if (files.length === 0) return [];

  if (files.length > MAX_FILES) {
    throw new Error(`파일은 한 번에 ${MAX_FILES}개까지 올릴 수 있습니다`);
  }

  for (const file of files) {
    const error = validateFile(file);
    if (error) throw new Error(`${file.name}: ${error}`);
  }

  const { uploads } = await getPresignedUrls(uploadType, files);
  if (uploads.length !== files.length) {
    throw new Error("발급받은 업로드 주소 개수가 파일 개수와 다릅니다");
  }

  await Promise.all(
    uploads.map(({ presignedUrl }, i) => uploadToS3(presignedUrl, files[i])),
  );

  return uploads.map(({ fileUrl }) => fileUrl);
};
