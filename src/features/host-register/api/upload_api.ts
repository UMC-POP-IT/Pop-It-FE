import { apiFetch } from "@/shared/utils/apiClient";

/**
 * 업로드 종류 — 스웨거 PresignedUrlReq.uploadType 중 이 파트에서 쓰는 값만.
 * shared 의 UploadType 은 스웨거에 없는 값(BUSINESS_LICENSE·BANKBOOK 등)이라 쓰지 않는다.
 */
export type UploadType = "SPACE_IMAGE" | "HOST_DOCUMENT";

/** 서버가 허용하는 파일 형식 (스웨거 UploadFileInfoReq.contentType) */
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];

/** 한 번에 발급 가능한 최대 개수 (스웨거 PresignedUrlReq.files.maxItems) */
const MAX_FILES = 10;

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
      files: files.map((file) => ({ contentType: file.type })),
    }),
  });

/**
 * ② 발급받은 주소로 S3에 직접 올리기
 * 우리 서버가 아니라 S3로 가는 요청이라 apiFetch(토큰·봉투 처리)를 쓰지 않는다.
 */
const uploadToS3 = async (presignedUrl: string, file: File) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
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

  const invalidFile = files.find(
    (file) => !ALLOWED_CONTENT_TYPES.includes(file.type),
  );
  if (invalidFile) {
    throw new Error(
      `지원하지 않는 파일 형식입니다: ${invalidFile.name} (JPG·PNG·PDF만 가능)`,
    );
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
